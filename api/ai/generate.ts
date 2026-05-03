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
  avoidStoryTitles?: string[]
  avoidMotifs?: string[]
  avoidCharacterNames?: string[]
  avoidCompanyNames?: string[]
  factoryRunId?: string
  storyIndex?: number
  chapterTarget?: number
}

type NormalizedGeneratePayload = {
  mode: GenerateMode
  modelKey: ModelKey
  nameSeed: string
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
  avoidStoryTitles: string[]
  avoidMotifs: string[]
  avoidCharacterNames: string[]
  avoidCompanyNames: string[]
  factoryRunId: string
  storyIndex: number
  chapterTarget: number
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

function safeStringArray(value: unknown, limit = 30) {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => safeText(item))
    .filter(Boolean)
    .slice(0, limit)
}

function createNameSeed() {
  const cryptoApi = globalThis.crypto

  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function normalizeModelKey(body: GeneratePayload): ModelKey {
  if (body.modelKey === 'premium' || body.modelKey === 'auto' || body.modelKey === 'economy') {
    return body.modelKey
  }

  if (body.modelTier === 'premium') return 'premium'
  if (body.modelTier === 'auto') return 'auto'

  return 'economy'
}

function normalizePayload(body: GeneratePayload): NormalizedGeneratePayload {
  return {
    mode: body.mode === 'story-plan' ? 'story-plan' : 'chapter',
    modelKey: normalizeModelKey(body),
    nameSeed: createNameSeed(),
    moduleId: safeText(body.moduleId, 'female-urban-viral'),
    title: safeText(body.title, 'Truyện mới từ AI Writer'),
    storySummary: safeText(body.storySummary, ''),
    promptIdea: safeText(body.promptIdea, ''),
    genreLabel: safeText(body.genreLabel, 'Hôn nhân phản bội / ngoại tình'),
    mainCharacterStyleLabel: safeText(body.mainCharacterStyleLabel, 'Nhẫn nhịn rồi phản công'),
    chapterLengthLabel: safeText(body.chapterLengthLabel, 'Vừa 2.500–3.500 ký tự'),
    cliffhangerLabel: safeText(body.cliffhangerLabel, 'auto'),
    humiliationLevel: safeNumber(body.humiliationLevel, 3),
    revengeIntensity: safeNumber(body.revengeIntensity, 3),
    nextChapterNumber: Math.max(1, Math.floor(safeNumber(body.nextChapterNumber, 1))),
    storyMemory: safeText(body.storyMemory, ''),
    recentChapters: Array.isArray(body.recentChapters) ? body.recentChapters : [],
    avoidStoryTitles: safeStringArray(body.avoidStoryTitles, 50),
    avoidMotifs: safeStringArray(body.avoidMotifs, 50),
    avoidCharacterNames: safeStringArray(body.avoidCharacterNames, 80),
    avoidCompanyNames: safeStringArray(body.avoidCompanyNames, 50),
    factoryRunId: safeText(body.factoryRunId, ''),
    storyIndex: Math.max(0, Math.floor(safeNumber(body.storyIndex, 0))),
    chapterTarget: Math.max(0, Math.floor(safeNumber(body.chapterTarget, 0))),
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
    const cliffhanger = payload.cliffhangerLabel.toLowerCase()

    const shouldUsePremium =
      payload.nextChapterNumber === 1 ||
      payload.humiliationLevel >= 4 ||
      payload.revengeIntensity >= 4 ||
      cliffhanger.includes('cao trào') ||
      cliffhanger.includes('final') ||
      cliffhanger.includes('kết') ||
      cliffhanger.includes('kết liễu') ||
      cliffhanger.includes('vả mặt công khai') ||
      cliffhanger.includes('pháp lý đảo chiều')

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
1. Mở bằng một cú sốc phù hợp thể loại: cảnh ép ký, bữa tiệc gia tộc, phòng họp, ảnh cũ, hồ sơ bệnh viện, hợp đồng, camera, di vật, hoặc hot search nếu thể loại/ý tưởng có yếu tố truyền thông.
2. Đẩy áp lực bằng đối thoại trực diện.
3. Nữ chính phản đòn một nhịp nhỏ nhưng chưa tung hết bài.
4. Cuối chương xuất hiện phản công, bằng chứng mới, cú đảo chiều, người mới, tin nhắn lạ, hoặc một áp lực mới tùy mạch truyện.

Lưu ý quan trọng:
- Weibo/hot search là một công cụ, không phải mặc định bắt buộc.
- Chỉ dùng hot search làm hook chính nếu thể loại, prompt idea, hoặc ending strategy thật sự cần truyền thông/dư luận.

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
- Bằng chứng và điểm trả sau phải được cài từng lớp.
`.trim()
}

function getGenreInstruction(genreLabel: string) {
  const genre = safeText(genreLabel).toLowerCase()

  if (genre.includes('bạn thân') || genre.includes('tiểu tam')) {
    return `
GENRE LOCK: Bạn thân phản bội / tiểu tam
- Trọng tâm bắt buộc: cú đâm sau lưng từ người nữ chính từng tin tưởng.
- Hook nên xoay quanh: ảnh thân mật, tin nhắn, khách sạn, chuyến du lịch, hôn lễ, hoặc cảnh bắt quả tang.
- Tiểu tam/bạn thân phải biết diễn, biết đổ lỗi, biết lợi dụng dư luận hoặc gia đình nam chính.
- Nữ chính phản công bằng bằng chứng, nhân chứng, camera, ảnh chụp, lịch sử chuyển khoản hoặc ký ức cũ.
- Không biến thành thương chiến thuần túy quá sớm.
`.trim()
  }

  if (genre.includes('bí ẩn') || genre.includes('thân thế')) {
    return `
GENRE LOCK: Bí ẩn gia đình / thân thế
- Trọng tâm bắt buộc: bí mật huyết thống, thân phận thật giả, hồ sơ cũ, người nhà che giấu sự thật.
- Không hé toàn bộ thân thế trong một chương.
- Mỗi chương chỉ hé một mảnh: ảnh cũ, giấy xét nghiệm, hồ sơ bệnh viện, di chúc, di vật, người quen cũ.
- Nữ chính phải điều tra từng lớp, không tự nhiên biết hết.
`.trim()
  }

  if (genre.includes('công sở') || genre.includes('nữ cường') || genre.includes('thương chiến')) {
    return `
GENRE LOCK: Công sở vả mặt / nữ cường thương chiến
- Trọng tâm bắt buộc: năng lực, địa vị, hợp đồng, dự án, phòng họp, PR, pháp vụ, cổ phần, quyền điều hành.
- Nữ chính phải thắng bằng năng lực thật: số liệu, hợp đồng, kế hoạch, bằng chứng, đàm phán, quyền biểu quyết.
- Cảnh chính nên có: họp hội đồng, đàm phán dự án, tranh công, bị vu oan trong công ty, báo cáo bị đánh tráo, hợp đồng bị cướp.
- Đối thoại phải sắc, ngắn, có chiến thuật.
- Không biến thành chuyện tình cảm đơn thuần.
`.trim()
  }

  if (genre.includes('cưới trước') || genre.includes('hợp đồng hôn nhân')) {
    return `
GENRE LOCK: Cưới trước yêu sau / hợp đồng hôn nhân
- Trọng tâm bắt buộc: quan hệ bắt đầu bằng thỏa thuận, hợp đồng, lợi ích gia tộc/công ty, danh phận tạm thời.
- Phải có điều khoản hoặc giới hạn rõ: thời hạn hôn nhân, quyền lợi, nghĩa vụ, không can thiệp đời tư, giữ thể diện, tài sản.
- Không cho tình cảm tiến quá nhanh.
- Xung đột nên đến từ: người cũ, gia đình ép, điều khoản bị phá, thân phận bị nghi ngờ, hợp đồng bị lộ.
`.trim()
  }

  if (genre.includes('đổi tráo') || genre.includes('danh phận')) {
    return `
GENRE LOCK: Đổi tráo danh phận / hào môn
- Trọng tâm bắt buộc: thân phận thật giả, thiên kim giả, người thay thế, danh phận bị cướp, gia tộc nhận nhầm người.
- Không hé thân phận thật quá sớm.
- Mỗi chương chỉ hé một sơ hở: thói quen, di vật, ảnh cũ, xét nghiệm, lời người hầu, hồ sơ bị sửa.
- Nữ chính phải từng bước lấy lại vị trí, không thắng sạch trong một chương.
`.trim()
  }

  if (genre.includes('gia đấu') || genre.includes('mẹ chồng') || genre.includes('nhà chồng')) {
    return `
GENRE LOCK: Gia đấu / mẹ chồng / nhà chồng
- Trọng tâm bắt buộc: áp lực trong nhà chồng, danh phận, thể diện, mẹ chồng, bà nội chồng, chị em dâu, tài sản, con cái.
- Vai vế phải thống nhất. Nếu là mẹ chồng thì gọi "mẹ chồng tôi" hoặc dùng danh xưng theo họ gia tộc đã tạo, ví dụ "phu nhân". Nếu là bà nội chồng thì dùng danh xưng theo họ gia tộc đã tạo, ví dụ "lão phu nhân".
- Cảnh mạnh nên có: bữa cơm gia đình, phòng khách biệt thự, ép ký, xét nét, đổ tội, so sánh, đòi tài sản.
- Không biến thành cãi nhau vô nghĩa; mỗi xung đột phải làm lộ thêm quyền lực, bí mật hoặc lợi ích.
`.trim()
  }

  if (genre.includes('hào môn') || genre.includes('liên hôn') || genre.includes('gia tộc')) {
    return `
GENRE LOCK: Hào môn / liên hôn / gia tộc
- Trọng tâm bắt buộc: quyền lực gia tộc, liên hôn, thể diện, tài sản, cổ phần, danh phận, phu nhân, lão phu nhân.
- Không khí phải sang, lạnh, áp lực, nhiều quy tắc ngầm.
- Cảnh nên có biệt thự, khách sạn 5 sao, sảnh tiệc, phòng họp gia tộc, hoặc hội sở tập đoàn.
- Nữ chính bị ép bởi danh phận nhưng không được hèn yếu.
- Không để tình tiết thành ngoại tình đơn thuần; ngoại tình chỉ là ngòi nổ nếu có.
`.trim()
  }

  if (genre.includes('hôn nhân') && (genre.includes('phản bội') || genre.includes('ngoại tình'))) {
    return `
GENRE LOCK: Hôn nhân phản bội / ngoại tình
- Trọng tâm bắt buộc: lòng tin hôn nhân bị phá vỡ, người thứ ba, ảnh/tin nhắn/khách sạn, gia đình hai bên, thể diện xã hội.
- Hook nên xoay quanh: hot search, ảnh thân mật, phòng khách sạn, cuộc gọi lạnh lùng của chồng, tiểu tam giả vô tội, hoặc gia đình ép nữ chính im lặng.
- Nữ chính được đau nhưng không được khóc lóc quá lâu. Cảm xúc phải biến thành sự tỉnh táo.
- Phản công nên đi bằng bằng chứng: ảnh, hóa đơn, camera, lịch sử đặt phòng, tài sản chung, hợp đồng, luật sư, sao kê, nhân chứng.
- Không xả hết bằng chứng ngay chương đầu.
`.trim()
  }

  if (genre.includes('hot search') || genre.includes('showbiz') || genre.includes('pr scandal')) {
    return `
GENRE LOCK: Hot search / showbiz / PR scandal
- Trọng tâm bắt buộc: dư luận, Weibo, hot search, hashtag, tài khoản marketing, PR khủng hoảng, bình luận mạng.
- Không được dùng từ "tweet". Phải dùng "bài đăng Weibo", "hot search", "hashtag", "lượt chia sẻ", "bình luận", "tài khoản marketing".
- Cảnh mạnh nên có: bài bóc phốt viral, công ty PR họp khẩn, phóng viên chặn cửa, hợp đồng đại diện bị đe dọa, fandom quay xe.
- Nữ chính phản công bằng thời điểm tung bằng chứng, luật sư, truyền thông, người trong cuộc, hoặc một bài đăng đúng lúc.
`.trim()
  }

  if (genre.includes('mẹ con') || genre.includes('gia đình') || genre.includes('bảo vệ con')) {
    return `
GENRE LOCK: Mẹ con / gia đình / bảo vệ con
- Trọng tâm bắt buộc: tình thân, bảo vệ con, quyền nuôi con, áp lực gia đình, bí mật thân thế của con, hoặc sự hy sinh của nữ chính.
- Nữ chính mạnh nhưng không lạnh hoàn toàn. Cần có chiều sâu cảm xúc và trách nhiệm gia đình.
- Nếu có con nhỏ, đứa trẻ phải phục vụ cốt truyện, không làm đạo cụ dễ thương ngẫu nhiên.
- Cảnh mạnh nên có: tranh quyền nuôi con, bệnh viện, trường học, gia đình chồng gây áp lực, dư luận công kích mẹ con.
`.trim()
  }

  if (genre.includes('tái sinh') || genre.includes('làm lại')) {
    return `
GENRE LOCK: Nữ chính tái sinh / làm lại cuộc đời
- Trọng tâm bắt buộc: nữ chính biết trước tương lai hoặc có cơ hội sống lại/sửa sai.
- Không để nữ chính nói thẳng quá nhiều về việc tái sinh cho người khác.
- Nữ chính phải dùng ký ức tương lai để đi trước một bước, nhưng vẫn phải có biến số mới.
- Cảnh mạnh nên có: sự kiện từng xảy ra ở kiếp trước, lựa chọn khác đi, người cũ lộ bản chất, bẫy cũ bị đảo ngược.
`.trim()
  }

  if (genre.includes('pháp lý') || genre.includes('luật sư')) {
    return `
GENRE LOCK: Nữ cường pháp lý / luật sư
- Trọng tâm bắt buộc: pháp luật, bằng chứng, hợp đồng, kiện tụng, luật sư, đối chất, điều khoản, thư pháp lý.
- Logic bằng chứng phải rõ nhưng không quá khô.
- Nữ chính phải sắc bén trong lập luận, biết giữ bằng chứng, biết bẫy đối phương nói hớ.
- Cảnh mạnh nên có: văn phòng luật, phòng họp hòa giải, thư luật sư, điều khoản hợp đồng, ghi âm hợp pháp, hồ sơ bị khóa.
`.trim()
  }

  if (genre.includes('tổng tài') || genre.includes('ngược luyến')) {
    return `
GENRE LOCK: Tổng tài ngược luyến / hối hận
- Trọng tâm bắt buộc: quan hệ tình cảm căng, hiểu lầm, quyền lực lệch, tổn thương, lựa chọn sai, và sự hối hận muộn.
- Nam chính/tổng tài không được được tẩy trắng quá nhanh.
- Nữ chính phải có ranh giới, không mềm lòng vô lý.
- Cảnh mạnh nên có: đối đầu lạnh, bệnh viện, hợp đồng, hiểu lầm bị lật, lời xin lỗi muộn, nam chính bắt đầu nghi ngờ sự thật.
`.trim()
  }

  if (genre.includes('trả thù')) {
    return `
GENRE LOCK: Trả thù đô thị
- Trọng tâm bắt buộc: nữ chính từng bị hại, tích lũy bằng chứng, đặt bẫy, lật từng lớp sự thật, khiến đối phương trả giá trong bối cảnh hiện đại.
- Revenge pacing phải rõ: chương đầu/chương giữa không kết liễu ngay, chỉ đặt bẫy, hé một mảnh bằng chứng hoặc khiến phản diện tự lộ sơ hở.
- Phản diện phải có phản công. Không được đứng yên chịu thua.
- Nữ chính thông minh nhưng không toàn năng.
`.trim()
  }

  return `
GENRE LOCK: Drama nữ tần hiện đại
- Bám sát thể loại đã chọn.
- Ưu tiên xung đột rõ, nhân vật có động cơ, cảnh đối đầu trực diện, ending có hook.
- Không viết lan man hoặc lệch khỏi premise chính.
`.trim()
}

function getPremiseInstruction(payload: NormalizedGeneratePayload) {
  const genre = safeText(payload.genreLabel).toLowerCase()
  const promptIdea = safeText(payload.promptIdea)
  const hasPromptIdea = Boolean(promptIdea)

  const common = `
PREMISE DIVERSITY LOCK:
- Không mặc định dùng hot search cho mọi truyện.
- Hot search/Weibo chỉ là một công cụ mở truyện, không phải công thức bắt buộc.
- Nếu Prompt idea trống, hãy tự chọn một premise phù hợp với GENRE LOCK, nhưng phải tránh lặp công thức hot search quá nhiều.
- Nếu Prompt idea có nội dung rõ, bắt buộc ưu tiên Prompt idea hơn mọi gợi ý mặc định.
- Chương 1 phải có một premise cụ thể, không mở chung chung.
`.trim()

  if (hasPromptIdea) {
    return `
${common}

PROMPT IDEA OVERRIDE:
- Prompt idea hiện có: ${promptIdea}
- Hãy lấy prompt idea này làm mạch chính.
- Chỉ thêm hot search nếu prompt idea có yếu tố dư luận, scandal, showbiz, PR, ảnh bị leak, hoặc truyền thông.
`.trim()
  }

  if (genre.includes('hot search') || genre.includes('showbiz') || genre.includes('pr scandal')) {
    return `
${common}

DEFAULT PREMISE THEO THỂ LOẠI:
- Vì thể loại là Hot search / showbiz / PR scandal, có thể ưu tiên Weibo/hot search làm hook chính.
- Mở truyện bằng một bài bóc phốt, hashtag leo top, clip bị leak, hợp đồng đại diện bị đe dọa, hoặc họp PR khẩn.
- Dù dùng hot search, vẫn phải có cảnh trực diện sau đó: họp PR, đối chất với công ty, phóng viên chặn cửa, hoặc người trong cuộc xuất hiện.
`.trim()
  }

  if (genre.includes('đổi tráo') || genre.includes('danh phận')) {
    return `
${common}

DEFAULT PREMISE THEO THỂ LOẠI:
- Với Đổi tráo danh phận / hào môn, KHÔNG ưu tiên hot search làm hook chính nếu prompt idea trống.
- Ưu tiên mở bằng một trong các hook: bữa tiệc gia tộc, di vật cũ, ảnh cũ, hộp đồ, thư tay, con dấu, người hầu cũ, quản gia, hồ sơ bệnh viện, giấy xét nghiệm, phòng họp gia tộc, luật sư, phụ lục thừa kế, hoặc cảnh ép ký từ bỏ danh phận/tài sản.
- Nếu dùng Weibo, chỉ dùng làm áp lực phụ, không phải hook mặc định.
`.trim()
  }

  if (genre.includes('bí ẩn') || genre.includes('thân thế')) {
    return `
${common}

DEFAULT PREMISE THEO THỂ LOẠI:
- Với Bí ẩn gia đình / thân thế, KHÔNG ưu tiên hot search làm hook chính nếu prompt idea trống.
- Ưu tiên mở bằng ảnh cũ, giấy xét nghiệm, hồ sơ bệnh viện, di chúc, di vật, nhà kho cũ, người quen cũ, hoặc một cuộc gọi lạ.
- Chỉ hé một mảnh bí mật. Không công bố toàn bộ thân thế ngay chương đầu.
`.trim()
  }

  if (genre.includes('công sở') || genre.includes('nữ cường') || genre.includes('thương chiến')) {
    return `
${common}

DEFAULT PREMISE THEO THỂ LOẠI:
- Với Công sở / nữ cường / thương chiến, KHÔNG ưu tiên hot search làm hook chính nếu prompt idea trống.
- Ưu tiên mở bằng phòng họp, dự án bị cướp, báo cáo bị đánh tráo, hợp đồng bị sửa, cuộc bỏ phiếu cổ đông, hoặc cuộc đàm phán bị gài bẫy.
- Hook chính phải liên quan đến năng lực, quyền điều hành, hợp đồng, số liệu hoặc cổ phần.
`.trim()
  }

  if (genre.includes('cưới trước') || genre.includes('hợp đồng hôn nhân')) {
    return `
${common}

DEFAULT PREMISE THEO THỂ LOẠI:
- Với Cưới trước yêu sau / hợp đồng hôn nhân, KHÔNG ưu tiên hot search làm hook chính nếu prompt idea trống.
- Ưu tiên mở bằng điều khoản hợp đồng, buổi ký hôn ước, gia tộc ép cưới, thời hạn hôn nhân, người cũ quay lại, hoặc hợp đồng bị lộ.
- Cảm xúc không tiến quá nhanh; xung đột đến từ điều khoản và danh phận.
`.trim()
  }

  if (genre.includes('gia đấu') || genre.includes('mẹ chồng') || genre.includes('nhà chồng')) {
    return `
${common}

DEFAULT PREMISE THEO THỂ LOẠI:
- Với Gia đấu / mẹ chồng / nhà chồng, KHÔNG ưu tiên hot search làm hook chính nếu prompt idea trống.
- Ưu tiên mở bằng bữa cơm gia đình, phòng khách biệt thự, cảnh ép ký, xét nét con cái, đổ tội, so sánh nàng dâu, hoặc tranh tài sản.
- Áp lực chính phải đến từ vai vế và quyền lực trong nhà.
`.trim()
  }

  if (genre.includes('hào môn') || genre.includes('liên hôn') || genre.includes('gia tộc')) {
    return `
${common}

DEFAULT PREMISE THEO THỂ LOẠI:
- Với Hào môn / liên hôn / gia tộc, không mặc định hot search.
- Ưu tiên mở bằng sảnh tiệc, phòng họp gia tộc, biệt thự, di chúc, phụ lục cổ phần, hôn ước, hoặc quyết định gia tộc.
- Nếu có truyền thông, chỉ để tăng áp lực bên ngoài, không thay thế xung đột gia tộc.
`.trim()
  }

  if (genre.includes('hôn nhân') && (genre.includes('phản bội') || genre.includes('ngoại tình'))) {
    return `
${common}

DEFAULT PREMISE THEO THỂ LOẠI:
- Với Hôn nhân phản bội / ngoại tình, có thể dùng hot search nhưng không bắt buộc.
- Luân phiên chọn hook: ảnh khách sạn, tin nhắn lúc nửa đêm, hóa đơn phòng, cuộc gọi lạnh lùng, camera hành lang, tiểu tam giả vô tội, gia đình ép im lặng, hoặc hot search.
- Nếu dùng hot search, phải có lý do rõ vì sao chuyện riêng bị đẩy ra dư luận.
`.trim()
  }

  if (genre.includes('mẹ con') || genre.includes('gia đình') || genre.includes('bảo vệ con')) {
    return `
${common}

DEFAULT PREMISE THEO THỂ LOẠI:
- Với Mẹ con / gia đình / bảo vệ con, KHÔNG ưu tiên hot search làm hook chính nếu prompt idea trống.
- Ưu tiên mở bằng bệnh viện, trường học, quyền nuôi con, gia đình chồng đe dọa, giấy khai sinh, xét nghiệm ADN, hoặc người lạ tiếp cận đứa trẻ.
- Động lực bảo vệ con phải rõ ngay từ chương đầu.
`.trim()
  }

  if (genre.includes('tái sinh') || genre.includes('làm lại')) {
    return `
${common}

DEFAULT PREMISE THEO THỂ LOẠI:
- Với Nữ chính tái sinh / làm lại cuộc đời, KHÔNG ưu tiên hot search làm hook chính nếu prompt idea trống.
- Ưu tiên mở bằng khoảnh khắc nữ chính tỉnh lại trước một sự kiện từng hủy hoại đời cô: ký hợp đồng, tiệc đính hôn, tai nạn, bị vu oan, mất quyền thừa kế, hoặc bị ép lựa chọn.
- Phải có chi tiết cho thấy cô biết trước một phần tương lai nhưng không toàn năng.
`.trim()
  }

  if (genre.includes('pháp lý') || genre.includes('luật sư')) {
    return `
${common}

DEFAULT PREMISE THEO THỂ LOẠI:
- Với Nữ cường pháp lý / luật sư, KHÔNG ưu tiên hot search làm hook chính nếu prompt idea trống.
- Ưu tiên mở bằng thư luật sư, điều khoản hợp đồng, hồ sơ bị khóa, biên bản hòa giải, ghi âm hợp pháp, tài sản chung, hoặc đối chất trong văn phòng luật.
- Hook chính phải có logic pháp lý vừa đủ rõ.
`.trim()
  }

  if (genre.includes('tổng tài') || genre.includes('ngược luyến')) {
    return `
${common}

DEFAULT PREMISE THEO THỂ LOẠI:
- Với Tổng tài ngược luyến / hối hận, không mặc định hot search.
- Ưu tiên mở bằng hiểu lầm bị đẩy đến cực điểm, bệnh viện, hợp đồng lạnh lùng, lời xin lỗi muộn, người thứ ba dàn dựng, hoặc nam chính lựa chọn sai.
- Nam chính không được được tẩy trắng quá sớm.
`.trim()
  }

  if (genre.includes('trả thù')) {
    return `
${common}

DEFAULT PREMISE THEO THỂ LOẠI:
- Với Trả thù đô thị, không mặc định hot search.
- Ưu tiên mở bằng một cái bẫy cũ, hồ sơ bị giấu, cuộc gặp lại phản diện, cảnh bị ép ký, giao dịch bí mật, hoặc nữ chính âm thầm lấy lại bằng chứng đầu tiên.
- Phản diện phải có quyền lực thật và sẽ phản công.
`.trim()
  }

  return `
${common}

DEFAULT PREMISE THEO THỂ LOẠI:
- Hãy chọn hook phù hợp với thể loại đã chọn, không tự động dùng hot search nếu không cần.
- Ưu tiên cảnh có hành động cụ thể: phòng họp, bữa cơm, khách sạn, bệnh viện, văn phòng luật, sảnh tiệc, hợp đồng, di vật, camera, hoặc người đưa tin bí mật.
`.trim()
}

function getHeroineInstruction(styleLabel: string) {
  const style = safeText(styleLabel).toLowerCase()

  if (style.includes('nhẫn nhịn') || style.includes('phản công')) {
    return `
HEROINE LOCK: Nhẫn nhịn rồi phản công
- Nữ chính ban đầu biết nhịn để quan sát, không bùng nổ vô nghĩa.
- Khi phản công, cô dùng bằng chứng, thời điểm, nhân chứng hoặc một câu nói ngắn để xoay thế.
- Cảm xúc có thể đau nhưng không được bi lụy quá lâu.
- Arc nên đi từ chịu đựng → tỉnh ngộ → lạnh lòng → kiểm soát thế cục.
`.trim()
  }

  if (style.includes('lạnh lùng') || style.includes('trả thù')) {
    return `
HEROINE LOCK: Lạnh lùng trả thù
- Nữ chính ít giải thích, hành động nhiều hơn nói.
- Cô không mềm lòng trước lời xin lỗi rẻ tiền.
- Trả thù phải có kế hoạch, không nóng vội.
- Mỗi chương nên cho thấy cô tiến thêm một bước trong việc siết lưới.
`.trim()
  }

  if (style.includes('ngoài mềm') || style.includes('trong cứng')) {
    return `
HEROINE LOCK: Ngoài mềm trong cứng
- Bề ngoài nữ chính bình tĩnh, thậm chí dịu dàng, nhưng bên trong rất rõ ranh giới.
- Cô không cần nói lời cay độc liên tục, nhưng một khi ra tay thì chính xác.
- Phản diện thường xem thường cô vì vẻ mềm yếu bên ngoài.
- Cú vả mặt nên đến từ việc đối phương đánh giá sai cô.
`.trim()
  }

  if (style.includes('pháp lý') || style.includes('luật')) {
    return `
HEROINE LOCK: Lý trí, giỏi pháp lý
- Nữ chính suy nghĩ theo bằng chứng, điều khoản, quyền lợi và hậu quả pháp lý.
- Cô biết giữ chứng cứ, không tung hết một lúc.
- Đối thoại nên có tính đối chất, gài bẫy, ép đối phương tự lộ sơ hở.
- Không viết cô như người chỉ biết cãi nhau cảm tính.
`.trim()
  }

  if (style.includes('thương chiến') || style.includes('nữ cường')) {
    return `
HEROINE LOCK: Nữ cường thương chiến
- Nữ chính có năng lực thật trong công việc, dự án, hợp đồng, cổ phần hoặc quản trị.
- Cô thắng bằng số liệu, quyền biểu quyết, chiến lược và đàm phán.
- Không để cô chỉ dựa vào nam chính hoặc may mắn.
- Cảnh phản công nên có không khí phòng họp, hợp đồng, PR, hội đồng hoặc cổ đông.
`.trim()
  }

  if (style.includes('tái sinh') || style.includes('đi trước')) {
    return `
HEROINE LOCK: Tái sinh, đi trước một bước
- Nữ chính có ký ức hoặc kinh nghiệm từ tương lai/kiếp trước.
- Cô không nói thẳng bí mật tái sinh cho người khác.
- Cô dùng điều biết trước để tránh bẫy, nhưng vẫn gặp biến số mới.
- Không để cô toàn năng; ký ức chỉ giúp đi trước một bước, không giúp thắng sạch.
`.trim()
  }

  if (style.includes('mẹ') || style.includes('bảo vệ con')) {
    return `
HEROINE LOCK: Người mẹ bảo vệ con
- Động lực lớn nhất của nữ chính là bảo vệ con và giữ phẩm giá.
- Cô có thể mềm với con nhưng cứng với người làm hại con.
- Xung đột nên có chiều sâu cảm xúc, không chỉ trả thù lạnh.
- Nếu có con nhỏ, đứa trẻ phải ảnh hưởng trực tiếp đến lựa chọn của nữ chính.
`.trim()
  }

  if (style.includes('thiên kim') || style.includes('hào môn')) {
    return `
HEROINE LOCK: Thiên kim hào môn bị xem thường
- Nữ chính có khí chất và nền tảng, nhưng bị che giấu hoặc bị đánh giá thấp.
- Cú vả mặt nên liên quan đến thân phận, tài sản, giáo dưỡng, quan hệ gia tộc hoặc quyền thừa kế.
- Không hé toàn bộ thân phận quá sớm.
- Cô lấy lại vị trí bằng từng bước, không thắng sạch trong một chương.
`.trim()
  }

  if (style.includes('gom bằng chứng') || style.includes('im lặng')) {
    return `
HEROINE LOCK: Im lặng gom bằng chứng
- Nữ chính không phản ứng quá sớm, cô để đối phương tưởng mình yếu.
- Cô âm thầm lưu ảnh, ghi âm, giữ hóa đơn, sao kê, camera hoặc hợp đồng.
- Càng bị ép, cô càng có thêm dữ liệu để phản công.
- Khi tung bằng chứng, chỉ tung một phần đủ làm đối phương rối loạn.
`.trim()
  }

  if (style.includes('vả mặt công khai')) {
    return `
HEROINE LOCK: Vả mặt công khai cực gắt
- Nữ chính không chỉ thắng riêng tư, cô khiến đối phương mất mặt trước đám đông.
- Cảnh mạnh nên diễn ra ở tiệc, phòng họp, livestream, họp báo, Weibo hoặc trước gia tộc.
- Cú vả mặt phải có bằng chứng cụ thể, không chỉ chửi cho sướng.
- Không dùng quá nhiều câu khẩu hiệu; ưu tiên một câu ngắn, lạnh, sắc.
`.trim()
  }

  if (style.includes('đau khổ') || style.includes('kiểm soát thế cục')) {
    return `
HEROINE LOCK: Từ đau khổ thành kiểm soát thế cục
- Đầu truyện cho thấy nữ chính bị tổn thương thật, nhưng không chìm trong bi lụy.
- Mỗi chương cần cho thấy cô tỉnh táo hơn, bớt phụ thuộc hơn.
- Cô dần chuyển từ người bị lựa chọn sang người đặt luật chơi.
- Arc cảm xúc rất quan trọng: đau → tỉnh → lạnh → quyết → phản đòn.
`.trim()
  }

  return `
HEROINE LOCK: Nữ chính đô thị hiện đại
- Nữ chính có tự trọng, có cảm xúc, nhưng không yếu đuối kéo dài.
- Cô phải có lựa chọn chủ động trong chương.
- Không để nam chính hoặc nhân vật phụ giải quyết thay toàn bộ vấn đề.
`.trim()
}

function getNameDiversityInstruction(payload: NormalizedGeneratePayload) {
  return `
CHARACTER NAME DIVERSITY LOCK:
- Name seed của lần tạo này: ${payload.nameSeed}
- Mỗi truyện mới phải tự tạo bộ tên nhân vật mới dựa trên seed này.
- Không được mặc định dùng lại các tên ví dụ cũ như: Lâm An Nhiên, Lục Thịnh, Lục Hạo, Tề Dương, Mã Lan, Hàn Liễu, Triệu Vũ, Lục phu nhân, Lục lão phu nhân.
- Không được dùng họ Lục hoặc họ Lâm quá thường xuyên.
- Không được lấy tên nhân vật từ ví dụ trong prompt làm tên mặc định.
- Nếu Prompt idea không chỉ định tên nhân vật, hãy tự tạo tên Trung Quốc hiện đại khác nhau cho từng truyện.
- Bộ tên phải nhất quán trong cùng một truyện, nhưng giữa các truyện mới phải khác nhau.
- Không đặt nữ chính cùng họ với chồng/nam phản diện nếu không có lý do thân phận/huyết thống đặc biệt.
- Ưu tiên đa dạng họ: Giang, Tô, Hứa, Thẩm, Cố, Tống, Ninh, Ôn, Bạch, Trình, Diệp, Phó, Hạ, Chu, Kỷ, Mạnh, Đường, Dư, Tạ, Tần, Hàn, La, Mộ, Tưởng, Lạc, Viên.
- Không dùng lại cùng một combo họ nữ chính + họ nam phản diện giữa các lần tạo truyện mới.
`.trim()
}

function getLibraryAvoidanceInstruction(payload: NormalizedGeneratePayload) {
  const hasAvoidance =
    payload.avoidStoryTitles.length ||
    payload.avoidMotifs.length ||
    payload.avoidCharacterNames.length ||
    payload.avoidCompanyNames.length

  if (!hasAvoidance) {
    return `
EXISTING LIBRARY AVOIDANCE:
- Chưa có danh sách tránh từ thư viện hiện có.
- Vẫn phải tự đa dạng hóa tên truyện, motif, tên nhân vật và tên công ty.
`.trim()
  }

  return `
EXISTING LIBRARY AVOIDANCE:
- Đây là truyện mới trong AI Factory hoặc AI Writer, không được lặp lại thư viện hiện có.
- Tên truyện cần tránh:
${payload.avoidStoryTitles.map((item) => `  - ${item}`).join('\n') || '  - Không có'}
- Motif/premise cần tránh:
${payload.avoidMotifs.map((item) => `  - ${item}`).join('\n') || '  - Không có'}
- Tên nhân vật cần tránh:
${payload.avoidCharacterNames.map((item) => `  - ${item}`).join('\n') || '  - Không có'}
- Tên công ty/gia tộc cần tránh:
${payload.avoidCompanyNames.map((item) => `  - ${item}`).join('\n') || '  - Không có'}
- Nhiệm vụ: tạo truyện mới khác đáng kể, không chỉ đổi tên.
- Không dùng lại cùng opening hook, bằng chứng đầu tiên, phòng khách sạn, quản gia cũ, hợp đồng đỏ, hot search, hoặc cảnh ép ký nếu các motif đó đã xuất hiện trong danh sách tránh.
`.trim()
}

function getCliffhangerRule(payload: NormalizedGeneratePayload) {
  const label = safeText(payload.cliffhangerLabel, '')
  const normalized = label.toLowerCase()

  if (
    !label ||
    normalized.includes('mặc định') ||
    normalized.includes('tự chọn') ||
    normalized.includes('auto')
  ) {
    return `
ENDING STRATEGY:
- Kiểu kết chương: AI tự chọn theo mạch truyện.
- Không ép chương nào cũng phải có bằng chứng mới.
- Hãy chọn kiểu ending hợp lý nhất dựa trên STORY CONTEXT, GENRE LOCK, PREMISE DIVERSITY LOCK, HEROINE LOCK, nhịp chương, và trạng thái xung đột.
- Có thể chọn một trong các kiểu: phản diện phản công, bằng chứng mới hé một phần, tin nhắn/camera/file bí mật, hot search đảo chiều nếu hợp thể loại, câu vả mặt, gia tộc ép đến đường cùng, thân phận thật giả lộ sơ hở, nam chính dao động, người thân gặp nguy, hoặc vả mặt công khai.
- Ending phải tự nhiên, không được ghi thẳng tên loại ending.
- Không được kết bằng câu phân tích như "phản diện đang phản công" hoặc "mâu thuẫn được đẩy lên cao".
- Nếu chương trước đã kết bằng bằng chứng, chương này nên ưu tiên phản công/đối đầu/cú đảo chiều để tránh lặp.
`.trim()
  }

  if (normalized.includes('phản diện') || normalized.includes('counterattack')) {
    return `
ENDING STRATEGY: Phản diện phản công cuối chương
- Kết chương bằng một cú phản công thật từ phản diện: thư luật sư, lệnh ép ký, cuộc gọi từ PR, email đe dọa, gia tộc gây áp lực, bằng chứng giả, hoặc bài đăng Weibo nếu hợp thể loại.
- Phản công phải khiến nữ chính bị đẩy vào thế khó mới, không chỉ là lời dọa suông.
`.trim()
  }

  if (normalized.includes('bằng chứng') || normalized.includes('evidence')) {
    return `
ENDING STRATEGY: Bằng chứng mới xuất hiện
- Kết chương bằng một mảnh bằng chứng mới: ảnh, hóa đơn, camera, metadata, hợp đồng, phụ lục, sao kê, ghi âm, di vật, hồ sơ hoặc tin nhắn.
- Chỉ hé một phần đủ gây tò mò, không xả hết toàn bộ bí mật.
`.trim()
  }

  if (
    normalized.includes('tin nhắn') ||
    normalized.includes('camera') ||
    normalized.includes('file') ||
    normalized.includes('secret')
  ) {
    return `
ENDING STRATEGY: Tin nhắn / camera / file bí mật
- Kết chương bằng một tin nhắn lạ, đoạn camera bị khôi phục, file khóa, email ẩn, hoặc cuộc gọi không hiện số.
- Nội dung phải tạo câu hỏi mới cho độc giả.
- Không giải thích hết nguồn gốc file/tin nhắn ngay trong chương này.
`.trim()
  }

  if (normalized.includes('hot search') || normalized.includes('weibo') || normalized.includes('đảo chiều')) {
    return `
ENDING STRATEGY: Hot search đảo chiều
- Kết chương bằng việc Weibo/hot search đổi hướng: hashtag mới leo top, bình luận quay xe, tài khoản marketing tung bài mới, hoặc truyền thông đổ về phía nữ chính.
- Chỉ dùng kiểu này làm hook chính nếu truyện có yếu tố truyền thông, scandal, showbiz, PR hoặc dư luận.
- Không dùng từ "tweet".
`.trim()
  }

  if (normalized.includes('vả mặt') && !normalized.includes('công khai')) {
    return `
ENDING STRATEGY: Nữ chính tung câu vả mặt
- Kết chương bằng một câu thoại ngắn, lạnh, sắc của nữ chính.
- Câu thoại phải dựa trên tình thế hoặc bằng chứng, không phải khẩu hiệu rỗng.
`.trim()
  }

  if (normalized.includes('luật') || normalized.includes('hợp đồng') || normalized.includes('pháp lý')) {
    return `
ENDING STRATEGY: Luật sư / hợp đồng / pháp lý đảo chiều
- Kết chương bằng một điều khoản, thư luật sư, phụ lục hợp đồng, quyền cổ phần, lệnh triệu tập, hoặc hồ sơ pháp lý làm đảo thế.
- Logic pháp lý phải rõ vừa đủ cho độc giả hiểu.
`.trim()
  }

  if (normalized.includes('gia tộc') || normalized.includes('đường cùng') || normalized.includes('family')) {
    return `
ENDING STRATEGY: Gia tộc ép đến đường cùng
- Kết chương bằng áp lực từ gia tộc: ép ký, cắt quyền lợi, đe dọa danh phận, gọi người lớn ra mặt, hoặc dùng tài sản/con cái/thể diện để ép nữ chính.
- Áp lực phải tạo lựa chọn khó cho nữ chính ở chương sau.
`.trim()
  }

  if (normalized.includes('thân phận') || normalized.includes('identity')) {
    return `
ENDING STRATEGY: Thân phận thật giả lộ sơ hở
- Kết chương bằng một sơ hở nhỏ về thân phận: ảnh cũ, di vật, giấy xét nghiệm, lời người hầu, thói quen, hồ sơ bị sửa, hoặc một cái tên cũ.
- Chỉ hé một góc, không công bố toàn bộ thân thế.
`.trim()
  }

  if (normalized.includes('nam chính') || normalized.includes('dao động') || normalized.includes('nghi ngờ') || normalized.includes('romance')) {
    return `
ENDING STRATEGY: Nam chính bắt đầu dao động / nghi ngờ
- Kết chương bằng khoảnh khắc nam chính phát hiện một chi tiết khiến hắn bắt đầu nghi ngờ sự thật.
- Không tẩy trắng nam chính quá sớm.
- Nữ chính không được mềm lòng vô lý chỉ vì hắn dao động.
`.trim()
  }

  if (normalized.includes('con') || normalized.includes('người thân') || normalized.includes('child')) {
    return `
ENDING STRATEGY: Con nhỏ / người thân gặp nguy
- Kết chương bằng nguy cơ liên quan đến con nhỏ hoặc người thân: bệnh viện, trường học, quyền nuôi con, tin nhắn đe dọa, người lạ tiếp cận, hoặc gia đình chồng dùng con để ép.
- Nữ chính phải có động lực bảo vệ rõ ràng ở chương sau.
`.trim()
  }

  if (normalized.includes('công khai') || normalized.includes('tiệc') || normalized.includes('truyền thông')) {
    return `
ENDING STRATEGY: Vả mặt công khai ở tiệc / họp / truyền thông
- Kết chương bằng một cú đảo thế trước đám đông: sảnh tiệc, họp báo, phòng họp, livestream, gia tộc, hoặc Weibo nếu hợp thể loại.
- Cú vả mặt phải dựa trên vật chứng, nhân chứng, hợp đồng, camera hoặc lời tự thú.
`.trim()
  }

  if (normalized.includes('cao trào') || normalized.includes('final') || normalized.includes('kết liễu')) {
    return `
ENDING STRATEGY: Cao trào / kết liễu phản diện
- Chỉ dùng khi truyện đã đủ chi tiết đã cài hoặc chương hiện tại cần điểm trả sau mạnh.
- Kết chương bằng đòn đánh lớn: bằng chứng quan trọng, luật sư vào cuộc, cổ phần đảo chiều, video hoàn chỉnh, nhân chứng xuất hiện, hoặc phản diện bị buộc lộ mặt.
- Không xử lý tất cả mọi phản diện phụ trong một đoạn nếu truyện vẫn còn tiếp.
`.trim()
  }

  return `
ENDING STRATEGY:
- Kiểu kết chương được chọn: ${label}.
- Hãy kết chương theo đúng tinh thần này, nhưng vẫn phải tự nhiên như văn truyện.
- Không được ghi thẳng nhãn "${label}" vào BẢN ĐỌC.
- Không được kết bằng câu phân tích kỹ thuật.
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
- Nếu đang viết chương 1, hãy mở truyện thật mạnh nhưng phải bám PREMISE DIVERSITY LOCK.
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
- Không làm mất bằng chứng/điểm trả sau đã cài.
- Không lặp lại y nguyên cảnh đã viết.
- Nếu viết chương tiếp theo, hãy đẩy xung đột tiến thêm một nấc.
`.trim()
}

function getTechnicalReportInstruction() {
  return `
# BẢN PHÂN TÍCH KỸ THUẬT / KHÔNG ĐĂNG

=== THÔNG TIN TRUYỆN ĐỀ XUẤT ===
- Tên truyện đề xuất:
- Slug gợi ý:
- Một câu mô tả ngắn:

=== KIỂM TRA TIẾN ĐỘ TRUYỆN ===
- Nhân vật chính:
- Phản diện:
- Tình huống:
- Mục tiêu chương:

=== BỘ NHỚ TRUYỆN ===
- Sự kiện đã xảy ra:
- Bằng chứng đã hé:
- Nguồn gốc/lý do nữ chính có bằng chứng:
- Quan hệ nhân vật:
- Tên công ty/gia tộc/tổ chức cần giữ nhất quán:
- Thứ chưa được tiết lộ:

=== KIỂM TRA BỐI CẢNH LIÊN TỤC ===
- Thời gian:
- Địa điểm:
- Tên công ty/gia tộc/tổ chức chính:
- Bối cảnh xã hội/công ty:
- Tiền tệ/quyền lực/liên quan pháp lý:

=== KIỂM TRA NHÂN VẬT PHỤ ===
- Nhân vật phụ xuất hiện:
- Vai trò:
- Có lấn át nữ chính không:
- Có cần giữ lại cho điểm trả sau không:

=== KIỂM TRA LƯỢNG TIẾT LỘ ===
- Chương này đã hé bao nhiêu bằng chứng:
- Có hé quá nhiều không:
- Bằng chứng nào phải giữ lại:
- Điểm trả sau nào chưa được dùng:

=== THEO DÕI CHI TIẾT ĐÃ CÀI VÀ ĐIỂM TRẢ SAU ===
- Chi tiết đã cài:
- Điểm trả sau tương lai:
- Chi tiết nên nhớ:

=== THEO DÕI NHỊP HÉ BẰNG CHỨNG ===
- Bằng chứng hiện có:
- Bằng chứng chưa khai thác:
- Không được tung sớm:

=== THEO DÕI LEO THANG XUNG ĐỘT ===
- Áp lực dư luận:
- Áp lực gia đình/công ty:
- Phản công của nữ chính:
- Hướng chương sau:

Lưu ý:
- Phần kỹ thuật này chỉ để admin debug, không đăng cho độc giả.
- Nội dung mô tả trong phần kỹ thuật phải viết sạch, rõ, ưu tiên tiếng Việt tự nhiên.
- Không dùng từ lẫn kiểu "in/print" hoặc "or"; hãy viết "bản in" và "hoặc".
`.trim()
}

function buildStoryPlanPrompt(payload: NormalizedGeneratePayload) {
  const moduleInstruction = getModuleInstruction(payload.moduleId)
  const genreInstruction = getGenreInstruction(payload.genreLabel)
  const premiseInstruction = getPremiseInstruction(payload)
  const nameDiversityInstruction = getNameDiversityInstruction(payload)
  const libraryAvoidanceInstruction = getLibraryAvoidanceInstruction(payload)
  const heroineInstruction = getHeroineInstruction(payload.mainCharacterStyleLabel)
  const cliffhangerRule = getCliffhangerRule(payload)

  return `
Bạn là Master Story Engine v2.8 chuyên thiết kế truyện nữ tần đô thị viral cho độc giả Việt.

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
- Factory run id: ${payload.factoryRunId || 'không có'}
- Story index: ${payload.storyIndex || 0}
- Target chapters: ${payload.chapterTarget || 'chưa đặt'}

${moduleInstruction}

${genreInstruction}

${premiseInstruction}

${nameDiversityInstruction}

${libraryAvoidanceInstruction}

${heroineInstruction}

${cliffhangerRule}

YÊU CẦU:
- Dàn ý phải đủ rõ để viết được nhiều chương liên tục.
- Không viết như tóm tắt máy móc.
- Nhân vật phải có tên riêng rõ, đa dạng, không dùng lại bộ tên mặc định.
- Bằng chứng phải được chia tầng, không dồn hết vào chương 1.
- Phải có hook thương mại/đô thị/truyền thông nếu đúng thể loại, nhưng không mặc định dùng hot search cho mọi truyện.
- Phải bám đúng GENRE LOCK đã chọn, không chuyển sang thể loại khác giữa chừng.
- Phải bám đúng PREMISE DIVERSITY LOCK, nếu prompt idea trống thì tự chọn premise theo thể loại.
- Phải bám đúng HEROINE LOCK đã chọn, không đổi tính cách nữ chính giữa truyện.
- Kiểu kết chương phải được phân bổ hợp lý trong outline, không chương nào cũng lặp cùng một kiểu.

OUTPUT BẮT BUỘC:
# STORY PLAN

## Tên truyện
[Đề xuất tên truyện viral, không được dùng "Chương 1" làm tên truyện]

## Công thức viết
[Nêu công thức/vibe chính]

## Thể loại
[Nêu thể loại]

## Kiểu nữ chính
[Nêu rõ arc nữ chính]

## Premise chính
[Nêu hook mở truyện theo đúng thể loại, không mặc định hot search nếu không cần]

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

## Vũ khí trả thù
[Nêu vũ khí trả thù: bằng chứng, hợp đồng, pháp vụ, cổ phần, truyền thông]

## Nhịp hé bằng chứng
[Chia tầng bằng chứng]

## Hành trình nữ chính
[Nêu hành trình nữ chính qua 10 chương]

## Bản đồ kết chương
[Phân bổ kiểu kết chương phù hợp từng giai đoạn]

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
  const genreInstruction = getGenreInstruction(payload.genreLabel)
  const premiseInstruction = getPremiseInstruction(payload)
  const nameDiversityInstruction = getNameDiversityInstruction(payload)
  const libraryAvoidanceInstruction = getLibraryAvoidanceInstruction(payload)
  const heroineInstruction = getHeroineInstruction(payload.mainCharacterStyleLabel)
  const storyContext = buildStoryContext(payload)
  const technicalReport = getTechnicalReportInstruction()
  const cliffhangerRule = getCliffhangerRule(payload)
  const nextChapterNumber = Math.max(1, Math.floor(payload.nextChapterNumber || 1))
  const isContinuation = nextChapterNumber > 1

  return `
Bạn là Master Story Engine v2.8 chuyên viết truyện nữ tần đô thị viral cho độc giả Việt.

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
- Factory run id: ${payload.factoryRunId || 'không có'}
- Story index: ${payload.storyIndex || 0}
- Target chapters: ${payload.chapterTarget || 'chưa đặt'}

${moduleInstruction}

${genreInstruction}

${premiseInstruction}

${nameDiversityInstruction}

${libraryAvoidanceInstruction}

${heroineInstruction}

${storyContext}

CHAPTER CONTINUATION RULE:
- Số chương cần viết: Chương ${nextChapterNumber}.
- ${
    isContinuation
      ? 'Đây là chương tiếp theo của truyện đã có chương trước. Tuyệt đối không viết lại chương 1, không mở truyện lại từ đầu, không reset quan hệ nhân vật, không đổi tên nhân vật chính/phản diện, không đổi tính cách nữ chính.'
      : 'Đây là chương mở đầu. Có thể mở bằng cú sốc mạnh, nhưng phải chọn premise theo GENRE LOCK và PREMISE DIVERSITY LOCK, không mặc định hot search nếu không cần.'
  }
- Nếu là chương tiếp theo, đoạn mở đầu phải nối từ sự kiện/hook/bằng chứng ở chương gần nhất.
- Không tự tạo lại một vụ hot search mở đầu mới nếu chương trước đã có hook cụ thể, trừ khi đó là hệ quả trực tiếp của chương trước.
- Tiêu đề chương bắt buộc dùng dạng: "# Chương ${nextChapterNumber} — [tên chương ngắn, có hook]".
- Nếu là Chương 1, phần kỹ thuật bắt buộc có "Tên truyện đề xuất" khác với tiêu đề chương.

${cliffhangerRule}

GENRE + PREMISE + HEROINE EXECUTION RULE:
- Thể loại, premise và kiểu nữ chính đã chọn là khóa cốt lõi, không được viết lệch.
- Nếu Prompt idea trống, phải tự chọn hook theo PREMISE DIVERSITY LOCK.
- Nếu GENRE LOCK là pháp lý, thương chiến, hào môn, mẹ con, tái sinh, hot search, ngoại tình hoặc thân thế, chương phải có chi tiết đúng thể loại đó.
- Nếu HEROINE LOCK yêu cầu nữ chính lạnh, lý trí, bảo vệ con, tái sinh, vả mặt công khai hoặc im lặng gom bằng chứng, hành động của cô trong chương phải thể hiện đúng điều đó.
- Không để nữ chính hành xử trái option đã chọn chỉ để tạo drama rẻ tiền.
- Không để nhân vật phụ hoặc nam chính cướp vai trò giải quyết vấn đề của nữ chính.
- Không dùng Weibo/hot search làm hook chính chỉ vì module có chữ viral. Chỉ dùng khi hợp thể loại/prompt.

MALE ANTAGONIST PRESENCE RULE:
- Nếu có nam phản diện/chồng/CEO/tổng tài, hắn phải có ít nhất 1–2 câu thoại sắc, gây tổn thương trực tiếp hoặc tạo áp lực thật.
- Không để mẹ chồng/gia tộc/PR gánh toàn bộ vai phản diện nếu nam phản diện là nhân vật chính của xung đột.
- Nam phản diện phải thể hiện quyền lực qua lựa chọn, đe dọa, hợp đồng, cổ phần, luật sư hoặc thái độ phủ nhận nữ chính.
- Nếu nam phản diện là nhân vật chính của xung đột, chương phải có một hành động/lời nói khiến độc giả ghét hoặc nghi ngờ hắn.

SUPPORT CHARACTER LIMIT RULE:
- Nhân vật hỗ trợ như luật sư, trợ lý, bạn thân, quản gia chỉ được hỗ trợ công cụ/thông tin, không được giải quyết thay nữ chính.
- Quyết định chính, đòn phản công chính và lựa chọn nguy hiểm phải thuộc về nữ chính.
- Nếu nhân vật hỗ trợ xuất hiện quá mạnh, hãy giảm vai trò của họ thành cảnh báo, xác minh hoặc chuẩn bị giấy tờ.
- Không để nam phụ/luật sư thành người giải cứu toàn năng.

HUMILIATION SCENE RULE:
- Nếu mức uất ức từ 4/5 trở lên, chương phải có ít nhất một câu sỉ nhục trực diện, cụ thể, gắn với thân phận nữ chính.
- Câu sỉ nhục phải làm độc giả thấy tức thay nữ chính, ví dụ đánh vào danh phận, quyền lợi, con cái, hôn nhân, năng lực hoặc xuất thân.
- Không chỉ viết chung chung "cô không xứng". Hãy viết câu có lực và có ngữ cảnh.
- Nếu mức uất ức 1–3, vẫn nên có áp lực/sỉ nhục nhẹ nhưng không quá lố.

WORDING NATURALNESS RULE:
- Tránh cụm từ sai tự nhiên như "tiếng dĩa chạm mặt". Hãy viết "tiếng dao nĩa chạm nhẹ vào đĩa".
- Nếu nam phản diện/chồng/CEO còn trẻ hoặc cùng thế hệ nữ chính, không gọi là "ông ta". Ưu tiên "anh ta", "hắn", hoặc gọi tên riêng.
- Danh xưng phải khớp tuổi tác, vai vế và quan hệ.
- Không gọi mẹ chồng/bà nội/chủ tịch lẫn lộn.
- Tránh câu dịch máy, cụm sai collocation, hình ảnh quá lạ hoặc không tự nhiên trong tiếng Việt.

EVIDENCE PACING RULE:
- Không được để nữ chính nói ra toàn bộ bằng chứng trong một chương.
- Nếu có phụ lục chuyển nhượng/cổ phần/sao kê/video/hóa đơn, chỉ chọn tối đa 2 thứ để hé trong chương này.
- Bằng chứng nên chia tầng:
  Tier 1: ảnh hot search / tin đồn / hóa đơn / tin nhắn / di vật / ảnh cũ.
  Tier 2: hợp đồng / phụ lục / camera / metadata / hồ sơ bệnh viện / giấy xét nghiệm.
  Tier 3: sao kê / chuyển tiền / nhân chứng / ghi âm / nhật ký.
  Tier 4: video hoàn chỉnh / hồ sơ pháp lý đầy đủ / đòn kết liễu.
- Chương đầu hoặc chương giữa chỉ nên dùng Tier 1–2.
- Tier 3–4 phải giữ cho các chương sau hoặc final payoff.
- Khi nữ chính phản đòn, cô chỉ cho đối phương thấy "một góc bằng chứng", không đọc hết số tài khoản, không xả hết tỷ lệ cổ phần, không công bố toàn bộ sao kê.

CHARACTER CONSISTENCY RULE:
- Nếu STORY CONTEXT hoặc chương tham chiếu đã có tên nhân vật, bắt buộc giữ nguyên tên đó.
- Không đổi họ/tên nữ chính, nam phản diện, người thứ ba, mẹ chồng/bà nội chồng giữa các chương.
- Nếu chưa có tên nhân vật rõ trong context, tự tạo tên Trung Quốc hiện đại và bám CHARACTER NAME DIVERSITY LOCK.
- Không đặt nữ chính cùng họ với chồng/nam phản diện nếu không có lý do thân phận/huyết thống đặc biệt.
- Không dùng lẫn mẹ chồng và bà nội chồng cho cùng một nhân vật.
- Trong một chương, chỉ chọn một vai gây áp lực chính nếu không có lý do rõ ràng để cả hai cùng xuất hiện.

SETTING LANGUAGE RULE:
- Khi viết về Weibo, không được dùng từ "tweet".
- Weibo phải gọi là "bài đăng Weibo", "hot search", "hashtag", "bình luận", "lượt chia sẻ", "tài khoản marketing", hoặc "bài bóc phốt".
- Không dùng thuật ngữ Twitter/X trong bối cảnh Weibo.
- Không dùng từ nền tảng sai bối cảnh.

NARRATIVE CRAFT RULE:
- Mỗi đoạn văn phải làm ít nhất một việc: đẩy cốt truyện, tăng áp lực, bộc lộ cảm xúc, cài bằng chứng, trả điểm trả sau, hoặc mở hook.
- Nếu một đoạn chỉ giải thích chung chung mà không có hành động/cảm xúc/thông tin mới, phải tự bỏ hoặc viết lại thành cảnh.
- Không kể lướt quá nhiều sự kiện. Hãy chọn một cảnh trọng tâm để đào sâu.
- Ưu tiên hành động cụ thể, vật chứng cụ thể, ánh mắt, tiếng chuông điện thoại, màn hình Weibo nếu hợp thể loại, bản hợp đồng, chữ ký, dấu đỏ, phòng họp, camera, luật sư, PR.
- Nữ chính thông minh nhưng không toàn năng. Cô được thắng một nhịp nhỏ, không được thắng sạch quá sớm.
- Phản diện phải có phản ứng và phản công hợp lý, không đứng yên chịu thua.

CLEAN PROSE RULE:
- BẢN ĐỌC CHO ĐỘC GIẢ không được dùng ngôn ngữ phân tích kỹ thuật như: "phản diện đang phản công", "nữ chính phản đòn", "mục tiêu chương", "genre lock", "heroine lock", "ending strategy", "premise diversity lock", "character name diversity lock".
- Những ý kỹ thuật phải được chuyển thành cảnh truyện tự nhiên, bằng hành động/tin nhắn/đối thoại/vật chứng/phản ứng cơ thể.
- Không kết thúc phần đọc bằng câu kiểu phân tích. Kết chương phải là hình ảnh, hành động, tin nhắn, bằng chứng mới, áp lực mới, hoặc một câu thoại có hook.
- Khi nữ chính phản đòn, ưu tiên dùng đối thoại ngắn, lạnh, sắc thay vì giải thích chiến thuật.

QUY TẮC CHUYỂN Ý KỸ THUẬT THÀNH CẢNH:
- Nếu muốn nói "phản diện phản công" → hãy viết thành một bài đăng Weibo mới nếu hợp thể loại, một cuộc gọi từ PR, một email luật sư, một đoạn chat bị tung ra, hoặc một ánh mắt/câu thoại cho thấy đối phương đã ra tay.
- Nếu muốn nói "nữ chính phản công" → hãy viết thành hành động: cô đặt tài liệu lên bàn, mở một trang phụ lục, gửi một tin nhắn, nhìn thẳng vào đối phương, hoặc nói một câu ngắn khiến cả phòng im lặng.
- Nếu muốn nói "bằng chứng quan trọng" → hãy mô tả vật chứng: ảnh chụp, dấu đỏ, chữ ký, thời gian chuyển khoản, camera khách sạn, metadata, phong bì, email, file bị khóa, di vật, hồ sơ.
- Nếu muốn nói "mâu thuẫn được đẩy lên cao" → hãy tăng áp lực bằng lời đe dọa, tiếng chuông điện thoại, cổ đông quay sang nhìn, màn hình hot search đổi thứ hạng nếu hợp thể loại, hoặc phóng viên chặn cửa.
- Nếu muốn tạo cliffhanger → hãy kết bằng hành động/sự kiện chưa giải quyết, không kết bằng câu phân tích.

HUMAN PROSE RULE:
- Viết như tác giả người thật đang kể chuyện, không viết như máy hoàn thành checklist.
- Câu văn được phép có nhịp dài ngắn khác nhau, nhưng không được rối.
- Không đoạn nào cũng phải quá hoàn hảo. Có thể dùng những chi tiết nhỏ đời thường để cảnh có hơi người: tiếng điều hòa, mùi cà phê nguội, vệt son trên ly, tiếng giày trên sàn, ánh đèn phản vào kính.
- Không gọi thẳng cảm xúc quá nhiều như "tôi đau đớn", "tôi tức giận", "tôi lạnh lùng". Hãy thể hiện bằng hành động: siết điện thoại, đặt bút xuống, nhìn vào dấu đỏ, im lặng lâu hơn một nhịp.
- Đối thoại không được chỉ để giải thích cốt truyện. Mỗi câu thoại phải có ý đồ: ép, né, đe dọa, thử phản ứng, che giấu, châm chọc, hoặc lật thế.
- Nhân vật không được nói quá đúng, quá đủ, quá sạch. Người thật thường nói thiếu một nửa, vòng vo, cắt ngang, hoặc giấu ý.
- Không viết đoạn nào giống bài phân tích đạo đức hoặc tổng kết bài học.

REALISM + CLEAN OUTPUT PATCH:
- Tránh câu ẩn dụ dài, quá văn mẫu, quá trau chuốt kiểu AI. Nếu một câu so sánh dài hơn 25 từ, hãy tự rút gọn thành 1–2 câu ngắn, sắc, dễ đọc.
- Không dùng hình ảnh ẩn dụ chung chung như "vết nứt", "món đồ vỡ", "con dao", "ván cờ" nếu không gắn trực tiếp với vật thể đang có trong cảnh.
- Mọi hành động/chuyển cảnh phải rõ chủ thể. Không viết câu mơ hồ kiểu "Tiếng cửa bật. Chuông tin nhắn." nếu thực tế chỉ là điện thoại báo tin. Hãy viết rõ: "Điện thoại tôi rung lên", "Một tiếng ting vang lên", hoặc "Màn hình sáng lên".
- Nếu có bằng chứng như lịch sử đặt phòng, sao kê, email, file, ảnh, camera, hợp đồng, hồ sơ, di vật, phải giải thích ngắn gọn vì sao nữ chính có quyền hoặc có cách lấy được nó.
- Không để bằng chứng xuất hiện quá tiện. Cần một lý do hợp lý: email chung, tài khoản gia đình, số điện thoại tích điểm, thư ký gửi nhầm, camera tòa nhà, quyền vợ/chồng, hợp đồng chung, luật sư hỗ trợ, người hầu cũ, quản gia, hồ sơ gia tộc, hoặc người trong cuộc gửi.
- Bắt buộc đặt tên cụ thể cho tổ chức/công ty/gia tộc nếu đã nhắc đến hội đồng quản trị, PR, cổ phần, luật sư hoặc khủng hoảng hình ảnh.
- Sau khi đặt tên công ty/gia tộc, phải giữ nhất quán trong cả chương và phần kỹ thuật.
- Phần BẢN PHÂN TÍCH KỸ THUẬT / KHÔNG ĐĂNG phải viết sạch, rõ, ưu tiên tiếng Việt tự nhiên.
- Nội dung mô tả trong phần kỹ thuật không được lẫn từ Anh-Việt kiểu "in/print", "or".

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
3. Có đi lệch khỏi GENRE LOCK, PREMISE DIVERSITY LOCK, CHARACTER NAME DIVERSITY LOCK hoặc HEROINE LOCK không? Nếu lệch thể loại/premise/tên/kiểu nữ chính, phải sửa.
4. Nếu Prompt idea trống, chương có tự động dùng hot search không cần thiết không? Nếu có, đổi sang hook phù hợp thể loại.
5. Có dùng lại tên mặc định như Lâm An Nhiên/Lục Thịnh/Lục Hạo/Tề Dương/Mã Lan không? Nếu có, đổi sang bộ tên mới.
6. Nam phản diện có đủ hiện diện chưa? Nếu mẹ chồng/gia tộc gánh hết vai phản diện, thêm 1–2 câu thoại hoặc hành động sắc cho nam phản diện.
7. Nhân vật hỗ trợ có giải quyết thay nữ chính không? Nếu có, giảm vai trò và chuyển quyết định chính về nữ chính.
8. Nếu mức uất ức >= 4, có câu sỉ nhục trực diện đủ lực chưa? Nếu chưa, thêm một câu gắn với danh phận/quyền lợi/xuất thân.
9. Có câu nào giống phân tích kỹ thuật trong BẢN ĐỌC không? Nếu có, phải biến thành cảnh.
10. Có từ sai bối cảnh như "tweet Weibo" không? Nếu có, sửa thành "bài đăng Weibo".
11. Có đoạn nào lan man, chỉ giải thích mà không đẩy truyện không? Nếu có, cắt hoặc viết lại.
12. Có xả quá nhiều bằng chứng không? Nếu có, giữ lại tối đa 1–2 mảnh, phần còn lại để chương sau.
13. Kết chương có đúng ENDING STRATEGY và đủ hook để đọc tiếp không? Nếu chưa, viết lại đoạn cuối.
14. BẢN ĐỌC có đọc như truyện thật không? Nếu còn như outline/tóm tắt, viết lại thành cảnh có hành động và đối thoại.
15. Có hành động/chuyển cảnh nào mơ hồ không? Nếu có, sửa để rõ chủ thể: điện thoại rung, cửa mở, tin nhắn đến, người bước vào.
16. Có bằng chứng nào xuất hiện quá tiện không? Nếu có, thêm một lý do ngắn, hợp lý vì sao nữ chính có được bằng chứng đó.
17. Có tên công ty/gia tộc/tập đoàn chưa nếu chương đã nhắc PR, hội đồng quản trị, cổ phần hoặc luật sư? Nếu chưa, đặt tên cụ thể và giữ nhất quán.
18. Phần kỹ thuật có lẫn Anh-Việt không? Nếu có, sửa sang tiếng Việt tự nhiên.
19. Có câu văn nào quá giống AI, ẩn dụ dài hoặc quá trau chuốt không? Nếu có, rút gọn thành câu ngắn, sắc, dễ đọc.
20. Nếu là Chương 1, phần kỹ thuật đã có "Tên truyện đề xuất" chưa? Nếu chưa, tự đặt tên truyện phù hợp với premise, không lấy tên chương làm tên truyện.

QUY TẮC CHẤT LƯỢNG BẮT BUỘC:
- Bắt buộc đặt tên riêng rõ ràng cho ít nhất 3 nhân vật quan trọng.
- Nếu có chồng/nam phản diện, phải có tên riêng.
- Nếu có người phụ nữ thứ ba, phải có tên riêng.
- Không dùng đại từ "anh", "cô ta", "bà ấy" quá lâu mà không nhắc lại tên.
- Bắt buộc có ít nhất 1 chi tiết đô thị Trung Quốc: Weibo hot search hashtag nếu hợp thể loại, tập đoàn, cổ phần, hợp đồng, pháp vụ, hội đồng quản trị, RMB/tệ, luật sư, bệnh viện, trường học, hoặc gia tộc.
- Nếu nhắc hot search, hãy viết hashtag cụ thể.
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
- Giữ đúng premise theo thể loại.
- Giữ đúng kiểu nữ chính đã chọn.
- Nữ chính có cảm xúc nhưng không yếu đuối kéo dài, chưa toàn thắng quá sớm.
- Nếu có cảnh hội đồng/quản trị/pháp vụ, phải có đối thoại ép ký, đe dọa kiện, và phản đòn ngắn sắc của nữ chính.
- Cuối chương phải có hook mạnh để đọc tiếp. Nếu ENDING STRATEGY là tự chọn, hãy tự chọn ending hợp mạch truyện nhất. Nếu ENDING STRATEGY có kiểu cụ thể, hãy theo tinh thần kiểu đó.

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
