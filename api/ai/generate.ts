type GenerateMode = 'chapter' | 'story-plan'

type GeneratePayload = {
  mode?: GenerateMode
  moduleId?: string
  title?: string
  storySummary?: string
  promptIdea?: string
  genreLabel?: string
  mainCharacterStyleLabel?: string
  chapterLengthLabel?: string
  cliffhangerLabel?: string
  humiliationLevel?: number
  revengeIntensity?: number
  storyMemory?: string
  recentChapters?: Array<{
    title?: string
    summary?: string
    content?: string
  }>
}

function safeText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function safeNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function getOutputText(data: any) {
  if (typeof data?.output_text === 'string') {
    return data.output_text.trim()
  }

  if (Array.isArray(data?.output)) {
    const parts: string[] = []

    for (const item of data.output) {
      if (Array.isArray(item?.content)) {
        for (const content of item.content) {
          if (typeof content?.text === 'string') {
            parts.push(content.text)
          }
        }
      }
    }

    return parts.join('\n').trim()
  }

  return ''
}


function getLengthRule(chapterLengthLabel: string) {
  const normalized = chapterLengthLabel.toLowerCase()

  if (normalized.includes('ngắn') || normalized.includes('short')) {
    return {
      label: chapterLengthLabel,
      readerLength: 'khoảng 1.800–2.500 ký tự cho riêng phần BẢN ĐỌC CHO ĐỘC GIẢ',
      maxOutputTokens: 4800,
    }
  }

  if (normalized.includes('dài') || normalized.includes('long')) {
    return {
      label: chapterLengthLabel,
      readerLength: 'khoảng 3.500–4.500 ký tự cho riêng phần BẢN ĐỌC CHO ĐỘC GIẢ',
      maxOutputTokens: 9000,
    }
  }

  return {
    label: chapterLengthLabel,
    readerLength: 'khoảng 2.500–3.500 ký tự cho riêng phần BẢN ĐỌC CHO ĐỘC GIẢ',
    maxOutputTokens: 7200,
  }
}



function getModuleInstruction(moduleId?: string) {
  const normalized = safeText(moduleId).toLowerCase()

  if (
    normalized.includes('female-urban-viral') ||
    normalized.includes('nữ tần') ||
    normalized.includes('nu-tan')
  ) {
    return `
Công thức module: Nữ tần đô thị viral Trung Quốc.

Bối cảnh bắt buộc:
- Trung Quốc hiện đại.
- Có thể dùng Weibo, Douyin, hot search, Thượng Hải/Bắc Kinh/Thâm Quyến, khách sạn 5 sao, tập đoàn, hội đồng quản trị, luật sư, hợp đồng, cổ phần, RMB/tệ.
- Không dùng vibe Việt Nam, không dùng tên Việt.
- Tên nhân vật nên theo Trung Quốc hiện đại.

Vibe truyện:
- Nữ chính bị sỉ nhục/ép im lặng nhưng giữ được tự trọng.
- Phản diện có quyền lực gia tộc/công ty/truyền thông.
- Trả thù bằng bằng chứng, hợp đồng, truyền thông, pháp lý, cổ phần, nhân chứng.
- Không để nữ chính khóc lóc yếu đuối quá lâu.
- Không để nữ chính thắng sạch quá sớm.

Cấu trúc chương:
1. Mở bằng một cú sốc/hot search/cảnh ép ký/cảnh bị sỉ nhục.
2. Đẩy áp lực bằng đối thoại trực diện.
3. Nữ chính phản đòn một nhịp nhỏ nhưng chưa tung hết bài.
4. Cuối chương xuất hiện bằng chứng mới, người mới, hoặc tin nhắn lạ làm cliffhanger.

Yêu cầu scene density:
- Phải có ít nhất một cảnh chính dài, không chỉ kể lướt.
- Cảnh chính nên có 4–8 lượt đối thoại qua lại.
- Mỗi lượt đối thoại phải làm xung đột tăng lên.
`.trim()
  }

  return `
Công thức module: truyện drama nữ tần hiện đại.

Đặc trưng bắt buộc:
- Nữ chính là trung tâm.
- Xung đột rõ, cảm xúc mạnh, có cú móc cuối chương.
- Bằng chứng và payoff phải được cài từng lớp.
`.trim()
}


