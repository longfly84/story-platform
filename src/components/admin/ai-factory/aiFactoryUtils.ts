import type {
  AvoidLibrary,
  ExistingStory,
  FactoryGenreOption,
  FactoryHeroineOption,
  FactoryStorySeed,
  ParsedChapterOutput,
} from "./aiFactoryTypes";

import {
  buildFactoryDiversitySeed,
  buildFallbackStoryTitle,
} from "./prompts/factoryPromptShared";
import { buildStorySeedPromptContext } from "./prompts/factoryStorySeed";

export {
  FACTORY_EVIDENCE_OBJECTS,
  FACTORY_OPENING_SCENES,
  FACTORY_SETTINGS,
  FACTORY_TRIGGERS,
  buildFactoryDiversitySeed,
  buildFallbackStoryTitle,
  buildUniqueFactoryTitle,
} from "./prompts/factoryPromptShared";
export {
  FACTORY_HIDDEN_TRUTHS,
  FACTORY_PUBLIC_PRESSURES,
  FACTORY_RELATIONSHIP_CONFLICTS,
  FACTORY_SEED_EVIDENCE_OBJECTS,
  FACTORY_SETTING_CLUSTERS,
  buildMockStorySeed,
  buildStorySeedPromptContext,
} from "./prompts/factoryStorySeed";
export { buildMockChapterOutput } from "./prompts/factoryMockChapter";
export { getFactoryChapterProgress } from "./utils/factoryProgress";

export const AI_FACTORY_STORAGE_KEY = "storyPlatform.aiFactory.lastRun";

