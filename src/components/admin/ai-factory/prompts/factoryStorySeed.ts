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

type FactoryStoryPlanChapter = {
  chapterNumber: number;
  title: string;
  mission: string;
  sceneType: string;
  mainScene: string;
  evidenceBeat: string;
  villainBeat: string;
  heroineMove: string;
  emotionalBeat: string;
  powerShift: string;
  endingHook: string;
};

type FactoryStoryPlan = {
  plannerVersion: string;
  totalPlannedChapters: number;
  plannerGoal: string;
  evidencePlan: string[];
  villainCurve: string[];
  payoffPlan: string[];
  chapterPlan: FactoryStoryPlanChapter[];
};

type FactoryCoverConcept = {
  visualArena: string;
  heroine: string;
  secondaryFigures: string[];
  clueProps: string[];
  conflictVisuals: string[];
  mustShowElements: string[];
  compositionType: string;
  moodTone: string;
  colorTone: string;
  negativePrompt: string[];
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
    .filter((item) => !MOTIF_TAG_STOPWORDS.has(item))
    .slice(0, 12);
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


const MOTIF_TAG_STOPWORDS = new Set([
  "phong", "xung", "phai", "loai", "bang", "nhan", "phan", "dien", "canh",
  "chung", "kien", "cuoc", "nguoi", "trong", "ngoai", "khong", "duoc",
  "dung", "dang", "thanh", "truoc", "sau", "truyen", "chinh", "that",
  "mat", "dau", "moi", "mot", "cua", "voi", "cho", "khi", "lan", "nua",
  "quan", "leak", "camera", "file", "log", "phap", "ly", "ho", "so",
]);

function splitGenreAtoms(genreLabel: string): string[] {
  return genreLabel
    .split(/[\/|,;·•+]+/g)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function slugifySeedPart(input: string) {
  return normalizeForCompare(input).replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 56) || "genre";
}


function atomHasAny(atom: string, keywords: string[]) {
  const normalized = normalizeForCompare(atom);
  return keywords.some((keyword) => normalized.includes(normalizeForCompare(keyword)));
}

function pickAtom(atoms: string[], seed: string, salt: string, fallback: string) {
  return pickSeedItem(atoms.length ? atoms : [fallback], seed, salt) || fallback;
}

function buildGenreSettingAtoms(atoms: string[]) {
  const settings = new Set<string>();

  for (const atom of atoms) {
    if (atomHasAny(atom, ["trường", "phụ huynh", "học sinh", "nhập học", "bắt nạt"])) {
      settings.add(`phòng họp phụ huynh nơi ${atom} trở thành áp lực chính`);
      settings.add(`hành lang trường học khi ${atom} bị lôi ra trước mặt người lớn`);
    } else if (atomHasAny(atom, ["bệnh viện", "phòng khám", "khoa sản", "xét nghiệm", "khám thai", "thai sản"])) {
      settings.add(`hành lang bệnh viện tư nơi ${atom} bị che giấu`);
      settings.add(`phòng tư vấn y tế nơi ${atom} bất ngờ đổi nghĩa`);
    } else if (atomHasAny(atom, ["khách sạn", "resort", "phòng", "du lịch", "camera khách sạn"])) {
      settings.add(`sảnh khách sạn nơi ${atom} trở thành cái bẫy danh dự`);
      settings.add(`hành lang phòng VIP nơi ${atom} bị dùng để ép nữ chính im lặng`);
    } else if (atomHasAny(atom, ["sân bay", "chuyến bay", "mất tích", "quay về"])) {
      settings.add(`phòng chờ sân bay nơi ${atom} làm lộ người định bỏ trốn`);
      settings.add(`cửa ra máy bay khi ${atom} buộc nữ chính phải chọn ở lại hay rời đi`);
    } else if (atomHasAny(atom, ["họp báo", "livestream", "showbiz", "concert", "truyền thông", "hot search"])) {
      settings.add(`hậu trường sự kiện nơi ${atom} chuẩn bị bị công khai`);
      settings.add(`sân khấu truyền thông nơi ${atom} đảo chiều trước đám đông`);
    } else if (atomHasAny(atom, ["hội đồng", "cổ phần", "tập đoàn", "công ty", "phòng kiểm toán", "ngân hàng", "startup"])) {
      settings.add(`phòng họp quyền lực nơi ${atom} được dùng làm đòn ép`);
      settings.add(`phòng kiểm toán hoặc phòng tài chính nơi ${atom} hé ra lỗ hổng thật`);
    } else if (atomHasAny(atom, ["mẹ chồng", "nhà chồng", "gia tộc", "từ đường", "di chúc", "thừa kế", "hào môn"])) {
      settings.add(`từ đường hoặc phòng khách gia tộc nơi ${atom} biến thành màn xét tội`);
      settings.add(`bữa tiệc gia đình hào môn nơi ${atom} khiến cả bàn im phăng phắc`);
    } else if (atomHasAny(atom, ["cà phê", "hiệu sách", "nhà hàng", "quán"])) {
      settings.add(`quán gặp riêng nơi ${atom} làm nữ chính nhận ra người nói dối`);
      settings.add(`góc bàn cạnh cửa kính nơi ${atom} bị đặt vào tay sai người`);
    } else {
      settings.add(`${atom} trong một bối cảnh đô thị cụ thể, có người chứng kiến và hậu quả cảm xúc rõ`);
    }
  }

  return Array.from(settings).slice(0, 8);
}

function buildGenreEvidenceAtoms(atoms: string[]) {
  const evidence = new Set<string>();

  for (const atom of atoms) {
    if (atomHasAny(atom, ["sổ khám thai", "khám thai"])) evidence.add("sổ khám thai có trang bị xé và một ký hiệu không ai giải thích");
    else if (atomHasAny(atom, ["giấy báo nợ"])) evidence.add("giấy báo nợ có tên người bảo lãnh bị che");
    else if (atomHasAny(atom, ["băng gạc"])) evidence.add("băng gạc có dấu vết lạ và thời điểm sử dụng không khớp");
    else if (atomHasAny(atom, ["thư cũ"])) evidence.add("thư cũ mở khóa bí mật bị giấu trong lớp bìa kép");
    else if (atomHasAny(atom, ["gấu bông"])) evidence.add("con gấu bông chứa vật nhỏ chứng minh đứa trẻ từng ở nơi bị phủ nhận");
    else if (atomHasAny(atom, ["camera", "ảnh", "video", "khung hình"])) evidence.add(`${atom} có chi tiết nền bị bỏ sót, không chỉ là camera/log chung`);
    else if (atomHasAny(atom, ["adn", "xét nghiệm"])) evidence.add("kết quả xét nghiệm có mã mẫu lệch với người được công bố");
    else if (atomHasAny(atom, ["di chúc", "thừa kế"])) evidence.add("trang di chúc hoặc tín vật thừa kế có dấu đổi trang");
    else if (atomHasAny(atom, ["hợp đồng", "cổ phần", "kiểm toán", "sao kê"])) evidence.add(`${atom} có dòng phụ/điều khoản phụ làm lộ người thao túng`);
    else if (atomHasAny(atom, ["điện thoại", "tin nhắn", "ghi âm", "usb"])) evidence.add(`${atom} chứa mảnh bằng chứng bị hiểu sai cho tới khi đối chiếu với bối cảnh`);
    else if (atomHasAny(atom, ["vé", "sân bay", "chuyến bay"])) evidence.add("vé hoặc lịch trình di chuyển có thời điểm phá vỡ lời khai");
    else evidence.add(`${atom} được biến thành vật chứng riêng của thể loại này, không dùng như giấy tờ pháp lý chung`);
  }

  return Array.from(evidence).slice(0, 8);
}

function buildGenrePressureAtoms(atoms: string[]) {
  const pressure = new Set<string>();

  for (const atom of atoms) {
    if (atomHasAny(atom, ["trường", "phụ huynh"])) pressure.add(`buổi họp phụ huynh nơi ${atom} khiến nữ chính bị ép xin lỗi`);
    else if (atomHasAny(atom, ["bệnh viện", "xét nghiệm", "khám thai"])) pressure.add(`quy trình y tế bị lợi dụng để khiến ${atom} thành lời buộc tội`);
    else if (atomHasAny(atom, ["họp báo", "livestream", "showbiz", "concert"])) pressure.add(`ánh đèn truyền thông biến ${atom} thành cuộc xét xử công khai`);
    else if (atomHasAny(atom, ["mẹ chồng", "nhà chồng", "gia tộc"])) pressure.add(`cả nhà chồng dùng ${atom} để ép nữ chính nhận tội trước người ngoài`);
    else if (atomHasAny(atom, ["hội đồng", "cổ phần", "kiểm toán", "ngân hàng"])) pressure.add(`cuộc họp quyền lực dùng ${atom} để tước quyền quyết định của nữ chính`);
    else if (atomHasAny(atom, ["khách sạn", "resort", "ngoại tình"])) pressure.add(`lời đồn trong nhóm khách VIP biến ${atom} thành bằng chứng bôi nhọ`);
    else pressure.add(`một nhóm người liên quan tới ${atom} đồng loạt gây sức ép để nữ chính phải im`);
  }

  return Array.from(pressure).slice(0, 8);
}

function buildGenreHiddenTruthAtoms(atoms: string[]) {
  const truths = new Set<string>();

  for (const atom of atoms) {
    if (atomHasAny(atom, ["mẹ chồng", "nhà chồng"])) truths.add(`người trong nhà chồng dựng bẫy vì muốn che một lỗi cũ gắn với ${atom}`);
    else if (atomHasAny(atom, ["sổ khám thai", "khoa sản", "adn", "xét nghiệm"])) truths.add(`${atom} không chứng minh điều mọi người nghĩ, mà chỉ ra người đã tráo mẫu/giấu thân phận`);
    else if (atomHasAny(atom, ["camera", "ảnh", "video"])) truths.add(`${atom} không quan trọng ở người trong hình, mà ở chi tiết nền phản chiếu phía sau`);
    else if (atomHasAny(atom, ["giấy báo nợ", "ngân hàng", "cổ phần", "kiểm toán"])) truths.add(`${atom} là vỏ ngoài của một khoản chuyển quyền hoặc trách nhiệm bị đẩy sang nữ chính`);
    else if (atomHasAny(atom, ["gấu bông", "con", "nhận nuôi"])) truths.add(`${atom} chứng minh đứa trẻ đã bị đưa tới nơi người lớn phủ nhận`);
    else truths.add(`sự thật về ${atom} nằm ở người im lặng nhất, không phải người la lớn nhất`);
  }

  return Array.from(truths).slice(0, 8);
}

function buildGenreVillainAttacks(atoms: string[]) {
  const attacks = new Set<string>();

  for (const atom of atoms) {
    if (atomHasAny(atom, ["mẹ chồng", "nhà chồng"])) attacks.add(`phản diện dùng lễ nghi gia đình và người ngoài làm chứng để biến ${atom} thành tội của nữ chính`);
    else if (atomHasAny(atom, ["trường", "phụ huynh"])) attacks.add(`phản diện để đứa trẻ hoặc hồ sơ trường học bị gọi tên trước đám đông phụ huynh`);
    else if (atomHasAny(atom, ["bệnh viện", "xét nghiệm", "khám thai"])) attacks.add(`phản diện ép nhân chứng y tế im lặng rồi công bố một phần ${atom} bị cắt nghĩa`);
    else if (atomHasAny(atom, ["khách sạn", "resort", "ngoại tình"])) attacks.add(`phản diện dàn cảnh để nữ chính xuất hiện đúng lúc ${atom} bị hiểu thành bê bối`);
    else if (atomHasAny(atom, ["hội đồng", "cổ phần", "kiểm toán", "ngân hàng"])) attacks.add(`phản diện đưa ${atom} vào cuộc họp để buộc nữ chính mất quyền ký hoặc mất phiếu`);
    else if (atomHasAny(atom, ["họp báo", "livestream", "showbiz", "concert"])) attacks.add(`phản diện chờ lúc đông người nhất mới tung ${atom} phiên bản bị bóp méo`);
    else attacks.add(`phản diện biến ${atom} thành cú nhục công khai vừa đủ đau nhưng vẫn có sơ hở riêng`);
  }

  return Array.from(attacks).slice(0, 8);
}

function buildGenreHeroineCounters(atoms: string[], heroineLabel: string) {
  const counters = new Set<string>();
  const heroine = heroineLabel || "nữ chính";

  for (const atom of atoms) {
    if (atomHasAny(atom, ["mẹ chồng", "nhà chồng"])) counters.add(`${heroine} không cãi tay đôi, cô hỏi đúng người chứng kiến trong nhà và buộc bẫy gia đình tự lộ`);
    else if (atomHasAny(atom, ["trường", "phụ huynh"])) counters.add(`${heroine} đưa đứa trẻ rời khỏi phòng trước, rồi mới dùng câu hỏi về ${atom} để bắt người lớn tự khai`);
    else if (atomHasAny(atom, ["bệnh viện", "xét nghiệm", "khám thai"])) counters.add(`${heroine} bảo vệ nhân chứng y tế trước, sau đó đối chiếu mã/thời điểm của ${atom}`);
    else if (atomHasAny(atom, ["khách sạn", "resort", "ngoại tình"])) counters.add(`${heroine} không giải thích chuyện tình cảm, cô chứng minh ai có mặt tại nơi ${atom} được dựng bẫy`);
    else if (atomHasAny(atom, ["hội đồng", "cổ phần", "kiểm toán", "ngân hàng"])) counters.add(`${heroine} không xin thêm thời gian, cô buộc cuộc họp kiểm tra nguồn gốc của ${atom} ngay tại chỗ`);
    else if (atomHasAny(atom, ["họp báo", "livestream", "showbiz", "concert"])) counters.add(`${heroine} để bản sai được tung hết rồi mới mở mảnh gốc khiến đám đông tự đảo chiều`);
    else counters.add(`${heroine} dùng cách phản công đúng tính cách của mình: bình tĩnh, ít lời, đánh vào sơ hở riêng của ${atom}`);
  }

  return Array.from(counters).slice(0, 8);
}

function buildGenreEmotionalStakes(atoms: string[], heroineLabel: string) {
  const stakes = new Set<string>();
  const heroine = heroineLabel || "nữ chính";

  for (const atom of atoms) {
    if (atomHasAny(atom, ["con", "gấu bông", "trường", "phụ huynh", "nhận nuôi"])) stakes.add(`đứa trẻ bị kéo vào ${atom}, khiến ${heroine} phải bảo vệ con trước khi tự minh oan`);
    else if (atomHasAny(atom, ["mẹ", "bệnh viện", "khám thai", "xét nghiệm"])) stakes.add(`người thân yếu thế hoặc bí mật sinh tử khiến ${heroine} không thể chỉ nghĩ cho bản thân`);
    else if (atomHasAny(atom, ["hôn nhân", "ngoại tình", "khách sạn", "vị hôn phu"])) stakes.add(`${heroine} bị buộc nhìn quan hệ từng tin tưởng trở thành công cụ sỉ nhục`);
    else if (atomHasAny(atom, ["mẹ chồng", "nhà chồng", "gia tộc"])) stakes.add(`${heroine} đau vì người nhà dùng danh phận và lễ nghĩa để ép cô cúi đầu`);
    else stakes.add(`${heroine} bị tổn thương thật vì ${atom}, nhưng vẫn chọn phản công có kiểm soát`);
  }

  return Array.from(stakes).slice(0, 8);
}

function buildGenreDopamineHooks(atoms: string[]) {
  const hooks = new Set<string>();

  for (const atom of atoms) {
    if (atomHasAny(atom, ["mẹ chồng", "nhà chồng"])) hooks.add(`một người trong nhà tưởng đứng về phe phản diện lại xác nhận chi tiết trong ${atom}`);
    else if (atomHasAny(atom, ["trường", "phụ huynh"])) hooks.add(`một câu nói vô tình của đứa trẻ làm lộ người lớn đã nói dối về ${atom}`);
    else if (atomHasAny(atom, ["bệnh viện", "xét nghiệm", "khám thai"])) hooks.add(`mã mẫu/thời điểm trong ${atom} khiến người công bố bằng chứng tái mặt`);
    else if (atomHasAny(atom, ["khách sạn", "resort"])) hooks.add(`một chi tiết dịch vụ nhỏ trong ${atom} chứng minh phản diện mới là người đặt bẫy`);
    else if (atomHasAny(atom, ["hội đồng", "kiểm toán", "ngân hàng", "cổ phần"])) hooks.add(`một dòng phụ trong ${atom} làm đổi phiếu/quyền ngay trước mặt người có quyền`);
    else if (atomHasAny(atom, ["họp báo", "livestream", "showbiz", "concert"])) hooks.add(`đám đông đang mắng nữ chính bỗng im khi ${atom} phiên bản gốc xuất hiện`);
    else hooks.add(`${atom} đảo nghĩa đúng lúc, biến cú nhục thành cú phản công khiến phản diện không kịp trở tay`);
  }

  return Array.from(hooks).slice(0, 8);
}

function buildGenreExpandedLanesFromLabel(
  genreLabel: string,
  heroineLabel: string,
  seed: string,
): StoryDramaLane[] {
  const atoms = splitGenreAtoms(genreLabel);
  const primary = pickAtom(atoms, seed, "genre-primary-atom", genreLabel || "nữ tần đô thị drama");
  const secondary = pickAtom(
    atoms.filter((item) => item !== primary),
    seed,
    "genre-secondary-atom",
    atoms[1] || primary,
  );
  const tertiary = pickAtom(
    atoms.filter((item) => item !== primary && item !== secondary),
    seed,
    "genre-tertiary-atom",
    atoms[2] || secondary || primary,
  );

  const baseAtoms = [primary, secondary, tertiary].filter(Boolean);
  const allAtoms = atoms.length ? atoms : baseAtoms;

  const lane: StoryDramaLane = {
    key: `genre-lock-${slugifySeedPart(genreLabel || primary)}`,
    label: `nữ tần đô thị drama theo genre khóa: ${genreLabel || primary}`,
    conflicts: [
      `xung đột phải mọc trực tiếp từ "${primary}" và bị đẩy căng bởi "${secondary}"`,
      `${heroineLabel || "nữ chính"} bị ép vào thế yếu vì ${primary}, nhưng sơ hở thật nằm ở ${tertiary}`,
      `phản diện dùng ${secondary} để biến nữ chính thành người có lỗi, trong khi ${primary} mới là chìa khóa đảo chiều`,
      `một bí mật đời sống đô thị quanh ${primary} khiến ${heroineLabel || "nữ chính"} phải chọn giữa chịu nhục và phản công`,
    ],
    settings: buildGenreSettingAtoms(allAtoms),
    evidenceObjects: buildGenreEvidenceAtoms(allAtoms),
    publicPressures: buildGenrePressureAtoms(allAtoms),
    hiddenTruths: buildGenreHiddenTruthAtoms(allAtoms),
    villainAttacks: buildGenreVillainAttacks(allAtoms),
    heroineCounters: buildGenreHeroineCounters(allAtoms, heroineLabel),
    emotionalStakes: buildGenreEmotionalStakes(allAtoms, heroineLabel),
    dopamineHooks: buildGenreDopamineHooks(allAtoms),
  };

  const rotate = (items: string[], salt: string) => {
    if (items.length <= 1) return items;
    const first = Math.abs(
      normalizeForCompare(`${seed}-${salt}`).split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0),
    ) % items.length;
    return [...items.slice(first), ...items.slice(0, first)];
  };

  return [
    lane,
    {
      ...lane,
      key: `${lane.key}-emotional`,
      label: `${lane.label} / biến thể cảm xúc`,
      settings: rotate(lane.settings, "setting"),
      evidenceObjects: rotate(lane.evidenceObjects, "evidence"),
      publicPressures: rotate(lane.publicPressures, "pressure"),
      hiddenTruths: rotate(lane.hiddenTruths, "truth"),
      villainAttacks: rotate(lane.villainAttacks, "attack"),
      heroineCounters: rotate(lane.heroineCounters, "counter"),
      emotionalStakes: rotate(lane.emotionalStakes, "stakes"),
      dopamineHooks: rotate(lane.dopamineHooks, "hook"),
    },
  ];
}


