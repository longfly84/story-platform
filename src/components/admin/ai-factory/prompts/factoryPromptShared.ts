function makeId(prefix = "id") {
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `${prefix}_${Date.now()}_${randomPart}`;
}

export function pickOne<T>(items: T[], fallback: T): T {
  if (!items.length) return fallback;
  return items[Math.floor(Math.random() * items.length)];
}

function pickRandomDistinct<T>(
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

export function buildFallbackStoryTitle(params: {
  genreLabel: string;
  runShortId: string;
}) {
  return pickTitleFromBank({
    genreLabel: params.genreLabel,
    seed: params.runShortId,
  });
}

