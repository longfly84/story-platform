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
const DEFAULT_MOOD = 'drama cảm xúc, bí mật, phản công, màu sắc thương mại, cuốn hút, không kinh dị'

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
  // Nếu user đã chọn style rõ ràng thì tuyệt đối giữ style đó.
  if (style !== 'auto') return style

  // Auto không được mặc định một màu anime mãi.
  // Tự chọn style theo loại cảnh để cover trong danh sách admin nhìn khác nhau hơn.
  if (sceneType === 'collage_story_poster' || sceneType === 'public_reveal_confrontation') {
    return 'popular_webnovel_collage'
  }

  if (
    sceneType === 'hospital_legal_suspense' ||
    sceneType === 'boardroom_evidence_reveal' ||
    sceneType === 'school_parent_conflict' ||
    sceneType === 'family_banquet_confrontation'
  ) {
    return 'cinematic_realistic'
  }

  if (sceneType === 'private_betrayal_confrontation') {
    return 'manga_manhwa'
  }

  return 'anime_cinematic'
}

function inferKeyEvidence(text: string): string {
  if (includesAny(text, ['ma qr', 'mã qr', 'qr code', 'qr'])) {
    return 'một mã QR bí ẩn trên điện thoại, màn hình phải mờ và không có chữ đọc được'
  }
  if (includesAny(text, ['giay bao no', 'giấy báo nợ', 'khoan no', 'khoản nợ', 'chu no', 'chủ nợ'])) {
    return 'một giấy báo nợ hoặc phong bì tài chính không có chữ đọc được'
  }
  if (includesAny(text, ['the nho', 'thẻ nhớ', 'memory card', 'sd card'])) {
    return 'một thẻ nhớ nhỏ chứa bằng chứng quyết định'
  }
  if (includesAny(text, ['usb'])) {
    return 'một chiếc USB chứa dữ liệu bí mật'
  }
  if (includesAny(text, ['ghi am', 'ghi âm', 'audio', 'file am thanh'])) {
    return 'một thiết bị ghi âm hoặc đoạn ghi âm làm lộ sự thật, màn hình phải mờ và không có chữ đọc được'
  }
  if (includesAny(text, ['bai dang', 'bài đăng', 'hot search', 'tim kiem nong', 'tìm kiếm nóng'])) {
    return 'một bài đăng đang gây bão trên mạng xã hội, chỉ thể hiện bằng giao diện mờ không chữ'
  }
  if (includesAny(text, ['camera', 'anh chup', 'ảnh chụp', 'buc anh', 'bức ảnh'])) {
    return 'ảnh chụp, camera hoặc hình ảnh bằng chứng gắn với bí mật trung tâm, nội dung ảnh phải mờ không chữ'
  }
  if (includesAny(text, ['ho so nhap hoc', 'nhập học', 'school file', 'hoc ba', 'học bạ'])) {
    return 'một bộ hồ sơ trường học hoặc vật dụng học sinh liên quan đến đứa trẻ, không có chữ đọc được'
  }
  if (includesAny(text, ['kham thai', 'khám thai', 'thai san', 'thai sản'])) {
    return 'một sổ khám thai hoặc hồ sơ thai sản hé lộ bí mật lớn, bìa và giấy phải trống hoặc mờ'
  }
  if (includesAny(text, ['xet nghiem', 'xét nghiệm', 'adn', 'dna'])) {
    return 'kết quả xét nghiệm hoặc phong bì ADN gắn với thân thế hoặc huyết thống, không có chữ đọc được'
  }
  if (includesAny(text, ['don thuoc', 'đơn thuốc', 'toa thuoc', 'toa thuốc'])) {
    return 'đơn thuốc hoặc toa thuốc là mấu chốt của bí mật, giấy phải mờ và không đọc được chữ'
  }
  if (includesAny(text, ['hop dong', 'hợp đồng', 'co phan', 'cổ phần'])) {
    return 'một hợp đồng hoặc hồ sơ kinh doanh quan trọng, giấy phải trống/mờ không chữ'
  }
  if (includesAny(text, ['dien thoai', 'điện thoại', 'phone', 'tin nhan', 'tin nhắn'])) {
    return 'điện thoại chứa manh mối hoặc bằng chứng bị che giấu, màn hình tối hoặc mờ không chữ'
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

  // Ưu tiên scene theo bối cảnh/motif chính trước, không để mọi thứ rơi về evidence generic.
  if (includesAny(text, ['nhan nuoi', 'nhận nuôi', 'tranh quyen nuoi', 'quyền nuôi', 'con nuoi', 'con nuôi', 'gau bong', 'gấu bông', 'me con', 'mẹ con', 'dua tre', 'đứa trẻ', 'con gai', 'con gái', 'con trai'])) {
    return 'mother_child_protection'
  }
  if (includesAny(text, ['truong hoc', 'trường học', 'phu huynh', 'phụ huynh', 'nhap hoc', 'nhập học', 'bat nat', 'bắt nạt', 'hieu truong', 'hiệu trưởng', 'lop hoc', 'lớp học'])) {
    return 'school_parent_conflict'
  }
  if (includesAny(text, ['benh vien', 'bệnh viện', 'phong kham', 'phòng khám', 'xet nghiem', 'xét nghiệm', 'toa thuoc', 'toa thuốc', 'kham thai', 'khám thai', 'so kham thai', 'sổ khám thai', 'thai san', 'thai sản'])) {
    return 'hospital_legal_suspense'
  }
  if (includesAny(text, ['san bay', 'sân bay', 'chuyen bay', 'chuyến bay', 'boarding', 'departure', 'cua ra may bay', 'cửa ra máy bay'])) {
    return 'airport_secret_tension'
  }
  if (includesAny(text, ['hop bao', 'họp báo', 'livestream', 'hot search', 'cong khai', 'công khai', 'quy goi', 'quỳ gối', 'da tiec', 'dạ tiệc', 'bao chi', 'báo chí', 'bai dang', 'bài đăng', 'mang xa hoi', 'mạng xã hội'])) {
    return 'public_reveal_confrontation'
  }
  if (includesAny(text, ['nha chong', 'nhà chồng', 'me chong', 'mẹ chồng', 'bo chong', 'bố chồng', 'gia toc', 'gia tộc', 'ban an', 'bàn ăn', 'tiec gia dinh', 'tiệc gia đình', 'biet thu', 'biệt thự', 'hao mon', 'hào môn'])) {
    return 'family_banquet_confrontation'
  }
  if (includesAny(text, ['giay bao no', 'giấy báo nợ', 'khoan no', 'khoản nợ', 'chu no', 'chủ nợ', 'hoi dong', 'hội đồng', 'co phan', 'cổ phần', 'boardroom', 'tong giam doc', 'tổng giám đốc', 'cong ty', 'công ty', 'hop dong', 'hợp đồng'])) {
    return 'boardroom_evidence_reveal'
  }
  if (includesAny(text, ['ngoai tinh', 'ngoại tình', 'tieu tam', 'tiểu tam', 'khach san', 'khách sạn', 'hon le', 'hôn lễ', 'chong', 'chồng', 'vo', 'vợ', 'phong khach san', 'phòng khách sạn'])) {
    return 'private_betrayal_confrontation'
  }
  if (includesAny(text, ['ma qr', 'mã qr', 'qr', 'the nho', 'thẻ nhớ', 'usb', 'ghi am', 'ghi âm', 'camera', 'anh chup', 'ảnh chụp', 'dien thoai', 'điện thoại'])) {
    return 'evidence_discovery_scene'
  }
  if (includesAny(text, ['bi mat', 'bí mật', 'anh bi xe', 'ảnh bị xé', 'qua khu', 'quá khứ', 'ky uc', 'ký ức', 'nhieu tang', 'nhiều tầng'])) {
    return 'collage_story_poster'
  }

  return 'collage_story_poster'
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
      return 'protective, emotional, tender but high-stakes, polished urban drama, warm cinematic light'
    case 'school_parent_conflict':
      return 'public pressure, righteous anger, protective emotion, clean school-drama color, commercial webnovel tension'
    case 'hospital_legal_suspense':
      return 'medical truth, legal pressure, clean white-and-teal hospital light, emotional suspense, not horror'
    case 'airport_secret_tension':
      return 'departure secret, emotional distance, bright airport glass, city-light atmosphere, truth on the move'
    case 'public_reveal_confrontation':
      return 'glamorous public reveal, power reversal, banquet/media spotlight, vivid commercial drama color'
    case 'private_betrayal_confrontation':
      return 'betrayal, heartbreak, elegant hotel/apartment drama, warm interior light, emotional confrontation'
    case 'family_banquet_confrontation':
      return 'wealthy family pressure, elegant banquet light, restrained conflict, polished modern drama'
    case 'boardroom_evidence_reveal':
      return 'corporate power clash, glass-and-gold boardroom light, controlled rage, evidence reveal, premium business drama'
    case 'collage_story_poster':
      return 'layered secrets, emotional memory fragments, betrayal, hidden truth, vivid webnovel poster color'
    case 'evidence_discovery_scene':
    default:
      return 'story-rich discovery, emotional truth surfacing, polished urban drama, vivid but tasteful color'
  }
}


