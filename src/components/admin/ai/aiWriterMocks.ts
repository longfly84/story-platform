import {
  chapterLengthOptions,
  cliffhangerOptions,
  findLabel,
  mainCharacterOptions,
  type AIFormState,
  type Option,
  type StoryLite,
} from './aiWriterOptions'

export function buildStoryPlanMock({
  form,
  selectedStory,
  categoryOptions,
}: {
  form: AIFormState
  selectedStory: StoryLite | null
  categoryOptions: Option[]
}) {
  const idea =
    form.promptIdea.trim() ||
    selectedStory?.title ||
    'Một nữ chính bị phản bội trong hôn lễ và bắt đầu phản công.'

  const categoryLabel = findLabel(categoryOptions, form.category)
  const styleLabel = findLabel(mainCharacterOptions, form.mainCharacterStyle)
  const lengthLabel = findLabel(chapterLengthOptions, form.chapterLength)
  const cliffLabel = findLabel(cliffhangerOptions, form.cliffhangerType)

  return `# STORY PLAN

## Tên truyện
${selectedStory?.title || 'Sau Khi Bị Phản Bội, Tôi Khiến Cả Nhà Họ Quỳ Xin Lỗi'}

## Công thức viết
Nữ tần đô thị viral Trung Quốc

## Thể loại
${categoryLabel}

## Bối cảnh
Trung Quốc hiện đại, tập đoàn, hào môn, Weibo/Douyin/hot search, tiền tệ RMB/tệ.

## Ý tưởng chính
${idea}

## Hook
Ngay trong khoảnh khắc tôi bị ép cúi đầu nhận lỗi, một đoạn bằng chứng chưa từng công bố bắt đầu được gửi tới điện thoại của từng người trong phòng.

## Tóm tắt
Nữ chính thuộc kiểu "${styleLabel}", ban đầu bị phản bội, bị gaslight và bị đẩy vào thế mất mặt công khai. Nhưng cô không tung toàn bộ bằng chứng ngay. Cô giữ lại đòn chí mạng, để phản diện tự đào hố qua từng chương.

## Nhân vật
- Nữ chính: Lâm An Nhiên, xưng tôi, ${styleLabel}, càng về sau càng lạnh và kiểm soát thế cục.
- Phản diện chính: Lục Thành, người phản bội đang cố dùng quyền lực và dư luận ép nữ chính im lặng.
- Người thứ ba: Hạ Mạn Nhi, giả yếu đuối nhưng có tham vọng.
- Nhân vật hỗ trợ: phòng pháp vụ hoặc người gửi bằng chứng ẩn danh, chỉ hỗ trợ thông tin, không thắng thay nữ chính.

## Mâu thuẫn cốt lõi
Danh dự, tài sản, cổ phần/hợp đồng và sự phản bội công khai.

## Revenge Weapon
Camera, ghi âm, hợp đồng, điều khoản pháp lý, hot search Weibo và một nhân chứng chưa lộ mặt.

## Evidence Pacing
- 0–25%: chỉ cài dấu hiệu.
- 25–50%: thắng nhỏ, hé bằng chứng phụ.
- 50–75%: phản diện phản công, bằng chứng mạnh xuất hiện một phần.
- 75–90%: vả mặt công khai.
- 90–100%: payoff cuối, phản diện trả giá.

## Độ dài chương mục tiêu
${lengthLabel}

## Kiểu kết chương ưu tiên
${cliffLabel}

## Mức uất ức
${form.humiliationLevel}/5

## Mức trả thù
${form.revengeIntensity}/5

## Outline 10 chương
Chương 1: Opening Shock — nữ chính bị phản bội công khai, giữ lại bằng chứng đầu tiên.
Chương 2: Gaslighting — phản diện ép nữ chính nhận lỗi, dư luận bắt đầu nghiêng sai hướng.
Chương 3: First Counterattack — nữ chính tung một mảnh bằng chứng nhỏ, phản diện chưa sụp.
Chương 4: Escalation — phản diện phản công bằng truyền thông bẩn/hợp đồng giả.
Chương 5: Public Face-Slap — bằng chứng mạnh lên hot search, đồng minh phản diện dao động.
Chương 6: Legal Reversal — hợp đồng/cổ phần trở thành vũ khí.
Chương 7: Hidden Witness — nhân chứng bí mật xuất hiện.
Chương 8: Hot Search Storm — toàn bộ Weibo đảo chiều.
Chương 9: Final Trap — phản diện tưởng thắng nhưng đã rơi vào bẫy.
Chương 10: Final Payoff — nữ chính tung đòn cuối, phản diện mất danh dự/tài sản/quyền lực.`
}

