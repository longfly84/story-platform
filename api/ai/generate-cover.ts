import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'

type JsonRecord = Record<string, any>

type CoverBlueprint =
  | 'showbiz-scandal'
  | 'family-inheritance'
  | 'airport-mystery'
  | 'marriage-betrayal'
  | 'child-school'
  | 'hospital-truth'
  | 'corporate-war'
  | 'general-drama'

interface CoverConcept {
  blueprint: CoverBlueprint
  arena: string
  mood: string
  heroineLook: string
  secondaryFigures: string[]
  clueProps: string[]
  conflictVisuals: string[]
  colorTone: string
}

interface StoryInput {
  id?: string
  title: string
  summary?: string
  description?: string
  genre?: string
  genres?: string[]
  tags?: string[]
  slug?: string
  story_dna?: JsonRecord | string | null
  storyDna?: JsonRecord | string | null
  author?: string
  style?: string
  visual_style?: string
  cover_style?: string
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1'
const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  ''
const SUPABASE_COVER_BUCKET =
  process.env.SUPABASE_COVER_BUCKET || 'story-covers'

const openai = OPENAI_API_KEY
  ? new OpenAI({ apiKey: OPENAI_API_KEY })
  : null

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

function safeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function safeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => safeString(item))
    .filter(Boolean)
}

