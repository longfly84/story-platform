import type { AIProviderResult } from './providers/types'

function firstLine(text: string) { return (text||'').split('\n').find(l=>l.trim()) || 'Chương mới' }
function lastLine(text: string) { const lines=(text||'').split('\n').map(l=>l.trim()).filter(Boolean); return lines.length? lines[lines.length-1] : '' }
function shortSummary(text: string) { return (text||'').split('\n').join(' ').split('.').slice(0,2).join('.').trim() }

export function normalizeAIResult(raw: AIProviderResult, extras: any = {}): AIProviderResult & { provider_used?: string, story_dna?: any, scenario?: any } {
  const title = (raw.title || firstLine(raw.content || '')).trim().slice(0, 80)
  const content = (raw.content && String(raw.content).trim()) || '(Không có nội dung)'
  let summary = (raw.summary || '').trim()
  if (!summary) summary = shortSummary(content)
  let cliff = (raw.cliffhanger || '')?.trim()
  if (!cliff) cliff = lastLine(content)
  const important_events = Array.isArray(raw.important_events) ? raw.important_events : []
  const emotion_tags = Array.isArray(raw.emotion_tags) ? raw.emotion_tags : []
  const story_memory_updates = raw.story_memory_updates || {}

  return {
    title,
    content,
    summary,
    cliffhanger: cliff || '',
    important_events,
    emotion_tags,
    story_memory_updates,
    provider_meta: raw.provider_meta || extras.provider_meta || {},
    ...(extras.story_dna ? { story_dna: extras.story_dna } : {}),
    ...(extras.scenario ? { scenario: extras.scenario } : {}),
    provider_used: extras.provider_used || raw.provider_meta?.provider || 'unknown',
  }
}

export default normalizeAIResult
