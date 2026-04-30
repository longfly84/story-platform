import type { AIProviderResult } from './providers/types'

function firstLine(text: string) { return (text || '').split('\n').find(l => l.trim()) || '' }

function lastLine(text: string) { const lines = (text||'').split('\n').map(l=>l.trim()).filter(Boolean); return lines.length? lines[lines.length-1] : '' }

function shortSummary(text: string) {
  const s = (text||'').split('\n').join(' ')
  return s.split('.').slice(0,2).join('.').trim()
}

export function parseModelOutput(raw: string): AIProviderResult {
  // try to parse JSON first
  // attempt to extract JSON object from raw even if wrapped in text
  try {
    // find first { ... } block
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const j = JSON.parse(jsonMatch[0])
      const ok = j && (typeof j.title === 'string' || typeof j.content === 'string' || typeof j.summary === 'string')
      if (ok) {
        return {
          title: j.title || firstLine(String(j.content||'')) || 'Chương mới',
          content: j.content || j.text || raw,
          summary: j.summary || shortSummary(j.content || j.text || raw),
          cliffhanger: j.cliffhanger || j.cliff || lastLine(j.content || j.text || raw),
          important_events: j.important_events || j.events || [],
          emotion_tags: j.emotion_tags || j.emotionTags || [],
          story_memory_updates: j.story_memory_updates || j.memory_updates || {},
          provider_meta: { provider: 'openai' }
        }
      }
    }
  } catch (e) {
    // JSON parse failed
  }

  // fallback: parse headings like [Summary], [Cliffhanger]
  const summaryMatch = raw.match(/\[Summary\]\s*([\s\S]{1,200})/i)
  const cliffMatch = raw.match(/\[Cliffhanger\]\s*([\s\S]{1,200})/i)

  const title = firstLine(raw) || 'Chương mới'
  const content = raw
  const summary = summaryMatch ? summaryMatch[1].trim() : shortSummary(raw)
  const cliffhanger = cliffMatch ? cliffMatch[1].trim() : lastLine(raw)

  return {
    title,
    content,
    summary,
    cliffhanger,
    important_events: [],
    emotion_tags: [],
    story_memory_updates: {},
    provider_meta: { provider: 'openai' }
  }
}

export default parseModelOutput