const ABSTRACT_TITLE_PATTERNS = [
  "nguoi cuoi cung",
  "nhin thay su that",
  "su that",
  "bi mat",
  "chien thang",
  "khong nen xuat hien",
  "khong thuoc ve toi",
  "sau tam rem",
  "mot nguoi la",
  "toi khong con",
  "khi ho goi toi",
];

const CONCRETE_TITLE_ANCHORS = [
  "ho so",
  "file",
  "camera",
  "usb",
  "sao ke",
  "hop dong",
  "di chuc",
  "ghi am",
  "tieng chuong",
  "do choi",
  "the nho",
  "email",
  "tin nhan",
  "giay khai sinh",
  "adn",
  "dna",
  "hoa don",
  "ve may bay",
  "ma qr",
  "ban ghi",
  "anh",
  "video",
  "the phong",
  "vong tay",
  "nhan",
  "ma so",
  "don to cao",
  "bang phan ca",
  "polaroid",
  "phieu gui do",
  "chu ky",
  "phu luc",
];

function hasConcreteTitleAnchor(title: string) {
  const normalized = normalizeForCompare(title);
  return CONCRETE_TITLE_ANCHORS.some((anchor) => normalized.includes(anchor));
}

function getTitleStructureSignature(title: string) {
  const normalized = normalizeForCompare(title);

  if (normalized.includes("nguoi") && normalized.includes("su that")) return "nguoi_su_that";
  if (normalized.includes("bi mat")) return "bi_mat_abstract";
  if (normalized.includes("su that")) return "su_that_abstract";
  if (normalized.includes("chien thang")) return "chien_thang_abstract";
  if (normalized.includes("khong nen xuat hien")) return "khong_nen_xuat_hien";
  if (normalized.includes("khong thuoc ve toi")) return "khong_thuoc_ve_toi";
  if (normalized.startsWith("toi ")) return "toi_ke_chuyen_abstract";
  if (normalized.startsWith("nguoi ")) return "nguoi_abstract";

  return compactTags(normalized).slice(0, 4).join("_");
}

