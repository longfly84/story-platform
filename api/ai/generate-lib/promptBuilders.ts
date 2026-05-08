import type { NormalizedGeneratePayload } from './types.js'
import { compactText, safeText } from './textUtils.js'
import { getLengthRule } from './model.js'
import {
  buildStoryContext,
  getChapterAdvancementInstruction,
  getChapterMissionInstruction,
  getCliffhangerRule,
  getGenreInstruction,
  getGlobalMotifUniquenessInstruction,
  getHeroineInstruction,
  getHumanCostInstruction,
  getLibraryAvoidanceInstruction,
  getModuleInstruction,
  getNameDiversityInstruction,
  getOpenAIAntiRepeatInstruction,
  getPremiseInstruction,
  getProgressionQualityInstruction,
  getSceneFunctionInstruction,
  getStorySeedInstruction,
  getTechnicalReportInstruction,
  getTitleNamingInstruction,
  getVillainPresenceInstruction,
} from './promptInstructions.js'


function getUrbanFemaleScaleLockInstruction(payload: NormalizedGeneratePayload) {
  const storySeed = payload.storySeed as any
  const motif = storySeed?.motifFingerprint || {}
  const genreLabel = safeText(payload.genreLabel)
  const heroineLabel = safeText(payload.mainCharacterStyleLabel)

  return `
1000 GENRE / 100 HEROINE SCALE LOCK — GIỮ CHỦ Ý NỮ TẦN ĐÔ THỊ NHƯNG KHÔNG ĐÓNG KHUÔN:
- Truyện vẫn thuộc umbrella: nữ tần đô thị hiện đại, drama cảm xúc, uất ức có lý do, phản công, vả mặt có dopamine và payoff rõ.
- Nhưng DNA cụ thể bắt buộc phải đi từ genre đã chọn: "${genreLabel}" và kiểu nữ chính: "${heroineLabel}".
- Không được nén 1000 thể loại thành vài format cố định như: hồ sơ / camera / ghi âm / log / phong tỏa / luật sư / hội đồng / hot search.
- Chỉ dùng hồ sơ, camera, log, phong tỏa, luật sư, cổ phần, hot search nếu chúng thật sự có trong genre/story seed. Nếu không, hãy dùng vật chứng, địa điểm, quan hệ và áp lực riêng của genre.
- Nếu genre có dạng A / B / C, bắt buộc A là bối cảnh hoặc arena chính, B là vật chứng hoặc biến cố chính, C là bí mật/twist/quan hệ chính. Không được bỏ B/C để quay về motif generic.
- Kiểu nữ chính phải thay đổi cách cô chịu nhục, quan sát, đối thoại và phản công. Không được viết 100 kiểu nữ chính thành cùng một người lạnh lùng tung bằng chứng.
- Drama phải cuốn bằng cảm xúc người thật: mất danh dự, người thân/con/người yếu thế bị kéo vào, người từng tin phản bội, lựa chọn khó. Không được chỉ liệt kê thủ tục.
- Vả mặt phải có hậu quả: đám đông đổi thái độ, phản diện mất quyền, nhân chứng được bảo vệ, người yếu thế được cứu, hoặc nữ chính giành lại một quyền cụ thể.
- Motif DNA nếu có phải được ưu tiên: ${JSON.stringify(motif)}
`.trim()
}




function getFactoryEvidenceAnchorInstruction(payload: NormalizedGeneratePayload) {
  const storySeed = payload.storySeed
  const chapterNumber = Math.max(1, Math.floor(payload.nextChapterNumber || 1))
  const titleLock = safeText(storySeed?.title || payload.title, payload.title)
  const evidenceObject = safeText(storySeed?.evidenceObject, '')
  const setting = safeText(storySeed?.setting, '')
  const mainConflict = safeText(storySeed?.mainConflict, '')

  if (!titleLock && !evidenceObject) {
    return ''
  }

  return `
FACTORY EVIDENCE LOCK:
- Story title lock: ${titleLock || evidenceObject}
- Main evidence lock: ${evidenceObject || titleLock}
- Setting lock: ${setting || 'none'}
- Conflict lock: ${mainConflict || 'none'}

Rules:
1. Main evidence is the core object. Do not replace it with a side clue.
2. Chapter ${chapterNumber} title must name the main evidence, the exact action around it, or its direct public reveal.
3. Side clues may exist, but only to explain the main evidence. They must not become the chapter title or the main investigation object.
4. In the reading text, show the main evidence at least three times: revealed, inspected, then used to push the conflict forward.
5. In the technical report, story_title must match the story title lock. Do not invent a new title such as contract, USB, QR code, sealed file, room card, or CCTV unless it is in the seed.
6. Forbidden chapter titles: “Chi Tiết Bị Đặt Sai”, “Món Đồ Bị Đặt Sai”, “Vật Chứng Bị Lộ”, “Sự Thật Bị Che Giấu”, “Manh Mối Đầu Tiên”. These are placeholders, not chapter titles.
7. If the evidence is a PR statement / media draft / press release, prefer a concrete chapter title like “Bản Nháp Được Soạn Trước” or “Lời Xin Lỗi Có Trước Scandal”, not a generic placeholder.
`.trim()
}


function getFactoryReportTitleLockInstruction(payload: NormalizedGeneratePayload) {
  const storySeed = payload.storySeed
  const titleLock = safeText(storySeed?.title || payload.title, payload.title)
  const evidenceObject = safeText(storySeed?.evidenceObject, '')

  if (!titleLock && !evidenceObject) return ''

  const lockedTitle = titleLock || evidenceObject
  const lockedEvidence = evidenceObject || lockedTitle

  return `
FACTORY TECHNICAL REPORT TITLE LOCK:
- EXACT_STORY_TITLE_FOR_REPORT: ${lockedTitle}
- EXACT_EVIDENCE_OBJECT_FOR_REPORT: ${lockedEvidence}

BẮT BUỘC KHI VIẾT PHẦN "=== THÔNG TIN TRUYỆN ĐỀ XUẤT ===":
- Dòng "- Tên truyện đề xuất:" phải ghi đúng: ${lockedTitle}
- Không được tự đặt tên khác trong technical report.
- Không được đổi sang vé, hợp đồng, USB, camera, ngăn kéo, mã QR, thẻ phòng, hồ sơ, bản ghi âm nếu không nằm trong EXACT_EVIDENCE_OBJECT_FOR_REPORT.
- Nếu phần đọc đã có tiêu đề chương khác, vẫn giữ "Tên truyện đề xuất" đúng theo EXACT_STORY_TITLE_FOR_REPORT.
- Dòng "- Lý do tên truyện đề xuất..." phải giải thích dựa trên vật chứng chính: ${lockedEvidence}.
`.trim()
}


function getFactoryCharacterNameLockInstruction(payload: NormalizedGeneratePayload) {
  const storySeed = payload.storySeed as any
  const nameSet = storySeed?.characterNameSet as
    | {
        femaleLead?: string
        child?: string
        assistant?: string
        teacher?: string
        antagonist?: string
        witness?: string
        authority?: string
        relative?: string
        forbiddenNames?: string[]
      }
    | undefined

  const forbidden = [
    'Hạ Vân',
    'Tạ Như',
    'Hứa Thanh',
    'Giang Thục',
    'Ôn Kha',
    'Tống Huy',
    'Phó Lan',
    'Mei Lạc',
    'Lưu Vỹ',
    'Viên Tĩnh',
    'Tim',
    'Tần Nhã',
    'Phó Khải',
    ...(Array.isArray(nameSet?.forbiddenNames) ? nameSet?.forbiddenNames || [] : []),
  ]
  const uniqueForbidden = Array.from(new Set(forbidden.filter(Boolean)))

  if (nameSet?.femaleLead) {
    return `
FACTORY CHARACTER NAME LOCK — BẮT BUỘC:
- Nữ chính: ${nameSet.femaleLead}
- Trẻ nhỏ / người yếu thế nếu cần: ${nameSet.child || 'không bắt buộc'}
- Trợ lý / người hỗ trợ: ${nameSet.assistant || 'không bắt buộc'}
- Giáo viên / nhân viên chuyên môn nếu cần: ${nameSet.teacher || 'không bắt buộc'}
- Phản diện chính / người gây áp lực: ${nameSet.antagonist || 'không bắt buộc'}
- Nhân chứng / người đứng giữa: ${nameSet.witness || 'không bắt buộc'}
- Người có quyền / bảo vệ / quản lý / đại diện tổ chức: ${nameSet.authority || 'không bắt buộc'}
- Người thân / phụ huynh / đối tượng gây sức ép phụ: ${nameSet.relative || 'không bắt buộc'}

Luật tên nhân vật:
1. Nếu vai xuất hiện trong chương, phải dùng đúng tên đã khóa ở trên.
2. Không tự thay nữ chính thành Hạ Vân/Tống Vân/Tần Nhã hoặc tên cũ.
3. Không dùng lại các tên đã xuất hiện gần đây: ${uniqueForbidden.join(', ')}.
4. Không dùng tên Tây như Tim, John, Anna trong bối cảnh nữ tần đô thị Trung Quốc hiện đại. Trẻ nhỏ dùng tên như Tiểu Dữu, An An, Đậu Đậu, Du Du...
5. Trong cùng truyện phải giữ tên nhất quán qua các chương. Nếu chương trước đã có tên khác trong STORY CONTEXT, ưu tiên continuity của truyện hiện tại; nếu là chương 1 thì dùng name lock này.
`.trim()
  }

  return `
FACTORY CHARACTER NAME DIVERSITY HARD LOCK:
- Mỗi truyện mới phải có dàn tên mới, không tái dùng dàn tên của truyện vừa tạo.
- Cấm dùng lại các tên gần đây: ${uniqueForbidden.join(', ')}.
- Không dùng tên Tây như Tim, John, Anna nếu bối cảnh là Trung Quốc hiện đại/nữ tần đô thị.
- Tạo tên Trung Quốc hiện đại, dễ đọc với độc giả Việt; nhất quán trong cùng truyện.
`.trim()
}

