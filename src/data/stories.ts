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
  content: string[]
  publishedAt: string
}

export type Story = {
  id: string
  slug: string
  title: string
  author?: string
  coverImage: string
  status: StoryStatus
  description: string
  genreSlugs: string[]
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
    updatedAt: iso("2026-04-29T08:00:00Z"),
    tags: ["HOT", "Full"],
    chapters: [
      {
        number: 1,
        slug: chapterSlug(1),
        title: "Gặp Lại Trong Mưa",
        publishedAt: iso("2026-04-20T12:00:00Z"),
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
        title: "Lời Hứa Dưới Mái Hiên",
        publishedAt: iso("2026-04-21T12:00:00Z"),
        content: [
          "Anh không hỏi vì sao cô quay lại. Anh chỉ mở cửa, mùi gỗ ẩm và trà nóng tràn ra như một lời mời im lặng.",
          "Cô nhìn đôi bàn tay dính mưa của mình, chợt nhớ những ngày xưa cũ: cũng là mưa, cũng là lời hứa, nhưng người nói đã biến mất không một lời.",
          "“Nếu em vào đây,” anh nói, “thì đừng tự làm mình lạc nữa.”",
        ],
      },
      {
        number: 3,
        slug: chapterSlug(3),
        title: "Đèn Dầu Và Bóng Người",
        publishedAt: iso("2026-04-22T12:00:00Z"),
        content: [
          "Ánh đèn dầu lay lắt, bóng người trên tường dài ra như một vết mực. Cô nghe tiếng gió huýt qua mái ngói, nghe tiếng tim mình gõ nhịp không đều.",
          "Ngôi nhà trên núi không có nhiều đồ đạc, chỉ có một tủ sách cũ, vài bức ảnh bạc màu và một chiếc chuông gió đã mất tiếng.",
          "Cô chạm vào khung ảnh, thấy tên mình viết ở góc sau—nét chữ giống hệt của cô, nhưng cô không nhớ đã từng viết.",
        ],
      },
      {
        number: 4,
        slug: chapterSlug(4),
        title: "Bí Mật Bị Chôn",
        publishedAt: iso("2026-04-23T12:00:00Z"),
        content: [
          "Những bí mật từ quá khứ dần hé lộ khi cô tìm thấy một bức thư cũ trong tủ sách.",
          "Lời hứa năm xưa được nhắc lại, kéo theo những cảm xúc dâng trào không thể kìm nén.",
          "Mưa vẫn rơi, nhưng lần này là mưa của sự giải thoát và hy vọng.",
        ],
      },
      {
        number: 5,
        slug: chapterSlug(5),
        title: "Ngày Mưa Cuối Cùng",
        publishedAt: iso("2026-04-24T12:00:00Z"),
        content: [
          "Ngày mưa cuối cùng trên ngọn núi, cô đứng nhìn xa xăm, lòng tràn đầy những ký ức và quyết định mới.",
          "Ánh sáng xuyên qua những tán cây, chiếu rọi con đường phía trước.",
          "Cô biết rằng hành trình của mình mới chỉ bắt đầu.",
        ],
      },
    ],
  },
  // Thêm 8-12 truyện mới fake data ở đây
  {
    id: "s-fantasy-forest",
    slug: "vuon-coi-huyen-bi",
    title: "Vườn Cõi Huyền Bí",
    author: "Linh Hương",
    coverImage:
      "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=1000&q=80",
    status: "ongoing",
    description:
      "Một khu vườn bí ẩn nơi các linh hồn và phép thuật giao thoa, mở ra những câu chuyện kỳ diệu và đầy bất ngờ.",
    genreSlugs: ["huyen-huyen", "linh-di", "co-dai"],
    updatedAt: iso("2026-04-28T10:00:00Z"),
    tags: ["New"],
    chapters: Array.from({ length: 8 }, (_, i) => ({
      number: i + 1,
      slug: chapterSlug(i + 1),
      title: `Chương ${i + 1}`,
      publishedAt: iso(`2026-04-${28 + i}T10:00:00Z`),
      content: [`Nội dung chương ${i + 1} của Vườn Cõi Huyền Bí.`],
    })),
  },
  {
    id: "s-modern-love",
    slug: "tinh-yeu-hien-dai",
    title: "Tình Yêu Hiện Đại",
    author: "Minh Anh",
    coverImage:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80",
    status: "ongoing",
    description:
      "Câu chuyện tình yêu giữa những con người hiện đại, với những thử thách và cảm xúc chân thật.",
    genreSlugs: ["hien-dai", "ngon-tinh"],
    updatedAt: iso("2026-04-27T09:00:00Z"),
    tags: ["New"],
    chapters: Array.from({ length: 7 }, (_, i) => ({
      number: i + 1,
      slug: chapterSlug(i + 1),
      title: `Chương ${i + 1}`,
      publishedAt: iso(`2026-04-${27 + i}T09:00:00Z`),
      content: [`Nội dung chương ${i + 1} của Tình Yêu Hiện Đại.`],
    })),
  },
  {
    id: "s-system-adventure",
    slug: "cuoc-phieu-luu-he-thong",
    title: "Cuộc Phiêu Lưu Hệ Thống",
    author: "Hải Nam",
    coverImage:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80",
    status: "ongoing",
    description:
      "Một cuộc phiêu lưu kỳ thú trong thế giới hệ thống với những thử thách không ngờ.",
    genreSlugs: ["he-thong", "huyen-huyen"],
    updatedAt: iso("2026-04-26T08:00:00Z"),
    tags: ["New"],
    chapters: Array.from({ length: 6 }, (_, i) => ({
      number: i + 1,
      slug: chapterSlug(i + 1),
      title: `Chương ${i + 1}`,
      publishedAt: iso(`2026-04-${26 + i}T08:00:00Z`),
      content: [`Nội dung chương ${i + 1} của Cuộc Phiêu Lưu Hệ Thống.`],
    })),
  },
  {
    id: "s-humor-tales",
    slug: "chuyen-cuoi-hai-huoc",
    title: "Chuyện Cười Hài Hước",
    author: "Văn Hòa",
    coverImage:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80",
    status: "completed",
    description:
      "Tuyển tập những câu chuyện cười hài hước, mang lại tiếng cười sảng khoái.",
    genreSlugs: ["hai-huoc"],
    updatedAt: iso("2026-04-25T07:00:00Z"),
    tags: ["Full"],
    chapters: Array.from({ length: 5 }, (_, i) => ({
      number: i + 1,
      slug: chapterSlug(i + 1),
      title: `Chương ${i + 1}`,
      publishedAt: iso(`2026-04-${25 + i}T07:00:00Z`),
      content: [`Nội dung chương ${i + 1} của Chuyện Cười Hài Hước.`],
    })),
  },
  {
    id: "s-mystery-night",
    slug: "dem-bi-an",
    title: "Đêm Bí Ẩn",
    author: "Lan Phương",
    coverImage:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80",
    status: "ongoing",
    description:
      "Những câu chuyện kỳ bí xảy ra trong đêm tối, khiến người ta không thể lý giải.",
    genreSlugs: ["linh-di", "huyen-huyen"],
    updatedAt: iso("2026-04-24T06:00:00Z"),
    tags: ["New"],
    chapters: Array.from({ length: 10 }, (_, i) => ({
      number: i + 1,
      slug: chapterSlug(i + 1),
      title: `Chương ${i + 1}`,
      publishedAt: iso(`2026-04-${24 + i}T06:00:00Z`),
      content: [`Nội dung chương ${i + 1} của Đêm Bí Ẩn.`],
    })),
  },
  {
    id: "s-rebirth-hero",
    slug: "anh-hung-trong-trong-sinh",
    title: "Anh Hùng Trong Trọng Sinh",
    author: "Minh Quân",
    coverImage:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80",
    status: "ongoing",
    description:
      "Hành trình của một anh hùng trong thế giới trọng sinh đầy thử thách và cơ hội.",
    genreSlugs: ["trong-sinh", "huyen-huyen"],
    updatedAt: iso("2026-04-23T05:00:00Z"),
    tags: ["New"],
    chapters: Array.from({ length: 7 }, (_, i) => ({
      number: i + 1,
      slug: chapterSlug(i + 1),
      title: `Chương ${i + 1}`,
      publishedAt: iso(`2026-04-${23 + i}T05:00:00Z`),
      content: [`Nội dung chương ${i + 1} của Anh Hùng Trong Trọng Sinh.`],
    })),
  },
  {
    id: "s-apocalypse-war",
    slug: "chien-tranh-mat-the",
    title: "Chiến Tranh Mạt Thế",
    author: "Hồng Sơn",
    coverImage:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80",
    status: "ongoing",
    description:
      "Cuộc chiến sinh tồn trong thế giới mạt thế đầy hỗn loạn và nguy hiểm.",
    genreSlugs: ["mat-the", "huyen-huyen"],
    updatedAt: iso("2026-04-22T04:00:00Z"),
    tags: ["New"],
    chapters: Array.from({ length: 6 }, (_, i) => ({
      number: i + 1,
      slug: chapterSlug(i + 1),
      title: `Chương ${i + 1}`,
      publishedAt: iso(`2026-04-${22 + i}T04:00:00Z`),
      content: [`Nội dung chương ${i + 1} của Chiến Tranh Mạt Thế.`],
    })),
  },
  {
    id: "s-ancient-love",
    slug: "tinh-yeu-co-dai",
    title: "Tình Yêu Cổ Đại",
    author: "Thảo My",
    coverImage:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80",
    status: "completed",
    description:
      "Câu chuyện tình yêu lãng mạn trong bối cảnh cổ đại đầy huyền bí.",
    genreSlugs: ["co-dai", "ngon-tinh"],
    updatedAt: iso("2026-04-21T03:00:00Z"),
    tags: ["Full"],
    chapters: Array.from({ length: 8 }, (_, i) => ({
      number: i + 1,
      slug: chapterSlug(i + 1),
      title: `Chương ${i + 1}`,
      publishedAt: iso(`2026-04-${21 + i}T03:00:00Z`),
      content: [`Nội dung chương ${i + 1} của Tình Yêu Cổ Đại.`],
    })),
  },
]