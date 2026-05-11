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

type CoverCompositionPreset = 'auto' | 'story_scene_offset' | 'luxury_collage'

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
    value === 'anime_glossy' ||
    value === 'anime-glossy' ||
    value.includes('anime cinematic') ||
    value.includes('anime dien anh') ||
    value.includes('anime webnovel') ||
    value.includes('anime bong bay') ||
    value.includes('anime bóng bẩy')
  ) {
    return 'anime_cinematic'
  }

  if (
    value === 'manga_manhwa' ||
    value === 'manga-manhwa' ||
    value === 'manhwa_drama' ||
    value === 'manhwa-drama' ||
    value === 'manga' ||
    value === 'manhwa' ||
    value.includes('manga') ||
    value.includes('manhwa') ||
    value.includes('manhua')
  ) {
    return 'manga_manhwa'
  }

  if (
    value === 'cinematic_realistic' ||
    value === 'cinematic-realistic' ||
    value === 'cinematic_semi_realistic' ||
    value === 'cinematic-semi-realistic' ||
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
    value === 'monochrome_collage' ||
    value === 'monochrome-collage' ||
    value === 'promo_poster' ||
    value === 'promo-poster' ||
    value.includes('collage') ||
    value.includes('webnovel') ||
    value.includes('tieu thuyet mang') ||
    value.includes('ua chuong') ||
    value.includes('poster quang ba') ||
    value.includes('poster quảng bá')
  ) {
    return 'popular_webnovel_collage'
  }

  return 'auto'
}

function normalizeCoverCompositionPreset(raw: unknown): CoverCompositionPreset {
  const value = normalizeText(raw)
  if (!value) return 'auto'

  if (
    value === 'story_scene_offset' ||
    value === 'story-scene-offset' ||
    value === 'single_heroine_center' ||
    value === 'single-heroine-center' ||
    value === 'evidence_focus' ||
    value === 'evidence-focus' ||
    value === 'public_confrontation' ||
    value === 'public-confrontation' ||
    value === 'mother_child_protection' ||
    value === 'mother-child-protection' ||
    value === 'betrayal_triangle' ||
    value === 'betrayal-triangle' ||
    value.includes('background rong') ||
    value.includes('lech khung') ||
    value.includes('nhan vat trung tam') ||
    value.includes('nhân vật trung tâm') ||
    value.includes('vat chung') ||
    value.includes('vật chứng') ||
    value.includes('doi dau') ||
    value.includes('đối đầu') ||
    value.includes('me con') ||
    value.includes('mẹ con') ||
    value.includes('phan boi') ||
    value.includes('phản bội')
  ) {
    return 'story_scene_offset'
  }

  if (
    value === 'luxury_collage' ||
    value === 'luxury-collage' ||
    value === 'collage_story_poster' ||
    value === 'collage-story-poster' ||
    value.includes('collage') ||
    value.includes('nhieu lop') ||
    value.includes('nhiều lớp')
  ) {
    return 'luxury_collage'
  }

  return 'auto'
}

function resolveFinalArtStyle(
  style: CoverArtStyleKey,
  sceneType: CoverSceneType,
  compositionPreset: CoverCompositionPreset,
): CoverArtStyleKey {
  if (style !== 'auto') return style

  if (compositionPreset === 'luxury_collage' || sceneType === 'collage_story_poster') {
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
  const compositionPreset = normalizeCoverCompositionPreset(
    story.coverCompositionPreset ||
      story.cover_composition_preset ||
      asRecord(story.story_dna || story.storyDna).coverCompositionPreset ||
      asRecord(story.story_dna || story.storyDna).cover_composition_preset,
  )
  const coverArtStyle = resolveFinalArtStyle(requestedStyle, sceneType, compositionPreset)

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
    compositionPreset,
  }
}

function chooseCompositionMode(data: {
  title: string
  sceneType: CoverSceneType
  coverArtStyle: CoverArtStyleKey
  compositionPreset: CoverCompositionPreset
}): 'single_offset_scene' | 'luxury_collage' {
  if (data.compositionPreset === 'luxury_collage') return 'luxury_collage'
  if (data.compositionPreset === 'story_scene_offset') return 'single_offset_scene'
  if (data.coverArtStyle === 'popular_webnovel_collage' || data.sceneType === 'collage_story_poster') {
    return 'luxury_collage'
  }
  return 'single_offset_scene'
}