function getVietnameseProseHardGateInstruction() {
  return `
VIETNAMESE PROSE HARD GATE — CỔNG CHẶN VĂN RÁC / DỊCH MÁY:
Mục tiêu tối cao: BẢN ĐỌC CHO ĐỘC GIẢ phải giống truyện tiếng Việt do người thật viết, đọc thuận miệng, đủ chủ vị, đúng ngữ nghĩa, không cụt lủn, không giống Google Translate, không giống bản convert word-by-word.

1) VIẾT ĐÚNG CÁCH NÓI TIẾNG VIỆT TỰ NHIÊN:
- Không viết câu dịch thẳng từ tiếng Anh/Trung.
- Không dùng cụm từ gượng, sai kết hợp từ, thiếu chủ vị hoặc nghe như máy dịch.
- Mỗi câu phải trả lời được: ai đang làm gì, cảm giác gì, vì sao, trong ngữ cảnh nào.
- Nếu một câu khiến độc giả phải dừng lại để đoán nghĩa, câu đó hỏng và phải viết lại.
- Ưu tiên câu rõ, có hình ảnh, có nhịp tự nhiên hơn ẩn dụ lạ.

2) CẤM CÁC KIỂU CÂU CỤT / GƯỢNG SAU:
- Cấm kiểu: “điện thoại lạnh áp vào tay”. Phải viết tự nhiên hơn: “chiếc điện thoại lạnh ngắt trong lòng bàn tay”, “mặt lưng điện thoại lạnh buốt áp vào lòng bàn tay”.
- Cấm kiểu: “cảm giác hoảng loạn giống miếng gió lạnh xâm lấn”. Phải viết: “cơn hoảng loạn lạnh buốt lan dọc sống lưng”, hoặc “tôi cố giữ giọng bình tĩnh, dù nỗi hoảng sợ đang dâng lên từng chút một”.
- Cấm kiểu: “Trợ lý tôi trả lời”. Phải viết: “Trợ lý của tôi trả lời”, “Tạ Như, trợ lý của tôi, vội trả lời”.
- Cấm kiểu: “mắt cô ấy thâm quầng”. Phải viết: “đôi mắt cô ấy thâm quầng”, “quầng mắt cô ấy sẫm lại vì thức trắng”.
- Cấm kiểu: “Nick ẩn.”, “Mấy ảnh đang lan trong group board.”, “Một vài người bắt đầu forward.” Đây là câu cụt và thuật ngữ thô.

3) THUẬT NGỮ PHẢI VIỆT HÓA HOẶC GIẢI THÍCH TRONG NGỮ CẢNH:
- Không dùng trần trụi các từ: cache, watermark, forward, group board, reference, access, PR, metadata, log, backup, screenshot nếu không thật cần.
- Nếu bắt buộc dùng, phải giải thích tự nhiên bằng tiếng Việt ngay trong câu.
Ví dụ sửa:
  + “cache” → “phần dữ liệu lưu tạm còn sót trong ứng dụng”, “bộ nhớ tạm của điện thoại”.
  + “watermark” → “dấu nhận diện mờ của hệ thống khách sạn”, “dấu chìm của hệ thống nội bộ”.
  + “forward” → “chuyển tiếp”.
  + “group board” → “nhóm chat của hội đồng/cổ đông”.
  + “reference H.K.” → “mã tham chiếu H.K.” nếu đã có ngữ cảnh tài chính; nếu chưa, phải nói rõ đó là mã ghi kèm giao dịch.
  + “access card” → “thẻ ra vào”, “thẻ truy cập”, không lạm dụng tiếng Anh.
- Độc giả phổ thông phải hiểu được câu mà không cần biết thuật ngữ kỹ thuật.

4) HỘI THOẠI PHẢI ĐÚNG VAI XÃ HỘI:
- Trợ lý/thư ký/cấp dưới nói với nữ chính là sếp phải có kính ngữ vừa đủ: “Dạ”, “chị”, “em xin lỗi”, “em đang kiểm tra”, “em chưa xác định được ạ”.
- Không cho trợ lý nói cụt: “Em không biết, chị.”, “Nick ẩn.”, “Mấy ảnh đang lan...”.
- Đối thoại phải giống người thật trong khủng hoảng: ngắn nhưng đủ nghĩa, có thái độ, có vai vế.
Ví dụ:
  + Sai: “Em không biết, chị.”
  + Đúng: “Dạ, em xin lỗi chị. Em vẫn đang kiểm tra nguồn gửi, nhưng có người trong nhóm ban tổ chức đã kịp chụp lại trước khi ảnh bị xóa.”
  + Sai: “Nick ẩn.”
  + Đúng: “Tài khoản gửi là tài khoản ẩn danh, hiện chưa truy được người đứng sau.”

5) CÁCH VIẾT RÕ RÀNG, KHÔNG MƠ HỒ VÔ LÝ:
- Khi nói “người gửi đã xóa ngay sau khi gửi”, phải làm rõ gửi cái gì, gửi cho ai, ai chụp lại, vì sao nữ chính biết.
- Khi có bằng chứng kỹ thuật, phải đặt vào hành động cụ thể: ai mở, ai gửi bản sao, ai xác nhận, bản sao đến từ đâu.
- Không được viết kiểu “một ảnh hiện lên rồi mất: Đã xóa” nếu thiếu mạch. Hãy viết rõ hơn: “bức ảnh chỉ hiện lên trong tích tắc trước khi ứng dụng báo tin đã bị thu hồi/xóa”.

6) ĐOẠN MỞ ĐẦU LÀ CỔNG GIỮ ĐỘC GIẢ:
- 5 đoạn đầu của chương phải được soi kỹ nhất.
- Không được có câu gượng, thuật ngữ thô, xưng hô cụt, hình ảnh kỳ hoặc logic mờ trong 5 đoạn đầu.
- Nếu 5 đoạn đầu còn mùi dịch máy, phải rewrite toàn bộ 5 đoạn đầu trước khi trả output.

7) READ-ALOUD SELF TEST:
- Trước khi xuất output, hãy tự đọc thầm BẢN ĐỌC như một người Việt đọc truyện trên điện thoại.
- Câu nào đọc không trôi, phải sửa.
- Câu nào giống văn dịch, phải sửa.
- Câu nào dùng thuật ngữ khiến người đọc phổ thông khựng lại, phải Việt hóa hoặc giải thích.
- Câu nào thiếu “của/tôi/đã/đang/bị/được” làm nghĩa cụt, phải thêm cho đúng tiếng Việt.

8) MẪU CHẤT LƯỢNG CẦN ĐẠT:
Thay vì viết: “Tôi tựa vào lan can, điện thoại lạnh áp vào tay, xem lại mấy tệp nhỏ còn sót trong cache — rồi thấy một ảnh hiện lên, chỉ kịp lóe rồi mất: Đã xóa.”
Hãy viết tự nhiên như:
“Tôi đứng bên lan can, nắm chặt chiếc điện thoại lạnh ngắt trong lòng bàn tay. Trong lúc lục lại phần dữ liệu lưu tạm còn sót trong ứng dụng, tôi nhìn thấy một bức ảnh chỉ vừa lóe lên trong tích tắc rồi biến mất. Trên màn hình còn sót lại đúng hai chữ: ‘Đã xóa’.”

Thay vì viết: “Trợ lý tôi trả lời ngay qua video call, mắt cô ấy thâm quầng vì đêm dài tổ chức. ‘Em không biết, chị.’”
Hãy viết tự nhiên như:
“Tạ Như, trợ lý của tôi, bắt máy gần như ngay lập tức. Đôi mắt cô ấy thâm quầng vì thức trắng cả đêm theo sự kiện. ‘Dạ, em xin lỗi chị. Em vẫn đang kiểm tra nguồn gửi, nhưng có người trong nhóm ban tổ chức đã kịp chụp lại bức ảnh trước khi nó bị xóa.’”
`.trim()
}


function getVietnameseSemanticLogicGateInstruction() {
  return `
SEMANTIC VIETNAMESE LOGIC GATE — CỔNG SOÁT NGHĨA CÂU / LOGIC SỰ KIỆN:
Đây là cổng bắt buộc để chặn loại văn “đọc hiểu được nhưng người Việt thấy sai sai”. Không chỉ sửa cho mượt; phải sửa cho ĐÚNG QUAN HỆ NGỮ NGHĨA.

1) MỖI CÂU PHẢI ĐÚNG CHỦ THỂ — HÀNH ĐỘNG — ĐỐI TƯỢNG — TRẠNG THÁI:
- Trước khi giữ một câu, phải tự hỏi:
  + Ai là người/đơn vị thực hiện hành động?
  + Việc gì đã xảy ra, đang xảy ra, hay chỉ là tin đồn/khả năng?
  + Đối tượng bị tác động là gì?
  + Câu có thiếu “đã”, “đang”, “bị”, “được”, “của”, “cho”, “với” khiến nghĩa bị cụt không?
- Không để vật vô tri làm chủ thể hành động sai nghĩa.
- Không viết câu khiến hợp đồng, giấy tờ, mã số, ảnh chụp tự “làm” một việc mà lẽ ra con người/tổ chức mới làm.

2) LỖI THỜI THÁI / SỰ VIỆC ĐÃ XẢY RA:
- Khi nhân vật hỏi về một tin đồn/sự việc bị cho là đã xảy ra, phải dùng đúng dấu hiệu hoàn tất: “đã”, “đã được”, “bị nghi là đã”, “được cho là đã”, “có thông tin cho rằng... đã...”.
- Sai: “Có tin đồn hợp đồng ủy quyền của Nhà kính Hạ Vân chuyển giao quyền điều hành tạm thời cho bên thứ ba.”
- Đúng: “Có tin đồn Nhà kính Hạ Vân đã ký hợp đồng ủy quyền, chuyển giao tạm thời quyền điều hành cho bên thứ ba.”
- Đúng: “Có tin đồn quyền điều hành tạm thời của Nhà kính Hạ Vân đã được chuyển cho bên thứ ba thông qua một hợp đồng ủy quyền.”
- Sai: “Bó hoa xác nhận hợp đồng.”
- Đúng: “Mã trên tem bó hoa được dùng làm mã xác nhận trong quy trình bàn giao, nên nếu mã đó khớp, họ có thể dựng thành bằng chứng tôi đã gặp bên nhận ủy quyền.”

3) HỘI THOẠI BÁO CHÍ / PHÁP LÝ / DOANH NGHIỆP PHẢI GIỐNG NGƯỜI THẬT:
- Phóng viên không được hỏi cụt, sai ngữ pháp hoặc giống bản dịch máy.
- Sai: “Cô Hạ Vân, giải thích sao được?”
- Đúng: “Cô Hạ Vân, cô giải thích thế nào về chuyện này?”
- Đúng: “Có phải cô đã âm thầm chuyển quyền điều hành cho bên thứ ba không?”
- Sai: “Ông có thể công bố bản gốc?”
- Đúng: “Ông có thể công bố văn bản gốc không?”
- Đối thoại doanh nghiệp/pháp lý phải đủ rõ nhưng không dài như văn bản luật.

4) CƠ CHẾ LOGIC GIỮA VẬT CHỨNG VÀ HẬU QUẢ:
- Mỗi vật chứng chính phải có cầu nối logic với hậu quả.
- Nếu một bó hoa, thẻ ra vào, tin nhắn, ảnh chụp, giấy biên nhận, mã giao hàng, hóa đơn, vòng tay, vé máy bay, phiếu xét nghiệm... gây ra hậu quả lớn, phải giải thích ngắn gọn vì sao nó có giá trị.
- Không được viết kiểu: vật chứng xuất hiện → phản diện tuyên bố thắng → tài khoản bị khóa, nếu thiếu cơ chế.
- Ví dụ cần có cầu nối:
  + Bó hoa cưới liên quan hợp đồng vì mã trên tem giao hàng là mã xác nhận gặp mặt/bàn giao trong quy trình nội bộ.
  + Tài khoản bị tạm giữ vì đối tác/quỹ bảo lãnh có quyền yêu cầu ngân hàng tạm dừng giải ngân khi hợp đồng ủy quyền bị tranh chấp.
  + Một ảnh chụp có giá trị vì nó chứa dấu nhận diện mờ, thời gian, địa điểm hoặc người chứng kiến.
- Cầu nối chỉ cần 1–2 câu tự nhiên trong cảnh, không biến thành bài giải thích pháp lý.

5) NHÂN VẬT XUẤT HIỆN PHẢI CÓ LÝ DO:
- Không để nhân chứng, người giao hàng, luật sư, bác sĩ, phóng viên, nhân viên nội bộ xuất hiện tiện tay như công cụ giải plot.
- Nếu người giao hàng có mặt ở họp báo, phải có lý do: được bộ phận hậu cần mời đến làm nhân chứng, bị đưa tới để xác nhận, cầm thẻ khách mời tạm, hoặc đứng ngoài cửa bị kéo vào.
- Nếu một nhân chứng có chứng cứ nhưng không giao ngay, phải có lý do tâm lý/hậu quả: sợ mất việc, sợ bị kiện, bị đe dọa, còn người thân bị nắm thóp.

6) CẤM CÁC CỤM CÓ MÙI AI / DỊCH MÁY / POSTER:
- Hạn chế hoặc viết lại nếu thấy: “phông nền trắng bóng”, “ánh đèn lạnh”, “giọng khô như thép”, “ống kính như lưỡi dao”, “nụ cười của người đã dàn sẵn kịch bản”, “không khí đổi sắc”, “chuỗi nút được bật lên”, “tôi không được phép thất bại”.
- Không cấm tuyệt đối mọi ẩn dụ, nhưng 5 đoạn đầu không được có cụm sáo, gượng, quá poster.
- Ưu tiên câu cụ thể hơn:
  + “Căn phòng sáng đến chói mắt. Máy quay đặt sát lối đi như chỉ chờ một câu nói sai.”
  + “Tôi cố nói thật chậm, từng chữ đủ rõ để micro thu lại.”
  + “Chỉ cần tôi nói sai một chữ, đoạn cắt ấy sẽ xuất hiện trên mọi mặt báo trong vòng mười phút.”

7) SHOW, DON'T PREACH — CẢM XÚC PHẢI ĐI QUA CẢNH:
- Không viết cảm xúc như khẩu hiệu: “tương lai của những người tôi phải che chở”, “uất ức thắt lại nơi tôi” nếu có thể chuyển thành cảnh cụ thể.
- Hãy cho thấy người yếu thế bị ảnh hưởng: bàn tay chai sạn siết vai con, khoản lương tuần này bị treo, đứa trẻ khóc, nhân viên đứng ngoài cửa chờ tin.
- Câu cảm xúc phải bám vào một chi tiết vật lý/cảnh thật.

8) HEADING / OUTPUT CLEANUP LOCK:
- Trong BẢN ĐỌC CHO ĐỘC GIẢ chỉ được có đúng 1 dòng tiêu đề chương dạng: “# Chương N — ...”.
- Tuyệt đối không lặp tiêu đề chương hai lần.
- Không được viết lại “# Chương N — ...” ở dòng đầu nội dung sau tiêu đề.
- Không được đặt thêm heading phụ trong phần đọc.
- Nếu thấy heading bị lặp trong bản nháp/final, phải xóa bản lặp trước khi trả output.

9) 5 ĐOẠN ĐẦU PHẢI VƯỢT QUA BÀI TEST CÂU TIẾNG VIỆT:
- 5 đoạn đầu phải có: bối cảnh rõ, người đang chịu áp lực rõ, câu hỏi/biến cố rõ, cơ chế mâu thuẫn đủ hiểu.
- Không được mơ hồ kiểu “tôi đến để bảo vệ một người” nhưng 5 đoạn sau mới biết là ai, trừ khi đó là bí mật có chủ ý. Nếu stakes là Mộ Thanh/đứa bé/nhân viên, hãy cài sớm bằng một chi tiết cụ thể.
- Không được có câu hỏi báo chí sai thời thái hoặc thiếu chủ thể trong 5 đoạn đầu.
`.trim()
}