type CoverCompositionMode =
  | 'left_third_environmental'
  | 'right_third_environmental'
  | 'layered_story_scene'
  | 'narrative_collage'

function hashString(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

function chooseCompositionMode(data: {
  title: string
  sceneType: CoverSceneType
  coverArtStyle: CoverArtStyleKey
}): CoverCompositionMode {
  if (data.coverArtStyle === 'popular_webnovel_collage') {
    return data.sceneType === 'collage_story_poster'
      ? 'narrative_collage'
      : 'layered_story_scene'
  }

  const options: CoverCompositionMode[] = [
    'left_third_environmental',
    'right_third_environmental',
    'layered_story_scene',
    'narrative_collage',
  ]

  const seed = `${data.title}|${data.sceneType}|${data.coverArtStyle}`
  return options[hashString(seed) % options.length]
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
  const compositionMode = chooseCompositionMode({
    title,
    sceneType,
    coverArtStyle,
  })

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
    compositionMode,
  }
}

function buildPrimaryGoalBlock(): string {
  return `
Create a premium vertical web-novel cover illustration, aspect ratio 2:3.

PRIMARY GOAL:
This cover must visually tell the actual story, but it must still look attractive as a commercial web-novel cover.
Do NOT create a generic beauty portrait.
Do NOT create a random fashionable character image disconnected from the plot.
Do NOT create horror, ghost-story, crime-thriller, dirty-green, sickly-yellow, grey-black, gloomy-corridor artwork.
The cover must clearly communicate the core conflict, emotional pressure, and most important evidence object with polished, vivid, readable colors.
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
STYLE PRESET LOCK: MANGA_MANHWA.
- The artwork must look like a premium Korean/Chinese manhwa webtoon cover, not realistic photography.
- Clean line art, polished digital painting, expressive eyes, elegant dramatic poses, clear silhouette.
- Use bright but tasteful webtoon colors: ivory skin tones, clean highlights, rose/gold/teal accents, crisp shadows.
- More graphic, more illustrated, more panel-like than cinematic_realistic.
- Romantic-drama / revenge-drama webtoon feeling, emotionally sharp but visually beautiful.
- Avoid generic dark realistic poster. Avoid stock-photo realism. Avoid plain woman standing in rain.
- Not horror, not ghost story, not chibi, not comedic, not western comic.
`.trim()

    case 'cinematic_realistic':
      return `
STYLE PRESET LOCK: CINEMATIC_REALISTIC.
- The artwork must feel like a premium Chinese urban-drama film poster or high-end TV drama key visual.
- Semi-realistic / near-realistic illustrated faces, cinematic lens depth, believable modern setting.
- Use clean luxury-drama lighting: soft gold, champagne, glass reflections, white office light, warm hotel light, or elegant banquet light when relevant.
- More grounded and film-like than anime_cinematic or manga_manhwa, but still polished and attractive.
- Avoid anime eyes, webtoon line art, fantasy glow, cartoon exaggeration, horror color grading, dirty green/yellow shadows.
- Still an illustration, not a raw stock photo.
`.trim()

    case 'popular_webnovel_collage':
      return `
STYLE PRESET LOCK: POPULAR_WEBNOVEL_COLLAGE.
- The artwork must be a commercial Chinese web-novel collage poster, not a single-character portrait.
- One central heroine plus 3 to 6 surrounding story fragments / mini-scenes / symbolic clues.
- Fragments must show different story elements: antagonist, evidence, child/family pressure, public scandal, hospital/school/business setting, or betrayal.
- Use a vivid readable poster palette: warm gold, clean white, deep navy, soft red accents, teal glass, elegant highlights.
- Layered composition, dramatic diagonal layout, poster-like depth, strong readability at small thumbnail size.
- Avoid one lone woman holding paper. Avoid a simple corridor portrait. Avoid horror/thriller color grading.
`.trim()

    case 'anime_cinematic':
    default:
      return `
STYLE PRESET LOCK: ANIME_CINEMATIC.
- The artwork must be a polished premium anime-style urban-drama cover.
- Clearly illustrated anime faces, elegant modern East Asian characters, dramatic but beautiful atmosphere.
- Use attractive cinematic anime colors: warm rim light, clean skin tones, soft gold, rose, teal, city-light highlights.
- More stylized and beautiful than cinematic_realistic, but not childish and not flat.
- Use cinematic anime composition with visible environment and evidence object.
- Avoid realistic stock-photo look. Avoid generic dark corridor woman. Avoid only a close-up face.
- Avoid horror, ghost-story, dirty yellow-green, sickly skin, heavy grey-black palette.
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
- The cover should feel clean, modern, emotionally tense, polished, and evidence-driven — not horror.
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
- Elegant surface, hidden family pressure underneath; keep it polished, not rotten or horror-like.
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
- This must feel like the exact moment a hidden truth begins to surface; dramatic, not horror.
`.trim()
  }
}

