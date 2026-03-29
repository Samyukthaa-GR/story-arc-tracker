'use client'

import { useState } from 'react'
import { StoryArc, PipelineStatus } from '@/types'
import { fetchStoryArc } from '@/lib/api'
import Navbar from '@/components/shared/Navbar'
import Hero from '@/components/shared/Hero'
import StatusBar from '@/components/shared/StatusBar'
import StoryHeader from '@/components/shared/StoryHeader'
import StatsRow from '@/components/shared/StatsRow'
import Timeline from '@/components/timeline/Timeline'
import SentimentChart from '@/components/sentiment/SentimentChart'
import PlayersPanel from '@/components/players/PlayersPanel'
import ContrarianPanel from '@/components/contrarian/ContrarianPanel'
import PredictionsPanel from '@/components/predictions/PredictionsPanel'
import FollowupChat from '@/components/shared/FollowupChat'

const S: React.CSSProperties = {
  maxWidth: 960,
  margin: '0 auto',
  padding: '0 24px',
}

export default function Home() {
  const [status, setStatus] = useState<PipelineStatus | null>(null)
  const [storyArc, setStoryArc] = useState<StoryArc | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (topic: string) => {
    setLoading(true)
    setError(null)
    setStoryArc(null)
    setStatus({ stage: 'expanding_query', message: 'Expanding search queries into ET topic slugs...' })
    await fetchStoryArc(
      topic,
      (s) => setStatus(s),
      (arc) => { setStoryArc(arc); setLoading(false); setStatus(null) },
      (msg) => { setError(msg); setLoading(false); setStatus(null) }
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      {!storyArc && !loading && !error && (
        <Hero onSearch={handleSearch} loading={loading} />
      )}

      {(loading || error || storyArc) && (
        <div style={{ ...S, paddingTop: 32, paddingBottom: 64 }}>
          {!storyArc && (
            <div style={{ maxWidth: 640, margin: '0 auto 32px' }}>
              <input
                disabled
                placeholder={status?.message || 'Tracking...'}
                style={{
                  width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--text2)', fontSize: 14, padding: '0 16px', height: 44,
                  borderRadius: 10, outline: 'none',
                }}
              />
            </div>
          )}

          {status && <StatusBar status={status} />}

          {error && (
            <div style={{
              background: '#1c0a0a', border: '1px solid #7f1d1d44', borderRadius: 10,
              padding: '12px 16px', fontSize: 13, color: '#f87171', marginBottom: 20
            }}>
              {error}
            </div>
          )}

          {storyArc && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <StoryHeader arc={storyArc} onNewSearch={handleSearch} loading={loading} />
              <StatsRow arc={storyArc} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Timeline events={storyArc.timeline} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <SentimentChart data={storyArc.sentiment_series} />
                  <ContrarianPanel view={storyArc.contrarian_view} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <PlayersPanel players={storyArc.players} />
                <PredictionsPanel predictions={storyArc.predictions} />
              </div>
              <FollowupChat storyArc={storyArc} />
            </div>
          )}
        </div>
      )}
    </main>
  )
}
