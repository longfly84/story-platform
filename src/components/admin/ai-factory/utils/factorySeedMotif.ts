import type {
  AIFactoryConfig,
  AvoidLibrary,
  FactoryLog,
  FactoryStorySeed,
  StoryMotifRegistryItem,
} from '../aiFactoryTypes'
import { buildMockStorySeed } from '../aiFactoryUtils'
import { attachMotifToSeed } from './motifFingerprint'
import {
  formatMotifSimilarityForLog,
  shouldRejectMotif,
} from './motifSimilarity'

export const STORY_SEED_MAX_ATTEMPTS = 10

type AddFactoryLog = (message: string, type?: FactoryLog['type']) => void


type ForcedDivergenceProfile = {
  key: string
  label: string
  avoidPremise?: string[]
  avoidEvidence?: string[]
}

const FORCED_DIVERGENCE_PROFILES: ForcedDivergenceProfile[] = [
  {
    key: 'child-school-life',
    label: 'trường học / phụ huynh / đứa trẻ bị kéo vào áp lực người lớn / vật chứng là đồ trẻ em hoặc hồ sơ nhập học',
    avoidPremise: ['school_child_pressure', 'child_identity_or_custody'],
    avoidEvidence: ['school_record', 'child_object_clue'],
  },
  {
    key: 'hospital-human-witness',
    label: 'bệnh viện / nhân chứng y tế / lịch hẹn khám / người yếu thế bị ép im lặng / phản công bằng lời khai người thật',
    avoidPremise: ['medical_or_identity_secret'],
    avoidEvidence: ['dna_or_medical_test', 'schedule_or_timeline_clue'],
  },
  {
    key: 'family-banquet-token',
    label: 'gia tộc / bàn tiệc gia đình / tín vật cá nhân / người thân phản bội / phản công bằng kỷ vật và nhân chứng trong nhà',
    avoidPremise: ['wealthy_family_pressure'],
    avoidEvidence: ['personal_jewelry_or_token', 'letter_or_diary_clue'],
  },
  {
    key: 'creative-industry-trace',
    label: 'giới thiết kế / hậu trường studio / dấu vết trên váy áo hoặc băng gạc / bị cướp công sáng tạo / phản công bằng thói quen nghề nghiệp',
    avoidPremise: ['creative_industry_identity_or_credit_theft'],
    avoidEvidence: ['physical_trace_on_object', 'photo_or_art_clue'],
  },
  {
    key: 'hotel-service-clue',
    label: 'khách sạn / dịch vụ phòng / phiếu gửi đồ / thẻ phòng / lời khai nhân viên lễ tân / phản công bằng chi tiết dịch vụ nhỏ',
    avoidPremise: ['hotel_private_setup_or_betrayal'],
    avoidEvidence: ['access_card_or_room_key', 'receipt_ticket_or_delivery_clue'],
  },
  {
    key: 'community-cafe-witness',
    label: 'quán cà phê / nhà hàng riêng / cuộc gặp bị hiểu sai / nhân chứng đời thường / phản công bằng thói quen và ký ức cũ',
    avoidPremise: ['urban_drama'],
    avoidEvidence: ['contextual_life_clue', 'receipt_ticket_or_delivery_clue'],
  },
  {
    key: 'art-gallery-memory',
    label: 'phòng tranh / triển lãm / ảnh cũ hoặc bức tranh che chữ ký / bí mật thân phận trong giới nghệ thuật',
    avoidPremise: ['creative_industry_identity_or_credit_theft'],
    avoidEvidence: ['photo_or_art_clue', 'letter_or_diary_clue'],
  },
  {
    key: 'airport-timeline',
    label: 'sân bay / nhà ga cao tốc / lịch trình di chuyển / người định bỏ trốn / phản công bằng mốc thời gian lệch',
    avoidEvidence: ['travel_record', 'schedule_or_timeline_clue'],
  },
]

