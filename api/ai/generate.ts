import type { GeneratePayload } from './generate-lib/types.js'
import { getLengthRule, getStoryEditorPassEnabled, getTextModel } from './generate-lib/model.js'
import { callOpenAIText } from './generate-lib/openaiClient.js'
import { normalizePayload } from './generate-lib/payload.js'
import { buildPrompt, buildStoryEditorPrompt } from './generate-lib/promptBuilders.js'
import { moderateTextOrThrow } from './generate-lib/moderation.js'
import { verifyAIAdminRequest } from './generate-lib/aiSecurity.js'

function softenAIDramaPhrases(input: string) {
  const replacements: Array<[RegExp, string]> = [
    [
      /bỗng\s+phòng\s+([^.\n]{0,40})\s+thành khán đài/gi,
      'mọi người trong phòng $1 dừng tay và quay sang nhìn tôi',
    ],
    [
      /bỗng phòng thử đồ thành khán đài/gi,
      'mọi người trong phòng thử đồ dừng tay và quay sang nhìn tôi',
    ],
    [
      /Từ ["“]nhà["”] được thốt ra như một lực đẩy\.?/gi,
      'Chỉ một chữ “nhà” cũng đủ khiến mọi người nhìn tôi khác đi.',
    ],
    [/Áp lực dồn lên\.?/gi, 'Tiếng bàn tán sau lưng tôi bắt đầu dày hơn.'],
    [
      /Quyền lực công khai có thể muốn đẩy tôi xuống, nhưng manh mối đầu tiên đã nằm trong tay\.?/gi,
      'Họ muốn tôi cúi đầu ngay tại đó. Nhưng ít nhất, tôi đã có thứ để kiểm tra tiếp.',
    ],
    [
      /Quyền lực của ([^.。\n]+?) đang đè lên tôi/gi,
      'Tôi hiểu $1 đang cố ép tôi phải nhận lỗi',
    ],
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
    [
      /Câu nói như lưỡi dao,\s*bén nhưng rỗng\.?/gi,
      'Câu đó đủ khiến mấy người xung quanh nhìn tôi khác đi.',
    ],
    [/như lưỡi dao,?\s*bén nhưng rỗng/gi, 'đủ khiến người nghe nhìn tôi khác đi'],
    [/ống kính như lưỡi dao/gi, 'máy quay đặt sát lối đi'],
    [/Áp lực phủ lên ([^.\n]+?)\.?/gi, '$1 đứng giữa những ánh mắt đang đổ tới.'],
    [/USB nằm đó như một mảnh nghi vấn\.?/gi, 'Chiếc USB vẫn nằm trên bàn, chưa ai dám kết luận vội.'],
    [
      /Câu hỏi treo lơ lửng,?\s*mở ra khả năng ([^.\n]+?)\.?/gi,
      'Câu hỏi đó khiến nhiều người bắt đầu nghĩ đến khả năng $1.',
    ],
    [/cuộc chơi mới chỉ bắt đầu/gi, 'chuyện này chưa thể kết thúc ở đây'],
  ]

  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), input)
}

