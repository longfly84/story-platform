import type {
  AIFactoryConfig,
  AvoidLibrary,
  CoverArtStyle,
  FactoryGenreOption,
  FactoryHeroineOption,
  FactoryLog,
  FactoryStorySeed,
  ParsedChapterOutput,
} from '../aiFactoryTypes'
import {
  buildMockChapterOutput,
  randomInt,
  sleep,
} from '../aiFactoryUtils'
import {
  base64ToBlob,
  buildPublicChapterSummary,
  dataUrlToBlob,
} from './factoryPanelHelpers'
import {
  updateStoryCover,
  uploadCoverToStorage,
} from './factoryCoverStorage'
import { buildFactoryPublicStoryDescription } from './factoryPublicDescription'

type AddLog = (message: string, type?: FactoryLog['type']) => void

function normalizeCoverArtStyle(value: unknown): CoverArtStyle {
  const raw = String(value || '').trim()

  if (
    raw === 'auto' ||
    raw === 'anime_cinematic' ||
    raw === 'manga_manhwa' ||
    raw === 'cinematic_realistic' ||
    raw === 'popular_webnovel_collage'
  ) {
    return raw
  }

  // Map key cũ còn lưu trong localStorage / config cũ sang key mới.
  if (raw === 'anime-cinematic') return 'anime_cinematic'
  if (raw === 'modern-manhwa') return 'manga_manhwa'
  if (raw === 'manga-drama') return 'manga_manhwa'
  if (raw === 'semi-realistic') return 'cinematic_realistic'
  if (raw === 'movie-poster') return 'popular_webnovel_collage'

  return 'auto'
}

function getCoverArtStyleLabel(style: AIFactoryConfig['coverArtStyle']) {
  switch (normalizeCoverArtStyle(style)) {
    case 'anime_cinematic':
      return 'anime cinematic webnovel cover, dramatic lighting, expressive characters, modern East Asian urban drama'
    case 'manga_manhwa':
      return 'manga manhwa webtoon cover style, clean line art, dramatic composition, emotional character acting'
    case 'cinematic_realistic':
      return 'cinematic realistic drama poster, premium film still lighting, modern East Asian urban suspense'
    case 'popular_webnovel_collage':
      return 'popular webnovel collage poster, multiple character composition, evidence object, dramatic layered story poster'
    case 'auto':
    default:
      return 'style automatically chosen from story content, premium modern East Asian webnovel cover'
  }
}

type SupabaseLike = {
  from: (table: string) => any
}

export async function generateFactoryChapter(params: {
  config: AIFactoryConfig
  provider: AIFactoryConfig['provider']
  modelKey: AIFactoryConfig['modelKey']
  storyTitle: string
  storyDescription: string
  genreLabel: string
  heroineLabel: string
  chapterNumber: number
  targetChapters: number
  isFinalChapter?: boolean
  recentChapters: Array<{
    chapter_number: number
    title: string
    content: string
    summary?: string
  }>
  storyMemory: string
  factoryPromptIdea: string
  runShortId: string
  storySeed?: FactoryStorySeed | null
}) {
  if (params.provider === 'mock') {
    await sleep(500)
    return buildMockChapterOutput({
      chapterNumber: params.chapterNumber,
      genreLabel: params.genreLabel,
      heroineLabel: params.heroineLabel,
      runShortId: params.runShortId,
    })
  }

  const finalChapterInstruction = params.isFinalChapter
    ? `
ĐÂY LÀ CHƯƠNG CUỐI CỦA TRUYỆN.

Yêu cầu bắt buộc:
- Đây là chương ${params.chapterNumber}/${params.targetChapters}, phải kết thúc toàn bộ truyện.
- Phải giải quyết xung đột chính.
- Phải trả giá/payoff các bí mật, bằng chứng, mâu thuẫn đã cài từ các chương trước.
- Phản diện phải nhận hậu quả rõ ràng.
- Nữ chính phải có kết cục rõ ràng.
- Không mở thêm tuyến truyện mới.
- Không tạo cliffhanger giả.
- Không kết bằng kiểu "mọi chuyện chỉ mới bắt đầu".
- Kết chương phải cho độc giả cảm giác truyện đã hoàn thành.
- Trong bản kỹ thuật ghi completion_status = full.
`
    : `
Đây chưa phải chương cuối.
Vị trí hiện tại: chương ${params.chapterNumber}/${params.targetChapters}.
Yêu cầu:
- Không kết thúc toàn bộ truyện quá sớm.
- Không cho phản diện sụp đổ hoàn toàn quá sớm.
- Vẫn phải giữ mạch để đọc tiếp chương sau.
- Trong bản kỹ thuật ghi completion_status = ongoing.
`

  const payload = {
    mode: 'chapter',
    provider: params.provider,
    modelKey: params.modelKey,
    moduleId: 'female-urban-viral',
    title: params.storyTitle,
    storySummary: params.storyDescription,
    promptIdea: [
      params.chapterNumber === 1 ? params.factoryPromptIdea : '',
      params.isFinalChapter ? finalChapterInstruction : '',
    ]
      .filter(Boolean)
      .join('\n\n'),
    genreLabel: params.genreLabel,
    mainCharacterStyleLabel: params.heroineLabel,
    chapterLengthLabel: `Tùy chỉnh — khoảng ${Number((params.config as any).chapterMinChars ?? 3500)}–${Number((params.config as any).chapterMaxChars ?? 4500)} ký tự`,
    chapterMinChars: Number((params.config as any).chapterMinChars ?? 3500),
    chapterMaxChars: Number((params.config as any).chapterMaxChars ?? 4500),
    cliffhangerLabel: params.config.cliffhangerLabel,
    humiliationLevel: randomInt(3, 5),
    revengeIntensity: randomInt(3, 5),
    nextChapterNumber: params.chapterNumber,
    targetChapters: params.targetChapters,
    isFinalChapter: Boolean(params.isFinalChapter),
    storySeed: params.storySeed ?? null,
    recentChapters: params.recentChapters,
    storyMemory: [params.storyMemory, finalChapterInstruction].filter(Boolean).join('\n\n---\n\n'),
  }

  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'OpenAI generate request failed')
  }

  const text = data?.text || data?.output_text || data?.content

  if (!text || typeof text !== 'string') {
    throw new Error('API không trả về text hợp lệ.')
  }

  return text
}