function buildPrimaryGoalBlock(): string {
  return `
Create one premium vertical web-novel cover illustration, aspect ratio 2:3.

PRIMARY GOAL:
This cover must visually tell the actual story.
This must NOT be a glamour portrait, beauty portrait, face card, profile-card illustration, or generic pretty-girl poster.
The viewer should understand the conflict from the image: setting, pressure, key evidence, and supporting characters must be visible.
Beauty is secondary. Story readability is the first priority.
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
- The key evidence object must be visible, readable as an object shape, and story-relevant.
- The scene must show why the story is tense, painful, and addictive.
- Use environment, supporting characters, posture, gaze, distance, and evidence objects to tell the plot.
- Do not replace the key evidence with a generic blank paper prop unless the story itself is about a document.
- Do not make the background empty, decorative, or blurred beyond recognition.
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
STYLE PRESET: MANGA_MANHWA.
- polished Asian webtoon / manga-drama / manhua illustration
- strong line work, crisp facial expressions, dramatic contrast
- visually clear conflict, sharper storytelling, elegant panel-like energy
- not childish, not chibi, not comedic
- colored or limited-palette dramatic finish is allowed, but it should still feel premium and story-rich
- do not make the image a simple close-up portrait
`.trim()
    case 'cinematic_realistic':
      return `
STYLE PRESET: CINEMATIC_REALISTIC.
- highly polished semi-realistic / near-realistic drama illustration
- premium modern Chinese drama key-visual feeling
- cinematic lighting, believable human features, upscale atmosphere
- not a stock photo, not overly plastic, not uncanny hyperrealism
- beautiful but story-first
- use a wider poster composition, not a headshot
`.trim()
    case 'popular_webnovel_collage':
      return `
STYLE PRESET: POPULAR_WEBNOVEL_COLLAGE.
- high-performing Chinese web-novel cover style
- one female lead anchor plus multiple supporting mini-scenes or layered fragments around her
- emotional collage composition showing several story clues, memory fragments, conflicts, or evidence moments
- dramatic, addictive, commercially attractive, very story-dense
- the heroine must not become a giant face covering the entire poster
`.trim()
    case 'ancient_chinese_cinematic_romance':
      return `
STYLE PRESET: ANCIENT_CHINESE_CINEMATIC_ROMANCE.
- premium Chinese ancient-romance cover illustration
- xianxia / wuxia / historical-romance inspired mood, but still story-first
- semi-realistic cinematic digital painting, not flat anime
- elegant East Asian features, flowing hair, refined hanfu-inspired costume, lantern-lit atmosphere
- base palette must stay cool blue-gray, charcoal, misty teal, deep black, and desaturated silver
- warm lantern light can be used only as a small accent; avoid yellow wash, sepia wash, muddy beige, and brown monochrome grading
- this style changes the rendering language, color mood, and costume language, but must still follow the actual story conflict and key evidence
`.trim()
    case 'anime_cinematic':
    default:
      return `
STYLE PRESET: ANIME_CINEMATIC.
- polished premium anime-style / manhua-style urban-drama illustration
- beautiful modern East Asian adult characters
- cinematic lighting and emotional storytelling
- attractive, elegant, dramatic, web-novel-friendly
- not too cartoony, not too flat, not children-anime style
- do not make this a face-focused beauty portrait
`.trim()
  }
}

