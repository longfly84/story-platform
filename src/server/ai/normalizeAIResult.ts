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

  // Post-processing: stronger cleaning for webnovel style
  const BLACKLIST_MAP: Record<string, string> = {
    'Từ ngày đó': 'Ngày hôm đó',
    'Lòng tôi tràn ngập': 'Tôi cảm thấy',
    'Mọi thứ thay đổi': 'Mọi người đứng chết lặng',
    'Cuộc sống tôi bỗng': 'Ngày ấy, cuộc sống tôi',
    'Tất cả thay đổi': 'Mọi thứ rùng mình',
    'Tôi nhớ rõ': 'Tôi nhìn thấy',
    'Đã đến lúc': 'Ngay lúc đó',
    'Tôi cảm thấy': 'Tôi thấy'
  }

  let processedContent = content || ''

  // remove obvious JSON leftovers or markdown blocks
  processedContent = processedContent.replace(/```[\s\S]*?```/g, '')
  processedContent = processedContent.replace(/\{\s*"title"[\s\S]*?\}/gi, '')

  // replace blacklist phrases (global, case-insensitive)
  for (const k of Object.keys(BLACKLIST_MAP)) {
    const re = new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    processedContent = processedContent.replace(re, BLACKLIST_MAP[k])
  }

  // remove consecutive duplicate lines and trim whitespace
  const lines = processedContent.split('\n')
  const deduped: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const curRaw = lines[i]
    const cur = curRaw.trim()
    const prev = deduped.length ? deduped[deduped.length - 1].trim() : null
    if (!cur) { // preserve single blank lines but avoid many
      if (deduped.length && deduped[deduped.length - 1].trim() === '') continue
      deduped.push('')
      continue
    }
    // drop if same as previous non-empty line
    if (cur === prev) continue
    deduped.push(cur)
  }
  processedContent = deduped.join('\n')

  // remove repeated headers like "[Summary]" or duplicated title blocks and bracketed sections
  processedContent = processedContent.replace(/\n#+\s*Chương[^\n]*/gi, '')
  processedContent = processedContent.replace(/\[Summary\][\s\S]*?(?=\n\n|$)/gi, '')
  processedContent = processedContent.replace(/\[Cliffhanger\][\s\S]*?(?=\n\n|$)/gi, '')
  processedContent = processedContent.replace(/\[Title\][\s\S]*?(?=\n\n|$)/gi, '')
  // remove explicit JSON key/value fragments inside content
  processedContent = processedContent.replace(/"summary"\s*:\s*"[\s\S]*?"\s*,?/gi, '')
  processedContent = processedContent.replace(/"cliffhanger"\s*:\s*"[\s\S]*?"\s*,?/gi, '')
  // remove assistant/AI phrases
  processedContent = processedContent.replace(/(As an AI language model[\s\S]*?\n?)/gi, '')

  // remove trailing malformed JSON fragments like '}{' or leftover brackets
  processedContent = processedContent.replace(/^[\s\S]*?\{\s*"title"/i, '')
  processedContent = processedContent.replace(/\}[\s\S]*$/g, '')

  // fallback: if content looks like summary/trailer (few sentences but many future-tense keywords), keep first scene lines only
  const trailerCheck = /hãy chờ xem|hãy cùng theo dõi|màn trả thù bắt đầu|sẽ (bắt|bùng|đưa)/i
  if (trailerCheck.test(processedContent) && processedContent.split('\n').length < 6) {
    const paras = processedContent.split('\n\n')
    processedContent = (paras[0] || processedContent).replace(trailerCheck, '')
  }

  // Final clean pass: remove any leftover JSON keys, markdown headings, bracketed sections, and leading duplicated title
  function cleanContent(text: string) {
    return String(text)
      .replace(/\{[\s\S]*?\}/g, '')
      .replace(/"title"\s*:\s*"[\s\S]*?"\s*,?/gi, '')
      .replace(/\n#+\s*[^\n]*/g, '')
      .replace(/\[Summary\][\s\S]*?(?=\n\n|$)/gi, '')
      .replace(/\[Cliffhanger\][\s\S]*?(?=\n\n|$)/gi, '')
      .replace(/^[\s\n:-]+/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  processedContent = cleanContent(processedContent)

  // Simple retention scoring heuristics (0-100)
  function clamp(n: number) { return Math.max(0, Math.min(100, Math.round(n))) }
  const head = (processedContent || '').slice(0, 400)
  const hookHits = (head.match(/humiliat|humili|bị (x|l)ấ|đánh|chỉ trỏ|kêu lên|tiếng hét|tin nhắn|gọi đến|vạch trần|lộ/gi) || []).length
  const hook_strength = clamp(Math.min(100, hookHits * 33))
  const cliff_strength = clamp(cliff && cliff.length > 8 ? 80 : 30)
  const paragraphLens = processedContent.split(/\n\n+/).map(p => p.split(/\.|!|\?/) .map(s=>s.trim()).filter(Boolean).length)
  const avgSent = paragraphLens.length ? (paragraphLens.reduce((a,b)=>a+b,0)/paragraphLens.length) : 3
  const tension_score = clamp((1 - Math.min(1, avgSent/6)) * 100)
  const quoteCount = (processedContent.match(/\"|”|“|\u201C|\u201D|"|『|』/g) || []).length
  const sentenceCount = (processedContent.split(/\.|!|\?|\n/).filter(Boolean).length) || 1
  const dialogue_ratio = clamp(Math.round((quoteCount / sentenceCount) * 100))

  const retention = { hook_strength, cliff_strength, tension_score, dialogue_ratio }

  return {
    title,
    content: processedContent,
    summary,
    cliffhanger: cliff || '',
    important_events,
    emotion_tags,
    story_memory_updates,
    provider_meta: { ...(raw.provider_meta || extras.provider_meta || {}), retention },
    ...(extras.story_dna ? { story_dna: extras.story_dna } : {}),
    ...(extras.scenario ? { scenario: extras.scenario } : {}),
    provider_used: extras.provider_used || raw.provider_meta?.provider || 'unknown',
  }
}

export default normalizeAIResult