function buildVisualDiversityBlock(data: ReturnType<typeof buildPromptData>): string {
  return `
VISUAL DIVERSITY LOCK — very important:
- Do not reuse the failed default cover look: lone serious woman, dark corridor, black coat, green-yellow horror grading, generic paper in hand.
- Do not use horror / ghost story / serial-killer / crime-thriller mood.
- Do not make the heroine look pale, sick, corpse-like, haunted, dirty, or expressionless.
- The selected style is ${data.coverArtStyle}; make this style visibly different from the other presets.
- The selected scene is ${data.sceneType}; make the background and props clearly match that scene.
- The key evidence is: ${data.keyEvidence}. It must be visible, but it must not become the only story element.
- Add at least TWO scene-specific visual anchors from this story: setting, antagonist/pressure figure, child/family/business/hospital/school/public-event cue, or emotional distance between characters.
- Use a polished commercial palette: clean skin tones, controlled contrast, warm gold / rose / teal / navy / ivory accents, readable lighting.
- Cover must stay readable as a thumbnail in an admin story list.
- At thumbnail size, the environment and supporting scene should still be readable, not hidden behind one oversized heroine.
`.trim()
}



function buildCompositionHardLockBlock(data: ReturnType<typeof buildPromptData>): string {
  let compositionVariantDescription = ''

  switch (data.compositionMode) {
    case 'left_third_environmental':
      compositionVariantDescription = `
COMPOSITION VARIANT: LEFT_THIRD_ENVIRONMENTAL.
- Place the heroine on the left third of the canvas.
- Keep the right side open for story environment, supporting cast, or the key confrontation background.
- Let the background breathe and tell the plot.`.trim()
      break
    case 'right_third_environmental':
      compositionVariantDescription = `
COMPOSITION VARIANT: RIGHT_THIRD_ENVIRONMENTAL.
- Place the heroine on the right third of the canvas.
- Keep the left side open for story environment, supporting cast, or the key confrontation background.
- Let the background breathe and tell the plot.`.trim()
      break
    case 'layered_story_scene':
      compositionVariantDescription = `
COMPOSITION VARIANT: LAYERED_STORY_SCENE.
- Put the heroine off-center in the foreground or midground.
- Show clear depth: foreground, midground, background.
- Use supporting characters, architecture, or emotional distance to tell the story.`.trim()
      break
    case 'narrative_collage':
    default:
      compositionVariantDescription = `
COMPOSITION VARIANT: NARRATIVE_COLLAGE.
- Build a story-dense composition with one heroine off-center and multiple supporting story layers.
- Make sure the background, fragments, or secondary characters remain readable.
- The heroine must not block most of the setting.`.trim()
      break
  }

  const sceneExample = (() => {
    switch (data.sceneType) {
      case 'private_betrayal_confrontation':
        return '- For hotel / betrayal stories, clearly show corridor, room doorway, suite interior, or hotel lighting behind the heroine. The room card or private evidence should be a small story clue, not the whole picture.'
      case 'public_reveal_confrontation':
        return '- For public reveal scenes, show banquet hall, press wall, stage, tables, crowd reaction, or event lights in the background. The heroine must not block the public setting.'
      case 'boardroom_evidence_reveal':
        return '- For boardroom stories, show the meeting table, glass wall, screen area, executives, or office skyline. Keep the heroine off-center so the power setting reads clearly.'
      case 'hospital_legal_suspense':
        return '- For hospital stories, show corridor, consultation room, hospital counter, doctors, or medical setting clearly behind or beside the heroine.'
      case 'school_parent_conflict':
        return '- For school stories, show school office, parent meeting room, hallway, child-related area, or classroom details in the environment.'
      case 'airport_secret_tension':
        return '- For airport stories, clearly show windows, runway, gate seating, luggage, or departure atmosphere around the heroine.'
      case 'family_banquet_confrontation':
        return '- For family banquet stories, clearly show table setting, villa interior, banquet hall, or relatives in the background.'
      case 'mother_child_protection':
        return '- For mother-child stories, keep the heroine offset and leave room to show the child, caregiver, home, school, or emotional pressure in the environment.'
      case 'collage_story_poster':
        return '- For collage posters, background and mini-scenes must stay visible. Do not turn this into a centered single-character portrait.'
      case 'evidence_discovery_scene':
      default:
        return '- For evidence-discovery scenes, let the setting explain the evidence: desk, room, lobby, meeting room, hospital, school, or public place must remain visible.'
    }
  })()

  return `
COVER COMPOSITION HARD LOCK — absolute priority:
- This must be a storytelling cover, not a centered character portrait.
- The heroine must NOT stand dead-center in a way that blocks most of the background.
- Prefer an off-center composition using the rule of thirds.
- The heroine should usually occupy about 22% to 35% of the canvas width, not 45% to 70%.
- The environment must remain clearly visible and must help tell the plot.
- Use an environmental cover composition with a pulled-back camera distance, not a close portrait or profile-card style image.
- Prefer medium-long shot, 3/4 body, or elegant full-body framing in most cases; use chest-up framing only when the story absolutely requires it.
- Background must show story space clearly: hotel, lobby, hallway, hospital, banquet, boardroom, school, airport, villa, restaurant, stage, or another setting that matches the story.
- At least half of the image should still read as setting / environment / layered story space.
- Show depth: foreground, midground, and background should be distinguishable.
- Leave visible negative space around the heroine so the setting can breathe and tell the plot.
- Include at least one supporting visual layer beyond the heroine: antagonist, witness, child, family member, executives, crowd reaction, doorway, table, reception desk, stage, screen, or emotional distance between characters.
- If there is a key evidence object, keep it story-relevant but small enough that it does not dominate the whole cover.
- Do NOT use the formula: one heroine in the middle, holding paper / phone / card in front of her chest, with a vague background hidden behind her.
- Do NOT use a symmetrical centered hero poster.
- The cover must still read well as a thumbnail, but it must also show enough background to communicate story context.
${compositionVariantDescription}
${sceneExample}
`.trim()
}

