type CoverStyleKey =
  | 'auto'
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
  coverStyle: Exclude<CoverStyleKey, 'auto'>
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

function normalizeCoverStyle(value: unknown): CoverStyleKey {
  const raw = safeString(value).toLowerCase()

  if (
    raw === 'family-dinner' ||
    raw === 'family_dinner' ||
    raw === 'dinner' ||
    raw.includes('bữa cơm') ||
    raw.includes('gia tộc')
  ) {
    return 'family-dinner'
  }

  if (
    raw === 'penthouse-dossier' ||
    raw === 'penthouse_dossier' ||
    raw === 'penthouse' ||
    raw.includes('hồ sơ trong tay') ||
    raw.includes('cầm hồ sơ') ||
    raw.includes('căn hộ')
  ) {
    return 'penthouse-dossier'
  }

  if (
    raw === 'airport-secret' ||
    raw === 'airport_secret' ||
    raw === 'airport' ||
    raw.includes('sân bay') ||
    raw.includes('bỏ trốn')
  ) {
    return 'airport-secret'
  }

  if (
    raw === 'public-exposure' ||
    raw === 'public_exposure' ||
    raw === 'exposure' ||
    raw.includes('vả mặt') ||
    raw.includes('công khai') ||
    raw.includes('bóc trần') ||
    raw.includes('phơi bày')
  ) {
    return 'public-exposure'
  }

  if (
    raw === 'phone-showdown' ||
    raw === 'phone_showdown' ||
    raw === 'phone' ||
    raw.includes('điện thoại') ||
    raw.includes('ghi âm') ||
    raw.includes('tin nhắn') ||
    raw.includes('cuộc gọi')
  ) {
    return 'phone-showdown'
  }

  return 'auto'
}

function getNestedRecord(record: JsonRecord, key: string): JsonRecord {
  return asRecord(record[key])
}

function getStoryDna(record: JsonRecord): JsonRecord {
  return asRecord(record.story_dna ?? record.storyDna)
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
    firstNonEmpty(record, ['style', 'visual_style', 'cover_style']),
    firstNonEmpty(storyDna, ['motifText', 'story_memory', 'storyMemory']),
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
      setting: 'phòng khách hoặc penthouse hiện đại, nội thất cao cấp, cửa kính lớn nhìn ra thành phố',
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
    firstNonEmpty(
      story,
      ['emotionalCore', 'mainEmotion', 'climax', 'coverScene', 'highMoment'],
      '',
    ) ||
      firstNonEmpty(coverConcept, ['mainScene', 'coverScene', 'mood'], '') ||
      firstNonEmpty(factorySeed, ['emotionalHook', 'incitingIncident'], DEFAULT_EMOTIONAL_CORE),
    380,
  )

  const moodKeywords = compactText(
    firstNonEmpty(story, ['moodKeywords', 'mood', 'tone', 'atmosphere', 'visual_style', 'style'], '') ||
      firstNonEmpty(coverConcept, ['mood', 'colorMood'], DEFAULT_MOOD),
    260,
  )

  const tagline = compactText(firstNonEmpty(story, ['tagline', 'slogan', 'subtitle'], DEFAULT_TAGLINE), 160)

  const requestedStyle = normalizeCoverStyle(
    story.cover_style ?? story.coverStyle ?? story.imageStyle ?? story.style ?? story.visual_style,
  )

  const dataWithoutStyle = {
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
  }

  const coverStyle =
    requestedStyle === 'auto' ? autoPickCoverStyle(story, dataWithoutStyle) : requestedStyle

  return {
    ...dataWithoutStyle,
    coverStyle,
  }
}

