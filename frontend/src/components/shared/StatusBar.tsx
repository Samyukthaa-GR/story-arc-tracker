import { PipelineStatus } from '@/types'

const STAGES = ['expanding_query','query_expanded','articles_fetched','extracted','done']

export default function StatusBar({ status }: { status: PipelineStatus }) {
  const idx = STAGES.indexOf(status.stage)
  const pct = idx === -1 ? 8 : Math.round(((idx + 1) / STAGES.length) * 100)
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '14px 18px', marginBottom: 20
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: 'var(--text2)' }}>{status.message}</span>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>{pct}%</span>
      </div>
      <div style={{ height: 2, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', background: 'var(--et)', borderRadius: 2,
          width: `${pct}%`, transition: 'width .5s ease'
        }} />
      </div>
    </div>
  )
}
