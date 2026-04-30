import * as mock from './providers/mockProvider'
import * as openai from './providers/openaiProvider'

export type ProviderName = 'mock'|'openai'

export async function generateWithProvider(provider: ProviderName, prompt: string, opts: any = {}) {
  // only allow real provider in non-production or when explicitly enabled
  const enableReal = (globalThis as any)?.process?.env?.ENABLE_REAL_AI === 'true' || (globalThis as any)?.process?.env?.NODE_ENV !== 'production'
  if (provider === 'openai') {
    if (!enableReal) throw new Error('OpenAI provider disabled in production. Set ENABLE_REAL_AI=true to enable.')
    return openai.generateWithOpenAI(prompt, opts)
  }
  // default mock
  return mock.generateMock(prompt, opts)
}
