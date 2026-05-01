// OpenAI provider skeleton - does not call real API yet.
// Reads OPENAI_API_KEY from environment and throws clear error if missing.
// Future: implement real call to OpenAI here.

import type { AIProviderResult } from './types'
import { generateMock } from './mockProvider'
import { parseModelOutput } from '../outputParser'

export async function generateWithOpenAI(prompt: string, opts: any = {}): Promise<AIProviderResult> {
  // allow using real OpenAI only when key present; otherwise fallback to mock
  const key = (globalThis as any)?.process?.env?.OPENAI_API_KEY
  const enableReal = (globalThis as any)?.process?.env?.ENABLE_REAL_AI === 'true' || (globalThis as any)?.process?.env?.NODE_ENV !== 'production'
  if (!key || !enableReal) {
    // fallback to mock provider
    return generateMock(prompt, opts)
  }

  // prepare request to OpenAI Chat Completions
  const controller = new AbortController()
  // allow longer time for generation (60s default, override with opts.timeout)
  const timeout = opts.timeout ?? 60000
  const t = setTimeout(() => {
    controller.abort()
  }, timeout)

  try {
    const systemMsg = opts.system || 'You are a creative fiction assistant. Produce a chapter in Vietnamese. Return rich content.'
    const body = {
      model: opts.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMsg },
        { role: 'user', content: prompt },
      ],
      temperature: typeof opts.temperature === 'number' ? opts.temperature : 0.8,
      // reduce default tokens for testing stability
      max_tokens: typeof opts.max_tokens === 'number' ? opts.max_tokens : 1400,
      // prefer structured JSON object response when supported
      response_format: { type: 'json_object' } as any,
    }

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(t)

    if (!resp.ok) {
      const txt = await resp.text().catch(()=>'')
      // return explicit error instead of fallback
      return { title: 'OpenAI Error', content: `OpenAI generation failed${txt ? ': '+String(txt).slice(0,200) : ''}`, summary: '', cliffhanger: '', important_events: [], emotion_tags: [], story_memory_updates: {}, provider_meta: { provider: 'openai', error: txt } }
    }

    const j = await resp.json()
    let text = j?.choices?.[0]?.message?.content ?? ''
    // strip common code fences and annotations (```json ... ```)
    try {
      // remove ```json ... ``` blocks and ``` ... ``` fences
      text = String(text).replace(/```json([\s\S]*?)```/gi, '$1')
      text = text.replace(/```([\s\S]*?)```/g, '$1')
      // if provider returned a JSON-like content directly in message, keep as-is
      const firstBrace = text.indexOf('{')
      if (firstBrace > 0) text = text.slice(firstBrace)
    } catch (e) {
      // ignore
    }
    // parse model output into structured result
    let parsed
    try {
      parsed = parseModelOutput(String(text))
      // if parsing produced empty content, treat as parse failure
      if (!parsed.content || String(parsed.content).trim().length === 0) throw new Error('empty content')
    } catch (err) {
      // fallback: do not return raw broken JSON to UI
      if ((globalThis as any)?.process?.env?.NODE_ENV !== 'production') console.error('AI parse error', err)
      return { title: 'Lỗi AI', content: 'AI output parse failed. Please generate again.', summary: '', cliffhanger: '', important_events: [], emotion_tags: [], story_memory_updates: {}, provider_meta: { provider: 'openai' } }
    }
    // normalize result
    const { normalizeAIResult } = await import('../normalizeAIResult')
    const norm = normalizeAIResult(parsed, { provider_used: 'openai' })
    return norm
  } catch (e) {
    // on any unexpected error, return explicit error (do not fallback silently)
    if ((globalThis as any)?.process?.env?.NODE_ENV !== 'production') console.error('OpenAI request failed', e)
    return { title: 'OpenAI Error', content: 'OpenAI generation failed. Please try again.', summary: '', cliffhanger: '', important_events: [], emotion_tags: [], story_memory_updates: {}, provider_meta: { provider: 'openai', error: String(e) } }
  } finally {
    clearTimeout(t)
  }
}
