export interface TimelineEvent {
  date: string
  headline: string
  significance: string
  source_url: string
  source_title: string
}

export interface Player {
  name: string
  type: 'person' | 'company' | 'regulator' | 'court' | 'fund'
  role: string
  mention_count: number
}

export interface SentimentPoint {
  date: string
  score: number
  label: string
  tone_note: string
  source_title: string
}

export interface ContrarianView {
  headline: string
  body: string
}

export interface Prediction {
  signal: string
  rationale: string
  timeframe: string
}

export interface StoryArc {
  topic: string
  summary: string
  story_phase: string
  timeline: TimelineEvent[]
  players: Player[]
  sentiment_series: SentimentPoint[]
  contrarian_view: ContrarianView
  predictions: Prediction[]
  article_count: number
  source_urls: string[]
}

export type PipelineStage =
  | 'idle'
  | 'expanding_query'
  | 'query_expanded'
  | 'articles_fetched'
  | 'extracted'
  | 'done'
  | 'error'

export interface PipelineStatus {
  stage: PipelineStage
  message: string
}
