'use client'
import { useState } from 'react'
import { TimelineEvent } from '@/types'

const CARD = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 12, padding: '20px 24px',
}
const LABEL = {
  fontSize: 11, fontWeight: 600, color: 'var(--text3)',
  textTransform: 'uppercase' as const, letterSpacing: '.07em', marginBottom: 16
}

export default function Timeline({ events }: { events: TimelineEvent[] }) {
  const [expanded, setExpanded] = useState<number | null>(null)
  if (!events.length) return null

  return (
    <div style={CARD}>
      <div style={LABEL}>Timeline</div>
      <div style={{ maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 1, background: 'var(--border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {events.map((ev, i) => {
              const isExp = expanded === i
              return (
                <div key={i}
                  onClick={() => setExpanded(isExp ? null : i)}
                  style={{
                    display: 'flex', gap: 14, padding: '10px 10px 10px 0',
                    borderRadius: 8, cursor: 'pointer', transition: 'background .15s',
                    background: isExp ? 'var(--surface2)' : 'transparent',
                    paddingLeft: 8,
                  }}
                  onMouseEnter={e => { if (!isExp) (e.currentTarget as HTMLElement).style.background = 'var(--surface3)' }}
                  onMouseLeave={e => { if (!isExp) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, flexShrink: 0 }}>
                    <div style={{
                      width: 12, height: 12, borderRadius: '50%', marginTop: 4, flexShrink: 0,
                      background: ev.sentiment_label === 'negative' || i > events.length / 2 ? 'var(--red)' : 'var(--et)',
                      boxShadow: `0 0 0 3px ${ev.sentiment_label === 'negative' || i > events.length / 2 ? '#ef444411' : '#f265220f'}`
                    }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500, marginBottom: 3 }}>{ev.date}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4, marginBottom: isExp ? 6 : 0 }}>
                      {ev.headline}
                    </div>
                    {isExp && (
                      <>
                        <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 8 }}>
                          {ev.significance}
                        </div>
                        <a href={ev.source_url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 11, color: 'var(--et)' }}
                          onClick={e => e.stopPropagation()}>
                          {ev.source_title} →
                        </a>
                      </>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text3)', flexShrink: 0, marginTop: 3, transition: 'transform .2s', transform: isExp ? 'rotate(180deg)' : 'none' }}>
                    ›
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