function buildReferenceLookBlock(data: ReturnType<typeof buildPromptData>): string {
  const collageMood = data.compositionPreset === 'luxury_collage' || data.coverArtStyle === 'popular_webnovel_collage'

  if (data.coverArtStyle === 'ancient_chinese_cinematic_romance') {
    return `
REFERENCE LOOK TARGET:
- The overall look should feel like a premium Chinese ancient-romance / xianxia-inspired webnovel cover.
- Elegant East Asian faces, adult cast, flowing long hair, layered hanfu-inspired costume, refined fabric rendering, painterly semi-realistic finish.
- Use romantic cinematic digital painting language rather than flat anime.
- Prefer moody blue-gray, charcoal, misty teal, desaturated silver, deep black, cool moonlight, and clean cinematic contrast.
- Warm lantern light is allowed only as a small rim light or background accent, not as a yellow wash over the whole image.
- Avoid global yellow filter, sepia wash, muddy beige, orange-brown grading, over-warm skin tint, and brown monochrome color.
- The atmosphere should feel emotional, tragic, beautiful, and story-rich, but the image must not look old, dirty, nicotine-yellow, or faded.
- This art style is only a rendering layer. Story content remains the highest priority.
- Do not invent random fantasy symbols, magic effects, palaces, swords, or creatures unless the story content actually supports them.
${collageMood ? '- Because this uses a collage-forward look, allow layered emotional fragments while keeping the ancient-romance mood coherent.' : '- Because this uses a single-scene look, keep the space readable, background atmospheric, and the dramatic relationship clear.'}
`.trim()
  }

  return `
REFERENCE LOOK TARGET:
- The overall look should feel close to premium Chinese commercial webnovel cover art.
- Refined modern East Asian adult faces, elegant fashion styling, glossy but controlled rendering, polished dramatic finish.
- Keep the mood mature, luxurious, emotionally heavy, and visually addictive.
- Prefer cool charcoal, smoke gray, midnight blue, steel blue, neutral gray, slate black, soft silver, and clean cinematic contrast.
- Avoid global yellow filter, sepia wash, muddy beige, orange-brown grading, over-warm skin tint, brown monochrome color, and vintage faded poster color.
- Warm highlights are allowed only as small accent lights from lamps, screens, city lights, or windows, not as the whole image color.
- The result should feel more like Chinese webnovel / manhua key art than ordinary Japanese anime.
${collageMood ? '- Because this uses a collage-forward look, allow darker luxury mood, layered montage storytelling, and a more editorial premium finish without turning the whole image yellow-brown.' : '- Because this uses a single-scene look, keep the space readable, background wide enough, and character placement off-center.'}
`.trim()
}

function buildColorDiversityBlock(style: CoverArtStyleKey, sceneType: CoverSceneType): string {
  const sceneAccent = (() => {
    switch (sceneType) {
      case 'hospital_legal_suspense':
        return 'Use cooler hospital tones: clean white, cold blue, pale green, gray glass, and controlled shadow.'
      case 'school_parent_conflict':
        return 'Use clean school / office tones: neutral gray, muted blue, pale wall colors, and natural daylight.'
      case 'airport_secret_tension':
        return 'Use airport-night tones: steel blue, glass gray, runway lights, cool reflections, and dark neutral shadows.'
      case 'boardroom_evidence_reveal':
        return 'Use corporate tones: graphite, navy, glass blue, steel gray, and restrained high-end lighting.'
      case 'family_banquet_confrontation':
        return 'A small amount of warm interior light is allowed, but balance it with dark neutral shadows and cool contrast.'
      case 'public_reveal_confrontation':
        return 'Event lights can be dramatic, but do not let gold/yellow lighting cover the whole image.'
      default:
        return 'Use a story-specific palette instead of repeating the same yellow-brown cover look.'
    }
  })()

  const styleLine =
    style === 'ancient_chinese_cinematic_romance'
      ? 'For ancient romance, keep the base palette blue-gray / charcoal / misty teal; lantern orange may appear only as small rim light or background glow.'
      : 'For modern drama, prefer cool neutral cinematic color grading; avoid sepia, champagne beige, and yellow-brown webnovel filter.'

  return `
COLOR DIVERSITY LOCK:
- Do not repeat the same yellow, beige, brown, or sepia color grading across covers.
- Do not apply a global warm/yellow filter over the whole image.
- Do not make skin, paper, walls, and background all the same yellow-brown color.
- Keep whites and papers neutral/off-white, not yellowed, unless the story specifically needs an old document.
- Keep shadows clean: charcoal, graphite, blue-gray, steel gray, or neutral black.
- Warm light may be used as a small accent only; it must not dominate the full image.
- Make each cover color palette follow the story setting, evidence, and scene mood.
- ${styleLine}
- ${sceneAccent}
`.trim()
}

