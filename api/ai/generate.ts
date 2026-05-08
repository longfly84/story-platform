import type { GeneratePayload } from './generate-lib/types.js'
import { getLengthRule, getStoryEditorMode, getStoryEditorPassEnabled, getStoryEditorRepairEnabled, getTextModel } from './generate-lib/model.js'
import { callOpenAIText } from './generate-lib/openaiClient.js'
import { normalizePayload } from './generate-lib/payload.js'
import { buildPrompt, buildStoryEditorPrompt, buildStoryEditorRepairPrompt } from './generate-lib/promptBuilders.js'
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

function auditVietnameseLineEdit(input: string) {
  const flags: string[] = []
  const checks: Array<[RegExp, string]> = [
    [/vách\s+ấm/gi, 'Cụm “vách ấm” sai tai, cần đổi thành vách gỗ/vách tường/sát vách.'],
    [/mùi\s+keo\s+còn\s+ấm/gi, '“Mùi keo còn ấm” sai collocation, cần đổi thành lớp keo còn mới hoặc mùi keo còn hắc.'],
    [/phập\s+phồng(?!\s+(ngực|lồng ngực|hơi thở))/gi, 'Từ “phập phồng” thiếu chủ thể tự nhiên.'],
    [/con\s+đường\s+cần\s+câu\s+trả\s+lời/gi, 'Câu “con đường cần câu trả lời” là văn máy.'],
    [/câu\s+trả\s+lời\s+đã\s+bắt\s+đầu\s+hé/gi, 'Câu “câu trả lời bắt đầu hé” là meta/slogan.'],
    [/một\s+vài\s+câu\s+trả\s+lời\s+đã\s+bắt\s+đầu\s+hé/gi, 'Câu kết trừu tượng “một vài câu trả lời...” cần đổi thành hành động cụ thể.'],
    [/bằng\s+chứng\s+tĩnh\s+người/gi, '“Bằng chứng tĩnh người” sai nghĩa/sai tai.'],
    [/che\s+nhoài/gi, '“Che nhoài” không phải cách nói tự nhiên.'],
    [/ngòi\s+nắm/gi, '“Ngòi nắm” sai từ, cần đổi thành đầu mối/chỗ bám.'],
    [/mảnh\s+hé/gi, '“Mảnh hé” sai tai, cần đổi thành manh mối/khe hở.'],
    [/đứng\s+tay\s+chốc\s+lát/gi, '“Đứng tay chốc lát” sai câu, cần đổi thành dừng lại vài giây.'],
    [/mọi\s+ánh\s+mắt\s+dồn\s+vào/gi, 'Cụm “mọi ánh mắt dồn vào” lặp văn AI, cần đổi thành hành động cụ thể.'],
    [/mọi\s+âm\s+thanh\s+dồn\s+về/gi, 'Cụm “mọi âm thanh dồn về” là văn máy.'],
    [/tiếng\s+hỏi\s+như\s+mũi\s+dao/gi, 'Ẩn dụ “tiếng hỏi như mũi dao” sáo và sân khấu.'],
    [/chuyển\s+cuộc\s+chơi/gi, 'Cụm “chuyển cuộc chơi” là meta, cần đổi thành hành động cụ thể.'],
    [/trả\s+đũa\s+bằng\s+sự\s+thật/gi, 'Slogan “trả đũa bằng sự thật” cần đổi thành câu hành động.'],
    [/sự\s+thật\s+sẽ\s+nói\s+thay/gi, 'Slogan “sự thật sẽ nói thay” cần đổi thành hành động chứng minh.'],
    [/lần\s+(một|hai|ba)\s+[^\n.]{0,60}(vật chứng|tờ giấy|tấm thẻ|hồ sơ|bản phác thảo|con dấu)/gi, 'Câu lộ rule đếm số lần vật chứng xuất hiện.'],
    [/như\s+người\s+dò\s+lỗi/gi, '“Như người dò lỗi” nghe kỹ thuật, cần đổi thành nhìn kỹ từng chi tiết.'],
    [/mắt\s+thẳm/gi, '“Mắt thẳm” là văn dịch.'],
    [/nói\s+khoan/gi, '“Nói khoan” sai tai.'],
  ]

  for (const [pattern, message] of checks) {
    if (pattern.test(input)) flags.push(message)
  }

  const readerPart = input.split('# BẢN PHÂN TÍCH KỸ THUẬT')[0] || input
  const longAbstractSentences = readerPart
    .split(/(?<=[.!?。])\s+/)
    .filter((sentence) => {
      const text = sentence.trim()
      if (text.length < 150) return false
      return /(tôi biết|tôi hiểu|trong lòng tôi|rõ ràng|câu trả lời|sự thật|quyền lực|áp lực|cục diện|manh mối)/i.test(text)
    })

  if (longAbstractSentences.length >= 2) {
    flags.push('Có nhiều câu dài giải thích/tổng kết trừu tượng trong BẢN ĐỌC, cần cắt thành hành động cụ thể.')
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
      payload.title,
      payload.promptIdea,
      payload.genreLabel,
      payload.mainCharacterStyleLabel,
      payload.chapterLengthLabel,
      payload.storySummary,
      payload.storyMemory,
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
    let editorRepairUsed = false
    let editorRepairFailed = false
    let editorRepairError = ''
    let editorRepairUsage = null
    let editorAuditFlags: string[] = []
    const storyEditorMode = getStoryEditorMode(payload)

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

    if (editorPassUsed && getStoryEditorRepairEnabled(payload)) {
      editorAuditFlags = auditVietnameseLineEdit(finalText)

      if (editorAuditFlags.length > 0) {
        try {
          const repairPrompt = buildStoryEditorRepairPrompt(payload, finalText, editorAuditFlags)

          await moderateTextOrThrow(repairPrompt, 'story editor repair input')

          const repairPass = await callOpenAIText({
            apiKey,
            model,
            prompt: repairPrompt,
            maxOutputTokens: lengthRule.maxOutputTokens,
          })

          if (repairPass.response.ok && !repairPass.data?.__nonJson && repairPass.text) {
            finalText = softenAIDramaPhrases(repairPass.text)
            editorRepairUsed = true
            editorRepairUsage = repairPass.data?.usage || null
            editorAuditFlags = auditVietnameseLineEdit(finalText)
          } else {
            editorRepairFailed = true
            editorRepairError =
              repairPass.data?.error?.message ||
              repairPass.data?.preview ||
              `Story editor repair failed with status ${repairPass.response.status}`
          }
        } catch (repairErrorRaw: any) {
          editorRepairFailed = true
          editorRepairError = repairErrorRaw?.message || 'Story editor repair failed'
        }
      }
    }

    await moderateTextOrThrow(finalText, 'story generation output')

    return res.status(200).json({
      text: finalText,
      draftText: editorPassUsed ? draftText : undefined,
      model,
      modelKey: payload.modelKey,
      storyEditorMode,
      editorPassUsed,
      editorPassFailed,
      editorError: editorPassFailed ? editorError : undefined,
      editorRepairUsed,
      editorRepairFailed,
      editorRepairError: editorRepairFailed ? editorRepairError : undefined,
      editorAuditFlags,
      editorAuditFlagCount: editorAuditFlags.length,
      moderation: {
        inputChecked: true,
        outputChecked: true,
        editorInputChecked: getStoryEditorPassEnabled(payload),
        editorMode: storyEditorMode,
        model: process.env.OPENAI_MODERATION_MODEL || 'omni-moderation-latest',
      },
      usage: firstPass.data?.usage || null,
      editorUsage,
      editorRepairUsage,
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