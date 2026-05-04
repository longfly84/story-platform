import type { VercelRequest, VercelResponse } from '@vercel/node'

type CoverRequestBody = {
  prompt?: string
  coverPrompt?: string
  title?: string
  storySummary?: string
  genreLabel?: string
  heroineLabel?: string
  styleLabel?: string
  aspectRatio?: string
  size?: string
  modelKey?: string
}

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function buildCoverPromptFromBody(body: CoverRequestBody) {
  const directPrompt = normalizeText(body.prompt) || normalizeText(body.coverPrompt)

  if (directPrompt) {
    return directPrompt
  }

  const title = normalizeText(body.title)
  const storySummary = normalizeText(body.storySummary)
  const genreLabel = normalizeText(body.genreLabel)
  const heroineLabel = normalizeText(body.heroineLabel)
  const styleLabel = normalizeText(body.styleLabel) || 'webnovel dramatic vertical cover'

  if (!title) {
    return ''
  }

  return [
    `Create a high-quality vertical novel cover illustration in ${styleLabel} style.`,
    `Main story title: ${title}.`,
    storySummary ? `Story summary: ${storySummary}.` : '',
    genreLabel ? `Genre: ${genreLabel}.` : '',
    heroineLabel ? `Female lead archetype: ${heroineLabel}.` : '',
    'Mood: cinematic, dramatic, emotionally intense, polished, attractive for web novel readers.',
    'Composition: one clear focal subject, clean layout, strong lighting, visually striking.',
    'Important: no watermark, no logo, no UI, no branding.',
    'Important: do not place extra readable text on the image.',
    'Aspect: vertical cover suitable for fiction/webnovel platforms.',
  ]
    .filter(Boolean)
    .join(' ')
}

function resolveImageSize(body: CoverRequestBody) {
  const explicitSize = normalizeText(body.size)
  if (explicitSize) return explicitSize

  const aspectRatio = normalizeText(body.aspectRatio)

  switch (aspectRatio) {
    case '1:1':
      return '1024x1024'
    case '3:2':
    case '4:3':
    case '16:9':
      return '1536x1024'
    case '2:3':
    case '3:4':
    case '9:16':
    default:
      return '1024x1536'
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY' })
  }

  try {
    const body = (req.body ?? {}) as CoverRequestBody

    const prompt = buildCoverPromptFromBody(body)
    const size = resolveImageSize(body)

    if (!prompt) {
      return res.status(400).json({
        error: 'Missing cover prompt',
        detail:
          'Need one of: prompt / coverPrompt, or at least title so server can build cover prompt.',
      })
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt,
        size,
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'OpenAI image generation failed',
        detail: data,
      })
    }

    const b64Json = data?.data?.[0]?.b64_json

    if (!b64Json || typeof b64Json !== 'string') {
      return res.status(500).json({
        error: 'No image returned from OpenAI',
        detail: data,
      })
    }

    return res.status(200).json({
      b64_json: b64Json,
      dataUrl: `data:image/png;base64,${b64Json}`,
      mimeType: 'image/png',
      promptUsed: prompt,
      size,
    })
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Unknown image generation error',
    })
  }
}