import type {
  AIFactoryConfig,
  ExistingStory,
  FactoryJob,
  FactoryLog,
  FactoryStatus,
  FactoryStorySeed,
  ParsedChapterOutput,
} from '../aiFactoryTypes'
import { makeId, parseChapterOutput, sleep, validateChapterOutput } from '../aiFactoryUtils'
import type { ContinueStatusFilter, ExistingChapterRow, IncompleteStory } from '../types/factoryPanelTypes'
import {
  buildPublicChapterSummary,
  getStoryGenreLabel,
  getStoryHeroineLabel,
  getTargetChapters,
  safeJson,
} from './factoryPanelHelpers'
import { getFactoryChapterProgress } from './factoryProgress'

type AddLog = (message: string, type?: FactoryLog['type']) => void

type SupabaseLike = {
  from: (table: string) => any
}

type ScanIncompleteStoriesParams = {
  supabase: SupabaseLike
  config: AIFactoryConfig
  continueStatusFilter: ContinueStatusFilter
  continueChaptersPerStory: number
  setCurrentAction: (value: string) => void
  setIncompleteStories: (stories: IncompleteStory[]) => void
  addLog: AddLog
}

type RecentChapterForGenerate = {
  chapter_number: number
  title: string
  content: string
  summary?: string
}

type GenerateChapterParams = {
  provider: AIFactoryConfig['provider']
  modelKey: AIFactoryConfig['modelKey']
  storyTitle: string
  storyDescription: string
  genreLabel: string
  heroineLabel: string
  chapterNumber: number
  targetChapters: number
  isFinalChapter?: boolean
  recentChapters: RecentChapterForGenerate[]
  storyMemory: string
  factoryPromptIdea: string
  runShortId: string
  storySeed?: FactoryStorySeed | null
  storyDna?: unknown
}

type InsertChapterDraftParams = {
  storyId: string
  parsed: ParsedChapterOutput
  chapterNumber: number
  status: AIFactoryConfig['chapterStatus']
}

type ContinueExistingStoriesParams = {
  supabase: SupabaseLike
  config: AIFactoryConfig
  continueStoryLimit: number
  continueChaptersPerStory: number
  selectedContinueStoryId?: string
  stopRequestedRef: { current: boolean }
  setStatus: (status: FactoryStatus) => void
  setCurrentAction: (value: string) => void
  setLogs: (logs: FactoryLog[] | ((prev: FactoryLog[]) => FactoryLog[])) => void
  setJobs: (jobs: FactoryJob[] | ((prev: FactoryJob[]) => FactoryJob[])) => void
  updateJob: (jobId: string, patch: Partial<FactoryJob>) => void
  addLog: AddLog
  scanIncompleteStories: () => Promise<IncompleteStory[]>
  generateChapter: (params: GenerateChapterParams) => Promise<string>
  insertChapterDraft: (params: InsertChapterDraftParams) => Promise<{ id: string; title: string; chapter_number: number }>
}

function safeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function compactText(value: string, maxLength = 4000) {
  const clean = safeString(value).replace(/\s+/g, ' ')
  if (clean.length <= maxLength) return clean
  return `${clean.slice(0, maxLength).trim()}...`
}

function serializeUsefulJson(value: unknown, maxLength = 5000) {
  if (!value) return ''

  if (typeof value === 'string') {
    return compactText(value, maxLength)
  }

  try {
    return compactText(JSON.stringify(value, null, 2), maxLength)
  } catch {
    return compactText(String(value), maxLength)
  }
}

function getChapterNumber(chapter: ExistingChapterRow, fallback: number) {
  const chapterNumber = Number(chapter.chapter_number ?? fallback)
  return Number.isFinite(chapterNumber) && chapterNumber > 0
    ? Math.floor(chapterNumber)
    : fallback
}

function normalizeChapters(chapters: ExistingChapterRow[]) {
  return chapters
    .map((chapter, index) => ({
      ...chapter,
      chapter_number: getChapterNumber(chapter, index + 1),
    }))
    .sort((a, b) => Number(a.chapter_number ?? 0) - Number(b.chapter_number ?? 0))
}

function getMaxChapterNumber(chapters: ExistingChapterRow[]) {
  return chapters.reduce((max, chapter, index) => {
    const chapterNumber = getChapterNumber(chapter, index + 1)
    return Math.max(max, chapterNumber)
  }, 0)
}

function uniqueChapters(chapters: ExistingChapterRow[]) {
  const selected = new Map<number, ExistingChapterRow>()

  chapters.forEach((chapter, index) => {
    selected.set(getChapterNumber(chapter, index + 1), chapter)
  })

  return Array.from(selected.values()).sort(
    (a, b) => Number(a.chapter_number ?? 0) - Number(b.chapter_number ?? 0),
  )
}