function isGenericAbstractTitle(title: string) {
  const normalized = normalizeForCompare(title);
  const hasAbstractPattern = ABSTRACT_TITLE_PATTERNS.some((pattern) => normalized.includes(pattern));

  if (!hasAbstractPattern) return false;

  if (
    normalized.includes("khong nen xuat hien") ||
    normalized.includes("khong thuoc ve toi") ||
    normalized.includes("nguoi cuoi cung") ||
    normalized.includes("nhin thay su that") ||
    normalized.includes("chien thang")
  ) {
    return true;
  }

  return !hasConcreteTitleAnchor(title);
}

function isTitleAllowedByMemory(title: string, avoidTitles?: string[]) {
  if (isGenericAbstractTitle(title)) return false;

  const normalized = normalizeForCompare(title);
  const signature = getTitleStructureSignature(title);
  const avoid = avoidTitles || [];

  return !avoid.some((item) => {
    const avoidNormalized = normalizeForCompare(item);
    if (!avoidNormalized) return false;
    return avoidNormalized === normalized || getTitleStructureSignature(item) === signature;
  });
}

function countProceduralTerms(input: string) {
  const normalized = normalizeForCompare(input);

  return PROCEDURAL_TERMS.reduce((count, term) => {
    const normalizedTerm = normalizeForCompare(term);
    return normalized.includes(normalizedTerm) ? count + 1 : count;
  }, 0);
}

