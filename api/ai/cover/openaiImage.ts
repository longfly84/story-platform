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
Vertical 2:3 premium bright Chinese manhua / Korean webtoon / high-end anime urban-drama webnovel cover illustration, beautiful ChatGPT-style polished commercial key visual.

Scene:
A beautiful adult East Asian heroine in a bright modern story location, such as an airport hall, hotel lobby, glass office, event hall, factory floor, school office, hospital corridor, restaurant, shop, or public interior. Medium-wide composition, camera 2 to 4 meters away. The heroine occupies about 30% to 45% of the image, with a clear readable environment around her. Supporting figures in the background suggest witnesses, pressure, secrets, betrayal, and hidden truth.

Style:
Premium bright 2D Chinese manhua / Korean webtoon / high-end anime light novel cover art. Beautiful refined face, luminous eyes, glossy hair, smooth skin, elegant modern clothing, clean confident line art, bright commercial color, clear cel-shading with soft painterly gradients, polished dramatic promotional cover finish similar to high-quality ChatGPT anime/manhua generations.

Strict quality rules:
Do not use photorealism, live-action drama still, gritty realism, muddy dark office lighting, low-budget 3D render, mobile game NPC art, harsh realistic face, dead eyes, plastic mannequin skin, or ugly semi-realistic AI poster style.

Strict safety/text rules:
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
- Keep the composition balanced: beautiful readable heroine plus a clear spacious environment. Do not turn it into a tiny distant character or a tight portrait.
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