function selectContextChapters(chapters: ExistingChapterRow[]) {
  const normalized = normalizeChapters(chapters)

  return uniqueChapters([
    ...normalized.slice(0, 3),
    ...normalized.slice(-6),
  ])
}

function buildContinueRecentChapters(chapters: ExistingChapterRow[]) {
  return selectContextChapters(chapters).map((chapter, index) => ({
    chapter_number: getChapterNumber(chapter, index + 1),
    title: chapter.title || `Chương ${chapter.chapter_number ?? index + 1}`,
    content: compactText(chapter.content || '', 6500),
    summary: chapter.summary || buildPublicChapterSummary(chapter.content || ''),
  }))
}

function buildStoryDnaContext(story: ExistingStory) {
  const storyDna = (story as any).story_dna
  if (!storyDna) return ''

  const serialized = serializeUsefulJson(storyDna, 7000)
  if (!serialized || serialized === '{}' || serialized === 'null') return ''

  return `STORY_DNA / OUTLINE ĐANG CÓ:\n${serialized}`
}

function buildRecentChapterContext(chapters: ExistingChapterRow[]) {
  return normalizeChapters(chapters)
    .map((chapter, index) => {
      const chapterNumber = getChapterNumber(chapter, index + 1)
      const summary = chapter.summary || buildPublicChapterSummary(chapter.content || '')
      return `Chương ${chapterNumber} — ${chapter.title || `Chương ${chapterNumber}`}\nTóm tắt: ${compactText(summary, 1000)}`
    })
    .join('\n\n')
}

function buildCurrentStateContext(chapters: ExistingChapterRow[], nextChapterNumber: number) {
  const normalized = normalizeChapters(chapters)
  const latest = normalized.at(-1)
  const latestNumber = latest ? getChapterNumber(latest, normalized.length) : nextChapterNumber - 1
  const latestSummary = latest?.summary || buildPublicChapterSummary(latest?.content || '')

  return `
CURRENT STORY STATE — KHÓA MẠCH HIỆN TẠI:
- Chương gần nhất đã có: Chương ${latestNumber} — ${latest?.title || 'Không rõ'}.
- Tóm tắt chương gần nhất: ${compactText(latestSummary, 1400) || 'Không có dữ liệu.'}
- Chương mới phải bắt đầu SAU hậu quả của chương gần nhất, không được viết lại sự kiện cũ như mới xảy ra.
- Nếu chương gần nhất đã công khai một bằng chứng, chương mới phải cho thấy hậu quả/phản ứng/phản công từ bằng chứng đó.
- Nếu chương gần nhất đã có cảnh họp/đối chất/niêm phong/tạm ngưng, chương mới ưu tiên đổi sang cảnh hành động, cảnh mẹ con, cảnh lấy chứng cứ, cảnh nhân chứng, cảnh theo dõi hoặc cảnh phản công.
`.trim()
}

function buildContinueModeInstruction(params: {
  storyTitle: string
  nextChapterNumber: number
  targetChapters: number
  recentChapterTitles: string[]
}) {
  const recentTitles = params.recentChapterTitles.filter(Boolean).join(' / ')

  return `
CONTINUE EXISTING STORY MODE — LUẬT BẮT BUỘC:

Đây là truyện đang viết dở: "${params.storyTitle}".
Đang viết tiếp chương ${params.nextChapterNumber}/${params.targetChapters}.

KHÓA LIÊN TỤC:
- Không được mở một truyện mới.
- Không được đổi tên truyện.
- Không được đổi tên nữ chính, con, phản diện, trường học, vật chứng trung tâm.
- Không được viết lại tình huống đã xảy ra ở các chương trước.
- Không được reset về trạng thái "bắt đầu bị vu oan" nếu truyện đã có bằng chứng mới.

CÁC CHƯƠNG GẦN ĐÂY ĐÃ CÓ:
${recentTitles || 'Không có tiêu đề chương gần đây.'}

LUẬT TIẾN TRIỂN MỖI CHƯƠNG:
- Mỗi chương mới phải tạo ra ít nhất 1 STATE CHANGE thật:
  1. Có bằng chứng mới được lấy ra; hoặc
  2. Một nhân chứng đổi phe; hoặc
  3. Phản diện phản công bằng đòn mới; hoặc
  4. Nữ chính dùng bằng chứng cũ để mở khóa bằng chứng mới; hoặc
  5. Quyền lực của phản diện bị mất một phần; hoặc
  6. Đứa trẻ / quyền giám hộ / dư luận thay đổi trạng thái rõ ràng.

CẤM LÙI MẠCH:
- Nếu chương trước đã có HR-03 / admin_hanhchinh / thẻ SD / clip 07:12 / Order: Ôn / bằng chứng tương đương, chương sau phải dùng nó để tiến tới hậu quả mới.
- Không được chỉ đem cùng bằng chứng đó ra tranh luận lại.
- Không được lặp lại cảnh "phòng họp phụ huynh" quá nhiều lần.
- Không được dùng lại cùng một dạng cảnh: họp, niêm phong, tạm ngưng, điều tra nội bộ nếu chương trước vừa dùng.

ĐA DẠNG CẢNH:
Ưu tiên luân phiên:
- cảnh mẹ con riêng tư,
- cảnh lấy chứng cứ,
- cảnh nhân chứng bị ép,
- cảnh phản diện phản công,
- cảnh công khai dư luận,
- cảnh pháp lý / hội đồng,
- cảnh payoff.

CẢM XÚC MẸ CON:
Mỗi 1–2 chương phải có một khoảnh khắc cụ thể cho thấy đứa trẻ/người yếu thế bị ảnh hưởng:
- con hỏi mình có sai không,
- con bị bạn xa lánh,
- con không dám ôm vật chứng/đồ chơi,
- con sợ mẹ biến mất,
- nữ chính phải trấn an con bằng hành động cụ thể.

NẾU LÀ CHƯƠNG CUỐI HOẶC GẦN CUỐI:
- Phải payoff các vật chứng đã cài.
- Phải để phản diện mất quyền lực rõ ràng.
- Không được kết bằng cliffhanger giả.
`.trim()
}

