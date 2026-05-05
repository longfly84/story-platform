import type { AvoidLibrary, FactoryStorySeed } from "../aiFactoryTypes";
import { buildUniqueFactoryTitle } from "./factoryPromptShared";

export const FACTORY_RELATIONSHIP_CONFLICTS = [
  'vợ chồng rạn nứt vì một bí mật bị giấu trong hồ sơ gia đình',
  'bạn thân phản bội nhưng chỉ là quân cờ của người đứng sau',
  'mẹ chồng thao túng cả gia đình để đẩy nữ chính ra ngoài',
  'chị em bị tráo thân phận trong một gia tộc hào môn',
  'tình cũ quay lại đúng lúc nữ chính sắp mất mọi thứ',
  'đối tác công ty dùng tình cảm để cướp dự án',
  'luật sư gia đình che giấu điều khoản bất lợi',
  'bác sĩ bị mua chuộc để sửa hồ sơ bệnh án',
  'giáo viên / phụ huynh giàu có kéo con của nữ chính vào cuộc chiến',
  'người giám hộ giả xuất hiện để tranh quyền nuôi con',
  'thư ký thân tín của chồng nắm bí mật tài chính',
  'người thân đã mất để lại bằng chứng đảo ngược toàn bộ sự thật',
  'người quản lý nghệ sĩ dựng scandal để ép nữ chính nhận lỗi',
  'hội đồng quản trị dùng đời tư để tước quyền điều hành của nữ chính',
  'người cha ruột che giấu thân phận thật của con gái trong nhiều năm',
  'một người anh trai cùng cha khác mẹ dùng pháp lý để khóa tài sản',
  'người yêu cũ quay lại với một thân phận mới nguy hiểm hơn',
  'bạn học cũ trở thành đối thủ nắm điểm yếu của nữ chính',
  'một người giúp việc lâu năm nắm bí mật gia tộc',
  'đứa trẻ vô tình trở thành chìa khóa lật lại mọi lời nói dối',
]

export const FACTORY_SETTING_CLUSTERS = [
  'bệnh viện tư lúc nửa đêm',
  'trường quốc tế trong buổi họp phụ huynh',
  'văn phòng luật sư trước phiên hòa giải',
  'phòng họp hội đồng quản trị',
  'sảnh khách sạn cao cấp',
  'sân bay trong ngày có người bỏ trốn',
  'phòng khám xét nghiệm ADN',
  'buổi livestream bán hàng / họp báo',
  'hậu trường phim trường / showbiz',
  'đám cưới hoặc lễ đính hôn',
  'đám tang / lễ đọc di chúc',
  'ngân hàng / phòng VIP tài chính',
  'nhà đấu giá / buổi tiệc từ thiện',
  'khu chung cư cao cấp',
  'resort trong chuyến du lịch gia đình',
  'gara / tầng hầm / bãi đỗ xe',
  'cổng trường của con',
  'phòng nhân sự công ty',
  'nhóm chat gia đình bị lộ tin nhắn',
  'văn phòng công chứng',
  'trung tâm thương mại',
  'du thuyền / tiệc riêng của giới thượng lưu',
  'cô nhi viện / trung tâm bảo trợ',
  'phòng điều hành truyền thông',
  'tòa án gia đình',
  'khu điều dưỡng cao cấp',
  'phòng họp khẩn của công ty gia đình',
  'studio chụp ảnh / hậu trường quảng cáo',
  'bãi biển trong một chuyến nghỉ dưỡng',
  'căn hộ penthouse nhìn xuống thành phố',
]

export const FACTORY_SEED_EVIDENCE_OBJECTS = [
  'hồ sơ bệnh án bị sửa',
  'email nội bộ bị chuyển tiếp nhầm',
  'USB chứa file ghi âm',
  'camera hành trình trong xe',
  'hồ sơ nhập học của con',
  'giấy khai sinh bản cũ',
  'sao kê ngân hàng',
  'hợp đồng bảo hiểm nhân thọ',
  'di chúc mới được công chứng',
  'thẻ nhớ từ camera riêng',
  'đơn ly hôn được nộp trước',
  'hồ sơ cổ phần bị giấu',
  'tin nhắn trong nhóm chat gia đình',
  'tài khoản mạng xã hội ẩn',
  'bản ghi âm cuộc gọi lúc nửa đêm',
  'hóa đơn chuyển khoản bất thường',
  'hồ sơ nhận con nuôi',
  'vé máy bay một chiều',
  'báo cáo xét nghiệm ADN',
  'ảnh chụp màn hình bị xóa vội',
  'nhật ký cũ',
  'vòng tay / nhẫn / dây chuyền có mã khắc',
  'biên bản họp bị thay trang',
  'file camera bị cắt mất 7 phút',
  'đơn tố cáo nặc danh',
  'bản sao hợp đồng ủy quyền',
  'lịch khám thai bị chỉnh sửa',
  'mã đơn hàng gửi nhầm địa chỉ',
  'hồ sơ chuyển nhượng cổ phần',
  'tài liệu pháp lý trong két sắt',
]

