import type {
  AvoidLibrary,
  ExistingStory,
  FactoryGenreOption,
  FactoryHeroineOption,
  ParsedChapterOutput,
} from './aiFactoryTypes'

export const AI_FACTORY_STORAGE_KEY = 'storyPlatform.aiFactory.lastRun'

export const DEFAULT_FACTORY_GENRES: FactoryGenreOption[] = [
  {
    key: 'friend-betrayal-mistress',
    label: 'Bạn thân phản bội / tiểu tam',
    slug: 'ban-than-phan-boi-tieu-tam',
  },
  {
    key: 'family-secret-identity',
    label: 'Bí ẩn gia đình / thân thế',
    slug: 'bi-an-gia-dinh-than-the',
  },
  {
    key: 'business-face-slap',
    label: 'Công sở vả mặt / nữ cường thương chiến',
    slug: 'cong-so-va-mat-nu-cuong-thuong-chien',
  },
  {
    key: 'contract-marriage',
    label: 'Cưới trước yêu sau / hợp đồng hôn nhân',
    slug: 'cuoi-truoc-yeu-sau-hop-dong-hon-nhan',
  },
  {
    key: 'identity-swap-wealthy',
    label: 'Đổi tráo danh phận / hào môn',
    slug: 'doi-tra-danh-phan-hao-mon',
  },
  {
    key: 'in-law-family-fight',
    label: 'Gia đấu / mẹ chồng / nhà chồng',
    slug: 'gia-dau-me-chong-nha-chong',
  },
  {
    key: 'wealthy-family-marriage',
    label: 'Hào môn / liên hôn / gia tộc',
    slug: 'hao-mon-lien-hon-gia-toc',
  },
  {
    key: 'betrayal-divorce-regret',
    label: 'Hôn nhân phản bội / hủy hôn / chồng cũ hối hận',
    slug: 'hon-nhan-phan-boi-huy-hon-chong-cu-hoi-han',
  },
  {
    key: 'marriage-betrayal',
    label: 'Hôn nhân phản bội / ngoại tình',
    slug: 'hon-nhan-phan-boi-ngoai-tinh',
  },
  {
    key: 'hot-search-showbiz-pr',
    label: 'Hot search / showbiz / PR scandal',
    slug: 'hot-search-showbiz-pr-scandal',
  },
  {
    key: 'mother-child',
    label: 'Mẹ con / gia đình / bảo vệ con',
    slug: 'me-con-gia-dinh-bao-ve-con',
  },
  {
    key: 'rebirth-life-again',
    label: 'Nữ chính tái sinh / làm lại cuộc đời',
    slug: 'nu-chinh-tai-sinh-lam-lai-cuoc-doi',
  },
  {
    key: 'legal-heroine',
    label: 'Nữ cường pháp lý / luật sư',
    slug: 'nu-cuong-phap-ly-luat-su',
  },
  {
    key: 'ceo-abuse-regret',
    label: 'Tổng tài ngược luyến / hối hận',
    slug: 'tong-tai-nguoc-luyen-hoi-han',
  },
  {
    key: 'urban-revenge',
    label: 'Trả thù đô thị',
    slug: 'tra-thu-do-thi',
  },
]

export const DEFAULT_HEROINE_OPTIONS: FactoryHeroineOption[] = [
  {
    key: 'endure-then-counterattack',
    label: 'Nhẫn nhịn rồi phản công',
  },
  {
    key: 'cold-revenge',
    label: 'Lạnh lùng trả thù',
  },
  {
    key: 'soft-outside-hard-inside',
    label: 'Ngoài mềm trong cứng',
  },
  {
    key: 'legal-rational',
    label: 'Lý trí, giỏi pháp lý',
  },
  {
    key: 'business-queen',
    label: 'Nữ cường thương chiến',
  },
  {
    key: 'reborn-one-step-ahead',
    label: 'Tái sinh, đi trước một bước',
  },
  {
    key: 'protective-mother',
    label: 'Người mẹ bảo vệ con',
  },
  {
    key: 'wealthy-daughter',
    label: 'Thiên kim hào môn bị xem thường',
  },
  {
    key: 'silent-evidence',
    label: 'Im lặng gom bằng chứng',
  },
  {
    key: 'public-face-slap',
    label: 'Vả mặt công khai cực gắt',
  },
  {
    key: 'pain-to-control',
    label: 'Từ đau khổ thành kiểm soát thế cục',
  },
]