function buildContinueMemoryContext(args: {
  baseMemory: string
  story: ExistingStory
  chapters: ExistingChapterRow[]
  nextChapterNumber: number
  targetChapters: number
}) {
  const { baseMemory, story, chapters, nextChapterNumber, targetChapters } = args
  const contextChapters = selectContextChapters(chapters)
  const storyDnaContext = buildStoryDnaContext(story)
  const title = safeString((story as any).title) || 'Truyện chưa có tên'
  const description = compactText(safeString((story as any).description), 1800)
  const chapterContext = buildRecentChapterContext(contextChapters)
  const currentStateContext = buildCurrentStateContext(chapters, nextChapterNumber)
  const continueInstruction = buildContinueModeInstruction({
    storyTitle: title,
    nextChapterNumber,
    targetChapters,
    recentChapterTitles: contextChapters.map((chapter) => chapter.title || ''),
  })

  return [
    continueInstruction,
    currentStateContext,
    `Tên truyện gốc: ${title}`,
    description ? `Mô tả public gốc: ${description}` : '',
    storyDnaContext,
    baseMemory ? `STORY_MEMORY ĐANG CÓ:\n${compactText(baseMemory, 7000)}` : '',
    chapterContext ? `CÁC CHƯƠNG MỐC ĐỂ GIỮ MẠCH:\n${chapterContext}` : '',
  ]
    .filter(Boolean)
    .join('\n\n---\n\n')
}

function makeContinuePromptIdea(args: {
  storyTitle: string
  nextChapterNumber: number
  targetChapters: number
  isFinalChapter: boolean
  recentChapterTitles: string[]
}) {
  const { storyTitle, nextChapterNumber, targetChapters, isFinalChapter, recentChapterTitles } = args

  return [
    `Viết tiếp truyện "${storyTitle}" ở chương ${nextChapterNumber}/${targetChapters}.`,
    `Các chương mốc đã có: ${recentChapterTitles.filter(Boolean).join(' / ') || 'không rõ'}.`,
    `Không mở truyện mới, không đổi tên truyện, không đổi premise, không viết lại chương cũ.`,
    `Chương phải nối trực tiếp từ chương trước, có cảnh mới, đối thoại mới, hành động mới và ít nhất một bước tiến thật của vật chứng/xung đột.`,
    `Nếu chương trước đã là phòng họp/đối chất/niêm phong/tạm ngưng, chương này phải ưu tiên một loại cảnh khác hoặc tạo hậu quả mới rõ ràng.`,
    isFinalChapter
      ? `Đây là chương cuối: phải trả payoff chính, kết thúc mâu thuẫn trung tâm rõ ràng, không cliffhanger giả.`
      : `Đây chưa phải chương cuối: phải đẩy xung đột lên một nấc và để lại hook cụ thể cho chương sau.`,
  ].join('\n')
}

