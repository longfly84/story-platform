import { generateChapterForStory } from '@/server/ai/chapterPipeline'

export async function post(req: any, _res: any) {
  try {
    const { storySlug, genreId, prompt, length } = await req.json()
    const out = await generateChapterForStory({ storySlug, genreId, userPrompt: prompt, length })
    return new Response(JSON.stringify({ ok: true, data: out }), { status: 200 })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 })
  }
}