function buildAntiBadCoverFormulaBlock(): string {
  return `
ANTI BAD COVER FORMULA:
- Do not place one lone heroine in the exact center blocking the whole environment.
- Do not make the heroine too large or too close to the camera.
- Do not default to a chest-up portrait or tight upper-body framing.
- Do not make the cover look like a beauty portrait, profile card, or generic fashion poster.
- Do not rely on heroine + paper / heroine + phone / heroine + card as the entire composition.
- Do not blur away the environment until the story setting becomes unreadable.
- Do not reduce the background to a vague corridor, vague glow, or empty wall.
- Do not let the heroine stand dead center if that hides the room, lobby, banquet, office, hallway, or public setting.
- Do not let the evidence object hide the plot, the setting, or the supporting cast.
`.trim()
}

function buildFramingAndCharacterBlock(): string {
  return `
CHARACTER / ETHNICITY / FRAMING RULES:
- Characters must look like modern East Asian adults, preferably modern Chinese urban-drama appearance.
- One clear female lead must anchor the image.
- Do not make the female lead too large.
- Do not create an extreme close-up portrait.
- Strongly prefer medium-long shot, 3/4 body, or elegant full-body framing much more often than chest-up portrait framing.
- The heroine should usually occupy about 22% to 35% of the frame width.
- Leave enough room to show setting, supporting cast, and evidence.
- Place the heroine slightly off-center whenever possible so the environment remains readable.
- Supporting characters should only be added when they strengthen the story.
- The image should read like a story cover with visible environment, not like a character card.
- The frame should feel wider and more environmental than the current tight portrait tendency.
`.trim()
}


