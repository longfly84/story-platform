import type {
  CoverArtStyleKey,
  CoverBuildResult,
  CoverSceneType,
  CoverStoryStage,
  JsonRecord,
  StoryInput,
} from './coverTypes.js'

const DEFAULT_TITLE = 'Bí Mật Chưa Được Gọi Tên'
const DEFAULT_GENRE = 'nữ tần đô thị hiện đại, drama cảm xúc, bí mật gia đình, phản công'
const DEFAULT_HEROINE =
  'nữ chính là phụ nữ trẻ hiện đại, thông minh, cảm xúc sâu, ngoài mềm trong cứng, biết chịu đựng nhưng sẽ phản công khi chạm giới hạn'
const DEFAULT_ANTAGONIST =
  'người thân, đối thủ hoặc thế lực giàu có đang che giấu sự thật và gây áp lực lên nữ chính'
const DEFAULT_RELATIONSHIP =
  'phản bội, che giấu, hiểu lầm, quyền lực chèn ép và một sự thật đang chuẩn bị bị lật ra'
const DEFAULT_EVIDENCE =
  'một vật chứng then chốt gắn trực tiếp với sự thật trung tâm của câu chuyện'
const DEFAULT_SETTING =
  'bối cảnh đô thị hiện đại nhiều áp lực cảm xúc như bệnh viện, trường học, sân bay, khách sạn, quán cà phê, phòng họp, biệt thự hoặc tiệc gia đình'
const DEFAULT_EMOTIONAL_HOOK =
  'khoảnh khắc nữ chính buộc phải đối diện sự thật hoặc chuẩn bị lật mặt một lời nói dối lớn'
const DEFAULT_STAKES =
  'danh dự, con cái, hôn nhân, thân phận, quyền lợi hoặc tương lai của nữ chính đang bị đe dọa'
const DEFAULT_MOOD = 'căng thẳng, cuốn hút, đau lòng, bí mật, phản công, vỡ lở'

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonRecord)
    : {}
}

function safeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback
}

function safeArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function compactText(...parts: unknown[]): string {
  return parts
    .flatMap((part) => {
      if (Array.isArray(part)) return part
      return [part]
    })
    .map((item) => safeString(item))
    .filter(Boolean)
    .join(' | ')
}

function normalizeText(value: unknown): string {
  return safeString(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function includesAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword))
}

function sanitizeForPrompt(value: string, fallback: string): string {
  const text = safeString(value, fallback).replace(/\s+/g, ' ').trim()
  return text || fallback
}

function tryJsonString(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return ''
  }
}

function buildChapterHints(story: JsonRecord): string {
  const titles = safeArray(story.chapterTitles || story.chapter_titles || story.chapters)
    .map((item) => {
      if (typeof item === 'string') return item.trim()
      const chapter = asRecord(item)
      return safeString(chapter.title || chapter.name || chapter.chapter_title)
    })
    .filter(Boolean)
    .slice(0, 8)

  return titles.join(' | ')
}

function normalizeCoverArtStyle(raw: unknown): CoverArtStyleKey {
  const value = normalizeText(raw)
  if (!value) return 'auto'

  if (
    value === 'anime_cinematic' ||
    value === 'anime-cinematic' ||
    value === 'anime' ||
    value.includes('anime cinematic') ||
    value.includes('anime dien anh')
  ) {
    return 'anime_cinematic'
  }

  if (
    value === 'manga_manhwa' ||
    value === 'manga-manhwa' ||
    value === 'manga' ||
    value === 'manhwa' ||
    value.includes('manga') ||
    value.includes('manhwa')
  ) {
    return 'manga_manhwa'
  }

  if (
    value === 'cinematic_realistic' ||
    value === 'cinematic-realistic' ||
    value === 'realistic' ||
    value.includes('cinematic') ||
    value.includes('realistic') ||
    value.includes('giong that') ||
    value.includes('poster phim')
  ) {
    return 'cinematic_realistic'
  }

  if (
    value === 'popular_webnovel_collage' ||
    value === 'popular-webnovel-collage' ||
    value.includes('collage') ||
    value.includes('webnovel') ||
    value.includes('tieu thuyet mang') ||
    value.includes('ua chuong')
  ) {
    return 'popular_webnovel_collage'
  }

  return 'auto'
}

function resolveFinalArtStyle(style: CoverArtStyleKey, sceneType: CoverSceneType): CoverArtStyleKey {
  if (style !== 'auto') return style

  if (sceneType === 'collage_story_poster') {
    return 'popular_webnovel_collage'
  }

  if (
    sceneType === 'hospital_legal_suspense' ||
    sceneType === 'boardroom_evidence_reveal' ||
    sceneType === 'school_parent_conflict'
  ) {
    return 'cinematic_realistic'
  }

  return 'anime_cinematic'
}