function buildStoryContext(payload: GeneratePayload) {
  const memory = safeText(payload.storyMemory, '')

  const recentChapters = Array.isArray(payload.recentChapters)
    ? payload.recentChapters.slice(0, 3)
    : []

  const chapterText = recentChapters
    .map((chapter, index) => {
      const title = safeText(chapter.title, `Chương gần nhất ${index + 1}`)
      const summary = safeText(chapter.summary, '')
      const content = safeText(chapter.content, '')

      const compactContent = content.length > 1800 ? `${content.slice(0, 1800)}...` : content

      return `
CHƯƠNG THAM CHIẾU ${index + 1}: ${title}
Tóm tắt: ${summary || 'Không có tóm tắt riêng.'}
Nội dung rút gọn:
${compactContent || 'Không có nội dung.'}
`.trim()
    })
    .join('\n\n')

  if (!memory && !chapterText) {
    return `
STORY CONTEXT:
- Chưa có dữ liệu chương trước.
- Nếu đang viết chương 1, hãy mở truyện thật mạnh.
- Nếu không chắc thứ tự chương, không tự bịa rằng đã có sự kiện trước đó.
`.trim()
  }

  return `
STORY CONTEXT:
${memory ? `Memory đã lưu:\n${memory}` : 'Memory đã lưu: chưa có.'}

${chapterText ? `Các chương gần nhất:\n${chapterText}` : 'Các chương gần nhất: chưa có.'}

Quy tắc dùng context:
- Phải nối logic với các chương gần nhất.
- Không reset quan hệ nhân vật.
- Không làm mất bằng chứng/payoff đã cài.
- Không lặp lại y nguyên cảnh đã viết.
- Nếu viết chương tiếp theo, hãy đẩy xung đột tiến thêm một nấc.
`.trim()
}


