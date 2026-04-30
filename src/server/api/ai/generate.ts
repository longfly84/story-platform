import { generateChapterForStory } from '@/server/ai/chapterPipeline'

export async function post(req: any, _res: any) {
  try {
    const { storySlug, genreId, prompt, length, provider } = await req.json()

    // Dev-only logs to help debug provider/env loading. Keep minimal and never print the API key itself.
    const env = (globalThis as any)?.process?.env
    if ((env?.NODE_ENV ?? 'development') !== 'production') {
      console.debug('[ai/generate] provider requested:', provider ?? '(none)')
      console.debug('[ai/generate] ENABLE_REAL_AI present:', typeof env?.ENABLE_REAL_AI !== 'undefined' ? env.ENABLE_REAL_AI : '(unset)')
      console.debug('[ai/generate] OPENAI_API_KEY present:', !!env?.OPENAI_API_KEY)
    }

    const out = await generateChapterForStory({ storySlug, genreId, userPrompt: prompt, length })
    return new Response(JSON.stringify({ ok: true, data: out }), { status: 200 })
  } catch (e: any) {
    console.error('[ai/generate] error:', e)
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 })
  }
}