function inferKeyEvidence(text: string): string {
  if (includesAny(text, ['the nho', 'thẻ nhớ', 'memory card', 'sd card'])) {
    return 'một thẻ nhớ nhỏ chứa bằng chứng quyết định'
  }
  if (includesAny(text, ['usb'])) {
    return 'một chiếc USB chứa dữ liệu bí mật'
  }
  if (includesAny(text, ['ghi am', 'ghi âm', 'audio', 'file am thanh'])) {
    return 'một đoạn ghi âm hoặc thiết bị ghi âm làm lộ sự thật'
  }
  if (includesAny(text, ['camera', 'anh chup', 'ảnh chụp', 'buc anh', 'bức ảnh'])) {
    return 'ảnh chụp, camera hoặc hình ảnh bằng chứng gắn với bí mật trung tâm'
  }
  if (includesAny(text, ['ho so nhap hoc', 'nhập học', 'school file', 'hoc ba', 'học bạ'])) {
    return 'một bộ hồ sơ hoặc giấy tờ liên quan đến trường học và đứa trẻ'
  }
  if (includesAny(text, ['kham thai', 'khám thai', 'thai san', 'thai sản'])) {
    return 'một sổ khám thai hoặc hồ sơ thai sản hé lộ bí mật lớn'
  }
  if (includesAny(text, ['xet nghiem', 'xét nghiệm', 'adn', 'dna'])) {
    return 'kết quả xét nghiệm hoặc giấy ADN gắn với thân thế hoặc huyết thống'
  }
  if (includesAny(text, ['don thuoc', 'đơn thuốc', 'toa thuoc', 'toa thuốc'])) {
    return 'đơn thuốc hoặc toa thuốc là mấu chốt của bí mật'
  }
  if (includesAny(text, ['hop dong', 'hợp đồng', 'co phan', 'cổ phần'])) {
    return 'một tài liệu kinh doanh hoặc hợp đồng quan trọng'
  }
  if (includesAny(text, ['dien thoai', 'điện thoại', 'phone', 'tin nhan', 'tin nhắn'])) {
    return 'điện thoại chứa manh mối hoặc bằng chứng bị che giấu'
  }
  if (includesAny(text, ['gau bong', 'gấu bông', 'do choi', 'đồ chơi'])) {
    return 'một món đồ trẻ em gợi ra bí mật liên quan tới đứa trẻ'
  }

  return DEFAULT_EVIDENCE
}

function inferSetting(text: string): string {
  if (includesAny(text, ['benh vien', 'bệnh viện', 'phong kham', 'phòng khám', 'khoa san', 'khoa sản'])) {
    return 'bệnh viện, hành lang bệnh viện, phòng khám hoặc phòng họp liên quan tới hồ sơ y tế'
  }
  if (includesAny(text, ['truong hoc', 'trường học', 'phu huynh', 'phụ huynh', 'lop hoc', 'lớp học'])) {
    return 'trường học, phòng hiệu trưởng, phòng họp phụ huynh hoặc hành lang trường'
  }
  if (includesAny(text, ['san bay', 'sân bay', 'chuyen bay', 'chuyến bay', 'boarding'])) {
    return 'sân bay, khu chờ hoặc cửa ra máy bay với cảm giác bí mật sắp bị mang đi'
  }
  if (includesAny(text, ['khach san', 'khách sạn', 'resort', 'phong', 'phòng'])) {
    return 'khách sạn, resort hoặc nội thất riêng tư nơi sự phản bội bị phát hiện'
  }
  if (includesAny(text, ['hop bao', 'họp báo', 'livestream', 'su kien', 'sự kiện', 'da tiec', 'dạ tiệc'])) {
    return 'không gian công khai như dạ tiệc, họp báo hoặc sự kiện đông người'
  }
  if (includesAny(text, ['hoi dong', 'hội đồng', 'boardroom', 'co phan', 'cổ phần', 'van phong', 'văn phòng'])) {
    return 'phòng họp cao cấp, văn phòng quyền lực hoặc không gian doanh nghiệp hiện đại'
  }
  if (includesAny(text, ['bua an', 'bữa ăn', 'ban an', 'bàn ăn', 'gia dinh', 'gia đình', 'biet thu', 'biệt thự'])) {
    return 'biệt thự, bàn tiệc gia đình hoặc không gian hào môn đầy áp lực'
  }
  if (includesAny(text, ['quan ca phe', 'quán cà phê', 'cafe'])) {
    return 'quán cà phê hoặc không gian đô thị nơi vật chứng được mở ra'
  }

  return DEFAULT_SETTING
}

function inferStakes(text: string): string {
  if (includesAny(text, ['tranh quyen nuoi', 'quyền nuôi', 'nhan nuoi', 'nhận nuôi', 'con nuoi', 'con nuôi'])) {
    return 'quyền nuôi con, danh nghĩa người mẹ và sự an toàn của đứa trẻ'
  }
  if (includesAny(text, ['hon nhan', 'hôn nhân', 'ngoai tinh', 'ngoại tình', 'tieu tam', 'tiểu tam'])) {
    return 'hôn nhân, danh dự và quyền lựa chọn tương lai của nữ chính'
  }
  if (includesAny(text, ['than the', 'thân thế', 'di chuc', 'di chúc', 'thua ke', 'thừa kế', 'adn', 'dna'])) {
    return 'thân thế thật, quyền thừa kế và vị trí của nữ chính trong gia đình hoặc gia tộc'
  }
  if (includesAny(text, ['co phan', 'cổ phần', 'cong ty', 'công ty', 'hop dong', 'hợp đồng'])) {
    return 'quyền lực, tài sản và vị thế của nữ chính trong cuộc chiến doanh nghiệp'
  }
  if (includesAny(text, ['benh vien', 'bệnh viện', 'toa thuoc', 'toa thuốc', 'xet nghiem', 'xét nghiệm'])) {
    return 'sự thật y tế, tính mạng, danh dự nghề nghiệp và trách nhiệm pháp lý'
  }

  return DEFAULT_STAKES
}