function buildCommonPrompt(payload: Required<GeneratePayload>) {
  const lengthRule = getLengthRule(payload.chapterLengthLabel)
  const moduleInstruction = getModuleInstruction(payload.moduleId)
  const storyContext = buildStoryContext(payload)
  return `
Bạn là Master Story Engine v2.4 chuyên viết truyện ngắn nữ tần đô thị viral cho độc giả Việt.

Nhiệm vụ của bạn:
- Viết bằng tiếng Việt tự nhiên, dễ đọc, giàu drama.
- Giữ giọng truyện ngôi thứ nhất "tôi" khi viết chương.
- Tạo cảm giác như truyện web novel đăng thật, không phải bản dịch máy, không phải phân tích khô.
- Không nhắc rằng bạn là AI.
- Không giải thích ngoài output.
- Không đạo văn.

THÔNG TIN TRUYỆN:
- Tên truyện: ${payload.title}
- Ý tưởng/prompt: ${payload.promptIdea || payload.storySummary}
- Tóm tắt truyện hiện có: ${payload.storySummary || 'Chưa có tóm tắt riêng.'}
- Thể loại: ${payload.genreLabel}
- Module: ${payload.moduleId}
- Kiểu nữ chính: ${payload.mainCharacterStyleLabel}
- Độ dài được chọn: ${payload.chapterLengthLabel}
- Kiểu kết chương: ${payload.cliffhangerLabel}
- Mức uất ức: ${payload.humiliationLevel}/5
- Mức trả thù: ${payload.revengeIntensity}/5

EVIDENCE PACING RULE:
- Không được để nữ chính nói ra toàn bộ bằng chứng trong một chương.
- Nếu có phụ lục chuyển nhượng/cổ phần/sao kê/video/hóa đơn, chỉ chọn tối đa 2 thứ để hé trong chương này.
- Bằng chứng nên chia tầng:
  Tier 1: ảnh hot search / tin đồn / hóa đơn / tin nhắn.
  Tier 2: hợp đồng / phụ lục / camera / metadata.
  Tier 3: sao kê / chuyển tiền / nhân chứng / ghi âm.
  Tier 4: video hoàn chỉnh / hồ sơ pháp lý đầy đủ / đòn kết liễu.
- Chương đầu hoặc chương giữa chỉ nên dùng Tier 1–2.
- Tier 3–4 phải giữ cho các chương sau hoặc final payoff.
- Khi nữ chính phản đòn, cô chỉ cho đối phương thấy "một góc bằng chứng", không đọc hết số tài khoản, không xả hết tỷ lệ cổ phần, không công bố toàn bộ sao kê.
${moduleInstruction}
${storyContext}

QUY TẮC CHẤT LƯỢNG BẮT BUỘC:
- Bắt buộc đặt tên riêng rõ ràng cho ít nhất 3 nhân vật quan trọng.
- Nếu có chồng/nam phản diện, phải có tên riêng.
- Nếu có người phụ nữ thứ ba, phải có tên riêng.
- Không dùng đại từ "anh", "cô ta", "bà ấy" quá lâu mà không nhắc lại tên.
- Bắt buộc có ít nhất 1 chi tiết đô thị Trung Quốc: Weibo hot search hashtag, tập đoàn, cổ phần, hợp đồng, pháp vụ, hội đồng quản trị, RMB/tệ.
- Nếu nhắc hot search, hãy viết hashtag cụ thể, ví dụ: #TổngGiámĐốcLụcThịNgoạiTình#.
- Nếu mức trả thù từ 4/5 trở lên, chương phải có ít nhất 1 cú phản công nhỏ của nữ chính.
- Nếu mức uất ức từ 4/5 trở lên, chương phải có một cảnh nữ chính bị ép, bị sỉ nhục hoặc bị cô lập rõ ràng.
- Tránh câu mơ hồ, sai nghĩa hoặc dịch máy như "bôi trơn mọi thứ".
- Văn phải tự nhiên như truyện đăng cho độc giả Việt.
- Câu văn ưu tiên ngắn, sắc, nhiều tension.
- Đối thoại phải có lực, không sáo rỗng.
- Không để nữ chính thắng quá dễ.
- Không tung hết bằng chứng ngay.
- Không dùng bullet trong phần truyện đọc cho độc giả.
- KHÔNG viết kiểu tóm tắt ý tưởng. Phải viết thành cảnh truyện có hành động, đối thoại, phản ứng, nhịp cảm xúc.
- Mỗi chương phải có ít nhất 1 cảnh va chạm chính được kéo đủ lâu bằng đối thoại trực diện.
- Không nhảy cảnh quá nhanh. Nếu có nhiều sự kiện, chọn 1 cảnh trọng tâm để đào sâu.
- Không dùng câu sáo/rỗng/sai nghĩa kiểu: "một bức ảnh bôi trơn mọi thứ", "ảnh hot search cứ xoay và chịu", "gom từng mảnh bình tĩnh".
- Ưu tiên câu văn rõ, lạnh, sắc, có hình ảnh cụ thể.
- Nữ chính không được toàn năng quá sớm. Cô có thể giữ bài, nhưng không được biết hoặc công bố tất cả bằng chứng ngay chương đầu.
- Evidence pacing bắt buộc: mỗi chương chỉ hé 1–2 mảnh bằng chứng chính, không xả toàn bộ video/sao kê/hợp đồng/số tài khoản cùng lúc.
- Nếu là chương mở đầu, chỉ được hé một phần bằng chứng đủ gây sợ, phần còn lại phải che lại để giữ payoff.
- Cảnh phản công phải có giới hạn: nữ chính thắng một nhịp nhỏ, chưa toàn thắng.
- Đối thoại phải có lực ép: phản diện đe dọa, gaslight, ép ký, ép im lặng; nữ chính đáp ngắn, lạnh, sắc.

QUY TẮC ĐỘ DÀI:
- Nếu độ dài là "Ngắn", phần BẢN ĐỌC CHO ĐỘC GIẢ khoảng 1.800–2.500 ký tự.
- Nếu độ dài là "Vừa", phần BẢN ĐỌC CHO ĐỘC GIẢ khoảng 2.500–3.500 ký tự.
- Nếu độ dài là "Dài", phần BẢN ĐỌC CHO ĐỘC GIẢ khoảng 3.500–4.500 ký tự.
- Không tính phần kỹ thuật vào độ dài chương.
- Độ dài mục tiêu hiện tại: ${lengthRule.readerLength}.

QUY TẮC PACING:
- 0–25% chương: mở bằng biến cố hoặc áp lực trực diện.
- 25–55% chương: phản diện/gia đình/công ty/dư luận ép nữ chính.
- 55–80% chương: nữ chính phát hiện hoặc giữ một bằng chứng.
- 80–100% chương: có cú móc đúng kiểu "${payload.cliffhangerLabel}".
- Nếu trả thù cao, cho nữ chính phản công nhỏ nhưng chưa kết liễu.
- Nếu uất ức cao, tăng cảm giác bị ép trước khi phản công.
`.trim()
}

