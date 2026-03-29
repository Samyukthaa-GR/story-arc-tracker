import asyncio
import json
import os
from typing import List
from openai import AsyncOpenAI
from utils.models import RawArticle, ArticleExtraction, StoryArc
import logging

logger = logging.getLogger(__name__)

client = AsyncOpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)
MODEL = "llama-3.3-70b-versatile"
#MODEL = "llama-3.1-8b-instant"


# ─── Step 1: Query Expansion ─────────────────────────────────────────────────

async def expand_query(topic: str) -> List[str]:
    """Turn a user topic into 4-5 ET-optimised search slugs."""
    prompt = f"""You are helping search the Economic Times website.
Convert this topic into 4-5 URL slugs for ET's topic pages.
ET topic URLs look like: economictimes.indiatimes.com/topic/[slug]

Topic: "{topic}"

Return ONLY a JSON array of slugs. Example:
["byjus", "byju-raveendran", "edtech-crisis", "byjus-debt", "byjus-investors"]

Rules:
- lowercase, hyphen-separated
- specific to the topic
- mix the company/person name with related themes
- no quotes around the array itself"""

    resp = await client.chat.completions.create(
    model=MODEL,
    max_tokens=200,
    messages=[{"role": "user", "content": prompt}]
    )
    text = resp.choices[0].message.content.strip()
    try:
        slugs = json.loads(text)
        return slugs[:5] if isinstance(slugs, list) else [topic.lower().replace(" ", "-")]
    except Exception:
        return [topic.lower().replace(" ", "-")]


# ─── Step 2: Per-Article Extraction ──────────────────────────────────────────

EXTRACTION_PROMPT = """You are an analyst extracting structured data from an Economic Times article.

Article title: {title}
Article date: {date}
Article URL: {url}
Article body:
{body}

Extract and return ONLY valid JSON in this exact format:
{{
  "events": [
    {{
      "date": "YYYY-MM-DD or approximate like '2023-Q3'",
      "headline": "one sentence describing what happened",
      "significance": "why this matters to the story (1 sentence)"
    }}
  ],
  "entities": [
    {{
      "name": "entity name",
      "type": "person | company | regulator | court | fund",
      "role": "their role in this story (brief)"
    }}
  ],
  "sentiment": {{
    "score": 0.0,
    "label": "positive | negative | neutral | mixed",
    "tone_note": "one phrase describing ET's editorial tone e.g. 'cautiously critical'"
  }},
  "key_quote": "most significant quote from the article, or empty string"
}}

Rules:
- sentiment score: -1.0 (very negative) to +1.0 (very positive), 0 = neutral
- extract only events clearly stated in THIS article
- max 3 events, max 5 entities per article
- return ONLY the JSON object, no other text"""


async def extract_article(article: RawArticle) -> ArticleExtraction | None:
    """Extract structured data from a single ET article."""
    if not article.body:
        return None

    prompt = EXTRACTION_PROMPT.format(
        title=article.title,
        date=article.date or "unknown",
        url=article.url,
        body=article.body[:3000]
    )

    try:
        resp = await client.chat.completions.create(
            model=MODEL,
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        text = resp.choices[0].message.content.strip()
        # Strip markdown code fences if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        data = json.loads(text)
        return ArticleExtraction(
            url=article.url,
            title=article.title,
            date=article.date,
            **data
        )
    except Exception as e:
        logger.warning(f"Extraction failed for {article.url}: {e}")
        return None


async def extract_all_articles(articles: List[RawArticle]) -> List[ArticleExtraction]:
    """Run extraction with staggered delays to avoid rate limits."""
    results = []
    for i, article in enumerate(articles):
        if i > 0:
            await asyncio.sleep(2)  # 2 second gap between calls
        result = await extract_article(article)
        if result:
            results.append(result)
    return results


# ─── Step 3: Final Synthesis ──────────────────────────────────────────────────

SYNTHESIS_PROMPT = """You are a senior Economic Times analyst. Given extracted data from multiple ET articles about "{topic}", produce a final story arc synthesis.

Extracted data:
{data_json}

Return ONLY valid JSON in this exact format:
{{
  "summary": "2-3 sentence overview of the entire story arc",
  "contrarian_view": {{
    "headline": "The angle ET hasn't fully covered",
    "body": "2-3 sentences presenting a minority view, underreported angle, or dissenting perspective that challenges the mainstream narrative in ET's coverage"
  }},
  "predictions": [
    {{
      "signal": "what to watch",
      "rationale": "why this matters (1 sentence)",
      "timeframe": "e.g. 'next 3 months' or 'Q2 2025'"
    }}
  ],
  "story_phase": "emerging | escalating | peak | resolving | concluded"
}}

Rules:
- predictions: 3-5 forward-looking signals grounded in the data
- contrarian_view must genuinely challenge or complicate the dominant narrative
- story_phase reflects where this story currently sits in its arc
- return ONLY the JSON, no other text"""


async def synthesize_story(topic: str, extractions: List[ArticleExtraction]) -> dict:
    """Produce final synthesis: contrarian view + predictions."""
    # Build condensed data for prompt
    condensed = []
    for ex in extractions:
        condensed.append({
            "title": ex.title,
            "date": ex.date,
            "events": ex.events[:2],
            "entities": [e["name"] for e in ex.entities[:3]],
            "sentiment": ex.sentiment,
        })

    prompt = SYNTHESIS_PROMPT.format(
        topic=topic,
        data_json=json.dumps(condensed, indent=2)[:6000]
    )

    resp = await client.chat.completions.create(
        model=MODEL,
        max_tokens=1200,
        messages=[{"role": "user", "content": prompt}]
    )
    text = resp.choices[0].message.content.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    try:
        return json.loads(text)
    except Exception as e:
        logger.error(f"Synthesis parse failed: {e}")
        return {"summary": "", "contrarian_view": {}, "predictions": [], "story_phase": "unknown"}


# ─── Step 4: Follow-up Q&A ────────────────────────────────────────────────────

async def answer_followup(question: str, story_arc: StoryArc) -> str:
    """Answer a follow-up question grounded in the story arc data."""
    context = json.dumps({
        "topic": story_arc.topic,
        "summary": story_arc.summary,
        "timeline": [e.model_dump() for e in story_arc.timeline[:10]],
        "players": [p.model_dump() for p in story_arc.players[:10]],
    }, indent=2)

    prompt = f"""You are an Economic Times analyst. Answer this question about the story arc below.
Be concise (2-4 sentences). Ground your answer only in the provided data — do not hallucinate.

Story context:
{context}

Question: {question}"""

    resp = await client.chat.completions.create(
        model=MODEL,
        max_tokens=400,
        messages=[{"role": "user", "content": prompt}]
    )
    content = resp.choices[0].message.content
    return content.strip() if content else "Sorry, I couldn't generate an answer. Please try again."