function inferSceneType(text: string, requested: string): CoverSceneType {
  const requestedNormalized = normalizeText(requested)
  if (requestedNormalized) {
    if (requestedNormalized.includes('collage')) return 'collage_story_poster'
    if (requestedNormalized.includes('mother') || requestedNormalized.includes('child')) return 'mother_child_protection'
    if (requestedNormalized.includes('evidence')) return 'evidence_discovery_scene'
    if (requestedNormalized.includes('public')) return 'public_reveal_confrontation'
    if (requestedNormalized.includes('betrayal')) return 'private_betrayal_confrontation'
    if (requestedNormalized.includes('hospital')) return 'hospital_legal_suspense'
    if (requestedNormalized.includes('school')) return 'school_parent_conflict'
    if (requestedNormalized.includes('airport')) return 'airport_secret_tension'
    if (requestedNormalized.includes('family')) return 'family_banquet_confrontation'
    if (requestedNormalized.includes('boardroom')) return 'boardroom_evidence_reveal'
  }

  if (includesAny(text, ['nhan nuoi', 'nhận nuôi', 'tranh quyen nuoi', 'quyền nuôi', 'con nuoi', 'con nuôi', 'gau bong', 'gấu bông', 'me con', 'mẹ con'])) {
    return 'mother_child_protection'
  }
  if (includesAny(text, ['truong hoc', 'trường học', 'phu huynh', 'phụ huynh', 'nhap hoc', 'nhập học', 'bat nat', 'bắt nạt'])) {
    return 'school_parent_conflict'
  }
  if (includesAny(text, ['benh vien', 'bệnh viện', 'phong kham', 'phòng khám', 'xet nghiem', 'xét nghiệm', 'toa thuoc', 'toa thuốc', 'kham thai', 'khám thai'])) {
    return 'hospital_legal_suspense'
  }
  if (includesAny(text, ['san bay', 'sân bay', 'chuyen bay', 'chuyến bay', 'boarding', 'departure'])) {
    return 'airport_secret_tension'
  }
  if (includesAny(text, ['hop bao', 'họp báo', 'livestream', 'hot search', 'cong khai', 'công khai', 'quy goi', 'quỳ gối', 'da tiec', 'dạ tiệc', 'bao chi', 'báo chí'])) {
    return 'public_reveal_confrontation'
  }
  if (includesAny(text, ['ngoai tinh', 'ngoại tình', 'tieu tam', 'tiểu tam', 'khach san', 'khách sạn', 'hon le', 'hôn lễ', 'chong', 'chồng', 'vo', 'vợ'])) {
    return 'private_betrayal_confrontation'
  }
  if (includesAny(text, ['the nho', 'thẻ nhớ', 'usb', 'ghi am', 'ghi âm', 'camera', 'anh chup', 'ảnh chụp', 'dien thoai', 'điện thoại'])) {
    return 'evidence_discovery_scene'
  }
  if (includesAny(text, ['gia toc', 'gia tộc', 'ban an', 'bàn ăn', 'tiec gia dinh', 'tiệc gia đình', 'biet thu', 'biệt thự', 'me chong', 'mẹ chồng'])) {
    return 'family_banquet_confrontation'
  }
  if (includesAny(text, ['hoi dong', 'hội đồng', 'co phan', 'cổ phần', 'boardroom', 'tong giam doc', 'tổng giám đốc'])) {
    return 'boardroom_evidence_reveal'
  }
  if (includesAny(text, ['bi mat', 'bí mật', 'anh bi xe', 'ảnh bị xé', 'qua khu', 'quá khứ', 'ky uc', 'ký ức'])) {
    return 'collage_story_poster'
  }

  return 'evidence_discovery_scene'
}

function inferStoryStage(currentChapterCount: number, targetChapters: number): CoverStoryStage {
  if (!targetChapters || targetChapters <= 0) return 'early-hook'
  const ratio = currentChapterCount / targetChapters
  if (ratio < 0.34) return 'early-hook'
  if (ratio < 0.76) return 'mid-escalation'
  return 'late-payoff'
}

function inferMood(sceneType: CoverSceneType): string {
  switch (sceneType) {
    case 'mother_child_protection':
      return 'tender but dangerous, protective, tense, emotional, maternal, dramatic'
    case 'school_parent_conflict':
      return 'humiliated, protective, tense, public pressure, righteous anger, dramatic'
    case 'hospital_legal_suspense':
      return 'cold tension, hidden truth, legal pressure, emotional suspense, modern urban drama'
    case 'airport_secret_tension':
      return 'departure tension, secrecy, emotional distance, night-city melancholy, truth on the move'
    case 'public_reveal_confrontation':
      return 'explosive reveal, public humiliation, power reversal, glamorous tension, high drama'
    case 'private_betrayal_confrontation':
      return 'betrayal, heartbreak, intimate scandal, suffocating tension, elegant bitterness'
    case 'family_banquet_confrontation':
      return 'beautiful but suffocating, wealthy family pressure, silence before explosion, emotional poison'
    case 'boardroom_evidence_reveal':
      return 'cold authority, power clash, corporate pressure, evidence reveal, controlled rage'
    case 'collage_story_poster':
      return 'layered secrets, emotional memory fragments, betrayal, obsession, hidden truth'
    case 'evidence_discovery_scene':
    default:
      return 'mysterious, intimate, tense, story-rich, emotional, truth about to surface'
  }
}

