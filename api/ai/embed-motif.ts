import type { VercelRequest, VercelResponse } from '@vercel/node'

type EmbedMotifRequestBody = {
  text?: string
  texts?: string[]
  model?: string
}

function safeText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

function safeTexts(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => safeText(item))
    .filter(Boolean)
    .slice(0, 64)
}

function truncateText(value: string, maxLength = 1000) {
  const text = safeText(value)

  if (text.length <= maxLength) return text

  return `${text.slice(0, maxLength)}...`
}

function parseJson(text: string) {
  try {
    return text ? JSON.parse(text) : null
  } catch {
    return null
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      detail: 'Use POST for /api/ai/embed-motif.',
    })
  }

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return res.status(500).json({
      error: 'Missing OPENAI_API_KEY',
    })
  }

  try {
    const body = (req.body ?? {}) as EmbedMotifRequestBody
    const singleText = safeText(body.text)
    const multipleTexts = safeTexts(body.texts)
    const input = multipleTexts.length ? multipleTexts : singleText ? [singleText] : []

    if (!input.length) {
      return res.status(400).json({
        error: 'Missing motif text',
        detail: 'Send { text } or { texts }.',
      })
    }

    const model =
      safeText(body.model) ||
      process.env.OPENAI_EMBEDDING_MODEL ||
      'text-embedding-3-small'

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input,
      }),
    })

    const rawText = await response.text()
    const data = parseJson(rawText)

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'OpenAI embedding API error',
        detail:
          data || {
            nonJsonResponse: true,
            status: response.status,
            statusText: response.statusText,
            preview: truncateText(rawText, 1200),
          },
      })
    }

    const embeddings = Array.isArray(data?.data)
      ? data.data.map((item: any) => item?.embedding).filter(Array.isArray)
      : []

    if (!embeddings.length) {
      return res.status(500).json({
        error: 'No embedding returned from OpenAI',
        detail: data,
      })
    }

    return res.status(200).json({
      embedding: embeddings[0],
      embeddings,
      model,
      usage: data?.usage || null,
    })
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Unknown embedding error',
    })
  }
}