function autoPickCoverStyle(
  record: JsonRecord,
  data: Omit<CoverPromptData, 'coverStyle'>,
): Exclude<CoverStyleKey, 'auto'> {
  const source = `${joinStorySource(record)}\n${Object.values(data).join('\n')}`.toLowerCase()
  const hasAny = (keywords: string[]) => keywords.some((keyword) => source.includes(keyword))

  if (hasAny(['sân bay', 'airport', 'máy bay', 'boarding', 'vali', 'hộ chiếu', 'vé máy bay', 'bỏ trốn', 'xuất cảnh'])) {
    return 'airport-secret'
  }

  if (hasAny(['ghi âm', 'cuộc gọi', 'điện thoại', 'tin nhắn', 'sms', 'file âm thanh', 'recording', 'call log'])) {
    return 'phone-showdown'
  }

  if (hasAny(['họp báo', 'livestream', 'phòng tiệc', 'bữa tiệc', 'đám đông', 'công khai', 'vạch mặt', 'bóc trần', 'phơi bày', 'vả mặt', 'hot search'])) {
    return 'public-exposure'
  }

  if (hasAny(['bữa cơm', 'bàn ăn', 'gia tộc', 'mẹ chồng', 'bố chồng', 'nhà họ', 'biệt thự', 'tiệc gia đình', 'gia đình chồng'])) {
    return 'family-dinner'
  }

  return 'penthouse-dossier'
}