export function makeId(prefix = 'id') {
  const randomPart =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)

  return `${prefix}_${Date.now()}_${randomPart}`
}

export function getLogTime() {
  return new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export function clampNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

export function randomInt(min: number, max: number) {
  const safeMin = Math.ceil(min)
  const safeMax = Math.floor(max)
  return Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin
}

export function pickOne<T>(items: T[], fallback: T): T {
  if (!items.length) return fallback
  return items[Math.floor(Math.random() * items.length)]
}

export function slugifyVietnamese(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 90)
}

export function safeJsonStringify(value: unknown) {
  try {
    return JSON.stringify(value)
  } catch {
    return String(value ?? '')
  }
}

function uniqCompact(items: string[], max = 80) {
  return Array.from(
    new Set(
      items
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item) => item.length >= 2),
    ),
  ).slice(0, max)
}

export function buildAvoidLibrary(stories: ExistingStory[]): AvoidLibrary {
  const titles: string[] = []
  const motifs: string[] = []
  const characterNames: string[] = []
  const companyNames: string[] = []

  for (const story of stories) {
    if (story.title) titles.push(story.title)

    if (story.description) {
      motifs.push(story.description.slice(0, 220))
    }

    if (story.genres) {
      motifs.push(Array.isArray(story.genres) ? story.genres.join(', ') : String(story.genres))
    }

    const dnaText = safeJsonStringify(story.story_dna)
    const memoryText = safeJsonStringify(story.story_memory)

    if (dnaText && dnaText !== 'undefined') {
      motifs.push(dnaText.slice(0, 350))
    }

    if (memoryText && memoryText !== 'undefined') {
      motifs.push(memoryText.slice(0, 450))
    }

    const joined = `${dnaText}\n${memoryText}`

    const nameMatches = joined.match(
      /(?:nhân vật|character_names|Nhân vật chính|Phản diện)[^:：]*[:：]\s*([^.\n\r]{2,140})/gi,
    )

    if (nameMatches) {
      characterNames.push(...nameMatches.map((item) => item.replace(/^.*[:：]/, '')))
    }

    const companyMatches = joined.match(
      /(?:công ty|tập đoàn|gia tộc|company_names|tổ chức)[^:：]*[:：]\s*([^.\n\r]{2,160})/gi,
    )

    if (companyMatches) {
      companyNames.push(...companyMatches.map((item) => item.replace(/^.*[:：]/, '')))
    }
  }

  return {
    titles: uniqCompact(titles, 100),
    motifs: uniqCompact(motifs, 60),
    characterNames: uniqCompact(characterNames, 50),
    companyNames: uniqCompact(companyNames, 50),
  }
}

