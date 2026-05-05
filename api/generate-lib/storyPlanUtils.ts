import type { FactoryStoryPlan, FactoryStoryPlanChapter, FactoryStorySeed, StoryMotifFingerprint } from './types'
import { safeNumber, safeStringArray, safeText } from './textUtils'

export function normalizeMotifFingerprint(value: unknown): StoryMotifFingerprint | undefined {
  if (!value || typeof value !== 'object') return undefined

  const raw = value as Record<string, unknown>

  return {
    premiseFamily: safeText(raw.premiseFamily),
    openingArena: safeText(raw.openingArena),
    incitingIncident: safeText(raw.incitingIncident),
    evidenceType: safeText(raw.evidenceType),
    evidenceObject: safeText(raw.evidenceObject),
    villainAttackType: safeText(raw.villainAttackType),
    heroineCounterType: safeText(raw.heroineCounterType),
    powerStructure: safeText(raw.powerStructure),
    publicPressure: safeText(raw.publicPressure),
    emotionalWound: safeText(raw.emotionalWound),
    hiddenTruthType: safeText(raw.hiddenTruthType),
    mainArena: safeText(raw.mainArena),
    secondaryArena: safeText(raw.secondaryArena),
    relationshipCore: safeText(raw.relationshipCore),
    twistEngine: safeText(raw.twistEngine),
    deadlineStyle: safeText(raw.deadlineStyle),
    endingPromise: safeText(raw.endingPromise),
    antiRepeatTags: safeStringArray(raw.antiRepeatTags, 24),
    fingerprint: safeText(raw.fingerprint),
  }
}

export function normalizeMotifFingerprintArray(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => normalizeMotifFingerprint(item))
    .filter((item): item is StoryMotifFingerprint => Boolean(item))
    .slice(0, 80)
}


export function normalizeStoryPlan(value: unknown): FactoryStoryPlan | undefined {
  if (!value || typeof value !== 'object') return undefined

  const raw = value as Record<string, unknown>
  const rawChapters = Array.isArray(raw.chapterPlan) ? raw.chapterPlan : []

  const chapterPlan = rawChapters
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const chapter = item as Record<string, unknown>
      const chapterNumber = safeNumber(chapter.chapterNumber, 0)
      if (!chapterNumber) return null

      return {
        chapterNumber,
        title: safeText(chapter.title),
        mission: safeText(chapter.mission),
        sceneType: safeText(chapter.sceneType),
        mainScene: safeText(chapter.mainScene),
        evidenceBeat: safeText(chapter.evidenceBeat),
        villainBeat: safeText(chapter.villainBeat),
        heroineMove: safeText(chapter.heroineMove),
        emotionalBeat: safeText(chapter.emotionalBeat),
        powerShift: safeText(chapter.powerShift),
        endingHook: safeText(chapter.endingHook),
      }
    })
    .filter((item): item is FactoryStoryPlanChapter => Boolean(item))
    .slice(0, 24)

  const plan: FactoryStoryPlan = {
    plannerVersion: safeText(raw.plannerVersion),
    totalPlannedChapters: safeNumber(raw.totalPlannedChapters, chapterPlan.length || 0),
    plannerGoal: safeText(raw.plannerGoal),
    evidencePlan: safeStringArray(raw.evidencePlan, 20),
    villainCurve: safeStringArray(raw.villainCurve, 20),
    payoffPlan: safeStringArray(raw.payoffPlan, 20),
    chapterPlan,
  }

  return plan.chapterPlan?.length || plan.evidencePlan?.length || plan.villainCurve?.length
    ? plan
    : undefined
}

