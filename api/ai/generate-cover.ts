import type { VercelRequest, VercelResponse } from '@vercel/node'

type CoverRequestBody = {
  prompt?: string
  coverPrompt?: string
  title?: string
  storySummary?: string
  genreLabel?: string
  heroineLabel?: string
  styleLabel?: string
  aspectRatio?: string
  size?: string
  modelKey?: string
}

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function truncateText(value: string, maxLength = 500) {
  const text = normalizeText(value)
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

function tryParseJson(text: string) {
  try {
    return text ? JSON.parse(text) : null
  } catch {
    return null
  }
}

function buildCoverSafetyRules() {
  return [
    'Mandatory cover rules:',
    'No text on the image.',
    'No title text, no random letters, no watermark, no logo, no UI overlay.',
    'The main character must clearly look East Asian / Asian, not Western or European.',
    'Avoid Western oil painting style.',
    'Avoid European-looking characters.',
    'Avoid medieval European costumes unless the story is explicitly ancient Chinese historical.',
    'Avoid dark gothic fantasy poster vibe.',
    'Avoid horror movie poster style.',
    'Avoid Hollywood movie-poster composition.',
    'Avoid ugly hands, extra fingers, distorted anatomy, broken eyes, old face, or malformed face.',
    'Avoid cluttered background and ugly typography.',
    'Portrait orientation, cover art suitable for a mobile reading app.',
  ].join(' ')
}

function buildColorDiversityRules() {
  return [
    'Color and scene diversity rules:',
    'Do not default to yellow, golden, champagne, brown-heavy, hotel-lobby, perfume-ad, ring-light, or warm luxury room palettes.',
    'Choose a palette based on the actual story context.',
    'Prefer cold blue + steel gray, navy + white, cyan office light, rainy airport blue, legal-office gray + black, deep red + black, purple neon + dark city, or clean hospital white/green when appropriate.',
    'Use golden/warm luxury lighting only if the story specifically requires a banquet, wedding, hotel, or luxury romance scene.',
    'Background must follow the story context: airport terminal, office boardroom, law office, hospital corridor, school gate, rainy street, apartment, city night, family mansion, wedding hall, or hotel only when the plot requires it.',
  ].join(' ')
}

function buildCompositionRules() {
  return [
    'Cover composition rules:',
    'The cover must not be a generic portrait only.',
    'The image should communicate the central hook at a glance.',
    'Composition should include: 1 main heroine in foreground, 1 or 2 story clue objects, a story-specific background, and optional secondary silhouette for conflict.',
    'The heroine should remain the visual focal point, but plot clues must be visible enough to hint at the story.',
    'Plot clue objects can be in hand, on a desk, near the body, or placed prominently in the scene.',
    'If the story has a strong conflict figure, show that figure as a blurred silhouette, reflection, shadow, or secondary background figure.',
  ].join(' ')
}

function buildAntiGenericRules() {
  return [
    'Anti-generic cover rules:',
    'Avoid covers that show only a beautiful woman with no plot clue.',
    'Avoid a plain office-girl portrait with a random blurred background.',
    'Avoid generic luxury background if the plot hook is legal, family, hospital, airport, livestream, or identity drama.',
    'If the story involves child custody, switched child, adoption file, legal identity, betrayal, livestream scandal, airport escape, inheritance, or corporate takeover, these elements must appear visually through clues, props, or background.',
  ].join(' ')
}

function buildContextSceneHint(contextText: string) {
  const hints: string[] = []

  if (
    contextText.includes('sân bay') ||
    contextText.includes('airport') ||
    contextText.includes('vé máy bay') ||
    contextText.includes('pvg') ||
    contextText.includes('pek') ||
    contextText.includes('chuyến bay')
  ) {
    hints.push(
      'Story-specific visual hint: airport terminal at night, cold blue / steel gray palette, blurred departure board, rain on glass, boarding gate atmosphere, tense modern conspiracy mood.',
    )
  }

  if (
    contextText.includes('di chúc') ||
    contextText.includes('công chứng') ||
    contextText.includes('hồ sơ') ||
    contextText.includes('hợp đồng') ||
    contextText.includes('pháp lý') ||
    contextText.includes('luật sư')
  ) {
    hints.push(
      'Story-specific visual hint: sealed notarized document, red stamp, legal folder, contract, law office or corporate boardroom, neutral gray/navy lighting.',
    )
  }

  if (
    contextText.includes('hội đồng') ||
    contextText.includes('quản trị') ||
    contextText.includes('tập đoàn') ||
    contextText.includes('cổ phần') ||
    contextText.includes('quyền điều hành')
  ) {
    hints.push(
      'Story-specific visual hint: corporate boardroom, glass meeting room, city skyline, documents on table, cold office light, high-stakes business drama.',
    )
  }

  if (
    contextText.includes('bệnh viện') ||
    contextText.includes('xét nghiệm') ||
    contextText.includes('adn') ||
    contextText.includes('hồ sơ bệnh viện')
  ) {
    hints.push(
      'Story-specific visual hint: hospital corridor, clean white/green tint, medical file, DNA report, tense family secret atmosphere.',
    )
  }

  if (
    contextText.includes('trường học') ||
    contextText.includes('phụ huynh') ||
    contextText.includes('con tôi') ||
    contextText.includes('quyền nuôi con')
  ) {
    hints.push(
      'Story-specific visual hint: school gate, child silhouette, custody file, protective mother atmosphere, clean realistic urban palette.',
    )
  }

  if (
    contextText.includes('weibo') ||
    contextText.includes('hot search') ||
    contextText.includes('livestream') ||
    contextText.includes('bóc phốt') ||
    contextText.includes('dư luận')
  ) {
    hints.push(
      'Story-specific visual hint: livestream room, phone screen glow, social media pressure, neon/cyan lighting, modern PR crisis mood.',
    )
  }

  if (
    contextText.includes('ly hôn') ||
    contextText.includes('ngoại tình') ||
    contextText.includes('tiểu tam') ||
    contextText.includes('hủy hôn') ||
    contextText.includes('chồng')
  ) {
    hints.push(
      'Story-specific visual hint: wedding ring, divorce paper, blurred couple in background, betrayal tension, elegant but painful relationship drama.',
    )
  }

  if (
    contextText.includes('giấy khai sinh') ||
    contextText.includes('hộ khẩu') ||
    contextText.includes('nhận nuôi') ||
    contextText.includes('con bị tráo') ||
    contextText.includes('thân thế')
  ) {
    hints.push(
      'Story-specific visual hint: birth certificate, household registration book, adoption file, child silhouette, identity-secret family drama.',
    )
  }

  return hints.join(' ')
}

function extractStoryClues(contextText: string) {
  const clues: string[] = []

  const add = (value: string) => {
    if (!clues.includes(value)) clues.push(value)
  }

  if (contextText.includes('giấy khai sinh')) add('birth certificate')
  if (contextText.includes('hộ khẩu')) add('household registration book')
  if (contextText.includes('nhận nuôi')) add('adoption file')
  if (contextText.includes('con bị tráo')) add('identity-switched child clue')
  if (contextText.includes('adn') || contextText.includes('xét nghiệm')) add('DNA report')
  if (contextText.includes('bệnh viện')) add('hospital file')
  if (contextText.includes('di chúc')) add('will document')
  if (contextText.includes('công chứng')) add('notarized document with red seal')
  if (contextText.includes('hồ sơ')) add('important legal file')
  if (contextText.includes('hợp đồng')) add('contract papers')
  if (contextText.includes('thẻ nhớ')) add('memory card')
  if (contextText.includes('camera')) add('surveillance image clue')
  if (contextText.includes('vé máy bay') || contextText.includes('chuyến bay')) add('boarding pass')
  if (contextText.includes('livestream')) add('livestream screen glow')
  if (contextText.includes('hot search') || contextText.includes('weibo')) add('phone screen showing social-media crisis')
  if (contextText.includes('ly hôn')) add('divorce paper')
  if (contextText.includes('ngoại tình') || contextText.includes('tiểu tam')) add('wedding ring or betrayal clue')
  if (contextText.includes('quyền nuôi con')) add('custody document')
  if (contextText.includes('cổ phần') || contextText.includes('quyền điều hành')) add('shareholding or boardroom document')
  if (contextText.includes('phong thư')) add('suspicious envelope')
  if (contextText.includes('nhẫn')) add('wedding ring')
  if (contextText.includes('đám cưới')) add('wedding invitation or wedding hall detail')

  return clues.slice(0, 4)
}

function buildStoryClueRule(contextText: string) {
  const clues = extractStoryClues(contextText)

  if (!clues.length) {
    return [
      'Story clue rule:',
      'The cover must include at least 1 visual clue object tied to the plot, not just a generic portrait.',
      'Possible clue objects: legal paper, phone screen, envelope, memory card, document folder, red seal, ring, file, or silhouette of a child.',
    ].join(' ')
  }

  return [
    'Story clue rule:',
    'The cover must include 1 or 2 visible story clue objects tied to the plot.',
    `Suggested clue objects for this story: ${clues.join(', ')}.`,
    'Do not hide all clues completely in the background. At least one clue should be readable as an object at a glance.',
  ].join(' ')
}

function buildCharacterAndScenePreset(contextText: string) {
  const isAncient =
    contextText.includes('cổ trang') ||
    contextText.includes('xuyên không') ||
    contextText.includes('trọng sinh cổ') ||
    contextText.includes('vương gia') ||
    contextText.includes('thái tử') ||
    contextText.includes('hoàng cung') ||
    contextText.includes('phi tần') ||
    contextText.includes('quận chúa') ||
    contextText.includes('thừa tướng') ||
    contextText.includes('hầu phủ') ||
    contextText.includes('giang hồ')

  const isFamily =
    contextText.includes('mẹ con') ||
    contextText.includes('gia đình') ||
    contextText.includes('bảo vệ con') ||
    contextText.includes('con tôi') ||
    contextText.includes('quyền nuôi con') ||
    contextText.includes('giấy khai sinh') ||
    contextText.includes('hộ khẩu') ||
    contextText.includes('nhận nuôi') ||
    contextText.includes('con bị tráo') ||
    contextText.includes('thân thế')

  const isRevenge =
    contextText.includes('trả thù') ||
    contextText.includes('lạnh lùng') ||
    contextText.includes('vả mặt') ||
    contextText.includes('hối hận') ||
    contextText.includes('phản công')

  const isOffice =
    contextText.includes('công sở') ||
    contextText.includes('tập đoàn') ||
    contextText.includes('tổng tài') ||
    contextText.includes('luật sư') ||
    contextText.includes('pháp lý') ||
    contextText.includes('hào môn') ||
    contextText.includes('hội đồng') ||
    contextText.includes('quản trị') ||
    contextText.includes('cổ phần') ||
    contextText.includes('quyền điều hành')

  const isMarriageDrama =
    contextText.includes('ngoại tình') ||
    contextText.includes('hôn nhân') ||
    contextText.includes('ly hôn') ||
    contextText.includes('tiểu tam') ||
    contextText.includes('hủy hôn') ||
    contextText.includes('chồng cũ') ||
    contextText.includes('bạn thân ngủ với chồng')

  const isAirportLegal =
    contextText.includes('sân bay') ||
    contextText.includes('vé máy bay') ||
    contextText.includes('di chúc') ||
    contextText.includes('công chứng')

  const isLivestreamDrama =
    contextText.includes('livestream') ||
    contextText.includes('weibo') ||
    contextText.includes('hot search') ||
    contextText.includes('bóc phốt') ||
    contextText.includes('dư luận')

  let characterDirection = ''
  let sceneDirection = ''
  let moodDirection = ''

  if (isAncient) {
    characterDirection =
      'Main character: one beautiful East Asian heroine in elegant ancient Chinese-inspired clothing, graceful posture, expressive eyes, refined Asian facial features, premium historical romance manhua heroine.'

    sceneDirection =
      'Scene: traditional East Asian architecture, elegant courtyard or palace interior, layered silk curtains or lantern atmosphere, and one meaningful plot clue object related to the story.'

    moodDirection =
      'Mood: premium Asian historical romance webnovel cover, elegant, emotional, dramatic, polished, not dark western fantasy.'
  } else if (isAirportLegal) {
    characterDirection =
      'Main character: one beautiful modern East Asian heroine, elegant but realistic styling, tense calm expression, intelligent eyes, strong female lead aura.'

    sceneDirection =
      'Scene: airport terminal, law office, or corporate boardroom. Include a strong legal/travel clue such as a sealed document, notarized paper, boarding pass, file folder, red stamp, or suspicious envelope. Avoid hotel lobby, perfume bottle, ring light, and generic luxury room.'

    moodDirection =
      'Mood: modern Chinese urban conspiracy drama, cold tense cinematic atmosphere, legal pressure, corporate conflict, polished mobile webnovel cover.'
  } else if (isFamily) {
    characterDirection =
      'Main character: one beautiful modern East Asian woman, emotionally strong, protective mother energy, expressive eyes, clean realistic styling, soft but determined female lead aura.'

    sceneDirection =
      'Scene: school gate, hospital corridor, civil registry office, apartment, or legal office depending on the story. Include strong family-identity clues such as birth certificate, household registration book, adoption file, DNA report, child silhouette, or custody document.'

    moodDirection =
      'Mood: emotional, protective, tense, identity-secret family drama, polished and highly readable as a women-oriented webnovel cover.'
  } else if (isLivestreamDrama) {
    characterDirection =
      'Main character: one beautiful modern East Asian heroine, stylish urban appearance, expressive but controlled emotion, strong public-pressure drama aura.'

    sceneDirection =
      'Scene: livestream room, studio setup, PR office, or city-night background. Include plot clues such as phone screen glow, social-media pressure, scrolling comment feel, blurred crowd attention, or scandal-related evidence.'

    moodDirection =
      'Mood: modern social-media scandal drama, neon/cyan highlights, public pressure, high-click webnovel cover.'
  } else if (isOffice) {
    characterDirection =
      'Main character: one beautiful modern East Asian heroine, polished office or elegant urban styling, confident gaze, intelligent aura, powerful female lead.'

    sceneDirection =
      'Scene: modern office boardroom, glass meeting room, law office, or corporate hallway. Include documents, contract papers, red-seal file, or boardroom clue objects. Do not default to hotel lobby or generic portrait-only composition.'

    moodDirection =
      'Mood: upscale modern Asian drama, corporate pressure, polished, confident, premium mobile-reading-app cover.'
  } else if (isMarriageDrama) {
    characterDirection =
      'Main character: one beautiful modern East Asian heroine, elegant styling, expressive eyes, emotionally hurt but strong, memorable webnovel female lead.'

    sceneDirection =
      'Scene: apartment, courthouse hallway, wedding venue, rainy balcony, or hotel corridor only if the plot requires it. Include betrayal clues such as wedding ring, divorce paper, blurred couple silhouette, or emotional confrontation background.'

    moodDirection =
      'Mood: romantic betrayal drama, emotional intensity, elegant but painful atmosphere, polished Asian webnovel cover aesthetic.'
  } else if (isRevenge) {
    characterDirection =
      'Main character: one beautiful modern East Asian heroine, sharp gaze, calm expression, elegant styling, controlled anger, strong revenge-female-lead aura.'

    sceneDirection =
      'Scene: modern urban drama setting with one clear revenge clue object and a conflict silhouette in the background. The clue object must relate to the plot, such as a legal file, envelope, memory card, or incriminating paper.'

    moodDirection =
      'Mood: dramatic, revenge-driven, elegant, polished, highly clickable cover for a trending Asian webnovel.'
  } else {
    characterDirection =
      'Main character: one beautiful modern East Asian heroine, expressive eyes, elegant styling, clear Asian facial features, attractive and memorable webnovel protagonist.'

    sceneDirection =
      'Scene: modern Asian drama atmosphere chosen from the story context, including at least one visible plot clue object and a matching setting. Avoid default generic portrait-only cover.'

    moodDirection =
      'Mood: cinematic, emotionally engaging, polished, clean, attractive for Asian webnovel readers.'
  }

  return {
    characterDirection,
    sceneDirection,
    moodDirection,
  }
}

function buildPromptFromStructuredData(body: CoverRequestBody) {
  const title = normalizeText(body.title)
  const storySummary = normalizeText(body.storySummary)
  const genreLabel = normalizeText(body.genreLabel)
  const heroineLabel = normalizeText(body.heroineLabel)
  const styleLabel =
    normalizeText(body.styleLabel) ||
    'semi-realistic asian webnovel cover illustration, polished manhua style, no text'

  const contextText = `${title} ${storySummary} ${genreLabel} ${heroineLabel}`.toLowerCase()
  const safetyRules = buildCoverSafetyRules()
  const colorRules = buildColorDiversityRules()
  const compositionRules = buildCompositionRules()
  const antiGenericRules = buildAntiGenericRules()
  const storySpecificHint = buildContextSceneHint(contextText)
  const storyClueRule = buildStoryClueRule(contextText)
  const { characterDirection, sceneDirection, moodDirection } =
    buildCharacterAndScenePreset(contextText)

  return [
    `Create a high-quality vertical cover illustration in ${styleLabel} style.`,
    `Story title for internal context only: "${title}". Do not write the title on the image.`,
    storySummary ? `Story summary for visual context: ${storySummary}.` : '',
    genreLabel ? `Genre: ${genreLabel}.` : '',
    heroineLabel ? `Female lead archetype: ${heroineLabel}.` : '',

    characterDirection,
    sceneDirection,
    moodDirection,

    storySpecificHint,
    storyClueRule,
    compositionRules,
    antiGenericRules,
    colorRules,

    'Art style: polished semi-realistic Asian webnovel cover, modern manhua / Korean romance illustration influence, beautiful commercial mobile-reading-app cover.',
    'Composition: one main beautiful East Asian heroine as the clear focal point, upper-body or full-body portrait, elegant pose, expressive eyes, clean silhouette.',
    'Background: must be story-specific and not random. It should support the plot clue and genre clearly.',
    'Plot clue visibility: at least one key clue object must be clearly noticeable at a glance.',
    'Secondary conflict presence: if suitable, add one blurred male figure, family silhouette, child silhouette, rival woman silhouette, or boardroom silhouette in the background to suggest tension.',
    'Face quality: beautiful East Asian female face, symmetrical features, delicate makeup, clear eyes, attractive novel-cover look.',
    'Image quality: high detail, sharp face, polished hair, elegant clothing, clean hands, professional digital illustration.',
    'The image must look like a popular Chinese/Korean/Vietnamese online novel cover.',
    safetyRules,
  ]
    .filter(Boolean)
    .join(' ')
}

function buildCoverPromptFromBody(body: CoverRequestBody) {
  const directPrompt = normalizeText(body.prompt) || normalizeText(body.coverPrompt)
  const title = normalizeText(body.title)
  const storySummary = normalizeText(body.storySummary)
  const genreLabel = normalizeText(body.genreLabel)
  const heroineLabel = normalizeText(body.heroineLabel)

  const contextText =
    `${title} ${storySummary} ${genreLabel} ${heroineLabel} ${directPrompt}`.toLowerCase()

  const safetyRules = buildCoverSafetyRules()
  const colorRules = buildColorDiversityRules()
  const compositionRules = buildCompositionRules()
  const antiGenericRules = buildAntiGenericRules()
  const storySpecificHint = buildContextSceneHint(contextText)
  const storyClueRule = buildStoryClueRule(contextText)

  if (directPrompt) {
    return [
      directPrompt,
      storySpecificHint,
      storyClueRule,
      compositionRules,
      antiGenericRules,
      colorRules,
      safetyRules,
    ]
      .filter(Boolean)
      .join(' ')
  }

  if (!title) {
    return ''
  }

  return buildPromptFromStructuredData(body)
}

function resolveImageSize(body: CoverRequestBody) {
  const explicitSize = normalizeText(body.size)
  if (explicitSize) return explicitSize

  const aspectRatio = normalizeText(body.aspectRatio)

  switch (aspectRatio) {
    case '1:1':
      return '1024x1024'
    case '3:2':
    case '4:3':
    case '16:9':
      return '1536x1024'
    case '2:3':
    case '3:4':
    case '9:16':
    default:
      return '1024x1536'
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      detail: 'Use POST for /api/ai/generate-cover.',
    })
  }

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY' })
  }

  try {
    const body = (req.body ?? {}) as CoverRequestBody

    const prompt = buildCoverPromptFromBody(body)
    const size = resolveImageSize(body)

    if (!prompt) {
      return res.status(400).json({
        error: 'Missing cover prompt',
        detail:
          'Need one of: prompt / coverPrompt, or at least title so server can build cover prompt.',
      })
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
        prompt,
        size,
      }),
    })

    const rawText = await response.text()
    const data = tryParseJson(rawText)

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'OpenAI image generation failed',
        detail:
          data || {
            nonJsonResponse: true,
            status: response.status,
            statusText: response.statusText,
            preview: truncateText(rawText, 800),
          },
        promptUsed: prompt,
        size,
      })
    }

    if (!data) {
      return res.status(502).json({
        error: 'OpenAI image API returned non-JSON response',
        detail: {
          status: response.status,
          statusText: response.statusText,
          preview: truncateText(rawText, 800),
        },
        promptUsed: prompt,
        size,
      })
    }

    const b64Json = data?.data?.[0]?.b64_json

    if (!b64Json || typeof b64Json !== 'string') {
      return res.status(500).json({
        error: 'No image returned from OpenAI',
        detail: data,
        promptUsed: prompt,
        size,
      })
    }

    return res.status(200).json({
      b64_json: b64Json,
      dataUrl: `data:image/png;base64,${b64Json}`,
      mimeType: 'image/png',
      promptUsed: prompt,
      size,
    })
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Unknown image generation error',
    })
  }
}