export const DEFAULT_FACTORY_GENRES: FactoryGenreOption[] = [
  {
    key: "friend-betrayal-mistress",
    label: "Bạn thân phản bội / tiểu tam",
    slug: "ban-than-phan-boi-tieu-tam",
  },
  {
    key: "family-secret-identity",
    label: "Bí ẩn gia đình / thân thế",
    slug: "bi-an-gia-dinh-than-the",
  },
  {
    key: "business-face-slap",
    label: "Công sở vả mặt / nữ cường thương chiến",
    slug: "cong-so-va-mat-nu-cuong-thuong-chien",
  },
  {
    key: "contract-marriage",
    label: "Cưới trước yêu sau / hợp đồng hôn nhân",
    slug: "cuoi-truoc-yeu-sau-hop-dong-hon-nhan",
  },
  {
    key: "identity-swap-wealthy",
    label: "Đổi tráo danh phận / hào môn",
    slug: "doi-tra-danh-phan-hao-mon",
  },
  {
    key: "in-law-family-fight",
    label: "Gia đấu / mẹ chồng / nhà chồng",
    slug: "gia-dau-me-chong-nha-chong",
  },
  {
    key: "wealthy-family-marriage",
    label: "Hào môn / liên hôn / gia tộc",
    slug: "hao-mon-lien-hon-gia-toc",
  },
  {
    key: "betrayal-divorce-regret",
    label: "Hôn nhân phản bội / hủy hôn / chồng cũ hối hận",
    slug: "hon-nhan-phan-boi-huy-hon-chong-cu-hoi-han",
  },
  {
    key: "marriage-betrayal",
    label: "Hôn nhân phản bội / ngoại tình",
    slug: "hon-nhan-phan-boi-ngoai-tinh",
  },
  {
    key: "hot-search-showbiz-pr",
    label: "Hot search / showbiz / PR scandal",
    slug: "hot-search-showbiz-pr-scandal",
  },
  {
    key: "mother-child",
    label: "Mẹ con / gia đình / bảo vệ con",
    slug: "me-con-gia-dinh-bao-ve-con",
  },
  {
    key: "rebirth-life-again",
    label: "Nữ chính tái sinh / làm lại cuộc đời",
    slug: "nu-chinh-tai-sinh-lam-lai-cuoc-doi",
  },
  {
    key: "legal-heroine",
    label: "Nữ cường pháp lý / luật sư",
    slug: "nu-cuong-phap-ly-luat-su",
  },
  {
    key: "ceo-abuse-regret",
    label: "Tổng tài ngược luyến / hối hận",
    slug: "tong-tai-nguoc-luyen-hoi-han",
  },
  { key: "urban-revenge", label: "Trả thù đô thị", slug: "tra-thu-do-thi" },
  {
    key: "hospital-secret",
    label: "Bệnh viện / bệnh án / bí mật sinh tử",
    slug: "benh-vien-benh-an-bi-mat-sinh-tu",
  },
  {
    key: "dna-parentage",
    label: "ADN / con ruột / thân thế bị giấu",
    slug: "adn-con-ruot-than-the-bi-giau",
  },
  {
    key: "custody-battle",
    label: "Tranh quyền nuôi con / mẹ đơn thân",
    slug: "tranh-quyen-nuoi-con-me-don-than",
  },
  {
    key: "school-parent-meeting",
    label: "Trường học / họp phụ huynh / con bị bắt nạt",
    slug: "truong-hoc-hop-phu-huynh-con-bi-bat-nat",
  },
  {
    key: "inheritance-war",
    label: "Di chúc / thừa kế / tranh sản nghiệp",
    slug: "di-chuc-thua-ke-tranh-san-nghiep",
  },
  {
    key: "will-funeral",
    label: "Đám tang / di chúc / người cũ trở về",
    slug: "dam-tang-di-chuc-nguoi-cu-tro-ve",
  },
  {
    key: "wedding-reversal",
    label: "Đám cưới / hôn lễ / lật kèo công khai",
    slug: "dam-cuoi-hon-le-lat-keo-cong-khai",
  },
  {
    key: "engagement-banquet",
    label: "Lễ đính hôn / tiệc gia tộc / vạch mặt",
    slug: "le-dinh-hon-tiec-gia-toc-vach-mat",
  },
  {
    key: "airport-reunion",
    label: "Sân bay / người mất tích / quay về",
    slug: "san-bay-nguoi-mat-tich-quay-ve",
  },
  {
    key: "hotel-evidence",
    label: "Khách sạn / bằng chứng / ngoại tình",
    slug: "khach-san-bang-chung-ngoai-tinh",
  },
  {
    key: "resort-trip-secret",
    label: "Resort / du lịch / bí mật bị bóc",
    slug: "resort-du-lich-bi-mat-bi-boc",
  },
  {
    key: "livestream-scandal",
    label: "Livestream / bóc phốt / đảo chiều dư luận",
    slug: "livestream-boc-phot-dao-chieu-du-luan",
  },
  {
    key: "press-conference",
    label: "Họp báo / truyền thông / phản đòn công khai",
    slug: "hop-bao-truyen-thong-phan-don-cong-khai",
  },
  {
    key: "entertainment-backstage",
    label: "Showbiz / hậu trường / hợp đồng đen",
    slug: "showbiz-hau-truong-hop-dong-den",
  },
  {
    key: "film-set-rivalry",
    label: "Phim trường / nữ diễn viên / cướp vai",
    slug: "phim-truong-nu-dien-vien-cuop-vai",
  },
  {
    key: "idol-pr-crisis",
    label: "Idol / PR khủng hoảng / fandom quay xe",
    slug: "idol-pr-khung-hoang-fandom-quay-xe",
  },
  {
    key: "law-firm-case",
    label: "Văn phòng luật / hồ sơ cũ / kiện ngược",
    slug: "van-phong-luat-ho-so-cu-kien-nguoc",
  },
  {
    key: "courtroom-reveal",
    label: "Tòa án / bằng chứng cuối / thắng kiện",
    slug: "toa-an-bang-chung-cuoi-thang-kien",
  },
  {
    key: "police-report",
    label: "Đơn tố cáo / cảnh sát / hồ sơ mật",
    slug: "don-to-cao-canh-sat-ho-so-mat",
  },
  {
    key: "financial-fraud",
    label: "Tài chính / sao kê / rửa tiền",
    slug: "tai-chinh-sao-ke-rua-tien",
  },
  {
    key: "bank-vip-room",
    label: "Ngân hàng / phòng VIP / giao dịch lạ",
    slug: "ngan-hang-phong-vip-giao-dich-la",
  },
  {
    key: "stock-company-war",
    label: "Cổ phần / hội đồng quản trị / đoạt quyền",
    slug: "co-phan-hoi-dong-quan-tri-doat-quyen",
  },
  {
    key: "startup-betrayal",
    label: "Startup / đồng sáng lập / phản bội",
    slug: "startup-dong-sang-lap-phan-boi",
  },
  {
    key: "family-company",
    label: "Doanh nghiệp gia đình / người thừa kế nữ",
    slug: "doanh-nghiep-gia-dinh-nguoi-thua-ke-nu",
  },
  {
    key: "luxury-apartment",
    label: "Chung cư cao cấp / hàng xóm / bí mật",
    slug: "chung-cu-cao-cap-hang-xom-bi-mat",
  },
  {
    key: "elevator-encounter",
    label: "Thang máy / gặp lại người cũ / lộ thân phận",
    slug: "thang-may-gap-lai-nguoi-cu-lo-than-phan",
  },
  {
    key: "parking-garage",
    label: "Tầng hầm / bãi đỗ xe / nghe lén",
    slug: "tang-ham-bai-do-xe-nghe-len",
  },
  {
    key: "dashcam-secret",
    label: "Camera hành trình / tai nạn / sự thật",
    slug: "camera-hanh-trinh-tai-nan-su-that",
  },
  {
    key: "car-ride-recording",
    label: "Trên xe / ghi âm / lời thú nhận",
    slug: "tren-xe-ghi-am-loi-thu-nhan",
  },
  {
    key: "group-chat-leak",
    label: "Nhóm chat gia đình / ảnh chụp màn hình",
    slug: "nhom-chat-gia-dinh-anh-chup-man-hinh",
  },
  {
    key: "email-forward",
    label: "Email nội bộ / chuyển nhầm / lộ bí mật",
    slug: "email-noi-bo-chuyen-nham-lo-bi-mat",
  },
  {
    key: "phone-mistake",
    label: "Tin nhắn nhầm / cuộc gọi nửa đêm",
    slug: "tin-nhan-nham-cuoc-goi-nua-dem",
  },
  {
    key: "old-phone-data",
    label: "Điện thoại cũ / dữ liệu bị xóa",
    slug: "dien-thoai-cu-du-lieu-bi-xoa",
  },
  {
    key: "usb-secret",
    label: "USB / dữ liệu mật / phản công",
    slug: "usb-du-lieu-mat-phan-cong",
  },
  {
    key: "jewelry-token",
    label: "Trang sức / tín vật / bí mật thân phận",
    slug: "trang-suc-tin-vat-bi-mat-than-phan",
  },
  {
    key: "birth-certificate",
    label: "Giấy khai sinh / sổ hộ khẩu / con bị tráo",
    slug: "giay-khai-sinh-so-ho-khau-con-bi-trao",
  },
  {
    key: "insurance-policy",
    label: "Bảo hiểm / người thụ hưởng / âm mưu",
    slug: "bao-hiem-nguoi-thu-huong-am-muu",
  },
  {
    key: "medical-lab",
    label: "Phòng xét nghiệm / kết quả bị đổi",
    slug: "phong-xet-nghiem-ket-qua-bi-doi",
  },
  {
    key: "private-clinic",
    label: "Phòng khám tư / hồ sơ thai sản / bí mật",
    slug: "phong-kham-tu-ho-so-thai-san-bi-mat",
  },
  {
    key: "maternity-ward",
    label: "Khoa sản / con bị nhận nhầm / gia tộc",
    slug: "khoa-san-con-bi-nhan-nham-gia-toc",
  },
  {
    key: "nanny-secret",
    label: "Bảo mẫu / camera phòng trẻ / sự thật",
    slug: "bao-mau-camera-phong-tre-su-that",
  },
  {
    key: "housekeeper-witness",
    label: "Người giúp việc / nhân chứng / biệt thự",
    slug: "nguoi-giup-viec-nhan-chung-biet-thu",
  },
  {
    key: "mother-in-law-trap",
    label: "Mẹ chồng gài bẫy / nhà chồng ép tội",
    slug: "me-chong-gai-bay-nha-chong-ep-toi",
  },
  {
    key: "sister-in-law-war",
    label: "Chị em dâu / tranh tài sản / đổ tội",
    slug: "chi-em-dau-tranh-tai-san-do-toi",
  },
  {
    key: "fake-pregnancy",
    label: "Mang thai giả / tiểu tam / xét nghiệm",
    slug: "mang-thai-gia-tieu-tam-xet-nghiem",
  },
  {
    key: "secret-child",
    label: "Đứa trẻ bí mật / cha ruột / nhận thân",
    slug: "dua-tre-bi-mat-cha-ruot-nhan-than",
  },
  {
    key: "ex-husband-return",
    label: "Chồng cũ quay lại / muộn màng hối hận",
    slug: "chong-cu-quay-lai-muon-mang-hoi-han",
  },
  {
    key: "second-marriage",
    label: "Tái hôn / gia đình mới / người cũ phá rối",
    slug: "tai-hon-gia-dinh-moi-nguoi-cu-pha-roi",
  },
  {
    key: "blind-date-trap",
    label: "Xem mắt / liên hôn / cái bẫy hào môn",
    slug: "xem-mat-lien-hon-cai-bay-hao-mon",
  },
  {
    key: "fake-fiancee",
    label: "Hôn thê giả / hợp đồng giả / yêu thật",
    slug: "hon-the-gia-hop-dong-gia-yeu-that",
  },
  {
    key: "substitute-bride",
    label: "Cô dâu thay thế / bị ép cưới / phản đòn",
    slug: "co-dau-thay-the-bi-ep-cuoi-phan-don",
  },
  {
    key: "runaway-bride",
    label: "Cô dâu bỏ trốn / hôn lễ đảo chiều",
    slug: "co-dau-bo-tron-hon-le-dao-chieu",
  },
  {
    key: "divorce-cooling-off",
    label: "Đơn ly hôn / thời hạn lạnh / níu kéo",
    slug: "don-ly-hon-thoi-han-lanh-niu-keo",
  },
  {
    key: "secret-divorce",
    label: "Ly hôn bí mật / công bố đúng lúc",
    slug: "ly-hon-bi-mat-cong-bo-dung-luc",
  },
  {
    key: "revenge-after-death",
    label: "Giả chết / trở về / trả thù",
    slug: "gia-chet-tro-ve-tra-thu",
  },
  {
    key: "lost-memory",
    label: "Mất trí nhớ / ký ức trở lại / thanh toán",
    slug: "mat-tri-nho-ky-uc-tro-lai-thanh-toan",
  },
  {
    key: "hidden-rich-wife",
    label: "Vợ nghèo giả / thân phận giàu có",
    slug: "vo-ngheo-gia-than-phan-giau-co",
  },
  {
    key: "hidden-boss",
    label: "Nữ chủ tịch ẩn danh / nhân viên bị khinh",
    slug: "nu-chu-tich-an-danh-nhan-vien-bi-khinh",
  },
  {
    key: "mistaken-villainess",
    label: "Bị xem là ác nữ / tự cứu danh tiếng",
    slug: "bi-xem-la-ac-nu-tu-cuu-danh-tieng",
  },
  {
    key: "public-apology",
    label: "Xin lỗi công khai / quỳ gối / hot search",
    slug: "xin-loi-cong-khai-quy-goi-hot-search",
  },
  {
    key: "charity-gala",
    label: "Dạ tiệc từ thiện / đấu giá / lộ bí mật",
    slug: "da-tiec-tu-thien-dau-gia-lo-bi-mat",
  },
  {
    key: "auction-house",
    label: "Nhà đấu giá / tín vật / thân phận thật",
    slug: "nha-dau-gia-tin-vat-than-phan-that",
  },
  {
    key: "art-gallery",
    label: "Triển lãm tranh / bức họa / bí mật cũ",
    slug: "trien-lam-tranh-buc-hoa-bi-mat-cu",
  },
  {
    key: "coffee-shop-meeting",
    label: "Quán cà phê / cuộc hẹn sai người / lộ mặt",
    slug: "quan-ca-phe-cuoc-hen-sai-nguoi-lo-mat",
  },
  {
    key: "bookstore-letter",
    label: "Hiệu sách / thư cũ / tình cũ quay lại",
    slug: "hieu-sach-thu-cu-tinh-cu-quay-lai",
  },
  {
    key: "rainy-night",
    label: "Đêm mưa / bỏ rơi / cứu rỗi",
    slug: "dem-mua-bo-roi-cuu-roi",
  },
  {
    key: "snowy-return",
    label: "Đêm tuyết / trở về / thanh toán nợ cũ",
    slug: "dem-tuyet-tro-ve-thanh-toan-no-cu",
  },
  {
    key: "festival-reveal",
    label: "Lễ hội / pháo hoa / lời thú nhận",
    slug: "le-hoi-phao-hoa-loi-thu-nhan",
  },
  {
    key: "new-year-family",
    label: "Tết đoàn viên / họ hàng / vả mặt",
    slug: "tet-doan-vien-ho-hang-va-mat",
  },
  {
    key: "anniversary-banquet",
    label: "Kỷ niệm cưới / món quà phản bội",
    slug: "ky-niem-cuoi-mon-qua-phan-boi",
  },
  {
    key: "birthday-party",
    label: "Sinh nhật / khách không mời / lật mặt",
    slug: "sinh-nhat-khach-khong-moi-lat-mat",
  },
  {
    key: "vip-room",
    label: "Phòng VIP / thỏa thuận ngầm / nghe thấy",
    slug: "phong-vip-thoa-thuan-ngam-nghe-thay",
  },
  {
    key: "private-club",
    label: "Câu lạc bộ tư nhân / tầng lớp thượng lưu",
    slug: "cau-lac-bo-tu-nhan-tang-lop-thuong-luu",
  },
  {
    key: "cruise-secret",
    label: "Du thuyền / tiệc đêm / bí mật chìm",
    slug: "du-thuyen-tiec-dem-bi-mat-chim",
  },
  {
    key: "villa-camera",
    label: "Biệt thự / camera ẩn / bằng chứng",
    slug: "biet-thu-camera-an-bang-chung",
  },
  {
    key: "ancestral-hall",
    label: "Từ đường / gia quy / thân phận thật",
    slug: "tu-duong-gia-quy-than-phan-that",
  },
  {
    key: "old-house-key",
    label: "Nhà cũ / chìa khóa / bí mật di sản",
    slug: "nha-cu-chia-khoa-bi-mat-di-san",
  },
  {
    key: "orphanage-origin",
    label: "Cô nhi viện / hồ sơ nhận nuôi / thân thế",
    slug: "co-nhi-vien-ho-so-nhan-nuoi-than-the",
  },
  {
    key: "adoption-secret",
    label: "Nhận nuôi / con nuôi / quyền thừa kế",
    slug: "nhan-nuoi-con-nuoi-quyen-thua-ke",
  },
  {
    key: "twin-swap",
    label: "Song sinh / tráo thân phận / nhận nhầm",
    slug: "song-sinh-trao-than-phan-nhan-nham",
  },
  {
    key: "fake-daughter",
    label: "Thiên kim giả / thiên kim thật trở về",
    slug: "thien-kim-gia-thien-kim-that-tro-ve",
  },
  {
    key: "rural-to-rich",
    label: "Cô gái quê / hào môn / bị khinh thường",
    slug: "co-gai-que-hao-mon-bi-khinh-thuong",
  },
  {
    key: "online-rumor",
    label: "Tin đồn mạng / bạo lực mạng / tự minh oan",
    slug: "tin-don-mang-bao-luc-mang-tu-minh-oan",
  },
  {
    key: "blackmail",
    label: "Tống tiền / bí mật cũ / phản bẫy",
    slug: "tong-tien-bi-mat-cu-phan-bay",
  },
  {
    key: "anonymous-letter",
    label: "Thư nặc danh / lời cảnh báo / điều tra",
    slug: "thu-nac-danh-loi-canh-bao-dieu-tra",
  },
  {
    key: "neighborhood-gossip",
    label: "Hàng xóm / lời đồn / camera hành lang",
    slug: "hang-xom-loi-don-camera-hanh-lang",
  },
  {
    key: "job-interview",
    label: "Phỏng vấn xin việc / sếp cũ / thân phận mới",
    slug: "phong-van-xin-viec-sep-cu-than-phan-moi",
  },
  {
    key: "layoff-reversal",
    label: "Sa thải / quay lại làm sếp / vả mặt",
    slug: "sa-thai-quay-lai-lam-sep-va-mat",
  },
  {
    key: "design-plagiarism",
    label: "Đạo nhái thiết kế / chứng cứ bản quyền",
    slug: "dao-nhai-thiet-ke-chung-cu-ban-quyen",
  },
  {
    key: "chef-family",
    label: "Nhà hàng / đầu bếp / gia tộc ẩm thực",
    slug: "nha-hang-dau-bep-gia-toc-am-thuc",
  },
  {
    key: "fashion-house",
    label: "Thời trang / show diễn / cướp mẫu thiết kế",
    slug: "thoi-trang-show-dien-cuop-mau-thiet-ke",
  },
  {
    key: "beauty-pageant",
    label: "Cuộc thi sắc đẹp / dàn xếp / bóc phốt",
    slug: "cuoc-thi-sac-dep-dan-xep-boc-phot",
  },
  {
    key: "influencer-scandal",
    label: "KOL / nhãn hàng / hợp đồng bẩn",
    slug: "kol-nhan-hang-hop-dong-ban",
  },
  {
    key: "doctor-heroine",
    label: "Nữ bác sĩ / cứu người / bị vu oan",
    slug: "nu-bac-si-cuu-nguoi-bi-vu-oan",
  },
  {
    key: "teacher-heroine",
    label: "Nữ giáo viên / học sinh / sự thật bị che",
    slug: "nu-giao-vien-hoc-sinh-su-that-bi-che",
  },
  {
    key: "translator-secret",
    label: "Phiên dịch / hợp đồng quốc tế / nghe lén",
    slug: "phien-dich-hop-dong-quoc-te-nghe-len",
  },
  {
    key: "flight-attendant",
    label: "Tiếp viên hàng không / chuyến bay bí mật",
    slug: "tiep-vien-hang-khong-chuyen-bay-bi-mat",
  },
  {
    key: "hotel-manager",
    label: "Quản lý khách sạn / phòng cấm / camera",
    slug: "quan-ly-khach-san-phong-cam-camera",
  },
  {
    key: "private-investigator",
    label: "Thám tử tư / hồ sơ theo dõi / phản đòn",
    slug: "tham-tu-tu-ho-so-theo-doi-phan-don",
  },
  {
    key: "bodyguard-romance",
    label: "Vệ sĩ / bảo vệ nữ chính / bí mật thân phận",
    slug: "ve-si-bao-ve-nu-chinh-bi-mat-than-phan",
  },
  {
    key: "arranged-legacy",
    label: "Hôn ước đời trước / lời hứa gia tộc",
    slug: "hon-uoc-doi-truoc-loi-hua-gia-toc",
  },
  {
    key: "lost-heir",
    label: "Người thừa kế thất lạc / trở về đúng lúc",
    slug: "nguoi-thua-ke-that-lac-tro-ve-dung-luc",
  },
  {
    key: "double-life",
    label: "Hai thân phận / ban ngày yếu thế ban đêm nắm quyền",
    slug: "hai-than-phan-ban-ngay-yeu-the-ban-dem-nam-quyen",
  },
];