function buildStoryPlanPrompt(payload: Required<GeneratePayload>) {
  const common = buildCommonPrompt(payload)

  return `
${common}

NHIỆM VỤ: Tạo dàn ý truyện.

Output bắt buộc theo đúng format dưới đây:

# STORY PLAN

## Tên truyện
[Đề xuất tên truyện viral. Có thể dùng tên đã có nếu phù hợp.]

## Logline
[1–2 câu móc đọc.]

## Bối cảnh
[Bối cảnh Trung Quốc hiện đại, thành phố, tập đoàn/hào môn, thời gian, tiền tệ, nền tảng dư luận.]

## Nhân vật chính
- Nữ chính:
- Nam phản diện/chồng/chồng cũ:
- Người phụ nữ thứ ba/phản diện phụ:
- Đồng minh hoặc nhân vật nắm bằng chứng:

## Mâu thuẫn cốt lõi
[Danh dự, tiền, cổ phần, hợp đồng, phản bội, gia tộc, dư luận.]

## Revenge Weapon
[Những vũ khí trả thù: video, ghi âm, hợp đồng, pháp vụ, cổ phần, hot search, nhân chứng.]

## Evidence Pacing
- Giai đoạn 1:
- Giai đoạn 2:
- Giai đoạn 3:
- Giai đoạn 4:

## Outline 10 chương
Chương 1: [Opening shock + cliffhanger]
Chương 2: [Áp lực tăng]
Chương 3: [Bằng chứng phụ]
Chương 4: [Phản diện phản công]
Chương 5: [Vả mặt công khai lần 1]
Chương 6: [Cổ phần/hợp đồng/pháp vụ đảo chiều]
Chương 7: [Bí mật lớn lộ một nửa]
Chương 8: [Hot search bùng nổ]
Chương 9: [Final trap]
Chương 10: [Payoff lớn]

## Ghi chú viral
- Hook chính:
- Hashtag hot search:
- Cảnh vả mặt nên có:
- Cú twist giữ lại:
`.trim()
}