function buildSourceText(story: JsonRecord, storyDna: JsonRecord): string {
  return compactText(
    story.title,
    story.summary,
    story.description,
    story.coverBrief,
    story.genre,
    story.genreLabel,
    safeArray(story.genres).join(' | '),
    safeArray(story.tags).join(' | '),
    buildChapterHints(story),
    tryJsonString(storyDna),
  )
}

function firstNonEmpty(record: JsonRecord, keys: string[]): string {
  for (const key of keys) {
    const value = safeString(record[key])
    if (value) return value
  }
  return ''
}

function buildPromptData(input: unknown) {
  const story = asRecord(input)
  const storyDna = asRecord(story.story_dna || story.storyDna)
  const textBlob = normalizeText(buildSourceText(story, storyDna))

  const currentChapterCount = Number(story.currentChapterCount || story.current_chapter_count || 0) || 0
  const targetChapters = Number(story.targetChapters || story.target_chapters || 0) || 0

  const requestedStyle = normalizeCoverArtStyle(
    story.coverArtStyle || story.cover_art_style || story.style || story.visual_style || story.cover_style,
  )

  const requestedSceneType = safeString(story.suggestedCoverSceneType || story.suggested_cover_scene_type)
  const sceneType = inferSceneType(textBlob, requestedSceneType)
  const coverArtStyle = resolveFinalArtStyle(requestedStyle, sceneType)

  const title = sanitizeForPrompt(safeString(story.title), DEFAULT_TITLE)
  const genre = sanitizeForPrompt(
    safeString(story.genreLabel || story.genre || safeArray(story.genres).join(', ')),
    DEFAULT_GENRE,
  )
  const heroine = sanitizeForPrompt(
    firstNonEmpty(storyDna, ['heroine', 'coverHeroine', 'femaleLead', 'heroineProfile']) ||
      firstNonEmpty(story, ['heroine', 'femaleLead', 'heroineLabel']),
    DEFAULT_HEROINE,
  )
  const antagonist = sanitizeForPrompt(
    firstNonEmpty(storyDna, ['antagonist', 'villain', 'pressureSource']) ||
      firstNonEmpty(story, ['antagonist', 'villain']),
    DEFAULT_ANTAGONIST,
  )
  const relationshipCore = sanitizeForPrompt(
    firstNonEmpty(storyDna, ['relationshipCore', 'coreConflict', 'relationshipConflict']) ||
      firstNonEmpty(story, ['relationshipCore', 'coreConflict']),
    DEFAULT_RELATIONSHIP,
  )
  const keyEvidence = sanitizeForPrompt(
    firstNonEmpty(storyDna, ['keyEvidence', 'signatureObject', 'evidenceType', 'evidenceObject']) ||
      firstNonEmpty(story, ['keyEvidence', 'signatureObject']) ||
      inferKeyEvidence(textBlob),
    DEFAULT_EVIDENCE,
  )
  const setting = sanitizeForPrompt(
    firstNonEmpty(storyDna, ['setting', 'arena', 'mainArena', 'openingArena']) ||
      firstNonEmpty(story, ['setting', 'arena']) ||
      inferSetting(textBlob),
    DEFAULT_SETTING,
  )
  const emotionalHook = sanitizeForPrompt(
    firstNonEmpty(storyDna, ['emotionalHook', 'emotionalCore', 'hook']) ||
      safeString(story.summary || story.description || story.coverBrief),
    DEFAULT_EMOTIONAL_HOOK,
  )
  const stakes = sanitizeForPrompt(
    firstNonEmpty(storyDna, ['stakes', 'storyStakes', 'risk']) || inferStakes(textBlob),
    DEFAULT_STAKES,
  )
  const moodKeywords = sanitizeForPrompt(
    firstNonEmpty(storyDna, ['moodKeywords', 'mood', 'tone']) || inferMood(sceneType),
    DEFAULT_MOOD,
  )
  const chapterHints = sanitizeForPrompt(buildChapterHints(story), '')
  const storyStage = inferStoryStage(currentChapterCount, targetChapters)

  return {
    title,
    genre,
    heroine,
    antagonist,
    relationshipCore,
    keyEvidence,
    setting,
    emotionalHook,
    stakes,
    moodKeywords,
    chapterHints,
    currentChapterCount,
    targetChapters,
    coverArtStyle,
    sceneType,
    storyStage,
  }
}

function buildPrimaryGoalBlock(): string {
  return `
Create a premium vertical Chinese commercial webnovel cover illustration, aspect ratio 2:3.

PRIMARY GOAL:
This cover must visually tell the actual story.
Do NOT create a generic beauty portrait.
Do NOT create a random fashionable character image disconnected from the plot.
The cover must clearly communicate the core conflict, emotional pressure, and most important evidence object.
`.trim()
}

