const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1'
const OPENAI_IMAGE_SIZE = process.env.OPENAI_IMAGE_SIZE || '1024x1536'

async function requestOpenAIImage(prompt: string) {
  if (!OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY')
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_IMAGE_MODEL,
      prompt,
      size: OPENAI_IMAGE_SIZE,
    }),
  })

  const contentType = response.headers.get('content-type') || ''
  let data: any = null

  if (contentType.includes('application/json')) {
    data = await response.json()
  } else {
    const text = await response.text()
    const error = new Error('OpenAI image API returned non-JSON response') as Error & {
      detail?: unknown
      status?: number
    }
    error.detail = text
    error.status = response.status
    throw error
  }

  if (!response.ok) {
    const message = data?.error?.message || `OpenAI image API error (${response.status})`
    const error = new Error(message) as Error & {
      detail?: unknown
      status?: number
    }
    error.detail = data
    error.status = response.status
    throw error
  }

  const first = data?.data?.[0]
  const b64 = first?.b64_json || first?.image_base64 || null
  const revisedPrompt = first?.revised_prompt || first?.prompt || null

  if (!b64) {
    const error = new Error('OpenAI image response missing base64 image data') as Error & {
      detail?: unknown
    }
    error.detail = data
    throw error
  }

  return {
    b64,
    revisedPrompt,
    raw: data,
  }
}

export async function generateCoverImage(primaryPrompt: string, fallbackPrompt: string) {
  try {
    const result = await requestOpenAIImage(primaryPrompt)
    return {
      ...result,
      promptUsed: primaryPrompt,
      fallbackUsed: false,
      primaryError: null as string | null,
    }
  } catch (primaryError: any) {
    console.error('[generate-cover] primary prompt failed:', primaryError?.message, primaryError?.detail || '')

    const result = await requestOpenAIImage(fallbackPrompt)
    return {
      ...result,
      promptUsed: fallbackPrompt,
      fallbackUsed: true,
      primaryError: primaryError?.message || 'Primary prompt failed',
    }
  }
}