function buildChapterPrompt(payload: Required<GeneratePayload>) {
  const common = buildCommonPrompt(payload)
  const lengthRule = getLengthRule(payload.chapterLengthLabel)
  return `
${common}

NHIỆM VỤ: Viết một chương truyện hoàn chỉnh để đăng cho độc giả.

OUTPUT BẮT BUỘC:
- Phải có đúng 2 phần:
  1. # BẢN ĐỌC CHO ĐỘC GIẢ
  2. # BẢN PHÂN TÍCH KỸ THUẬT / KHÔNG ĐĂNG
- Hai phần cách nhau bằng dòng "---".
- Phần "# BẢN ĐỌC CHO ĐỘC GIẢ" là phần duy nhất được đăng cho độc giả.
- Phần "# BẢN PHÂN TÍCH KỸ THUẬT / KHÔNG ĐĂNG" chỉ để admin debug/lưu memory.
- Tuyệt đối không đưa nhãn kỹ thuật, tracker, checklist vào BẢN ĐỌC CHO ĐỘC GIẢ.
- BẢN ĐỌC CHO ĐỘC GIẢ phải đọc như một chương truyện hoàn chỉnh.
- BẢN ĐỌC CHO ĐỘC GIẢ không được dùng bullet/list.

FORMAT PHẦN ĐỌC:
# BẢN ĐỌC CHO ĐỘC GIẢ

# Chương — [tên chương hấp dẫn, ngắn, có hook]

[Viết nội dung chương bằng văn xuôi liên tục.]

YÊU CẦU CHƯƠNG:
- Có ít nhất 3 tên riêng rõ ràng.
- Có ít nhất 1 cảnh đối đầu hoặc bị ép trực diện.
- Có ít nhất 1 chi tiết thuộc hệ đô thị Trung Quốc: Weibo, hot search, hợp đồng, cổ phần, pháp vụ, RMB/tệ, tập đoàn, khách sạn 5 sao, hội đồng quản trị.
- Có ít nhất 1 câu thoại sắc.
- Cuối chương phải móc đọc tiếp theo kiểu: ${payload.cliffhangerLabel || 'bằng chứng mới xuất hiện'}.
- Không kết thúc nhạt.
- Không dùng câu vô nghĩa/sai nghĩa.
- Không viết kiểu tóm tắt ý tưởng.
- Không xả hết bằng chứng trong một chương.
CẤM CÂU VĂN LỖI / VĂN AI:
- Không viết: "Một bức ảnh bôi trơn mọi thứ."
- Không viết: "Ảnh trên hot search cứ xoay và chịu."
- Không viết: "Tôi gom từng mảnh bình tĩnh."
- Không viết các câu mơ hồ không rõ hành động.

Thay bằng kiểu:
- "Một bức ảnh đủ để kéo mọi thứ xuống bùn."
- "Bức ảnh bị chia sẻ lại, phóng to, cắt ghép, rồi đóng đinh tôi vào vị trí kẻ thua cuộc."
- "Tôi đặt điện thoại xuống, ép mình nhìn thẳng vào bản cam kết trước mặt."

CHAPTER QUALITY TARGET:
- Độ dài mục tiêu: ${lengthRule.readerLength}
- Tăng đối thoại va chạm.
- Giữ bối cảnh Trung Quốc hiện đại.
- Nữ chính lạnh, sắc, không khóc lóc, nhưng chưa toàn thắng.
- Nếu có cảnh hội đồng/quản trị/pháp vụ, phải có đối thoại ép ký, đe dọa kiện, và phản đòn ngắn sắc của nữ chính.
- Cuối chương phải có cliffhanger đúng loại: ${payload.cliffhangerLabel || 'bằng chứng mới xuất hiện'}.

Sau phần đọc, thêm dòng "---", rồi viết phần kỹ thuật theo mẫu đã yêu cầu.

---

# BẢN PHÂN TÍCH KỸ THUẬT / KHÔNG ĐĂNG

=== STORY PROGRESS CHECK ===
- Nhân vật chính:
- Phản diện:
- Tình huống:
- Mục tiêu chương:

=== STORY MEMORY ===
- Sự kiện đã xảy ra:
- Bằng chứng đã hé:
- Quan hệ nhân vật:
- Thứ chưa được tiết lộ:

=== SETTING CONTINUITY CHECK ===
- Thời gian:
- Địa điểm:
- Bối cảnh xã hội/công ty:
- Tiền tệ/quyền lực/liên quan pháp lý:

=== SUPPORT CHARACTER CHECK ===
- Nhân vật phụ xuất hiện:
- Vai trò:
- Có lấn át nữ chính không:
- Có cần giữ lại cho payoff sau không:

=== REVEAL LOAD CHECK ===
- Chương này đã hé bao nhiêu bằng chứng:
- Có hé quá nhiều không:
- Bằng chứng nào phải giữ lại:
- Payoff nào chưa được dùng:

=== PAYOFF SETUP TRACKER ===
- Setup đã cài:
- Payoff tương lai:
- Chi tiết nên nhớ:

=== EVIDENCE PACING TRACKER ===
- Bằng chứng hiện có:
- Bằng chứng chưa khai thác:
- Không được tung sớm:

=== CONFLICT ESCALATION LEDGER ===
- Áp lực dư luận:
- Áp lực gia đình/công ty:
- Phản công của nữ chính:
- Hướng chương sau:

Lưu ý:
- Không dùng tiếng Anh lẫn trong phần kỹ thuật, ví dụ không viết "or", phải viết "hoặc".
- Phần kỹ thuật này chỉ để admin debug, không đăng cho độc giả.
`.trim()
}

