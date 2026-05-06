type CoverArtStyleKey =
  | 'auto'
  | 'anime-cinematic'
  | 'modern-manhwa'
  | 'manga-drama'
  | 'semi-realistic'
  | 'movie-poster'

type SceneTemplateKey =
  | 'family-dinner'
  | 'penthouse-dossier'
  | 'airport-secret'
  | 'public-exposure'
  | 'phone-showdown'

type JsonRecord = Record<string, unknown>

type CoverPromptResult = {
  prompt: string
  fallbackPrompt: string
  coverConcept: JsonRecord
}

type CoverPromptData = {
  title: string
  genre: string
  logline: string
  heroine: string
  antagonist: string
  relationshipCore: string
  keyEvidence: string
  setting: string
  emotionalCore: string
  moodKeywords: string
  tagline: string
  coverArtStyle: CoverArtStyleKey
  sceneTemplate: SceneTemplateKey
}

const DEFAULT_TITLE = 'Bí Mật Chưa Được Gọi Tên'
const DEFAULT_GENRE = 'drama đô thị hiện đại, bí mật gia đình, trả thù cảm xúc'
const DEFAULT_HEROINE =
  'một người phụ nữ trẻ, xinh đẹp, thông minh, ngoài mềm trong cứng, đang cố giữ bình tĩnh khi phát hiện sự thật'
const DEFAULT_ANTAGONIST =
  'những người thân hoặc thế lực giàu có đang che giấu bí mật và gây áp lực lên nữ chính'
const DEFAULT_RELATIONSHIP =
  'xung đột gia đình, phản bội, bí mật bị che giấu, sự thật bị bóp méo'
const DEFAULT_EVIDENCE =
  'một tập hồ sơ mật, giấy tờ quan trọng, ảnh cũ hoặc bằng chứng bị che giấu'
const DEFAULT_SETTING =
  'không gian hiện đại sang trọng: biệt thự, căn hộ cao cấp, văn phòng, phòng khách hoặc nơi đối chất'
const DEFAULT_EMOTIONAL_CORE =
  'khoảnh khắc nữ chính phát hiện hoặc chuẩn bị phơi bày một bí mật có thể làm sụp đổ tất cả'
const DEFAULT_MOOD =
  'căng thẳng, bí mật, đau lòng, sang trọng, đối đầu, sự thật sắp bị phơi bày'
const DEFAULT_TAGLINE =
  'Có những bí mật được giấu đi không phải để bảo vệ, mà để che đậy một lời nói dối.'

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {}
}

function safeString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim()
  return fallback
}

function safeArrayText(value: unknown): string {
  if (!Array.isArray(value)) return ''
  return value.map((item) => safeString(item)).filter(Boolean).join(', ')
}

function firstNonEmpty(record: JsonRecord, keys: string[], fallback = ''): string {
  for (const key of keys) {
    const value = safeString(record[key]) || safeArrayText(record[key])
    if (value) return value
  }

  return fallback
}