export const DEFAULT_HEROINE_OPTIONS: FactoryHeroineOption[] = [
  { key: "endure-then-counterattack", label: "Nhẫn nhịn rồi phản công" },
  { key: "cold-revenge", label: "Lạnh lùng trả thù" },
  { key: "soft-outside-hard-inside", label: "Ngoài mềm trong cứng" },
  { key: "legal-rational", label: "Lý trí, giỏi pháp lý" },
  { key: "business-queen", label: "Nữ cường thương chiến" },
  { key: "reborn-one-step-ahead", label: "Tái sinh, đi trước một bước" },
  { key: "protective-mother", label: "Người mẹ bảo vệ con" },
  { key: "wealthy-daughter", label: "Thiên kim hào môn bị xem thường" },
  { key: "silent-evidence", label: "Im lặng gom bằng chứng" },
  { key: "public-face-slap", label: "Vả mặt công khai cực gắt" },
  { key: "pain-to-control", label: "Từ đau khổ thành kiểm soát thế cục" },
  { key: "calm-strategist", label: "Bình tĩnh thao túng thế cục" },
  { key: "single-mother-warrior", label: "Mẹ đơn thân kiên cường" },
  { key: "hidden-rich-heiress", label: "Giàu ngầm nhưng giả yếu thế" },
  {
    key: "public-relations-master",
    label: "Giỏi truyền thông đảo chiều dư luận",
  },
  { key: "evidence-collector", label: "Thu thập chứng cứ từng bước" },
  { key: "quiet-lawful-revenge", label: "Trả thù hợp pháp, không ồn ào" },
  { key: "career-first", label: "Sự nghiệp trên hết, tình yêu đứng sau" },
  { key: "wounded-but-sharp", label: "Tổn thương nhưng sắc bén" },
  { key: "gentle-deadly", label: "Dịu dàng nhưng ra tay rất đau" },
];

