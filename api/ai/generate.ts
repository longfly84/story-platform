type GenerateMode = 'chapter' | 'story-plan'
type ModelKey = 'economy' | 'premium' | 'auto'
type LegacyModelTier = 'draft' | 'premium' | 'auto'

type GeneratePayload = {
  mode?: GenerateMode
  modelKey?: ModelKey
  modelTier?: LegacyModelTier
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
  nextChapterNumber?: number
  storyMemory?: string
  recentChapters?: Array<{
    title?: string
    summary?: string
    content?: string
  }>
}

type NormalizedGeneratePayload = {
  mode: GenerateMode
  modelKey: ModelKey
  moduleId: string
  title: string
  storySummary: string
  promptIdea: string
  genreLabel: string
  mainCharacterStyleLabel: string
  chapterLengthLabel: string
  cliffhangerLabel: string
  humiliationLevel: number
  revengeIntensity: number
  nextChapterNumber: number
  storyMemory: string
  recentChapters: Array<{
    title?: string
    summary?: string
    content?: string
  }>
}

function safeText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function safeNumber(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }

  return fallback
}

function normalizeModelKey(body: GeneratePayload): ModelKey {
  if (body.modelKey === 'premium' || body.modelKey === 'auto' || body.modelKey === 'economy') {
    return body.modelKey
  }

  // Tương thích ngược nếu frontend cũ còn gửi modelTier.
  if (body.modelTier === 'premium') return 'premium'
  if (body.modelTier === 'auto') return 'auto'

  return 'economy'
}

function normalizePayload(body: GeneratePayload): NormalizedGeneratePayload {
  return {
    mode: body.mode === 'story-plan' ? 'story-plan' : 'chapter',
    modelKey: normalizeModelKey(body),
    moduleId: safeText(body.moduleId, 'female-urban-viral'),
    title: safeText(body.title, 'Truyện mới từ AI Writer'),
    storySummary: safeText(body.storySummary, ''),
    promptIdea: safeText(body.promptIdea, ''),
    genreLabel: safeText(body.genreLabel, 'Hôn nhân phản bội / ngoại tình'),
    mainCharacterStyleLabel: safeText(body.mainCharacterStyleLabel, 'Nhẫn nhịn rồi phản công'),
    chapterLengthLabel: safeText(body.chapterLengthLabel, 'Vừa 2.500–3.500 ký tự'),
    cliffhangerLabel: safeText(body.cliffhangerLabel, 'Bằng chứng mới xuất hiện'),
    humiliationLevel: safeNumber(body.humiliationLevel, 3),
    revengeIntensity: safeNumber(body.revengeIntensity, 3),
    nextChapterNumber: Math.max(1, Math.floor(safeNumber(body.nextChapterNumber, 1))),
    storyMemory: safeText(body.storyMemory, ''),
    recentChapters: Array.isArray(body.recentChapters) ? body.recentChapters : [],
  }
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

  if (
    normalized.includes('ngắn') ||
    normalized.includes('short') ||
    normalized.includes('1.800') ||
    normalized.includes('1800')
  ) {
    return {
      label: chapterLengthLabel,
      readerLength: 'khoảng 1.800–2.500 ký tự cho riêng phần BẢN ĐỌC CHO ĐỘC GIẢ',
      maxOutputTokens: 5200,
    }
  }

  if (
    normalized.includes('dài') ||
    normalized.includes('long') ||
    normalized.includes('3.500') ||
    normalized.includes('3500') ||
    normalized.includes('4.500') ||
    normalized.includes('4500')
  ) {
    return {
      label: chapterLengthLabel,
      readerLength: 'khoảng 3.500–4.500 ký tự cho riêng phần BẢN ĐỌC CHO ĐỘC GIẢ',
      maxOutputTokens: 9600,
    }
  }

  return {
    label: chapterLengthLabel,
    readerLength: 'khoảng 2.500–3.500 ký tự cho riêng phần BẢN ĐỌC CHO ĐỘC GIẢ',
    maxOutputTokens: 7600,
  }
}