function compactText(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength).trim()}...`
}

function getStoryDna(record: JsonRecord): JsonRecord {
  return asRecord(record.story_dna ?? record.storyDna)
}

function normalizeCoverArtStyle(value: unknown): CoverArtStyleKey {
  const raw = safeString(value).toLowerCase()

  if (
    raw === 'anime-cinematic' ||
    raw === 'anime_cinematic' ||
    raw.includes('anime điện ảnh') ||
    raw.includes('anime cinematic')
  ) {
    return 'anime-cinematic'
  }

  if (
    raw === 'modern-manhwa' ||
    raw === 'modern_manhwa' ||
    raw.includes('manhwa') ||
    raw.includes('modern manhwa')
  ) {
    return 'modern-manhwa'
  }

  if (
    raw === 'manga-drama' ||
    raw === 'manga_drama' ||
    raw.includes('manga') ||
    raw.includes('đen trắng')
  ) {
    return 'manga-drama'
  }

  if (
    raw === 'semi-realistic' ||
    raw === 'semi_realistic' ||
    raw.includes('semi realistic') ||
    raw.includes('semi-realistic')
  ) {
    return 'semi-realistic'
  }

  if (
    raw === 'movie-poster' ||
    raw === 'movie_poster' ||
    raw.includes('poster phim') ||
    raw.includes('movie poster')
  ) {
    return 'movie-poster'
  }

  return 'auto'
}

function joinStorySource(record: JsonRecord): string {
  const storyDna = getStoryDna(record)
  const factorySeed = asRecord(storyDna.factory_seed)
  const coverConcept = asRecord(storyDna.coverConcept)
  const motifFingerprint = asRecord(storyDna.motifFingerprint)

  const parts = [
    firstNonEmpty(record, ['title', 'storyTitle', 'name']),
    firstNonEmpty(record, ['summary', 'description', 'storySummary', 'logline', 'idea', 'prompt']),
    firstNonEmpty(record, ['genre', 'genreLabel', 'category']),
    firstNonEmpty(record, ['tags', 'genres']),
    firstNonEmpty(factorySeed, [
      'title',
      'corePremise',
      'openingScene',
      'incitingIncident',
      'evidenceObject',
      'mainConflict',
      'hiddenTruth',
      'setting',
      'villainType',
      'emotionalHook',
      'powerStructure',
      'publicPressure',
    ]),
    firstNonEmpty(coverConcept, ['visualAnchor', 'mainScene', 'coverScene', 'mood', 'symbolicObjects']),
    firstNonEmpty(motifFingerprint, [
      'premiseFamily',
      'openingArena',
      'incitingIncident',
      'evidenceType',
      'evidenceObject',
      'mainArena',
      'relationshipCore',
      'twistEngine',
    ]),
  ]

  return parts.filter(Boolean).join('\n').toLowerCase()
}

function inferEvidenceFromText(record: JsonRecord): string {
  const source = joinStorySource(record)

  const evidenceRules: Array<{ keywords: string[]; evidence: string }> = [
    {
      keywords: ['b2309', 'nhận con nuôi', 'hồ sơ nhận con nuôi', 'adoption'],
      evidence:
        'hồ sơ nhận con nuôi mã B2309-A, giấy tờ bị niêm phong, ảnh trẻ em và chữ ký đáng ngờ',
    },
    {
      keywords: ['gấu bông', 'đồ chơi', 'món đồ chơi'],
      evidence: 'món đồ chơi của đứa trẻ bị bỏ lại ở nơi lẽ ra con chưa từng đến',
    },
    {
      keywords: ['camera', 'cctv', 'clip', 'video', 'mất dữ liệu', 'không có dữ liệu'],
      evidence:
        'màn hình CCTV, đoạn camera bị xóa, timestamp bất thường và khoảng thời gian mất dữ liệu',
    },
    {
      keywords: ['ghi âm', 'cuộc gọi', 'file âm thanh', 'điện thoại'],
      evidence:
        'điện thoại hiển thị bằng chứng ghi âm hoặc cuộc gọi khiến phản diện không thể chối cãi',
    },
    {
      keywords: ['thẻ phòng', 'khách sạn', 'mã phòng'],
      evidence: 'thẻ phòng khách sạn, log ra vào và thông tin phòng bị che giấu',
    },
    {
      keywords: ['hợp đồng', 'cổ phần', 'tài sản', 'chuyển khoản'],
      evidence: 'hợp đồng, sao kê chuyển khoản, giấy tờ tài sản hoặc cổ phần bị thao túng',
    },
    {
      keywords: ['xét nghiệm', 'dna', 'giám định'],
      evidence: 'giấy xét nghiệm hoặc kết quả giám định bị sửa đổi',
    },
  ]

  for (const rule of evidenceRules) {
    if (rule.keywords.some((keyword) => source.includes(keyword))) return rule.evidence
  }

  return ''
}

function inferSettingFromText(record: JsonRecord): string {
  const source = joinStorySource(record)

  const settingRules: Array<{ keywords: string[]; setting: string }> = [
    {
      keywords: ['sân bay', 'airport', 'máy bay', 'boarding', 'vali'],
      setting: 'sân bay, phòng chờ hạng thương gia, cửa kính nhìn ra đường băng và vali bên cạnh',
    },
    {
      keywords: ['bữa cơm', 'bàn ăn', 'gia tộc', 'biệt thự', 'mẹ chồng'],
      setting: 'biệt thự giàu có, bàn ăn gia tộc, ánh sáng vàng sang trọng nhưng ngột ngạt',
    },
    {
      keywords: ['họp báo', 'livestream', 'bữa tiệc', 'phòng tiệc', 'đám đông'],
      setting:
        'sảnh tiệc hoặc nơi công khai sang trọng, nhiều người chứng kiến khoảnh khắc sự thật bị phơi bày',
    },
    {
      keywords: ['phòng khách', 'căn hộ', 'penthouse', 'chung cư cao cấp'],
      setting:
        'phòng khách hoặc penthouse hiện đại, nội thất cao cấp, cửa kính lớn nhìn ra thành phố',
    },
    {
      keywords: ['văn phòng', 'tập đoàn', 'hội đồng quản trị', 'công ty'],
      setting: 'văn phòng cao cấp, phòng họp tập đoàn, không khí đấu trí và quyền lực',
    },
  ]

  for (const rule of settingRules) {
    if (rule.keywords.some((keyword) => source.includes(keyword))) return rule.setting
  }

  return ''
}

function inferSceneTemplate(record: JsonRecord, textBlob: string): SceneTemplateKey {
  const source = `${joinStorySource(record)}\n${textBlob}`.toLowerCase()
  const hasAny = (keywords: string[]) => keywords.some((keyword) => source.includes(keyword))

  if (
    hasAny([
      'sân bay',
      'airport',
      'máy bay',
      'boarding',
      'vali',
      'hộ chiếu',
      'vé máy bay',
      'bỏ trốn',
      'xuất cảnh',
    ])
  ) {
    return 'airport-secret'
  }

  if (
    hasAny([
      'ghi âm',
      'cuộc gọi',
      'điện thoại',
      'tin nhắn',
      'sms',
      'file âm thanh',
      'recording',
      'call log',
    ])
  ) {
    return 'phone-showdown'
  }

  if (
    hasAny([
      'họp báo',
      'livestream',
      'phòng tiệc',
      'bữa tiệc',
      'đám đông',
      'công khai',
      'vạch mặt',
      'bóc trần',
      'phơi bày',
      'vả mặt',
      'hot search',
    ])
  ) {
    return 'public-exposure'
  }

  if (
    hasAny([
      'bữa cơm',
      'bàn ăn',
      'gia tộc',
      'mẹ chồng',
      'bố chồng',
      'nhà họ',
      'biệt thự',
      'tiệc gia đình',
      'gia đình chồng',
    ])
  ) {
    return 'family-dinner'
  }

  return 'penthouse-dossier'
}

function buildFallbackLogline(title: string): string {
  return `Câu chuyện "${title}" xoay quanh một bí mật bị che giấu, một vật chứng quan trọng và khoảnh khắc nữ chính buộc phải đối mặt với những người từng lừa dối mình.`
}

function normalizePromptData(input: unknown): CoverPromptData {
  const story = asRecord(input)
  const storyDna = getStoryDna(story)
  const factorySeed = asRecord(storyDna.factory_seed)
  const coverConcept = asRecord(storyDna.coverConcept)
  const motifFingerprint = asRecord(storyDna.motifFingerprint)

  const title = firstNonEmpty(story, ['title', 'storyTitle', 'story_title', 'name'], DEFAULT_TITLE)

  const genre = firstNonEmpty(
    story,
    ['genreLabel', 'genre', 'category', 'moduleLabel', 'module_label', 'module', 'theme', 'tags', 'genres'],
    DEFAULT_GENRE,
  )

  const logline = compactText(
    firstNonEmpty(story, ['logline', 'summary', 'description', 'storySummary', 'idea', 'prompt'], '') ||
      firstNonEmpty(factorySeed, ['corePremise', 'mainConflict', 'hiddenTruth', 'emotionalHook'], '') ||
      buildFallbackLogline(title),
    900,
  )

  const heroine = compactText(
    firstNonEmpty(
      story,
      ['heroine', 'heroineLabel', 'femaleLead', 'female_lead', 'mainCharacter', 'protagonist'],
      '',
    ) || firstNonEmpty(factorySeed, ['heroineArc'], DEFAULT_HEROINE),
    260,
  )

  const antagonist = compactText(
    firstNonEmpty(story, ['antagonist', 'villain', 'opponent', 'rival', 'enemy'], '') ||
      firstNonEmpty(factorySeed, ['villainType', 'powerStructure'], DEFAULT_ANTAGONIST),
    260,
  )

  const relationshipCore = compactText(
    firstNonEmpty(
      story,
      ['relationshipCore', 'relationship_core', 'centralRelationship', 'conflict', 'coreConflict'],
      '',
    ) ||
      firstNonEmpty(motifFingerprint, ['relationshipCore', 'premiseFamily'], '') ||
      firstNonEmpty(factorySeed, ['mainConflict', 'powerStructure'], DEFAULT_RELATIONSHIP),
    300,
  )

  const keyEvidence = compactText(
    firstNonEmpty(
      story,
      [
        'keyEvidence',
        'key_evidence',
        'evidence',
        'evidenceObject',
        'mainEvidence',
        'visualAnchor',
        'motif',
      ],
      '',
    ) ||
      firstNonEmpty(coverConcept, ['visualAnchor', 'symbolicObjects'], '') ||
      firstNonEmpty(factorySeed, ['evidenceObject', 'incitingIncident'], '') ||
      firstNonEmpty(motifFingerprint, ['evidenceObject', 'evidenceType'], '') ||
      inferEvidenceFromText(story) ||
      DEFAULT_EVIDENCE,
    260,
  )

  const setting = compactText(
    firstNonEmpty(story, ['setting', 'mainSetting', 'location', 'background', 'world'], '') ||
      firstNonEmpty(coverConcept, ['mainScene', 'coverScene'], '') ||
      firstNonEmpty(factorySeed, ['setting', 'openingScene'], '') ||
      firstNonEmpty(motifFingerprint, ['mainArena', 'openingArena'], '') ||
      inferSettingFromText(story) ||
      DEFAULT_SETTING,
    260,
  )

  const emotionalCore = compactText(
    firstNonEmpty(story, ['emotionalCore', 'mainEmotion', 'climax', 'coverScene', 'highMoment'], '') ||
      firstNonEmpty(coverConcept, ['mainScene', 'coverScene', 'mood'], '') ||
      firstNonEmpty(factorySeed, ['emotionalHook', 'incitingIncident'], DEFAULT_EMOTIONAL_CORE),
    380,
  )

  const moodKeywords = compactText(
    firstNonEmpty(story, ['moodKeywords', 'mood', 'tone', 'atmosphere'], '') ||
      firstNonEmpty(coverConcept, ['mood', 'colorMood'], DEFAULT_MOOD),
    260,
  )

  const tagline = compactText(firstNonEmpty(story, ['tagline', 'slogan', 'subtitle'], DEFAULT_TAGLINE), 160)

  const coverArtStyle = normalizeCoverArtStyle(
    story.cover_art_style ?? story.coverArtStyle ?? story.visual_style ?? story.style,
  )

  const textBlob = [
    title,
    genre,
    logline,
    heroine,
    antagonist,
    relationshipCore,
    keyEvidence,
    setting,
    emotionalCore,
    moodKeywords,
  ].join('\n')

  const sceneTemplate = inferSceneTemplate(story, textBlob)

  return {
    title,
    genre,
    logline,
    heroine,
    antagonist,
    relationshipCore,
    keyEvidence,
    setting,
    emotionalCore,
    moodKeywords,
    tagline,
    coverArtStyle,
    sceneTemplate,
  }
}

function buildStoryGroundingBlock(data: CoverPromptData): string {
  return `
