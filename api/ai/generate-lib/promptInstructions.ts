import type { NormalizedGeneratePayload, StoryMotifFingerprint } from './types.js'
import { safeText } from './textUtils.js'
import { formatMotifFingerprint, formatStoryPlanForPrompt } from './storyPlanUtils.js'

export function getModuleInstruction(moduleId?: string) {
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
- Có thể dùng Weibo, Douyin, hot search, Thượng Hải/Bắc Kinh/Thâm Quyến, tập đoàn, hội đồng quản trị, luật sư, hợp đồng, cổ phần, RMB/tệ.
- Không dùng vibe Việt Nam, không dùng tên Việt.
- Tên nhân vật nên theo Trung Quốc hiện đại.

Vibe truyện:
- Nữ chính bị sỉ nhục/ép im lặng nhưng giữ được tự trọng.
- Phản diện có quyền lực gia tộc/công ty/truyền thông.
- Trả thù bằng bằng chứng, hợp đồng, truyền thông, pháp lý, cổ phần, nhân chứng.
- Không để nữ chính khóc lóc yếu đuối quá lâu.
- Không để nữ chính thắng sạch quá sớm.

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

export function getGenreInstruction(genreLabel: string) {
  const genre = safeText(genreLabel).toLowerCase()

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

  if (genre.includes('hào môn') || genre.includes('liên hôn') || genre.includes('gia tộc')) {
    return `
GENRE LOCK: Hào môn / liên hôn / gia tộc
- Trọng tâm bắt buộc: quyền lực gia tộc, liên hôn, thể diện, tài sản, cổ phần, danh phận, phu nhân, lão phu nhân.
- Không khí phải sang, lạnh, áp lực, nhiều quy tắc ngầm.
- Cảnh nên có biệt thự, sảnh tiệc, phòng họp gia tộc, hoặc hội sở tập đoàn.
- Nữ chính bị ép bởi danh phận nhưng không được hèn yếu.
- Không để tình tiết thành ngoại tình đơn thuần; ngoại tình chỉ là ngòi nổ nếu có.
`.trim()
  }

  if (
    genre.includes('hot search') ||
    genre.includes('showbiz') ||
    genre.includes('pr scandal') ||
    genre.includes('livestream')
  ) {
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
- Trọng tâm bắt buộc: tình thân, bảo vệ con, quyền nuôi con, áp lực gia đình, bí mật thân thế của con.
- Nữ chính mạnh nhưng không lạnh hoàn toàn.
- Nếu có con nhỏ, đứa trẻ phải phục vụ cốt truyện, không làm đạo cụ dễ thương ngẫu nhiên.
- Cảnh mạnh nên có: tranh quyền nuôi con, bệnh viện, trường học, gia đình chồng gây áp lực, dư luận công kích mẹ con.
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

  if (genre.includes('đổi tráo') || genre.includes('danh phận')) {
    return `
GENRE LOCK: Đổi tráo danh phận / hào môn
- Trọng tâm bắt buộc: thân phận thật giả, thiên kim giả, người thay thế, danh phận bị cướp, gia tộc nhận nhầm người.
- Không hé thân phận thật quá sớm.
- Mỗi chương chỉ hé một sơ hở: thói quen, di vật, ảnh cũ, xét nghiệm, lời người hầu, hồ sơ bị sửa.
- Nữ chính phải từng bước lấy lại vị trí, không thắng sạch trong một chương.
`.trim()
  }

  if (genre.includes('hôn nhân') && (genre.includes('phản bội') || genre.includes('ngoại tình'))) {
    return `
GENRE LOCK: Hôn nhân phản bội / ngoại tình
- Trọng tâm bắt buộc: lòng tin hôn nhân bị phá vỡ, người thứ ba, ảnh/tin nhắn/khách sạn, gia đình hai bên, thể diện xã hội.
- Nữ chính được đau nhưng không được khóc lóc quá lâu. Cảm xúc phải biến thành sự tỉnh táo.
- Phản công nên đi bằng bằng chứng: ảnh, hóa đơn, camera, lịch sử đặt phòng, tài sản chung, hợp đồng, luật sư, sao kê, nhân chứng.
- Không xả hết bằng chứng ngay chương đầu.
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

export function getPremiseInstruction(payload: NormalizedGeneratePayload) {
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

  return `
${common}

DEFAULT PREMISE THEO THỂ LOẠI:
- Hãy chọn hook phù hợp với thể loại đã chọn, không tự động dùng hot search nếu không cần.
- Ưu tiên cảnh có hành động cụ thể: phòng họp, bữa cơm, khách sạn, bệnh viện, văn phòng luật, sảnh tiệc, hợp đồng, di vật, camera, hồ sơ, hoặc người đưa tin bí mật.
`.trim()
}

export function getHeroineInstruction(styleLabel: string) {
  const style = safeText(styleLabel).toLowerCase()

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

  if (style.includes('mẹ') || style.includes('bảo vệ con')) {
    return `
HEROINE LOCK: Người mẹ bảo vệ con
- Động lực lớn nhất của nữ chính là bảo vệ con và giữ phẩm giá.
- Cô có thể mềm với con nhưng cứng với người làm hại con.
- Xung đột nên có chiều sâu cảm xúc, không chỉ trả thù lạnh.
- Nếu có con nhỏ, đứa trẻ phải ảnh hưởng trực tiếp đến lựa chọn của nữ chính.
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

  if (style.includes('gom bằng chứng') || style.includes('im lặng')) {
    return `
HEROINE LOCK: Im lặng gom bằng chứng
- Nữ chính không phản ứng quá sớm, cô để đối phương tưởng mình yếu.
- Cô âm thầm lưu ảnh, ghi âm, giữ hóa đơn, sao kê, camera hoặc hợp đồng.
- Càng bị ép, cô càng có thêm dữ liệu để phản công.
- Khi tung bằng chứng, chỉ tung một phần đủ làm đối phương rối loạn.
`.trim()
  }

  return `
HEROINE LOCK: Nữ chính đô thị hiện đại
- Nữ chính có tự trọng, có cảm xúc, nhưng không yếu đuối kéo dài.
- Cô phải có lựa chọn chủ động trong chương.
- Không để nam chính hoặc nhân vật phụ giải quyết thay toàn bộ vấn đề.
`.trim()
}

export function getNameDiversityInstruction(payload: NormalizedGeneratePayload) {
  return `
CHARACTER NAME DIVERSITY LOCK:
- Name seed của lần tạo này: ${payload.nameSeed}
- Mỗi truyện mới phải tự tạo bộ tên nhân vật mới dựa trên seed này.
- Không được mặc định dùng lại các tên ví dụ cũ như: Lâm An Nhiên, Lục Thịnh, Lục Hạo, Tề Dương, Mã Lan, Hàn Liễu, Triệu Vũ.
- Không được dùng họ Lục hoặc họ Lâm quá thường xuyên.
- Nếu Prompt idea không chỉ định tên nhân vật, hãy tự tạo tên Trung Quốc hiện đại khác nhau cho từng truyện.
- Bộ tên phải nhất quán trong cùng một truyện, nhưng giữa các truyện mới phải khác nhau.
- Ưu tiên đa dạng họ: Giang, Tô, Hứa, Thẩm, Cố, Tống, Ninh, Ôn, Bạch, Trình, Diệp, Phó, Hạ, Chu, Kỷ, Mạnh, Đường, Dư, Tạ, Tần, Hàn, La, Mộ, Tưởng, Lạc, Viên.
`.trim()
}


export function getTitleNamingInstruction(payload: NormalizedGeneratePayload) {
  const seed = payload.storySeed
  const chapterNumber = Math.max(1, Math.floor(payload.nextChapterNumber || 1))
  const currentPlan = seed?.storyPlan?.chapterPlan?.find(
    (chapter) => chapter.chapterNumber === chapterNumber,
  )

  return `
TITLE & CHAPTER NAMING LOCK — BẮT BUỘC:

Mục tiêu:
- Tên truyện phải thể hiện đúng nội dung truyện, không chỉ nghe văn vẻ.
- Tên chương phải thể hiện đúng biến cố/vật chứng/cú ép/state change của chương đó.
- Tên truyện và tên chương phải giúp admin/độc giả nhìn vào là đoán được trục drama chính.

DỮ LIỆU ĐỂ ĐẶT TÊN:
- Tên truyện hiện tại từ payload: ${payload.title}
- Tên truyện từ storySeed nếu có: ${seed?.title || 'Không có'}
- Core premise: ${seed?.corePremise || payload.promptIdea || payload.storySummary || 'Không có'}
- Evidence object: ${seed?.evidenceObject || 'Không có'}
- Inciting incident: ${seed?.incitingIncident || 'Không có'}
- Main conflict: ${seed?.mainConflict || 'Không có'}
- Hidden truth: ${seed?.hiddenTruth || 'Không có'}
- Current chapter plan title: ${currentPlan?.title || 'Không có'}
- Current chapter mission: ${currentPlan?.mission || 'Không có'}
- Current evidence beat: ${currentPlan?.evidenceBeat || 'Không có'}
- Current power shift: ${currentPlan?.powerShift || 'Không có'}
- Current ending hook: ${currentPlan?.endingHook || 'Không có'}

QUY TẮC TÊN TRUYỆN:
1. Tên truyện phải bám 1 trong 4 thứ thật sự xuất hiện sớm trong chương 1–2:
   - vật chứng trung tâm,
   - biến cố kích hoạt,
   - bí mật lõi,
   - áp lực chính mà nữ chính phải chống lại.
2. Nếu tên truyện chứa một vật thể cụ thể như “chiếc hộp”, “tờ giấy”, “USB”, “bức ảnh”, “đoạn ghi âm”, “chiếc nhẫn”, “vé máy bay”, “bảng phân ca”, “mã hồ sơ”, thì vật đó bắt buộc phải là vật chứng trung tâm xuất hiện rõ trong chương 1 hoặc chương 2.
3. Cấm đặt tên truyện bằng vật thể chưa xuất hiện trong storySeed/chapterPlan/chương mở đầu. Ví dụ: không được đặt “Bí Mật Trong Chiếc Hộp Cũ” nếu truyện không có chiếc hộp cũ làm vật chứng thật.
4. Không đặt tên truyện quá chung, mềm, sáo hoặc không phản ánh plot như: “Nụ Cười Của Người Chiến Thắng”, “Ngày Tôi Tỉnh Giấc”, “Khi Sự Thật Lên Tiếng”, “Bí Mật Bị Chôn Vùi” nếu không có chi tiết cụ thể đi kèm.
5. Ưu tiên tên truyện có hook cụ thể: “Tờ Giấy Không Nên Xuất Hiện”, “Bảng Phân Ca Lúc Hai Giờ Sáng”, “Chữ Ký H.K”, “Mã Hồ Sơ Bị Đổi”, “Vé Máy Bay Không Có Tên Tôi”.
6. Trong phần kỹ thuật, nếu tên payload/storySeed không khớp nội dung, phải đề xuất tên truyện mới khớp hơn.

QUY TẮC TÊN CHƯƠNG:
1. Tiêu đề chương phải ngắn, cụ thể, có hook, và phản ánh biến cố chính của chính chương đó.
2. Tiêu đề chương nên lấy từ 1 trong các nhóm:
   - vật chứng chính: “Vết Mực Xanh”, “Mã Kho A-7392”, “USB Trong Túi Áo”;
   - biến cố cụ thể: “Quỹ Điều Trị Bị Khóa”, “Thẻ Truy Cập Vô Hiệu”;
   - thời hạn/địa điểm: “Bốn Mươi Tám Giờ”, “Kho Lưu Trữ Tòa A”, “Phòng B Lúc Mười Giờ”;
   - nhân vật/đòn phản diện: “Chữ Ký H.K”, “Tin Nhắn Của Tạ Ninh”;
   - state change: “Hai Tiếng Tạm Hoãn”, “Nhân Chứng Đổi Phe”.
3. Cấm tiêu đề chương kiểu phân tích, chung chung hoặc giống headline nội bộ:
   - “Cú ép đầu tiên và tổn thương thật”
   - “Đổi sân khấu, không đổi mục tiêu”
   - “Cú đáp trả bất ngờ”
   - “Ván cờ mới bắt đầu”
   - “Sự thật dần hé lộ”
   - “Một bước ngoặt mới”
   - “Áp lực tăng cao”
4. Nếu bản nháp có tiêu đề chương chung chung, phải tự đổi thành tiêu đề bám vật chứng/biến cố cụ thể trước khi trả output.
5. Không được bỏ tiêu đề chương. Mỗi BẢN ĐỌC phải có đúng dòng: “# Chương ${chapterNumber} — [tên chương cụ thể]”.
6. Tên chương không được trùng tên truyện trừ Chương 1 có chủ đích rất rõ.

KIỂM TRA CUỐI:
- Trước khi trả output, hãy tự hỏi: “Tên truyện này có nói đúng truyện đang viết không?” và “Tên chương này có nói đúng chương này xảy ra gì không?”. Nếu không, sửa ngay.
`.trim()
}


export function getStorySeedInstruction(payload: NormalizedGeneratePayload) {
  const seed = payload.storySeed

  if (!seed) {
    return `
STORY SEED / STORY DNA:
- Không có storySeed được truyền vào request này.
- Vẫn phải tự tạo premise, bối cảnh, vật chứng, nhân vật và nhịp chương khác biệt.
- Không được dùng một khung truyện cố định rồi chỉ thay vài danh từ.
`.trim()
  }

  const motifBlock = seed.motifFingerprint
    ? `
MOTIF FINGERPRINT CỦA TRUYỆN NÀY:
${formatMotifFingerprint(seed.motifFingerprint)}

MOTIF TEXT:
${seed.motifText || 'Không có motifText.'}
`.trim()
    : ''

  const storyPlanBlock = formatStoryPlanForPrompt(
    seed.storyPlan,
    payload.nextChapterNumber,
    payload.chapterTarget,
  )

  return `
STORY SEED / STORY DNA BẮT BUỘC:
- Đây là xương sống của truyện, không phải gợi ý phụ.
- OpenAI bắt buộc phải bám các chi tiết này khi viết chương.
- Nếu storySeed khác, cấu trúc cảnh, vật chứng, áp lực, nhân vật và hook cũng phải khác rõ rệt.
- Nếu storySeed mâu thuẫn với genreLabel hoặc promptIdea, ưu tiên storySeed.

THÔNG TIN STORY SEED:
- Tên truyện định hướng: ${seed.title || payload.title}
- Genre blend: ${seed.genreBlend?.join(' | ') || payload.genreLabel}
- Core premise: ${seed.corePremise || payload.promptIdea || payload.storySummary}
- Opening scene bắt buộc: ${seed.openingScene || 'Tự chọn theo premise'}
- Inciting incident bắt buộc: ${seed.incitingIncident || 'Tự chọn theo premise'}
- Evidence object bắt buộc: ${seed.evidenceObject || 'Tự chọn vật chứng hợp logic'}
- Main conflict: ${seed.mainConflict || payload.genreLabel}
- Hidden truth: ${seed.hiddenTruth || 'Giữ một bí mật chưa lộ hết'}
- Setting: ${seed.setting || 'Đô thị hiện đại Trung Quốc'}
- Villain type: ${seed.villainType || 'Phản diện có lợi ích cụ thể'}
- Heroine arc: ${seed.heroineArc || payload.mainCharacterStyleLabel}
- Emotional hook: ${seed.emotionalHook || 'Bị phản bội nhưng dần tỉnh táo'}
- Power structure: ${seed.powerStructure || 'Gia đình / công ty / dư luận'}
- Public pressure: ${seed.publicPressure || 'Áp lực công khai phù hợp bối cảnh'}
- Short fingerprint: ${seed.shortFingerprint || 'Không có'}
- Anti-repeat tags: ${seed.antiRepeatTags?.join(' | ') || 'Không có'}

${motifBlock}

${storyPlanBlock}

QUY TẮC BÁM STORY SEED:
- Chương phải dùng đúng opening scene hoặc biến thể rất gần với opening scene.
- Inciting incident phải là sự kiện kích hoạt chính, không thay bằng scandal generic nếu seed không yêu cầu.
- Evidence object phải xuất hiện tự nhiên và có vai trò đẩy xung đột.
- Hidden truth chỉ hé một phần, không xả hết ngay nếu chưa phải chương cuối.
- Không được biến mọi truyện thành cùng motif ngoại tình/hot search nếu storySeed đang chỉ hướng khác.
`.trim()
}

export function getGlobalMotifUniquenessInstruction(payload: NormalizedGeneratePayload) {
  const avoidMotifLines = payload.avoidMotifs.slice(0, 30).map((item) => `  - ${item}`)
  const avoidMotifTextLines = payload.avoidMotifTexts.slice(0, 20).map((item) => `---\n${item}`)
  const avoidFingerprintLines = payload.avoidMotifFingerprints
    .slice(0, 20)
    .map((item, index) => `MOTIF CŨ ${index + 1}:\n${formatMotifFingerprint(item)}`)

  const seedMotif = payload.storySeed?.motifFingerprint
    ? formatMotifFingerprint(payload.storySeed.motifFingerprint)
    : ''

  return `
GLOBAL MOTIF UNIQUENESS LOCK:
- Nhiệm vụ quan trọng: không được tạo truyện/chương chỉ khác tên nhân vật nhưng cùng mô-típ với truyện cũ.
- Một truyện bị xem là TRÙNG nếu giống từ 3 yếu tố trở lên trong các nhóm:
  opening arena, inciting incident, evidence type, villain attack type, heroine counter type, public pressure, hidden truth type, deadline style, main power structure.
- Nếu thấy motif gần giống truyện cũ, phải tự đổi ít nhất 5 yếu tố: opening arena, inciting incident, evidence object, villain attack, heroine counter, public pressure, hidden truth.
- Nếu STORY SEED đã có motifFingerprint, tuyệt đối không tự kéo nó về các combo motif đã dùng nhiều trong thư viện.

MOTIF CỦA REQUEST NÀY:
${seedMotif || '- Chưa có motifFingerprint cụ thể.'}

MOTIF/PREMISE CẦN TRÁNH TỪ THƯ VIỆN:
${avoidMotifLines.join('\n') || '  - Không có danh sách motif text ngắn.'}

MOTIF DNA CẦN TRÁNH:
${avoidFingerprintLines.join('\n\n') || '- Không có motif fingerprint cũ.'}

MOTIF TEXT CẦN TRÁNH:
${avoidMotifTextLines.join('\n\n') || '- Không có motifText cũ.'}

CẤM LẶP COMBO:
- hồ sơ nhận nuôi + cô nhi viện + con dấu + niêm phong + 48 giờ
- sân bay + vé máy bay + di chúc/công chứng + hội đồng quản trị
- viện dưỡng lão + hồ sơ bệnh án + đơn ly hôn + họp cổ đông
- hầm xe + phong thư cũ + hồ sơ nhận con nuôi + nhóm phụ huynh
- livestream + bình luận lạ + di chúc/cổ phần + họp báo
- khách sạn + ngoại tình + hóa đơn phòng + camera hành lang
- bệnh viện + xét nghiệm ADN + quyền nuôi con + gia đình chồng

Chương mới phải làm rõ sự khác biệt motif bằng cảnh, vật chứng, phản diện tấn công và cách nữ chính phản công.
`.trim()
}

export function getOpenAIAntiRepeatInstruction(payload: NormalizedGeneratePayload) {
  return `
OPENAI ANTI-REPEAT LOCK:
- Không được dùng lại văn mẫu hoặc nhịp chương quá giống các truyện khác.
- Cấm mở chương bằng các khung quá quen:
  + "Tối đó, tôi..."
  + "Sáng hôm đó, tôi..."
  + "Tôi đứng trước..."
  + "Tôi không đứng trước..."
  + "Điện thoại reo liên tục..."
  + "Weibo nổ tung..." nếu storySeed không yêu cầu truyền thông.
- Cấm dùng lại cấu trúc:
  phát hiện vật chứng → người đối diện hỏi "Cô lấy thứ đó ở đâu?" → nữ chính hít sâu → tung một câu sắc → cliffhanger.
- Cấm dùng các câu đệm lặp:
  + "Tôi hít sâu một hơi"
  + "Tôi siết chặt tay"
  + "Căn phòng im bặt"
  + "Mọi ánh mắt đổ dồn về phía tôi"
  + "Tôi biết, mọi chuyện chỉ vừa bắt đầu"
- Không được dùng cùng một kiểu vật chứng cho nhiều truyện liên tiếp nếu avoidMotifs hoặc storySeed đã khác.
- Không được chỉ thay openingScene/evidenceObject vào cùng một đoạn văn.

YÊU CẦU RIÊNG CHO REQUEST NÀY:
- Factory run id: ${payload.factoryRunId || 'không có'}
- Story index: ${payload.storyIndex}
- Chapter target: ${payload.chapterTarget || 'không có'}
- Chương hiện tại: ${payload.nextChapterNumber}
`.trim()
}

export function getLibraryAvoidanceInstruction(payload: NormalizedGeneratePayload) {
  const hasAvoidance =
    payload.avoidStoryTitles.length ||
    payload.avoidMotifs.length ||
    payload.avoidMotifTexts.length ||
    payload.avoidMotifFingerprints.length ||
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
- Motif DNA cần tránh: ${payload.avoidMotifFingerprints.length} motif fingerprint.
- Motif text cần tránh: ${payload.avoidMotifTexts.length} motif text.
- Tên nhân vật cần tránh:
${payload.avoidCharacterNames.map((item) => `  - ${item}`).join('\n') || '  - Không có'}
- Tên công ty/gia tộc cần tránh:
${payload.avoidCompanyNames.map((item) => `  - ${item}`).join('\n') || '  - Không có'}
- Nhiệm vụ: tạo truyện mới khác đáng kể, không chỉ đổi tên.
`.trim()
}

export function getCliffhangerRule(payload: NormalizedGeneratePayload) {
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
- Nếu chương trước đã kết bằng bằng chứng, chương này nên ưu tiên phản công/đối đầu/cú đảo chiều để tránh lặp.
- Ending phải tự nhiên, không được ghi thẳng tên loại ending.
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

export function buildStoryContext(payload: NormalizedGeneratePayload) {
  const memory = safeText(payload.storyMemory, '')

  const recentChapters = Array.isArray(payload.recentChapters)
    ? payload.recentChapters.slice(0, 4)
    : []

  const chapterText = recentChapters
    .map((chapter, index) => {
      const title = safeText(chapter.title, `Chương gần nhất ${index + 1}`)
      const summary = safeText(chapter.summary, '')
      const content = safeText(chapter.content, '')
      const compactContent = content.length > 1600 ? `${content.slice(0, 1600)}...` : content

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

function getTargetPhase(params: { chapter: number; target: number }) {
  const { chapter, target } = params
  if (target <= 0) return 'unknown'
  if (chapter <= 1) return 'opening'
  if (chapter >= target) return 'final'
  const progress = chapter / target
  if (progress <= 0.22) return 'opening'
  if (progress <= 0.48) return 'escalation'
  if (progress <= 0.72) return 'midpoint'
  if (progress <= 0.9) return 'preFinal'
  return 'finalRun'
}

function getTargetMilestone(params: { chapter: number; target: number }) {
  const { chapter, target } = params
  const phase = getTargetPhase(params)
  const label = target > 0 ? `Chương ${chapter}/${target}` : `Chương ${chapter}`

  if (phase === 'opening') {
    return `${label} — PHA MỞ HOOK: mở cú ép mạnh, cài vật chứng/trục xung đột, cho nữ chính phản đòn nhỏ nhìn thấy được.`
  }
  if (phase === 'escalation') {
    return `${label} — PHA LEO THANG: hậu quả lan sang đời sống/người thân/công việc, đổi chiến trường, phản diện thắng một nhịp thật.`
  }
  if (phase === 'midpoint') {
    return `${label} — PHA ĐẢO CHIỀU GIỮA TRUYỆN: nữ chính không chỉ xác minh nữa mà bắt đầu đặt bẫy/chủ động ép quy trình.`
  }
  if (phase === 'preFinal' || phase === 'finalRun') {
    return `${label} — PHA DỒN CAO TRÀO: gom đầu mối, buộc người đứng giữa chọn phe, trả payoff từng phần, không mở tuyến mới lớn.`
  }
  if (phase === 'final') {
    return `${label} — PHA KẾT: trả đủ bằng chứng, cảm xúc và hậu quả; phản diện phải trả giá rõ.`
  }
  return label
}

export function getChapterMissionInstruction(payload: NormalizedGeneratePayload) {
  const chapter = Math.max(1, Math.floor(payload.nextChapterNumber || 1))
  const target = payload.chapterTarget > 0 ? Math.floor(payload.chapterTarget) : 0
  const phase = getTargetPhase({ chapter, target })
  const milestone = getTargetMilestone({ chapter, target })
  const isFinal = target > 0 && chapter >= target
  const isNearFinal = target > 0 && chapter >= Math.max(1, target - 1)

  if (chapter === 1) {
    return `
CHAPTER MISSION LOCK — TARGET-AWARE:
- ${milestone}
- 150 chữ đầu phải kéo người đọc: có lời buộc tội/đòn ép/vật chứng/hậu quả cụ thể, không mở bằng tả cảnh dài.
- Trong 3 đoạn đầu phải rõ: ai ép nữ chính, ép bằng gì, nếu thua cô mất gì.
- Trong chương 1 phải có một cú phản đòn nhỏ có kết quả nhìn thấy được: giữ được vật chứng, bắt đối phương nói hớ, buộc quy trình dừng, khiến một người đổi thái độ, hoặc làm phản diện mất nhịp.
- Không giải thích toàn bộ âm mưu. Không thắng sạch. Không để nữ chính chỉ chịu nhục rồi hứa điều tra.
- Kết chương phải có việc phải làm ngay ở chương 2, không kết bằng câu “mọi chuyện mới bắt đầu”.
`.trim()
  }

  if (isFinal) {
    return `
CHAPTER MISSION LOCK — TARGET-AWARE:
- ${milestone}
- Đây là chương cuối theo target ${target}. Phải đóng mâu thuẫn chính, không viết kiểu còn thiếu chương.
- Trả payoff chính: ai dựng chuyện, dựng bằng cách nào, động cơ là gì, nữ chính lấy lại điều gì.
- Phản diện phải chịu hậu quả rõ: mất quyền, mất đồng minh, bị công khai, bị pháp lý/nội bộ xử lý, hoặc bị buộc nhận trách nhiệm.
- Không mở thêm tuyến bí mật lớn. Nếu có dư âm, chỉ là dư vị sau chiến thắng, không phải vụ mới.
`.trim()
  }

  if (isNearFinal) {
    return `
CHAPTER MISSION LOCK — TARGET-AWARE:
- ${milestone}
- Đây là chương sát cuối theo target ${target}. Nhiệm vụ là dồn tất cả về sân khấu đối chất/payoff cuối.
- Không thêm vật chứng mới lạc tuyến. Chỉ gom và đảo nghĩa những gì đã cài.
- Phải buộc phản diện hoặc đồng minh của phản diện lộ một lỗi không thể chối.
- Cuối chương phải mở thẳng vào cảnh kết: cuộc họp, buổi công bố, đối chất gia tộc/công ty/trường/hội đồng.
`.trim()
  }

  if (phase === 'opening') {
    return `
CHAPTER MISSION LOCK — TARGET-AWARE:
- ${milestone}
- Mỗi chương đầu phải có cú kéo mới, không được chỉ nhắc lại biến cố chương 1.
- Chương này phải mở một hậu quả đời sống hoặc một đường xác minh mới, nhưng chỉ chọn 1 vật chứng chính + 1 vật chứng phụ.
- Phải đổi cảnh hoặc đổi mục tiêu so với chương trước: người thân, trường học, công ty, nhà gia tộc, bệnh viện, hợp đồng, nhân chứng, hoặc nơi giữ vật chứng.
- Không được chỉ ngồi gọi điện/đọc file/đợi kiểm tra.
`.trim()
  }

  if (phase === 'escalation') {
    return `
CHAPTER MISSION LOCK — TARGET-AWARE:
- ${milestone}
- Phản diện phải gây thiệt hại thật, không chỉ dọa: người thân bị kéo vào, quyền bị chặn, nhân chứng bị ép đổi lời, bằng chứng bị tráo, người trung lập nghiêng phe.
- Nữ chính phải hành động chủ động trong cảnh: ép ký biên bản, giữ bản gốc, đặt câu hỏi bẫy, cố tình chịu một thiệt hại nhỏ để đổi lấy sơ hở.
- Chương phải có ít nhất một state change ngay trong cảnh, không chỉ thêm đầu mối.
- Tránh lặp chuỗi kỹ thuật email/header/log/metadata/tài khoản nếu chương trước đã dùng.
`.trim()
  }

  if (phase === 'midpoint') {
    return `
CHAPTER MISSION LOCK — TARGET-AWARE:
- ${milestone}
- Đây là đoạn giữa truyện, phải có đảo chiều hoặc bẫy chủ động. Nữ chính không còn chỉ đi xác minh.
- Một bằng chứng cũ phải đổi nghĩa, hoặc một nhân vật đứng giữa phải bị buộc chọn phe.
- Phản diện phải phản ứng có cá tính: ra mặt, ép điều kiện, đe dọa có giá, hoặc tự lộ vì nóng vội.
- Chương phải có dopamine rõ: người đọc thấy thế trận đổi, không chỉ thấy thêm dữ liệu.
`.trim()
  }

  return `
CHAPTER MISSION LOCK — TARGET-AWARE:
- ${milestone}
- Giai đoạn này phải dồn về payoff: gom đầu mối, đối chất, buộc phản diện/đồng minh nói sai, trả một phần công bằng cho người bị hại.
- Không mở thêm phe mới/vụ mới nếu target còn ít chương.
- Mỗi chương phải trả ít nhất một điểm đã cài: tên người, động cơ, bản gốc, nhân chứng, quyền bị lấy lại, hoặc đồng minh phản diện lung lay.
- Cuối chương phải đẩy thẳng sang cao trào kế tiếp bằng hành động cụ thể.
`.trim()
}

export function getLongRunPacingInstruction(payload: NormalizedGeneratePayload) {
  const chapter = Math.max(1, Math.floor(Number(payload.nextChapterNumber || 1)))
  const target = Math.max(0, Math.floor(Number(payload.chapterTarget || 0)))
  const phase = getTargetPhase({ chapter, target })
  const milestone = getTargetMilestone({ chapter, target })

  const targetShape = target > 0
    ? `Truyện này được khóa target ${target} chương. Không được viết như mặc định 15 chương. Mọi nhịp mở - leo thang - đảo chiều - cao trào - kết phải nén/giãn theo đúng target ${target}.`
    : `Chưa có target rõ. Vẫn phải tự giữ nhịp mở - leo thang - đảo chiều - payoff, không kéo dài bằng thủ tục.`

  const phaseRule = phase === 'opening'
    ? `
- Pha mở: hook phải cực nhanh. Mở bằng biến cố, lời ép, vật chứng hoặc hậu quả; không tả không khí quá 2 câu liên tiếp.
- Mỗi chương đầu phải có một cú trả đũa nhỏ hoặc cú chặn nhỏ, để độc giả thấy nữ chính không chỉ chịu trận.
- Không xả âm mưu, chỉ cài 1–2 chi tiết lệch đủ tò mò.`
    : phase === 'escalation'
      ? `
- Pha leo thang: phản diện phải đánh vào đời sống thật, không chỉ gửi tin nhắn dọa.
- Đổi chiến trường rõ: nếu chương trước là giấy/email/log, chương này ưu tiên người thật, biên nhận, lời khai, gia đình, trường học, công ty, hiện trường.
- Không để 2 chương liên tiếp cùng kết bằng “tạm hoãn/tạm khóa”.`
      : phase === 'midpoint'
        ? `
- Pha giữa truyện: bắt buộc có đảo chiều. Nữ chính phải chủ động dựng bẫy hoặc ép đối phương tự lộ.
- Phải có một thắng lợi nhỏ hoặc một mất mát lớn đổi lấy manh mối lớn.
- Người trung lập không được xuất hiện quá tiện; nữ chính phải tạo điều kiện khiến họ không thể làm ngơ.`
        : phase === 'final' || phase === 'finalRun' || phase === 'preFinal'
          ? `
- Pha cao trào/kết: gom và trả, không mở rộng.
- Mỗi chương phải trả một payoff rõ, không chỉ “sắp có kết quả”.
- Phản diện phải mất thứ cụ thể: quyền nói dối, quyền thao túng, đồng minh, vị trí, hợp đồng, hoặc danh dự.`
          : `
- Giữ nhịp mỗi chương có hook - áp lực - hành động - state change - hook cuối.`

  return `
LONG-RUN PACING LOCK — RANDOM TARGET 8–20 CHƯƠNG:
- ${targetShape}
- Vị trí hiện tại: ${milestone}
${phaseRule}

LUẬT GIỮ CHÂN ĐỘC GIẢ TỪNG CHƯƠNG:
- 150 chữ đầu phải có câu kéo mắt: ai đó đã khóa, ném, đọc lớn, gửi nhầm, ép ký, ép xin lỗi, chặn cửa, công bố, gọi tên nữ chính trước đám đông.
- Trong 150 chữ đầu phải rõ “nếu nữ chính thua thì mất gì”: con, quyền, tiền, hợp đồng, danh dự, công việc, người thân, hoặc cơ hội sống còn.
- Cứ 600–900 chữ phải có một cú nhích thế trận: đối phương ép thêm, bằng chứng lệch, người đổi thái độ, nữ chính hỏi trúng điểm yếu, hoặc hậu quả rơi xuống.
- Mỗi chương phải có state change thật ở cuối. Không tính các câu kiểu “tôi biết mọi chuyện chưa kết thúc”, “tôi sẽ điều tra tiếp”.

LUẬT CHỐNG LẶP MOTIF DÀI HƠI:
- Cả truyện chỉ chọn 1–2 hệ vật chứng chính. Không gom email + header + log + USB + tài khoản ẩn + camera + metadata trong cùng một truyện nếu không thật cần.
- Nếu chương trước dùng kỹ thuật số, chương sau phải chuyển sang người sống/vật chứng đời thường/đối chất/hậu quả gia đình.
- Không để mỗi chương đều kết bằng tạm khóa/tạm hoãn/tạm dừng. Phải luân phiên: mất nhân chứng, mất niềm tin, bằng chứng bị tráo, người yếu thế bị ép rút lời, phản diện bị lộ sơ hở, hoặc nữ chính thắng một phần.
- Không dùng “người lao động nghèo bị ép làm nhân chứng/forward/in giấy” quá 1 lần trong một truyện. Sau đó chuyển sang tầng quyền lực khác: pháp chế, cổ đông, luật sư, phòng dữ liệu, người thân, người có quyền quyết định.
- Nữ chính không được chương nào cũng “không ký rồi lôi USB/log ra”. Phải đổi cách phản công: im lặng gài bẫy, buộc ký biên bản, để người trung lập tự phát hiện, giả vờ chịu thiệt, ép phản diện nói trước đám đông.

LUẬT VĂN PHONG RÕ RÀNG:
- Ưu tiên câu rõ, cụ thể, có chủ thể - hành động - hậu quả. Không dùng ẩn dụ tối nghĩa để làm đẹp văn.
- Tránh các hình ảnh mơ hồ kiểu “đường chỉ”, “mồi lửa”, “vết nứt trong lòng”, “dao trong tim” nếu không gắn với hành động cụ thể.
- Một đoạn văn tốt phải đẩy truyện: gây áp lực, hé vật chứng, đổi thái độ, làm nữ chính hành động, hoặc tạo hook.
- Không mở bằng recap/meta. Không viết “Hai câu tóm tắt nhanh”, “Tóm tắt chương trước”, “Ở chương trước”.
`.trim()
}


export function getChapterAdvancementInstruction(payload: NormalizedGeneratePayload) {
  return `
CHAPTER ADVANCEMENT LOCK:
- Mỗi chương phải là một bước tiến mới của truyện, không phải viết lại cùng một sự kiện bằng câu chữ khác.
- Recap chương trước tối đa 2 câu. Không được mở chương bằng cách kể lại toàn bộ file/email/vật chứng cũ như mới phát hiện.
- Nếu chương trước đã diễn ra ở sân bay/hầm xe/phòng VIP/phòng chờ, chương này phải đổi cảnh hoặc đổi mục tiêu rõ rệt.
- Bắt buộc có ít nhất 1 hành động mới không xuất hiện ở chương trước:
  + đến địa điểm mới
  + gặp nhân chứng mới
  + kiểm chứng vật chứng ở nơi khác
  + bị phản diện cắt một quyền lợi thật
  + đối chất trực tiếp
  + bước vào phòng họp/công ty/tòa/bệnh viện/trường học
  + công khai một phần bằng chứng
  + bị lộ một thông tin bất lợi thật
- Cấm vòng lặp chương:
  vật chứng cũ → gọi luật sư → bị đe dọa qua điện thoại → nhắc metadata → nữ chính nói sẽ thu thập → kết "trò chơi mới bắt đầu".
- Cấm nhiều chương liên tiếp chỉ xoay quanh cùng 1 file PDF, cùng 1 thẻ nhớ, cùng 1 phong thư, cùng 1 metadata.
- Nếu vẫn cần dùng vật chứng cũ, nó chỉ được làm nền; chương phải có hành động mới hoặc hậu quả mới.
- Mỗi chương chỉ có tối đa 1 vật chứng chính + 1 vật chứng phụ.
- Mỗi chương phải có một NEW EVIDENCE STEP: vật chứng cũ được kiểm chứng ở nguồn mới, lộ người mới, lộ thời điểm mới, hoặc dẫn tới hậu quả mới. Nếu không có bước mới, chương bị coi là lặp.
- Chương này phải trả lời câu hỏi: "Sau chương này, tình thế đã thay đổi ở điểm nào?"
`.trim()
}

export function getProgressionQualityInstruction() {
  return `
PROGRESSION QUALITY LOCK:
Trước khi viết chương, hãy nhìn 3 chương gần nhất và tự xác định:
- địa điểm chính đã dùng,
- loại bằng chứng đã dùng,
- kiểu phản diện tấn công,
- kiểu nữ chính phản công,
- deadline đã dùng,
- nhân vật phản diện đã xuất hiện trực tiếp.

Chương mới bắt buộc phải khác ít nhất 4/6 yếu tố trên.

Cấm lặp trong chương mới:
- cùng địa điểm chính,
- cùng loại bằng chứng,
- cùng kiểu đe dọa,
- cùng phản diện xuất hiện đúng lúc,
- cùng thao tác nữ chính chụp ảnh/lưu metadata/gọi luật sư,
- cùng kết chương bằng tin nhắn đếm ngược.

Mỗi chương mới phải có:
1. một hậu quả thật,
2. một hành động chủ động mới của nữ chính,
3. một thông tin mới làm đổi cách hiểu vụ việc,
4. một cảnh có con người bị ảnh hưởng, không chỉ giấy tờ,
5. một hook cuối chương cụ thể dẫn sang chương sau,
6. một payoff nhỏ ngay trong chương: người kia khựng lại, đám đông đổi thái độ, giấy tờ bị tạm dừng, quyền bị khóa, nhân chứng chịu nói, hoặc phản diện bị buộc lộ một sơ hở.
`.trim()
}

export function getSceneFunctionInstruction() {
  return `
SCENE FUNCTION LOCK:
Trước khi viết chương, hãy tự chọn đúng 1 chức năng chính cho chương này.

Các chức năng được phép:
1. Public Exposure: nữ chính bị công khai bôi nhọ trước đám đông.
2. Evidence Verification: nữ chính đi xác minh một vật chứng tại nguồn gốc.
3. Real Loss: phản diện khiến nữ chính mất một quyền lợi thật.
4. Witness Hunt: nữ chính tìm nhân chứng hoặc người giữ bản gốc.
5. Emotional Cost: người thân/con nhỏ/mẹ già chịu hậu quả trực tiếp.
6. Legal Countermove: nữ chính dùng luật sư/tòa án để khóa chứng cứ.
7. Boardroom/Public Confrontation: đối đầu ở phòng họp/hội đồng/truyền thông.
8. Trap Reversal: nữ chính gài bẫy để phản diện tự lộ sơ hở.

Gợi ý nhịp 15 chương nếu target dài:
- Ch1 Public Exposure, Ch2 Evidence Verification, Ch3 Real Loss, Ch4 Witness Hunt, Ch5 Trap Reversal/mini-payoff.
- Ch6 Emotional Cost, Ch7 Witness Hunt ở địa điểm mới, Ch8 Boardroom/Public Confrontation, Ch9 Trap Reversal, Ch10 mini-payoff công khai.
- Ch11 Real Loss nặng, Ch12 Legal Countermove hoặc chủ động đặt bẫy, Ch13 gom chứng cứ, Ch14 cao trào đối chất, Ch15 trả giá/kết.

Cấm 2 chương liên tiếp dùng cùng chức năng chính.
Cấm chương mới chỉ lặp lại: xem hồ sơ → chụp ảnh → bị niêm phong → gọi luật sư → bị nhắn 48 giờ.
Cấm 2 chương dùng tiêu đề giống nhau hoặc cùng công thức title như “Ảnh Xóa Vội”, “Bản Gốc”, “Tin Nhắn” nếu state change khác nhau không rõ.
Nếu chương trước đã là Evidence Verification ở cô nhi viện/bệnh viện/phòng lưu trữ, chương sau bắt buộc phải là Real Loss, Emotional Cost, Boardroom/Public Confrontation hoặc Trap Reversal.
Nếu chương trước đã là Legal Countermove ở văn phòng luật, chương sau bắt buộc phải ra khỏi văn phòng luật.
`.trim()
}

export function getVillainPresenceInstruction() {
  return `
VILLAIN PRESENCE LOGIC:
- Phản diện không được xuất hiện đúng lúc ở mọi địa điểm như NPC.
- Mỗi lần phản diện xuất hiện phải có lý do hợp lý:
  + họ được mời tới,
  + họ theo dõi qua người khác,
  + đây là địa bàn của họ,
  + họ gửi đại diện,
  + hoặc họ xuất hiện qua hậu quả đã chuẩn bị trước.
- Không để cùng một phản diện trực tiếp xuất hiện trong 3 chương liên tiếp chỉ để đe dọa.
- Nếu cần tạo áp lực, hãy dùng hậu quả thay vì cho phản diện xuất hiện:
  email chính thức, thông báo từ trường, tài khoản bị khóa, nhân chứng mất tích, người hỗ trợ bị đình chỉ, nhóm chat lan truyền, giấy triệu tập, người thân bị chuyển phòng.
`.trim()
}

export function getHumanCostInstruction() {
  return `
HUMAN COST RULE:
- Mỗi 2 chương phải có ít nhất 1 cảnh cho thấy hậu quả lên con người thật, không chỉ giấy tờ.
- Nếu truyện liên quan con nhỏ: phải có cảnh đứa trẻ bị ảnh hưởng, bị gọi khỏi lớp, bị bạn nhìn khác, bị trường từ chối, hoặc hỏi một câu làm nữ chính đau.
- Nếu truyện liên quan mẹ già/bệnh án: phải có cảnh mẹ tỉnh/lẫn, bị chuyển phòng, y tá lúng túng, hoặc nữ chính thấy tình trạng mẹ bị dùng làm vũ khí.
- Nếu truyện liên quan hôn nhân: phải có cảnh đối đầu cảm xúc với chồng/người thứ ba, không chỉ luật sư và hồ sơ.
- Nếu truyện liên quan công ty/cổ phần: phải có cảnh mất quyền thật, người dưới quyền quay lưng, hoặc phòng họp nghi ngờ nữ chính.
`.trim()
}

export function getTechnicalReportInstruction() {
  return `
# BẢN PHÂN TÍCH KỸ THUẬT / KHÔNG ĐĂNG

=== THÔNG TIN TRUYỆN ĐỀ XUẤT ===
- Tên truyện hiện tại có khớp nội dung không:
- Tên truyện đề xuất:
- Lý do tên truyện đề xuất khớp vật chứng/mâu thuẫn trung tâm:
- Slug gợi ý:
- Một câu mô tả ngắn:

=== KIỂM TRA TÊN CHƯƠNG ===
- Tiêu đề chương hiện tại:
- Tiêu đề có bám biến cố/vật chứng/state change chính của chương không:
- Nếu chưa khớp, tiêu đề chương nên sửa thành:
- Vật chứng/biến cố được phản ánh trong tiêu đề:

=== KIỂM TRA TIẾN ĐỘ TRUYỆN ===
- Nhân vật chính:
- Phản diện:
- Tình huống:
- Mục tiêu chương:
- Scene function chính:
- Chapter mission:
- Địa điểm chính của chương:
- Hành động mới trong chương:
- State change sau chương này:
- Chương sau nên đi đâu:

=== MOTIF / STORY DNA CHECK ===
- Motif fingerprint của truyện:
- Chương này có trùng motif cũ không:
- Điểm khác biệt motif:
- Yếu tố tránh lặp đã tuân thủ:

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
`.trim()
}