function scoreOverlapWithAvoidLibrary(
  candidateText: string,
  avoidLibrary?: AvoidLibrary,
) {
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


function cleanTitleToken(input: string) {
  return input
    .replace(/^một\s+/i, "")
    .replace(/^một chiếc\s+/i, "Chiếc ")
    .replace(/^một đoạn\s+/i, "Đoạn ")
    .replace(/^một bản\s+/i, "Bản ")
    .replace(/^một tấm\s+/i, "Tấm ")
    .replace(/^một file\s+/i, "File ")
    .replace(/^hồ sơ\s+/i, "Hồ Sơ ")
    .replace(/^ảnh\s+/i, "Ảnh ")
    .replace(/^bảng\s+/i, "Bảng ")
    .replace(/^vé\s+/i, "Vé ")
    .replace(/^di chúc\s+/i, "Di Chúc ")
    .replace(/^email\s+/i, "Email ")
    .replace(/^usb\s+/i, "USB ")
    .trim();
}

function titleCaseFirst(input: string) {
  const clean = input.trim();
  if (!clean) return clean;
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function makeEvidenceTitleVariants(evidenceObject: string) {
  const normalized = normalizeForCompare(evidenceObject);
  const token = titleCaseFirst(cleanTitleToken(evidenceObject));

  const variants: string[] = [];

  if (normalized.includes("tieng chuong")) {
    variants.push(
      "Tiếng Chuông Bị Cắt",
      "Âm Thanh Sau Tiếng Chuông",
      "Bản Ghi Còn Lại Tiếng Chuông",
    );
  }

  if (normalized.includes("ho so nhap hoc")) {
    variants.push("Hồ Sơ Lùi Ngày", "Mã Hồ Sơ Của Đứa Trẻ", "Dấu Đỏ Trong Hồ Sơ Nhập Học");
  }

  if (normalized.includes("anh chup man hinh") || normalized.includes("xoa voi")) {
    variants.push("Ảnh Xóa Vội", "Bức Ảnh Còn Trong Thùng Rác", "Ảnh Chụp Trước Khi Bị Xóa");
  }

  if (normalized.includes("chia khoa")) {
    variants.push("Chiếc Chìa Khóa Trong Két Sắt", "Chìa Khóa Mở Sai Căn Phòng", "Dấu Khắc Trên Chìa Khóa");
  }

  if (normalized.includes("the") && normalized.includes("phong")) {
    variants.push("Tấm Thẻ Phòng Bị Bỏ Quên", "Thẻ Phòng Quẹt Lúc Nửa Đêm", "Dấu Quẹt Trên Thẻ Phòng");
  }

  if (normalized.includes("a-7392") || normalized.includes("ma qr") || normalized.includes("ma")) {
    variants.push("Mã QR Dẫn Tới Thư Mục Ẩn", "Dòng Mã Trên Vé Sự Kiện", "Mã Số Trong Hồ Sơ Cũ");
  }

  if (normalized.includes("bang phan ca")) variants.push("Bảng Phân Ca Lúc Hai Giờ Sáng", "Dòng Mực Khác Trên Bảng Phân Ca");
  if (normalized.includes("di chuc")) variants.push("Bản Di Chúc Bị Thay Trang", "Trang Cuối Của Bản Di Chúc");
  if (normalized.includes("hop dong bao hiem")) variants.push("Hợp Đồng Bảo Hiểm Sai Người Thụ Hưởng", "Tên Người Thụ Hưởng Bị Đổi");
  if (normalized.includes("hop dong") || normalized.includes("uy quyen")) variants.push("Chữ Ký Thứ Hai Trong Hợp Đồng", "Trang Phụ Lục Bị Thay");
  if (normalized.includes("usb")) variants.push("USB Trong Đêm Đối Chất", "Chiếc USB Sau Lớp Niêm Phong");
  if (normalized.includes("camera")) variants.push("Bảy Phút Camera Biến Mất", "Khung Hình Bị Cắt Khỏi Camera");
  if (normalized.includes("sao ke")) variants.push("Dòng Sao Kê Bị Che", "Khoản Chuyển Lúc Không Giờ");
  if (normalized.includes("adn") || normalized.includes("dna") || normalized.includes("xet nghiem")) variants.push("Mã Mẫu Không Trùng Tên", "Phiếu Xét Nghiệm Lệch Mã");
  if (normalized.includes("giay khai sinh")) variants.push("Giấy Khai Sinh Bản Cũ", "Tên Người Cha Trong Bản Cũ");
  if (normalized.includes("nhat ky")) variants.push("Trang Nhật Ký Bị Gấp Mép", "Dòng Chữ Trong Nhật Ký Cũ");
  if (normalized.includes("hoa don")) variants.push("Hóa Đơn Gửi Sai Tên", "Dòng Địa Chỉ Trên Hóa Đơn Hoa");
  if (normalized.includes("ve may bay")) variants.push("Tấm Vé Một Chiều", "Vé Máy Bay Mang Tên Người Đã Mất");
  if (normalized.includes("voice") || normalized.includes("ghi am")) variants.push("Đoạn Ghi Âm Còn Tiếng Thở", "Bản Ghi Âm Thiếu Một Đoạn");
  if (normalized.includes("do choi")) variants.push("Món Đồ Chơi Trong Phòng Họp", "Con Gấu Bông Ở Nơi Con Chưa Từng Đến");
  if (normalized.includes("polaroid")) variants.push("Tấm Polaroid Lệch Ngày", "Ngày Tháng Sau Tấm Ảnh Cũ");
  if (normalized.includes("phieu gui do")) variants.push("Phiếu Gửi Đồ Trong Khách Sạn", "Tên Người Gửi Trên Phiếu Cũ");

  variants.push(
    `Dấu Vết Từ ${token}`,
    `${token} Đổi Nghĩa`,
    `Người Giữ ${token}`,
    `Đêm ${token} Lộ Mặt`,
  );

  return uniqueStringsForCover(variants, 10);
}

function makeEvidenceTitle(evidenceObject: string, seed: string) {
  return pickSeedItem(
    makeEvidenceTitleVariants(evidenceObject),
    seed,
    "evidence-title-pattern",
  );
}

function makeSeedAlignedTitle(params: {
  candidate: ReturnType<typeof buildSeedCandidate>;
  seed: string;
  avoidTitles?: string[];
}) {
  const evidenceTitles = makeEvidenceTitleVariants(params.candidate.evidenceObject)
  const evidenceTitle = makeEvidenceTitle(params.candidate.evidenceObject, params.seed);
  const setting = normalizeForCompare(params.candidate.setting);
  const pressure = normalizeForCompare(params.candidate.publicPressure);
  const hidden = normalizeForCompare(params.candidate.hiddenTruth);

  const options = uniqueStringsForCover(
    [
      evidenceTitle,
      ...evidenceTitles,
      setting.includes("truong") || pressure.includes("phu huynh")
        ? "Dòng Camera Trong Phòng Họp Phụ Huynh"
        : "",
      setting.includes("benh vien") || hidden.includes("benh")
        ? "Mã Hồ Sơ Trong Phòng Bệnh"
        : "",
      setting.includes("ngan hang") || pressure.includes("co dong")
        ? "Dòng Ký Tên Trước Giờ Bỏ Phiếu"
        : "",
      setting.includes("khach san") || setting.includes("resort")
        ? "Phiếu Phòng Trong Khách Sạn"
        : "",
      setting.includes("gia toc") || pressure.includes("gia toc") || hidden.includes("di chuc")
        ? "Trang Di Chúc Trong Từ Đường"
        : "",
      params.candidate.dopamineHook.includes("màn hình")
        ? "Màn Hình Đã Phát Sai File"
        : "",
    ],
    12,
  );

  const cleanOptions = options.filter((item) => isTitleAllowedByMemory(item, params.avoidTitles));
  return cleanOptions[0] || evidenceTitles.find((item) => !isGenericAbstractTitle(item)) || evidenceTitle;
}

function makeChapterTitle(params: {
  chapterNumber: number;
  candidate: ReturnType<typeof buildSeedCandidate>;
  alternateEvidence: string;
  alternateSetting: string;
  alternatePressure: string;
  seed: string;
}) {
  const evidenceTitle = makeEvidenceTitle(params.candidate.evidenceObject, params.seed);
  const altEvidenceTitle = makeEvidenceTitle(params.alternateEvidence, `${params.seed}-alt`);
  const setting = params.alternateSetting.replace(/^một\s+/i, "").trim();
  const pressure = params.alternatePressure.replace(/^một\s+/i, "").trim();

  switch (params.chapterNumber) {
    case 1:
      return evidenceTitle;
    case 2:
      if (normalizeForCompare(params.candidate.emotionalStake).includes("con")) return "Thẻ Truy Cập Bị Khóa";
      if (normalizeForCompare(params.candidate.emotionalStake).includes("nguoi than") || normalizeForCompare(params.candidate.emotionalStake).includes("me")) return "Cuộc Gọi Từ Phòng Bệnh";
      return "Cú Ép Đầu Tiên";
    case 3:
      return titleCaseFirst(setting.length <= 34 ? setting : pressure) || "Địa Điểm Thứ Hai";
    case 4:
      return altEvidenceTitle;
    case 5:
      return "Cú Vả Mặt Đầu Tiên";
    case 6:
      return "Phản Diện Chính Ra Mặt";
    case 7:
      return "Bằng Chứng Đảo Nghĩa";
    case 8:
      return "Cái Bẫy Được Giăng Lại";
    case 9:
      return "Đòn Trả Thù Công Khai";
    case 10:
      return "Người Đứng Giữa Đổi Phe";
    case 11:
      return "Đối Chất Trước Mọi Người";
    case 12:
      return "Sự Thật Được Mở Khóa";
    default:
      return `Chương ${params.chapterNumber}`;
  }
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
  const setting = pickSeedItem(
    params.lane.settings,
    params.seed,
    `setting-${params.lane.key}`,
  );
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
  const hiddenTruth = pickSeedItem(
    params.lane.hiddenTruths,
    params.seed,
    `truth-${params.lane.key}`,
  );
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

  const exactGenre = params.genreLabel || params.lane.label;
  const corePremise = `Nữ chính thuộc kiểu ${params.heroineLabel} bước vào một nữ tần đô thị drama bám chặt genre "${exactGenre}". Xung đột mở tại ${setting}; trọng tâm không phải hồ sơ-camera-log chung mà là ${relationshipConflict}. ${evidenceObject} chỉ là chìa khóa riêng của genre này, buộc cô nhìn thấy ai đang dùng ${publicPressure} để ép mình cúi đầu.`;
  const openingScene = setting;
  const incitingIncident = `Tại ${setting}, ${villainAttack}. ${evidenceObject} không phải vật chứng rơi vào scene theo công thức cũ; nó được đặt trong một tình huống cụ thể của "${exactGenre}" khiến nữ chính bị hiểu sai trước người liên quan.`;
  const mainConflict = `Nữ chính phải xử lý ${relationshipConflict} bằng logic riêng của genre "${exactGenre}": cảm xúc thật, áp lực đô thị, cú nhục rõ, phản công chủ động. Không được tự kéo về chuỗi camera/log/phong tỏa/pháp lý nếu genre không đòi hỏi.`;
  const villainType = `Phản diện chính thao túng ${relationshipConflict} bằng đòn riêng: ${villainAttack}. Họ phải có mục tiêu cá nhân, lời nói/cử chỉ nhận diện được, không chỉ là luật sư/PR/pháp vụ vô danh.`;
  const heroineArc = `${params.heroineLabel}: chịu đau có lý do → quan sát điểm lệch trong ${evidenceObject} → bảo vệ điều quan trọng (${emotionalStake}) → phản công bằng cách riêng (${heroineCounter}) → vả mặt có cảm xúc và payoff.`;
  const emotionalHook = `${emotionalStake}. Cảm xúc phải đến từ đúng kiểu nữ chính "${params.heroineLabel}", không biến cô thành một nữ tổng tài lạnh lùng giống mọi truyện.`;
  const powerStructure = `Quyền lực đối đầu đến từ ${publicPressure} và thế lực quanh ${relationshipConflict}; nữ chính có ${evidenceObject}, sự bình tĩnh, tổn thương thật, và cách phản công riêng: ${heroineCounter}.`;
  const shortFingerprint = `${params.lane.key} + genre:${exactGenre} + setting:${setting} + evidence:${evidenceObject} + conflict:${relationshipConflict} + heroine:${params.heroineLabel}`;
  const dramaBalance = `Drama balance theo genre: attack=${villainAttack} → hurt=${emotionalStake} → counter=${heroineCounter} → payoff=${dopamineHook}.`;

  return {
    relationshipConflict,
    setting,
    evidenceObject,
    publicPressure,
    hiddenTruth,
    villainAttack,
    heroineCounter,
    emotionalStake,
    dopamineHook,
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

function buildFactoryStoryPlan(params: {
  title: string;
  seed: string;
  candidate: ReturnType<typeof buildSeedCandidate>;
}) {
  const { candidate } = params;
  const alternatePressure =
    pickSeedItem(
      FACTORY_PUBLIC_PRESSURES.filter(
        (item) => item !== candidate.publicPressure,
      ),
      params.seed,
      "planner-alt-pressure",
    ) || candidate.publicPressure;
  const alternateEvidence =
    pickSeedItem(
      FACTORY_SEED_EVIDENCE_OBJECTS.filter(
        (item) => item !== candidate.evidenceObject,
      ),
      params.seed,
      "planner-alt-evidence",
    ) || candidate.evidenceObject;
  const alternateSetting =
    pickSeedItem(
      FACTORY_SETTING_CLUSTERS.filter((item) => item !== candidate.setting),
      params.seed,
      "planner-alt-setting",
    ) || candidate.setting;

  const evidencePlan = [
    `Chương 1 cài vật chứng chính: ${candidate.evidenceObject}, trong một tình huống cụ thể của genre; không dùng công thức vật chứng rơi ra đúng lúc chung chung.`,
    `Chương 2–3 cho vật chứng bị bẻ nghĩa bằng áp lực đời sống/cảm xúc của genre, không mặc định phong tỏa/niêm phong/pháp lý.`,
    `Chương 4–5 đưa vật chứng phụ: ${alternateEvidence}, nhưng phải khác loại và khác chức năng với vật chứng chính.`,
    `Chương 6–8 hé một mảnh của hidden truth: ${candidate.hiddenTruth}, chưa xả hết.`,
    `Chương 9–11 gom chứng cứ thành bẫy ngược, buộc phản diện chính tự lộ dấu tay.`,
    `Chương cuối payoff toàn bộ vật chứng, không giải quyết bằng kể tóm tắt.`,
  ];

  const villainCurve = [
    `Mở đầu: phản diện dùng đòn ${candidate.publicPressure} gắn trực tiếp với genre, không dùng lại motif camera/log/pháp lý nếu không có trong seed.`,
    `Đầu truyện: phản diện chính hoặc dấu tay cá nhân phải xuất hiện, không chỉ luật sư/PR/pháp vụ.`,
    `Giữa truyện: phản diện thắng một ván thật, khiến nữ chính mất mặt hoặc mất quyền tạm thời.`,
    `Sau midpoint: phản diện bắt đầu sợ, chuyển từ thao túng xa sang đối đầu trực diện.`,
    `Cuối truyện: phản diện tự lộ sơ hở vì muốn khóa miệng nữ chính quá gấp.`,
  ];

  const payoffPlan = [
    `Payoff emotional: ${candidate.emotionalHook}`,
    `Payoff evidence: ${candidate.evidenceObject} phải trả bằng logic riêng của genre, không biến thành một file/camera/log chung.`,
    `Payoff hidden truth: ${candidate.hiddenTruth}`,
    `Payoff heroine arc: nữ chính không thắng nhờ may mắn, mà nhờ chủ động gài bẫy và giữ bình tĩnh.`,
  ];

  const chapterPlan: FactoryStoryPlanChapter[] = [
    {
      chapterNumber: 1,
      title: makeChapterTitle({ chapterNumber: 1, candidate, alternateEvidence, alternateSetting, alternatePressure, seed: params.seed }),
      mission: `Mở tại ${candidate.openingScene}. ${candidate.evidenceObject} bị dùng trong một tình huống cụ thể của genre để làm nữ chính mất thế; không dùng câu vật chứng rơi ra đúng lúc chung chung.`,
      sceneType: "opening hook / public pressure",
      mainScene: candidate.openingScene,
      evidenceBeat: `Cài ${candidate.evidenceObject}, chỉ cho thấy 1 điểm lệch logic.`,
      villainBeat: `Phản diện tung cú đánh đầu tiên qua ${candidate.publicPressure}, có dấu tay cá nhân rõ.`,
      heroineMove:
        "Nữ chính không khóc lóc, bình tĩnh giữ lại bản sao/chứng cứ nhỏ.",
      emotionalBeat: candidate.emotionalHook,
      powerShift:
        "Nữ chính bị đẩy vào thế yếu công khai, nhưng có được manh mối đầu tiên.",
      endingHook: "Một người/thứ tưởng ngoài lề bị kéo vào làm áp lực thật.",
    },
    {
      chapterNumber: 2,
      title: makeChapterTitle({ chapterNumber: 2, candidate, alternateEvidence, alternateSetting, alternatePressure, seed: params.seed }),
      mission:
        "Không lặp thủ tục/pháp lý/log/camera. Chương này phải cho hậu quả chạm vào người thân, công việc, danh dự hoặc quan hệ theo đúng genre.",
      sceneType: "emotional cost / villain pressure",
      mainScene: alternateSetting,
      evidenceBeat: `Vật chứng chính bị phản diện bẻ nghĩa; chưa giải thích hết ${candidate.evidenceObject}.`,
      villainBeat:
        "Phản diện chính gửi lời đe dọa hoặc xuất hiện ngắn, thể hiện mục tiêu cá nhân.",
      heroineMove:
        "Nữ chính chọn một hành động cụ thể để bảo vệ người yếu thế trước khi phản công.",
      emotionalBeat:
        "Một câu hỏi/ánh nhìn/tin nhắn khiến nữ chính đau nhưng không gục.",
      powerShift:
        "Phản diện thắng một bước thật: cô mất quyền, mất niềm tin của đám đông hoặc bị cô lập.",
      endingHook: `Một dấu vết phụ trỏ sang ${alternateEvidence}.`,
    },
    {
      chapterNumber: 3,
      title: makeChapterTitle({ chapterNumber: 3, candidate, alternateEvidence, alternateSetting, alternatePressure, seed: params.seed }),
      mission: `Chuyển trọng tâm sang ${alternatePressure} hoặc đối thoại trực diện, tạo scene mới khác chương trước, không dùng lại nhịp bị chặn bằng giấy tờ/log.`,
      sceneType: "direct confrontation / social pressure",
      mainScene: alternatePressure,
      evidenceBeat: `Hé ${alternateEvidence} như vật chứng phụ, không thay thế vật chứng chính.`,
      villainBeat:
        "Phản diện sỉ nhục nữ chính trước ít nhất một người có quyền lực hoặc một nhóm người chứng kiến.",
      heroineMove:
        "Nữ chính đặt một câu hỏi khiến đối phương lộ mâu thuẫn nhỏ.",
      emotionalBeat:
        "Có một chi tiết đời thường làm người đọc thấy cái giá nữ chính đang chịu.",
      powerShift:
        "Nữ chính chưa thắng nhưng làm một người trung lập bắt đầu nghi ngờ phản diện.",
      endingHook: "Một người từng thân thiết nhắn/đến gặp với thái độ mập mờ.",
    },
    {
      chapterNumber: 4,
      title: makeChapterTitle({ chapterNumber: 4, candidate, alternateEvidence, alternateSetting, alternatePressure, seed: params.seed }),
      mission:
        "Đẩy tuyến phản bội/đổi phe bằng chi tiết đời sống hoặc quan hệ; không biến chương này thành giám định/log/thủ tục thuần túy.",
      sceneType: "betrayal / witness scene",
      mainScene: "một không gian kín có đối thoại căng",
      evidenceBeat:
        "Một nhân chứng hoặc dữ liệu phụ xác nhận có người bên trong động tay.",
      villainBeat:
        "Phản diện phụ cố che, nhưng phản diện chính phải có dấu tay/lời nhắn/áp lực riêng.",
      heroineMove:
        "Nữ chính không vạch mặt ngay, giữ lại mồi để gài bẫy chương sau.",
      emotionalBeat:
        "Người nữ chính từng tin làm cô đau hoặc buộc cô nghi ngờ lòng tin của mình.",
      powerShift: "Nữ chính từ bị động chuyển sang có kế hoạch phản công.",
      endingHook:
        "Lộ một thông tin khiến bằng chứng ban đầu có nghĩa ngược lại.",
    },
    {
      chapterNumber: 5,
      title: makeChapterTitle({ chapterNumber: 5, candidate, alternateEvidence, alternateSetting, alternatePressure, seed: params.seed }),
      mission: `Tạo payoff nhỏ trước ${candidate.publicPressure}: nữ chính thắng một ván bằng logic genre và tính cách heroine, chưa lật hết ${candidate.hiddenTruth}.`,
      sceneType: "public face-slap / small payoff",
      mainScene: candidate.publicPressure,
      evidenceBeat: `Dùng ${candidate.evidenceObject} hoặc ${alternateEvidence} để chứng minh một lời nói dối nhỏ.`,
      villainBeat:
        "Phản diện bị khựng lại trước đám đông nhưng lập tức chuẩn bị đòn nặng hơn.",
      heroineMove:
        "Nữ chính nói ít, dùng chứng cứ hoặc câu hỏi sắc để đảo chiều dư luận nhỏ.",
      emotionalBeat:
        "Người yếu thế được trả lại một phần công bằng hoặc nữ chính giữ được một điều quan trọng.",
      powerShift:
        "Nữ chính giành thắng lợi nhỏ thật; đám đông chuyển từ kết tội sang nghi ngờ.",
      endingHook:
        "Phản diện chính quyết định ra mặt mạnh hơn vì không thể để cô tiếp tục.",
    },
    {
      chapterNumber: 6,
      title: makeChapterTitle({ chapterNumber: 6, candidate, alternateEvidence, alternateSetting, alternatePressure, seed: params.seed }),
      mission:
        "Bắt buộc có phản diện chính đối đầu trực diện hoặc gọi/nhắn đe dọa có cá tính riêng.",
      sceneType: "main villain confrontation",
      mainScene: "không gian riêng nhưng có hậu quả công khai",
      evidenceBeat:
        "Không thêm vật chứng mới quá nhiều; tập trung vào ý nghĩa mới của chứng cứ cũ.",
      villainBeat:
        "Phản diện chính đưa điều kiện: im lặng, ký giấy, rời khỏi vị trí hoặc hy sinh một quan hệ.",
      heroineMove:
        "Nữ chính giả vờ nhượng một phần để lấy câu nói/sơ hở của phản diện.",
      emotionalBeat:
        "Nữ chính phải nuốt một câu nhục nhưng biến nó thành mồi bẫy.",
      powerShift:
        "Phản diện tưởng thắng, nhưng nữ chính lấy được bằng chứng về động cơ thật.",
      endingHook: `Một phần của hidden truth hé ra: ${candidate.hiddenTruth}.`,
    },
    {
      chapterNumber: 7,
      title: makeChapterTitle({ chapterNumber: 7, candidate, alternateEvidence, alternateSetting, alternatePressure, seed: params.seed }),
      mission:
        "Đảo nghĩa một mảnh chứng cứ: thứ tưởng bất lợi hóa ra là bẫy hoặc chìa khóa.",
      sceneType: "midpoint reveal",
      mainScene: alternateSetting,
      evidenceBeat: `Kết nối ${candidate.evidenceObject} với ${alternateEvidence}.`,
      villainBeat: "Phản diện đổi chiến thuật vì kế hoạch cũ bắt đầu rạn.",
      heroineMove:
        "Nữ chính chủ động hẹn gặp/đặt bẫy một người trong phe phản diện.",
      emotionalBeat:
        "Một đồng minh/người thân không còn tin cô tuyệt đối, tạo áp lực cảm xúc mới.",
      powerShift:
        "Thế trận cân bằng hơn: nữ chính có vũ khí thật nhưng chưa thể công khai.",
      endingHook: "Người phản bội thật sự không phải người bị nghi đầu tiên.",
    },
    {
      chapterNumber: 8,
      title: makeChapterTitle({ chapterNumber: 8, candidate, alternateEvidence, alternateSetting, alternatePressure, seed: params.seed }),
      mission: "Nữ chính chủ động dựng sân khấu để phản diện tự nói/làm sai.",
      sceneType: "heroine trap / active counterattack",
      mainScene: candidate.publicPressure,
      evidenceBeat: "Chứng cứ được dùng như mồi, không chỉ như lời giải thích.",
      villainBeat: "Phản diện phụ cắn câu, làm lộ kết nối với phản diện chính.",
      heroineMove: "Nữ chính kiểm soát thời điểm tung một phần sự thật.",
      emotionalBeat:
        "Nữ chính bảo vệ người yếu thế bằng hành động, không chỉ lời hứa.",
      powerShift:
        "Một người trung lập hoặc đồng minh cũ chuyển sang giúp nữ chính.",
      endingHook: "Phản diện chính chuẩn bị đòn trả thù lớn nhất.",
    },
    {
      chapterNumber: 9,
      title: makeChapterTitle({ chapterNumber: 9, candidate, alternateEvidence, alternateSetting, alternatePressure, seed: params.seed }),
      mission: "Cho phản diện thắng đau một ván, nhưng không phá logic đã cài.",
      sceneType: "villain counterstrike",
      mainScene: "một sự kiện có nhiều người chứng kiến",
      evidenceBeat: "Chứng cứ bị cắt ghép/bẻ nghĩa lần cuối, tạo hiểu lầm lớn.",
      villainBeat:
        "Phản diện chính sỉ nhục hoặc ép nữ chính chọn giữa danh dự và người thân.",
      heroineMove:
        "Nữ chính chấp nhận mất mặt tạm thời để giữ bằng chứng cuối.",
      emotionalBeat: "Đây là đáy cảm xúc của nữ chính trong truyện.",
      powerShift:
        "Phản diện giành lại quyền lực tạm thời, đẩy nữ chính sát mép thua.",
      endingHook: "Một chi tiết nhỏ chứng minh phản diện đã quá tay.",
    },
    {
      chapterNumber: 10,
      title: makeChapterTitle({ chapterNumber: 10, candidate, alternateEvidence, alternateSetting, alternatePressure, seed: params.seed }),
      mission:
        "Một nhân vật từng im lặng/đứng giữa phải chọn phe vì thấy phản diện quá tay.",
      sceneType: "ally switch / witness payoff",
      mainScene: alternateSetting,
      evidenceBeat: "Nhân chứng hoặc vật chứng phụ xác nhận chuỗi thao túng.",
      villainBeat: "Phe phản diện bắt đầu tự nghi ngờ và đổ lỗi lẫn nhau.",
      heroineMove:
        "Nữ chính ghép đủ các mảnh nhưng chỉ công khai phần cần thiết.",
      emotionalBeat:
        "Một lời xin lỗi muộn hoặc một sự thật khiến nữ chính phải lạnh lòng.",
      powerShift: "Nữ chính lấy lại thế chủ động thật sự.",
      endingHook: "Hẹn sân khấu đối chất cuối cùng.",
    },
    {
      chapterNumber: 11,
      title: makeChapterTitle({ chapterNumber: 11, candidate, alternateEvidence, alternateSetting, alternatePressure, seed: params.seed }),
      mission:
        "Dồn phản diện chính vào nơi không thể dùng người phụ gánh tội thay.",
      sceneType: "final confrontation setup",
      mainScene: candidate.publicPressure,
      evidenceBeat: `Chuẩn bị payoff cho ${candidate.evidenceObject}, ${alternateEvidence}, và hidden truth.`,
      villainBeat: "Phản diện chính tự tin vì nghĩ đã khóa hết đường lui.",
      heroineMove: "Nữ chính cho đối phương nói đủ nhiều rồi mới lật chứng cứ.",
      emotionalBeat:
        "Nữ chính đối diện người từng làm cô đau nhất bằng sự bình tĩnh.",
      powerShift:
        "Cán cân nghiêng hẳn về nữ chính nhưng chưa tuyên án/kết luận hết.",
      endingHook: "Một câu nói hoặc file cuối cùng mở khóa toàn bộ sự thật.",
    },
    {
      chapterNumber: 12,
      title: makeChapterTitle({ chapterNumber: 12, candidate, alternateEvidence, alternateSetting, alternatePressure, seed: params.seed }),
      mission:
        "Trả đủ bằng chứng, cảm xúc và quyền lực; không kết bằng tóm tắt vội.",
      sceneType: "payoff / resolution",
      mainScene: "sân khấu từng khiến nữ chính bị sỉ nhục, nay đảo chiều",
      evidenceBeat: `Payoff ${candidate.evidenceObject}: chứng minh ai dựng chuyện, dựng bằng cách nào, và vì sao.`,
      villainBeat:
        "Phản diện chính mất quyền thao túng hoặc bị buộc chịu hậu quả công khai.",
      heroineMove:
        "Nữ chính chọn cách kết thúc có khí chất: không cầu xin, không dây dưa, không tự hạ mình.",
      emotionalBeat:
        "Người thân/con/đồng minh thấy nữ chính giành lại sự an toàn và danh dự.",
      powerShift: "Nữ chính kiểm soát lại đời mình và mở ra trạng thái mới.",
      endingHook: "Kết chắc, có dư vị thắng nhưng không lê thê.",
    },
  ];

  return {
    plannerVersion: "story-planner-v1",
    totalPlannedChapters: chapterPlan.length,
    plannerGoal: `Outline cố định cho ${params.title}: evidence plan + villain curve + emotional/payoff. Writer phải bám mission từng chương, không tự trôi về nhịp thủ tục lặp.`,
    evidencePlan,
    villainCurve,
    payoffPlan,
    chapterPlan,
  };
}

function inferCoverArena(candidate: ReturnType<typeof buildSeedCandidate>) {
  const text =
    `${candidate.setting} | ${candidate.publicPressure} | ${candidate.relationshipConflict}`.toLowerCase();

  if (
    text.includes("trường") ||
    text.includes("phụ huynh") ||
    text.includes("mẫu giáo") ||
    text.includes("con")
  ) {
    return "trường học hoặc buổi họp phụ huynh, có bảng thông báo/điện thoại nhóm phụ huynh và đứa trẻ bị kéo vào áp lực người lớn";
  }

  if (
    text.includes("bệnh viện") ||
    text.includes("adn") ||
    text.includes("xét nghiệm") ||
    text.includes("bệnh án")
  ) {
    return "hành lang bệnh viện hoặc phòng xét nghiệm, có hồ sơ y khoa, ánh đèn lạnh và một người thân yếu thế phía sau";
  }

  if (
    text.includes("hội đồng") ||
    text.includes("cổ đông") ||
    text.includes("tập đoàn") ||
    text.includes("công ty") ||
    text.includes("ngân hàng")
  ) {
    return "phòng họp kính của tập đoàn/ngân hàng, có màn hình dữ liệu, bàn họp và bóng người quyền lực đang gây sức ép";
  }

  if (
    text.includes("livestream") ||
    text.includes("họp báo") ||
    text.includes("showbiz") ||
    text.includes("truyền thông") ||
    text.includes("weibo")
  ) {
    return "sân khấu truyền thông hoặc họp báo, có đèn flash, màn hình lớn và đám đông máy quay";
  }

  if (
    text.includes("khách sạn") ||
    text.includes("resort") ||
    text.includes("du lịch") ||
    text.includes("sảnh")
  ) {
    return "sảnh khách sạn/resort sang trọng, có bóng người phản bội, camera hành lang và đạo cụ manh mối nổi bật";
  }

  if (
    text.includes("gia tộc") ||
    text.includes("mẹ chồng") ||
    text.includes("di chúc") ||
    text.includes("thừa kế")
  ) {
    return "phòng khách hào môn hoặc phòng họp gia tộc, có trưởng bối/đối thủ trong bóng tối và vật chứng thừa kế trên bàn";
  }

  return `${candidate.setting}, nhưng phải thể hiện rõ bối cảnh xung đột, không dùng nền tối trống hoặc chân dung đơn lẻ`;
}

function inferCoverSecondaryFigures(
  candidate: ReturnType<typeof buildSeedCandidate>,
) {
  const text =
    `${candidate.setting} | ${candidate.relationshipConflict} | ${candidate.publicPressure}`.toLowerCase();

  if (
    text.includes("con") ||
    text.includes("phụ huynh") ||
    text.includes("trường")
  ) {
    return [
      "một đứa trẻ đứng sát nữ chính hoặc phía sau nữ chính",
      "một phụ huynh/giáo viên/đại diện trường đang tạo áp lực trong nền",
    ];
  }

  if (
    text.includes("mẹ chồng") ||
    text.includes("gia tộc") ||
    text.includes("thừa kế")
  ) {
    return [
      "một trưởng bối hoặc mẹ chồng sắc lạnh trong nền",
      "một người đàn ông quyền lực hoặc luật sư gia tộc đứng sau bàn",
    ];
  }

  if (
    text.includes("hội đồng") ||
    text.includes("cổ đông") ||
    text.includes("tập đoàn") ||
    text.includes("ngân hàng")
  ) {
    return [
      "một người đàn ông quyền lực mặc vest đứng sau bàn họp",
      "vài bóng người hội đồng/cổ đông đang nhìn về nữ chính",
    ];
  }

  if (
    text.includes("showbiz") ||
    text.includes("livestream") ||
    text.includes("họp báo") ||
    text.includes("truyền thông")
  ) {
    return [
      "một đối thủ nữ hoặc quản lý truyền thông đứng dưới ánh flash",
      "phóng viên/paparazzi hoặc nhân viên PR trong nền",
    ];
  }

  if (
    text.includes("bệnh viện") ||
    text.includes("xét nghiệm") ||
    text.includes("bệnh án")
  ) {
    return [
      "một bác sĩ hoặc y tá giữ hồ sơ ở phía sau",
      "người thân yếu thế nằm/đứng mờ trong nền bệnh viện",
    ];
  }

  return [
    "một phản diện hoặc bóng người quyền lực đứng phía sau nữ chính",
    "một nhân vật phụ/nhân chứng đang do dự ở midground",
  ];
}

function buildFactoryCoverConcept(params: {
  title: string;
  seed: string;
  candidate: ReturnType<typeof buildSeedCandidate>;
  storyPlan: FactoryStoryPlan;
}): FactoryCoverConcept {
  const candidate = params.candidate;
  const alternateProp = pickSeedItem(
    FACTORY_SEED_EVIDENCE_OBJECTS.filter(
      (item) => item !== candidate.evidenceObject,
    ),
    params.seed,
    "cover-alt-prop",
  );
  const firstPlan = params.storyPlan.chapterPlan[0];
  const midpointPlan =
    params.storyPlan.chapterPlan[6] ||
    params.storyPlan.chapterPlan[4] ||
    firstPlan;
  const visualArena = inferCoverArena(candidate);
  const secondaryFigures = inferCoverSecondaryFigures(candidate);
  const clueProps = uniqueStringsForCover(
    [
      candidate.evidenceObject,
      alternateProp,
      firstPlan?.evidenceBeat || "",
      midpointPlan?.evidenceBeat || "",
    ],
    4,
  );
  const conflictVisuals = uniqueStringsForCover(
    [
      candidate.villainAttack,
      candidate.publicPressure,
      candidate.emotionalStake,
      candidate.dopamineHook,
      firstPlan?.powerShift || "",
    ],
    5,
  );

  return {
    visualArena,
    heroine:
      "nữ chính hiện đại đứng ở tiền cảnh, ánh mắt tỉnh táo và kiên cường, không yếu đuối, không tạo dáng thời trang đơn thuần",
    secondaryFigures,
    clueProps,
    conflictVisuals,
    mustShowElements: uniqueStringsForCover(
      [
        "nữ chính",
        ...secondaryFigures.slice(0, 1),
        ...clueProps.slice(0, 2),
        visualArena,
        "một dấu hiệu xung đột công khai hoặc quyền lực đang đè ép nữ chính",
      ],
      6,
    ),
    compositionType:
      "cinematic story poster, bố cục nhiều lớp: nữ chính foreground + vật chứng lớn midground + phản diện/nhân chứng và bối cảnh rõ ở background; tuyệt đối không phải solo portrait",
    moodTone: `drama căng, ${candidate.emotionalStake}, nữ chính bị ép nhưng đang chuẩn bị phản công`,
    colorTone:
      "cinematic high contrast, rõ vật chứng, không tối bệt, không nền trống",
    negativePrompt: [
      "solo woman portrait",
      "một nữ chính đứng một mình trên nền tối",
      "single woman holding one paper",
      "empty dark background",
      "generic pretty girl cover",
      "không có phản diện/nhân vật phụ",
      "không có bối cảnh truyện",
      "không có vật chứng rõ",
    ],
  };
}

function uniqueStringsForCover(list: string[], limit = 8) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of list) {
    const clean = typeof item === "string" ? item.trim() : "";
    const key = clean.toLowerCase();
    if (!clean || seen.has(key)) continue;
    seen.add(key);
    result.push(clean);
    if (result.length >= limit) break;
  }

  return result;
}

function formatCoverConceptForPrompt(coverConcept?: FactoryCoverConcept) {
  if (!coverConcept) return "";

  return `

COVER CONCEPT / VISUAL DNA BẮT BUỘC:
- Visual arena: ${coverConcept.visualArena}
- Heroine: ${coverConcept.heroine}
- Secondary figures: ${coverConcept.secondaryFigures.join(" | ")}
- Clue props: ${coverConcept.clueProps.join(" | ")}
- Conflict visuals: ${coverConcept.conflictVisuals.join(" | ")}
- Must-show elements: ${coverConcept.mustShowElements.join(" | ")}
- Composition type: ${coverConcept.compositionType}
- Mood tone: ${coverConcept.moodTone}
- Color tone: ${coverConcept.colorTone}
- Negative prompt: ${coverConcept.negativePrompt.join(" | ")}

QUY TẮC COVER:
- Ảnh bìa phải là poster kể chuyện, không phải chân dung một nữ chính.
- Bắt buộc có nữ chính + ít nhất một nhân vật phụ/phản diện/bóng người + ít nhất hai vật chứng lớn + bối cảnh truyện rõ.
- Nếu chỉ vẽ một cô gái đứng/ngồi trên nền tối hoặc chỉ cầm một tờ giấy, cover bị xem là lỗi.
`.trim();
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

  const genreExpandedLanes = buildGenreExpandedLanesFromLabel(
    params.genreLabel,
    params.heroineLabel,
    params.seed,
  );

  const shouldUseFallbackLanes =
    !params.genreLabel || normalizeForCompare(params.genreLabel).length < 6;

  const lanePool = shouldUseFallbackLanes
    ? [...genreExpandedLanes, ...FACTORY_DRAMA_LANES.slice(0, 2)]
    : genreExpandedLanes;

  const laneOrder = lanePool.map((lane, index) => {
    const laneText = [
      lane.label,
      ...lane.conflicts,
      ...lane.settings,
      ...lane.evidenceObjects,
      ...lane.publicPressures,
      ...lane.hiddenTruths,
      ...lane.villainAttacks,
      ...lane.heroineCounters,
    ].join(" | ");

    const genreLaneBonus = lane.key.startsWith("genre-lock-") ? -2.5 : 0;
    const avoidPenalty = scoreOverlapWithAvoidLibrary(laneText, params.avoidLibrary);
    const proceduralPenalty = countProceduralTerms(laneText) / 80;
    const seedBias = Number(
      pickSeedItem(["0.00", "0.01", "0.02", "0.03"], params.seed, `lane-order-${lane.key}-${index}`),
    );

    return {
      lane,
      score: genreLaneBonus + avoidPenalty * 0.9 + proceduralPenalty + seedBias,
    };
  }).sort((a, b) => a.score - b.score);

  for (const laneItem of laneOrder) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const attemptSeed = `${getSeedAttempt(params.seed, attempt)}-${laneItem.lane.key}`;
      const candidate = buildSeedCandidate({
        genreLabel: params.genreLabel,
        heroineLabel: params.heroineLabel,
        seed: attemptSeed,
        lane: laneItem.lane,
      });

      const candidateText = [
        candidate.shortFingerprint,
        candidate.corePremise,
        candidate.mainConflict,
        candidate.hiddenTruth,
        candidate.dramaBalance,
        candidate.publicPressure,
        candidate.villainAttack,
        candidate.heroineCounter,
        candidate.emotionalStake,
        params.genreLabel,
        params.heroineLabel,
      ].join(" | ");

      const overlapPenalty = scoreOverlapWithAvoidLibrary(candidateText, params.avoidLibrary);
      const proceduralPenalty = countProceduralTerms(candidateText) / 55;
      const exactGenrePenalty = candidate.shortFingerprint.includes(`genre:${params.genreLabel}`) ? -1.2 : 1.2;
      const score = overlapPenalty * 1.15 + proceduralPenalty + laneItem.score + exactGenrePenalty;

      if (score < bestScore) {
        bestScore = score;
        bestCandidate = candidate;
      }

      if (overlapPenalty <= 0.18 && proceduralPenalty <= 0.18) break;
    }

    if (bestScore <= -0.55) break;
  }

  const candidate =
    bestCandidate ??
    buildSeedCandidate({
      genreLabel: params.genreLabel,
      heroineLabel: params.heroineLabel,
      seed: params.seed,
      lane: genreExpandedLanes[0] ?? pickDramaLane(params.seed, params.avoidLibrary),
    });

  const title = makeSeedAlignedTitle({
    candidate,
    seed: params.seed,
    avoidTitles: params.avoidLibrary?.titles,
  }) ||
    buildUniqueFactoryTitle({
      genreLabel: params.genreLabel,
      seed: params.seed,
      avoidTitles: params.avoidLibrary?.titles,
    });

  const storyPlan = buildFactoryStoryPlan({
    title,
    seed: params.seed,
    candidate,
  });

  const coverConcept = buildFactoryCoverConcept({
    title,
    seed: params.seed,
    candidate,
    storyPlan,
  });

  const antiRepeatTags = Array.from(
    new Set([
      ...compactTags(params.genreLabel),
      ...compactTags(params.heroineLabel),
      ...compactTags(candidate.setting),
      ...compactTags(candidate.evidenceObject),
      ...compactTags(candidate.relationshipConflict),
      ...compactTags(candidate.publicPressure),
      ...compactTags(candidate.hiddenTruth),
      ...compactTags(candidate.villainAttack),
      ...compactTags(candidate.heroineCounter),
      ...compactTags(candidate.dramaBalance),
    ]),
  ).slice(0, 18);

  const motifFingerprint = {
    premiseFamily: `genre-lock:${params.genreLabel} | relationship:${candidate.relationshipConflict}`,
    openingArena: `setting-specific:${candidate.setting}`,
    incitingIncident: `genre-incident:${candidate.incitingIncident}`,
    evidenceType: `exact-evidence:${candidate.evidenceObject}`,
    evidenceObject: candidate.evidenceObject,
    villainAttackType: `exact-attack:${candidate.villainAttack}`,
    heroineCounterType: `heroine:${params.heroineLabel} | exact-counter:${candidate.heroineCounter}`,
    powerStructure: `power-from-genre:${candidate.powerStructure}`,
    publicPressure: `pressure-specific:${candidate.publicPressure}`,
    emotionalWound: `emotional:${candidate.emotionalStake}`,
    hiddenTruthType: `exact-truth:${candidate.hiddenTruth}`,
    mainArena: `main-arena:${candidate.setting}`,
    secondaryArena: `pressure-arena:${candidate.publicPressure}`,
    relationshipCore: `relationship-core:${candidate.relationshipConflict}`,
    twistEngine: `twist-from-evidence:${candidate.evidenceObject} -> ${candidate.hiddenTruth}`,
    deadlineStyle: `genre-specific-deadline:${candidate.publicPressure}`,
    endingPromise: `payoff:${candidate.dopamineHook}`,
    antiRepeatTags,
    fingerprint: [
      `genre=${params.genreLabel}`,
      `heroine=${params.heroineLabel}`,
      `lane=${candidate.shortFingerprint}`,
      `setting=${candidate.setting}`,
      `evidence=${candidate.evidenceObject}`,
      `attack=${candidate.villainAttack}`,
      `counter=${candidate.heroineCounter}`,
      `truth=${candidate.hiddenTruth}`,
      `pressure=${candidate.publicPressure}`,
    ].join(" || "),
  };

  const motifText = [
    motifFingerprint.fingerprint,
    candidate.corePremise,
    candidate.mainConflict,
    candidate.emotionalHook,
    candidate.dramaBalance,
  ].join(" | ");

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
    antiRepeatTags,
    motifFingerprint,
    motifText,
    coverConcept,
    storyPlan,
    pipeline: {
      planner: true,
      chapterWriter: true,
      storyEditor: true,
      polishRewriter: false,
      note: "Planner v3 genre-lock: seed DNA lấy từ genre + heroine thật, không default camera/log/pháp lý/phong tỏa.",
    },
  } as FactoryStorySeed;
}

