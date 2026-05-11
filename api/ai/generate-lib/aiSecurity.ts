type HeaderValue = string | string[] | undefined

type RequestLike = {
  headers?: Record<string, HeaderValue>
  socket?: {
    remoteAddress?: string
  }
}

type AIAdminAuthResult =
  | {
      ok: true
    }
  | {
      ok: false
      status: number
      body: {
        ok: false
        error: string
        detail?: string | null
      }
    }

type RateBucket = {
  count: number
  resetAt: number
}

const rateBuckets = new Map<string, RateBucket>()

function getHeader(req: RequestLike, name: string) {
  const headers = req.headers || {}
  const lowerName = name.toLowerCase()

  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() !== lowerName) continue

    if (Array.isArray(value)) {
      return String(value[0] || '').trim()
    }

    return String(value || '').trim()
  }

  return ''
}

function getClientIp(req: RequestLike) {
  const forwardedFor = getHeader(req, 'x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }

  const realIp = getHeader(req, 'x-real-ip')
  if (realIp) return realIp

  return req.socket?.remoteAddress || 'unknown'
}

function getBearerToken(req: RequestLike) {
  const authorization = getHeader(req, 'authorization')
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || ''
}

function getRequestToken(req: RequestLike) {
  return getHeader(req, 'x-ai-admin-token') || getBearerToken(req)
}

function safeTokenEqual(input: string, expected: string) {
  const a = String(input || '')
  const b = String(expected || '')

  if (!a || !b) return false
  if (a.length !== b.length) return false

  let diff = 0
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index)
  }

  return diff === 0
}

function checkRateLimit(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now()
  const current = rateBuckets.get(key)

  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    })

    return true
  }

  current.count += 1

  if (current.count > maxRequests) {
    return false
  }

  return true
}

export function verifyAIAdminRequest(
  req: RequestLike,
  options?: {
    routeName?: string
    maxRequestsPerWindow?: number
    windowMs?: number
  },
): AIAdminAuthResult {
  const expectedToken = String(process.env.AI_ADMIN_TOKEN || '').trim()

  if (!expectedToken) {
    return {
      ok: false,
      status: 500,
      body: {
        ok: false,
        error: 'Missing AI_ADMIN_TOKEN',
        detail:
          'Set AI_ADMIN_TOKEN in Vercel Environment Variables, then redeploy.',
      },
    }
  }

  const requestToken = getRequestToken(req)

  if (!safeTokenEqual(requestToken, expectedToken)) {
    return {
      ok: false,
      status: 401,
      body: {
        ok: false,
        error: 'Unauthorized',
      },
    }
  }

  const routeName = options?.routeName || 'ai'
  const windowMs = options?.windowMs ?? 60_000
  const maxRequests = options?.maxRequestsPerWindow ?? 20
  const clientIp = getClientIp(req)
  const rateKey = `${routeName}:${clientIp}:${requestToken.slice(0, 8)}`

  if (!checkRateLimit(rateKey, maxRequests, windowMs)) {
    return {
      ok: false,
      status: 429,
      body: {
        ok: false,
        error: 'Too many requests',
        detail: 'AI API rate limit exceeded. Please wait and try again.',
      },
    }
  }

  return {
    ok: true,
  }
}