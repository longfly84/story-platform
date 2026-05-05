import type { AvoidLibrary, FactoryStorySeed } from "../aiFactoryTypes";
import { buildUniqueFactoryTitle } from "./factoryPromptShared";

type StoryDramaLane = {
  key: string;
  label: string;
  conflicts: string[];
  settings: string[];
  evidenceObjects: string[];
  publicPressures: string[];
  hiddenTruths: string[];
  villainAttacks: string[];
  heroineCounters: string[];
  emotionalStakes: string[];
  dopamineHooks: string[];
};

export const FACTORY_RELATIONSHIP_CONFLICTS = [
  "vợ chồng rạn nứt vì một bí mật bị giấu trong hồ sơ gia đình",
  "bạn thân phản bội nhưng chỉ là quân cờ của người đứng sau",
  "mẹ chồng thao túng cả gia đình để đẩy nữ chính ra ngoài",
  "chị em bị tráo thân phận trong một gia tộc hào môn",
  "tình cũ quay lại đúng lúc nữ chính sắp mất mọi thứ",
  "đối tác công ty dùng tình cảm để cướp dự án",
  "luật sư gia đình che giấu điều khoản bất lợi",
  "bác sĩ bị mua chuộc để sửa hồ sơ bệnh án",
  "giáo viên / phụ huynh giàu có kéo con của nữ chính vào cuộc chiến",
  "người giám hộ giả xuất hiện để tranh quyền nuôi con",
  "thư ký thân tín của chồng nắm bí mật tài chính",
  "người thân đã mất để lại bằng chứng đảo ngược toàn bộ sự thật",
  "người quản lý nghệ sĩ dựng scandal để ép nữ chính nhận lỗi",
  "hội đồng quản trị dùng đời tư để tước quyền điều hành của nữ chính",
  "người cha ruột che giấu thân phận thật của con gái trong nhiều năm",
  "một người anh trai cùng cha khác mẹ dùng pháp lý để khóa tài sản",
  "người yêu cũ quay lại với một thân phận mới nguy hiểm hơn",
  "bạn học cũ trở thành đối thủ nắm điểm yếu của nữ chính",
  "một người giúp việc lâu năm nắm bí mật gia tộc",
  "đứa trẻ vô tình trở thành chìa khóa lật lại mọi lời nói dối",
  "một đối thủ truyền thông cố dựng nữ chính thành kẻ cướp công",
  "một người chị em kết nghĩa lợi dụng lòng tin để tráo bằng chứng",
  "một cổ đông thân thiết âm thầm bán đứng nữ chính trong buổi bỏ phiếu",
  "một người đàn ông từng cứu nữ chính nay trở thành người nắm dao",
  "một cuộc hôn nhân hợp đồng bị biến thành cái bẫy danh dự",
  "một vụ từ thiện bị dựng thành bê bối rửa tiền để hủy hoại nữ chính",
  "một buổi ra mắt sản phẩm bị biến thành sân khấu tố cáo đời tư",
  "một người em cùng mẹ khác cha bị dùng làm mồi nhử để ép nữ chính",
  "một kẻ đứng sau dùng dư luận phụ huynh để cô lập mẹ con nữ chính",
  "một bí mật trong giới nghệ thuật khiến nữ chính bị tước quyền thừa kế",
];

export const FACTORY_SETTING_CLUSTERS = [
  "bệnh viện tư lúc nửa đêm",
  "trường quốc tế trong buổi họp phụ huynh",
  "văn phòng luật sư trước phiên hòa giải",
  "phòng họp hội đồng quản trị",
  "sảnh khách sạn cao cấp",
  "sân bay trong ngày có người bỏ trốn",
  "phòng khám xét nghiệm ADN",
  "buổi livestream bán hàng / họp báo",
  "hậu trường phim trường / showbiz",
  "đám cưới hoặc lễ đính hôn",
  "đám tang / lễ đọc di chúc",
  "ngân hàng / phòng VIP tài chính",
  "nhà đấu giá / buổi tiệc từ thiện",
  "khu chung cư cao cấp",
  "resort trong chuyến du lịch gia đình",
  "gara / tầng hầm / bãi đỗ xe",
  "cổng trường của con",
  "phòng nhân sự công ty",
  "nhóm chat gia đình bị lộ tin nhắn",
  "văn phòng công chứng",
  "trung tâm thương mại",
  "du thuyền / tiệc riêng của giới thượng lưu",
  "cô nhi viện / trung tâm bảo trợ",
  "phòng điều hành truyền thông",
  "tòa án gia đình",
  "khu điều dưỡng cao cấp",
  "phòng họp khẩn của công ty gia đình",
  "studio chụp ảnh / hậu trường quảng cáo",
  "bãi biển trong một chuyến nghỉ dưỡng",
  "căn hộ penthouse nhìn xuống thành phố",
  "phòng tranh trong đêm khai mạc triển lãm",
  "lễ trao giải của giới sáng tạo nội dung",
  "hành lang bệnh viện nơi camera bị tắt đúng 7 phút",
  "phòng chờ VIP của một nhà ga cao tốc",
  "bữa tiệc sinh nhật trẻ con trong biệt thự hào môn",
  "phòng make-up trước buổi phát sóng trực tiếp",
  "khu vui chơi trẻ em trong trung tâm thương mại",
  "nhà hàng riêng nơi gia tộc định ép ký giấy",
  "phòng họp phụ huynh có camera nội bộ",
  "showroom xe sang trong ngày bàn giao tài sản",
];

