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
    [/giấu cả sân khấu vào trong túi áo/gi, 'mọi thứ trong hậu trường đã nằm trong tay anh ta'],
    [/khoảnh khắc đó lọt vào mắt tôi như một đồng minh/gi, 'chi tiết ấy khiến tôi khựng lại'],
    [/Giọng gọi cắt ngang, đi thẳng vào tai người nghe như mũi dao/gi, 'Giọng gọi ấy cắt ngang tiếng ồn trong hành lang'],
    [/mỗi chữ như một lưỡi dao cố gắng dán miệng tôi/gi, 'mỗi chữ đều nhằm khóa miệng tôi trước đám đông'],
    [/Tôi gom chúng vào đường ngắm của mình như người chụp ảnh chọn điểm lấy nét/gi, 'Tôi ghi nhớ từng thứ một: miếng dán, chiếc camera, túi giao hàng còn mở'],
    [/Kẻ dàn cảnh muốn gán cho tôi một dấu đời/gi, 'Kẻ dàn cảnh muốn biến một dấu vết cũ thành bằng chứng chống lại tôi'],
    [/Câu nói ấy không gào thét,? chỉ đủ để làm rung một mảnh kính tưởng chừng im bặt/gi, 'Câu nói ấy không lớn, nhưng đủ khiến vài người đổi sắc mặt'],
    [/mặt anh ta là một tấm bạt lễ nghi/gi, 'vẻ mặt anh ta lịch sự đến mức giả tạo'],
    [/mép có sự chia phần/gi, 'khóe môi lộ vẻ tính toán'],
    [/nhân phẩm tôi lộ ra giữa đám đông/gi, 'danh dự của tôi bị đem ra mổ xẻ trước mặt tất cả'],
    [/Cánh cửa khép lại phía sau như một lớp da che phủ tạm thời/gi, 'Cánh cửa khép lại sau lưng, ngăn bớt tiếng thì thầm ngoài hành lang'],
    [/mũi kim tiêm: như thể mọi quyết định nhỏ hôm nay sẽ theo tôi về nhà/gi, 'mũi tiêm hôm nay chỉ là chuyện nhỏ, nhưng những ánh mắt quanh tôi thì không nhỏ chút nào'],
    [/nụ cười đó giống như nẹp một vết rạn/gi, 'tôi cố cười để con không sợ, nhưng cơ mặt cứng lại'],
    [/Dòng mã phòng hiện lên như bằng chứng/gi, 'Dòng mã phòng trên ảnh khiến vài người lập tức quay sang nhìn tôi'],
    [/những câu chữ như mảnh dao nhỏ/gi, 'từng câu họ nói đều nhằm kéo tôi vào thế khó'],
    [/nén nhang còn âm ỉ như một câu chưa kết/gi, 'nén nhang trên bàn thờ vẫn chưa tàn'],
    [/che chở như bọc lấy một cành cây non giữa mưa gió/gi, 'tôi kéo đứa trẻ sát vào lòng để tránh ống kính'],
    [/giọng bà ta như đặt một mũi kim vào giữa niềm tin của tôi/gi, 'giọng bà ta nhỏ, nhưng đủ khiến những người quanh đó nhìn tôi khác đi'],
    [/khuôn mặt phẳng như tờ đơn khiếu nại/gi, 'mặt anh ta không lộ cảm xúc, tay cầm sẵn tờ khiếu nại'],
    [/Câu cuối mang ý nghi vấn đặt lên tôi như một mũi tên/gi, 'Câu cuối khiến mọi ánh mắt quay về phía tôi'],
    [/bóp nát đi sự chân thành của mẩu giấy/gi, 'phủi sạch ý nghĩa của mẩu giấy bằng một câu mỉa mai'],
    [/Tôi khoá cửa thang máy sau lưng/gi, 'Cửa thang máy khép lại sau lưng tôi'],
    [/bầu không khí nặng như phiên xử công khai/gi, 'Không ai ngồi xuống. Ai cũng chờ tôi giải thích'],
    [/mặt ông ta như người đã chuẩn bị sẵn để tuyên án/gi, 'ông ta đứng chắn ở cửa, tay cầm sẵn tờ khiếu nại'],
    [/quyền lực nhà trường với các nhà cung cấp là một tảng băng/gi, 'tôi hiểu sức nặng của một lời phàn nàn từ phụ huynh'],
    [/nụ cười nhẵn nhụi như muốn xé rách/gi, 'bà ta cười rất nhẹ, nhưng lời nói thì không chừa đường lui'],
    [/ánh mắt cô ấy lạnh như đã đọc xong một phán quyết/gi, 'cô ta nhìn tôi như thể mọi chuyện đã có kết luận'],
  ]

  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), input)
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