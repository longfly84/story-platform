import type {
  AvoidLibrary,
  ExistingStory,
  FactoryGenreOption,
  FactoryHeroineOption,
  FactoryStorySeed,
  ParsedChapterOutput,
} from './aiFactoryTypes'

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

export const FACTORY_OPENING_SCENES = [
  "bệnh viện lúc nửa đêm, khi một ca sinh hoặc ca cấp cứu làm lộ bí mật",
  "phòng họp công ty, ngay trước khi quyết định sa thải hoặc bổ nhiệm được công bố",
  "sảnh khách sạn, khi nữ chính vô tình thấy người không nên xuất hiện",
  "buổi livestream hoặc họp báo, khi một câu hỏi công khai đẩy sự việc bùng nổ",
  "tiệc cưới hoặc lễ đính hôn, khi thân phận hoặc bằng chứng bị lật ra",
  "đám tang hoặc lễ cúng, khi di chúc hoặc hồ sơ thừa kế xuất hiện",
  "sân bay, khi ai đó bỏ trốn hoặc quay về bất ngờ",
  "tòa án hoặc văn phòng luật sư, khi hồ sơ cũ bị mở lại",
  "trường học hoặc cổng trường, khi con trẻ bị kéo vào xung đột người lớn",
  "gara, bãi đỗ xe hoặc tầng hầm, khi một cuộc nói chuyện bí mật bị nghe thấy",
  "studio, phim trường hoặc hậu trường sự kiện, khi scandal bị khui ra",
  "thang máy hoặc hành lang chung cư, khi nữ chính gặp người không ngờ tới",
  "bữa tiệc công ty, khi mối quan hệ bí mật bị phát hiện",
  "phòng khám hoặc phòng xét nghiệm, khi kết quả làm đảo chiều toàn bộ câu chuyện",
  "nhóm chat gia đình hoặc tin nhắn nội bộ, khi ảnh chụp màn hình bị phát tán",
  "cửa hàng trang sức, ngân hàng hoặc phòng VIP, khi giao dịch bất thường bị phát hiện",
  "buổi họp phụ huynh, khi con cái vô tình trở thành điểm nổ",
  "chuyến du lịch hoặc resort, khi sự thật bị bóc ra giữa nơi xa lạ",
  "ngày giỗ hoặc ngày kỷ niệm gia đình, khi người cũ quay lại",
  "trên xe ô tô, camera hành trình hoặc trạm dừng, khi đoạn ghi âm quan trọng xuất hiện",
  "nhà đấu giá, khi một món đồ cũ làm lộ thân phận thật",
  "triển lãm tranh, khi bức họa bị che phủ hé lộ bí mật cũ",
  "quán cà phê, khi nữ chính đến nhầm cuộc hẹn nhưng nghe được sự thật",
  "hiệu sách cũ, khi một lá thư bị kẹp trong sách được tìm thấy",
  "phòng VIP nhà hàng, khi thỏa thuận ngầm bị ghi âm",
  "du thuyền trong đêm, khi người tưởng đã biến mất xuất hiện",
  "khu biệt thự, khi camera ẩn trong phòng khách tự động bật lại",
  "từ đường gia tộc, khi gia quy bị dùng để ép nữ chính nhận tội",
  "cô nhi viện, khi hồ sơ nhận nuôi cũ bị mở ra",
  "cửa bệnh viện phụ sản, khi một vòng tay trẻ sơ sinh không khớp mã hồ sơ",
  "show diễn thời trang, khi mẫu thiết kế bị đánh tráo ngay trước giờ lên sàn",
  "phòng livestream bán hàng, khi bình luận của một tài khoản lạ phá vỡ kịch bản",
  "phòng nhân sự, khi quyết định sa thải được ký nhầm người",
  "cửa ngân hàng, khi nữ chính phát hiện mình là người thụ hưởng tài khoản lạ",
  "lễ trao giải, khi video hậu trường bị phát lên màn hình lớn",
  "phòng chờ sân bay quốc tế, khi vé máy bay mang tên người đã chết xuất hiện",
  "bãi biển resort, khi chiếc điện thoại bị sóng đánh dạt vào bờ",
  "phòng trẻ em, khi camera của bảo mẫu lưu lại cảnh không nên có",
  "phòng họp phụ huynh, khi một đứa trẻ nói ra câu người lớn cố giấu",
  "cầu thang thoát hiểm, khi nữ chính nghe được kế hoạch gài bẫy mình",
];

