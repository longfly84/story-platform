// Minimal mock provider - future real providers (OpenAI, Claude, Gemini) will implement same interface
import type { AIProviderResult } from './types'

export async function generateMock(prompt: string, _opts: { length?: string } = {}): Promise<AIProviderResult> {
  // simulate async latency
  await new Promise((r) => setTimeout(r, 300))
  const title = 'Chương (mock)'
  const content = `${prompt}\n\n(Đây là nội dung giả mô phỏng dựa trên prompt và preset.)\n
Một đoạn hành động ngắn.\n\nKết thúc với cliffhanger...`
  const summary = content.split('\n')[0].slice(0, 200)
  return { title, content, summary, cliffhanger: 'Reveal', important_events: [`Generated: ${summary}`], emotion_tags: [], provider_meta: { provider: 'mock' } }
}



