import type { GeneratePayload } from './generate-lib/types.js'
import { getLengthRule, getStoryEditorPassEnabled, getTextModel } from './generate-lib/model.js'
import { callOpenAIText } from './generate-lib/openaiClient.js'
import { normalizePayload } from './generate-lib/payload.js'
import { buildPrompt, buildStoryEditorPrompt } from './generate-lib/promptBuilders.js'
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
    [/khựng lại\s+ném vào mặt nước\s*[—-]\s*gây vết loang/gi, 'khựng lại vài giây'],
    [/mực còn ấm trong não người khác/gi, 'lớp mực còn mới dưới đầu ngón tay'],
    [/công thức sống còn nhỏ bé/gi, 'manh mối nhỏ còn giữ được'],
    [/lành nghề của một nhà thiết kế/gi, 'thói quen soi chi tiết của một nhà thiết kế'],
    [/Tiếng gõ như một yêu cầu đếm ngược\.?/gi, 'Tiếng gõ khiến căn phòng im thêm.'],
    [/một khoảng không dài/gi, 'một quãng im lặng dài'],
    [/lời cô khiến căn phòng khựng lại vài giây\s*[—-]\s*gây vết loang/gi, 'lời cô khiến căn phòng khựng lại vài giây'],
    [/ôm bản sao ([^.!?\n]{0,80}) trong lòng bàn tay/gi, 'giữ bản sao $1 trong tay'],
    [/ôm ([^.!?\n]{0,80}) trong lòng bàn tay/gi, 'giữ $1 trong tay'],
    [/cẩn thận như ôm một thứ dễ gãy/gi, 'cẩn thận như sợ làm rách mép giấy'],
    [/Câu đó rơi xuống hậu trường như một tảng đá\.?/gi, 'Câu đó làm hậu trường im hẳn vài giây.'],
    [/rơi xuống hậu trường như một tảng đá/gi, 'làm hậu trường im hẳn vài giây'],
    [/như đã thắng một ván nhỏ/gi, 'như thể chuyện này coi như xong'],
    [/thay vì thi vị/gi, 'không còn chỉ đứng xem náo nhiệt'],
    [/Câu hỏi đó như mở ra một con đường để truy vết\.?/gi, 'Câu hỏi đó kéo sự chú ý về đúng chỗ: ai đã chạm vào chứng cứ trước giờ công bố.'],
    [/như mở ra một con đường để truy vết/gi, 'kéo sự chú ý về đúng chỗ cần kiểm tra'],
    [/là đường sống đầu tiên/gi, 'là cơ hội đầu tiên để lật lại chuyện này'],
    [/Và đó, với tôi, là cơ hội đầu tiên để lật lại chuyện này\.?/gi, 'Chỉ cần xác định được người đã đổi chứng cứ, tôi còn cơ hội lật lại chuyện này.'],
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
    [/khán đài|phiên xử|bản cáo trạng|vòng quyền lực|quyền lực công khai|ván cờ/gi, 'cụm sân khấu hóa/văn AI'],
    [/lời nói như con dấu|ném vào mặt nước|mực trong não|mực còn ấm trong não|công thức sống còn|thời gian[^.\n]{0,60}đếm/gi, 'ẩn dụ lạ/sai tai cần soi thủ công'],
    [/bộc lộ vai trò của nó|biến thành|như một yêu cầu đếm ngược/gi, 'cấu trúc ẩn dụ gượng'],
    [/ôm[^.\n]{0,80}trong lòng bàn tay|như ôm một thứ dễ gãy/gi, 'cụm “ôm trong lòng bàn tay/như ôm thứ dễ gãy” gượng'],
    [/rơi xuống hậu trường như một tảng đá|thắng một ván nhỏ|thay vì thi vị/gi, 'ví von/kết hợp từ gượng cần sửa'],
    [/mở ra một con đường để truy vết|đường sống đầu tiên/gi, 'câu tổng kết/slogan cuối cảnh cần hạ xuống câu cụ thể'],
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

    // v31: không gọi AI repair pass mặc định nữa.
    // Nếu còn issue, trả về vietnameseRepairIssues để soi thủ công, tránh AI tự sinh thêm ẩn dụ mới.


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