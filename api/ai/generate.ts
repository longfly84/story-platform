import type { GeneratePayload } from './generate-lib/types.js'
import { getLengthRule, getStoryEditorPassEnabled, getTextModel } from './generate-lib/model.js'
import { callOpenAIText } from './generate-lib/openaiClient.js'
import { normalizePayload } from './generate-lib/payload.js'
import { buildPrompt, buildStoryEditorPrompt, buildVietnameseFocusedRepairPrompt } from './generate-lib/promptBuilders.js'
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


function normalizeVietnameseProseArtifacts(input: string) {
  let text = String(input || '')

  const replacements: Array<[RegExp, string]> = [
    [/trích xuất lịch sử hệ thống\s*\(log\)/gi, 'bản trích lịch sử hệ thống'],
    [/\bbản log\b/gi, 'bản ghi hệ thống'],
    [/\blog\b/gi, 'bản ghi hệ thống'],
    [/ôm cái bìa/gi, 'giữ chặt một bìa hồ sơ'],
    [/micro trợ lý/gi, 'điện thoại của trợ lý'],
    [/chính sách ghi đè\/ghi đệm/gi, 'dữ liệu tạm thường bị ghi đè'],
    [/như người bị kẹp giữa mệnh lệnh trên và trách nhiệm với đồng nghiệp/gi, 'như muốn nói gì đó nhưng không dám'],
    [/Và thời gian, dù chưa nói thành lời, đang đếm\.?/gi, 'Nếu chậm thêm, bản ghi kia có thể biến mất.'],
    [/một nỗi lo lạnh/gi, 'một nỗi lo âm ỉ'],
    [/như đang đọc mệnh lệnh/gi, 'như đã được dặn trước'],
  ]

  for (const [pattern, replacement] of replacements) {
    text = text.replace(pattern, replacement)
  }

  return text
}

function findVietnameseNaturalnessIssues(input: string) {
  const text = String(input || '')
  const checks: Array<[RegExp, string]> = [
    [/Chi Tiết Bị Đặt Sai/gi, 'title còn là placeholder “Chi Tiết Bị Đặt Sai”'],
    [/ôm cái bìa/gi, 'cụm “ôm cái bìa” gượng trong văn công sở'],
    [/micro trợ lý/gi, 'cụm “micro trợ lý” không rõ nghĩa'],
    [/chính sách ghi đè\/ghi đệm/gi, 'thuật ngữ “ghi đè/ghi đệm” quá kỹ thuật'],
    [/\b(log|metadata|cache|backup|screenshot)\b/gi, 'còn thuật ngữ kỹ thuật thô'],
    [/thời gian[^.\n]{0,40}đang đếm/gi, 'câu kết kiểu slogan “thời gian đang đếm”'],
    [/như người bị kẹp giữa/gi, 'ẩn dụ giải thích tâm lý thay vì hành động cụ thể'],
    [/con đường cần câu trả lời/gi, 'cụm sai tai “con đường cần câu trả lời”'],
    [/một vài câu trả lời đã bắt đầu hé/gi, 'câu tổng kết AI “câu trả lời bắt đầu hé”'],
  ]

  const issues: string[] = []
  for (const [pattern, message] of checks) {
    if (pattern.test(text)) issues.push(message)
  }

  return [...new Set(issues)].slice(0, 8)
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
    let vietnameseRepairUsed = false
    let vietnameseRepairIssues: string[] = []

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

    finalText = softenAIDramaPhrases(finalText)
    finalText = normalizeVietnameseProseArtifacts(finalText)

    vietnameseRepairIssues = findVietnameseNaturalnessIssues(finalText)

    if (getStoryEditorPassEnabled(payload) && vietnameseRepairIssues.length > 0) {
      try {
        const repairPrompt = buildVietnameseFocusedRepairPrompt(payload, finalText, vietnameseRepairIssues)

        await moderateTextOrThrow(repairPrompt, 'story vietnamese repair input')

        const repairPass = await callOpenAIText({
          apiKey,
          model,
          prompt: repairPrompt,
          maxOutputTokens: lengthRule.maxOutputTokens,
        })

        if (repairPass.response.ok && !repairPass.data?.__nonJson && repairPass.text) {
          finalText = normalizeVietnameseProseArtifacts(softenAIDramaPhrases(repairPass.text))
          vietnameseRepairUsed = true
          vietnameseRepairIssues = findVietnameseNaturalnessIssues(finalText)
        }
      } catch {
        // Fallback an toàn: giữ bản editor đã qua bộ lọc deterministic, không làm Factory chết.
      }
    }

    await moderateTextOrThrow(finalText, 'story generation output')

    return res.status(200).json({
      text: finalText,
      draftText: editorPassUsed ? draftText : undefined,
      model,
      modelKey: payload.modelKey,
      editorPassUsed,
      editorPassFailed,
      editorError: editorPassFailed ? editorError : undefined,
      vietnameseRepairUsed,
      vietnameseRepairIssues,
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