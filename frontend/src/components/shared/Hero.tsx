'use client'
import { useState, FormEvent } from 'react'

const DEMOS = ["Byju's collapse", "Adani Hindenburg", "Paytm RBI action", "Zomato Blinkit"]

interface Props { onSearch: (t: string) => void; loading: boolean }

export default function Hero({ onSearch, loading }: Props) {
  const [val, setVal] = useState('')

  const submit = (e: FormEvent) => { e.preventDefault(); if (val.trim()) onSearch(val.trim()) }

  return (
    <div style={{ padding: '80px 24px 56px', textAlign: 'center', maxWidth: 960, margin: '0 auto' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: '#1a0f07', border: '1px solid #f2652244', color: 'var(--et)',
        fontSize: 11, fontWeight: 600, letterSpacing: '.08em', padding: '4px 14px',
        borderRadius: 20, marginBottom: 24, textTransform: 'uppercase'
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--et)', display: 'inline-block' }} />
        Powered by Economic Times journalism
      </div>

      <h1 style={{
        fontSize: 52, fontWeight: 700, letterSpacing: '-2px', lineHeight: 1.08,
        marginBottom: 16, color: 'var(--text)',
      }}>
        Explore any<br />business story
      </h1>

      <p style={{ fontSize: 16, color: 'var(--text2)', marginBottom: 40, lineHeight: 1.65 }}>
        Enter a company, person, or event. Get a complete AI-built narrative<br />
        from ET's own journalism — timeline, players, sentiment and more.
      </p>

      <form onSubmit={submit} style={{ display: 'flex', gap: 10, maxWidth: 620, margin: '0 auto 18px' }}>
        <input
          value={val} onChange={e => setVal(e.target.value)} disabled={loading}
          placeholder="e.g. Byju's collapse, Adani Hindenburg, Paytm RBI..."
          style={{
            flex: 1, background: 'var(--surface)', border: '1px solid var(--border)',
            color: 'var(--text)', fontSize: 14, padding: '0 16px', height: 46,
            borderRadius: 10, outline: 'none', transition: 'border .15s',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--et)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
        <button
          type="submit" disabled={loading || !val.trim()}
          style={{
            background: 'var(--et)', color: '#fff', fontSize: 13, fontWeight: 600,
            padding: '0 22px', height: 46, borderRadius: 10, border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1,
            transition: 'background .15s', whiteSpace: 'nowrap'
          }}
          onMouseEnter={e => { if (!loading) (e.target as HTMLElement).style.background = 'var(--et2)' }}
          onMouseLeave={e => { (e.target as HTMLElement).style.background = 'var(--et)' }}
        >
          {loading ? 'Tracking...' : 'Track story →'}
        </button>
      </form>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>Try:</span>
        {DEMOS.map(t => (
          <button key={t} onClick={() => onSearch(t)} disabled={loading}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text2)', fontSize: 12, padding: '5px 14px',
              borderRadius: 20, cursor: 'pointer', transition: 'all .15s',
              opacity: loading ? .5 : 1
            }}
            onMouseEnter={e => { const el = e.target as HTMLElement; el.style.borderColor = 'var(--et)'; el.style.color = 'var(--et)' }}
            onMouseLeave={e => { const el = e.target as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--text2)' }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  )
}