export function extractReaderOnly(output: string) {
  if (!output) return ''

  const readerStart = output.search(/#\s*BẢN ĐỌC CHO ĐỘC GIẢ/i)
  const technicalStart = output.search(/#\s*BẢN PHÂN TÍCH KỸ THUẬT/i)

  if (readerStart >= 0 && technicalStart > readerStart) {
    return output
      .slice(readerStart, technicalStart)
      .replace(/#\s*BẢN ĐỌC CHO ĐỘC GIẢ/i, '')
      .replace(/---\s*$/g, '')
      .trim()
  }

  if (readerStart >= 0) {
    return output
      .slice(readerStart)
      .replace(/#\s*BẢN ĐỌC CHO ĐỘC GIẢ/i, '')
      .trim()
  }

  return output.trim()
}

export function extractTechnicalReport(output: string) {
  if (!output) return ''

  const technicalStart = output.search(/#\s*BẢN PHÂN TÍCH KỸ THUẬT/i)
  if (technicalStart < 0) return ''

  return output.slice(technicalStart).trim()
}

export function getSuggestedStoryTitleFromPreview(output: string) {
  const patterns = [
    /Tên truyện đề xuất:\s*(.+)/i,
    /Tên truyện:\s*(.+)/i,
    /##\s*Tên truyện\s*\n+(.+)/i,
  ]

  for (const pattern of patterns) {
    const match = output.match(pattern)
    const value = match?.[1]?.trim()
    if (!value) continue

    const clean = value
      .replace(/^["“”'`]+|["“”'`]+$/g, '')
      .replace(/^[-•]\s*/, '')
      .trim()

    if (/^chương\s*\d+/i.test(clean)) continue
    if (clean.length < 4) continue

    return clean.slice(0, 90)
  }

  return ''
}

export function getSuggestedSlugFromPreview(output: string) {
  const match = output.match(/Slug gợi ý:\s*(.+)/i)
  const value = match?.[1]?.trim()
  if (!value) return ''
  return slugifyVietnamese(value)
}

export function getSuggestedDescriptionFromPreview(output: string, readerOnly: string) {
  const match = output.match(/Một câu mô tả ngắn:\s*(.+)/i)
  const value = match?.[1]?.trim()

  if (value && value.length >= 12) {
    return value.slice(0, 350)
  }

  return readerOnly
    .replace(/^#\s*Chương\s*\d+\s*[—-].*$/gim, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 320)
}

export function getChapterTitleFromReader(readerOnly: string, chapterNumber: number) {
  const match = readerOnly.match(/^#\s*(Chương\s*\d+\s*[—-]\s*.+)$/im)
  if (match?.[1]) return match[1].trim().slice(0, 120)

  const plainMatch = readerOnly.match(/Chương\s*\d+\s*[—-]\s*(.+)/i)
  if (plainMatch?.[0]) return plainMatch[0].trim().slice(0, 120)

  return `Chương ${chapterNumber}`
}

export function buildFallbackStoryTitle(genreLabel: string) {
  if (/đổi tráo|hào môn|gia tộc/i.test(genreLabel)) {
    return 'Bí Mật Trong Gia Phả'
  }

  if (/hôn nhân|ngoại tình|phản bội|hủy hôn|chồng cũ/i.test(genreLabel)) {
    return 'Sau Bức Ảnh Cuối Cùng'
  }

  if (/công sở|thương chiến|nữ cường/i.test(genreLabel)) {
    return 'Bản Hợp Đồng Bị Đánh Tráo'
  }

  if (/mẹ con|bảo vệ con|gia đình/i.test(genreLabel)) {
    return 'Đừng Động Vào Con Tôi'
  }

  if (/pháp lý|luật sư/i.test(genreLabel)) {
    return 'Lá Thư Luật Sư Cuối Cùng'
  }

  if (/tái sinh|làm lại cuộc đời/i.test(genreLabel)) {
    return 'Lần Này Tôi Không Còn Im Lặng'
  }

  if (/hot search|showbiz|scandal/i.test(genreLabel)) {
    return 'Sau Hot Search Đêm Đó'
  }

  return 'Bí Mật Sau Cánh Cửa Đóng'
}

export function parseChapterOutput(params: {
  output: string
  genreLabel: string
  chapterNumber: number
  runShortId: string
}): ParsedChapterOutput {
  const readerOnly = extractReaderOnly(params.output)
  const technicalReport = extractTechnicalReport(params.output)

  const parsedTitle = getSuggestedStoryTitleFromPreview(params.output)
  const storyTitle = parsedTitle || buildFallbackStoryTitle(params.genreLabel)

  const parsedSlug = getSuggestedSlugFromPreview(params.output)
  const storySlug = parsedSlug || `${slugifyVietnamese(storyTitle)}-${params.runShortId}`

  const storyDescription = getSuggestedDescriptionFromPreview(params.output, readerOnly)
  const chapterTitle = getChapterTitleFromReader(readerOnly, params.chapterNumber)
  const chapterSlug = `${slugifyVietnamese(chapterTitle)}-${params.chapterNumber}`

  return {
    raw: params.output,
    readerOnly,
    technicalReport,
    storyTitle,
    storySlug,
    storyDescription,
    chapterTitle,
    chapterSlug,
  }
}

export function validateChapterOutput(params: {
  output: string
  readerOnly: string
  chapterNumber: number
  storyTitle: string
}) {
  const errors: string[] = []

  if (!params.output.includes('BẢN ĐỌC CHO ĐỘC GIẢ')) {
    errors.push('Output thiếu phần BẢN ĐỌC CHO ĐỘC GIẢ.')
  }

  if (params.readerOnly.length < 800) {
    errors.push('Bản đọc quá ngắn, dưới 800 ký tự.')
  }

  if (!/Chương\s*\d+/i.test(params.readerOnly)) {
    errors.push('Không tìm thấy tiêu đề chương trong bản đọc.')
  }

  if (params.chapterNumber === 1) {
    if (!params.storyTitle || /^chương\s*\d+/i.test(params.storyTitle)) {
      errors.push('Tên truyện không hợp lệ hoặc bị lấy nhầm từ tiêu đề chương.')
    }
  }

  const forbiddenReaderLabels = [
    'GENRE LOCK',
    'HEROINE LOCK',
    'ENDING STRATEGY',
    'PREMISE DIVERSITY LOCK',
    'CHARACTER NAME DIVERSITY LOCK',
    'STORY PLAN',
    'PAYOFF SETUP TRACKER',
    'EVIDENCE PACING TRACKER',
    'CONFLICT ESCALATION LEDGER',
  ]

  for (const label of forbiddenReaderLabels) {
    if (params.readerOnly.toLowerCase().includes(label.toLowerCase())) {
      errors.push(`Bản đọc bị lọt nhãn kỹ thuật: ${label}.`)
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  }
}

export function buildFactoryPromptIdea(params: {
  genreLabel: string
  heroineLabel: string
  targetChapters: number
  avoidLibrary: AvoidLibrary
  premiseSeed: string
}) {
  const avoidTitles = params.avoidLibrary.titles.slice(0, 20).join(' | ')
  const avoidMotifs = params.avoidLibrary.motifs.slice(0, 12).join(' | ')
  const avoidNames = params.avoidLibrary.characterNames.slice(0, 20).join(' | ')
  const avoidCompanies = params.avoidLibrary.companyNames.slice(0, 15).join(' | ')

  return `
Yêu cầu Factory: tạo một truyện mới khác đáng kể với kho truyện đã có.

Seed truyện: ${params.premiseSeed}
Thể loại được chọn: ${params.genreLabel}
Kiểu nữ chính: ${params.heroineLabel}
Số chương mục tiêu toàn truyện: ${params.targetChapters}

Tránh lặp tên truyện đã có:
${avoidTitles || 'Chưa có dữ liệu.'}

Tránh lặp motif/premise/hook đã dùng:
${avoidMotifs || 'Chưa có dữ liệu.'}

Tránh lặp tên nhân vật:
${avoidNames || 'Chưa có dữ liệu.'}

Tránh lặp tên công ty/gia tộc:
${avoidCompanies || 'Chưa có dữ liệu.'}

Bắt buộc:
- Không lấy "Chương 1 — ..." làm tên truyện.
- Nếu là chương 1, phần kỹ thuật phải có:
  - Tên truyện đề xuất:
  - Slug gợi ý:
  - Một câu mô tả ngắn:
- Không mặc định mở bằng hot search nếu thể loại không cần.
- Không dùng lại các tên quá cũ như Lâm An Nhiên, Lục Thịnh, Lục Hạo, Lục phu nhân.
`.trim()
}

export function buildMockChapterOutput(params: {
  chapterNumber: number
  genreLabel: string
  heroineLabel: string
  runShortId: string
}) {
  const title = buildFallbackStoryTitle(params.genreLabel)
  const slug = `${slugifyVietnamese(title)}-${params.runShortId}`
  const chapterName =
    params.chapterNumber === 1
      ? 'Tờ Giấy Không Nên Xuất Hiện'
      : `Cánh Cửa Thứ ${params.chapterNumber}`

  const content = `
# BẢN ĐỌC CHO ĐỘC GIẢ

# Chương ${params.chapterNumber} — ${chapterName}

Tối đó, phòng khách biệt thự sáng đến mức không còn chỗ cho một lời nói dối nào trốn đi.

Tôi đứng trước bàn trà, nhìn bản giấy được đặt ngay ngắn giữa những tách trà còn bốc khói. Trên đó là chữ ký của tôi, nhưng nét cuối cùng bị kéo lệch một đoạn rất nhỏ. Người ngoài nhìn vào sẽ không phát hiện. Nhưng tôi thì biết. Tôi đã ký tên mình suốt hai mươi bảy năm, không thể không nhận ra một nét giả mạo.

“Cô còn muốn nhìn bao lâu?” người đàn ông ngồi ở ghế chính lạnh giọng. “Một chữ ký đổi lấy bình yên cho cả nhà. Cô nên biết điều.”

Tôi ngẩng đầu nhìn anh ta. Ánh đèn rơi xuống vai áo đen của anh, làm gương mặt vốn đã xa lạ càng thêm khó gần.

“Biết điều là im lặng nhận tội thay người khác à?”

Cả phòng lập tức yên xuống.

Người phụ nữ ngồi cạnh anh ta khẽ đỏ mắt. Cô ta cúi đầu, giọng mềm như sắp vỡ: “Em không muốn chị khó xử. Nhưng chuyện đã đến nước này, nếu chị cứ giữ dự án trong tay, hội đồng sẽ nghĩ nhà chúng ta đang bao che.”

Tôi bật cười rất khẽ.

Cô ta nói “nhà chúng ta” tự nhiên đến mức như thể tôi mới là người ngoài vừa bước nhầm vào đây.

Mẹ chồng đặt mạnh chén trà xuống bàn. “Cô cười cái gì? Một đứa được đưa về để giữ thể diện mà cũng dám tranh quyền? Nếu không nhờ nhà này, cô nghĩ cô có tư cách ngồi ở đây sao?”

Câu đó đánh thẳng vào danh phận của tôi.

Trước kia, tôi sẽ nhịn. Tôi sẽ nghĩ chỉ cần mình làm tốt hơn, một ngày nào đó họ sẽ nhìn thấy. Nhưng giờ tôi chỉ thấy nực cười. Người cố tình nhắm mắt thì dù tôi đốt cả căn phòng lên, họ cũng sẽ nói ánh sáng ấy làm họ khó chịu.

Tôi cầm bản giấy lên, lật đến trang cuối.

“Vậy nếu tôi không ký thì sao?”

Người đàn ông cuối cùng cũng đứng dậy. Anh ta đi đến trước mặt tôi, giọng thấp xuống: “Cô đừng ép tôi dùng cách khó coi hơn.”

Tôi nhìn thẳng vào mắt anh ta.

“Anh thử xem.”

Không ai ngờ tôi sẽ nói câu đó. Ngay cả cô gái đang khóc kia cũng quên mất phải rơi nước mắt tiếp.

Điện thoại trong túi tôi rung lên một tiếng.

Một tin nhắn từ số lạ hiện trên màn hình:

“Đừng ký. Bản scan gốc nằm trong máy chủ phụ. Người sửa chữ ký quên xóa log lúc 23:17.”

Tôi khép điện thoại lại.

Lần này, người cần sợ không phải tôi.

---

# BẢN PHÂN TÍCH KỸ THUẬT / KHÔNG ĐĂNG

=== THÔNG TIN TRUYỆN ĐỀ XUẤT ===
- Tên truyện đề xuất: ${title}
- Slug gợi ý: ${slug}
- Một câu mô tả ngắn: Một người phụ nữ bị ép nhận tội thay trong gia tộc hào môn, nhưng cô âm thầm nắm được dấu vết giả mạo có thể lật ngược toàn bộ bàn cờ.

=== KIỂM TRA TIẾN ĐỘ TRUYỆN ===
- Nhân vật chính: Nữ chính thuộc kiểu ${params.heroineLabel}
- Phản diện: Chồng/gia tộc/người thay thế lợi ích
- Tình huống: Ép ký giấy nhận trách nhiệm và cướp quyền dự án
- Mục tiêu chương: Cài bằng chứng giả chữ ký, tạo áp lực danh phận, mở hook log 23:17

=== BỘ NHỚ TRUYỆN ===
- Sự kiện đã xảy ra: Nữ chính bị ép ký văn bản bất lợi trong biệt thự.
- Bằng chứng đã hé: Chữ ký giả, log máy chủ phụ lúc 23:17.
- Nguồn gốc/lý do nữ chính có bằng chứng: Tin nhắn nặc danh từ người biết hệ thống.
- Quan hệ nhân vật: Gia tộc đang xem nữ chính như người ngoài.
- Tên công ty/gia tộc/tổ chức cần giữ nhất quán: Tập đoàn Cẩm Thành.
- Thứ chưa được tiết lộ: Ai gửi tin nhắn, ai sửa chữ ký, mục đích thật của văn bản.

=== THEO DÕI LEO THANG XUNG ĐỘT ===
- Áp lực dư luận: Chưa bung.
- Áp lực gia đình/công ty: Cao.
- Phản công của nữ chính: Từ chối ký, bắt đầu giữ bằng chứng.
- Hướng chương sau: Điều tra máy chủ phụ và người sửa log.
`.trim()

  return content
}