export function makeId(prefix = "id") {
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `${prefix}_${Date.now()}_${randomPart}`;
}

export function getLogTime() {
  return new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function clampNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function randomInt(min: number, max: number) {
  const safeMin = Math.ceil(min);
  const safeMax = Math.floor(max);
  return Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
}

export function pickOne<T>(items: T[], fallback: T): T {
  if (!items.length) return fallback;
  return items[Math.floor(Math.random() * items.length)];
}

export function pickRandomDistinct<T>(
  items: T[],
  used: Set<string>,
  getKey?: (item: T) => string,
): T {
  const available = items.filter((item) => {
    const key = getKey ? getKey(item) : String(item);
    return !used.has(key);
  });

  const pool = available.length ? available : items;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  const key = getKey ? getKey(picked) : String(picked);
  used.add(key);
  return picked;
}

export function slugifyVietnamese(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);
}

export function buildAvoidLibrary(stories: ExistingStory[]): AvoidLibrary {
  const titles = new Set<string>();
  const motifs = new Set<string>();
  const characterNames = new Set<string>();
  const companyNames = new Set<string>();

  stories.forEach((story: any) => {
    if (story?.title) titles.add(String(story.title));
    if (story?.description) motifs.add(String(story.description).slice(0, 180));

    let storyDnaObject: any = null;

    if (story?.story_dna && typeof story.story_dna === "object") {
      storyDnaObject = story.story_dna;
    } else if (typeof story?.story_dna === "string") {
      try {
        storyDnaObject = JSON.parse(story.story_dna);
      } catch {
        storyDnaObject = null;
      }
    }

    const factorySeed = storyDnaObject?.factory_seed;

    if (factorySeed && typeof factorySeed === "object") {
      [
        factorySeed.shortFingerprint,
        factorySeed.corePremise,
        factorySeed.openingScene,
        factorySeed.incitingIncident,
        factorySeed.evidenceObject,
        factorySeed.setting,
        factorySeed.mainConflict,
        factorySeed.hiddenTruth,
        factorySeed.publicPressure,
        Array.isArray(factorySeed.genreBlend) ? factorySeed.genreBlend.join(" | ") : "",
        Array.isArray(factorySeed.antiRepeatTags) ? factorySeed.antiRepeatTags.join(" | ") : "",
      ]
        .filter(Boolean)
        .forEach((item) => motifs.add(String(item).slice(0, 220)));
    }

    const memoryText = [
      story?.story_memory,
      story?.story_dna,
      story?.description,
    ]
      .map((item) =>
        typeof item === "string" ? item : JSON.stringify(item || ""),
      )
      .join("\n");

    const nameMatches =
      memoryText.match(/[A-ZÀ-Ỵ][a-zà-ỹ]+\s+[A-ZÀ-Ỵ][a-zà-ỹ]+/g) || [];

    nameMatches.slice(0, 30).forEach((name) => characterNames.add(name));

    const companyMatches =
      memoryText.match(
        /[A-ZÀ-Ỵ][\wÀ-ỹ\s]{2,30}(Tập đoàn|Công ty|Group|Holdings|Capital)/g,
      ) || [];

    companyMatches
      .slice(0, 20)
      .forEach((name) => companyNames.add(name.trim()));
  });

  return {
    titles: Array.from(titles).slice(0, 300),
    motifs: Array.from(motifs).slice(0, 300),
    characterNames: Array.from(characterNames).slice(0, 120),
    companyNames: Array.from(companyNames).slice(0, 120),
  };
}