function buildStoryCoreBlock(data: ReturnType<typeof buildPromptData>): string {
  return `
STORY CORE — highest priority:
- Title: "${data.title}"
- Genre: ${data.genre}
- Female lead: ${data.heroine}
- Antagonist / opposing force: ${data.antagonist}
- Core relationship / conflict: ${data.relationshipCore}
- Main setting: ${data.setting}
- Key evidence object: ${data.keyEvidence}
- Emotional hook: ${data.emotionalHook}
- Stakes: ${data.stakes}
- Mood keywords: ${data.moodKeywords}
- Existing chapter hints: ${data.chapterHints || 'chưa có gợi ý chương rõ ràng'}

STORY CONTENT LOCK:
- The image must look specific to THIS story.
- The key evidence object must be visible and story-relevant.
- The scene must show why the story is tense, painful, and addictive.
- Use environment, supporting characters, posture, gaze, distance, and evidence objects to tell the plot.
- Do not replace the key evidence with a generic blank paper prop unless the story itself is about a document.
`.trim()
}

function buildStoryStageBlock(stage: CoverStoryStage): string {
  switch (stage) {
    case 'mid-escalation':
      return `
STORY STAGE RULE:
The story appears to be in the middle phase.
Choose the strongest active conflict or major escalation scene.
Do not invent a final ending image too early.
Show the current pressure, danger, or reveal that is already emotionally active.
`.trim()
    case 'late-payoff':
      return `
STORY STAGE RULE:
The story appears to be near the late phase.
Choose a payoff-heavy cover moment: confrontation, reveal, protection, power reversal, or truth surfacing.
The image may feel more decisive and emotionally heavier.
`.trim()
    case 'early-hook':
    default:
      return `
STORY STAGE RULE:
The story appears to be in the early hook phase.
Choose the best inciting incident or discovery moment.
The cover should promise secrets, pain, and future confrontation without needing the full ending.
`.trim()
  }
}

function buildStyleBlock(style: CoverArtStyleKey): string {
  switch (style) {
    case 'manga_manhwa':
      return `
STYLE PRESET LOCK: MANGA_CHINESE_WEBNOVEL.

OPTION MEANING:
Manga — Chinese commercial webnovel cover.

CORE AESTHETIC TARGET:
- The artwork must look like a premium Chinese commercial webnovel cover rendered in a polished manga/manhua-inspired illustration style.
- This is NOT Japanese black-and-white manga, NOT screentone manga, NOT flat shoujo manga, NOT comedic manga.
- It should feel like luxury Chinese manhua / webnovel key art: elegant, dramatic, glamorous, emotionally addictive.

RENDERING:
- Clean line art with polished luxury rendering.
- Refined modern East Asian faces, glossy hair, luminous skin, elegant eyes, attractive fashionable styling.
- More line-art driven than anime_cinematic, but still richly rendered and commercially beautiful.
- Sharp silhouettes, controlled detail, premium finish.
- The final image must be full-color, polished, and poster-ready.

COLOR / LIGHT:
- Use glossy commercial palette: deep navy, champagne gold, pearl white, espresso brown, soft wine red, teal glass reflections.
- Strong readability, clean contrast, dramatic but beautiful lighting.
- Avoid muddy yellow-green, horror grading, flat cel-shading, and rustic realism.

MOOD:
- Dramatic, luxurious, urban, premium, story-rich.
- Must feel closer to Chinese commercial webnovel / manhua cover art than to Japanese manga magazine art.
`.trim()

    case 'cinematic_realistic':
      return `
STYLE PRESET LOCK: ULTRA_REALISTIC_URBAN_DRAMA_POSTER.

OPTION MEANING:
Siêu thực — urban drama premium poster illustration.

CORE AESTHETIC TARGET:
- The artwork must feel like an ultra-realistic premium Chinese urban-drama poster illustration.
- It should look like luxury entertainment key art: dramatic, polished, emotionally tense, modern, expensive.
- Not raw photography, but very close to high-end poster realism.

RENDERING:
- Hyper-detailed semi-realistic to ultra-realistic illustration.
- Beautiful modern East Asian faces, realistic light falloff, cinematic skin rendering, elegant hair detail, believable luxury interiors.
- Premium poster sharpness, rich reflections, clean cinematic depth.
- Faces and bodies should feel realistic, refined, and expensive, not anime/cartoon.

COLOR / LIGHT:
- Luxury drama palette: black, navy, charcoal, champagne gold, warm white, city-light blue, glass reflections, chandelier highlights.
- Can be cool-night luxury or warm-golden banquet luxury depending on the story.
- Avoid cartoon/anime exaggeration, avoid horror grading, avoid muddy green-yellow.

MOOD:
- Premium, serious, urban, glamorous, emotionally intense, highly clickable.
- This should feel like a high-end Chinese urban drama poster illustration.
`.trim()

    case 'popular_webnovel_collage':
      return `
STYLE PRESET LOCK: CHINESE_MANHUA_LUXURY_COLLAGE.

OPTION MEANING:
Chinese manhua luxury collage.

CORE AESTHETIC TARGET:
- The artwork must look like a premium Chinese manhua luxury collage cover.
- This is the strongest multi-layered story cover style.
- It must feel glossy, dense, emotionally dramatic, luxurious, and highly commercial.

RENDERING LANGUAGE:
- Semi-realistic to highly-polished illustrated rendering.
- Beautiful modern East Asian faces with refined Chinese webnovel beauty standards.
- Luminous skin, glossy hair strands, elegant eyes, premium fashion styling.
- Rich detail, polished highlights, dramatic depth, layered storytelling montage.
- Not Japanese manga. Not monochrome manga. Not soft TV-anime poster. Not flat cel shading.

COMPOSITION:
- One main heroine as the visual anchor, but not a simple centered portrait.
- Surround her with 3 to 7 layered story fragments / mini-scenes / emotional flashpoints.
- Fragments may include: male lead, antagonist, child, family pressure, betrayal, evidence object, hospital clue, banquet conflict, boardroom, hotel, public scandal, city-night reveal.
- The collage must feel dense, elegant, layered, story-rich, and readable at thumbnail size.
- The heroine can be visually important, but the surrounding layers must clearly show the story.

COLOR / LIGHT:
- Premium Chinese webnovel collage palette.
- Preferred colors: deep navy, midnight blue, champagne gold, crystal white, espresso brown, cool black, silver glow, warm amber, subtle wine red accents.
- Strong contrast, glossy reflections, city-light sparkle, chandelier glow, glass reflections, luxury interior shine.
- Avoid muddy domestic brown realism and avoid horror grading.

MOOD / FINISH:
- Luxurious, dramatic, emotionally addictive, premium, polished, glamorous.
- Must feel like a high-performing Chinese paid webnovel cover.
- Avoid plain family-drama poster look, avoid countryside realism, avoid soft Japanese anime feeling.
`.trim()

    case 'anime_cinematic':
    default:
      return `
STYLE PRESET LOCK: ANIME_CHINESE_WEBNOVEL.

OPTION MEANING:
Anime — Chinese commercial webnovel cover.

CORE AESTHETIC TARGET:
- The artwork must look like a premium Chinese commercial webnovel cover rendered in a polished anime-inspired style.
- This is NOT flat Japanese TV-anime style, NOT school-anime, NOT chibi, NOT slice-of-life anime.
- It should feel mature, glamorous, urban, glossy, and commercially attractive.

RENDERING:
- Beautiful anime-inspired modern East Asian faces.
- Mature glamorous character design, high-detail hair, luminous skin, elegant modern fashion, polished lighting.
- Richer, denser, more luxurious than normal anime illustration.
- Must feel closer to Chinese webnovel / manhua cover art than ordinary Japanese anime.

COLOR / LIGHT:
- Clean luxury palette: navy, black, champagne gold, rose beige, cool white, glass blue, warm brown accents.
- Glossy reflections, soft rim light, city-light sparkle, premium poster contrast.
- Avoid muddy yellow-green, horror grading, and childish cel-shading.

MOOD:
- Dramatic, beautiful, premium, urban, emotionally intense, highly clickable.
- Use cinematic anime composition with visible environment and story clues.
`.trim()
  }
}

