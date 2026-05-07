import type { GeneratePayload } from './generate-lib/types.js'
import { getLengthRule, getStoryEditorPassEnabled, getTextModel } from './generate-lib/model.js'
import { callOpenAIText } from './generate-lib/openaiClient.js'
import { normalizePayload } from './generate-lib/payload.js'
import { buildPrompt, buildStoryEditorPrompt } from './generate-lib/promptBuilders.js'
import { moderateTextOrThrow } from './generate-lib/moderation.js'


function replaceKnownBadVietnamesePhrases(input: string) {
  const replacements: Array<[RegExp, string]> = [
    [/đúng lúc chương cần cô nhất/gi, 'đúng lúc chương trình cần cô nhất'],
    [/mọi thứ đã có sẵn bằng tay/gi, 'mọi bằng chứng đã nằm sẵn trong tay'],
    [/như một cây kim chỉ huy/gi, 'khiến mọi ánh mắt lập tức đổ dồn về phía cô'],
    [/mồi câu bắt buộc phải hé lộ/gi, 'một câu hỏi buộc họ phải để lộ người đứng sau'],
    [/tấm thẻ mà giờ đây gọi là [“"]bằng chứng[”"]/gi, 'tấm thẻ nhỏ bé đang bị biến thành “bằng chứng”'],
    [/mở ra một lối tháo/gi, 'mở ra một lối thoát'],
    [/góc bàn này bị đặt vào tay sai người/gi, 'tôi bị đặt vào sai vị trí trong một ván cờ đã sắp sẵn'],
    [/giọng anh ta tròng đầy thách thức/gi, 'giọng anh ta đầy vẻ thách thức'],
    [/Lời của ([^\n.]+?) đặt một đạo đứt vào giữa sự việc/gi, 'Lời của $1 khiến sự việc lập tức nghiêm trọng hơn'],
    [/nó kéo một hơi dài/gi, 'đủ tạo ra một khoảng chững'],
    [/Anh ta nói như trao đổi quyền lợi trước công chúng/gi, 'Anh ta nói như thể đó là một đề nghị rất công bằng'],
    [/nhưng là người chọn cứu mình, tôi không để xúc động dẫn đường/gi, 'nhưng nếu muốn tự cứu mình, tôi không được để cảm xúc dẫn đường'],
    [/Quyền lực đã tạm chuyển hướng khỏi tôi sang nhóm muốn khóa miệng tôi/gi, 'Thế trận tạm thời nghiêng về phía những người muốn buộc tôi im lặng'],
  ]

  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), input)
}