function getVietnameseEditorHardGateInstruction() {
  return `
EDITOR HARD GATE — BIÊN TẬP TỪNG CÂU TIẾNG VIỆT:
Bản final chỉ được trả khi BẢN ĐỌC CHO ĐỘC GIẢ đã qua biên tập câu chữ như người biên tập truyện tiếng Việt.

BẮT BUỘC LÀM TRƯỚC KHI TRẢ OUTPUT:
1. Đọc lại từng câu trong phần BẢN ĐỌC.
2. Sửa tất cả câu cụt, câu gượng, câu dịch máy, câu thiếu chủ vị, câu sai kết hợp từ.
3. Việt hóa hoặc giải thích thuật ngữ kỹ thuật: cache, watermark, forward, group board, access, reference, metadata, log, backup, screenshot.
4. Sửa hội thoại theo đúng vai xã hội. Trợ lý/thư ký/cấp dưới không được nói trống không với sếp.
5. Soi 5 đoạn đầu kỹ nhất. Nếu 5 đoạn đầu còn câu kiểu “điện thoại lạnh áp vào tay”, “mấy tệp nhỏ còn sót trong cache”, “Nick ẩn”, “forward”, phải rewrite ngay.
6. Không chỉ sửa plot. Nhiệm vụ chính của editor pass này là làm văn mượt, rõ nghĩa, tự nhiên, đọc như truyện người thật viết.
7. Không được giữ các câu chỉ đúng ý nhưng sai tiếng Việt. Đúng ý chưa đủ; câu phải đọc thuận miệng.

CÁC LỖI PHẢI SỬA NGAY NẾU THẤY:
- “Trợ lý tôi” → “Trợ lý của tôi”.
- “mắt cô ấy thâm quầng” → “đôi mắt cô ấy thâm quầng” hoặc “quầng mắt cô ấy sẫm lại”.
- “Nick ẩn” → “tài khoản gửi là tài khoản ẩn danh”.
- “group board” → “nhóm chat của hội đồng/cổ đông”.
- “forward” → “chuyển tiếp”.
- “cache” → “bộ nhớ tạm”, “dữ liệu lưu tạm còn sót trong ứng dụng”.
- “watermark” → “dấu chìm”, “dấu nhận diện mờ của hệ thống”.
- “người gửi xóa ngay sau khi gửi” → “người gửi đã xóa tin gần như ngay sau khi gửi, nhưng vẫn có người kịp chụp lại”.
`.trim()
}