function buildFallbackLogline(title: string): string {
  return `Câu chuyện "${title}" xoay quanh một bí mật bị che giấu, một vật chứng quan trọng và khoảnh khắc nữ chính buộc phải đối mặt với những người từng lừa dối mình.`
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
- If there is a dossier, case file, adoption file, phone evidence, CCTV, family photo, toy, contract, or old document in the story, show it clearly as part of the composition.
`.trim()
}

function buildUniversalStyleBlock(): string {
  return `
General visual quality:
- High-end Vietnamese / Chinese modern romance-drama web novel cover.
- Semi-realistic anime/manhwa inspired illustration, elegant faces, cinematic lighting, refined details.
- Beautiful but emotionally tense.
- Rich depth of field, polished commercial cover composition, dramatic rim light.
- Characters should look adult, expressive, and consistent with an urban modern drama.
- Avoid childish cartoon style.
- Avoid messy unreadable layouts.
- Avoid excessive gore or horror.
`.trim()
}

function buildStyleBlock(style: Exclude<CoverStyleKey, 'auto'>): string {
  switch (style) {
    case 'family-dinner':
      return `
Selected cover style: FAMILY DINNER DRAMA.

Style direction:
A warm luxury family-dinner drama cover. The setting is a wealthy mansion dining room or an elegant family banquet table. The surface should look beautiful, refined, and expensive, but the emotional atmosphere must feel suffocating and full of hidden conflict.

Composition:
- Put the female lead in the foreground or center, seated at or standing beside the dining table.
- She may turn back toward the viewer with a calm, wounded, resolute expression.
- Around the table, show 4 to 5 related characters: a stern patriarch, cold matriarch, distant husband, glamorous rival, or suspicious family members.
- Use eye contact, body language, silence, and distance between characters to show pressure.
- On the table, include dishes, tea cups, wine glasses, flowers, and the key evidence from the story.
- The evidence must feel naturally placed but still noticeable.

Details to emphasize:
- A dossier, file folder, child photo, old document, phone, toy, contract, or other evidence should be visible on the table.
- Golden sunlight or chandelier light should create a luxurious but tense mood.
- The cover should feel like a family secret is about to be exposed during a meal.
`.trim()

    case 'penthouse-dossier':
      return `
Selected cover style: PENTHOUSE DOSSIER.

Style direction:
A bright, clean, high-end penthouse / corporate-family drama cover. The image should feel modern, expensive, restrained, and intelligent. The female lead should look like someone who has learned the truth and is now quietly taking control.

Composition:
- Put the female lead in the center foreground wearing a white or cream suit, blouse, or elegant modern outfit.
- She should hold a dossier, folder, envelope, document stack, or case file connected to the story evidence.
- Behind her, place supporting characters such as the husband, rival woman, matriarch, lawyer, or family member.
- Use a luxury apartment, office, high-rise city view, marble table, laptop, flowers, tea cup, or skyline through tall windows.
- The scene should look calm on the surface but emotionally tense.

Details to emphasize:
- The dossier or evidence folder must be visible and should carry a mark, code, stamp, photo, or clue from the story when possible.
- The female lead must look composed, wounded, and strong.
- The background characters should suggest suspicion, guilt, rivalry, or pressure.
`.trim()

    case 'airport-secret':
      return `
Selected cover style: AIRPORT SECRET.

Style direction:
A dark luxury airport-lounge thriller cover. The image should feel sleek, expensive, cold, and suspenseful, as if a secret is being carried away or someone is about to flee.

Composition:
- Put one central character in a premium airport lounge, near a window looking out at an airplane or runway.
- The central character can be the female lead chasing the truth or an antagonist escaping with the secret.
- Include luggage, boarding pass, departure board, glass reflections, lounge chair, dark table, and the key evidence.
- A secondary character may appear as a reflection in the glass, a shadow in the background, or a distant watcher.
- The key evidence should be on the table, in the hand, inside a folder, or partly visible beside the suitcase.

Details to emphasize:
- The mood should say: someone is trying to take the truth away.
- The evidence should feel confidential, dangerous, and story-specific.
- Use cinematic shadows, cool tones, airport lights, and a mature thriller atmosphere.
`.trim()

    case 'public-exposure':
      return `
Selected cover style: PUBLIC EXPOSURE / PUBLIC FACE-SLAP.

Style direction:
A glamorous public-exposure drama cover. The image should capture the exact moment the female lead reveals proof in front of everyone. The emotion should feel explosive, elegant, satisfying, and powerful.

Composition:
- Put the female lead in the foreground or center, dressed elegantly, holding out documents, a phone, photos, or evidence.
- Behind or around her, show shocked family members, angry husband, horrified matriarch, panicked rival, or stunned guests.
- The setting can be a banquet hall, press event, luxury party, hotel ballroom, family event, or public gathering.
- Use golden light, chandelier sparkle, flying papers, crowd reactions, and dramatic movement.
- The evidence should be the second most important focus after the female lead.

Details to emphasize:
- The female lead should look beautiful, calm, and dominant, not hysterical.
- The antagonists should visibly panic, shout, recoil, or lose control.
- The image must clearly communicate public humiliation, truth revealed, and revenge payoff.
`.trim()

    case 'phone-showdown':
      return `
Selected cover style: PHONE EVIDENCE SHOWDOWN.

Style direction:
A modern luxury home confrontation cover. The focus is the moment the female lead raises a phone showing decisive evidence, such as a recording, call log, message, image, or video. The atmosphere should feel like a truth bomb has just exploded in the room.

Composition:
- Put the female lead standing in the center of a luxury living room, calm and controlled.
- She holds up a smartphone with evidence on the screen.
- Around her, show family members or opponents reacting strongly: pointing, shouting, lunging, collapsing, freezing, or trying to stop her.
- On a nearby table, include story-specific evidence: dossier, documents, family photo, wedding photo, child photo, notebook, contract, or scattered papers.
- The room should feel modern, expensive, and emotionally claustrophobic.

Details to emphasize:
- The phone must clearly function as the source of proof.
- The evidence on the table must connect to the story.
- Other characters' reactions must be strong enough that the viewer understands the truth cannot be denied.
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
  return `Vertical 2:3 premium Vietnamese modern drama web-novel cover for "${data.title}". Central adult female lead, emotional confrontation, visible story evidence: ${data.keyEvidence}. Style: ${data.coverStyle}. Cinematic semi-realistic anime/manhwa illustration, elegant typography with Vietnamese title, no logo, no watermark.`
}

export function buildCoverPrompt(input: unknown): CoverPromptResult {
  const data = normalizePromptData(input)

  const prompt = [
    buildStoryGroundingBlock(data),
    buildUniversalStyleBlock(),
    buildStyleBlock(data.coverStyle),
    buildTypographyBlock(data),
    buildNegativeBlock(),
    `
Final instruction:
Create one polished final cover image in vertical 2:3 format.
The cover must look commercially usable for a Vietnamese web story platform.
The chosen style is "${data.coverStyle}", but the story content and key evidence must remain the priority.
`.trim(),
  ].join('\n\n')

  return {
    prompt,
    fallbackPrompt: buildFallbackPrompt(data),
    coverConcept: {
      version: 'story-grounded-cover-style-v1',
      coverStyle: data.coverStyle,
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
