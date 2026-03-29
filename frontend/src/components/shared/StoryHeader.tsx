'use client'
import { useState, FormEvent } from 'react'
import { StoryArc } from '@/types'

const PHASES: Record<string, { bg: string; color: string; border: string }> = {
  emerging:   { bg: '#0c1a2e', color: '#60a5fa', border: '#1d4ed844' },
  escalating: { bg: '#1c1000', color: '#fb923c', border: '#f2652244' },
  peak:       { bg: '#1c0000', color: '#f87171', border: '#ef444444' },
  resolving:  { bg: '#052e16', color: '#4ade80', border: '#16a34a44' },
  concluded:  { bg: '#18181b', color: '#a1a1aa', border: '#3f3f46' },
  unknown:    { bg: '#18181b', color: '#a1a1aa', border: '#3f3f46' },
}

interface Props { arc: StoryArc; onNewSearch: (t: string) => void; loading: boolean }

export default function StoryHeader({ arc, onNewSearch, loading }: Props) {
  const [val, setVal] = useState(arc.topic)
  const ph = PHASES[arc.story_phase] || PHASES.unknown

  const submit = (e: FormEvent) => { e.preventDefault(); if (val.trim()) onNewSearch(val.trim()) }

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderLeft: '3px solid var(--et)', borderRadius: 12, padding: '20px 24px'
    }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <form onSubmit={submit} style={{ flex: 1, display: 'flex', gap: 8 }}>
          <input
            value={val} onChange={e => setVal(e.target.value)}
            style={{
              flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)',
              color: 'var(--text)', fontSize: 14, padding: '0 14px', height: 38,
              borderRadius: 8, outline: 'none', transition: 'border .15s'
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--et)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
          <button type="submit" disabled={loading}
            style={{
              background: 'var(--et)', color: '#fff', fontSize: 12, fontWeight: 600,
              padding: '0 16px', height: 38, borderRadius: 8, border: 'none',
              cursor: 'pointer', whiteSpace: 'nowrap', opacity: loading ? .6 : 1
            }}>
            Search again
          </button>
        </form>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
            background: ph.bg, color: ph.color, border: `1px solid ${ph.border}`,
            textTransform: 'uppercase', letterSpacing: '.06em'
          }}>{arc.story_phase}</span>
          <span style={{
            fontSize: 11, color: 'var(--text3)', border: '1px solid var(--border)',
            borderRadius: 20, padding: '3px 10px'
          }}>{arc.article_count} ET articles</span>
        </div>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8, textTransform: 'capitalize', letterSpacing: '-0.3px' }}>
        {arc.topic}
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{arc.summary}</p>
    </div>
  )
}
