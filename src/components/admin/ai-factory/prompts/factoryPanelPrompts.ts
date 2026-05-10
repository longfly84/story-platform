import type { FactoryStorySeed } from '../aiFactoryTypes'
import { safeString } from '../utils/factoryPanelText'
import { getFactorySeedEvidence, makePanelTitleFromEvidence } from '../utils/factoryPanelTitle'

export function buildPanelChapterSeedLockInstruction(params: {
  storyTitle: string
  storySeed?: FactoryStorySeed | null
}) {
  const storySeed = params.storySeed
  const evidenceObject = getFactorySeedEvidence(storySeed)
  const lockedTitle = safeString(params.storyTitle || makePanelTitleFromEvidence(storySeed) || storySeed?.title || evidenceObject)

  if (!storySeed && !lockedTitle && !evidenceObject) return ''

  return `
FACTORY STORY LOCK - KHÓA NGHĨA TRƯỚC KHI VIẾT:
- STORY_TITLE_LOCK: ${lockedTitle}
- EVIDENCE_OBJECT_LOCK: ${evidenceObject || lockedTitle}
- SETTING_LOCK: ${storySeed?.setting || storySeed?.openingScene || ''}
- OPENING_SCENE_LOCK: ${storySeed?.openingScene || storySeed?.setting || ''}
- CONFLICT_LOCK: ${storySeed?.mainConflict || storySeed?.corePremise || ''}
- HIDDEN_TRUTH_LOCK: ${storySeed?.hiddenTruth || ''}

QUY TẮC CỨNG CHO OPENAI:
1. Trước khi viết chương, phải tự hiểu EVIDENCE_OBJECT_LOCK là vật chứng chính. Không được tách chữ rời, không được đoán theo một token ngắn.
2. story_title trong technical report PHẢI ĐÚNG Y HỆT STORY_TITLE_LOCK. Không được tự đặt lại thành hợp đồng, USB, camera, mã QR, thẻ phòng, hồ sơ niêm phong, ghi âm, sao kê nếu EVIDENCE_OBJECT_LOCK không ghi rõ.
3. Chương 1 phải mở bằng tình huống làm EVIDENCE_OBJECT_LOCK xuất hiện sai/ lệch/ bất thường trong SETTING_LOCK. Vật chứng này phải là trung tâm cảnh, không phải chi tiết trang trí.
4. Bằng chứng phụ chỉ được hỗ trợ vật chứng chính. Cấm thay vật chứng chính bằng vật chứng khác hấp dẫn hơn.
5. Nếu muốn dùng hợp đồng, USB, camera, hồ sơ, luật sư, pháp vụ, sao kê, chỉ được dùng khi chúng đã có trong seed. Nếu không có trong seed thì cấm dùng làm trục truyện hoặc title.
6. Mỗi đoạn quan trọng phải trả lời ngầm: ai nhìn thấy vật chứng, nó lệch ở đâu, vì sao nữ chính nhận ra, và nó dẫn tới HIDDEN_TRUTH_LOCK thế nào.
7. Output technical report bắt buộc dùng:
   story_title = ${lockedTitle}
   evidence_object = ${evidenceObject || lockedTitle}
`.trim()
}

export function buildNaturalVietnameseProseInstruction() {
  return `
NATURAL VIETNAMESE PROSE LOCK - GIỌNG VĂN NGƯỜI VIỆT:
Mục tiêu: đọc như truyện mạng tiếng Việt do người thật viết, không giống bản dịch máy hoặc văn mẫu AI.

Bắt buộc khi viết chương:
1. Cảnh căng phải dùng câu ngắn hơn. Ưu tiên hành động, ánh mắt, cử chỉ, lời thoại và phản ứng đám đông thay vì giải thích tâm lý dài.
2. Đối thoại phải đời thường, có va chạm. Nhân vật đang tức giận/hoang mang không nói quá lịch sự, quá tròn câu hoặc như đang đọc biên bản.
3. Giảm câu trừu tượng kiểu: "quyền lực rời khỏi mình", "bản cáo trạng", "con dấu", "ván cờ", "sân khấu", "khán đài", "áp lực dồn lên". Nếu cần, thay bằng câu cụ thể hơn: "Tôi biết mình đang mất thế", "Đám đông không còn nghe tôi nữa".
4. Không giảng logic cho độc giả bằng câu phân tích lộ liễu như "Cái chỗ vụng về trong câu chuyện hiện ra". Hãy để nhân vật nhận ra qua chi tiết: nét bút, vị trí vật chứng, lời nói mâu thuẫn, camera, nhân chứng.
5. Mỗi đoạn 2-4 câu là chính. Tránh đoạn văn quá đều, quá sạch, quá giống AI.
6. Mỗi cảnh phải có ít nhất một chi tiết đời thường cụ thể: âm thanh, vật nhỏ, thao tác tay, ánh mắt, điện thoại, mùi, vết bẩn, tiếng người chen vào.
7. Nữ chính bình tĩnh nhưng không nói như luật sư trong mọi cảnh. Khi bị ép trước đám đông, lời nói phải gọn, có lực, dễ hiểu.
8. Không dùng nhiều mỹ từ. Không cố làm văn. Ưu tiên rõ, sắc, tự nhiên, có nhịp truyện.

Ví dụ chuyển giọng:
- Không viết: "Tôi cảm thấy quyền lực rời khỏi mình."
- Nên viết: "Tôi biết mình đang mất thế. Đám đông đã ngả về phía họ."
- Không viết: "Chúng tôi không có nhiều thời gian. Chúng tôi cần biết con mình an toàn."
- Nên viết: "Cô nói thẳng đi. Con tôi có an toàn không?"
`.trim()
}