function stripLeakedStoryTitleBeforeChapter(input: string) {
  let body = input.replace(/\r\n/g, '\n')
  const chapterHeading = body.match(/^#\s*Chương\s+\d+\s*[—-].*$/im)

  if (!chapterHeading || typeof chapterHeading.index !== 'number') {
    return body
  }

  const before = body.slice(0, chapterHeading.index)
  const after = body.slice(chapterHeading.index)
  const meaningfulBefore = before
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line !== '---')

  // Nếu trước # Chương chỉ là tên truyện / separator / markdown rỗng thì bỏ hết.
  if (
    meaningfulBefore.length <= 3 &&
    meaningfulBefore.every((line) => /^#\s+[^#]/.test(line) || !/^#{1,6}\s*/.test(line))
  ) {
    return after
  }

  return body
}

function normalizeChapterSeparators(input: string) {
  return input
    .replace(/^\s*(?:---\s*)+/g, '')
    .replace(/(?:\n\s*---\s*)+(?=\n\s*#\s*Chương\s+\d+)/gi, '\n')
    .replace(/\n\s*---\s*\n\s*---\s*\n/g, '\n\n')
    .replace(/(?:\n\s*---\s*)+$/g, '')
}

function cleanupReaderSection(reader: string, chapterNumber: number) {
  let cleaned = replaceKnownBadVietnamesePhrases(reader)
    .replace(/\uFEFF/g, '')
    .replace(/[\u200B-\u200D\u2060]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')

  const readerHeaderMatch = cleaned.match(/^#\s*BẢN ĐỌC CHO ĐỘC GIẢ\s*$/im)
  let readerHeader = ''
  let body = cleaned

  if (readerHeaderMatch && typeof readerHeaderMatch.index === 'number') {
    readerHeader = cleaned.slice(0, readerHeaderMatch.index + readerHeaderMatch[0].length).trim()
    body = cleaned.slice(readerHeaderMatch.index + readerHeaderMatch[0].length)
  }

  body = body
    .replace(/^\s*(?:---\s*)+/g, '\n')
    .replace(/\n\s*(?:---\s*)+\n(?=\s*#\s*Chương\s+\d+)/gi, '\n\n')

  const chapterHeadingPattern = /^#\s*Chương\s+\d+\s*[—-].*$/gim
  const headings = [...body.matchAll(chapterHeadingPattern)]

  if (headings.length > 0) {
    const firstHeading = headings[0]
    const firstIndex = firstHeading.index ?? 0

    if (firstIndex > 0) {
      const beforeHeadingLines = body.slice(0, firstIndex).split('\n')
      const usefulBeforeHeading = beforeHeadingLines
        .map((line) => line.trim())
        .filter((line) => line && line !== '---')

      // Bỏ tên truyện / separator bị lọt trước tiêu đề chương.
      if (usefulBeforeHeading.length <= 2) {
        body = body.slice(firstIndex)
      }
    }

    let seenChapterHeading = false
    body = body
      .split('\n')
      .filter((line) => {
        if (!/^#\s*Chương\s+\d+\s*[—-].*$/i.test(line.trim())) {
          return true
        }

        if (!seenChapterHeading) {
          seenChapterHeading = true
          return true
        }

        return false
      })
      .join('\n')
  }

  body = body
    .replace(/^\s*(?:---\s*)+/g, '')
    .replace(/(?:\n\s*---\s*)+$/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (!/^#\s*Chương\s+\d+\s*[—-]/im.test(body)) {
    body = `# Chương ${chapterNumber} — Chưa đặt tên\n\n${body}`.trim()
  }

  return [readerHeader || '# BẢN ĐỌC CHO ĐỘC GIẢ', body].filter(Boolean).join('\n\n').trim()
}

function sanitizeGeneratedStoryOutput(input: string, payload: any) {
  const chapterNumber = Math.max(1, Math.floor(Number(payload?.nextChapterNumber || 1)))
  const normalized = String(input || '')
    .replace(/\r\n/g, '\n')
    .replace(/\uFEFF/g, '')
    .replace(/[\u200B-\u200D\u2060]/g, '')
    .trim()

  const technicalMatch = normalized.match(/^#\s*BẢN PHÂN TÍCH KỸ THUẬT\s*\/\s*KHÔNG ĐĂNG\s*$/im)

  if (!technicalMatch || typeof technicalMatch.index !== 'number') {
    return cleanupReaderSection(normalized, chapterNumber)
  }

  const readerPart = normalized.slice(0, technicalMatch.index).replace(/(?:\n\s*---\s*)+$/g, '')
  const technicalPart = normalized.slice(technicalMatch.index).trim()
  const cleanedReader = cleanupReaderSection(readerPart, chapterNumber)

  return `${cleanedReader}\n\n---\n\n${technicalPart}`.trim()
}


export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  const enabled = process.env.ENABLE_REAL_AI

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY' })
  }

  if (enabled && enabled !== 'true') {
    return res.status(403).json({ error: 'ENABLE_REAL_AI is not true' })
  }

  try {
    const payload = normalizePayload((req.body || {}) as GeneratePayload)

    const moderationInput = [
      payload.storyTitle,
      payload.promptIdea,
      payload.genre,
      payload.writingStyle,
      payload.chapterTitle,
      payload.previousChapterSummary,
      payload.userInstruction,
    ]
      .filter(Boolean)
      .join('\n\n')

    await moderateTextOrThrow(moderationInput, 'story generation input')

    const prompt = buildPrompt(payload)
    const lengthRule = getLengthRule(payload.chapterLengthLabel)
    const model = getTextModel(payload)

    const firstPass = await callOpenAIText({
      apiKey,
      model,
      prompt,
      maxOutputTokens: lengthRule.maxOutputTokens,
    })

    if (!firstPass.response.ok) {
      return res.status(firstPass.response.status).json({
        error: firstPass.data?.error?.message || 'OpenAI API error',
        detail: firstPass.data,
      })
    }

    if (firstPass.data?.__nonJson) {
      return res.status(502).json({
        error: 'OpenAI returned non-JSON response',
        detail: firstPass.data,
      })
    }

    const draftText = firstPass.text

    if (!draftText) {
      return res.status(500).json({
        error: 'OpenAI returned empty output',
        detail: firstPass.data,
      })
    }

    let finalText = draftText
    let editorPassUsed = false
    let editorPassFailed = false
    let editorUsage = null
    let editorError = ''

    if (getStoryEditorPassEnabled(payload)) {
      try {
        const editorPrompt = buildStoryEditorPrompt(payload, draftText)

        await moderateTextOrThrow(editorPrompt, 'story editor input')

        const editorPass = await callOpenAIText({
          apiKey,
          model,
          prompt: editorPrompt,
          maxOutputTokens: lengthRule.maxOutputTokens,
        })

        if (editorPass.response.ok && !editorPass.data?.__nonJson && editorPass.text) {
          finalText = editorPass.text
          editorPassUsed = true
          editorUsage = editorPass.data?.usage || null
        } else {
          editorPassFailed = true
          editorError =
            editorPass.data?.error?.message ||
            editorPass.data?.preview ||
            `Story editor pass failed with status ${editorPass.response.status}`
        }
      } catch (editorErrorRaw: any) {
        editorPassFailed = true
        editorError = editorErrorRaw?.message || 'Story editor pass failed'
      }
    }

    finalText = sanitizeGeneratedStoryOutput(finalText, payload)

    await moderateTextOrThrow(finalText, 'story generation output')

    return res.status(200).json({
      text: finalText,
      draftText: editorPassUsed ? draftText : undefined,
      model,
      modelKey: payload.modelKey,
      editorPassUsed,
      editorPassFailed,
      editorError: editorPassFailed ? editorError : undefined,
      moderation: {
        inputChecked: true,
        outputChecked: true,
        editorInputChecked: getStoryEditorPassEnabled(payload),
        model: process.env.OPENAI_MODERATION_MODEL || 'omni-moderation-latest',
      },
      usage: firstPass.data?.usage || null,
      editorUsage,
    })
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Unknown generate error',
      detail: error?.detail || null,
      categories: error?.categories || null,
      categoryScores: error?.categoryScores || null,
    })
  }
}