from collections import defaultdict
from typing import List
from utils.models import (
    ArticleExtraction, StoryArc, TimelineEvent,
    Player, SentimentPoint, ContrarianView, Prediction
)


def build_story_arc(
    topic: str,
    extractions: List[ArticleExtraction],
    synthesis: dict
) -> StoryArc:
    """Merge all extracted article data + synthesis into a StoryArc."""

    # ── Timeline: collect + deduplicate events ──────────────────────────────
    timeline_events = []
    seen_headlines = set()
    for ex in extractions:
        for ev in ex.events:
            headline = ev.get("headline", "").strip()
            if not headline or headline.lower() in seen_headlines:
                continue
            seen_headlines.add(headline.lower())
            timeline_events.append(TimelineEvent(
                date=ev.get("date", ex.date or "unknown"),
                headline=headline,
                significance=ev.get("significance", ""),
                source_url=ex.url,
                source_title=ex.title,
            ))

    # Sort by date string (lexicographic works for YYYY-MM-DD)
    timeline_events.sort(key=lambda e: e.date)

    # ── Players: aggregate entity mentions ──────────────────────────────────
    player_map: dict[str, dict] = {}
    for ex in extractions:
        for ent in ex.entities:
            name = ent.get("name", "").strip()
            if not name:
                continue
            if name not in player_map:
                player_map[name] = {
                    "name": name,
                    "type": ent.get("type", "company"),
                    "role": ent.get("role", ""),
                    "mention_count": 0,
                }
            player_map[name]["mention_count"] += 1

    players = [Player(**p) for p in sorted(
        player_map.values(), key=lambda x: x["mention_count"], reverse=True
    )]

    # ── Sentiment series ─────────────────────────────────────────────────────
    sentiment_series = []
    for ex in extractions:
        s = ex.sentiment
        if not s or "score" not in s:
            continue
        sentiment_series.append(SentimentPoint(
            date=ex.date or "unknown",
            score=float(s.get("score", 0)),
            label=s.get("label", "neutral"),
            tone_note=s.get("tone_note", ""),
            source_title=ex.title,
        ))
    sentiment_series.sort(key=lambda x: x.date)

    # ── Synthesis outputs ─────────────────────────────────────────────────────
    cv = synthesis.get("contrarian_view", {})
    contrarian = ContrarianView(
        headline=cv.get("headline", ""),
        body=cv.get("body", ""),
    )

    predictions = [
        Prediction(
            signal=p.get("signal", ""),
            rationale=p.get("rationale", ""),
            timeframe=p.get("timeframe", ""),
        )
        for p in synthesis.get("predictions", [])
    ]

    return StoryArc(
        topic=topic,
        summary=synthesis.get("summary", ""),
        story_phase=synthesis.get("story_phase", "unknown"),
        timeline=timeline_events,
        players=players[:15],
        sentiment_series=sentiment_series,
        contrarian_view=contrarian,
        predictions=predictions,
        article_count=len(extractions),
        source_urls=[ex.url for ex in extractions],
    )
