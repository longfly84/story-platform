import {
  buildFactoryDiversitySeed,
  buildFallbackStoryTitle,
  pickOne,
} from "./factoryPromptShared";

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
          `Cánh Cửa Thứ ${params.chapterNumber}`,
        );

  const hashText = (input: string) => {
    let hash = 0;
    for (let index = 0; index < input.length; index += 1) {
      hash = (hash * 31 + input.charCodeAt(index)) | 0;
    }
    return Math.abs(hash);
  };

  const pickVariant = <T,>(items: T[], salt: string) => {
    const hash = hashText(
      [
        params.runShortId,
        params.chapterNumber,
        storyTitle,
        diversitySeed.openingScene,
        diversitySeed.trigger,
        diversitySeed.evidenceObject,
        salt,
      ].join("|"),
    );

    return items[hash % items.length];
  };

  const openingVariants = [
    () =>
      `Ánh đèn ở ${diversitySeed.openingScene} sáng đến mức khiến tôi nhức mắt. Nhưng thứ làm tôi đứng chết lặng không phải ánh đèn, mà là ${diversitySeed.trigger} vừa xuất hiện trước mặt tôi.`,

    () =>
      `Tôi từng nghĩ mình đã quen với những lời nói dối. Cho đến khi bước vào ${diversitySeed.openingScene} và nhìn thấy ${diversitySeed.trigger}, tôi mới hiểu có những sự thật chỉ cần lộ ra một góc cũng đủ khiến cả đời người đổi hướng.`,

    () =>
      `Không khí trong ${diversitySeed.openingScene} vốn đã ngột ngạt. Nhưng khoảnh khắc ${diversitySeed.trigger} xuất hiện, mọi âm thanh xung quanh như bị ai bóp nghẹt lại.`,

    () =>
      `Tôi đến ${diversitySeed.openingScene} không phải để gây chuyện. Tôi chỉ muốn xác nhận một nghi ngờ. Vậy mà ${diversitySeed.trigger} đã biến nghi ngờ ấy thành vết dao cắm thẳng vào lòng tôi.`,

    () =>
      `Nếu có thể quay lại vài phút trước, có lẽ tôi vẫn sẽ bước vào ${diversitySeed.openingScene}. Bởi nếu không tận mắt nhìn thấy ${diversitySeed.trigger}, tôi sẽ còn tự lừa mình thêm rất lâu.`,
  ];

  const evidenceVariants = [
    () =>
      `Tôi đặt ${diversitySeed.evidenceObject} lên bàn. Nó nhỏ đến mức gần như vô hại, nhưng sắc mặt của những người trước mặt tôi lại thay đổi rất nhanh.`,

    () =>
      `${diversitySeed.evidenceObject} nằm trong tay tôi, lạnh và im lặng. Nhưng chính sự im lặng đó lại khiến căn phòng bắt đầu mất kiểm soát.`,

    () =>
      `Không ai ngờ tôi còn giữ ${diversitySeed.evidenceObject}. Càng không ai ngờ, thứ tưởng đã bị che giấu sạch sẽ ấy lại xuất hiện vào đúng thời điểm này.`,

    () =>
      `Tôi mở điện thoại, nhìn lại ${diversitySeed.evidenceObject} thêm một lần nữa. Từng chi tiết nhỏ trên đó giống như đang kéo những lời nói dối ra khỏi bóng tối.`,

    () =>
      `Thứ khiến tôi tỉnh táo không phải nước mắt, mà là ${diversitySeed.evidenceObject}. Nó nhắc tôi rằng nếu hôm nay tôi còn im lặng, ngày mai người bị chôn vùi sẽ là tôi.`,
  ];

  const pressureVariants = [
    () =>
      `Có người lập tức bảo tôi bình tĩnh. Có người nhìn tôi như thể tôi mới là kẻ phá hỏng mọi thứ. Nhưng càng nhìn những gương mặt ấy, tôi càng hiểu họ sợ sự thật hơn sợ tôi.`,

    () =>
      `Không ai mắng tôi quá nặng lời. Họ chỉ dùng ánh mắt, dùng im lặng, dùng cái cách người lớn vẫn hay gọi là “biết điều” để ép tôi tự nuốt ngược câu hỏi xuống.`,

    () =>
      `Tôi nghe thấy tiếng ai đó gọi tên mình bằng giọng cảnh cáo. Giọng điệu ấy quá quen. Trước đây, mỗi lần nghe nó, tôi đều lùi lại. Nhưng hôm nay thì không.`,

    () =>
      `Sự hoảng loạn thoáng qua rất nhanh trên mặt họ. Sau đó, tất cả lại khoác lên vẻ bình tĩnh giả tạo, như thể chỉ cần đủ đông người đứng về một phía thì sự thật sẽ tự biến mất.`,

    () =>
      `Điện thoại của vài người bắt đầu sáng lên. Tin nhắn được gửi đi liên tục. Tôi biết chỉ trong vài phút nữa, câu chuyện này sẽ bị bóp méo theo cách có lợi nhất cho họ.`,
  ];

  const confrontationVariants = [
    () =>
      `Tôi nhìn thẳng vào người trước mặt và hỏi: “Rốt cuộc các người còn định giấu tôi bao nhiêu chuyện nữa?”`,

    () =>
      `Tôi không hét. Tôi chỉ nói rất chậm: “Nếu hôm nay tôi không phát hiện ra, mọi người định để tôi ngu ngốc đến bao giờ?”`,

    () =>
      `Tôi đặt tay lên mép bàn, giữ cho giọng mình không run: “Nói đi. Ai là người đứng sau chuyện này?”`,

    () =>
      `Lần đầu tiên sau rất lâu, tôi không xin phép để được nói. Tôi chỉ nhìn họ và hỏi: “Các người nghĩ tôi sẽ tiếp tục im lặng sao?”`,

    () =>
      `Tôi cười nhạt. “Hay là để tôi đọc hết những gì tôi đang giữ, rồi chúng ta xem ai mới là người cần giải thích?”`,
  ];

  const decisionVariants = [
    () =>
      `Khoảnh khắc đó, tôi biết mình không thể quay lại làm người phụ nữ chỉ biết nhẫn nhịn nữa. Nếu họ đã muốn đẩy tôi vào góc tường, tôi sẽ để tất cả cùng nhìn thấy bức tường ấy được xây bằng những lời dối trá nào.`,

    () =>
      `Tôi từng nghĩ giữ thể diện cho người khác là giữ đường lui cho mình. Nhưng bây giờ tôi hiểu, có những kẻ chỉ xem sự tử tế của mình là giấy phép để tiếp tục làm tổn thương mình.`,

    () =>
      `Tôi cất ${diversitySeed.evidenceObject} đi, không phải để che giấu, mà để giữ lại cho thời điểm cần thiết hơn. Trận này tôi chưa cần thắng ngay. Tôi cần họ tự bước vào cái bẫy mà chính họ đã dựng.`,

    () =>
      `Tôi không còn muốn tranh cãi đúng sai trong căn phòng này nữa. Thứ tôi cần là bằng chứng, nhân chứng, và một thời điểm đủ công khai để không ai có thể giả vờ không biết.`,

    () =>
      `Từ giây phút ấy, tôi đổi cách chơi. Không khóc, không cầu xin, không giải thích thừa. Ai đã tạo ra vở kịch này, người đó phải tự đứng dưới ánh đèn mà kết thúc nó.`,
  ];

  const hookVariants = [
    () =>
      `Nhưng khi tôi vừa xoay người rời đi, một tin nhắn lạ hiện lên trên màn hình: “Đừng tin người vừa đứng về phía cô.”`,

    () =>
      `Tôi cứ nghĩ ${diversitySeed.evidenceObject} là đầu mối quan trọng nhất. Cho đến khi phía sau vang lên một câu rất khẽ: “Cô vẫn chưa biết thân phận thật của mình đâu.”`,

    () =>
      `Ngay lúc mọi người tưởng chuyện đã dừng lại, màn hình lớn trong phòng đột nhiên sáng lên. Một đoạn ghi âm tự động phát, và giọng nói đầu tiên trong đó khiến tôi lạnh sống lưng.`,

    () =>
      `Tôi chưa kịp bước ra khỏi ${diversitySeed.openingScene}, cửa đã bị khóa từ bên ngoài. Có người đang chờ tôi. Và người đó biết rõ tôi vừa phát hiện ra gì.`,

    () =>
      `Đêm đó, tôi nhận được một bức ảnh cũ. Trong ảnh có tôi, có mẹ tôi, và có người đàn ông mà cả nhà họ từng nói rằng tôi chưa bao giờ được gặp.`,
  ];

  const opening = pickVariant(openingVariants, "opening")();
  const evidence = pickVariant(evidenceVariants, "evidence")();
  const pressure = pickVariant(pressureVariants, "pressure")();
  const confrontation = pickVariant(confrontationVariants, "confrontation")();
  const decision = pickVariant(decisionVariants, "decision")();
  const hook = pickVariant(hookVariants, "hook")();

  const reader = `# Chương ${params.chapterNumber} — ${chapterTitle}

${opening}

Tôi đứng yên vài giây. Không phải vì không biết phản ứng thế nào, mà vì mọi mảnh ghép trong đầu đang tự động nối lại với nhau. Những cuộc gọi bị tắt vội. Những lần đổi mật khẩu. Những câu giải thích nghe thì hợp lý nhưng luôn thiếu một chi tiết cuối cùng.

${evidence}

Người đầu tiên lên tiếng không phải người tôi chờ đợi. Cũng chính điều đó khiến tôi chắc chắn mình đã chạm vào điểm yếu của họ. Nếu chuyện này không quan trọng, họ đã không vội vàng chen vào như vậy.

${pressure}

Tôi nhìn từng người một. Có gương mặt né tránh. Có gương mặt tức giận. Có gương mặt cố tỏ ra thương hại tôi. Nhưng sâu dưới tất cả những biểu cảm ấy, tôi chỉ thấy một thứ giống nhau: sợ hãi.

${confrontation}

Căn phòng im bặt.

Trong khoảnh khắc ấy, tôi bỗng nhớ đến chính mình của trước đây. Một người phụ nữ luôn tự hỏi có phải mình quá nhạy cảm không, có phải mình nên nhịn thêm không, có phải chỉ cần ngoan ngoãn hơn thì mọi thứ sẽ tốt hơn không.

Không.

Không có gì tốt hơn cả.

${decision}

Tôi quay đi trước khi nước mắt kịp rơi xuống. Không phải vì tôi yếu đuối, mà vì tôi không muốn bất kỳ ai trong căn phòng này có cơ hội dùng nước mắt của tôi làm bằng chứng rằng tôi đã thua.

${hook}`;

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
