export default function Navbar() {
  return (
    <nav style={{
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', gap: 12,
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <span style={{ color: 'var(--et)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px' }}>ET</span>
      <span style={{ color: 'var(--border2)', fontSize: 18 }}>|</span>
      <span style={{ color: 'var(--text2)', fontWeight: 500, fontSize: 13 }}>Story Arc Tracker</span>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <span style={{
          background: '#052e1644', border: '1px solid #16a34a44', color: '#4ade80',
          fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
          display: 'flex', alignItems: 'center', gap: 5
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
          Live
        </span>
        <span style={{
          background: 'var(--surface2)', border: '1px solid var(--border)',
          color: 'var(--text3)', fontSize: 11, padding: '3px 10px', borderRadius: 20
        }}>
          Powered by Groq + ET
        </span>
      </div>
    </nav>
  )
}