export const FACTORY_SEED_EVIDENCE_OBJECTS = [
  "hồ sơ bệnh án bị sửa",
  "email nội bộ bị chuyển tiếp nhầm",
  "USB chứa file ghi âm",
  "camera hành trình trong xe",
  "hồ sơ nhập học của con",
  "giấy khai sinh bản cũ",
  "sao kê ngân hàng",
  "hợp đồng bảo hiểm nhân thọ",
  "di chúc mới được công chứng",
  "thẻ nhớ từ camera riêng",
  "đơn ly hôn được nộp trước",
  "hồ sơ cổ phần bị giấu",
  "tin nhắn trong nhóm chat gia đình",
  "tài khoản mạng xã hội ẩn",
  "bản ghi âm cuộc gọi lúc nửa đêm",
  "hóa đơn chuyển khoản bất thường",
  "hồ sơ nhận con nuôi",
  "vé máy bay một chiều",
  "báo cáo xét nghiệm ADN",
  "ảnh chụp màn hình bị xóa vội",
  "nhật ký cũ",
  "vòng tay / nhẫn / dây chuyền có mã khắc",
  "biên bản họp bị thay trang",
  "file camera bị cắt mất 7 phút",
  "đơn tố cáo nặc danh",
  "bản sao hợp đồng ủy quyền",
  "lịch khám thai bị chỉnh sửa",
  "mã đơn hàng gửi nhầm địa chỉ",
  "hồ sơ chuyển nhượng cổ phần",
  "tài liệu pháp lý trong két sắt",
  "một đoạn video 7 giây quay nhầm gương phản chiếu",
  "ảnh chụp bóng người trên cửa kính thang máy",
  "một hóa đơn hoa được gửi sai tên người nhận",
  "một hộp quà trẻ em có thẻ chúc mừng bị xé nửa",
  "một đoạn voice chat còn tiếng thở của người thứ ba",
  "lịch sử định vị xe vào đúng đêm mất chứng cứ",
  "một chiếc váy trẻ em có tem giặt khô từ khách sạn",
  "bảng phân ca nhân viên bị sửa bằng bút khác màu",
  "một mã QR trên vé sự kiện dẫn tới thư mục ẩn",
  "một bức tranh trong triển lãm che dấu chữ ký cũ",
  "một bản nháp thông cáo truyền thông gửi nhầm vào nhóm",
  "một file âm thanh bị cắt nhưng còn tiếng chuông đặc trưng",
  "một món đồ chơi của con bị bỏ lại ở nơi đáng lẽ con chưa từng đến",
  "một tấm ảnh polaroid cũ có ngày tháng lệch với câu chuyện của phản diện",
  "một phiếu gửi đồ trong khách sạn đứng tên người đã phủ nhận có mặt",
];

export const FACTORY_PUBLIC_PRESSURES = [
  "hot search trên mạng xã hội",
  "nhóm chat phụ huynh",
  "họp gia đình có người ngoài chứng kiến",
  "hội đồng quản trị công ty",
  "buổi họp báo",
  "livestream bị hàng nghìn người xem",
  "phiên hòa giải pháp lý",
  "lời đồn trong giới hào môn",
  "bài bóc phốt từ tài khoản ẩn",
  "đám cưới có khách mời thượng lưu",
  "buổi họp cổ đông",
  "đơn kiện công khai",
  "tin nhắn bị leak vào nhóm nội bộ",
  "video bị phát trên màn hình lớn",
  "các phụ huynh ở trường quốc tế",
  "một thông cáo truyền thông sai sự thật",
  "một bài phỏng vấn bị cắt ghép",
  "một cuộc bỏ phiếu trong gia tộc",
  "một buổi xét duyệt quyền nuôi con",
  "một hợp đồng bị công bố trước công ty",
  "một clip cắt ghép lan trong nhóm khách VIP",
  "một buổi gala từ thiện bị biến thành màn tố cáo",
  "một tài khoản anti-fan đồng loạt kéo bình luận bẩn",
  "một cuộc họp phụ huynh bị livestream lén",
  "một màn hình LED ở sự kiện bất ngờ phát sai file",
  "một topic ẩn danh trong diễn đàn trường học",
  "một danh sách khách mời bị rò rỉ kèm lời đồn",
  "một bản tin nội bộ công ty cố ý gọi nữ chính là người có lỗi",
  "một nhóm cổ đông nhỏ liên tục gây sức ép trước giờ bỏ phiếu",
  "một cuộc phỏng vấn độc quyền bị cắt thành câu nói bất lợi",
];

export const FACTORY_HIDDEN_TRUTHS = [
  "người bị xem là tiểu tam thật ra chỉ là người che giấu bí mật lớn hơn",
  "đứa trẻ bị kéo vào cuộc chiến không có thân phận như mọi người tưởng",
  "bằng chứng đầu tiên là giả, bằng chứng thứ hai mới là thật",
  "người chồng biết sự thật nhưng im lặng vì lợi ích cổ phần",
  "mẹ chồng thao túng mọi chuyện để che một lỗi cũ của gia tộc",
  "người bạn thân phản bội vì bị nắm điểm yếu",
  "di chúc cũ đã bị thay trang trước ngày công bố",
  "bệnh án bị sửa để che một ca phẫu thuật sai",
  "hồ sơ trường học bị đổi để tước quyền nuôi con",
  "vụ ngoại tình chỉ là bề nổi của một vụ chuyển tài sản",
  "người đã mất để lại manh mối cuối cùng",
  "luật sư gia đình làm việc cho cả hai phía",
  "camera bị xóa không phải để che ngoại tình mà để che một cuộc gặp khác",
  "người tưởng giúp nữ chính lại đang thử lòng cô",
  "gia tộc nhận nhầm người thừa kế trong nhiều năm",
  "công ty cố tình dựng scandal để ép nữ chính bán cổ phần",
  "người thân bị bệnh chỉ là lý do để chuyển quyền giám hộ",
  "một hợp đồng hôn nhân có điều khoản bị giấu",
  "người đứng sau phản diện là người nữ chính từng tin nhất",
  "sự thật về thân thế nằm trong một hồ sơ tưởng không liên quan",
  "người tung tin bẩn thật ra đang bị phản diện khống chế bằng món nợ cũ",
  "bằng chứng nữ chính tưởng là yếu điểm lại là bẫy để bắt kẻ nội gián",
  "người phản diện muốn che không phải tội ngoại tình mà là một vụ tráo quyền thừa kế",
  "người được xem là nhân chứng trung lập đã đổi lời khai vì con họ bị uy hiếp",
  "một món đồ trẻ con vô tình chứng minh phản diện có mặt tại hiện trường",
  "người bị kết tội năm xưa đã âm thầm để lại đường dẫn chứng cứ",
  "một thương vụ đầu tư chỉ là vỏ bọc để rút tài sản khỏi gia đình",
  "người đàn ông lạnh lùng bên cạnh nữ chính biết nhiều hơn anh ta thừa nhận",
  "kẻ đứng sau không muốn nữ chính thua kiện mà muốn cô tự rời khỏi cuộc chơi",
  "bí mật thật nằm trong phản ứng của người im lặng nhất phòng",
];

