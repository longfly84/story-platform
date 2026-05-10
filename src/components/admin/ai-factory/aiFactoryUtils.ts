import type {
  AvoidLibrary,
  ExistingStory,
  FactoryStorySeed,
  ParsedChapterOutput,
} from "./aiFactoryTypes";

import {
  buildFactoryDiversitySeed,
  buildFallbackStoryTitle,
} from "./prompts/factoryPromptShared";
import { buildStorySeedPromptContext } from "./prompts/factoryStorySeed";

export { DEFAULT_FACTORY_GENRES, DEFAULT_HEROINE_OPTIONS } from "./aiFactoryOptions";

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