export function buildFactoryPromptIdea(params: {
  genreLabel: string;
  heroineLabel: string;
  targetChapters: number;
  avoidLibrary: AvoidLibrary;
  premiseSeed: string;
  storySeed?: FactoryStorySeed | null;
}) {
  const storySeedContext = buildStorySeedPromptContext(params.storySeed);

  const diversitySeed = buildFactoryDiversitySeed({
    recentTitles: params.avoidLibrary.titles,
    recentMotifs: params.avoidLibrary.motifs,
    seed: params.premiseSeed,
  });

  return `
Ý tưởng batch Factory.

Thể loại: ${params.genreLabel}
Kiểu nữ chính: ${params.heroineLabel}
Số chương mục tiêu toàn truyện: ${params.targetChapters}
Premise seed: ${params.premiseSeed}

${storySeedContext}

YÊU CẦU ĐA DẠNG HÓA BẮT BUỘC:
- Opening scene bắt buộc dùng seed sau: ${diversitySeed.openingScene}
- Biến cố kích hoạt chính: ${diversitySeed.trigger}
- Vật chứng / đồ vật quan trọng: ${diversitySeed.evidenceObject}
- Bối cảnh chính: ${diversitySeed.setting}

QUY TẮC CHỐNG LẶP THEO DỮ LIỆU ĐÃ CÓ:
- Đọc danh sách title/motif gần đây bên dưới và tạo một truyện khác rõ rệt.
- Không dùng lại cùng opening scene nếu motif đó đã xuất hiện nhiều.
- Không dùng lại cùng evidence object nếu motif đó đã xuất hiện nhiều.
- Không dùng lại cùng setting, hidden truth, quan hệ quyền lực hoặc kiểu áp lực công khai nếu đã có trong kho truyện.
- Nếu kho truyện đang lặp một motif nào đó, tự chọn hướng khác. Không chỉ né vài từ cố định.
- Chương 1 phải vào tình huống riêng của story seed, không dùng lại khung mở đầu của truyện khác.

YÊU CẦU CHỦ ĐỀ RỘNG:
- Có thể dùng bệnh viện, công ty, luật sư, sân bay, trường học, livestream, họp báo, đám cưới, đám tang, resort, chung cư, xe hơi, phòng khám, nhóm chat gia đình, di chúc, thừa kế, quyền nuôi con, showbiz, scandal, tài chính, nội bộ doanh nghiệp.

TRÁNH TRÙNG KHO TRUYỆN:
- Title gần đây cần tránh: ${params.avoidLibrary.titles.slice(0, 20).join(" | ") || "chưa có"}
- Motif gần đây cần tránh: ${params.avoidLibrary.motifs.slice(0, 10).join(" | ") || "chưa có"}
- Tên nhân vật/công ty đã dùng cần tránh: ${
    [
      ...params.avoidLibrary.characterNames.slice(0, 12),
      ...params.avoidLibrary.companyNames.slice(0, 8),
    ].join(" | ") || "chưa có"
  }

Yêu cầu output:
- Tạo một truyện mới có title riêng, hook mạnh, bối cảnh rõ, không trùng vibe.
- Chương 1 phải có cảnh cụ thể, đối thoại, hành động, phát hiện hoặc đảo chiều.
- Không viết summary khô. Không mở đầu chung chung.
`.trim();
}