export async function scanIncompleteStoriesForFactory(params: ScanIncompleteStoriesParams) {
  const {
    supabase,
    config,
    continueStatusFilter,
    continueChaptersPerStory,
    setCurrentAction,
    setIncompleteStories,
    addLog,
  } = params

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

    const chapters = normalizeChapters((chaptersResult.data ?? []) as ExistingChapterRow[])
    const targetChapters = getTargetChapters(story, config.maxTargetChapters)
    const maxChapterNumber = getMaxChapterNumber(chapters)
    const currentChapters = Math.min(targetChapters, Math.max(chapters.length, maxChapterNumber))
    const missingChapters = Math.max(0, targetChapters - currentChapters)

    if (missingChapters > 0) {
      incomplete.push({
        ...(story as any),
        targetChapters,
        currentChapters,
        missingChapters,
        nextChapterNumber: currentChapters + 1,
        chapters,
      })
    }
  }

  setIncompleteStories(incomplete)
  setCurrentAction(`Đã quét ${incomplete.length} truyện dang dở`)
  addLog(`Tìm thấy ${incomplete.length} truyện chưa hoàn thành.`, incomplete.length ? 'success' : 'warning')

  incomplete.slice(0, 10).forEach((story) => {
    const progress = getFactoryChapterProgress({
      currentChapters: story.currentChapters,
      targetChapters: story.targetChapters,
      maxCreateNow: continueChaptersPerStory,
    })

    addLog(
      `${story.title || 'Truyện chưa có tên'}: ${progress.progressLabel} chương, ${progress.remainingLabel}. ${progress.createRangeLabel}.`,
      progress.isFull ? 'info' : 'success',
    )
  })

  return incomplete
}

export async function continueExistingStoriesForFactory(params: ContinueExistingStoriesParams) {
  const {
    supabase,
    config,
    continueStoryLimit,
    continueChaptersPerStory,
    selectedContinueStoryId = 'auto',
    stopRequestedRef,
    setStatus,
    setCurrentAction,
    setLogs,
    setJobs,
    updateJob,
    addLog,
    scanIncompleteStories,
    generateChapter,
    insertChapterDraft,
  } = params

  stopRequestedRef.current = false
  setStatus('running')
  setCurrentAction('Chuẩn bị viết tiếp truyện dang dở')
  setLogs([])

  addLog(
    selectedContinueStoryId === 'auto'
      ? `Factory sẽ viết tiếp tối đa ${continueStoryLimit} truyện, mỗi truyện thêm tối đa ${continueChaptersPerStory} chương.`
      : `Factory sẽ viết tiếp truyện đã chọn, thêm tối đa ${continueChaptersPerStory} chương.`,
    'info',
  )

  try {
    const scannedStories = await scanIncompleteStories()
    const candidates =
      selectedContinueStoryId === 'auto'
        ? scannedStories.slice(0, Math.max(1, continueStoryLimit))
        : scannedStories.filter((story) => String((story as any).id) === selectedContinueStoryId)

    if (!candidates.length) {
      setStatus('success')
      setCurrentAction('Không có truyện dang dở cần viết tiếp')
      addLog(
        selectedContinueStoryId === 'auto'
          ? 'Không có truyện nào thiếu chương theo target.'
          : 'Truyện đã chọn không còn thiếu chương hoặc không tìm thấy trong danh sách scan.',
        'warning',
      )
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
      const continueProgress = getFactoryChapterProgress({
        currentChapters: story.currentChapters,
        targetChapters: story.targetChapters,
        maxCreateNow: chaptersToCreate,
      })
      let storyMemory =
        typeof (story as any).story_memory === 'string'
          ? (story as any).story_memory
          : safeJson((story as any).story_memory)
      let nextChapterNumber = story.nextChapterNumber
      const recentChapters = buildContinueRecentChapters(story.chapters)

      storyMemory = buildContinueMemoryContext({
        baseMemory: storyMemory,
        story,
        chapters: story.chapters,
        nextChapterNumber,
        targetChapters: story.targetChapters,
      })

      updateJob(job.id, {
        status: 'running',
        chapterProgress: `${story.currentChapters}/${story.targetChapters}`,
      })

      addLog(
        `Viết tiếp ${storyTitle}: ${continueProgress.progressLabel}, ${continueProgress.remainingLabel}. ${continueProgress.createRangeLabel}.`,
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
              factoryPromptIdea: makeContinuePromptIdea({
                storyTitle,
                nextChapterNumber,
                targetChapters: story.targetChapters,
                isFinalChapter,
                recentChapterTitles: recentChapters.map((chapter) => chapter.title || ''),
              }),
              runShortId: `${storyId}-${nextChapterNumber}`,
              storySeed: (story as any).story_dna || null,
              storyDna: (story as any).story_dna || null,
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
            content: compactText(parsed.readerOnly, 6500),
            summary: buildPublicChapterSummary(parsed.readerOnly),
          })

          while (recentChapters.length > 9) recentChapters.shift()

          storyMemory = buildContinueMemoryContext({
            baseMemory: [storyMemory, parsed.technicalReport].filter(Boolean).join('\n\n---\n\n'),
            story: {
              ...(story as any),
              story_memory: storyMemory,
            } as ExistingStory,
            chapters: recentChapters as unknown as ExistingChapterRow[],
            nextChapterNumber: nextChapterNumber + 1,
            targetChapters: story.targetChapters,
          })

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