function normalizeTitleForCompare(value: string) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function slugifyFactoryStoryTitle(value: string) {
  const base = normalizeTitleForCompare(value).replace(/\s+/g, '-').replace(/^-+|-+$/g, '')
  return base || `factory-story-${Date.now()}`
}

function makeFactoryStorySlugUnique(baseSlug: string, factoryRunId: string, storyIndex: number) {
  const cleanBase = String(baseSlug || '').replace(/^-+|-+$/g, '').trim()
  const runPart = normalizeTitleForCompare(factoryRunId || '').replace(/\s+/g, '').slice(0, 8)
  const suffix = [runPart, `s${storyIndex}`].filter(Boolean).join('-')
  return [cleanBase || 'factory-story', suffix].filter(Boolean).join('-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')
}

function isBadFactoryStoryTitle(value: string) {
  const normalized = normalizeTitleForCompare(value)
  if (!normalized) return true

  return [
    'chua dat ten',
    'vat chung bi dat sai cho',
    'manh moi o hien truong',
    'mon qua bi lo',
    'dau muc tren trang cu',
    'ma qr dan toi thu muc an',
    'dong ma trong ho so cu',
    'dong ma tren ve su kien',
    'khung hinh bi cat khoi camera',
    'cuoc goi tu so may la',
    'tam ve mot chieu trong ngan keo',
    'truyen moi tu ai writer khong phu hop voi noi dung',
  ].includes(normalized)
}

function compactTitleTags(value: string) {
  return normalizeTitleForCompare(value)
    .split(/\s+/)
    .filter(
      (tag) =>
        tag.length >= 3 &&
        ![
          'mot',
          'mau',
          'dau',
          'noi',
          'ben',
          'sai',
          'dat',
          'cho',
          'trong',
          'tren',
          'duoi',
          'goc',
          'cu',
          'cua',
          'voi',
          'sau',
          'truoc',
          'khong',
          'phai',
          'co',
          'mot',
          'chi',
          'tiet',
          'lech',
        ].includes(tag),
    )
}

function getSeedEvidenceObject(storySeed?: FactoryStorySeed | null) {
  return String(
    storySeed?.evidenceObject ||
      storySeed?.motifFingerprint?.evidenceObject ||
      '',
  ).trim()
}

function titleMatchesSeedEvidence(title: string, storySeed?: FactoryStorySeed | null) {
  const evidence = getSeedEvidenceObject(storySeed)
  const titleTags = new Set(compactTitleTags(title))
  const evidenceTags = compactTitleTags(evidence)

  if (!evidenceTags.length || !titleTags.size) return false

  return evidenceTags.some((tag) => titleTags.has(tag))
}

