import type { GeneratePayload } from './generate-lib/types.js'
import { getLengthRule, getStoryEditorPassEnabled, getTextModel } from './generate-lib/model.js'
import { callOpenAIText } from './generate-lib/openaiClient.js'
import { normalizePayload } from './generate-lib/payload.js'
import { buildPrompt, buildStoryEditorPrompt, buildStoryEditorValidationPrompt } from './generate-lib/promptBuilders.js'
import { moderateTextOrThrow } from './generate-lib/moderation.js'


function softenAIDramaPhrases(input: string) {
  const replacements: Array<[RegExp, string]> = [
    [/bỗng\s+phòng\s+([^.\n]{0,40})\s+thành khán đài/gi, 'mọi người trong phòng $1 dừng tay và quay sang nhìn tôi'],
    [/bỗng phòng thử đồ thành khán đài/gi, 'mọi người trong phòng thử đồ dừng tay và quay sang nhìn tôi'],
    [/Từ ["“]nhà["”] được thốt ra như một lực đẩy\.?/gi, 'Chỉ một chữ “nhà” cũng đủ khiến mọi người nhìn tôi khác đi.'],
    [/Áp lực dồn lên\.?/gi, 'Tiếng bàn tán sau lưng tôi bắt đầu dày hơn.'],
    [/Quyền lực công khai có thể muốn đẩy tôi xuống, nhưng manh mối đầu tiên đã nằm trong tay\.?/gi, 'Họ muốn tôi cúi đầu ngay tại đó. Nhưng ít nhất, tôi đã có thứ để kiểm tra tiếp.'],
    [/Quyền lực của ([^.。\n]+?) đang đè lên tôi/gi, 'Tôi hiểu $1 đang cố ép tôi phải nhận lỗi'],
    [/vòng móng vuốt của dư luận/gi, 'đám đông đang vội kết luận'],
    [/vòng dò xét/gi, 'những ánh mắt dò xét'],
    [/tấm lưới quyền lực/gi, 'cách họ ép người khác nhận lỗi'],
    [/tấm lưới này/gi, 'chuyện này'],
    [/như một bản cáo trạng/gi, 'để mọi người cùng nhìn thấy'],
    [/như một con dấu/gi, 'khiến mọi người im đi vài giây'],
    [/như viên đá/gi, 'khiến căn phòng khựng lại'],
    [/như một mũi kim/gi, 'làm người nghe khó chịu'],
    [/như một mũi tên/gi, 'khiến mọi ánh mắt quay về phía tôi'],
    [/một cuộc chơi vừa mở màn/gi, 'mọi chuyện rõ ràng chưa dừng ở đây'],
    [/ván cờ mới vừa bắt đầu mở/gi, 'chuyện này mới chỉ bắt đầu'],
  ]

  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), input)
}


function polishVietnameseLineEditText(input: string) {
  const replacements: Array<[RegExp, string]> = [
    [/Hậu trường sáng lên khác thường, như thể cả căn phòng đang cố gắng kịp một cái hẹn\.?/gi, 'Hậu trường sáng đèn từ sớm.'],
    [/mọi thứ xô bồ trước giờ VIP vào xem concept/gi, 'cả phòng rối lên trước giờ khách VIP tới xem concept'],
    [/bước vào như muốn chiếm luôn không gian/gi, 'bước thẳng vào giữa phòng'],
    [/ánh mắt quét về/gi, 'cùng nhìn về'],
    [/thế đứng của tôi vừa lung lay/gi, 'tôi vừa bị đẩy vào thế khó'],
    [/không để tiếng đó hiện trên mặt/gi, 'không để lộ ra trên mặt'],
    [/Câu hỏi như đặt tôi lên bàn cân\.?/gi, 'Câu hỏi ấy đủ để cả phòng quay sang chờ tôi trả lời.'],
    [/Đây là lần hai ([^.\n]+?) xuất hiện:[^.\n]*\.?/gi, 'Tôi bảo cô ấy chụp lại thật rõ, phòng khi có người động vào bằng chứng.'],
    [/Đó là bằng chứng sống/gi, 'Đó là thứ duy nhất tôi đang giữ được'],
    [/Lời anh như ép tôi phải cúi đầu/gi, 'Anh nói rất khẽ, nhưng từng chữ đều là đe dọa'],
    [/những từ ấy châm vào da tôi như kim/gi, 'mỗi tiếng lọt vào tai tôi đều khó chịu'],
    [/chuyển cuộc chơi từ cảm xúc sang lý lẽ/gi, 'ngừng tranh cãi và hỏi thẳng vào việc cần kiểm tra'],
    [/chộp lấy manh mối/gi, 'ghi nhớ ngay chi tiết đó'],
    [/trả đũa bằng sự thật/gi, 'không để họ bắt tôi cúi đầu'],
    [/một mảnh hé của chuỗi sự việc/gi, 'một chi tiết khiến câu chuyện bớt chắc chắn'],
    [/mảnh hé/gi, 'manh mối'],
    [/ngòi nắm/gi, 'chỗ bám'],
    [/đứng tay chốc lát/gi, 'dừng lại một lúc'],
    [/mắt xích quan sát/gi, 'vị trí ai ra vào cũng phải đi ngang qua'],
    [/bằng chứng tĩnh người/gi, 'thứ có thể lưu lại'],
    [/lời nói lung lay/gi, 'vài câu nói có thể bị bẻ cong'],
    [/nỗi sợ hãi ló dạng ở tay ([^,.\n]+)/gi, 'bàn tay run của $1'],
    [/che nhoài/gi, 'che đi'],
    [/Trận đấu vừa được mở bằng ([^.\n]+?)\s*—\s*([^.\n]+?)\s*—\s*/gi, 'Tôi nhìn lại $1. '],
    [/trận đấu vừa được mở/gi, 'chuyện này vừa bắt đầu'],
    [/Tiếng hỏi như mũi dao\.?/gi, 'Anh ta hỏi đủ lớn để mọi người nghe rõ.'],
    [/mắt thẳm/gi, 'ánh mắt nặng trĩu'],
    [/nói khoan/gi, 'nói chậm'],
    [/mọi âm thanh dồn về ([^.\n]+?)\.?/gi, 'Cả phòng lập tức nhìn về $1.'],
    [/hôi lên mùi/gi, 'ám mùi'],
    [/kêu ròn/gi, 'rè rè'],
    [/như người chờ được khiển trách/gi, 'như đã biết mình sắp bị mắng'],
    [/bóp nghẹt lời giải thích/gi, 'chặn mọi lời giải thích'],
    [/giọng như đóng án/gi, 'giọng như đã kết luận xong'],
    [/keo chưa lì/gi, 'lớp keo chưa bám chặt'],
    [/Mùi keo và bụi bột thùng gỗ vỗ vào mũi\.?/gi, 'Mùi keo và bụi gỗ xộc lên.'],
    [/dao cứa vào tai tôi/gi, 'làm tôi khó chịu'],
    [/lời nhẹ mà nhọn/gi, 'nói rất khẽ, nhưng câu nào cũng nhằm vào tôi'],
    [/Mọi ánh mắt dồn vào ([^.\n]+?)\.?/gi, 'Mấy người đứng gần lập tức nhìn về $1.'],
    [/mọi ánh mắt lại hướng về/gi, 'mọi người quay sang nhìn'],
    [/như một đường thẳng giữa những cuộc trò chuyện/gi, 'đặt giữa sảnh, kéo ánh mắt khách mời về cùng một chỗ'],
    [/mảnh ghém vào câu chuyện/gi, 'chi tiết khiến vài người quay sang nhìn nhau'],
    [/vị gắt của cay/gi, 'cổ họng khô rát'],
    [/khinh nhờn/gi, 'khinh miệt'],
  ]

  let text = input
  for (const [pattern, replacement] of replacements) {
    text = text.replace(pattern, replacement)
  }

  return text
}

