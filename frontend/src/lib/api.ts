import { StoryArc, PipelineStatus } from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export async function fetchStoryArc(
  topic: string,
  onStatus: (status: PipelineStatus) => void,
  onResult: (arc: StoryArc) => void,
  onError: (message: string) => void
): Promise<void> {
  const response = await fetch(`${API_BASE}/story`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  })

  if (!response.ok || !response.body) {
    onError('Failed to connect to the server.')
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    let eventType = ''
    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventType = line.slice(7).trim()
      } else if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6))
          if (eventType === 'status') {
            onStatus(data as PipelineStatus)
          } else if (eventType === 'story_arc' || eventType === 'cached') {
            onResult(data.story_arc as StoryArc)
          } else if (eventType === 'error') {
            onError(data.message)
          }
        } catch {
          // ignore parse errors on partial chunks
        }
        eventType = ''
      }
    }
  }
}

export async function fetchFollowup(
  question: string,
  storyArc: StoryArc
): Promise<string> {
  const response = await fetch(`${API_BASE}/followup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, story_arc: storyArc }),
  })
  if (!response.ok) throw new Error('Followup request failed')
  const data = await response.json()
  return data.answer
}
