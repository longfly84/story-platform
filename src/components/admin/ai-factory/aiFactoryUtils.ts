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
  {
    key: "g-biet-thu-ven-ho-anh-chup-man-hinh-nguoi-bi-khinh-that-ra-nam-quyen",
    label: "Biệt thự ven hồ / ảnh chụp màn hình / người bị khinh thật ra nắm quyền",
    slug: "biet-thu-ven-ho-anh-chup-man-hinh-nguoi-bi-khinh-that-ra-nam-quyen",
  },
  {
    key: "g-penthouse-tang-cao-vali-khoa-so-nhan-chung-doi-phe",
    label: "Penthouse tầng cao / vali khóa số / nhân chứng đổi phe",
    slug: "penthouse-tang-cao-vali-khoa-so-nhan-chung-doi-phe",
  },
  {
    key: "g-phong-hop-hoi-dong-di-chuc-viet-tay-ke-dung-sau-la-nguoi-than",
    label: "Phòng họp hội đồng / di chúc viết tay / kẻ đứng sau là người thân",
    slug: "phong-hop-hoi-dong-di-chuc-viet-tay-ke-dung-sau-la-nguoi-than",
  },
  {
    key: "g-sanh-khach-san-5-sao-thiep-cuoi-bi-giau-dau-vet-nho-lat-an",
    label: "Sảnh khách sạn 5 sao / thiệp cưới bị giấu / dấu vết nhỏ lật án",
    slug: "sanh-khach-san-5-sao-thiep-cuoi-bi-giau-dau-vet-nho-lat-an",
  },
  {
    key: "g-thang-may-kinh-mat-khau-ket-sat-dong-sang-lap-phan-boi-bi-loai",
    label: "Thang máy kính / mật khẩu két sắt / đồng sáng lập phản bội bị loại",
    slug: "thang-may-kinh-mat-khau-ket-sat-dong-sang-lap-phan-boi-bi-loai",
  },
  {
    key: "g-bai-do-xe-tang-ham-vong-co-thua-ke-bi-mat-chim-noi-len",
    label: "Bãi đỗ xe tầng hầm / vòng cổ thừa kế / bí mật chìm nổi lên",
    slug: "bai-do-xe-tang-ham-vong-co-thua-ke-bi-mat-chim-noi-len",
  },
  {
    key: "g-phong-vip-benh-vien-ban-thu-am-phong-hop-co-dau-bo-tron-phan-don",
    label: "Phòng VIP bệnh viện / bản thu âm phòng họp / cô dâu bỏ trốn phản đòn",
    slug: "phong-vip-benh-vien-ban-thu-am-phong-hop-co-dau-bo-tron-phan-don",
  },
  {
    key: "g-khoa-san-nua-dem-giay-uy-quyen-gia-dua-tre-khong-phai-con-ruot",
    label: "Khoa sản nửa đêm / giấy ủy quyền giả / đứa trẻ không phải con ruột",
    slug: "khoa-san-nua-dem-giay-uy-quyen-gia-dua-tre-khong-phai-con-ruot",
  },
  {
    key: "g-phong-xet-nghiem-adn-tep-anh-phuc-hoi-nguoi-cu-tro-ve-dung-luc",
    label: "Phòng xét nghiệm ADN / tệp ảnh phục hồi / người cũ trở về đúng lúc",
    slug: "phong-xet-nghiem-adn-tep-anh-phuc-hoi-nguoi-cu-tro-ve-dung-luc",
  },
  {
    key: "g-nha-tang-le-danh-sach-khach-moi-nguoi-quy-goi-xin-loi",
    label: "Nhà tang lễ / danh sách khách mời / người quỳ gối xin lỗi",
    slug: "nha-tang-le-danh-sach-khach-moi-nguoi-quy-goi-xin-loi",
  },
  {
    key: "g-le-dinh-hon-hao-mon-camera-thang-may-vi-hon-phu-bi-thay-the",
    label: "Lễ đính hôn hào môn / camera thang máy / vị hôn phu bị thay thế",
    slug: "le-dinh-hon-hao-mon-camera-thang-may-vi-hon-phu-bi-thay-the",
  },
  {
    key: "g-hon-le-trong-mua-mau-toc-xet-nghiem-dem-mua-doi-so-phan",
    label: "Hôn lễ trong mưa / mẫu tóc xét nghiệm / đêm mưa đổi số phận",
    slug: "hon-le-trong-mua-mau-toc-xet-nghiem-dem-mua-doi-so-phan",
  },
  {
    key: "g-tiec-tu-thien-cuc-ao-roi-nguoi-bi-vu-oan-cuu-ca-gia-toc",
    label: "Tiệc từ thiện / cúc áo rơi / người bị vu oan cứu cả gia tộc",
    slug: "tiec-tu-thien-cuc-ao-roi-nguoi-bi-vu-oan-cuu-ca-gia-toc",
  },
  {
    key: "g-da-tiec-dau-gia-ban-nhap-thong-cao-ke-phan-boi-bi-ghi-am",
    label: "Dạ tiệc đấu giá / bản nháp thông cáo / kẻ phản bội bị ghi âm",
    slug: "da-tiec-dau-gia-ban-nhap-thong-cao-ke-phan-boi-bi-ghi-am",
  },
  {
    key: "g-du-thuyen-dem-ma-phong-vip-nguoi-giup-viec-giu-bi-mat",
    label: "Du thuyền đêm / mã phòng VIP / người giúp việc giữ bí mật",
    slug: "du-thuyen-dem-ma-phong-vip-nguoi-giup-viec-giu-bi-mat",
  },
  {
    key: "g-san-bay-quoc-te-ve-may-bay-mot-chieu-tai-san-doi-chu",
    label: "Sân bay quốc tế / vé máy bay một chiều / tài sản đổi chủ",
    slug: "san-bay-quoc-te-ve-may-bay-mot-chieu-tai-san-doi-chu",
  },
  {
    key: "g-khoang-hang-thuong-gia-sao-ke-ngan-hang-loi-noi-doi-bi-pha-ngay-tai-ti",
    label: "Khoang hạng thương gia / sao kê ngân hàng / lời nói dối bị phá ngay tại tiệc",
    slug: "khoang-hang-thuong-gia-sao-ke-ngan-hang-loi-noi-doi-bi-pha-ngay-tai-tiec",
  },
  {
    key: "g-nha-ga-cao-toc-phieu-xet-nghiem-doi-ten-nguoi-thua-ke-nu-doat-quyen",
    label: "Nhà ga cao tốc / phiếu xét nghiệm đổi tên / người thừa kế nữ đoạt quyền",
    slug: "nha-ga-cao-toc-phieu-xet-nghiem-doi-ten-nguoi-thua-ke-nu-doat-quyen",
  },
  {
    key: "g-khu-nghi-duong-bien-email-noi-bo-gia-quy-phan-lai-nguoi-cam-quyen",
    label: "Khu nghỉ dưỡng biển / email nội bộ / gia quy phản lại người cầm quyền",
    slug: "khu-nghi-duong-bien-email-noi-bo-gia-quy-phan-lai-nguoi-cam-quyen",
  },
  {
    key: "g-villa-rieng-tu-buc-tranh-bi-che-ly-hon-cong-bo-dung-luc",
    label: "Villa riêng tư / bức tranh bị che / ly hôn công bố đúng lúc",
    slug: "villa-rieng-tu-buc-tranh-bi-che-ly-hon-cong-bo-dung-luc",
  },
  {
    key: "g-trung-tam-thuong-mai-hop-dong-quang-cao-den-nguoi-da-chet-bat-ngo-xuat",
    label: "Trung tâm thương mại / hợp đồng quảng cáo đen / người đã chết bất ngờ xuất hiện",
    slug: "trung-tam-thuong-mai-hop-dong-quang-cao-den-nguoi-da-chet-bat-ngo-xuat-hien",
  },
  {
    key: "g-khu-vui-choi-tre-em-bao-hiem-nguoi-thu-huong-hop-dong-gia-thanh-that",
    label: "Khu vui chơi trẻ em / bảo hiểm người thụ hưởng / hợp đồng giả thành thật",
    slug: "khu-vui-choi-tre-em-bao-hiem-nguoi-thu-huong-hop-dong-gia-thanh-that",
  },
  {
    key: "g-truong-quoc-te-bien-ban-hoi-dong-hoi-dong-quan-tri-doi-phe",
    label: "Trường quốc tế / biên bản hội đồng / hội đồng quản trị đổi phe",
    slug: "truong-quoc-te-bien-ban-hoi-dong-hoi-dong-quan-tri-doi-phe",
  },
  {
    key: "g-phong-hop-phu-huynh-the-nho-camera-danh-phan-bi-tra-lai",
    label: "Phòng họp phụ huynh / thẻ nhớ camera / danh phận bị trả lại",
    slug: "phong-hop-phu-huynh-the-nho-camera-danh-phan-bi-tra-lai",
  },
  {
    key: "g-van-phong-luat-hoa-don-trang-suc-dem-tuyet-thanh-toan-no-cu",
    label: "Văn phòng luật / hóa đơn trang sức / đêm tuyết thanh toán nợ cũ",
    slug: "van-phong-luat-hoa-don-trang-suc-dem-tuyet-thanh-toan-no-cu",
  },
  {
    key: "g-toa-an-gia-dinh-anh-sieu-am-phien-dich-nghe-len-bi-mat",
    label: "Tòa án gia đình / ảnh siêu âm / phiên dịch nghe lén bí mật",
    slug: "toa-an-gia-dinh-anh-sieu-am-phien-dich-nghe-len-bi-mat",
  },
  {
    key: "g-don-canh-sat-son-moi-tren-ly-nguoi-thua-ke-that-tro-ve",
    label: "Đồn cảnh sát / son môi trên ly / người thừa kế thật trở về",
    slug: "don-canh-sat-son-moi-tren-ly-nguoi-thua-ke-that-tro-ve",
  },
  {
    key: "g-toa-soan-truyen-thong-doan-chat-nhom-gia-dinh-bac-si-bi-mua-chuoc",
    label: "Tòa soạn truyền thông / đoạn chat nhóm gia đình / bác sĩ bị mua chuộc",
    slug: "toa-soan-truyen-thong-doan-chat-nhom-gia-dinh-bac-si-bi-mua-chuoc",
  },
  {
    key: "g-phong-livestream-anh-camera-bai-xe-phong-vip-lo-giao-dich",
    label: "Phòng livestream / ảnh camera bãi xe / phòng VIP lộ giao dịch",
    slug: "phong-livestream-anh-camera-bai-xe-phong-vip-lo-giao-dich",
  },
  {
    key: "g-hau-truong-showbiz-video-camera-hanh-lang-cuoc-goi-cuoi-lam-lo-hung-th",
    label: "Hậu trường showbiz / video camera hành lang / cuộc gọi cuối làm lộ hung thủ",
    slug: "hau-truong-showbiz-video-camera-hanh-lang-cuoc-goi-cuoi-lam-lo-hung-thu",
  },
  {
    key: "g-phim-truong-co-trang-hoa-don-minibar-bang-chung-bi-trao-lan-hai",
    label: "Phim trường cổ trang / hóa đơn minibar / bằng chứng bị tráo lần hai",
    slug: "phim-truong-co-trang-hoa-don-minibar-bang-chung-bi-trao-lan-hai",
  },
  {
    key: "g-san-dien-thoi-trang-vong-tay-tre-so-sinh-di-san-co-dieu-kien",
    label: "Sàn diễn thời trang / vòng tay trẻ sơ sinh / di sản có điều kiện",
    slug: "san-dien-thoi-trang-vong-tay-tre-so-sinh-di-san-co-dieu-kien",
  },
  {
    key: "g-showroom-trang-suc-anh-cuoi-bi-cat-gia-chet-tro-ve-tra-thu",
    label: "Showroom trang sức / ảnh cưới bị cắt / giả chết trở về trả thù",
    slug: "showroom-trang-suc-anh-cuoi-bi-cat-gia-chet-tro-ve-tra-thu",
  },
  {
    key: "g-nha-dau-gia-nhat-ky-cu-gia-toc-che-giau-than-phan",
    label: "Nhà đấu giá / nhật ký cũ / gia tộc che giấu thân phận",
    slug: "nha-dau-gia-nhat-ky-cu-gia-toc-che-giau-than-phan",
  },
  {
    key: "g-phong-trien-lam-ban-thiet-ke-goc-lien-hon-tro-thanh-cai-bay",
    label: "Phòng triển lãm / bản thiết kế gốc / liên hôn trở thành cái bẫy",
    slug: "phong-trien-lam-ban-thiet-ke-goc-lien-hon-tro-thanh-cai-bay",
  },
  {
    key: "g-quan-ca-phe-cu-camera-phong-tre-doi-thu-tu-sa-bay",
    label: "Quán cà phê cũ / camera phòng trẻ / đối thủ tự sa bẫy",
    slug: "quan-ca-phe-cu-camera-phong-tre-doi-thu-tu-sa-bay",
  },
  {
    key: "g-hieu-sach-cuoi-pho-bang-luong-bi-mat-nguoi-ngheo-gia-giau-that",
    label: "Hiệu sách cuối phố / bảng lương bí mật / người nghèo giả giàu thật",
    slug: "hieu-sach-cuoi-pho-bang-luong-bi-mat-nguoi-ngheo-gia-giau-that",
  },
  {
    key: "g-nha-hang-gia-toc-laptop-bi-khoa-mon-qua-phan-boi-bi-mo-ra",
    label: "Nhà hàng gia tộc / laptop bị khóa / món quà phản bội bị mở ra",
    slug: "nha-hang-gia-toc-laptop-bi-khoa-mon-qua-phan-boi-bi-mo-ra",
  },
  {
    key: "g-bep-truong-khach-san-hop-qua-sinh-nhat-ve-si-che-giau-than-phan",
    label: "Bếp trưởng khách sạn / hộp quà sinh nhật / vệ sĩ che giấu thân phận",
    slug: "bep-truong-khach-san-hop-qua-sinh-nhat-ve-si-che-giau-than-phan",
  },
  {
    key: "g-cau-lac-bo-tu-nhan-giay-bao-no-me-chong-bi-phan-don",
    label: "Câu lạc bộ tư nhân / giấy báo nợ / mẹ chồng bị phản đòn",
    slug: "cau-lac-bo-tu-nhan-giay-bao-no-me-chong-bi-phan-don",
  },
  {
    key: "g-ham-ruou-biet-thu-toa-thuoc-gia-nu-chinh-tu-cuu-danh-tieng",
    label: "Hầm rượu biệt thự / toa thuốc giả / nữ chính tự cứu danh tiếng",
    slug: "ham-ruou-biet-thu-toa-thuoc-gia-nu-chinh-tu-cuu-danh-tieng",
  },
  {
    key: "g-phong-doc-sach-bien-so-xe-la-du-lieu-bi-phuc-hoi",
    label: "Phòng đọc sách / biển số xe lạ / dữ liệu bị phục hồi",
    slug: "phong-doc-sach-bien-so-xe-la-du-lieu-bi-phuc-hoi",
  },
  {
    key: "g-tu-duong-ho-lon-don-nhan-nuoi-dua-tre-nhan-ra-su-that",
    label: "Từ đường họ lớn / đơn nhận nuôi / đứa trẻ nhận ra sự thật",
    slug: "tu-duong-ho-lon-don-nhan-nuoi-dua-tre-nhan-ra-su-that",
  },
  {
    key: "g-nha-cu-ngoai-o-tin-nhan-nua-dem-loi-canh-bao-thanh-su-that",
    label: "Nhà cũ ngoại ô / tin nhắn nửa đêm / lời cảnh báo thành sự thật",
    slug: "nha-cu-ngoai-o-tin-nhan-nua-dem-loi-canh-bao-thanh-su-that",
  },
  {
    key: "g-co-nhi-vien-ho-chieu-gia-co-gai-que-la-chu-tich-an-danh",
    label: "Cô nhi viện / hộ chiếu giả / cô gái quê là chủ tịch ẩn danh",
    slug: "co-nhi-vien-ho-chieu-gia-co-gai-que-la-chu-tich-an-danh",
  },
  {
    key: "g-trai-he-quy-toc-giay-khai-sinh-cu-nu-bac-si-tu-minh-oan",
    label: "Trại hè quý tộc / giấy khai sinh cũ / nữ bác sĩ tự minh oan",
    slug: "trai-he-quy-toc-giay-khai-sinh-cu-nu-bac-si-tu-minh-oan",
  },
  {
    key: "g-ky-tuc-xa-dai-hoc-nhan-cuoi-khac-ten-hot-search-quay-xe",
    label: "Ký túc xá đại học / nhẫn cưới khắc tên / hot search quay xe",
    slug: "ky-tuc-xa-dai-hoc-nhan-cuoi-khac-ten-hot-search-quay-xe",
  },
  {
    key: "g-khu-chung-cu-cao-cap-chia-khoa-phong-cam-cha-ruot-xuat-hien",
    label: "Khu chung cư cao cấp / chìa khóa phòng cấm / cha ruột xuất hiện",
    slug: "khu-chung-cu-cao-cap-chia-khoa-phong-cam-cha-ruot-xuat-hien",
  },
  {
    key: "g-camera-hanh-lang-dong-ho-co-nguoi-mat-tich-quay-ve",
    label: "Camera hành lang / đồng hồ cổ / người mất tích quay về",
    slug: "camera-hanh-lang-dong-ho-co-nguoi-mat-tich-quay-ve",
  },
  {
    key: "g-phong-quan-ly-toa-nha-lich-su-dinh-vi-ban-quyen-duoc-chung-minh",
    label: "Phòng quản lý tòa nhà / lịch sử định vị / bản quyền được chứng minh",
    slug: "phong-quan-ly-toa-nha-lich-su-dinh-vi-ban-quyen-duoc-chung-minh",
  },
  {
    key: "g-van-phong-startup-ho-so-nhan-su-khach-khong-moi-lat-mat",
    label: "Văn phòng startup / hồ sơ nhân sự / khách không mời lật mặt",
    slug: "van-phong-startup-ho-so-nhan-su-khach-khong-moi-lat-mat",
  },
  {
    key: "g-phong-server-cong-ty-sim-dien-thoai-cu-hai-than-phan-va-vao-nhau",
    label: "Phòng server công ty / sim điện thoại cũ / hai thân phận va vào nhau",
    slug: "phong-server-cong-ty-sim-dien-thoai-cu-hai-than-phan-va-vao-nhau",
  },
  {
    key: "g-ngan-hang-phong-vip-ghe-trong-trong-tiec-chong-cu-muon-mang-hoi-han",
    label: "Ngân hàng phòng VIP / ghế trống trong tiệc / chồng cũ muộn màng hối hận",
    slug: "ngan-hang-phong-vip-ghe-trong-trong-tiec-chong-cu-muon-mang-hoi-han",
  },
  {
    key: "g-quay-giao-dich-rieng-log-ra-vao-toa-nha-thien-kim-that-lat-mat",
    label: "Quầy giao dịch riêng / log ra vào tòa nhà / thiên kim thật lật mặt",
    slug: "quay-giao-dich-rieng-log-ra-vao-toa-nha-thien-kim-that-lat-mat",
  },
  {
    key: "g-phong-kiem-toan-bang-gac-co-dau-vet-thu-cu-mo-khoa-bi-mat",
    label: "Phòng kiểm toán / băng gạc có dấu vết / thư cũ mở khóa bí mật",
    slug: "phong-kiem-toan-bang-gac-co-dau-vet-thu-cu-mo-khoa-bi-mat",
  },
  {
    key: "g-hoi-nghi-co-dong-giay-cao-got-gay-nu-chinh-roi-di-dung-luc",
    label: "Hội nghị cổ đông / giày cao gót gãy / nữ chính rời đi đúng lúc",
    slug: "hoi-nghi-co-dong-giay-cao-got-gay-nu-chinh-roi-di-dung-luc",
  },
  {
    key: "g-le-ra-mat-san-pham-lich-hen-bac-si-ke-tong-tien-bi-phan-bay",
    label: "Lễ ra mắt sản phẩm / lịch hẹn bác sĩ / kẻ tống tiền bị phản bẫy",
    slug: "le-ra-mat-san-pham-lich-hen-bac-si-ke-tong-tien-bi-phan-bay",
  },
  {
    key: "g-hop-bao-khung-hoang-hop-dong-bao-mat-bao-luc-mang-bi-dao-chieu",
    label: "Họp báo khủng hoảng / hợp đồng bảo mật / bạo lực mạng bị đảo chiều",
    slug: "hop-bao-khung-hoang-hop-dong-bao-mat-bao-luc-mang-bi-dao-chieu",
  },
  {
    key: "g-studio-chup-anh-boarding-pass-bi-xe-nu-giao-vien-lat-lai-su-that",
    label: "Studio chụp ảnh / boarding pass bị xé / nữ giáo viên lật lại sự thật",
    slug: "studio-chup-anh-boarding-pass-bi-xe-nu-giao-vien-lat-lai-su-that",
  },
  {
    key: "g-phong-make-up-hop-dong-co-phan-truyen-thong-bi-phan-don",
    label: "Phòng make-up / hợp đồng cổ phần / truyền thông bị phản đòn",
    slug: "phong-make-up-hop-dong-co-phan-truyen-thong-bi-phan-don",
  },
  {
    key: "g-phong-kham-tu-don-ly-hon-chua-ky-me-ruot-bi-giau-kin",
    label: "Phòng khám tư / đơn ly hôn chưa ký / mẹ ruột bị giấu kín",
    slug: "phong-kham-tu-don-ly-hon-chua-ky-me-ruot-bi-giau-kin",
  },
  {
    key: "g-khoa-cap-cuu-file-cloud-bi-xoa-ban-sao-hop-dong-bien-mat",
    label: "Khoa cấp cứu / file cloud bị xóa / bản sao hợp đồng biến mất",
    slug: "khoa-cap-cuu-file-cloud-bi-xoa-ban-sao-hop-dong-bien-mat",
  },
  {
    key: "g-nha-tre-song-ngu-tin-vat-gia-toc-dan-xep-bi-boc-phot",
    label: "Nhà trẻ song ngữ / tín vật gia tộc / dàn xếp bị bóc phốt",
    slug: "nha-tre-song-ngu-tin-vat-gia-toc-dan-xep-bi-boc-phot",
  },
  {
    key: "g-phong-bao-mau-clip-hau-truong-thoa-thuan-ngam-bi-nghe-thay",
    label: "Phòng bảo mẫu / clip hậu trường / thỏa thuận ngầm bị nghe thấy",
    slug: "phong-bao-mau-clip-hau-truong-thoa-thuan-ngam-bi-nghe-thay",
  },
  {
    key: "g-cong-vien-mua-dem-don-to-cao-bi-giau-ban-ngay-yeu-the-ban-dem-nam-quye",
    label: "Công viên mưa đêm / đơn tố cáo bị giấu / ban ngày yếu thế ban đêm nắm quyền",
    slug: "cong-vien-mua-dem-don-to-cao-bi-giau-ban-ngay-yeu-the-ban-dem-nam-quyen",
  },
  {
    key: "g-cua-hang-ao-cuoi-ma-ket-sat-hon-le-dao-chieu",
    label: "Cửa hàng áo cưới / mã két sắt / hôn lễ đảo chiều",
    slug: "cua-hang-ao-cuoi-ma-ket-sat-hon-le-dao-chieu",
  },
  {
    key: "g-xuong-thiet-ke-ma-qr-ve-su-kien-thien-kim-gia-mat-cho-dua",
    label: "Xưởng thiết kế / mã QR vé sự kiện / thiên kim giả mất chỗ dựa",
    slug: "xuong-thiet-ke-ma-qr-ve-su-kien-thien-kim-gia-mat-cho-dua",
  },
  {
    key: "g-kho-hang-bi-mat-phieu-gui-do-dam-dong-chung-kien-va-mat",
    label: "Kho hàng bí mật / phiếu gửi đồ / đám đông chứng kiến vả mặt",
    slug: "kho-hang-bi-mat-phieu-gui-do-dam-dong-chung-kien-va-mat",
  },
  {
    key: "g-garage-xe-sang-so-kham-thai-nguoi-chong-tuong-thang-lai-thua",
    label: "Garage xe sang / sổ khám thai / người chồng tưởng thắng lại thua",
    slug: "garage-xe-sang-so-kham-thai-nguoi-chong-tuong-thang-lai-thua",
  },
  {
    key: "g-cabin-xe-rieng-khan-lua-bo-quen-nguoi-im-lang-moi-la-chu-muu",
    label: "Cabin xe riêng / khăn lụa bỏ quên / người im lặng mới là chủ mưu",
    slug: "cabin-xe-rieng-khan-lua-bo-quen-nguoi-im-lang-moi-la-chu-muu",
  },
  {
    key: "g-duong-cao-toc-dem-bai-dang-hot-search-sep-cu-gap-lai-than-phan-moi",
    label: "Đường cao tốc đêm / bài đăng hot search / sếp cũ gặp lại thân phận mới",
    slug: "duong-cao-toc-dem-bai-dang-hot-search-sep-cu-gap-lai-than-phan-moi",
  },
  {
    key: "g-tram-dung-chan-bien-lai-nha-hang-nguoi-bi-khinh-that-ra-nam-quyen",
    label: "Trạm dừng chân / biên lai nhà hàng / người bị khinh thật ra nắm quyền",
    slug: "tram-dung-chan-bien-lai-nha-hang-nguoi-bi-khinh-that-ra-nam-quyen",
  },
  {
    key: "g-nha-ga-san-bay-camera-hanh-trinh-nhan-chung-doi-phe",
    label: "Nhà ga sân bay / camera hành trình / nhân chứng đổi phe",
    slug: "nha-ga-san-bay-camera-hanh-trinh-nhan-chung-doi-phe",
  },
  {
    key: "g-khach-san-suoi-nuoc-nong-bien-lai-chuyen-khoan-ke-dung-sau-la-nguoi-th",
    label: "Khách sạn suối nước nóng / biên lai chuyển khoản / kẻ đứng sau là người thân",
    slug: "khach-san-suoi-nuoc-nong-bien-lai-chuyen-khoan-ke-dung-sau-la-nguoi-than",
  },
  {
    key: "g-phong-tra-rieng-benh-an-bi-sua-loi-noi-doi-bi-pha-ngay-tai-tiec",
    label: "Phòng trà riêng / bệnh án bị sửa / lời nói dối bị phá ngay tại tiệc",
    slug: "phong-tra-rieng-benh-an-bi-sua-loi-noi-doi-bi-pha-ngay-tai-tiec",
  },
  {
    key: "g-lau-tra-co-usb-du-lieu-mat-nguoi-thua-ke-nu-doat-quyen",
    label: "Lầu trà cổ / USB dữ liệu mật / người thừa kế nữ đoạt quyền",
    slug: "lau-tra-co-usb-du-lieu-mat-nguoi-thua-ke-nu-doat-quyen",
  },
  {
    key: "g-nha-hang-tren-cao-so-tay-cua-me-gia-quy-phan-lai-nguoi-cam-quyen",
    label: "Nhà hàng trên cao / sổ tay của mẹ / gia quy phản lại người cầm quyền",
    slug: "nha-hang-tren-cao-so-tay-cua-me-gia-quy-phan-lai-nguoi-cam-quyen",
  },
  {
    key: "g-rooftop-bar-mau-vai-bi-danh-trao-ly-hon-cong-bo-dung-luc",
    label: "Rooftop bar / mẫu vải bị đánh tráo / ly hôn công bố đúng lúc",
    slug: "rooftop-bar-mau-vai-bi-danh-trao-ly-hon-cong-bo-dung-luc",
  },
  {
    key: "g-sanh-tap-doan-do-choi-co-may-ghi-am-nguoi-da-chet-bat-ngo-xuat-hien",
    label: "Sảnh tập đoàn / đồ chơi có máy ghi âm / người đã chết bất ngờ xuất hiện",
    slug: "sanh-tap-doan-do-choi-co-may-ghi-am-nguoi-da-chet-bat-ngo-xuat-hien",
  },
  {
    key: "g-phong-chu-tich-so-co-dong-hop-dong-gia-thanh-that",
    label: "Phòng chủ tịch / sổ cổ đông / hợp đồng giả thành thật",
    slug: "phong-chu-tich-so-co-dong-hop-dong-gia-thanh-that",
  },
  {
    key: "g-van-phong-thu-ky-o-cung-di-dong-hoi-dong-quan-tri-doi-phe",
    label: "Văn phòng thư ký / ổ cứng di động / hội đồng quản trị đổi phe",
    slug: "van-phong-thu-ky-o-cung-di-dong-hoi-dong-quan-tri-doi-phe",
  },
  {
    key: "g-phong-nhan-su-thiep-chuc-mung-la-danh-phan-bi-tra-lai",
    label: "Phòng nhân sự / thiệp chúc mừng lạ / danh phận bị trả lại",
    slug: "phong-nhan-su-thiep-chuc-mung-la-danh-phan-bi-tra-lai",
  },
  {
    key: "g-phong-tai-chinh-thoa-thuan-tien-chuoc-dem-tuyet-thanh-toan-no-cu",
    label: "Phòng tài chính / thỏa thuận tiền chuộc / đêm tuyết thanh toán nợ cũ",
    slug: "phong-tai-chinh-thoa-thuan-tien-chuoc-dem-tuyet-thanh-toan-no-cu",
  },
  {
    key: "g-phong-phap-che-lo-nuoc-hoa-la-phien-dich-nghe-len-bi-mat",
    label: "Phòng pháp chế / lọ nước hoa lạ / phiên dịch nghe lén bí mật",
    slug: "phong-phap-che-lo-nuoc-hoa-la-phien-dich-nghe-len-bi-mat",
  },
  {
    key: "g-kho-luu-tru-cong-ty-ve-gui-xe-nguoi-thua-ke-that-tro-ve",
    label: "Kho lưu trữ công ty / vé gửi xe / người thừa kế thật trở về",
    slug: "kho-luu-tru-cong-ty-ve-gui-xe-nguoi-thua-ke-that-tro-ve",
  },
  {
    key: "g-phong-ho-so-benh-vien-giay-chung-tu-nghi-van-bac-si-bi-mua-chuoc",
    label: "Phòng hồ sơ bệnh viện / giấy chứng tử nghi vấn / bác sĩ bị mua chuộc",
    slug: "phong-ho-so-benh-vien-giay-chung-tu-nghi-van-bac-si-bi-mua-chuoc",
  },
  {
    key: "g-phong-cham-soc-tre-so-sinh-ghi-am-cuoc-goi-phong-vip-lo-giao-dich",
    label: "Phòng chăm sóc trẻ sơ sinh / ghi âm cuộc gọi / phòng VIP lộ giao dịch",
    slug: "phong-cham-soc-tre-so-sinh-ghi-am-cuoc-goi-phong-vip-lo-giao-dich",
  },
  {
    key: "g-hanh-lang-benh-vien-the-phong-khach-san-cuoc-goi-cuoi-lam-lo-hung-thu",
    label: "Hành lang bệnh viện / thẻ phòng khách sạn / cuộc gọi cuối làm lộ hung thủ",
    slug: "hanh-lang-benh-vien-the-phong-khach-san-cuoc-goi-cuoi-lam-lo-hung-thu",
  },
  {
    key: "g-nha-nguyen-nho-ket-qua-adn-bang-chung-bi-trao-lan-hai",
    label: "Nhà nguyện nhỏ / kết quả ADN / bằng chứng bị tráo lần hai",
    slug: "nha-nguyen-nho-ket-qua-adn-bang-chung-bi-trao-lan-hai",
  },
  {
    key: "g-bai-bien-luc-binh-minh-vay-cuoi-rach-di-san-co-dieu-kien",
    label: "Bãi biển lúc bình minh / váy cưới rách / di sản có điều kiện",
    slug: "bai-bien-luc-binh-minh-vay-cuoi-rach-di-san-co-dieu-kien",
  },
  {
    key: "g-doi-tuyet-buc-thu-nac-danh-gia-chet-tro-ve-tra-thu",
    label: "Đồi tuyết / bức thư nặc danh / giả chết trở về trả thù",
    slug: "doi-tuyet-buc-thu-nac-danh-gia-chet-tro-ve-tra-thu",
  },
  {
    key: "g-le-hoi-phao-hoa-manh-giay-trong-sach-gia-toc-che-giau-than-phan",
    label: "Lễ hội pháo hoa / mảnh giấy trong sách / gia tộc che giấu thân phận",
    slug: "le-hoi-phao-hoa-manh-giay-trong-sach-gia-toc-che-giau-than-phan",
  },
  {
    key: "g-cho-hoa-tet-anh-dinh-vi-khach-san-lien-hon-tro-thanh-cai-bay",
    label: "Chợ hoa Tết / ảnh định vị khách sạn / liên hôn trở thành cái bẫy",
    slug: "cho-hoa-tet-anh-dinh-vi-khach-san-lien-hon-tro-thanh-cai-bay",
  },
  {
    key: "g-san-sau-biet-thu-quyet-dinh-sa-thai-doi-thu-tu-sa-bay",
    label: "Sân sau biệt thự / quyết định sa thải / đối thủ tự sa bẫy",
    slug: "san-sau-biet-thu-quyet-dinh-sa-thai-doi-thu-tu-sa-bay",
  },
  {
    key: "g-vuon-kinh-dien-thoai-bi-vo-nguoi-ngheo-gia-giau-that",
    label: "Vườn kính / điện thoại bị vỡ / người nghèo giả giàu thật",
    slug: "vuon-kinh-dien-thoai-bi-vo-nguoi-ngheo-gia-giau-that",
  },
  {
    key: "g-nha-kinh-trong-hoa-hoa-cuoi-gui-nham-tet-doan-vien-va-mat-ho-hang",
    label: "Nhà kính trồng hoa / hoa cưới gửi nhầm / Tết đoàn viên vả mặt họ hàng",
    slug: "nha-kinh-trong-hoa-hoa-cuoi-gui-nham-tet-doan-vien-va-mat-ho-hang",
  },
  {
    key: "g-trai-ngua-hop-dong-thue-nha-tiep-vien-giu-chuyen-bay-cuoi",
    label: "Trại ngựa / hợp đồng thuê nhà / tiếp viên giữ chuyến bay cuối",
    slug: "trai-ngua-hop-dong-thue-nha-tiep-vien-giu-chuyen-bay-cuoi",
  },
  {
    key: "g-san-golf-hao-mon-thuoc-bi-doi-tieu-tam-tu-lo-so-ho",
    label: "Sân golf hào môn / thuốc bị đổi / tiểu tam tự lộ sơ hở",
    slug: "san-golf-hao-mon-thuoc-bi-doi-tieu-tam-tu-lo-so-ho",
  },
  {
    key: "g-phong-piano-the-nhan-vien-cu-luat-su-tung-bang-chung",
    label: "Phòng piano / thẻ nhân viên cũ / luật sư tung bằng chứng",
    slug: "phong-piano-the-nhan-vien-cu-luat-su-tung-bang-chung",
  },
  {
    key: "g-phong-tranh-rieng-hop-dong-hon-nhan-camera-mat-bay-phut",
    label: "Phòng tranh riêng / hợp đồng hôn nhân / camera mất bảy phút",
    slug: "phong-tranh-rieng-hop-dong-hon-nhan-camera-mat-bay-phut",
  },
  {
    key: "g-khoang-thang-may-rieng-anh-chup-man-hinh-bao-hiem-he-am-muu",
    label: "Khoang thang máy riêng / ảnh chụp màn hình / bảo hiểm hé âm mưu",
    slug: "khoang-thang-may-rieng-anh-chup-man-hinh-bao-hiem-he-am-muu",
  },
  {
    key: "g-can-ho-bi-mat-vali-khoa-so-tin-nhan-gui-nham-cuu-mang",
    label: "Căn hộ bí mật / vali khóa số / tin nhắn gửi nhầm cứu mạng",
    slug: "can-ho-bi-mat-vali-khoa-so-tin-nhan-gui-nham-cuu-mang",
  },
  {
    key: "g-nha-an-toan-di-chuc-viet-tay-cap-song-sinh-trao-than-phan",
    label: "Nhà an toàn / di chúc viết tay / cặp song sinh tráo thân phận",
    slug: "nha-an-toan-di-chuc-viet-tay-cap-song-sinh-trao-than-phan",
  },
  {
    key: "g-phong-giam-sat-camera-thiep-cuoi-bi-giau-ky-uc-quay-lai-dung-phien-toa",
    label: "Phòng giám sát camera / thiệp cưới bị giấu / ký ức quay lại đúng phiên tòa",
    slug: "phong-giam-sat-camera-thiep-cuoi-bi-giau-ky-uc-quay-lai-dung-phien-toa",
  },
  {
    key: "g-trung-tam-du-lieu-mat-khau-ket-sat-co-phan-bi-chuyen-nguoc",
    label: "Trung tâm dữ liệu / mật khẩu két sắt / cổ phần bị chuyển ngược",
    slug: "trung-tam-du-lieu-mat-khau-ket-sat-co-phan-bi-chuyen-nguoc",
  },
  {
    key: "g-dai-truyen-hinh-vong-co-thua-ke-nguoi-bao-ve-la-dai-thieu-gia",
    label: "Đài truyền hình / vòng cổ thừa kế / người bảo vệ là đại thiếu gia",
    slug: "dai-truyen-hinh-vong-co-thua-ke-nguoi-bao-ve-la-dai-thieu-gia",
  },
  {
    key: "g-phong-bien-tap-ban-thu-am-phong-hop-moi-tinh-cu-thanh-nhan-chung",
    label: "Phòng biên tập / bản thu âm phòng họp / mối tình cũ thành nhân chứng",
    slug: "phong-bien-tap-ban-thu-am-phong-hop-moi-tinh-cu-thanh-nhan-chung",
  },
  {
    key: "g-van-phong-kol-giay-uy-quyen-gia-bi-sa-thai-roi-quay-lai-lam-sep",
    label: "Văn phòng KOL / giấy ủy quyền giả / bị sa thải rồi quay lại làm sếp",
    slug: "van-phong-kol-giay-uy-quyen-gia-bi-sa-thai-roi-quay-lai-lam-sep",
  },
  {
    key: "g-studio-podcast-tep-anh-phuc-hoi-mon-qua-phan-boi-bi-mo-ra",
    label: "Studio podcast / tệp ảnh phục hồi / món quà phản bội bị mở ra",
    slug: "studio-podcast-tep-anh-phuc-hoi-mon-qua-phan-boi-bi-mo-ra",
  },
  {
    key: "g-san-khau-trao-giai-danh-sach-khach-moi-ve-si-che-giau-than-phan",
    label: "Sân khấu trao giải / danh sách khách mời / vệ sĩ che giấu thân phận",
    slug: "san-khau-trao-giai-danh-sach-khach-moi-ve-si-che-giau-than-phan",
  },
  {
    key: "g-buoi-thu-vai-camera-thang-may-me-chong-bi-phan-don",
    label: "Buổi thử vai / camera thang máy / mẹ chồng bị phản đòn",
    slug: "buoi-thu-vai-camera-thang-may-me-chong-bi-phan-don",
  },
  {
    key: "g-phong-casting-mau-toc-xet-nghiem-thien-kim-that-lat-mat",
    label: "Phòng casting / mẫu tóc xét nghiệm / thiên kim thật lật mặt",
    slug: "phong-casting-mau-toc-xet-nghiem-thien-kim-that-lat-mat",
  },
  {
    key: "g-hau-truong-concert-cuc-ao-roi-thu-cu-mo-khoa-bi-mat",
    label: "Hậu trường concert / cúc áo rơi / thư cũ mở khóa bí mật",
    slug: "hau-truong-concert-cuc-ao-roi-thu-cu-mo-khoa-bi-mat",
  },
  {
    key: "g-phong-tap-vu-dao-ban-nhap-thong-cao-nu-chinh-roi-di-dung-luc",
    label: "Phòng tập vũ đạo / bản nháp thông cáo / nữ chính rời đi đúng lúc",
    slug: "phong-tap-vu-dao-ban-nhap-thong-cao-nu-chinh-roi-di-dung-luc",
  },
  {
    key: "g-san-dau-gia-co-vat-ma-phong-vip-ke-tong-tien-bi-phan-bay",
    label: "Sàn đấu giá cổ vật / mã phòng VIP / kẻ tống tiền bị phản bẫy",
    slug: "san-dau-gia-co-vat-ma-phong-vip-ke-tong-tien-bi-phan-bay",
  },
  {
    key: "g-bao-tang-tu-nhan-ve-may-bay-mot-chieu-bao-luc-mang-bi-dao-chieu",
    label: "Bảo tàng tư nhân / vé máy bay một chiều / bạo lực mạng bị đảo chiều",
    slug: "bao-tang-tu-nhan-ve-may-bay-mot-chieu-bao-luc-mang-bi-dao-chieu",
  },
  {
    key: "g-tu-bao-hiem-ngan-hang-sao-ke-ngan-hang-nu-giao-vien-lat-lai-su-that",
    label: "Tủ bảo hiểm ngân hàng / sao kê ngân hàng / nữ giáo viên lật lại sự thật",
    slug: "tu-bao-hiem-ngan-hang-sao-ke-ngan-hang-nu-giao-vien-lat-lai-su-that",
  },
  {
    key: "g-phong-ket-biet-thu-phieu-xet-nghiem-doi-ten-truyen-thong-bi-phan-don",
    label: "Phòng két biệt thự / phiếu xét nghiệm đổi tên / truyền thông bị phản đòn",
    slug: "phong-ket-biet-thu-phieu-xet-nghiem-doi-ten-truyen-thong-bi-phan-don",
  },
  {
    key: "g-kho-do-cu-email-noi-bo-me-ruot-bi-giau-kin",
    label: "Kho đồ cũ / email nội bộ / mẹ ruột bị giấu kín",
    slug: "kho-do-cu-email-noi-bo-me-ruot-bi-giau-kin",
  },
  {
    key: "g-nha-kho-cang-bien-buc-tranh-bi-che-ban-sao-hop-dong-bien-mat",
    label: "Nhà kho cảng biển / bức tranh bị che / bản sao hợp đồng biến mất",
    slug: "nha-kho-cang-bien-buc-tranh-bi-che-ban-sao-hop-dong-bien-mat",
  },
  {
    key: "g-cang-du-thuyen-hop-dong-quang-cao-den-dan-xep-bi-boc-phot",
    label: "Cảng du thuyền / hợp đồng quảng cáo đen / dàn xếp bị bóc phốt",
    slug: "cang-du-thuyen-hop-dong-quang-cao-den-dan-xep-bi-boc-phot",
  },
  {
    key: "g-phong-cho-luat-su-bao-hiem-nguoi-thu-huong-thoa-thuan-ngam-bi-nghe-tha",
    label: "Phòng chờ luật sư / bảo hiểm người thụ hưởng / thỏa thuận ngầm bị nghe thấy",
    slug: "phong-cho-luat-su-bao-hiem-nguoi-thu-huong-thoa-thuan-ngam-bi-nghe-thay",
  },
  {
    key: "g-trai-giam-tham-gap-bien-ban-hoi-dong-ban-ngay-yeu-the-ban-dem-nam-quye",
    label: "Trại giam thăm gặp / biên bản hội đồng / ban ngày yếu thế ban đêm nắm quyền",
    slug: "trai-giam-tham-gap-bien-ban-hoi-dong-ban-ngay-yeu-the-ban-dem-nam-quyen",
  },
  {
    key: "g-phong-hoa-giai-the-nho-camera-hon-le-dao-chieu",
    label: "Phòng hòa giải / thẻ nhớ camera / hôn lễ đảo chiều",
    slug: "phong-hoa-giai-the-nho-camera-hon-le-dao-chieu",
  },
  {
    key: "g-van-phong-cong-chung-hoa-don-trang-suc-thien-kim-gia-mat-cho-dua",
    label: "Văn phòng công chứng / hóa đơn trang sức / thiên kim giả mất chỗ dựa",
    slug: "van-phong-cong-chung-hoa-don-trang-suc-thien-kim-gia-mat-cho-dua",
  },
  {
    key: "g-phong-dang-ky-ket-hon-anh-sieu-am-dam-dong-chung-kien-va-mat",
    label: "Phòng đăng ký kết hôn / ảnh siêu âm / đám đông chứng kiến vả mặt",
    slug: "phong-dang-ky-ket-hon-anh-sieu-am-dam-dong-chung-kien-va-mat",
  },
  {
    key: "g-cuc-ho-tich-son-moi-tren-ly-nguoi-chong-tuong-thang-lai-thua",
    label: "Cục hộ tịch / son môi trên ly / người chồng tưởng thắng lại thua",
    slug: "cuc-ho-tich-son-moi-tren-ly-nguoi-chong-tuong-thang-lai-thua",
  },
  {
    key: "g-phong-bao-hiem-doan-chat-nhom-gia-dinh-nguoi-im-lang-moi-la-chu-muu",
    label: "Phòng bảo hiểm / đoạn chat nhóm gia đình / người im lặng mới là chủ mưu",
    slug: "phong-bao-hiem-doan-chat-nhom-gia-dinh-nguoi-im-lang-moi-la-chu-muu",
  },
  {
    key: "g-trung-tam-xet-nghiem-anh-camera-bai-xe-sep-cu-gap-lai-than-phan-moi",
    label: "Trung tâm xét nghiệm / ảnh camera bãi xe / sếp cũ gặp lại thân phận mới",
    slug: "trung-tam-xet-nghiem-anh-camera-bai-xe-sep-cu-gap-lai-than-phan-moi",
  },
  {
    key: "g-nha-khach-gia-toc-video-camera-hanh-lang-nguoi-bi-khinh-that-ra-nam-qu",
    label: "Nhà khách gia tộc / video camera hành lang / người bị khinh thật ra nắm quyền",
    slug: "nha-khach-gia-toc-video-camera-hanh-lang-nguoi-bi-khinh-that-ra-nam-quyen",
  },
  {
    key: "g-khu-duong-lao-cao-cap-hoa-don-minibar-nhan-chung-doi-phe",
    label: "Khu dưỡng lão cao cấp / hóa đơn minibar / nhân chứng đổi phe",
    slug: "khu-duong-lao-cao-cap-hoa-don-minibar-nhan-chung-doi-phe",
  },
  {
    key: "g-phong-cham-soc-dac-biet-vong-tay-tre-so-sinh-ke-dung-sau-la-nguoi-than",
    label: "Phòng chăm sóc đặc biệt / vòng tay trẻ sơ sinh / kẻ đứng sau là người thân",
    slug: "phong-cham-soc-dac-biet-vong-tay-tre-so-sinh-ke-dung-sau-la-nguoi-than",
  },
  {
    key: "g-nha-hang-tiec-cuoi-anh-cuoi-bi-cat-dau-vet-nho-lat-an",
    label: "Nhà hàng tiệc cưới / ảnh cưới bị cắt / dấu vết nhỏ lật án",
    slug: "nha-hang-tiec-cuoi-anh-cuoi-bi-cat-dau-vet-nho-lat-an",
  },
  {
    key: "g-phong-co-dau-nhat-ky-cu-dong-sang-lap-phan-boi-bi-loai",
    label: "Phòng cô dâu / nhật ký cũ / đồng sáng lập phản bội bị loại",
    slug: "phong-co-dau-nhat-ky-cu-dong-sang-lap-phan-boi-bi-loai",
  },
  {
    key: "g-phong-chu-re-ban-thiet-ke-goc-bi-mat-chim-noi-len",
    label: "Phòng chú rể / bản thiết kế gốc / bí mật chìm nổi lên",
    slug: "phong-chu-re-ban-thiet-ke-goc-bi-mat-chim-noi-len",
  },
  {
    key: "g-sanh-chung-cu-dem-camera-phong-tre-co-dau-bo-tron-phan-don",
    label: "Sảnh chung cư đêm / camera phòng trẻ / cô dâu bỏ trốn phản đòn",
    slug: "sanh-chung-cu-dem-camera-phong-tre-co-dau-bo-tron-phan-don",
  },
  {
    key: "g-ban-cong-tang-cao-bang-luong-bi-mat-dua-tre-khong-phai-con-ruot",
    label: "Ban công tầng cao / bảng lương bí mật / đứa trẻ không phải con ruột",
    slug: "ban-cong-tang-cao-bang-luong-bi-mat-dua-tre-khong-phai-con-ruot",
  },
  {
    key: "g-cau-thang-thoat-hiem-laptop-bi-khoa-nguoi-cu-tro-ve-dung-luc",
    label: "Cầu thang thoát hiểm / laptop bị khóa / người cũ trở về đúng lúc",
    slug: "cau-thang-thoat-hiem-laptop-bi-khoa-nguoi-cu-tro-ve-dung-luc",
  },
  {
    key: "g-hanh-lang-khach-san-hop-qua-sinh-nhat-nguoi-quy-goi-xin-loi",
    label: "Hành lang khách sạn / hộp quà sinh nhật / người quỳ gối xin lỗi",
    slug: "hanh-lang-khach-san-hop-qua-sinh-nhat-nguoi-quy-goi-xin-loi",
  },
  {
    key: "g-phong-camera-khach-san-giay-bao-no-vi-hon-phu-bi-thay-the",
    label: "Phòng camera khách sạn / giấy báo nợ / vị hôn phu bị thay thế",
    slug: "phong-camera-khach-san-giay-bao-no-vi-hon-phu-bi-thay-the",
  },
  {
    key: "g-quay-le-tan-toa-thuoc-gia-dem-mua-doi-so-phan",
    label: "Quầy lễ tân / toa thuốc giả / đêm mưa đổi số phận",
    slug: "quay-le-tan-toa-thuoc-gia-dem-mua-doi-so-phan",
  },
  {
    key: "g-phong-giat-la-bien-so-xe-la-nguoi-bi-vu-oan-cuu-ca-gia-toc",
    label: "Phòng giặt là / biển số xe lạ / người bị vu oan cứu cả gia tộc",
    slug: "phong-giat-la-bien-so-xe-la-nguoi-bi-vu-oan-cuu-ca-gia-toc",
  },
  {
    key: "g-kho-ruou-nha-hang-don-nhan-nuoi-ke-phan-boi-bi-ghi-am",
    label: "Kho rượu nhà hàng / đơn nhận nuôi / kẻ phản bội bị ghi âm",
    slug: "kho-ruou-nha-hang-don-nhan-nuoi-ke-phan-boi-bi-ghi-am",
  },
  {
    key: "g-san-thuong-mua-tin-nhan-nua-dem-nguoi-giup-viec-giu-bi-mat",
    label: "Sân thượng mưa / tin nhắn nửa đêm / người giúp việc giữ bí mật",
    slug: "san-thuong-mua-tin-nhan-nua-dem-nguoi-giup-viec-giu-bi-mat",
  },
  {
    key: "g-ga-tau-cu-ho-chieu-gia-tai-san-doi-chu",
    label: "Ga tàu cũ / hộ chiếu giả / tài sản đổi chủ",
    slug: "ga-tau-cu-ho-chieu-gia-tai-san-doi-chu",
  },
  {
    key: "g-chuyen-tau-dem-giay-khai-sinh-cu-loi-noi-doi-bi-pha-ngay-tai-tiec",
    label: "Chuyến tàu đêm / giấy khai sinh cũ / lời nói dối bị phá ngay tại tiệc",
    slug: "chuyen-tau-dem-giay-khai-sinh-cu-loi-noi-doi-bi-pha-ngay-tai-tiec",
  },
  {
    key: "g-ben-xe-lien-tinh-nhan-cuoi-khac-ten-nguoi-thua-ke-nu-doat-quyen",
    label: "Bến xe liên tỉnh / nhẫn cưới khắc tên / người thừa kế nữ đoạt quyền",
    slug: "ben-xe-lien-tinh-nhan-cuoi-khac-ten-nguoi-thua-ke-nu-doat-quyen",
  },
  {
    key: "g-phong-cho-vip-chia-khoa-phong-cam-gia-quy-phan-lai-nguoi-cam-quyen",
    label: "Phòng chờ VIP / chìa khóa phòng cấm / gia quy phản lại người cầm quyền",
    slug: "phong-cho-vip-chia-khoa-phong-cam-gia-quy-phan-lai-nguoi-cam-quyen",
  },
  {
    key: "g-cua-khau-dong-ho-co-gia-chet-tro-ve-tra-thu",
    label: "Cửa khẩu / đồng hồ cổ / giả chết trở về trả thù",
    slug: "cua-khau-dong-ho-co-gia-chet-tro-ve-tra-thu",
  },
  {
    key: "g-lanh-su-quan-lich-su-dinh-vi-gia-toc-che-giau-than-phan",
    label: "Lãnh sự quán / lịch sử định vị / gia tộc che giấu thân phận",
    slug: "lanh-su-quan-lich-su-dinh-vi-gia-toc-che-giau-than-phan",
  },
  {
    key: "g-van-phong-phien-dich-ho-so-nhan-su-lien-hon-tro-thanh-cai-bay",
    label: "Văn phòng phiên dịch / hồ sơ nhân sự / liên hôn trở thành cái bẫy",
    slug: "van-phong-phien-dich-ho-so-nhan-su-lien-hon-tro-thanh-cai-bay",
  },
  {
    key: "g-phong-hop-quoc-te-sim-dien-thoai-cu-doi-thu-tu-sa-bay",
    label: "Phòng họp quốc tế / sim điện thoại cũ / đối thủ tự sa bẫy",
    slug: "phong-hop-quoc-te-sim-dien-thoai-cu-doi-thu-tu-sa-bay",
  },
  {
    key: "g-hoi-cho-thuong-mai-ghe-trong-trong-tiec-nguoi-ngheo-gia-giau-that",
    label: "Hội chợ thương mại / ghế trống trong tiệc / người nghèo giả giàu thật",
    slug: "hoi-cho-thuong-mai-ghe-trong-trong-tiec-nguoi-ngheo-gia-giau-that",
  },
  {
    key: "g-nha-may-gia-dinh-log-ra-vao-toa-nha-tet-doan-vien-va-mat-ho-hang",
    label: "Nhà máy gia đình / log ra vào tòa nhà / Tết đoàn viên vả mặt họ hàng",
    slug: "nha-may-gia-dinh-log-ra-vao-toa-nha-tet-doan-vien-va-mat-ho-hang",
  },
  {
    key: "g-xuong-may-bang-gac-co-dau-vet-tiep-vien-giu-chuyen-bay-cuoi",
    label: "Xưởng may / băng gạc có dấu vết / tiếp viên giữ chuyến bay cuối",
    slug: "xuong-may-bang-gac-co-dau-vet-tiep-vien-giu-chuyen-bay-cuoi",
  },
  {
    key: "g-kho-lanh-giay-cao-got-gay-tieu-tam-tu-lo-so-ho",
    label: "Kho lạnh / giày cao gót gãy / tiểu tam tự lộ sơ hở",
    slug: "kho-lanh-giay-cao-got-gay-tieu-tam-tu-lo-so-ho",
  },
  {
    key: "g-trang-trai-ngoai-o-lich-hen-bac-si-luat-su-tung-bang-chung",
    label: "Trang trại ngoại ô / lịch hẹn bác sĩ / luật sư tung bằng chứng",
    slug: "trang-trai-ngoai-o-lich-hen-bac-si-luat-su-tung-bang-chung",
  },
  {
    key: "g-nha-tho-hon-le-hop-dong-bao-mat-camera-mat-bay-phut",
    label: "Nhà thờ hôn lễ / hợp đồng bảo mật / camera mất bảy phút",
    slug: "nha-tho-hon-le-hop-dong-bao-mat-camera-mat-bay-phut",
  },
  {
    key: "g-san-truong-cu-boarding-pass-bi-xe-bao-hiem-he-am-muu",
    label: "Sân trường cũ / boarding pass bị xé / bảo hiểm hé âm mưu",
    slug: "san-truong-cu-boarding-pass-bi-xe-bao-hiem-he-am-muu",
  },
  {
    key: "g-thu-vien-dai-hoc-hop-dong-co-phan-tin-nhan-gui-nham-cuu-mang",
    label: "Thư viện đại học / hợp đồng cổ phần / tin nhắn gửi nhầm cứu mạng",
    slug: "thu-vien-dai-hoc-hop-dong-co-phan-tin-nhan-gui-nham-cuu-mang",
  },
  {
    key: "g-phong-y-te-truong-don-ly-hon-chua-ky-cap-song-sinh-trao-than-phan",
    label: "Phòng y tế trường / đơn ly hôn chưa ký / cặp song sinh tráo thân phận",
    slug: "phong-y-te-truong-don-ly-hon-chua-ky-cap-song-sinh-trao-than-phan",
  },
  {
    key: "g-phong-hieu-truong-file-cloud-bi-xoa-ky-uc-quay-lai-dung-phien-toa",
    label: "Phòng hiệu trưởng / file cloud bị xóa / ký ức quay lại đúng phiên tòa",
    slug: "phong-hieu-truong-file-cloud-bi-xoa-ky-uc-quay-lai-dung-phien-toa",
  },
  {
    key: "g-cong-truong-luc-mua-tin-vat-gia-toc-co-phan-bi-chuyen-nguoc",
    label: "Cổng trường lúc mưa / tín vật gia tộc / cổ phần bị chuyển ngược",
    slug: "cong-truong-luc-mua-tin-vat-gia-toc-co-phan-bi-chuyen-nguoc",
  },
  {
    key: "g-khu-pho-cu-clip-hau-truong-nguoi-bao-ve-la-dai-thieu-gia",
    label: "Khu phố cũ / clip hậu trường / người bảo vệ là đại thiếu gia",
    slug: "khu-pho-cu-clip-hau-truong-nguoi-bao-ve-la-dai-thieu-gia",
  },
  {
    key: "g-tiem-anh-cu-don-to-cao-bi-giau-moi-tinh-cu-thanh-nhan-chung",
    label: "Tiệm ảnh cũ / đơn tố cáo bị giấu / mối tình cũ thành nhân chứng",
    slug: "tiem-anh-cu-don-to-cao-bi-giau-moi-tinh-cu-thanh-nhan-chung",
  },
  {
    key: "g-tiem-sua-dien-thoai-ma-ket-sat-bi-sa-thai-roi-quay-lai-lam-sep",
    label: "Tiệm sửa điện thoại / mã két sắt / bị sa thải rồi quay lại làm sếp",
    slug: "tiem-sua-dien-thoai-ma-ket-sat-bi-sa-thai-roi-quay-lai-lam-sep",
  },
  {
    key: "g-cua-hang-dong-ho-ma-qr-ve-su-kien-mon-qua-phan-boi-bi-mo-ra",
    label: "Cửa hàng đồng hồ / mã QR vé sự kiện / món quà phản bội bị mở ra",
    slug: "cua-hang-dong-ho-ma-qr-ve-su-kien-mon-qua-phan-boi-bi-mo-ra",
  },
  {
    key: "g-tiem-banh-gia-dinh-phieu-gui-do-ve-si-che-giau-than-phan",
    label: "Tiệm bánh gia đình / phiếu gửi đồ / vệ sĩ che giấu thân phận",
    slug: "tiem-banh-gia-dinh-phieu-gui-do-ve-si-che-giau-than-phan",
  },
  {
    key: "g-quan-an-dem-so-kham-thai-me-chong-bi-phan-don",
    label: "Quán ăn đêm / sổ khám thai / mẹ chồng bị phản đòn",
    slug: "quan-an-dem-so-kham-thai-me-chong-bi-phan-don",
  },
  {
    key: "g-phong-karaoke-rieng-khan-lua-bo-quen-nu-chinh-tu-cuu-danh-tieng",
    label: "Phòng karaoke riêng / khăn lụa bỏ quên / nữ chính tự cứu danh tiếng",
    slug: "phong-karaoke-rieng-khan-lua-bo-quen-nu-chinh-tu-cuu-danh-tieng",
  },
  {
    key: "g-ktv-hao-mon-bai-dang-hot-search-du-lieu-bi-phuc-hoi",
    label: "KTV hào môn / bài đăng hot search / dữ liệu bị phục hồi",
    slug: "ktv-hao-mon-bai-dang-hot-search-du-lieu-bi-phuc-hoi",
  },
  {
    key: "g-casino-tren-du-thuyen-bien-lai-nha-hang-dua-tre-nhan-ra-su-that",
    label: "Casino trên du thuyền / biên lai nhà hàng / đứa trẻ nhận ra sự thật",
    slug: "casino-tren-du-thuyen-bien-lai-nha-hang-dua-tre-nhan-ra-su-that",
  },
  {
    key: "g-spa-cao-cap-camera-hanh-trinh-loi-canh-bao-thanh-su-that",
    label: "Spa cao cấp / camera hành trình / lời cảnh báo thành sự thật",
    slug: "spa-cao-cap-camera-hanh-trinh-loi-canh-bao-thanh-su-that",
  },
  {
    key: "g-phong-tri-lieu-tam-ly-bien-lai-chuyen-khoan-co-gai-que-la-chu-tich-an",
    label: "Phòng trị liệu tâm lý / biên lai chuyển khoản / cô gái quê là chủ tịch ẩn danh",
    slug: "phong-tri-lieu-tam-ly-bien-lai-chuyen-khoan-co-gai-que-la-chu-tich-an-danh",
  },
  {
    key: "g-studio-yoga-benh-an-bi-sua-nu-bac-si-tu-minh-oan",
    label: "Studio yoga / bệnh án bị sửa / nữ bác sĩ tự minh oan",
    slug: "studio-yoga-benh-an-bi-sua-nu-bac-si-tu-minh-oan",
  },
  {
    key: "g-phong-hop-bi-mat-usb-du-lieu-mat-hot-search-quay-xe",
    label: "Phòng họp bí mật / USB dữ liệu mật / hot search quay xe",
    slug: "phong-hop-bi-mat-usb-du-lieu-mat-hot-search-quay-xe",
  },
  {
    key: "g-can-phong-khoa-trai-so-tay-cua-me-cha-ruot-xuat-hien",
    label: "Căn phòng khóa trái / sổ tay của mẹ / cha ruột xuất hiện",
    slug: "can-phong-khoa-trai-so-tay-cua-me-cha-ruot-xuat-hien",
  },
  {
    key: "g-tang-ap-mai-mau-vai-bi-danh-trao-nguoi-mat-tich-quay-ve",
    label: "Tầng áp mái / mẫu vải bị đánh tráo / người mất tích quay về",
    slug: "tang-ap-mai-mau-vai-bi-danh-trao-nguoi-mat-tich-quay-ve",
  },
  {
    key: "g-tang-ham-biet-thu-do-choi-co-may-ghi-am-ban-quyen-duoc-chung-minh",
    label: "Tầng hầm biệt thự / đồ chơi có máy ghi âm / bản quyền được chứng minh",
    slug: "tang-ham-biet-thu-do-choi-co-may-ghi-am-ban-quyen-duoc-chung-minh",
  },
  {
    key: "g-loi-thoat-hiem-so-co-dong-khach-khong-moi-lat-mat",
    label: "Lối thoát hiểm / sổ cổ đông / khách không mời lật mặt",
    slug: "loi-thoat-hiem-so-co-dong-khach-khong-moi-lat-mat",
  },
  {
    key: "g-san-sau-benh-vien-o-cung-di-dong-hai-than-phan-va-vao-nhau",
    label: "Sân sau bệnh viện / ổ cứng di động / hai thân phận va vào nhau",
    slug: "san-sau-benh-vien-o-cung-di-dong-hai-than-phan-va-vao-nhau",
  },
  {
    key: "g-nha-xac-benh-vien-thiep-chuc-mung-la-chong-cu-muon-mang-hoi-han",
    label: "Nhà xác bệnh viện / thiệp chúc mừng lạ / chồng cũ muộn màng hối hận",
    slug: "nha-xac-benh-vien-thiep-chuc-mung-la-chong-cu-muon-mang-hoi-han",
  },
  {
    key: "g-phong-luu-mau-thoa-thuan-tien-chuoc-thien-kim-that-lat-mat",
    label: "Phòng lưu mẫu / thỏa thuận tiền chuộc / thiên kim thật lật mặt",
    slug: "phong-luu-mau-thoa-thuan-tien-chuoc-thien-kim-that-lat-mat",
  },
  {
    key: "g-quay-thuoc-tu-nhan-lo-nuoc-hoa-la-thu-cu-mo-khoa-bi-mat",
    label: "Quầy thuốc tư nhân / lọ nước hoa lạ / thư cũ mở khóa bí mật",
    slug: "quay-thuoc-tu-nhan-lo-nuoc-hoa-la-thu-cu-mo-khoa-bi-mat",
  },
  {
    key: "g-kho-ho-so-luat-su-ve-gui-xe-nu-chinh-roi-di-dung-luc",
    label: "Kho hồ sơ luật sư / vé gửi xe / nữ chính rời đi đúng lúc",
    slug: "kho-ho-so-luat-su-ve-gui-xe-nu-chinh-roi-di-dung-luc",
  },
  {
    key: "g-biet-thu-ven-ho-anh-camera-bai-xe-nguoi-im-lang-moi-la-chu-muu",
    label: "Biệt thự ven hồ / ảnh camera bãi xe / người im lặng mới là chủ mưu",
    slug: "biet-thu-ven-ho-anh-camera-bai-xe-nguoi-im-lang-moi-la-chu-muu",
  },
  {
    key: "g-penthouse-tang-cao-video-camera-hanh-lang-sep-cu-gap-lai-than-phan-moi",
    label: "Penthouse tầng cao / video camera hành lang / sếp cũ gặp lại thân phận mới",
    slug: "penthouse-tang-cao-video-camera-hanh-lang-sep-cu-gap-lai-than-phan-moi",
  },
  {
    key: "g-phong-hop-hoi-dong-hoa-don-minibar-nguoi-bi-khinh-that-ra-nam-quyen",
    label: "Phòng họp hội đồng / hóa đơn minibar / người bị khinh thật ra nắm quyền",
    slug: "phong-hop-hoi-dong-hoa-don-minibar-nguoi-bi-khinh-that-ra-nam-quyen",
  },
  {
    key: "g-sanh-khach-san-5-sao-vong-tay-tre-so-sinh-nhan-chung-doi-phe",
    label: "Sảnh khách sạn 5 sao / vòng tay trẻ sơ sinh / nhân chứng đổi phe",
    slug: "sanh-khach-san-5-sao-vong-tay-tre-so-sinh-nhan-chung-doi-phe",
  },
  {
    key: "g-thang-may-kinh-anh-cuoi-bi-cat-ke-dung-sau-la-nguoi-than",
    label: "Thang máy kính / ảnh cưới bị cắt / kẻ đứng sau là người thân",
    slug: "thang-may-kinh-anh-cuoi-bi-cat-ke-dung-sau-la-nguoi-than",
  },
  {
    key: "g-bai-do-xe-tang-ham-nhat-ky-cu-dau-vet-nho-lat-an",
    label: "Bãi đỗ xe tầng hầm / nhật ký cũ / dấu vết nhỏ lật án",
    slug: "bai-do-xe-tang-ham-nhat-ky-cu-dau-vet-nho-lat-an",
  },
  {
    key: "g-phong-vip-benh-vien-ban-thiet-ke-goc-dong-sang-lap-phan-boi-bi-loai",
    label: "Phòng VIP bệnh viện / bản thiết kế gốc / đồng sáng lập phản bội bị loại",
    slug: "phong-vip-benh-vien-ban-thiet-ke-goc-dong-sang-lap-phan-boi-bi-loai",
  },
  {
    key: "g-khoa-san-nua-dem-camera-phong-tre-bi-mat-chim-noi-len",
    label: "Khoa sản nửa đêm / camera phòng trẻ / bí mật chìm nổi lên",
    slug: "khoa-san-nua-dem-camera-phong-tre-bi-mat-chim-noi-len",
  },
  {
    key: "g-phong-xet-nghiem-adn-bang-luong-bi-mat-co-dau-bo-tron-phan-don",
    label: "Phòng xét nghiệm ADN / bảng lương bí mật / cô dâu bỏ trốn phản đòn",
    slug: "phong-xet-nghiem-adn-bang-luong-bi-mat-co-dau-bo-tron-phan-don",
  },
  {
    key: "g-nha-tang-le-laptop-bi-khoa-dua-tre-khong-phai-con-ruot",
    label: "Nhà tang lễ / laptop bị khóa / đứa trẻ không phải con ruột",
    slug: "nha-tang-le-laptop-bi-khoa-dua-tre-khong-phai-con-ruot",
  },
  {
    key: "g-le-dinh-hon-hao-mon-hop-qua-sinh-nhat-nguoi-cu-tro-ve-dung-luc",
    label: "Lễ đính hôn hào môn / hộp quà sinh nhật / người cũ trở về đúng lúc",
    slug: "le-dinh-hon-hao-mon-hop-qua-sinh-nhat-nguoi-cu-tro-ve-dung-luc",
  },
  {
    key: "g-hon-le-trong-mua-giay-bao-no-nguoi-quy-goi-xin-loi",
    label: "Hôn lễ trong mưa / giấy báo nợ / người quỳ gối xin lỗi",
    slug: "hon-le-trong-mua-giay-bao-no-nguoi-quy-goi-xin-loi",
  },
  {
    key: "g-tiec-tu-thien-toa-thuoc-gia-vi-hon-phu-bi-thay-the",
    label: "Tiệc từ thiện / toa thuốc giả / vị hôn phu bị thay thế",
    slug: "tiec-tu-thien-toa-thuoc-gia-vi-hon-phu-bi-thay-the",
  },
  {
    key: "g-da-tiec-dau-gia-bien-so-xe-la-dem-mua-doi-so-phan",
    label: "Dạ tiệc đấu giá / biển số xe lạ / đêm mưa đổi số phận",
    slug: "da-tiec-dau-gia-bien-so-xe-la-dem-mua-doi-so-phan",
  },
  {
    key: "g-du-thuyen-dem-don-nhan-nuoi-nguoi-bi-vu-oan-cuu-ca-gia-toc",
    label: "Du thuyền đêm / đơn nhận nuôi / người bị vu oan cứu cả gia tộc",
    slug: "du-thuyen-dem-don-nhan-nuoi-nguoi-bi-vu-oan-cuu-ca-gia-toc",
  },
  {
    key: "g-san-bay-quoc-te-tin-nhan-nua-dem-ke-phan-boi-bi-ghi-am",
    label: "Sân bay quốc tế / tin nhắn nửa đêm / kẻ phản bội bị ghi âm",
    slug: "san-bay-quoc-te-tin-nhan-nua-dem-ke-phan-boi-bi-ghi-am",
  },
  {
    key: "g-khoang-hang-thuong-gia-ho-chieu-gia-nguoi-giup-viec-giu-bi-mat",
    label: "Khoang hạng thương gia / hộ chiếu giả / người giúp việc giữ bí mật",
    slug: "khoang-hang-thuong-gia-ho-chieu-gia-nguoi-giup-viec-giu-bi-mat",
  },
  {
    key: "g-nha-ga-cao-toc-giay-khai-sinh-cu-tai-san-doi-chu",
    label: "Nhà ga cao tốc / giấy khai sinh cũ / tài sản đổi chủ",
    slug: "nha-ga-cao-toc-giay-khai-sinh-cu-tai-san-doi-chu",
  },
  {
    key: "g-khu-nghi-duong-bien-nhan-cuoi-khac-ten-loi-noi-doi-bi-pha-ngay-tai-tie",
    label: "Khu nghỉ dưỡng biển / nhẫn cưới khắc tên / lời nói dối bị phá ngay tại tiệc",
    slug: "khu-nghi-duong-bien-nhan-cuoi-khac-ten-loi-noi-doi-bi-pha-ngay-tai-tiec",
  },
  {
    key: "g-villa-rieng-tu-chia-khoa-phong-cam-nguoi-thua-ke-nu-doat-quyen",
    label: "Villa riêng tư / chìa khóa phòng cấm / người thừa kế nữ đoạt quyền",
    slug: "villa-rieng-tu-chia-khoa-phong-cam-nguoi-thua-ke-nu-doat-quyen",
  },
  {
    key: "g-trung-tam-thuong-mai-dong-ho-co-gia-quy-phan-lai-nguoi-cam-quyen",
    label: "Trung tâm thương mại / đồng hồ cổ / gia quy phản lại người cầm quyền",
    slug: "trung-tam-thuong-mai-dong-ho-co-gia-quy-phan-lai-nguoi-cam-quyen",
  },
  {
    key: "g-khu-vui-choi-tre-em-lich-su-dinh-vi-ly-hon-cong-bo-dung-luc",
    label: "Khu vui chơi trẻ em / lịch sử định vị / ly hôn công bố đúng lúc",
    slug: "khu-vui-choi-tre-em-lich-su-dinh-vi-ly-hon-cong-bo-dung-luc",
  },
  {
    key: "g-truong-quoc-te-ho-so-nhan-su-nguoi-da-chet-bat-ngo-xuat-hien",
    label: "Trường quốc tế / hồ sơ nhân sự / người đã chết bất ngờ xuất hiện",
    slug: "truong-quoc-te-ho-so-nhan-su-nguoi-da-chet-bat-ngo-xuat-hien",
  },
  {
    key: "g-phong-hop-phu-huynh-sim-dien-thoai-cu-hop-dong-gia-thanh-that",
    label: "Phòng họp phụ huynh / sim điện thoại cũ / hợp đồng giả thành thật",
    slug: "phong-hop-phu-huynh-sim-dien-thoai-cu-hop-dong-gia-thanh-that",
  },
  {
    key: "g-van-phong-luat-ghe-trong-trong-tiec-hoi-dong-quan-tri-doi-phe",
    label: "Văn phòng luật / ghế trống trong tiệc / hội đồng quản trị đổi phe",
    slug: "van-phong-luat-ghe-trong-trong-tiec-hoi-dong-quan-tri-doi-phe",
  },
  {
    key: "g-toa-an-gia-dinh-log-ra-vao-toa-nha-danh-phan-bi-tra-lai",
    label: "Tòa án gia đình / log ra vào tòa nhà / danh phận bị trả lại",
    slug: "toa-an-gia-dinh-log-ra-vao-toa-nha-danh-phan-bi-tra-lai",
  },
  {
    key: "g-don-canh-sat-bang-gac-co-dau-vet-dem-tuyet-thanh-toan-no-cu",
    label: "Đồn cảnh sát / băng gạc có dấu vết / đêm tuyết thanh toán nợ cũ",
    slug: "don-canh-sat-bang-gac-co-dau-vet-dem-tuyet-thanh-toan-no-cu",
  },
  {
    key: "g-toa-soan-truyen-thong-giay-cao-got-gay-phien-dich-nghe-len-bi-mat",
    label: "Tòa soạn truyền thông / giày cao gót gãy / phiên dịch nghe lén bí mật",
    slug: "toa-soan-truyen-thong-giay-cao-got-gay-phien-dich-nghe-len-bi-mat",
  },
  {
    key: "g-phong-livestream-lich-hen-bac-si-nguoi-thua-ke-that-tro-ve",
    label: "Phòng livestream / lịch hẹn bác sĩ / người thừa kế thật trở về",
    slug: "phong-livestream-lich-hen-bac-si-nguoi-thua-ke-that-tro-ve",
  },
  {
    key: "g-hau-truong-showbiz-hop-dong-bao-mat-bac-si-bi-mua-chuoc",
    label: "Hậu trường showbiz / hợp đồng bảo mật / bác sĩ bị mua chuộc",
    slug: "hau-truong-showbiz-hop-dong-bao-mat-bac-si-bi-mua-chuoc",
  },
  {
    key: "g-phim-truong-co-trang-boarding-pass-bi-xe-phong-vip-lo-giao-dich",
    label: "Phim trường cổ trang / boarding pass bị xé / phòng VIP lộ giao dịch",
    slug: "phim-truong-co-trang-boarding-pass-bi-xe-phong-vip-lo-giao-dich",
  },
  {
    key: "g-san-dien-thoi-trang-hop-dong-co-phan-cuoc-goi-cuoi-lam-lo-hung-thu",
    label: "Sàn diễn thời trang / hợp đồng cổ phần / cuộc gọi cuối làm lộ hung thủ",
    slug: "san-dien-thoi-trang-hop-dong-co-phan-cuoc-goi-cuoi-lam-lo-hung-thu",
  },
  {
    key: "g-showroom-trang-suc-don-ly-hon-chua-ky-bang-chung-bi-trao-lan-hai",
    label: "Showroom trang sức / đơn ly hôn chưa ký / bằng chứng bị tráo lần hai",
    slug: "showroom-trang-suc-don-ly-hon-chua-ky-bang-chung-bi-trao-lan-hai",
  },
  {
    key: "g-nha-dau-gia-file-cloud-bi-xoa-di-san-co-dieu-kien",
    label: "Nhà đấu giá / file cloud bị xóa / di sản có điều kiện",
    slug: "nha-dau-gia-file-cloud-bi-xoa-di-san-co-dieu-kien",
  },
  {
    key: "g-phong-trien-lam-tin-vat-gia-toc-gia-chet-tro-ve-tra-thu",
    label: "Phòng triển lãm / tín vật gia tộc / giả chết trở về trả thù",
    slug: "phong-trien-lam-tin-vat-gia-toc-gia-chet-tro-ve-tra-thu",
  },
  {
    key: "g-quan-ca-phe-cu-clip-hau-truong-gia-toc-che-giau-than-phan",
    label: "Quán cà phê cũ / clip hậu trường / gia tộc che giấu thân phận",
    slug: "quan-ca-phe-cu-clip-hau-truong-gia-toc-che-giau-than-phan",
  },
  {
    key: "g-hieu-sach-cuoi-pho-don-to-cao-bi-giau-lien-hon-tro-thanh-cai-bay",
    label: "Hiệu sách cuối phố / đơn tố cáo bị giấu / liên hôn trở thành cái bẫy",
    slug: "hieu-sach-cuoi-pho-don-to-cao-bi-giau-lien-hon-tro-thanh-cai-bay",
  },
  {
    key: "g-nha-hang-gia-toc-ma-ket-sat-moi-tinh-cu-thanh-nhan-chung",
    label: "Nhà hàng gia tộc / mã két sắt / mối tình cũ thành nhân chứng",
    slug: "nha-hang-gia-toc-ma-ket-sat-moi-tinh-cu-thanh-nhan-chung",
  },
  {
    key: "g-bep-truong-khach-san-ma-qr-ve-su-kien-bi-sa-thai-roi-quay-lai-lam-sep",
    label: "Bếp trưởng khách sạn / mã QR vé sự kiện / bị sa thải rồi quay lại làm sếp",
    slug: "bep-truong-khach-san-ma-qr-ve-su-kien-bi-sa-thai-roi-quay-lai-lam-sep",
  },
  {
    key: "g-cau-lac-bo-tu-nhan-phieu-gui-do-mon-qua-phan-boi-bi-mo-ra",
    label: "Câu lạc bộ tư nhân / phiếu gửi đồ / món quà phản bội bị mở ra",
    slug: "cau-lac-bo-tu-nhan-phieu-gui-do-mon-qua-phan-boi-bi-mo-ra",
  },
  {
    key: "g-ham-ruou-biet-thu-so-kham-thai-ve-si-che-giau-than-phan",
    label: "Hầm rượu biệt thự / sổ khám thai / vệ sĩ che giấu thân phận",
    slug: "ham-ruou-biet-thu-so-kham-thai-ve-si-che-giau-than-phan",
  },
  {
    key: "g-phong-doc-sach-khan-lua-bo-quen-me-chong-bi-phan-don",
    label: "Phòng đọc sách / khăn lụa bỏ quên / mẹ chồng bị phản đòn",
    slug: "phong-doc-sach-khan-lua-bo-quen-me-chong-bi-phan-don",
  },
  {
    key: "g-tu-duong-ho-lon-bai-dang-hot-search-nu-chinh-tu-cuu-danh-tieng",
    label: "Từ đường họ lớn / bài đăng hot search / nữ chính tự cứu danh tiếng",
    slug: "tu-duong-ho-lon-bai-dang-hot-search-nu-chinh-tu-cuu-danh-tieng",
  },
  {
    key: "g-nha-cu-ngoai-o-bien-lai-nha-hang-du-lieu-bi-phuc-hoi",
    label: "Nhà cũ ngoại ô / biên lai nhà hàng / dữ liệu bị phục hồi",
    slug: "nha-cu-ngoai-o-bien-lai-nha-hang-du-lieu-bi-phuc-hoi",
  },
  {
    key: "g-co-nhi-vien-camera-hanh-trinh-dua-tre-nhan-ra-su-that",
    label: "Cô nhi viện / camera hành trình / đứa trẻ nhận ra sự thật",
    slug: "co-nhi-vien-camera-hanh-trinh-dua-tre-nhan-ra-su-that",
  },
  {
    key: "g-trai-he-quy-toc-bien-lai-chuyen-khoan-loi-canh-bao-thanh-su-that",
    label: "Trại hè quý tộc / biên lai chuyển khoản / lời cảnh báo thành sự thật",
    slug: "trai-he-quy-toc-bien-lai-chuyen-khoan-loi-canh-bao-thanh-su-that",
  },
  {
    key: "g-ky-tuc-xa-dai-hoc-benh-an-bi-sua-co-gai-que-la-chu-tich-an-danh",
    label: "Ký túc xá đại học / bệnh án bị sửa / cô gái quê là chủ tịch ẩn danh",
    slug: "ky-tuc-xa-dai-hoc-benh-an-bi-sua-co-gai-que-la-chu-tich-an-danh",
  },
  {
    key: "g-khu-chung-cu-cao-cap-usb-du-lieu-mat-nu-bac-si-tu-minh-oan",
    label: "Khu chung cư cao cấp / USB dữ liệu mật / nữ bác sĩ tự minh oan",
    slug: "khu-chung-cu-cao-cap-usb-du-lieu-mat-nu-bac-si-tu-minh-oan",
  },
  {
    key: "g-camera-hanh-lang-so-tay-cua-me-hot-search-quay-xe",
    label: "Camera hành lang / sổ tay của mẹ / hot search quay xe",
    slug: "camera-hanh-lang-so-tay-cua-me-hot-search-quay-xe",
  },
  {
    key: "g-phong-quan-ly-toa-nha-mau-vai-bi-danh-trao-cha-ruot-xuat-hien",
    label: "Phòng quản lý tòa nhà / mẫu vải bị đánh tráo / cha ruột xuất hiện",
    slug: "phong-quan-ly-toa-nha-mau-vai-bi-danh-trao-cha-ruot-xuat-hien",
  },
  {
    key: "g-van-phong-startup-do-choi-co-may-ghi-am-nguoi-mat-tich-quay-ve",
    label: "Văn phòng startup / đồ chơi có máy ghi âm / người mất tích quay về",
    slug: "van-phong-startup-do-choi-co-may-ghi-am-nguoi-mat-tich-quay-ve",
  },
  {
    key: "g-phong-server-cong-ty-so-co-dong-ban-quyen-duoc-chung-minh",
    label: "Phòng server công ty / sổ cổ đông / bản quyền được chứng minh",
    slug: "phong-server-cong-ty-so-co-dong-ban-quyen-duoc-chung-minh",
  },
  {
    key: "g-ngan-hang-phong-vip-o-cung-di-dong-khach-khong-moi-lat-mat",
    label: "Ngân hàng phòng VIP / ổ cứng di động / khách không mời lật mặt",
    slug: "ngan-hang-phong-vip-o-cung-di-dong-khach-khong-moi-lat-mat",
  },
  {
    key: "g-quay-giao-dich-rieng-thiep-chuc-mung-la-hai-than-phan-va-vao-nhau",
    label: "Quầy giao dịch riêng / thiệp chúc mừng lạ / hai thân phận va vào nhau",
    slug: "quay-giao-dich-rieng-thiep-chuc-mung-la-hai-than-phan-va-vao-nhau",
  },
  {
    key: "g-phong-kiem-toan-thoa-thuan-tien-chuoc-chong-cu-muon-mang-hoi-han",
    label: "Phòng kiểm toán / thỏa thuận tiền chuộc / chồng cũ muộn màng hối hận",
    slug: "phong-kiem-toan-thoa-thuan-tien-chuoc-chong-cu-muon-mang-hoi-han",
  },
  {
    key: "g-hoi-nghi-co-dong-lo-nuoc-hoa-la-thien-kim-that-lat-mat",
    label: "Hội nghị cổ đông / lọ nước hoa lạ / thiên kim thật lật mặt",
    slug: "hoi-nghi-co-dong-lo-nuoc-hoa-la-thien-kim-that-lat-mat",
  },
  {
    key: "g-le-ra-mat-san-pham-ve-gui-xe-thu-cu-mo-khoa-bi-mat",
    label: "Lễ ra mắt sản phẩm / vé gửi xe / thư cũ mở khóa bí mật",
    slug: "le-ra-mat-san-pham-ve-gui-xe-thu-cu-mo-khoa-bi-mat",
  },
  {
    key: "g-hop-bao-khung-hoang-giay-chung-tu-nghi-van-nu-chinh-roi-di-dung-luc",
    label: "Họp báo khủng hoảng / giấy chứng tử nghi vấn / nữ chính rời đi đúng lúc",
    slug: "hop-bao-khung-hoang-giay-chung-tu-nghi-van-nu-chinh-roi-di-dung-luc",
  },
  {
    key: "g-studio-chup-anh-ghi-am-cuoc-goi-ke-tong-tien-bi-phan-bay",
    label: "Studio chụp ảnh / ghi âm cuộc gọi / kẻ tống tiền bị phản bẫy",
    slug: "studio-chup-anh-ghi-am-cuoc-goi-ke-tong-tien-bi-phan-bay",
  },
  {
    key: "g-phong-make-up-the-phong-khach-san-bao-luc-mang-bi-dao-chieu",
    label: "Phòng make-up / thẻ phòng khách sạn / bạo lực mạng bị đảo chiều",
    slug: "phong-make-up-the-phong-khach-san-bao-luc-mang-bi-dao-chieu",
  },
  {
    key: "g-phong-kham-tu-ket-qua-adn-nu-giao-vien-lat-lai-su-that",
    label: "Phòng khám tư / kết quả ADN / nữ giáo viên lật lại sự thật",
    slug: "phong-kham-tu-ket-qua-adn-nu-giao-vien-lat-lai-su-that",
  },
  {
    key: "g-khoa-cap-cuu-vay-cuoi-rach-truyen-thong-bi-phan-don",
    label: "Khoa cấp cứu / váy cưới rách / truyền thông bị phản đòn",
    slug: "khoa-cap-cuu-vay-cuoi-rach-truyen-thong-bi-phan-don",
  },
  {
    key: "g-nha-tre-song-ngu-buc-thu-nac-danh-me-ruot-bi-giau-kin",
    label: "Nhà trẻ song ngữ / bức thư nặc danh / mẹ ruột bị giấu kín",
    slug: "nha-tre-song-ngu-buc-thu-nac-danh-me-ruot-bi-giau-kin",
  },
  {
    key: "g-phong-bao-mau-manh-giay-trong-sach-ban-sao-hop-dong-bien-mat",
    label: "Phòng bảo mẫu / mảnh giấy trong sách / bản sao hợp đồng biến mất",
    slug: "phong-bao-mau-manh-giay-trong-sach-ban-sao-hop-dong-bien-mat",
  },
  {
    key: "g-cong-vien-mua-dem-anh-dinh-vi-khach-san-dan-xep-bi-boc-phot",
    label: "Công viên mưa đêm / ảnh định vị khách sạn / dàn xếp bị bóc phốt",
    slug: "cong-vien-mua-dem-anh-dinh-vi-khach-san-dan-xep-bi-boc-phot",
  },
  {
    key: "g-cua-hang-ao-cuoi-quyet-dinh-sa-thai-thoa-thuan-ngam-bi-nghe-thay",
    label: "Cửa hàng áo cưới / quyết định sa thải / thỏa thuận ngầm bị nghe thấy",
    slug: "cua-hang-ao-cuoi-quyet-dinh-sa-thai-thoa-thuan-ngam-bi-nghe-thay",
  },
  {
    key: "g-xuong-thiet-ke-dien-thoai-bi-vo-ban-ngay-yeu-the-ban-dem-nam-quyen",
    label: "Xưởng thiết kế / điện thoại bị vỡ / ban ngày yếu thế ban đêm nắm quyền",
    slug: "xuong-thiet-ke-dien-thoai-bi-vo-ban-ngay-yeu-the-ban-dem-nam-quyen",
  },
  {
    key: "g-kho-hang-bi-mat-hoa-cuoi-gui-nham-hon-le-dao-chieu",
    label: "Kho hàng bí mật / hoa cưới gửi nhầm / hôn lễ đảo chiều",
    slug: "kho-hang-bi-mat-hoa-cuoi-gui-nham-hon-le-dao-chieu",
  },
  {
    key: "g-garage-xe-sang-hop-dong-thue-nha-thien-kim-gia-mat-cho-dua",
    label: "Garage xe sang / hợp đồng thuê nhà / thiên kim giả mất chỗ dựa",
    slug: "garage-xe-sang-hop-dong-thue-nha-thien-kim-gia-mat-cho-dua",
  },
  {
    key: "g-cabin-xe-rieng-thuoc-bi-doi-dam-dong-chung-kien-va-mat",
    label: "Cabin xe riêng / thuốc bị đổi / đám đông chứng kiến vả mặt",
    slug: "cabin-xe-rieng-thuoc-bi-doi-dam-dong-chung-kien-va-mat",
  },
  {
    key: "g-duong-cao-toc-dem-the-nhan-vien-cu-nguoi-chong-tuong-thang-lai-thua",
    label: "Đường cao tốc đêm / thẻ nhân viên cũ / người chồng tưởng thắng lại thua",
    slug: "duong-cao-toc-dem-the-nhan-vien-cu-nguoi-chong-tuong-thang-lai-thua",
  },
  {
    key: "g-tram-dung-chan-hop-dong-hon-nhan-nguoi-im-lang-moi-la-chu-muu",
    label: "Trạm dừng chân / hợp đồng hôn nhân / người im lặng mới là chủ mưu",
    slug: "tram-dung-chan-hop-dong-hon-nhan-nguoi-im-lang-moi-la-chu-muu",
  },
  {
    key: "g-nha-ga-san-bay-anh-chup-man-hinh-sep-cu-gap-lai-than-phan-moi",
    label: "Nhà ga sân bay / ảnh chụp màn hình / sếp cũ gặp lại thân phận mới",
    slug: "nha-ga-san-bay-anh-chup-man-hinh-sep-cu-gap-lai-than-phan-moi",
  },
  {
    key: "g-khach-san-suoi-nuoc-nong-vali-khoa-so-nguoi-bi-khinh-that-ra-nam-quyen",
    label: "Khách sạn suối nước nóng / vali khóa số / người bị khinh thật ra nắm quyền",
    slug: "khach-san-suoi-nuoc-nong-vali-khoa-so-nguoi-bi-khinh-that-ra-nam-quyen",
  },
  {
    key: "g-phong-tra-rieng-di-chuc-viet-tay-nguoi-giup-viec-giu-bi-mat",
    label: "Phòng trà riêng / di chúc viết tay / người giúp việc giữ bí mật",
    slug: "phong-tra-rieng-di-chuc-viet-tay-nguoi-giup-viec-giu-bi-mat",
  },
  {
    key: "g-lau-tra-co-thiep-cuoi-bi-giau-tai-san-doi-chu",
    label: "Lầu trà cổ / thiệp cưới bị giấu / tài sản đổi chủ",
    slug: "lau-tra-co-thiep-cuoi-bi-giau-tai-san-doi-chu",
  },
  {
    key: "g-nha-hang-tren-cao-mat-khau-ket-sat-loi-noi-doi-bi-pha-ngay-tai-tiec",
    label: "Nhà hàng trên cao / mật khẩu két sắt / lời nói dối bị phá ngay tại tiệc",
    slug: "nha-hang-tren-cao-mat-khau-ket-sat-loi-noi-doi-bi-pha-ngay-tai-tiec",
  },
  {
    key: "g-rooftop-bar-vong-co-thua-ke-nguoi-thua-ke-nu-doat-quyen",
    label: "Rooftop bar / vòng cổ thừa kế / người thừa kế nữ đoạt quyền",
    slug: "rooftop-bar-vong-co-thua-ke-nguoi-thua-ke-nu-doat-quyen",
  },
  {
    key: "g-sanh-tap-doan-ban-thu-am-phong-hop-gia-quy-phan-lai-nguoi-cam-quyen",
    label: "Sảnh tập đoàn / bản thu âm phòng họp / gia quy phản lại người cầm quyền",
    slug: "sanh-tap-doan-ban-thu-am-phong-hop-gia-quy-phan-lai-nguoi-cam-quyen",
  },
  {
    key: "g-phong-chu-tich-giay-uy-quyen-gia-ly-hon-cong-bo-dung-luc",
    label: "Phòng chủ tịch / giấy ủy quyền giả / ly hôn công bố đúng lúc",
    slug: "phong-chu-tich-giay-uy-quyen-gia-ly-hon-cong-bo-dung-luc",
  },
  {
    key: "g-van-phong-thu-ky-tep-anh-phuc-hoi-nguoi-da-chet-bat-ngo-xuat-hien",
    label: "Văn phòng thư ký / tệp ảnh phục hồi / người đã chết bất ngờ xuất hiện",
    slug: "van-phong-thu-ky-tep-anh-phuc-hoi-nguoi-da-chet-bat-ngo-xuat-hien",
  },
  {
    key: "g-phong-nhan-su-danh-sach-khach-moi-hop-dong-gia-thanh-that",
    label: "Phòng nhân sự / danh sách khách mời / hợp đồng giả thành thật",
    slug: "phong-nhan-su-danh-sach-khach-moi-hop-dong-gia-thanh-that",
  },
  {
    key: "g-phong-tai-chinh-camera-thang-may-hoi-dong-quan-tri-doi-phe",
    label: "Phòng tài chính / camera thang máy / hội đồng quản trị đổi phe",
    slug: "phong-tai-chinh-camera-thang-may-hoi-dong-quan-tri-doi-phe",
  },
  {
    key: "g-phong-phap-che-mau-toc-xet-nghiem-danh-phan-bi-tra-lai",
    label: "Phòng pháp chế / mẫu tóc xét nghiệm / danh phận bị trả lại",
    slug: "phong-phap-che-mau-toc-xet-nghiem-danh-phan-bi-tra-lai",
  },
  {
    key: "g-kho-luu-tru-cong-ty-cuc-ao-roi-dem-tuyet-thanh-toan-no-cu",
    label: "Kho lưu trữ công ty / cúc áo rơi / đêm tuyết thanh toán nợ cũ",
    slug: "kho-luu-tru-cong-ty-cuc-ao-roi-dem-tuyet-thanh-toan-no-cu",
  },
  {
    key: "g-phong-ho-so-benh-vien-ban-nhap-thong-cao-phien-dich-nghe-len-bi-mat",
    label: "Phòng hồ sơ bệnh viện / bản nháp thông cáo / phiên dịch nghe lén bí mật",
    slug: "phong-ho-so-benh-vien-ban-nhap-thong-cao-phien-dich-nghe-len-bi-mat",
  },
  {
    key: "g-phong-cham-soc-tre-so-sinh-ma-phong-vip-nguoi-thua-ke-that-tro-ve",
    label: "Phòng chăm sóc trẻ sơ sinh / mã phòng VIP / người thừa kế thật trở về",
    slug: "phong-cham-soc-tre-so-sinh-ma-phong-vip-nguoi-thua-ke-that-tro-ve",
  },
  {
    key: "g-hanh-lang-benh-vien-ve-may-bay-mot-chieu-bac-si-bi-mua-chuoc",
    label: "Hành lang bệnh viện / vé máy bay một chiều / bác sĩ bị mua chuộc",
    slug: "hanh-lang-benh-vien-ve-may-bay-mot-chieu-bac-si-bi-mua-chuoc",
  },
  {
    key: "g-nha-nguyen-nho-sao-ke-ngan-hang-phong-vip-lo-giao-dich",
    label: "Nhà nguyện nhỏ / sao kê ngân hàng / phòng VIP lộ giao dịch",
    slug: "nha-nguyen-nho-sao-ke-ngan-hang-phong-vip-lo-giao-dich",
  },
  {
    key: "g-bai-bien-luc-binh-minh-phieu-xet-nghiem-doi-ten-cuoc-goi-cuoi-lam-lo-h",
    label: "Bãi biển lúc bình minh / phiếu xét nghiệm đổi tên / cuộc gọi cuối làm lộ hung thủ",
    slug: "bai-bien-luc-binh-minh-phieu-xet-nghiem-doi-ten-cuoc-goi-cuoi-lam-lo-hung-thu",
  },
  {
    key: "g-doi-tuyet-email-noi-bo-bang-chung-bi-trao-lan-hai",
    label: "Đồi tuyết / email nội bộ / bằng chứng bị tráo lần hai",
    slug: "doi-tuyet-email-noi-bo-bang-chung-bi-trao-lan-hai",
  },
  {
    key: "g-le-hoi-phao-hoa-buc-tranh-bi-che-di-san-co-dieu-kien",
    label: "Lễ hội pháo hoa / bức tranh bị che / di sản có điều kiện",
    slug: "le-hoi-phao-hoa-buc-tranh-bi-che-di-san-co-dieu-kien",
  },
  {
    key: "g-cho-hoa-tet-hop-dong-quang-cao-den-gia-chet-tro-ve-tra-thu",
    label: "Chợ hoa Tết / hợp đồng quảng cáo đen / giả chết trở về trả thù",
    slug: "cho-hoa-tet-hop-dong-quang-cao-den-gia-chet-tro-ve-tra-thu",
  },
  {
    key: "g-san-sau-biet-thu-bao-hiem-nguoi-thu-huong-gia-toc-che-giau-than-phan",
    label: "Sân sau biệt thự / bảo hiểm người thụ hưởng / gia tộc che giấu thân phận",
    slug: "san-sau-biet-thu-bao-hiem-nguoi-thu-huong-gia-toc-che-giau-than-phan",
  },
  {
    key: "g-vuon-kinh-bien-ban-hoi-dong-lien-hon-tro-thanh-cai-bay",
    label: "Vườn kính / biên bản hội đồng / liên hôn trở thành cái bẫy",
    slug: "vuon-kinh-bien-ban-hoi-dong-lien-hon-tro-thanh-cai-bay",
  },
  {
    key: "g-nha-kinh-trong-hoa-the-nho-camera-doi-thu-tu-sa-bay",
    label: "Nhà kính trồng hoa / thẻ nhớ camera / đối thủ tự sa bẫy",
    slug: "nha-kinh-trong-hoa-the-nho-camera-doi-thu-tu-sa-bay",
  },
  {
    key: "g-trai-ngua-hoa-don-trang-suc-nguoi-ngheo-gia-giau-that",
    label: "Trại ngựa / hóa đơn trang sức / người nghèo giả giàu thật",
    slug: "trai-ngua-hoa-don-trang-suc-nguoi-ngheo-gia-giau-that",
  },
  {
    key: "g-san-golf-hao-mon-anh-sieu-am-tet-doan-vien-va-mat-ho-hang",
    label: "Sân golf hào môn / ảnh siêu âm / Tết đoàn viên vả mặt họ hàng",
    slug: "san-golf-hao-mon-anh-sieu-am-tet-doan-vien-va-mat-ho-hang",
  },
  {
    key: "g-phong-piano-son-moi-tren-ly-tiep-vien-giu-chuyen-bay-cuoi",
    label: "Phòng piano / son môi trên ly / tiếp viên giữ chuyến bay cuối",
    slug: "phong-piano-son-moi-tren-ly-tiep-vien-giu-chuyen-bay-cuoi",
  },
  {
    key: "g-phong-tranh-rieng-doan-chat-nhom-gia-dinh-tieu-tam-tu-lo-so-ho",
    label: "Phòng tranh riêng / đoạn chat nhóm gia đình / tiểu tam tự lộ sơ hở",
    slug: "phong-tranh-rieng-doan-chat-nhom-gia-dinh-tieu-tam-tu-lo-so-ho",
  },
  {
    key: "g-khoang-thang-may-rieng-anh-camera-bai-xe-luat-su-tung-bang-chung",
    label: "Khoang thang máy riêng / ảnh camera bãi xe / luật sư tung bằng chứng",
    slug: "khoang-thang-may-rieng-anh-camera-bai-xe-luat-su-tung-bang-chung",
  },
  {
    key: "g-can-ho-bi-mat-video-camera-hanh-lang-camera-mat-bay-phut",
    label: "Căn hộ bí mật / video camera hành lang / camera mất bảy phút",
    slug: "can-ho-bi-mat-video-camera-hanh-lang-camera-mat-bay-phut",
  },
  {
    key: "g-nha-an-toan-hoa-don-minibar-bao-hiem-he-am-muu",
    label: "Nhà an toàn / hóa đơn minibar / bảo hiểm hé âm mưu",
    slug: "nha-an-toan-hoa-don-minibar-bao-hiem-he-am-muu",
  },
  {
    key: "g-phong-giam-sat-camera-vong-tay-tre-so-sinh-tin-nhan-gui-nham-cuu-mang",
    label: "Phòng giám sát camera / vòng tay trẻ sơ sinh / tin nhắn gửi nhầm cứu mạng",
    slug: "phong-giam-sat-camera-vong-tay-tre-so-sinh-tin-nhan-gui-nham-cuu-mang",
  },
  {
    key: "g-trung-tam-du-lieu-anh-cuoi-bi-cat-cap-song-sinh-trao-than-phan",
    label: "Trung tâm dữ liệu / ảnh cưới bị cắt / cặp song sinh tráo thân phận",
    slug: "trung-tam-du-lieu-anh-cuoi-bi-cat-cap-song-sinh-trao-than-phan",
  },
  {
    key: "g-dai-truyen-hinh-nhat-ky-cu-ky-uc-quay-lai-dung-phien-toa",
    label: "Đài truyền hình / nhật ký cũ / ký ức quay lại đúng phiên tòa",
    slug: "dai-truyen-hinh-nhat-ky-cu-ky-uc-quay-lai-dung-phien-toa",
  },
  {
    key: "g-phong-bien-tap-ban-thiet-ke-goc-co-phan-bi-chuyen-nguoc",
    label: "Phòng biên tập / bản thiết kế gốc / cổ phần bị chuyển ngược",
    slug: "phong-bien-tap-ban-thiet-ke-goc-co-phan-bi-chuyen-nguoc",
  },
  {
    key: "g-van-phong-kol-camera-phong-tre-nguoi-bao-ve-la-dai-thieu-gia",
    label: "Văn phòng KOL / camera phòng trẻ / người bảo vệ là đại thiếu gia",
    slug: "van-phong-kol-camera-phong-tre-nguoi-bao-ve-la-dai-thieu-gia",
  },
  {
    key: "g-studio-podcast-bang-luong-bi-mat-moi-tinh-cu-thanh-nhan-chung",
    label: "Studio podcast / bảng lương bí mật / mối tình cũ thành nhân chứng",
    slug: "studio-podcast-bang-luong-bi-mat-moi-tinh-cu-thanh-nhan-chung",
  },
  {
    key: "g-san-khau-trao-giai-laptop-bi-khoa-bi-sa-thai-roi-quay-lai-lam-sep",
    label: "Sân khấu trao giải / laptop bị khóa / bị sa thải rồi quay lại làm sếp",
    slug: "san-khau-trao-giai-laptop-bi-khoa-bi-sa-thai-roi-quay-lai-lam-sep",
  },
  {
    key: "g-buoi-thu-vai-hop-qua-sinh-nhat-mon-qua-phan-boi-bi-mo-ra",
    label: "Buổi thử vai / hộp quà sinh nhật / món quà phản bội bị mở ra",
    slug: "buoi-thu-vai-hop-qua-sinh-nhat-mon-qua-phan-boi-bi-mo-ra",
  },
  {
    key: "g-phong-casting-giay-bao-no-hai-than-phan-va-vao-nhau",
    label: "Phòng casting / giấy báo nợ / hai thân phận va vào nhau",
    slug: "phong-casting-giay-bao-no-hai-than-phan-va-vao-nhau",
  },
  {
    key: "g-hau-truong-concert-toa-thuoc-gia-chong-cu-muon-mang-hoi-han",
    label: "Hậu trường concert / toa thuốc giả / chồng cũ muộn màng hối hận",
    slug: "hau-truong-concert-toa-thuoc-gia-chong-cu-muon-mang-hoi-han",
  },
  {
    key: "g-phong-tap-vu-dao-bien-so-xe-la-thien-kim-that-lat-mat",
    label: "Phòng tập vũ đạo / biển số xe lạ / thiên kim thật lật mặt",
    slug: "phong-tap-vu-dao-bien-so-xe-la-thien-kim-that-lat-mat",
  },
  {
    key: "g-san-dau-gia-co-vat-don-nhan-nuoi-thu-cu-mo-khoa-bi-mat",
    label: "Sàn đấu giá cổ vật / đơn nhận nuôi / thư cũ mở khóa bí mật",
    slug: "san-dau-gia-co-vat-don-nhan-nuoi-thu-cu-mo-khoa-bi-mat",
  },
  {
    key: "g-bao-tang-tu-nhan-tin-nhan-nua-dem-nu-chinh-roi-di-dung-luc",
    label: "Bảo tàng tư nhân / tin nhắn nửa đêm / nữ chính rời đi đúng lúc",
    slug: "bao-tang-tu-nhan-tin-nhan-nua-dem-nu-chinh-roi-di-dung-luc",
  },
  {
    key: "g-tu-bao-hiem-ngan-hang-ho-chieu-gia-ke-tong-tien-bi-phan-bay",
    label: "Tủ bảo hiểm ngân hàng / hộ chiếu giả / kẻ tống tiền bị phản bẫy",
    slug: "tu-bao-hiem-ngan-hang-ho-chieu-gia-ke-tong-tien-bi-phan-bay",
  },
  {
    key: "g-phong-ket-biet-thu-giay-khai-sinh-cu-bao-luc-mang-bi-dao-chieu",
    label: "Phòng két biệt thự / giấy khai sinh cũ / bạo lực mạng bị đảo chiều",
    slug: "phong-ket-biet-thu-giay-khai-sinh-cu-bao-luc-mang-bi-dao-chieu",
  },
  {
    key: "g-kho-do-cu-nhan-cuoi-khac-ten-nu-giao-vien-lat-lai-su-that",
    label: "Kho đồ cũ / nhẫn cưới khắc tên / nữ giáo viên lật lại sự thật",
    slug: "kho-do-cu-nhan-cuoi-khac-ten-nu-giao-vien-lat-lai-su-that",
  },
  {
    key: "g-nha-kho-cang-bien-chia-khoa-phong-cam-truyen-thong-bi-phan-don",
    label: "Nhà kho cảng biển / chìa khóa phòng cấm / truyền thông bị phản đòn",
    slug: "nha-kho-cang-bien-chia-khoa-phong-cam-truyen-thong-bi-phan-don",
  },
  {
    key: "g-cang-du-thuyen-dong-ho-co-me-ruot-bi-giau-kin",
    label: "Cảng du thuyền / đồng hồ cổ / mẹ ruột bị giấu kín",
    slug: "cang-du-thuyen-dong-ho-co-me-ruot-bi-giau-kin",
  },
  {
    key: "g-phong-cho-luat-su-lich-su-dinh-vi-ban-sao-hop-dong-bien-mat",
    label: "Phòng chờ luật sư / lịch sử định vị / bản sao hợp đồng biến mất",
    slug: "phong-cho-luat-su-lich-su-dinh-vi-ban-sao-hop-dong-bien-mat",
  },
  {
    key: "g-trai-giam-tham-gap-ho-so-nhan-su-dan-xep-bi-boc-phot",
    label: "Trại giam thăm gặp / hồ sơ nhân sự / dàn xếp bị bóc phốt",
    slug: "trai-giam-tham-gap-ho-so-nhan-su-dan-xep-bi-boc-phot",
  },
  {
    key: "g-phong-hoa-giai-sim-dien-thoai-cu-thoa-thuan-ngam-bi-nghe-thay",
    label: "Phòng hòa giải / sim điện thoại cũ / thỏa thuận ngầm bị nghe thấy",
    slug: "phong-hoa-giai-sim-dien-thoai-cu-thoa-thuan-ngam-bi-nghe-thay",
  },
  {
    key: "g-van-phong-cong-chung-ghe-trong-trong-tiec-ban-ngay-yeu-the-ban-dem-nam",
    label: "Văn phòng công chứng / ghế trống trong tiệc / ban ngày yếu thế ban đêm nắm quyền",
    slug: "van-phong-cong-chung-ghe-trong-trong-tiec-ban-ngay-yeu-the-ban-dem-nam-quyen",
  },
  {
    key: "g-phong-dang-ky-ket-hon-log-ra-vao-toa-nha-hon-le-dao-chieu",
    label: "Phòng đăng ký kết hôn / log ra vào tòa nhà / hôn lễ đảo chiều",
    slug: "phong-dang-ky-ket-hon-log-ra-vao-toa-nha-hon-le-dao-chieu",
  },
  {
    key: "g-cuc-ho-tich-bang-gac-co-dau-vet-thien-kim-gia-mat-cho-dua",
    label: "Cục hộ tịch / băng gạc có dấu vết / thiên kim giả mất chỗ dựa",
    slug: "cuc-ho-tich-bang-gac-co-dau-vet-thien-kim-gia-mat-cho-dua",
  },
  {
    key: "g-phong-bao-hiem-giay-cao-got-gay-dam-dong-chung-kien-va-mat",
    label: "Phòng bảo hiểm / giày cao gót gãy / đám đông chứng kiến vả mặt",
    slug: "phong-bao-hiem-giay-cao-got-gay-dam-dong-chung-kien-va-mat",
  },
  {
    key: "g-trung-tam-xet-nghiem-lich-hen-bac-si-nguoi-chong-tuong-thang-lai-thua",
    label: "Trung tâm xét nghiệm / lịch hẹn bác sĩ / người chồng tưởng thắng lại thua",
    slug: "trung-tam-xet-nghiem-lich-hen-bac-si-nguoi-chong-tuong-thang-lai-thua",
  },
  {
    key: "g-nha-khach-gia-toc-hop-dong-bao-mat-nguoi-im-lang-moi-la-chu-muu",
    label: "Nhà khách gia tộc / hợp đồng bảo mật / người im lặng mới là chủ mưu",
    slug: "nha-khach-gia-toc-hop-dong-bao-mat-nguoi-im-lang-moi-la-chu-muu",
  },
  {
    key: "g-khu-duong-lao-cao-cap-boarding-pass-bi-xe-sep-cu-gap-lai-than-phan-moi",
    label: "Khu dưỡng lão cao cấp / boarding pass bị xé / sếp cũ gặp lại thân phận mới",
    slug: "khu-duong-lao-cao-cap-boarding-pass-bi-xe-sep-cu-gap-lai-than-phan-moi",
  },
  {
    key: "g-phong-cham-soc-dac-biet-hop-dong-co-phan-nguoi-bi-khinh-that-ra-nam-qu",
    label: "Phòng chăm sóc đặc biệt / hợp đồng cổ phần / người bị khinh thật ra nắm quyền",
    slug: "phong-cham-soc-dac-biet-hop-dong-co-phan-nguoi-bi-khinh-that-ra-nam-quyen",
  },
  {
    key: "g-nha-hang-tiec-cuoi-don-ly-hon-chua-ky-nhan-chung-doi-phe",
    label: "Nhà hàng tiệc cưới / đơn ly hôn chưa ký / nhân chứng đổi phe",
    slug: "nha-hang-tiec-cuoi-don-ly-hon-chua-ky-nhan-chung-doi-phe",
  },
  {
    key: "g-phong-co-dau-file-cloud-bi-xoa-ke-dung-sau-la-nguoi-than",
    label: "Phòng cô dâu / file cloud bị xóa / kẻ đứng sau là người thân",
    slug: "phong-co-dau-file-cloud-bi-xoa-ke-dung-sau-la-nguoi-than",
  },
  {
    key: "g-phong-chu-re-tin-vat-gia-toc-dau-vet-nho-lat-an",
    label: "Phòng chú rể / tín vật gia tộc / dấu vết nhỏ lật án",
    slug: "phong-chu-re-tin-vat-gia-toc-dau-vet-nho-lat-an",
  },
  {
    key: "g-sanh-chung-cu-dem-clip-hau-truong-dong-sang-lap-phan-boi-bi-loai",
    label: "Sảnh chung cư đêm / clip hậu trường / đồng sáng lập phản bội bị loại",
    slug: "sanh-chung-cu-dem-clip-hau-truong-dong-sang-lap-phan-boi-bi-loai",
  },
  {
    key: "g-ban-cong-tang-cao-don-to-cao-bi-giau-bi-mat-chim-noi-len",
    label: "Ban công tầng cao / đơn tố cáo bị giấu / bí mật chìm nổi lên",
    slug: "ban-cong-tang-cao-don-to-cao-bi-giau-bi-mat-chim-noi-len",
  },
  {
    key: "g-cau-thang-thoat-hiem-ma-ket-sat-co-dau-bo-tron-phan-don",
    label: "Cầu thang thoát hiểm / mã két sắt / cô dâu bỏ trốn phản đòn",
    slug: "cau-thang-thoat-hiem-ma-ket-sat-co-dau-bo-tron-phan-don",
  },
  {
    key: "g-hanh-lang-khach-san-ma-qr-ve-su-kien-dua-tre-khong-phai-con-ruot",
    label: "Hành lang khách sạn / mã QR vé sự kiện / đứa trẻ không phải con ruột",
    slug: "hanh-lang-khach-san-ma-qr-ve-su-kien-dua-tre-khong-phai-con-ruot",
  },
  {
    key: "g-phong-camera-khach-san-phieu-gui-do-nguoi-cu-tro-ve-dung-luc",
    label: "Phòng camera khách sạn / phiếu gửi đồ / người cũ trở về đúng lúc",
    slug: "phong-camera-khach-san-phieu-gui-do-nguoi-cu-tro-ve-dung-luc",
  },
  {
    key: "g-quay-le-tan-so-kham-thai-nguoi-quy-goi-xin-loi",
    label: "Quầy lễ tân / sổ khám thai / người quỳ gối xin lỗi",
    slug: "quay-le-tan-so-kham-thai-nguoi-quy-goi-xin-loi",
  },
  {
    key: "g-phong-giat-la-khan-lua-bo-quen-vi-hon-phu-bi-thay-the",
    label: "Phòng giặt là / khăn lụa bỏ quên / vị hôn phu bị thay thế",
    slug: "phong-giat-la-khan-lua-bo-quen-vi-hon-phu-bi-thay-the",
  },
  {
    key: "g-kho-ruou-nha-hang-bai-dang-hot-search-dem-mua-doi-so-phan",
    label: "Kho rượu nhà hàng / bài đăng hot search / đêm mưa đổi số phận",
    slug: "kho-ruou-nha-hang-bai-dang-hot-search-dem-mua-doi-so-phan",
  },
  {
    key: "g-san-thuong-mua-bien-lai-nha-hang-nguoi-bi-vu-oan-cuu-ca-gia-toc",
    label: "Sân thượng mưa / biên lai nhà hàng / người bị vu oan cứu cả gia tộc",
    slug: "san-thuong-mua-bien-lai-nha-hang-nguoi-bi-vu-oan-cuu-ca-gia-toc",
  },
  {
    key: "g-ga-tau-cu-camera-hanh-trinh-ke-phan-boi-bi-ghi-am",
    label: "Ga tàu cũ / camera hành trình / kẻ phản bội bị ghi âm",
    slug: "ga-tau-cu-camera-hanh-trinh-ke-phan-boi-bi-ghi-am",
  },
  {
    key: "g-chuyen-tau-dem-bien-lai-chuyen-khoan-nguoi-giup-viec-giu-bi-mat",
    label: "Chuyến tàu đêm / biên lai chuyển khoản / người giúp việc giữ bí mật",
    slug: "chuyen-tau-dem-bien-lai-chuyen-khoan-nguoi-giup-viec-giu-bi-mat",
  },
  {
    key: "g-ben-xe-lien-tinh-benh-an-bi-sua-tai-san-doi-chu",
    label: "Bến xe liên tỉnh / bệnh án bị sửa / tài sản đổi chủ",
    slug: "ben-xe-lien-tinh-benh-an-bi-sua-tai-san-doi-chu",
  },
  {
    key: "g-phong-cho-vip-usb-du-lieu-mat-loi-noi-doi-bi-pha-ngay-tai-tiec",
    label: "Phòng chờ VIP / USB dữ liệu mật / lời nói dối bị phá ngay tại tiệc",
    slug: "phong-cho-vip-usb-du-lieu-mat-loi-noi-doi-bi-pha-ngay-tai-tiec",
  },
  {
    key: "g-cua-khau-so-tay-cua-me-bang-chung-bi-trao-lan-hai",
    label: "Cửa khẩu / sổ tay của mẹ / bằng chứng bị tráo lần hai",
    slug: "cua-khau-so-tay-cua-me-bang-chung-bi-trao-lan-hai",
  },
  {
    key: "g-lanh-su-quan-mau-vai-bi-danh-trao-di-san-co-dieu-kien",
    label: "Lãnh sự quán / mẫu vải bị đánh tráo / di sản có điều kiện",
    slug: "lanh-su-quan-mau-vai-bi-danh-trao-di-san-co-dieu-kien",
  },
  {
    key: "g-van-phong-phien-dich-do-choi-co-may-ghi-am-gia-chet-tro-ve-tra-thu",
    label: "Văn phòng phiên dịch / đồ chơi có máy ghi âm / giả chết trở về trả thù",
    slug: "van-phong-phien-dich-do-choi-co-may-ghi-am-gia-chet-tro-ve-tra-thu",
  },
  {
    key: "g-phong-hop-quoc-te-so-co-dong-gia-toc-che-giau-than-phan",
    label: "Phòng họp quốc tế / sổ cổ đông / gia tộc che giấu thân phận",
    slug: "phong-hop-quoc-te-so-co-dong-gia-toc-che-giau-than-phan",
  },
  {
    key: "g-hoi-cho-thuong-mai-o-cung-di-dong-lien-hon-tro-thanh-cai-bay",
    label: "Hội chợ thương mại / ổ cứng di động / liên hôn trở thành cái bẫy",
    slug: "hoi-cho-thuong-mai-o-cung-di-dong-lien-hon-tro-thanh-cai-bay",
  },
  {
    key: "g-nha-may-gia-dinh-thiep-chuc-mung-la-doi-thu-tu-sa-bay",
    label: "Nhà máy gia đình / thiệp chúc mừng lạ / đối thủ tự sa bẫy",
    slug: "nha-may-gia-dinh-thiep-chuc-mung-la-doi-thu-tu-sa-bay",
  },
  {
    key: "g-xuong-may-thoa-thuan-tien-chuoc-nguoi-ngheo-gia-giau-that",
    label: "Xưởng may / thỏa thuận tiền chuộc / người nghèo giả giàu thật",
    slug: "xuong-may-thoa-thuan-tien-chuoc-nguoi-ngheo-gia-giau-that",
  },
  {
    key: "g-kho-lanh-lo-nuoc-hoa-la-tet-doan-vien-va-mat-ho-hang",
    label: "Kho lạnh / lọ nước hoa lạ / Tết đoàn viên vả mặt họ hàng",
    slug: "kho-lanh-lo-nuoc-hoa-la-tet-doan-vien-va-mat-ho-hang",
  },
  {
    key: "g-trang-trai-ngoai-o-ve-gui-xe-tiep-vien-giu-chuyen-bay-cuoi",
    label: "Trang trại ngoại ô / vé gửi xe / tiếp viên giữ chuyến bay cuối",
    slug: "trang-trai-ngoai-o-ve-gui-xe-tiep-vien-giu-chuyen-bay-cuoi",
  },
  {
    key: "g-nha-tho-hon-le-giay-chung-tu-nghi-van-tieu-tam-tu-lo-so-ho",
    label: "Nhà thờ hôn lễ / giấy chứng tử nghi vấn / tiểu tam tự lộ sơ hở",
    slug: "nha-tho-hon-le-giay-chung-tu-nghi-van-tieu-tam-tu-lo-so-ho",
  },
  {
    key: "g-san-truong-cu-ghi-am-cuoc-goi-luat-su-tung-bang-chung",
    label: "Sân trường cũ / ghi âm cuộc gọi / luật sư tung bằng chứng",
    slug: "san-truong-cu-ghi-am-cuoc-goi-luat-su-tung-bang-chung",
  },
  {
    key: "g-thu-vien-dai-hoc-the-phong-khach-san-camera-mat-bay-phut",
    label: "Thư viện đại học / thẻ phòng khách sạn / camera mất bảy phút",
    slug: "thu-vien-dai-hoc-the-phong-khach-san-camera-mat-bay-phut",
  },
  {
    key: "g-phong-y-te-truong-ket-qua-adn-bao-hiem-he-am-muu",
    label: "Phòng y tế trường / kết quả ADN / bảo hiểm hé âm mưu",
    slug: "phong-y-te-truong-ket-qua-adn-bao-hiem-he-am-muu",
  },
  {
    key: "g-phong-hieu-truong-vay-cuoi-rach-tin-nhan-gui-nham-cuu-mang",
    label: "Phòng hiệu trưởng / váy cưới rách / tin nhắn gửi nhầm cứu mạng",
    slug: "phong-hieu-truong-vay-cuoi-rach-tin-nhan-gui-nham-cuu-mang",
  },
  {
    key: "g-cong-truong-luc-mua-buc-thu-nac-danh-cap-song-sinh-trao-than-phan",
    label: "Cổng trường lúc mưa / bức thư nặc danh / cặp song sinh tráo thân phận",
    slug: "cong-truong-luc-mua-buc-thu-nac-danh-cap-song-sinh-trao-than-phan",
  },
  {
    key: "g-khu-pho-cu-manh-giay-trong-sach-ky-uc-quay-lai-dung-phien-toa",
    label: "Khu phố cũ / mảnh giấy trong sách / ký ức quay lại đúng phiên tòa",
    slug: "khu-pho-cu-manh-giay-trong-sach-ky-uc-quay-lai-dung-phien-toa",
  },
  {
    key: "g-tiem-anh-cu-anh-dinh-vi-khach-san-co-phan-bi-chuyen-nguoc",
    label: "Tiệm ảnh cũ / ảnh định vị khách sạn / cổ phần bị chuyển ngược",
    slug: "tiem-anh-cu-anh-dinh-vi-khach-san-co-phan-bi-chuyen-nguoc",
  },
  {
    key: "g-tiem-sua-dien-thoai-quyet-dinh-sa-thai-nguoi-bao-ve-la-dai-thieu-gia",
    label: "Tiệm sửa điện thoại / quyết định sa thải / người bảo vệ là đại thiếu gia",
    slug: "tiem-sua-dien-thoai-quyet-dinh-sa-thai-nguoi-bao-ve-la-dai-thieu-gia",
  },
  {
    key: "g-cua-hang-dong-ho-dien-thoai-bi-vo-moi-tinh-cu-thanh-nhan-chung",
    label: "Cửa hàng đồng hồ / điện thoại bị vỡ / mối tình cũ thành nhân chứng",
    slug: "cua-hang-dong-ho-dien-thoai-bi-vo-moi-tinh-cu-thanh-nhan-chung",
  },
  {
    key: "g-tiem-banh-gia-dinh-hoa-cuoi-gui-nham-bi-sa-thai-roi-quay-lai-lam-sep",
    label: "Tiệm bánh gia đình / hoa cưới gửi nhầm / bị sa thải rồi quay lại làm sếp",
    slug: "tiem-banh-gia-dinh-hoa-cuoi-gui-nham-bi-sa-thai-roi-quay-lai-lam-sep",
  },
  {
    key: "g-quan-an-dem-hop-dong-thue-nha-mon-qua-phan-boi-bi-mo-ra",
    label: "Quán ăn đêm / hợp đồng thuê nhà / món quà phản bội bị mở ra",
    slug: "quan-an-dem-hop-dong-thue-nha-mon-qua-phan-boi-bi-mo-ra",
  },
  {
    key: "g-phong-karaoke-rieng-thuoc-bi-doi-ve-si-che-giau-than-phan",
    label: "Phòng karaoke riêng / thuốc bị đổi / vệ sĩ che giấu thân phận",
    slug: "phong-karaoke-rieng-thuoc-bi-doi-ve-si-che-giau-than-phan",
  },
  {
    key: "g-ktv-hao-mon-the-nhan-vien-cu-me-chong-bi-phan-don",
    label: "KTV hào môn / thẻ nhân viên cũ / mẹ chồng bị phản đòn",
    slug: "ktv-hao-mon-the-nhan-vien-cu-me-chong-bi-phan-don",
  },
  {
    key: "g-casino-tren-du-thuyen-hop-dong-hon-nhan-nu-chinh-tu-cuu-danh-tieng",
    label: "Casino trên du thuyền / hợp đồng hôn nhân / nữ chính tự cứu danh tiếng",
    slug: "casino-tren-du-thuyen-hop-dong-hon-nhan-nu-chinh-tu-cuu-danh-tieng",
  },
  {
    key: "g-spa-cao-cap-anh-chup-man-hinh-du-lieu-bi-phuc-hoi",
    label: "Spa cao cấp / ảnh chụp màn hình / dữ liệu bị phục hồi",
    slug: "spa-cao-cap-anh-chup-man-hinh-du-lieu-bi-phuc-hoi",
  },
  {
    key: "g-phong-tri-lieu-tam-ly-vali-khoa-so-dua-tre-nhan-ra-su-that",
    label: "Phòng trị liệu tâm lý / vali khóa số / đứa trẻ nhận ra sự thật",
    slug: "phong-tri-lieu-tam-ly-vali-khoa-so-dua-tre-nhan-ra-su-that",
  },
  {
    key: "g-studio-yoga-di-chuc-viet-tay-loi-canh-bao-thanh-su-that",
    label: "Studio yoga / di chúc viết tay / lời cảnh báo thành sự thật",
    slug: "studio-yoga-di-chuc-viet-tay-loi-canh-bao-thanh-su-that",
  },
  {
    key: "g-phong-hop-bi-mat-thiep-cuoi-bi-giau-co-gai-que-la-chu-tich-an-danh",
    label: "Phòng họp bí mật / thiệp cưới bị giấu / cô gái quê là chủ tịch ẩn danh",
    slug: "phong-hop-bi-mat-thiep-cuoi-bi-giau-co-gai-que-la-chu-tich-an-danh",
  },
  {
    key: "g-can-phong-khoa-trai-mat-khau-ket-sat-nu-bac-si-tu-minh-oan",
    label: "Căn phòng khóa trái / mật khẩu két sắt / nữ bác sĩ tự minh oan",
    slug: "can-phong-khoa-trai-mat-khau-ket-sat-nu-bac-si-tu-minh-oan",
  },
  {
    key: "g-tang-ap-mai-vong-co-thua-ke-hot-search-quay-xe",
    label: "Tầng áp mái / vòng cổ thừa kế / hot search quay xe",
    slug: "tang-ap-mai-vong-co-thua-ke-hot-search-quay-xe",
  },
  {
    key: "g-tang-ham-biet-thu-ban-thu-am-phong-hop-cha-ruot-xuat-hien",
    label: "Tầng hầm biệt thự / bản thu âm phòng họp / cha ruột xuất hiện",
    slug: "tang-ham-biet-thu-ban-thu-am-phong-hop-cha-ruot-xuat-hien",
  },
  {
    key: "g-loi-thoat-hiem-giay-uy-quyen-gia-nguoi-mat-tich-quay-ve",
    label: "Lối thoát hiểm / giấy ủy quyền giả / người mất tích quay về",
    slug: "loi-thoat-hiem-giay-uy-quyen-gia-nguoi-mat-tich-quay-ve",
  },
  {
    key: "g-san-sau-benh-vien-tep-anh-phuc-hoi-ban-quyen-duoc-chung-minh",
    label: "Sân sau bệnh viện / tệp ảnh phục hồi / bản quyền được chứng minh",
    slug: "san-sau-benh-vien-tep-anh-phuc-hoi-ban-quyen-duoc-chung-minh",
  },
  {
    key: "g-nha-xac-benh-vien-danh-sach-khach-moi-khach-khong-moi-lat-mat",
    label: "Nhà xác bệnh viện / danh sách khách mời / khách không mời lật mặt",
    slug: "nha-xac-benh-vien-danh-sach-khach-moi-khach-khong-moi-lat-mat",
  },
  {
    key: "g-phong-luu-mau-camera-thang-may-hai-than-phan-va-vao-nhau",
    label: "Phòng lưu mẫu / camera thang máy / hai thân phận va vào nhau",
    slug: "phong-luu-mau-camera-thang-may-hai-than-phan-va-vao-nhau",
  },
  {
    key: "g-quay-thuoc-tu-nhan-mau-toc-xet-nghiem-chong-cu-muon-mang-hoi-han",
    label: "Quầy thuốc tư nhân / mẫu tóc xét nghiệm / chồng cũ muộn màng hối hận",
    slug: "quay-thuoc-tu-nhan-mau-toc-xet-nghiem-chong-cu-muon-mang-hoi-han",
  },
  {
    key: "g-kho-ho-so-luat-su-cuc-ao-roi-thien-kim-that-lat-mat",
    label: "Kho hồ sơ luật sư / cúc áo rơi / thiên kim thật lật mặt",
    slug: "kho-ho-so-luat-su-cuc-ao-roi-thien-kim-that-lat-mat",
  },
  {
    key: "g-biet-thu-ven-ho-lich-hen-bac-si-dam-dong-chung-kien-va-mat",
    label: "Biệt thự ven hồ / lịch hẹn bác sĩ / đám đông chứng kiến vả mặt",
    slug: "biet-thu-ven-ho-lich-hen-bac-si-dam-dong-chung-kien-va-mat",
  },
  {
    key: "g-penthouse-tang-cao-hop-dong-bao-mat-nguoi-chong-tuong-thang-lai-thua",
    label: "Penthouse tầng cao / hợp đồng bảo mật / người chồng tưởng thắng lại thua",
    slug: "penthouse-tang-cao-hop-dong-bao-mat-nguoi-chong-tuong-thang-lai-thua",
  },
  {
    key: "g-phong-hop-hoi-dong-boarding-pass-bi-xe-nguoi-im-lang-moi-la-chu-muu",
    label: "Phòng họp hội đồng / boarding pass bị xé / người im lặng mới là chủ mưu",
    slug: "phong-hop-hoi-dong-boarding-pass-bi-xe-nguoi-im-lang-moi-la-chu-muu",
  },
  {
    key: "g-sanh-khach-san-5-sao-hop-dong-co-phan-sep-cu-gap-lai-than-phan-moi",
    label: "Sảnh khách sạn 5 sao / hợp đồng cổ phần / sếp cũ gặp lại thân phận mới",
    slug: "sanh-khach-san-5-sao-hop-dong-co-phan-sep-cu-gap-lai-than-phan-moi",
  },
  {
    key: "g-thang-may-kinh-don-ly-hon-chua-ky-nguoi-bi-khinh-that-ra-nam-quyen",
    label: "Thang máy kính / đơn ly hôn chưa ký / người bị khinh thật ra nắm quyền",
    slug: "thang-may-kinh-don-ly-hon-chua-ky-nguoi-bi-khinh-that-ra-nam-quyen",
  },
  {
    key: "g-bai-do-xe-tang-ham-file-cloud-bi-xoa-nhan-chung-doi-phe",
    label: "Bãi đỗ xe tầng hầm / file cloud bị xóa / nhân chứng đổi phe",
    slug: "bai-do-xe-tang-ham-file-cloud-bi-xoa-nhan-chung-doi-phe",
  },
  {
    key: "g-phong-vip-benh-vien-tin-vat-gia-toc-ke-dung-sau-la-nguoi-than",
    label: "Phòng VIP bệnh viện / tín vật gia tộc / kẻ đứng sau là người thân",
    slug: "phong-vip-benh-vien-tin-vat-gia-toc-ke-dung-sau-la-nguoi-than",
  },
  {
    key: "g-khoa-san-nua-dem-clip-hau-truong-dau-vet-nho-lat-an",
    label: "Khoa sản nửa đêm / clip hậu trường / dấu vết nhỏ lật án",
    slug: "khoa-san-nua-dem-clip-hau-truong-dau-vet-nho-lat-an",
  },
  {
    key: "g-phong-xet-nghiem-adn-don-to-cao-bi-giau-dong-sang-lap-phan-boi-bi-loai",
    label: "Phòng xét nghiệm ADN / đơn tố cáo bị giấu / đồng sáng lập phản bội bị loại",
    slug: "phong-xet-nghiem-adn-don-to-cao-bi-giau-dong-sang-lap-phan-boi-bi-loai",
  },
  {
    key: "g-nha-tang-le-ma-ket-sat-bi-mat-chim-noi-len",
    label: "Nhà tang lễ / mã két sắt / bí mật chìm nổi lên",
    slug: "nha-tang-le-ma-ket-sat-bi-mat-chim-noi-len",
  },
  {
    key: "g-le-dinh-hon-hao-mon-ma-qr-ve-su-kien-co-dau-bo-tron-phan-don",
    label: "Lễ đính hôn hào môn / mã QR vé sự kiện / cô dâu bỏ trốn phản đòn",
    slug: "le-dinh-hon-hao-mon-ma-qr-ve-su-kien-co-dau-bo-tron-phan-don",
  },
  {
    key: "g-hon-le-trong-mua-phieu-gui-do-dua-tre-khong-phai-con-ruot",
    label: "Hôn lễ trong mưa / phiếu gửi đồ / đứa trẻ không phải con ruột",
    slug: "hon-le-trong-mua-phieu-gui-do-dua-tre-khong-phai-con-ruot",
  },
  {
    key: "g-tiec-tu-thien-so-kham-thai-nguoi-cu-tro-ve-dung-luc",
    label: "Tiệc từ thiện / sổ khám thai / người cũ trở về đúng lúc",
    slug: "tiec-tu-thien-so-kham-thai-nguoi-cu-tro-ve-dung-luc",
  },
  {
    key: "g-da-tiec-dau-gia-khan-lua-bo-quen-nguoi-quy-goi-xin-loi",
    label: "Dạ tiệc đấu giá / khăn lụa bỏ quên / người quỳ gối xin lỗi",
    slug: "da-tiec-dau-gia-khan-lua-bo-quen-nguoi-quy-goi-xin-loi",
  },
  {
    key: "g-du-thuyen-dem-bai-dang-hot-search-vi-hon-phu-bi-thay-the",
    label: "Du thuyền đêm / bài đăng hot search / vị hôn phu bị thay thế",
    slug: "du-thuyen-dem-bai-dang-hot-search-vi-hon-phu-bi-thay-the",
  },
  {
    key: "g-san-bay-quoc-te-bien-lai-nha-hang-dem-mua-doi-so-phan",
    label: "Sân bay quốc tế / biên lai nhà hàng / đêm mưa đổi số phận",
    slug: "san-bay-quoc-te-bien-lai-nha-hang-dem-mua-doi-so-phan",
  },
  {
    key: "g-khoang-hang-thuong-gia-camera-hanh-trinh-nguoi-bi-vu-oan-cuu-ca-gia-to",
    label: "Khoang hạng thương gia / camera hành trình / người bị vu oan cứu cả gia tộc",
    slug: "khoang-hang-thuong-gia-camera-hanh-trinh-nguoi-bi-vu-oan-cuu-ca-gia-toc",
  },
  {
    key: "g-nha-ga-cao-toc-bien-lai-chuyen-khoan-ke-phan-boi-bi-ghi-am",
    label: "Nhà ga cao tốc / biên lai chuyển khoản / kẻ phản bội bị ghi âm",
    slug: "nha-ga-cao-toc-bien-lai-chuyen-khoan-ke-phan-boi-bi-ghi-am",
  },
  {
    key: "g-khu-nghi-duong-bien-benh-an-bi-sua-nguoi-giup-viec-giu-bi-mat",
    label: "Khu nghỉ dưỡng biển / bệnh án bị sửa / người giúp việc giữ bí mật",
    slug: "khu-nghi-duong-bien-benh-an-bi-sua-nguoi-giup-viec-giu-bi-mat",
  },
  {
    key: "g-villa-rieng-tu-usb-du-lieu-mat-tai-san-doi-chu",
    label: "Villa riêng tư / USB dữ liệu mật / tài sản đổi chủ",
    slug: "villa-rieng-tu-usb-du-lieu-mat-tai-san-doi-chu",
  },
  {
    key: "g-trung-tam-thuong-mai-so-tay-cua-me-loi-noi-doi-bi-pha-ngay-tai-tiec",
    label: "Trung tâm thương mại / sổ tay của mẹ / lời nói dối bị phá ngay tại tiệc",
    slug: "trung-tam-thuong-mai-so-tay-cua-me-loi-noi-doi-bi-pha-ngay-tai-tiec",
  },
  {
    key: "g-khu-vui-choi-tre-em-mau-vai-bi-danh-trao-nguoi-thua-ke-nu-doat-quyen",
    label: "Khu vui chơi trẻ em / mẫu vải bị đánh tráo / người thừa kế nữ đoạt quyền",
    slug: "khu-vui-choi-tre-em-mau-vai-bi-danh-trao-nguoi-thua-ke-nu-doat-quyen",
  },
  {
    key: "g-truong-quoc-te-do-choi-co-may-ghi-am-gia-quy-phan-lai-nguoi-cam-quyen",
    label: "Trường quốc tế / đồ chơi có máy ghi âm / gia quy phản lại người cầm quyền",
    slug: "truong-quoc-te-do-choi-co-may-ghi-am-gia-quy-phan-lai-nguoi-cam-quyen",
  },
  {
    key: "g-phong-hop-phu-huynh-so-co-dong-ly-hon-cong-bo-dung-luc",
    label: "Phòng họp phụ huynh / sổ cổ đông / ly hôn công bố đúng lúc",
    slug: "phong-hop-phu-huynh-so-co-dong-ly-hon-cong-bo-dung-luc",
  },
  {
    key: "g-van-phong-luat-o-cung-di-dong-nguoi-da-chet-bat-ngo-xuat-hien",
    label: "Văn phòng luật / ổ cứng di động / người đã chết bất ngờ xuất hiện",
    slug: "van-phong-luat-o-cung-di-dong-nguoi-da-chet-bat-ngo-xuat-hien",
  },
  {
    key: "g-toa-an-gia-dinh-thiep-chuc-mung-la-hop-dong-gia-thanh-that",
    label: "Tòa án gia đình / thiệp chúc mừng lạ / hợp đồng giả thành thật",
    slug: "toa-an-gia-dinh-thiep-chuc-mung-la-hop-dong-gia-thanh-that",
  },
  {
    key: "g-don-canh-sat-thoa-thuan-tien-chuoc-hoi-dong-quan-tri-doi-phe",
    label: "Đồn cảnh sát / thỏa thuận tiền chuộc / hội đồng quản trị đổi phe",
    slug: "don-canh-sat-thoa-thuan-tien-chuoc-hoi-dong-quan-tri-doi-phe",
  },
  {
    key: "g-toa-soan-truyen-thong-lo-nuoc-hoa-la-danh-phan-bi-tra-lai",
    label: "Tòa soạn truyền thông / lọ nước hoa lạ / danh phận bị trả lại",
    slug: "toa-soan-truyen-thong-lo-nuoc-hoa-la-danh-phan-bi-tra-lai",
  },
  {
    key: "g-phong-livestream-ve-gui-xe-dem-tuyet-thanh-toan-no-cu",
    label: "Phòng livestream / vé gửi xe / đêm tuyết thanh toán nợ cũ",
    slug: "phong-livestream-ve-gui-xe-dem-tuyet-thanh-toan-no-cu",
  },
  {
    key: "g-hau-truong-showbiz-giay-chung-tu-nghi-van-phien-dich-nghe-len-bi-mat",
    label: "Hậu trường showbiz / giấy chứng tử nghi vấn / phiên dịch nghe lén bí mật",
    slug: "hau-truong-showbiz-giay-chung-tu-nghi-van-phien-dich-nghe-len-bi-mat",
  },
  {
    key: "g-phim-truong-co-trang-ghi-am-cuoc-goi-nguoi-thua-ke-that-tro-ve",
    label: "Phim trường cổ trang / ghi âm cuộc gọi / người thừa kế thật trở về",
    slug: "phim-truong-co-trang-ghi-am-cuoc-goi-nguoi-thua-ke-that-tro-ve",
  },
  {
    key: "g-san-dien-thoi-trang-the-phong-khach-san-bac-si-bi-mua-chuoc",
    label: "Sàn diễn thời trang / thẻ phòng khách sạn / bác sĩ bị mua chuộc",
    slug: "san-dien-thoi-trang-the-phong-khach-san-bac-si-bi-mua-chuoc",
  },
  {
    key: "g-showroom-trang-suc-ket-qua-adn-phong-vip-lo-giao-dich",
    label: "Showroom trang sức / kết quả ADN / phòng VIP lộ giao dịch",
    slug: "showroom-trang-suc-ket-qua-adn-phong-vip-lo-giao-dich",
  },
  {
    key: "g-nha-dau-gia-vay-cuoi-rach-cuoc-goi-cuoi-lam-lo-hung-thu",
    label: "Nhà đấu giá / váy cưới rách / cuộc gọi cuối làm lộ hung thủ",
    slug: "nha-dau-gia-vay-cuoi-rach-cuoc-goi-cuoi-lam-lo-hung-thu",
  },
  {
    key: "g-phong-trien-lam-buc-thu-nac-danh-bang-chung-bi-trao-lan-hai",
    label: "Phòng triển lãm / bức thư nặc danh / bằng chứng bị tráo lần hai",
    slug: "phong-trien-lam-buc-thu-nac-danh-bang-chung-bi-trao-lan-hai",
  },
  {
    key: "g-quan-ca-phe-cu-manh-giay-trong-sach-di-san-co-dieu-kien",
    label: "Quán cà phê cũ / mảnh giấy trong sách / di sản có điều kiện",
    slug: "quan-ca-phe-cu-manh-giay-trong-sach-di-san-co-dieu-kien",
  },
  {
    key: "g-hieu-sach-cuoi-pho-anh-dinh-vi-khach-san-gia-chet-tro-ve-tra-thu",
    label: "Hiệu sách cuối phố / ảnh định vị khách sạn / giả chết trở về trả thù",
    slug: "hieu-sach-cuoi-pho-anh-dinh-vi-khach-san-gia-chet-tro-ve-tra-thu",
  },
  {
    key: "g-nha-hang-gia-toc-quyet-dinh-sa-thai-co-phan-bi-chuyen-nguoc",
    label: "Nhà hàng gia tộc / quyết định sa thải / cổ phần bị chuyển ngược",
    slug: "nha-hang-gia-toc-quyet-dinh-sa-thai-co-phan-bi-chuyen-nguoc",
  },
  {
    key: "g-bep-truong-khach-san-dien-thoai-bi-vo-nguoi-bao-ve-la-dai-thieu-gia",
    label: "Bếp trưởng khách sạn / điện thoại bị vỡ / người bảo vệ là đại thiếu gia",
    slug: "bep-truong-khach-san-dien-thoai-bi-vo-nguoi-bao-ve-la-dai-thieu-gia",
  },
  {
    key: "g-cau-lac-bo-tu-nhan-hoa-cuoi-gui-nham-moi-tinh-cu-thanh-nhan-chung",
    label: "Câu lạc bộ tư nhân / hoa cưới gửi nhầm / mối tình cũ thành nhân chứng",
    slug: "cau-lac-bo-tu-nhan-hoa-cuoi-gui-nham-moi-tinh-cu-thanh-nhan-chung",
  },
  {
    key: "g-ham-ruou-biet-thu-hop-dong-thue-nha-bi-sa-thai-roi-quay-lai-lam-sep",
    label: "Hầm rượu biệt thự / hợp đồng thuê nhà / bị sa thải rồi quay lại làm sếp",
    slug: "ham-ruou-biet-thu-hop-dong-thue-nha-bi-sa-thai-roi-quay-lai-lam-sep",
  },
  {
    key: "g-phong-doc-sach-thuoc-bi-doi-mon-qua-phan-boi-bi-mo-ra",
    label: "Phòng đọc sách / thuốc bị đổi / món quà phản bội bị mở ra",
    slug: "phong-doc-sach-thuoc-bi-doi-mon-qua-phan-boi-bi-mo-ra",
  },
  {
    key: "g-tu-duong-ho-lon-the-nhan-vien-cu-ve-si-che-giau-than-phan",
    label: "Từ đường họ lớn / thẻ nhân viên cũ / vệ sĩ che giấu thân phận",
    slug: "tu-duong-ho-lon-the-nhan-vien-cu-ve-si-che-giau-than-phan",
  },
  {
    key: "g-nha-cu-ngoai-o-hop-dong-hon-nhan-me-chong-bi-phan-don",
    label: "Nhà cũ ngoại ô / hợp đồng hôn nhân / mẹ chồng bị phản đòn",
    slug: "nha-cu-ngoai-o-hop-dong-hon-nhan-me-chong-bi-phan-don",
  },
  {
    key: "g-co-nhi-vien-anh-chup-man-hinh-nu-chinh-tu-cuu-danh-tieng",
    label: "Cô nhi viện / ảnh chụp màn hình / nữ chính tự cứu danh tiếng",
    slug: "co-nhi-vien-anh-chup-man-hinh-nu-chinh-tu-cuu-danh-tieng",
  },
  {
    key: "g-trai-he-quy-toc-vali-khoa-so-du-lieu-bi-phuc-hoi",
    label: "Trại hè quý tộc / vali khóa số / dữ liệu bị phục hồi",
    slug: "trai-he-quy-toc-vali-khoa-so-du-lieu-bi-phuc-hoi",
  },
  {
    key: "g-ky-tuc-xa-dai-hoc-di-chuc-viet-tay-dua-tre-nhan-ra-su-that",
    label: "Ký túc xá đại học / di chúc viết tay / đứa trẻ nhận ra sự thật",
    slug: "ky-tuc-xa-dai-hoc-di-chuc-viet-tay-dua-tre-nhan-ra-su-that",
  },
  {
    key: "g-khu-chung-cu-cao-cap-thiep-cuoi-bi-giau-loi-canh-bao-thanh-su-that",
    label: "Khu chung cư cao cấp / thiệp cưới bị giấu / lời cảnh báo thành sự thật",
    slug: "khu-chung-cu-cao-cap-thiep-cuoi-bi-giau-loi-canh-bao-thanh-su-that",
  },
  {
    key: "g-camera-hanh-lang-mat-khau-ket-sat-co-gai-que-la-chu-tich-an-danh",
    label: "Camera hành lang / mật khẩu két sắt / cô gái quê là chủ tịch ẩn danh",
    slug: "camera-hanh-lang-mat-khau-ket-sat-co-gai-que-la-chu-tich-an-danh",
  },
  {
    key: "g-phong-quan-ly-toa-nha-vong-co-thua-ke-nu-bac-si-tu-minh-oan",
    label: "Phòng quản lý tòa nhà / vòng cổ thừa kế / nữ bác sĩ tự minh oan",
    slug: "phong-quan-ly-toa-nha-vong-co-thua-ke-nu-bac-si-tu-minh-oan",
  },
  {
    key: "g-van-phong-startup-ban-thu-am-phong-hop-hot-search-quay-xe",
    label: "Văn phòng startup / bản thu âm phòng họp / hot search quay xe",
    slug: "van-phong-startup-ban-thu-am-phong-hop-hot-search-quay-xe",
  },
  {
    key: "g-phong-server-cong-ty-giay-uy-quyen-gia-cha-ruot-xuat-hien",
    label: "Phòng server công ty / giấy ủy quyền giả / cha ruột xuất hiện",
    slug: "phong-server-cong-ty-giay-uy-quyen-gia-cha-ruot-xuat-hien",
  },
  {
    key: "g-ngan-hang-phong-vip-tep-anh-phuc-hoi-nguoi-mat-tich-quay-ve",
    label: "Ngân hàng phòng VIP / tệp ảnh phục hồi / người mất tích quay về",
    slug: "ngan-hang-phong-vip-tep-anh-phuc-hoi-nguoi-mat-tich-quay-ve",
  },
  {
    key: "g-quay-giao-dich-rieng-danh-sach-khach-moi-ban-quyen-duoc-chung-minh",
    label: "Quầy giao dịch riêng / danh sách khách mời / bản quyền được chứng minh",
    slug: "quay-giao-dich-rieng-danh-sach-khach-moi-ban-quyen-duoc-chung-minh",
  },
  {
    key: "g-phong-kiem-toan-camera-thang-may-khach-khong-moi-lat-mat",
    label: "Phòng kiểm toán / camera thang máy / khách không mời lật mặt",
    slug: "phong-kiem-toan-camera-thang-may-khach-khong-moi-lat-mat",
  },
  {
    key: "g-hoi-nghi-co-dong-mau-toc-xet-nghiem-hai-than-phan-va-vao-nhau",
    label: "Hội nghị cổ đông / mẫu tóc xét nghiệm / hai thân phận va vào nhau",
    slug: "hoi-nghi-co-dong-mau-toc-xet-nghiem-hai-than-phan-va-vao-nhau",
  },
  {
    key: "g-le-ra-mat-san-pham-cuc-ao-roi-chong-cu-muon-mang-hoi-han",
    label: "Lễ ra mắt sản phẩm / cúc áo rơi / chồng cũ muộn màng hối hận",
    slug: "le-ra-mat-san-pham-cuc-ao-roi-chong-cu-muon-mang-hoi-han",
  },
  {
    key: "g-hop-bao-khung-hoang-ban-nhap-thong-cao-thien-kim-that-lat-mat",
    label: "Họp báo khủng hoảng / bản nháp thông cáo / thiên kim thật lật mặt",
    slug: "hop-bao-khung-hoang-ban-nhap-thong-cao-thien-kim-that-lat-mat",
  },
  {
    key: "g-studio-chup-anh-ma-phong-vip-thu-cu-mo-khoa-bi-mat",
    label: "Studio chụp ảnh / mã phòng VIP / thư cũ mở khóa bí mật",
    slug: "studio-chup-anh-ma-phong-vip-thu-cu-mo-khoa-bi-mat",
  },
  {
    key: "g-phong-make-up-ve-may-bay-mot-chieu-nu-chinh-roi-di-dung-luc",
    label: "Phòng make-up / vé máy bay một chiều / nữ chính rời đi đúng lúc",
    slug: "phong-make-up-ve-may-bay-mot-chieu-nu-chinh-roi-di-dung-luc",
  },
  {
    key: "g-phong-kham-tu-sao-ke-ngan-hang-ke-tong-tien-bi-phan-bay",
    label: "Phòng khám tư / sao kê ngân hàng / kẻ tống tiền bị phản bẫy",
    slug: "phong-kham-tu-sao-ke-ngan-hang-ke-tong-tien-bi-phan-bay",
  },
  {
    key: "g-khoa-cap-cuu-phieu-xet-nghiem-doi-ten-bao-luc-mang-bi-dao-chieu",
    label: "Khoa cấp cứu / phiếu xét nghiệm đổi tên / bạo lực mạng bị đảo chiều",
    slug: "khoa-cap-cuu-phieu-xet-nghiem-doi-ten-bao-luc-mang-bi-dao-chieu",
  },
  {
    key: "g-nha-tre-song-ngu-email-noi-bo-nu-giao-vien-lat-lai-su-that",
    label: "Nhà trẻ song ngữ / email nội bộ / nữ giáo viên lật lại sự thật",
    slug: "nha-tre-song-ngu-email-noi-bo-nu-giao-vien-lat-lai-su-that",
  },
  {
    key: "g-phong-bao-mau-buc-tranh-bi-che-truyen-thong-bi-phan-don",
    label: "Phòng bảo mẫu / bức tranh bị che / truyền thông bị phản đòn",
    slug: "phong-bao-mau-buc-tranh-bi-che-truyen-thong-bi-phan-don",
  },
  {
    key: "g-cong-vien-mua-dem-hop-dong-quang-cao-den-me-ruot-bi-giau-kin",
    label: "Công viên mưa đêm / hợp đồng quảng cáo đen / mẹ ruột bị giấu kín",
    slug: "cong-vien-mua-dem-hop-dong-quang-cao-den-me-ruot-bi-giau-kin",
  },
  {
    key: "g-cua-hang-ao-cuoi-bao-hiem-nguoi-thu-huong-ban-sao-hop-dong-bien-mat",
    label: "Cửa hàng áo cưới / bảo hiểm người thụ hưởng / bản sao hợp đồng biến mất",
    slug: "cua-hang-ao-cuoi-bao-hiem-nguoi-thu-huong-ban-sao-hop-dong-bien-mat",
  },
  {
    key: "g-xuong-thiet-ke-bien-ban-hoi-dong-dan-xep-bi-boc-phot",
    label: "Xưởng thiết kế / biên bản hội đồng / dàn xếp bị bóc phốt",
    slug: "xuong-thiet-ke-bien-ban-hoi-dong-dan-xep-bi-boc-phot",
  },
  {
    key: "g-kho-hang-bi-mat-the-nho-camera-thoa-thuan-ngam-bi-nghe-thay",
    label: "Kho hàng bí mật / thẻ nhớ camera / thỏa thuận ngầm bị nghe thấy",
    slug: "kho-hang-bi-mat-the-nho-camera-thoa-thuan-ngam-bi-nghe-thay",
  },
  {
    key: "g-garage-xe-sang-hoa-don-trang-suc-ban-ngay-yeu-the-ban-dem-nam-quyen",
    label: "Garage xe sang / hóa đơn trang sức / ban ngày yếu thế ban đêm nắm quyền",
    slug: "garage-xe-sang-hoa-don-trang-suc-ban-ngay-yeu-the-ban-dem-nam-quyen",
  },
  {
    key: "g-cabin-xe-rieng-anh-sieu-am-hon-le-dao-chieu",
    label: "Cabin xe riêng / ảnh siêu âm / hôn lễ đảo chiều",
    slug: "cabin-xe-rieng-anh-sieu-am-hon-le-dao-chieu",
  },
  {
    key: "g-duong-cao-toc-dem-son-moi-tren-ly-thien-kim-gia-mat-cho-dua",
    label: "Đường cao tốc đêm / son môi trên ly / thiên kim giả mất chỗ dựa",
    slug: "duong-cao-toc-dem-son-moi-tren-ly-thien-kim-gia-mat-cho-dua",
  },
  {
    key: "g-tram-dung-chan-doan-chat-nhom-gia-dinh-dam-dong-chung-kien-va-mat",
    label: "Trạm dừng chân / đoạn chat nhóm gia đình / đám đông chứng kiến vả mặt",
    slug: "tram-dung-chan-doan-chat-nhom-gia-dinh-dam-dong-chung-kien-va-mat",
  },
  {
    key: "g-nha-ga-san-bay-anh-camera-bai-xe-nguoi-chong-tuong-thang-lai-thua",
    label: "Nhà ga sân bay / ảnh camera bãi xe / người chồng tưởng thắng lại thua",
    slug: "nha-ga-san-bay-anh-camera-bai-xe-nguoi-chong-tuong-thang-lai-thua",
  },
  {
    key: "g-khach-san-suoi-nuoc-nong-video-camera-hanh-lang-nguoi-im-lang-moi-la-c",
    label: "Khách sạn suối nước nóng / video camera hành lang / người im lặng mới là chủ mưu",
    slug: "khach-san-suoi-nuoc-nong-video-camera-hanh-lang-nguoi-im-lang-moi-la-chu-muu",
  },
  {
    key: "g-phong-tra-rieng-hoa-don-minibar-nguoi-bi-vu-oan-cuu-ca-gia-toc",
    label: "Phòng trà riêng / hóa đơn minibar / người bị vu oan cứu cả gia tộc",
    slug: "phong-tra-rieng-hoa-don-minibar-nguoi-bi-vu-oan-cuu-ca-gia-toc",
  },
  {
    key: "g-lau-tra-co-vong-tay-tre-so-sinh-ke-phan-boi-bi-ghi-am",
    label: "Lầu trà cổ / vòng tay trẻ sơ sinh / kẻ phản bội bị ghi âm",
    slug: "lau-tra-co-vong-tay-tre-so-sinh-ke-phan-boi-bi-ghi-am",
  },
  {
    key: "g-nha-hang-tren-cao-anh-cuoi-bi-cat-nguoi-giup-viec-giu-bi-mat",
    label: "Nhà hàng trên cao / ảnh cưới bị cắt / người giúp việc giữ bí mật",
    slug: "nha-hang-tren-cao-anh-cuoi-bi-cat-nguoi-giup-viec-giu-bi-mat",
  },
  {
    key: "g-rooftop-bar-nhat-ky-cu-tai-san-doi-chu",
    label: "Rooftop bar / nhật ký cũ / tài sản đổi chủ",
    slug: "rooftop-bar-nhat-ky-cu-tai-san-doi-chu",
  },
  {
    key: "g-sanh-tap-doan-ban-thiet-ke-goc-loi-noi-doi-bi-pha-ngay-tai-tiec",
    label: "Sảnh tập đoàn / bản thiết kế gốc / lời nói dối bị phá ngay tại tiệc",
    slug: "sanh-tap-doan-ban-thiet-ke-goc-loi-noi-doi-bi-pha-ngay-tai-tiec",
  },
  {
    key: "g-phong-chu-tich-camera-phong-tre-nguoi-thua-ke-nu-doat-quyen",
    label: "Phòng chủ tịch / camera phòng trẻ / người thừa kế nữ đoạt quyền",
    slug: "phong-chu-tich-camera-phong-tre-nguoi-thua-ke-nu-doat-quyen",
  },
  {
    key: "g-van-phong-thu-ky-bang-luong-bi-mat-gia-quy-phan-lai-nguoi-cam-quyen",
    label: "Văn phòng thư ký / bảng lương bí mật / gia quy phản lại người cầm quyền",
    slug: "van-phong-thu-ky-bang-luong-bi-mat-gia-quy-phan-lai-nguoi-cam-quyen",
  },
  {
    key: "g-phong-nhan-su-laptop-bi-khoa-ly-hon-cong-bo-dung-luc",
    label: "Phòng nhân sự / laptop bị khóa / ly hôn công bố đúng lúc",
    slug: "phong-nhan-su-laptop-bi-khoa-ly-hon-cong-bo-dung-luc",
  },
  {
    key: "g-phong-tai-chinh-hop-qua-sinh-nhat-nguoi-da-chet-bat-ngo-xuat-hien",
    label: "Phòng tài chính / hộp quà sinh nhật / người đã chết bất ngờ xuất hiện",
    slug: "phong-tai-chinh-hop-qua-sinh-nhat-nguoi-da-chet-bat-ngo-xuat-hien",
  },
  {
    key: "g-phong-phap-che-giay-bao-no-hop-dong-gia-thanh-that",
    label: "Phòng pháp chế / giấy báo nợ / hợp đồng giả thành thật",
    slug: "phong-phap-che-giay-bao-no-hop-dong-gia-thanh-that",
  },
  {
    key: "g-kho-luu-tru-cong-ty-toa-thuoc-gia-hoi-dong-quan-tri-doi-phe",
    label: "Kho lưu trữ công ty / toa thuốc giả / hội đồng quản trị đổi phe",
    slug: "kho-luu-tru-cong-ty-toa-thuoc-gia-hoi-dong-quan-tri-doi-phe",
  },
  {
    key: "g-phong-ho-so-benh-vien-bien-so-xe-la-danh-phan-bi-tra-lai",
    label: "Phòng hồ sơ bệnh viện / biển số xe lạ / danh phận bị trả lại",
    slug: "phong-ho-so-benh-vien-bien-so-xe-la-danh-phan-bi-tra-lai",
  },
  {
    key: "g-phong-cham-soc-tre-so-sinh-don-nhan-nuoi-dem-tuyet-thanh-toan-no-cu",
    label: "Phòng chăm sóc trẻ sơ sinh / đơn nhận nuôi / đêm tuyết thanh toán nợ cũ",
    slug: "phong-cham-soc-tre-so-sinh-don-nhan-nuoi-dem-tuyet-thanh-toan-no-cu",
  },
  {
    key: "g-hanh-lang-benh-vien-tin-nhan-nua-dem-phien-dich-nghe-len-bi-mat",
    label: "Hành lang bệnh viện / tin nhắn nửa đêm / phiên dịch nghe lén bí mật",
    slug: "hanh-lang-benh-vien-tin-nhan-nua-dem-phien-dich-nghe-len-bi-mat",
  },
  {
    key: "g-nha-nguyen-nho-ho-chieu-gia-nguoi-thua-ke-that-tro-ve",
    label: "Nhà nguyện nhỏ / hộ chiếu giả / người thừa kế thật trở về",
    slug: "nha-nguyen-nho-ho-chieu-gia-nguoi-thua-ke-that-tro-ve",
  },
  {
    key: "g-bai-bien-luc-binh-minh-giay-khai-sinh-cu-bac-si-bi-mua-chuoc",
    label: "Bãi biển lúc bình minh / giấy khai sinh cũ / bác sĩ bị mua chuộc",
    slug: "bai-bien-luc-binh-minh-giay-khai-sinh-cu-bac-si-bi-mua-chuoc",
  },
  {
    key: "g-doi-tuyet-nhan-cuoi-khac-ten-phong-vip-lo-giao-dich",
    label: "Đồi tuyết / nhẫn cưới khắc tên / phòng VIP lộ giao dịch",
    slug: "doi-tuyet-nhan-cuoi-khac-ten-phong-vip-lo-giao-dich",
  },
  {
    key: "g-le-hoi-phao-hoa-chia-khoa-phong-cam-cuoc-goi-cuoi-lam-lo-hung-thu",
    label: "Lễ hội pháo hoa / chìa khóa phòng cấm / cuộc gọi cuối làm lộ hung thủ",
    slug: "le-hoi-phao-hoa-chia-khoa-phong-cam-cuoc-goi-cuoi-lam-lo-hung-thu",
  },
  {
    key: "g-cho-hoa-tet-dong-ho-co-bang-chung-bi-trao-lan-hai",
    label: "Chợ hoa Tết / đồng hồ cổ / bằng chứng bị tráo lần hai",
    slug: "cho-hoa-tet-dong-ho-co-bang-chung-bi-trao-lan-hai",
  },
  {
    key: "g-san-sau-biet-thu-lich-su-dinh-vi-di-san-co-dieu-kien",
    label: "Sân sau biệt thự / lịch sử định vị / di sản có điều kiện",
    slug: "san-sau-biet-thu-lich-su-dinh-vi-di-san-co-dieu-kien",
  },
  {
    key: "g-vuon-kinh-ho-so-nhan-su-gia-chet-tro-ve-tra-thu",
    label: "Vườn kính / hồ sơ nhân sự / giả chết trở về trả thù",
    slug: "vuon-kinh-ho-so-nhan-su-gia-chet-tro-ve-tra-thu",
  },
  {
    key: "g-nha-kinh-trong-hoa-sim-dien-thoai-cu-gia-toc-che-giau-than-phan",
    label: "Nhà kính trồng hoa / sim điện thoại cũ / gia tộc che giấu thân phận",
    slug: "nha-kinh-trong-hoa-sim-dien-thoai-cu-gia-toc-che-giau-than-phan",
  },
  {
    key: "g-trai-ngua-ghe-trong-trong-tiec-lien-hon-tro-thanh-cai-bay",
    label: "Trại ngựa / ghế trống trong tiệc / liên hôn trở thành cái bẫy",
    slug: "trai-ngua-ghe-trong-trong-tiec-lien-hon-tro-thanh-cai-bay",
  },
  {
    key: "g-san-golf-hao-mon-log-ra-vao-toa-nha-doi-thu-tu-sa-bay",
    label: "Sân golf hào môn / log ra vào tòa nhà / đối thủ tự sa bẫy",
    slug: "san-golf-hao-mon-log-ra-vao-toa-nha-doi-thu-tu-sa-bay",
  },
  {
    key: "g-phong-piano-bang-gac-co-dau-vet-nguoi-ngheo-gia-giau-that",
    label: "Phòng piano / băng gạc có dấu vết / người nghèo giả giàu thật",
    slug: "phong-piano-bang-gac-co-dau-vet-nguoi-ngheo-gia-giau-that",
  },
  {
    key: "g-phong-tranh-rieng-giay-cao-got-gay-tet-doan-vien-va-mat-ho-hang",
    label: "Phòng tranh riêng / giày cao gót gãy / Tết đoàn viên vả mặt họ hàng",
    slug: "phong-tranh-rieng-giay-cao-got-gay-tet-doan-vien-va-mat-ho-hang",
  },
  {
    key: "g-khoang-thang-may-rieng-lich-hen-bac-si-tiep-vien-giu-chuyen-bay-cuoi",
    label: "Khoang thang máy riêng / lịch hẹn bác sĩ / tiếp viên giữ chuyến bay cuối",
    slug: "khoang-thang-may-rieng-lich-hen-bac-si-tiep-vien-giu-chuyen-bay-cuoi",
  },
  {
    key: "g-can-ho-bi-mat-hop-dong-bao-mat-tieu-tam-tu-lo-so-ho",
    label: "Căn hộ bí mật / hợp đồng bảo mật / tiểu tam tự lộ sơ hở",
    slug: "can-ho-bi-mat-hop-dong-bao-mat-tieu-tam-tu-lo-so-ho",
  },
  {
    key: "g-nha-an-toan-boarding-pass-bi-xe-luat-su-tung-bang-chung",
    label: "Nhà an toàn / boarding pass bị xé / luật sư tung bằng chứng",
    slug: "nha-an-toan-boarding-pass-bi-xe-luat-su-tung-bang-chung",
  },
  {
    key: "g-phong-giam-sat-camera-hop-dong-co-phan-camera-mat-bay-phut",
    label: "Phòng giám sát camera / hợp đồng cổ phần / camera mất bảy phút",
    slug: "phong-giam-sat-camera-hop-dong-co-phan-camera-mat-bay-phut",
  },
  {
    key: "g-trung-tam-du-lieu-don-ly-hon-chua-ky-bao-hiem-he-am-muu",
    label: "Trung tâm dữ liệu / đơn ly hôn chưa ký / bảo hiểm hé âm mưu",
    slug: "trung-tam-du-lieu-don-ly-hon-chua-ky-bao-hiem-he-am-muu",
  },
  {
    key: "g-dai-truyen-hinh-file-cloud-bi-xoa-tin-nhan-gui-nham-cuu-mang",
    label: "Đài truyền hình / file cloud bị xóa / tin nhắn gửi nhầm cứu mạng",
    slug: "dai-truyen-hinh-file-cloud-bi-xoa-tin-nhan-gui-nham-cuu-mang",
  },
  {
    key: "g-phong-bien-tap-tin-vat-gia-toc-cap-song-sinh-trao-than-phan",
    label: "Phòng biên tập / tín vật gia tộc / cặp song sinh tráo thân phận",
    slug: "phong-bien-tap-tin-vat-gia-toc-cap-song-sinh-trao-than-phan",
  },
  {
    key: "g-van-phong-kol-clip-hau-truong-ky-uc-quay-lai-dung-phien-toa",
    label: "Văn phòng KOL / clip hậu trường / ký ức quay lại đúng phiên tòa",
    slug: "van-phong-kol-clip-hau-truong-ky-uc-quay-lai-dung-phien-toa",
  },
  {
    key: "g-studio-podcast-don-to-cao-bi-giau-co-phan-bi-chuyen-nguoc",
    label: "Studio podcast / đơn tố cáo bị giấu / cổ phần bị chuyển ngược",
    slug: "studio-podcast-don-to-cao-bi-giau-co-phan-bi-chuyen-nguoc",
  },
  {
    key: "g-san-khau-trao-giai-ma-ket-sat-nguoi-bao-ve-la-dai-thieu-gia",
    label: "Sân khấu trao giải / mã két sắt / người bảo vệ là đại thiếu gia",
    slug: "san-khau-trao-giai-ma-ket-sat-nguoi-bao-ve-la-dai-thieu-gia",
  },
  {
    key: "g-buoi-thu-vai-ma-qr-ve-su-kien-moi-tinh-cu-thanh-nhan-chung",
    label: "Buổi thử vai / mã QR vé sự kiện / mối tình cũ thành nhân chứng",
    slug: "buoi-thu-vai-ma-qr-ve-su-kien-moi-tinh-cu-thanh-nhan-chung",
  },
  {
    key: "g-phong-casting-phieu-gui-do-ban-quyen-duoc-chung-minh",
    label: "Phòng casting / phiếu gửi đồ / bản quyền được chứng minh",
    slug: "phong-casting-phieu-gui-do-ban-quyen-duoc-chung-minh",
  },
  {
    key: "g-hau-truong-concert-so-kham-thai-khach-khong-moi-lat-mat",
    label: "Hậu trường concert / sổ khám thai / khách không mời lật mặt",
    slug: "hau-truong-concert-so-kham-thai-khach-khong-moi-lat-mat",
  },
  {
    key: "g-phong-tap-vu-dao-khan-lua-bo-quen-hai-than-phan-va-vao-nhau",
    label: "Phòng tập vũ đạo / khăn lụa bỏ quên / hai thân phận va vào nhau",
    slug: "phong-tap-vu-dao-khan-lua-bo-quen-hai-than-phan-va-vao-nhau",
  },
  {
    key: "g-san-dau-gia-co-vat-bai-dang-hot-search-chong-cu-muon-mang-hoi-han",
    label: "Sàn đấu giá cổ vật / bài đăng hot search / chồng cũ muộn màng hối hận",
    slug: "san-dau-gia-co-vat-bai-dang-hot-search-chong-cu-muon-mang-hoi-han",
  },
  {
    key: "g-bao-tang-tu-nhan-bien-lai-nha-hang-thien-kim-that-lat-mat",
    label: "Bảo tàng tư nhân / biên lai nhà hàng / thiên kim thật lật mặt",
    slug: "bao-tang-tu-nhan-bien-lai-nha-hang-thien-kim-that-lat-mat",
  },
  {
    key: "g-tu-bao-hiem-ngan-hang-camera-hanh-trinh-thu-cu-mo-khoa-bi-mat",
    label: "Tủ bảo hiểm ngân hàng / camera hành trình / thư cũ mở khóa bí mật",
    slug: "tu-bao-hiem-ngan-hang-camera-hanh-trinh-thu-cu-mo-khoa-bi-mat",
  },
  {
    key: "g-phong-ket-biet-thu-bien-lai-chuyen-khoan-nu-chinh-roi-di-dung-luc",
    label: "Phòng két biệt thự / biên lai chuyển khoản / nữ chính rời đi đúng lúc",
    slug: "phong-ket-biet-thu-bien-lai-chuyen-khoan-nu-chinh-roi-di-dung-luc",
  },
  {
    key: "g-kho-do-cu-benh-an-bi-sua-ke-tong-tien-bi-phan-bay",
    label: "Kho đồ cũ / bệnh án bị sửa / kẻ tống tiền bị phản bẫy",
    slug: "kho-do-cu-benh-an-bi-sua-ke-tong-tien-bi-phan-bay",
  },
  {
    key: "g-nha-kho-cang-bien-usb-du-lieu-mat-bao-luc-mang-bi-dao-chieu",
    label: "Nhà kho cảng biển / USB dữ liệu mật / bạo lực mạng bị đảo chiều",
    slug: "nha-kho-cang-bien-usb-du-lieu-mat-bao-luc-mang-bi-dao-chieu",
  },
  {
    key: "g-cang-du-thuyen-so-tay-cua-me-nu-giao-vien-lat-lai-su-that",
    label: "Cảng du thuyền / sổ tay của mẹ / nữ giáo viên lật lại sự thật",
    slug: "cang-du-thuyen-so-tay-cua-me-nu-giao-vien-lat-lai-su-that",
  },
  {
    key: "g-phong-cho-luat-su-mau-vai-bi-danh-trao-truyen-thong-bi-phan-don",
    label: "Phòng chờ luật sư / mẫu vải bị đánh tráo / truyền thông bị phản đòn",
    slug: "phong-cho-luat-su-mau-vai-bi-danh-trao-truyen-thong-bi-phan-don",
  },
  {
    key: "g-trai-giam-tham-gap-do-choi-co-may-ghi-am-me-ruot-bi-giau-kin",
    label: "Trại giam thăm gặp / đồ chơi có máy ghi âm / mẹ ruột bị giấu kín",
    slug: "trai-giam-tham-gap-do-choi-co-may-ghi-am-me-ruot-bi-giau-kin",
  },
  {
    key: "g-phong-hoa-giai-so-co-dong-ban-sao-hop-dong-bien-mat",
    label: "Phòng hòa giải / sổ cổ đông / bản sao hợp đồng biến mất",
    slug: "phong-hoa-giai-so-co-dong-ban-sao-hop-dong-bien-mat",
  },
  {
    key: "g-van-phong-cong-chung-o-cung-di-dong-dan-xep-bi-boc-phot",
    label: "Văn phòng công chứng / ổ cứng di động / dàn xếp bị bóc phốt",
    slug: "van-phong-cong-chung-o-cung-di-dong-dan-xep-bi-boc-phot",
  },
  {
    key: "g-phong-dang-ky-ket-hon-thiep-chuc-mung-la-thoa-thuan-ngam-bi-nghe-thay",
    label: "Phòng đăng ký kết hôn / thiệp chúc mừng lạ / thỏa thuận ngầm bị nghe thấy",
    slug: "phong-dang-ky-ket-hon-thiep-chuc-mung-la-thoa-thuan-ngam-bi-nghe-thay",
  },
  {
    key: "g-cuc-ho-tich-thoa-thuan-tien-chuoc-ban-ngay-yeu-the-ban-dem-nam-quyen",
    label: "Cục hộ tịch / thỏa thuận tiền chuộc / ban ngày yếu thế ban đêm nắm quyền",
    slug: "cuc-ho-tich-thoa-thuan-tien-chuoc-ban-ngay-yeu-the-ban-dem-nam-quyen",
  },
  {
    key: "g-phong-bao-hiem-lo-nuoc-hoa-la-hon-le-dao-chieu",
    label: "Phòng bảo hiểm / lọ nước hoa lạ / hôn lễ đảo chiều",
    slug: "phong-bao-hiem-lo-nuoc-hoa-la-hon-le-dao-chieu",
  },
  {
    key: "g-trung-tam-xet-nghiem-ve-gui-xe-thien-kim-gia-mat-cho-dua",
    label: "Trung tâm xét nghiệm / vé gửi xe / thiên kim giả mất chỗ dựa",
    slug: "trung-tam-xet-nghiem-ve-gui-xe-thien-kim-gia-mat-cho-dua",
  },
  {
    key: "g-nha-khach-gia-toc-giay-chung-tu-nghi-van-dam-dong-chung-kien-va-mat",
    label: "Nhà khách gia tộc / giấy chứng tử nghi vấn / đám đông chứng kiến vả mặt",
    slug: "nha-khach-gia-toc-giay-chung-tu-nghi-van-dam-dong-chung-kien-va-mat",
  },
  {
    key: "g-khu-duong-lao-cao-cap-ghi-am-cuoc-goi-nguoi-chong-tuong-thang-lai-thua",
    label: "Khu dưỡng lão cao cấp / ghi âm cuộc gọi / người chồng tưởng thắng lại thua",
    slug: "khu-duong-lao-cao-cap-ghi-am-cuoc-goi-nguoi-chong-tuong-thang-lai-thua",
  },
  {
    key: "g-phong-cham-soc-dac-biet-the-phong-khach-san-nguoi-im-lang-moi-la-chu-m",
    label: "Phòng chăm sóc đặc biệt / thẻ phòng khách sạn / người im lặng mới là chủ mưu",
    slug: "phong-cham-soc-dac-biet-the-phong-khach-san-nguoi-im-lang-moi-la-chu-muu",
  },
  {
    key: "g-nha-hang-tiec-cuoi-ket-qua-adn-sep-cu-gap-lai-than-phan-moi",
    label: "Nhà hàng tiệc cưới / kết quả ADN / sếp cũ gặp lại thân phận mới",
    slug: "nha-hang-tiec-cuoi-ket-qua-adn-sep-cu-gap-lai-than-phan-moi",
  },
  {
    key: "g-phong-co-dau-vay-cuoi-rach-nguoi-bi-khinh-that-ra-nam-quyen",
    label: "Phòng cô dâu / váy cưới rách / người bị khinh thật ra nắm quyền",
    slug: "phong-co-dau-vay-cuoi-rach-nguoi-bi-khinh-that-ra-nam-quyen",
  },
  {
    key: "g-phong-chu-re-buc-thu-nac-danh-nhan-chung-doi-phe",
    label: "Phòng chú rể / bức thư nặc danh / nhân chứng đổi phe",
    slug: "phong-chu-re-buc-thu-nac-danh-nhan-chung-doi-phe",
  },
  {
    key: "g-sanh-chung-cu-dem-manh-giay-trong-sach-ke-dung-sau-la-nguoi-than",
    label: "Sảnh chung cư đêm / mảnh giấy trong sách / kẻ đứng sau là người thân",
    slug: "sanh-chung-cu-dem-manh-giay-trong-sach-ke-dung-sau-la-nguoi-than",
  },
  {
    key: "g-ban-cong-tang-cao-anh-dinh-vi-khach-san-dau-vet-nho-lat-an",
    label: "Ban công tầng cao / ảnh định vị khách sạn / dấu vết nhỏ lật án",
    slug: "ban-cong-tang-cao-anh-dinh-vi-khach-san-dau-vet-nho-lat-an",
  },
  {
    key: "g-cau-thang-thoat-hiem-quyet-dinh-sa-thai-dong-sang-lap-phan-boi-bi-loai",
    label: "Cầu thang thoát hiểm / quyết định sa thải / đồng sáng lập phản bội bị loại",
    slug: "cau-thang-thoat-hiem-quyet-dinh-sa-thai-dong-sang-lap-phan-boi-bi-loai",
  },
  {
    key: "g-hanh-lang-khach-san-dien-thoai-bi-vo-bi-mat-chim-noi-len",
    label: "Hành lang khách sạn / điện thoại bị vỡ / bí mật chìm nổi lên",
    slug: "hanh-lang-khach-san-dien-thoai-bi-vo-bi-mat-chim-noi-len",
  },
  {
    key: "g-phong-camera-khach-san-hoa-cuoi-gui-nham-co-dau-bo-tron-phan-don",
    label: "Phòng camera khách sạn / hoa cưới gửi nhầm / cô dâu bỏ trốn phản đòn",
    slug: "phong-camera-khach-san-hoa-cuoi-gui-nham-co-dau-bo-tron-phan-don",
  },
  {
    key: "g-quay-le-tan-hop-dong-thue-nha-dua-tre-khong-phai-con-ruot",
    label: "Quầy lễ tân / hợp đồng thuê nhà / đứa trẻ không phải con ruột",
    slug: "quay-le-tan-hop-dong-thue-nha-dua-tre-khong-phai-con-ruot",
  },
  {
    key: "g-phong-giat-la-thuoc-bi-doi-nguoi-cu-tro-ve-dung-luc",
    label: "Phòng giặt là / thuốc bị đổi / người cũ trở về đúng lúc",
    slug: "phong-giat-la-thuoc-bi-doi-nguoi-cu-tro-ve-dung-luc",
  },
  {
    key: "g-kho-ruou-nha-hang-the-nhan-vien-cu-nguoi-quy-goi-xin-loi",
    label: "Kho rượu nhà hàng / thẻ nhân viên cũ / người quỳ gối xin lỗi",
    slug: "kho-ruou-nha-hang-the-nhan-vien-cu-nguoi-quy-goi-xin-loi",
  },
  {
    key: "g-san-thuong-mua-hop-dong-hon-nhan-vi-hon-phu-bi-thay-the",
    label: "Sân thượng mưa / hợp đồng hôn nhân / vị hôn phu bị thay thế",
    slug: "san-thuong-mua-hop-dong-hon-nhan-vi-hon-phu-bi-thay-the",
  },
  {
    key: "g-ga-tau-cu-anh-chup-man-hinh-dem-mua-doi-so-phan",
    label: "Ga tàu cũ / ảnh chụp màn hình / đêm mưa đổi số phận",
    slug: "ga-tau-cu-anh-chup-man-hinh-dem-mua-doi-so-phan",
  },
  {
    key: "g-chuyen-tau-dem-vali-khoa-so-nguoi-bi-vu-oan-cuu-ca-gia-toc",
    label: "Chuyến tàu đêm / vali khóa số / người bị vu oan cứu cả gia tộc",
    slug: "chuyen-tau-dem-vali-khoa-so-nguoi-bi-vu-oan-cuu-ca-gia-toc",
  },
  {
    key: "g-ben-xe-lien-tinh-di-chuc-viet-tay-ke-phan-boi-bi-ghi-am",
    label: "Bến xe liên tỉnh / di chúc viết tay / kẻ phản bội bị ghi âm",
    slug: "ben-xe-lien-tinh-di-chuc-viet-tay-ke-phan-boi-bi-ghi-am",
  },
  {
    key: "g-phong-cho-vip-thiep-cuoi-bi-giau-nguoi-giup-viec-giu-bi-mat",
    label: "Phòng chờ VIP / thiệp cưới bị giấu / người giúp việc giữ bí mật",
    slug: "phong-cho-vip-thiep-cuoi-bi-giau-nguoi-giup-viec-giu-bi-mat",
  },
  {
    key: "g-cua-khau-mat-khau-ket-sat-phong-vip-lo-giao-dich",
    label: "Cửa khẩu / mật khẩu két sắt / phòng VIP lộ giao dịch",
    slug: "cua-khau-mat-khau-ket-sat-phong-vip-lo-giao-dich",
  },
  {
    key: "g-lanh-su-quan-vong-co-thua-ke-cuoc-goi-cuoi-lam-lo-hung-thu",
    label: "Lãnh sự quán / vòng cổ thừa kế / cuộc gọi cuối làm lộ hung thủ",
    slug: "lanh-su-quan-vong-co-thua-ke-cuoc-goi-cuoi-lam-lo-hung-thu",
  },
  {
    key: "g-van-phong-phien-dich-ban-thu-am-phong-hop-bang-chung-bi-trao-lan-hai",
    label: "Văn phòng phiên dịch / bản thu âm phòng họp / bằng chứng bị tráo lần hai",
    slug: "van-phong-phien-dich-ban-thu-am-phong-hop-bang-chung-bi-trao-lan-hai",
  },
  {
    key: "g-phong-hop-quoc-te-giay-uy-quyen-gia-di-san-co-dieu-kien",
    label: "Phòng họp quốc tế / giấy ủy quyền giả / di sản có điều kiện",
    slug: "phong-hop-quoc-te-giay-uy-quyen-gia-di-san-co-dieu-kien",
  },
  {
    key: "g-hoi-cho-thuong-mai-tep-anh-phuc-hoi-gia-chet-tro-ve-tra-thu",
    label: "Hội chợ thương mại / tệp ảnh phục hồi / giả chết trở về trả thù",
    slug: "hoi-cho-thuong-mai-tep-anh-phuc-hoi-gia-chet-tro-ve-tra-thu",
  },
  {
    key: "g-nha-may-gia-dinh-danh-sach-khach-moi-gia-toc-che-giau-than-phan",
    label: "Nhà máy gia đình / danh sách khách mời / gia tộc che giấu thân phận",
    slug: "nha-may-gia-dinh-danh-sach-khach-moi-gia-toc-che-giau-than-phan",
  },
  {
    key: "g-xuong-may-camera-thang-may-lien-hon-tro-thanh-cai-bay",
    label: "Xưởng may / camera thang máy / liên hôn trở thành cái bẫy",
    slug: "xuong-may-camera-thang-may-lien-hon-tro-thanh-cai-bay",
  },
  {
    key: "g-kho-lanh-mau-toc-xet-nghiem-doi-thu-tu-sa-bay",
    label: "Kho lạnh / mẫu tóc xét nghiệm / đối thủ tự sa bẫy",
    slug: "kho-lanh-mau-toc-xet-nghiem-doi-thu-tu-sa-bay",
  },
  {
    key: "g-trang-trai-ngoai-o-cuc-ao-roi-nguoi-ngheo-gia-giau-that",
    label: "Trang trại ngoại ô / cúc áo rơi / người nghèo giả giàu thật",
    slug: "trang-trai-ngoai-o-cuc-ao-roi-nguoi-ngheo-gia-giau-that",
  },
  {
    key: "g-nha-tho-hon-le-ban-nhap-thong-cao-tet-doan-vien-va-mat-ho-hang",
    label: "Nhà thờ hôn lễ / bản nháp thông cáo / Tết đoàn viên vả mặt họ hàng",
    slug: "nha-tho-hon-le-ban-nhap-thong-cao-tet-doan-vien-va-mat-ho-hang",
  },
  {
    key: "g-san-truong-cu-ma-phong-vip-tiep-vien-giu-chuyen-bay-cuoi",
    label: "Sân trường cũ / mã phòng VIP / tiếp viên giữ chuyến bay cuối",
    slug: "san-truong-cu-ma-phong-vip-tiep-vien-giu-chuyen-bay-cuoi",
  },
  {
    key: "g-thu-vien-dai-hoc-ve-may-bay-mot-chieu-tieu-tam-tu-lo-so-ho",
    label: "Thư viện đại học / vé máy bay một chiều / tiểu tam tự lộ sơ hở",
    slug: "thu-vien-dai-hoc-ve-may-bay-mot-chieu-tieu-tam-tu-lo-so-ho",
  },
  {
    key: "g-phong-y-te-truong-sao-ke-ngan-hang-luat-su-tung-bang-chung",
    label: "Phòng y tế trường / sao kê ngân hàng / luật sư tung bằng chứng",
    slug: "phong-y-te-truong-sao-ke-ngan-hang-luat-su-tung-bang-chung",
  },
  {
    key: "g-phong-hieu-truong-phieu-xet-nghiem-doi-ten-camera-mat-bay-phut",
    label: "Phòng hiệu trưởng / phiếu xét nghiệm đổi tên / camera mất bảy phút",
    slug: "phong-hieu-truong-phieu-xet-nghiem-doi-ten-camera-mat-bay-phut",
  },
  {
    key: "g-cong-truong-luc-mua-email-noi-bo-bao-hiem-he-am-muu",
    label: "Cổng trường lúc mưa / email nội bộ / bảo hiểm hé âm mưu",
    slug: "cong-truong-luc-mua-email-noi-bo-bao-hiem-he-am-muu",
  },
  {
    key: "g-khu-pho-cu-buc-tranh-bi-che-tin-nhan-gui-nham-cuu-mang",
    label: "Khu phố cũ / bức tranh bị che / tin nhắn gửi nhầm cứu mạng",
    slug: "khu-pho-cu-buc-tranh-bi-che-tin-nhan-gui-nham-cuu-mang",
  },
  {
    key: "g-tiem-anh-cu-hop-dong-quang-cao-den-cap-song-sinh-trao-than-phan",
    label: "Tiệm ảnh cũ / hợp đồng quảng cáo đen / cặp song sinh tráo thân phận",
    slug: "tiem-anh-cu-hop-dong-quang-cao-den-cap-song-sinh-trao-than-phan",
  },
  {
    key: "g-tiem-sua-dien-thoai-bao-hiem-nguoi-thu-huong-ky-uc-quay-lai-dung-phien",
    label: "Tiệm sửa điện thoại / bảo hiểm người thụ hưởng / ký ức quay lại đúng phiên tòa",
    slug: "tiem-sua-dien-thoai-bao-hiem-nguoi-thu-huong-ky-uc-quay-lai-dung-phien-toa",
  },
  {
    key: "g-cua-hang-dong-ho-bien-ban-hoi-dong-co-phan-bi-chuyen-nguoc",
    label: "Cửa hàng đồng hồ / biên bản hội đồng / cổ phần bị chuyển ngược",
    slug: "cua-hang-dong-ho-bien-ban-hoi-dong-co-phan-bi-chuyen-nguoc",
  },
  {
    key: "g-tiem-banh-gia-dinh-the-nho-camera-nguoi-bao-ve-la-dai-thieu-gia",
    label: "Tiệm bánh gia đình / thẻ nhớ camera / người bảo vệ là đại thiếu gia",
    slug: "tiem-banh-gia-dinh-the-nho-camera-nguoi-bao-ve-la-dai-thieu-gia",
  },
  {
    key: "g-quan-an-dem-hoa-don-trang-suc-moi-tinh-cu-thanh-nhan-chung",
    label: "Quán ăn đêm / hóa đơn trang sức / mối tình cũ thành nhân chứng",
    slug: "quan-an-dem-hoa-don-trang-suc-moi-tinh-cu-thanh-nhan-chung",
  },
  {
    key: "g-phong-karaoke-rieng-anh-sieu-am-bi-sa-thai-roi-quay-lai-lam-sep",
    label: "Phòng karaoke riêng / ảnh siêu âm / bị sa thải rồi quay lại làm sếp",
    slug: "phong-karaoke-rieng-anh-sieu-am-bi-sa-thai-roi-quay-lai-lam-sep",
  },
  {
    key: "g-ktv-hao-mon-son-moi-tren-ly-mon-qua-phan-boi-bi-mo-ra",
    label: "KTV hào môn / son môi trên ly / món quà phản bội bị mở ra",
    slug: "ktv-hao-mon-son-moi-tren-ly-mon-qua-phan-boi-bi-mo-ra",
  },
  {
    key: "g-casino-tren-du-thuyen-doan-chat-nhom-gia-dinh-ve-si-che-giau-than-phan",
    label: "Casino trên du thuyền / đoạn chat nhóm gia đình / vệ sĩ che giấu thân phận",
    slug: "casino-tren-du-thuyen-doan-chat-nhom-gia-dinh-ve-si-che-giau-than-phan",
  },
  {
    key: "g-spa-cao-cap-anh-camera-bai-xe-me-chong-bi-phan-don",
    label: "Spa cao cấp / ảnh camera bãi xe / mẹ chồng bị phản đòn",
    slug: "spa-cao-cap-anh-camera-bai-xe-me-chong-bi-phan-don",
  },
  {
    key: "g-phong-tri-lieu-tam-ly-video-camera-hanh-lang-nu-chinh-tu-cuu-danh-tien",
    label: "Phòng trị liệu tâm lý / video camera hành lang / nữ chính tự cứu danh tiếng",
    slug: "phong-tri-lieu-tam-ly-video-camera-hanh-lang-nu-chinh-tu-cuu-danh-tieng",
  },
  {
    key: "g-studio-yoga-hoa-don-minibar-du-lieu-bi-phuc-hoi",
    label: "Studio yoga / hóa đơn minibar / dữ liệu bị phục hồi",
    slug: "studio-yoga-hoa-don-minibar-du-lieu-bi-phuc-hoi",
  },
  {
    key: "g-phong-hop-bi-mat-vong-tay-tre-so-sinh-dua-tre-nhan-ra-su-that",
    label: "Phòng họp bí mật / vòng tay trẻ sơ sinh / đứa trẻ nhận ra sự thật",
    slug: "phong-hop-bi-mat-vong-tay-tre-so-sinh-dua-tre-nhan-ra-su-that",
  },
  {
    key: "g-can-phong-khoa-trai-anh-cuoi-bi-cat-loi-canh-bao-thanh-su-that",
    label: "Căn phòng khóa trái / ảnh cưới bị cắt / lời cảnh báo thành sự thật",
    slug: "can-phong-khoa-trai-anh-cuoi-bi-cat-loi-canh-bao-thanh-su-that",
  },
  {
    key: "g-tang-ap-mai-nhat-ky-cu-co-gai-que-la-chu-tich-an-danh",
    label: "Tầng áp mái / nhật ký cũ / cô gái quê là chủ tịch ẩn danh",
    slug: "tang-ap-mai-nhat-ky-cu-co-gai-que-la-chu-tich-an-danh",
  },
  {
    key: "g-tang-ham-biet-thu-ban-thiet-ke-goc-nu-bac-si-tu-minh-oan",
    label: "Tầng hầm biệt thự / bản thiết kế gốc / nữ bác sĩ tự minh oan",
    slug: "tang-ham-biet-thu-ban-thiet-ke-goc-nu-bac-si-tu-minh-oan",
  },
  {
    key: "g-loi-thoat-hiem-camera-phong-tre-hot-search-quay-xe",
    label: "Lối thoát hiểm / camera phòng trẻ / hot search quay xe",
    slug: "loi-thoat-hiem-camera-phong-tre-hot-search-quay-xe",
  },
  {
    key: "g-san-sau-benh-vien-bang-luong-bi-mat-cha-ruot-xuat-hien",
    label: "Sân sau bệnh viện / bảng lương bí mật / cha ruột xuất hiện",
    slug: "san-sau-benh-vien-bang-luong-bi-mat-cha-ruot-xuat-hien",
  },
  {
    key: "g-nha-xac-benh-vien-laptop-bi-khoa-nguoi-mat-tich-quay-ve",
    label: "Nhà xác bệnh viện / laptop bị khóa / người mất tích quay về",
    slug: "nha-xac-benh-vien-laptop-bi-khoa-nguoi-mat-tich-quay-ve",
  },
  {
    key: "g-phong-luu-mau-hop-qua-sinh-nhat-ban-quyen-duoc-chung-minh",
    label: "Phòng lưu mẫu / hộp quà sinh nhật / bản quyền được chứng minh",
    slug: "phong-luu-mau-hop-qua-sinh-nhat-ban-quyen-duoc-chung-minh",
  },
  {
    key: "g-quay-thuoc-tu-nhan-giay-bao-no-khach-khong-moi-lat-mat",
    label: "Quầy thuốc tư nhân / giấy báo nợ / khách không mời lật mặt",
    slug: "quay-thuoc-tu-nhan-giay-bao-no-khach-khong-moi-lat-mat",
  },
  {
    key: "g-kho-ho-so-luat-su-toa-thuoc-gia-hai-than-phan-va-vao-nhau",
    label: "Kho hồ sơ luật sư / toa thuốc giả / hai thân phận va vào nhau",
    slug: "kho-ho-so-luat-su-toa-thuoc-gia-hai-than-phan-va-vao-nhau",
  },
  {
    key: "g-biet-thu-ven-ho-ve-gui-xe-hon-le-dao-chieu",
    label: "Biệt thự ven hồ / vé gửi xe / hôn lễ đảo chiều",
    slug: "biet-thu-ven-ho-ve-gui-xe-hon-le-dao-chieu",
  },
  {
    key: "g-penthouse-tang-cao-giay-chung-tu-nghi-van-thien-kim-gia-mat-cho-dua",
    label: "Penthouse tầng cao / giấy chứng tử nghi vấn / thiên kim giả mất chỗ dựa",
    slug: "penthouse-tang-cao-giay-chung-tu-nghi-van-thien-kim-gia-mat-cho-dua",
  },
  {
    key: "g-phong-hop-hoi-dong-ghi-am-cuoc-goi-dam-dong-chung-kien-va-mat",
    label: "Phòng họp hội đồng / ghi âm cuộc gọi / đám đông chứng kiến vả mặt",
    slug: "phong-hop-hoi-dong-ghi-am-cuoc-goi-dam-dong-chung-kien-va-mat",
  },
  {
    key: "g-sanh-khach-san-5-sao-the-phong-khach-san-nguoi-chong-tuong-thang-lai-t",
    label: "Sảnh khách sạn 5 sao / thẻ phòng khách sạn / người chồng tưởng thắng lại thua",
    slug: "sanh-khach-san-5-sao-the-phong-khach-san-nguoi-chong-tuong-thang-lai-thua",
  },
  {
    key: "g-thang-may-kinh-ket-qua-adn-nguoi-im-lang-moi-la-chu-muu",
    label: "Thang máy kính / kết quả ADN / người im lặng mới là chủ mưu",
    slug: "thang-may-kinh-ket-qua-adn-nguoi-im-lang-moi-la-chu-muu",
  },
  {
    key: "g-bai-do-xe-tang-ham-vay-cuoi-rach-sep-cu-gap-lai-than-phan-moi",
    label: "Bãi đỗ xe tầng hầm / váy cưới rách / sếp cũ gặp lại thân phận mới",
    slug: "bai-do-xe-tang-ham-vay-cuoi-rach-sep-cu-gap-lai-than-phan-moi",
  },
  {
    key: "g-phong-vip-benh-vien-buc-thu-nac-danh-nguoi-bi-khinh-that-ra-nam-quyen",
    label: "Phòng VIP bệnh viện / bức thư nặc danh / người bị khinh thật ra nắm quyền",
    slug: "phong-vip-benh-vien-buc-thu-nac-danh-nguoi-bi-khinh-that-ra-nam-quyen",
  },
  {
    key: "g-khoa-san-nua-dem-manh-giay-trong-sach-nhan-chung-doi-phe",
    label: "Khoa sản nửa đêm / mảnh giấy trong sách / nhân chứng đổi phe",
    slug: "khoa-san-nua-dem-manh-giay-trong-sach-nhan-chung-doi-phe",
  },
  {
    key: "g-phong-xet-nghiem-adn-anh-dinh-vi-khach-san-ke-dung-sau-la-nguoi-than",
    label: "Phòng xét nghiệm ADN / ảnh định vị khách sạn / kẻ đứng sau là người thân",
    slug: "phong-xet-nghiem-adn-anh-dinh-vi-khach-san-ke-dung-sau-la-nguoi-than",
  },
  {
    key: "g-nha-tang-le-quyet-dinh-sa-thai-dau-vet-nho-lat-an",
    label: "Nhà tang lễ / quyết định sa thải / dấu vết nhỏ lật án",
    slug: "nha-tang-le-quyet-dinh-sa-thai-dau-vet-nho-lat-an",
  },
  {
    key: "g-le-dinh-hon-hao-mon-dien-thoai-bi-vo-dong-sang-lap-phan-boi-bi-loai",
    label: "Lễ đính hôn hào môn / điện thoại bị vỡ / đồng sáng lập phản bội bị loại",
    slug: "le-dinh-hon-hao-mon-dien-thoai-bi-vo-dong-sang-lap-phan-boi-bi-loai",
  },
  {
    key: "g-hon-le-trong-mua-hoa-cuoi-gui-nham-bi-mat-chim-noi-len",
    label: "Hôn lễ trong mưa / hoa cưới gửi nhầm / bí mật chìm nổi lên",
    slug: "hon-le-trong-mua-hoa-cuoi-gui-nham-bi-mat-chim-noi-len",
  },
  {
    key: "g-tiec-tu-thien-hop-dong-thue-nha-co-dau-bo-tron-phan-don",
    label: "Tiệc từ thiện / hợp đồng thuê nhà / cô dâu bỏ trốn phản đòn",
    slug: "tiec-tu-thien-hop-dong-thue-nha-co-dau-bo-tron-phan-don",
  },
  {
    key: "g-da-tiec-dau-gia-thuoc-bi-doi-dua-tre-khong-phai-con-ruot",
    label: "Dạ tiệc đấu giá / thuốc bị đổi / đứa trẻ không phải con ruột",
    slug: "da-tiec-dau-gia-thuoc-bi-doi-dua-tre-khong-phai-con-ruot",
  },
  {
    key: "g-du-thuyen-dem-the-nhan-vien-cu-nguoi-cu-tro-ve-dung-luc",
    label: "Du thuyền đêm / thẻ nhân viên cũ / người cũ trở về đúng lúc",
    slug: "du-thuyen-dem-the-nhan-vien-cu-nguoi-cu-tro-ve-dung-luc",
  },
  {
    key: "g-san-bay-quoc-te-hop-dong-hon-nhan-nguoi-quy-goi-xin-loi",
    label: "Sân bay quốc tế / hợp đồng hôn nhân / người quỳ gối xin lỗi",
    slug: "san-bay-quoc-te-hop-dong-hon-nhan-nguoi-quy-goi-xin-loi",
  },
  {
    key: "g-khoang-hang-thuong-gia-anh-chup-man-hinh-vi-hon-phu-bi-thay-the",
    label: "Khoang hạng thương gia / ảnh chụp màn hình / vị hôn phu bị thay thế",
    slug: "khoang-hang-thuong-gia-anh-chup-man-hinh-vi-hon-phu-bi-thay-the",
  },
  {
    key: "g-nha-ga-cao-toc-vali-khoa-so-dem-mua-doi-so-phan",
    label: "Nhà ga cao tốc / vali khóa số / đêm mưa đổi số phận",
    slug: "nha-ga-cao-toc-vali-khoa-so-dem-mua-doi-so-phan",
  },
  {
    key: "g-khu-nghi-duong-bien-di-chuc-viet-tay-nguoi-bi-vu-oan-cuu-ca-gia-toc",
    label: "Khu nghỉ dưỡng biển / di chúc viết tay / người bị vu oan cứu cả gia tộc",
    slug: "khu-nghi-duong-bien-di-chuc-viet-tay-nguoi-bi-vu-oan-cuu-ca-gia-toc",
  },
  {
    key: "g-villa-rieng-tu-thiep-cuoi-bi-giau-ke-phan-boi-bi-ghi-am",
    label: "Villa riêng tư / thiệp cưới bị giấu / kẻ phản bội bị ghi âm",
    slug: "villa-rieng-tu-thiep-cuoi-bi-giau-ke-phan-boi-bi-ghi-am",
  },
  {
    key: "g-trung-tam-thuong-mai-mat-khau-ket-sat-nguoi-giup-viec-giu-bi-mat",
    label: "Trung tâm thương mại / mật khẩu két sắt / người giúp việc giữ bí mật",
    slug: "trung-tam-thuong-mai-mat-khau-ket-sat-nguoi-giup-viec-giu-bi-mat",
  },
  {
    key: "g-khu-vui-choi-tre-em-vong-co-thua-ke-tai-san-doi-chu",
    label: "Khu vui chơi trẻ em / vòng cổ thừa kế / tài sản đổi chủ",
    slug: "khu-vui-choi-tre-em-vong-co-thua-ke-tai-san-doi-chu",
  },
  {
    key: "g-truong-quoc-te-ban-thu-am-phong-hop-loi-noi-doi-bi-pha-ngay-tai-tiec",
    label: "Trường quốc tế / bản thu âm phòng họp / lời nói dối bị phá ngay tại tiệc",
    slug: "truong-quoc-te-ban-thu-am-phong-hop-loi-noi-doi-bi-pha-ngay-tai-tiec",
  },
  {
    key: "g-phong-hop-phu-huynh-giay-uy-quyen-gia-nguoi-thua-ke-nu-doat-quyen",
    label: "Phòng họp phụ huynh / giấy ủy quyền giả / người thừa kế nữ đoạt quyền",
    slug: "phong-hop-phu-huynh-giay-uy-quyen-gia-nguoi-thua-ke-nu-doat-quyen",
  },
  {
    key: "g-van-phong-luat-tep-anh-phuc-hoi-gia-quy-phan-lai-nguoi-cam-quyen",
    label: "Văn phòng luật / tệp ảnh phục hồi / gia quy phản lại người cầm quyền",
    slug: "van-phong-luat-tep-anh-phuc-hoi-gia-quy-phan-lai-nguoi-cam-quyen",
  },
  {
    key: "g-toa-an-gia-dinh-danh-sach-khach-moi-ly-hon-cong-bo-dung-luc",
    label: "Tòa án gia đình / danh sách khách mời / ly hôn công bố đúng lúc",
    slug: "toa-an-gia-dinh-danh-sach-khach-moi-ly-hon-cong-bo-dung-luc",
  },
  {
    key: "g-don-canh-sat-camera-thang-may-nguoi-da-chet-bat-ngo-xuat-hien",
    label: "Đồn cảnh sát / camera thang máy / người đã chết bất ngờ xuất hiện",
    slug: "don-canh-sat-camera-thang-may-nguoi-da-chet-bat-ngo-xuat-hien",
  },
  {
    key: "g-toa-soan-truyen-thong-mau-toc-xet-nghiem-hop-dong-gia-thanh-that",
    label: "Tòa soạn truyền thông / mẫu tóc xét nghiệm / hợp đồng giả thành thật",
    slug: "toa-soan-truyen-thong-mau-toc-xet-nghiem-hop-dong-gia-thanh-that",
  },
  {
    key: "g-phong-livestream-cuc-ao-roi-hoi-dong-quan-tri-doi-phe",
    label: "Phòng livestream / cúc áo rơi / hội đồng quản trị đổi phe",
    slug: "phong-livestream-cuc-ao-roi-hoi-dong-quan-tri-doi-phe",
  },
  {
    key: "g-hau-truong-showbiz-ban-nhap-thong-cao-danh-phan-bi-tra-lai",
    label: "Hậu trường showbiz / bản nháp thông cáo / danh phận bị trả lại",
    slug: "hau-truong-showbiz-ban-nhap-thong-cao-danh-phan-bi-tra-lai",
  },
  {
    key: "g-phim-truong-co-trang-ma-phong-vip-dem-tuyet-thanh-toan-no-cu",
    label: "Phim trường cổ trang / mã phòng VIP / đêm tuyết thanh toán nợ cũ",
    slug: "phim-truong-co-trang-ma-phong-vip-dem-tuyet-thanh-toan-no-cu",
  },
  {
    key: "g-san-dien-thoi-trang-ve-may-bay-mot-chieu-phien-dich-nghe-len-bi-mat",
    label: "Sàn diễn thời trang / vé máy bay một chiều / phiên dịch nghe lén bí mật",
    slug: "san-dien-thoi-trang-ve-may-bay-mot-chieu-phien-dich-nghe-len-bi-mat",
  },
  {
    key: "g-showroom-trang-suc-sao-ke-ngan-hang-nguoi-thua-ke-that-tro-ve",
    label: "Showroom trang sức / sao kê ngân hàng / người thừa kế thật trở về",
    slug: "showroom-trang-suc-sao-ke-ngan-hang-nguoi-thua-ke-that-tro-ve",
  },
  {
    key: "g-nha-dau-gia-phieu-xet-nghiem-doi-ten-bac-si-bi-mua-chuoc",
    label: "Nhà đấu giá / phiếu xét nghiệm đổi tên / bác sĩ bị mua chuộc",
    slug: "nha-dau-gia-phieu-xet-nghiem-doi-ten-bac-si-bi-mua-chuoc",
  },
  {
    key: "g-phong-trien-lam-email-noi-bo-phong-vip-lo-giao-dich",
    label: "Phòng triển lãm / email nội bộ / phòng VIP lộ giao dịch",
    slug: "phong-trien-lam-email-noi-bo-phong-vip-lo-giao-dich",
  },
  {
    key: "g-quan-ca-phe-cu-buc-tranh-bi-che-cuoc-goi-cuoi-lam-lo-hung-thu",
    label: "Quán cà phê cũ / bức tranh bị che / cuộc gọi cuối làm lộ hung thủ",
    slug: "quan-ca-phe-cu-buc-tranh-bi-che-cuoc-goi-cuoi-lam-lo-hung-thu",
  },
  {
    key: "g-hieu-sach-cuoi-pho-hop-dong-quang-cao-den-bang-chung-bi-trao-lan-hai",
    label: "Hiệu sách cuối phố / hợp đồng quảng cáo đen / bằng chứng bị tráo lần hai",
    slug: "hieu-sach-cuoi-pho-hop-dong-quang-cao-den-bang-chung-bi-trao-lan-hai",
  },
  {
    key: "g-nha-hang-gia-toc-bao-hiem-nguoi-thu-huong-cap-song-sinh-trao-than-phan",
    label: "Nhà hàng gia tộc / bảo hiểm người thụ hưởng / cặp song sinh tráo thân phận",
    slug: "nha-hang-gia-toc-bao-hiem-nguoi-thu-huong-cap-song-sinh-trao-than-phan",
  },
  {
    key: "g-bep-truong-khach-san-bien-ban-hoi-dong-ky-uc-quay-lai-dung-phien-toa",
    label: "Bếp trưởng khách sạn / biên bản hội đồng / ký ức quay lại đúng phiên tòa",
    slug: "bep-truong-khach-san-bien-ban-hoi-dong-ky-uc-quay-lai-dung-phien-toa",
  },
  {
    key: "g-cau-lac-bo-tu-nhan-the-nho-camera-co-phan-bi-chuyen-nguoc",
    label: "Câu lạc bộ tư nhân / thẻ nhớ camera / cổ phần bị chuyển ngược",
    slug: "cau-lac-bo-tu-nhan-the-nho-camera-co-phan-bi-chuyen-nguoc",
  },
  {
    key: "g-ham-ruou-biet-thu-hoa-don-trang-suc-nguoi-bao-ve-la-dai-thieu-gia",
    label: "Hầm rượu biệt thự / hóa đơn trang sức / người bảo vệ là đại thiếu gia",
    slug: "ham-ruou-biet-thu-hoa-don-trang-suc-nguoi-bao-ve-la-dai-thieu-gia",
  },
  {
    key: "g-phong-doc-sach-anh-sieu-am-moi-tinh-cu-thanh-nhan-chung",
    label: "Phòng đọc sách / ảnh siêu âm / mối tình cũ thành nhân chứng",
    slug: "phong-doc-sach-anh-sieu-am-moi-tinh-cu-thanh-nhan-chung",
  },
  {
    key: "g-tu-duong-ho-lon-son-moi-tren-ly-bi-sa-thai-roi-quay-lai-lam-sep",
    label: "Từ đường họ lớn / son môi trên ly / bị sa thải rồi quay lại làm sếp",
    slug: "tu-duong-ho-lon-son-moi-tren-ly-bi-sa-thai-roi-quay-lai-lam-sep",
  },
  {
    key: "g-nha-cu-ngoai-o-doan-chat-nhom-gia-dinh-mon-qua-phan-boi-bi-mo-ra",
    label: "Nhà cũ ngoại ô / đoạn chat nhóm gia đình / món quà phản bội bị mở ra",
    slug: "nha-cu-ngoai-o-doan-chat-nhom-gia-dinh-mon-qua-phan-boi-bi-mo-ra",
  },
  {
    key: "g-co-nhi-vien-anh-camera-bai-xe-ve-si-che-giau-than-phan",
    label: "Cô nhi viện / ảnh camera bãi xe / vệ sĩ che giấu thân phận",
    slug: "co-nhi-vien-anh-camera-bai-xe-ve-si-che-giau-than-phan",
  },
  {
    key: "g-trai-he-quy-toc-video-camera-hanh-lang-me-chong-bi-phan-don",
    label: "Trại hè quý tộc / video camera hành lang / mẹ chồng bị phản đòn",
    slug: "trai-he-quy-toc-video-camera-hanh-lang-me-chong-bi-phan-don",
  },
  {
    key: "g-ky-tuc-xa-dai-hoc-hoa-don-minibar-nu-chinh-tu-cuu-danh-tieng",
    label: "Ký túc xá đại học / hóa đơn minibar / nữ chính tự cứu danh tiếng",
    slug: "ky-tuc-xa-dai-hoc-hoa-don-minibar-nu-chinh-tu-cuu-danh-tieng",
  },
  {
    key: "g-khu-chung-cu-cao-cap-vong-tay-tre-so-sinh-du-lieu-bi-phuc-hoi",
    label: "Khu chung cư cao cấp / vòng tay trẻ sơ sinh / dữ liệu bị phục hồi",
    slug: "khu-chung-cu-cao-cap-vong-tay-tre-so-sinh-du-lieu-bi-phuc-hoi",
  },
  {
    key: "g-camera-hanh-lang-anh-cuoi-bi-cat-dua-tre-nhan-ra-su-that",
    label: "Camera hành lang / ảnh cưới bị cắt / đứa trẻ nhận ra sự thật",
    slug: "camera-hanh-lang-anh-cuoi-bi-cat-dua-tre-nhan-ra-su-that",
  },
  {
    key: "g-phong-quan-ly-toa-nha-nhat-ky-cu-loi-canh-bao-thanh-su-that",
    label: "Phòng quản lý tòa nhà / nhật ký cũ / lời cảnh báo thành sự thật",
    slug: "phong-quan-ly-toa-nha-nhat-ky-cu-loi-canh-bao-thanh-su-that",
  },
  {
    key: "g-van-phong-startup-ban-thiet-ke-goc-co-gai-que-la-chu-tich-an-danh",
    label: "Văn phòng startup / bản thiết kế gốc / cô gái quê là chủ tịch ẩn danh",
    slug: "van-phong-startup-ban-thiet-ke-goc-co-gai-que-la-chu-tich-an-danh",
  },
  {
    key: "g-phong-server-cong-ty-camera-phong-tre-nu-bac-si-tu-minh-oan",
    label: "Phòng server công ty / camera phòng trẻ / nữ bác sĩ tự minh oan",
    slug: "phong-server-cong-ty-camera-phong-tre-nu-bac-si-tu-minh-oan",
  },
  {
    key: "g-ngan-hang-phong-vip-bang-luong-bi-mat-hot-search-quay-xe",
    label: "Ngân hàng phòng VIP / bảng lương bí mật / hot search quay xe",
    slug: "ngan-hang-phong-vip-bang-luong-bi-mat-hot-search-quay-xe",
  },
  {
    key: "g-quay-giao-dich-rieng-laptop-bi-khoa-cha-ruot-xuat-hien",
    label: "Quầy giao dịch riêng / laptop bị khóa / cha ruột xuất hiện",
    slug: "quay-giao-dich-rieng-laptop-bi-khoa-cha-ruot-xuat-hien",
  },
  {
    key: "g-phong-kiem-toan-hop-qua-sinh-nhat-nguoi-mat-tich-quay-ve",
    label: "Phòng kiểm toán / hộp quà sinh nhật / người mất tích quay về",
    slug: "phong-kiem-toan-hop-qua-sinh-nhat-nguoi-mat-tich-quay-ve",
  },
  {
    key: "g-hoi-nghi-co-dong-giay-bao-no-ban-quyen-duoc-chung-minh",
    label: "Hội nghị cổ đông / giấy báo nợ / bản quyền được chứng minh",
    slug: "hoi-nghi-co-dong-giay-bao-no-ban-quyen-duoc-chung-minh",
  },
  {
    key: "g-le-ra-mat-san-pham-toa-thuoc-gia-khach-khong-moi-lat-mat",
    label: "Lễ ra mắt sản phẩm / toa thuốc giả / khách không mời lật mặt",
    slug: "le-ra-mat-san-pham-toa-thuoc-gia-khach-khong-moi-lat-mat",
  },
  {
    key: "g-hop-bao-khung-hoang-bien-so-xe-la-hai-than-phan-va-vao-nhau",
    label: "Họp báo khủng hoảng / biển số xe lạ / hai thân phận va vào nhau",
    slug: "hop-bao-khung-hoang-bien-so-xe-la-hai-than-phan-va-vao-nhau",
  },
  {
    key: "g-studio-chup-anh-don-nhan-nuoi-chong-cu-muon-mang-hoi-han",
    label: "Studio chụp ảnh / đơn nhận nuôi / chồng cũ muộn màng hối hận",
    slug: "studio-chup-anh-don-nhan-nuoi-chong-cu-muon-mang-hoi-han",
  },
  {
    key: "g-phong-make-up-tin-nhan-nua-dem-thien-kim-that-lat-mat",
    label: "Phòng make-up / tin nhắn nửa đêm / thiên kim thật lật mặt",
    slug: "phong-make-up-tin-nhan-nua-dem-thien-kim-that-lat-mat",
  },
  {
    key: "g-phong-kham-tu-ho-chieu-gia-thu-cu-mo-khoa-bi-mat",
    label: "Phòng khám tư / hộ chiếu giả / thư cũ mở khóa bí mật",
    slug: "phong-kham-tu-ho-chieu-gia-thu-cu-mo-khoa-bi-mat",
  },
  {
    key: "g-khoa-cap-cuu-giay-khai-sinh-cu-nu-chinh-roi-di-dung-luc",
    label: "Khoa cấp cứu / giấy khai sinh cũ / nữ chính rời đi đúng lúc",
    slug: "khoa-cap-cuu-giay-khai-sinh-cu-nu-chinh-roi-di-dung-luc",
  },
  {
    key: "g-nha-tre-song-ngu-nhan-cuoi-khac-ten-ke-tong-tien-bi-phan-bay",
    label: "Nhà trẻ song ngữ / nhẫn cưới khắc tên / kẻ tống tiền bị phản bẫy",
    slug: "nha-tre-song-ngu-nhan-cuoi-khac-ten-ke-tong-tien-bi-phan-bay",
  },
  {
    key: "g-phong-bao-mau-chia-khoa-phong-cam-bao-luc-mang-bi-dao-chieu",
    label: "Phòng bảo mẫu / chìa khóa phòng cấm / bạo lực mạng bị đảo chiều",
    slug: "phong-bao-mau-chia-khoa-phong-cam-bao-luc-mang-bi-dao-chieu",
  },
  {
    key: "g-cong-vien-mua-dem-dong-ho-co-nu-giao-vien-lat-lai-su-that",
    label: "Công viên mưa đêm / đồng hồ cổ / nữ giáo viên lật lại sự thật",
    slug: "cong-vien-mua-dem-dong-ho-co-nu-giao-vien-lat-lai-su-that",
  },
  {
    key: "g-cua-hang-ao-cuoi-lich-su-dinh-vi-truyen-thong-bi-phan-don",
    label: "Cửa hàng áo cưới / lịch sử định vị / truyền thông bị phản đòn",
    slug: "cua-hang-ao-cuoi-lich-su-dinh-vi-truyen-thong-bi-phan-don",
  },
  {
    key: "g-xuong-thiet-ke-ho-so-nhan-su-me-ruot-bi-giau-kin",
    label: "Xưởng thiết kế / hồ sơ nhân sự / mẹ ruột bị giấu kín",
    slug: "xuong-thiet-ke-ho-so-nhan-su-me-ruot-bi-giau-kin",
  },
  {
    key: "g-kho-hang-bi-mat-sim-dien-thoai-cu-ban-sao-hop-dong-bien-mat",
    label: "Kho hàng bí mật / sim điện thoại cũ / bản sao hợp đồng biến mất",
    slug: "kho-hang-bi-mat-sim-dien-thoai-cu-ban-sao-hop-dong-bien-mat",
  },
  {
    key: "g-garage-xe-sang-ghe-trong-trong-tiec-dan-xep-bi-boc-phot",
    label: "Garage xe sang / ghế trống trong tiệc / dàn xếp bị bóc phốt",
    slug: "garage-xe-sang-ghe-trong-trong-tiec-dan-xep-bi-boc-phot",
  },
  {
    key: "g-cabin-xe-rieng-log-ra-vao-toa-nha-thoa-thuan-ngam-bi-nghe-thay",
    label: "Cabin xe riêng / log ra vào tòa nhà / thỏa thuận ngầm bị nghe thấy",
    slug: "cabin-xe-rieng-log-ra-vao-toa-nha-thoa-thuan-ngam-bi-nghe-thay",
  },
  {
    key: "g-duong-cao-toc-dem-bang-gac-co-dau-vet-ban-ngay-yeu-the-ban-dem-nam-quy",
    label: "Đường cao tốc đêm / băng gạc có dấu vết / ban ngày yếu thế ban đêm nắm quyền",
    slug: "duong-cao-toc-dem-bang-gac-co-dau-vet-ban-ngay-yeu-the-ban-dem-nam-quyen",
  },
  {
    key: "g-tram-dung-chan-giay-cao-got-gay-hon-le-dao-chieu",
    label: "Trạm dừng chân / giày cao gót gãy / hôn lễ đảo chiều",
    slug: "tram-dung-chan-giay-cao-got-gay-hon-le-dao-chieu",
  },
  {
    key: "g-nha-ga-san-bay-lich-hen-bac-si-thien-kim-gia-mat-cho-dua",
    label: "Nhà ga sân bay / lịch hẹn bác sĩ / thiên kim giả mất chỗ dựa",
    slug: "nha-ga-san-bay-lich-hen-bac-si-thien-kim-gia-mat-cho-dua",
  },
  {
    key: "g-khach-san-suoi-nuoc-nong-hop-dong-bao-mat-dam-dong-chung-kien-va-mat",
    label: "Khách sạn suối nước nóng / hợp đồng bảo mật / đám đông chứng kiến vả mặt",
    slug: "khach-san-suoi-nuoc-nong-hop-dong-bao-mat-dam-dong-chung-kien-va-mat",
  },
  {
    key: "g-phong-tra-rieng-boarding-pass-bi-xe-vi-hon-phu-bi-thay-the",
    label: "Phòng trà riêng / boarding pass bị xé / vị hôn phu bị thay thế",
    slug: "phong-tra-rieng-boarding-pass-bi-xe-vi-hon-phu-bi-thay-the",
  },
  {
    key: "g-lau-tra-co-hop-dong-co-phan-dem-mua-doi-so-phan",
    label: "Lầu trà cổ / hợp đồng cổ phần / đêm mưa đổi số phận",
    slug: "lau-tra-co-hop-dong-co-phan-dem-mua-doi-so-phan",
  },
  {
    key: "g-nha-hang-tren-cao-don-ly-hon-chua-ky-nguoi-bi-vu-oan-cuu-ca-gia-toc",
    label: "Nhà hàng trên cao / đơn ly hôn chưa ký / người bị vu oan cứu cả gia tộc",
    slug: "nha-hang-tren-cao-don-ly-hon-chua-ky-nguoi-bi-vu-oan-cuu-ca-gia-toc",
  },
  {
    key: "g-rooftop-bar-file-cloud-bi-xoa-ke-phan-boi-bi-ghi-am",
    label: "Rooftop bar / file cloud bị xóa / kẻ phản bội bị ghi âm",
    slug: "rooftop-bar-file-cloud-bi-xoa-ke-phan-boi-bi-ghi-am",
  },
  {
    key: "g-sanh-tap-doan-tin-vat-gia-toc-nguoi-giup-viec-giu-bi-mat",
    label: "Sảnh tập đoàn / tín vật gia tộc / người giúp việc giữ bí mật",
    slug: "sanh-tap-doan-tin-vat-gia-toc-nguoi-giup-viec-giu-bi-mat",
  },
  {
    key: "g-phong-chu-tich-clip-hau-truong-tai-san-doi-chu",
    label: "Phòng chủ tịch / clip hậu trường / tài sản đổi chủ",
    slug: "phong-chu-tich-clip-hau-truong-tai-san-doi-chu",
  },
  {
    key: "g-van-phong-thu-ky-don-to-cao-bi-giau-loi-noi-doi-bi-pha-ngay-tai-tiec",
    label: "Văn phòng thư ký / đơn tố cáo bị giấu / lời nói dối bị phá ngay tại tiệc",
    slug: "van-phong-thu-ky-don-to-cao-bi-giau-loi-noi-doi-bi-pha-ngay-tai-tiec",
  },
  {
    key: "g-phong-nhan-su-ma-ket-sat-nguoi-thua-ke-nu-doat-quyen",
    label: "Phòng nhân sự / mã két sắt / người thừa kế nữ đoạt quyền",
    slug: "phong-nhan-su-ma-ket-sat-nguoi-thua-ke-nu-doat-quyen",
  },
  {
    key: "g-phong-tai-chinh-ma-qr-ve-su-kien-gia-quy-phan-lai-nguoi-cam-quyen",
    label: "Phòng tài chính / mã QR vé sự kiện / gia quy phản lại người cầm quyền",
    slug: "phong-tai-chinh-ma-qr-ve-su-kien-gia-quy-phan-lai-nguoi-cam-quyen",
  },
  {
    key: "g-phong-phap-che-phieu-gui-do-ly-hon-cong-bo-dung-luc",
    label: "Phòng pháp chế / phiếu gửi đồ / ly hôn công bố đúng lúc",
    slug: "phong-phap-che-phieu-gui-do-ly-hon-cong-bo-dung-luc",
  },
  {
    key: "g-kho-luu-tru-cong-ty-so-kham-thai-nguoi-da-chet-bat-ngo-xuat-hien",
    label: "Kho lưu trữ công ty / sổ khám thai / người đã chết bất ngờ xuất hiện",
    slug: "kho-luu-tru-cong-ty-so-kham-thai-nguoi-da-chet-bat-ngo-xuat-hien",
  },
  {
    key: "g-phong-ho-so-benh-vien-khan-lua-bo-quen-hop-dong-gia-thanh-that",
    label: "Phòng hồ sơ bệnh viện / khăn lụa bỏ quên / hợp đồng giả thành thật",
    slug: "phong-ho-so-benh-vien-khan-lua-bo-quen-hop-dong-gia-thanh-that",
  },
  {
    key: "g-phong-cham-soc-tre-so-sinh-bai-dang-hot-search-hoi-dong-quan-tri-doi-p",
    label: "Phòng chăm sóc trẻ sơ sinh / bài đăng hot search / hội đồng quản trị đổi phe",
    slug: "phong-cham-soc-tre-so-sinh-bai-dang-hot-search-hoi-dong-quan-tri-doi-phe",
  },
  {
    key: "g-hanh-lang-benh-vien-bien-lai-nha-hang-danh-phan-bi-tra-lai",
    label: "Hành lang bệnh viện / biên lai nhà hàng / danh phận bị trả lại",
    slug: "hanh-lang-benh-vien-bien-lai-nha-hang-danh-phan-bi-tra-lai",
  },
  {
    key: "g-nha-nguyen-nho-camera-hanh-trinh-dem-tuyet-thanh-toan-no-cu",
    label: "Nhà nguyện nhỏ / camera hành trình / đêm tuyết thanh toán nợ cũ",
    slug: "nha-nguyen-nho-camera-hanh-trinh-dem-tuyet-thanh-toan-no-cu",
  },
  {
    key: "g-bai-bien-luc-binh-minh-bien-lai-chuyen-khoan-phien-dich-nghe-len-bi-ma",
    label: "Bãi biển lúc bình minh / biên lai chuyển khoản / phiên dịch nghe lén bí mật",
    slug: "bai-bien-luc-binh-minh-bien-lai-chuyen-khoan-phien-dich-nghe-len-bi-mat",
  },
  {
    key: "g-doi-tuyet-benh-an-bi-sua-nguoi-thua-ke-that-tro-ve",
    label: "Đồi tuyết / bệnh án bị sửa / người thừa kế thật trở về",
    slug: "doi-tuyet-benh-an-bi-sua-nguoi-thua-ke-that-tro-ve",
  },
  {
    key: "g-le-hoi-phao-hoa-usb-du-lieu-mat-bac-si-bi-mua-chuoc",
    label: "Lễ hội pháo hoa / USB dữ liệu mật / bác sĩ bị mua chuộc",
    slug: "le-hoi-phao-hoa-usb-du-lieu-mat-bac-si-bi-mua-chuoc",
  },
  {
    key: "g-cho-hoa-tet-so-tay-cua-me-phong-vip-lo-giao-dich",
    label: "Chợ hoa Tết / sổ tay của mẹ / phòng VIP lộ giao dịch",
    slug: "cho-hoa-tet-so-tay-cua-me-phong-vip-lo-giao-dich",
  },
  {
    key: "g-san-sau-biet-thu-mau-vai-bi-danh-trao-cuoc-goi-cuoi-lam-lo-hung-thu",
    label: "Sân sau biệt thự / mẫu vải bị đánh tráo / cuộc gọi cuối làm lộ hung thủ",
    slug: "san-sau-biet-thu-mau-vai-bi-danh-trao-cuoc-goi-cuoi-lam-lo-hung-thu",
  },
  {
    key: "g-vuon-kinh-do-choi-co-may-ghi-am-bang-chung-bi-trao-lan-hai",
    label: "Vườn kính / đồ chơi có máy ghi âm / bằng chứng bị tráo lần hai",
    slug: "vuon-kinh-do-choi-co-may-ghi-am-bang-chung-bi-trao-lan-hai",
  },
  {
    key: "g-nha-kinh-trong-hoa-so-co-dong-di-san-co-dieu-kien",
    label: "Nhà kính trồng hoa / sổ cổ đông / di sản có điều kiện",
    slug: "nha-kinh-trong-hoa-so-co-dong-di-san-co-dieu-kien",
  },
  {
    key: "g-trai-ngua-o-cung-di-dong-gia-chet-tro-ve-tra-thu",
    label: "Trại ngựa / ổ cứng di động / giả chết trở về trả thù",
    slug: "trai-ngua-o-cung-di-dong-gia-chet-tro-ve-tra-thu",
  },
  {
    key: "g-san-golf-hao-mon-thiep-chuc-mung-la-gia-toc-che-giau-than-phan",
    label: "Sân golf hào môn / thiệp chúc mừng lạ / gia tộc che giấu thân phận",
    slug: "san-golf-hao-mon-thiep-chuc-mung-la-gia-toc-che-giau-than-phan",
  },
  {
    key: "g-phong-piano-thoa-thuan-tien-chuoc-lien-hon-tro-thanh-cai-bay",
    label: "Phòng piano / thỏa thuận tiền chuộc / liên hôn trở thành cái bẫy",
    slug: "phong-piano-thoa-thuan-tien-chuoc-lien-hon-tro-thanh-cai-bay",
  },
  {
    key: "g-phong-tranh-rieng-lo-nuoc-hoa-la-doi-thu-tu-sa-bay",
    label: "Phòng tranh riêng / lọ nước hoa lạ / đối thủ tự sa bẫy",
    slug: "phong-tranh-rieng-lo-nuoc-hoa-la-doi-thu-tu-sa-bay",
  },
  {
    key: "g-khoang-thang-may-rieng-ve-gui-xe-nguoi-ngheo-gia-giau-that",
    label: "Khoang thang máy riêng / vé gửi xe / người nghèo giả giàu thật",
    slug: "khoang-thang-may-rieng-ve-gui-xe-nguoi-ngheo-gia-giau-that",
  },
  {
    key: "g-can-ho-bi-mat-giay-chung-tu-nghi-van-tet-doan-vien-va-mat-ho-hang",
    label: "Căn hộ bí mật / giấy chứng tử nghi vấn / Tết đoàn viên vả mặt họ hàng",
    slug: "can-ho-bi-mat-giay-chung-tu-nghi-van-tet-doan-vien-va-mat-ho-hang",
  },
  {
    key: "g-nha-an-toan-ghi-am-cuoc-goi-tiep-vien-giu-chuyen-bay-cuoi",
    label: "Nhà an toàn / ghi âm cuộc gọi / tiếp viên giữ chuyến bay cuối",
    slug: "nha-an-toan-ghi-am-cuoc-goi-tiep-vien-giu-chuyen-bay-cuoi",
  },
  {
    key: "g-phong-giam-sat-camera-the-phong-khach-san-tieu-tam-tu-lo-so-ho",
    label: "Phòng giám sát camera / thẻ phòng khách sạn / tiểu tam tự lộ sơ hở",
    slug: "phong-giam-sat-camera-the-phong-khach-san-tieu-tam-tu-lo-so-ho",
  },
  {
    key: "g-trung-tam-du-lieu-ket-qua-adn-luat-su-tung-bang-chung",
    label: "Trung tâm dữ liệu / kết quả ADN / luật sư tung bằng chứng",
    slug: "trung-tam-du-lieu-ket-qua-adn-luat-su-tung-bang-chung",
  },
  {
    key: "g-dai-truyen-hinh-vay-cuoi-rach-camera-mat-bay-phut",
    label: "Đài truyền hình / váy cưới rách / camera mất bảy phút",
    slug: "dai-truyen-hinh-vay-cuoi-rach-camera-mat-bay-phut",
  },
  {
    key: "g-phong-bien-tap-buc-thu-nac-danh-bao-hiem-he-am-muu",
    label: "Phòng biên tập / bức thư nặc danh / bảo hiểm hé âm mưu",
    slug: "phong-bien-tap-buc-thu-nac-danh-bao-hiem-he-am-muu",
  },
  {
    key: "g-van-phong-kol-manh-giay-trong-sach-tin-nhan-gui-nham-cuu-mang",
    label: "Văn phòng KOL / mảnh giấy trong sách / tin nhắn gửi nhầm cứu mạng",
    slug: "van-phong-kol-manh-giay-trong-sach-tin-nhan-gui-nham-cuu-mang",
  },
  {
    key: "g-studio-podcast-anh-dinh-vi-khach-san-cap-song-sinh-trao-than-phan",
    label: "Studio podcast / ảnh định vị khách sạn / cặp song sinh tráo thân phận",
    slug: "studio-podcast-anh-dinh-vi-khach-san-cap-song-sinh-trao-than-phan",
  },
  {
    key: "g-san-khau-trao-giai-quyet-dinh-sa-thai-ky-uc-quay-lai-dung-phien-toa",
    label: "Sân khấu trao giải / quyết định sa thải / ký ức quay lại đúng phiên tòa",
    slug: "san-khau-trao-giai-quyet-dinh-sa-thai-ky-uc-quay-lai-dung-phien-toa",
  },
  {
    key: "g-buoi-thu-vai-dien-thoai-bi-vo-co-phan-bi-chuyen-nguoc",
    label: "Buổi thử vai / điện thoại bị vỡ / cổ phần bị chuyển ngược",
    slug: "buoi-thu-vai-dien-thoai-bi-vo-co-phan-bi-chuyen-nguoc",
  },
  {
    key: "g-phong-casting-hoa-cuoi-gui-nham-cha-ruot-xuat-hien",
    label: "Phòng casting / hoa cưới gửi nhầm / cha ruột xuất hiện",
    slug: "phong-casting-hoa-cuoi-gui-nham-cha-ruot-xuat-hien",
  },
  {
    key: "g-hau-truong-concert-hop-dong-thue-nha-nguoi-mat-tich-quay-ve",
    label: "Hậu trường concert / hợp đồng thuê nhà / người mất tích quay về",
    slug: "hau-truong-concert-hop-dong-thue-nha-nguoi-mat-tich-quay-ve",
  },
  {
    key: "g-phong-tap-vu-dao-thuoc-bi-doi-ban-quyen-duoc-chung-minh",
    label: "Phòng tập vũ đạo / thuốc bị đổi / bản quyền được chứng minh",
    slug: "phong-tap-vu-dao-thuoc-bi-doi-ban-quyen-duoc-chung-minh",
  },
  {
    key: "g-san-dau-gia-co-vat-the-nhan-vien-cu-khach-khong-moi-lat-mat",
    label: "Sàn đấu giá cổ vật / thẻ nhân viên cũ / khách không mời lật mặt",
    slug: "san-dau-gia-co-vat-the-nhan-vien-cu-khach-khong-moi-lat-mat",
  },
  {
    key: "g-bao-tang-tu-nhan-hop-dong-hon-nhan-hai-than-phan-va-vao-nhau",
    label: "Bảo tàng tư nhân / hợp đồng hôn nhân / hai thân phận va vào nhau",
    slug: "bao-tang-tu-nhan-hop-dong-hon-nhan-hai-than-phan-va-vao-nhau",
  },
  {
    key: "g-tu-bao-hiem-ngan-hang-anh-chup-man-hinh-chong-cu-muon-mang-hoi-han",
    label: "Tủ bảo hiểm ngân hàng / ảnh chụp màn hình / chồng cũ muộn màng hối hận",
    slug: "tu-bao-hiem-ngan-hang-anh-chup-man-hinh-chong-cu-muon-mang-hoi-han",
  },
  {
    key: "g-phong-ket-biet-thu-vali-khoa-so-thien-kim-that-lat-mat",
    label: "Phòng két biệt thự / vali khóa số / thiên kim thật lật mặt",
    slug: "phong-ket-biet-thu-vali-khoa-so-thien-kim-that-lat-mat",
  },
  {
    key: "g-kho-do-cu-di-chuc-viet-tay-thu-cu-mo-khoa-bi-mat",
    label: "Kho đồ cũ / di chúc viết tay / thư cũ mở khóa bí mật",
    slug: "kho-do-cu-di-chuc-viet-tay-thu-cu-mo-khoa-bi-mat",
  },
  {
    key: "g-nha-kho-cang-bien-thiep-cuoi-bi-giau-nu-chinh-roi-di-dung-luc",
    label: "Nhà kho cảng biển / thiệp cưới bị giấu / nữ chính rời đi đúng lúc",
    slug: "nha-kho-cang-bien-thiep-cuoi-bi-giau-nu-chinh-roi-di-dung-luc",
  },
  {
    key: "g-cang-du-thuyen-mat-khau-ket-sat-ke-tong-tien-bi-phan-bay",
    label: "Cảng du thuyền / mật khẩu két sắt / kẻ tống tiền bị phản bẫy",
    slug: "cang-du-thuyen-mat-khau-ket-sat-ke-tong-tien-bi-phan-bay",
  },
  {
    key: "g-phong-cho-luat-su-vong-co-thua-ke-bao-luc-mang-bi-dao-chieu",
    label: "Phòng chờ luật sư / vòng cổ thừa kế / bạo lực mạng bị đảo chiều",
    slug: "phong-cho-luat-su-vong-co-thua-ke-bao-luc-mang-bi-dao-chieu",
  },
  {
    key: "g-trai-giam-tham-gap-ban-thu-am-phong-hop-nu-giao-vien-lat-lai-su-that",
    label: "Trại giam thăm gặp / bản thu âm phòng họp / nữ giáo viên lật lại sự thật",
    slug: "trai-giam-tham-gap-ban-thu-am-phong-hop-nu-giao-vien-lat-lai-su-that",
  },
  {
    key: "g-phong-hoa-giai-giay-uy-quyen-gia-truyen-thong-bi-phan-don",
    label: "Phòng hòa giải / giấy ủy quyền giả / truyền thông bị phản đòn",
    slug: "phong-hoa-giai-giay-uy-quyen-gia-truyen-thong-bi-phan-don",
  },
  {
    key: "g-van-phong-cong-chung-tep-anh-phuc-hoi-me-ruot-bi-giau-kin",
    label: "Văn phòng công chứng / tệp ảnh phục hồi / mẹ ruột bị giấu kín",
    slug: "van-phong-cong-chung-tep-anh-phuc-hoi-me-ruot-bi-giau-kin",
  },
  {
    key: "g-phong-dang-ky-ket-hon-danh-sach-khach-moi-ban-sao-hop-dong-bien-mat",
    label: "Phòng đăng ký kết hôn / danh sách khách mời / bản sao hợp đồng biến mất",
    slug: "phong-dang-ky-ket-hon-danh-sach-khach-moi-ban-sao-hop-dong-bien-mat",
  },
  {
    key: "g-cuc-ho-tich-camera-thang-may-dan-xep-bi-boc-phot",
    label: "Cục hộ tịch / camera thang máy / dàn xếp bị bóc phốt",
    slug: "cuc-ho-tich-camera-thang-may-dan-xep-bi-boc-phot",
  },
  {
    key: "g-phong-bao-hiem-mau-toc-xet-nghiem-thoa-thuan-ngam-bi-nghe-thay",
    label: "Phòng bảo hiểm / mẫu tóc xét nghiệm / thỏa thuận ngầm bị nghe thấy",
    slug: "phong-bao-hiem-mau-toc-xet-nghiem-thoa-thuan-ngam-bi-nghe-thay",
  },
  {
    key: "g-trung-tam-xet-nghiem-cuc-ao-roi-ban-ngay-yeu-the-ban-dem-nam-quyen",
    label: "Trung tâm xét nghiệm / cúc áo rơi / ban ngày yếu thế ban đêm nắm quyền",
    slug: "trung-tam-xet-nghiem-cuc-ao-roi-ban-ngay-yeu-the-ban-dem-nam-quyen",
  },
  {
    key: "g-nha-khach-gia-toc-ban-nhap-thong-cao-hon-le-dao-chieu",
    label: "Nhà khách gia tộc / bản nháp thông cáo / hôn lễ đảo chiều",
    slug: "nha-khach-gia-toc-ban-nhap-thong-cao-hon-le-dao-chieu",
  },
  {
    key: "g-khu-duong-lao-cao-cap-ma-phong-vip-thien-kim-gia-mat-cho-dua",
    label: "Khu dưỡng lão cao cấp / mã phòng VIP / thiên kim giả mất chỗ dựa",
    slug: "khu-duong-lao-cao-cap-ma-phong-vip-thien-kim-gia-mat-cho-dua",
  },
  {
    key: "g-phong-cham-soc-dac-biet-ve-may-bay-mot-chieu-dam-dong-chung-kien-va-ma",
    label: "Phòng chăm sóc đặc biệt / vé máy bay một chiều / đám đông chứng kiến vả mặt",
    slug: "phong-cham-soc-dac-biet-ve-may-bay-mot-chieu-dam-dong-chung-kien-va-mat",
  },
  {
    key: "g-nha-hang-tiec-cuoi-sao-ke-ngan-hang-nguoi-chong-tuong-thang-lai-thua",
    label: "Nhà hàng tiệc cưới / sao kê ngân hàng / người chồng tưởng thắng lại thua",
    slug: "nha-hang-tiec-cuoi-sao-ke-ngan-hang-nguoi-chong-tuong-thang-lai-thua",
  },
  {
    key: "g-phong-co-dau-phieu-xet-nghiem-doi-ten-nguoi-im-lang-moi-la-chu-muu",
    label: "Phòng cô dâu / phiếu xét nghiệm đổi tên / người im lặng mới là chủ mưu",
    slug: "phong-co-dau-phieu-xet-nghiem-doi-ten-nguoi-im-lang-moi-la-chu-muu",
  },
  {
    key: "g-phong-chu-re-email-noi-bo-sep-cu-gap-lai-than-phan-moi",
    label: "Phòng chú rể / email nội bộ / sếp cũ gặp lại thân phận mới",
    slug: "phong-chu-re-email-noi-bo-sep-cu-gap-lai-than-phan-moi",
  },
  {
    key: "g-sanh-chung-cu-dem-buc-tranh-bi-che-nguoi-bi-khinh-that-ra-nam-quyen",
    label: "Sảnh chung cư đêm / bức tranh bị che / người bị khinh thật ra nắm quyền",
    slug: "sanh-chung-cu-dem-buc-tranh-bi-che-nguoi-bi-khinh-that-ra-nam-quyen",
  },
  {
    key: "g-ban-cong-tang-cao-hop-dong-quang-cao-den-nhan-chung-doi-phe",
    label: "Ban công tầng cao / hợp đồng quảng cáo đen / nhân chứng đổi phe",
    slug: "ban-cong-tang-cao-hop-dong-quang-cao-den-nhan-chung-doi-phe",
  },
  {
    key: "g-cau-thang-thoat-hiem-bao-hiem-nguoi-thu-huong-ke-dung-sau-la-nguoi-tha",
    label: "Cầu thang thoát hiểm / bảo hiểm người thụ hưởng / kẻ đứng sau là người thân",
    slug: "cau-thang-thoat-hiem-bao-hiem-nguoi-thu-huong-ke-dung-sau-la-nguoi-than",
  },
  {
    key: "g-hanh-lang-khach-san-bien-ban-hoi-dong-dau-vet-nho-lat-an",
    label: "Hành lang khách sạn / biên bản hội đồng / dấu vết nhỏ lật án",
    slug: "hanh-lang-khach-san-bien-ban-hoi-dong-dau-vet-nho-lat-an",
  },
  {
    key: "g-phong-camera-khach-san-the-nho-camera-dong-sang-lap-phan-boi-bi-loai",
    label: "Phòng camera khách sạn / thẻ nhớ camera / đồng sáng lập phản bội bị loại",
    slug: "phong-camera-khach-san-the-nho-camera-dong-sang-lap-phan-boi-bi-loai",
  },
  {
    key: "g-quay-le-tan-hoa-don-trang-suc-bi-mat-chim-noi-len",
    label: "Quầy lễ tân / hóa đơn trang sức / bí mật chìm nổi lên",
    slug: "quay-le-tan-hoa-don-trang-suc-bi-mat-chim-noi-len",
  },
  {
    key: "g-phong-giat-la-anh-sieu-am-co-dau-bo-tron-phan-don",
    label: "Phòng giặt là / ảnh siêu âm / cô dâu bỏ trốn phản đòn",
    slug: "phong-giat-la-anh-sieu-am-co-dau-bo-tron-phan-don",
  },
  {
    key: "g-kho-ruou-nha-hang-son-moi-tren-ly-dua-tre-khong-phai-con-ruot",
    label: "Kho rượu nhà hàng / son môi trên ly / đứa trẻ không phải con ruột",
    slug: "kho-ruou-nha-hang-son-moi-tren-ly-dua-tre-khong-phai-con-ruot",
  },
  {
    key: "g-san-thuong-mua-doan-chat-nhom-gia-dinh-nguoi-cu-tro-ve-dung-luc",
    label: "Sân thượng mưa / đoạn chat nhóm gia đình / người cũ trở về đúng lúc",
    slug: "san-thuong-mua-doan-chat-nhom-gia-dinh-nguoi-cu-tro-ve-dung-luc",
  },
  {
    key: "g-ga-tau-cu-anh-camera-bai-xe-nguoi-quy-goi-xin-loi",
    label: "Ga tàu cũ / ảnh camera bãi xe / người quỳ gối xin lỗi",
    slug: "ga-tau-cu-anh-camera-bai-xe-nguoi-quy-goi-xin-loi",
  },
  {
    key: "g-chuyen-tau-dem-video-camera-hanh-lang-vi-hon-phu-bi-thay-the",
    label: "Chuyến tàu đêm / video camera hành lang / vị hôn phu bị thay thế",
    slug: "chuyen-tau-dem-video-camera-hanh-lang-vi-hon-phu-bi-thay-the",
  },
  {
    key: "g-ben-xe-lien-tinh-hoa-don-minibar-dem-mua-doi-so-phan",
    label: "Bến xe liên tỉnh / hóa đơn minibar / đêm mưa đổi số phận",
    slug: "ben-xe-lien-tinh-hoa-don-minibar-dem-mua-doi-so-phan",
  },
  {
    key: "g-phong-cho-vip-vong-tay-tre-so-sinh-nguoi-bi-vu-oan-cuu-ca-gia-toc",
    label: "Phòng chờ VIP / vòng tay trẻ sơ sinh / người bị vu oan cứu cả gia tộc",
    slug: "phong-cho-vip-vong-tay-tre-so-sinh-nguoi-bi-vu-oan-cuu-ca-gia-toc",
  },
  {
    key: "g-cua-khau-anh-cuoi-bi-cat-nguoi-thua-ke-that-tro-ve",
    label: "Cửa khẩu / ảnh cưới bị cắt / người thừa kế thật trở về",
    slug: "cua-khau-anh-cuoi-bi-cat-nguoi-thua-ke-that-tro-ve",
  },
  {
    key: "g-lanh-su-quan-nhat-ky-cu-bac-si-bi-mua-chuoc",
    label: "Lãnh sự quán / nhật ký cũ / bác sĩ bị mua chuộc",
    slug: "lanh-su-quan-nhat-ky-cu-bac-si-bi-mua-chuoc",
  },
  {
    key: "g-van-phong-phien-dich-ban-thiet-ke-goc-phong-vip-lo-giao-dich",
    label: "Văn phòng phiên dịch / bản thiết kế gốc / phòng VIP lộ giao dịch",
    slug: "van-phong-phien-dich-ban-thiet-ke-goc-phong-vip-lo-giao-dich",
  },
  {
    key: "g-phong-hop-quoc-te-camera-phong-tre-cuoc-goi-cuoi-lam-lo-hung-thu",
    label: "Phòng họp quốc tế / camera phòng trẻ / cuộc gọi cuối làm lộ hung thủ",
    slug: "phong-hop-quoc-te-camera-phong-tre-cuoc-goi-cuoi-lam-lo-hung-thu",
  },
  {
    key: "g-hoi-cho-thuong-mai-bang-luong-bi-mat-bang-chung-bi-trao-lan-hai",
    label: "Hội chợ thương mại / bảng lương bí mật / bằng chứng bị tráo lần hai",
    slug: "hoi-cho-thuong-mai-bang-luong-bi-mat-bang-chung-bi-trao-lan-hai",
  },
  {
    key: "g-nha-may-gia-dinh-laptop-bi-khoa-di-san-co-dieu-kien",
    label: "Nhà máy gia đình / laptop bị khóa / di sản có điều kiện",
    slug: "nha-may-gia-dinh-laptop-bi-khoa-di-san-co-dieu-kien",
  },
  {
    key: "g-xuong-may-hop-qua-sinh-nhat-gia-chet-tro-ve-tra-thu",
    label: "Xưởng may / hộp quà sinh nhật / giả chết trở về trả thù",
    slug: "xuong-may-hop-qua-sinh-nhat-gia-chet-tro-ve-tra-thu",
  },
  {
    key: "g-kho-lanh-giay-bao-no-gia-toc-che-giau-than-phan",
    label: "Kho lạnh / giấy báo nợ / gia tộc che giấu thân phận",
    slug: "kho-lanh-giay-bao-no-gia-toc-che-giau-than-phan",
  },
  {
    key: "g-trang-trai-ngoai-o-toa-thuoc-gia-lien-hon-tro-thanh-cai-bay",
    label: "Trang trại ngoại ô / toa thuốc giả / liên hôn trở thành cái bẫy",
    slug: "trang-trai-ngoai-o-toa-thuoc-gia-lien-hon-tro-thanh-cai-bay",
  },
  {
    key: "g-nha-tho-hon-le-bien-so-xe-la-doi-thu-tu-sa-bay",
    label: "Nhà thờ hôn lễ / biển số xe lạ / đối thủ tự sa bẫy",
    slug: "nha-tho-hon-le-bien-so-xe-la-doi-thu-tu-sa-bay",
  },
  {
    key: "g-san-truong-cu-don-nhan-nuoi-nguoi-ngheo-gia-giau-that",
    label: "Sân trường cũ / đơn nhận nuôi / người nghèo giả giàu thật",
    slug: "san-truong-cu-don-nhan-nuoi-nguoi-ngheo-gia-giau-that",
  },
  {
    key: "g-thu-vien-dai-hoc-tin-nhan-nua-dem-tet-doan-vien-va-mat-ho-hang",
    label: "Thư viện đại học / tin nhắn nửa đêm / Tết đoàn viên vả mặt họ hàng",
    slug: "thu-vien-dai-hoc-tin-nhan-nua-dem-tet-doan-vien-va-mat-ho-hang",
  },
  {
    key: "g-phong-y-te-truong-ho-chieu-gia-tiep-vien-giu-chuyen-bay-cuoi",
    label: "Phòng y tế trường / hộ chiếu giả / tiếp viên giữ chuyến bay cuối",
    slug: "phong-y-te-truong-ho-chieu-gia-tiep-vien-giu-chuyen-bay-cuoi",
  },
  {
    key: "g-phong-hieu-truong-giay-khai-sinh-cu-tieu-tam-tu-lo-so-ho",
    label: "Phòng hiệu trưởng / giấy khai sinh cũ / tiểu tam tự lộ sơ hở",
    slug: "phong-hieu-truong-giay-khai-sinh-cu-tieu-tam-tu-lo-so-ho",
  },
  {
    key: "g-cong-truong-luc-mua-nhan-cuoi-khac-ten-luat-su-tung-bang-chung",
    label: "Cổng trường lúc mưa / nhẫn cưới khắc tên / luật sư tung bằng chứng",
    slug: "cong-truong-luc-mua-nhan-cuoi-khac-ten-luat-su-tung-bang-chung",
  },
  {
    key: "g-khu-pho-cu-chia-khoa-phong-cam-camera-mat-bay-phut",
    label: "Khu phố cũ / chìa khóa phòng cấm / camera mất bảy phút",
    slug: "khu-pho-cu-chia-khoa-phong-cam-camera-mat-bay-phut",
  },
  {
    key: "g-tiem-anh-cu-dong-ho-co-bao-hiem-he-am-muu",
    label: "Tiệm ảnh cũ / đồng hồ cổ / bảo hiểm hé âm mưu",
    slug: "tiem-anh-cu-dong-ho-co-bao-hiem-he-am-muu",
  },
  {
    key: "g-tiem-sua-dien-thoai-lich-su-dinh-vi-tin-nhan-gui-nham-cuu-mang",
    label: "Tiệm sửa điện thoại / lịch sử định vị / tin nhắn gửi nhầm cứu mạng",
    slug: "tiem-sua-dien-thoai-lich-su-dinh-vi-tin-nhan-gui-nham-cuu-mang",
  },
  {
    key: "g-cua-hang-dong-ho-ho-so-nhan-su-cap-song-sinh-trao-than-phan",
    label: "Cửa hàng đồng hồ / hồ sơ nhân sự / cặp song sinh tráo thân phận",
    slug: "cua-hang-dong-ho-ho-so-nhan-su-cap-song-sinh-trao-than-phan",
  },
  {
    key: "g-tiem-banh-gia-dinh-sim-dien-thoai-cu-ky-uc-quay-lai-dung-phien-toa",
    label: "Tiệm bánh gia đình / sim điện thoại cũ / ký ức quay lại đúng phiên tòa",
    slug: "tiem-banh-gia-dinh-sim-dien-thoai-cu-ky-uc-quay-lai-dung-phien-toa",
  },
  {
    key: "g-quan-an-dem-ghe-trong-trong-tiec-co-phan-bi-chuyen-nguoc",
    label: "Quán ăn đêm / ghế trống trong tiệc / cổ phần bị chuyển ngược",
    slug: "quan-an-dem-ghe-trong-trong-tiec-co-phan-bi-chuyen-nguoc",
  },
  {
    key: "g-phong-karaoke-rieng-log-ra-vao-toa-nha-nguoi-bao-ve-la-dai-thieu-gia",
    label: "Phòng karaoke riêng / log ra vào tòa nhà / người bảo vệ là đại thiếu gia",
    slug: "phong-karaoke-rieng-log-ra-vao-toa-nha-nguoi-bao-ve-la-dai-thieu-gia",
  },
  {
    key: "g-ktv-hao-mon-bang-gac-co-dau-vet-moi-tinh-cu-thanh-nhan-chung",
    label: "KTV hào môn / băng gạc có dấu vết / mối tình cũ thành nhân chứng",
    slug: "ktv-hao-mon-bang-gac-co-dau-vet-moi-tinh-cu-thanh-nhan-chung",
  },
  {
    key: "g-casino-tren-du-thuyen-giay-cao-got-gay-bi-sa-thai-roi-quay-lai-lam-sep",
    label: "Casino trên du thuyền / giày cao gót gãy / bị sa thải rồi quay lại làm sếp",
    slug: "casino-tren-du-thuyen-giay-cao-got-gay-bi-sa-thai-roi-quay-lai-lam-sep",
  },
  {
    key: "g-spa-cao-cap-lich-hen-bac-si-mon-qua-phan-boi-bi-mo-ra",
    label: "Spa cao cấp / lịch hẹn bác sĩ / món quà phản bội bị mở ra",
    slug: "spa-cao-cap-lich-hen-bac-si-mon-qua-phan-boi-bi-mo-ra",
  },
  {
    key: "g-phong-tri-lieu-tam-ly-hop-dong-bao-mat-ve-si-che-giau-than-phan",
    label: "Phòng trị liệu tâm lý / hợp đồng bảo mật / vệ sĩ che giấu thân phận",
    slug: "phong-tri-lieu-tam-ly-hop-dong-bao-mat-ve-si-che-giau-than-phan",
  },
  {
    key: "g-studio-yoga-boarding-pass-bi-xe-me-chong-bi-phan-don",
    label: "Studio yoga / boarding pass bị xé / mẹ chồng bị phản đòn",
    slug: "studio-yoga-boarding-pass-bi-xe-me-chong-bi-phan-don",
  },
  {
    key: "g-phong-hop-bi-mat-hop-dong-co-phan-nu-chinh-tu-cuu-danh-tieng",
    label: "Phòng họp bí mật / hợp đồng cổ phần / nữ chính tự cứu danh tiếng",
    slug: "phong-hop-bi-mat-hop-dong-co-phan-nu-chinh-tu-cuu-danh-tieng",
  },
  {
    key: "g-can-phong-khoa-trai-don-ly-hon-chua-ky-du-lieu-bi-phuc-hoi",
    label: "Căn phòng khóa trái / đơn ly hôn chưa ký / dữ liệu bị phục hồi",
    slug: "can-phong-khoa-trai-don-ly-hon-chua-ky-du-lieu-bi-phuc-hoi",
  },
  {
    key: "g-tang-ap-mai-file-cloud-bi-xoa-dua-tre-nhan-ra-su-that",
    label: "Tầng áp mái / file cloud bị xóa / đứa trẻ nhận ra sự thật",
    slug: "tang-ap-mai-file-cloud-bi-xoa-dua-tre-nhan-ra-su-that",
  },
  {
    key: "g-tang-ham-biet-thu-tin-vat-gia-toc-loi-canh-bao-thanh-su-that",
    label: "Tầng hầm biệt thự / tín vật gia tộc / lời cảnh báo thành sự thật",
    slug: "tang-ham-biet-thu-tin-vat-gia-toc-loi-canh-bao-thanh-su-that",
  },
  {
    key: "g-loi-thoat-hiem-clip-hau-truong-co-gai-que-la-chu-tich-an-danh",
    label: "Lối thoát hiểm / clip hậu trường / cô gái quê là chủ tịch ẩn danh",
    slug: "loi-thoat-hiem-clip-hau-truong-co-gai-que-la-chu-tich-an-danh",
  },
  {
    key: "g-san-sau-benh-vien-don-to-cao-bi-giau-nu-bac-si-tu-minh-oan",
    label: "Sân sau bệnh viện / đơn tố cáo bị giấu / nữ bác sĩ tự minh oan",
    slug: "san-sau-benh-vien-don-to-cao-bi-giau-nu-bac-si-tu-minh-oan",
  },
  {
    key: "g-nha-xac-benh-vien-ma-ket-sat-hot-search-quay-xe",
    label: "Nhà xác bệnh viện / mã két sắt / hot search quay xe",
    slug: "nha-xac-benh-vien-ma-ket-sat-hot-search-quay-xe",
  },
  {
    key: "g-phong-luu-mau-ma-qr-ve-su-kien-cha-ruot-xuat-hien",
    label: "Phòng lưu mẫu / mã QR vé sự kiện / cha ruột xuất hiện",
    slug: "phong-luu-mau-ma-qr-ve-su-kien-cha-ruot-xuat-hien",
  },
  {
    key: "g-quay-thuoc-tu-nhan-phieu-gui-do-nguoi-mat-tich-quay-ve",
    label: "Quầy thuốc tư nhân / phiếu gửi đồ / người mất tích quay về",
    slug: "quay-thuoc-tu-nhan-phieu-gui-do-nguoi-mat-tich-quay-ve",
  },
  {
    key: "g-kho-ho-so-luat-su-so-kham-thai-ban-quyen-duoc-chung-minh",
    label: "Kho hồ sơ luật sư / sổ khám thai / bản quyền được chứng minh",
    slug: "kho-ho-so-luat-su-so-kham-thai-ban-quyen-duoc-chung-minh",
  },
  {
    key: "g-biet-thu-ven-ho-cuc-ao-roi-thoa-thuan-ngam-bi-nghe-thay",
    label: "Biệt thự ven hồ / cúc áo rơi / thỏa thuận ngầm bị nghe thấy",
    slug: "biet-thu-ven-ho-cuc-ao-roi-thoa-thuan-ngam-bi-nghe-thay",
  },
  {
    key: "g-penthouse-tang-cao-ban-nhap-thong-cao-ban-ngay-yeu-the-ban-dem-nam-quy",
    label: "Penthouse tầng cao / bản nháp thông cáo / ban ngày yếu thế ban đêm nắm quyền",
    slug: "penthouse-tang-cao-ban-nhap-thong-cao-ban-ngay-yeu-the-ban-dem-nam-quyen",
  },
  {
    key: "g-phong-hop-hoi-dong-ma-phong-vip-hon-le-dao-chieu",
    label: "Phòng họp hội đồng / mã phòng VIP / hôn lễ đảo chiều",
    slug: "phong-hop-hoi-dong-ma-phong-vip-hon-le-dao-chieu",
  },
  {
    key: "g-sanh-khach-san-5-sao-ve-may-bay-mot-chieu-thien-kim-gia-mat-cho-dua",
    label: "Sảnh khách sạn 5 sao / vé máy bay một chiều / thiên kim giả mất chỗ dựa",
    slug: "sanh-khach-san-5-sao-ve-may-bay-mot-chieu-thien-kim-gia-mat-cho-dua",
  },
  {
    key: "g-thang-may-kinh-sao-ke-ngan-hang-dam-dong-chung-kien-va-mat",
    label: "Thang máy kính / sao kê ngân hàng / đám đông chứng kiến vả mặt",
    slug: "thang-may-kinh-sao-ke-ngan-hang-dam-dong-chung-kien-va-mat",
  },
  {
    key: "g-bai-do-xe-tang-ham-phieu-xet-nghiem-doi-ten-nguoi-chong-tuong-thang-la",
    label: "Bãi đỗ xe tầng hầm / phiếu xét nghiệm đổi tên / người chồng tưởng thắng lại thua",
    slug: "bai-do-xe-tang-ham-phieu-xet-nghiem-doi-ten-nguoi-chong-tuong-thang-lai-thua",
  },
  {
    key: "g-phong-vip-benh-vien-email-noi-bo-nguoi-im-lang-moi-la-chu-muu",
    label: "Phòng VIP bệnh viện / email nội bộ / người im lặng mới là chủ mưu",
    slug: "phong-vip-benh-vien-email-noi-bo-nguoi-im-lang-moi-la-chu-muu",
  },
  {
    key: "g-khoa-san-nua-dem-buc-tranh-bi-che-sep-cu-gap-lai-than-phan-moi",
    label: "Khoa sản nửa đêm / bức tranh bị che / sếp cũ gặp lại thân phận mới",
    slug: "khoa-san-nua-dem-buc-tranh-bi-che-sep-cu-gap-lai-than-phan-moi",
  },
  {
    key: "g-phong-xet-nghiem-adn-hop-dong-quang-cao-den-nguoi-bi-khinh-that-ra-nam",
    label: "Phòng xét nghiệm ADN / hợp đồng quảng cáo đen / người bị khinh thật ra nắm quyền",
    slug: "phong-xet-nghiem-adn-hop-dong-quang-cao-den-nguoi-bi-khinh-that-ra-nam-quyen",
  },
  {
    key: "g-nha-tang-le-bao-hiem-nguoi-thu-huong-nhan-chung-doi-phe",
    label: "Nhà tang lễ / bảo hiểm người thụ hưởng / nhân chứng đổi phe",
    slug: "nha-tang-le-bao-hiem-nguoi-thu-huong-nhan-chung-doi-phe",
  },
  {
    key: "g-le-dinh-hon-hao-mon-bien-ban-hoi-dong-ke-dung-sau-la-nguoi-than",
    label: "Lễ đính hôn hào môn / biên bản hội đồng / kẻ đứng sau là người thân",
    slug: "le-dinh-hon-hao-mon-bien-ban-hoi-dong-ke-dung-sau-la-nguoi-than",
  },
  {
    key: "g-hon-le-trong-mua-the-nho-camera-dau-vet-nho-lat-an",
    label: "Hôn lễ trong mưa / thẻ nhớ camera / dấu vết nhỏ lật án",
    slug: "hon-le-trong-mua-the-nho-camera-dau-vet-nho-lat-an",
  },
  {
    key: "g-tiec-tu-thien-hoa-don-trang-suc-dong-sang-lap-phan-boi-bi-loai",
    label: "Tiệc từ thiện / hóa đơn trang sức / đồng sáng lập phản bội bị loại",
    slug: "tiec-tu-thien-hoa-don-trang-suc-dong-sang-lap-phan-boi-bi-loai",
  },
  {
    key: "g-da-tiec-dau-gia-anh-sieu-am-bi-mat-chim-noi-len",
    label: "Dạ tiệc đấu giá / ảnh siêu âm / bí mật chìm nổi lên",
    slug: "da-tiec-dau-gia-anh-sieu-am-bi-mat-chim-noi-len",
  },
  {
    key: "g-du-thuyen-dem-son-moi-tren-ly-co-dau-bo-tron-phan-don",
    label: "Du thuyền đêm / son môi trên ly / cô dâu bỏ trốn phản đòn",
    slug: "du-thuyen-dem-son-moi-tren-ly-co-dau-bo-tron-phan-don",
  },
  {
    key: "g-san-bay-quoc-te-doan-chat-nhom-gia-dinh-dua-tre-khong-phai-con-ruot",
    label: "Sân bay quốc tế / đoạn chat nhóm gia đình / đứa trẻ không phải con ruột",
    slug: "san-bay-quoc-te-doan-chat-nhom-gia-dinh-dua-tre-khong-phai-con-ruot",
  },
  {
    key: "g-khoang-hang-thuong-gia-anh-camera-bai-xe-nguoi-cu-tro-ve-dung-luc",
    label: "Khoang hạng thương gia / ảnh camera bãi xe / người cũ trở về đúng lúc",
    slug: "khoang-hang-thuong-gia-anh-camera-bai-xe-nguoi-cu-tro-ve-dung-luc",
  },
  {
    key: "g-nha-ga-cao-toc-video-camera-hanh-lang-nguoi-quy-goi-xin-loi",
    label: "Nhà ga cao tốc / video camera hành lang / người quỳ gối xin lỗi",
    slug: "nha-ga-cao-toc-video-camera-hanh-lang-nguoi-quy-goi-xin-loi",
  },
  {
    key: "g-khu-nghi-duong-bien-hoa-don-minibar-vi-hon-phu-bi-thay-the",
    label: "Khu nghỉ dưỡng biển / hóa đơn minibar / vị hôn phu bị thay thế",
    slug: "khu-nghi-duong-bien-hoa-don-minibar-vi-hon-phu-bi-thay-the",
  },
  {
    key: "g-villa-rieng-tu-vong-tay-tre-so-sinh-dem-mua-doi-so-phan",
    label: "Villa riêng tư / vòng tay trẻ sơ sinh / đêm mưa đổi số phận",
    slug: "villa-rieng-tu-vong-tay-tre-so-sinh-dem-mua-doi-so-phan",
  },
  {
    key: "g-trung-tam-thuong-mai-anh-cuoi-bi-cat-nguoi-bi-vu-oan-cuu-ca-gia-toc",
    label: "Trung tâm thương mại / ảnh cưới bị cắt / người bị vu oan cứu cả gia tộc",
    slug: "trung-tam-thuong-mai-anh-cuoi-bi-cat-nguoi-bi-vu-oan-cuu-ca-gia-toc",
  },
  {
    key: "g-khu-vui-choi-tre-em-nhat-ky-cu-ke-phan-boi-bi-ghi-am",
    label: "Khu vui chơi trẻ em / nhật ký cũ / kẻ phản bội bị ghi âm",
    slug: "khu-vui-choi-tre-em-nhat-ky-cu-ke-phan-boi-bi-ghi-am",
  },
  {
    key: "g-truong-quoc-te-ban-thiet-ke-goc-nguoi-giup-viec-giu-bi-mat",
    label: "Trường quốc tế / bản thiết kế gốc / người giúp việc giữ bí mật",
    slug: "truong-quoc-te-ban-thiet-ke-goc-nguoi-giup-viec-giu-bi-mat",
  },
  {
    key: "g-phong-hop-phu-huynh-camera-phong-tre-tai-san-doi-chu",
    label: "Phòng họp phụ huynh / camera phòng trẻ / tài sản đổi chủ",
    slug: "phong-hop-phu-huynh-camera-phong-tre-tai-san-doi-chu",
  },
  {
    key: "g-van-phong-luat-bang-luong-bi-mat-loi-noi-doi-bi-pha-ngay-tai-tiec",
    label: "Văn phòng luật / bảng lương bí mật / lời nói dối bị phá ngay tại tiệc",
    slug: "van-phong-luat-bang-luong-bi-mat-loi-noi-doi-bi-pha-ngay-tai-tiec",
  },
  {
    key: "g-toa-an-gia-dinh-laptop-bi-khoa-nguoi-thua-ke-nu-doat-quyen",
    label: "Tòa án gia đình / laptop bị khóa / người thừa kế nữ đoạt quyền",
    slug: "toa-an-gia-dinh-laptop-bi-khoa-nguoi-thua-ke-nu-doat-quyen",
  },
  {
    key: "g-don-canh-sat-hop-qua-sinh-nhat-gia-quy-phan-lai-nguoi-cam-quyen",
    label: "Đồn cảnh sát / hộp quà sinh nhật / gia quy phản lại người cầm quyền",
    slug: "don-canh-sat-hop-qua-sinh-nhat-gia-quy-phan-lai-nguoi-cam-quyen",
  },
  {
    key: "g-toa-soan-truyen-thong-giay-bao-no-ly-hon-cong-bo-dung-luc",
    label: "Tòa soạn truyền thông / giấy báo nợ / ly hôn công bố đúng lúc",
    slug: "toa-soan-truyen-thong-giay-bao-no-ly-hon-cong-bo-dung-luc",
  },
  {
    key: "g-phong-livestream-toa-thuoc-gia-nguoi-da-chet-bat-ngo-xuat-hien",
    label: "Phòng livestream / toa thuốc giả / người đã chết bất ngờ xuất hiện",
    slug: "phong-livestream-toa-thuoc-gia-nguoi-da-chet-bat-ngo-xuat-hien",
  },
  {
    key: "g-hau-truong-showbiz-bien-so-xe-la-hop-dong-gia-thanh-that",
    label: "Hậu trường showbiz / biển số xe lạ / hợp đồng giả thành thật",
    slug: "hau-truong-showbiz-bien-so-xe-la-hop-dong-gia-thanh-that",
  },
  {
    key: "g-phim-truong-co-trang-don-nhan-nuoi-hoi-dong-quan-tri-doi-phe",
    label: "Phim trường cổ trang / đơn nhận nuôi / hội đồng quản trị đổi phe",
    slug: "phim-truong-co-trang-don-nhan-nuoi-hoi-dong-quan-tri-doi-phe",
  },
  {
    key: "g-san-dien-thoi-trang-tin-nhan-nua-dem-danh-phan-bi-tra-lai",
    label: "Sàn diễn thời trang / tin nhắn nửa đêm / danh phận bị trả lại",
    slug: "san-dien-thoi-trang-tin-nhan-nua-dem-danh-phan-bi-tra-lai",
  },
  {
    key: "g-showroom-trang-suc-ho-chieu-gia-dem-tuyet-thanh-toan-no-cu",
    label: "Showroom trang sức / hộ chiếu giả / đêm tuyết thanh toán nợ cũ",
    slug: "showroom-trang-suc-ho-chieu-gia-dem-tuyet-thanh-toan-no-cu",
  },
  {
    key: "g-nha-dau-gia-giay-khai-sinh-cu-phien-dich-nghe-len-bi-mat",
    label: "Nhà đấu giá / giấy khai sinh cũ / phiên dịch nghe lén bí mật",
    slug: "nha-dau-gia-giay-khai-sinh-cu-phien-dich-nghe-len-bi-mat",
  },
  {
    key: "g-phong-trien-lam-nhan-cuoi-khac-ten-nguoi-thua-ke-that-tro-ve",
    label: "Phòng triển lãm / nhẫn cưới khắc tên / người thừa kế thật trở về",
    slug: "phong-trien-lam-nhan-cuoi-khac-ten-nguoi-thua-ke-that-tro-ve",
  },
  {
    key: "g-quan-ca-phe-cu-chia-khoa-phong-cam-bac-si-bi-mua-chuoc",
    label: "Quán cà phê cũ / chìa khóa phòng cấm / bác sĩ bị mua chuộc",
    slug: "quan-ca-phe-cu-chia-khoa-phong-cam-bac-si-bi-mua-chuoc",
  },
  {
    key: "g-hieu-sach-cuoi-pho-dong-ho-co-phong-vip-lo-giao-dich",
    label: "Hiệu sách cuối phố / đồng hồ cổ / phòng VIP lộ giao dịch",
    slug: "hieu-sach-cuoi-pho-dong-ho-co-phong-vip-lo-giao-dich",
  },
  {
    key: "g-nha-hang-gia-toc-lich-su-dinh-vi-bao-hiem-he-am-muu",
    label: "Nhà hàng gia tộc / lịch sử định vị / bảo hiểm hé âm mưu",
    slug: "nha-hang-gia-toc-lich-su-dinh-vi-bao-hiem-he-am-muu",
  },
  {
    key: "g-bep-truong-khach-san-ho-so-nhan-su-tin-nhan-gui-nham-cuu-mang",
    label: "Bếp trưởng khách sạn / hồ sơ nhân sự / tin nhắn gửi nhầm cứu mạng",
    slug: "bep-truong-khach-san-ho-so-nhan-su-tin-nhan-gui-nham-cuu-mang",
  },
  {
    key: "g-cau-lac-bo-tu-nhan-sim-dien-thoai-cu-cap-song-sinh-trao-than-phan",
    label: "Câu lạc bộ tư nhân / sim điện thoại cũ / cặp song sinh tráo thân phận",
    slug: "cau-lac-bo-tu-nhan-sim-dien-thoai-cu-cap-song-sinh-trao-than-phan",
  },
  {
    key: "g-ham-ruou-biet-thu-ghe-trong-trong-tiec-ky-uc-quay-lai-dung-phien-toa",
    label: "Hầm rượu biệt thự / ghế trống trong tiệc / ký ức quay lại đúng phiên tòa",
    slug: "ham-ruou-biet-thu-ghe-trong-trong-tiec-ky-uc-quay-lai-dung-phien-toa",
  },
  {
    key: "g-phong-doc-sach-log-ra-vao-toa-nha-co-phan-bi-chuyen-nguoc",
    label: "Phòng đọc sách / log ra vào tòa nhà / cổ phần bị chuyển ngược",
    slug: "phong-doc-sach-log-ra-vao-toa-nha-co-phan-bi-chuyen-nguoc",
  },
  {
    key: "g-tu-duong-ho-lon-bang-gac-co-dau-vet-nguoi-bao-ve-la-dai-thieu-gia",
    label: "Từ đường họ lớn / băng gạc có dấu vết / người bảo vệ là đại thiếu gia",
    slug: "tu-duong-ho-lon-bang-gac-co-dau-vet-nguoi-bao-ve-la-dai-thieu-gia",
  },
  {
    key: "g-nha-cu-ngoai-o-giay-cao-got-gay-moi-tinh-cu-thanh-nhan-chung",
    label: "Nhà cũ ngoại ô / giày cao gót gãy / mối tình cũ thành nhân chứng",
    slug: "nha-cu-ngoai-o-giay-cao-got-gay-moi-tinh-cu-thanh-nhan-chung",
  },
  {
    key: "g-co-nhi-vien-lich-hen-bac-si-bi-sa-thai-roi-quay-lai-lam-sep",
    label: "Cô nhi viện / lịch hẹn bác sĩ / bị sa thải rồi quay lại làm sếp",
    slug: "co-nhi-vien-lich-hen-bac-si-bi-sa-thai-roi-quay-lai-lam-sep",
  },
  {
    key: "g-trai-he-quy-toc-hop-dong-bao-mat-mon-qua-phan-boi-bi-mo-ra",
    label: "Trại hè quý tộc / hợp đồng bảo mật / món quà phản bội bị mở ra",
    slug: "trai-he-quy-toc-hop-dong-bao-mat-mon-qua-phan-boi-bi-mo-ra",
  },
  {
    key: "g-ky-tuc-xa-dai-hoc-boarding-pass-bi-xe-ve-si-che-giau-than-phan",
    label: "Ký túc xá đại học / boarding pass bị xé / vệ sĩ che giấu thân phận",
    slug: "ky-tuc-xa-dai-hoc-boarding-pass-bi-xe-ve-si-che-giau-than-phan",
  },
  {
    key: "g-khu-chung-cu-cao-cap-hop-dong-co-phan-me-chong-bi-phan-don",
    label: "Khu chung cư cao cấp / hợp đồng cổ phần / mẹ chồng bị phản đòn",
    slug: "khu-chung-cu-cao-cap-hop-dong-co-phan-me-chong-bi-phan-don",
  },
  {
    key: "g-camera-hanh-lang-don-ly-hon-chua-ky-nu-chinh-tu-cuu-danh-tieng",
    label: "Camera hành lang / đơn ly hôn chưa ký / nữ chính tự cứu danh tiếng",
    slug: "camera-hanh-lang-don-ly-hon-chua-ky-nu-chinh-tu-cuu-danh-tieng",
  },
  {
    key: "g-phong-quan-ly-toa-nha-file-cloud-bi-xoa-du-lieu-bi-phuc-hoi",
    label: "Phòng quản lý tòa nhà / file cloud bị xóa / dữ liệu bị phục hồi",
    slug: "phong-quan-ly-toa-nha-file-cloud-bi-xoa-du-lieu-bi-phuc-hoi",
  },
  {
    key: "g-van-phong-startup-tin-vat-gia-toc-dua-tre-nhan-ra-su-that",
    label: "Văn phòng startup / tín vật gia tộc / đứa trẻ nhận ra sự thật",
    slug: "van-phong-startup-tin-vat-gia-toc-dua-tre-nhan-ra-su-that",
  },
  {
    key: "g-phong-server-cong-ty-clip-hau-truong-loi-canh-bao-thanh-su-that",
    label: "Phòng server công ty / clip hậu trường / lời cảnh báo thành sự thật",
    slug: "phong-server-cong-ty-clip-hau-truong-loi-canh-bao-thanh-su-that",
  },
  {
    key: "g-ngan-hang-phong-vip-don-to-cao-bi-giau-co-gai-que-la-chu-tich-an-danh",
    label: "Ngân hàng phòng VIP / đơn tố cáo bị giấu / cô gái quê là chủ tịch ẩn danh",
    slug: "ngan-hang-phong-vip-don-to-cao-bi-giau-co-gai-que-la-chu-tich-an-danh",
  },
  {
    key: "g-quay-giao-dich-rieng-ma-ket-sat-nu-bac-si-tu-minh-oan",
    label: "Quầy giao dịch riêng / mã két sắt / nữ bác sĩ tự minh oan",
    slug: "quay-giao-dich-rieng-ma-ket-sat-nu-bac-si-tu-minh-oan",
  },
  {
    key: "g-phong-kiem-toan-ma-qr-ve-su-kien-hot-search-quay-xe",
    label: "Phòng kiểm toán / mã QR vé sự kiện / hot search quay xe",
    slug: "phong-kiem-toan-ma-qr-ve-su-kien-hot-search-quay-xe",
  },
  {
    key: "g-hoi-nghi-co-dong-phieu-gui-do-cha-ruot-xuat-hien",
    label: "Hội nghị cổ đông / phiếu gửi đồ / cha ruột xuất hiện",
    slug: "hoi-nghi-co-dong-phieu-gui-do-cha-ruot-xuat-hien",
  },
  {
    key: "g-le-ra-mat-san-pham-so-kham-thai-nguoi-mat-tich-quay-ve",
    label: "Lễ ra mắt sản phẩm / sổ khám thai / người mất tích quay về",
    slug: "le-ra-mat-san-pham-so-kham-thai-nguoi-mat-tich-quay-ve",
  },
  {
    key: "g-hop-bao-khung-hoang-khan-lua-bo-quen-ban-quyen-duoc-chung-minh",
    label: "Họp báo khủng hoảng / khăn lụa bỏ quên / bản quyền được chứng minh",
    slug: "hop-bao-khung-hoang-khan-lua-bo-quen-ban-quyen-duoc-chung-minh",
  },
  {
    key: "g-studio-chup-anh-bai-dang-hot-search-khach-khong-moi-lat-mat",
    label: "Studio chụp ảnh / bài đăng hot search / khách không mời lật mặt",
    slug: "studio-chup-anh-bai-dang-hot-search-khach-khong-moi-lat-mat",
  },
  {
    key: "g-phong-make-up-bien-lai-nha-hang-hai-than-phan-va-vao-nhau",
    label: "Phòng make-up / biên lai nhà hàng / hai thân phận va vào nhau",
    slug: "phong-make-up-bien-lai-nha-hang-hai-than-phan-va-vao-nhau",
  },
  {
    key: "g-phong-kham-tu-camera-hanh-trinh-chong-cu-muon-mang-hoi-han",
    label: "Phòng khám tư / camera hành trình / chồng cũ muộn màng hối hận",
    slug: "phong-kham-tu-camera-hanh-trinh-chong-cu-muon-mang-hoi-han",
  },
  {
    key: "g-khoa-cap-cuu-bien-lai-chuyen-khoan-thien-kim-that-lat-mat",
    label: "Khoa cấp cứu / biên lai chuyển khoản / thiên kim thật lật mặt",
    slug: "khoa-cap-cuu-bien-lai-chuyen-khoan-thien-kim-that-lat-mat",
  },
  {
    key: "g-nha-tre-song-ngu-benh-an-bi-sua-thu-cu-mo-khoa-bi-mat",
    label: "Nhà trẻ song ngữ / bệnh án bị sửa / thư cũ mở khóa bí mật",
    slug: "nha-tre-song-ngu-benh-an-bi-sua-thu-cu-mo-khoa-bi-mat",
  },
  {
    key: "g-phong-bao-mau-usb-du-lieu-mat-nu-chinh-roi-di-dung-luc",
    label: "Phòng bảo mẫu / USB dữ liệu mật / nữ chính rời đi đúng lúc",
    slug: "phong-bao-mau-usb-du-lieu-mat-nu-chinh-roi-di-dung-luc",
  },
  {
    key: "g-cong-vien-mua-dem-so-tay-cua-me-ke-tong-tien-bi-phan-bay",
    label: "Công viên mưa đêm / sổ tay của mẹ / kẻ tống tiền bị phản bẫy",
    slug: "cong-vien-mua-dem-so-tay-cua-me-ke-tong-tien-bi-phan-bay",
  },
  {
    key: "g-cua-hang-ao-cuoi-mau-vai-bi-danh-trao-bao-luc-mang-bi-dao-chieu",
    label: "Cửa hàng áo cưới / mẫu vải bị đánh tráo / bạo lực mạng bị đảo chiều",
    slug: "cua-hang-ao-cuoi-mau-vai-bi-danh-trao-bao-luc-mang-bi-dao-chieu",
  },
  {
    key: "g-xuong-thiet-ke-do-choi-co-may-ghi-am-nu-giao-vien-lat-lai-su-that",
    label: "Xưởng thiết kế / đồ chơi có máy ghi âm / nữ giáo viên lật lại sự thật",
    slug: "xuong-thiet-ke-do-choi-co-may-ghi-am-nu-giao-vien-lat-lai-su-that",
  },
  {
    key: "g-kho-hang-bi-mat-so-co-dong-truyen-thong-bi-phan-don",
    label: "Kho hàng bí mật / sổ cổ đông / truyền thông bị phản đòn",
    slug: "kho-hang-bi-mat-so-co-dong-truyen-thong-bi-phan-don",
  },
  {
    key: "g-garage-xe-sang-o-cung-di-dong-me-ruot-bi-giau-kin",
    label: "Garage xe sang / ổ cứng di động / mẹ ruột bị giấu kín",
    slug: "garage-xe-sang-o-cung-di-dong-me-ruot-bi-giau-kin",
  },
  {
    key: "g-cabin-xe-rieng-thiep-chuc-mung-la-ban-sao-hop-dong-bien-mat",
    label: "Cabin xe riêng / thiệp chúc mừng lạ / bản sao hợp đồng biến mất",
    slug: "cabin-xe-rieng-thiep-chuc-mung-la-ban-sao-hop-dong-bien-mat",
  },
  {
    key: "g-duong-cao-toc-dem-thoa-thuan-tien-chuoc-dan-xep-bi-boc-phot",
    label: "Đường cao tốc đêm / thỏa thuận tiền chuộc / dàn xếp bị bóc phốt",
    slug: "duong-cao-toc-dem-thoa-thuan-tien-chuoc-dan-xep-bi-boc-phot",
  },
  {
    key: "g-tram-dung-chan-lo-nuoc-hoa-la-thoa-thuan-ngam-bi-nghe-thay",
    label: "Trạm dừng chân / lọ nước hoa lạ / thỏa thuận ngầm bị nghe thấy",
    slug: "tram-dung-chan-lo-nuoc-hoa-la-thoa-thuan-ngam-bi-nghe-thay",
  },
  {
    key: "g-nha-ga-san-bay-ve-gui-xe-ban-ngay-yeu-the-ban-dem-nam-quyen",
    label: "Nhà ga sân bay / vé gửi xe / ban ngày yếu thế ban đêm nắm quyền",
    slug: "nha-ga-san-bay-ve-gui-xe-ban-ngay-yeu-the-ban-dem-nam-quyen",
  },
  {
    key: "g-khach-san-suoi-nuoc-nong-giay-chung-tu-nghi-van-hon-le-dao-chieu",
    label: "Khách sạn suối nước nóng / giấy chứng tử nghi vấn / hôn lễ đảo chiều",
    slug: "khach-san-suoi-nuoc-nong-giay-chung-tu-nghi-van-hon-le-dao-chieu",
  },
  {
    key: "g-phong-tra-rieng-ghi-am-cuoc-goi-nguoi-cu-tro-ve-dung-luc",
    label: "Phòng trà riêng / ghi âm cuộc gọi / người cũ trở về đúng lúc",
    slug: "phong-tra-rieng-ghi-am-cuoc-goi-nguoi-cu-tro-ve-dung-luc",
  },
  {
    key: "g-lau-tra-co-the-phong-khach-san-nguoi-quy-goi-xin-loi",
    label: "Lầu trà cổ / thẻ phòng khách sạn / người quỳ gối xin lỗi",
    slug: "lau-tra-co-the-phong-khach-san-nguoi-quy-goi-xin-loi",
  },
  {
    key: "g-nha-hang-tren-cao-ket-qua-adn-vi-hon-phu-bi-thay-the",
    label: "Nhà hàng trên cao / kết quả ADN / vị hôn phu bị thay thế",
    slug: "nha-hang-tren-cao-ket-qua-adn-vi-hon-phu-bi-thay-the",
  },
  {
    key: "g-rooftop-bar-vay-cuoi-rach-dem-mua-doi-so-phan",
    label: "Rooftop bar / váy cưới rách / đêm mưa đổi số phận",
    slug: "rooftop-bar-vay-cuoi-rach-dem-mua-doi-so-phan",
  },
  {
    key: "g-sanh-tap-doan-buc-thu-nac-danh-nguoi-bi-vu-oan-cuu-ca-gia-toc",
    label: "Sảnh tập đoàn / bức thư nặc danh / người bị vu oan cứu cả gia tộc",
    slug: "sanh-tap-doan-buc-thu-nac-danh-nguoi-bi-vu-oan-cuu-ca-gia-toc",
  },
  {
    key: "g-phong-chu-tich-manh-giay-trong-sach-ke-phan-boi-bi-ghi-am",
    label: "Phòng chủ tịch / mảnh giấy trong sách / kẻ phản bội bị ghi âm",
    slug: "phong-chu-tich-manh-giay-trong-sach-ke-phan-boi-bi-ghi-am",
  },
  {
    key: "g-van-phong-thu-ky-anh-dinh-vi-khach-san-nguoi-giup-viec-giu-bi-mat",
    label: "Văn phòng thư ký / ảnh định vị khách sạn / người giúp việc giữ bí mật",
    slug: "van-phong-thu-ky-anh-dinh-vi-khach-san-nguoi-giup-viec-giu-bi-mat",
  },
  {
    key: "g-phong-nhan-su-quyet-dinh-sa-thai-tai-san-doi-chu",
    label: "Phòng nhân sự / quyết định sa thải / tài sản đổi chủ",
    slug: "phong-nhan-su-quyet-dinh-sa-thai-tai-san-doi-chu",
  },
  {
    key: "g-phong-tai-chinh-dien-thoai-bi-vo-loi-noi-doi-bi-pha-ngay-tai-tiec",
    label: "Phòng tài chính / điện thoại bị vỡ / lời nói dối bị phá ngay tại tiệc",
    slug: "phong-tai-chinh-dien-thoai-bi-vo-loi-noi-doi-bi-pha-ngay-tai-tiec",
  },
  {
    key: "g-phong-phap-che-hoa-cuoi-gui-nham-nguoi-thua-ke-nu-doat-quyen",
    label: "Phòng pháp chế / hoa cưới gửi nhầm / người thừa kế nữ đoạt quyền",
    slug: "phong-phap-che-hoa-cuoi-gui-nham-nguoi-thua-ke-nu-doat-quyen",
  },
  {
    key: "g-kho-luu-tru-cong-ty-hop-dong-thue-nha-gia-quy-phan-lai-nguoi-cam-quyen",
    label: "Kho lưu trữ công ty / hợp đồng thuê nhà / gia quy phản lại người cầm quyền",
    slug: "kho-luu-tru-cong-ty-hop-dong-thue-nha-gia-quy-phan-lai-nguoi-cam-quyen",
  },
  {
    key: "g-phong-ho-so-benh-vien-thuoc-bi-doi-ly-hon-cong-bo-dung-luc",
    label: "Phòng hồ sơ bệnh viện / thuốc bị đổi / ly hôn công bố đúng lúc",
    slug: "phong-ho-so-benh-vien-thuoc-bi-doi-ly-hon-cong-bo-dung-luc",
  },
  {
    key: "g-phong-cham-soc-tre-so-sinh-the-nhan-vien-cu-nguoi-da-chet-bat-ngo-xuat",
    label: "Phòng chăm sóc trẻ sơ sinh / thẻ nhân viên cũ / người đã chết bất ngờ xuất hiện",
    slug: "phong-cham-soc-tre-so-sinh-the-nhan-vien-cu-nguoi-da-chet-bat-ngo-xuat-hien",
  },
  {
    key: "g-hanh-lang-benh-vien-hop-dong-hon-nhan-hop-dong-gia-thanh-that",
    label: "Hành lang bệnh viện / hợp đồng hôn nhân / hợp đồng giả thành thật",
    slug: "hanh-lang-benh-vien-hop-dong-hon-nhan-hop-dong-gia-thanh-that",
  },
  {
    key: "g-nha-nguyen-nho-anh-chup-man-hinh-hoi-dong-quan-tri-doi-phe",
    label: "Nhà nguyện nhỏ / ảnh chụp màn hình / hội đồng quản trị đổi phe",
    slug: "nha-nguyen-nho-anh-chup-man-hinh-hoi-dong-quan-tri-doi-phe",
  },
  {
    key: "g-bai-bien-luc-binh-minh-vali-khoa-so-danh-phan-bi-tra-lai",
    label: "Bãi biển lúc bình minh / vali khóa số / danh phận bị trả lại",
    slug: "bai-bien-luc-binh-minh-vali-khoa-so-danh-phan-bi-tra-lai",
  },
  {
    key: "g-doi-tuyet-di-chuc-viet-tay-dem-tuyet-thanh-toan-no-cu",
    label: "Đồi tuyết / di chúc viết tay / đêm tuyết thanh toán nợ cũ",
    slug: "doi-tuyet-di-chuc-viet-tay-dem-tuyet-thanh-toan-no-cu",
  },
  {
    key: "g-le-hoi-phao-hoa-thiep-cuoi-bi-giau-phien-dich-nghe-len-bi-mat",
    label: "Lễ hội pháo hoa / thiệp cưới bị giấu / phiên dịch nghe lén bí mật",
    slug: "le-hoi-phao-hoa-thiep-cuoi-bi-giau-phien-dich-nghe-len-bi-mat",
  },
  {
    key: "g-cho-hoa-tet-mat-khau-ket-sat-nguoi-thua-ke-that-tro-ve",
    label: "Chợ hoa Tết / mật khẩu két sắt / người thừa kế thật trở về",
    slug: "cho-hoa-tet-mat-khau-ket-sat-nguoi-thua-ke-that-tro-ve",
  },
  {
    key: "g-san-sau-biet-thu-vong-co-thua-ke-bac-si-bi-mua-chuoc",
    label: "Sân sau biệt thự / vòng cổ thừa kế / bác sĩ bị mua chuộc",
    slug: "san-sau-biet-thu-vong-co-thua-ke-bac-si-bi-mua-chuoc",
  },
  {
    key: "g-vuon-kinh-ban-thu-am-phong-hop-phong-vip-lo-giao-dich",
    label: "Vườn kính / bản thu âm phòng họp / phòng VIP lộ giao dịch",
    slug: "vuon-kinh-ban-thu-am-phong-hop-phong-vip-lo-giao-dich",
  },
  {
    key: "g-nha-kinh-trong-hoa-giay-uy-quyen-gia-cuoc-goi-cuoi-lam-lo-hung-thu",
    label: "Nhà kính trồng hoa / giấy ủy quyền giả / cuộc gọi cuối làm lộ hung thủ",
    slug: "nha-kinh-trong-hoa-giay-uy-quyen-gia-cuoc-goi-cuoi-lam-lo-hung-thu",
  },
  {
    key: "g-trai-ngua-tep-anh-phuc-hoi-bang-chung-bi-trao-lan-hai",
    label: "Trại ngựa / tệp ảnh phục hồi / bằng chứng bị tráo lần hai",
    slug: "trai-ngua-tep-anh-phuc-hoi-bang-chung-bi-trao-lan-hai",
  },
  {
    key: "g-san-golf-hao-mon-danh-sach-khach-moi-di-san-co-dieu-kien",
    label: "Sân golf hào môn / danh sách khách mời / di sản có điều kiện",
    slug: "san-golf-hao-mon-danh-sach-khach-moi-di-san-co-dieu-kien",
  },
  {
    key: "g-phong-piano-camera-thang-may-gia-chet-tro-ve-tra-thu",
    label: "Phòng piano / camera thang máy / giả chết trở về trả thù",
    slug: "phong-piano-camera-thang-may-gia-chet-tro-ve-tra-thu",
  },
  {
    key: "g-phong-tranh-rieng-mau-toc-xet-nghiem-gia-toc-che-giau-than-phan",
    label: "Phòng tranh riêng / mẫu tóc xét nghiệm / gia tộc che giấu thân phận",
    slug: "phong-tranh-rieng-mau-toc-xet-nghiem-gia-toc-che-giau-than-phan",
  },
  {
    key: "g-khoang-thang-may-rieng-cuc-ao-roi-lien-hon-tro-thanh-cai-bay",
    label: "Khoang thang máy riêng / cúc áo rơi / liên hôn trở thành cái bẫy",
    slug: "khoang-thang-may-rieng-cuc-ao-roi-lien-hon-tro-thanh-cai-bay",
  },
  {
    key: "g-can-ho-bi-mat-ban-nhap-thong-cao-doi-thu-tu-sa-bay",
    label: "Căn hộ bí mật / bản nháp thông cáo / đối thủ tự sa bẫy",
    slug: "can-ho-bi-mat-ban-nhap-thong-cao-doi-thu-tu-sa-bay",
  },
  {
    key: "g-nha-an-toan-ma-phong-vip-nguoi-ngheo-gia-giau-that",
    label: "Nhà an toàn / mã phòng VIP / người nghèo giả giàu thật",
    slug: "nha-an-toan-ma-phong-vip-nguoi-ngheo-gia-giau-that",
  },
  {
    key: "g-phong-giam-sat-camera-ve-may-bay-mot-chieu-tet-doan-vien-va-mat-ho-han",
    label: "Phòng giám sát camera / vé máy bay một chiều / Tết đoàn viên vả mặt họ hàng",
    slug: "phong-giam-sat-camera-ve-may-bay-mot-chieu-tet-doan-vien-va-mat-ho-hang",
  },
  {
    key: "g-trung-tam-du-lieu-sao-ke-ngan-hang-tiep-vien-giu-chuyen-bay-cuoi",
    label: "Trung tâm dữ liệu / sao kê ngân hàng / tiếp viên giữ chuyến bay cuối",
    slug: "trung-tam-du-lieu-sao-ke-ngan-hang-tiep-vien-giu-chuyen-bay-cuoi",
  },
  {
    key: "g-dai-truyen-hinh-phieu-xet-nghiem-doi-ten-tieu-tam-tu-lo-so-ho",
    label: "Đài truyền hình / phiếu xét nghiệm đổi tên / tiểu tam tự lộ sơ hở",
    slug: "dai-truyen-hinh-phieu-xet-nghiem-doi-ten-tieu-tam-tu-lo-so-ho",
  },
  {
    key: "g-phong-bien-tap-email-noi-bo-luat-su-tung-bang-chung",
    label: "Phòng biên tập / email nội bộ / luật sư tung bằng chứng",
    slug: "phong-bien-tap-email-noi-bo-luat-su-tung-bang-chung",
  },
  {
    key: "g-van-phong-kol-buc-tranh-bi-che-camera-mat-bay-phut",
    label: "Văn phòng KOL / bức tranh bị che / camera mất bảy phút",
    slug: "van-phong-kol-buc-tranh-bi-che-camera-mat-bay-phut",
  },
  {
    key: "g-studio-podcast-hop-dong-quang-cao-den-bao-hiem-he-am-muu",
    label: "Studio podcast / hợp đồng quảng cáo đen / bảo hiểm hé âm mưu",
    slug: "studio-podcast-hop-dong-quang-cao-den-bao-hiem-he-am-muu",
  },
  {
    key: "g-san-khau-trao-giai-bao-hiem-nguoi-thu-huong-tin-nhan-gui-nham-cuu-mang",
    label: "Sân khấu trao giải / bảo hiểm người thụ hưởng / tin nhắn gửi nhầm cứu mạng",
    slug: "san-khau-trao-giai-bao-hiem-nguoi-thu-huong-tin-nhan-gui-nham-cuu-mang",
  },
  {
    key: "g-buoi-thu-vai-bien-ban-hoi-dong-cap-song-sinh-trao-than-phan",
    label: "Buổi thử vai / biên bản hội đồng / cặp song sinh tráo thân phận",
    slug: "buoi-thu-vai-bien-ban-hoi-dong-cap-song-sinh-trao-than-phan",
  },
  {
    key: "g-phong-casting-the-nho-camera-nu-bac-si-tu-minh-oan",
    label: "Phòng casting / thẻ nhớ camera / nữ bác sĩ tự minh oan",
    slug: "phong-casting-the-nho-camera-nu-bac-si-tu-minh-oan",
  },
  {
    key: "g-hau-truong-concert-hoa-don-trang-suc-hot-search-quay-xe",
    label: "Hậu trường concert / hóa đơn trang sức / hot search quay xe",
    slug: "hau-truong-concert-hoa-don-trang-suc-hot-search-quay-xe",
  },
  {
    key: "g-phong-tap-vu-dao-anh-sieu-am-cha-ruot-xuat-hien",
    label: "Phòng tập vũ đạo / ảnh siêu âm / cha ruột xuất hiện",
    slug: "phong-tap-vu-dao-anh-sieu-am-cha-ruot-xuat-hien",
  },
  {
    key: "g-san-dau-gia-co-vat-son-moi-tren-ly-nguoi-mat-tich-quay-ve",
    label: "Sàn đấu giá cổ vật / son môi trên ly / người mất tích quay về",
    slug: "san-dau-gia-co-vat-son-moi-tren-ly-nguoi-mat-tich-quay-ve",
  },
  {
    key: "g-bao-tang-tu-nhan-doan-chat-nhom-gia-dinh-ban-quyen-duoc-chung-minh",
    label: "Bảo tàng tư nhân / đoạn chat nhóm gia đình / bản quyền được chứng minh",
    slug: "bao-tang-tu-nhan-doan-chat-nhom-gia-dinh-ban-quyen-duoc-chung-minh",
  },
  {
    key: "g-tu-bao-hiem-ngan-hang-anh-camera-bai-xe-khach-khong-moi-lat-mat",
    label: "Tủ bảo hiểm ngân hàng / ảnh camera bãi xe / khách không mời lật mặt",
    slug: "tu-bao-hiem-ngan-hang-anh-camera-bai-xe-khach-khong-moi-lat-mat",
  },
  {
    key: "g-phong-ket-biet-thu-video-camera-hanh-lang-hai-than-phan-va-vao-nhau",
    label: "Phòng két biệt thự / video camera hành lang / hai thân phận va vào nhau",
    slug: "phong-ket-biet-thu-video-camera-hanh-lang-hai-than-phan-va-vao-nhau",
  },
  {
    key: "g-kho-do-cu-hoa-don-minibar-chong-cu-muon-mang-hoi-han",
    label: "Kho đồ cũ / hóa đơn minibar / chồng cũ muộn màng hối hận",
    slug: "kho-do-cu-hoa-don-minibar-chong-cu-muon-mang-hoi-han",
  },
  {
    key: "g-nha-kho-cang-bien-vong-tay-tre-so-sinh-thien-kim-that-lat-mat",
    label: "Nhà kho cảng biển / vòng tay trẻ sơ sinh / thiên kim thật lật mặt",
    slug: "nha-kho-cang-bien-vong-tay-tre-so-sinh-thien-kim-that-lat-mat",
  },
  {
    key: "g-cang-du-thuyen-anh-cuoi-bi-cat-thu-cu-mo-khoa-bi-mat",
    label: "Cảng du thuyền / ảnh cưới bị cắt / thư cũ mở khóa bí mật",
    slug: "cang-du-thuyen-anh-cuoi-bi-cat-thu-cu-mo-khoa-bi-mat",
  },
  {
    key: "g-phong-cho-luat-su-nhat-ky-cu-nu-chinh-roi-di-dung-luc",
    label: "Phòng chờ luật sư / nhật ký cũ / nữ chính rời đi đúng lúc",
    slug: "phong-cho-luat-su-nhat-ky-cu-nu-chinh-roi-di-dung-luc",
  },
  {
    key: "g-trai-giam-tham-gap-ban-thiet-ke-goc-ke-tong-tien-bi-phan-bay",
    label: "Trại giam thăm gặp / bản thiết kế gốc / kẻ tống tiền bị phản bẫy",
    slug: "trai-giam-tham-gap-ban-thiet-ke-goc-ke-tong-tien-bi-phan-bay",
  },
  {
    key: "g-phong-hoa-giai-camera-phong-tre-bao-luc-mang-bi-dao-chieu",
    label: "Phòng hòa giải / camera phòng trẻ / bạo lực mạng bị đảo chiều",
    slug: "phong-hoa-giai-camera-phong-tre-bao-luc-mang-bi-dao-chieu",
  },
  {
    key: "g-van-phong-cong-chung-bang-luong-bi-mat-nu-giao-vien-lat-lai-su-that",
    label: "Văn phòng công chứng / bảng lương bí mật / nữ giáo viên lật lại sự thật",
    slug: "van-phong-cong-chung-bang-luong-bi-mat-nu-giao-vien-lat-lai-su-that",
  },
  {
    key: "g-phong-dang-ky-ket-hon-laptop-bi-khoa-truyen-thong-bi-phan-don",
    label: "Phòng đăng ký kết hôn / laptop bị khóa / truyền thông bị phản đòn",
    slug: "phong-dang-ky-ket-hon-laptop-bi-khoa-truyen-thong-bi-phan-don",
  },
  {
    key: "g-cuc-ho-tich-hop-qua-sinh-nhat-me-ruot-bi-giau-kin",
    label: "Cục hộ tịch / hộp quà sinh nhật / mẹ ruột bị giấu kín",
    slug: "cuc-ho-tich-hop-qua-sinh-nhat-me-ruot-bi-giau-kin",
  },
  {
    key: "g-phong-bao-hiem-giay-bao-no-ban-sao-hop-dong-bien-mat",
    label: "Phòng bảo hiểm / giấy báo nợ / bản sao hợp đồng biến mất",
    slug: "phong-bao-hiem-giay-bao-no-ban-sao-hop-dong-bien-mat",
  },
  {
    key: "g-trung-tam-xet-nghiem-toa-thuoc-gia-dan-xep-bi-boc-phot",
    label: "Trung tâm xét nghiệm / toa thuốc giả / dàn xếp bị bóc phốt",
    slug: "trung-tam-xet-nghiem-toa-thuoc-gia-dan-xep-bi-boc-phot",
  },
  {
    key: "g-nha-khach-gia-toc-bien-so-xe-la-thoa-thuan-ngam-bi-nghe-thay",
    label: "Nhà khách gia tộc / biển số xe lạ / thỏa thuận ngầm bị nghe thấy",
    slug: "nha-khach-gia-toc-bien-so-xe-la-thoa-thuan-ngam-bi-nghe-thay",
  },
  {
    key: "g-khu-duong-lao-cao-cap-don-nhan-nuoi-ban-ngay-yeu-the-ban-dem-nam-quyen",
    label: "Khu dưỡng lão cao cấp / đơn nhận nuôi / ban ngày yếu thế ban đêm nắm quyền",
    slug: "khu-duong-lao-cao-cap-don-nhan-nuoi-ban-ngay-yeu-the-ban-dem-nam-quyen",
  },
  {
    key: "g-phong-cham-soc-dac-biet-tin-nhan-nua-dem-hon-le-dao-chieu",
    label: "Phòng chăm sóc đặc biệt / tin nhắn nửa đêm / hôn lễ đảo chiều",
    slug: "phong-cham-soc-dac-biet-tin-nhan-nua-dem-hon-le-dao-chieu",
  },
  {
    key: "g-nha-hang-tiec-cuoi-ho-chieu-gia-thien-kim-gia-mat-cho-dua",
    label: "Nhà hàng tiệc cưới / hộ chiếu giả / thiên kim giả mất chỗ dựa",
    slug: "nha-hang-tiec-cuoi-ho-chieu-gia-thien-kim-gia-mat-cho-dua",
  },
  {
    key: "g-phong-co-dau-giay-khai-sinh-cu-dam-dong-chung-kien-va-mat",
    label: "Phòng cô dâu / giấy khai sinh cũ / đám đông chứng kiến vả mặt",
    slug: "phong-co-dau-giay-khai-sinh-cu-dam-dong-chung-kien-va-mat",
  },
  {
    key: "g-phong-chu-re-nhan-cuoi-khac-ten-nguoi-chong-tuong-thang-lai-thua",
    label: "Phòng chú rể / nhẫn cưới khắc tên / người chồng tưởng thắng lại thua",
    slug: "phong-chu-re-nhan-cuoi-khac-ten-nguoi-chong-tuong-thang-lai-thua",
  },
  {
    key: "g-sanh-chung-cu-dem-chia-khoa-phong-cam-nguoi-im-lang-moi-la-chu-muu",
    label: "Sảnh chung cư đêm / chìa khóa phòng cấm / người im lặng mới là chủ mưu",
    slug: "sanh-chung-cu-dem-chia-khoa-phong-cam-nguoi-im-lang-moi-la-chu-muu",
  },
  {
    key: "g-ban-cong-tang-cao-dong-ho-co-sep-cu-gap-lai-than-phan-moi",
    label: "Ban công tầng cao / đồng hồ cổ / sếp cũ gặp lại thân phận mới",
    slug: "ban-cong-tang-cao-dong-ho-co-sep-cu-gap-lai-than-phan-moi",
  },
  {
    key: "g-cau-thang-thoat-hiem-lich-su-dinh-vi-nguoi-bi-khinh-that-ra-nam-quyen",
    label: "Cầu thang thoát hiểm / lịch sử định vị / người bị khinh thật ra nắm quyền",
    slug: "cau-thang-thoat-hiem-lich-su-dinh-vi-nguoi-bi-khinh-that-ra-nam-quyen",
  },
  {
    key: "g-hanh-lang-khach-san-ho-so-nhan-su-nhan-chung-doi-phe",
    label: "Hành lang khách sạn / hồ sơ nhân sự / nhân chứng đổi phe",
    slug: "hanh-lang-khach-san-ho-so-nhan-su-nhan-chung-doi-phe",
  },
  {
    key: "g-phong-camera-khach-san-sim-dien-thoai-cu-ke-dung-sau-la-nguoi-than",
    label: "Phòng camera khách sạn / sim điện thoại cũ / kẻ đứng sau là người thân",
    slug: "phong-camera-khach-san-sim-dien-thoai-cu-ke-dung-sau-la-nguoi-than",
  },
  {
    key: "g-quay-le-tan-ghe-trong-trong-tiec-dau-vet-nho-lat-an",
    label: "Quầy lễ tân / ghế trống trong tiệc / dấu vết nhỏ lật án",
    slug: "quay-le-tan-ghe-trong-trong-tiec-dau-vet-nho-lat-an",
  },
  {
    key: "g-phong-giat-la-log-ra-vao-toa-nha-dong-sang-lap-phan-boi-bi-loai",
    label: "Phòng giặt là / log ra vào tòa nhà / đồng sáng lập phản bội bị loại",
    slug: "phong-giat-la-log-ra-vao-toa-nha-dong-sang-lap-phan-boi-bi-loai",
  },
  {
    key: "g-kho-ruou-nha-hang-bang-gac-co-dau-vet-bi-mat-chim-noi-len",
    label: "Kho rượu nhà hàng / băng gạc có dấu vết / bí mật chìm nổi lên",
    slug: "kho-ruou-nha-hang-bang-gac-co-dau-vet-bi-mat-chim-noi-len",
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
  { key: "public-relations-master", label: "Giỏi truyền thông đảo chiều dư luận" },
  { key: "evidence-collector", label: "Thu thập chứng cứ từng bước" },
  { key: "quiet-lawful-revenge", label: "Trả thù hợp pháp, không ồn ào" },
  { key: "career-first", label: "Sự nghiệp trên hết, tình yêu đứng sau" },
  { key: "wounded-but-sharp", label: "Tổn thương nhưng sắc bén" },
  { key: "gentle-deadly", label: "Dịu dàng nhưng ra tay rất đau" },
  { key: "luat-su-ly-hon-lanh-dau", label: "Luật sư ly hôn lạnh đầu" },
  { key: "bac-si-gioi-bi-vu-oan", label: "Bác sĩ giỏi bị vu oan" },
  { key: "nu-chu-tich-an-danh", label: "Nữ chủ tịch ẩn danh" },
  { key: "thu-ky-bi-khinh-thuong-nhung-nam-chung-cu", label: "Thư ký bị khinh thường nhưng nắm chứng cứ" },
  { key: "tieu-thu-that-tro-ve", label: "Tiểu thư thật trở về" },
  { key: "thien-kim-gia-tu-cuu-minh", label: "Thiên kim giả tự cứu mình" },
  { key: "co-dau-thay-the-phan-don", label: "Cô dâu thay thế phản đòn" },
  { key: "co-dau-bo-tron-dung-luc", label: "Cô dâu bỏ trốn đúng lúc" },
  { key: "me-bim-am-tham-lat-an", label: "Mẹ bỉm âm thầm lật án" },
  { key: "me-don-than-lam-lai-su-nghiep", label: "Mẹ đơn thân làm lại sự nghiệp" },
  { key: "nguoi-vo-ky-don-ly-hon-khong-quay-dau", label: "Người vợ ký đơn ly hôn không quay đầu" },
  { key: "vo-cu-bien-mat-roi-tro-lai", label: "Vợ cũ biến mất rồi trở lại" },
  { key: "nu-ceo-bi-gia-dinh-ep-hon", label: "Nữ CEO bị gia đình ép hôn" },
  { key: "nha-thiet-ke-bi-dao-nhai", label: "Nhà thiết kế bị đạo nhái" },
  { key: "nu-dien-vien-bi-cuop-vai", label: "Nữ diễn viên bị cướp vai" },
  { key: "idol-het-thoi-tu-minh-oan", label: "Idol hết thời tự minh oan" },
  { key: "kol-bi-bao-luc-mang-phan-cong", label: "KOL bị bạo lực mạng phản công" },
  { key: "phong-vien-dieu-tra-sac-ben", label: "Phóng viên điều tra sắc bén" },
  { key: "bien-tap-vien-giu-bi-mat-lon", label: "Biên tập viên giữ bí mật lớn" },
  { key: "phien-dich-nghe-len-duoc-su-that", label: "Phiên dịch nghe lén được sự thật" },
  { key: "tiep-vien-hang-khong-che-giau-than-phan", label: "Tiếp viên hàng không che giấu thân phận" },
  { key: "quan-ly-khach-san-biet-qua-nhieu", label: "Quản lý khách sạn biết quá nhiều" },
  { key: "tham-tu-tu-nu-lanh-lung", label: "Thám tử tư nữ lạnh lùng" },
  { key: "ve-si-nu-bao-ve-nguoi-yeu-the", label: "Vệ sĩ nữ bảo vệ người yếu thế" },
  { key: "co-gai-que-bi-hao-mon-xem-thuong", label: "Cô gái quê bị hào môn xem thường" },
  { key: "nguoi-thua-ke-that-lac", label: "Người thừa kế thất lạc" },
  { key: "song-sinh-bi-trao-than-phan", label: "Song sinh bị tráo thân phận" },
  { key: "con-nuoi-bi-coi-la-quan-co", label: "Con nuôi bị coi là quân cờ" },
  { key: "nu-bac-si-khoa-san-giu-bi-mat-sinh-tu", label: "Nữ bác sĩ khoa sản giữ bí mật sinh tử" },
  { key: "me-mat-con-quyet-tim-su-that", label: "Mẹ mất con quyết tìm sự thật" },
  { key: "nguoi-phu-nu-mat-tri-nho-dan-nho-lai", label: "Người phụ nữ mất trí nhớ dần nhớ lại" },
  { key: "nguoi-tung-gia-chet-tro-ve", label: "Người từng giả chết trở về" },
  { key: "nu-chinh-bi-gai-lam-ac-nu", label: "Nữ chính bị gài làm ác nữ" },
  { key: "ac-nu-tinh-ngo-tu-cuu-danh-tieng", label: "Ác nữ tỉnh ngộ tự cứu danh tiếng" },
  { key: "nguoi-vo-ngheo-gia-than-phan", label: "Người vợ nghèo giả thân phận" },
  { key: "nhan-vien-nho-quay-lai-lam-sep", label: "Nhân viên nhỏ quay lại làm sếp" },
  { key: "dong-sang-lap-bi-phan-boi", label: "Đồng sáng lập bị phản bội" },
  { key: "co-dong-im-lang-doat-quyen", label: "Cổ đông im lặng đoạt quyền" },
  { key: "kiem-toan-vien-nhin-ra-lo-hong", label: "Kiểm toán viên nhìn ra lỗ hổng" },
  { key: "nhan-vien-ngan-hang-nam-giao-dich-la", label: "Nhân viên ngân hàng nắm giao dịch lạ" },
  { key: "nu-luat-su-gia-dinh-bao-ve-dua-tre", label: "Nữ luật sư gia đình bảo vệ đứa trẻ" },
  { key: "nguoi-me-mat-quyen-nuoi-con-phan-cong", label: "Người mẹ mất quyền nuôi con phản công" },
  { key: "co-giao-bi-phu-huynh-quyen-the-ep-toi", label: "Cô giáo bị phụ huynh quyền thế ép tội" },
  { key: "hieu-truong-tre-lat-lai-ho-so", label: "Hiệu trưởng trẻ lật lại hồ sơ" },
  { key: "nguoi-giup-viec-thong-minh-giu-bang-chung", label: "Người giúp việc thông minh giữ bằng chứng" },
  { key: "bao-mau-thay-camera-phong-tre", label: "Bảo mẫu thấy camera phòng trẻ" },
  { key: "y-ta-dem-biet-su-that", label: "Y tá đêm biết sự thật" },
  { key: "duoc-si-phat-hien-thuoc-bi-doi", label: "Dược sĩ phát hiện thuốc bị đổi" },
  { key: "chu-tiem-anh-luu-tam-hinh-cu", label: "Chủ tiệm ảnh lưu tấm hình cũ" },
  { key: "chu-quan-ca-phe-nghe-cuoc-hen-sai-nguoi", label: "Chủ quán cà phê nghe cuộc hẹn sai người" },
  { key: "nha-van-dung-cau-chuyen-de-phan-don", label: "Nhà văn dùng câu chuyện để phản đòn" },
  { key: "hoa-si-nhin-ra-buc-tranh-gia", label: "Họa sĩ nhìn ra bức tranh giả" },
  { key: "dau-bep-nu-bi-gia-toc-am-thuc-khinh-thuong", label: "Đầu bếp nữ bị gia tộc ẩm thực khinh thường" },
  { key: "nguoi-mau-bi-thay-vay-phut-cuoi", label: "Người mẫu bị thay váy phút cuối" },
  { key: "nha-thiet-ke-trang-suc-giu-tin-vat", label: "Nhà thiết kế trang sức giữ tín vật" },
  { key: "chuyen-vien-pr-xoay-chuyen-hot-search", label: "Chuyên viên PR xoay chuyển hot search" },
  { key: "quan-ly-nghe-si-chong-lung-am-tham", label: "Quản lý nghệ sĩ chống lưng âm thầm" },
  { key: "dao-dien-nu-bi-cuop-du-an", label: "Đạo diễn nữ bị cướp dự án" },
  { key: "nha-san-xuat-bi-boi-nho", label: "Nhà sản xuất bị bôi nhọ" },
  { key: "streamer-bi-cat-ghep-clip", label: "Streamer bị cắt ghép clip" },
  { key: "nguoi-phu-nu-tung-o-co-nhi-vien", label: "Người phụ nữ từng ở cô nhi viện" },
  { key: "co-gai-mang-tin-vat-gia-toc", label: "Cô gái mang tín vật gia tộc" },
  { key: "nu-chinh-co-hai-than-phan", label: "Nữ chính có hai thân phận" },
  { key: "ban-ngay-yeu-the-ban-dem-nam-quyen", label: "Ban ngày yếu thế ban đêm nắm quyền" },
  { key: "co-vo-hop-dong-khong-con-ngoan-ngoan", label: "Cô vợ hợp đồng không còn ngoan ngoãn" },
  { key: "hon-the-gia-bien-gia-thanh-that", label: "Hôn thê giả biến giả thành thật" },
  { key: "nguoi-xem-mat-bi-nham-danh-tinh", label: "Người xem mắt bị nhầm danh tính" },
  { key: "co-dau-lien-hon-tu-dat-dieu-kien", label: "Cô dâu liên hôn tự đặt điều kiện" },
  { key: "nguoi-phu-nu-bi-me-chong-ep-toi", label: "Người phụ nữ bị mẹ chồng ép tội" },
  { key: "chi-dau-bi-ca-nha-do-loi", label: "Chị dâu bị cả nhà đổ lỗi" },
  { key: "em-dau-im-lang-gom-sao-ke", label: "Em dâu im lặng gom sao kê" },
  { key: "con-dau-bi-xem-thuong-trong-tu-duong", label: "Con dâu bị xem thường trong từ đường" },
  { key: "nu-chinh-biet-dung-truyen-thong", label: "Nữ chính biết dùng truyền thông" },
  { key: "nu-chinh-biet-dung-phap-luat", label: "Nữ chính biết dùng pháp luật" },
  { key: "nu-chinh-biet-dung-tien-va-co-phan", label: "Nữ chính biết dùng tiền và cổ phần" },
  { key: "nu-chinh-biet-dung-nhan-chung", label: "Nữ chính biết dùng nhân chứng" },
  { key: "nu-chinh-khong-khoc-truoc-mat-ke-thu", label: "Nữ chính không khóc trước mặt kẻ thù" },
  { key: "nu-chinh-mem-mong-nhung-khong-tha-thu", label: "Nữ chính mềm mỏng nhưng không tha thứ" },
  { key: "nu-chinh-dam-bo-di-khi-con-yeu", label: "Nữ chính dám bỏ đi khi còn yêu" },
  { key: "nu-chinh-tra-thu-bang-su-that", label: "Nữ chính trả thù bằng sự thật" },
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

    const storyDnaObject = parseStoryDnaObject(story?.story_dna);

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

    if (storyDnaObject) {
      collectUsefulTextFragments(
        [
          storyDnaObject.motifText,
          storyDnaObject.motifFingerprint,
          storyDnaObject.coverConcept,
          storyDnaObject.storyPlan,
          storyDnaObject.factory_seed,
        ],
        80,
      ).forEach((item) => motifs.add(item.slice(0, 260)));
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


function replaceKnownBadVietnamesePhrases(input: string) {
  const replacements: Array<[RegExp, string]> = [
    [/đúng lúc chương cần cô nhất/gi, "đúng lúc chương trình cần cô nhất"],
    [/mọi thứ đã có sẵn bằng tay/gi, "mọi bằng chứng đã nằm sẵn trong tay"],
    [/như một cây kim chỉ huy/gi, "khiến mọi ánh mắt lập tức đổ dồn về phía cô"],
    [/mồi câu bắt buộc phải hé lộ/gi, "một câu hỏi buộc họ phải để lộ người đứng sau"],
    [/tấm thẻ mà giờ đây gọi là [“\"]bằng chứng[”\"]/gi, "tấm thẻ nhỏ bé đang bị biến thành “bằng chứng”"],
    [/mở ra một lối tháo/gi, "mở ra một lối thoát"],
    [/góc bàn này bị đặt vào tay sai người/gi, "tôi bị đặt vào sai vị trí trong một ván cờ đã sắp sẵn"],
    [/giọng anh ta tròng đầy thách thức/gi, "giọng anh ta đầy vẻ thách thức"],
    [/Lời của ([^\n.]+?) đặt một đạo đứt vào giữa sự việc/gi, "Lời của $1 khiến sự việc lập tức nghiêm trọng hơn"],
    [/nó kéo một hơi dài/gi, "đủ tạo ra một khoảng chững"],
    [/Anh ta nói như trao đổi quyền lợi trước công chúng/gi, "Anh ta nói như thể đó là một đề nghị rất công bằng"],
    [/nhưng là người chọn cứu mình, tôi không để xúc động dẫn đường/gi, "nhưng nếu muốn tự cứu mình, tôi không được để cảm xúc dẫn đường"],
    [/Quyền lực đã tạm chuyển hướng khỏi tôi sang nhóm muốn khóa miệng tôi/gi, "Thế trận tạm thời nghiêng về phía những người muốn buộc tôi im lặng"],
  ];

  return replacements.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), input);
}

function cleanupReaderOnlyText(text: string, chapterNumber = 1) {
  let body = replaceKnownBadVietnamesePhrases(String(text || ""))
    .replace(/\r\n/g, "\n")
    .replace(/\uFEFF/g, "")
    .replace(/[\u200B-\u200D\u2060]/g, "")
    .replace(/^#\s*BẢN ĐỌC CHO ĐỘC GIẢ\s*$/gim, "")
    .replace(/^BẢN ĐỌC CHO ĐỘC GIẢ\s*$/gim, "")
    .replace(/^\s*(?:---\s*)+/g, "")
    .replace(/(?:\n\s*---\s*)+$/g, "")
    .trim();

  const chapterHeadingPattern = /^#?\s*Chương\s+\d+\s*(?:[—-].*)?$/gim;
  const headings = [...body.matchAll(chapterHeadingPattern)];

  if (headings.length > 0) {
    const firstHeading = headings[0];
    const firstIndex = firstHeading.index ?? 0;

    // Luôn bỏ mọi thứ nằm trước heading chương đầu tiên: tên truyện, separator, markdown rỗng.
    body = body.slice(firstIndex);

    let seenChapterHeading = false;
    body = body
      .split("\n")
      .filter((line) => {
        const trimmed = line.trim();

        if (!/^#?\s*Chương\s+\d+\s*(?:[—-].*)?$/i.test(trimmed)) return true;
        if (seenChapterHeading) return false;

        seenChapterHeading = true;
        return true;
      })
      .join("\n");
  }

  body = body
    .replace(/^\s*(?:---\s*)+/g, "")
    .replace(/\n\s*---\s*(?=\n\s*#?\s*Chương\s+\d+)/gi, "\n")
    .replace(/\n\s*---\s*\n\s*---\s*/g, "\n\n")
    .replace(/(?:\n\s*---\s*)+$/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!/^#?\s*Chương\s+\d+/im.test(body)) {
    body = `# Chương ${chapterNumber} — Chưa đặt tên\n\n${body}`.trim();
  }

  if (!body.startsWith("#")) {
    body = body.replace(/^Chương\s+/i, "# Chương ");
  }

  return body.trim();
}


function extractReaderOnly(output: string, chapterNumber = 1) {
  const readerBlock = extractBetween(
    output,
    ["# BẢN ĐỌC CHO ĐỘC GIẢ", "BẢN ĐỌC CHO ĐỘC GIẢ"],
    [
      "# BẢN PHÂN TÍCH KỸ THUẬT",
      "BẢN PHÂN TÍCH KỸ THUẬT",
      "=== THÔNG TIN TRUYỆN ĐỀ XUẤT ===",
    ],
  );

  return cleanupReaderOnlyText(cleanTechnicalMarkers(readerBlock || output), chapterNumber);
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


function pickExactLineValue(text: string, labels: string[]) {
  const lines = text.split("\n");

  for (const line of lines) {
    for (const label of labels) {
      const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(
        `^\\s*[-*]?\\s*${escapedLabel}\\s*[:：-]\\s*(.+)$`,
        "i",
      );
      const match = line.match(regex);

      if (match?.[1]) {
        return match[1].trim().replace(/^[\'\"]|[\'\"]$/g, "");
      }
    }
  }

  return "";
}

function cleanParsedTitleCandidate(text: string) {
  return cleanPublicStoryDescription(text)
    .replace(/^#+\s*/, "")
    .replace(/^Tên truyện\s*[:：-]\s*/i, "")
    .replace(/^Title\s*[:：-]\s*/i, "")
    .replace(/^Story title\s*[:：-]\s*/i, "")
    .replace(/^Chương\s*\d+\s*[—-]\s*/i, "")
    .trim();
}

function isBadStoryTitleCandidate(text: string, chapterNumber: number) {
  const title = cleanParsedTitleCandidate(text);
  const normalized = title.toLowerCase();

  if (!title) return true;
  if (title.length < 4 || title.length > 80) return true;
  if (/^chương\s*\d+/i.test(title)) return true;
  if (normalized.includes("không có")) return true;
  if (normalized.includes("chưa có")) return true;
  if (normalized.includes("bản đọc")) return true;
  if (normalized.includes("bản phân tích")) return true;
  if (normalized.includes("không đăng")) return true;
  if (normalized.includes("story dna")) return true;
  if (normalized.includes("motif")) return true;
  if (normalized.includes("chapter mission")) return true;
  if (normalized.includes("tên chương")) return true;
  if (normalized.includes("tiêu đề chương")) return true;
  if (normalized === `chương ${chapterNumber}`) return true;

  return false;
}

function getStoryTitleFromOutput(params: {
  combined: string;
  fallbackTitle: string;
  chapterNumber: number;
}) {
  const candidates = [
    pickExactLineValue(params.combined, [
      "Tên truyện đề xuất",
      "Tên truyện hiện tại",
      "Tên truyện",
      "Story title",
      "Title",
      "storyTitle",
    ]),
    pickLineValue(params.combined, ["Tên truyện", "Story title", "Title", "storyTitle"]),
  ]
    .map(cleanParsedTitleCandidate)
    .filter(Boolean);

  const picked = candidates.find(
    (candidate) => !isBadStoryTitleCandidate(candidate, params.chapterNumber),
  );

  return picked || params.fallbackTitle;
}

function parseStoryDnaObject(value: unknown) {
  if (!value) return null;
  if (typeof value === "object") return value as Record<string, any>;
  if (typeof value !== "string") return null;

  try {
    return JSON.parse(value) as Record<string, any>;
  } catch {
    return null;
  }
}

function collectUsefulTextFragments(value: unknown, limit = 80): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  function push(text: unknown) {
    if (typeof text !== "string") return;
    const cleaned = cleanPublicStoryDescription(text).slice(0, 260);
    const key = cleaned.toLowerCase();
    if (!cleaned || seen.has(key)) return;
    seen.add(key);
    result.push(cleaned);
  }

  function walk(input: unknown, depth: number) {
    if (result.length >= limit || depth > 4 || !input) return;

    if (typeof input === "string") {
      push(input);
      return;
    }

    if (Array.isArray(input)) {
      input.slice(0, 30).forEach((item) => walk(item, depth + 1));
      return;
    }

    if (typeof input === "object") {
      const raw = input as Record<string, unknown>;
      const priorityKeys = [
        "title",
        "corePremise",
        "openingScene",
        "incitingIncident",
        "evidenceObject",
        "mainConflict",
        "hiddenTruth",
        "setting",
        "villainType",
        "heroineArc",
        "emotionalHook",
        "powerStructure",
        "publicPressure",
        "shortFingerprint",
        "motifText",
        "visualArena",
        "heroine",
        "compositionType",
        "moodTone",
        "colorTone",
        "premiseFamily",
        "openingArena",
        "mainArena",
        "secondaryArena",
        "evidenceType",
        "villainAttackType",
        "heroineCounterType",
        "hiddenTruthType",
        "deadlineStyle",
      ];

      priorityKeys.forEach((key) => walk(raw[key], depth + 1));

      [
        "genreBlend",
        "antiRepeatTags",
        "clueProps",
        "secondaryFigures",
        "conflictVisuals",
        "mustShowElements",
        "negativePrompt",
        "evidencePlan",
        "villainCurve",
        "payoffPlan",
      ].forEach((key) => walk(raw[key], depth + 1));
    }
  }

  walk(value, 0);
  return result;
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

  if (!heading) return `Cánh Cửa Thứ ${chapterNumber}`;

  const match = heading.match(/^Chương\s*\d+\s*[—-]\s*(.+)$/i);

  if (match?.[1]) return match[1].trim();

  return (
    heading.replace(/^Chương\s*\d+\s*/i, "").trim() ||
    `Cánh Cửa Thứ ${chapterNumber}`
  );
}

function normalizeStoryDescription(readerOnly: string) {
  return readerOnly
    .replace(/^#.*$/gm, "")
    .replace(/^Chương\s*\d+\s*[—-]?\s*.*$/gim, "")
    .replace(/\bChương\s*\d+\s*[—-]\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 260);
}

function cleanPublicStoryDescription(text: string) {
  return text
    .replace(/^[-*\s]+/, "")
    .replace(/^['"]|['"]$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isLeakedFactoryDescription(text: string) {
  const normalized = text.toLowerCase();

  const leakedPatterns = [
    "nữ chính thuộc kiểu",
    "truyện phải ưu tiên",
    "drama lane",
    "module",
    "factory",
    "prompt",
    "heroine",
    "genrelabel",
    "story seed",
    "premise seed",
    "kiểu nữ chính",
    "thể loại:",
    "số chương mục tiêu",
    "yêu cầu output",
    "yêu cầu đa dạng hóa",
    "quy tắc chống lặp",
    "không đăng",
    "bản phân tích kỹ thuật",
    "thông tin truyện đề xuất",
    "kiểm tra tiến độ truyện",
    "bộ nhớ truyện",
  ];

  return leakedPatterns.some((pattern) => normalized.includes(pattern));
}

function isUsablePublicStoryDescription(text: string) {
  const cleaned = cleanPublicStoryDescription(text);

  if (cleaned.length < 45) return false;
  if (isLeakedFactoryDescription(cleaned)) return false;

  return true;
}

function buildFallbackPublicStoryDescription(params: {
  storyTitle: string;
  genreLabel: string;
  chapterTitle: string;
  readerOnly: string;
}) {
  const firstScene = normalizeStoryDescription(params.readerOnly);
  const chapterHook = params.chapterTitle
    ? `Mở đầu từ biến cố "${params.chapterTitle}", câu chuyện kéo nhân vật chính vào vòng xoáy của bí mật, phản bội và những lựa chọn không thể quay đầu.`
    : `Một biến cố bất ngờ kéo nhân vật chính vào vòng xoáy của bí mật, phản bội và những lựa chọn không thể quay đầu.`;

  const base = firstScene && !isLeakedFactoryDescription(firstScene)
    ? `${firstScene} Từ dấu vết đầu tiên ấy, cô buộc phải tỉnh táo lần theo sự thật và giành lại quyền kiểm soát cuộc đời mình.`
    : `${chapterHook} Khi mọi thứ tưởng như đã được sắp đặt, cô bắt đầu lần theo từng dấu vết để nhìn rõ ai là người đứng sau tất cả.`;

  return cleanPublicStoryDescription(base).slice(0, 360);
}

function getPublicStoryDescription(params: {
  output: string;
  readerOnly: string;
  storyTitle: string;
  genreLabel: string;
  chapterTitle: string;
}) {
  const candidateFromReader = pickLineValue(params.readerOnly, [
    "Mô tả",
    "Description",
    "Story description",
    "Tóm tắt",
  ]);

  const candidateFromOutput = pickLineValue(params.output, [
    "Mô tả public",
    "Mô tả độc giả",
    "Public description",
    "Reader description",
  ]);

  const candidates = [
    candidateFromReader,
    candidateFromOutput,
    normalizeStoryDescription(params.readerOnly),
  ]
    .map(cleanPublicStoryDescription)
    .filter(Boolean);

  const picked = candidates.find(isUsablePublicStoryDescription);

  if (picked) return picked.slice(0, 360);

  return buildFallbackPublicStoryDescription(params);
}

export function parseChapterOutput(params: {
  output: string;
  genreLabel: string;
  chapterNumber: number;
  runShortId: string;
}): ParsedChapterOutput {
  const readerOnly = extractReaderOnly(params.output, params.chapterNumber);
  const technicalReport = extractTechnicalReport(params.output);
  const combined = `${technicalReport}\n${params.output}`;

  const fallbackTitle = buildFallbackStoryTitle({
    genreLabel: params.genreLabel,
    runShortId: params.runShortId,
  });

  const storyTitle = getStoryTitleFromOutput({
    combined,
    fallbackTitle,
    chapterNumber: params.chapterNumber,
  });

  const chapterTitle = getChapterTitleFromReader(
    readerOnly,
    params.chapterNumber,
  );

  const storyDescription = getPublicStoryDescription({
    output: params.output,
    readerOnly,
    storyTitle,
    genreLabel: params.genreLabel,
    chapterTitle,
  });

  const chapterSlug = `${slugifyVietnamese(chapterTitle)}-${params.chapterNumber}`;

  return {
    raw: params.output,
    storyTitle,
    storySlug: `${slugifyVietnamese(storyTitle)}-${params.runShortId}`,
    storyDescription,
    chapterTitle,
    chapterSlug,
    readerOnly,
    technicalReport,
  };
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
