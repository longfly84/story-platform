export type Genre = {
  id: string
  name: string
  slug: string
}

export type StoryStatus = "ongoing" | "completed"

export type Chapter = {
  number: number
  slug: string
  title: string
  /** stable id for backend */
  id?: string
  content: string[]
  publishedAt: string
  /** alias for publishedAt when needed by backend */
  createdAt?: string
}

export type Story = {
  id: string
  slug: string
  title: string
  author?: string
  coverImage: string
  /** Estimated / fake view count for UI (optional) */
  views?: number
  status: StoryStatus
  description: string
  genreSlugs: string[]
  /** duplicate for backend readiness (array of genre slugs) */
  genres?: string[]
  updatedAt: string
  chapters: Chapter[]
  tags?: string[]
}

export const genres: Genre[] = [
  { id: "g-romance", name: "Ngôn Tình", slug: "ngon-tinh" },
  { id: "g-fantasy", name: "Huyền Huyễn", slug: "huyen-huyen" },
  { id: "g-xk", name: "Xuyên Không", slug: "xuyen-khong" },
  { id: "g-rebirth", name: "Trọng Sinh", slug: "trong-sinh" },
  { id: "g-ancient", name: "Cổ Đại", slug: "co-dai" },
  { id: "g-modern", name: "Hiện Đại", slug: "hien-dai" },
  { id: "g-mystery", name: "Linh Dị", slug: "linh-di" },
  { id: "g-humor", name: "Hài Hước", slug: "hai-huoc" },
  { id: "g-system", name: "Hệ Thống", slug: "he-thong" },
  { id: "g-apocalypse", name: "Mạt Thế", slug: "mat-the" },
]

const chapterSlug = (n: number) => `chuong-${n}`
const iso = (d: string) => new Date(d).toISOString()