STORY GROUNDING — highest priority:
Create a vertical Vietnamese web-novel cover, aspect ratio 2:3, premium commercial quality.

The image must NOT be a generic beauty portrait.
The image must visually tell the core story through characters, setting, facial expressions, conflict, and evidence objects.

Story information:
- Title: "${data.title}"
- Genre: ${data.genre}
- Short logline: ${data.logline}
- Female lead / heroine: ${data.heroine}
- Antagonist or opposing force: ${data.antagonist}
- Central relationship / conflict: ${data.relationshipCore}
- Most important evidence / visual anchor: ${data.keyEvidence}
- Main setting: ${data.setting}
- Emotional core scene: ${data.emotionalCore}
- Mood keywords: ${data.moodKeywords}

Mandatory visual rules:
- The cover must have one clear central female lead.
- The most important evidence / visual anchor must be visible in the image: ${data.keyEvidence}
- The image must show tension, secrecy, confrontation, betrayal, or a truth about to be revealed.
- The scene must feel specific to this story, not a generic fashion poster.
- Use supporting characters, props, documents, screens, photos, or reflections to communicate the plot.
- The scene layout must be chosen according to the story content automatically.
`.trim()
}

function buildGeneralQualityBlock(): string {
  return `
General quality rules:
- High-end modern Asian web-novel cover.
- Strong composition, commercially usable, premium visual polish.
- Adult characters only, expressive faces, emotional tension.
- Clear focal point, readable hierarchy, polished storytelling image.
- Do not make the image childish or empty.
`.trim()
}

function buildArtStyleBlock(style: CoverArtStyleKey): string {
  switch (style) {
    case 'anime-cinematic':
      return `