export const FACTORY_TRIGGERS = [
  "một tin nhắn nhầm người",
  "một email nội bộ bị chuyển tiếp sai",
  "một đoạn ghi âm chưa từng công bố",
  "một bản hợp đồng có điều khoản ẩn",
  "một khoản chuyển tiền bất thường",
  "một video camera bị cắt ghép",
  "một kết quả ADN hoặc xét nghiệm",
  "một bản di chúc mới",
  "một tài khoản ẩn trên mạng xã hội",
  "một đơn tố cáo nặc danh",
  "một cuộc gọi từ người đã biến mất",
  "một hồ sơ bệnh án bị sửa",
  "một đơn ly hôn hoặc hủy hôn được nộp trước",
  "một bài bóc phốt lan truyền trên hot search",
  "một thư tay cũ hoặc nhật ký bị tìm thấy",
  "một USB chứa dữ liệu nhạy cảm",
  "một camera hành trình ghi lại khoảnh khắc quyết định",
  "một tài khoản ngân hàng đứng tên người khác",
  "một tấm ảnh chụp màn hình tưởng vô hại",
  "một món quà có ý nghĩa che giấu bí mật",
  "một vé máy bay khứ hồi không ai nhận",
  "một mã phòng khách sạn xuất hiện trong điện thoại",
  "một biên lai chuyển khoản bị vò nát",
  "một tài khoản phụ tự động đăng bài",
  "một tệp camera được khôi phục từ thẻ nhớ",
  "một tên người lạ nằm trong giấy khai sinh",
  "một điều khoản bảo hiểm đổi người thụ hưởng",
  "một chiếc vòng tay trẻ sơ sinh có mã sai",
  "một tin nhắn thoại gửi lúc 3 giờ sáng",
  "một hợp đồng ủy quyền bị ký giả",
];

export const FACTORY_EVIDENCE_OBJECTS = [
  "USB dữ liệu",
  "điện thoại cũ",
  "đoạn ghi âm",
  "camera hành trình",
  "hồ sơ bệnh án",
  "bản hợp đồng",
  "đơn bảo hiểm",
  "sao kê ngân hàng",
  "email in ra",
  "vòng tay, dây chuyền hoặc nhẫn",
  "ảnh chụp màn hình",
  "thư tay",
  "nhật ký",
  "vé máy bay",
  "hóa đơn giao dịch",
  "đơn xét nghiệm",
  "đơn thừa kế",
  "bản sao camera",
  "thẻ nhớ",
  "sổ hộ khẩu, giấy khai sinh hoặc hồ sơ nhân thân",
  "mã đặt phòng",
  "biên lai chuyển khoản",
  "hồ sơ nhận nuôi",
  "bản quyền thiết kế",
  "hồ sơ cổ phần",
  "hợp đồng ủy quyền",
  "vòng tay trẻ sơ sinh",
  "đơn ly hôn",
  "di chúc viết tay",
  "tệp sao lưu đám mây",
];

