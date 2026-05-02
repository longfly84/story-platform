import {
  resolveCharacterVibe,
  resolveColorTheme,
  resolveCoverStyle,
  type CoverPreset,
} from './coverPromptMappings'

export type BuildCoverPromptInput = {
  title?: string
  summary?: string
  genre?: string
  mainCharacterStyle?: string
  moduleName?: string
  coverStyle?: string
  colorTheme?: string
  characterVibe?: string
  includeTitleText?: boolean
  authorName?: string
  language?: 'vi' | 'en'
}

export type BuildCoverPromptResult = {
  fullPrompt: string
  shortPrompt: string
  resolved: {
    coverStyle: CoverPreset
    colorTheme: CoverPreset
    characterVibe: CoverPreset
  }
}

function cleanText(value?: string) {
  return (value ?? '')
    .replace(/#+\s?/g, '')
    .replace(/\*\*/g, '')
    .replace(/\r/g, '')
    .trim()
}

function oneLine(value?: string, max = 260) {
  const text = cleanText(value).replace(/\n+/g, ' ')
  if (!text) return ''
  if (text.length <= max) return text
  return `${text.slice(0, max).trim()}...`
}

function buildSettingFromModule(moduleName?: string) {
  const normalized = (moduleName ?? '').toLowerCase()

  if (
    normalized.includes('nữ tần đô thị viral trung quốc') ||
    normalized.includes('nu tan do thi viral trung quoc') ||
    normalized.includes('female urban viral')
  ) {
    return 'modern Chinese urban setting, wealthy families, elite corporate circles, glamorous banquet halls, luxury hotels, high society pressure, viral internet culture such as Weibo/Douyin style public scandal'
  }

  return 'modern dramatic setting appropriate for a premium female-oriented web novel cover'
}

function buildMainCharacterDirection(mainCharacterStyle?: string) {
  const value = (mainCharacterStyle ?? '').trim()
  if (!value) {
    return 'a beautiful female protagonist with strong emotional presence and striking visual appeal'
  }

  const lower = value.toLowerCase()

  if (lower.includes('nhẫn nhịn')) {
    return 'a beautiful female protagonist who looks restrained, patient, wronged, but clearly ready to retaliate'
  }

  if (lower.includes('nữ cường')) {
    return 'a beautiful and powerful female protagonist with confident posture, high-status aura, and commanding presence'
  }

  if (lower.includes('cô dâu')) {
    return 'a beautiful bride as the main focus, elegant yet emotionally wounded, visually dramatic and memorable'
  }

  return `a beautiful female protagonist with the character direction: ${value}`
}

function buildComposition(summary?: string, genre?: string) {
  const text = `${summary ?? ''} ${genre ?? ''}`.toLowerCase()

  if (
    text.includes('hủy hôn') ||
    text.includes('phan boi') ||
    text.includes('phản bội') ||
    text.includes('wedding') ||
    text.includes('cô dâu')
  ) {
    return 'foreground focus on the heroine, wearing a luxurious gown or wedding dress, while the betraying couple or hostile family figures appear blurred or secondary in the background; cinematic depth and emotional tension'
  }

  if (
    text.includes('công sở') ||
    text.includes('tập đoàn') ||
    text.includes('thuong chien') ||
    text.includes('thương chiến')
  ) {
    return 'foreground focus on the heroine in an elegant high-fashion look, with corporate towers, banquet lighting, luxury interiors, or elite office signals in the background'
  }

  return 'strong central composition with the heroine as the dominant focal point, layered background elements, dramatic storytelling, and premium web-novel cover balance'
}

export function buildCoverPrompt(input: BuildCoverPromptInput): BuildCoverPromptResult {
  const title = cleanText(input.title) || 'Untitled Story'
  const summary = oneLine(input.summary, 320)
  const genre = cleanText(input.genre) || 'female-oriented urban drama'
  const moduleName = cleanText(input.moduleName)
  const mainCharacterDirection = buildMainCharacterDirection(input.mainCharacterStyle)
  const settingDirection = buildSettingFromModule(moduleName)
  const compositionDirection = buildComposition(input.summary, input.genre)

  const coverStyle = resolveCoverStyle(input.coverStyle)
  const colorTheme = resolveColorTheme(input.colorTheme)
  const characterVibe = resolveCharacterVibe(input.characterVibe)

  const includeTitleText = input.includeTitleText ?? false
  const authorName = cleanText(input.authorName)
  const language = input.language ?? 'vi'

  const textInstruction = includeTitleText
    ? language === 'vi'
      ? `Include clean, readable Vietnamese title text on the cover: "${title}".${authorName ? ` Also include author name: "${authorName}".` : ''}`
      : `Include readable title text on the cover: "${title}".${authorName ? ` Also include author name: "${authorName}".` : ''}`
    : 'Do not add any text, logo, watermark, or branding on the cover.'

  const fullPrompt = [
    'Create a premium vertical web-novel cover illustration.',
    'Format: 2:3 ratio, polished digital illustration, highly detailed, visually striking, commercial-quality cover art.',
    '',
    `Story title: "${title}".`,
    `Genre: ${genre}.`,
    summary ? `Story summary: ${summary}.` : '',
    moduleName ? `Story engine/module style: ${moduleName}.` : '',
    '',
    `Visual style direction: ${coverStyle.prompt}.`,
    `Color direction: ${colorTheme.prompt}.`,
    `Character vibe direction: ${characterVibe.prompt}.`,
    '',
    `Main subject: ${mainCharacterDirection}.`,
    `Setting: ${settingDirection}.`,
    `Composition: ${compositionDirection}.`,
    '',
    'The image should feel dramatic, emotionally intense, premium, and highly clickable for a female-oriented urban revenge novel audience.',
    'Focus on strong facial expression, elegant fashion styling, luxury atmosphere, and story tension.',
    'Make the heroine look unforgettable and central to the story.',
    '',
    textInstruction,
  ]
    .filter(Boolean)
    .join('\n')

  const shortPrompt = [
    `Vertical premium web-novel cover for "${title}".`,
    `Genre: ${genre}.`,
    coverStyle.prompt,
    colorTheme.prompt,
    characterVibe.prompt,
    `Main subject: ${mainCharacterDirection}.`,
    `Setting: ${settingDirection}.`,
    textInstruction,
  ].join(' ')

  return {
    fullPrompt,
    shortPrompt,
    resolved: {
      coverStyle,
      colorTheme,
      characterVibe,
    },
  }
}