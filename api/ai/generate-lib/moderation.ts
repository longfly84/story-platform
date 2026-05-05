const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const OPENAI_MODERATION_MODEL = process.env.OPENAI_MODERATION_MODEL || 'omni-moderation-latest'

type ModerationResult = {
  ok: boolean
  flagged: boolean
  blocked: boolean
  reason: string | null
  categories: Record<string, boolean>
  categoryScores: Record<string, number>
  raw: any
}

const SOFT_ALLOWED_CATEGORIES = new Set([
  'violence',
])

const HARD_BLOCK_CATEGORIES = new Set([
  'sexual/minors',
  'self-harm',
  'self-harm/intent',
  'self-harm/instructions',
  'violence/graphic',
  'hate/threatening',
  'harassment/threatening',
])

function buildFlagReason(categories: Record<string, boolean>) {
  const flaggedKeys = Object.entries(categories)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => key)

  if (!flaggedKeys.length) {
    return null
  }

  return `Flagged categories: ${flaggedKeys.join(', ')}`
}

function shouldBlockModeration(categories: Record<string, boolean>) {
  const flaggedKeys = Object.entries(categories)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => key)

  if (!flaggedKeys.length) return false

  const hasHardBlock = flaggedKeys.some((key) => HARD_BLOCK_CATEGORIES.has(key))
  if (hasHardBlock) return true

  const onlySoftAllowed = flaggedKeys.every((key) => SOFT_ALLOWED_CATEGORIES.has(key))
  if (onlySoftAllowed) return false

  return true
}

async function requestModeration(input: string) {
  if (!OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY')
  }

  const response = await fetch('https://api.openai.com/v1/moderations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODERATION_MODEL,
      input,
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

  return data
}

export async function moderateText(input: string): Promise<ModerationResult> {
  const safeInput = String(input || '').trim()

  if (!safeInput) {
    return {
      ok: true,
      flagged: false,
      blocked: false,
      reason: null,
      categories: {},
      categoryScores: {},
      raw: null,
    }
  }

  const data = await requestModeration(safeInput)
  const first = data?.results?.[0] || {}
  const flagged = Boolean(first?.flagged)
  const categories = (first?.categories || {}) as Record<string, boolean>
  const categoryScores = (first?.category_scores || {}) as Record<string, number>
  const reason = buildFlagReason(categories)
  const blocked = shouldBlockModeration(categories)

  return {
    ok: !blocked,
    flagged,
    blocked,
    reason,
    categories,
    categoryScores,
    raw: data,
  }
}

export async function moderateTextOrThrow(input: string, contextLabel = 'text') {
  const result = await moderateText(input)

  if (result.flagged && !result.blocked) {
    console.warn(
      `[moderation] ${contextLabel} flagged but allowed. ${result.reason || ''}`,
    )
  }

  if (!result.ok) {
    const error = new Error(
      `[moderation] ${contextLabel} blocked. ${
        result.reason || 'Content blocked by moderation.'
      }`,
    ) as Error & {
      detail?: unknown
      flagged?: boolean
      blocked?: boolean
      categories?: Record<string, boolean>
      categoryScores?: Record<string, number>
    }

    error.detail = result.raw
    error.flagged = result.flagged
    error.blocked = result.blocked
    error.categories = result.categories
    error.categoryScores = result.categoryScores

    throw error
  }

  return result
}