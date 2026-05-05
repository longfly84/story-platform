import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import type {
  AIFactoryConfig,
  AvoidLibrary,
  ExistingStory,
  FactoryGenreOption,
  FactoryHeroineOption,
  FactoryJob,
  FactoryLog,
  FactoryRunSnapshot,
  FactoryStatus,
  FactoryStorySeed,
  ParsedChapterOutput,
} from './aiFactoryTypes'
import {
  AI_FACTORY_STORAGE_KEY,
  DEFAULT_FACTORY_GENRES,
  DEFAULT_HEROINE_OPTIONS,
  buildAvoidLibrary,
  buildFactoryPromptIdea,
  buildMockChapterOutput,
  buildMockStorySeed,
  clampNumber,
  getLogTime,
  makeId,
  parseChapterOutput,
  pickOne,
  randomInt,
  sleep,
  validateChapterOutput,
} from './aiFactoryUtils'

const defaultConfig: AIFactoryConfig = {
  provider: 'mock',
  modelKey: 'economy',
  storyCount: 1,
  batchSize: 5,
  chaptersToGenerateNow: 1,
  minTargetChapters: 10,
  maxTargetChapters: 20,
  delayMs: 2000,
  generateCover: false,
  autoCompleteByTarget: false,
  storyStatus: 'draft',
  chapterStatus: 'draft',
  chapterLengthLabel: 'Vừa — khoảng 1.800–2.300 ký tự',
  cliffhangerLabel: 'Mặc định — AI tự chọn theo mạch truyện',
}

type FactoryMode = 'create-new' | 'continue-existing'
type ContinueStatusFilter = 'draft' | 'published' | 'all'

type ExistingChapterRow = {
  id?: string
  story_id?: string
  title?: string
  slug?: string
  content?: string
  summary?: string
  chapter_number?: number | null
  created_at?: string
}

type IncompleteStory = ExistingStory & {
  slug?: string
  status?: string
  targetChapters: number
  currentChapters: number
  missingChapters: number
  nextChapterNumber: number
  chapters: ExistingChapterRow[]
}

function cx(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(' ')
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-sm font-medium text-slate-200">{children}</label>
}

function SmallHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs leading-relaxed text-slate-400">{children}</p>
}

function Section({
  title,
  desc,
  children,
}: {
  title: string
  desc?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950/80 p-4 shadow-lg shadow-black/20 sm:p-5">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {desc ? <p className="mt-1 text-sm text-slate-400">{desc}</p> : null}
      </div>
      {children}
    </section>
  )
}

function ToggleChip({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'rounded-full border px-2.5 py-1.5 text-left text-xs leading-tight transition sm:text-[13px]',
        active
          ? 'border-yellow-300 bg-yellow-300/10 text-yellow-200'
          : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:bg-white/[0.06]',
      )}
    >
      {children}
    </button>
  )
}

function base64ToBlob(base64: string, contentType = 'image/png') {
  const byteCharacters = atob(base64)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512)
    const byteNumbers = new Array(slice.length)

    for (let i = 0; i < slice.length; i += 1) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    byteArrays.push(new Uint8Array(byteNumbers))
  }

  return new Blob(byteArrays, { type: contentType })
}

function dataUrlToBlob(dataUrl: string) {
  const [meta, data] = dataUrl.split(',')
  const mimeMatch = meta.match(/data:(.*?);base64/)
  const mimeType = mimeMatch?.[1] || 'image/png'
  return base64ToBlob(data, mimeType)
}

