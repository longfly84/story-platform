import * as mock from './providers/mockProvider'
import * as openai from './providers/openaiProvider'

export type ProviderName = 'mock'|'openai'

export async function generateWithProvider(provider: ProviderName, prompt: string, opts: any = {}) {
  // only allow real provider in non-production or when explicitly enabled
  const env = (globalThis as any)?.process?.env
  const enableReal = env?.ENABLE_REAL_AI === 'true' || env?.NODE_ENV !== 'production'

  // Dev-only logging (do not print API key)
  if ((env?.NODE_ENV ?? 'development') !== 'production') {
    console.debug('[providerIndex] provider requested:', provider)
    console.debug('[providerIndex] ENABLE_REAL_AI:', typeof env?.ENABLE_REAL_AI !== 'undefined' ? env.ENABLE_REAL_AI : '(unset)')
    console.debug('[providerIndex] OPENAI_API_KEY present:', !!env?.OPENAI_API_KEY)
  }
  if (provider === 'openai') {
    if (!enableReal) throw new Error('OpenAI provider disabled in production. Set ENABLE_REAL_AI=true to enable.')
    return openai.generateWithOpenAI(prompt, opts)
  }
  // default mock
  return mock.generateMock(prompt, opts)
}
