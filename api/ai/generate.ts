type GenerateMode = 'chapter' | 'story-plan'
type ModelKey = 'economy' | 'premium' | 'auto'
type LegacyModelTier = 'draft' | 'premium' | 'auto'

type StoryMotifFingerprint = {
  premiseFamily?: string
  openingArena?: string
  incitingIncident?: string
  evidenceType?: string
  evidenceObject?: string
  villainAttackType?: string
  heroineCounterType?: string
  powerStructure?: string
  publicPressure?: string
  emotionalWound?: string
  hiddenTruthType?: string
  mainArena?: string
  secondaryArena?: string
  relationshipCore?: string
  twistEngine?: string
  deadlineStyle?: string
  endingPromise?: string
  antiRepeatTags?: string[]
  fingerprint?: string
}

type FactoryStoryPlanChapter = {
  chapterNumber: number
  title: string
  mission: string
  sceneType: string
  mainScene: string
  evidenceBeat: string
  villainBeat: string
  heroineMove: string
  emotionalBeat: string
  powerShift: string
  endingHook: string
}

type FactoryStoryPlan = {
  plannerVersion?: string
  totalPlannedChapters?: number
  plannerGoal?: string
  evidencePlan?: string[]
  villainCurve?: string[]
  payoffPlan?: string[]
  chapterPlan?: FactoryStoryPlanChapter[]
}

type FactoryStorySeed = {
  title?: string
  genreBlend?: string[]
  corePremise?: string
  openingScene?: string
  incitingIncident?: string
  evidenceObject?: string
  mainConflict?: string
  hiddenTruth?: string
  setting?: string
  villainType?: string
  heroineArc?: string
  emotionalHook?: string
  powerStructure?: string
  publicPressure?: string
  shortFingerprint?: string
  antiRepeatTags?: string[]
  motifFingerprint?: StoryMotifFingerprint
  motifText?: string
  motifEmbedding?: number[]
  motifSimilarity?: unknown
  storyPlan?: FactoryStoryPlan
}

type GeneratePayload = {
  mode?: GenerateMode
  modelKey?: ModelKey
  modelTier?: LegacyModelTier
  moduleId?: string
  title?: string
  storySummary?: string
  promptIdea?: string
  genreLabel?: string
  mainCharacterStyleLabel?: string
  chapterLengthLabel?: string
  cliffhangerLabel?: string
  humiliationLevel?: number
  revengeIntensity?: number
  nextChapterNumber?: number
  chapterTarget?: number
  targetChapters?: number
  storyMemory?: string
  recentChapters?: Array<{
    title?: string
    summary?: string
    content?: string
  }>
  avoidStoryTitles?: string[]
  avoidMotifs?: string[]
  avoidMotifTexts?: string[]
  avoidMotifFingerprints?: StoryMotifFingerprint[]
  avoidCharacterNames?: string[]
  avoidCompanyNames?: string[]
  factoryRunId?: string
  storyIndex?: number
  storySeed?: FactoryStorySeed | null
}

type NormalizedGeneratePayload = {
  mode: GenerateMode
  modelKey: ModelKey
  nameSeed: string
  moduleId: string
  title: string
  storySummary: string
  promptIdea: string
  genreLabel: string
  mainCharacterStyleLabel: string
  chapterLengthLabel: string
  cliffhangerLabel: string
  humiliationLevel: number
  revengeIntensity: number
  nextChapterNumber: number
  chapterTarget: number
  storyMemory: string
  recentChapters: Array<{
    title?: string
    summary?: string
    content?: string
  }>
  avoidStoryTitles: string[]
  avoidMotifs: string[]
  avoidMotifTexts: string[]
  avoidMotifFingerprints: StoryMotifFingerprint[]
  avoidCharacterNames: string[]
  avoidCompanyNames: string[]
  factoryRunId: string
  storyIndex: number
  storySeed: FactoryStorySeed | null
}

function safeText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function safeNumber(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }

  return fallback
}

function safeStringArray(value: unknown, limit = 30) {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => safeText(item))
    .filter(Boolean)
    .slice(0, limit)
}

function normalizeMotifFingerprint(value: unknown): StoryMotifFingerprint | undefined {
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

function normalizeMotifFingerprintArray(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => normalizeMotifFingerprint(item))
    .filter((item): item is StoryMotifFingerprint => Boolean(item))
    .slice(0, 80)
}


