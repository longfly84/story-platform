import type {
  StoryMotifFingerprint,
  StoryMotifRegistryItem,
  StoryMotifSimilarityResult,
} from '../aiFactoryTypes'

function safeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function sameField(a: unknown, b: unknown) {
  const left = safeText(a)
  const right = safeText(b)

  return Boolean(left && right && left === right)
}

export function cosineSimilarity(a?: number[] | null, b?: number[] | null) {
  if (!Array.isArray(a) || !Array.isArray(b)) return 0
  if (!a.length || !b.length || a.length !== b.length) return 0

  let dot = 0
  let normA = 0
  let normB = 0

  for (let index = 0; index < a.length; index += 1) {
    const left = Number(a[index])
    const right = Number(b[index])

    if (!Number.isFinite(left) || !Number.isFinite(right)) return 0

    dot += left * right
    normA += left * left
    normB += right * right
  }

  if (!normA || !normB) return 0

  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

export function getMotifFieldSimilarity(
  candidate: StoryMotifFingerprint,
  existing: StoryMotifFingerprint,
) {
  let score = 0
  let max = 0
  const matchedFields: string[] = []

  const weightedFields: Array<[keyof StoryMotifFingerprint, number]> = [
    ['premiseFamily', 4],
    ['openingArena', 3],
    ['incitingIncident', 3],
    ['evidenceType', 4],
    ['villainAttackType', 4],
    ['heroineCounterType', 3],
    ['powerStructure', 3],
    ['publicPressure', 2],
    ['hiddenTruthType', 4],
    ['mainArena', 2],
    ['deadlineStyle', 2],
  ]

  for (const [field, weight] of weightedFields) {
    max += weight

    if (sameField(candidate[field], existing[field])) {
      score += weight
      matchedFields.push(String(field))
    }
  }

  const candidateTags = new Set(candidate.antiRepeatTags || [])
  const existingTags = new Set(existing.antiRepeatTags || [])
  const matchedTags = [...candidateTags].filter((tag) => existingTags.has(tag))

  const tagMax = Math.max(candidateTags.size, existingTags.size, 1)
  const tagScore = matchedTags.length / tagMax

  const fieldScore = max > 0 ? score / max : 0

  return {
    score: fieldScore * 0.82 + tagScore * 0.18,
    matchedFields,
    matchedTags,
  }
}

export function getHybridMotifSimilarity(params: {
  candidate: StoryMotifRegistryItem
  existing: StoryMotifRegistryItem
  fieldWeight?: number
  embeddingWeight?: number
}) {
  const fieldWeight = params.fieldWeight ?? 0.65
  const embeddingWeight = params.embeddingWeight ?? 0.35

  const fieldResult = getMotifFieldSimilarity(
    params.candidate.fingerprint,
    params.existing.fingerprint,
  )

  const rawEmbeddingScore = cosineSimilarity(params.candidate.embedding, params.existing.embedding)

  const embeddingScore =
    rawEmbeddingScore > 0 && Number.isFinite(rawEmbeddingScore) ? rawEmbeddingScore : 0

  const hasEmbedding =
    Array.isArray(params.candidate.embedding) &&
    Array.isArray(params.existing.embedding) &&
    params.candidate.embedding.length > 0 &&
    params.candidate.embedding.length === params.existing.embedding.length

  const hybridScore = hasEmbedding
    ? fieldResult.score * fieldWeight + embeddingScore * embeddingWeight
    : fieldResult.score

  const result: StoryMotifSimilarityResult = {
    item: params.existing,
    fieldScore: fieldResult.score,
    embeddingScore,
    hybridScore,
    matchedFields: fieldResult.matchedFields,
    matchedTags: fieldResult.matchedTags,
  }

  return result
}

export function findMostSimilarMotif(params: {
  candidate: StoryMotifRegistryItem
  existing: StoryMotifRegistryItem[]
  fieldWeight?: number
  embeddingWeight?: number
}) {
  let best: StoryMotifSimilarityResult | null = null

  for (const item of params.existing) {
    const result = getHybridMotifSimilarity({
      candidate: params.candidate,
      existing: item,
      fieldWeight: params.fieldWeight,
      embeddingWeight: params.embeddingWeight,
    })

    if (!best || result.hybridScore > best.hybridScore) {
      best = result
    }
  }

  return best
}

export function shouldRejectMotif(params: {
  candidate: StoryMotifRegistryItem
  existing: StoryMotifRegistryItem[]
  threshold?: number
}) {
  const threshold = params.threshold ?? 0.62
  const best = findMostSimilarMotif({
    candidate: params.candidate,
    existing: params.existing,
  })

  return {
    reject: Boolean(best && best.hybridScore >= threshold),
    threshold,
    best,
  }
}

export function formatMotifSimilarityForLog(result: StoryMotifSimilarityResult | null) {
  if (!result) return 'Không có motif cũ để so sánh.'

  const percent = Math.round(result.hybridScore * 100)
  const title = result.item.title || 'Truyện cũ chưa có tên'
  const fields = result.matchedFields.length
    ? result.matchedFields.join(', ')
    : 'không trùng field mạnh'
  const tags = result.matchedTags.length ? result.matchedTags.join(', ') : 'không trùng tag'

  return `Giống ${percent}% với "${title}". Field trùng: ${fields}. Tag trùng: ${tags}.`
}