function extractBetween(
  text: string,
  startPatterns: string[],
  endPatterns: string[],
) {
  const lower = text.toLowerCase();
  let startIndex = -1;
  let startLength = 0;

  for (const pattern of startPatterns) {
    const index = lower.indexOf(pattern.toLowerCase());

    if (index >= 0 && (startIndex < 0 || index < startIndex)) {
      startIndex = index;
      startLength = pattern.length;
    }
  }

  if (startIndex < 0) return "";

  const afterStart = startIndex + startLength;
  let endIndex = text.length;

  for (const pattern of endPatterns) {
    const index = lower.indexOf(pattern.toLowerCase(), afterStart);

    if (index >= 0 && index < endIndex) {
      endIndex = index;
    }
  }

  return text.slice(afterStart, endIndex).trim();
}

function cleanTechnicalMarkers(text: string) {
  let cleaned = text;

  const cutPatterns = [
    "# BẢN PHÂN TÍCH KỸ THUẬT",
    "BẢN PHÂN TÍCH KỸ THUẬT",
    "=== THÔNG TIN TRUYỆN ĐỀ XUẤT ===",
    "THÔNG TIN TRUYỆN ĐỀ XUẤT",
    "=== KIỂM TRA TIẾN ĐỘ TRUYỆN ===",
    "KIỂM TRA TIẾN ĐỘ TRUYỆN",
    "=== BỘ NHỚ TRUYỆN ===",
    "BỘ NHỚ TRUYỆN",
    "=== KIỂM TRA BỐI CẢNH LIÊN TỤC ===",
    "KIỂM TRA BỐI CẢNH LIÊN TỤC",
    "=== KIỂM TRA NHÂN VẬT PHỤ ===",
    "KIỂM TRA NHÂN VẬT PHỤ",
    "=== KIỂM TRA LƯỢNG TIẾT LỘ ===",
    "KIỂM TRA LƯỢNG TIẾT LỘ",
    "=== THEO DÕI",
    "THEO DÕI LEO THANG XUNG ĐỘT",
  ];

  for (const pattern of cutPatterns) {
    const index = cleaned.toLowerCase().indexOf(pattern.toLowerCase());

    if (index >= 0) {
      cleaned = cleaned.slice(0, index);
    }
  }

  return cleaned
    .replace(/^#\s*BẢN ĐỌC CHO ĐỘC GIẢ\s*/i, "")
    .replace(/^BẢN ĐỌC CHO ĐỘC GIẢ\s*/i, "")
    .trim();
}

function extractReaderOnly(output: string) {
  const readerBlock = extractBetween(
    output,
    ["# BẢN ĐỌC CHO ĐỘC GIẢ", "BẢN ĐỌC CHO ĐỘC GIẢ"],
    [
      "# BẢN PHÂN TÍCH KỸ THUẬT",
      "BẢN PHÂN TÍCH KỸ THUẬT",
      "=== THÔNG TIN TRUYỆN ĐỀ XUẤT ===",
    ],
  );

  return cleanTechnicalMarkers(readerBlock || output);
}

function extractTechnicalReport(output: string) {
  const report = extractBetween(
    output,
    [
      "# BẢN PHÂN TÍCH KỸ THUẬT",
      "BẢN PHÂN TÍCH KỸ THUẬT",
      "=== THÔNG TIN TRUYỆN ĐỀ XUẤT ===",
    ],
    [],
  );

  return report || "Không có technical report.";
}

function pickLineValue(text: string, labels: string[]) {
  const lines = text.split("\n");

  for (const line of lines) {
    for (const label of labels) {
      const regex = new RegExp(
        `^\\s*[-*]?\\s*${label}\\s*[:：-]\\s*(.+)$`,
        "i",
      );
      const match = line.match(regex);

      if (match?.[1]) {
        return match[1].trim().replace(/^['"]|['"]$/g, "");
      }
    }
  }

  return "";
}

function getFirstHeading(text: string) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const heading =
    lines.find((line) => /^#\s*Chương\s*\d+/i.test(line)) ||
    lines.find((line) => /^Chương\s*\d+/i.test(line));

  return heading?.replace(/^#\s*/, "").trim() || "";
}

function getChapterTitleFromReader(readerOnly: string, chapterNumber: number) {
  const heading = getFirstHeading(readerOnly);

  if (!heading) return `Cảnh Cửa Thứ ${chapterNumber}`;

  const match = heading.match(/^Chương\s*\d+\s*[—-]\s*(.+)$/i);

  if (match?.[1]) return match[1].trim();

  return (
    heading.replace(/^Chương\s*\d+\s*/i, "").trim() ||
    `Cảnh Cửa Thứ ${chapterNumber}`
  );
}

function normalizeStoryDescription(readerOnly: string) {
  return readerOnly
    .replace(/^#.*$/gm, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 260);
}

export function parseChapterOutput(params: {
  output: string;
  genreLabel: string;
  chapterNumber: number;
  runShortId: string;
}): ParsedChapterOutput {
  const readerOnly = extractReaderOnly(params.output);
  const technicalReport = extractTechnicalReport(params.output);
  const combined = `${technicalReport}\n${params.output}`;

  const fallbackTitle = buildFallbackStoryTitle({
    genreLabel: params.genreLabel,
    runShortId: params.runShortId,
  });

  const storyTitle =
    pickLineValue(combined, [
      "Tên truyện",
      "Title",
      "Story title",
      "storyTitle",
    ]) || fallbackTitle;

  const storyDescription =
    pickLineValue(combined, [
      "Mô tả",
      "Description",
      "Story description",
      "Tóm tắt",
    ]) ||
    normalizeStoryDescription(readerOnly) ||
    `${params.genreLabel} với biến cố riêng và nữ chính phản công.`;

  const chapterTitle = getChapterTitleFromReader(
    readerOnly,
    params.chapterNumber,
  );

    const chapterSlug = `${slugifyVietnamese(chapterTitle)}-${params.chapterNumber}`

    return {
    raw: params.output,
    storyTitle,
    storySlug: `${slugifyVietnamese(storyTitle)}-${params.runShortId}`,
    storyDescription,
    chapterTitle,
    chapterSlug,
    readerOnly,
    technicalReport,
  }
}

export function validateChapterOutput(params: {
  output: string;
  readerOnly: string;
  chapterNumber: number;
  storyTitle: string;
}) {
  const errors: string[] = [];
  const reader = params.readerOnly.trim();

  if (!reader) errors.push("readerOnly rỗng");
  if (reader.length < 300) errors.push("readerOnly quá ngắn");
  if (!params.storyTitle.trim()) errors.push("thiếu storyTitle");

  const technicalLeakPatterns = [
    "BẢN PHÂN TÍCH KỸ THUẬT",
    "THÔNG TIN TRUYỆN ĐỀ XUẤT",
    "KIỂM TRA TIẾN ĐỘ TRUYỆN",
    "BỘ NHỚ TRUYỆN",
    "KHÔNG ĐĂNG",
  ];

  technicalLeakPatterns.forEach((pattern) => {
    if (reader.toLowerCase().includes(pattern.toLowerCase())) {
      errors.push(`readerOnly lọt nhãn kỹ thuật: ${pattern}`);
    }
  });

  if (params.chapterNumber === 1 && !/^#?\s*Chương\s*1/i.test(reader)) {
    errors.push("chương 1 thiếu heading Chương 1");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}