function formatStoryPlanForPrompt(storyPlan?: FactoryStoryPlan) {
  if (!storyPlan?.chapterPlan?.length) return "";

  const evidencePlan = storyPlan.evidencePlan
    .map((item) => `- ${item}`)
    .join("\n");
  const villainCurve = storyPlan.villainCurve
    .map((item) => `- ${item}`)
    .join("\n");
  const payoffPlan = storyPlan.payoffPlan.map((item) => `- ${item}`).join("\n");
  const chapterPlan = storyPlan.chapterPlan
    .map((chapter) => {
      return [
        `Chương ${chapter.chapterNumber}: ${chapter.title}`,
        `  Mission: ${chapter.mission}`,
        `  Scene: ${chapter.sceneType} / ${chapter.mainScene}`,
        `  Evidence: ${chapter.evidenceBeat}`,
        `  Villain: ${chapter.villainBeat}`,
        `  Heroine: ${chapter.heroineMove}`,
        `  Emotional: ${chapter.emotionalBeat}`,
        `  Power shift: ${chapter.powerShift}`,
        `  Ending hook: ${chapter.endingHook}`,
      ].join("\n");
    })
    .join("\n");

  return `

STORY PLANNER V1 — OUTLINE / EVIDENCE / VILLAIN CURVE BẮT BUỘC:
Planner goal: ${storyPlan.plannerGoal}

Evidence plan:
${evidencePlan}

Villain curve:
${villainCurve}

Payoff plan:
${payoffPlan}

Chapter plan:
${chapterPlan}

QUY TẮC THEO STORY PLANNER:
- Chapter Writer phải bám đúng mission của chương hiện tại theo số chương.
- Nếu target truyện ít hơn 12 chương, hãy nén payoff từ các chương cuối vào chương target cuối, nhưng vẫn giữ evidence/villain/payoff logic.
- Không được tự chuyển chapter plan về nhịp thủ tục pháp lý lặp lại.
- Mỗi chương phải có power shift thật theo chapter plan.
`.trim();
}

