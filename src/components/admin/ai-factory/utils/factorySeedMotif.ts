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
    threshold: 0.62,
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
    const rawSeed = buildMockStorySeed({
      genreLabel: params.genreLabel,
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

  throw new Error(
    `Không tạo được story seed đủ khác motif sau ${STORY_SEED_MAX_ATTEMPTS} lần. ${
      lastRejected?.rejectResult.best
        ? formatMotifSimilarityForLog(lastRejected.rejectResult.best)
        : ''
    }`,
  )
}
