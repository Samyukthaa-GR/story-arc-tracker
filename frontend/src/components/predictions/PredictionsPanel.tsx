'use client'
import { useState } from 'react'
import { Prediction } from '@/types'

export default function PredictionsPanel({ predictions }: { predictions: Prediction[] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  if (!predictions.length) return null

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4 }}>
        What to watch next
      </div>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 18 }}>AI-generated signals from ET coverage</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {predictions.map((p, i) => (
          <div key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 8,
              border: `1px solid ${hovered === i ? 'var(--et)' : 'var(--border)'}`,
              background: hovered === i ? 'var(--surface2)' : 'var(--surface2)',
              cursor: 'pointer', transition: 'border .15s'
            }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', background: 'var(--et)',
              color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1
            }}>{i + 1}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4, lineHeight: 1.4 }}>{p.signal}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.55, marginBottom: 8 }}>{p.rationale}</div>
              <span style={{
                fontSize: 11, fontWeight: 500, background: 'var(--surface)',
                border: '1px solid var(--border)', color: 'var(--text3)',
                padding: '2px 10px', borderRadius: 20, display: 'inline-block'
              }}>{p.timeframe}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
