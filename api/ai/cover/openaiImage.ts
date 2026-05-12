const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1'
const OPENAI_IMAGE_SIZE = process.env.OPENAI_IMAGE_SIZE || '1024x1536'
const OPENAI_MODERATION_MODEL = process.env.OPENAI_MODERATION_MODEL || 'omni-moderation-latest'

type OpenAIImageQuality = 'low' | 'medium' | 'high'

type GenerateCoverImageOptions = {
  styleReferenceUrl?: string
}

type OpenAIImageResult = {
  b64: string
  promptUsed: string
  revisedPrompt?: string
  fallbackUsed?: boolean
  noTextRescueUsed?: boolean
  emergencyFallbackUsed?: boolean
  styleReferenceUsed?: boolean
  styleReferenceError?: string | null
  primaryError?: string | null
  fallbackError?: string | null
  imageQualityUsed?: OpenAIImageQuality
}

const DEFAULT_OPENAI_IMAGE_QUALITY: OpenAIImageQuality =
  normalizeImageQuality(process.env.OPENAI_IMAGE_QUALITY || 'medium')

function normalizeImageQuality(value: unknown): OpenAIImageQuality {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()

  if (normalized === 'low' || normalized === 'medium' || normalized === 'high') {
    return normalized
  }

  return 'medium'
}

function safeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeUrl(value: unknown) {
  const raw = safeString(value)
  if (!raw) return ''

  try {
    const url = new URL(raw)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    return url.toString()
  } catch {
    return ''
  }
}

function inferMimeTypeFromUrl(url: string) {
  const pathname = (() => {
    try {
      return new URL(url).pathname.toLowerCase()
    } catch {
      return ''
    }
  })()

  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) return 'image/jpeg'
  if (pathname.endsWith('.webp')) return 'image/webp'
  if (pathname.endsWith('.png')) return 'image/png'

  return 'image/png'
}

function inferFileNameFromUrl(url: string) {
  try {
    const last = new URL(url).pathname.split('/').filter(Boolean).pop()
    if (last) return last
  } catch {
    // ignore
  }

  return 'cover-style-reference.png'
}

function appendNoTextInstruction(prompt: string) {
  return `
${prompt}

STRICT COVER OUTPUT RULE:
- Do not render any readable text, letters, subtitles, watermark, logo, caption, typography, Vietnamese words, Chinese words, English words, numbers, QR code, UI text, title text, author name, or fake book title on the image.
- The final image must be clean cover art only.
`.trim()
}

function appendStyleReferenceInstruction(prompt: string) {
  return `
${prompt}

STYLE REFERENCE USAGE:
- Use the attached reference image ONLY as an art-style guide.
- Borrow its premium clean manhua / webtoon quality, attractive faces, polished eyes, smooth hair rendering, bright color grading, soft commercial lighting, and high-end webnovel cover finish.
- Do NOT copy the reference character, outfit, pose, background, composition, identity, or exact scene.
- Create a completely new cover for the story in the prompt.
- Keep the story-specific setting, evidence object, conflict, and characters from the text prompt.
`.trim()
}

function extractImageData(json: any) {
  const first = json?.data?.[0]
  const b64 = first?.b64_json || first?.image_base64 || first?.base64

  if (!b64) {
    throw new Error('OpenAI image response missing b64_json')
  }

  return {
    b64: String(b64),
    revisedPrompt: typeof first?.revised_prompt === 'string' ? first.revised_prompt : undefined,
  }
}

async function readErrorResponse(response: Response) {
  const text = await response.text().catch(() => '')
  if (!text) return `OpenAI image request failed: ${response.status}`

  try {
    const json = JSON.parse(text)
    return json?.error?.message || json?.message || text
  } catch {
    return text
  }
}

async function moderatePromptOrThrow(prompt: string) {
  if (!OPENAI_API_KEY || !OPENAI_MODERATION_MODEL) return

  const response = await fetch('https://api.openai.com/v1/moderations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODERATION_MODEL,
      input: prompt.slice(0, 8000),
    }),
  })

  if (!response.ok) {
    const detail = await readErrorResponse(response)
    console.warn('[cover moderation] moderation request failed:', detail)
    return
  }

  const data = await response.json().catch(() => null)
  const first = data?.results?.[0]
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
    }

    error.detail = { categories, flaggedKeys }
    throw error
  }
}

async function fetchReferenceImage(styleReferenceUrl: string) {
  const normalizedUrl = normalizeUrl(styleReferenceUrl)

  if (!normalizedUrl) {
    throw new Error('Invalid style reference URL')
  }

  const response = await fetch(normalizedUrl)

  if (!response.ok) {
    throw new Error(
      `Failed to fetch cover style reference image: HTTP ${response.status}`,
    )
  }

  const arrayBuffer = await response.arrayBuffer()
  const contentType =
    response.headers.get('content-type')?.split(';')[0]?.trim() ||
    inferMimeTypeFromUrl(normalizedUrl)

  if (!contentType.startsWith('image/')) {
    throw new Error(`Style reference URL is not an image: ${contentType}`)
  }

  if (arrayBuffer.byteLength < 1024) {
    throw new Error('Style reference image is too small or empty')
  }

  return {
    blob: new Blob([arrayBuffer], { type: contentType }),
    fileName: inferFileNameFromUrl(normalizedUrl),
  }
}