export function buildChapterMock({
  form,
  selectedStory,
  categoryOptions,
}: {
  form: AIFormState
  selectedStory: StoryLite | null
  categoryOptions: Option[]
}) {
  const categoryLabel = findLabel(categoryOptions, form.category)
  const styleLabel = findLabel(mainCharacterOptions, form.mainCharacterStyle)
  const cliffLabel = findLabel(cliffhangerOptions, form.cliffhangerType)

  return `# BẢN ĐỌC CHO ĐỘC GIẢ

# Chương — Ảnh chụp trên hot search

Sáng nay tôi thức dậy vì tiếng điện thoại không ngừng.

Weibo nổ tung.

Tên Lục Thành treo trên hot search từ sáu giờ sáng.

#TổngGiámĐốcLụcThịÔmNgườiPhụNữLạ#

Trong ảnh, anh đứng trước cửa khách sạn Vân Đỉnh, tay ôm eo Hạ Mạn Nhi. Cô ta mặc chiếc váy trắng mà tôi từng thấy trong phòng thay đồ của nhà họ Lục. Nụ cười của cô ta ngọt đến mức làm người ta buồn nôn.

Mẹ chồng tôi gọi điện.

"An Nhiên, con đừng làm lớn. Nhà họ Lục cần thể diện."

Tôi nhìn màn hình, bật cười rất khẽ.

"Thể diện của nhà họ Lục quan trọng, vậy thể diện của tôi thì sao?"

Đầu dây bên kia im lặng ba giây.

Rồi giọng bà ta lạnh xuống.

"Con đã gả vào Lục gia thì phải biết nhịn."

Buổi chiều, tôi đến trụ sở Lục thị.

Trong phòng họp tầng hai mươi bảy, Lục Thành đặt trước mặt tôi một bản thỏa thuận chia tài sản. Trên cùng là con số ba mươi triệu tệ. Bên cạnh là điều khoản yêu cầu tôi rút khỏi dự án Nam Cảng.

Anh nói: "Ký đi. Cô còn có thể giữ chút mặt mũi."

Tôi không cầm bút.

Tôi nhìn anh.

"Lục Thành, anh thật sự nghĩ tôi không đọc hợp đồng trước khi kết hôn à?"

Sắc mặt anh khựng lại.

Hạ Mạn Nhi đứng sau lưng anh, mắt đỏ hoe.

"Chị An Nhiên, em biết chị hận em. Nhưng tình yêu không có lỗi."

Tôi đứng dậy, nhìn thẳng vào camera giám sát ở góc phòng.

"Đúng. Tình yêu không có lỗi."

Tôi cầm bản thỏa thuận, xé làm đôi.

"Nhưng lừa đảo thương mại thì có."

Cả phòng họp chết lặng.

Đúng lúc đó, điện thoại của Lục Thành rung lên.

Một tin nhắn từ phòng PR hiện trên màn hình.

"Không ổn rồi. Có người đang đẩy hashtag mới: #LụcThịLừaĐảoHợpĐồngNamCảng#."

Lục Thành ngẩng phắt đầu nhìn tôi.

Tôi mỉm cười.

"Đừng nhìn tôi như vậy. Tôi mới chỉ gửi một trang thôi."

Mặt Hạ Mạn Nhi trắng bệch.

Còn tôi biết, trò chơi này cuối cùng cũng đến lượt tôi đặt luật.

---

# BẢN PHÂN TÍCH KỸ THUẬT / KHÔNG ĐĂNG

=== STORY PROGRESS CHECK ===
- Mode: ${form.mode}
- Truyện: ${selectedStory?.title || 'Chưa chọn truyện'}
- Thể loại: ${categoryLabel}
- Kiểu nữ chính: ${styleLabel}
- Kiểu kết chương: ${cliffLabel}
- Mức uất ức: ${form.humiliationLevel}/5
- Mức trả thù: ${form.revengeIntensity}/5

=== STORY MEMORY ===
- Nữ chính bị phản bội công khai trên Weibo.
- Lục Thành ép ký thỏa thuận chia tài sản và rút khỏi dự án Nam Cảng.
- Hạ Mạn Nhi xuất hiện với vai người thứ ba giả yếu đuối.
- Nữ chính đã bắt đầu phản công bằng hợp đồng.

=== PAYOFF SETUP TRACKER ===
- Dự án Nam Cảng là vũ khí thương chiến chính.
- Hợp đồng có thể là bằng chứng lớn.
- Hashtag mới mở đường cho vả mặt công khai.

=== EVIDENCE PACING TRACKER ===
- Đã hé 1 trang hợp đồng.
- Chưa tung toàn bộ hồ sơ.
- Giữ payoff lớn cho chương sau.

=== CONFLICT ESCALATION LEDGER ===
- Dư luận trên Weibo tăng.
- Gia tộc Lục ép nữ chính nhịn.
- Nữ chính phản công nhỏ nhưng chưa kết liễu.`
}