function buildPublicChapterSummary(readerOnly: string) {
  return readerOnly
    .replace(/^#\s*Chương\s*\d+\s*[—-].*$/gim, '')
    .replace(/#\s*BẢN PHÂN TÍCH KỸ THUẬT[\s\S]*$/i, '')
    .replace(/BẢN PHÂN TÍCH KỸ THUẬT[\s\S]*$/i, '')
    .replace(/===\s*THÔNG TIN TRUYỆN ĐỀ XUẤT\s*===[\s\S]*$/i, '')
    .replace(/===\s*KIỂM TRA TIẾN ĐỘ TRUYỆN\s*===[\s\S]*$/i, '')
    .replace(/===\s*BỘ NHỚ TRUYỆN\s*===[\s\S]*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 350)
}

function safeJson(value: unknown) {
  try {
    return JSON.stringify(value ?? '')
  } catch {
    return String(value ?? '')
  }
}

function getStoryDnaValue(story: ExistingStory, key: string) {
  const dna = (story as any).story_dna

  if (dna && typeof dna === 'object' && !Array.isArray(dna)) {
    return (dna as Record<string, unknown>)[key]
  }

  if (typeof dna === 'string') {
    try {
      const parsed = JSON.parse(dna) as Record<string, unknown>
      return parsed[key]
    } catch {
      return undefined
    }
  }

  return undefined
}

function getTargetChapters(story: ExistingStory, fallback: number) {
  const directTarget = Number((story as any).target_chapters)

  if (Number.isFinite(directTarget) && directTarget > 0) {
    return directTarget
  }

  const rawTarget = getStoryDnaValue(story, 'target_chapters')
  const target = Number(rawTarget)

  if (Number.isFinite(target) && target > 0) return target

  return Math.max(1, fallback)
}

function getStoryGenreLabel(story: ExistingStory) {
  const dnaGenre = getStoryDnaValue(story, 'genre_label')
  if (typeof dnaGenre === 'string' && dnaGenre.trim()) return dnaGenre.trim()

  const genres = (story as any).genres
  if (Array.isArray(genres) && genres.length) return String(genres[0])
  if (typeof genres === 'string' && genres.trim()) return genres.trim()

  return 'Nữ tần đô thị viral'
}

function getStoryHeroineLabel(story: ExistingStory) {
  const dnaHeroine = getStoryDnaValue(story, 'heroine_style_label')
  if (typeof dnaHeroine === 'string' && dnaHeroine.trim()) return dnaHeroine.trim()

  return 'Nhẫn nhịn rồi phản công'
}

export default function AIFactoryPanel() {
  const stopRequestedRef = useRef(false)

  const [config, setConfig] = useState<AIFactoryConfig>(defaultConfig)
  const [selectedGenres, setSelectedGenres] = useState<FactoryGenreOption[]>(DEFAULT_FACTORY_GENRES)
  const [selectedHeroines, setSelectedHeroines] =
    useState<FactoryHeroineOption[]>(DEFAULT_HEROINE_OPTIONS)

  const [existingStories, setExistingStories] = useState<ExistingStory[]>([])
  const [avoidLibrary, setAvoidLibrary] = useState<AvoidLibrary>({
    titles: [],
    motifs: [],
    characterNames: [],
    companyNames: [],
  })

  const [jobs, setJobs] = useState<FactoryJob[]>([])
  const [logs, setLogs] = useState<FactoryLog[]>([])
  const [status, setStatus] = useState<FactoryStatus>('idle')
  const [currentAction, setCurrentAction] = useState('Chưa chạy')
  const [openaiConfirmed, setOpenaiConfirmed] = useState(false)
  const [factoryMode, setFactoryMode] = useState<FactoryMode>('create-new')
  const [continueStoryLimit, setContinueStoryLimit] = useState(5)
  const [continueChaptersPerStory, setContinueChaptersPerStory] = useState(3)
  const [continueStatusFilter, setContinueStatusFilter] = useState<ContinueStatusFilter>('draft')
  const [incompleteStories, setIncompleteStories] = useState<IncompleteStory[]>([])

  const isRunning = status === 'running'

  const safeBatchSize = Number.isFinite(config.batchSize) && config.batchSize > 0 ? config.batchSize : 5
  const averageTargetChapters = Math.round(
    (config.minTargetChapters + config.maxTargetChapters) / 2,
  )
  const createNewTextRequests = config.autoCompleteByTarget
    ? config.storyCount * averageTargetChapters
    : config.storyCount * config.chaptersToGenerateNow
  const totalTextRequests =
    factoryMode === 'create-new'
      ? createNewTextRequests
      : Math.max(1, continueStoryLimit) * Math.max(1, continueChaptersPerStory)
  const totalCoverRequests = factoryMode === 'create-new' && config.generateCover ? config.storyCount : 0
  const totalRequests = totalTextRequests + totalCoverRequests
  const totalBatches = Math.ceil(config.storyCount / safeBatchSize)

  const canStart =
    !isRunning &&
    (factoryMode === 'create-new'
      ? selectedGenres.length > 0 && selectedHeroines.length > 0
      : true) &&
    (config.provider === 'mock' || openaiConfirmed)

  const progressText = useMemo(() => {
    if (!jobs.length) return '0%'
    const done = jobs.filter((job) => ['success', 'failed', 'stopped'].includes(job.status)).length
    return `${Math.round((done / jobs.length) * 100)}%`
  }, [jobs])

  useEffect(() => {
    const raw = localStorage.getItem(AI_FACTORY_STORAGE_KEY)
    if (!raw) return

    try {
      const snapshot = JSON.parse(raw) as FactoryRunSnapshot
      if (snapshot.config) {
        setConfig({
          ...defaultConfig,
          ...snapshot.config,
          autoCompleteByTarget: Boolean((snapshot.config as any).autoCompleteByTarget),
        })
      }
      if (Array.isArray(snapshot.jobs)) setJobs(snapshot.jobs)
      if (Array.isArray(snapshot.logs)) setLogs(snapshot.logs)
      if (snapshot.status && snapshot.status !== 'running') setStatus(snapshot.status)
    } catch {
      // ignore broken localStorage
    }
  }, [])

  useEffect(() => {
    const snapshot: FactoryRunSnapshot = {
      config,
      jobs,
      logs,
      status,
      finishedAt: status === 'running' ? undefined : new Date().toISOString(),
    }

    localStorage.setItem(AI_FACTORY_STORAGE_KEY, JSON.stringify(snapshot))
  }, [config, jobs, logs, status])

  function addLog(message: string, type: FactoryLog['type'] = 'info') {
    setLogs((prev) => [
      {
        id: makeId('log'),
        time: getLogTime(),
        message,
        type,
      },
      ...prev,
    ])
  }

  function updateJob(jobId: string, patch: Partial<FactoryJob>) {
    setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, ...patch } : job)))
  }

  function updateConfig<K extends keyof AIFactoryConfig>(key: K, value: AIFactoryConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  async function uploadCoverToStorage(params: {
    storyId: string
    storySlug: string
    fileBlob: Blob
  }) {
    const filePath = `ai-factory/${params.storyId}/${Date.now()}-${params.storySlug}.png`

    const uploadResult = await supabase.storage
      .from('story-covers')
      .upload(filePath, params.fileBlob, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadResult.error) {
      throw new Error(`Upload cover lỗi: ${uploadResult.error.message}`)
    }

    const publicUrlResult = supabase.storage.from('story-covers').getPublicUrl(filePath)
    const publicUrl = publicUrlResult.data?.publicUrl

    if (!publicUrl) {
      throw new Error('Không lấy được public URL của cover.')
    }

    return publicUrl
  }

  async function updateStoryCover(params: {
    storyId: string
    coverUrl: string
  }) {
    const updateBoth = await supabase
      .from('stories')
      .update({
        cover_image: params.coverUrl,
        cover_url: params.coverUrl,
      })
      .eq('id', params.storyId)

    if (!updateBoth.error) return

    const updateCoverImage = await supabase
      .from('stories')
      .update({
        cover_image: params.coverUrl,
      })
      .eq('id', params.storyId)

    if (!updateCoverImage.error) return

    const updateCoverUrl = await supabase
      .from('stories')
      .update({
        cover_url: params.coverUrl,
      })
      .eq('id', params.storyId)

    if (!updateCoverUrl.error) return

    throw new Error(
      `Update story cover lỗi: ${updateBoth.error.message} | ${updateCoverImage.error.message} | ${updateCoverUrl.error.message}`,
    )
  }

  async function scanExistingStories() {
    setCurrentAction('Đang quét kho truyện...')
    addLog('Quét kho truyện gần nhất từ Supabase...')

    const extendedSelect =
      'id, title, description, genres, story_dna, story_memory, completion_status, target_chapters, created_at'

    let result: {
      data: ExistingStory[] | null
      error: { message: string } | null
    } = await supabase
      .from('stories')
      .select(extendedSelect)
      .order('created_at', { ascending: false })
      .limit(100)

    if (result.error) {
      addLog(`Select mở rộng lỗi, thử select tối thiểu: ${result.error.message}`, 'warning')

      const fallbackResult = await supabase
        .from('stories')
        .select('id, title, description, genres, created_at')
        .order('created_at', { ascending: false })
        .limit(100)

      result = {
        data: (fallbackResult.data ?? []) as ExistingStory[],
        error: fallbackResult.error,
      }
    }

    if (result.error) {
      addLog(`Không quét được kho truyện: ${result.error.message}`, 'error')
      setCurrentAction('Quét kho truyện thất bại')
      return {
        stories: [] as ExistingStory[],
        avoid: {
          titles: [],
          motifs: [],
          characterNames: [],
          companyNames: [],
        } satisfies AvoidLibrary,
      }
    }

    const stories = (result.data ?? []) as ExistingStory[]
    const avoid = buildAvoidLibrary(stories)

    setExistingStories(stories)
    setAvoidLibrary(avoid)

    addLog(
      `Đã quét ${stories.length} truyện. Gom ${avoid.titles.length} title, ${avoid.motifs.length} motif.`,
      'success',
    )

    setCurrentAction('Đã quét xong kho truyện')

    return { stories, avoid }
  }

  async function generateChapter(params: {
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
      chapterLengthLabel: config.chapterLengthLabel,
      cliffhangerLabel: config.cliffhangerLabel,
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

  async function insertStoryDraft(params: {
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
      generated_chapters_now: generatedChaptersNow,
      auto_complete_by_target: params.config.autoCompleteByTarget,
      chapter_length_label: params.config.chapterLengthLabel,
      cliffhanger_type_key: 'auto',
      humiliation_level: 'random_3_5',
      revenge_intensity: 'random_3_5',
      premise_seed: params.premiseSeed,
      name_seed: params.nameSeed,
      avoid_context_used: {
        titles_count: avoidLibrary.titles.length,
        motifs_count: avoidLibrary.motifs.length,
        character_names_count: avoidLibrary.characterNames.length,
        company_names_count: avoidLibrary.companyNames.length,
      },
      character_names: [],
      company_names: [],
    }

    const fullPayload = {
      title: params.parsed.storyTitle,
      slug: params.parsed.storySlug,
      description: params.parsed.storyDescription,
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

    let result = await supabase.from('stories').insert(fullPayload).select('id, title, slug').single()

    if (result.error) {
      addLog(`Insert story mở rộng lỗi, thử insert tối thiểu: ${result.error.message}`, 'warning')

      result = await supabase
        .from('stories')
        .insert({
          title: params.parsed.storyTitle,
          slug: params.parsed.storySlug,
          description: params.parsed.storyDescription,
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

  async function insertChapterDraft(params: {
    storyId: string
    parsed: ParsedChapterOutput
    chapterNumber: number
    status: 'draft'
  }) {
    let result = await supabase
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
      addLog(`Insert chapter có status lỗi, thử bỏ status: ${result.error.message}`, 'warning')

      result = await supabase
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

  async function generateAndAttachCover(params: {
    storyId: string
    storyTitle: string
    storySlug: string
    storyDescription: string
    genreLabel: string
    heroineLabel: string
  }) {
    const response = await fetch('/api/ai/generate-cover', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'openai',
        modelKey: config.modelKey,
        title: params.storyTitle,
        storySummary: params.storyDescription,
        genreLabel: params.genreLabel,
        heroineLabel: params.heroineLabel,
        styleLabel: 'semi-realistic asian romance manhua webnovel cover, no text',
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

  async function scanIncompleteStories() {
    setCurrentAction('Đang quét truyện dang dở...')
    addLog('Quét truyện chưa đủ số chương mục tiêu...')

    let query = supabase
      .from('stories')
      .select(
        'id, title, slug, description, status, completion_status, target_chapters, genres, story_dna, story_memory, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(100)

    if (continueStatusFilter !== 'all') {
      query = query.eq('status', continueStatusFilter)
    }

    const storiesResult = await query

    if (storiesResult.error) {
      addLog(`Không quét được truyện dang dở: ${storiesResult.error.message}`, 'error')
      setCurrentAction('Quét truyện dang dở thất bại')
      setIncompleteStories([])
      return [] as IncompleteStory[]
    }

    const storyRows = (storiesResult.data ?? []) as ExistingStory[]
    const incomplete: IncompleteStory[] = []

    for (const story of storyRows) {
      const storyId = (story as any).id
      if (!storyId) continue

      const chaptersResult = await supabase
        .from('chapters')
        .select('id, story_id, title, slug, content, summary, chapter_number, created_at')
        .eq('story_id', storyId)
        .order('chapter_number', { ascending: true })

      if (chaptersResult.error) {
        addLog(`Không đọc được chapters của ${story.title}: ${chaptersResult.error.message}`, 'warning')
        continue
      }

      const chapters = (chaptersResult.data ?? []) as ExistingChapterRow[]
      const targetChapters = getTargetChapters(story, config.maxTargetChapters)
      const currentChapters = chapters.length
      const maxChapterNumber = chapters.reduce((max, chapter, index) => {
        const chapterNumber = Number(chapter.chapter_number ?? index + 1)
        return Number.isFinite(chapterNumber) ? Math.max(max, chapterNumber) : max
      }, 0)
      const missingChapters = Math.max(0, targetChapters - currentChapters)

      if (missingChapters > 0) {
        incomplete.push({
          ...(story as any),
          targetChapters,
          currentChapters,
          missingChapters,
          nextChapterNumber: maxChapterNumber + 1,
          chapters,
        })
      }
    }

    setIncompleteStories(incomplete)
    setCurrentAction(`Đã quét ${incomplete.length} truyện dang dở`)
    addLog(`Tìm thấy ${incomplete.length} truyện chưa hoàn thành.`, incomplete.length ? 'success' : 'warning')

    return incomplete
  }

  async function continueExistingStories() {
    stopRequestedRef.current = false
    setStatus('running')
    setCurrentAction('Chuẩn bị viết tiếp truyện dang dở')
    setLogs([])

    addLog(
      `Factory sẽ viết tiếp tối đa ${continueStoryLimit} truyện, mỗi truyện thêm tối đa ${continueChaptersPerStory} chương.`,
      'info',
    )

    try {
      const scannedStories = await scanIncompleteStories()
      const candidates = scannedStories.slice(0, Math.max(1, continueStoryLimit))

      if (!candidates.length) {
        setStatus('success')
        setCurrentAction('Không có truyện dang dở cần viết tiếp')
        addLog('Không có truyện nào thiếu chương theo target.', 'warning')
        setJobs([])
        return
      }

      const initialJobs: FactoryJob[] = candidates.map((story, index) => ({
        id: makeId('job'),
        index: index + 1,
        title: story.title || 'Truyện chưa có tên',
        genreLabel: getStoryGenreLabel(story),
        genreSlug: Array.isArray((story as any).genres)
          ? String((story as any).genres[0] ?? '')
          : String((story as any).genres ?? ''),
        heroineLabel: getStoryHeroineLabel(story),
        status: 'pending',
        storyId: String((story as any).id),
        storySlug: String((story as any).slug || ''),
        chapterProgress: `${story.currentChapters}/${story.targetChapters}`,
        coverStatus: 'off',
        targetChapters: story.targetChapters,
        createdChapters: story.currentChapters,
        completionStatus: 'ongoing',
      }))

      setJobs(initialJobs)

      for (let storyIndex = 0; storyIndex < candidates.length; storyIndex += 1) {
        if (stopRequestedRef.current) {
          addLog('Đã nhận lệnh stop. Dừng trước truyện tiếp theo.', 'warning')
          break
        }

        const story = candidates[storyIndex]
        const job = initialJobs[storyIndex]
        const storyId = String((story as any).id)
        const storyTitle = story.title || 'Truyện chưa có tên'
        const genreLabel = getStoryGenreLabel(story)
        const heroineLabel = getStoryHeroineLabel(story)
        const chaptersToCreate = Math.min(
          Math.max(1, continueChaptersPerStory),
          story.missingChapters,
        )
        let storyMemory =
          typeof (story as any).story_memory === 'string'
            ? (story as any).story_memory
            : safeJson((story as any).story_memory)
        const recentChapters = story.chapters.slice(-5).map((chapter, index) => ({
          chapter_number: Number(chapter.chapter_number ?? story.nextChapterNumber - 5 + index),
          title: chapter.title || `Chương ${chapter.chapter_number ?? index + 1}`,
          content: chapter.content || '',
          summary: chapter.summary || '',
        }))
        let nextChapterNumber = story.nextChapterNumber

        updateJob(job.id, {
          status: 'running',
          chapterProgress: `${story.currentChapters}/${story.targetChapters}`,
        })

        addLog(
          `Viết tiếp ${storyTitle}: hiện có ${story.currentChapters}/${story.targetChapters}, tạo thêm ${chaptersToCreate} chương.`,
          'info',
        )

        try {
          for (let offset = 0; offset < chaptersToCreate; offset += 1) {
            if (stopRequestedRef.current) {
              updateJob(job.id, {
                status: 'stopped',
                chapterProgress: `${story.currentChapters + offset}/${story.targetChapters}`,
              })
              addLog(`Dừng sau request hiện tại tại truyện ${storyTitle}.`, 'warning')
              break
            }

            const isFinalChapter = nextChapterNumber >= story.targetChapters

            setCurrentAction(`${storyTitle}: generate chương ${nextChapterNumber}`)
            addLog(
              `${storyTitle}: generate chương ${nextChapterNumber}${isFinalChapter ? ' — chương cuối' : ''}...`,
            )

            let output = ''
            let parsed: ParsedChapterOutput | null = null
            let validationErrors: string[] = []

            for (let attempt = 1; attempt <= 2; attempt += 1) {
              output = await generateChapter({
                provider: config.provider,
                modelKey: config.modelKey,
                storyTitle,
                storyDescription: (story as any).description || '',
                genreLabel,
                heroineLabel,
                chapterNumber: nextChapterNumber,
                targetChapters: story.targetChapters,
                isFinalChapter,
                recentChapters,
                storyMemory,
                factoryPromptIdea: '',
                runShortId: `${storyId}-${nextChapterNumber}`,
              })

              parsed = parseChapterOutput({
                output,
                genreLabel,
                chapterNumber: nextChapterNumber,
                runShortId: `${storyId}-${nextChapterNumber}`,
              })

              const validation = validateChapterOutput({
                output,
                readerOnly: parsed.readerOnly,
                chapterNumber: nextChapterNumber,
                storyTitle,
              })

              if (validation.ok) {
                validationErrors = []
                break
              }

              validationErrors = validation.errors
              addLog(`Validate fail lần ${attempt}: ${validation.errors.join(' | ')}`, 'warning')
            }

            if (!parsed || validationErrors.length) {
              throw new Error(`Output không đạt validation: ${validationErrors.join(' | ')}`)
            }

            await insertChapterDraft({
              storyId,
              parsed,
              chapterNumber: nextChapterNumber,
              status: config.chapterStatus,
            })

            recentChapters.push({
              chapter_number: nextChapterNumber,
              title: parsed.chapterTitle,
              content: parsed.readerOnly,
              summary: buildPublicChapterSummary(parsed.readerOnly),
            })

            while (recentChapters.length > 5) recentChapters.shift()

            storyMemory = [storyMemory, parsed.technicalReport].filter(Boolean).join('\n\n---\n\n')

            await supabase
              .from('stories')
              .update({
                story_memory: storyMemory,
                current_arc: `Factory continue — chapter ${nextChapterNumber} generated`,
              })
              .eq('id', storyId)

            updateJob(job.id, {
              chapterProgress: `${story.currentChapters + offset + 1}/${story.targetChapters}`,
              createdChapters: story.currentChapters + offset + 1,
              targetChapters: story.targetChapters,
            })

            addLog(`Insert chương ${nextChapterNumber} thành công`, 'success')
            nextChapterNumber += 1

            if (offset < chaptersToCreate - 1 && config.delayMs > 0) {
              addLog(`Delay ${config.delayMs}ms trước request tiếp theo...`)
              await sleep(config.delayMs)
            }
          }

          if (!stopRequestedRef.current) {
            const finalChapterCount = Math.min(story.currentChapters + chaptersToCreate, story.targetChapters)
            const isStoryFull = finalChapterCount >= story.targetChapters

            await supabase
              .from('stories')
              .update({
                story_memory: storyMemory,
                current_arc: isStoryFull
                  ? `Factory continue — completed at chapter ${finalChapterCount}`
                  : `Factory continue — chapter ${finalChapterCount} generated`,
                completion_status: isStoryFull ? 'full' : 'ongoing',
                target_chapters: story.targetChapters,
              })
              .eq('id', storyId)

            updateJob(job.id, {
              status: 'success',
              chapterProgress: `${finalChapterCount}/${story.targetChapters}`,
              createdChapters: finalChapterCount,
              targetChapters: story.targetChapters,
              completionStatus: isStoryFull ? 'full' : 'ongoing',
            })

            addLog(
              isStoryFull
                ? `Xong viết tiếp ${storyTitle} — truyện đã Full.`
                : `Xong viết tiếp ${storyTitle}`,
              'success',
            )
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          updateJob(job.id, {
            status: 'failed',
            error: message,
          })
          addLog(`Viết tiếp ${storyTitle} lỗi: ${message}`, 'error')
        }
      }

      if (stopRequestedRef.current) {
        setStatus('stopped')
        setCurrentAction('Factory đã dừng theo yêu cầu')
        addLog('Factory đã dừng.', 'warning')
      } else {
        setStatus('success')
        setCurrentAction('Factory viết tiếp truyện xong')
        addLog('Factory viết tiếp truyện xong toàn bộ job.', 'success')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setStatus('failed')
      setCurrentAction('Factory viết tiếp lỗi')
      addLog(`Factory viết tiếp lỗi: ${message}`, 'error')
    }
  }

  async function startFactory() {
    if (!canStart) return

    if (factoryMode === 'continue-existing') {
      await continueExistingStories()
      return
    }

    stopRequestedRef.current = false
    setStatus('running')
    setCurrentAction('Chuẩn bị chạy Factory')
    setLogs([])

    const factoryRunId = makeId('factory')
    const totalBatchesForRun = Math.ceil(config.storyCount / Math.max(1, config.batchSize))

    addLog(
      `Factory sẽ tạo ${config.storyCount} truyện, chia thành ${totalBatchesForRun} batch, mỗi batch tối đa ${config.batchSize} truyện.`,
      'info',
    )

    if (config.autoCompleteByTarget) {
      addLog(
        `Đang bật full target mode: mỗi truyện sẽ random ${config.minTargetChapters}-${config.maxTargetChapters} chương và tạo đủ để kết truyện.`,
        'warning',
      )
    }

    const initialJobs: FactoryJob[] = Array.from({ length: config.storyCount }).map((_, index) => ({
      id: makeId('job'),
      index: index + 1,
      title: 'Chưa tạo',
      genreLabel: 'Chưa chọn',
      genreSlug: '',
      heroineLabel: 'Chưa chọn',
      status: 'pending',
      chapterProgress: config.autoCompleteByTarget
        ? `0/${config.minTargetChapters}-${config.maxTargetChapters}`
        : `0/${config.chaptersToGenerateNow}`,
      coverStatus: config.generateCover ? (config.provider === 'openai' ? 'pending' : 'skipped') : 'off',
      completionStatus: 'ongoing',
    }))

    setJobs(initialJobs)

    try {
      const scanResult = await scanExistingStories()
      let activeAvoidLibrary = scanResult.avoid

      for (let storyIndex = 1; storyIndex <= config.storyCount; storyIndex += 1) {
        const currentBatch = Math.ceil(storyIndex / Math.max(1, config.batchSize))
        const indexInBatch = ((storyIndex - 1) % Math.max(1, config.batchSize)) + 1

        if (indexInBatch === 1) {
          addLog(`Bắt đầu batch ${currentBatch}/${totalBatchesForRun}`, 'info')
        }

        if (stopRequestedRef.current) {
          addLog('Đã nhận lệnh stop. Dừng trước story tiếp theo.', 'warning')
          break
        }

        const job = initialJobs[storyIndex - 1]
        const genre = pickOne(selectedGenres, DEFAULT_FACTORY_GENRES[0])
        const heroine = pickOne(selectedHeroines, DEFAULT_HEROINE_OPTIONS[0])
        const targetChapters = randomInt(config.minTargetChapters, config.maxTargetChapters)
        const chaptersToCreate = config.autoCompleteByTarget
          ? targetChapters
          : config.chaptersToGenerateNow
        const runShortId = `${new Date().getMonth() + 1}${new Date().getDate()}${storyIndex}${Math.random()
          .toString(36)
          .slice(2, 5)}`
        const premiseSeed = makeId('premise')
        const nameSeed = makeId('name')
        const storySeed = buildMockStorySeed({
          genreLabel: genre.label,
          heroineLabel: heroine.label,
          avoidLibrary: activeAvoidLibrary,
          seed: `${factoryRunId}-${storyIndex}-${premiseSeed}`,
        })

        updateJob(job.id, {
          status: 'running',
          genreLabel: genre.label,
          genreSlug: genre.slug,
          heroineLabel: heroine.label,
          chapterProgress: `0/${chaptersToCreate}`,
          targetChapters,
          createdChapters: 0,
          completionStatus: 'ongoing',
        })

        addLog(
          `Batch ${currentBatch}/${totalBatchesForRun} — bắt đầu story ${storyIndex}/${config.storyCount}: ${genre.label}. Target: ${targetChapters} chương, tạo thật: ${chaptersToCreate} chương.`,
          'info',
        )
        
        addLog(`Story seed fingerprint: ${storySeed.shortFingerprint}`, 'info')
setCurrentAction(
          `Batch ${currentBatch}/${totalBatchesForRun} — đang tạo story ${storyIndex}/${config.storyCount}`,
        )

        let createdStory: { id: string; title: string; slug: string } | null = null
        let storyMemory = ''
        let createdChapterCount = 0
        const recentChapters: Array<{
          chapter_number: number
          title: string
          content: string
          summary?: string
        }> = []

        try {
          for (let chapterNumber = 1; chapterNumber <= chaptersToCreate; chapterNumber += 1) {
            if (stopRequestedRef.current) {
              updateJob(job.id, {
                status: 'stopped',
                chapterProgress: `${chapterNumber - 1}/${chaptersToCreate}`,
              })
              addLog(`Dừng sau request hiện tại tại story ${storyIndex}.`, 'warning')
              break
            }

            const isFinalChapter = config.autoCompleteByTarget && chapterNumber === chaptersToCreate

            setCurrentAction(`Story ${storyIndex}: generate chương ${chapterNumber}`)
            addLog(
              `Story ${storyIndex}: generate chương ${chapterNumber}${isFinalChapter ? ' — chương cuối' : ''}...`,
            )

            const factoryPromptIdea = buildFactoryPromptIdea({
              genreLabel: genre.label,
              heroineLabel: heroine.label,
              targetChapters,
              avoidLibrary: activeAvoidLibrary,
              premiseSeed,
              storySeed,
            })

            let output = ''
            let parsed: ParsedChapterOutput | null = null
            let validationErrors: string[] = []

            for (let attempt = 1; attempt <= 2; attempt += 1) {
              output = await generateChapter({
                provider: config.provider,
                modelKey: config.modelKey,
                storyTitle: createdStory?.title || '',
                storyDescription: '',
                genreLabel: genre.label,
                heroineLabel: heroine.label,
                chapterNumber,
                targetChapters,
                isFinalChapter,
                recentChapters,
                storyMemory,
                factoryPromptIdea,
                runShortId,
                storySeed,
              })

              parsed = parseChapterOutput({
                output,
                genreLabel: genre.label,
                chapterNumber,
                runShortId,
              })

              const validation = validateChapterOutput({
                output,
                readerOnly: parsed.readerOnly,
                chapterNumber,
                storyTitle: parsed.storyTitle,
              })

              if (validation.ok) {
                validationErrors = []
                break
              }

              validationErrors = validation.errors
              addLog(
                `Validate fail lần ${attempt}: ${validation.errors.join(' | ')}`,
                'warning',
              )

              if (attempt < 2) {
                addLog('Thử regenerate thêm 1 lần...', 'warning')
              }
            }

            if (!parsed || validationErrors.length) {
              throw new Error(`Output không đạt validation: ${validationErrors.join(' | ')}`)
            }

            if (chapterNumber === 1) {
              addLog(`Parse title: ${parsed.storyTitle}`, 'success')
              setCurrentAction(`Insert story draft: ${parsed.storyTitle}`)

              createdStory = await insertStoryDraft({
                parsed: {
                  ...parsed,
                  storyTitle: storySeed.title || parsed.storyTitle,
                  storyDescription: storySeed.corePremise || parsed.storyDescription,
                },
                genre,
                heroine,
                config,
                factoryRunId,
                storyIndex,
                targetChapters,
                technicalReport: parsed.technicalReport,
                premiseSeed,
                nameSeed,
                storySeed,
              })

              updateJob(job.id, {
                title: createdStory.title,
                storyId: createdStory.id,
                storySlug: createdStory.slug,
              })

              addLog(`Insert story draft thành công: ${createdStory.title}`, 'success')
            }

            if (!createdStory) {
              throw new Error('Không có storyId để insert chapter.')
            }

            setCurrentAction(`Insert chapter ${chapterNumber}`)
            await insertChapterDraft({
              storyId: createdStory.id,
              parsed,
              chapterNumber,
              status: config.chapterStatus,
            })

            recentChapters.push({
              chapter_number: chapterNumber,
              title: parsed.chapterTitle,
              content: parsed.readerOnly,
              summary: buildPublicChapterSummary(parsed.readerOnly),
            })

            storyMemory = [storyMemory, parsed.technicalReport].filter(Boolean).join('\n\n---\n\n')
            createdChapterCount = chapterNumber

            updateJob(job.id, {
              chapterProgress: `${chapterNumber}/${chaptersToCreate}`,
              createdChapters: chapterNumber,
              targetChapters,
              completionStatus:
                config.autoCompleteByTarget && chapterNumber >= chaptersToCreate ? 'full' : 'ongoing',
            })

            addLog(`Insert chapter ${chapterNumber} thành công`, 'success')

            if (chapterNumber < chaptersToCreate && config.delayMs > 0) {
              addLog(`Delay ${config.delayMs}ms trước request tiếp theo...`)
              await sleep(config.delayMs)
            }
          }

          if (createdStory) {
            const isStoryFull = config.autoCompleteByTarget && createdChapterCount >= targetChapters

            await supabase
              .from('stories')
              .update({
                story_memory: storyMemory,
                current_arc: isStoryFull
                  ? `Factory completed — full at chapter ${createdChapterCount}/${targetChapters}`
                  : `Factory draft — chapter ${createdChapterCount}/${targetChapters} generated`,
                completion_status: isStoryFull ? 'full' : 'ongoing',
                target_chapters: targetChapters,
              })
              .eq('id', createdStory.id)

            addLog(
              isStoryFull
                ? `Story ${storyIndex}: đã tạo đủ ${targetChapters}/${targetChapters} chương và đánh dấu Full.`
                : `Story ${storyIndex}: lưu trạng thái ongoing ${createdChapterCount}/${targetChapters}.`,
              isStoryFull ? 'success' : 'info',
            )
          }

          if (config.generateCover) {
            if (config.provider === 'mock') {
              updateJob(job.id, { coverStatus: 'skipped' })
              addLog('Mock mode: skip cover generation.', 'warning')
            } else if (createdStory) {
              try {
                updateJob(job.id, { coverStatus: 'pending' })
                setCurrentAction(`Story ${storyIndex}: generate cover`)
                addLog(`Story ${storyIndex}: generate cover...`)

                const coverUrl = await generateAndAttachCover({
                  storyId: createdStory.id,
                  storyTitle: createdStory.title,
                  storySlug: createdStory.slug,
                  storyDescription: recentChapters[0]?.content?.slice(0, 500) || '',
                  genreLabel: genre.label,
                  heroineLabel: heroine.label,
                })

                updateJob(job.id, {
                  coverStatus: 'success',
                  coverUrl,
                })

                addLog(`Generate cover thành công`, 'success')
              } catch (error) {
                const message = error instanceof Error ? error.message : String(error)

                updateJob(job.id, {
                  coverStatus: 'failed',
                  error: `Cover lỗi: ${message}`,
                })

                addLog(`Generate cover lỗi: ${message}`, 'error')
              }
            }
          }

          if (stopRequestedRef.current) {
            updateJob(job.id, { status: 'stopped' })
          } else {
            const isStoryFull = config.autoCompleteByTarget && createdChapterCount >= targetChapters

            updateJob(job.id, {
              status: 'success',
              chapterProgress: `${createdChapterCount}/${chaptersToCreate}`,
              createdChapters: createdChapterCount,
              targetChapters,
              completionStatus: isStoryFull ? 'full' : 'ongoing',
            })
            addLog(`Xong story ${storyIndex}/${config.storyCount}`, 'success')
          }

          activeAvoidLibrary = buildAvoidLibrary([
            {
              id: createdStory?.id || makeId('story'),
              title: createdStory?.title || '',
              description: recentChapters[0]?.content?.slice(0, 260) || '',
              genres: [genre.slug],
              story_memory: storyMemory,
              created_at: new Date().toISOString(),
            },
            ...scanResult.stories,
          ])

          if (storyIndex < config.storyCount && config.delayMs > 0) {
            const isEndOfBatch = storyIndex % Math.max(1, config.batchSize) === 0

            if (isEndOfBatch) {
              addLog(
                `Xong batch ${currentBatch}/${totalBatchesForRun}. Delay ${config.delayMs}ms trước batch tiếp theo...`,
                'info',
              )
            }

            await sleep(config.delayMs)
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)

          updateJob(job.id, {
            status: 'failed',
            error: message,
          })

          addLog(`Story ${storyIndex} lỗi: ${message}`, 'error')
        }
      }

      if (stopRequestedRef.current) {
        setStatus('stopped')
        setCurrentAction('Factory đã dừng theo yêu cầu')
        addLog('Factory đã dừng.', 'warning')
      } else {
        setStatus('success')
        setCurrentAction('Factory chạy xong')
        addLog('Factory chạy xong toàn bộ job.', 'success')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setStatus('failed')
      setCurrentAction('Factory lỗi')
      addLog(`Factory lỗi: ${message}`, 'error')
    }
  }

  function stopFactory() {
    stopRequestedRef.current = true
    addLog('Đã yêu cầu stop. Factory sẽ dừng sau request hiện tại.', 'warning')
    setCurrentAction('Đang chờ dừng sau request hiện tại')
  }

  function clearLog() {
    setLogs([])
    setJobs([])
    setStatus('idle')
    setCurrentAction('Đã clear log')
    localStorage.removeItem(AI_FACTORY_STORAGE_KEY)
  }

  function toggleGenre(item: FactoryGenreOption) {
    setSelectedGenres((prev) => {
      const exists = prev.some((genre) => genre.key === item.key)
      if (exists) return prev.filter((genre) => genre.key !== item.key)
      return [...prev, item]
    })
  }

  function toggleHeroine(item: FactoryHeroineOption) {
    setSelectedHeroines((prev) => {
      const exists = prev.some((heroine) => heroine.key === item.key)
      if (exists) return prev.filter((heroine) => heroine.key !== item.key)
      return [...prev, item]
    })
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-yellow-300">Admin AI Factory</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
            AI Writer Factory
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
            Tạo truyện/chương hàng loạt theo batch. MVP chạy tuần tự, lưu story/chapter
            dạng draft vào Supabase.
          </p>
        </div>

        <div className="rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-4 py-3 text-sm text-yellow-100">
          <div className="font-semibold">Trạng thái: {status}</div>
          <div className="text-yellow-100/80">Tiến độ: {progressText}</div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <Section title="Factory Config" desc="Cấu hình số truyện, số chương, provider và delay.">
            <div className="mb-4 rounded-xl border border-yellow-300/20 bg-yellow-300/10 p-3">
              <FieldLabel>Factory mode</FieldLabel>
              <select
                value={factoryMode}
                disabled={isRunning}
                onChange={(event) => setFactoryMode(event.target.value as FactoryMode)}
                className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
              >
                <option value="create-new">Tạo truyện mới</option>
                <option value="continue-existing">Viết tiếp truyện dang dở</option>
              </select>
              <SmallHint>
                Tạo truyện mới sẽ insert story mới. Viết tiếp truyện dang dở sẽ quét target_chapters trong story_dna hoặc cột target_chapters và tạo chương còn thiếu.
              </SmallHint>
            </div>

            {factoryMode === 'continue-existing' ? (
              <div className="mb-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <FieldLabel>Số truyện dang dở cần xử lý</FieldLabel>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    disabled={isRunning}
                    value={continueStoryLimit}
                    onChange={(event) => setContinueStoryLimit(clampNumber(Number(event.target.value), 1, 50))}
                    className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
                  />
                  <SmallHint>Factory sẽ lấy tối đa số truyện thiếu chương theo thứ tự mới nhất.</SmallHint>
                </div>

                <div>
                  <FieldLabel>Tạo thêm tối đa mỗi truyện</FieldLabel>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    disabled={isRunning}
                    value={continueChaptersPerStory}
                    onChange={(event) => setContinueChaptersPerStory(clampNumber(Number(event.target.value), 1, 25))}
                    className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
                  />
                  <SmallHint>Ví dụ truyện 1/15, nhập 3 sẽ tạo chương 2–4.</SmallHint>
                </div>

                <div>
                  <FieldLabel>Lọc trạng thái truyện</FieldLabel>
                  <select
                    value={continueStatusFilter}
                    disabled={isRunning}
                    onChange={(event) => setContinueStatusFilter(event.target.value as ContinueStatusFilter)}
                    className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="all">Tất cả</option>
                  </select>
                  <SmallHint>Nên để Draft để tránh tự thêm chương vào truyện đã public nếu chưa duyệt.</SmallHint>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Provider</FieldLabel>
                <select
                  value={config.provider}
                  disabled={isRunning}
                  onChange={(event) => {
                    updateConfig('provider', event.target.value as AIFactoryConfig['provider'])
                    setOpenaiConfirmed(false)
                  }}
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
                >
                  <option value="mock">Mock — không gửi API</option>
                  <option value="openai">OpenAI — gọi /api/ai/generate</option>
                </select>
              </div>

              <div>
                <FieldLabel>Model profile</FieldLabel>
                <select
                  value={config.modelKey}
                  disabled={isRunning}
                  onChange={(event) =>
                    updateConfig('modelKey', event.target.value as AIFactoryConfig['modelKey'])
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
                >
                  <option value="economy">Tiết kiệm — economy</option>
                  <option value="premium">Cao cấp — premium</option>
                  <option value="auto">Tự động — auto</option>
                </select>
              </div>

              <div>
                <FieldLabel>Tổng số truyện cần tạo</FieldLabel>
                <input
                  type="number"
                  min={1}
                  max={50}
                  disabled={isRunning}
                  value={config.storyCount}
                  onChange={(event) =>
                    updateConfig(
                      'storyCount',
                      clampNumber(Number(event.target.value), 1, 50),
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
                />
                <SmallHint>Tối đa 50 truyện/lần chạy. Factory sẽ tự chia batch và chạy tuần tự.</SmallHint>
              </div>

              <div>
                <FieldLabel>Số truyện mỗi batch</FieldLabel>
                <input
                  type="number"
                  min={1}
                  max={5}
                  disabled={isRunning}
                  value={config.batchSize}
                  onChange={(event) =>
                    updateConfig(
                      'batchSize',
                      clampNumber(Number(event.target.value), 1, 5),
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
                />
                <SmallHint>Mỗi batch nên để 3–5 truyện để dễ kiểm soát và tránh spam request.</SmallHint>
              </div>

              <div>
                <FieldLabel>Số chương tạo NGAY mỗi truyện</FieldLabel>
                <input
                  type="number"
                  min={1}
                  max={25}
                  disabled={isRunning || config.autoCompleteByTarget}
                  value={config.chaptersToGenerateNow}
                  onChange={(event) =>
                    updateConfig(
                      'chaptersToGenerateNow',
                      clampNumber(Number(event.target.value), 1, 25),
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300 disabled:opacity-50"
                />
                <SmallHint>
                  {config.autoCompleteByTarget
                    ? 'Đang bật mode full target random: ô này sẽ bị bỏ qua. Số chương thật sẽ lấy theo target random của từng truyện.'
                    : 'Đây là số chương tạo thật ngay mỗi truyện. Hai ô mục tiêu bên dưới chỉ là kế hoạch cho AI, không tự tạo thêm chương.'}
                </SmallHint>
              </div>

              <div>
                <FieldLabel>Số chương mục tiêu tối thiểu</FieldLabel>
                <input
                  type="number"
                  min={5}
                  max={50}
                  disabled={isRunning}
                  value={config.minTargetChapters}
                  onChange={(event) =>
                    updateConfig(
                      'minTargetChapters',
                      clampNumber(Number(event.target.value), 5, 50),
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
                />
                <SmallHint>
                  Khi bật full target mode, đây là số chương tối thiểu có thể tạo thật cho mỗi truyện.
                </SmallHint>
              </div>

              <div>
                <FieldLabel>Số chương mục tiêu tối đa</FieldLabel>
                <input
                  type="number"
                  min={5}
                  max={60}
                  disabled={isRunning}
                  value={config.maxTargetChapters}
                  onChange={(event) =>
                    updateConfig(
                      'maxTargetChapters',
                      clampNumber(Number(event.target.value), 5, 60),
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
                />
                <SmallHint>Factory sẽ random target trong khoảng này và lưu vào story_dna + cột target_chapters.</SmallHint>
              </div>

              <div>
                <FieldLabel>Delay giữa request</FieldLabel>
                <input
                  type="number"
                  min={0}
                  max={10000}
                  step={500}
                  disabled={isRunning}
                  value={config.delayMs}
                  onChange={(event) =>
                    updateConfig('delayMs', clampNumber(Number(event.target.value), 0, 10000))
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
                />
                <SmallHint>Đơn vị ms. 2000ms = 2 giây.</SmallHint>
              </div>

              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 sm:col-span-2">
                <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    disabled={isRunning}
                    checked={config.autoCompleteByTarget}
                    onChange={(event) => updateConfig('autoCompleteByTarget', event.target.checked)}
                    className="mt-1 h-4 w-4 accent-emerald-300"
                  />

                  <span>
                    <span className="block font-bold text-emerald-200">
                      Tạo full truyện theo target random
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                      Khi bật, mỗi truyện sẽ random số chương trong khoảng tối thiểu/tối đa.
                      Ví dụ random 15 thì Factory sẽ tạo đủ 15 chương, chương cuối kết truyện
                      và lưu completion_status = full.
                    </span>
                  </span>
                </label>
              </div>

              <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    disabled={isRunning}
                    checked={config.generateCover}
                    onChange={(event) => updateConfig('generateCover', event.target.checked)}
                    className="h-4 w-4 accent-yellow-300"
                  />
                  Generate cover
                </label>
                <span className="ml-2 text-xs text-slate-500">
                  Mock sẽ skip, OpenAI sẽ tạo ảnh thật + upload public
                </span>
              </div>
            </div>
          </Section>

          <Section title="Genre Pool" desc="Factory sẽ random mỗi truyện một thể loại trong pool.">
            <div className="max-h-44 overflow-auto rounded-xl border border-white/10 bg-black/20 p-2">
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_FACTORY_GENRES.map((genre) => (
                  <ToggleChip
                    key={genre.key}
                    active={selectedGenres.some((item) => item.key === genre.key)}
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre.label}
                  </ToggleChip>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Đang chọn {selectedGenres.length}/{DEFAULT_FACTORY_GENRES.length} thể loại.
            </p>
          </Section>

          <Section title="Heroine Pool" desc="Factory sẽ random kiểu nữ chính để tránh truyện bị trùng vibe.">
            <div className="max-h-36 overflow-auto rounded-xl border border-white/10 bg-black/20 p-2">
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_HEROINE_OPTIONS.map((heroine) => (
                  <ToggleChip
                    key={heroine.key}
                    active={selectedHeroines.some((item) => item.key === heroine.key)}
                    onClick={() => toggleHeroine(heroine)}
                  >
                    {heroine.label}
                  </ToggleChip>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Đang chọn {selectedHeroines.length}/{DEFAULT_HEROINE_OPTIONS.length} kiểu nữ chính.
            </p>
          </Section>

          <Section title="Existing Library Scan" desc="Quét truyện gần nhất để build avoid context chống trùng.">
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-2xl font-black text-white">{existingStories.length}</div>
                <div className="text-xs text-slate-400">truyện đã quét</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-2xl font-black text-white">{avoidLibrary.titles.length}</div>
                <div className="text-xs text-slate-400">title cần tránh</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-2xl font-black text-white">{avoidLibrary.motifs.length}</div>
                <div className="text-xs text-slate-400">motif/premise</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-2xl font-black text-white">
                  {avoidLibrary.characterNames.length + avoidLibrary.companyNames.length}
                </div>
                <div className="text-xs text-slate-400">tên/công ty</div>
              </div>
            </div>

            <button
              type="button"
              disabled={isRunning}
              onClick={scanExistingStories}
              className="mt-4 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white transition hover:border-yellow-300/60 hover:bg-yellow-300/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Quét lại kho truyện
            </button>
          </Section>

          <Section title="Continue Existing Stories" desc="Quét truyện chưa đủ target_chapters để viết tiếp chương còn thiếu.">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={isRunning}
                onClick={scanIncompleteStories}
                className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white transition hover:border-yellow-300/60 hover:bg-yellow-300/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Scan truyện dang dở
              </button>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300">
                Đã tìm thấy: <span className="font-bold text-white">{incompleteStories.length}</span> truyện
              </div>
            </div>

            <div className="mt-4 max-h-64 space-y-2 overflow-auto rounded-xl border border-white/10 bg-black/20 p-2">
              {incompleteStories.length ? (
                incompleteStories.slice(0, 20).map((story) => (
                  <div
                    key={(story as any).id || story.slug || story.title}
                    className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                  >
                    <div className="text-sm font-bold text-white">{story.title}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      {story.currentChapters}/{story.targetChapters} chương • thiếu {story.missingChapters} • chương tiếp theo {story.nextChapterNumber}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500">Chưa scan hoặc không có truyện dang dở.</div>
              )}
            </div>
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="API Cost Guard" desc="Chống bấm nhầm khi dùng OpenAI thật.">
            {config.provider === 'openai' ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
                  <div className="font-bold">SẼ GỌI OPENAI API</div>
                  <div>Mode: {factoryMode === 'continue-existing' ? 'Viết tiếp truyện dang dở' : 'Tạo truyện mới'}</div>
                  <div className="mt-2 grid gap-1 text-red-100/90">
                    <div>Tổng số truyện: {factoryMode === 'create-new' ? config.storyCount : continueStoryLimit}</div>
                    <div>Số truyện mỗi batch: {factoryMode === 'create-new' ? config.batchSize : continueStoryLimit}</div>
                    <div>Tổng batch dự kiến: {totalBatches}</div>
                    <div>
                      Mode chương:{' '}
                      {factoryMode === 'create-new' && config.autoCompleteByTarget
                        ? `Full random target ${config.minTargetChapters}-${config.maxTargetChapters} chương/truyện`
                        : factoryMode === 'create-new'
                          ? `${config.chaptersToGenerateNow} chương tạo ngay/truyện`
                          : `Viết tiếp tối đa ${continueChaptersPerStory} chương/truyện`}
                    </div>
                    <div>Số chương thật sự sẽ tạo: {totalTextRequests}</div>
                    <div>Text request: {totalTextRequests}</div>
                    <div>Cover request: {totalCoverRequests}</div>
                    <div>Tổng request dự kiến: {totalRequests}</div>
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={openaiConfirmed}
                    disabled={isRunning}
                    onChange={(event) => setOpenaiConfirmed(event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-yellow-300"
                  />
                  <span>Tao xác nhận Factory sẽ gọi OpenAI API và có thể tốn phí.</span>
                </label>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                Mock mode — không gửi OpenAI API. Vẫn insert story/chapter draft vào Supabase để test flow.
                {factoryMode === 'create-new' && config.autoCompleteByTarget ? (
                  <div className="mt-2 text-emerald-100/90">
                    Đang bật full target mode: mock cũng sẽ tạo đủ số chương target và đánh dấu Full để test flow.
                  </div>
                ) : null}
              </div>
            )}
          </Section>

          <Section title="Control">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!canStart}
                onClick={startFactory}
                className="rounded-xl bg-yellow-300 px-4 py-2 text-sm font-black text-black transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {factoryMode === 'continue-existing' ? 'Start Continue' : 'Start Factory'}
              </button>

              <button
                type="button"
                disabled={!isRunning}
                onClick={stopFactory}
                className="rounded-xl border border-orange-400/40 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-100 transition hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Stop sau request hiện tại
              </button>

              <button
                type="button"
                disabled={isRunning}
                onClick={clearLog}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear log
              </button>

              <Link
                to="/admin/ai-factory/results"
                className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-100 transition hover:bg-emerald-500/20"
              >
                Xem kết quả
              </Link>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/50 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500">Current action</div>
              <div className="mt-1 text-sm font-semibold text-white">{currentAction}</div>
            </div>
          </Section>

          <Section title="Job List">
            <div className="space-y-3">
              {jobs.length ? (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-white">
                          #{job.index} — {job.title}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          {job.genreLabel} • {job.heroineLabel}
                        </div>
                      </div>
                      <span
                        className={cx(
                          'rounded-full px-2 py-1 text-xs font-bold',
                          job.status === 'success' && 'bg-emerald-500/15 text-emerald-200',
                          job.status === 'running' && 'bg-yellow-500/15 text-yellow-200',
                          job.status === 'failed' && 'bg-red-500/15 text-red-200',
                          job.status === 'stopped' && 'bg-orange-500/15 text-orange-200',
                          job.status === 'pending' && 'bg-slate-500/15 text-slate-300',
                        )}
                      >
                        {job.status}
                      </span>
                    </div>

                    <div className="mt-2 grid gap-1 text-xs text-slate-400">
                      <div>Chapter: {job.chapterProgress}</div>
                      {typeof job.targetChapters === 'number' ? <div>Target: {job.targetChapters}</div> : null}
                      {job.completionStatus ? <div>Completion: {job.completionStatus}</div> : null}
                      <div>Cover: {job.coverStatus}</div>
                      {job.error ? <div className="text-red-300">Lỗi: {job.error}</div> : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-500">
                  Chưa có job nào. Bấm {factoryMode === 'continue-existing' ? 'Start Continue' : 'Start Factory'} để chạy.
                </div>
              )}
            </div>
          </Section>
        </div>
      </div>

      <Section title="Progress Log">
        <div className="max-h-[420px] space-y-2 overflow-auto rounded-xl bg-black/50 p-3">
          {logs.length ? (
            logs.map((log) => (
              <div
                key={log.id}
                className={cx(
                  'rounded-lg border px-3 py-2 text-sm',
                  log.type === 'info' && 'border-white/10 bg-white/[0.03] text-slate-300',
                  log.type === 'success' &&
                    'border-emerald-400/20 bg-emerald-500/10 text-emerald-100',
                  log.type === 'warning' &&
                    'border-yellow-400/20 bg-yellow-500/10 text-yellow-100',
                  log.type === 'error' && 'border-red-400/20 bg-red-500/10 text-red-100',
                )}
              >
                <span className="mr-2 text-xs opacity-70">[{log.time}]</span>
                {log.message}
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-500">Log trống.</div>
          )}
        </div>
      </Section>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-5 right-5 z-50 rounded-full border border-white/10 bg-zinc-900/95 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-black/40 transition hover:border-yellow-300/60 hover:bg-zinc-800"
      >
        ↑ Lên đầu
      </button>
    </div>
  )
}