function buildPrompt(payload: GeneratePayload) {
  const normalizedPayload: Required<GeneratePayload> = {
    mode: payload.mode === 'story-plan' ? 'story-plan' : 'chapter',
    moduleId: safeText(payload.moduleId, 'female-urban-viral'),
    title: safeText(payload.title, 'Sau Khi Bị Phản Bội, Tôi Khiến Cả Nhà Họ Quỳ Xin Lỗi'),
    storySummary: safeText(payload.storySummary, ''),
    promptIdea: safeText(payload.promptIdea, 'Một nữ chính bị phản bội và bắt đầu phản công.'),
    genreLabel: safeText(payload.genreLabel, 'Hôn nhân phản bội / ngoại tình'),
    mainCharacterStyleLabel: safeText(payload.mainCharacterStyleLabel, 'Nhẫn nhịn rồi phản công'),
    chapterLengthLabel: safeText(payload.chapterLengthLabel, 'Vừa 2.500–3.500 ký tự'),
    cliffhangerLabel: safeText(payload.cliffhangerLabel, 'Bằng chứng mới xuất hiện'),
    humiliationLevel: safeNumber(payload.humiliationLevel, 3),
    revengeIntensity: safeNumber(payload.revengeIntensity, 3),
    storyMemory: safeText(payload.storyMemory, ''),
    recentChapters: Array.isArray(payload.recentChapters) ? payload.recentChapters : [],
  }

  if (normalizedPayload.mode === 'story-plan') {
    return {
      prompt: buildStoryPlanPrompt(normalizedPayload),
      maxOutputTokens: 4200,
    }
  }

  return {
    prompt: buildChapterPrompt(normalizedPayload),
    maxOutputTokens: getLengthRule(normalizedPayload.chapterLengthLabel).maxOutputTokens,
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    })
  }

  if (process.env.ENABLE_REAL_AI !== 'true') {
    return res.status(403).json({
      error: 'Real AI is disabled. Set ENABLE_REAL_AI=true on server.',
    })
  }

  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || 'gpt-5-mini'

  if (!apiKey) {
    return res.status(500).json({
      error: 'Missing OPENAI_API_KEY on server.',
    })
  }

  try {
    const payload = (req.body || {}) as GeneratePayload
    const { prompt, maxOutputTokens } = buildPrompt(payload)

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: prompt,
        max_output_tokens: maxOutputTokens,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'OpenAI request failed.',
        raw: data,
      })
    }

    const text = getOutputText(data)

    if (!text) {
      return res.status(500).json({
        error: 'OpenAI returned empty text.',
        raw: data,
      })
    }

    return res.status(200).json({
      text,
      provider: 'openai',
      model,
    })
  } catch (error: any) {
    return res.status(500).json({
      error: String(error?.message ?? error),
    })
  }
}