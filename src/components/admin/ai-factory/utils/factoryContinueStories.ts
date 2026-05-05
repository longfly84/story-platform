import type {
  AIFactoryConfig,
  ExistingStory,
  FactoryJob,
  FactoryLog,
  FactoryStatus,
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
      const continueProgress = getFactoryChapterProgress({
        currentChapters: story.currentChapters,
        targetChapters: story.targetChapters,
        maxCreateNow: chaptersToCreate,
      })
      let storyMemory =
        typeof (story as any).story_memory === 'string'
          ? (story as any).story_memory
          : safeJson((story as any).story_memory)
      const recentChapters: RecentChapterForGenerate[] = story.chapters.slice(-5).map((chapter, index) => ({
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
