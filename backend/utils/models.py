from pydantic import BaseModel
from typing import List, Optional


class RawArticle(BaseModel):
    url: str
    title: str
    date: str
    snippet: str = ""
    body: str = ""


class ArticleExtraction(BaseModel):
    url: str
    title: str
    date: str
    events: List[dict] = []
    entities: List[dict] = []
    sentiment: dict = {}
    key_quote: str = ""


class TimelineEvent(BaseModel):
    date: str
    headline: str
    significance: str
    source_url: str
    source_title: str


class Player(BaseModel):
    name: str
    type: str  # person | company | regulator | court | fund
    role: str
    mention_count: int = 1


class SentimentPoint(BaseModel):
    date: str
    score: float
    label: str
    tone_note: str
    source_title: str


class ContrarianView(BaseModel):
    headline: str
    body: str


class Prediction(BaseModel):
    signal: str
    rationale: str
    timeframe: str


class StoryArc(BaseModel):
    topic: str
    summary: str
    story_phase: str
    timeline: List[TimelineEvent]
    players: List[Player]
    sentiment_series: List[SentimentPoint]
    contrarian_view: ContrarianView
    predictions: List[Prediction]
    article_count: int
    source_urls: List[str]


class FollowupRequest(BaseModel):
    question: str
    story_arc: StoryArc


class FollowupResponse(BaseModel):
    answer: str
