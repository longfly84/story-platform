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
      return 'Anime — Chinese commercial webnovel cover, glossy mature anime-inspired Chinese webnovel beauty, luxury urban drama color'
    case 'manga_manhwa':
      return 'Manga — Chinese commercial webnovel cover, polished manga/manhua-inspired line art, luxury full-color rendering'
    case 'popular_webnovel_collage':
      return 'Chinese manhua luxury collage, layered storytelling, 3 to 7 story fragments, glossy premium Chinese webnovel cover'
    case 'cinematic_realistic':
      return 'Siêu thực — ultra-realistic Chinese urban drama premium poster illustration, luxury cinematic realism'
    case 'auto':
    default:
      return 'premium Chinese commercial webnovel cover, automatically matched to story content'
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
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function slugifyFactoryStoryTitle(value: string) {
  const base = normalizeTitleForCompare(value).replace(/\s+/g, '-').replace(/^-+|-+$/g, '')
  return base || `factory-story-${Date.now()}`
}

function isBadParsedFactoryTitle(value: string) {
  const normalized = normalizeTitleForCompare(value)

  if (!normalized) return true

  return [
    'chua dat ten',
    'vat chung bi dat sai cho',
    'mon qua bi lo',
    'dau muc tren trang cu',
    'nguoi im lang o cuoi phong',
    'ma qr dan toi thu muc an',
    'dong ma tren ve su kien',
    'tin nhan gui nham vao nhom gia dinh',
    'vet but chi sau gio don tre',
  ].includes(normalized)
}

function chooseFactoryStoryTitle(params: {
  parsedTitle: string
  parsedSlug: string
  storySeed?: FactoryStorySeed | null
}) {
  const seedTitle = String(params.storySeed?.title || '').trim()
  const parsedTitle = String(params.parsedTitle || '').trim()

  if (seedTitle && isBadParsedFactoryTitle(parsedTitle) && !isBadParsedFactoryTitle(seedTitle)) {
    return {
      title: seedTitle,
      slug: slugifyFactoryStoryTitle(seedTitle),
      replaced: true,
    }
  }

  return {
    title: parsedTitle || seedTitle || 'Truyện Factory',
    slug: params.parsedSlug || slugifyFactoryStoryTitle(parsedTitle || seedTitle || 'Truyện Factory'),
    replaced: false,
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
    storySeed: params.storySeed,
  })

  if (chosenStoryTitle.replaced) {
    params.addLog(
      `Đổi title story từ "${params.parsed.storyTitle}" sang seed title "${chosenStoryTitle.title}" để tránh title fallback/generic.`,
      'warning',
    )
  }

  const publicDescription = buildFactoryPublicStoryDescription({
    parsed: {
      ...params.parsed,
      storyTitle: chosenStoryTitle.title,
      storySlug: chosenStoryTitle.slug,
    },
    genreLabel: params.genre.label,
    heroineLabel: params.heroine.label,
    storySeed: params.storySeed,
  })

  const fullPayload = {
    title: chosenStoryTitle.title,
    slug: chosenStoryTitle.slug,
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
        slug: chosenStoryTitle.slug,
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