function makeFactoryTitleFromEvidence(storySeed?: FactoryStorySeed | null) {
  const evidence = getSeedEvidenceObject(storySeed)
  const normalized = normalizeTitleForCompare(evidence)

  if ((normalized.includes('ve') || normalized.includes('phieu')) && (normalized.includes('an') || normalized.includes('so ghe') || normalized.includes('ghe'))) {
    return 'Vé Ăn Số Ghế Lệch'
  }

  if (normalized.includes('nhan chau') || normalized.includes('chau cay') || normalized.includes('chau hoa') || normalized.includes('tem kim loai')) {
    return 'Chậu Cây Bị Cắm Sai Nhãn'
  }

  if (normalized.includes('phieu') && normalized.includes('banh')) {
    return 'Phiếu Bánh Bị Xé Góc'
  }

  if (normalized.includes('nap chai') || normalized.includes('vet xuoc')) {
    return 'Nắp Chai Có Vết Xước'
  }

  if (normalized.includes('the giat')) {
    return 'Thẻ Giặt Còn Ghim'
  }

  if (normalized.includes('goc anh') || normalized.includes('anh cu') || normalized.includes('ruy bang')) {
    return 'Góc Ảnh Trên Dải Ruy-Băng'
  }

  if (normalized.includes('hat vong')) {
    return 'Hạt Vòng Sai Chỗ'
  }

  if (normalized.includes('vong tay')) {
    return 'Vòng Tay Sự Kiện Bị Đổi Màu'
  }

  if (normalized.includes('mieng dan')) {
    return 'Miếng Dán Bong Góc'
  }

  if (evidence) {
    const clean = evidence
      .replace(/^một\s+/i, '')
      .replace(/^một chiếc\s+/i, 'Chiếc ')
      .replace(/^một tấm\s+/i, 'Tấm ')
      .replace(/^một mẩu\s+/i, 'Mẩu ')
      .replace(/\s+không phải.*$/i, '')
      .replace(/\s+có một chi tiết.*$/i, '')
      .replace(/\s+bị đặt sai chỗ$/i, '')
      .trim()

    if (clean && clean.length <= 34) {
      return clean.charAt(0).toUpperCase() + clean.slice(1)
    }
  }

  return 'Chi Tiết Bị Đặt Sai'
}

function isAcceptableFactoryStoryTitle(title: string, storySeed?: FactoryStorySeed | null) {
  if (!title || isBadFactoryStoryTitle(title)) return false
  return titleMatchesSeedEvidence(title, storySeed)
}

function chooseFactoryStoryTitle(params: {
  parsedTitle: string
  parsedSlug: string
  parsedChapterTitle?: string
  storySeed?: FactoryStorySeed | null
}) {
  const seedTitle = String(params.storySeed?.title || '').trim()
  const parsedTitle = String(params.parsedTitle || '').trim()
  const parsedChapterTitle = String(params.parsedChapterTitle || '').trim()
  const evidenceTitle = makeFactoryTitleFromEvidence(params.storySeed)

  const candidates = [evidenceTitle, parsedChapterTitle, parsedTitle, seedTitle]
  const chosen =
    candidates.find((title) => isAcceptableFactoryStoryTitle(title, params.storySeed)) ||
    evidenceTitle ||
    'Chi Tiết Bị Đặt Sai'

  const original = seedTitle || parsedTitle || parsedChapterTitle
  const replaced = normalizeTitleForCompare(chosen) !== normalizeTitleForCompare(original)

  return {
    title: chosen,
    slug: slugifyFactoryStoryTitle(chosen),
    replaced,
    original,
    evidenceTitle,
    parsedTitle,
    parsedChapterTitle,
    seedTitle,
  }
}

function assertFactoryTitleGatePassed(title: string, storySeed?: FactoryStorySeed | null) {
  if (!isAcceptableFactoryStoryTitle(title, storySeed)) {
    const evidenceTitle = makeFactoryTitleFromEvidence(storySeed)
    throw new Error(
      `Factory title gate failed before insert. title="${title}", evidenceTitle="${evidenceTitle}", evidence="${getSeedEvidenceObject(storySeed)}"`,
    )
  }
}