export function buildStorySeedPromptContext(
  storySeed?: FactoryStorySeed | null,
) {
  if (!storySeed) return "";

  const storySeedWithVisual = storySeed as FactoryStorySeed & {
    storyPlan?: FactoryStoryPlan;
    coverConcept?: FactoryCoverConcept;
  };
  const storyPlan = storySeedWithVisual.storyPlan;
  const storyPlanBlock = formatStoryPlanForPrompt(storyPlan);
  const coverConceptBlock = formatCoverConceptForPrompt(
    storySeedWithVisual.coverConcept,
  );

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

${storyPlanBlock}

${coverConceptBlock}

QUY TẮC BẮT BUỘC THEO STORY SEED:
- Tên truyện khi xuất ra phải giữ tinh thần của tên định hướng và bám vật chứng chính / bối cảnh cụ thể.
- Không tự đổi tên truyện sang kiểu trừu tượng chung chung như “Người Cuối Cùng Nhìn Thấy Sự Thật”, “Sự Thật...”, “Bí Mật...”, “...Không Nên Xuất Hiện”, “...Không Thuộc Về Tôi” nếu tên đó không chứa vật chứng cụ thể của seed.
- Công thức tên truyện ưu tiên: vật chứng chính + trạng thái bất thường / thời điểm sai / dấu vết bị cắt / nơi xuất hiện sai.
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
