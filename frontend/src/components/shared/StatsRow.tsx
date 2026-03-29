import { StoryArc } from '@/types'

interface Props { arc: StoryArc }

export default function StatsRow({ arc }: Props) {
  const avgSentiment = arc.sentiment_series.length
    ? arc.sentiment_series.reduce((s, d) => s + d.score, 0) / arc.sentiment_series.length
    : 0

  const stats = [
    { val: arc.article_count.toString(), label: 'ET articles analysed', color: 'var(--et)' },
    { val: avgSentiment >= 0 ? `+${avgSentiment.toFixed(1)}` : avgSentiment.toFixed(1), label: 'Avg. sentiment score', color: avgSentiment >= 0 ? 'var(--green)' : 'var(--red)' },
    { val: arc.players.length.toString(), label: 'Key players mapped', color: 'var(--purple)' },
    { val: arc.timeline.length.toString(), label: 'Events on timeline', color: 'var(--blue)' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '16px 18px'
        }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', color: s.color, marginBottom: 4 }}>
            {s.val}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}