function getVietnameseLineEditV14Instruction() {
  return `
NATURAL VIETNAMESE LINE EDIT v15 — BIÊN TẬP NHƯ NGƯỜI VIỆT SOÁT BẢN ĐĂNG WEB:
Mục tiêu: BẢN ĐỌC phải thuận tai với độc giả Việt đọc truyện trên điện thoại. Ưu tiên câu rõ, đời, có hành động cụ thể. Không dùng cụm nghe như AI đang cố viết hay.

1) CẤM CÁC CỤM / KIỂU CÂU ĐÃ BỊ PHÁT HIỆN LỘ AI:
- Cấm: “tôi nhìn ngay và không kìm được”. Sửa: “tôi khựng lại”, “tôi vừa liếc qua đã thấy không ổn”.
- Cấm: “ánh mắt anh ta cố ép vào tôi”. Sửa: “anh ta nhìn tôi chằm chằm”, “ánh mắt anh ta ghim thẳng vào tôi”.
- Cấm: “mắt thẳm”. Sửa: “ánh mắt nặng trĩu”, “mắt đỏ nhưng vẫn cố nén”.
- Cấm: “cả phòng chựng lại”. Ưu tiên: “cả phòng khựng lại một nhịp”.
- Cấm: “nói khoan”. Sửa: “tôi nói chậm”, “tôi ngắt lời”, “tôi giữ giọng thật bình tĩnh”.
- Cấm: “mọi âm thanh dồn về màn hình nhỏ ấy”. Sửa: “cả phòng lập tức nhìn về màn hình điện thoại”.
- Cấm: “trò chơi đã bắt đầu”, “ván cờ bắt đầu”, “khúc dạo đầu”, “một màn lớn hơn vừa mở ra”. Sửa bằng hành động/hook cụ thể.
- Cấm: “lời cô như một mảnh ghém vào câu chuyện”, “vị gắt của cay”, “khinh nhờn” khi tả ánh mắt người thường.

2) CẤM CỤM SAI TAI / ẨN DỤ GƯỢNG TRONG ĐỜI SỐNG:
- Cấm: “hôi lên mùi”. Sửa: “ám mùi”, “nồng mùi”, “thoang thoảng mùi” tùy cảnh.
- Cấm: “đèn huỳnh quang kêu ròn”. Sửa: “đèn huỳnh quang rè rè”, “đèn trên trần nhấp nháy”.
- Cấm: “dáng đi như người chờ được khiển trách”. Sửa: “mặt cúi gằm như chuẩn bị nhận lỗi”, “dáng khép nép như sắp bị mắng”.
- Cấm: “nụ cười được chuẩn bị sẵn để bóp nghẹt lời giải thích”. Sửa: “anh ta cười rất nhẹ, kiểu cười của người đã chuẩn bị sẵn câu kết tội”.
- Cấm: “giọng như đóng án”. Sửa: “giọng như đã kết luận xong”.
- Cấm: “keo chưa lì”. Sửa: “lớp keo còn mới”, “mép tem còn cong, keo chưa bám chặt”.
- Cấm: “mùi keo và bụi bột thùng gỗ vỗ vào mũi”. Sửa: “mùi keo và bụi gỗ xộc lên”.
- Cấm: “giọng ấy như dao cứa vào tai”. Sửa: “câu nhận lỗi ấy làm tôi khó chịu hơn cả ánh mắt soi mói của khách”.
- Cấm: “lời nhẹ mà nhọn”. Sửa: “bà nói rất khẽ, nhưng câu nào cũng nhằm vào tôi”.
- Cấm: “mọi ánh mắt dồn vào điểm nhỏ ấy”. Sửa: “mấy người đứng gần lập tức cúi xuống nhìn”, “khách cũng nghiêng người nhìn kỹ hơn”.

3) KHÔNG MỞ CHƯƠNG BẰNG CÁCH NHẮC LẠI TITLE MỘT CÁCH MÁY MÓC:
- Nếu title/vật chứng dài, không được bê nguyên title vào câu đầu theo kiểu báo cáo.
- Sai: “Con dấu đỏ lệch nửa vòng trên phụ lục hợp đồng nằm giữa bàn...”
- Tốt hơn: “Tôi nhìn thấy con dấu ngay khi bước vào phòng họp.” Sau đó mới mô tả: “Nó lệch hẳn nửa vòng, mực đỏ dồn về một bên.”
- Sai: “Tem kiện hàng bị dán chồng lên mã tuyến cũ nằm trên thùng...”
- Tốt hơn: “Tôi vừa nhìn mặt thùng đã thấy lớp tem mới không khớp.” Sau đó mới nói mã cũ/mã mới.
- Câu mở phải giống người kể chuyện đang nhìn thấy sự vật, không giống AI đang cố gài keyword.

4) LINE EDIT MẪU CHO CẢNH HỢP ĐỒNG / PHÁP LÝ:
- Thay “Điều khoản phụ này ghi rõ...” bằng câu ngắn hơn nếu nhân vật đang ép ký: “Điều khoản phụ ghi rõ rồi. Cô ký đi.”
- Thay “Anh giải thích rõ giúp tôi...” bằng: “Vậy nói rõ đi. Người được chỉ định nhận quyền là ai?”
- Không để luật sư nói như sách giáo khoa quá dài. Luật sư/quản lý chỉ nói đủ để tạo áp lực; phần còn lại để hành động và phản ứng tự cho độc giả hiểu.
- Không dùng “bên A/bên B” quá nhiều trong văn đọc. Nếu phải dùng, dùng một lần rồi chuyển sang: “người ký”, “người nhận quyền”, “bên được chuyển giao”.

5) LINE EDIT MẪU CHO CẢNH KHO HÀNG / GIAO NHẬN / DỊCH VỤ:
- Viết đời thường, có mùi, tiếng, hành động cụ thể; không làm câu quá văn chương.
- Tốt: “Kho sau nhà hàng nồng mùi nước sốt, hộp giấy và thức ăn vừa đóng gói.”
- Tốt: “Đèn huỳnh quang trên trần rè rè. Ai cũng hiểu chuyện này phải xong trước khi khách kéo đến.”
- Tốt: “Anh ta đẩy kiện hàng vào, mặt cúi gằm như chuẩn bị nhận lỗi.”
- Tốt: “Mép tem mới còn cong. Lớp keo chưa bám chặt, bên dưới lộ ra dãy mã cũ bắt đầu bằng X8.”
- Tốt: “Mùi keo và bụi gỗ xộc lên khi tôi cạy mép tem.”
- Không dùng từ quá dân dã nếu bối cảnh nữ tần đô thị Trung Quốc: thay “ăn thua miệng lưỡi” bằng “hơn thua bằng vài câu nói”.

6) KẾT CHƯƠNG BẮT BUỘC BẰNG HÀNH ĐỘNG / BẰNG CHỨNG / TIN NHẮN / CÂU THOẠI, KHÔNG BẰNG KHẨU HIỆU:
- Sai: “Tôi không ký, nhưng trò chơi đã bắt đầu.”
- Đúng: “Tôi không ký. Và từ ánh mắt của người phụ nữ cầm phong bì, tôi biết họ vẫn còn một bước ép khác.”
- Sai: “Đây mới chỉ là khúc dạo đầu.”
- Đúng: “Phong bì đặt xuống bàn, mép niêm phong còn nguyên. Chu Cảnh Nghiêu nhìn nó trước khi nhìn tôi.”
- Với cảnh kho hàng, kết bằng vật cụ thể: mẩu tem trong phong bì, biên nhận, camera cửa kho, tài xế đứng giữa hai phe, cuộc gọi từ khách VIP.
- Cuối chương phải có một thứ cụ thể khiến độc giả muốn đọc tiếp: phong bì, tin nhắn, người xuất hiện, dấu vết mới, deadline mới, câu đe dọa mới.

7) ĐỘ TỰ NHIÊN CỦA TIẾNG VIỆT:
- Ưu tiên câu ngắn, rõ chủ thể. Mỗi câu chỉ nên gánh một ý chính khi cảnh đang căng.
- Không cố làm câu “sang” bằng ẩn dụ. Nếu một cụm nghe đẹp nhưng không giống người Việt viết truyện mạng, đổi thành câu bình thường.
- Không dùng Hán-Việt nặng nếu từ phổ thông đủ tốt: “khinh miệt” thay cho “khinh nhờn”; “khựng lại” thay cho “chựng lại” trong văn phổ thông; “cổ họng khô rát” thay cho hình ảnh lạ.
- Không để nhân vật độc thoại giải thích quá sạch. Người thật thường né, cắt ngang, hỏi ngược, hoặc nói một câu ngắn có gai.
- Không viết câu kết luận dài kiểu “đây không chỉ là..., đây là...” nếu có thể chia thành 2–3 câu ngắn hơn.


8) LINE EDIT v16 — KHÔNG ĐỂ LỘ DẤU PROMPT / CHECKLIST / CÂU TỔNG KẾT KIỂU AI:
- Editor phải sửa toàn bộ câu nghe như AI đang giải thích quy tắc viết, không chỉ sửa vài cụm bị cấm.
- Cấm để phần đọc lộ cơ chế “vật chứng xuất hiện lần một/lần hai/lần ba”.
  + Sai: “Đây là lần hai tờ giấy xuất hiện...”
  + Đúng: “Tôi để cô chụp thật rõ góc xé và vệt mực. Nếu tờ giấy bị ai động vào, ít nhất chúng tôi vẫn còn bản lưu.”
- Cấm câu meta kiểu: “tôi phải dùng nó làm cứ điểm”, “chuyển cuộc chơi từ cảm xúc sang lý lẽ”, “sự thật sẽ nói thay tôi”, “trả đũa bằng sự thật”, “thế đứng của tôi lung lay”, “một cột mốc nghiêm trọng”.
  + Sửa thành hành động cụ thể: hỏi nguồn gửi, giữ bản sao, chụp file gốc, yêu cầu đối chiếu camera, ghi lại giờ, giữ mẩu tem, nhắn cho người phụ trách.
- Cấm cụm sai tai mới phát hiện: “một mảnh hé của chuỗi sự việc”, “ngòi nắm”, “đứng tay chốc lát”, “mắt xích quan sát”, “không để tiếng đó hiện trên mặt”, “ánh mắt quét về”, “bằng chứng sống”.
  + “một mảnh hé...” → “Chỉ một câu ấy cũng đủ làm lời buộc tội bớt chắc chắn.”
  + “ngòi nắm” → “một chỗ để bám vào” hoặc “một đầu mối”.
  + “đứng tay chốc lát” → “dừng trước dãy locker vài giây”.
  + “mắt xích quan sát” → “ai ra vào cũng phải đi ngang qua đó”.
  + “không để tiếng đó hiện trên mặt” → “cố giữ mặt bình thản”.
  + “ánh mắt quét về” → “mọi người cùng nhìn xuống”.
  + “bằng chứng sống” → “thứ duy nhất tôi đang giữ được”.
- Khi có nhân vật phụ/trẻ nhỏ/người yếu thế, phải giới thiệu vai trò thật tự nhiên trong cùng câu hoặc bỏ bớt nếu họ chỉ là token cảm xúc.
  + Sai: “Lâm Lâm, đứa trẻ mà tôi giữ liên hệ để hỗ trợ buổi trình diễn...”
  + Đúng: “Lâm Lâm, cậu bé mẫu nhí của buổi chụp, nép sau giá váy.”
- Không dùng câu mở quá văn chương kiểu “cả căn phòng đang cố gắng kịp một cái hẹn”. Câu mở ưu tiên sự việc cụ thể: đèn sáng, người chạy, khách sắp tới, vật chứng nằm ở đâu.
- Nếu một đoạn có câu tổng kết tâm lý, hãy đổi thành cử chỉ hoặc lời thoại. Người đọc phải tự cảm thấy áp lực qua cảnh, không bị tác giả giảng.
- Nếu editor thấy một câu “đẹp” nhưng người Việt đọc truyện mạng sẽ thấy gượng, phải đổi thành câu bình thường hơn. Mục tiêu là đọc trôi, không phải văn hoa.

9) READ-ALOUD FINAL CHECK:
- Trước khi trả output, tự đọc thầm 5 đoạn đầu và 3 đoạn cuối như người Việt đọc truyện trên điện thoại.
- Câu nào làm người đọc vấp vì cụm từ lạ, sửa ngay.
- Câu nào nghe như bản dịch, sửa ngay.
- Câu nào kết luận triết lý mà có thể thay bằng hành động, thay bằng hành động.
`.trim()
}