export async function insertFactoryStoryDraft(params: {
  supabase: SupabaseLike
  avoidLibrary: AvoidLibrary
  addLog: AddLog
  parsed: ParsedChapterOutput
  genre: FactoryGenreOption
  heroine: FactoryHeroineOption
  config: AIFactoryConfig
  factoryRunId: string
  storyIndex: number
  targetChapters: number
  technicalReport: string
  premiseSeed: string
  nameSeed: string
  storySeed?: FactoryStorySeed | null
}) {
  const generatedChaptersNow = params.config.autoCompleteByTarget
    ? params.targetChapters
    : params.config.chaptersToGenerateNow

  const storyDna = {
    source: 'ai-factory',
    factory_run_id: params.factoryRunId,
    story_index: params.storyIndex,
    genre_key: params.genre.key,
    genre_label: params.genre.label,
    heroine_style_key: params.heroine.key,
    heroine_style_label: params.heroine.label,
    model_key: params.config.modelKey,
    module_id: 'female-urban-viral',
    target_chapters: params.targetChapters,
    factory_seed: params.storySeed ?? null,
    motifFingerprint: params.storySeed?.motifFingerprint ?? null,
    motifText: params.storySeed?.motifText ?? null,
    motifEmbedding: params.storySeed?.motifEmbedding ?? null,
    motifSimilarity: params.storySeed?.motifSimilarity ?? null,
    generated_chapters_now: generatedChaptersNow,
    auto_complete_by_target: params.config.autoCompleteByTarget,
    chapter_length_label: `Tùy chỉnh — khoảng ${Number((params.config as any).chapterMinChars ?? 3500)}–${Number((params.config as any).chapterMaxChars ?? 4500)} ký tự`,
    chapter_min_chars: Number((params.config as any).chapterMinChars ?? 3500),
    chapter_max_chars: Number((params.config as any).chapterMaxChars ?? 4500),
    cliffhanger_type_key: 'auto',
    humiliation_level: 'random_3_5',
    revenge_intensity: 'random_3_5',
    premise_seed: params.premiseSeed,
    name_seed: params.nameSeed,
    avoid_context_used: {
      titles_count: params.avoidLibrary.titles.length,
      motifs_count: params.avoidLibrary.motifs.length,
      character_names_count: params.avoidLibrary.characterNames.length,
      company_names_count: params.avoidLibrary.companyNames.length,
      motif_fingerprints_count: params.avoidLibrary.motifFingerprints?.length ?? 0,
      motif_texts_count: params.avoidLibrary.motifTexts?.length ?? 0,
    },
    character_names: [],
    company_names: [],
  }

  const chosenStoryTitle = chooseFactoryStoryTitle({
    parsedTitle: params.parsed.storyTitle,
    parsedSlug: params.parsed.storySlug,
    parsedChapterTitle: params.parsed.chapterTitle,
    storySeed: params.storySeed,
  })

  params.addLog(
    `Title gate final: "${chosenStoryTitle.title}" | seed="${chosenStoryTitle.seedTitle}" | parsed="${chosenStoryTitle.parsedTitle}" | chapter="${chosenStoryTitle.parsedChapterTitle}" | evidence="${chosenStoryTitle.evidenceTitle}"`,
    chosenStoryTitle.replaced ? 'warning' : 'info',
  )

  if (chosenStoryTitle.replaced) {
    params.addLog(
      `Title gate changed: "${chosenStoryTitle.original}" → "${chosenStoryTitle.title}"`,
      'warning',
    )
  }

  assertFactoryTitleGatePassed(chosenStoryTitle.title, params.storySeed)

  const finalStorySlug = makeFactoryStorySlugUnique(
    chosenStoryTitle.slug,
    params.factoryRunId,
    params.storyIndex,
  )

  if (finalStorySlug !== chosenStoryTitle.slug) {
    params.addLog(
      `Slug gate changed: "${chosenStoryTitle.slug}" → "${finalStorySlug}" để tránh trùng slug Supabase.`,
      'warning',
    )
  }

  const publicDescription = buildFactoryPublicStoryDescription({
    parsed: {
      ...params.parsed,
      storyTitle: chosenStoryTitle.title,
      storySlug: finalStorySlug,
    },
    genreLabel: params.genre.label,
    heroineLabel: params.heroine.label,
    storySeed: params.storySeed,
  })

  const fullPayload = {
    title: chosenStoryTitle.title,
    slug: finalStorySlug,
    description: publicDescription,
    author: 'Sưu Tầm',
    status: params.config.storyStatus,
    completion_status: 'ongoing',
    target_chapters: params.targetChapters,
    genres: [params.genre.slug],
    story_dna: storyDna,
    story_memory: params.technicalReport,
    current_arc: 'Factory draft — chapter 1 generated',
    emotion_tags: [params.genre.label, params.heroine.label],
  }

  let result = await params.supabase.from('stories').insert(fullPayload).select('id, title, slug').single()

  if (result.error) {
    params.addLog(`Insert story mở rộng lỗi, thử insert tối thiểu: ${result.error.message}`, 'warning')

    result = await params.supabase
      .from('stories')
      .insert({
        title: chosenStoryTitle.title,
        slug: finalStorySlug,
        description: publicDescription,
        author: 'Sưu Tầm',
        status: params.config.storyStatus,
        genres: [params.genre.slug],
      })
      .select('id, title, slug')
      .single()
  }

  if (result.error || !result.data?.id) {
    throw new Error(result.error?.message || 'Không insert được story draft.')
  }

  return result.data as { id: string; title: string; slug: string }
}