function buildNoTextBlock(): string {
  return `
ANTI-TEXT RULES — absolute priority:
- Absolutely no text anywhere inside the artwork.
- Do not render the story title.
- Do not render Vietnamese text, English text, Chinese text, letters, words, captions, subtitles, logos, watermarks, labels, brand marks, UI, signage, chat bubbles, or typography.
- Do not place any readable text on phones, computer screens, hospital documents, contracts, tickets, folders, books, reports, photos, ID cards, certificates, school files, prescription papers, or envelopes.
- If a document or phone is visible, it must be blank, abstract, blurred, turned away, out of focus, or unreadable.
- Avoid making unreadable documents look like creepy occult papers; they should look like normal modern files, envelopes, cards, or screens.
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
- Do not create a children cartoon, fantasy scene, historical costume, unrelated sci-fi setting, horror poster, ghost story, zombie mood, or crime-thriller poster.
- Do not show blood, gore, corpses, wounds, knives, guns, explicit violence, or self-harm.
- If the story contains dangerous events, show them only through emotional tension, lighting, distance, posture, reflections, and atmosphere; keep the image clean and commercial.
${sceneSpecificLines.join('\n')}
`.trim()
}

function buildFinalInstructionBlock(style: CoverArtStyleKey): string {
  const styleCompositionLine =
    style === 'popular_webnovel_collage'
      ? '- Because the selected style is popular webnovel collage, the final image should feel more layered and story-dense.'
      : '- Keep the composition clear and story-focused rather than overly busy.'

  return `
FINAL OUTPUT INSTRUCTION:
Create one polished final vertical 2:3 cover illustration.
The image must feel like a commercially strong Chinese web-novel cover: dramatic, emotional, addictive, polished, colorful enough for readers to click, immediately understandable, and clearly storytelling through visible environment.
Story content, conflict, setting, and evidence are more important than decorative prettiness.
${styleCompositionLine}
Use a wide storytelling composition: more visible setting, more readable supporting scene, less oversized heroine.
Commercial color requirement: avoid muddy green/yellow horror grading, heavy grey-black, sickly skin, dirty shadows. Prefer clean skin tones, elegant contrast, warm/cool balanced lighting, and attractive web-novel poster color.
The final result must be a finished cover artwork illustration only, with zero text inside the image.
`.trim()
}