function getTextModel(payload: NormalizedGeneratePayload) {
  const economyModel =
    process.env.OPENAI_MODEL_ECONOMY ||
    process.env.OPENAI_MODEL_DRAFT ||
    process.env.OPENAI_MODEL ||
    'gpt-4.1-mini'

  const premiumModel =
    process.env.OPENAI_MODEL_PREMIUM ||
    process.env.OPENAI_MODEL_HIGH ||
    process.env.OPENAI_MODEL ||
    'gpt-4.1-mini'

  if (payload.modelKey === 'premium') {
    return premiumModel
  }

  if (payload.modelKey === 'auto') {
    const shouldUsePremium =
      payload.nextChapterNumber === 1 ||
      payload.humiliationLevel >= 4 ||
      payload.revengeIntensity >= 4 ||
      payload.cliffhangerLabel.toLowerCase().includes('cao trào') ||
      payload.cliffhangerLabel.toLowerCase().includes('final') ||
      payload.cliffhangerLabel.toLowerCase().includes('kết')

    return shouldUsePremium ? premiumModel : economyModel
  }

  return economyModel
}

function getModuleInstruction(moduleId?: string) {
  const normalized = safeText(moduleId).toLowerCase()

  if (
    normalized.includes('female-urban-viral') ||
    normalized.includes('nữ tần') ||
    normalized.includes('nu-tan')
  ) {
    return `
CÔNG THỨC MODULE: Nữ tần đô thị viral Trung Quốc.

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
4. Cuối chương xuất hiện bằng chứng mới, đòn truyền thông mới, người mới, hoặc tin nhắn lạ làm cliffhanger.

Scene density:
- Phải có ít nhất một cảnh chính dài, không chỉ kể lướt.
- Cảnh chính nên có 4–8 lượt đối thoại qua lại.
- Mỗi lượt đối thoại phải làm xung đột tăng lên.
`.trim()
  }

  return `
CÔNG THỨC MODULE: Truyện drama nữ tần hiện đại.

Đặc trưng bắt buộc:
- Nữ chính là trung tâm.
- Xung đột rõ, cảm xúc mạnh, có cú móc cuối chương.
- Bằng chứng và payoff phải được cài từng lớp.
`.trim()
}