function buildCompositionPresetBlock(data: ReturnType<typeof buildPromptData>): string {
  const compositionMode = chooseCompositionMode({
    title: data.title,
    sceneType: data.sceneType,
    coverArtStyle: data.coverArtStyle,
    compositionPreset: data.compositionPreset,
  })

  if (compositionMode === 'luxury_collage') {
    return `
COMPOSITION PRESET LOCK: LUXURY_COLLAGE.
- Match the feel of a premium Chinese webnovel luxury collage cover.
- One main heroine anchors the image, but she must not become a giant centered portrait.
- The heroine anchor should usually occupy only 25% to 38% of the image area.
- Surround her with 4 to 7 supporting story fragments, mini-scenes, memory shards, evidence closeups, or emotional flashpoints.
- The collage can use overlapping frames, broken-photo shapes, reflective fragments, layered scene windows, or elegant montage blocks.
- At least 40% of the image must show supporting scenes, evidence, background space, or story context.
- The overall image should feel dark-luxury, glossy, dramatic, emotionally dense, and highly commercial.
- Keep the heroine readable, but let the surrounding scenes clearly show the story.
- Do not turn this into manga panels with speech bubbles. This is still one premium cover illustration.
`.trim()
  }

  return `
COMPOSITION PRESET LOCK: STORY_SCENE_OFFSET.
- Match the feel of a premium Chinese urban-drama cover with a wide story scene.
- Pull the camera back. Use medium shot, medium-long shot, 3/4 body, or waist-up with visible surroundings.
- Put the heroine off-center on the left or right third, not dead-center.
- The heroine should usually occupy about 22% to 36% of the total image area.
- Do not let the heroine's face occupy more than about 16% to 22% of the image height.
- Keep a lot of visible environment behind and beside her.
- Show 2 to 5 supporting characters, witnesses, antagonists, or pressure figures in the background or midground when the story supports it.
- The environment must read clearly: office, meeting room, school, hospital, hotel, event hall, lounge, or another story-specific space.
- Make the image feel like one strong dramatic moment, not a beauty portrait.
`.trim()
}

function buildCompositionHardLockBlock(data: ReturnType<typeof buildPromptData>): string {
  const compositionMode = chooseCompositionMode({
    title: data.title,
    sceneType: data.sceneType,
    coverArtStyle: data.coverArtStyle,
    compositionPreset: data.compositionPreset,
  })

  return `
COVER COMPOSITION HARD LOCK:
- This must be a storytelling cover, not a centered character portrait.
- Do not place one heroine dead-center blocking most of the background.
- Do not crop too close to the face.
- Do not make a giant head, giant face, beauty close-up, bust portrait, ID-card portrait, or profile-card image.
- Do not let the main female character occupy 60% to 70% of the frame.
- Keep setting, supporting cast, and story pressure visible.
- Show depth with foreground, midground, and background.
- The composition must contain at least three readable layers:
  1. foreground: key evidence, table, phone, folder, hand, child item, or symbolic object;
  2. midground: female lead and main emotional action;
  3. background: antagonist, witnesses, room, city, hospital, school, office, event hall, or another story space.
- The key evidence object can appear, but it must not dominate the entire image.
- ${compositionMode === 'luxury_collage' ? 'Use a layered collage structure with one heroine anchor and multiple story fragments.' : 'Use one strong story scene with the heroine offset and the environment clearly readable.'}
`.trim()
}