export function formatStoryPlanForPrompt(plan?: FactoryStoryPlan, currentChapter?: number, targetChapters?: number) {
  if (!plan?.chapterPlan?.length) return ''

  const chapterNumber = Math.max(1, currentChapter || 1)
  const target = Math.max(1, targetChapters || plan.totalPlannedChapters || plan.chapterPlan.length)
  const currentPlan =
    plan.chapterPlan.find((chapter) => chapter.chapterNumber === chapterNumber) ||
    plan.chapterPlan[Math.min(chapterNumber - 1, plan.chapterPlan.length - 1)]
  const previousPlan = plan.chapterPlan.find((chapter) => chapter.chapterNumber === chapterNumber - 1)
  const nextPlan = plan.chapterPlan.find((chapter) => chapter.chapterNumber === chapterNumber + 1)

  const compactPlan = plan.chapterPlan
    .filter((chapter) => {
      if (chapter.chapterNumber <= 2) return true
      if (chapter.chapterNumber === chapterNumber) return true
      if (chapter.chapterNumber === chapterNumber - 1) return true
      if (chapter.chapterNumber === chapterNumber + 1) return true
      if (chapter.chapterNumber === target) return true
      if (chapter.chapterNumber >= Math.max(1, target - 1) && chapter.chapterNumber <= target) return true
      return false
    })
    .map((chapter) => {
      const marker = chapter.chapterNumber === chapterNumber ? ' <= CHƯƠNG ĐANG VIẾT' : ''
      return `Chương ${chapter.chapterNumber}${marker}: ${chapter.title} | Mission: ${chapter.mission} | Power shift: ${chapter.powerShift}`
    })
    .join('\n')

  const evidencePlan = plan.evidencePlan?.map((item) => `- ${item}`).join('\n') || '- Không có'
  const villainCurve = plan.villainCurve?.map((item) => `- ${item}`).join('\n') || '- Không có'
  const payoffPlan = plan.payoffPlan?.map((item) => `- ${item}`).join('\n') || '- Không có'

  return `
STORY PLANNER V1 — BẮT BUỘC BÁM OUTLINE:
- Planner version: ${plan.plannerVersion || 'story-planner-v1'}
- Target chương hiện tại: ${chapterNumber}/${target}
- Planner goal: ${plan.plannerGoal || 'Giữ outline, evidence plan, villain curve và payoff.'}

CHAPTER MISSION LOCK THEO PLANNER:
- Title: ${currentPlan?.title || 'Không có'}
- Mission: ${currentPlan?.mission || 'Không có'}
- Scene type: ${currentPlan?.sceneType || 'Không có'}
- Main scene: ${currentPlan?.mainScene || 'Không có'}
- Evidence beat: ${currentPlan?.evidenceBeat || 'Không có'}
- Villain beat: ${currentPlan?.villainBeat || 'Không có'}
- Heroine move: ${currentPlan?.heroineMove || 'Không có'}
- Emotional beat: ${currentPlan?.emotionalBeat || 'Không có'}
- Power shift: ${currentPlan?.powerShift || 'Không có'}
- Ending hook: ${currentPlan?.endingHook || 'Không có'}

PREVIOUS / NEXT CONTINUITY:
- Previous chapter plan: ${previousPlan ? `${previousPlan.title} — ${previousPlan.powerShift}` : 'Không có'}
- Next chapter setup: ${nextPlan ? `${nextPlan.title} — ${nextPlan.mission}` : 'Không có'}

EVIDENCE PLAN:
${evidencePlan}

VILLAIN CURVE:
${villainCurve}

PAYOFF PLAN:
${payoffPlan}

COMPACT CHAPTER PLAN:
${compactPlan}

RULE:
- Nếu mode là viết chương, chương này phải hoàn thành đúng mission của chapterNumber hiện tại.
- Nếu đang ở chương cuối theo targetChapters, phải nén payoff cuối vào chương này thay vì treo tiếp.
- Không được bỏ qua power shift. Nếu không có power shift thật, chương bị xem là lỗi.
`.trim()
}

export function normalizeStorySeed(value: unknown): FactoryStorySeed | null {
  if (!value || typeof value !== 'object') return null

  const raw = value as Record<string, unknown>

  const seed: FactoryStorySeed = {
    title: safeText(raw.title),
    genreBlend: safeStringArray(raw.genreBlend, 8),
    corePremise: safeText(raw.corePremise),
    openingScene: safeText(raw.openingScene),
    incitingIncident: safeText(raw.incitingIncident),
    evidenceObject: safeText(raw.evidenceObject),
    mainConflict: safeText(raw.mainConflict),
    hiddenTruth: safeText(raw.hiddenTruth),
    setting: safeText(raw.setting),
    villainType: safeText(raw.villainType),
    heroineArc: safeText(raw.heroineArc),
    emotionalHook: safeText(raw.emotionalHook),
    powerStructure: safeText(raw.powerStructure),
    publicPressure: safeText(raw.publicPressure),
    shortFingerprint: safeText(raw.shortFingerprint),
    antiRepeatTags: safeStringArray(raw.antiRepeatTags, 20),
    motifFingerprint: normalizeMotifFingerprint(raw.motifFingerprint),
    motifText: safeText(raw.motifText),
    motifEmbedding: Array.isArray(raw.motifEmbedding) ? (raw.motifEmbedding as number[]) : undefined,
    motifSimilarity: raw.motifSimilarity,
    storyPlan: normalizeStoryPlan(raw.storyPlan),
  }

  const hasUsefulSeed =
    seed.title ||
    seed.corePremise ||
    seed.openingScene ||
    seed.incitingIncident ||
    seed.evidenceObject ||
    seed.mainConflict ||
    seed.hiddenTruth ||
    seed.shortFingerprint ||
    seed.motifFingerprint?.fingerprint ||
    seed.storyPlan?.chapterPlan?.length

  return hasUsefulSeed ? seed : null
}

export function formatMotifFingerprint(fingerprint?: StoryMotifFingerprint) {
  if (!fingerprint) return ''

  const lines = [
    `- premiseFamily: ${fingerprint.premiseFamily || 'unknown'}`,
    `- openingArena: ${fingerprint.openingArena || 'unknown'}`,
    `- incitingIncident: ${fingerprint.incitingIncident || 'unknown'}`,
    `- evidenceType: ${fingerprint.evidenceType || 'unknown'}`,
    `- evidenceObject: ${fingerprint.evidenceObject || 'unknown'}`,
    `- villainAttackType: ${fingerprint.villainAttackType || 'unknown'}`,
    `- heroineCounterType: ${fingerprint.heroineCounterType || 'unknown'}`,
    `- powerStructure: ${fingerprint.powerStructure || 'unknown'}`,
    `- publicPressure: ${fingerprint.publicPressure || 'unknown'}`,
    `- hiddenTruthType: ${fingerprint.hiddenTruthType || 'unknown'}`,
    `- mainArena: ${fingerprint.mainArena || 'unknown'}`,
    `- deadlineStyle: ${fingerprint.deadlineStyle || 'unknown'}`,
    `- fingerprint: ${fingerprint.fingerprint || 'unknown'}`,
    `- antiRepeatTags: ${(fingerprint.antiRepeatTags || []).join(' | ') || 'none'}`,
  ]

  return lines.join('\n')
}