function buildStoryContext(payload: NormalizedGeneratePayload) {
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

function getTechnicalReportInstruction() {
  return `
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

function buildStoryPlanPrompt(payload: NormalizedGeneratePayload) {
  const moduleInstruction = getModuleInstruction(payload.moduleId)

  return `
Bạn là Master Story Engine v2.6 chuyên thiết kế truyện nữ tần đô thị viral cho độc giả Việt.

NHIỆM VỤ:
Tạo dàn ý truyện có thể dùng để viết thành web novel nhiều chương.

THÔNG TIN ĐẦU VÀO:
- Tên truyện/ý tưởng: ${payload.title}
- Prompt idea: ${payload.promptIdea || 'Chưa có prompt riêng.'}
- Tóm tắt hiện có: ${payload.storySummary || 'Chưa có tóm tắt.'}
- Thể loại: ${payload.genreLabel}
- Module: ${payload.moduleId}
- Kiểu nữ chính: ${payload.mainCharacterStyleLabel}
- Độ dài chương mục tiêu: ${payload.chapterLengthLabel}
- Kiểu kết chương ưu tiên: ${payload.cliffhangerLabel}
- Mức uất ức: ${payload.humiliationLevel}/5
- Mức trả thù: ${payload.revengeIntensity}/5

${moduleInstruction}

YÊU CẦU:
- Dàn ý phải đủ rõ để viết được nhiều chương liên tục.
- Không viết như tóm tắt máy móc.
- Nhân vật phải có tên riêng rõ.
- Bằng chứng phải được chia tầng, không dồn hết vào chương 1.
- Phải có hook thương mại/đô thị/truyền thông nếu dùng module nữ tần đô thị.

OUTPUT BẮT BUỘC:
# STORY PLAN

## Tên truyện
[Đề xuất tên truyện viral]

## Công thức viết
[Nêu công thức/vibe chính]

## Thể loại
[Nêu thể loại]

## Bối cảnh
[Nêu bối cảnh rõ ràng]

## Ý tưởng chính
[Viết 1 đoạn hook mạnh]

## Tóm tắt
[Viết 3–4 dòng mô tả truyện có thể dùng công khai]

## Nhân vật
- Nữ chính:
- Nam phản diện:
- Người thứ ba:
- Gia tộc/công ty:
- Nhân vật hỗ trợ:

## Mâu thuẫn cốt lõi
[Nêu mâu thuẫn chính]

## Revenge Weapon
[Nêu vũ khí trả thù: bằng chứng, hợp đồng, pháp vụ, cổ phần, truyền thông]

## Evidence Pacing
[Chia tầng bằng chứng]

## Outline 10 chương
Chương 1:
Chương 2:
Chương 3:
Chương 4:
Chương 5:
Chương 6:
Chương 7:
Chương 8:
Chương 9:
Chương 10:

## Cover Prompt Seed
[Tóm tắt hình ảnh bìa truyện nên vẽ]
`.trim()
}

function buildChapterPrompt(payload: NormalizedGeneratePayload) {
  const lengthRule = getLengthRule(payload.chapterLengthLabel)
  const moduleInstruction = getModuleInstruction(payload.moduleId)
  const storyContext = buildStoryContext(payload)
  const technicalReport = getTechnicalReportInstruction()

  const nextChapterNumber = Math.max(1, Math.floor(payload.nextChapterNumber || 1))
  const isContinuation = nextChapterNumber > 1

  return `
Bạn là Master Story Engine v2.6 chuyên viết truyện nữ tần đô thị viral cho độc giả Việt.

Nhiệm vụ của bạn:
- Viết bằng tiếng Việt tự nhiên, dễ đọc, giàu drama.
- Giữ giọng truyện ngôi thứ nhất "tôi" khi viết chương.
- Tạo cảm giác như truyện web novel do người thật sáng tác, không phải bản dịch máy, không phải phân tích khô.
- Không nhắc rằng bạn là AI.
- Không giải thích ngoài output.
- Không đạo văn.

THÔNG TIN TRUYỆN:
- Tên truyện: ${payload.title}
- Ý tưởng/prompt: ${payload.promptIdea || payload.storySummary || 'Chưa có ý tưởng riêng.'}
- Tóm tắt truyện hiện có: ${payload.storySummary || 'Chưa có tóm tắt riêng.'}
- Thể loại: ${payload.genreLabel}
- Module: ${payload.moduleId}
- Kiểu nữ chính: ${payload.mainCharacterStyleLabel}
- Độ dài được chọn: ${payload.chapterLengthLabel}
- Kiểu kết chương: ${payload.cliffhangerLabel}
- Mức uất ức: ${payload.humiliationLevel}/5
- Mức trả thù: ${payload.revengeIntensity}/5

${moduleInstruction}

${storyContext}

CHAPTER CONTINUATION RULE:
- Số chương cần viết: Chương ${nextChapterNumber}.
- ${
    isContinuation
      ? 'Đây là chương tiếp theo của truyện đã có chương trước. Tuyệt đối không viết lại chương 1, không mở truyện lại từ đầu, không reset quan hệ nhân vật, không đổi tên nhân vật chính/phản diện.'
      : 'Đây là chương mở đầu. Có thể mở bằng cú sốc mạnh, nhưng vẫn phải giữ evidence pacing.'
  }
- Nếu là chương tiếp theo, đoạn mở đầu phải nối từ sự kiện/hook/bằng chứng ở chương gần nhất.
- Không tự tạo lại một vụ hot search mở đầu mới nếu chương trước đã có hook cụ thể, trừ khi đó là hệ quả trực tiếp của chương trước.
- Tiêu đề chương bắt buộc dùng dạng: "# Chương ${nextChapterNumber} — [tên chương ngắn, có hook]".

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

CHARACTER CONSISTENCY RULE:
- Nếu STORY CONTEXT hoặc chương tham chiếu đã có tên nhân vật, bắt buộc giữ nguyên tên đó.
- Không đổi họ/tên nữ chính, nam phản diện, người thứ ba, mẹ chồng/bà nội chồng giữa các chương.
- Nếu chưa có tên nhân vật rõ trong context, tự tạo tên Trung Quốc hiện đại nhưng phải tránh để nữ chính cùng họ với chồng nếu không có lý do.
- Nếu nam phản diện họ Lục, không đặt nữ chính họ Lục. Ưu tiên tên nữ chính như: Lâm An Nhiên, Giang Vãn, Tô Mạn, Hứa Nhược.
- Không dùng lẫn "mẹ chồng" và "bà nội chồng" cho cùng một nhân vật.
- Nếu là mẹ chồng, gọi thống nhất là "Lục phu nhân" hoặc "mẹ chồng tôi".
- Nếu là bà nội chồng, gọi thống nhất là "Lục lão phu nhân".
- Trong một chương, chỉ chọn một vai gây áp lực chính nếu không có lý do rõ ràng để cả hai cùng xuất hiện.

SETTING LANGUAGE RULE:
- Khi viết về Weibo, không được dùng từ "tweet".
- Weibo phải gọi là "bài đăng Weibo", "hot search", "hashtag", "bình luận", "lượt chia sẻ", "tài khoản marketing", hoặc "bài bóc phốt".
- Không dùng thuật ngữ Twitter/X trong bối cảnh Weibo.
- Không dùng từ nền tảng sai bối cảnh.

NARRATIVE CRAFT RULE:
- Mỗi đoạn văn phải làm ít nhất một việc: đẩy cốt truyện, tăng áp lực, bộc lộ cảm xúc, cài bằng chứng, trả payoff, hoặc mở hook.
- Nếu một đoạn chỉ giải thích chung chung mà không có hành động/cảm xúc/thông tin mới, phải tự bỏ hoặc viết lại thành cảnh.
- Không kể lướt quá nhiều sự kiện. Hãy chọn một cảnh trọng tâm để đào sâu.
- Ưu tiên hành động cụ thể, vật chứng cụ thể, ánh mắt, tiếng chuông điện thoại, màn hình Weibo, bản hợp đồng, chữ ký, dấu đỏ, phòng họp, camera, luật sư, PR.
- Nữ chính thông minh nhưng không toàn năng. Cô được thắng một nhịp nhỏ, không được thắng sạch quá sớm.
- Phản diện phải có phản ứng và phản công hợp lý, không đứng yên chịu thua.

CLEAN PROSE RULE:
- BẢN ĐỌC CHO ĐỘC GIẢ không được dùng ngôn ngữ phân tích kỹ thuật như: "phản diện đang phản công", "nữ chính phản đòn", "mục tiêu chương", "payoff", "setup", "evidence pacing", "conflict escalation", "story memory", "mâu thuẫn được đẩy lên cao".
- Những ý kỹ thuật phải được chuyển thành cảnh truyện tự nhiên, bằng hành động/tin nhắn/đối thoại/vật chứng/phản ứng cơ thể.
- Không kết thúc phần đọc bằng câu kiểu phân tích. Kết chương phải là hình ảnh, hành động, tin nhắn, bằng chứng mới, hoặc một câu thoại có hook.
- Khi nữ chính phản đòn, ưu tiên dùng đối thoại ngắn, lạnh, sắc thay vì giải thích chiến thuật.

QUY TẮC CHUYỂN Ý KỸ THUẬT THÀNH CẢNH:
- Nếu muốn nói "phản diện phản công" → hãy viết thành một bài đăng Weibo mới, một cuộc gọi từ PR, một email luật sư, một đoạn chat bị tung ra, hoặc một ánh mắt/câu thoại cho thấy đối phương đã ra tay.
- Nếu muốn nói "nữ chính phản công" → hãy viết thành hành động: cô đặt tài liệu lên bàn, mở một trang phụ lục, gửi một tin nhắn, nhìn thẳng vào đối phương, hoặc nói một câu ngắn khiến cả phòng im lặng.
- Nếu muốn nói "bằng chứng quan trọng" → hãy mô tả vật chứng: ảnh chụp, dấu đỏ, chữ ký, thời gian chuyển khoản, camera khách sạn, metadata, phong bì, email, file bị khóa.
- Nếu muốn nói "mâu thuẫn được đẩy lên cao" → hãy tăng áp lực bằng lời đe dọa, tiếng chuông điện thoại, cổ đông quay sang nhìn, màn hình hot search đổi thứ hạng, hoặc phóng viên chặn cửa.
- Nếu muốn tạo cliffhanger → hãy kết bằng hành động/sự kiện chưa giải quyết, không kết bằng câu phân tích.

HUMAN PROSE RULE:
- Viết như tác giả người thật đang kể chuyện, không viết như máy hoàn thành checklist.
- Câu văn được phép có nhịp dài ngắn khác nhau, nhưng không được rối.
- Không đoạn nào cũng phải quá hoàn hảo. Có thể dùng những chi tiết nhỏ đời thường để cảnh có hơi người: tiếng điều hòa, mùi cà phê nguội, vệt son trên ly, tiếng giày trên sàn, ánh đèn phản vào kính.
- Không gọi thẳng cảm xúc quá nhiều như "tôi đau đớn", "tôi tức giận", "tôi lạnh lùng". Hãy thể hiện bằng hành động: siết điện thoại, đặt bút xuống, nhìn vào dấu đỏ, im lặng lâu hơn một nhịp.
- Đối thoại không được chỉ để giải thích cốt truyện. Mỗi câu thoại phải có ý đồ: ép, né, đe dọa, thử phản ứng, che giấu, châm chọc, hoặc lật thế.
- Nhân vật không được nói quá đúng, quá đủ, quá sạch. Người thật thường nói thiếu một nửa, vòng vo, cắt ngang, hoặc giấu ý.
- Không viết đoạn nào giống bài phân tích đạo đức hoặc tổng kết bài học.

ANTI-AI PATTERN RULE:
- Tránh lặp cấu trúc: "Tôi không... Tôi chỉ..." quá nhiều lần.
- Tránh lặp kiểu câu ba vế liên tục.
- Tránh kết đoạn bằng câu khẳng định quá kêu nhưng rỗng.
- Tránh dùng quá nhiều từ như: bình tĩnh, lạnh lùng, sắc bén, phản công, ván cờ, quân cờ, con dao, cái giá phải trả.
- Nếu dùng hình ảnh ẩn dụ, phải gắn với vật cụ thể trong cảnh, không dùng ẩn dụ chung chung.
- Không để mọi cảnh đều diễn ra theo cùng mô hình: bị ép → nữ chính nói một câu sắc → đối phương im lặng. Hãy thay đổi nhịp: có cảnh nữ chính phải lùi, có cảnh im lặng, có cảnh nhận thêm thông tin, có cảnh bị phản đòn thật.

SELF-REVISION PASS BẮT BUỘC TRƯỚC KHI TRẢ OUTPUT:
Trước khi xuất kết quả cuối cùng, hãy tự đọc lại bản chương như một biên tập viên và tự sửa trong im lặng theo checklist này:
1. Có đúng số chương cần viết không? Nếu là Chương ${nextChapterNumber}, không được ghi nhầm thành chương khác.
2. Có đi lệch khỏi STORY CONTEXT không? Nếu lệch tên nhân vật, quan hệ, bằng chứng, bối cảnh, phải sửa.
3. Có câu nào giống phân tích kỹ thuật trong BẢN ĐỌC không? Nếu có, phải biến thành cảnh.
4. Có từ sai bối cảnh như "tweet Weibo" không? Nếu có, sửa thành "bài đăng Weibo".
5. Có đoạn nào lan man, chỉ giải thích mà không đẩy truyện không? Nếu có, cắt hoặc viết lại.
6. Có xả quá nhiều bằng chứng không? Nếu có, giữ lại tối đa 1–2 mảnh, phần còn lại để chương sau.
7. Kết chương có đủ hook để đọc tiếp không? Nếu chưa, viết lại đoạn cuối.
8. BẢN ĐỌC có đọc như truyện thật không? Nếu còn như outline/tóm tắt, viết lại thành cảnh có hành động và đối thoại.
9. Humanization pass: Nếu đoạn nào quá sạch, quá đều, quá giống checklist, hãy thêm chi tiết cảm giác/vật thể/nhịp im lặng để nó giống người thật viết hơn.
10. Dialogue pass: Nếu thoại chỉ đang giải thích thông tin, hãy sửa thành đối thoại có giằng co, ngắt nhịp, châm chọc, hoặc né tránh.
11. Texture pass: Mỗi cảnh chính phải có ít nhất 2 chi tiết cụ thể có thể nhìn/nghe/chạm được.

QUY TẮC CHẤT LƯỢNG BẮT BUỘC:
- Bắt buộc đặt tên riêng rõ ràng cho ít nhất 3 nhân vật quan trọng.
- Nếu có chồng/nam phản diện, phải có tên riêng.
- Nếu có người phụ nữ thứ ba, phải có tên riêng.
- Không dùng đại từ "anh", "cô ta", "bà ấy" quá lâu mà không nhắc lại tên.
- Bắt buộc có ít nhất 1 chi tiết đô thị Trung Quốc: Weibo hot search hashtag, tập đoàn, cổ phần, hợp đồng, pháp vụ, hội đồng quản trị, RMB/tệ.
- Nếu nhắc hot search, hãy viết hashtag cụ thể, ví dụ: #TổngGiámĐốcLụcThịNgoạiTình#.
- Nếu mức trả thù từ 4/5 trở lên, chương phải có ít nhất 1 cú phản công nhỏ của nữ chính.
- Nếu mức uất ức từ 4/5 trở lên, chương phải có một cảnh nữ chính bị ép, bị sỉ nhục hoặc bị cô lập rõ ràng.
- Văn phải tự nhiên như truyện đăng cho độc giả Việt.
- Câu văn ưu tiên ngắn, sắc, nhiều tension.
- Đối thoại phải có lực, không sáo rỗng.
- Không để nữ chính thắng quá dễ.
- Không dùng bullet trong phần truyện đọc cho độc giả.

CHAPTER QUALITY TARGET:
- Độ dài mục tiêu: ${lengthRule.readerLength}.
- Tăng đối thoại va chạm.
- Giữ bối cảnh đã chọn.
- Nữ chính lạnh, sắc, không khóc lóc, nhưng chưa toàn thắng.
- Nếu có cảnh hội đồng/quản trị/pháp vụ, phải có đối thoại ép ký, đe dọa kiện, và phản đòn ngắn sắc của nữ chính.
- Cuối chương phải có cliffhanger đúng loại: ${payload.cliffhangerLabel || 'bằng chứng mới xuất hiện'}.

NHIỆM VỤ:
Viết một chương truyện hoàn chỉnh để đăng cho độc giả.

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

# Chương ${nextChapterNumber} — [tên chương hấp dẫn, ngắn, có hook]

[Viết nội dung chương bằng văn xuôi liên tục.]

Sau phần đọc, thêm dòng "---", rồi viết phần kỹ thuật theo mẫu sau:

${technicalReport}
`.trim()
}

function buildPrompt(payload: NormalizedGeneratePayload) {
  if (payload.mode === 'story-plan') {
    return buildStoryPlanPrompt(payload)
  }

  return buildChapterPrompt(payload)
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
    const prompt = buildPrompt(payload)
    const lengthRule = getLengthRule(payload.chapterLengthLabel)
    const model = getTextModel(payload)

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: prompt,
        max_output_tokens: lengthRule.maxOutputTokens,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'OpenAI API error',
        detail: data,
      })
    }

    const text = getOutputText(data)

    if (!text) {
      return res.status(500).json({
        error: 'OpenAI returned empty output',
        detail: data,
      })
    }

    return res.status(200).json({
      text,
      model,
      modelKey: payload.modelKey,
      usage: data?.usage || null,
    })
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Unknown generate error',
    })
  }
}