export const FACTORY_DRAMA_LANES: StoryDramaLane[] = [
  {
    key: "social-media-face-slap",
    label: "truyền thông bẩn / livestream / hot search",
    conflicts: [
      "người quản lý truyền thông dựng scandal để ép nữ chính nhận lỗi",
      "đối thủ công ty dùng một clip cắt ghép để biến nữ chính thành kẻ phá hoại",
      "bạn thân phản bội bằng cách tung tin nhắn riêng lên mạng xã hội",
      "một tài khoản ẩn được thuê để dẫn dắt dư luận chống lại nữ chính",
      "người yêu cũ dùng hình ảnh quá khứ để bôi bẩn nữ chính đúng ngày ra mắt dự án",
    ],
    settings: [
      "buổi livestream bán hàng / họp báo",
      "phòng make-up trước buổi phát sóng trực tiếp",
      "lễ trao giải của giới sáng tạo nội dung",
      "trung tâm thương mại",
      "phòng điều hành truyền thông",
      "studio chụp ảnh / hậu trường quảng cáo",
    ],
    evidenceObjects: [
      "một bản nháp thông cáo truyền thông gửi nhầm vào nhóm",
      "một đoạn video 7 giây quay nhầm gương phản chiếu",
      "ảnh chụp màn hình bị xóa vội",
      "một file âm thanh bị cắt nhưng còn tiếng chuông đặc trưng",
      "tài khoản mạng xã hội ẩn",
      "email nội bộ bị chuyển tiếp nhầm",
    ],
    publicPressures: [
      "hot search trên mạng xã hội",
      "livestream bị hàng nghìn người xem",
      "một thông cáo truyền thông sai sự thật",
      "một bài phỏng vấn bị cắt ghép",
      "một tài khoản anti-fan đồng loạt kéo bình luận bẩn",
      "một màn hình LED ở sự kiện bất ngờ phát sai file",
    ],
    hiddenTruths: [
      "bằng chứng đầu tiên là giả, bằng chứng thứ hai mới là thật",
      "người tung tin bẩn thật ra đang bị phản diện khống chế bằng món nợ cũ",
      "camera bị xóa không phải để che ngoại tình mà để che một cuộc gặp khác",
      "người đứng sau phản diện là người nữ chính từng tin nhất",
    ],
    villainAttacks: [
      "phản diện đẩy một clip cắt ghép lên hot search ngay trước giờ nữ chính lên sóng",
      "phản diện thuê tài khoản ẩn dẫn dư luận sang hướng nữ chính dùng con để tẩy trắng",
      "phản diện ép đội PR đọc thông cáo buộc nữ chính xin lỗi công khai",
      "phản diện cắt ghép một câu nói riêng tư thành lời thừa nhận tội lỗi",
    ],
    heroineCounters: [
      "nữ chính không thanh minh dài dòng mà phát lại 7 giây hình ảnh phản chiếu làm lộ người đặt bẫy",
      "nữ chính để phản diện nói hết trên livestream rồi tung bản gốc đúng lúc bình luận đổi chiều",
      "nữ chính dùng câu hỏi ngắn ép người dẫn chương trình phải đọc timestamp thật",
      "nữ chính biến màn bôi nhọ thành sân khấu đối chất công khai",
    ],
    emotionalStakes: [
      "con của nữ chính nghe người lớn gọi mẹ là kẻ nói dối và hỏi liệu mình có làm mẹ xấu hổ không",
      "người thân yếu thế bị hàng xóm nhận ra từ clip cắt ghép và không dám ra khỏi cửa",
      "nữ chính nhìn thấy con cố giấu điện thoại vì sợ mẹ đọc bình luận ác ý",
      "một người từng được nữ chính giúp quay lưng trước ống kính vì sợ liên lụy",
    ],
    dopamineHooks: [
      "một câu hỏi sắc của nữ chính khiến phản diện lỡ miệng trước hàng nghìn người xem",
      "một người trong ekip livestream bất ngờ đổi phe và mở file gốc",
      "màn hình lớn phát nhầm đúng đoạn phản diện chỉ đạo cắt ghép",
      "bình luận của một tài khoản tưởng là anti-fan lại đưa ra manh mối thật",
    ],
  },
  {
    key: "school-child-stake",
    label: "trường học / phụ huynh / con nhỏ bị kéo vào conflict",
    conflicts: [
      "giáo viên / phụ huynh giàu có kéo con của nữ chính vào cuộc chiến",
      "người giám hộ giả xuất hiện để tranh quyền nuôi con",
      "một kẻ đứng sau dùng dư luận phụ huynh để cô lập mẹ con nữ chính",
      "hồ sơ trường học bị lợi dụng để bẻ cong thân phận của đứa trẻ",
      "một phụ huynh quyền lực dùng ban đại diện để ép nữ chính rời khỏi trường",
    ],
    settings: [
      "trường quốc tế trong buổi họp phụ huynh",
      "cổng trường của con",
      "phòng họp phụ huynh có camera nội bộ",
      "khu vui chơi trẻ em trong trung tâm thương mại",
      "bữa tiệc sinh nhật trẻ con trong biệt thự hào môn",
      "nhóm chat gia đình bị lộ tin nhắn",
    ],
    evidenceObjects: [
      "hồ sơ nhập học của con",
      "một món đồ chơi của con bị bỏ lại ở nơi đáng lẽ con chưa từng đến",
      "tin nhắn trong nhóm chat gia đình",
      "ảnh chụp màn hình bị xóa vội",
      "giấy khai sinh bản cũ",
      "một đoạn voice chat còn tiếng thở của người thứ ba",
    ],
    publicPressures: [
      "nhóm chat phụ huynh",
      "các phụ huynh ở trường quốc tế",
      "một cuộc họp phụ huynh bị livestream lén",
      "một topic ẩn danh trong diễn đàn trường học",
      "một buổi xét duyệt quyền nuôi con",
      "tin nhắn bị leak vào nhóm nội bộ",
    ],
    hiddenTruths: [
      "đứa trẻ bị kéo vào cuộc chiến không có thân phận như mọi người tưởng",
      "hồ sơ trường học bị đổi để tước quyền nuôi con",
      "người bạn thân phản bội vì bị nắm điểm yếu",
      "một món đồ trẻ con vô tình chứng minh phản diện có mặt tại hiện trường",
    ],
    villainAttacks: [
      "phản diện dùng nhóm phụ huynh để biến nữ chính thành người mẹ không đủ tư cách",
      "phản diện để con của nữ chính bị gọi ra khỏi lớp ngay trước mặt bạn bè",
      "phản diện tung tin thân phận của đứa trẻ vào buổi họp có nhiều phụ huynh chứng kiến",
      "phản diện cho người lạ đến trường nhận là người giám hộ hợp pháp",
    ],
    heroineCounters: [
      "nữ chính không tranh cãi với đám đông mà gọi đúng người giữ camera nội bộ lên đối chất",
      "nữ chính dùng một câu hỏi về thời điểm nhận đồ chơi để làm lộ người từng tiếp cận con",
      "nữ chính yêu cầu từng phụ huynh ký tên vào biên bản nếu muốn tiếp tục xúc phạm trẻ nhỏ",
      "nữ chính để con rời phòng trước rồi mới vạch mặt người lớn đã dùng trẻ con làm công cụ",
    ],
    emotionalStakes: [
      "con hỏi mẹ mình có phải là lý do khiến mọi người ghét mẹ không",
      "đứa trẻ bị bạn cùng lớp né tránh sau khi tin đồn xuất hiện trong nhóm phụ huynh",
      "nữ chính phải trấn an con trong hành lang nhưng tay vẫn run vì tức giận",
      "giáo viên tốt bụng muốn giúp nhưng bị ban giám hiệu ép im lặng",
    ],
    dopamineHooks: [
      "một phụ huynh từng im lặng đứng lên xác nhận đã thấy người lạ tiếp cận đứa trẻ",
      "đứa trẻ nói một câu vô tình làm lộ chi tiết phản diện không thể biết nếu không có mặt",
      "camera khu vui chơi hiện ra bóng người mà phản diện vừa phủ nhận quen biết",
      "nữ chính buộc ban đại diện phụ huynh bỏ phiếu công khai trước mặt mọi người",
    ],
  },
  {
    key: "family-banquet-betrayal",
    label: "gia tộc / tiệc riêng / người thân phản bội",
    conflicts: [
      "mẹ chồng thao túng cả gia đình để đẩy nữ chính ra ngoài",
      "chị em bị tráo thân phận trong một gia tộc hào môn",
      "một người giúp việc lâu năm nắm bí mật gia tộc",
      "một cuộc hôn nhân hợp đồng bị biến thành cái bẫy danh dự",
      "một bí mật trong giới nghệ thuật khiến nữ chính bị tước quyền thừa kế",
    ],
    settings: [
      "đám cưới hoặc lễ đính hôn",
      "đám tang / lễ đọc di chúc",
      "nhà hàng riêng nơi gia tộc định ép ký giấy",
      "phòng họp khẩn của công ty gia đình",
      "du thuyền / tiệc riêng của giới thượng lưu",
      "phòng tranh trong đêm khai mạc triển lãm",
    ],
    evidenceObjects: [
      "vòng tay / nhẫn / dây chuyền có mã khắc",
      "một tấm ảnh polaroid cũ có ngày tháng lệch với câu chuyện của phản diện",
      "di chúc mới được công chứng",
      "nhật ký cũ",
      "bức tranh trong triển lãm che dấu chữ ký cũ",
      "hợp đồng bảo hiểm nhân thọ",
    ],
    publicPressures: [
      "họp gia đình có người ngoài chứng kiến",
      "lời đồn trong giới hào môn",
      "đám cưới có khách mời thượng lưu",
      "một cuộc bỏ phiếu trong gia tộc",
      "một danh sách khách mời bị rò rỉ kèm lời đồn",
      "video bị phát trên màn hình lớn",
    ],
    hiddenTruths: [
      "gia tộc nhận nhầm người thừa kế trong nhiều năm",
      "di chúc cũ đã bị thay trang trước ngày công bố",
      "người đã mất để lại manh mối cuối cùng",
      "bí mật thật nằm trong phản ứng của người im lặng nhất phòng",
    ],
    villainAttacks: [
      "phản diện ép nữ chính ký giấy từ bỏ quyền lợi ngay giữa tiệc gia tộc",
      "phản diện mời người ngoài đến chứng kiến để biến nữ chính thành trò cười",
      "phản diện dùng món đồ của người đã mất để buộc tội nữ chính bất hiếu",
      "phản diện cho phát một video cũ bị cắt ghép trong lúc nâng ly chúc mừng",
    ],
    heroineCounters: [
      "nữ chính yêu cầu mở hộp kỷ vật ngay trước mặt gia tộc và chỉ ra mã khắc bị tráo",
      "nữ chính chờ phản diện ép ký rồi mới đọc điều khoản khiến cả phòng đổi sắc",
      "nữ chính dùng ký ức riêng với người đã mất để chứng minh món đồ bị thay",
      "nữ chính biến lời sỉ nhục ở tiệc thành biên bản đối chất trước người ngoài",
    ],
    emotionalStakes: [
      "người thân duy nhất từng bảo vệ nữ chính bị lôi ra làm cái cớ buộc cô im lặng",
      "nữ chính phải nhìn con/người thân yếu thế bị gia tộc xem như vật trao đổi",
      "một người giúp việc già run rẩy vì muốn nói thật nhưng sợ mất chỗ ở",
      "nữ chính nhận ra người từng gọi mình là con gái thật ra biết rõ sự tráo đổi",
    ],
    dopamineHooks: [
      "một chiếc nhẫn tưởng là vật buộc tội lại có mã khắc chứng minh phản diện nói dối",
      "người im lặng nhất bàn tiệc bất ngờ gọi nữ chính bằng tên cũ",
      "bức tranh trên tường rơi khung và lộ chữ ký bị che",
      "một khách mời thượng lưu nhận ra món đồ đã từng xuất hiện ở nơi khác",
    ],
  },
  {
    key: "corporate-boardroom-power",
    label: "thương chiến / hội đồng / quyền lực công ty",
    conflicts: [
      "hội đồng quản trị dùng đời tư để tước quyền điều hành của nữ chính",
      "đối tác công ty dùng tình cảm để cướp dự án",
      "một cổ đông thân thiết âm thầm bán đứng nữ chính trong buổi bỏ phiếu",
      "thư ký thân tín của chồng nắm bí mật tài chính",
      "một vụ từ thiện bị dựng thành bê bối rửa tiền để hủy hoại nữ chính",
    ],
    settings: [
      "phòng họp hội đồng quản trị",
      "ngân hàng / phòng VIP tài chính",
      "nhà đấu giá / buổi tiệc từ thiện",
      "phòng nhân sự công ty",
      "showroom xe sang trong ngày bàn giao tài sản",
      "sân bay trong ngày có người bỏ trốn",
    ],
    evidenceObjects: [
      "sao kê ngân hàng",
      "hóa đơn chuyển khoản bất thường",
      "biên bản họp bị thay trang",
      "hồ sơ chuyển nhượng cổ phần",
      "một mã QR trên vé sự kiện dẫn tới thư mục ẩn",
      "lịch sử định vị xe vào đúng đêm mất chứng cứ",
    ],
    publicPressures: [
      "hội đồng quản trị công ty",
      "buổi họp cổ đông",
      "một hợp đồng bị công bố trước công ty",
      "một bản tin nội bộ công ty cố ý gọi nữ chính là người có lỗi",
      "một nhóm cổ đông nhỏ liên tục gây sức ép trước giờ bỏ phiếu",
      "đơn kiện công khai",
    ],
    hiddenTruths: [
      "vụ ngoại tình chỉ là bề nổi của một vụ chuyển tài sản",
      "người chồng biết sự thật nhưng im lặng vì lợi ích cổ phần",
      "công ty cố tình dựng scandal để ép nữ chính bán cổ phần",
      "một thương vụ đầu tư chỉ là vỏ bọc để rút tài sản khỏi gia đình",
    ],
    villainAttacks: [
      "phản diện dùng cuộc bỏ phiếu khẩn để tước ghế của nữ chính ngay trước mặt cổ đông",
      "phản diện công bố một sao kê cắt bớt dòng quan trọng để buộc tội nữ chính biển thủ",
      "phản diện kéo người yêu cũ của nữ chính vào phòng họp như một nhân chứng bẩn",
      "phản diện ra điều kiện: ký nhượng quyền điều hành hoặc để bê bối nổ trên truyền thông",
    ],
    heroineCounters: [
      "nữ chính không phản bác sao kê mà yêu cầu mở dòng giao dịch ngay trước giờ bỏ phiếu",
      "nữ chính đặt câu hỏi khiến cổ đông thân tín lộ đã đọc tài liệu trước khi được phát",
      "nữ chính dùng thời gian định vị xe để chứng minh phản diện gặp người chuyển tiền",
      "nữ chính biến cuộc bỏ phiếu thành màn kiểm tra ai đang cầm cổ phần giả danh",
    ],
    emotionalStakes: [
      "người thân yếu thế của nữ chính bị cắt nguồn điều trị/chi phí đúng lúc cô mất quyền ký",
      "đứa trẻ hỏi vì sao ảnh mẹ lại xuất hiện trong bản tin xấu ở sảnh công ty",
      "một nhân viên từng trung thành bị ép rời công ty vì đứng về phía nữ chính",
      "nữ chính nhìn văn phòng mình bị đổi khóa nhưng không cho phép bản thân gục xuống",
    ],
    dopamineHooks: [
      "một cổ đông nhỏ bất ngờ đưa ra giấy ủy quyền thật đúng lúc phản diện đòi bỏ phiếu",
      "dòng sao kê bị che có tên người thân của phản diện",
      "camera thang máy cho thấy người cầm tài liệu là trợ lý của phản diện",
      "nữ chính giành lại một phiếu quyết định bằng một câu hỏi về điều lệ công ty",
    ],
  },
  {
    key: "hotel-affair-trap",
    label: "khách sạn / ngoại tình giả / bẫy danh dự",
    conflicts: [
      "vợ chồng rạn nứt vì một bí mật bị giấu trong hồ sơ gia đình",
      "vụ ngoại tình chỉ là bề nổi của một vụ chuyển tài sản",
      "người yêu cũ quay lại với một thân phận mới nguy hiểm hơn",
      "một người chị em kết nghĩa lợi dụng lòng tin để tráo bằng chứng",
      "một người đàn ông từng cứu nữ chính nay trở thành người nắm dao",
    ],
    settings: [
      "sảnh khách sạn cao cấp",
      "resort trong chuyến du lịch gia đình",
      "gara / tầng hầm / bãi đỗ xe",
      "bãi biển trong một chuyến nghỉ dưỡng",
      "căn hộ penthouse nhìn xuống thành phố",
      "phòng chờ VIP của một nhà ga cao tốc",
    ],
    evidenceObjects: [
      "một phiếu gửi đồ trong khách sạn đứng tên người đã phủ nhận có mặt",
      "một chiếc váy trẻ em có tem giặt khô từ khách sạn",
      "ảnh chụp bóng người trên cửa kính thang máy",
      "hóa đơn chuyển khoản bất thường",
      "camera hành trình trong xe",
      "vé máy bay một chiều",
    ],
    publicPressures: [
      "bài bóc phốt từ tài khoản ẩn",
      "lời đồn trong giới hào môn",
      "một clip cắt ghép lan trong nhóm khách VIP",
      "một bài phỏng vấn bị cắt ghép",
      "hot search trên mạng xã hội",
      "một danh sách khách mời bị rò rỉ kèm lời đồn",
    ],
    hiddenTruths: [
      "camera bị xóa không phải để che ngoại tình mà để che một cuộc gặp khác",
      "người bị xem là tiểu tam thật ra chỉ là người che giấu bí mật lớn hơn",
      "người phản diện muốn che không phải tội ngoại tình mà là một vụ tráo quyền thừa kế",
      "người tưởng giúp nữ chính lại đang thử lòng cô",
    ],
    villainAttacks: [
      "phản diện dàn cảnh để nữ chính bước vào phòng khách sạn đúng lúc camera bật",
      "phản diện tung hóa đơn phòng kèm ảnh cắt góc để ép nữ chính nhận tội ngoại tình",
      "phản diện dùng một đứa trẻ/người thân làm lý do để kéo nữ chính khỏi hiện trường thật",
      "phản diện cho người yêu cũ xuất hiện như nhân chứng bất ngờ",
    ],
    heroineCounters: [
      "nữ chính chỉ ra phiếu gửi đồ có thời gian sau khi phản diện tuyên bố đã rời khách sạn",
      "nữ chính dùng bóng phản chiếu trên cửa kính để xác định người đứng sau máy quay",
      "nữ chính không giải thích quan hệ mà hỏi ai là người đặt phòng bằng thẻ phụ",
      "nữ chính để phản diện tung ảnh trước rồi mới đưa ra camera hành trình",
    ],
    emotionalStakes: [
      "con/người thân nhìn thấy ảnh bôi nhọ và hỏi nữ chính có thật sự bỏ rơi mình không",
      "nữ chính phải nuốt nhục trong sảnh khách sạn để đưa người thân yếu thế ra khỏi đám đông",
      "một người bạn cũ chứng kiến cảnh sỉ nhục nhưng ban đầu không dám làm chứng",
      "nữ chính nhận ra kẻ phản bội biết thói quen gia đình quá rõ",
    ],
    dopamineHooks: [
      "phiếu gửi đồ làm lộ người duy nhất có chìa khóa phòng phụ",
      "bóng phản chiếu trên cửa thang máy cho thấy phản diện đang cầm điện thoại quay",
      "nhân viên lễ tân tưởng bị mua chuộc lại giữ bản sao camera dự phòng",
      "nữ chính đọc đúng bốn số cuối thẻ thanh toán khiến phản diện tái mặt",
    ],
  },
  {
    key: "hospital-witness-risk",
    label: "bệnh viện / nhân chứng / sự thật bị bóp méo",
    conflicts: [
      "bác sĩ bị mua chuộc để sửa hồ sơ bệnh án",
      "người thân bị bệnh chỉ là lý do để chuyển quyền giám hộ",
      "người cha ruột che giấu thân phận thật của con gái trong nhiều năm",
      "đứa trẻ vô tình trở thành chìa khóa lật lại mọi lời nói dối",
      "người đã mất để lại bằng chứng đảo ngược toàn bộ sự thật",
    ],
    settings: [
      "bệnh viện tư lúc nửa đêm",
      "phòng khám xét nghiệm ADN",
      "hành lang bệnh viện nơi camera bị tắt đúng 7 phút",
      "khu điều dưỡng cao cấp",
      "cô nhi viện / trung tâm bảo trợ",
      "tòa án gia đình",
    ],
    evidenceObjects: [
      "báo cáo xét nghiệm ADN",
      "lịch khám thai bị chỉnh sửa",
      "hồ sơ bệnh án bị sửa",
      "hồ sơ nhận con nuôi",
      "bảng phân ca nhân viên bị sửa bằng bút khác màu",
      "một đoạn voice chat còn tiếng thở của người thứ ba",
    ],
    publicPressures: [
      "một buổi xét duyệt quyền nuôi con",
      "đơn kiện công khai",
      "họp gia đình có người ngoài chứng kiến",
      "các phụ huynh ở trường quốc tế",
      "tin nhắn bị leak vào nhóm nội bộ",
      "phiên hòa giải pháp lý",
    ],
    hiddenTruths: [
      "bệnh án bị sửa để che một ca phẫu thuật sai",
      "đứa trẻ bị kéo vào cuộc chiến không có thân phận như mọi người tưởng",
      "người đã mất để lại manh mối cuối cùng",
      "người được xem là nhân chứng trung lập đã đổi lời khai vì con họ bị uy hiếp",
    ],
    villainAttacks: [
      "phản diện ép nhân chứng bệnh viện đổi lời khai bằng cách uy hiếp gia đình họ",
      "phản diện tung bản xét nghiệm chưa kiểm chứng để cướp quyền chủ động của nữ chính",
      "phản diện gọi người thân yếu thế của nữ chính ra làm chứng giả trước mặt mọi người",
      "phản diện khóa đường tiếp cận nhân chứng rồi dựng nữ chính thành người gây rối",
    ],
    heroineCounters: [
      "nữ chính không đòi hồ sơ ngay mà bảo vệ nhân chứng trước để họ dám nói thật",
      "nữ chính dùng bảng phân ca để chứng minh bác sĩ bị mua chuộc không có mặt vào giờ ký",
      "nữ chính để phản diện khoe bản xét nghiệm trước rồi chỉ ra mã mẫu bị tráo",
      "nữ chính biến lời khai run rẩy của một y tá thành điểm xoay của cả vụ việc",
    ],
    emotionalStakes: [
      "người thân yếu thế run rẩy xin nữ chính đừng tiếp tục vì sợ bị trả thù",
      "đứa trẻ hỏi liệu giấy tờ có quyết định mình có được ở bên mẹ không",
      "nữ chính phải ký cam kết bảo vệ nhân chứng thay vì chỉ bảo vệ quyền lợi của mình",
      "một y tá từng im lặng bật khóc khi thấy nữ chính vẫn nhớ tên mình",
    ],
    dopamineHooks: [
      "mã mẫu xét nghiệm không trùng với tên người được công bố",
      "bảng phân ca bị sửa bằng bút khác màu và người sửa để lại nét chữ quen",
      "nhân chứng tưởng bỏ chạy gửi lại một tin nhắn thoại đúng lúc đối chất",
      "camera hành lang bị tắt nhưng máy bán nước tự động vẫn ghi lại bóng người",
    ],
  },
];