function findVietnameseLineEditRedFlags(input: string) {
  const checks: Array<[RegExp, string]> = [
    [/lần một|lần hai|lần ba|xuất hiện lần thứ|Đây là lần/gi, 'lộ rule vật chứng xuất hiện nhiều lần'],
    [/chuyển cuộc chơi|trả đũa bằng sự thật|sự thật sẽ nói thay tôi|khúc dạo đầu|ván cờ|trò chơi đã bắt đầu|trận đấu vừa/gi, 'câu meta/slogan/sân khấu hóa'],
    [/mảnh hé|ngòi nắm|đứng tay|mắt xích quan sát|bằng chứng tĩnh người|che nhoài|tiếng đó hiện trên mặt/gi, 'cụm sai tai tiếng Việt'],
    [/mọi ánh mắt dồn vào|mọi âm thanh dồn về|ánh mắt quét về|như mũi dao|như con dao|như một con dấu/gi, 'ẩn dụ/câu máy'],
    [/hôi lên mùi|kêu ròn|keo chưa lì|bụi bột thùng gỗ vỗ vào mũi|vị gắt của cay/gi, 'động từ/cụm cảm giác sai tai'],
    [/Tôi hiểu ngay:\s*[^\n.]{0,120}|Trong lòng tôi rõ ràng:\s*[^\n.]{0,120}/gi, 'giải thích tâm lý quá trực diện'],
  ]

  const flags: string[] = []
  for (const [pattern, label] of checks) {
    if (pattern.test(input)) flags.push(label)
  }

  return Array.from(new Set(flags)).slice(0, 8)
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
    let editorAuditUsed = false
    let editorAuditFailed = false
    let editorAuditFlags: string[] = []

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

    finalText = polishVietnameseLineEditText(finalText)

    if (getStoryEditorPassEnabled(payload) && editorPassUsed) {
      editorAuditFlags = findVietnameseLineEditRedFlags(finalText)

      if (editorAuditFlags.length > 0) {
        try {
          const validationPrompt = buildStoryEditorValidationPrompt(payload, finalText, editorAuditFlags)

          await moderateTextOrThrow(validationPrompt, 'story editor validation input')

          const validationPass = await callOpenAIText({
            apiKey,
            model,
            prompt: validationPrompt,
            maxOutputTokens: lengthRule.maxOutputTokens,
          })

          if (validationPass.response.ok && !validationPass.data?.__nonJson && validationPass.text) {
            finalText = validationPass.text
            editorAuditUsed = true
            editorUsage = validationPass.data?.usage || editorUsage
          } else {
            editorAuditFailed = true
          }
        } catch {
          editorAuditFailed = true
        }
      }
    }

    finalText = softenAIDramaPhrases(polishVietnameseLineEditText(finalText))

    await moderateTextOrThrow(finalText, 'story generation output')

    return res.status(200).json({
      text: finalText,
      draftText: editorPassUsed ? draftText : undefined,
      model,
      modelKey: payload.modelKey,
      editorPassUsed,
      editorPassFailed,
      editorAuditUsed,
      editorAuditFailed,
      editorAuditFlags,
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