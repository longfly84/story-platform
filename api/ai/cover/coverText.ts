import type { JsonRecord } from './coverTypes.js'

export function safeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function safeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => safeString(item)).filter(Boolean)
}

export function parseMaybeJson<T = JsonRecord>(value: unknown): T | null {
  if (!value) return null
  if (typeof value === 'object') return value as T
  if (typeof value !== 'string') return null

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export function normalizeText(value: string): string {
  return safeString(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

export function uniqueStrings(list: string[], limit = 8): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const item of list) {
    const clean = safeString(item)
    const key = clean.toLowerCase()
    if (!clean || seen.has(key)) continue
    seen.add(key)
    result.push(clean)
    if (result.length >= limit) break
  }

  return result
}

export function hashString(input: string): number {
  let hash = 0
  const value = safeString(input)

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }

  return hash
}

export function pickVariant<T>(seed: string, variants: T[]): T {
  if (!variants.length) {
    throw new Error('pickVariant requires at least one variant')
  }

  return variants[hashString(seed) % variants.length]
}

export function stringifyUseful(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(stringifyUseful).filter(Boolean).join(' | ')

  if (typeof value === 'object') {
    const raw = value as JsonRecord
    return [
      raw.title,
      raw.corePremise,
      raw.openingScene,
      raw.incitingIncident,
      raw.evidenceObject,
      raw.mainConflict,
      raw.hiddenTruth,
      raw.setting,
      raw.villainType,
      raw.emotionalHook,
      raw.powerStructure,
      raw.publicPressure,
      raw.shortFingerprint,
    ]
      .map(stringifyUseful)
      .filter(Boolean)
      .join(' | ')
  }

  return ''
}

export function sanitizeFileName(input: string): string {
  return safeString(input)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 80)
}
