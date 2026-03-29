import { ContrarianView } from '@/types'

export default function ContrarianPanel({ view }: { view: ContrarianView }) {
  if (!view.headline) return null
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1000, #1a0800)',
      border: '1px solid #f265221a', borderRadius: 12, padding: '20px 24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#f59e0b' }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '.07em' }}>
          The undercovered angle
        </span>
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#fbbf24', margin: '0 0 10px', lineHeight: 1.45 }}>
        {view.headline}
      </p>
      <p style={{ fontSize: 13, color: '#d4a76a', lineHeight: 1.7, margin: 0 }}>
        {view.body}
      </p>
    </div>
  )
}