function buildSceneSelectionBlock(sceneType: CoverSceneType, style: CoverArtStyleKey): string {
  const collageNote =
    style === 'popular_webnovel_collage'
      ? 'Because the selected style is collage-oriented, use one heroine anchor plus 3 to 6 supporting story fragments around her.'
      : 'Prefer one dominant main scene with a pulled-back camera. You may add supporting figures or one subtle secondary layer, but keep the composition clean and readable.'

  switch (sceneType) {
    case 'mother_child_protection':
      return `
COVER SCENE MODE: MOTHER_CHILD_PROTECTION.
${collageNote}
- The emotional center is a woman protecting a child or child-related truth.
- Show the mother and child clearly enough to read their relationship.
- Do not crop so tightly that the child disappears.
- Show antagonists, pressure figures, school staff, relatives, or silent witnesses behind or around them when relevant.
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
- Avoid a simple portrait; show the room and social pressure.
`.trim()

    case 'hospital_legal_suspense':
      return `
COVER SCENE MODE: HOSPITAL_LEGAL_SUSPENSE.
${collageNote}
- Show hospital, clinic, medical corridor, consultation room, or legal-pressure setting linked to a medical truth.
- Key props can include prescription, test result folder, medical envelope, or phone showing an unreadable hospital-related image.
- The cover should feel cold, modern, tense, and evidence-driven.
- Avoid turning it into a generic woman holding paper.
`.trim()

    case 'airport_secret_tension':
      return `
COVER SCENE MODE: AIRPORT_SECRET_TENSION.
${collageNote}
- Show airport lounge, departure gate, large glass window, runway, luggage, or boarding atmosphere.
- The female lead should feel like she is carrying a secret, leaving with truth, or catching someone trying to escape.
- The evidence object must be near the hand, table, bag, or suitcase.
- The airport space must remain clearly visible.
`.trim()

    case 'public_reveal_confrontation':
      return `
COVER SCENE MODE: PUBLIC_REVEAL_CONFRONTATION.
${collageNote}
- Show a public reveal moment at a banquet, party, media event, livestream-like setting, or public confrontation.
- The female lead is exposing proof or controlling the moment.
- Background reactions must help tell the story: shock, fear, humiliation, pressure, or reversal.
- Show at least 3 supporting people if the setting allows it.
- Do not zoom into only the female lead's face.
`.trim()

    case 'private_betrayal_confrontation':
      return `
COVER SCENE MODE: PRIVATE_BETRAYAL_CONFRONTATION.
${collageNote}
- Show a private or semi-private emotional betrayal scene.
- Good settings: hotel, elegant apartment, bedroom-adjacent corridor, living room, or intimate interior.
- Include at least one opposing figure and make the emotional rupture visually obvious.
- The key evidence should feel personal: photo, room card, phone, letter, or private proof.
- Keep enough background space to show the betrayal scene instead of only the heroine.
`.trim()

    case 'family_banquet_confrontation':
      return `
COVER SCENE MODE: FAMILY_BANQUET_CONFRONTATION.
${collageNote}
- Show wealthy family dining, banquet, villa confrontation, or a formal interior with visible table / room / relatives.
- Multiple family members can appear, but the female lead must remain the emotional center.
- Beauty on the surface, poison underneath.
- Table setting, tea, dishes, and evidence object should help tell the story.
- Use a wider confrontation composition, not a solo portrait.
`.trim()

    case 'boardroom_evidence_reveal':
      return `
COVER SCENE MODE: BOARDROOM_EVIDENCE_REVEAL.
${collageNote}
- Show boardroom, corporate meeting room, office tower interior, or high-status negotiation space.
- The female lead should feel pressured but not broken.
- The evidence object should look decisive and tied to power, ownership, betrayal, or control.
- Background supporting cast should read as executives, family power, or silent witnesses.
- Show table, documents, phone, folder, or screen as part of the foreground/midground story.
`.trim()

    case 'collage_story_poster':
      return `
COVER SCENE MODE: COLLAGE_STORY_POSTER.
- Use a strong commercial web-novel collage layout.
- One central female lead anchor, but she must not cover the whole image.
- 3 to 6 supporting mini-scenes or image fragments around her.
- Use the fragments to show relationship damage, evidence, memory, betrayal, child danger, hidden truth, or public conflict.
- Make the collage easy to read, elegant, and emotionally heavy.
- Do not add speech bubbles, readable text, title typography, or fake document text.
`.trim()

    case 'evidence_discovery_scene':
    default:
      return `
COVER SCENE MODE: EVIDENCE_DISCOVERY_SCENE.
${collageNote}
- Show the female lead actively holding, opening, discovering, or presenting the key evidence.
- The evidence must be visible but unreadable if it is a document or screen.
- The surrounding environment should reveal the story context.
- Supporting figures can be placed behind, reflected, seated, or partially visible to create pressure.
- This must feel like the exact moment a dangerous truth begins to surface.
- Do not turn the scene into a close-up portrait with a random paper prop.
`.trim()
  }
}

function buildFramingAndCharacterBlock(style: CoverArtStyleKey): string {
  const appearanceLine =
    style === 'ancient_chinese_cinematic_romance'
      ? '- Characters must look like East Asian adults in an ancient-Chinese romance illustration style, with elegant historical styling and believable emotional presence.'
      : '- Characters must look like modern East Asian adults, preferably modern Chinese urban-drama appearance.'

  const costumeLine =
    style === 'ancient_chinese_cinematic_romance'
      ? '- Use flowing hanfu-inspired costume, period hair styling, and refined historical details only when they support the story.'
      : '- Use modern fashion, urban-drama styling, or story-appropriate contemporary costume.'

  return `
CHARACTER / ETHNICITY / FRAMING RULES:
${appearanceLine}
${costumeLine}
- One clear female lead must anchor the image, but she must not swallow the frame.
- Do not make the female lead too large.
- Do not create an extreme close-up portrait.
- Do not create a bust-only beauty shot.
- Prefer medium-long shot, 3/4 body, waist-up with visible room, or full upper-body framing.
- The heroine should usually occupy about 22% to 36% of the total image area in single-scene covers.
- For collage covers, the heroine anchor should usually occupy about 25% to 38% of the image area.
- Leave enough room to show setting, supporting cast, and evidence.
- Supporting characters should only be added when they strengthen the story.
- The image must read like a story cover with visible environment, not like a profile-card illustration.
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

function buildAntiGenericBlock(sceneType: CoverSceneType, style: CoverArtStyleKey): string {
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
- Do not create a glamour portrait, headshot, face-card, profile-card, fashion portrait, or solo model poster.
- Do not ignore the actual story conflict.
- Do not make the cover depend only on a single face.
- Do not hide the evidence object.
- Do not replace story-specific clues with random decorative props.
- Do not create a children cartoon or unrelated sci-fi setting.
- Do not force fantasy, historical costume, palace, sword, lantern, or ancient setting when the selected story/style does not support it.
- If the selected style is ancient_chinese_cinematic_romance, do not invent unrelated magic, monsters, weapons, or fantasy spectacle that the story did not ask for.
- Do not use a global yellow filter, sepia filter, brown monochrome grading, or muddy beige color wash.
- Do not show blood, gore, corpses, wounds, knives, guns, explicit violence, or self-harm.
- If the story contains dangerous events, show them only through emotional tension, lighting, distance, posture, reflections, and atmosphere.
${sceneSpecificLines.join('\n')}
`.trim()
}

