import type {
  StoryMotifFingerprint,
  StoryMotifRegistryItem,
  StoryMotifSimilarityResult,
} from '../aiFactoryTypes'

function safeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeText(value: unknown) {
  return safeText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[_\-]+/g, ' ')
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function sameField(a: unknown, b: unknown) {
  const left = normalizeText(a)
  const right = normalizeText(b)

  return Boolean(left && right && left === right)
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

function normalizeTag(tag: unknown) {
  return normalizeText(tag)
}

function isUsefulTag(tag: string) {
  if (!tag) return false
  if (tag.length < 3) return false

  // Các tag này quá chung trong tiếng Việt/Trung Quốc hiện đại, nếu tính vào similarity
  // sẽ làm nhiều truyện khác nhau bị reject nhầm vì cùng vibe/ngôn ngữ.
  const noisyTags = new Set([
    'anh',
    'chi',
    'co',
    'toi',
    'nguoi',
    'mot',
    'hai',
    'ba',
    'trong',
    'ngoai',
    'dung',
    'hinh',
    'trung',
    'luan',
    'huynh',
    'chinh',
    'buoi',
    'hang',
    'thoi',
    'dau',
    'sau',
    'truoc',
    'den',
    'voi',
    'cua',
    'cho',
    'khi',
    'neu',
  ])

  return !noisyTags.has(tag)
}

function getNormalizedTagSet(tags?: string[]) {
  return new Set((tags || []).map(normalizeTag).filter(isUsefulTag))
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

  // Fix quan trọng:
  // Trước đây các field rất chung như openingArena/mainArena/powerStructure/deadlineStyle
  // có trọng số khá cao nên seed mới dễ bị reject dù chỉ cùng "khung nữ tần đô thị".
  // Bản này ưu tiên các field thật sự định danh motif: premise, inciting, evidence,
  // hidden truth. Các field chung vẫn tính nhưng nhẹ hơn.
  const weightedFields: Array<[keyof StoryMotifFingerprint, number]> = [
    ['premiseFamily', 4],
    ['incitingIncident', 5],
    ['evidenceType', 5],
    ['hiddenTruthType', 5],
    ['villainAttackType', 3],
    ['heroineCounterType', 3],
    ['publicPressure', 2],
    ['openingArena', 1.5],
    ['mainArena', 1.5],
    ['powerStructure', 1.5],
    ['deadlineStyle', 1],
  ]

  for (const [field, weight] of weightedFields) {
    max += weight

    if (sameField(candidate[field], existing[field])) {
      score += weight
      matchedFields.push(String(field))
    }
  }

  const candidateTags = getNormalizedTagSet(candidate.antiRepeatTags)
  const existingTags = getNormalizedTagSet(existing.antiRepeatTags)
  const matchedTags = [...candidateTags].filter((tag) => existingTags.has(tag))

  const tagMax = Math.max(candidateTags.size, existingTags.size, 1)
  const tagScore = matchedTags.length / tagMax

  const fieldScore = max > 0 ? score / max : 0

  return {
    score: clampScore(fieldScore * 0.9 + tagScore * 0.1),
    matchedFields,
    matchedTags,
  }
}

function countMatchedFields(result: StoryMotifSimilarityResult | null, fields: string[]) {
  if (!result) return 0
  const matched = new Set(result.matchedFields)
  return fields.filter((field) => matched.has(field)).length
}

function hasRealMotifOverlap(result: StoryMotifSimilarityResult | null) {
  if (!result) return false

  const coreFields = [
    'premiseFamily',
    'incitingIncident',
    'evidenceType',
    'hiddenTruthType',
  ]

  const tacticalFields = [
    'villainAttackType',
    'heroineCounterType',
    'publicPressure',
  ]

  const coreMatches = countMatchedFields(result, coreFields)
  const tacticalMatches = countMatchedFields(result, tacticalFields)

  // Trùng nhiều field chung như openingArena/mainArena/deadlineStyle chưa đủ để gọi là trùng motif.
  // Phải có overlap ở lõi sự kiện/vật chứng/bí mật hoặc combo chiến thuật rất giống.
  return coreMatches >= 2 || (coreMatches >= 1 && tacticalMatches >= 2) || tacticalMatches >= 3
}

export function getHybridMotifSimilarity(params: {
  candidate: StoryMotifRegistryItem
  existing: StoryMotifRegistryItem
  fieldWeight?: number
  embeddingWeight?: number
}) {
  const fieldWeight = params.fieldWeight ?? 0.76
  const embeddingWeight = params.embeddingWeight ?? 0.24

  const fieldResult = getMotifFieldSimilarity(
    params.candidate.fingerprint,
    params.existing.fingerprint,
  )

  const rawEmbeddingScore = cosineSimilarity(params.candidate.embedding, params.existing.embedding)

  const embeddingScore = clampScore(
    rawEmbeddingScore > 0 && Number.isFinite(rawEmbeddingScore) ? rawEmbeddingScore : 0,
  )

  const hasEmbedding =
    Array.isArray(params.candidate.embedding) &&
    Array.isArray(params.existing.embedding) &&
    params.candidate.embedding.length > 0 &&
    params.candidate.embedding.length === params.existing.embedding.length

  const hybridScore = hasEmbedding
    ? clampScore(fieldResult.score * fieldWeight + embeddingScore * embeddingWeight)
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
  const threshold = params.threshold ?? 0.7
  const best = findMostSimilarMotif({
    candidate: params.candidate,
    existing: params.existing,
  })

  const realMotifOverlap = hasRealMotifOverlap(best)

  // Reject chính: điểm hybrid cao và phải có overlap thật ở lõi motif.
  const hybridReject = Boolean(best && realMotifOverlap && best.hybridScore >= threshold)

  // Reject phụ: nếu field đã rất giống thì reject dù embedding không quá cao.
  const strongFieldReject = Boolean(best && best.fieldScore >= 0.68 && realMotifOverlap)

  // Embedding của các truyện cùng thể loại nữ tần rất dễ cao 0.88–0.93.
  // Vì vậy không reject chỉ vì embedding cao nữa. Phải đi kèm field overlap rõ.
  const strongEmbeddingReject = Boolean(
    best && best.embeddingScore >= 0.94 && best.fieldScore >= 0.35 && realMotifOverlap,
  )
  const softEmbeddingReject = Boolean(
    best && best.embeddingScore >= 0.9 && best.fieldScore >= 0.45 && realMotifOverlap,
  )

  const reject = hybridReject || strongFieldReject || strongEmbeddingReject || softEmbeddingReject

  let reason = ''
  if (hybridReject) {
    reason = `hybridScore >= ${threshold} và có overlap motif lõi`
  } else if (strongFieldReject) {
    reason = 'fieldScore >= 0.68 và có overlap motif lõi'
  } else if (strongEmbeddingReject) {
    reason = 'embeddingScore >= 0.94, fieldScore >= 0.35 và có overlap motif lõi'
  } else if (softEmbeddingReject) {
    reason = 'embeddingScore >= 0.90, fieldScore >= 0.45 và có overlap motif lõi'
  }

  return {
    reject,
    threshold,
    best,
    reason,
  }
}

export function formatMotifSimilarityForLog(result: StoryMotifSimilarityResult | null) {
  if (!result) return 'Không có motif cũ để so sánh.'

  const hybridPercent = Math.round(result.hybridScore * 100)
  const fieldPercent = Math.round(result.fieldScore * 100)
  const embeddingPercent = Math.round(result.embeddingScore * 100)
  const title = result.item.title || 'Truyện cũ chưa có tên'
  const fields = result.matchedFields.length
    ? result.matchedFields.join(', ')
    : 'không trùng field mạnh'
  const tags = result.matchedTags.length ? result.matchedTags.join(', ') : 'không trùng tag hữu ích'
  const overlap = hasRealMotifOverlap(result) ? 'có overlap motif lõi' : 'chỉ giống vibe/field chung'

  return `Giống hybrid ${hybridPercent}% với "${title}". Field ${fieldPercent}%, embedding ${embeddingPercent}%, ${overlap}. Field trùng: ${fields}. Tag trùng: ${tags}.`
}