export const stories: Story[] = [
  {
    id: "s-night-mountain",
    slug: "dem-toi-bi-ga-len-nui",
    title: "Đêm Tối Bị Gả Lên Núi",
    author: "Mặc Vũ",
    coverImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    status: "completed",
    description:
      "Một cô gái bị cuốn vào cuộc hôn nhân kỳ lạ nơi vùng núi xa xôi. Đêm mưa ấy, cô gặp lại người đàn ông từng xuất hiện trong ký ức, kéo theo những bí mật bị chôn vùi từ nhiều năm trước.",
    genreSlugs: ["ngon-tinh", "huyen-huyen", "co-dai"],
    genres: ["ngon-tinh", "huyen-huyen", "co-dai"],
    updatedAt: iso("2026-04-29T08:00:00Z"),
    tags: ["HOT", "Full"],
    views: 12456,
    chapters: [
      {
        number: 1,
        slug: chapterSlug(1),
        id: chapterSlug(1),
        title: "Gặp Lại Trong Mưa",
        publishedAt: iso("2026-04-20T12:00:00Z"),
        createdAt: iso("2026-04-20T12:00:00Z"),
        content: [
          "Mưa rơi lất phất trên con đường núi vắng vẻ. Ánh đèn xe yếu ớt chiếu qua làn sương mỏng, kéo dài thành một vệt sáng nhòe nhoẹt giữa màn đêm lạnh.",
          "Cô đứng dưới mái hiên cũ, hai tay ôm chặt chiếc túi nhỏ trước ngực. Tiếng bước chân từ phía sau vang lên chậm rãi, đều đặn, như thể người kia đã đứng đó từ rất lâu.",
          "“Em vẫn định trốn sao?” Giọng nói trầm thấp ấy khiến tim cô khẽ run lên. Bao nhiêu ký ức tưởng đã chôn sâu bỗng ùa về, rõ ràng đến mức khiến cô nghẹt thở.",
          "Đêm tối và mưa lạnh không đáng sợ bằng cảm giác bị gọi đúng cái tên mà cô đã cố quên. Nhưng lần này, cô không chạy nữa.",
        ],
      },
      {
        number: 2,
        slug: chapterSlug(2),
        id: chapterSlug(2),
        title: "Lời Hứa Dưới Mái Hiên",
        publishedAt: iso("2026-04-21T12:00:00Z"),
        createdAt: iso("2026-04-21T12:00:00Z"),
        content: [
          "Anh không hỏi vì sao cô quay lại. Anh chỉ mở cửa, mùi gỗ ẩm và trà nóng tràn ra như một lời mời im lặng.",
          "Cô nhìn đôi bàn tay dính mưa của mình, chợt nhớ những ngày xưa cũ: cũng là mưa, cũng là lời hứa, nhưng người nói đã biến mất không một lời.",
          "“Nếu em vào đây,” anh nói, “thì đừng tự làm mình lạc nữa.”",
        ],
      },
      {
        number: 3,
        slug: chapterSlug(3),
        id: chapterSlug(3),
        title: "Đèn Dầu Và Bóng Người",
        publishedAt: iso("2026-04-22T12:00:00Z"),
        createdAt: iso("2026-04-22T12:00:00Z"),
        content: [
          "Ánh đèn dầu lay lắt, bóng người trên tường dài ra như một vết mực. Cô nghe tiếng gió huýt qua mái ngói, nghe tiếng tim mình gõ nhịp không đều.",
          "Ngôi nhà trên núi không có nhiều đồ đạc, chỉ có một tủ sách cũ, vài bức ảnh bạc màu và một chiếc chuông gió đã mất tiếng.",
          "Cô chạm vào khung ảnh, thấy tên mình viết ở góc sau—nét chữ giống hệt của cô, nhưng cô không nhớ đã từng viết.",
        ],
      },
      {
        number: 4,
        slug: chapterSlug(4),
        id: chapterSlug(4),
        title: "Bí Mật Bị Chôn",
        publishedAt: iso("2026-04-23T12:00:00Z"),
        createdAt: iso("2026-04-23T12:00:00Z"),
        content: [
          "Trong căn phòng nhỏ, dưới sàn gỗ có một khe hở. Cô kéo lên, một hộp kim loại lạnh ngắt nằm im lìm.",
          "Bên trong là một chiếc nhẫn bạc và lá thư chưa mở. Ngày tháng trên bì thư là tám năm trước.",
          "Cô run tay. Đôi khi, quá khứ không quay lại để xin lỗi, mà để đòi một cái giá.",
        ],
      },
      {
        number: 5,
        slug: chapterSlug(5),
        id: chapterSlug(5),
        title: "Chân Dung Trong Sương",
        publishedAt: iso("2026-04-24T12:00:00Z"),
        createdAt: iso("2026-04-24T12:00:00Z"),
        content: [
          "Sáng sớm, sương phủ kín lối mòn. Cô thấy một bóng người đứng xa xa, dáng gầy, đội nón rộng vành.",
          "Khi cô gọi, người đó biến mất như chưa từng tồn tại. Chỉ còn một mùi hương thảo mộc lẫn với đất ẩm.",
          "Anh nhìn về phía rừng và nói nhỏ: “Núi này giữ lời của nó. Em phải cẩn thận.”",
        ],
      },
      {
        number: 6,
        slug: chapterSlug(6),
        id: chapterSlug(6),
        title: "Bước Qua Cửa",
        publishedAt: iso("2026-04-25T12:00:00Z"),
        createdAt: iso("2026-04-25T12:00:00Z"),
        content: [
          "Cô không tin vào lời nguyền, nhưng cô tin vào nỗi sợ của con người. Nỗi sợ có thể biến một ngọn núi thành nhà tù.",
          "Cánh cửa phía sau nhà dẫn xuống một cầu thang đá. Trên tay vịn, có vết trầy xước như móng tay cào.",
          "Cô bước xuống. Đằng sau lưng, cánh cửa khép lại mà không có ai chạm vào.",
        ],
      },
      {
        number: 7,
        slug: chapterSlug(7),
        id: chapterSlug(7),
        title: "Tiếng Chuông Gió",
        publishedAt: iso("2026-04-26T12:00:00Z"),
        createdAt: iso("2026-04-26T12:00:00Z"),
        content: [
          "Chiếc chuông gió im lặng bấy lâu bỗng ngân lên. Chỉ một tiếng thôi, nhưng đủ khiến anh tái mặt.",
          "Cô chạy ra hiên. Gió không mạnh. Không có lý do gì để chuông reo.",
          "“Có người đang gọi,” anh nói, mắt không rời bóng tối dưới tán cây.",
        ],
      },
      {
        number: 8,
        slug: chapterSlug(8),
        id: chapterSlug(8),
        title: "Người Lạ Trong Nhà",
        publishedAt: iso("2026-04-27T12:00:00Z"),
        createdAt: iso("2026-04-27T12:00:00Z"),
        content: [
          "Đêm đó, cô nghe tiếng bước chân trên gác. Chậm, rất chậm, như muốn kéo dài nỗi sợ.",
          "Cô mở cửa phòng. Hành lang tối thẫm. Ở cuối hành lang, một cánh cửa hé mở, ánh sáng xanh rỉ ra như sương.",
          "Trong khoảnh khắc, cô thấy một đôi mắt nhìn lại—không phải mắt người.",
        ],
      },
      {
        number: 9,
        slug: chapterSlug(9),
        id: chapterSlug(9),
        title: "Sợi Chỉ Định Mệnh",
        publishedAt: iso("2026-04-28T12:00:00Z"),
        createdAt: iso("2026-04-28T12:00:00Z"),
        content: [
          "Lá thư tám năm trước mở ra, chỉ có một câu: “Khi em quay lại, hãy đọc từ đầu.”",
          "Cô tìm cuốn sổ tay cũ trong tủ sách. Trang đầu tiên ghi tên cô và… tên anh.",
          "Những dòng chữ tiếp theo là ghi chép về các chương, như thể đời cô là một cuốn truyện đang được viết dở.",
        ],
      },
      {
        number: 10,
        slug: chapterSlug(10),
        id: chapterSlug(10),
        title: "Đổi Chỗ",
        publishedAt: iso("2026-04-29T12:00:00Z"),
        createdAt: iso("2026-04-29T12:00:00Z"),
        content: [
          "Cô nhận ra có những ký ức không thuộc về mình. Mỗi khi đèn dầu tắt, cô thấy một đời khác, một ngôi nhà khác, một cô dâu khác.",
          "Anh đứng giữa bếp, lưng quay lại, nói như xin lỗi: “Anh đã cố giữ em ngoài chuyện này.”",
          "Cô cười, nhưng mắt cay: “Không. Em đã ở trong từ lâu rồi.”",
        ],
      },
      {
        number: 11,
        slug: chapterSlug(11),
        id: chapterSlug(11),
        title: "Mở Hộp",
        publishedAt: iso("2026-04-30T03:00:00Z"),
        createdAt: iso("2026-04-30T03:00:00Z"),
        content: [
          "Hộp kim loại không chỉ có nhẫn và thư. Ở lớp đáy còn một chiếc chìa khóa nhỏ.",
          "Cô theo anh ra sau vườn, tới một tảng đá có khắc ký hiệu. Anh đặt chìa vào khe.",
          "Cánh cửa đá mở ra, mùi lạnh của lòng núi phả lên. Và rồi, tiếng thì thầm bắt đầu.",
        ],
      },
      {
        number: 12,
        slug: chapterSlug(12),
        id: chapterSlug(12),
        title: "Đêm Tối Trả Lời",
        publishedAt: iso("2026-04-30T04:00:00Z"),
        createdAt: iso("2026-04-30T04:00:00Z"),
        content: [
          "Bên trong lòng núi là một căn phòng tròn. Trên tường, những dòng chữ sáng lên như than hồng.",
          "Cô hiểu ra: ‘gả lên núi’ không phải là trò đùa. Nó là một giao kèo.",
          "Anh nắm tay cô, lần này chắc chắn: “Nếu phải trả giá, anh muốn trả cùng em.”",
          "Ngoài kia, mưa ngừng. Đêm tối không biến mất, nhưng cuối cùng cũng chịu nói thật.",
        ],
      },
    ],
  },
  {
    id: "s-frog-prince-ex",
    slug: "vo-cu-cua-hoang-tu-ech",
    title: "Vợ Cũ Của Hoàng Tử Ếch",
    author: "Lam Tử",
    coverImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80",
    status: "ongoing",
    description:
      "Khi một cuộc hôn nhân cổ tích kết thúc, câu chuyện thật mới bắt đầu. Cô trở về làng, mang theo một bí mật khiến cả vương quốc phải lật lại truyền thuyết.",
    genreSlugs: ["ngon-tinh", "hai-huoc", "hien-dai"],
    genres: ["ngon-tinh", "hai-huoc", "hien-dai"],
    updatedAt: iso("2026-04-30T02:00:00Z"),
    tags: ["HOT"],
    views: 8321,
    chapters: Array.from({ length: 8 }, (_, i) => {
      const n = i + 1
      return {
        number: n,
        slug: chapterSlug(n),
        id: chapterSlug(n),
        title: n === 1 ? "Hậu Cổ Tích" : `Khi Ếch Lên Tiếng (${n})`,
        publishedAt: iso(`2026-04-${String(18 + n).padStart(2, "0")}T12:00:00Z`),
        createdAt: iso(`2026-04-${String(18 + n).padStart(2, "0")}T12:00:00Z`),
        content: [
          "Có những câu chuyện được kể để ru ngủ người ta. Còn có những câu chuyện được kể để người ta tỉnh lại.",
          "Cô từng tin vào nụ hôn biến đổi số phận. Nhưng hóa ra, số phận chỉ đổi khi người ta dám nói sự thật.",
          "Và sự thật bắt đầu từ lần cô gỡ chiếc vương miện xuống, đặt nó lên bàn bếp như đặt một món nợ.",
        ],
      } satisfies Chapter
    }),
  },
  {
    id: "s-black-letter",
    slug: "canh-bao-cua-hac-tu",
    title: "Cảnh Báo Của Hắc Tử",
    author: "Hà Vũ",
    coverImage:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=80",
    status: "ongoing",
    description:
      "Một bức thư đen xuất hiện mỗi khi bi kịch sắp xảy ra. Lần này, lá thư đề tên cô. Và người đưa thư… chưa từng sống.",
    genreSlugs: ["linh-di", "huyen-huyen", "hien-dai"],
    genres: ["linh-di", "huyen-huyen", "hien-dai"],
    updatedAt: iso("2026-04-30T01:00:00Z"),
    tags: ["NEW"],
    views: 19342,
    chapters: Array.from({ length: 21 }, (_, i) => {
      const n = i + 1
      return {
        number: n,
        slug: chapterSlug(n),
        id: chapterSlug(n),
        title: `Bức Thư Số ${n}`,
        publishedAt: iso("2026-04-30T01:00:00Z"),
        createdAt: iso("2026-04-30T01:00:00Z"),
        content: [
          "Mùi mực như kim loại, lạnh và sắc. Con dấu đen không phản chiếu ánh đèn.",
          "Cô mở thư và thấy những dòng chữ như được viết từ bên trong mí mắt mình.",
          "‘Đừng đi qua cầu lúc 11:11.’ Lời cảnh báo ngắn, nhưng đủ để thay đổi cả đêm.",
        ],
      } satisfies Chapter
    }),
  },
]

export function getStoryBySlug(slug: string) {
  return stories.find((s) => s.slug === slug)
}

export function getChapterBySlug(story: Story, chapterSlug: string) {
  return story.chapters.find((c) => c.slug === chapterSlug || c.id === chapterSlug || String(c.number) === chapterSlug)
}

export function getFirstChapter(story: Story) {
  return story.chapters[0]
}

export function getLatestChapter(story: Story) {
  return story.chapters.at(-1)
}

export function getChapterByRouteParam(story: Story, chapterParam: string) {
  const bySlug = story.chapters.find((c) => c.slug === chapterParam)
  if (bySlug) return bySlug
  const n = Number(chapterParam)
  if (Number.isFinite(n)) return story.chapters.find((c) => c.number === n)
  return undefined
}

export function getGenreName(slug: string) {
  return genres.find((g) => g.slug === slug)?.name ?? slug
}

export function getHotStories(limit = 6) {
  return [...stories]
    .sort((a, b) => b.chapters.length - a.chapters.length)
    .slice(0, limit)
}

export function getLatestUpdatedStories(limit = 10) {
  return [...stories]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit)
}




