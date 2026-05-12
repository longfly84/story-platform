const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1'
const OPENAI_IMAGE_SIZE = process.env.OPENAI_IMAGE_SIZE || '1024x1536'
const OPENAI_MODERATION_MODEL = process.env.OPENAI_MODERATION_MODEL || 'omni-moderation-latest'

type OpenAIImageQuality = 'low' | 'medium' | 'high'

function normalizeImageQuality(value: unknown): OpenAIImageQuality {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()

  if (normalized === 'low' || normalized === 'medium' || normalized === 'high') {
    return normalized
  }

  return 'medium'
}

const DEFAULT_OPENAI_IMAGE_QUALITY = normalizeImageQuality(process.env.OPENAI_IMAGE_QUALITY || 'medium')

function safeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error

  try {
    return JSON.stringify(error)
  } catch {
    return 'Unknown error'
  }
}

function isModerationBlockedError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase()
  const detail = String((error as any)?.detail ? JSON.stringify((error as any).detail) : '').toLowerCase()

  return (
    message.includes('moderation') ||
    message.includes('blocked') ||
    message.includes('violence') ||
    message.includes('safety') ||
    detail.includes('moderation') ||
    detail.includes('flagged') ||
    detail.includes('violence')
  )
}

function buildEmergencyFallbackPrompt() {
  return `
Vertical 2:3 premium modern East Asian web-novel cover illustration.

Scene:
A wide pulled-back cinematic story scene in a modern city environment, luxury hotel lobby, glass office atrium, airport hall, hospital corridor, factory floor, or event hall. The environment dominates the image with visible architecture, floor, ceiling, windows, furniture, crowd space, and depth. The adult East Asian female lead is small and off-center, full-body or 3/4 body, only about 8% to 16% of the frame. Several blurred but readable supporting figures stand at different distances, suggesting betrayal, secrets, pressure, and hidden truth. Evidence objects such as a blank folder, phone, suitcase, counter, bracelet, or document prop appear in the foreground or midground.

Style:
Polished premium Chinese manhua / webnovel cinematic cover art, elegant lighting, detailed environment design, commercial drama poster quality, wide establishing shot, scenic composition, not a portrait.

Strict rules:
No close-up portrait, no bust portrait, no giant heroine, no centered character blocking the background, no cramped room, no narrow corridor-only framing, no blurred useless background.
No text, no title, no letters, no typography, no logo, no watermark.
No blood, no weapons, no knife, no gun, no corpse, no dead body, no wounds, no gore, no explicit violence, no self-harm.
Represent conflict only through symbolic emotional tension, shadows, reflections, distance, blank documents, turned-away phones, and lighting.
Safe public social media cover art.
`.trim()
}


function buildUltraNoTextRescuePrompt(prompt: string) {
  return `${safeString(prompt)}

ULTRA NO-TEXT RESCUE:
- Absolute zero text in the image.
- No title area at all.
- No letters, no words, no typography, no logo, no watermark.
- No readable or unreadable script-like marks.
- All papers, phones, monitors, folders, books, signs, tickets, and documents must be blank, dark, blurred, covered, turned away, or abstract.
- This is scene illustration only, not a poster with typography.
- Keep the camera pulled far back. The heroine must stay small inside a large readable environment.
- If the model tends to add any title or writing, remove it completely and keep only the illustration.`.trim()
}

function containsTypographyRisk(text: string) {
  const lowered = safeString(text).toLowerCase()
  if (!lowered) return false

  return [
    'title',
    'text',
    'typography',
    'caption',
    'logo',
    'watermark',
    'font',
    'headline',
    'letters',
  ].some((keyword) => lowered.includes(keyword))
}