export const FACTORY_PUBLIC_PRESSURES = [
  'hot search trên mạng xã hội',
  'nhóm chat phụ huynh',
  'họp gia đình có người ngoài chứng kiến',
  'hội đồng quản trị công ty',
  'buổi họp báo',
  'livestream bị hàng nghìn người xem',
  'phiên hòa giải pháp lý',
  'lời đồn trong giới hào môn',
  'bài bóc phốt từ tài khoản ẩn',
  'đám cưới có khách mời thượng lưu',
  'buổi họp cổ đông',
  'đơn kiện công khai',
  'tin nhắn bị leak vào nhóm nội bộ',
  'video bị phát trên màn hình lớn',
  'các phụ huynh ở trường quốc tế',
  'một thông cáo truyền thông sai sự thật',
  'một bài phỏng vấn bị cắt ghép',
  'một cuộc bỏ phiếu trong gia tộc',
  'một buổi xét duyệt quyền nuôi con',
  'một hợp đồng bị công bố trước công ty',
]

export const FACTORY_HIDDEN_TRUTHS = [
  'người bị xem là tiểu tam thật ra chỉ là người che giấu bí mật lớn hơn',
  'đứa trẻ bị kéo vào cuộc chiến không có thân phận như mọi người tưởng',
  'bằng chứng đầu tiên là giả, bằng chứng thứ hai mới là thật',
  'người chồng biết sự thật nhưng im lặng vì lợi ích cổ phần',
  'mẹ chồng thao túng mọi chuyện để che một lỗi cũ của gia tộc',
  'người bạn thân phản bội vì bị nắm điểm yếu',
  'di chúc cũ đã bị thay trang trước ngày công bố',
  'bệnh án bị sửa để che một ca phẫu thuật sai',
  'hồ sơ trường học bị đổi để tước quyền nuôi con',
  'vụ ngoại tình chỉ là bề nổi của một vụ chuyển tài sản',
  'người đã mất để lại manh mối cuối cùng',
  'luật sư gia đình làm việc cho cả hai phía',
  'camera bị xóa không phải để che ngoại tình mà để che một cuộc gặp khác',
  'người tưởng giúp nữ chính lại đang thử lòng cô',
  'gia tộc nhận nhầm người thừa kế trong nhiều năm',
  'công ty cố tình dựng scandal để ép nữ chính bán cổ phần',
  'người thân bị bệnh chỉ là lý do để chuyển quyền giám hộ',
  'một hợp đồng hôn nhân có điều khoản bị giấu',
  'người đứng sau phản diện là người nữ chính từng tin nhất',
  'sự thật về thân thế nằm trong một hồ sơ tưởng không liên quan',
]

function pickSeedItem(items: string[], seed: string, salt: string) {
  const raw = `${seed}-${salt}`
  let hash = 0

  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash << 5) - hash + raw.charCodeAt(i)
    hash |= 0
  }

  return items[Math.abs(hash) % items.length]
}

function compactTags(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((item) => item.length >= 4)
    .slice(0, 8)
}