function safeFingerprintValue(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function chooseForcedDivergenceProfile(params: {
  attempt: number
  lastRejected: Awaited<ReturnType<typeof evaluateStorySeedMotif>> | null
}) {
  const bestFingerprint = params.lastRejected?.rejectResult.best?.item?.fingerprint
  const candidateFingerprint = params.lastRejected?.seed.motifFingerprint
  const blockedPremise = [
    safeFingerprintValue(bestFingerprint?.premiseFamily),
    safeFingerprintValue(candidateFingerprint?.premiseFamily),
  ].filter(Boolean)
  const blockedEvidence = [
    safeFingerprintValue(bestFingerprint?.evidenceType),
    safeFingerprintValue(candidateFingerprint?.evidenceType),
  ].filter(Boolean)

  const pool = FORCED_DIVERGENCE_PROFILES.filter((profile) => {
    const premiseHit = (profile.avoidPremise || []).some((item) => blockedPremise.includes(item))
    const evidenceHit = (profile.avoidEvidence || []).some((item) => blockedEvidence.includes(item))
    return !premiseHit && !evidenceHit
  })

  const candidates = pool.length ? pool : FORCED_DIVERGENCE_PROFILES
  return candidates[(params.attempt - 1) % candidates.length]
}

function buildAttemptGenreLabel(params: {
  baseGenreLabel: string
  attempt: number
  lastRejected: Awaited<ReturnType<typeof evaluateStorySeedMotif>> | null
}) {
  if (params.attempt <= 3) return params.baseGenreLabel

  const profile = chooseForcedDivergenceProfile({
    attempt: params.attempt,
    lastRejected: params.lastRejected,
  })

  // Đưa divergence profile lên đầu để factoryStorySeed lấy nó làm genre atom chính.
  // Genre gốc vẫn giữ ở sau để không mất vibe nữ tần người dùng chọn.
  return `${profile.label} / ${params.baseGenreLabel}`
}

async function embedMotifTexts(texts: string[]) {
  const cleanTexts = texts.map((text) => text.trim()).filter(Boolean)

  if (!cleanTexts.length) return []

  const response = await fetch('/api/ai/embed-motif', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts: cleanTexts }),
  })

  const rawText = await response.text()
  let data: any = null

  try {
    data = rawText ? JSON.parse(rawText) : null
  } catch {
    throw new Error(
      `Embed motif trả về không phải JSON. Status: ${response.status}. Preview: ${rawText.slice(0, 180)}`,
    )
  }

  if (!response.ok) {
    throw new Error(data?.error || `Embed motif lỗi HTTP ${response.status}`)
  }

  const embeddings = Array.isArray(data?.embeddings) ? data.embeddings : []

  return embeddings.filter(Array.isArray) as number[][]
}

async function evaluateStorySeedMotif(params: {
  seed: FactoryStorySeed
  existingMotifs: StoryMotifRegistryItem[]
  provider: AIFactoryConfig['provider']
  addLog: AddFactoryLog
}) {
  const enrichedSeed = attachMotifToSeed(params.seed)

  const candidate: StoryMotifRegistryItem = {
    title: enrichedSeed.title,
    fingerprint: enrichedSeed.motifFingerprint!,
    motifText: enrichedSeed.motifText || enrichedSeed.shortFingerprint,
    source: 'generated',
  }

  const comparisonPool = params.existingMotifs.slice(0, 40)

  if (params.provider === 'openai' && comparisonPool.length > 0) {
    try {
      const textsToEmbed = [
        candidate.motifText,
        ...comparisonPool.map((item) => item.motifText).filter(Boolean),
      ]

      const embeddings = await embedMotifTexts(textsToEmbed)

      candidate.embedding = embeddings[0]

      comparisonPool.forEach((item, index) => {
        if (!item.embedding && embeddings[index + 1]) {
          item.embedding = embeddings[index + 1]
        }
      })

      enrichedSeed.motifEmbedding = candidate.embedding
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      params.addLog(`Embedding motif lỗi, fallback sang field similarity: ${message}`, 'warning')
    }
  }

  const rejectResult = shouldRejectMotif({
    candidate,
    existing: comparisonPool,
    threshold: 0.72,
  })

  enrichedSeed.motifSimilarity = rejectResult.best

  return {
    seed: enrichedSeed,
    candidate,
    rejectResult,
  }
}