async function requestTextOnlyImage(
  prompt: string,
  requestedQuality?: unknown,
): Promise<OpenAIImageResult> {
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
      n: 1,
      moderation: 'low',
    }),
  })

  if (!response.ok) {
    throw new Error(await readErrorResponse(response))
  }

  const data = await response.json()
  const image = extractImageData(data)

  return {
    b64: image.b64,
    promptUsed: safePrompt,
    revisedPrompt: image.revisedPrompt,
    imageQualityUsed: imageQuality,
  }
}

async function requestImageWithStyleReference(
  prompt: string,
  requestedQuality: unknown,
  styleReferenceUrl: string,
): Promise<OpenAIImageResult> {
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
  const reference = await fetchReferenceImage(styleReferenceUrl)
  const promptWithReference = appendStyleReferenceInstruction(safePrompt)

  await moderatePromptOrThrow(promptWithReference)

  const form = new FormData()
  form.append('model', OPENAI_IMAGE_MODEL)
  form.append('prompt', promptWithReference)
  form.append('size', OPENAI_IMAGE_SIZE)
  form.append('quality', imageQuality)
  form.append('n', '1')
  form.append('image', reference.blob, reference.fileName)

  const response = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: form,
  })

  if (!response.ok) {
    throw new Error(await readErrorResponse(response))
  }

  const data = await response.json()
  const image = extractImageData(data)

  return {
    b64: image.b64,
    promptUsed: promptWithReference,
    revisedPrompt: image.revisedPrompt,
    imageQualityUsed: imageQuality,
    styleReferenceUsed: true,
  }
}

async function requestBestEffortNoTextImage(
  prompt: string,
  requestedQuality?: unknown,
  options: GenerateCoverImageOptions = {},
): Promise<OpenAIImageResult> {
  const styleReferenceUrl = normalizeUrl(options.styleReferenceUrl)

  if (styleReferenceUrl) {
    try {
      return await requestImageWithStyleReference(
        appendNoTextInstruction(prompt),
        requestedQuality,
        styleReferenceUrl,
      )
    } catch (error: any) {
      console.warn(
        '[cover] style reference generation failed, falling back to text-only:',
        error?.message || error,
      )

      const textOnly = await requestTextOnlyImage(
        appendNoTextInstruction(prompt),
        requestedQuality,
      )

      return {
        ...textOnly,
        styleReferenceUsed: false,
        styleReferenceError: error?.message || 'Style reference generation failed',
      }
    }
  }

  return requestTextOnlyImage(appendNoTextInstruction(prompt), requestedQuality)
}

export async function generateCoverImage(
  prompt: string,
  fallbackPrompt: string,
  requestedQuality?: unknown,
  options: GenerateCoverImageOptions = {},
): Promise<OpenAIImageResult> {
  let primaryError: any = null
  let fallbackError: any = null

  try {
    return await requestBestEffortNoTextImage(prompt, requestedQuality, options)
  } catch (error: any) {
    primaryError = error

    console.error('[cover] primary image generation failed:', error?.message || error)

    try {
      const fallback = await requestBestEffortNoTextImage(
        fallbackPrompt || prompt,
        requestedQuality,
        options,
      )

      return {
        ...fallback,
        fallbackUsed: true,
        primaryError: primaryError?.message || 'Primary prompt failed',
      }
    } catch (fallbackFailure: any) {
      fallbackError = fallbackFailure

      console.error('[cover] fallback image generation failed:', fallbackFailure?.message || fallbackFailure)

      const emergencyPrompt = `
Create a premium vertical 2:3 Chinese manhua / Korean webtoon commercial webnovel cover.
Beautiful young modern female lead, attractive face, clean polished 2D illustration, bright soft cinematic lighting.
Show a dramatic modern urban story scene with visible environment, supporting characters, and a small evidence object.
No readable text, no title, no watermark, no logo.
`.trim()

      const result = await requestBestEffortNoTextImage(
        emergencyPrompt,
        requestedQuality,
        options,
      )

      return {
        ...result,
        promptUsed: (result as any).promptUsedOverride || result.promptUsed || emergencyPrompt,
        fallbackUsed: true,
        emergencyFallbackUsed: true,
        primaryError: primaryError?.message || 'Primary prompt failed',
        fallbackError: fallbackError?.message || 'Fallback prompt failed',
      }
    }
  }
}