Selected art style: ANIME CINEMATIC.
Rendering direction:
- polished anime illustration
- cinematic lighting
- rich glow, strong atmosphere, premium drama vibe
- elegant faces, expressive eyes, beautiful hair rendering
- high-detail modern web novel cover look
`.trim()

    case 'modern-manhwa':
      return `
Selected art style: MODERN MANHWA.
Rendering direction:
- high-end Korean webtoon / manhwa inspired cover art
- modern fashion styling, clean rendering, elegant anatomy
- soft luxury palette, polished shading, premium romance-drama look
- detailed faces and stylish character presentation
`.trim()

    case 'manga-drama':
      return `
Selected art style: MANGA DRAMA.
Rendering direction:
- dramatic manga-inspired cover
- monochrome or near-monochrome black-and-white ink feeling
- strong linework, screen-tone vibe, expressive emotional contrast
- manga panel energy but still presented as one coherent cover composition
- keep title area readable and the central story evidence visible
`.trim()

    case 'semi-realistic':
      return `
Selected art style: SEMI-REALISTIC.
Rendering direction:
- semi-realistic premium novel cover
- realistic lighting and materials
- refined faces, elegant styling, mature drama tone
- luxurious commercial-cover finish with subtle illustration aesthetics
`.trim()

    case 'movie-poster':
      return `