export async function buildUniqueStorySeed(params: {
  genreLabel: string
  heroineLabel: string
  avoidLibrary: AvoidLibrary
  factoryRunId: string
  storyIndex: number
  premiseSeed: string
  provider: AIFactoryConfig['provider']
  addLog: AddFactoryLog
}) {
  const existingMotifs = params.avoidLibrary.motifFingerprints || []
  let lastRejected: Awaited<ReturnType<typeof evaluateStorySeedMotif>> | null = null
  const rejectedHints: string[] = []

  for (let attempt = 1; attempt <= STORY_SEED_MAX_ATTEMPTS; attempt += 1) {
    const retryHint = rejectedHints.slice(-3).join('__avoid__')
    const attemptGenreLabel = buildAttemptGenreLabel({
      baseGenreLabel: params.genreLabel,
      attempt,
      lastRejected,
    })

    if (attempt === 4 || attempt === 7) {
      params.addLog(
        `Forced divergence mode attempt ${attempt}/${STORY_SEED_MAX_ATTEMPTS}: đổi trục seed sang "${attemptGenreLabel.split(' / ')[0]}"`,
        'info',
      )
    }

    const rawSeed = buildMockStorySeed({
      genreLabel: attemptGenreLabel,
      heroineLabel: params.heroineLabel,
      avoidLibrary: params.avoidLibrary,
      seed: `${params.factoryRunId}-${params.storyIndex}-${params.premiseSeed}-motif-${attempt}-${retryHint}`,
    })

    const evaluated = await evaluateStorySeedMotif({
      seed: rawSeed,
      existingMotifs,
      provider: params.provider,
      addLog: params.addLog,
    })

    if (!evaluated.rejectResult.reject) {
      if (evaluated.rejectResult.best) {
        params.addLog(
          `Motif check pass attempt ${attempt}/${STORY_SEED_MAX_ATTEMPTS}: ${formatMotifSimilarityForLog(evaluated.rejectResult.best)}`,
          'success',
        )
      } else {
        params.addLog(
          `Motif check pass attempt ${attempt}/${STORY_SEED_MAX_ATTEMPTS}: chưa có motif cũ đủ dữ liệu để so.`,
          'success',
        )
      }

      return evaluated.seed
    }

    lastRejected = evaluated

    const best = evaluated.rejectResult.best
    const fingerprint = evaluated.seed.motifFingerprint
    rejectedHints.push(
      [
        best?.item?.title || 'unknown-title',
        fingerprint?.premiseFamily,
        fingerprint?.evidenceType,
        fingerprint?.hiddenTruthType,
        fingerprint?.openingArena,
        fingerprint?.mainArena,
        fingerprint?.villainAttackType,
        fingerprint?.heroineCounterType,
        fingerprint?.powerStructure,
        fingerprint?.publicPressure,
        fingerprint?.deadlineStyle,
      ]
        .filter(Boolean)
        .join('|'),
    )

    params.addLog(
      `Reject story seed attempt ${attempt}/${STORY_SEED_MAX_ATTEMPTS} vì motif quá giống: ${formatMotifSimilarityForLog(
        evaluated.rejectResult.best,
      )}`,
      'warning',
    )
  }

  const best = lastRejected?.rejectResult.best
  if (
    lastRejected?.seed &&
    best &&
    best.fieldScore < 0.65 &&
    best.embeddingScore < 0.95
  ) {
    params.addLog(
      `Cho pass seed cuối vì field motif đã khác đủ; embedding cao chủ yếu do cùng vibe nữ tần đô thị: ${formatMotifSimilarityForLog(
        best,
      )}`,
      'warning',
    )
    return lastRejected.seed
  }

  throw new Error(
    `Không tạo được story seed đủ khác motif sau ${STORY_SEED_MAX_ATTEMPTS} lần. ${
      best ? formatMotifSimilarityForLog(best) : ''
    }`,
  )
}
