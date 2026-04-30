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
  const timeout = opts.timeout ?? 8000
  const t = setTimeout(() => controller.abort(), timeout)

  try {
    const systemMsg = opts.system || 'You are a creative fiction assistant. Produce a chapter in Vietnamese. Return rich content.'
    const body = {
      model: opts.model || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMsg },
        { role: 'user', content: prompt },
      ],
      temperature: typeof opts.temperature === 'number' ? opts.temperature : 0.7,
      max_tokens: typeof opts.max_tokens === 'number' ? opts.max_tokens : 512,
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
      // fallback
      return generateMock(prompt, opts)
    }

    const j = await resp.json()
    const text = j?.choices?.[0]?.message?.content ?? ''
    // parse model output into structured result
    const parsed = parseModelOutput(String(text))
    // normalize result
    const { normalizeAIResult } = await import('../normalizeAIResult')
    const norm = normalizeAIResult(parsed, { provider_used: 'openai' })
    return norm
  } catch (e) {
    // on any error, fallback to mock
    return generateMock(prompt, opts)
  } finally {
    clearTimeout(t)
  }
}