Selected art style: MOVIE POSTER.
Rendering direction:
- cinematic poster-like composition
- dramatic lighting, strong depth, high emotional impact
- polished character arrangement like a premium drama film poster
- elegant, tense, commercial, striking
`.trim()

    case 'auto':
    default:
      return `
Selected art style: AUTO.
Rendering direction:
- choose the most suitable premium modern web-novel cover rendering style
- lean toward polished anime/manhwa commercial cover aesthetics
`.trim()
  }
}

function buildSceneTemplateBlock(scene: SceneTemplateKey): string {
  switch (scene) {
    case 'family-dinner':
      return `
AUTO SELECTED SCENE TEMPLATE: FAMILY DINNER DRAMA.

Composition guidance:
- wealthy family dining room or elegant banquet table
- female lead in the foreground or center
- 4 to 5 related characters around the table: patriarch, matriarch, husband, rival, family members
- tension shown through eye contact, silence, posture
- dishes, tea cups, wine glasses, flowers, plus the key evidence visible on the table
- the mood should feel beautiful on the surface but suffocating underneath
`.trim()

    case 'airport-secret':
      return `
AUTO SELECTED SCENE TEMPLATE: AIRPORT SECRET.

Composition guidance:
- luxury airport lounge or departure area
- character near a large glass window with airplane or runway outside
- luggage, boarding pass, departure board, dark table, reflections
- the key evidence must appear in hand, on the table, or near the suitcase
- the mood should suggest that someone is carrying the truth away or trying to flee
`.trim()

    case 'public-exposure':
      return `
AUTO SELECTED SCENE TEMPLATE: PUBLIC EXPOSURE.