function buildRenderingIdentityBlock(style: CoverArtStyleKey): string {
  switch (style) {
    case 'anime_cinematic':
      return `
RENDERING IDENTITY LOCK:
- Target premium Chinese commercial webnovel cover art rendered with anime-inspired beauty.
- Do NOT drift into Japanese TV-anime style, school-anime style, slice-of-life style, or soft shoujo poster style.
- Prioritize glossy rendering, mature faces, rich lighting, luxurious drama atmosphere, and commercial thumbnail appeal.
- The image should feel like a Chinese paid webnovel cover, not a Japanese anime character poster.
`.trim()

    case 'manga_manhwa':
      return `
RENDERING IDENTITY LOCK:
- Target premium Chinese webnovel / manhua cover art rendered with manga/manhua-inspired line quality.
- Do NOT drift into black-and-white Japanese manga, screentone manga, magazine manga aesthetics, or flat webtoon panels.
- Prioritize luxury line-art illustration, dramatic polish, beautiful faces, premium commercial color, and story-rich environment.
`.trim()

    case 'popular_webnovel_collage':
      return `
RENDERING IDENTITY LOCK:
- Target Chinese manhua luxury collage cover language.
- Prioritize layered storytelling montage, premium glamour, glossy lighting, rich story density, and high-end Chinese webnovel beauty.
- Do NOT drift into Japanese manga panel style, simple anime poster style, or plain family-drama realism.
- This option must be the most layered, richest, and most commercially dramatic cover style.
`.trim()

    case 'cinematic_realistic':
    default:
      return `
RENDERING IDENTITY LOCK:
- Target ultra-realistic premium Chinese urban-drama poster illustration.
- Prioritize luxury realism, believable cinematic light, high-end interiors, attractive faces, and premium poster impact.
- Do NOT drift into anime, manga paneling, flat webtoon rendering, or raw stock photography.
`.trim()
  }
}

