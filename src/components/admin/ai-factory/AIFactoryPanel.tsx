import { useEffect, useMemo, useRef, useState } from 'react'
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
  getLogTime,
  makeId,
  parseChapterOutput,
  pickOne,
  randomInt,
  sleep,
  validateChapterOutput,
} from './aiFactoryUtils'

import AIFactoryPanelView from './components/AIFactoryPanelView'
import type { ContinueStatusFilter, FactoryMode, IncompleteStory } from './types/factoryPanelTypes'
import { buildPublicChapterSummary } from './utils/factoryPanelHelpers'
import { getFactoryChapterProgress } from './utils/factoryProgress'
import { extractMotifRegistryItemsFromStories } from './utils/motifFingerprint'
import {
  STORY_SEED_MAX_ATTEMPTS,
  buildUniqueStorySeed,
} from './utils/factorySeedMotif'
import {
  continueExistingStoriesForFactory,
  scanIncompleteStoriesForFactory,
} from './utils/factoryContinueStories'
import {
  generateAndAttachFactoryCover,
  generateFactoryChapter,
  insertFactoryChapterDraft,
  insertFactoryStoryDraft,
} from './utils/factoryStoryRunner'

const DEFAULT_CHAPTER_MIN_CHARS = 3500
const DEFAULT_CHAPTER_MAX_CHARS = 4500


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
  chapterLengthLabel: 'Tùy chỉnh — khoảng 3500–4500 ký tự',
  chapterMinChars: DEFAULT_CHAPTER_MIN_CHARS,
  chapterMaxChars: DEFAULT_CHAPTER_MAX_CHARS,
  cliffhangerLabel: 'Mặc định — AI tự chọn theo mạch truyện',
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
    motifFingerprints: [],
    motifTexts: [],
  })

  const [jobs, setJobs] = useState<FactoryJob[]>([])
  const [logs, setLogs] = useState<FactoryLog[]>([])
  const [status, setStatus] = useState<FactoryStatus>('idle')
  const [currentAction, setCurrentAction] = useState('Chưa chạy')
  const [openaiConfirmed, setOpenaiConfirmed] = useState(false)
  const [expensiveModelConfirmed, setExpensiveModelConfirmed] = useState(false)
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
  const expensiveModelRequiresConfirmation =
  config.provider === 'openai' && (config.modelKey === 'premium' || config.modelKey === 'auto')

  const canStart =
  !isRunning &&
  (factoryMode === 'create-new'
    ? selectedGenres.length > 0 && selectedHeroines.length > 0
    : true) &&
  (config.provider === 'mock' || openaiConfirmed) &&
  (!expensiveModelRequiresConfirmation || expensiveModelConfirmed)

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
    if (key === 'modelKey' || key === 'provider') {
      setExpensiveModelConfirmed(false)
    }

    setConfig((prev) => ({ ...prev, [key]: value }))
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
          motifFingerprints: [],
          motifTexts: [],
        } satisfies AvoidLibrary,
      }
    }

    const stories = (result.data ?? []) as ExistingStory[]
    const motifItems = extractMotifRegistryItemsFromStories(stories)
    const avoid = {
      ...buildAvoidLibrary(stories),
      motifFingerprints: motifItems,
      motifTexts: motifItems.map((item) => item.motifText).filter(Boolean),
    }

    setExistingStories(stories)
    setAvoidLibrary(avoid)

    addLog(
      `Đã quét ${stories.length} truyện. Gom ${avoid.titles.length} title, ${avoid.motifs.length} motif, ${motifItems.length} motif DNA.`,
      'success',
    )

    setCurrentAction('Đã quét xong kho truyện')

    return { stories, avoid }
  }

  async function generateChapter(params: Omit<Parameters<typeof generateFactoryChapter>[0], 'config'>) {
    return generateFactoryChapter({
      ...params,
      config,
    })
  }

  async function insertStoryDraft(params: Omit<Parameters<typeof insertFactoryStoryDraft>[0], 'supabase' | 'avoidLibrary' | 'addLog'>) {
    return insertFactoryStoryDraft({
      ...params,
      supabase,
      avoidLibrary,
      addLog,
    })
  }

  async function insertChapterDraft(params: Omit<Parameters<typeof insertFactoryChapterDraft>[0], 'supabase' | 'addLog'>) {
    return insertFactoryChapterDraft({
      ...params,
      supabase,
      addLog,
    })
  }

  async function generateAndAttachCover(params: Omit<Parameters<typeof generateAndAttachFactoryCover>[0], 'config'>) {
    return generateAndAttachFactoryCover({
      ...params,
      config,
    })
  }

  async function scanIncompleteStories() {
    return scanIncompleteStoriesForFactory({
      supabase,
      config,
      continueStatusFilter,
      continueChaptersPerStory,
      setCurrentAction,
      setIncompleteStories,
      addLog,
    })
  }

  async function continueExistingStories() {
    return continueExistingStoriesForFactory({
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
    })
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
        const createProgress = getFactoryChapterProgress({
          currentChapters: 0,
          targetChapters,
          maxCreateNow: chaptersToCreate,
        })
        const runShortId = `${new Date().getMonth() + 1}${new Date().getDate()}${storyIndex}${Math.random()
          .toString(36)
          .slice(2, 5)}`
        const premiseSeed = makeId('premise')
        const nameSeed = makeId('name')
        let storySeed: FactoryStorySeed

        try {
          storySeed = await buildUniqueStorySeed({
            genreLabel: genre.label,
            heroineLabel: heroine.label,
            avoidLibrary: activeAvoidLibrary,
            factoryRunId,
            storyIndex,
            premiseSeed,
            provider: config.provider,
            addLog,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)

          updateJob(job.id, {
            status: 'failed',
            genreLabel: genre.label,
            genreSlug: genre.slug,
            heroineLabel: heroine.label,
            chapterProgress: `0/${targetChapters}`,
            targetChapters,
            createdChapters: 0,
            completionStatus: 'ongoing',
            error: `Seed lỗi: ${message}`,
          })

          addLog(
            `Story ${storyIndex}: bỏ qua vì không tạo được seed đủ khác motif sau ${STORY_SEED_MAX_ATTEMPTS} lần. Factory sẽ chạy tiếp story sau.`,
            'error',
          )
          addLog(`Chi tiết seed lỗi: ${message}`, 'warning')

          if (storyIndex < config.storyCount && config.delayMs > 0) {
            await sleep(config.delayMs)
          }

          continue
        }

        updateJob(job.id, {
          status: 'running',
          genreLabel: genre.label,
          genreSlug: genre.slug,
          heroineLabel: heroine.label,
          chapterProgress: `0/${targetChapters}`,
          targetChapters,
          createdChapters: 0,
          completionStatus: 'ongoing',
        })

        addLog(
          `Batch ${currentBatch}/${totalBatchesForRun} — bắt đầu story ${storyIndex}/${config.storyCount}: ${genre.label}. Target: ${targetChapters} chương. ${createProgress.createRangeLabel}.`,
          'info',
        )
        
        addLog(`Story seed fingerprint: ${storySeed.shortFingerprint}`, 'info')
        if (storySeed.motifFingerprint?.fingerprint) {
          addLog(`Motif fingerprint: ${storySeed.motifFingerprint.fingerprint}`, 'info')
        }

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
                chapterProgress: `${chapterNumber - 1}/${targetChapters}`,
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
              chapterProgress: `${chapterNumber}/${targetChapters}`,
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
                  storySeed,
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
              chapterProgress: `${createdChapterCount}/${targetChapters}`,
              createdChapters: createdChapterCount,
              targetChapters,
              completionStatus: isStoryFull ? 'full' : 'ongoing',
            })
            addLog(`Xong story ${storyIndex}/${config.storyCount}`, 'success')
          }

          {
            const updatedStoriesForAvoid = [
              {
                id: createdStory?.id || makeId('story'),
                title: createdStory?.title || '',
                description: recentChapters[0]?.content?.slice(0, 260) || '',
                genres: [genre.slug],
                story_dna: {
                  factory_seed: storySeed,
                  motifFingerprint: storySeed.motifFingerprint ?? null,
                  motifText: storySeed.motifText ?? null,
                  motifEmbedding: storySeed.motifEmbedding ?? null,
                },
                story_memory: storyMemory,
                created_at: new Date().toISOString(),
              },
              ...scanResult.stories,
            ] as ExistingStory[]

            const motifItems = extractMotifRegistryItemsFromStories(updatedStoriesForAvoid)

            activeAvoidLibrary = {
              ...buildAvoidLibrary(updatedStoriesForAvoid),
              motifFingerprints: motifItems,
              motifTexts: motifItems.map((item) => item.motifText).filter(Boolean),
            }
          }

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
    <AIFactoryPanelView
      status={status}
      progressText={progressText}
      factoryMode={factoryMode}
      setFactoryMode={setFactoryMode}
      isRunning={isRunning}
      continueStoryLimit={continueStoryLimit}
      setContinueStoryLimit={setContinueStoryLimit}
      continueChaptersPerStory={continueChaptersPerStory}
      setContinueChaptersPerStory={setContinueChaptersPerStory}
      continueStatusFilter={continueStatusFilter}
      setContinueStatusFilter={setContinueStatusFilter}
      config={config}
      updateConfig={updateConfig}
      setOpenaiConfirmed={setOpenaiConfirmed}
      selectedGenres={selectedGenres}
      selectedHeroines={selectedHeroines}
      toggleGenre={toggleGenre}
      toggleHeroine={toggleHeroine}
      existingStories={existingStories}
      avoidLibrary={avoidLibrary}
      scanExistingStories={scanExistingStories}
      incompleteStories={incompleteStories}
      scanIncompleteStories={scanIncompleteStories}
      openaiConfirmed={openaiConfirmed}
      expensiveModelRequiresConfirmation={expensiveModelRequiresConfirmation}
      expensiveModelConfirmed={expensiveModelConfirmed}
      setExpensiveModelConfirmed={setExpensiveModelConfirmed}
      totalBatches={totalBatches}
      totalTextRequests={totalTextRequests}
      totalCoverRequests={totalCoverRequests}
      totalRequests={totalRequests}
      canStart={canStart}
      startFactory={startFactory}
      stopFactory={stopFactory}
      clearLog={clearLog}
      currentAction={currentAction}
      jobs={jobs}
      logs={logs}
    />
  )

}