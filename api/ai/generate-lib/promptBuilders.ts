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


export function buildStoryPlanPrompt(payload: NormalizedGeneratePayload) {
  const moduleInstruction = getModuleInstruction(payload.moduleId)
  const genreInstruction = getGenreInstruction(payload.genreLabel)
  const premiseInstruction = getPremiseInstruction(payload)
  const libraryAvoidanceInstruction = getLibraryAvoidanceInstruction(payload)
  const storySeedInstruction = getStorySeedInstruction(payload)
  const motifUniquenessInstruction = getGlobalMotifUniquenessInstruction(payload)
  const antiRepeatInstruction = getOpenAIAntiRepeatInstruction(payload)
  const nameDiversityInstruction = getNameDiversityInstruction(payload)
  const titleNamingInstruction = getTitleNamingInstruction(payload)
  const heroineInstruction = getHeroineInstruction(payload.mainCharacterStyleLabel)
  const urbanFemaleScaleLockInstruction = getUrbanFemaleScaleLockInstruction(payload)
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

${titleNamingInstruction}

${heroineInstruction}

${urbanFemaleScaleLockInstruction}

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
  const titleNamingInstruction = getTitleNamingInstruction(payload)
  const heroineInstruction = getHeroineInstruction(payload.mainCharacterStyleLabel)
  const urbanFemaleScaleLockInstruction = getUrbanFemaleScaleLockInstruction(payload)
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

${titleNamingInstruction}

${heroineInstruction}

${urbanFemaleScaleLockInstruction}

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

# Chương ${nextChapterNumber} — [tên chương hấp dẫn, ngắn, có hook]

[Viết nội dung chương bằng văn xuôi liên tục.]

Sau phần đọc, thêm dòng "---", rồi viết phần kỹ thuật theo mẫu sau:

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
  const vietnameseEditorHardGateInstruction = getVietnameseEditorHardGateInstruction()
  const vietnameseSemanticLogicGateInstruction = getVietnameseSemanticLogicGateInstruction()

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
Bạn là STORY EDITOR PASS cho nữ tần đô thị mở rộng nhiều thể loại.

NHIỆM VỤ:
Đọc bản nháp chương bên dưới và rewrite thành bản final đăng được.
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

${vietnameseEditorHardGateInstruction}

${vietnameseSemanticLogicGateInstruction}

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
4. Nếu phần kỹ thuật có “Tên truyện đề xuất”, tên đó phải khớp nội dung thật. Nếu tên hiện tại lệch, đề xuất tên mới dựa trên vật chứng/mâu thuẫn trung tâm.
5. Không đổi tên truyện trong phần BẢN ĐỌC, nhưng phần kỹ thuật phải ghi rõ nếu tên hiện tại không khớp và đề xuất tên thay thế.

CONTEXT GẦN NHẤT:
${recentContext || '- Chưa có chương trước.'}

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
2. Không đổi mission của chương. Nếu chapter plan yêu cầu power shift, bản final phải có power shift thật.
3. Giảm cảm giác khô pháp lý/thủ tục. Nếu có niêm phong, phong tỏa, giám định, chữ ký số, cam kết pháp lý, phải xen cảnh cảm xúc hoặc đối đầu trực diện.
4. Tăng hiện diện của phản diện chính. Nếu phản diện chính chưa ra mặt, thêm một cuộc gọi/tin nhắn/câu thoại/đòn có chữ ký cá nhân rõ ràng. Không để luật sư/PR/pháp vụ gánh toàn bộ vai ác.
5. Thêm hoặc làm sắc hơn một câu thoại gây áp lực từ phản diện và một câu đáp trả lạnh của nữ chính.
6. Thêm emotional beat ngắn nếu có mẹ bệnh/con nhỏ/người thân yếu thế. Cảnh phải cụ thể, không sến, không dài.
7. Sau 2–3 chương bị ép, phải có một dopamine reward nhỏ: phản diện phụ cứng họng, nhân chứng đổi phe, dư luận chia phe, một chứng cứ được bảo toàn, hoặc một câu vả mặt công khai.
8. Ending hook phải cụ thể: một cái tên, một file mới, một ảnh, một địa điểm/thời gian hẹn, một người thân gặp nguy, một hot search đảo chiều, hoặc phản diện chính xuất hiện. Không kết bằng câu chung chung kiểu “ván cờ mới bắt đầu”.
9. Không xả hết bí mật quá sớm, không thêm twist quá lố, không biến chương thành summary.
10. BẢN ĐỌC phải là văn truyện mượt, không có bullet/list/checklist/kỹ thuật.
11. Tên chương phải được kiểm tra lại. Nếu tên chương không thể hiện đúng nội dung chương, hãy đổi lại ngay trong dòng “# Chương ${chapterNumber} — ...”.
12. BẢN PHÂN TÍCH KỸ THUẬT vẫn giữ để admin debug, nhưng phải cập nhật đúng sau khi rewrite, đặc biệt phần kiểm tra tên truyện/tên chương.
13. Chương final phải có state change mới rõ ràng so với chương trước; nếu vẫn chỉ tranh luận lại bằng chứng cũ hoặc lặp phòng họp, hãy rewrite sang cảnh/hành động mới.
14. Chương final phải qua Vietnamese Prose Hard Gate: không câu cụt, không dịch máy, không thuật ngữ thô, không hội thoại sai vai. Đặc biệt kiểm tra 5 đoạn đầu.
15. Chương final phải qua Semantic Vietnamese Logic Gate: đúng chủ thể — hành động — đối tượng — thời thái. Cấm giữ câu kiểu “hợp đồng ủy quyền chuyển giao quyền điều hành”.
16. Nếu có họp báo/phóng viên/pháp lý/doanh nghiệp, thoại phải giống người Việt thật sự nói. Cấm câu cụt như “giải thích sao được?”.
17. Nếu vật chứng gây hậu quả lớn, phải có cầu nối logic 1–2 câu. Cấm vật chứng xuất hiện tiện rồi lập tức tạo hậu quả phi lý.
18. Nếu bản nháp bị lặp tiêu đề chương, phải xóa bản lặp, chỉ giữ đúng một dòng “# Chương ${chapterNumber} — ...” trong BẢN ĐỌC.

CẤM:
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

OUTPUT BẮT BUỘC:
Giữ đúng 2 phần:
1. # BẢN ĐỌC CHO ĐỘC GIẢ
2. # BẢN PHÂN TÍCH KỸ THUẬT / KHÔNG ĐĂNG
Hai phần cách nhau bằng dòng "---".

BẢN NHÁP CẦN BIÊN TẬP:
${compactText(draftText, 12000)}
`.trim()
}