function parseMaybeJson<T = JsonRecord>(value: unknown): T | null {
  if (!value) return null
  if (typeof value === 'object') return value as T
  if (typeof value !== 'string') return null

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function normalizeText(value: string): string {
  return safeString(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

function uniqueStrings(list: string[], limit = 8): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const item of list) {
    const clean = safeString(item)
    const key = clean.toLowerCase()
    if (!clean || seen.has(key)) continue
    seen.add(key)
    result.push(clean)
    if (result.length >= limit) break
  }

  return result
}

function extractStoryInput(body: JsonRecord): StoryInput {
  const source = body.story || body.storyData || body.payload || body

  return {
    id: safeString(source.id),
    title: safeString(source.title),
    summary: safeString(source.summary),
    description: safeString(source.description || source.desc),
    genre: safeString(source.genre),
    genres: safeArray(source.genres),
    tags: safeArray(source.tags),
    slug: safeString(source.slug),
    story_dna: source.story_dna ?? source.storyDna ?? null,
    storyDna: source.storyDna ?? source.story_dna ?? null,
    author: safeString(source.author),
    style: safeString(source.style),
    visual_style: safeString(source.visual_style),
    cover_style: safeString(source.cover_style),
  }
}

function pickSummary(story: StoryInput): string {
  return (
    safeString(story.summary) ||
    safeString(story.description) ||
    ''
  )
}

function flattenStoryKeywords(story: StoryInput, storyDna: JsonRecord | null): string {
  const pieces: string[] = [
    story.title,
    story.summary,
    story.description,
    story.genre,
    ...(story.genres || []),
    ...(story.tags || []),
  ]

  if (storyDna) {
    const maybePieces = [
      storyDna.corePremise,
      storyDna.openingScene,
      storyDna.hiddenTruth,
      storyDna.evidenceObject,
      storyDna.emotionalStake,
      storyDna.villainAttack,
      storyDna.heroineCounter,
      storyDna.coverPromptHint,
      storyDna.motifText,
      storyDna.factory_seed,
      storyDna.arena,
      storyDna.setting,
      storyDna.hookVisual,
      storyDna.visualArena,
    ]

    for (const item of maybePieces) {
      if (typeof item === 'string') pieces.push(item)
    }

    if (Array.isArray(storyDna.tags)) {
      pieces.push(...storyDna.tags.map((x: unknown) => safeString(x)))
    }

    if (storyDna.coverConcept && typeof storyDna.coverConcept === 'object') {
      const coverConcept = storyDna.coverConcept as JsonRecord

      pieces.push(
        safeString(coverConcept.arena),
        safeString(coverConcept.mood),
        safeString(coverConcept.secondaryFigure),
        safeString(coverConcept.compositionType),
      )

      if (Array.isArray(coverConcept.clueProps)) {
        pieces.push(...coverConcept.clueProps.map((x: unknown) => safeString(x)))
      }
    }

    if (storyDna.motifFingerprint && typeof storyDna.motifFingerprint === 'object') {
      const fp = storyDna.motifFingerprint as JsonRecord
      const fpCandidates = [
        fp.premiseFamily,
        fp.premiseConflict,
        fp.premiseObject,
        fp.visualHook,
        fp.arenaType,
        fp.evidenceType,
        fp.publicArena,
        fp.secondaryArena,
        fp.deadlineStyle,
        fp.heroineCounterType,
        fp.villainAttackType,
      ]

      for (const item of fpCandidates) {
        if (typeof item === 'string') pieces.push(item)
      }
    }
  }

  return normalizeText(pieces.filter(Boolean).join(' | '))
}

function inferBlueprint(story: StoryInput, storyDna: JsonRecord | null): CoverBlueprint {
  const haystack = flattenStoryKeywords(story, storyDna)

  if (
    haystack.includes('showbiz') ||
    haystack.includes('hot search') ||
    haystack.includes('pr scandal') ||
    haystack.includes('paparazzi') ||
    haystack.includes('hop bao') ||
    haystack.includes('livestream') ||
    haystack.includes('giai tri')
  ) {
    return 'showbiz-scandal'
  }

  if (
    haystack.includes('gia toc') ||
    haystack.includes('thua ke') ||
    haystack.includes('di chuc') ||
    haystack.includes('tu duong') ||
    haystack.includes('me chong') ||
    haystack.includes('nha chong') ||
    haystack.includes('co dong')
  ) {
    return 'family-inheritance'
  }

  if (
    haystack.includes('san bay') ||
    haystack.includes('boarding pass') ||
    haystack.includes('ve may bay') ||
    haystack.includes('mat tich') ||
    haystack.includes('departure') ||
    haystack.includes('hanh ly')
  ) {
    return 'airport-mystery'
  }

  if (
    haystack.includes('ngoai tinh') ||
    haystack.includes('hon nhan') ||
    haystack.includes('chong') ||
    haystack.includes('ly hon') ||
    haystack.includes('ban than phan boi') ||
    haystack.includes('nguoi thu ba')
  ) {
    return 'marriage-betrayal'
  }

  if (
    haystack.includes('truong hoc') ||
    haystack.includes('phu huynh') ||
    haystack.includes('lop hoc') ||
    haystack.includes('con nho') ||
    haystack.includes('giao vien') ||
    haystack.includes('quyen nuoi con')
  ) {
    return 'child-school'
  }

  if (
    haystack.includes('benh vien') ||
    haystack.includes('ho so benh an') ||
    haystack.includes('xet nghiem') ||
    haystack.includes('dna') ||
    haystack.includes('phong cap cuu') ||
    haystack.includes('bac si')
  ) {
    return 'hospital-truth'
  }

  if (
    haystack.includes('tap doan') ||
    haystack.includes('hoi dong') ||
    haystack.includes('van phong') ||
    haystack.includes('thuong chien') ||
    haystack.includes('co phan') ||
    haystack.includes('hop dong') ||
    haystack.includes('doanh nghiep')
  ) {
    return 'corporate-war'
  }

  return 'general-drama'
}

function pickStoryField(storyDna: JsonRecord | null, keys: string[]): string {
  if (!storyDna) return ''
  for (const key of keys) {
    const value = storyDna[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function pickArrayField(storyDna: JsonRecord | null, keys: string[]): string[] {
  if (!storyDna) return []
  for (const key of keys) {
    const value = storyDna[key]
    if (Array.isArray(value)) {
      return value
        .map((item) => safeString(item))
        .filter(Boolean)
    }
  }
  return []
}

function buildCoverConcept(story: StoryInput, storyDna: JsonRecord | null): CoverConcept {
  const blueprint = inferBlueprint(story, storyDna)

  const storySummary = pickSummary(story)
  const heroineLook =
    pickStoryField(storyDna, [
      'heroineVisual',
      'heroineLook',
      'heroineArchetype',
      'heroineType',
    ]) || 'một nữ chính hiện đại, đẹp sắc sảo, ánh mắt mạnh, có khí chất chịu đựng nhưng không yếu'

  const dnaCoverConcept =
    storyDna && typeof storyDna.coverConcept === 'object'
      ? (storyDna.coverConcept as JsonRecord)
      : null

  const dnaClueProps = uniqueStrings([
    ...(dnaCoverConcept?.clueProps || []),
    ...pickArrayField(storyDna, ['clueProps', 'visualClues', 'hookProps']),
    pickStoryField(storyDna, ['evidenceObject', 'evidenceType', 'hookVisual']),
  ])

  const dnaSecondary = uniqueStrings([
    ...(Array.isArray(dnaCoverConcept?.secondaryFigures)
      ? dnaCoverConcept.secondaryFigures.map((x: unknown) => safeString(x))
      : []),
    safeString(dnaCoverConcept?.secondaryFigure),
    pickStoryField(storyDna, ['villainFigure', 'secondaryFigure', 'shadowFigure']),
  ])

  const dnaConflictVisuals = uniqueStrings([
    ...(Array.isArray(dnaCoverConcept?.conflictVisuals)
      ? dnaCoverConcept.conflictVisuals.map((x: unknown) => safeString(x))
      : []),
    pickStoryField(storyDna, ['villainAttack', 'heroineCounter', 'emotionalStake']),
  ])

  const fallbackByBlueprint: Record<CoverBlueprint, Omit<CoverConcept, 'blueprint' | 'heroineLook'>> = {
    'showbiz-scandal': {
      arena:
        safeString(dnaCoverConcept?.arena) ||
        'một buổi họp báo hoặc sân khấu truyền thông với màn hình LED, flash paparazzi và cảm giác scandal công khai',
      mood:
        safeString(dnaCoverConcept?.mood) ||
        'công khai, áp lực truyền thông, thắng thua, scandal, đối đầu trước công chúng',
      secondaryFigures:
        dnaSecondary.length > 0
          ? dnaSecondary
          : ['một người đàn ông lạnh lùng ở phía sau', 'một người phụ nữ mỉm cười đầy khiêu khích'],
      clueProps:
        dnaClueProps.length > 0
          ? dnaClueProps
          : ['điện thoại hiện hot search', 'micro họp báo', 'ánh flash paparazzi'],
      conflictVisuals:
        dnaConflictVisuals.length > 0
          ? dnaConflictVisuals
          : ['xuất hiện dòng hot search hoặc scandal trên màn hình', 'không khí công kích truyền thông'],
      colorTone: 'đỏ đen vàng, ánh đèn truyền thông kịch tính',
    },

    'family-inheritance': {
      arena:
        safeString(dnaCoverConcept?.arena) ||
        'một không gian gia tộc quyền lực như biệt thự, phòng họp gia tộc, từ đường hoặc phòng hội đồng',
      mood:
        safeString(dnaCoverConcept?.mood) ||
        'quyền lực, đấu đá gia tộc, thừa kế, căng thẳng lạnh lùng',
      secondaryFigures:
        dnaSecondary.length > 0
          ? dnaSecondary
          : ['một trưởng bối nghiêm khắc', 'một người đàn ông quyền lực đứng trong bóng tối'],
      clueProps:
        dnaClueProps.length > 0
          ? dnaClueProps
          : ['di chúc hoặc hồ sơ thừa kế', 'chiếc nhẫn hoặc con dấu gia tộc'],
      conflictVisuals:
        dnaConflictVisuals.length > 0
          ? dnaConflictVisuals
          : ['ánh nhìn nghi kỵ trong gia tộc', 'không khí tranh giành quyền lực'],
      colorTone: 'xanh đậm, vàng tối, nâu đen, sang trọng nhưng đầy sức ép',
    },

    'airport-mystery': {
      arena:
        safeString(dnaCoverConcept?.arena) ||
        'một sảnh sân bay về đêm, bảng chuyến bay điện tử, cửa lên máy bay hoặc hành lang chờ',
      mood:
        safeString(dnaCoverConcept?.mood) ||
        'bí ẩn, truy đuổi, mất tích, khẩn cấp, lạnh và căng',
      secondaryFigures:
        dnaSecondary.length > 0
          ? dnaSecondary
          : ['một bóng người đang rời đi', 'một người đàn ông quay lưng chuẩn bị biến mất'],
      clueProps:
        dnaClueProps.length > 0
          ? dnaClueProps
          : ['vé máy bay hoặc boarding pass', 'điện thoại có hình camera an ninh', 'vali hoặc hành lý'],
      conflictVisuals:
        dnaConflictVisuals.length > 0
          ? dnaConflictVisuals
          : ['cảm giác người quan trọng vừa biến mất', 'manh mối đang bị che giấu'],
      colorTone: 'xanh lạnh, trắng xám, ánh đèn sân bay, cinematic',
    },

    'marriage-betrayal': {
      arena:
        safeString(dnaCoverConcept?.arena) ||
        'một không gian hôn nhân đổ vỡ như phòng khách sang trọng, khách sạn hoặc cảnh đối đầu riêng tư',
      mood:
        safeString(dnaCoverConcept?.mood) ||
        'phản bội, đau đớn, lạnh lòng, chuẩn bị trả thù',
      secondaryFigures:
        dnaSecondary.length > 0
          ? dnaSecondary
          : ['một người chồng hoặc bạn trai trong nền', 'một người phụ nữ thứ ba lấp ló sau lưng'],
      clueProps:
        dnaClueProps.length > 0
          ? dnaClueProps
          : ['nhẫn cưới', 'tin nhắn trong điện thoại', 'ly rượu hoặc chìa khóa phòng khách sạn'],
      conflictVisuals:
        dnaConflictVisuals.length > 0
          ? dnaConflictVisuals
          : ['không khí phản bội', 'sự thật tình cảm bị xé toạc'],
      colorTone: 'đỏ đô, đen, vàng tối, cảm giác đau và báo thù',
    },

    'child-school': {
      arena:
        safeString(dnaCoverConcept?.arena) ||
        'trường học, hành lang lớp, cổng trường hoặc buổi họp phụ huynh đầy căng thẳng',
      mood:
        safeString(dnaCoverConcept?.mood) ||
        'bảo vệ con, áp lực xã hội, tổn thương nhưng kiên cường',
      secondaryFigures:
        dnaSecondary.length > 0
          ? dnaSecondary
          : ['một đứa trẻ đứng cạnh hoặc phía sau nữ chính', 'phụ huynh hoặc giáo viên trong nền'],
      clueProps:
        dnaClueProps.length > 0
          ? dnaClueProps
          : ['cặp sách hoặc đồng phục học sinh', 'điện thoại hoặc tin nhắn phụ huynh', 'giấy tờ liên quan đến đứa trẻ'],
      conflictVisuals:
        dnaConflictVisuals.length > 0
          ? dnaConflictVisuals
          : ['đứa trẻ bị cuốn vào cuộc chiến người lớn', 'nữ chính bảo vệ con trong áp lực xã hội'],
      colorTone: 'xanh xám, vàng ấm nhẹ, buồn nhưng có sức mạnh',
    },

    'hospital-truth': {
      arena:
        safeString(dnaCoverConcept?.arena) ||
        'bệnh viện, hành lang cấp cứu, phòng bệnh hoặc nơi cất giấu bí mật y khoa',
      mood:
        safeString(dnaCoverConcept?.mood) ||
        'bí mật y khoa, sự thật bị giấu kín, căng thẳng, đau và lạnh',
      secondaryFigures:
        dnaSecondary.length > 0
          ? dnaSecondary
          : ['một bác sĩ hoặc y tá trong nền', 'một người thân yếu ớt phía sau'],
      clueProps:
        dnaClueProps.length > 0
          ? dnaClueProps
          : ['hồ sơ bệnh án', 'kết quả xét nghiệm', 'vòng tay bệnh viện'],
      conflictVisuals:
        dnaConflictVisuals.length > 0
          ? dnaConflictVisuals
          : ['sự thật sinh học hoặc bí mật thân phận đang bị che lại', 'cuộc chạy đua tìm sự thật'],
      colorTone: 'trắng xanh lạnh, xám bạc, sắc nét và căng',
    },

    'corporate-war': {
      arena:
        safeString(dnaCoverConcept?.arena) ||
        'tòa nhà tập đoàn, phòng họp kính, hội đồng quản trị hoặc văn phòng cao cấp',
      mood:
        safeString(dnaCoverConcept?.mood) ||
        'thương chiến, quyền lực, đấu trí, đè ép nhưng phản công',
      secondaryFigures:
        dnaSecondary.length > 0
          ? dnaSecondary
          : ['một người đàn ông quyền lực trong bộ vest', 'các bóng người hội đồng mờ ở nền'],
      clueProps:
        dnaClueProps.length > 0
          ? dnaClueProps
          : ['hồ sơ hợp đồng', 'thẻ ra vào', 'điện thoại chứa bằng chứng', 'màn hình dữ liệu'],
      conflictVisuals:
        dnaConflictVisuals.length > 0
          ? dnaConflictVisuals
          : ['đối đầu ở phòng họp', 'nữ chính chuẩn bị lật thế cờ'],
      colorTone: 'xanh đen, xám bạc, vàng kim nhẹ, hiện đại',
    },

    'general-drama': {
      arena:
        safeString(dnaCoverConcept?.arena) ||
        'một không gian hiện đại có chiều sâu, đủ để kể câu chuyện chứ không phải nền trống',
      mood:
        safeString(dnaCoverConcept?.mood) ||
        'drama, bí mật, phản công, căng thẳng cảm xúc',
      secondaryFigures:
        dnaSecondary.length > 0
          ? dnaSecondary
          : ['một nhân vật phụ mờ trong nền, có cảm giác liên quan đến bí mật của truyện'],
      clueProps:
        dnaClueProps.length > 0
          ? dnaClueProps
          : ['một đạo cụ manh mối liên quan trực tiếp đến truyện', 'điện thoại hoặc tài liệu gợi bí mật'],
      conflictVisuals:
        dnaConflictVisuals.length > 0
          ? dnaConflictVisuals
          : ['căng thẳng đối đầu', 'bí mật chuẩn bị bị lật mở'],
      colorTone: 'cinematic, đậm chiều sâu, không tối bệt, rõ focal point',
    },
  }

  const picked = fallbackByBlueprint[blueprint]

  return {
    blueprint,
    heroineLook,
    arena: picked.arena,
    mood: picked.mood,
    secondaryFigures: uniqueStrings(picked.secondaryFigures, 4),
    clueProps: uniqueStrings(picked.clueProps, 5),
    conflictVisuals: uniqueStrings(picked.conflictVisuals, 4),
    colorTone: picked.colorTone,
  }
}

function buildCoverPrompt(story: StoryInput): {
  prompt: string
  coverConcept: CoverConcept
} {
  const storyDna =
    parseMaybeJson<JsonRecord>(story.story_dna) ||
    parseMaybeJson<JsonRecord>(story.storyDna)

  const coverConcept = buildCoverConcept(story, storyDna)
  const title = story.title || 'Untitled Story'
  const summary = pickSummary(story)
  const genreList = uniqueStrings([
    story.genre || '',
    ...(story.genres || []),
    ...(story.tags || []),
  ]).join(', ')

  const corePremise =
    pickStoryField(storyDna, [
      'corePremise',
      'premise',
      'factory_seed',
      'hookVisual',
      'openingScene',
    ]) || summary

  const openingScene =
    pickStoryField(storyDna, ['openingScene', 'sceneHook', 'visualArena']) || coverConcept.arena

  const emotionalStake =
    pickStoryField(storyDna, ['emotionalStake', 'humanCost', 'childStake']) || coverConcept.mood

  const villainAttack =
    pickStoryField(storyDna, ['villainAttack', 'villainAttackType']) || ''
  const heroineCounter =
    pickStoryField(storyDna, ['heroineCounter', 'heroineCounterType']) || ''

  const style =
    story.cover_style ||
    story.visual_style ||
    story.style ||
    'high-end vertical Asian webnovel cover illustration, semi-realistic, dramatic, cinematic'

  const prompt = `
Create a premium vertical web novel cover illustration for the story "${title}".

IMPORTANT GOAL:
This cover must clearly communicate the story conflict and hook at thumbnail size.
Do NOT create a generic pretty portrait.
The image must feel like a story poster, not just a woman standing against an empty background.

Story information:
- Title meaning / vibe: ${title}
- Genre or tags: ${genreList || 'female-drama, revenge, modern emotional drama'}
- Core premise: ${corePremise || 'a woman faces betrayal, pressure, and hidden truth, then fights back'}
- Opening scene / visual hook: ${openingScene}
- Emotional stake: ${emotionalStake}
${villainAttack ? `- Villain attack: ${villainAttack}` : ''}
${heroineCounter ? `- Heroine counter move: ${heroineCounter}` : ''}
${summary ? `- Summary: ${summary}` : ''}

Visual blueprint:
- Main heroine: ${coverConcept.heroineLook}
- Story arena / background: ${coverConcept.arena}
- Mood: ${coverConcept.mood}
- Secondary figures: ${coverConcept.secondaryFigures.join('; ') || 'at least one important secondary figure linked to the conflict'}
- Clue props that should appear clearly: ${coverConcept.clueProps.join('; ') || 'one to two clue props related to the plot'}
- Conflict visuals: ${coverConcept.conflictVisuals.join('; ') || 'clear visible signs of conflict'}

Composition requirements:
- Vertical composition optimized for mobile novel cover.
- Heroine large in the foreground, around waist-up or three-quarter body.
- Midground and background must contain visible story clues and conflict context.
- Strong focal hierarchy: heroine first, conflict clue second, setting third.
- Cinematic lighting, rich depth, dramatic storytelling.
- Cover must still read clearly as a small thumbnail.
- Keep the image visually rich and specific to this story.

Stylistic direction:
- ${style}
- polished, elegant, premium, emotionally intense
- sharp face, expressive eyes, controlled drama
- visually appealing but story-driven
- modern web novel illustration aesthetic

Absolutely avoid:
- generic office portrait
- plain standing woman with empty or blurry background
- random pretty girl holding a paper with no story meaning
- minimal no-story poster
- bland background that does not show the plot arena
- over-dark muddy image
- too many tiny unreadable details
- text, title, logo, watermark, typography

Output:
A visually striking, story-specific cover that instantly tells viewers what kind of conflict this novel contains.
`.trim()

  return { prompt, coverConcept }
}

function sanitizeFileName(input: string): string {
  return safeString(input)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 80)
}

async function generateCoverImage(prompt: string) {
  if (!openai) {
    throw new Error('Missing OPENAI_API_KEY')
  }

  const result = await openai.images.generate({
    model: OPENAI_IMAGE_MODEL,
    prompt,
    size: '1024x1536',
  })

  const first = result.data?.[0]

  if (!first) {
    throw new Error('OpenAI did not return image data')
  }

  const b64 =
    (first as any).b64_json ||
    (first as any).image_base64 ||
    null

  const revisedPrompt =
    (first as any).revised_prompt ||
    (first as any).prompt ||
    null

  if (!b64) {
    throw new Error('OpenAI image response missing base64 data')
  }

  return {
    b64,
    revisedPrompt,
  }
}

async function uploadCoverToSupabase(args: {
  imageBuffer: Buffer
  title: string
  storyId?: string
  explicitPath?: string
}) {
  if (!supabase) {
    return { publicUrl: null as string | null, storagePath: null as string | null }
  }

  const folderStoryId = sanitizeFileName(args.storyId || '') || 'unknown-story'
  const safeTitle = sanitizeFileName(args.title) || 'story-cover'
  const storagePath =
    args.explicitPath ||
    `stories/${folderStoryId}/${safeTitle}-${randomUUID()}.png`

  const { error: uploadError } = await supabase.storage
    .from(SUPABASE_COVER_BUCKET)
    .upload(storagePath, args.imageBuffer, {
      contentType: 'image/png',
      upsert: true,
    })

  if (uploadError) {
    throw uploadError
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(SUPABASE_COVER_BUCKET).getPublicUrl(storagePath)

  return {
    publicUrl,
    storagePath,
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed',
    })
  }

  try {
    const body =
      typeof req.body === 'string'
        ? (JSON.parse(req.body) as JsonRecord)
        : ((req.body || {}) as JsonRecord)

    const story = extractStoryInput(body)

    if (!story.title) {
      return res.status(400).json({
        ok: false,
        error: 'Missing story title',
      })
    }

    const { prompt, coverConcept } = buildCoverPrompt(story)
    const imageResult = await generateCoverImage(prompt)

    const imageBuffer = Buffer.from(imageResult.b64, 'base64')

    const uploadEnabled = body.uploadToSupabase !== false
    let publicUrl: string | null = null
    let storagePath: string | null = null

    if (uploadEnabled) {
      const uploadResult = await uploadCoverToSupabase({
        imageBuffer,
        title: story.title,
        storyId: story.id || story.slug,
        explicitPath: safeString(body.storagePath),
      })

      publicUrl = uploadResult.publicUrl
      storagePath = uploadResult.storagePath
    }

    return res.status(200).json({
      ok: true,
      title: story.title,
      prompt,
      revisedPrompt: imageResult.revisedPrompt,
      coverConcept,
      imageBase64: body.returnBase64 ? imageResult.b64 : undefined,
      publicUrl,
      imageUrl: publicUrl,
      storagePath,
      bucket: uploadEnabled ? SUPABASE_COVER_BUCKET : null,
      message: 'Cover generated successfully',
    })
  } catch (error: any) {
    console.error('[generate-cover] error:', error)

    return res.status(500).json({
      ok: false,
      error: error?.message || 'Failed to generate cover',
    })
  }
}