export const FACTORY_SETTINGS = [
  "gia tộc hào môn",
  "tập đoàn lớn",
  "gia đình nhiều thế hệ",
  "showbiz hoặc giải trí",
  "ngành luật hoặc pháp lý",
  "bệnh viện tư",
  "trường quốc tế",
  "phim trường hoặc truyền thông",
  "giới đầu tư hoặc tài chính",
  "resort hoặc khách sạn cao cấp",
  "khu chung cư cao cấp",
  "doanh nghiệp gia đình",
  "môi trường hôn nhân liên minh",
  "cuộc chiến giành quyền nuôi con",
  "mối quan hệ mẹ chồng - nàng dâu",
  "đấu đá nội bộ công ty",
  "cuộc chiến thừa kế",
  "mối quan hệ tình cũ - chồng cũ - hôn nhân mới",
  "bệnh viện phụ sản",
  "ngân hàng hoặc phòng VIP",
  "nhà đấu giá",
  "triển lãm nghệ thuật",
  "câu lạc bộ tư nhân",
  "du thuyền hoặc tiệc đêm",
  "cô nhi viện hoặc hồ sơ nhận nuôi",
  "hậu trường livestream",
  "sàn diễn thời trang",
  "họp báo hoặc khủng hoảng truyền thông",
  "biệt thự gia tộc",
  "từ đường hoặc nhà thờ họ",
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

function hashText(input: string) {
  let hash = 0;

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

const FACTORY_TITLE_BANK: Record<string, string[]> = {
  betrayal: [
    "Sau Bức Ảnh Cuối Cùng",
    "Đêm Anh Phản Bội Tôi",
    "Tấm Vé Du Lịch Định Mệnh",
    "Người Bạn Thân Sau Cánh Cửa",
    "Ngày Tôi Ngừng Tha Thứ",
    "Bữa Tiệc Của Kẻ Thứ Ba",
    "Lời Nói Dối Trong Phòng Khách Sạn",
    "Khi Tôi Ký Đơn Ly Hôn",
    "Hủy Hôn Trước Cả Nhà",
    "Bức Ảnh Trong Máy Của Chồng Tôi",
    "Người Đứng Sau Chuyến Du Lịch",
    "Đêm Tôi Rời Khỏi Căn Nhà Đó",
    "Tin Nhắn Gửi Nhầm Lúc Nửa Đêm",
    "Tài Khoản Ẩn Của Anh",
    "Người Phụ Nữ Trong Lịch Sử Cuộc Gọi",
  ],
  wealthy: [
    "Bí Mật Trong Gia Phả",
    "Trái Dấu Trong Giang Gia",
    "Thiên Kim Bị Đánh Tráo",
    "Di Chúc Sau Bức Chân Dung",
    "Người Thừa Kế Bị Xóa Tên",
    "Bữa Tiệc Hào Môn Đêm Đó",
    "Tờ Xét Nghiệm Bị Giấu Kín",
    "Cô Gái Không Có Tên Trong Gia Phả",
    "Chiếc Vòng Ngọc Của Người Mất Tích",
    "Sảnh Tiệc Không Dành Cho Tôi",
    "Hợp Đồng Đỏ Trong Biệt Thự",
    "Đêm Gia Tộc Bắt Tôi Cúi Đầu",
    "Từ Đường Mở Lại Hồ Sơ Cũ",
    "Di Sản Dưới Tên Người Lạ",
    "Người Trở Về Trước Lễ Chia Tài Sản",
  ],
  business: [
    "Bản Hợp Đồng Bị Đánh Tráo",
    "Ngày Tôi Lấy Lại Dự Án",
    "Cuộc Họp Khiến Họ Câm Lặng",
    "Báo Cáo Cuối Cùng Trên Bàn Họp",
    "Cổ Phần Không Thể Chối Bỏ",
    "Nữ Giám Đốc Bị Loại Khỏi Cuộc Chơi",
    "Chữ Ký Trong Hồ Sơ Mật",
    "Tôi Trở Lại Phòng Hội Đồng",
    "Dự Án Bị Cướp Trong Đêm",
    "Biên Bản Họ Không Dám Công Bố",
    "Ngày Hội Đồng Quản Trị Đổi Chủ",
    "Bản Sao Kê Trên Màn Hình Lớn",
    "Cổ Đông Lớn Không Ai Ngờ Tới",
    "Email Nội Bộ Lật Đổ Tất Cả",
    "Phòng Họp Không Còn Chỗ Cho Họ",
  ],
  mother: [
    "Đứa Trẻ Không Mong Đợi",
    "Ngày Tôi Giành Lại Con Mình",
    "Con Tôi Không Phải Quân Cờ",
    "Giấy Khai Sinh Bị Giấu Kín",
    "Đêm Con Tôi Bị Đưa Đi",
    "Người Mẹ Không Còn Im Lặng",
    "Camera Trong Phòng Trẻ",
    "Tôi Không Ký Giấy Từ Bỏ Quyền Nuôi Con",
    "Buổi Họp Phụ Huynh Đảo Chiều",
    "Vòng Tay Sơ Sinh Sai Mã",
    "Hồ Sơ Nhận Nuôi Bị Xé Rách",
    "Đứa Trẻ Gọi Tôi Là Mẹ",
  ],
  legal: [
    "Lá Đơn Không Thể Rút Lại",
    "Bằng Chứng Cuối Trước Tòa",
    "Ngày Tôi Kiện Ngược Họ",
    "Hồ Sơ Cũ Trong Văn Phòng Luật",
    "Luật Sư Của Chính Mình",
    "Phiên Tòa Khiến Họ Quỳ Xuống",
    "Điều Khoản Bị Giấu Trong Hợp Đồng",
    "Đơn Tố Cáo Nặc Danh",
    "Bản Ghi Âm Trước Giờ Xét Xử",
    "Người Làm Chứng Đến Muộn",
  ],
  showbiz: [
    "Hot Search Lúc Ba Giờ Sáng",
    "Hậu Trường Không Có Ánh Đèn",
    "Nữ Chính Bị Cắt Vai",
    "Bản Hợp Đồng PR Đêm Đó",
    "Livestream Khiến Cả Mạng Đổi Chiều",
    "Video Hậu Trường Không Nên Xuất Hiện",
    "Tôi Không Còn Là Vai Phụ",
    "Buổi Họp Báo Không Theo Kịch Bản",
    "Người Đại Diện Bán Đứng Tôi",
    "Tấm Ảnh Sau Cánh Gà",
  ],
  rebirth: [
    "Tỉnh Lại Trước Ngày Bi Kịch",
    "Lần Này Tôi Không Cứu Anh",
    "Trở Về Khi Mọi Thứ Chưa Muộn",
    "Ngày Cũ Không Lặp Lại",
    "Tôi Biết Trước Lá Bài Của Họ",
    "Sáng Hôm Đó Tôi Đổi Đáp Án",
    "Kiếp Này Tôi Chọn Mình",
    "Trước Khi Họ Kịp Phản Bội",
    "Tôi Trở Về Đúng Đêm Mưa Đó",
    "Lần Này Họ Không Thắng",
  ],
  default: [
    "Tờ Giấy Không Nên Xuất Hiện",
    "Cánh Cửa Thứ Hai",
    "Người Đứng Sau Tấm Rèm",
    "Đêm Mưa Không Có Lời Xin Lỗi",
    "Bí Mật Trong Chiếc Hộp Cũ",
    "Khi Họ Gọi Tôi Là Người Thừa",
    "Một Cuộc Gọi Trước Bình Minh",
    "Tên Tôi Trong Hồ Sơ Mật",
    "Nụ Cười Của Người Chiến Thắng",
    "Tôi Không Còn Đứng Sau Lưng Ai",
    "Tấm Thẻ Phòng Bị Bỏ Quên",
    "Một Người Lạ Biết Tên Tôi",
    "Cơn Mưa Trước Ngày Rời Đi",
    "Chiếc Chìa Khóa Không Thuộc Về Tôi",
    "Người Cuối Cùng Nhìn Thấy Sự Thật",
  ],
};

function getTitleBucketKey(genreLabel: string) {
  const text = genreLabel.toLowerCase();

  if (
    text.includes("bạn thân") ||
    text.includes("tiểu tam") ||
    text.includes("ngoại tình") ||
    text.includes("hôn nhân")
  ) {
    return "betrayal";
  }

  if (
    text.includes("hào môn") ||
    text.includes("gia tộc") ||
    text.includes("thừa kế") ||
    text.includes("thân thế") ||
    text.includes("thiên kim")
  ) {
    return "wealthy";
  }

  if (
    text.includes("công sở") ||
    text.includes("thương chiến") ||
    text.includes("tập đoàn") ||
    text.includes("cổ phần") ||
    text.includes("doanh nghiệp")
  ) {
    return "business";
  }

  if (
    text.includes("mẹ") ||
    text.includes("con") ||
    text.includes("quyền nuôi") ||
    text.includes("gia đình")
  ) {
    return "mother";
  }

  if (
    text.includes("luật") ||
    text.includes("pháp lý") ||
    text.includes("tòa án") ||
    text.includes("tố cáo")
  ) {
    return "legal";
  }

  if (
    text.includes("showbiz") ||
    text.includes("hot search") ||
    text.includes("livestream") ||
    text.includes("họp báo") ||
    text.includes("idol")
  ) {
    return "showbiz";
  }

  if (
    text.includes("tái sinh") ||
    text.includes("trọng sinh") ||
    text.includes("làm lại")
  ) {
    return "rebirth";
  }

  return "default";
}

function pickTitleFromBank(params: {
  genreLabel: string;
  seed: string;
  avoidTitles?: string[];
}) {
  const key = getTitleBucketKey(params.genreLabel);
  const primaryPool = FACTORY_TITLE_BANK[key] || FACTORY_TITLE_BANK.default;
  const mixedPool = [...primaryPool, ...FACTORY_TITLE_BANK.default];
  const avoid = new Set(
    (params.avoidTitles || []).map((title) => title.trim().toLowerCase()),
  );
  const offset = hashText(`${params.seed}-${params.genreLabel}`);

  for (let i = 0; i < mixedPool.length; i += 1) {
    const title = mixedPool[(offset + i) % mixedPool.length];

    if (!avoid.has(title.trim().toLowerCase())) {
      return title;
    }
  }

  return `${primaryPool[offset % primaryPool.length]} ${params.seed.slice(-4)}`;
}

export function buildUniqueFactoryTitle(params: {
  genreLabel: string;
  seed: string;
  avoidTitles?: string[];
}) {
  return pickTitleFromBank(params);
}

export function buildFactoryDiversitySeed(params?: {
  recentTitles?: string[];
  recentMotifs?: string[];
  seed?: string;
}) {
  const used = new Set<string>();

  (params?.recentTitles || []).forEach((item) => used.add(item.toLowerCase()));
  (params?.recentMotifs || []).forEach((item) => used.add(item.toLowerCase()));

  const seed = params?.seed || makeId("diversity");
  const seedOffset = hashText(seed);

  const rotate = <T>(items: T[]) => {
    if (!items.length) return items;
    const offset = seedOffset % items.length;
    return [...items.slice(offset), ...items.slice(0, offset)];
  };

  const openingScene = pickRandomDistinct(
    rotate(FACTORY_OPENING_SCENES),
    used,
    (item) => String(item).toLowerCase(),
  );
  const trigger = pickRandomDistinct(rotate(FACTORY_TRIGGERS), used, (item) =>
    String(item).toLowerCase(),
  );
  const evidenceObject = pickRandomDistinct(
    rotate(FACTORY_EVIDENCE_OBJECTS),
    used,
    (item) => String(item).toLowerCase(),
  );
  const setting = pickRandomDistinct(rotate(FACTORY_SETTINGS), used, (item) =>
    String(item).toLowerCase(),
  );

  return {
    openingScene,
    trigger,
    evidenceObject,
    setting,
  };
}

export function buildAvoidLibrary(stories: ExistingStory[]): AvoidLibrary {
  const titles = new Set<string>();
  const motifs = new Set<string>();
  const characterNames = new Set<string>();
  const companyNames = new Set<string>();

  stories.forEach((story: any) => {
    if (story?.title) titles.add(String(story.title));
    if (story?.description) motifs.add(String(story.description).slice(0, 180));

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
  genreLabel: string
  heroineLabel: string
  targetChapters: number
  avoidLibrary: AvoidLibrary
  premiseSeed: string
  storySeed?: FactoryStorySeed | null
}) {
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

YÊU CẦU ĐA DẠNG HÓA BẮT BUỘC:
- Opening scene bắt buộc dùng seed sau: ${diversitySeed.openingScene}
- Biến cố kích hoạt chính: ${diversitySeed.trigger}
- Vật chứng / đồ vật quan trọng: ${diversitySeed.evidenceObject}
- Bối cảnh chính: ${diversitySeed.setting}

QUY TẮC CHỐNG LẶP:
- Không mặc định mở đầu ở bàn ăn, bàn tiệc, bàn họp gia đình, bàn ký giấy nếu seed không yêu cầu.
- Không lặp mô típ "bút", "chữ ký", "bản giấy", "bữa ăn lạnh lẽo", "mâm cơm", "mọi người nhìn chằm chằm" quá thường xuyên.
- Không mặc định vật chứng là ảnh, hóa đơn khách sạn hoặc camera nếu seed hiện tại không chọn nó.
- Mỗi truyện phải có opening scene, setting, trigger và object khác nhau rõ rệt.
- Nếu kho truyện gần đây đã có "bàn ăn / chữ ký / bút / hóa đơn / camera", hãy tránh dùng lại.
- Chương 1 phải vào tình huống riêng của truyện, không dùng lại khung mở đầu của truyện khác.

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

function buildFallbackStoryTitle(params: {
  genreLabel: string;
  runShortId: string;
}) {
  return pickTitleFromBank({
    genreLabel: params.genreLabel,
    seed: params.runShortId,
  });
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

  return {
    raw: params.output,
    storyTitle,
    storySlug: `${slugifyVietnamese(storyTitle)}-${params.runShortId}`,
    storyDescription,
    chapterTitle,
    chapterSlug: `chuong-${params.chapterNumber}-${slugifyVietnamese(chapterTitle)}`,
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

function buildMockReader(params: {
  storyTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  diversitySeed: ReturnType<typeof buildFactoryDiversitySeed>;
}) {
  const chapter = params.chapterNumber;

  if (chapter === 1) {
    return `# Chương 1 — ${params.chapterTitle}

Tối đó, tôi không đứng trước bàn ăn hay một tờ giấy quen thuộc nào cả. Tôi đứng ở ${params.diversitySeed.openingScene}. Không khí xung quanh ồn ào đến mức mọi tiếng thở đều bị nuốt mất, nhưng tôi vẫn nghe rõ tim mình đập khi ${params.diversitySeed.trigger} xuất hiện trước mắt.

Thứ nằm trong tay tôi là ${params.diversitySeed.evidenceObject}. Nó không nặng, nhưng đủ kéo cả cuộc đời tôi lệch khỏi vị trí cũ. Trong bối cảnh ${params.diversitySeed.setting}, người ta thường tin vào thể diện hơn sự thật. Còn tôi, lần đầu tiên sau nhiều năm, quyết định không bảo vệ thể diện cho bất kỳ ai nữa.

"Cô lấy thứ đó ở đâu?" người đối diện hỏi, giọng thấp xuống.

Tôi nhìn họ, bình tĩnh đến lạ.

"Từ nơi mà các người nghĩ tôi sẽ không bao giờ dám kiểm tra."

Khoảnh khắc ấy, tôi biết cánh cửa mình vừa mở ra sẽ không thể đóng lại. Nhưng nếu họ đã muốn biến tôi thành kẻ chịu tội, tôi sẽ cho họ thấy một người im lặng quá lâu có thể nhớ rõ từng vết dao như thế nào.`;
  }

  return `# Chương ${chapter} — ${params.chapterTitle}

Sau biến cố đầu tiên, tôi không vội công khai tất cả. Người nóng ruột luôn dễ lộ sơ hở hơn người bị dồn vào đường cùng. Tôi để họ tưởng mình chỉ nhặt được một mảnh vụn, trong khi phía sau, từng đầu mối đã bắt đầu nối lại với nhau.

${params.diversitySeed.evidenceObject} chỉ là điểm khởi đầu. Thứ đáng sợ hơn là cách mọi người phản ứng khi nghe tên nó. Có người né mắt. Có người lập tức gọi điện. Có người cố cười như chưa từng biết gì.

Tôi ngồi trong im lặng, ghi nhớ từng biểu cảm.

Đêm đó, một tin nhắn lạ gửi tới máy tôi: "Nếu còn muốn yên ổn, đừng đào tiếp."

Tôi nhìn dòng chữ ấy rất lâu rồi bật cười. Họ vẫn nghĩ tôi muốn yên ổn. Không. Thứ tôi muốn bây giờ là sự thật, và tôi sẽ bắt từng người trả lại nó nguyên vẹn.`;
}

export function buildMockChapterOutput(params: {
  chapterNumber: number;
  genreLabel: string;
  heroineLabel: string;
  runShortId: string;
}) {
  const diversitySeed = buildFactoryDiversitySeed({ seed: params.runShortId });
  const storyTitle = buildFallbackStoryTitle({
    genreLabel: params.genreLabel,
    runShortId: params.runShortId,
  });
  const chapterTitle =
    params.chapterNumber === 1
      ? pickOne(
          [
            "Đêm Mọi Thứ Lệch Khỏi Quỹ Đạo",
            "Tin Nhắn Không Nên Xuất Hiện",
            "Người Đứng Sau Cánh Cửa",
            "Hồ Sơ Bị Mở Lại",
            "Cuộc Gọi Trước Bình Minh",
            "Mã Phòng Trong Điện Thoại",
            "Vé Máy Bay Của Người Đã Mất",
            "Camera Ở Tầng Hầm",
          ],
          "Đêm Mọi Thứ Lệch Khỏi Quỹ Đạo",
        )
      : pickOne(
          [
            "Cái Bẫy Bắt Đầu Siết Lại",
            "Người Đầu Tiên Hoảng Sợ",
            "Dấu Vết Thứ Hai",
            "Lời Cảnh Báo Nặc Danh",
            "Kẻ Giữ Chìa Khóa",
            "Một Cái Tên Không Nên Có",
          ],
          `Cảnh Cửa Thứ ${params.chapterNumber}`,
        );

  const reader = buildMockReader({
    storyTitle,
    chapterNumber: params.chapterNumber,
    chapterTitle,
    diversitySeed,
  });

  return `# BẢN ĐỌC CHO ĐỘC GIẢ

${reader}

# BẢN PHÂN TÍCH KỸ THUẬT / KHÔNG ĐĂNG

=== THÔNG TIN TRUYỆN ĐỀ XUẤT ===
- Tên truyện: ${storyTitle}
- Thể loại: ${params.genreLabel}
- Kiểu nữ chính: ${params.heroineLabel}
- Opening seed: ${diversitySeed.openingScene}
- Trigger seed: ${diversitySeed.trigger}
- Evidence seed: ${diversitySeed.evidenceObject}
- Setting seed: ${diversitySeed.setting}

=== KIỂM TRA TIẾN ĐỘ TRUYỆN ===
- Chương hiện tại: ${params.chapterNumber}
- Cliffhanger: có
- Memory: nữ chính đã phát hiện một đầu mối quan trọng và bắt đầu phản công.
`;
}

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
  const evidenceObject = pickSeedItem(FACTORY_EVIDENCE_OBJECTS, params.seed, 'evidence')
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
  const emotionalHook = `Một người phụ nữ bị ép nhận phần thua thiệt, nhưng lần này cô nhận ra mình vẫn còn một bằng chứng đủ để đảo chiều.`
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
- Không tự đổi về bàn ăn, bàn tiệc, bút, chữ ký, hóa đơn khách sạn hoặc camera nếu seed không yêu cầu.
- Không viết mở đầu kiểu mọi người cùng ngồi nhìn nữ chính quanh bàn ăn.
- Không dùng lại khung cảnh ép ký giấy nếu seed không nói rõ.
- Truyện phải khác rõ rệt ở bối cảnh, vật chứng, áp lực và bí mật.
`.trim()
}