function buildSceneSelectionBlock(sceneType: CoverSceneType, style: CoverArtStyleKey): string {
  const collageNote =
    style === 'popular_webnovel_collage'
      ? 'Because the selected style is collage-oriented, use one central heroine plus 3 to 6 supporting story fragments around her.'
      : 'Prefer one dominant main scene. You may add limited supporting figures or one subtle secondary layer, but keep the composition clean.'

  switch (sceneType) {
    case 'mother_child_protection':
      return `
COVER SCENE MODE: MOTHER_CHILD_PROTECTION.
${collageNote}
- The emotional center is a woman protecting a child or child-related truth.
- Show the child clearly, or show a strongly implied child presence through teddy bear, school item, adoption clue, child photo, or small body language.
- Supporting antagonists or pressure figures should appear behind or around them.
- The cover must communicate protection, threat, and maternal pain.
`.trim()

    case 'school_parent_conflict':
      return `
COVER SCENE MODE: SCHOOL_PARENT_CONFLICT.
${collageNote}
- Show a school office, hallway, meeting room, parent conference room, or school-adjacent environment.
- The female lead must feel emotionally pressured yet controlled.
- A school-related clue should appear: student item, school folder, parent meeting setting, child-related document, or child silhouette.
- The conflict should read as adult power pressure affecting a child.
`.trim()

    case 'hospital_legal_suspense':
      return `
COVER SCENE MODE: HOSPITAL_LEGAL_SUSPENSE.
${collageNote}
- Show hospital, clinic, medical corridor, consultation room, or legal-pressure setting linked to a medical truth.
- Key props can include prescription, test result folder, medical envelope, or phone showing an unreadable hospital-related image.
- The cover should feel cold, modern, tense, and evidence-driven.
`.trim()

    case 'airport_secret_tension':
      return `
COVER SCENE MODE: AIRPORT_SECRET_TENSION.
${collageNote}
- Show airport lounge, departure gate, large glass window, runway, luggage, or boarding atmosphere.
- The female lead should feel like she is carrying a secret, leaving with truth, or catching someone trying to escape.
- The evidence object must be near the hand, table, bag, or suitcase.
`.trim()

    case 'public_reveal_confrontation':
      return `
COVER SCENE MODE: PUBLIC_REVEAL_CONFRONTATION.
${collageNote}
- Show a public reveal moment at a banquet, party, media event, livestream-like setting, or public confrontation.
- The female lead is exposing proof or controlling the moment.
- Background reactions must help tell the story: shock, fear, humiliation, pressure, or reversal.
`.trim()

    case 'private_betrayal_confrontation':
      return `
COVER SCENE MODE: PRIVATE_BETRAYAL_CONFRONTATION.
${collageNote}
- Show a private or semi-private emotional betrayal scene.
- Good settings: hotel, elegant apartment, bedroom-adjacent corridor, living room, or intimate interior.
- Include at least one opposing figure and make the emotional rupture visually obvious.
- The key evidence should feel personal: photo, room card, phone, letter, or private proof.
`.trim()

    case 'family_banquet_confrontation':
      return `
COVER SCENE MODE: FAMILY_BANQUET_CONFRONTATION.
${collageNote}
- Show wealthy family dining, banquet, or villa confrontation.
- Multiple family members can appear, but the female lead must remain the emotional center.
- Beauty on the surface, poison underneath.
- Table setting, tea, dishes, and evidence object should help tell the story.
`.trim()

    case 'boardroom_evidence_reveal':
      return `
COVER SCENE MODE: BOARDROOM_EVIDENCE_REVEAL.
${collageNote}
- Show boardroom, corporate meeting room, office tower interior, or high-status negotiation space.
- The female lead should feel pressured but not broken.
- The evidence object should look decisive and tied to power, ownership, betrayal, or control.
- Background supporting cast should read as executives, family power, or silent witnesses.
`.trim()

    case 'collage_story_poster':
      return `
COVER SCENE MODE: COLLAGE_STORY_POSTER.
- Use a strong commercial web-novel collage layout.
- One central female lead.
- 3 to 6 supporting mini-scenes or image fragments around her.
- Use the fragments to show relationship damage, evidence, memory, betrayal, child danger, hidden truth, or public conflict.
- Make the collage easy to read, elegant, and emotionally heavy.
`.trim()

    case 'evidence_discovery_scene':
    default:
      return `
COVER SCENE MODE: EVIDENCE_DISCOVERY_SCENE.
${collageNote}
- Show the female lead actively holding, opening, discovering, or presenting the key evidence.
- The surrounding environment should reveal the story context.
- Supporting figures can be placed behind, reflected, seated, or partially visible to create pressure.
- This must feel like the exact moment a dangerous truth begins to surface.
`.trim()
  }
}

function buildFramingAndCharacterBlock(): string {
  return `
CHARACTER / ETHNICITY / FRAMING RULES:
- Characters must look like modern East Asian adults, preferably modern Chinese urban-drama appearance.
- One clear female lead must anchor the image.
- Do not make the female lead too large.
- Do not create an extreme close-up portrait.
- Prefer medium shot, medium-long shot, or 3/4 body composition.
- The heroine should usually occupy about 35% to 50% of the frame, not the whole frame.
- Leave enough room to show setting, supporting cast, and evidence.
- Supporting characters should only be added when they strengthen the story.
`.trim()
}

function buildNoTextBlock(): string {
  return `
ANTI-TEXT RULES — absolute priority:
- Absolutely no text anywhere inside the artwork.
- Do not render the story title.
- Do not render Vietnamese text, English text, Chinese text, letters, words, captions, subtitles, logos, watermarks, labels, brand marks, UI, signage, chat bubbles, or typography.
- Do not place any readable text on phones, computer screens, hospital documents, contracts, tickets, folders, books, reports, photos, ID cards, certificates, school files, prescription papers, or envelopes.
- If a document or phone is visible, it must be blank, abstract, blurred, dark, turned away, out of focus, or unreadable.
- If the model tries to add text, remove it completely.
`.trim()
}

