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

function buildCoverPromptFromBody(body: CoverRequestBody) {
  const directPrompt = normalizeText(body.prompt) || normalizeText(body.coverPrompt)

  if (directPrompt) {
    return directPrompt
  }

  const title = normalizeText(body.title)
  const storySummary = normalizeText(body.storySummary)
  const genreLabel = normalizeText(body.genreLabel)
  const heroineLabel = normalizeText(body.heroineLabel)
  const styleLabel =
    normalizeText(body.styleLabel) || 'east asian romance webnovel vertical cover'

  if (!title) {
    return ''
  }

  const contextText = `${title} ${storySummary} ${genreLabel} ${heroineLabel}`.toLowerCase()

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
    contextText.includes('con tôi')

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
    contextText.includes('hào môn')

  const isMarriageDrama =
    contextText.includes('ngoại tình') ||
    contextText.includes('hôn nhân') ||
    contextText.includes('ly hôn') ||
    contextText.includes('tiểu tam') ||
    contextText.includes('hủy hôn') ||
    contextText.includes('chồng cũ')

  let characterDirection = ''
  let sceneDirection = ''
  let moodDirection = ''

  if (isAncient) {
    characterDirection = isRevenge
      ? 'Main character: a beautiful East Asian heroine in elegant ancient Chinese-inspired clothing, calm but sharp gaze, poised, intelligent, graceful, and quietly dangerous.'
      : 'Main character: a beautiful East Asian heroine in elegant ancient Chinese-inspired clothing, refined Asian facial features, expressive eyes, graceful posture, and strong female lead aura.'

    sceneDirection =
      'Background: elegant East Asian palace, manor, courtyard, garden pavilion, lanterns, silk details, traditional architecture, refined historical romance atmosphere.'

    moodDirection =
      'Mood: emotional, dramatic, refined, visually beautiful, premium Asian historical webnovel cover.'
  } else {
    if (isFamily) {
      characterDirection =
        'Main character: a beautiful modern East Asian woman, emotionally strong, protective, elegant but realistic, expressive eyes, polished Asian webnovel protagonist aura.'
      sceneDirection =
        'Background: emotionally tense family setting, elegant home interior, soft cinematic depth, subtle modern Asian drama atmosphere.'
      moodDirection =
        'Mood: emotional, protective, dramatic, warm but tense, attractive for women-oriented webnovel readers.'
    } else if (isOffice) {
      characterDirection =
        'Main character: a beautiful modern East Asian heroine with a smart and polished appearance, confident gaze, elegant office or luxury fashion styling, intelligent and powerful aura.'
      sceneDirection =
        'Background: luxury office, upscale penthouse, hotel, city lights, mansion interior, or high-society modern Asian drama setting.'
      moodDirection =
        'Mood: polished, dramatic, emotionally intense, upscale, commercially attractive, premium Asian webnovel cover.'
    } else if (isMarriageDrama) {
      characterDirection =
        'Main character: a beautiful modern East Asian heroine, elegant styling, expressive eyes, emotionally hurt but strong, clearly the focal point of the cover.'
      sceneDirection =
        'Background: luxury apartment, villa, hotel corridor, bedroom doorway, balcony at night, or emotionally charged domestic setting with romantic-drama tension.'
      moodDirection =
        'Mood: romantic drama, betrayal tension, emotional intensity, polished lighting, attractive Asian webnovel cover aesthetic.'
    } else if (isRevenge) {
      characterDirection =
        'Main character: a beautiful modern East Asian heroine, sharp gaze, calm expression, elegant styling, controlled anger, strong revenge-female-lead aura.'
      sceneDirection =
        'Background: cinematic modern Asian drama atmosphere, luxury interior, city lights, elegant mansion or emotionally tense setting, visually rich but not cluttered.'
      moodDirection =
        'Mood: dramatic, revenge-driven, emotionally intense, elegant, highly clickable cover for a trending Asian webnovel.'
    } else {
      characterDirection =
        'Main character: a beautiful modern East Asian heroine, expressive eyes, elegant styling, clearly Asian facial features, attractive and memorable webnovel protagonist aura.'
      sceneDirection =
        'Background: modern Asian drama atmosphere, luxury apartment, city lights, elegant interior, balcony, hotel, or emotionally rich domestic setting.'
      moodDirection =
        'Mood: cinematic, dramatic, emotionally engaging, polished, attractive for Asian webnovel readers.'
    }
  }

  return [
    `Create a high-quality vertical Asian webnovel cover illustration in ${styleLabel} style.`,
    `Story title: "${title}".`,
    storySummary ? `Story summary: ${storySummary}.` : '',
    genreLabel ? `Genre: ${genreLabel}.` : '',
    heroineLabel ? `Female lead archetype: ${heroineLabel}.` : '',

    characterDirection,
    sceneDirection,
    moodDirection,

    'The image must look like a popular Chinese/Korean/Vietnamese online novel cover.',
    'The main character must clearly look East Asian / Asian, not Western or European.',
    'Use a beautiful Asian female lead as the dominant focal point.',
    'Supporting characters are optional, but should remain secondary and also look East Asian.',
    'Use polished lighting, emotional drama, elegant composition, and commercially attractive mobile reading-platform aesthetics.',
    'Prefer soft cinematic colors, romantic-drama mood, and a strong visual hook.',
    'Avoid Western oil painting style.',
    'Avoid European-looking characters.',
    'Avoid medieval European costumes.',
    'Avoid dark gothic fantasy poster vibe.',
    'Avoid horror movie poster style.',
    'Avoid a Hollywood movie-poster composition.',
    'No watermark, no logo, no UI overlay.',
    'Do not place random readable text.',
    'If text is included, only include the main story title, styled elegantly.',
    'Portrait orientation, cover art suitable for a mobile reading app.',
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
    return res.status(405).json({ error: 'Method not allowed' })
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
        model: 'gpt-image-1',
        prompt,
        size,
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'OpenAI image generation failed',
        detail: data,
      })
    }

    const b64Json = data?.data?.[0]?.b64_json

    if (!b64Json || typeof b64Json !== 'string') {
      return res.status(500).json({
        error: 'No image returned from OpenAI',
        detail: data,
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