async function moderatePromptOrThrow(prompt: string) {
  if (!OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY')
  }

  const safePrompt = String(prompt || '').trim()
  if (!safePrompt) {
    throw new Error('Missing cover prompt for moderation')
  }

  const response = await fetch('https://api.openai.com/v1/moderations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODERATION_MODEL,
      input: safePrompt,
    }),
  })

  const contentType = response.headers.get('content-type') || ''
  let data: any = null

  if (contentType.includes('application/json')) {
    data = await response.json()
  } else {
    const text = await response.text()
    const error = new Error('OpenAI moderation API returned non-JSON response') as Error & {
      detail?: unknown
      status?: number
    }
    error.detail = text
    error.status = response.status
    throw error
  }

  if (!response.ok) {
    const message = data?.error?.message || `OpenAI moderation API error (${response.status})`
    const error = new Error(message) as Error & {
      detail?: unknown
      status?: number
    }
    error.detail = data
    error.status = response.status
    throw error
  }

  const first = data?.results?.[0] || {}
  const flagged = Boolean(first?.flagged)
  const categories = (first?.categories || {}) as Record<string, boolean>

  if (flagged) {
    const flaggedKeys = Object.entries(categories)
      .filter(([, value]) => Boolean(value))
      .map(([key]) => key)

    const error = new Error(
      `Cover prompt blocked by moderation${
        flaggedKeys.length ? `: ${flaggedKeys.join(', ')}` : ''
      }`,
    ) as Error & {
      detail?: unknown
      categories?: Record<string, boolean>
    }

    error.detail = data
    error.categories = categories
    throw error
  }

  return data
}

async function requestOpenAIImage(prompt: string, requestedQuality?: unknown) {
  if (!OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY')
  }

  const safePrompt = safeString(prompt)

  if (!safePrompt) {
    throw new Error('Missing cover prompt')
  }

  const imageQuality = normalizeImageQuality(
    requestedQuality || DEFAULT_OPENAI_IMAGE_QUALITY,
  )

  await moderatePromptOrThrow(safePrompt)

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_IMAGE_MODEL,
      prompt: safePrompt,
      size: OPENAI_IMAGE_SIZE,
      quality: imageQuality,
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
    imageQualityUsed: imageQuality,
  }
}

async function requestBestEffortNoTextImage(prompt: string, requestedQuality?: unknown) {
  const first = await requestOpenAIImage(prompt, requestedQuality)

  if (!containsTypographyRisk(first.revisedPrompt || '')) {
    return {
      ...first,
      noTextRescueUsed: false,
    }
  }

  const rescuePrompt = buildUltraNoTextRescuePrompt(prompt)
  const rescue = await requestOpenAIImage(rescuePrompt, requestedQuality)

  return {
    ...rescue,
    promptUsedOverride: rescuePrompt,
    noTextRescueUsed: true,
  }
}

export async function generateCoverImage(
  primaryPrompt: string,
  fallbackPrompt: string,
  requestedQuality?: unknown,
) {
  const safePrimaryPrompt = safeString(primaryPrompt)
  const safeFallbackPrompt = safeString(fallbackPrompt) || buildEmergencyFallbackPrompt()

  try {
    const result = await requestBestEffortNoTextImage(safePrimaryPrompt, requestedQuality)

    return {
      ...result,
      promptUsed: (result as any).promptUsedOverride || safePrimaryPrompt,
      fallbackUsed: false,
      emergencyFallbackUsed: false,
      primaryError: null as string | null,
      fallbackError: null as string | null,
    }
  } catch (primaryError: any) {
    console.error(
      '[generate-cover] primary prompt failed:',
      primaryError?.message,
      primaryError?.detail || '',
    )

    try {
      const result = await requestBestEffortNoTextImage(safeFallbackPrompt, requestedQuality)

      return {
        ...result,
        promptUsed: (result as any).promptUsedOverride || safeFallbackPrompt,
        fallbackUsed: true,
        emergencyFallbackUsed: false,
        primaryError: primaryError?.message || 'Primary prompt failed',
        fallbackError: null as string | null,
      }
    } catch (fallbackError: any) {
      console.error(
        '[generate-cover] fallback prompt failed:',
        fallbackError?.message,
        fallbackError?.detail || '',
      )

      const emergencyPrompt = buildEmergencyFallbackPrompt()
      const shouldTryEmergency =
        safeFallbackPrompt !== emergencyPrompt && isModerationBlockedError(fallbackError)

      if (!shouldTryEmergency) {
        throw fallbackError
      }

      const result = await requestBestEffortNoTextImage(emergencyPrompt, requestedQuality)

      return {
        ...result,
        promptUsed: (result as any).promptUsedOverride || emergencyPrompt,
        fallbackUsed: true,
        emergencyFallbackUsed: true,
        primaryError: primaryError?.message || 'Primary prompt failed',
        fallbackError: fallbackError?.message || 'Fallback prompt failed',
      }
    }
  }
}
