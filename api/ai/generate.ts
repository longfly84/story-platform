import { generateChapterForStory } from '../../src/server/ai/chapterPipeline'

// Vercel-style serverless function entry (minimal, safe)
export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ ok: false, error: 'Method not allowed' })
      return
    }

    // Support both parsed body (vercel) and raw stream
    let body: any = req.body
    if (!body || Object.keys(body).length === 0) {
      let raw = ''
      for await (const chunk of req) raw += chunk
      body = raw ? JSON.parse(raw) : {}
    }

    const { storySlug, genreId, prompt, length, provider } = body || {}

    if (process.env.NODE_ENV !== 'production') {
      console.debug('[api/ai/generate] received request, provider:', provider ?? '(none)')
      console.debug('[api/ai/generate] ENABLE_REAL_AI present:', typeof process.env.ENABLE_REAL_AI !== 'undefined' ? process.env.ENABLE_REAL_AI : '(unset)')
      console.debug('[api/ai/generate] OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY)
    }

    const out = await generateChapterForStory({ storySlug, genreId, userPrompt: prompt, length, provider })
    res.status(200).json({ ok: true, data: out })
  } catch (e: any) {
    console.error('[api/ai/generate] error', e)
    res.status(500).json({ ok: false, error: String(e?.message ?? e) })
  }
}