const PROCEDURAL_TERMS = [
  "niêm phong",
  "phong tỏa",
  "bảo toàn chứng cứ",
  "giám định",
  "log",
  "mã tham chiếu",
  "văn bản pháp lý",
  "tòa án",
  "phiên hòa giải",
  "công chứng",
  "hồ sơ bệnh án",
  "hồ sơ cổ phần",
  "tài liệu pháp lý",
];

function pickSeedItem<T>(items: T[], seed: string, salt: string): T {
  const raw = `${seed}-${salt}`;
  let hash = 0;

  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }

  return items[Math.abs(hash) % items.length];
}

function compactTags(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((item) => item.length >= 4)
    .slice(0, 8);
}

function normalizeForCompare(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countProceduralTerms(input: string) {
  const normalized = normalizeForCompare(input);

  return PROCEDURAL_TERMS.reduce((count, term) => {
    const normalizedTerm = normalizeForCompare(term);
    return normalized.includes(normalizedTerm) ? count + 1 : count;
  }, 0);
}

function scoreOverlapWithAvoidLibrary(candidateText: string, avoidLibrary?: AvoidLibrary) {
  const avoidTexts = [
    ...(avoidLibrary?.motifTexts ?? []),
    ...(avoidLibrary?.titles ?? []),
    ...(avoidLibrary?.motifFingerprints ?? []).map((item) => item.motifText),
  ].filter(Boolean);

  if (!avoidTexts.length) return 0;

  const candidateTags = new Set(compactTags(candidateText));
  if (!candidateTags.size) return 0;

  let highestScore = 0;

  for (const avoidText of avoidTexts) {
    const avoidTags = new Set(compactTags(avoidText));
    if (!avoidTags.size) continue;

    let overlap = 0;
    candidateTags.forEach((tag) => {
      if (avoidTags.has(tag)) overlap += 1;
    });

    const score = overlap / Math.max(candidateTags.size, avoidTags.size, 1);
    highestScore = Math.max(highestScore, score);
  }

  return highestScore;
}

function pickDramaLane(seed: string, avoidLibrary?: AvoidLibrary) {
  const candidates = FACTORY_DRAMA_LANES.map((lane, index) => {
    const laneText = [
      lane.label,
      ...lane.conflicts,
      ...lane.settings,
      ...lane.evidenceObjects,
      ...lane.publicPressures,
    ].join(" | ");

    const avoidPenalty = scoreOverlapWithAvoidLibrary(laneText, avoidLibrary);
    const proceduralPenalty = countProceduralTerms(laneText) / 25;
    const seedBias = Number(
      pickSeedItem(
        ["0.00", "0.03", "0.06", "0.09", "0.12", "0.15", "0.18"],
        seed,
        `lane-${lane.key}-${index}`,
      ),
    );

    return {
      lane,
      score: avoidPenalty + proceduralPenalty + Number(seedBias),
    };
  });

  candidates.sort((a, b) => a.score - b.score);
  const topCandidates = candidates.slice(0, Math.min(3, candidates.length));
  return pickSeedItem(
    topCandidates.map((item) => item.lane),
    seed,
    "lane-pick",
  );
}

function buildSeedCandidate(params: {
  genreLabel: string;
  heroineLabel: string;
  seed: string;
  lane: StoryDramaLane;
}) {
  const relationshipConflict = pickSeedItem(
    params.lane.conflicts,
    params.seed,
    `relationship-${params.lane.key}`,
  );
  const setting = pickSeedItem(params.lane.settings, params.seed, `setting-${params.lane.key}`);
  const evidenceObject = pickSeedItem(
    params.lane.evidenceObjects,
    params.seed,
    `evidence-${params.lane.key}`,
  );
  const publicPressure = pickSeedItem(
    params.lane.publicPressures,
    params.seed,
    `pressure-${params.lane.key}`,
  );
  const hiddenTruth = pickSeedItem(params.lane.hiddenTruths, params.seed, `truth-${params.lane.key}`);
  const villainAttack = pickSeedItem(
    params.lane.villainAttacks,
    params.seed,
    `villain-attack-${params.lane.key}`,
  );
  const heroineCounter = pickSeedItem(
    params.lane.heroineCounters,
    params.seed,
    `heroine-counter-${params.lane.key}`,
  );
  const emotionalStake = pickSeedItem(
    params.lane.emotionalStakes,
    params.seed,
    `emotional-stake-${params.lane.key}`,
  );
  const dopamineHook = pickSeedItem(
    params.lane.dopamineHooks,
    params.seed,
    `dopamine-hook-${params.lane.key}`,
  );

  const genreBlend = [
    params.genreLabel,
    params.lane.label,
    relationshipConflict,
    setting,
    publicPressure,
  ].filter(Boolean);

  const corePremise = `Nữ chính thuộc kiểu ${params.heroineLabel} bị cuốn vào xung đột ${relationshipConflict}, mở đầu tại ${setting}, khi ${evidenceObject} làm lộ một điểm bất thường không ai muốn nhắc tới. Truyện phải ưu tiên drama lane: ${params.lane.label}.`;
  const openingScene = setting;
  const incitingIncident = `${evidenceObject} xuất hiện sai thời điểm, khiến nữ chính nhận ra có người đang dựng một câu chuyện bất lợi cho mình; cú đánh đầu tiên không chỉ là giấy tờ mà là: ${villainAttack}.`;
  const mainConflict = `Nữ chính phải đối đầu với cấu trúc quyền lực quanh ${relationshipConflict}, trong khi ${publicPressure} khiến cô khó phản kháng trực diện. Conflict chính phải luân phiên giữa chứng cứ, đối đầu cảm xúc, áp lực công khai và cú phản công chủ động; không được biến nhiều chương liên tiếp thành chuỗi niêm phong/phong tỏa/giám định/log.`;
  const villainType = `Người thao túng đứng sau xung đột ${relationshipConflict}, có cá tính rõ và đòn đánh riêng: ${villainAttack}. Phản diện chính phải ra mặt hoặc để lại dấu vân tay cá nhân, không núp mãi sau luật sư/PR/pháp vụ.`;
  const heroineArc = `${params.heroineLabel}: nhẫn nhịn quan sát → phát hiện điểm sai → chịu một cú đau thật (${emotionalStake}) → chủ động gài bẫy hoặc phản công (${heroineCounter}) → giành lại thế chủ động từng phần.`;
  const emotionalHook = `${emotionalStake}. Một người phụ nữ bị ép nhận phần thua thiệt, nhưng lần này cảm xúc đau không làm cô gục mà biến thành lý do phản công.`;
  const powerStructure = `Gia đình / công ty / quan hệ xã hội đang đứng về phía phản diện, còn nữ chính chỉ có trí nhớ, sự bình tĩnh, ${evidenceObject}, và một chiến thuật phản công: ${heroineCounter}.`;
  const shortFingerprint = `${params.lane.key} + ${setting} + ${evidenceObject} + ${relationshipConflict}`;
  const dramaBalance = `Drama balance bắt buộc: ${villainAttack} → ${emotionalStake} → ${heroineCounter} → dopamine hook: ${dopamineHook}.`;

  return {
    relationshipConflict,
    setting,
    evidenceObject,
    publicPressure,
    hiddenTruth,
    genreBlend,
    corePremise,
    openingScene,
    incitingIncident,
    mainConflict,
    villainType,
    heroineArc,
    emotionalHook,
    powerStructure,
    shortFingerprint,
    dramaBalance,
  };
}

function getSeedAttempt(seed: string, attempt: number) {
  return attempt === 0 ? seed : `${seed}-variant-${attempt + 1}`;
}

export function buildMockStorySeed(params: {
  genreLabel: string;
  heroineLabel: string;
  avoidLibrary?: AvoidLibrary;
  seed: string;
}): FactoryStorySeed {
  let bestCandidate: ReturnType<typeof buildSeedCandidate> | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const attemptSeed = getSeedAttempt(params.seed, attempt);
    const lane = pickDramaLane(attemptSeed, params.avoidLibrary);
    const candidate = buildSeedCandidate({
      genreLabel: params.genreLabel,
      heroineLabel: params.heroineLabel,
      seed: attemptSeed,
      lane,
    });

    const candidateText = [
      candidate.shortFingerprint,
      candidate.corePremise,
      candidate.mainConflict,
      candidate.hiddenTruth,
      candidate.dramaBalance,
    ].join(" | ");

    const overlapPenalty = scoreOverlapWithAvoidLibrary(candidateText, params.avoidLibrary);
    const proceduralPenalty = countProceduralTerms(candidateText) / 20;
    const score = overlapPenalty * 2 + proceduralPenalty;

    if (score < bestScore) {
      bestScore = score;
      bestCandidate = candidate;
    }

    if (overlapPenalty <= 0.22 && proceduralPenalty <= 0.35) break;
  }

  const candidate = bestCandidate ?? buildSeedCandidate({
    genreLabel: params.genreLabel,
    heroineLabel: params.heroineLabel,
    seed: params.seed,
    lane: pickDramaLane(params.seed, params.avoidLibrary),
  });

  const title = buildUniqueFactoryTitle({
    genreLabel: params.genreLabel,
    seed: params.seed,
    avoidTitles: params.avoidLibrary?.titles,
  });

  return {
    title,
    genreBlend: candidate.genreBlend,
    corePremise: candidate.corePremise,
    openingScene: candidate.openingScene,
    incitingIncident: candidate.incitingIncident,
    evidenceObject: candidate.evidenceObject,
    mainConflict: candidate.mainConflict,
    hiddenTruth: candidate.hiddenTruth,
    setting: candidate.setting,
    villainType: candidate.villainType,
    heroineArc: candidate.heroineArc,
    emotionalHook: candidate.emotionalHook,
    powerStructure: candidate.powerStructure,
    publicPressure: candidate.publicPressure,
    shortFingerprint: candidate.shortFingerprint,
    antiRepeatTags: Array.from(
      new Set([
        ...compactTags(candidate.setting),
        ...compactTags(candidate.evidenceObject),
        ...compactTags(candidate.relationshipConflict),
        ...compactTags(candidate.publicPressure),
        ...compactTags(candidate.hiddenTruth),
        ...compactTags(candidate.dramaBalance),
      ]),
    ).slice(0, 12),
  };
}

