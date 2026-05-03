import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY' })
  }

  try {
    const { prompt, size = '1024x1536' } = req.body ?? {}

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing cover prompt' })
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

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'OpenAI image generation failed',
        detail: data,
      })
    }

    const imageBase64 = data?.data?.[0]?.b64_json

    if (!imageBase64) {
      return res.status(500).json({ error: 'No image returned from OpenAI' })
    }

    return res.status(200).json({
      imageBase64,
      mimeType: 'image/png',
    })
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Unknown image generation error',
    })
  }
}