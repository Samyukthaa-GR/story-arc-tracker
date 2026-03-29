'use client'
import { useState, FormEvent, useRef, useEffect } from 'react'
import { StoryArc } from '@/types'
import { fetchFollowup } from '@/lib/api'

interface Message { role: 'user' | 'ai'; text: string }
const SUGGESTED = ['Who is most responsible?', 'What is the total debt?', 'What happens next?']

export default function FollowupChat({ storyArc }: { storyArc: StoryArc }) {
  const [msgs, setMsgs] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const send = async (q: string) => {
    if (!q.trim() || loading) return
    setMsgs(m => [...m, { role: 'user', text: q }])
    setInput('')
    setLoading(true)
    try {
      const ans = await fetchFollowup(q, storyArc)
      setMsgs(m => [...m, { role: 'ai', text: ans }])
    } catch {
      setMsgs(m => [...m, { role: 'ai', text: 'Something went wrong. Try again.' }])
    } finally { setLoading(false) }
  }

  const submit = (e: FormEvent) => { e.preventDefault(); send(input) }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4 }}>
        Ask about this story
      </div>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>Answers grounded in ET's coverage</div>

      {msgs.length === 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {SUGGESTED.map(q => (
            <button key={q} onClick={() => send(q)}
              style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                color: 'var(--text2)', fontSize: 12, padding: '6px 14px',
                borderRadius: 20, cursor: 'pointer', transition: 'all .15s'
              }}
              onMouseEnter={e => { const el = e.target as HTMLElement; el.style.borderColor = 'var(--et)'; el.style.color = 'var(--et)' }}
              onMouseLeave={e => { const el = e.target as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--text2)' }}
            >{q}</button>
          ))}
        </div>
      )}

      {msgs.length > 0 && (
        <div style={{ maxHeight: 240, overflowY: 'auto', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '80%', padding: '10px 14px', borderRadius: 10,
                fontSize: 13, lineHeight: 1.6,
                background: m.role === 'user' ? 'var(--et)' : 'var(--surface2)',
                color: m.role === 'user' ? '#fff' : 'var(--text)',
                borderRadius: m.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px'
              }}>{m.text}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex' }}>
              <div style={{ background: 'var(--surface2)', borderRadius: '10px 10px 10px 2px', padding: '10px 14px', display: 'flex', gap: 4 }}>
                {[0, 150, 300].map(d => (
                  <span key={d} style={{
                    width: 6, height: 6, borderRadius: '50%', background: 'var(--text3)',
                    display: 'inline-block',
                    animation: `bounce 1s ${d}ms infinite`
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      <form onSubmit={submit} style={{ display: 'flex', gap: 8 }}>
        <input
          value={input} onChange={e => setInput(e.target.value)} disabled={loading}
          placeholder="Ask anything about this story..."
          style={{
            flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)',
            color: 'var(--text)', fontSize: 13, padding: '0 14px', height: 40,
            borderRadius: 8, outline: 'none', transition: 'border .15s'
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--et)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
        <button type="submit" disabled={loading || !input.trim()}
          style={{
            background: 'var(--et)', color: '#fff', fontSize: 13, fontWeight: 600,
            padding: '0 18px', height: 40, borderRadius: 8, border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1
          }}>
          Ask
        </button>
      </form>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
    </div>
  )
}