function normalizeStoryPlan(value: unknown): FactoryStoryPlan | undefined {
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

function formatStoryPlanForPrompt(plan?: FactoryStoryPlan, currentChapter?: number, targetChapters?: number) {
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

function normalizeStorySeed(value: unknown): FactoryStorySeed | null {
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

function createNameSeed() {
  const cryptoApi = globalThis.crypto

  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function normalizeModelKey(body: GeneratePayload): ModelKey {
  if (body.modelKey === 'premium' || body.modelKey === 'auto' || body.modelKey === 'economy') {
    return body.modelKey
  }

  if (body.modelTier === 'premium') return 'premium'
  if (body.modelTier === 'auto') return 'auto'

  return 'economy'
}

function normalizePayload(body: GeneratePayload): NormalizedGeneratePayload {
  return {
    mode: body.mode === 'story-plan' ? 'story-plan' : 'chapter',
    modelKey: normalizeModelKey(body),
    nameSeed: createNameSeed(),
    moduleId: safeText(body.moduleId, 'female-urban-viral'),
    title: safeText(body.title, 'Truyện mới từ AI Writer'),
    storySummary: safeText(body.storySummary, ''),
    promptIdea: safeText(body.promptIdea, ''),
    genreLabel: safeText(body.genreLabel, 'Hôn nhân phản bội / ngoại tình'),
    mainCharacterStyleLabel: safeText(body.mainCharacterStyleLabel, 'Nhẫn nhịn rồi phản công'),
    chapterLengthLabel: safeText(body.chapterLengthLabel, 'Vừa 2.500–3.500 ký tự'),
    cliffhangerLabel: safeText(body.cliffhangerLabel, 'auto'),
    humiliationLevel: safeNumber(body.humiliationLevel, 3),
    revengeIntensity: safeNumber(body.revengeIntensity, 3),
    nextChapterNumber: Math.max(1, Math.floor(safeNumber(body.nextChapterNumber, 1))),
    chapterTarget: Math.max(
      0,
      Math.floor(safeNumber(body.chapterTarget ?? body.targetChapters, 0)),
    ),
    storyMemory: safeText(body.storyMemory, ''),
    recentChapters: Array.isArray(body.recentChapters) ? body.recentChapters : [],
    avoidStoryTitles: safeStringArray(body.avoidStoryTitles, 50),
    avoidMotifs: safeStringArray(body.avoidMotifs, 80),
    avoidMotifTexts: safeStringArray(body.avoidMotifTexts, 80),
    avoidMotifFingerprints: normalizeMotifFingerprintArray(body.avoidMotifFingerprints),
    avoidCharacterNames: safeStringArray(body.avoidCharacterNames, 80),
    avoidCompanyNames: safeStringArray(body.avoidCompanyNames, 50),
    factoryRunId: safeText(body.factoryRunId, ''),
    storyIndex: Math.max(0, Math.floor(safeNumber(body.storyIndex, 0))),
    storySeed: normalizeStorySeed(body.storySeed),
  }
}

function getOutputText(data: any) {
  if (typeof data?.output_text === 'string') {
    return data.output_text.trim()
  }

  if (Array.isArray(data?.output)) {
    const parts: string[] = []

    for (const item of data.output) {
      if (Array.isArray(item?.content)) {
        for (const content of item.content) {
          if (typeof content?.text === 'string') {
            parts.push(content.text)
          }
        }
      }
    }

    return parts.join('\n').trim()
  }

  return ''
}

function getLengthRule(chapterLengthLabel: string) {
  const normalized = chapterLengthLabel.toLowerCase()

  if (
    normalized.includes('ngắn') ||
    normalized.includes('short') ||
    normalized.includes('1.800') ||
    normalized.includes('1800')
  ) {
    return {
      label: chapterLengthLabel,
      readerLength: 'khoảng 1.800–2.500 ký tự cho riêng phần BẢN ĐỌC CHO ĐỘC GIẢ',
      maxOutputTokens: 5600,
    }
  }

  if (
    normalized.includes('dài') ||
    normalized.includes('long') ||
    normalized.includes('3.500') ||
    normalized.includes('3500') ||
    normalized.includes('4.500') ||
    normalized.includes('4500')
  ) {
    return {
      label: chapterLengthLabel,
      readerLength: 'khoảng 3.500–4.500 ký tự cho riêng phần BẢN ĐỌC CHO ĐỘC GIẢ',
      maxOutputTokens: 9800,
    }
  }

  return {
    label: chapterLengthLabel,
    readerLength: 'khoảng 2.500–3.500 ký tự cho riêng phần BẢN ĐỌC CHO ĐỘC GIẢ',
    maxOutputTokens: 7800,
  }
}

function getTextModel(payload: NormalizedGeneratePayload) {
  const economyModel =
    process.env.OPENAI_MODEL_ECONOMY ||
    process.env.OPENAI_MODEL_DRAFT ||
    process.env.OPENAI_MODEL ||
    'gpt-4.1-mini'

  const premiumModel =
    process.env.OPENAI_MODEL_PREMIUM ||
    process.env.OPENAI_MODEL_HIGH ||
    process.env.OPENAI_MODEL ||
    'gpt-4.1-mini'

  if (payload.modelKey === 'premium') return premiumModel

  if (payload.modelKey === 'auto') {
    const cliffhanger = payload.cliffhangerLabel.toLowerCase()

    const shouldUsePremium =
      payload.nextChapterNumber === 1 ||
      payload.humiliationLevel >= 4 ||
      payload.revengeIntensity >= 4 ||
      cliffhanger.includes('cao trào') ||
      cliffhanger.includes('final') ||
      cliffhanger.includes('kết') ||
      cliffhanger.includes('kết liễu') ||
      cliffhanger.includes('vả mặt công khai') ||
      cliffhanger.includes('pháp lý đảo chiều')

    return shouldUsePremium ? premiumModel : economyModel
  }

  return economyModel
}

function getModuleInstruction(moduleId?: string) {
  const normalized = safeText(moduleId).toLowerCase()

  if (
    normalized.includes('female-urban-viral') ||
    normalized.includes('nữ tần') ||
    normalized.includes('nu-tan')
  ) {
    return `
CÔNG THỨC MODULE: Nữ tần đô thị viral Trung Quốc.

Bối cảnh bắt buộc:
- Trung Quốc hiện đại.
- Có thể dùng Weibo, Douyin, hot search, Thượng Hải/Bắc Kinh/Thâm Quyến, tập đoàn, hội đồng quản trị, luật sư, hợp đồng, cổ phần, RMB/tệ.
- Không dùng vibe Việt Nam, không dùng tên Việt.
- Tên nhân vật nên theo Trung Quốc hiện đại.

Vibe truyện:
- Nữ chính bị sỉ nhục/ép im lặng nhưng giữ được tự trọng.
- Phản diện có quyền lực gia tộc/công ty/truyền thông.
- Trả thù bằng bằng chứng, hợp đồng, truyền thông, pháp lý, cổ phần, nhân chứng.
- Không để nữ chính khóc lóc yếu đuối quá lâu.
- Không để nữ chính thắng sạch quá sớm.

Scene density:
- Phải có ít nhất một cảnh chính dài, không chỉ kể lướt.
- Cảnh chính nên có 4–8 lượt đối thoại qua lại.
- Mỗi lượt đối thoại phải làm xung đột tăng lên.
`.trim()
  }

  return `
CÔNG THỨC MODULE: Truyện drama nữ tần hiện đại.

Đặc trưng bắt buộc:
- Nữ chính là trung tâm.
- Xung đột rõ, cảm xúc mạnh, có cú móc cuối chương.
- Bằng chứng và điểm trả sau phải được cài từng lớp.
`.trim()
}

function getGenreInstruction(genreLabel: string) {
  const genre = safeText(genreLabel).toLowerCase()

  if (genre.includes('bí ẩn') || genre.includes('thân thế')) {
    return `
GENRE LOCK: Bí ẩn gia đình / thân thế
- Trọng tâm bắt buộc: bí mật huyết thống, thân phận thật giả, hồ sơ cũ, người nhà che giấu sự thật.
- Không hé toàn bộ thân thế trong một chương.
- Mỗi chương chỉ hé một mảnh: ảnh cũ, giấy xét nghiệm, hồ sơ bệnh viện, di chúc, di vật, người quen cũ.
- Nữ chính phải điều tra từng lớp, không tự nhiên biết hết.
`.trim()
  }

  if (genre.includes('công sở') || genre.includes('nữ cường') || genre.includes('thương chiến')) {
    return `
GENRE LOCK: Công sở vả mặt / nữ cường thương chiến
- Trọng tâm bắt buộc: năng lực, địa vị, hợp đồng, dự án, phòng họp, PR, pháp vụ, cổ phần, quyền điều hành.
- Nữ chính phải thắng bằng năng lực thật: số liệu, hợp đồng, kế hoạch, bằng chứng, đàm phán, quyền biểu quyết.
- Cảnh chính nên có: họp hội đồng, đàm phán dự án, tranh công, bị vu oan trong công ty, báo cáo bị đánh tráo, hợp đồng bị cướp.
- Đối thoại phải sắc, ngắn, có chiến thuật.
- Không biến thành chuyện tình cảm đơn thuần.
`.trim()
  }

  if (genre.includes('hào môn') || genre.includes('liên hôn') || genre.includes('gia tộc')) {
    return `
GENRE LOCK: Hào môn / liên hôn / gia tộc
- Trọng tâm bắt buộc: quyền lực gia tộc, liên hôn, thể diện, tài sản, cổ phần, danh phận, phu nhân, lão phu nhân.
- Không khí phải sang, lạnh, áp lực, nhiều quy tắc ngầm.
- Cảnh nên có biệt thự, sảnh tiệc, phòng họp gia tộc, hoặc hội sở tập đoàn.
- Nữ chính bị ép bởi danh phận nhưng không được hèn yếu.
- Không để tình tiết thành ngoại tình đơn thuần; ngoại tình chỉ là ngòi nổ nếu có.
`.trim()
  }

  if (
    genre.includes('hot search') ||
    genre.includes('showbiz') ||
    genre.includes('pr scandal') ||
    genre.includes('livestream')
  ) {
    return `
GENRE LOCK: Hot search / showbiz / PR scandal
- Trọng tâm bắt buộc: dư luận, Weibo, hot search, hashtag, tài khoản marketing, PR khủng hoảng, bình luận mạng.
- Không được dùng từ "tweet". Phải dùng "bài đăng Weibo", "hot search", "hashtag", "lượt chia sẻ", "bình luận", "tài khoản marketing".
- Cảnh mạnh nên có: bài bóc phốt viral, công ty PR họp khẩn, phóng viên chặn cửa, hợp đồng đại diện bị đe dọa, fandom quay xe.
- Nữ chính phản công bằng thời điểm tung bằng chứng, luật sư, truyền thông, người trong cuộc, hoặc một bài đăng đúng lúc.
`.trim()
  }

  if (genre.includes('mẹ con') || genre.includes('gia đình') || genre.includes('bảo vệ con')) {
    return `
GENRE LOCK: Mẹ con / gia đình / bảo vệ con
- Trọng tâm bắt buộc: tình thân, bảo vệ con, quyền nuôi con, áp lực gia đình, bí mật thân thế của con.
- Nữ chính mạnh nhưng không lạnh hoàn toàn.
- Nếu có con nhỏ, đứa trẻ phải phục vụ cốt truyện, không làm đạo cụ dễ thương ngẫu nhiên.
- Cảnh mạnh nên có: tranh quyền nuôi con, bệnh viện, trường học, gia đình chồng gây áp lực, dư luận công kích mẹ con.
`.trim()
  }

  if (genre.includes('pháp lý') || genre.includes('luật sư')) {
    return `
GENRE LOCK: Nữ cường pháp lý / luật sư
- Trọng tâm bắt buộc: pháp luật, bằng chứng, hợp đồng, kiện tụng, luật sư, đối chất, điều khoản, thư pháp lý.
- Logic bằng chứng phải rõ nhưng không quá khô.
- Nữ chính phải sắc bén trong lập luận, biết giữ bằng chứng, biết bẫy đối phương nói hớ.
- Cảnh mạnh nên có: văn phòng luật, phòng họp hòa giải, thư luật sư, điều khoản hợp đồng, ghi âm hợp pháp, hồ sơ bị khóa.
`.trim()
  }

  if (genre.includes('đổi tráo') || genre.includes('danh phận')) {
    return `
GENRE LOCK: Đổi tráo danh phận / hào môn
- Trọng tâm bắt buộc: thân phận thật giả, thiên kim giả, người thay thế, danh phận bị cướp, gia tộc nhận nhầm người.
- Không hé thân phận thật quá sớm.
- Mỗi chương chỉ hé một sơ hở: thói quen, di vật, ảnh cũ, xét nghiệm, lời người hầu, hồ sơ bị sửa.
- Nữ chính phải từng bước lấy lại vị trí, không thắng sạch trong một chương.
`.trim()
  }

  if (genre.includes('hôn nhân') && (genre.includes('phản bội') || genre.includes('ngoại tình'))) {
    return `
GENRE LOCK: Hôn nhân phản bội / ngoại tình
- Trọng tâm bắt buộc: lòng tin hôn nhân bị phá vỡ, người thứ ba, ảnh/tin nhắn/khách sạn, gia đình hai bên, thể diện xã hội.
- Nữ chính được đau nhưng không được khóc lóc quá lâu. Cảm xúc phải biến thành sự tỉnh táo.
- Phản công nên đi bằng bằng chứng: ảnh, hóa đơn, camera, lịch sử đặt phòng, tài sản chung, hợp đồng, luật sư, sao kê, nhân chứng.
- Không xả hết bằng chứng ngay chương đầu.
`.trim()
  }

  if (genre.includes('trả thù')) {
    return `
GENRE LOCK: Trả thù đô thị
- Trọng tâm bắt buộc: nữ chính từng bị hại, tích lũy bằng chứng, đặt bẫy, lật từng lớp sự thật, khiến đối phương trả giá trong bối cảnh hiện đại.
- Revenge pacing phải rõ: chương đầu/chương giữa không kết liễu ngay, chỉ đặt bẫy, hé một mảnh bằng chứng hoặc khiến phản diện tự lộ sơ hở.
- Phản diện phải có phản công. Không được đứng yên chịu thua.
- Nữ chính thông minh nhưng không toàn năng.
`.trim()
  }

  return `
GENRE LOCK: Drama nữ tần hiện đại
- Bám sát thể loại đã chọn.
- Ưu tiên xung đột rõ, nhân vật có động cơ, cảnh đối đầu trực diện, ending có hook.
- Không viết lan man hoặc lệch khỏi premise chính.
`.trim()
}

function getPremiseInstruction(payload: NormalizedGeneratePayload) {
  const promptIdea = safeText(payload.promptIdea)
  const hasPromptIdea = Boolean(promptIdea)

  const common = `
PREMISE DIVERSITY LOCK:
- Không mặc định dùng hot search cho mọi truyện.
- Hot search/Weibo chỉ là một công cụ mở truyện, không phải công thức bắt buộc.
- Nếu Prompt idea trống, hãy tự chọn một premise phù hợp với GENRE LOCK, nhưng phải tránh lặp công thức hot search quá nhiều.
- Nếu Prompt idea có nội dung rõ, bắt buộc ưu tiên Prompt idea hơn mọi gợi ý mặc định.
- Chương 1 phải có một premise cụ thể, không mở chung chung.
`.trim()

  if (hasPromptIdea) {
    return `
${common}

PROMPT IDEA OVERRIDE:
- Prompt idea hiện có: ${promptIdea}
- Hãy lấy prompt idea này làm mạch chính.
- Chỉ thêm hot search nếu prompt idea có yếu tố dư luận, scandal, showbiz, PR, ảnh bị leak, hoặc truyền thông.
`.trim()
  }

  return `
${common}

DEFAULT PREMISE THEO THỂ LOẠI:
- Hãy chọn hook phù hợp với thể loại đã chọn, không tự động dùng hot search nếu không cần.
- Ưu tiên cảnh có hành động cụ thể: phòng họp, bữa cơm, khách sạn, bệnh viện, văn phòng luật, sảnh tiệc, hợp đồng, di vật, camera, hồ sơ, hoặc người đưa tin bí mật.
`.trim()
}

function getHeroineInstruction(styleLabel: string) {
  const style = safeText(styleLabel).toLowerCase()

  if (style.includes('pháp lý') || style.includes('luật')) {
    return `
HEROINE LOCK: Lý trí, giỏi pháp lý
- Nữ chính suy nghĩ theo bằng chứng, điều khoản, quyền lợi và hậu quả pháp lý.
- Cô biết giữ chứng cứ, không tung hết một lúc.
- Đối thoại nên có tính đối chất, gài bẫy, ép đối phương tự lộ sơ hở.
- Không viết cô như người chỉ biết cãi nhau cảm tính.
`.trim()
  }

  if (style.includes('thương chiến') || style.includes('nữ cường')) {
    return `
HEROINE LOCK: Nữ cường thương chiến
- Nữ chính có năng lực thật trong công việc, dự án, hợp đồng, cổ phần hoặc quản trị.
- Cô thắng bằng số liệu, quyền biểu quyết, chiến lược và đàm phán.
- Không để cô chỉ dựa vào nam chính hoặc may mắn.
- Cảnh phản công nên có không khí phòng họp, hợp đồng, PR, hội đồng hoặc cổ đông.
`.trim()
  }

  if (style.includes('mẹ') || style.includes('bảo vệ con')) {
    return `
HEROINE LOCK: Người mẹ bảo vệ con
- Động lực lớn nhất của nữ chính là bảo vệ con và giữ phẩm giá.
- Cô có thể mềm với con nhưng cứng với người làm hại con.
- Xung đột nên có chiều sâu cảm xúc, không chỉ trả thù lạnh.
- Nếu có con nhỏ, đứa trẻ phải ảnh hưởng trực tiếp đến lựa chọn của nữ chính.
`.trim()
  }

  if (style.includes('vả mặt công khai')) {
    return `
HEROINE LOCK: Vả mặt công khai cực gắt
- Nữ chính không chỉ thắng riêng tư, cô khiến đối phương mất mặt trước đám đông.
- Cảnh mạnh nên diễn ra ở tiệc, phòng họp, livestream, họp báo, Weibo hoặc trước gia tộc.
- Cú vả mặt phải có bằng chứng cụ thể, không chỉ chửi cho sướng.
- Không dùng quá nhiều câu khẩu hiệu; ưu tiên một câu ngắn, lạnh, sắc.
`.trim()
  }

  if (style.includes('gom bằng chứng') || style.includes('im lặng')) {
    return `
HEROINE LOCK: Im lặng gom bằng chứng
- Nữ chính không phản ứng quá sớm, cô để đối phương tưởng mình yếu.
- Cô âm thầm lưu ảnh, ghi âm, giữ hóa đơn, sao kê, camera hoặc hợp đồng.
- Càng bị ép, cô càng có thêm dữ liệu để phản công.
- Khi tung bằng chứng, chỉ tung một phần đủ làm đối phương rối loạn.
`.trim()
  }

  return `
HEROINE LOCK: Nữ chính đô thị hiện đại
- Nữ chính có tự trọng, có cảm xúc, nhưng không yếu đuối kéo dài.
- Cô phải có lựa chọn chủ động trong chương.
- Không để nam chính hoặc nhân vật phụ giải quyết thay toàn bộ vấn đề.
`.trim()
}

function getNameDiversityInstruction(payload: NormalizedGeneratePayload) {
  return `
CHARACTER NAME DIVERSITY LOCK:
- Name seed của lần tạo này: ${payload.nameSeed}
- Mỗi truyện mới phải tự tạo bộ tên nhân vật mới dựa trên seed này.
- Không được mặc định dùng lại các tên ví dụ cũ như: Lâm An Nhiên, Lục Thịnh, Lục Hạo, Tề Dương, Mã Lan, Hàn Liễu, Triệu Vũ.
- Không được dùng họ Lục hoặc họ Lâm quá thường xuyên.
- Nếu Prompt idea không chỉ định tên nhân vật, hãy tự tạo tên Trung Quốc hiện đại khác nhau cho từng truyện.
- Bộ tên phải nhất quán trong cùng một truyện, nhưng giữa các truyện mới phải khác nhau.
- Ưu tiên đa dạng họ: Giang, Tô, Hứa, Thẩm, Cố, Tống, Ninh, Ôn, Bạch, Trình, Diệp, Phó, Hạ, Chu, Kỷ, Mạnh, Đường, Dư, Tạ, Tần, Hàn, La, Mộ, Tưởng, Lạc, Viên.
`.trim()
}

function formatMotifFingerprint(fingerprint?: StoryMotifFingerprint) {
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

function getStorySeedInstruction(payload: NormalizedGeneratePayload) {
  const seed = payload.storySeed

  if (!seed) {
    return `
STORY SEED / STORY DNA:
- Không có storySeed được truyền vào request này.
- Vẫn phải tự tạo premise, bối cảnh, vật chứng, nhân vật và nhịp chương khác biệt.
- Không được dùng một khung truyện cố định rồi chỉ thay vài danh từ.
`.trim()
  }

  const motifBlock = seed.motifFingerprint
    ? `
MOTIF FINGERPRINT CỦA TRUYỆN NÀY:
${formatMotifFingerprint(seed.motifFingerprint)}

MOTIF TEXT:
${seed.motifText || 'Không có motifText.'}
`.trim()
    : ''

  const storyPlanBlock = formatStoryPlanForPrompt(
    seed.storyPlan,
    payload.nextChapterNumber,
    payload.chapterTarget,
  )

  return `
STORY SEED / STORY DNA BẮT BUỘC:
- Đây là xương sống của truyện, không phải gợi ý phụ.
- OpenAI bắt buộc phải bám các chi tiết này khi viết chương.
- Nếu storySeed khác, cấu trúc cảnh, vật chứng, áp lực, nhân vật và hook cũng phải khác rõ rệt.
- Nếu storySeed mâu thuẫn với genreLabel hoặc promptIdea, ưu tiên storySeed.

THÔNG TIN STORY SEED:
- Tên truyện định hướng: ${seed.title || payload.title}
- Genre blend: ${seed.genreBlend?.join(' | ') || payload.genreLabel}
- Core premise: ${seed.corePremise || payload.promptIdea || payload.storySummary}
- Opening scene bắt buộc: ${seed.openingScene || 'Tự chọn theo premise'}
- Inciting incident bắt buộc: ${seed.incitingIncident || 'Tự chọn theo premise'}
- Evidence object bắt buộc: ${seed.evidenceObject || 'Tự chọn vật chứng hợp logic'}
- Main conflict: ${seed.mainConflict || payload.genreLabel}
- Hidden truth: ${seed.hiddenTruth || 'Giữ một bí mật chưa lộ hết'}
- Setting: ${seed.setting || 'Đô thị hiện đại Trung Quốc'}
- Villain type: ${seed.villainType || 'Phản diện có lợi ích cụ thể'}
- Heroine arc: ${seed.heroineArc || payload.mainCharacterStyleLabel}
- Emotional hook: ${seed.emotionalHook || 'Bị phản bội nhưng dần tỉnh táo'}
- Power structure: ${seed.powerStructure || 'Gia đình / công ty / dư luận'}
- Public pressure: ${seed.publicPressure || 'Áp lực công khai phù hợp bối cảnh'}
- Short fingerprint: ${seed.shortFingerprint || 'Không có'}
- Anti-repeat tags: ${seed.antiRepeatTags?.join(' | ') || 'Không có'}

${motifBlock}

${storyPlanBlock}

QUY TẮC BÁM STORY SEED:
- Chương phải dùng đúng opening scene hoặc biến thể rất gần với opening scene.
- Inciting incident phải là sự kiện kích hoạt chính, không thay bằng scandal generic nếu seed không yêu cầu.
- Evidence object phải xuất hiện tự nhiên và có vai trò đẩy xung đột.
- Hidden truth chỉ hé một phần, không xả hết ngay nếu chưa phải chương cuối.
- Không được biến mọi truyện thành cùng motif ngoại tình/hot search nếu storySeed đang chỉ hướng khác.
`.trim()
}

function getGlobalMotifUniquenessInstruction(payload: NormalizedGeneratePayload) {
  const avoidMotifLines = payload.avoidMotifs.slice(0, 30).map((item) => `  - ${item}`)
  const avoidMotifTextLines = payload.avoidMotifTexts.slice(0, 20).map((item) => `---\n${item}`)
  const avoidFingerprintLines = payload.avoidMotifFingerprints
    .slice(0, 20)
    .map((item, index) => `MOTIF CŨ ${index + 1}:\n${formatMotifFingerprint(item)}`)

  const seedMotif = payload.storySeed?.motifFingerprint
    ? formatMotifFingerprint(payload.storySeed.motifFingerprint)
    : ''

  return `
GLOBAL MOTIF UNIQUENESS LOCK:
- Nhiệm vụ quan trọng: không được tạo truyện/chương chỉ khác tên nhân vật nhưng cùng mô-típ với truyện cũ.
- Một truyện bị xem là TRÙNG nếu giống từ 3 yếu tố trở lên trong các nhóm:
  opening arena, inciting incident, evidence type, villain attack type, heroine counter type, public pressure, hidden truth type, deadline style, main power structure.
- Nếu thấy motif gần giống truyện cũ, phải tự đổi ít nhất 5 yếu tố: opening arena, inciting incident, evidence object, villain attack, heroine counter, public pressure, hidden truth.
- Nếu STORY SEED đã có motifFingerprint, tuyệt đối không tự kéo nó về các combo motif đã dùng nhiều trong thư viện.

MOTIF CỦA REQUEST NÀY:
${seedMotif || '- Chưa có motifFingerprint cụ thể.'}

MOTIF/PREMISE CẦN TRÁNH TỪ THƯ VIỆN:
${avoidMotifLines.join('\n') || '  - Không có danh sách motif text ngắn.'}

MOTIF DNA CẦN TRÁNH:
${avoidFingerprintLines.join('\n\n') || '- Không có motif fingerprint cũ.'}

MOTIF TEXT CẦN TRÁNH:
${avoidMotifTextLines.join('\n\n') || '- Không có motifText cũ.'}

CẤM LẶP COMBO:
- hồ sơ nhận nuôi + cô nhi viện + con dấu + niêm phong + 48 giờ
- sân bay + vé máy bay + di chúc/công chứng + hội đồng quản trị
- viện dưỡng lão + hồ sơ bệnh án + đơn ly hôn + họp cổ đông
- hầm xe + phong thư cũ + hồ sơ nhận con nuôi + nhóm phụ huynh
- livestream + bình luận lạ + di chúc/cổ phần + họp báo
- khách sạn + ngoại tình + hóa đơn phòng + camera hành lang
- bệnh viện + xét nghiệm ADN + quyền nuôi con + gia đình chồng

Chương mới phải làm rõ sự khác biệt motif bằng cảnh, vật chứng, phản diện tấn công và cách nữ chính phản công.
`.trim()
}

function getOpenAIAntiRepeatInstruction(payload: NormalizedGeneratePayload) {
  return `
OPENAI ANTI-REPEAT LOCK:
- Không được dùng lại văn mẫu hoặc nhịp chương quá giống các truyện khác.
- Cấm mở chương bằng các khung quá quen:
  + "Tối đó, tôi..."
  + "Sáng hôm đó, tôi..."
  + "Tôi đứng trước..."
  + "Tôi không đứng trước..."
  + "Điện thoại reo liên tục..."
  + "Weibo nổ tung..." nếu storySeed không yêu cầu truyền thông.
- Cấm dùng lại cấu trúc:
  phát hiện vật chứng → người đối diện hỏi "Cô lấy thứ đó ở đâu?" → nữ chính hít sâu → tung một câu sắc → cliffhanger.
- Cấm dùng các câu đệm lặp:
  + "Tôi hít sâu một hơi"
  + "Tôi siết chặt tay"
  + "Căn phòng im bặt"
  + "Mọi ánh mắt đổ dồn về phía tôi"
  + "Tôi biết, mọi chuyện chỉ vừa bắt đầu"
- Không được dùng cùng một kiểu vật chứng cho nhiều truyện liên tiếp nếu avoidMotifs hoặc storySeed đã khác.
- Không được chỉ thay openingScene/evidenceObject vào cùng một đoạn văn.

YÊU CẦU RIÊNG CHO REQUEST NÀY:
- Factory run id: ${payload.factoryRunId || 'không có'}
- Story index: ${payload.storyIndex}
- Chapter target: ${payload.chapterTarget || 'không có'}
- Chương hiện tại: ${payload.nextChapterNumber}
`.trim()
}

function getLibraryAvoidanceInstruction(payload: NormalizedGeneratePayload) {
  const hasAvoidance =
    payload.avoidStoryTitles.length ||
    payload.avoidMotifs.length ||
    payload.avoidMotifTexts.length ||
    payload.avoidMotifFingerprints.length ||
    payload.avoidCharacterNames.length ||
    payload.avoidCompanyNames.length

  if (!hasAvoidance) {
    return `
EXISTING LIBRARY AVOIDANCE:
- Chưa có danh sách tránh từ thư viện hiện có.
- Vẫn phải tự đa dạng hóa tên truyện, motif, tên nhân vật và tên công ty.
`.trim()
  }

  return `
EXISTING LIBRARY AVOIDANCE:
- Đây là truyện mới trong AI Factory hoặc AI Writer, không được lặp lại thư viện hiện có.
- Tên truyện cần tránh:
${payload.avoidStoryTitles.map((item) => `  - ${item}`).join('\n') || '  - Không có'}
- Motif/premise cần tránh:
${payload.avoidMotifs.map((item) => `  - ${item}`).join('\n') || '  - Không có'}
- Motif DNA cần tránh: ${payload.avoidMotifFingerprints.length} motif fingerprint.
- Motif text cần tránh: ${payload.avoidMotifTexts.length} motif text.
- Tên nhân vật cần tránh:
${payload.avoidCharacterNames.map((item) => `  - ${item}`).join('\n') || '  - Không có'}
- Tên công ty/gia tộc cần tránh:
${payload.avoidCompanyNames.map((item) => `  - ${item}`).join('\n') || '  - Không có'}
- Nhiệm vụ: tạo truyện mới khác đáng kể, không chỉ đổi tên.
`.trim()
}

function getCliffhangerRule(payload: NormalizedGeneratePayload) {
  const label = safeText(payload.cliffhangerLabel, '')
  const normalized = label.toLowerCase()

  if (
    !label ||
    normalized.includes('mặc định') ||
    normalized.includes('tự chọn') ||
    normalized.includes('auto')
  ) {
    return `
ENDING STRATEGY:
- Kiểu kết chương: AI tự chọn theo mạch truyện.
- Không ép chương nào cũng phải có bằng chứng mới.
- Hãy chọn kiểu ending hợp lý nhất dựa trên STORY CONTEXT, GENRE LOCK, PREMISE DIVERSITY LOCK, HEROINE LOCK, nhịp chương, và trạng thái xung đột.
- Nếu chương trước đã kết bằng bằng chứng, chương này nên ưu tiên phản công/đối đầu/cú đảo chiều để tránh lặp.
- Ending phải tự nhiên, không được ghi thẳng tên loại ending.
`.trim()
  }

  return `
ENDING STRATEGY:
- Kiểu kết chương được chọn: ${label}.
- Hãy kết chương theo đúng tinh thần này, nhưng vẫn phải tự nhiên như văn truyện.
- Không được ghi thẳng nhãn "${label}" vào BẢN ĐỌC.
- Không được kết bằng câu phân tích kỹ thuật.
`.trim()
}

function buildStoryContext(payload: NormalizedGeneratePayload) {
  const memory = safeText(payload.storyMemory, '')

  const recentChapters = Array.isArray(payload.recentChapters)
    ? payload.recentChapters.slice(0, 4)
    : []

  const chapterText = recentChapters
    .map((chapter, index) => {
      const title = safeText(chapter.title, `Chương gần nhất ${index + 1}`)
      const summary = safeText(chapter.summary, '')
      const content = safeText(chapter.content, '')
      const compactContent = content.length > 1600 ? `${content.slice(0, 1600)}...` : content

      return `
CHƯƠNG THAM CHIẾU ${index + 1}: ${title}
Tóm tắt: ${summary || 'Không có tóm tắt riêng.'}
Nội dung rút gọn:
${compactContent || 'Không có nội dung.'}
`.trim()
    })
    .join('\n\n')

  if (!memory && !chapterText) {
    return `
STORY CONTEXT:
- Chưa có dữ liệu chương trước.
- Nếu đang viết chương 1, hãy mở truyện thật mạnh nhưng phải bám PREMISE DIVERSITY LOCK.
- Nếu không chắc thứ tự chương, không tự bịa rằng đã có sự kiện trước đó.
`.trim()
  }

  return `
STORY CONTEXT:
${memory ? `Memory đã lưu:\n${memory}` : 'Memory đã lưu: chưa có.'}

${chapterText ? `Các chương gần nhất:\n${chapterText}` : 'Các chương gần nhất: chưa có.'}

Quy tắc dùng context:
- Phải nối logic với các chương gần nhất.
- Không reset quan hệ nhân vật.
- Không làm mất bằng chứng/điểm trả sau đã cài.
- Không lặp lại y nguyên cảnh đã viết.
- Nếu viết chương tiếp theo, hãy đẩy xung đột tiến thêm một nấc.
`.trim()
}

function getChapterMissionInstruction(payload: NormalizedGeneratePayload) {
  const chapter = Math.max(1, Math.floor(payload.nextChapterNumber || 1))
  const target = payload.chapterTarget > 0 ? payload.chapterTarget : 0
  const isFinal = target > 0 && chapter >= target

  if (isFinal) {
    return `
CHAPTER MISSION LOCK:
- Đây là chương cuối hoặc gần cuối theo target ${target}.
- Nhiệm vụ chương này: trả payoff chính, công khai sự thật quan trọng, buộc phản diện trả giá rõ ràng.
- Không được mở thêm quá nhiều bí mật mới nếu không có kết.
- Có thể giữ một dư âm nhỏ, nhưng mâu thuẫn chính phải được giải quyết.
`.trim()
  }

  if (chapter === 1) {
    return `
CHAPTER MISSION LOCK:
- Đây là Chương 1.
- Nhiệm vụ chương này: mở biến cố chính, giới thiệu nữ chính, giới thiệu áp lực chính, cài 1 vật chứng chủ đạo.
- Không được giải thích toàn bộ âm mưu.
- Không được cho nữ chính thắng sạch.
`.trim()
  }

  if (chapter === 2) {
    return `
CHAPTER MISSION LOCK:
- Đây là Chương 2.
- Nhiệm vụ chương này: kiểm chứng hậu quả của biến cố Chương 1 hoặc gặp người/địa điểm có thể xác minh vật chứng.
- Phải có ít nhất một cảnh mới không trùng địa điểm chính của Chương 1.
- Không được viết lại cảnh phát hiện vật chứng như mới xảy ra lần đầu.
- Không được chỉ ngồi một chỗ gọi điện/đọc lại file.
`.trim()
  }

  if (chapter === 3) {
    return `
CHAPTER MISSION LOCK:
- Đây là Chương 3.
- Nhiệm vụ chương này: phản diện phản công thật, khiến nữ chính mất một lợi thế hoặc bị đẩy vào thế khó mới.
- Phản công phải có hậu quả cụ thể: tài khoản bị khóa, quyền vào công ty bị chặn, con/người thân bị đe dọa, hợp đồng bị lộ, cổ phần bị phong tỏa, trường học/bệnh viện/công ty bị tác động.
- Không được chỉ là lời dọa qua điện thoại.
`.trim()
  }

  if (chapter === 4) {
    return `
CHAPTER MISSION LOCK:
- Đây là Chương 4.
- Nhiệm vụ chương này: đổi chiến trường.
- Phải chuyển sang một địa điểm/cảnh hành động mới: văn phòng luật, bệnh viện, trường học, phòng họp hội đồng, công ty PR, nhà gia tộc, hầm xe, trụ sở tập đoàn, hoặc nơi giữ nhân chứng.
- Nữ chính phải tự đưa ra quyết định nguy hiểm hoặc chiến thuật mới.
`.trim()
  }

  if (chapter === 5) {
    return `
CHAPTER MISSION LOCK:
- Đây là Chương 5.
- Nhiệm vụ chương này: đảo chiều đầu tiên hoặc vả mặt công khai một phần.
- Nữ chính phải dùng một bằng chứng đã cài từ trước để tạo kết quả cụ thể.
- Không kết liễu toàn bộ nếu target còn dài, nhưng phải có một thắng lợi nhỏ rõ ràng.
`.trim()
  }

  return `
CHAPTER MISSION LOCK:
- Đây là Chương ${chapter}.
- Nhiệm vụ chương này: mở một bước tiến mới trong mạch truyện, không lặp lại nhiệm vụ của chương trước.
- Bắt buộc có state change: sau chương này, vị thế nữ chính, vị thế phản diện, bằng chứng, hoặc dư luận phải thay đổi thật.
`.trim()
}

function getChapterAdvancementInstruction(payload: NormalizedGeneratePayload) {
  return `
CHAPTER ADVANCEMENT LOCK:
- Mỗi chương phải là một bước tiến mới của truyện, không phải viết lại cùng một sự kiện bằng câu chữ khác.
- Recap chương trước tối đa 2 câu. Không được mở chương bằng cách kể lại toàn bộ file/email/vật chứng cũ như mới phát hiện.
- Nếu chương trước đã diễn ra ở sân bay/hầm xe/phòng VIP/phòng chờ, chương này phải đổi cảnh hoặc đổi mục tiêu rõ rệt.
- Bắt buộc có ít nhất 1 hành động mới không xuất hiện ở chương trước:
  + đến địa điểm mới
  + gặp nhân chứng mới
  + kiểm chứng vật chứng ở nơi khác
  + bị phản diện cắt một quyền lợi thật
  + đối chất trực tiếp
  + bước vào phòng họp/công ty/tòa/bệnh viện/trường học
  + công khai một phần bằng chứng
  + bị lộ một thông tin bất lợi thật
- Cấm vòng lặp chương:
  vật chứng cũ → gọi luật sư → bị đe dọa qua điện thoại → nhắc metadata → nữ chính nói sẽ thu thập → kết "trò chơi mới bắt đầu".
- Cấm nhiều chương liên tiếp chỉ xoay quanh cùng 1 file PDF, cùng 1 thẻ nhớ, cùng 1 phong thư, cùng 1 metadata.
- Nếu vẫn cần dùng vật chứng cũ, nó chỉ được làm nền; chương phải có hành động mới hoặc hậu quả mới.
- Mỗi chương chỉ có tối đa 1 vật chứng chính + 1 vật chứng phụ.
- Chương này phải trả lời câu hỏi: "Sau chương này, tình thế đã thay đổi ở điểm nào?"
`.trim()
}

function getProgressionQualityInstruction() {
  return `
PROGRESSION QUALITY LOCK:
Trước khi viết chương, hãy nhìn 3 chương gần nhất và tự xác định:
- địa điểm chính đã dùng,
- loại bằng chứng đã dùng,
- kiểu phản diện tấn công,
- kiểu nữ chính phản công,
- deadline đã dùng,
- nhân vật phản diện đã xuất hiện trực tiếp.

Chương mới bắt buộc phải khác ít nhất 4/6 yếu tố trên.

Cấm lặp trong chương mới:
- cùng địa điểm chính,
- cùng loại bằng chứng,
- cùng kiểu đe dọa,
- cùng phản diện xuất hiện đúng lúc,
- cùng thao tác nữ chính chụp ảnh/lưu metadata/gọi luật sư,
- cùng kết chương bằng tin nhắn đếm ngược.

Mỗi chương mới phải có:
1. một hậu quả thật,
2. một hành động chủ động mới của nữ chính,
3. một thông tin mới làm đổi cách hiểu vụ việc,
4. một cảnh có con người bị ảnh hưởng, không chỉ giấy tờ,
5. một hook cuối chương cụ thể dẫn sang chương sau.
`.trim()
}

function getSceneFunctionInstruction() {
  return `
SCENE FUNCTION LOCK:
Trước khi viết chương, hãy tự chọn đúng 1 chức năng chính cho chương này.

Các chức năng được phép:
1. Public Exposure: nữ chính bị công khai bôi nhọ trước đám đông.
2. Evidence Verification: nữ chính đi xác minh một vật chứng tại nguồn gốc.
3. Real Loss: phản diện khiến nữ chính mất một quyền lợi thật.
4. Witness Hunt: nữ chính tìm nhân chứng hoặc người giữ bản gốc.
5. Emotional Cost: người thân/con nhỏ/mẹ già chịu hậu quả trực tiếp.
6. Legal Countermove: nữ chính dùng luật sư/tòa án để khóa chứng cứ.
7. Boardroom/Public Confrontation: đối đầu ở phòng họp/hội đồng/truyền thông.
8. Trap Reversal: nữ chính gài bẫy để phản diện tự lộ sơ hở.

Cấm 2 chương liên tiếp dùng cùng chức năng chính.
Cấm chương mới chỉ lặp lại: xem hồ sơ → chụp ảnh → bị niêm phong → gọi luật sư → bị nhắn 48 giờ.
Nếu chương trước đã là Evidence Verification ở cô nhi viện/bệnh viện/phòng lưu trữ, chương sau bắt buộc phải là Real Loss, Emotional Cost, Boardroom/Public Confrontation hoặc Trap Reversal.
Nếu chương trước đã là Legal Countermove ở văn phòng luật, chương sau bắt buộc phải ra khỏi văn phòng luật.
`.trim()
}

function getVillainPresenceInstruction() {
  return `
VILLAIN PRESENCE LOGIC:
- Phản diện không được xuất hiện đúng lúc ở mọi địa điểm như NPC.
- Mỗi lần phản diện xuất hiện phải có lý do hợp lý:
  + họ được mời tới,
  + họ theo dõi qua người khác,
  + đây là địa bàn của họ,
  + họ gửi đại diện,
  + hoặc họ xuất hiện qua hậu quả đã chuẩn bị trước.
- Không để cùng một phản diện trực tiếp xuất hiện trong 3 chương liên tiếp chỉ để đe dọa.
- Nếu cần tạo áp lực, hãy dùng hậu quả thay vì cho phản diện xuất hiện:
  email chính thức, thông báo từ trường, tài khoản bị khóa, nhân chứng mất tích, người hỗ trợ bị đình chỉ, nhóm chat lan truyền, giấy triệu tập, người thân bị chuyển phòng.
`.trim()
}

function getHumanCostInstruction() {
  return `
HUMAN COST RULE:
- Mỗi 2 chương phải có ít nhất 1 cảnh cho thấy hậu quả lên con người thật, không chỉ giấy tờ.
- Nếu truyện liên quan con nhỏ: phải có cảnh đứa trẻ bị ảnh hưởng, bị gọi khỏi lớp, bị bạn nhìn khác, bị trường từ chối, hoặc hỏi một câu làm nữ chính đau.
- Nếu truyện liên quan mẹ già/bệnh án: phải có cảnh mẹ tỉnh/lẫn, bị chuyển phòng, y tá lúng túng, hoặc nữ chính thấy tình trạng mẹ bị dùng làm vũ khí.
- Nếu truyện liên quan hôn nhân: phải có cảnh đối đầu cảm xúc với chồng/người thứ ba, không chỉ luật sư và hồ sơ.
- Nếu truyện liên quan công ty/cổ phần: phải có cảnh mất quyền thật, người dưới quyền quay lưng, hoặc phòng họp nghi ngờ nữ chính.
`.trim()
}

function getTechnicalReportInstruction() {
  return `
# BẢN PHÂN TÍCH KỸ THUẬT / KHÔNG ĐĂNG

=== THÔNG TIN TRUYỆN ĐỀ XUẤT ===
- Tên truyện đề xuất:
- Slug gợi ý:
- Một câu mô tả ngắn:

=== KIỂM TRA TIẾN ĐỘ TRUYỆN ===
- Nhân vật chính:
- Phản diện:
- Tình huống:
- Mục tiêu chương:
- Scene function chính:
- Chapter mission:
- Địa điểm chính của chương:
- Hành động mới trong chương:
- State change sau chương này:
- Chương sau nên đi đâu:

=== MOTIF / STORY DNA CHECK ===
- Motif fingerprint của truyện:
- Chương này có trùng motif cũ không:
- Điểm khác biệt motif:
- Yếu tố tránh lặp đã tuân thủ:

=== BỘ NHỚ TRUYỆN ===
- Sự kiện đã xảy ra:
- Bằng chứng đã hé:
- Nguồn gốc/lý do nữ chính có bằng chứng:
- Quan hệ nhân vật:
- Tên công ty/gia tộc/tổ chức cần giữ nhất quán:
- Thứ chưa được tiết lộ:

=== KIỂM TRA BỐI CẢNH LIÊN TỤC ===
- Thời gian:
- Địa điểm:
- Tên công ty/gia tộc/tổ chức chính:
- Bối cảnh xã hội/công ty:
- Tiền tệ/quyền lực/liên quan pháp lý:

=== KIỂM TRA NHÂN VẬT PHỤ ===
- Nhân vật phụ xuất hiện:
- Vai trò:
- Có lấn át nữ chính không:
- Có cần giữ lại cho điểm trả sau không:

=== KIỂM TRA LƯỢNG TIẾT LỘ ===
- Chương này đã hé bao nhiêu bằng chứng:
- Có hé quá nhiều không:
- Bằng chứng nào phải giữ lại:
- Điểm trả sau nào chưa được dùng:

=== THEO DÕI CHI TIẾT ĐÃ CÀI VÀ ĐIỂM TRẢ SAU ===
- Chi tiết đã cài:
- Điểm trả sau tương lai:
- Chi tiết nên nhớ:

=== THEO DÕI NHỊP HÉ BẰNG CHỨNG ===
- Bằng chứng hiện có:
- Bằng chứng chưa khai thác:
- Không được tung sớm:

=== THEO DÕI LEO THANG XUNG ĐỘT ===
- Áp lực dư luận:
- Áp lực gia đình/công ty:
- Phản công của nữ chính:
- Hướng chương sau:

Lưu ý:
- Phần kỹ thuật này chỉ để admin debug, không đăng cho độc giả.
- Nội dung mô tả trong phần kỹ thuật phải viết sạch, rõ, ưu tiên tiếng Việt tự nhiên.
`.trim()
}

function buildStoryPlanPrompt(payload: NormalizedGeneratePayload) {
  const moduleInstruction = getModuleInstruction(payload.moduleId)
  const genreInstruction = getGenreInstruction(payload.genreLabel)
  const premiseInstruction = getPremiseInstruction(payload)
  const libraryAvoidanceInstruction = getLibraryAvoidanceInstruction(payload)
  const storySeedInstruction = getStorySeedInstruction(payload)
  const motifUniquenessInstruction = getGlobalMotifUniquenessInstruction(payload)
  const antiRepeatInstruction = getOpenAIAntiRepeatInstruction(payload)
  const nameDiversityInstruction = getNameDiversityInstruction(payload)
  const heroineInstruction = getHeroineInstruction(payload.mainCharacterStyleLabel)
  const cliffhangerRule = getCliffhangerRule(payload)

  return `
Bạn là Master Story Engine v3.0 chuyên thiết kế truyện nữ tần đô thị viral cho độc giả Việt.

NHIỆM VỤ:
Tạo dàn ý truyện có thể dùng để viết thành web novel nhiều chương.

THÔNG TIN ĐẦU VÀO:
- Tên truyện/ý tưởng: ${payload.title}
- Prompt idea: ${payload.promptIdea || 'Chưa có prompt riêng.'}
- Tóm tắt hiện có: ${payload.storySummary || 'Chưa có tóm tắt.'}
- Thể loại: ${payload.genreLabel}
- Module: ${payload.moduleId}
- Kiểu nữ chính: ${payload.mainCharacterStyleLabel}
- Độ dài chương mục tiêu: ${payload.chapterLengthLabel}
- Kiểu kết chương ưu tiên: ${payload.cliffhangerLabel}
- Mức uất ức: ${payload.humiliationLevel}/5
- Mức trả thù: ${payload.revengeIntensity}/5
- Factory run id: ${payload.factoryRunId || 'không có'}
- Story index: ${payload.storyIndex || 0}
- Target chapters: ${payload.chapterTarget || 'chưa đặt'}

${moduleInstruction}

${genreInstruction}

${premiseInstruction}

${libraryAvoidanceInstruction}

${motifUniquenessInstruction}

${storySeedInstruction}

${antiRepeatInstruction}

${nameDiversityInstruction}

${heroineInstruction}

${cliffhangerRule}

YÊU CẦU:
- Dàn ý phải đủ rõ để viết được nhiều chương liên tục.
- Mỗi chương trong outline phải có nhiệm vụ riêng, địa điểm/cảnh chính riêng, state change riêng.
- Không viết 3 chương liên tiếp quanh cùng 1 vật chứng/cùng 1 địa điểm.
- Không để outline thành vòng lặp: phát hiện file → gọi luật sư → bị đe dọa → thu thập tiếp.
- Phải bám đúng GENRE LOCK, PREMISE DIVERSITY LOCK, STORY SEED, MOTIF UNIQUENESS LOCK và HEROINE LOCK.

OUTPUT BẮT BUỘC:
# STORY PLAN

## Tên truyện
[Đề xuất tên truyện viral, không được dùng "Chương 1" làm tên truyện]

## Story DNA / Motif Fingerprint
- premiseFamily:
- openingArena:
- incitingIncident:
- evidenceType:
- villainAttackType:
- heroineCounterType:
- powerStructure:
- publicPressure:
- hiddenTruthType:
- deadlineStyle:
- antiRepeatTags:

## Công thức viết
[Nêu công thức/vibe chính]

## Thể loại
[Nêu thể loại]

## Kiểu nữ chính
[Nêu rõ arc nữ chính]

## Premise chính
[Nêu hook mở truyện theo đúng thể loại]

## Bối cảnh
[Nêu bối cảnh rõ ràng]

## Ý tưởng chính
[Viết 1 đoạn hook mạnh]

## Tóm tắt
[Viết 3–4 dòng mô tả truyện có thể dùng công khai]

## Nhân vật
- Nữ chính:
- Nam phản diện:
- Người thứ ba:
- Gia tộc/công ty:
- Nhân vật hỗ trợ:

## Mâu thuẫn cốt lõi
[Nêu mâu thuẫn chính]

## Vũ khí trả thù
[Nêu vũ khí trả thù: bằng chứng, hợp đồng, pháp vụ, cổ phần, truyền thông]

## Nhịp hé bằng chứng
[Chia tầng bằng chứng]

## Hành trình nữ chính
[Nêu hành trình nữ chính qua nhiều chương]

## Bản đồ kết chương
[Phân bổ kiểu kết chương phù hợp từng giai đoạn]

## Outline 10 chương
Chương 1:
Chương 2:
Chương 3:
Chương 4:
Chương 5:
Chương 6:
Chương 7:
Chương 8:
Chương 9:
Chương 10:

## Cover Prompt Seed
[Tóm tắt hình ảnh bìa truyện nên vẽ]
`.trim()
}

function buildChapterPrompt(payload: NormalizedGeneratePayload) {
  const lengthRule = getLengthRule(payload.chapterLengthLabel)
  const moduleInstruction = getModuleInstruction(payload.moduleId)
  const genreInstruction = getGenreInstruction(payload.genreLabel)
  const premiseInstruction = getPremiseInstruction(payload)
  const libraryAvoidanceInstruction = getLibraryAvoidanceInstruction(payload)
  const motifUniquenessInstruction = getGlobalMotifUniquenessInstruction(payload)
  const storySeedInstruction = getStorySeedInstruction(payload)
  const antiRepeatInstruction = getOpenAIAntiRepeatInstruction(payload)
  const nameDiversityInstruction = getNameDiversityInstruction(payload)
  const heroineInstruction = getHeroineInstruction(payload.mainCharacterStyleLabel)
  const storyContext = buildStoryContext(payload)
  const technicalReport = getTechnicalReportInstruction()
  const cliffhangerRule = getCliffhangerRule(payload)
  const missionInstruction = getChapterMissionInstruction(payload)
  const advancementInstruction = getChapterAdvancementInstruction(payload)
  const progressionQualityInstruction = getProgressionQualityInstruction()
  const sceneFunctionInstruction = getSceneFunctionInstruction()
  const villainPresenceInstruction = getVillainPresenceInstruction()
  const humanCostInstruction = getHumanCostInstruction()
  const nextChapterNumber = Math.max(1, Math.floor(payload.nextChapterNumber || 1))
  const isContinuation = nextChapterNumber > 1

  return `
Bạn là Master Story Engine v3.0 chuyên viết truyện nữ tần đô thị viral cho độc giả Việt.

Nhiệm vụ của bạn:
- Viết bằng tiếng Việt tự nhiên, dễ đọc, giàu drama.
- Giữ giọng truyện ngôi thứ nhất "tôi" khi viết chương.
- Tạo cảm giác như truyện web novel do người thật sáng tác, không phải bản dịch máy, không phải phân tích khô.
- Không nhắc rằng bạn là AI.
- Không giải thích ngoài output.
- Không đạo văn.

THÔNG TIN TRUYỆN:
- Tên truyện: ${payload.title}
- Ý tưởng/prompt: ${payload.promptIdea || payload.storySummary || 'Chưa có ý tưởng riêng.'}
- Tóm tắt truyện hiện có: ${payload.storySummary || 'Chưa có tóm tắt riêng.'}
- Thể loại: ${payload.genreLabel}
- Module: ${payload.moduleId}
- Kiểu nữ chính: ${payload.mainCharacterStyleLabel}
- Độ dài được chọn: ${payload.chapterLengthLabel}
- Kiểu kết chương: ${payload.cliffhangerLabel}
- Mức uất ức: ${payload.humiliationLevel}/5
- Mức trả thù: ${payload.revengeIntensity}/5
- Factory run id: ${payload.factoryRunId || 'không có'}
- Story index: ${payload.storyIndex || 0}
- Target chapters: ${payload.chapterTarget || 'chưa đặt'}

${moduleInstruction}

${genreInstruction}

${premiseInstruction}

${libraryAvoidanceInstruction}

${motifUniquenessInstruction}

${storySeedInstruction}

${antiRepeatInstruction}

${nameDiversityInstruction}

${heroineInstruction}

${storyContext}

${missionInstruction}

${advancementInstruction}

${progressionQualityInstruction}

${sceneFunctionInstruction}

${villainPresenceInstruction}

${humanCostInstruction}

CHAPTER CONTINUATION RULE:
- Số chương cần viết: Chương ${nextChapterNumber}.
- ${
    isContinuation
      ? 'Đây là chương tiếp theo của truyện đã có chương trước. Tuyệt đối không viết lại chương 1, không mở truyện lại từ đầu, không reset quan hệ nhân vật, không đổi tên nhân vật chính/phản diện, không đổi tính cách nữ chính.'
      : 'Đây là chương mở đầu. Có thể mở bằng cú sốc mạnh, nhưng phải chọn premise theo GENRE LOCK và PREMISE DIVERSITY LOCK, không mặc định hot search nếu không cần.'
  }
- Nếu là chương tiếp theo, đoạn mở đầu phải nối từ sự kiện/hook/bằng chứng ở chương gần nhất, nhưng không được recap quá 2 câu.
- Không tự tạo lại một vụ hot search mở đầu mới nếu chương trước đã có hook cụ thể, trừ khi đó là hệ quả trực tiếp của chương trước.
- Tiêu đề chương bắt buộc dùng dạng: "# Chương ${nextChapterNumber} — [tên chương ngắn, có hook]".
- Nếu là Chương 1, phần kỹ thuật bắt buộc có "Tên truyện đề xuất" khác với tiêu đề chương.

${cliffhangerRule}

GENRE + PREMISE + HEROINE EXECUTION RULE:
- Thể loại, premise và kiểu nữ chính đã chọn là khóa cốt lõi, không được viết lệch.
- Nếu Prompt idea trống, phải tự chọn hook theo PREMISE DIVERSITY LOCK.
- Không để nữ chính hành xử trái option đã chọn chỉ để tạo drama rẻ tiền.
- Không để nhân vật phụ hoặc nam chính cướp vai trò giải quyết vấn đề của nữ chính.
- Không dùng Weibo/hot search làm hook chính chỉ vì module có chữ viral. Chỉ dùng khi hợp thể loại/prompt.

MALE ANTAGONIST PRESENCE RULE:
- Nếu có nam phản diện/chồng/CEO/tổng tài, hắn phải có ít nhất 1–2 câu thoại sắc, gây tổn thương trực tiếp hoặc tạo áp lực thật.
- Không để mẹ chồng/gia tộc/PR gánh toàn bộ vai phản diện nếu nam phản diện là nhân vật chính của xung đột.
- Nam phản diện phải thể hiện quyền lực qua lựa chọn, đe dọa, hợp đồng, cổ phần, luật sư hoặc thái độ phủ nhận nữ chính.
- Nếu nam phản diện là nhân vật chính của xung đột, chương phải có một hành động/lời nói khiến độc giả ghét hoặc nghi ngờ hắn.

SUPPORT CHARACTER LIMIT RULE:
- Nhân vật hỗ trợ như luật sư, trợ lý, bạn thân, quản gia chỉ được hỗ trợ công cụ/thông tin, không được giải quyết thay nữ chính.
- Quyết định chính, đòn phản công chính và lựa chọn nguy hiểm phải thuộc về nữ chính.
- Nếu nhân vật hỗ trợ xuất hiện quá mạnh, hãy giảm vai trò của họ thành cảnh báo, xác minh hoặc chuẩn bị giấy tờ.

EVIDENCE PACING HARD LIMIT:
- Trong BẢN ĐỌC CHO ĐỘC GIẢ, mỗi chương chỉ được dùng tối đa 1 vật chứng chính + 1 vật chứng phụ.
- Các vật chứng cũ chỉ được nhắc lại thoáng qua để nối mạch, không phân tích lại dài.
- Nếu có nhiều hơn 2 vật chứng trong storySeed hoặc context, hãy chọn 1 vật chứng chính + 1 vật chứng phụ cho chương này.
- Chương 1 không được giải thích toàn bộ chuỗi âm mưu.
- Chương 2 trở đi không được tái phát hiện cùng vật chứng như mới.
- Tier 3–4 như sao kê đầy đủ, video hoàn chỉnh, nhân chứng quyết định, hồ sơ pháp lý đầy đủ phải giữ cho chương sau hoặc final payoff.

ANTI PHONE CALL LOOP:
- Không để chương nào cũng chỉ gồm điện thoại gọi đến, luật sư trả lời, phản diện đe dọa, rồi nữ chính nói sẽ thu thập.
- Nếu có cuộc gọi, cuộc gọi phải dẫn tới hành động mới ngoài đời thật: đi đến địa điểm mới, gặp người mới, bị chặn quyền, bị gọi vào họp, bị đưa lên nhóm công khai, hoặc phải đối chất trực tiếp.
- Không được dùng một phản diện/PR/luật sư gọi điện nhiều lần chỉ để lặp lời đe dọa.
- Đe dọa phải tạo hậu quả thật, không chỉ là câu nói.

LOCATION PROGRESSION RULE:
- Không để 3 chương liên tiếp diễn ra quanh cùng một địa điểm như sân bay/phòng VIP/hầm xe.
- Nếu chương trước đã ở sân bay, chương này nên đến văn phòng luật, công ty, bệnh viện, trường học, phòng họp, nhà gia tộc, hoặc nơi giữ camera/nhân chứng.
- Nếu chương trước đã ở hầm xe, chương này nên chuyển sang nhóm phụ huynh, bệnh viện, phòng họp gia tộc, trường học, hoặc nơi xác minh hồ sơ.
- Địa điểm mới phải làm xung đột mới xuất hiện, không chỉ đổi cảnh cho có.

REAL STATE CHANGE RULE:
- Cuối chương, tình thế phải thay đổi thật.
- Ví dụ state change hợp lệ:
  + nữ chính mất quyền truy cập tài khoản/cổ phần/trường học/công ty
  + phản diện bị lộ một sơ hở xác minh được
  + nhân chứng mới đồng ý hoặc từ chối giúp
  + nhóm công khai đổi chiều
  + tòa/văn phòng luật/công ty gửi thông báo thật
  + nữ chính buộc phải đến một cuộc họp/hòa giải/đối chất
  + một người tưởng giúp nữ chính hóa ra có vấn đề
- Không tính state change nếu chỉ là "trò chơi mới bắt đầu" hoặc "tôi quyết tâm hơn".

WORDING NATURALNESS RULE:
- Tránh câu dịch máy, cụm sai collocation, hình ảnh quá lạ hoặc không tự nhiên trong tiếng Việt.
- Tránh ẩn dụ kỳ như "đồng xu trong bụng", "vết nứt trong linh hồn", "con dao trong tim" nếu không thật sự cần.
- Ưu tiên phản ứng cụ thể: ngón tay khựng lại, cổ họng nghẹn, màn hình nhòe đi, lưng lạnh đi.
- Nếu nam phản diện/chồng/CEO còn trẻ hoặc cùng thế hệ nữ chính, không gọi là "ông ta". Ưu tiên "anh ta", "hắn", hoặc gọi tên riêng.

CHARACTER CONSISTENCY RULE:
- Nếu STORY CONTEXT hoặc chương tham chiếu đã có tên nhân vật, bắt buộc giữ nguyên tên đó.
- Không đổi họ/tên nữ chính, nam phản diện, người thứ ba, mẹ chồng/bà nội chồng giữa các chương.
- Không đặt nữ chính cùng họ với chồng/nam phản diện nếu không có lý do thân phận/huyết thống đặc biệt.
- Không dùng lẫn mẹ chồng và bà nội chồng cho cùng một nhân vật.

NARRATIVE CRAFT RULE:
- Mỗi đoạn văn phải làm ít nhất một việc: đẩy cốt truyện, tăng áp lực, bộc lộ cảm xúc, cài bằng chứng, trả điểm trả sau, hoặc mở hook.
- Nếu một đoạn chỉ giải thích chung chung mà không có hành động/cảm xúc/thông tin mới, phải tự bỏ hoặc viết lại thành cảnh.
- Không kể lướt quá nhiều sự kiện. Hãy chọn một cảnh trọng tâm để đào sâu.
- Nữ chính thông minh nhưng không toàn năng. Cô được thắng một nhịp nhỏ, không được thắng sạch quá sớm.
- Phản diện phải có phản ứng và phản công hợp lý, không đứng yên chịu thua.

CLEAN PROSE RULE:
- BẢN ĐỌC CHO ĐỘC GIẢ không được dùng ngôn ngữ phân tích kỹ thuật như: "phản diện đang phản công", "nữ chính phản đòn", "mục tiêu chương", "genre lock", "heroine lock", "ending strategy", "premise diversity lock", "character name diversity lock".
- Những ý kỹ thuật phải được chuyển thành cảnh truyện tự nhiên, bằng hành động/tin nhắn/đối thoại/vật chứng/phản ứng cơ thể.
- Không kết thúc phần đọc bằng câu kiểu phân tích. Kết chương phải là hình ảnh, hành động, tin nhắn, bằng chứng mới, áp lực mới, hoặc một câu thoại có hook.
- Khi nữ chính phản đòn, ưu tiên dùng đối thoại ngắn, lạnh, sắc thay vì giải thích chiến thuật.

HUMAN PROSE RULE:
- Viết như tác giả người thật đang kể chuyện, không viết như máy hoàn thành checklist.
- Câu văn được phép có nhịp dài ngắn khác nhau, nhưng không được rối.
- Đối thoại không được chỉ để giải thích cốt truyện. Mỗi câu thoại phải có ý đồ: ép, né, đe dọa, thử phản ứng, che giấu, châm chọc, hoặc lật thế.
- Nhân vật không được nói quá đúng, quá đủ, quá sạch. Người thật thường nói thiếu một nửa, vòng vo, cắt ngang, hoặc giấu ý.
- Không viết đoạn nào giống bài phân tích đạo đức hoặc tổng kết bài học.

SELF-REVISION PASS BẮT BUỘC TRƯỚC KHI TRẢ OUTPUT:
Trước khi xuất kết quả cuối cùng, hãy tự đọc lại bản chương như một biên tập viên và tự sửa trong im lặng theo checklist này:
1. Có đúng số chương cần viết không? Nếu là Chương ${nextChapterNumber}, không được ghi nhầm thành chương khác.
2. Nếu là chương tiếp theo, có lặp lại cùng cảnh/vật chứng/hành động của chương trước không? Nếu có, phải đổi sang hành động hoặc địa điểm mới.
3. Có chapter mission rõ chưa? Nếu chưa, viết lại chương để mission rõ hơn.
4. Có state change thật ở cuối chương chưa? Nếu chưa, thêm hậu quả hoặc biến cố thật.
5. Có lặp vòng điện thoại → luật sư → đe dọa → metadata không? Nếu có, viết lại.
6. Có xả quá nhiều bằng chứng không? Nếu có, giữ lại tối đa 1 vật chứng chính + 1 vật chứng phụ.
7. Có đi lệch khỏi STORY CONTEXT không? Nếu lệch tên nhân vật, quan hệ, bằng chứng, bối cảnh, phải sửa.
8. Có câu nào giống phân tích kỹ thuật trong BẢN ĐỌC không? Nếu có, phải biến thành cảnh.
9. Có đoạn nào lan man, chỉ giải thích mà không đẩy truyện không? Nếu có, cắt hoặc viết lại.
10. Kết chương có đủ hook để đọc tiếp không? Nếu chưa, viết lại đoạn cuối.
11. BẢN ĐỌC có đọc như truyện thật không? Nếu còn như outline/tóm tắt, viết lại thành cảnh có hành động và đối thoại.
12. Phần kỹ thuật có điền đầy đủ scene function, chapter mission, địa điểm chính, hành động mới, state change và chương sau nên đi đâu chưa?

CHAPTER QUALITY TARGET:
- Độ dài mục tiêu: ${lengthRule.readerLength}.
- Tăng đối thoại va chạm.
- Giữ bối cảnh đã chọn.
- Giữ đúng premise theo thể loại.
- Giữ đúng kiểu nữ chính đã chọn.
- Nữ chính có cảm xúc nhưng không yếu đuối kéo dài, chưa toàn thắng quá sớm.
- Cuối chương phải có hook mạnh để đọc tiếp.

NHIỆM VỤ:
Viết một chương truyện hoàn chỉnh để đăng cho độc giả.

OUTPUT BẮT BUỘC:
- Phải có đúng 2 phần:
  1. # BẢN ĐỌC CHO ĐỘC GIẢ
  2. # BẢN PHÂN TÍCH KỸ THUẬT / KHÔNG ĐĂNG
- Hai phần cách nhau bằng dòng "---".
- Phần "# BẢN ĐỌC CHO ĐỘC GIẢ" là phần duy nhất được đăng cho độc giả.
- Phần "# BẢN PHÂN TÍCH KỸ THUẬT / KHÔNG ĐĂNG" chỉ để admin debug/lưu memory.
- Tuyệt đối không đưa nhãn kỹ thuật, tracker, checklist vào BẢN ĐỌC CHO ĐỘC GIẢ.
- BẢN ĐỌC CHO ĐỘC GIẢ phải đọc như một chương truyện hoàn chỉnh.
- BẢN ĐỌC CHO ĐỘC GIẢ không được dùng bullet/list.

FORMAT PHẦN ĐỌC:
# BẢN ĐỌC CHO ĐỘC GIẢ

# Chương ${nextChapterNumber} — [tên chương hấp dẫn, ngắn, có hook]

[Viết nội dung chương bằng văn xuôi liên tục.]

Sau phần đọc, thêm dòng "---", rồi viết phần kỹ thuật theo mẫu sau:

${technicalReport}
`.trim()
}

function buildPrompt(payload: NormalizedGeneratePayload) {
  if (payload.mode === 'story-plan') {
    return buildStoryPlanPrompt(payload)
  }

  return buildChapterPrompt(payload)
}


function compactText(value: string, limit = 6000) {
  const clean = safeText(value)
  if (clean.length <= limit) return clean
  return `${clean.slice(0, limit)}
...[đã rút gọn ${clean.length - limit} ký tự]`
}

function getStoryEditorPassEnabled(payload: NormalizedGeneratePayload) {
  if (payload.mode !== 'chapter') return false

  const disabled = process.env.DISABLE_STORY_EDITOR_PASS
  if (disabled === 'true' || disabled === '1') return false

  return true
}

function buildStoryEditorPrompt(payload: NormalizedGeneratePayload, draftText: string) {
  const lengthRule = getLengthRule(payload.chapterLengthLabel)
  const chapterNumber = Math.max(1, Math.floor(payload.nextChapterNumber || 1))
  const target = payload.chapterTarget > 0 ? payload.chapterTarget : 'chưa đặt'
  const storySeed = payload.storySeed
  const currentPlan = storySeed?.storyPlan?.chapterPlan?.find(
    (chapter) => chapter.chapterNumber === chapterNumber,
  )
  const previousPlan = storySeed?.storyPlan?.chapterPlan?.find(
    (chapter) => chapter.chapterNumber === chapterNumber - 1,
  )
  const nextPlan = storySeed?.storyPlan?.chapterPlan?.find(
    (chapter) => chapter.chapterNumber === chapterNumber + 1,
  )

  const recentContext = payload.recentChapters
    .slice(0, 3)
    .map((chapter, index) => {
      const title = safeText(chapter.title, `Chương gần nhất ${index + 1}`)
      const summary = safeText(chapter.summary)
      const content = safeText(chapter.content)
      return `- ${title}: ${summary || compactText(content, 600) || 'Không có dữ liệu.'}`
    })
    .join('\n')

  return `
Bạn là STORY EDITOR PASS cho web novel nữ tần đô thị viral.

NHIỆM VỤ:
Đọc bản nháp chương bên dưới và rewrite thành bản final đăng được.
Đây là bước biên tập sau Chapter Writer, không phải viết truyện mới từ đầu.

THÔNG TIN TRUYỆN:
- Tên truyện: ${payload.title}
- Chương cần sửa: Chương ${chapterNumber}/${target}
- Thể loại: ${payload.genreLabel}
- Module: ${payload.moduleId}
- Kiểu nữ chính: ${payload.mainCharacterStyleLabel}
- Độ dài mục tiêu phần đọc: ${lengthRule.readerLength}
- Core premise: ${storySeed?.corePremise || payload.promptIdea || payload.storySummary || 'Không có'}
- Evidence object: ${storySeed?.evidenceObject || 'Không có'}
- Main conflict: ${storySeed?.mainConflict || 'Không có'}
- Hidden truth: ${storySeed?.hiddenTruth || 'Không có'}
- Villain type: ${storySeed?.villainType || 'Không có'}
- Emotional hook: ${storySeed?.emotionalHook || 'Không có'}

CHAPTER PLAN HIỆN TẠI:
- Mission: ${currentPlan?.mission || 'Không có'}
- Scene type: ${currentPlan?.sceneType || 'Không có'}
- Main scene: ${currentPlan?.mainScene || 'Không có'}
- Evidence beat: ${currentPlan?.evidenceBeat || 'Không có'}
- Villain beat: ${currentPlan?.villainBeat || 'Không có'}
- Heroine move: ${currentPlan?.heroineMove || 'Không có'}
- Emotional beat: ${currentPlan?.emotionalBeat || 'Không có'}
- Power shift: ${currentPlan?.powerShift || 'Không có'}
- Ending hook: ${currentPlan?.endingHook || 'Không có'}
- Previous plan: ${previousPlan ? `${previousPlan.title} — ${previousPlan.powerShift}` : 'Không có'}
- Next setup: ${nextPlan ? `${nextPlan.title} — ${nextPlan.mission}` : 'Không có'}

CONTEXT GẦN NHẤT:
${recentContext || '- Chưa có chương trước.'}

EDITOR CHECKLIST BẮT BUỘC:
1. Giữ đúng logic chính, tên nhân vật, vật chứng, bối cảnh và kết quả chính của chương.
2. Không đổi mission của chương. Nếu chapter plan yêu cầu power shift, bản final phải có power shift thật.
3. Giảm cảm giác khô pháp lý/thủ tục. Nếu có niêm phong, phong tỏa, giám định, chữ ký số, cam kết pháp lý, phải xen cảnh cảm xúc hoặc đối đầu trực diện.
4. Tăng hiện diện của phản diện chính. Nếu phản diện chính chưa ra mặt, thêm một cuộc gọi/tin nhắn/câu thoại/đòn có chữ ký cá nhân rõ ràng. Không để luật sư/PR/pháp vụ gánh toàn bộ vai ác.
5. Thêm hoặc làm sắc hơn một câu thoại gây áp lực từ phản diện và một câu đáp trả lạnh của nữ chính.
6. Thêm emotional beat ngắn nếu có mẹ bệnh/con nhỏ/người thân yếu thế. Cảnh phải cụ thể, không sến, không dài.
7. Sau 2–3 chương bị ép, phải có một dopamine reward nhỏ: phản diện phụ cứng họng, nhân chứng đổi phe, dư luận chia phe, một chứng cứ được bảo toàn, hoặc một câu vả mặt công khai.
8. Ending hook phải cụ thể: một cái tên, một file mới, một ảnh, một địa điểm/thời gian hẹn, một người thân gặp nguy, một hot search đảo chiều, hoặc phản diện chính xuất hiện. Không kết bằng câu chung chung kiểu “ván cờ mới bắt đầu”.
9. Không xả hết bí mật quá sớm, không thêm twist quá lố, không biến chương thành summary.
10. BẢN ĐỌC phải là văn truyện mượt, không có bullet/list/checklist/kỹ thuật.
11. BẢN PHÂN TÍCH KỸ THUẬT vẫn giữ để admin debug, nhưng phải cập nhật đúng sau khi rewrite.

CẤM:
- Không đổi tên nữ chính, phản diện, mẹ/con/người thân đã có.
- Không đổi vật chứng trung tâm.
- Không đổi chương số.
- Không viết lại lệch sang một premise khác.
- Không thêm nam chính cứu toàn bộ tình thế.
- Không để phần đọc lộ chữ “editor”, “checklist”, “planner”, “rule”, “mission”.

OUTPUT BẮT BUỘC:
Giữ đúng 2 phần:
1. # BẢN ĐỌC CHO ĐỘC GIẢ
2. # BẢN PHÂN TÍCH KỸ THUẬT / KHÔNG ĐĂNG
Hai phần cách nhau bằng dòng "---".

BẢN NHÁP CẦN BIÊN TẬP:
${compactText(draftText, 12000)}
`.trim()
}

async function callOpenAIText(args: {
  apiKey: string
  model: string
  prompt: string
  maxOutputTokens: number
}) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${args.apiKey}`,
    },
    body: JSON.stringify({
      model: args.model,
      input: args.prompt,
      max_output_tokens: args.maxOutputTokens,
    }),
  })

  const data = await readJsonResponse(response)

  return {
    response,
    data,
    text: response.ok && !data?.__nonJson ? getOutputText(data) : '',
  }
}

async function readJsonResponse(response: Response) {
  const rawText = await response.text()

  try {
    return rawText ? JSON.parse(rawText) : null
  } catch {
    return {
      __nonJson: true,
      preview: rawText.slice(0, 800),
    }
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  const enabled = process.env.ENABLE_REAL_AI

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY' })
  }

  if (enabled && enabled !== 'true') {
    return res.status(403).json({ error: 'ENABLE_REAL_AI is not true' })
  }

  try {
    const payload = normalizePayload((req.body || {}) as GeneratePayload)
    const prompt = buildPrompt(payload)
    const lengthRule = getLengthRule(payload.chapterLengthLabel)
    const model = getTextModel(payload)

    const firstPass = await callOpenAIText({
      apiKey,
      model,
      prompt,
      maxOutputTokens: lengthRule.maxOutputTokens,
    })

    if (!firstPass.response.ok) {
      return res.status(firstPass.response.status).json({
        error: firstPass.data?.error?.message || 'OpenAI API error',
        detail: firstPass.data,
      })
    }

    if (firstPass.data?.__nonJson) {
      return res.status(502).json({
        error: 'OpenAI returned non-JSON response',
        detail: firstPass.data,
      })
    }

    const draftText = firstPass.text

    if (!draftText) {
      return res.status(500).json({
        error: 'OpenAI returned empty output',
        detail: firstPass.data,
      })
    }

    let finalText = draftText
    let editorPassUsed = false
    let editorPassFailed = false
    let editorUsage = null
    let editorError = ''

    if (getStoryEditorPassEnabled(payload)) {
      try {
        const editorPrompt = buildStoryEditorPrompt(payload, draftText)
        const editorPass = await callOpenAIText({
          apiKey,
          model,
          prompt: editorPrompt,
          maxOutputTokens: lengthRule.maxOutputTokens,
        })

        if (editorPass.response.ok && !editorPass.data?.__nonJson && editorPass.text) {
          finalText = editorPass.text
          editorPassUsed = true
          editorUsage = editorPass.data?.usage || null
        } else {
          editorPassFailed = true
          editorError =
            editorPass.data?.error?.message ||
            editorPass.data?.preview ||
            `Story editor pass failed with status ${editorPass.response.status}`
        }
      } catch (editorErrorRaw: any) {
        editorPassFailed = true
        editorError = editorErrorRaw?.message || 'Story editor pass failed'
      }
    }

    return res.status(200).json({
      text: finalText,
      draftText: editorPassUsed ? draftText : undefined,
      model,
      modelKey: payload.modelKey,
      editorPassUsed,
      editorPassFailed,
      editorError: editorPassFailed ? editorError : undefined,
      usage: firstPass.data?.usage || null,
      editorUsage,
    })
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Unknown generate error',
    })
  }
}