function buildFinalInstructionBlock(style: CoverArtStyleKey): string {
  const styleCompositionLine =
    style === 'popular_webnovel_collage'
      ? '- Because the selected style is popular webnovel collage, the final image should feel layered and story-dense, but not unreadably crowded.'
      : '- Keep the composition clear, wide enough, and story-focused rather than a close-up portrait.'

  return `
FINAL OUTPUT INSTRUCTION:
Create one polished final vertical 2:3 cover illustration.
The image must feel like a commercially strong Chinese web-novel cover: dramatic, emotional, addictive, polished, and immediately understandable.
Story content, conflict, setting, and evidence are more important than decorative prettiness.
${styleCompositionLine}
The final result must be a finished cover artwork illustration only, with zero text inside the image.
`.trim()
}

function buildFallbackPrompt(data: ReturnType<typeof buildPromptData>): string {
  return `Vertical 2:3 premium Chinese urban-drama web-novel cover illustration. Modern East Asian female lead. Story-specific evidence must be visible: ${data.keyEvidence}. Main setting must be clearly visible: ${data.setting}. Core conflict: ${data.relationshipCore}. Emotional hook: ${data.emotionalHook}. Mood: ${data.moodKeywords}. Style: ${data.coverArtStyle}. Composition preset: ${data.compositionPreset}. Absolutely no text anywhere in the image. No title, no words, no letters, no logos, no watermark, no readable phone screen, no readable documents, no readable signage, no readable labels. Documents and screens must be blank, abstract, dark, blurred, turned away, or unreadable. Not a generic portrait. Not a close-up beauty shot. Pull the camera back. Show foreground, midground, and background. Show the environment, supporting figures, and conflict clearly. Keep the heroine off-center or use a luxury collage layout depending on the preset. Prefer medium-long shot, 3/4 body, or waist-up framing with visible setting. The main character must not fill the whole frame and must not occupy 60% to 70% of the image. No blood, no wounds, no corpse, no weapons, no explicit violence. Avoid global yellow filter, sepia wash, muddy beige, orange-brown grading, and repeated yellow-brown cover palette. Use story-specific cool neutral cinematic color with warm accents only when needed.`
}

export function buildCoverPrompt(input: StoryInput | JsonRecord | unknown): CoverBuildResult {
  const data = buildPromptData(input)

  const prompt = [
    buildPrimaryGoalBlock(),
    buildStoryCoreBlock(data),
    buildStoryStageBlock(data.storyStage),
    buildStyleBlock(data.coverArtStyle),
    buildReferenceLookBlock(data),
    buildColorDiversityBlock(data.coverArtStyle, data.sceneType),
    buildSceneSelectionBlock(data.sceneType, data.coverArtStyle),
    buildCompositionPresetBlock(data),
    buildCompositionHardLockBlock(data),
    buildFramingAndCharacterBlock(data.coverArtStyle),
    buildNoTextBlock(),
    buildAntiGenericBlock(data.sceneType, data.coverArtStyle),
    buildFinalInstructionBlock(data.coverArtStyle),
  ].join('\n\n')

  return {
    prompt,
    fallbackPrompt: buildFallbackPrompt(data),
    coverConcept: {
      version: 'cover-storytelling-framing-v2',
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