'use client'
import { useState } from 'react'
import { Player } from '@/types'

const TYPES: Record<string, { bg: string; color: string; ab: string; ac: string }> = {
  person:    { bg: '#1e1b4b', color: '#818cf8', ab: '#1e1b4b', ac: '#a5b4fc' },
  company:   { bg: '#172554', color: '#60a5fa', ab: '#172554', ac: '#93c5fd' },
  regulator: { bg: '#1c1000', color: '#fb923c', ab: '#1c1000', ac: '#fdba74' },
  court:     { bg: '#1c0000', color: '#f87171', ab: '#1c0000', ac: '#fca5a5' },
  fund:      { bg: '#052e16', color: '#4ade80', ab: '#052e16', ac: '#86efac' },
}
const DEF = { bg: '#18181b', color: '#a1a1aa', ab: '#27272a', ac: '#d4d4d8' }

function initials(n: string) { return n.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() }

export default function PlayersPanel({ players }: { players: Player[] }) {
  const [selected, setSelected] = useState<number | null>(null)
  if (!players.length) return null

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16 }}>Key players</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {players.slice(0, 8).map((p, i) => {
          const cfg = TYPES[p.type] || DEF
          const isSel = selected === i
          return (
            <div key={i}>
              <div
                onClick={() => setSelected(isSel ? null : i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px',
                  borderRadius: 8, cursor: 'pointer', transition: 'all .15s',
                  border: `1px solid ${isSel ? 'var(--et)' : 'transparent'}`,
                  background: isSel ? 'var(--surface2)' : 'transparent'
                }}
                onMouseEnter={e => { if (!isSel) { (e.currentTarget as HTMLElement).style.background = 'var(--surface2)' } }}
                onMouseLeave={e => { if (!isSel) { (e.currentTarget as HTMLElement).style.background = 'transparent' } }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: cfg.ab,
                  color: cfg.ac, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, flexShrink: 0
                }}>{initials(p.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10, background: cfg.bg, color: cfg.color, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                      {p.type}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{p.role}</div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>{p.mention_count}×</span>
              </div>
              {isSel && (
                <div style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '12px 14px', margin: '4px 0 6px',
                  fontSize: 13, color: 'var(--text2)', lineHeight: 1.65
                }}>
                  <span style={{ color: cfg.color, fontWeight: 600 }}>{p.name}</span> — {p.role}. Mentioned {p.mention_count} time{p.mention_count !== 1 ? 's' : ''} across ET's coverage of this story.
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