Composition guidance:
- luxury party, ballroom, press event, banquet hall, or public gathering
- female lead in the center or foreground revealing proof
- shocked family members, rival, husband, or crowd in the background
- flying papers, dramatic movement, elegant event lighting
- the image should feel like a public reveal or public humiliation moment
`.trim()

    case 'phone-showdown':
      return `
AUTO SELECTED SCENE TEMPLATE: PHONE EVIDENCE SHOWDOWN.

Composition guidance:
- luxury living room or elegant private interior
- female lead standing in the center holding up a phone with proof
- other characters reacting strongly: pointing, shouting, lunging, collapsing, freezing
- on the table: dossier, photos, family picture, contract, papers, or other story evidence
- the scene should feel like a truth bomb has just exploded
`.trim()

    case 'penthouse-dossier':
    default:
      return `
AUTO SELECTED SCENE TEMPLATE: PENTHOUSE DOSSIER.

Composition guidance:
- luxury apartment, penthouse, office, or high-rise interior
- female lead centered, holding a dossier, folder, envelope, or key document
- supporting characters in the background: husband, rival, matriarch, lawyer, family member
- marble table, laptop, flowers, tea cup, skyline through tall windows
- calm surface, but emotionally tense and story-heavy
`.trim()
  }
}

function buildTypographyBlock(data: CoverPromptData): string {
  return `
Typography:
- Add the Vietnamese title clearly and beautifully: "${data.title}"
- Add a short tagline if there is enough space: "${data.tagline}"
- Typography should feel premium, dramatic, elegant, and readable.
- Use Vietnamese diacritics correctly as much as possible.
- Do not add random English title text, logos, publisher marks, QR codes, watermarks, or unrelated UI elements.
`.trim()
}

function buildNegativeBlock(): string {
  return `
Avoid:
- Do not make only a simple portrait with no story evidence.
- Do not ignore the key evidence.
- Do not create a random fashion editorial unrelated to the plot.
- Do not make the image look like a children's cartoon.
- Do not create sci-fi, fantasy, ancient costume, historical palace, or magical elements unless the story explicitly requires it.
- Do not add unrelated weapons, police badges, horror monsters, zombies, or supernatural effects.
- Do not add website UI, buttons, screenshots, app interface, or browser elements.
- Do not use any watermark or logo.
`.trim()
}

function buildFallbackPrompt(data: CoverPromptData): string {
  return `Vertical 2:3 premium Vietnamese modern drama web-novel cover for "${data.title}". Art style: ${data.coverArtStyle}. Story-driven scene template: ${data.sceneTemplate}. Central adult female lead, emotional confrontation, visible story evidence: ${data.keyEvidence}. Elegant Vietnamese title, no logo, no watermark.`
}

export function buildCoverPrompt(input: unknown): CoverPromptResult {
  const data = normalizePromptData(input)

  const prompt = [
    buildStoryGroundingBlock(data),
    buildGeneralQualityBlock(),
    buildArtStyleBlock(data.coverArtStyle),
    buildSceneTemplateBlock(data.sceneTemplate),
    buildTypographyBlock(data),
    buildNegativeBlock(),
    `
Final instruction:
Create one polished final cover image in vertical 2:3 format.
The selected ART STYLE is "${data.coverArtStyle}".
The SCENE TEMPLATE must be inferred from story content and is "${data.sceneTemplate}".
Story content, key evidence, and emotional conflict are more important than pure beauty.
`.trim(),
  ].join('\n\n')

  return {
    prompt,
    fallbackPrompt: buildFallbackPrompt(data),
    coverConcept: {
      version: 'story-grounded-cover-art-style-v2',
      coverArtStyle: data.coverArtStyle,
      sceneTemplate: data.sceneTemplate,
      title: data.title,
      genre: data.genre,
      logline: data.logline,
      heroine: data.heroine,
      antagonist: data.antagonist,
      relationshipCore: data.relationshipCore,
      keyEvidence: data.keyEvidence,
      setting: data.setting,
      emotionalCore: data.emotionalCore,
      moodKeywords: data.moodKeywords,
      tagline: data.tagline,
    },
  }
}

export default buildCoverPrompt
