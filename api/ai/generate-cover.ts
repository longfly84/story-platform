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
    'Avoid old face, distorted face, bad hands, extra fingers, messy anatomy.',
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
    'Background must follow the story context: airport terminal, office boardroom, law office, hospital corridor, school gate, rainy street, apartment, city night, family mansion, or hotel only when the plot requires it.',
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
      'Story-specific visual hint: airport terminal at night, cold blue / steel gray palette, blurred departure board, rain on glass, tense modern conspiracy mood.',
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
      'Story-specific visual hint: sealed notarized document, red stamp, legal folder, law office or corporate boardroom, neutral gray/navy lighting.',
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
      'Story-specific visual hint: hospital corridor, clean white/green tint, medical file, tense family secret atmosphere.',
    )
  }

  if (
    contextText.includes('trường học') ||
    contextText.includes('phụ huynh') ||
    contextText.includes('con tôi') ||
    contextText.includes('quyền nuôi con')
  ) {
    hints.push(
      'Story-specific visual hint: school gate, child custody document, protective mother atmosphere, clean realistic urban palette.',
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

  return hints.join(' ')
}

function buildCoverPromptFromBody(body: CoverRequestBody) {
  const directPrompt = normalizeText(body.prompt) || normalizeText(body.coverPrompt)

  const title = normalizeText(body.title)
  const storySummary = normalizeText(body.storySummary)
  const genreLabel = normalizeText(body.genreLabel)
  const heroineLabel = normalizeText(body.heroineLabel)
  const styleLabel =
    normalizeText(body.styleLabel) ||
    'semi-realistic asian romance manhua webnovel cover, no text'

  const contextText = `${title} ${storySummary} ${genreLabel} ${heroineLabel} ${directPrompt}`.toLowerCase()
  const storySpecificHint = buildContextSceneHint(contextText)
  const safetyRules = buildCoverSafetyRules()
  const colorRules = buildColorDiversityRules()

  if (directPrompt) {
    return [
      directPrompt,
      storySpecificHint,
      colorRules,
      safetyRules,
    ]
      .filter(Boolean)
      .join(' ')
  }

  if (!title) {
    return ''
  }

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
    contextText.includes('quyền nuôi con')

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
    contextText.includes('chồng cũ')

  const isAirportLegal =
    contextText.includes('sân bay') ||
    contextText.includes('vé máy bay') ||
    contextText.includes('di chúc') ||
    contextText.includes('công chứng')

  let characterDirection = ''
  let sceneDirection = ''
  let moodDirection = ''

  if (isAncient) {
    characterDirection = isRevenge
      ? 'Main character: one beautiful East Asian heroine in elegant ancient Chinese-inspired clothing, calm sharp gaze, graceful pose, intelligent aura, refined Asian facial features, premium manhua heroine.'
      : 'Main character: one beautiful East Asian heroine in elegant ancient Chinese-inspired clothing, expressive eyes, graceful posture, refined Asian facial features, premium historical romance manhua heroine.'

    sceneDirection =
      'Background: elegant East Asian palace, manor, courtyard, silk curtains, lantern light, refined traditional architecture, soft depth of field, not cluttered.'

    moodDirection =
      'Mood: premium Asian historical romance webnovel cover, elegant, emotional, beautiful, polished, not dark western fantasy.'
  } else if (isAirportLegal) {
    characterDirection =
      'Main character: one beautiful modern East Asian heroine, elegant but realistic styling, tense calm expression, intelligent eyes, strong female lead aura.'

    sceneDirection =
      'Background: airport terminal, corporate boardroom, law office, or city night glass wall based on the story. Include a sealed document, notarized paper, file folder, red stamp, or travel clue if suitable. Use cold blue, steel gray, navy, or clean legal-office palette. Avoid hotel lobby, perfume bottle, ring light, and golden luxury room.'

    moodDirection =
      'Mood: modern Chinese urban conspiracy drama, cold tense cinematic atmosphere, corporate/legal pressure, polished mobile webnovel cover.'
  } else if (isFamily) {
    characterDirection =
      'Main character: one beautiful modern East Asian woman, elegant but realistic, emotionally strong, protective mother energy, expressive eyes, soft polished Asian webnovel heroine.'

    sceneDirection =
      'Background: modern Asian apartment, school gate, hospital corridor, family home, or legal office depending on the story. Keep it clean, emotional, and realistic. Avoid default golden luxury hotel lighting.'

    moodDirection =
      'Mood: emotional, protective, tense, polished, attractive for women-oriented Asian webnovel readers. Lighting may be neutral, cool, or soft depending on the scene.'
  } else if (isOffice) {
    characterDirection =
      'Main character: one beautiful modern East Asian heroine, polished office or elegant urban styling, confident gaze, intelligent aura, powerful female lead.'

    sceneDirection =
      'Background: modern office boardroom, glass meeting room, law office, city skyline, airport business lounge, or corporate hallway, soft bokeh, clean commercial composition. Do not default to hotel lobby or golden luxury lighting.'

    moodDirection =
      'Mood: upscale modern Asian drama, corporate pressure, polished, confident, premium mobile-reading-app cover.'
  } else if (isMarriageDrama) {
    characterDirection =
      'Main character: one beautiful modern East Asian heroine, elegant styling, expressive eyes, emotionally hurt but strong, graceful and memorable webnovel female lead.'

    sceneDirection =
      'Background: apartment, villa, courthouse hallway, hospital corridor, rainy balcony, family dining room, or hotel corridor only if the plot requires it, with soft cinematic bokeh. Avoid default warm hotel lighting.'

    moodDirection =
      'Mood: romantic drama, betrayal tension, emotional intensity, polished Asian webnovel cover aesthetic. Do not force yellow/champagne palette.'
  } else if (isRevenge) {
    characterDirection =
      'Main character: one beautiful modern East Asian heroine, sharp gaze, calm expression, elegant styling, controlled anger, strong revenge-female-lead aura.'

    sceneDirection =
      'Background: modern Asian drama setting, office boardroom, airport terminal, law office, city lights, rainy street, or mansion only if the plot requires it, soft depth of field, visually rich but clean. Avoid default golden luxury interior.'

    moodDirection =
      'Mood: dramatic, revenge-driven, elegant, polished, highly clickable cover for a trending Asian webnovel.'
  } else {
    characterDirection =
      'Main character: one beautiful modern East Asian heroine, expressive eyes, elegant styling, clear Asian facial features, attractive and memorable romance webnovel protagonist.'

    sceneDirection =
      'Background: modern Asian drama atmosphere chosen from the story context: airport, office, law office, hospital, school, rainy city, apartment, balcony, family mansion, or hotel only if the plot requires it, soft bokeh. Avoid default golden hotel/luxury room.'

    moodDirection =
      'Mood: cinematic, romantic-drama, emotionally engaging, polished, clean, attractive for Asian webnovel readers.'
  }

  return [
    `Create a high-quality vertical cover illustration in ${styleLabel} style.`,
    `Story title for internal context only: "${title}". Do not write the title on the image.`,
    storySummary ? `Story summary for visual context: ${storySummary}.` : '',
    genreLabel ? `Genre: ${genreLabel}.` : '',
    heroineLabel ? `Female lead archetype: ${heroineLabel}.` : '',

    storySpecificHint,
    characterDirection,
    sceneDirection,
    moodDirection,

    'Art style: polished semi-realistic Asian webnovel cover, modern manhua / Korean romance illustration influence, beautiful commercial mobile-reading-app cover.',
    'Composition: one large beautiful East Asian heroine as the clear focal point, upper-body or full-body portrait, elegant pose, expressive eyes, clean silhouette.',
    'Background: soft cinematic depth of field based on the story context, not always luxury interior. Use airport terminal, office boardroom, law office, hospital corridor, school gate, rainy street, apartment, city night, or family mansion only when it matches the story. Avoid default hotel lobby, perfume-ad room, ring light, and warm luxury interior.',
    'Lighting: cinematic lighting selected by story mood, not always warm; allow cold blue, steel gray, rainy neon, office fluorescent, airport night light, legal-office neutral light, or dramatic red/cyan contrast. Avoid default golden/yellow/champagne lighting unless the story specifically needs a luxury banquet or hotel mood.',
    'Color palette: choose a distinct palette for this story. Prefer cold blue + steel gray, navy + white, cyan office light, rainy airport blue, legal-office gray + black, deep red + black, purple neon + dark city, or clean hospital white/green when appropriate. Do not default to yellow/golden/champagne/brown-heavy palettes.',
    'Face quality: beautiful East Asian female face, symmetrical features, delicate makeup, clear eyes, attractive novel-cover look.',
    'Image quality: high detail, sharp face, polished hair, elegant clothing, clean hands, professional digital illustration.',
    'The image must look like a popular Chinese/Korean/Vietnamese online novel cover.',
    safetyRules,
  ]
    .filter(Boolean)
    .join(' ')
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
        detail: data || {
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