export function buildStorySeedPromptContext(storySeed?: FactoryStorySeed | null) {
  if (!storySeed) return "";

  return `
STORY SEED / STORY DNA BẮT BUỘC:
- Tên truyện định hướng: ${storySeed.title}
- Genre blend: ${storySeed.genreBlend.join(" | ")}
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
- Không để nhiều chương liên tiếp dùng cùng một nhịp: đến một nơi → bị chặn bằng giấy tờ/pháp lý → luật sư/pháp vụ xuất hiện → nữ chính nói sẽ kiện/giám định.
- Nếu seed có yếu tố hồ sơ/log/giám định/niêm phong/phong tỏa, các yếu tố đó chỉ là một phần của conflict; chương sau phải đổi trọng tâm sang đối đầu trực diện, cảm xúc, truyền thông bẩn, người phản bội, hoặc cú vả mặt công khai.
- Phản diện chính phải có mặt hoặc để lại dấu ấn cá nhân rõ trong mỗi 1–2 chương; không để luật sư/PR/trợ lý gánh vai ác quá lâu.
- Mỗi 1–2 chương phải có một cú emotional stake cụ thể: con/người thân bị tổn thương, người từng tin phản bội, một nhân chứng sợ hãi, hoặc nữ chính phải nuốt nhục trước đám đông.
- Mỗi chương phải có một thay đổi quyền lực thật: nữ chính mất lợi thế, phản diện lộ sơ hở, đồng minh đổi phe, hoặc nữ chính giành được thắng lợi nhỏ.
`.trim();
}