export function buildMockStorySeed(params: {
  genreLabel: string
  heroineLabel: string
  avoidLibrary?: AvoidLibrary
  seed: string
}): FactoryStorySeed {
  const relationshipConflict = pickSeedItem(
    FACTORY_RELATIONSHIP_CONFLICTS,
    params.seed,
    'relationship',
  )
  const setting = pickSeedItem(FACTORY_SETTING_CLUSTERS, params.seed, 'setting')
  const evidenceObject = pickSeedItem(FACTORY_SEED_EVIDENCE_OBJECTS, params.seed, 'evidence')
  const publicPressure = pickSeedItem(FACTORY_PUBLIC_PRESSURES, params.seed, 'pressure')
  const hiddenTruth = pickSeedItem(FACTORY_HIDDEN_TRUTHS, params.seed, 'truth')

  const title = buildUniqueFactoryTitle({
    genreLabel: params.genreLabel,
    seed: params.seed,
    avoidTitles: params.avoidLibrary?.titles,
  })

  const genreBlend = [
    params.genreLabel,
    relationshipConflict,
    setting,
    publicPressure,
  ].filter(Boolean)

  const corePremise = `Nữ chính thuộc kiểu ${params.heroineLabel} bị cuốn vào xung đột ${relationshipConflict}, mở đầu tại ${setting}, khi ${evidenceObject} làm lộ một điểm bất thường không ai muốn nhắc tới.`
  const openingScene = setting
  const incitingIncident = `${evidenceObject} xuất hiện sai thời điểm, khiến nữ chính nhận ra có người đang dựng một câu chuyện bất lợi cho mình.`
  const mainConflict = `Nữ chính phải đối đầu với cấu trúc quyền lực quanh ${relationshipConflict}, trong khi ${publicPressure} khiến cô khó phản kháng trực diện.`
  const villainType = `Người thao túng đứng sau xung đột ${relationshipConflict}, dùng danh dự, tiền bạc hoặc quan hệ để ép nữ chính im lặng.`
  const heroineArc = `${params.heroineLabel}: nhẫn nhịn quan sát → phát hiện điểm sai → thu thập chứng cứ → phản công có tính toán.`
  const emotionalHook = 'Một người phụ nữ bị ép nhận phần thua thiệt, nhưng lần này cô nhận ra mình vẫn còn một bằng chứng đủ để đảo chiều.'
  const powerStructure = `Gia đình / công ty / quan hệ xã hội đang đứng về phía phản diện, còn nữ chính chỉ có trí nhớ, sự bình tĩnh và ${evidenceObject}.`
  const shortFingerprint = `${setting} + ${evidenceObject} + ${relationshipConflict}`

  return {
    title,
    genreBlend,
    corePremise,
    openingScene,
    incitingIncident,
    evidenceObject,
    mainConflict,
    hiddenTruth,
    setting,
    villainType,
    heroineArc,
    emotionalHook,
    powerStructure,
    publicPressure,
    shortFingerprint,
    antiRepeatTags: Array.from(
      new Set([
        ...compactTags(setting),
        ...compactTags(evidenceObject),
        ...compactTags(relationshipConflict),
        ...compactTags(publicPressure),
      ]),
    ).slice(0, 12),
  }
}

export function buildStorySeedPromptContext(storySeed?: FactoryStorySeed | null) {
  if (!storySeed) return ''

  return `
STORY SEED / STORY DNA BẮT BUỘC:
- Tên truyện định hướng: ${storySeed.title}
- Genre blend: ${storySeed.genreBlend.join(' | ')}
- Core premise: ${storySeed.corePremise}
- Opening scene bắt buộc: ${storySeed.openingScene}
- Inciting incident bắt buộc: ${storySeed.incitingIncident}
- Evidence object bắt buộc: ${storySeed.evidenceObject}
- Main conflict: ${storySeed.mainConflict}
- Hidden truth: ${storySeed.hiddenTruth}
- Setting: ${storySeed.setting}
- Villain type: ${storySeed.villainType}
- Heroine arc: ${storySeed.heroineArc}
- Emotional hook: ${storySeed.emotionalHook}
- Power structure: ${storySeed.powerStructure}
- Public pressure: ${storySeed.publicPressure}
- Short fingerprint: ${storySeed.shortFingerprint}

QUY TẮC BẮT BUỘC THEO STORY SEED:
- Chương 1 phải mở theo opening scene trên.
- Biến cố chính phải dùng inciting incident trên.
- Vật chứng quan trọng phải là evidence object trên.
- Không tự đổi về mô típ đã có trong kho truyện nếu seed không yêu cầu.
- Không dùng lại khung cảnh, vật chứng, bối cảnh, bí mật hoặc áp lực xã hội đã xuất hiện nhiều trong danh sách motif cần tránh.
- Truyện phải khác rõ rệt ở bối cảnh, vật chứng, áp lực và bí mật.
`.trim()
}