export function buildStoryPlanPrompt(payload: NormalizedGeneratePayload) {
  const moduleInstruction = getModuleInstruction(payload.moduleId)
  const genreInstruction = getGenreInstruction(payload.genreLabel)
  const premiseInstruction = getPremiseInstruction(payload)
  const libraryAvoidanceInstruction = getLibraryAvoidanceInstruction(payload)
  const storySeedInstruction = getStorySeedInstruction(payload)
  const motifUniquenessInstruction = getGlobalMotifUniquenessInstruction(payload)
  const antiRepeatInstruction = getOpenAIAntiRepeatInstruction(payload)
  const nameDiversityInstruction = getNameDiversityInstruction(payload)
  const factoryCharacterNameLockInstruction = getFactoryCharacterNameLockInstruction(payload)
  const titleNamingInstruction = getTitleNamingInstruction(payload)
  const heroineInstruction = getHeroineInstruction(payload.mainCharacterStyleLabel)
  const urbanFemaleScaleLockInstruction = getUrbanFemaleScaleLockInstruction(payload)
  const evidenceAnchorInstruction = getFactoryEvidenceAnchorInstruction(payload)
  const cliffhangerRule = getCliffhangerRule(payload)

  return `
Bạn là Master Story Engine Core v3.2 chuyên thiết kế nữ tần đô thị mở rộng nhiều thể loại cho độc giả Việt.

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

${libraryAvoidanceInstruction}

${motifUniquenessInstruction}

${storySeedInstruction}

${antiRepeatInstruction}

${nameDiversityInstruction}

${factoryCharacterNameLockInstruction}

${titleNamingInstruction}

${heroineInstruction}

${urbanFemaleScaleLockInstruction}

${evidenceAnchorInstruction}

${cliffhangerRule}

YÊU CẦU:
- Dàn ý phải đủ rõ để viết được nhiều chương liên tục.
- Mỗi chương trong outline phải có nhiệm vụ riêng, địa điểm/cảnh chính riêng, state change riêng.
- Không viết 3 chương liên tiếp quanh cùng 1 vật chứng/cùng 1 địa điểm.
- Không để outline thành vòng lặp: phát hiện file → gọi luật sư → bị đe dọa → thu thập tiếp.
- Phải bám đúng GENRE LOCK, PREMISE DIVERSITY LOCK, STORY SEED, MOTIF UNIQUENESS LOCK, 1000 GENRE / 100 HEROINE SCALE LOCK và HEROINE LOCK.
- Dàn ý phải chứng minh genre 1000 loại đang có tác dụng: dùng đúng vật chứng, bối cảnh, quan hệ và twist riêng của genreLabel.
- Dàn ý phải chứng minh heroine 100 kiểu đang có tác dụng: cách nữ chính chịu đau, đối thoại và phản công phải khác theo heroineLabel, không chỉ “nhẫn nhịn rồi lạnh lùng tung bằng chứng”.

OUTPUT BẮT BUỘC:
# STORY PLAN

## Tên truyện
[Đề xuất tên truyện viral nhưng phải khớp vật chứng/mâu thuẫn trung tâm. Tên truyện phải thể hiện được nội dung truyện, không được dùng vật thể chưa xuất hiện trong plot, không được dùng "Chương 1" làm tên truyện.]

## Kiểm tra độ khớp tên truyện
- Vật chứng/mâu thuẫn trung tâm mà tên truyện bám vào:
- Vật đó/biến cố đó xuất hiện ở chương nào:
- Vì sao tên này không bị lệch nội dung:

## Story DNA / Motif Fingerprint
- premiseFamily:
- openingArena:
- incitingIncident:
- evidenceType:
- villainAttackType:
- heroineCounterType:
- powerStructure:
- publicPressure:
- hiddenTruthType:
- deadlineStyle:
- antiRepeatTags:
- genreSpecificDNA: [A/B/C trong genreLabel được dùng như thế nào]
- heroineBehaviorDNA: [kiểu nữ chính ảnh hưởng cách phản công ra sao]

## Công thức viết
[Nêu công thức/vibe chính]

## Thể loại
[Nêu thể loại]

## Kiểu nữ chính
[Nêu rõ arc nữ chính]

## Premise chính
[Nêu hook mở truyện theo đúng thể loại]

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

## Vũ khí trả thù theo đúng genre
[Nêu vũ khí trả thù theo genre đã chọn: vật chứng riêng, nhân chứng, cảm xúc, quan hệ, địa điểm, truyền thông, hợp đồng, pháp lý, cổ phần... Không ép pháp vụ/cổ phần/hot search nếu genre không cần.]

## Nhịp hé bằng chứng
[Chia tầng bằng chứng]

## Hành trình nữ chính
[Nêu hành trình nữ chính qua nhiều chương]

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

export function buildChapterPrompt(payload: NormalizedGeneratePayload) {
  const lengthRule = getLengthRule(payload.chapterLengthLabel)
  const chapterMinChars = Math.max(1000, Math.floor(Number(payload.chapterMinChars || 3500)))
  const chapterMaxChars = Math.max(chapterMinChars, Math.floor(Number(payload.chapterMaxChars || 4500)))
  const characterLengthRule = `khoảng ${chapterMinChars}–${chapterMaxChars} ký tự tiếng Việt cho riêng phần BẢN ĐỌC CHO ĐỘC GIẢ`
  const moduleInstruction = getModuleInstruction(payload.moduleId)
  const genreInstruction = getGenreInstruction(payload.genreLabel)
  const premiseInstruction = getPremiseInstruction(payload)
  const libraryAvoidanceInstruction = getLibraryAvoidanceInstruction(payload)
  const motifUniquenessInstruction = getGlobalMotifUniquenessInstruction(payload)
  const storySeedInstruction = getStorySeedInstruction(payload)
  const antiRepeatInstruction = getOpenAIAntiRepeatInstruction(payload)
  const nameDiversityInstruction = getNameDiversityInstruction(payload)
  const factoryCharacterNameLockInstruction = getFactoryCharacterNameLockInstruction(payload)
  const titleNamingInstruction = getTitleNamingInstruction(payload)
  const heroineInstruction = getHeroineInstruction(payload.mainCharacterStyleLabel)
  const urbanFemaleScaleLockInstruction = getUrbanFemaleScaleLockInstruction(payload)
  const evidenceAnchorInstruction = getFactoryEvidenceAnchorInstruction(payload)
  const reportTitleLockInstruction = getFactoryReportTitleLockInstruction(payload)
  const storyContext = buildStoryContext(payload)
  const technicalReport = getTechnicalReportInstruction()
  const cliffhangerRule = getCliffhangerRule(payload)
  const missionInstruction = getChapterMissionInstruction(payload)
  const advancementInstruction = getChapterAdvancementInstruction(payload)
  const progressionQualityInstruction = getProgressionQualityInstruction()
  const sceneFunctionInstruction = getSceneFunctionInstruction()
  const villainPresenceInstruction = getVillainPresenceInstruction()
  const humanCostInstruction = getHumanCostInstruction()
  const vietnameseProseHardGateInstruction = getVietnameseProseHardGateInstruction()
  const vietnameseSemanticLogicGateInstruction = getVietnameseSemanticLogicGateInstruction()
  const vietnameseLineEditV14Instruction = getVietnameseLineEditV14Instruction()
  const nextChapterNumber = Math.max(1, Math.floor(payload.nextChapterNumber || 1))
  const isContinuation = nextChapterNumber > 1

  return `
Bạn là Master Story Engine Core v3.2 viết nữ tần đô thị mở rộng nhiều thể loại cho độc giả Việt.

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

${libraryAvoidanceInstruction}

${motifUniquenessInstruction}

${storySeedInstruction}

${antiRepeatInstruction}

${nameDiversityInstruction}

${factoryCharacterNameLockInstruction}

${titleNamingInstruction}

${heroineInstruction}

${urbanFemaleScaleLockInstruction}

${evidenceAnchorInstruction}

${reportTitleLockInstruction}

${storyContext}

${missionInstruction}

${advancementInstruction}

${progressionQualityInstruction}

${sceneFunctionInstruction}

${villainPresenceInstruction}

${humanCostInstruction}

CHAPTER CONTINUATION RULE:
- Số chương cần viết: Chương ${nextChapterNumber}.
- ${
    isContinuation
      ? 'Đây là chương tiếp theo của truyện đã có chương trước. Tuyệt đối không viết lại chương 1, không mở truyện lại từ đầu, không reset quan hệ nhân vật, không đổi tên nhân vật chính/phản diện, không đổi tính cách nữ chính.'
      : 'Đây là chương mở đầu. Có thể mở bằng cú sốc mạnh, nhưng phải chọn premise theo GENRE LOCK và PREMISE DIVERSITY LOCK, không mặc định hot search nếu không cần.'
  }
- Nếu là chương tiếp theo, đoạn mở đầu phải nối từ sự kiện/hook/bằng chứng ở chương gần nhất, nhưng không được recap quá 2 câu.
- Không tự tạo lại một vụ hot search mở đầu mới nếu chương trước đã có hook cụ thể, trừ khi đó là hệ quả trực tiếp của chương trước.
- Tiêu đề chương bắt buộc dùng dạng: "# Chương ${nextChapterNumber} — [tên chương ngắn, cụ thể, có hook]".
- Tên chương phải thể hiện biến cố/vật chứng/state change chính của chương này, không được là tiêu đề chung chung hoặc giống phân tích.
- Cấm tuyệt đối các tên chương placeholder: "Chi Tiết Bị Đặt Sai", "Món Đồ Bị Đặt Sai", "Vật Chứng Bị Lộ", "Sự Thật Bị Che Giấu", "Manh Mối Đầu Tiên".
- Nếu vật chứng là bản nháp thông cáo / thông cáo truyền thông, tiêu đề chương nên xoáy vào twist thời gian như: "Bản Nháp Được Soạn Trước" hoặc "Lời Xin Lỗi Có Trước Scandal".
- Nếu là Chương 1, phần kỹ thuật bắt buộc có "Tên truyện đề xuất" khác với tiêu đề chương.

CONTINUITY STATE CHANGE RULE:
- Chương này bắt buộc phải làm trạng thái truyện thay đổi rõ ràng so với chương trước.
- Không được chỉ nhắc lại bằng chứng cũ.
- Không được chỉ họp và tranh luận lại chuyện cũ.
- Nếu đã có một vật chứng ở chương trước, chương này phải:
  1. dùng vật chứng đó để mở ra vật chứng mới; hoặc
  2. khiến một nhân vật đổi phe; hoặc
  3. khiến phản diện phản công; hoặc
  4. làm quyền lực của phản diện bị lung lay; hoặc
  5. làm nữ chính lấy lại một phần quyền kiểm soát.
- Nếu chương trước đã có cảnh họp/phòng điều hành/đối chất/niêm phong, chương này phải ưu tiên chuyển sang cảnh hành động, cảnh gia đình, cảnh lấy chứng cứ, cảnh nhân chứng hoặc cảnh phản công.
- Mỗi chương viết tiếp phải có một hậu quả mới từ chương trước: quyền bị thay đổi, người đổi phe, bằng chứng được xác thực, phản diện ra đòn mới, dư luận đổi chiều hoặc đứa trẻ bị ảnh hưởng rõ.

ANTI-REPEAT SCENE RULE:
- Không dùng lại cùng loại cảnh chính với chương liền trước nếu không có biến cố mới.
- Nếu chương trước là họp/phòng điều hành/đối chất, chương này nên chuyển sang cảnh hành động, cảnh gia đình, cảnh lấy chứng cứ, cảnh theo dõi, cảnh nhân chứng hoặc cảnh phản công.
- Mỗi chương phải có ít nhất một cảnh mới, một địa điểm mới hoặc một hành động mới có giá trị.
- Không được reset conflict về trạng thái ban đầu như “lần đầu bị vu oan”, “lần đầu bị tước quyền”, “lần đầu phát hiện vật chứng” nếu context đã có các sự kiện đó.

${cliffhangerRule}

GENRE + PREMISE + HEROINE EXECUTION RULE:
- Thể loại, premise và kiểu nữ chính đã chọn là khóa cốt lõi, không được viết lệch.
- Nếu Prompt idea trống, phải tự chọn hook theo PREMISE DIVERSITY LOCK.
- Không để nữ chính hành xử trái option đã chọn chỉ để tạo drama rẻ tiền.
- Không để nhân vật phụ hoặc nam chính cướp vai trò giải quyết vấn đề của nữ chính.
- Không dùng Weibo/hot search làm hook chính chỉ vì module có chữ viral. Chỉ dùng khi hợp thể loại/prompt.
- Mỗi chương phải có ít nhất 2 chi tiết chỉ thuộc genreLabel/storySeed hiện tại; nếu xóa tên genre mà chương vẫn giống truyện cũ, phải rewrite.
- Không được quay về vòng lặp hồ sơ/camera/log/phong tỏa/pháp lý nếu seed không yêu cầu rõ.

MALE ANTAGONIST PRESENCE RULE:
- Nếu có nam phản diện/chồng/CEO/tổng tài, hắn phải có ít nhất 1–2 câu thoại sắc, gây tổn thương trực tiếp hoặc tạo áp lực thật.
- Không để mẹ chồng/gia tộc/PR gánh toàn bộ vai phản diện nếu nam phản diện là nhân vật chính của xung đột.
- Nam phản diện phải thể hiện quyền lực qua lựa chọn, đe dọa, hợp đồng, cổ phần, luật sư hoặc thái độ phủ nhận nữ chính.
- Nếu nam phản diện là nhân vật chính của xung đột, chương phải có một hành động/lời nói khiến độc giả ghét hoặc nghi ngờ hắn.

SUPPORT CHARACTER LIMIT RULE:
- Nhân vật hỗ trợ như luật sư, trợ lý, bạn thân, quản gia chỉ được hỗ trợ công cụ/thông tin, không được giải quyết thay nữ chính.
- Quyết định chính, đòn phản công chính và lựa chọn nguy hiểm phải thuộc về nữ chính.
- Nếu nhân vật hỗ trợ xuất hiện quá mạnh, hãy giảm vai trò của họ thành cảnh báo, xác minh hoặc chuẩn bị giấy tờ.

EVIDENCE PACING HARD LIMIT:
- Trong BẢN ĐỌC CHO ĐỘC GIẢ, mỗi chương chỉ được dùng tối đa 1 vật chứng chính + 1 vật chứng phụ.
- Các vật chứng cũ chỉ được nhắc lại thoáng qua để nối mạch, không phân tích lại dài.
- Nếu có nhiều hơn 2 vật chứng trong storySeed hoặc context, hãy chọn 1 vật chứng chính + 1 vật chứng phụ cho chương này.
- Chương 1 không được giải thích toàn bộ chuỗi âm mưu.
- Chương 2 trở đi không được tái phát hiện cùng vật chứng như mới.
- Tier 3–4 như sao kê đầy đủ, video hoàn chỉnh, nhân chứng quyết định, hồ sơ pháp lý đầy đủ phải giữ cho chương sau hoặc final payoff.

ANTI PHONE CALL LOOP:
- Không để chương nào cũng chỉ gồm điện thoại gọi đến, luật sư trả lời, phản diện đe dọa, rồi nữ chính nói sẽ thu thập.
- Nếu có cuộc gọi, cuộc gọi phải dẫn tới hành động mới ngoài đời thật: đi đến địa điểm mới, gặp người mới, bị chặn quyền, bị gọi vào họp, bị đưa lên nhóm công khai, hoặc phải đối chất trực tiếp.
- Không được dùng một phản diện/PR/luật sư gọi điện nhiều lần chỉ để lặp lời đe dọa.
- Đe dọa phải tạo hậu quả thật, không chỉ là câu nói.

LOCATION PROGRESSION RULE:
- Không để 3 chương liên tiếp diễn ra quanh cùng một địa điểm như sân bay/phòng VIP/hầm xe.
- Nếu chương trước đã ở sân bay, chương này nên đến văn phòng luật, công ty, bệnh viện, trường học, phòng họp, nhà gia tộc, hoặc nơi giữ camera/nhân chứng.
- Nếu chương trước đã ở hầm xe, chương này nên chuyển sang nhóm phụ huynh, bệnh viện, phòng họp gia tộc, trường học, hoặc nơi xác minh hồ sơ.
- Địa điểm mới phải làm xung đột mới xuất hiện, không chỉ đổi cảnh cho có.

REAL STATE CHANGE RULE:
- Cuối chương, tình thế phải thay đổi thật.
- Ví dụ state change hợp lệ:
  + nữ chính mất quyền truy cập tài khoản/cổ phần/trường học/công ty
  + phản diện bị lộ một sơ hở xác minh được
  + nhân chứng mới đồng ý hoặc từ chối giúp
  + nhóm công khai đổi chiều
  + tòa/văn phòng luật/công ty gửi thông báo thật
  + nữ chính buộc phải đến một cuộc họp/hòa giải/đối chất
  + một người tưởng giúp nữ chính hóa ra có vấn đề
- Không tính state change nếu chỉ là "trò chơi mới bắt đầu" hoặc "tôi quyết tâm hơn".

WORDING NATURALNESS RULE:
- Tránh câu dịch máy, cụm sai collocation, hình ảnh quá lạ hoặc không tự nhiên trong tiếng Việt.
- Tránh ẩn dụ kỳ như "đồng xu trong bụng", "vết nứt trong linh hồn", "con dao trong tim" nếu không thật sự cần.
- Ưu tiên phản ứng cụ thể: ngón tay khựng lại, cổ họng nghẹn, màn hình nhòe đi, lưng lạnh đi.
- Nếu nam phản diện/chồng/CEO còn trẻ hoặc cùng thế hệ nữ chính, không gọi là "ông ta". Ưu tiên "anh ta", "hắn", hoặc gọi tên riêng.

CHARACTER CONSISTENCY RULE:
- Nếu STORY CONTEXT hoặc chương tham chiếu đã có tên nhân vật, bắt buộc giữ nguyên tên đó.
- Không đổi họ/tên nữ chính, nam phản diện, người thứ ba, mẹ chồng/bà nội chồng giữa các chương.
- Không đặt nữ chính cùng họ với chồng/nam phản diện nếu không có lý do thân phận/huyết thống đặc biệt.
- Không dùng lẫn mẹ chồng và bà nội chồng cho cùng một nhân vật.

NARRATIVE CRAFT RULE:
- Mỗi đoạn văn phải làm ít nhất một việc: đẩy cốt truyện, tăng áp lực, bộc lộ cảm xúc, cài bằng chứng, trả điểm trả sau, hoặc mở hook.
- Nếu một đoạn chỉ giải thích chung chung mà không có hành động/cảm xúc/thông tin mới, phải tự bỏ hoặc viết lại thành cảnh.
- Không kể lướt quá nhiều sự kiện. Hãy chọn một cảnh trọng tâm để đào sâu.
- Nữ chính thông minh nhưng không toàn năng. Cô được thắng một nhịp nhỏ, không được thắng sạch quá sớm.
- Phản diện phải có phản ứng và phản công hợp lý, không đứng yên chịu thua.

CLEAN PROSE RULE:
- BẢN ĐỌC CHO ĐỘC GIẢ không được dùng ngôn ngữ phân tích kỹ thuật như: "phản diện đang phản công", "nữ chính phản đòn", "mục tiêu chương", "genre lock", "heroine lock", "ending strategy", "premise diversity lock", "character name diversity lock".
- Những ý kỹ thuật phải được chuyển thành cảnh truyện tự nhiên, bằng hành động/tin nhắn/đối thoại/vật chứng/phản ứng cơ thể.
- Không kết thúc phần đọc bằng câu kiểu phân tích. Kết chương phải là hình ảnh, hành động, tin nhắn, bằng chứng mới, áp lực mới, hoặc một câu thoại có hook.
- Khi nữ chính phản đòn, ưu tiên dùng đối thoại ngắn, lạnh, sắc thay vì giải thích chiến thuật.

HUMAN PROSE RULE:
- Viết như tác giả người thật đang kể chuyện, không viết như máy hoàn thành checklist.
- Câu văn được phép có nhịp dài ngắn khác nhau, nhưng không được rối.
- Đối thoại không được chỉ để giải thích cốt truyện. Mỗi câu thoại phải có ý đồ: ép, né, đe dọa, thử phản ứng, che giấu, châm chọc, hoặc lật thế.
- Nhân vật không được nói quá đúng, quá đủ, quá sạch. Người thật thường nói thiếu một nửa, vòng vo, cắt ngang, hoặc giấu ý.
- Không viết đoạn nào giống bài phân tích đạo đức hoặc tổng kết bài học.

${vietnameseProseHardGateInstruction}

${vietnameseSemanticLogicGateInstruction}

${vietnameseLineEditV14Instruction}

SELF-REVISION PASS BẮT BUỘC TRƯỚC KHI TRẢ OUTPUT:
Trước khi xuất kết quả cuối cùng, hãy tự đọc lại bản chương như một biên tập viên và tự sửa trong im lặng theo checklist này:
1. Có đúng số chương cần viết không? Nếu là Chương ${nextChapterNumber}, không được ghi nhầm thành chương khác.
2. Nếu là chương tiếp theo, có lặp lại cùng cảnh/vật chứng/hành động của chương trước không? Nếu có, phải đổi sang hành động hoặc địa điểm mới.
3. Có chapter mission rõ chưa? Nếu chưa, viết lại chương để mission rõ hơn.
4. Có state change thật ở cuối chương chưa? Nếu chưa, thêm hậu quả hoặc biến cố thật.
5. Có lặp vòng điện thoại → luật sư → đe dọa → metadata không? Nếu có, viết lại.
6. Có xả quá nhiều bằng chứng không? Nếu có, giữ lại tối đa 1 vật chứng chính + 1 vật chứng phụ.
7. Có đi lệch khỏi STORY CONTEXT không? Nếu lệch tên nhân vật, quan hệ, bằng chứng, bối cảnh, phải sửa.
8. Có câu nào giống phân tích kỹ thuật trong BẢN ĐỌC không? Nếu có, phải biến thành cảnh.
9. Có đoạn nào lan man, chỉ giải thích mà không đẩy truyện không? Nếu có, cắt hoặc viết lại.
10. Kết chương có đủ hook để đọc tiếp không? Nếu chưa, viết lại đoạn cuối.
11. BẢN ĐỌC có đọc như truyện thật không? Nếu còn như outline/tóm tắt, viết lại thành cảnh có hành động và đối thoại.
12. Tên chương có bám đúng vật chứng/biến cố/state change chính của chương không? Nếu tiêu đề chung chung hoặc giống phân tích, phải đổi lại.
13. Tên truyện đề xuất trong phần kỹ thuật có khớp vật chứng/mâu thuẫn trung tâm thật sự không? Nếu tên hiện tại lệch, phải đề xuất tên mới.
14. Phần kỹ thuật có điền đầy đủ scene function, chapter mission, địa điểm chính, hành động mới, state change, kiểm tra tên truyện/tên chương và chương sau nên đi đâu chưa?
15. Chương đã thể hiện đúng heroineLabel chưa? Nếu nữ chính vẫn hành xử như một mẫu “lạnh lùng tung bằng chứng” chung, hãy rewrite cách quan sát/đối thoại/phản công cho đúng kiểu nữ chính đã chọn.
16. 5 đoạn đầu có câu nào cụt, gượng, dịch máy, thuật ngữ thô hoặc xưng hô sai vai không? Nếu có, rewrite 5 đoạn đầu.
17. Có thuật ngữ như cache/watermark/group board/forward/access/reference/log/metadata chưa Việt hóa không? Nếu có, Việt hóa hoặc giải thích bằng ngữ cảnh.
18. Có hội thoại cấp dưới nói trống không với sếp không? Nếu có, sửa kính ngữ vừa đủ.
19. Có câu nào chỉ đúng ý nhưng sai tiếng Việt tự nhiên không? Nếu có, sửa câu đó trước khi trả output.
20. Có câu nào sai quan hệ chủ thể — hành động — đối tượng không? Ví dụ hợp đồng tự “chuyển giao” quyền, bó hoa tự “xác nhận” hợp đồng. Nếu có, sửa ngay.
21. Có câu hỏi/tường thuật về sự việc đã xảy ra nhưng thiếu “đã / đã được / bị nghi là đã / được cho là đã” không? Nếu có, sửa thời thái.
22. Vật chứng chính có cơ chế nối với hậu quả chưa? Nếu chưa, thêm 1–2 câu cầu nối tự nhiên.
23. Nhân chứng/người giao hàng/luật sư/phóng viên xuất hiện có lý do trong cảnh chưa? Nếu chưa, thêm lý do hoặc bỏ nhân vật tiện tay.
24. BẢN ĐỌC có bị lặp tiêu đề chương không? Nếu có, chỉ giữ đúng một tiêu đề chương.

CHAPTER QUALITY TARGET:
- Độ dài mục tiêu: ${characterLengthRule}.
- BẢN ĐỌC CHO ĐỘC GIẢ bắt buộc nằm trong khoảng ${chapterMinChars}–${chapterMaxChars} ký tự tiếng Việt.
- Không được viết ngắn hơn ${chapterMinChars} ký tự.
- Không được vượt quá ${chapterMaxChars} ký tự quá nhiều.
- Không kéo dài bằng cách lặp ý, lặp cảm xúc, lặp bằng chứng hoặc nhồi giải thích.
- Tăng đối thoại va chạm.
- Giữ bối cảnh đã chọn.
- Giữ đúng premise theo thể loại.
- Giữ đúng kiểu nữ chính đã chọn.
- Nữ chính có cảm xúc nhưng không yếu đuối kéo dài, chưa toàn thắng quá sớm.
- Cuối chương phải có hook mạnh để đọc tiếp.

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

# Chương ${nextChapterNumber} — [tên chương cụ thể, bám vật chứng/biến cố; không dùng placeholder]

[Viết nội dung chương bằng văn xuôi liên tục.]

Sau phần đọc, thêm dòng "---", rồi viết phần kỹ thuật theo mẫu sau.

KHÓA PARSE TITLE CHO ADMIN:
- Ở phần kỹ thuật, dòng "- Tên truyện đề xuất:" PHẢI dùng đúng EXACT_STORY_TITLE_FOR_REPORT ở trên.
- Không được dùng title khác chỉ vì nghe kịch tính hơn.
- Không được dùng title từ motif cũ hoặc title tưởng tượng không có trong vật chứng chính.
- Dòng "- Tiêu đề chương hiện tại:" mới là nơi ghi tiêu đề chương.
- Tuyệt đối không nhập nhằng tên truyện và tên chương.

${technicalReport}
`.trim()
}

export function buildPrompt(payload: NormalizedGeneratePayload) {
  if (payload.mode === 'story-plan') {
    return buildStoryPlanPrompt(payload)
  }

  return buildChapterPrompt(payload)
}


export function buildStoryEditorPrompt(payload: NormalizedGeneratePayload, draftText: string) {
  const lengthRule = getLengthRule(payload.chapterLengthLabel)
  const chapterMinChars = Math.max(1000, Math.floor(Number(payload.chapterMinChars || 3500)))
  const chapterMaxChars = Math.max(chapterMinChars, Math.floor(Number(payload.chapterMaxChars || 4500)))
  const characterLengthRule = `khoảng ${chapterMinChars}–${chapterMaxChars} ký tự tiếng Việt cho riêng phần BẢN ĐỌC CHO ĐỘC GIẢ`
  const chapterNumber = Math.max(1, Math.floor(payload.nextChapterNumber || 1))
  const target = payload.chapterTarget > 0 ? payload.chapterTarget : 'chưa đặt'
  const storySeed = payload.storySeed
  const currentPlan = storySeed?.storyPlan?.chapterPlan?.find(
    (chapter) => chapter.chapterNumber === chapterNumber,
  )
  const previousPlan = storySeed?.storyPlan?.chapterPlan?.find(
    (chapter) => chapter.chapterNumber === chapterNumber - 1,
  )
  const nextPlan = storySeed?.storyPlan?.chapterPlan?.find(
    (chapter) => chapter.chapterNumber === chapterNumber + 1,
  )
  const urbanFemaleScaleLockInstruction = getUrbanFemaleScaleLockInstruction(payload)
  const evidenceAnchorInstruction = getFactoryEvidenceAnchorInstruction(payload)
  const reportTitleLockInstruction = getFactoryReportTitleLockInstruction(payload)
  const factoryCharacterNameLockInstruction = getFactoryCharacterNameLockInstruction(payload)
  const vietnameseEditorHardGateInstruction = getVietnameseEditorHardGateInstruction()
  const vietnameseSemanticLogicGateInstruction = getVietnameseSemanticLogicGateInstruction()
  const vietnameseLineEditV14Instruction = getVietnameseLineEditV14Instruction()

  const recentContext = payload.recentChapters
    .slice(0, 3)
    .map((chapter, index) => {
      const title = safeText(chapter.title, `Chương gần nhất ${index + 1}`)
      const summary = safeText(chapter.summary)
      const content = safeText(chapter.content)
      return `- ${title}: ${summary || compactText(content, 600) || 'Không có dữ liệu.'}`
    })
    .join('\n')

  return `
Bạn là biên tập viên truyện tiếng Việt. Ưu tiên làm văn tự nhiên, đời hơn, bớt giọng AI.

NHIỆM VỤ:
Đọc bản nháp chương bên dưới và rewrite thành bản final đăng được, nhưng không làm nó kịch hơn bản nháp.
Quan trọng: không chỉ “soát lỗi chính tả”. Phải line-edit thật sự từng đoạn để xóa câu văn máy, câu meta/checklist, câu ẩn dụ gượng và câu tổng kết thay cho hành động.
Đây là bước biên tập sau Chapter Writer, không phải viết truyện mới từ đầu.

THÔNG TIN TRUYỆN:
- Tên truyện: ${payload.title}
- Chương cần sửa: Chương ${chapterNumber}/${target}
- Thể loại: ${payload.genreLabel}
- Module: ${payload.moduleId}
- Kiểu nữ chính: ${payload.mainCharacterStyleLabel}
- Độ dài mục tiêu phần đọc: ${characterLengthRule}
- Khoảng ký tự bắt buộc: ${chapterMinChars}–${chapterMaxChars} ký tự tiếng Việt
- Fallback length rule cũ: ${lengthRule.readerLength}
- Core premise: ${storySeed?.corePremise || payload.promptIdea || payload.storySummary || 'Không có'}
- Evidence object: ${storySeed?.evidenceObject || 'Không có'}
- Main conflict: ${storySeed?.mainConflict || 'Không có'}
- Hidden truth: ${storySeed?.hiddenTruth || 'Không có'}
- Villain type: ${storySeed?.villainType || 'Không có'}
- Emotional hook: ${storySeed?.emotionalHook || 'Không có'}

${urbanFemaleScaleLockInstruction}

${evidenceAnchorInstruction}

${reportTitleLockInstruction}

${factoryCharacterNameLockInstruction}

${vietnameseEditorHardGateInstruction}

${vietnameseSemanticLogicGateInstruction}

${vietnameseLineEditV14Instruction}

CHAPTER PLAN HIỆN TẠI:
- Mission: ${currentPlan?.mission || 'Không có'}
- Scene type: ${currentPlan?.sceneType || 'Không có'}
- Main scene: ${currentPlan?.mainScene || 'Không có'}
- Evidence beat: ${currentPlan?.evidenceBeat || 'Không có'}
- Villain beat: ${currentPlan?.villainBeat || 'Không có'}
- Heroine move: ${currentPlan?.heroineMove || 'Không có'}
- Emotional beat: ${currentPlan?.emotionalBeat || 'Không có'}
- Power shift: ${currentPlan?.powerShift || 'Không có'}
- Ending hook: ${currentPlan?.endingHook || 'Không có'}
- Previous plan: ${previousPlan ? `${previousPlan.title} — ${previousPlan.powerShift}` : 'Không có'}
- Next setup: ${nextPlan ? `${nextPlan.title} — ${nextPlan.mission}` : 'Không có'}

TITLE / CHAPTER NAME EDITOR LOCK:
- Tên truyện hiện tại: ${payload.title}
- Tên từ storySeed nếu có: ${storySeed?.title || 'Không có'}
- Vật chứng trung tâm: ${storySeed?.evidenceObject || 'Không có'}
- Biến cố kích hoạt: ${storySeed?.incitingIncident || 'Không có'}
- Mâu thuẫn chính: ${storySeed?.mainConflict || 'Không có'}
- Tiêu đề chương từ planner: ${currentPlan?.title || 'Không có'}

Nhiệm vụ đặt tên trong editor pass:
1. Nếu tiêu đề chương trong draft chung chung/kiểu phân tích/lệch nội dung, phải đổi dòng tiêu đề chương thành tên mới cụ thể hơn.
2. Tên chương final phải phản ánh vật chứng, biến cố, địa điểm, thời hạn, cú ép, nhân vật phản bội hoặc state change chính của chương.
3. Cấm giữ các tiêu đề kiểu: “Cú ép đầu tiên và tổn thương thật”, “Đổi sân khấu, không đổi mục tiêu”, “Cú đáp trả bất ngờ”, “Ván cờ mới bắt đầu”, “Sự thật dần hé lộ”.
4. Cấm giữ các placeholder: “Chi Tiết Bị Đặt Sai”, “Món Đồ Bị Đặt Sai”, “Vật Chứng Bị Lộ”, “Sự Thật Bị Che Giấu”, “Manh Mối Đầu Tiên”. Nếu draft có các tên này, phải đổi ngay.
5. Nếu phần kỹ thuật có “Tên truyện đề xuất”, tên đó phải khớp nội dung thật. Nếu tên hiện tại lệch, đề xuất tên mới dựa trên vật chứng/mâu thuẫn trung tâm.
5. Không đổi tên truyện trong phần BẢN ĐỌC, nhưng phần kỹ thuật phải ghi rõ nếu tên hiện tại không khớp và đề xuất tên thay thế.

CONTEXT GẦN NHẤT:
${recentContext || '- Chưa có chương trước.'}


NATURAL VIETNAMESE PROSE MODE — ƯU TIÊN VĂN NGƯỜI THẬT:
Mục tiêu của editor pass này không phải làm chương “kịch hơn”, mà làm chương đọc tự nhiên hơn.

Luật rewrite:
1. Cắt giọng AI/sân khấu hóa. Không biến cảnh đời thường thành “khán đài”, “phiên xử”, “ván cờ”, “vòng quyền lực”, “áp lực đè lên vai”.
2. Không gọi tên cảm xúc trừu tượng nếu có thể viết bằng hành động nhìn thấy được: người im đi, cúi mặt, siết tay, nhìn sang nhau, rút điện thoại, đặt giấy xuống bàn.
3. Thoại phải ngắn như người thật nói. Phản diện không giải thích plot dài. Một câu thoại quá 2 dòng thì chia nhỏ hoặc cắt.
4. Nữ chính không tự tuyên ngôn quá nhiều. Giảm các câu kiểu “tôi sẽ không cúi đầu”, “tôi không để ai...”, chỉ giữ 1 câu mạnh nếu thật cần.
5. Chương 1 chỉ cần một hiểu lầm cụ thể + một vật chứng cụ thể + một manh mối nhỏ. Không nhồi thêm gia tộc, luật sư, ngân hàng, hội đồng, bữa cơm gia đình nếu draft không bắt buộc.
6. Giữ drama bằng sự việc, không giữ drama bằng ẩn dụ. Ưu tiên câu ngắn, rõ, có vật thể/cử chỉ/đối thoại.
7. Nếu thấy câu “hay” nhưng không giống người Việt kể chuyện đời thường, hãy đổi thành câu bình thường hơn.

Ví dụ sửa:
- Sai: “bỗng phòng thử đồ thành khán đài.”
  Đúng: “Mọi người trong phòng thử đồ dừng tay và quay sang nhìn tôi.”
- Sai: “Áp lực dồn lên.”
  Đúng: “Tôi nghe tiếng người phía sau bắt đầu bàn tán.”
- Sai: “Quyền lực công khai có thể muốn đẩy tôi xuống.”
  Đúng: “Họ muốn tôi cúi đầu ngay tại đó.”
- Sai: “Từ ‘nhà’ được thốt ra như một lực đẩy.”
  Đúng: “Chỉ một chữ ‘nhà’ cũng đủ khiến mọi người nhìn tôi khác đi.”
- Sai: “Lời anh ta như một con dấu.”
  Đúng: “Câu đó khiến mọi người im đi vài giây.”

EDITOR CONTINUITY CHECK:
- Nếu chương mới giống đang viết lại một chương cũ, hãy sửa.
- Nếu chương chỉ lặp lại cảnh họp/tố cáo/niêm phong mà không có bằng chứng mới hoặc hậu quả mới, hãy sửa.
- Nếu conflict bị reset về trạng thái cũ, hãy sửa.
- Nếu nữ chính không có nước đi mới, hãy thêm nước đi cụ thể.
- Nếu chương trước đã có bằng chứng A, chương này phải dùng A để tạo hậu quả mới, mở khóa bằng chứng B hoặc khiến phản diện phản công.
- Nếu con/người yếu thế không có ảnh hưởng cảm xúc nào trong 1–2 chương gần đây, hãy thêm một khoảnh khắc ngắn nhưng đau.
- BẢN ĐỌC sau rewrite phải nằm trong khoảng ${chapterMinChars}–${chapterMaxChars} ký tự tiếng Việt. Nếu quá ngắn, mở rộng bằng cảnh/đối thoại/hành động mới có ích. Nếu quá dài, cắt phần giải thích lặp.

EDITOR CHECKLIST BẮT BUỘC:
1. Giữ đúng logic chính, tên nhân vật, vật chứng, bối cảnh và kết quả chính của chương.
2. Ưu tiên làm chương tự nhiên hơn: cảnh rõ, hành động rõ, thoại ngắn, ít diễn giải.
3. Nếu draft đã có đủ drama, không thêm drama mới. Chỉ sửa câu gượng, giảm lặp, cắt ẩn dụ và làm thoại đời hơn.
4. Không tự thêm ngân hàng, luật sư, hội đồng, gia tộc, phòng VIP, bệnh viện, công chứng nếu chương không cần.
5. Nếu có phản diện, cho họ nói ngắn và có mục đích. Không để phản diện giảng giải toàn bộ kế hoạch.
6. Nếu có nữ chính đáp trả, chỉ cần 1–2 câu chắc, không biến thành bài diễn thuyết.
7. Emotional beat phải đến từ cử chỉ nhỏ hoặc lựa chọn khó, không phải câu tổng kết “tôi đau nhưng không gục”.
8. Ending hook phải cụ thể nhưng đời: một người nhìn thấy, một hóa đơn, một vết keo, một cuộc gọi ngắn, một địa điểm cần kiểm tra. Không kết bằng “ván cờ bắt đầu”.
9. BẢN ĐỌC phải là văn truyện mượt, không có bullet/list/checklist/kỹ thuật.
10. Tên chương phải bám vật chứng/cảnh chính, nhưng không cần cố quá bí hiểm.
11. BẢN PHÂN TÍCH KỸ THUẬT vẫn giữ để admin debug, nhưng phải cập nhật đúng sau khi rewrite.
12. Trước khi trả output, tự đọc 5 đoạn đầu. Nếu nghe giống AI đang dựng sân khấu, rewrite lại bằng câu đời hơn.
13. Nếu thấy câu lộ kỹ thuật prompt như “lần một/lần hai vật chứng xuất hiện”, “dùng nó làm cứ điểm”, “chuyển cuộc chơi”, “trả đũa bằng sự thật”, phải rewrite ngay thành hành động cụ thể trong scene.
14. Nếu thấy câu sai tai như “ngòi nắm”, “mảnh hé”, “đứng tay chốc lát”, “không để tiếng đó hiện trên mặt”, phải sửa ngay, không được giữ vì đúng ý.
15. Nếu có trẻ nhỏ/người yếu thế xuất hiện chỉ để tăng cảm xúc, phải thêm vai trò cụ thể trong 1 câu hoặc cắt bớt để tránh cảm giác token AI.


CẤM:
- Không dùng các cụm sân khấu hóa: “khán đài”, “phiên xử”, “bản cáo trạng”, “vòng quyền lực”, “quyền lực công khai”, “ván cờ”, “áp lực dồn lên”, “lời nói như con dấu”.
- Không đổi tên nữ chính, phản diện, mẹ/con/người thân đã có.
- Không đổi vật chứng trung tâm.
- Không được biên tập chương quay về format chung hồ sơ/camera/log/phong tỏa nếu genre/storySeed không yêu cầu.
- Phải giữ chất nữ tần đô thị drama/vả mặt, nhưng cảnh, vật chứng, cảm xúc và cách phản công phải riêng theo genreLabel + heroineLabel.
- Không đổi chương số.
- Không viết lại lệch sang một premise khác.
- Không thêm nam chính cứu toàn bộ tình thế.
- Không để phần đọc lộ chữ “editor”, “checklist”, “planner”, “rule”, “mission”.
- Không để văn đọc như bản dịch máy/convert word-by-word.
- Không dùng thuật ngữ kỹ thuật thô nếu chưa Việt hóa hoặc giải thích bằng ngữ cảnh.
- Không giữ câu sai thời thái/sai chủ thể dù câu đó nghe có vẻ trang trọng.
- Không giữ cụm sáo/gượng trong 5 đoạn đầu: “phông nền trắng bóng”, “ánh đèn lạnh”, “giọng khô như thép”, “giải thích sao được”, “ống kính như lưỡi dao”.
- Không lặp heading chương trong BẢN ĐỌC.


FINAL HUMAN LINE-EDIT AUDIT — BẮT BUỘC TRƯỚC KHI TRẢ OUTPUT:
Hãy đọc lại BẢN ĐỌC như một biên tập viên người Việt khó tính, không như một người viết prompt.
Nếu gặp một câu thuộc các nhóm dưới đây, phải sửa ngay trong bản final:

1. Câu lộ kỹ thuật viết truyện:
- “đây là lần một/lần hai/lần ba vật chứng xuất hiện”
- “dùng nó làm cứ điểm”
- “chuyển cuộc chơi từ cảm xúc sang lý lẽ”
- “câu chuyện chuyển từ cáo buộc sang so sánh manh mối”
Sửa thành hành động cụ thể: chụp ảnh, giữ giấy, hỏi người gửi, khóa điện thoại, đối chiếu giờ, giữ file gốc.

2. Câu tổng kết/slogan:
- “trả đũa bằng sự thật”
- “sự thật sẽ nói thay tôi”
- “trò chơi đã bắt đầu”
- “ván cờ mới mở”
- “khúc dạo đầu”
Sửa thành một hook cụ thể: một cuộc gọi, một người bước vào, một dòng tin nhắn, một dấu mực, một hóa đơn, một camera cần kiểm tra.

3. Cụm sai tai người Việt:
- “mảnh hé”, “ngòi nắm”, “đứng tay chốc lát”, “bằng chứng tĩnh người”, “che nhoài”, “không để tiếng đó hiện trên mặt”, “mắt xích quan sát”.
Sửa bằng tiếng Việt đời thường: “manh mối”, “chỗ bám”, “dừng lại vài giây”, “thứ có thể lưu lại”, “che đi”, “không để lộ ra”, “vị trí ai ra vào cũng phải đi ngang qua”.

4. Ẩn dụ gượng:
- “mọi âm thanh dồn về…”, “mọi ánh mắt dồn vào…”, “tiếng hỏi như mũi dao”, “lời nói như con dấu”, “nỗi sợ ló dạng ở tay…”.
Sửa thành cảnh nhìn thấy được: “cả phòng quay sang”, “mấy người đứng gần cúi xuống nhìn”, “anh ta hỏi đủ lớn”, “câu đó khiến mọi người im vài giây”, “bàn tay bà run”.

5. Giải thích tâm lý quá rõ:
- Không viết kiểu “tôi hiểu ngay: ...” quá nhiều.
- Không phân tích hộ nhân vật phụ bằng đoạn dài.
- Để cử chỉ tự nói: siết giấy, tránh mắt, ngập ngừng, nhìn về cửa, khóa điện thoại, xóa tin nhắn.

6. Đoạn mở:
- Không mở bằng câu bê nguyên title/evidence dài vào câu đầu.
- Vào thẳng cảnh: địa điểm, người, vật, âm thanh, hành động.
- 5 đoạn đầu phải đọc như truyện thật, không như bản dựng cảnh của AI.

7. Đứa trẻ/người yếu thế:
- Nếu xuất hiện, phải có vai trò rõ trong tình huống hiện tại.
- Không đưa vào chỉ để tăng cảm xúc rồi bỏ đó.

8. Kết chương:
- Kết bằng một hành động/một dữ kiện cần kiểm tra.
- Không kết bằng tuyên ngôn.

Nếu phải chọn giữa câu “đẹp” và câu “thật”, chọn câu thật.

OUTPUT BẮT BUỘC:
Giữ đúng 2 phần:
1. # BẢN ĐỌC CHO ĐỘC GIẢ
2. # BẢN PHÂN TÍCH KỸ THUẬT / KHÔNG ĐĂNG
Hai phần cách nhau bằng dòng "---".

BẢN NHÁP CẦN BIÊN TẬP:
${compactText(draftText, 12000)}
`.trim()
}


export function buildStoryEditorValidationPrompt(
  payload: NormalizedGeneratePayload,
  editedText: string,
  redFlags: string[],
) {
  const chapterNumber = Math.max(1, Math.floor(payload.nextChapterNumber || 1))
  const storySeed = payload.storySeed
  const chapterMinChars = Math.max(1000, Math.floor(Number(payload.chapterMinChars || 3500)))
  const chapterMaxChars = Math.max(chapterMinChars, Math.floor(Number(payload.chapterMaxChars || 4500)))
  const evidenceObject = safeText(storySeed?.evidenceObject, '')
  const flags = redFlags.length > 0 ? redFlags.join('; ') : 'câu văn còn khả năng gượng hoặc sai tai'

  return `
Bạn là biên tập viên line-edit tiếng Việt vòng cuối. Đây là bước kiểm định sau editor pass.
Không viết truyện mới. Chỉ sửa các câu còn gượng, sai tai, meta, slogan hoặc lộ kỹ thuật viết.

THÔNG TIN KHÓA:
- Tên truyện: ${payload.title}
- Chương: ${chapterNumber}
- Vật chứng trung tâm: ${evidenceObject || 'Không có'}
- Bối cảnh/seed: ${storySeed?.setting || payload.genreLabel || 'Không có'}
- Mâu thuẫn chính: ${storySeed?.mainConflict || payload.promptIdea || 'Không có'}
- Khoảng ký tự cần giữ: ${chapterMinChars}–${chapterMaxChars} ký tự tiếng Việt cho phần đọc.

CÁC LỖI VỪA BỊ PHÁT HIỆN:
${flags}

NHIỆM VỤ:
1. Giữ nguyên plot, tên nhân vật, vật chứng, giờ, mã, số, quan hệ và kết quả cảnh.
2. Sửa mạnh những câu người Việt đọc sẽ thấy lạ, ví dụ:
   - “mảnh hé”, “ngòi nắm”, “đứng tay chốc lát”, “bằng chứng tĩnh người”, “che nhoài”.
   - “lần một/lần hai vật chứng xuất hiện”.
   - “chuyển cuộc chơi”, “trả đũa bằng sự thật”, “trò chơi bắt đầu”, “khúc dạo đầu”.
   - “mọi âm thanh dồn về”, “mọi ánh mắt dồn vào”, “tiếng hỏi như mũi dao”.
3. Không thay bằng câu văn hoa hơn. Thay bằng câu Việt bình thường, cụ thể, có hành động.
4. Nếu một đoạn đang giải thích tâm lý quá nhiều, rút gọn và chuyển thành cử chỉ/thao tác.
5. Nếu title chương quá dài hoặc placeholder, đổi title chương cho gọn nhưng vẫn bám vật chứng/cảnh chính.
6. Giữ đúng format 2 phần:
   # BẢN ĐỌC CHO ĐỘC GIẢ
   ---
   # BẢN PHÂN TÍCH KỸ THUẬT / KHÔNG ĐĂNG

TRẢ VỀ TOÀN BỘ CHƯƠNG ĐÃ SỬA, KHÔNG GIẢI THÍCH NGOÀI OUTPUT.

BẢN CẦN KIỂM ĐỊNH:
${compactText(editedText, 14000)}
`.trim()
}
