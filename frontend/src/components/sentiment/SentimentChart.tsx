'use client'
import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { SentimentPoint } from '@/types'

const CARD = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }
const LABEL = { fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase' as const, letterSpacing: '.07em', marginBottom: 4 }

const Tip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as SentimentPoint
  return (
    <div style={{ background: '#27272a', border: '1px solid var(--border2)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{d.source_title}</div>
      {d.tone_note && <div style={{ color: 'var(--text2)', marginBottom: 4 }}>{d.tone_note}</div>}
      <div style={{ fontWeight: 600, color: d.score >= 0 ? 'var(--green)' : 'var(--red)' }}>
        {d.score >= 0 ? '+' : ''}{d.score.toFixed(2)} · {d.label}
      </div>
    </div>
  )
}

export default function SentimentChart({ data }: { data: SentimentPoint[] }) {
  if (!data.length) return null
  const chartData = data.map((d, i) => ({
    ...d,
    label: d.date && d.date !== 'unknown' ? d.date.slice(0, 7) : `Art. ${i + 1}`
  }))

  return (
    <div style={CARD}>
      <div style={LABEL}>Sentiment over time</div>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>ET's editorial tone across articles</div>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
          <defs>
            <linearGradient id="sentPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="sentNeg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis domain={[-1, 1]} tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false} ticks={[-1, 0, 1]} />
          <Tooltip content={<Tip />} />
          <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />
          <Area type="monotone" dataKey="score" stroke="var(--et)" strokeWidth={2}
            fill="url(#sentNeg)" dot={{ r: 4, fill: 'var(--et)', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: 'var(--et)', stroke: 'var(--surface)', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
