import { generateChapterForStory } from '@/server/ai/chapterPipeline'

export async function post(req: any, _res: any) {
  try {
    const { storySlug, genreId, prompt, length, provider } = await req.json()
    // provider optional: 'mock' | 'openai'. Currently default mock.
    if (provider === 'openai') {
      // if missing key, openai provider will throw clear error
    }
    const out = await generateChapterForStory({ storySlug, genreId, userPrompt: prompt, length })
    return new Response(JSON.stringify({ ok: true, data: out }), { status: 200 })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 })
  }
}