function buildAntiGenericBlock(sceneType: CoverSceneType): string {
  const sceneSpecificLines: string[] = []

  if (sceneType === 'mother_child_protection') {
    sceneSpecificLines.push('- Do not forget the child-related presence or clue.')
  }
  if (sceneType === 'school_parent_conflict') {
    sceneSpecificLines.push('- Do not remove all school-related visual cues.')
  }
  if (sceneType === 'hospital_legal_suspense') {
    sceneSpecificLines.push('- Do not turn this into a generic banquet or fashion portrait.')
  }
  if (sceneType === 'airport_secret_tension') {
    sceneSpecificLines.push('- Do not lose the airport setting.')
  }

  return `
ANTI-GENERIC RULES:
- Do not create a generic beautiful-woman poster.
- Do not ignore the actual story conflict.
- Do not make the cover depend only on a single face.
- Do not hide the evidence object.
- Do not replace story-specific clues with random decorative props.
- Do not create a children cartoon, fantasy scene, historical costume, or unrelated sci-fi setting.
- Do not show blood, gore, corpses, wounds, knives, guns, explicit violence, or self-harm.
- If the story contains dangerous events, show them only through emotional tension, lighting, distance, posture, reflections, and atmosphere.
${sceneSpecificLines.join('\n')}
`.trim()
}

function buildFinalInstructionBlock(style: CoverArtStyleKey): string {
  const styleCompositionLine =
    style === 'popular_webnovel_collage'
      ? '- Because the selected style is Chinese manhua luxury collage, the final image should feel layered, story-dense, glamorous, and premium.'
      : '- Keep the composition clear, premium, and story-focused rather than messy.'

  return `
FINAL OUTPUT INSTRUCTION:
Create one polished final vertical 2:3 cover illustration.
The image must feel like a commercially strong Chinese webnovel cover: dramatic, emotional, addictive, polished, highly clickable, and clearly storytelling through visible environment and supporting story layers.
Story content, conflict, setting, and evidence are more important than decorative prettiness.
${styleCompositionLine}

COMMERCIAL COLOR REQUIREMENT:
- Avoid muddy green/yellow horror grading, heavy grey-black, sickly skin, dirty shadows, plain domestic brown realism, and dull family-poster color.
- Prefer glossy luxury-drama color: deep navy, midnight blue, champagne gold, crystal white, warm brown, espresso black, glass reflections, city-light glow, chandelier sparkle, elegant contrast, subtle wine red accents.
- The final color finish should feel closer to premium Chinese webnovel cover art than to ordinary anime, Japanese manga, or plain family-drama illustration.

STYLE IDENTITY REQUIREMENT:
- Anime option must still feel like Chinese commercial webnovel cover art.
- Manga option must still feel like Chinese commercial webnovel / manhua cover art.
- Collage option must feel like Chinese manhua luxury collage with multiple story layers.
- Realistic option must feel like ultra-realistic Chinese urban drama premium poster illustration.

The final result must be a finished cover artwork illustration only, with zero text inside the image.
`.trim()
}

function buildFallbackPrompt(data: ReturnType<typeof buildPromptData>): string {
  return `Vertical 2:3 premium Chinese commercial webnovel cover illustration. Style option: ${data.coverArtStyle}. Modern East Asian female lead. Glossy luxury-drama color: deep navy, midnight blue, champagne gold, crystal white, espresso brown, glass reflections, city-light glow, chandelier sparkle, elegant contrast. Story-specific evidence must be visible: ${data.keyEvidence}. Main setting: ${data.setting}. Core conflict: ${data.relationshipCore}. Emotional hook: ${data.emotionalHook}. Mood: ${data.moodKeywords}. Absolutely no text anywhere in the image. No title, no words, no letters, no logos, no watermark, no readable phone screen, no readable documents, no readable signage, no readable labels. Documents and screens must be blank, abstract, blurred, turned away, or unreadable. Not a generic portrait. Use an off-center storytelling composition. Show the environment, supporting figures, and conflict clearly. Prefer medium-long shot, 3/4 body, or elegant full-body framing. The heroine should usually occupy about 28% to 40% of the frame width and must not block most of the background. No Japanese manga panel look, no flat TV-anime look, no plain family-drama realism, no horror, no muddy green-yellow grading, no sickly skin, no blood, no wounds, no corpse, no weapons, no explicit violence.`
}

export function buildCoverPrompt(input: StoryInput | JsonRecord | unknown): CoverBuildResult {
  const data = buildPromptData(input)

  const prompt = [
    buildPrimaryGoalBlock(),
    buildStoryCoreBlock(data),
    buildStoryStageBlock(data.storyStage),
    buildStyleBlock(data.coverArtStyle),
    buildRenderingIdentityBlock(data.coverArtStyle),
    buildSceneSelectionBlock(data.sceneType, data.coverArtStyle),
    buildFramingAndCharacterBlock(),
    buildNoTextBlock(),
    buildAntiGenericBlock(data.sceneType),
    buildFinalInstructionBlock(data.coverArtStyle),
  ].join('\n\n')

  return {
    prompt,
    fallbackPrompt: buildFallbackPrompt(data),
    coverConcept: {
      version: 'cover-scene-style-router-v1',
      coverArtStyle: data.coverArtStyle,
      sceneType: data.sceneType,
      storyStage: data.storyStage,
      title: data.title,
      genre: data.genre,
      heroine: data.heroine,
      antagonist: data.antagonist,
      relationshipCore: data.relationshipCore,
      keyEvidence: data.keyEvidence,
      setting: data.setting,
      emotionalHook: data.emotionalHook,
      stakes: data.stakes,
      moodKeywords: data.moodKeywords,
      chapterHints: data.chapterHints,
      currentChapterCount: data.currentChapterCount,
      targetChapters: data.targetChapters,
    },
  }
}

export default buildCoverPrompt