function normalizeVietnameseProseArtifacts(input: string) {
  let text = String(input || '')

  const replacements: Array<[RegExp, string]> = [
    [/Từ góc vực đông người/gi, 'Từ phía đám đông'],
    [/ở góc vực đông người/gi, 'ở phía đám đông'],
    [/góc vực đông người/gi, 'phía đám đông'],

    [/mắt dán vào ([^.\n]{0,80}) như bị hút/gi, 'tôi không rời mắt khỏi $1'],
    [/Mắt tôi dán vào ([^.\n]{0,80}) như bị hút/gi, 'Tôi không rời mắt khỏi $1'],
    [/ánh mắt tôi dán vào ([^.\n]{0,80}) như bị hút/gi, 'tôi không rời mắt khỏi $1'],

    [/giọng máy móc/gi, 'giọng đều đều'],
    [
      /Hàng chục tài khoản ẩn đồng loạt nhảy lên/gi,
      'Hàng chục tài khoản ẩn danh đồng loạt bình luận',
    ],
    [/Cái âm vang ấy dính vào ký ức của tôi/gi, 'Tôi nhớ rất rõ âm thanh đó'],
    [/Câu hỏi rơi vào tôi như một viên đá lạnh/gi, 'Tôi khựng lại khi nghe câu đó'],
    [/Ánh mắt ([^.\n]{0,40}) chĩa về phía tôi/gi, 'Người đó nhìn thẳng về phía tôi'],
    [/ánh mắt ([^.\n]{0,40}) chĩa về phía tôi/gi, 'người đó nhìn thẳng về phía tôi'],
    [
      /Đó là cú đòn bất ngờ nhất/gi,
      'Tôi không ngờ họ lại kéo cả chuyện này đi xa đến vậy',
    ],
    [/trong tôi đã lóe lên hướng đi/gi, 'tôi biết mình phải bắt đầu từ đâu'],
    [
      /Có một dấu tay trong đó\s*[—-]\s*dấu tay mà tôi sẽ dùng để lần theo\.?/gi,
      'Cách người đó cầm đồ vật khiến tôi chú ý. Nếu kiểm tra được, có thể vẫn còn dấu vân tay.',
    ],

    [/trích xuất lịch sử hệ thống\s*\(log\)/gi, 'bản trích lịch sử hệ thống'],
    [/\bbản log\b/gi, 'bản ghi hệ thống'],
    [/\blog\b/gi, 'bản ghi hệ thống'],
    [/ôm cái bìa/gi, 'giữ chặt một bìa hồ sơ'],
    [/micro trợ lý/gi, 'điện thoại của trợ lý'],
    [/chính sách ghi đè\/ghi đệm/gi, 'dữ liệu tạm thường bị ghi đè'],
    [
      /như người bị kẹp giữa mệnh lệnh trên và trách nhiệm với đồng nghiệp/gi,
      'như muốn nói gì đó nhưng không dám',
    ],
    [/Và thời gian, dù chưa nói thành lời, đang đếm\.?/gi, 'Nếu chậm thêm, bản ghi kia có thể biến mất.'],
    [/một nỗi lo lạnh/gi, 'một nỗi lo âm ỉ'],
    [/như đang đọc mệnh lệnh/gi, 'như đã được dặn trước'],
    [/khựng lại\s+ném vào mặt nước\s*[—-]\s*gây vết loang/gi, 'khựng lại vài giây'],
    [/mực còn ấm trong não người khác/gi, 'lớp mực còn mới dưới đầu ngón tay'],
    [/công thức sống còn nhỏ bé/gi, 'manh mối nhỏ còn giữ được'],
    [/lành nghề của một nhà thiết kế/gi, 'thói quen soi chi tiết của một nhà thiết kế'],
    [/Tiếng gõ như một yêu cầu đếm ngược\.?/gi, 'Tiếng gõ khiến căn phòng im thêm.'],
    [/một khoảng không dài/gi, 'một quãng im lặng dài'],
    [
      /lời cô khiến căn phòng khựng lại vài giây\s*[—-]\s*gây vết loang/gi,
      'lời cô khiến căn phòng khựng lại vài giây',
    ],
    [/ôm bản sao ([^.!?\n]{0,80}) trong lòng bàn tay/gi, 'giữ bản sao $1 trong tay'],
    [/ôm ([^.!?\n]{0,80}) trong lòng bàn tay/gi, 'giữ $1 trong tay'],
    [/cẩn thận như ôm một thứ dễ gãy/gi, 'cẩn thận như sợ làm rách mép giấy'],
    [/Câu đó rơi xuống hậu trường như một tảng đá\.?/gi, 'Câu đó làm hậu trường im hẳn vài giây.'],
    [/rơi xuống hậu trường như một tảng đá/gi, 'làm hậu trường im hẳn vài giây'],
    [/như đã thắng một ván nhỏ/gi, 'như thể chuyện này coi như xong'],
    [/thay vì thi vị/gi, 'không còn chỉ đứng xem náo nhiệt'],
    [
      /Câu hỏi đó như mở ra một con đường để truy vết\.?/gi,
      'Câu hỏi đó kéo sự chú ý về đúng chỗ: ai đã chạm vào chứng cứ trước giờ công bố.',
    ],
    [/như mở ra một con đường để truy vết/gi, 'kéo sự chú ý về đúng chỗ cần kiểm tra'],
    [/là đường sống đầu tiên/gi, 'là cơ hội đầu tiên để lật lại chuyện này'],
    [
      /Và đó, với tôi, là cơ hội đầu tiên để lật lại chuyện này\.?/gi,
      'Chỉ cần xác định được người đã đổi chứng cứ, tôi còn cơ hội lật lại chuyện này.',
    ],
    [/thắng một ván nhỏ/gi, 'chuyện này coi như xong'],
    [
      /Khung kính trưng bày các mẫu vải và chậu cây thủy tinh nhấp nháy như những món đồ trưng bày trong một vườn nhỏ\.?/gi,
      'Trong các khung kính là mẫu vải, bản phối màu và vài chậu cây thủy tinh nhỏ dùng để trang trí.',
    ],
    [/Tôi cảm thấy áp lực, nhưng cố giữ mọi thứ ở mức vừa phải/gi, 'Tôi căng thẳng, nhưng vẫn cố giữ mặt bình tĩnh'],
    [/Áp lực phủ lên An An nhỏ bên cạnh tôi\.?/gi, 'An An đứng sát bên tôi, nhỏ bé giữa những ánh mắt đang đổ tới.'],
    [/Áp lực phủ lên ([^.\n]+?)\.?/gi, '$1 đứng giữa những ánh mắt đang đổ tới.'],
    [/USB nằm đó như một mảnh nghi vấn\.?/gi, 'Chiếc USB vẫn nằm trên bàn, chưa ai dám kết luận vội.'],
    [
      /Câu hỏi treo lơ lửng,?\s*mở ra khả năng có người đã chuẩn bị trước\.?/gi,
      'Câu hỏi đó khiến nhiều người bắt đầu nghĩ đến khả năng có ai đó đã chuẩn bị chuyện này từ trước.',
    ],
    [/Câu hỏi treo lơ lửng/gi, 'Câu hỏi đó khiến nhiều người im lại'],
    [
      /mở ra khả năng có người đã chuẩn bị trước/gi,
      'khiến nhiều người bắt đầu nghĩ đến khả năng có ai đó đã chuẩn bị chuyện này từ trước',
    ],
    [/mở ra khả năng/gi, 'khiến nhiều người nghĩ đến khả năng'],
    [/chúng nối lại thành một đường dẫn cần kiểm tra/gi, 'những thứ đó đủ để tôi bám vào và kiểm tra tiếp'],
    [/nối lại thành một đường dẫn cần kiểm tra/gi, 'đủ để bám vào và kiểm tra tiếp'],
    [/nối lại thành một đường dẫn/gi, 'cho tôi vài điểm để kiểm tra tiếp'],
    [
      /Tôi cảm nhận được manh mối đầu tiên rõ hơn:\s*([^.!?\n]+?)\s*[—-]\s*những thứ đó đủ để tôi bám vào và kiểm tra tiếp\.?/gi,
      'Lúc này, tôi đã có vài thứ để bám vào: $1.',
    ],
    [
      /Tôi siết thêm tay ([^,.\n]+), biết rằng đêm còn dài, và chuyện này chưa thể kết thúc ở đây\.?/gi,
      'Tôi siết tay $1. Đêm nay chưa thể kết thúc ở đây.',
    ],
    [/đêm còn dài, và cuộc chơi mới chỉ bắt đầu/gi, 'đêm nay chưa thể kết thúc ở đây'],
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
    [
      /khán đài|phiên xử|bản cáo trạng|vòng quyền lực|quyền lực công khai|ván cờ/gi,
      'cụm sân khấu hóa/văn AI',
    ],
    [
      /lời nói như con dấu|ném vào mặt nước|mực trong não|mực còn ấm trong não|công thức sống còn|thời gian[^.\n]{0,60}đếm/gi,
      'ẩn dụ lạ/sai tai cần soi thủ công',
    ],
    [/bộc lộ vai trò của nó|biến thành|như một yêu cầu đếm ngược/gi, 'cấu trúc ẩn dụ gượng'],
    [/ôm[^.\n]{0,80}trong lòng bàn tay|như ôm một thứ dễ gãy/gi, 'cụm “ôm trong lòng bàn tay/như ôm thứ dễ gãy” gượng'],
    [/rơi xuống hậu trường như một tảng đá|thắng một ván nhỏ|thay vì thi vị/gi, 'ví von/kết hợp từ gượng cần sửa'],
    [/mở ra một con đường để truy vết|đường sống đầu tiên/gi, 'câu tổng kết/slogan cuối cảnh cần hạ xuống câu cụ thể'],
    [
      /như lưỡi dao|áp lực phủ lên|mảnh nghi vấn|câu hỏi treo lơ lửng|nối lại thành một đường dẫn|cuộc chơi mới chỉ bắt đầu/gi,
      'cụm v32 còn giọng AI/câu slogan cần soi thủ công',
    ],
    [/mở ra khả năng|đêm còn dài/gi, 'câu tổng kết/kịch hóa cuối cảnh nên viết cụ thể hơn'],

    [
      /nơi tôi che chắn nhất/gi,
      'cụm “nơi tôi che chắn nhất” còn trừu tượng, nên đổi thành điều nhân vật muốn bảo vệ cụ thể',
    ],
    [
      /chuông vẫn vang trong đầu/gi,
      'cụm “chuông vẫn vang trong đầu” dễ thành biểu tượng văn chương, nên viết thành nhân vật nhớ rõ âm thanh',
    ],
    [/hạn chót đã có/gi, 'câu “hạn chót đã có” giống slogan cuối chương'],
    [/không định bỏ lỡ/gi, 'cụm “không định bỏ lỡ” dễ thành câu slogan AI'],
    [/quyền lực chao đảo/gi, 'cụm “quyền lực chao đảo” sân khấu hóa, nên viết cụ thể ai bị ảnh hưởng'],
    [/nụ cười mỏng lại/gi, 'cụm “nụ cười mỏng lại” hơi convert/AI'],
    [/nước mắt lăn không thành tiếng/gi, 'cụm “nước mắt lăn không thành tiếng” sáo và gượng'],
    [/mắt dán vào[^.\n]{0,80}như bị hút/gi, 'cụm “mắt dán vào... như bị hút” còn giọng AI'],
    [/giọng máy móc/gi, 'cụm “giọng máy móc” nên đổi thành “giọng đều đều” hoặc mô tả hành động cụ thể'],
    [/góc vực đông người/gi, 'lỗi dùng từ “góc vực đông người”, phải là “phía đám đông” hoặc “góc đông người”'],
    [/dính vào ký ức/gi, 'cụm “dính vào ký ức” gượng, nên viết “tôi nhớ rất rõ...”'],
    [/lóe lên hướng đi/gi, 'cụm “lóe lên hướng đi” gượng, nên viết “tôi biết mình phải bắt đầu từ đâu”'],
    [
      /dấu tay mà tôi sẽ dùng để lần theo/gi,
      'cụm dấu tay suy luận hơi phi logic, nên viết rõ cần kiểm tra vật chứng để tìm dấu vân tay',
    ],
  ]

  const issues: string[] = []

  for (const [pattern, message] of checks) {
    if (pattern.test(text)) {
      issues.push(message)
    }
  }

  return [...new Set(issues)].slice(0, 10)
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed',
    })
  }

  const auth = verifyAIAdminRequest(req, {
    routeName: 'generate-story',
    maxRequestsPerWindow: 12,
    windowMs: 60_000,
  })

  if (!auth.ok) {
    return res.status(auth.status).json(auth.body)
  }

  const apiKey = process.env.OPENAI_API_KEY
  const enabled = process.env.ENABLE_REAL_AI

  if (!apiKey) {
    return res.status(500).json({
      ok: false,
      error: 'Missing OPENAI_API_KEY',
    })
  }

  if (enabled && enabled !== 'true') {
    return res.status(403).json({
      ok: false,
      error: 'ENABLE_REAL_AI is not true',
    })
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
        ok: false,
        error: firstPass.data?.error?.message || 'OpenAI API error',
        detail: firstPass.data,
      })
    }

    if (firstPass.data?.__nonJson) {
      return res.status(502).json({
        ok: false,
        error: 'OpenAI returned non-JSON response',
        detail: firstPass.data,
      })
    }

    const draftText = firstPass.text

    if (!draftText) {
      return res.status(500).json({
        ok: false,
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

    const beforeDeterministicCleanup = finalText

    finalText = softenAIDramaPhrases(finalText)
    finalText = normalizeVietnameseProseArtifacts(finalText)

    vietnameseRepairUsed = finalText !== beforeDeterministicCleanup
    vietnameseRepairIssues = findVietnameseNaturalnessIssues(finalText)

    // Không gọi AI repair pass lần 2.
    // Chỉ cleanup deterministic các cụm chắc chắn gượng/sai,
    // còn cụm nghi ngờ thì trả về vietnameseRepairIssues để soi thủ công.

    await moderateTextOrThrow(finalText, 'story generation output')

    return res.status(200).json({
      ok: true,
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
      ok: false,
      error: error?.message || 'Unknown generate error',
      detail: error?.detail || null,
      categories: error?.categories || null,
      categoryScores: error?.categoryScores || null,
    })
  }
}