export async function insertFactoryChapterDraft(params: {
  supabase: SupabaseLike
  addLog: AddLog
  storyId: string
  parsed: ParsedChapterOutput
  chapterNumber: number
  status: 'draft'
}) {
  let result = await params.supabase
    .from('chapters')
    .insert({
      story_id: params.storyId,
      title: params.parsed.chapterTitle,
      slug: params.parsed.chapterSlug,
      content: params.parsed.readerOnly,
      summary: buildPublicChapterSummary(params.parsed.readerOnly),
      chapter_number: params.chapterNumber,
      status: params.status,
    })
    .select('id, title, chapter_number')
    .single()

  if (result.error) {
    params.addLog(`Insert chapter có status lỗi, thử bỏ status: ${result.error.message}`, 'warning')

    result = await params.supabase
      .from('chapters')
      .insert({
        story_id: params.storyId,
        title: params.parsed.chapterTitle,
        slug: params.parsed.chapterSlug,
        content: params.parsed.readerOnly,
        summary: buildPublicChapterSummary(params.parsed.readerOnly),
        chapter_number: params.chapterNumber,
      })
      .select('id, title, chapter_number')
      .single()
  }

  if (result.error || !result.data?.id) {
    throw new Error(result.error?.message || 'Không insert được chapter draft.')
  }

  return result.data as { id: string; title: string; chapter_number: number }
}

export async function generateAndAttachFactoryCover(params: {
  config: AIFactoryConfig
  storyId: string
  storyTitle: string
  storySlug: string
  storyDescription: string
  genreLabel: string
  heroineLabel: string
  storySeed?: FactoryStorySeed | null
}) {
  const normalizedCoverArtStyle = normalizeCoverArtStyle(params.config.coverArtStyle)

  const storyDna = params.storySeed
    ? {
        ...params.storySeed,
        factory_seed: params.storySeed,
        motifFingerprint: params.storySeed.motifFingerprint ?? null,
        motifText: params.storySeed.motifText ?? null,
        coverConcept: (params.storySeed as any).coverConcept ?? null,
      }
    : null

  const response = await fetch('/api/ai/generate-cover', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider: 'openai',
      modelKey: params.config.modelKey,
      title: params.storyTitle,
      storySummary: params.storyDescription,
      genreLabel: params.genreLabel,
      heroineLabel: params.heroineLabel,
      story_dna: storyDna,
      story: {
        id: params.storyId,
        title: params.storyTitle,
        slug: params.storySlug,
        summary: params.storyDescription,
        genreLabel: params.genreLabel,
        tags: [params.genreLabel, params.heroineLabel].filter(Boolean),
        story_dna: storyDna,
      },
      cover_art_style: normalizedCoverArtStyle,
      visual_style: normalizedCoverArtStyle,
      style: normalizedCoverArtStyle,
      styleLabel: getCoverArtStyleLabel(normalizedCoverArtStyle),
      aspectRatio: '2:3',
    }),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'Generate cover API failed.')
  }

  if (data?.publicUrl && typeof data.publicUrl === 'string') {
    await updateStoryCover({
      storyId: params.storyId,
      coverUrl: data.publicUrl,
    })
    return data.publicUrl as string
  }

  if (data?.imageUrl && typeof data.imageUrl === 'string') {
    await updateStoryCover({
      storyId: params.storyId,
      coverUrl: data.imageUrl,
    })
    return data.imageUrl as string
  }

  let imageBlob: Blob | null = null

  if (data?.b64_json && typeof data.b64_json === 'string') {
    imageBlob = base64ToBlob(data.b64_json, 'image/png')
  } else if (data?.dataUrl && typeof data.dataUrl === 'string') {
    imageBlob = dataUrlToBlob(data.dataUrl)
  }

  if (!imageBlob) {
    throw new Error('API cover không trả imageUrl/publicUrl/b64_json/dataUrl hợp lệ.')
  }

  const publicUrl = await uploadCoverToStorage({
    storyId: params.storyId,
    storySlug: params.storySlug,
    fileBlob: imageBlob,
  })

  await updateStoryCover({
    storyId: params.storyId,
    coverUrl: publicUrl,
  })

  return publicUrl
}