function buildFallbackPrompt(data: ReturnType<typeof buildPromptData>): string {
  return `Vertical 2:3 premium Chinese urban-drama web-novel cover illustration. Modern East Asian female lead. Polished commercial webnovel color, clean skin tones, warm gold / rose / teal / navy accents, attractive readable lighting. Story-specific evidence must be visible: ${data.keyEvidence}. Main setting: ${data.setting}. Core conflict: ${data.relationshipCore}. Emotional hook: ${data.emotionalHook}. Mood: ${data.moodKeywords}. Style: ${data.coverArtStyle}. Absolutely no text anywhere in the image. No title, no words, no letters, no logos, no watermark, no readable phone screen, no readable documents, no readable signage, no readable labels. Documents and screens must be blank, abstract, blurred, turned away, or unreadable. Not a generic portrait. Use an off-center storytelling composition. Show the environment, supporting figures, and conflict clearly. Prefer medium-long shot, 3/4 body, or elegant full-body framing with a pulled-back camera distance. The heroine should usually occupy about 22% to 35% of the frame width and must not block most of the background. No horror, no dirty green-yellow grading, no sickly skin, no blood, no wounds, no corpse, no weapons, no explicit violence.`
}

export function buildCoverPrompt(input: StoryInput | JsonRecord | unknown): CoverBuildResult {
  const data = buildPromptData(input)

  const prompt = [
    buildPrimaryGoalBlock(),
    buildStoryCoreBlock(data),
    buildStoryStageBlock(data.storyStage),
    buildStyleBlock(data.coverArtStyle),
    buildSceneSelectionBlock(data.sceneType, data.coverArtStyle),
    buildVisualDiversityBlock(data),
    buildCompositionHardLockBlock(data),
    buildAntiBadCoverFormulaBlock(),
    buildFramingAndCharacterBlock(),
    buildNoTextBlock(),
    buildAntiGenericBlock(data.sceneType),
    buildFinalInstructionBlock(data.coverArtStyle),
  ].join('\n\n')

  return {
    prompt,
    fallbackPrompt: buildFallbackPrompt(data),
    coverConcept: {
      version: 'cover-composition-storytelling-lock-v6-wide',
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
