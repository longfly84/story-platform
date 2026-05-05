export function safeText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

export function safeNumber(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }

  return fallback
}

export function safeStringArray(value: unknown, limit = 30) {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => safeText(item))
    .filter(Boolean)
    .slice(0, limit)
}

export function compactText(value: string, limit = 6000) {
  const clean = safeText(value)
  if (clean.length <= limit) return clean
  return `${clean.slice(0, limit)}
...[đã rút gọn ${clean.length - limit} ký tự]`
}
