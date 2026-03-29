import json
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.scraper import fetch_topic_articles, topic_to_slug
from services.ai_pipeline import (
    expand_query, extract_all_articles,
    synthesize_story, answer_followup
)
from utils.builder import build_story_arc
from utils.models import StoryArc, FollowupRequest, FollowupResponse
from utils import cache
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class SearchRequest(BaseModel):
    topic: str


def sse_event(event: str, data: dict) -> str:
    """Format a Server-Sent Event."""
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


async def story_arc_generator(topic: str):
    """
    Async generator that yields SSE events as the pipeline progresses.
    Frontend receives live updates for each stage.
    """
    key = cache.cache_key(topic)

    # ── Check cache first ────────────────────────────────────────────────────
    cached = cache.get(key)
    if cached:
        yield sse_event("cached", {"story_arc": cached})
        yield sse_event("done", {})
        return

    try:
        # ── Stage 1: Query expansion ──────────────────────────────────────
        yield sse_event("status", {"stage": "expanding_query", "message": "Expanding search queries..."})
        slugs = await expand_query(topic)
        yield sse_event("status", {"stage": "query_expanded", "message": f"Searching {len(slugs)} ET topic pages..."})

        # ── Stage 2: Fetch ET articles ────────────────────────────────────
        all_articles = []
        fetch_tasks = [fetch_topic_articles(slug) for slug in slugs[:3]]  # limit to 3 slugs
        results = await asyncio.gather(*fetch_tasks, return_exceptions=True)
        for r in results:
            if isinstance(r, list):
                all_articles.extend(r)

        # Deduplicate by URL
        seen_urls = set()
        unique_articles = []
        for a in all_articles:
            if a.url not in seen_urls:
                seen_urls.add(a.url)
                unique_articles.append(a)

        unique_articles = unique_articles[:12]  # cap at 12 articles

        if not unique_articles:
            yield sse_event("error", {"message": "No articles found on ET for this topic. Try a different search term."})
            return

        yield sse_event("status", {
            "stage": "articles_fetched",
            "message": f"Found {len(unique_articles)} ET articles. Extracting insights..."
        })

        # ── Stage 3: Parallel extraction ──────────────────────────────────
        extractions = await extract_all_articles(unique_articles)
        yield sse_event("status", {
            "stage": "extracted",
            "message": f"Extracted data from {len(extractions)} articles. Synthesizing story arc..."
        })

        if not extractions:
            yield sse_event("error", {"message": "Could not extract structured data from articles."})
            return

        # ── Stage 4: Synthesis ─────────────────────────────────────────────
        synthesis = await synthesize_story(topic, extractions)

        # ── Stage 5: Build final arc ───────────────────────────────────────
        story_arc = build_story_arc(topic, extractions, synthesis)
        arc_dict = story_arc.model_dump()

        cache.set(key, arc_dict)

        yield sse_event("story_arc", {"story_arc": arc_dict})
        yield sse_event("done", {})

    except Exception as e:
        logger.exception(f"Pipeline error for topic '{topic}': {e}")
        yield sse_event("error", {"message": "Something went wrong. Please try again."})


@router.post("/story")
async def get_story_arc(request: SearchRequest):
    """
    Main endpoint. Returns SSE stream of pipeline progress + final story arc.
    """
    return StreamingResponse(
        story_arc_generator(request.topic),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )


@router.post("/followup", response_model=FollowupResponse)
async def followup_question(request: FollowupRequest):
    """Answer a follow-up question grounded in the story arc."""
    answer = await answer_followup(request.question, request.story_arc)
    return FollowupResponse(answer=answer)
