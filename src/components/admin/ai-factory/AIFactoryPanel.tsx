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
  ParsedChapterOutput,
} from './aiFactoryTypes'
import {
  AI_FACTORY_STORAGE_KEY,
  DEFAULT_FACTORY_GENRES,
  DEFAULT_HEROINE_OPTIONS,
  buildAvoidLibrary,
  buildFactoryPromptIdea,
  buildMockChapterOutput,
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
  chaptersToGenerateNow: 1,
  minTargetChapters: 10,
  maxTargetChapters: 20,
  delayMs: 2000,
  generateCover: false,
  storyStatus: 'draft',
  chapterStatus: 'draft',
  chapterLengthLabel: 'Vừa — khoảng 1.800–2.300 ký tự',
  cliffhangerLabel: 'Mặc định — AI tự chọn theo mạch truyện',
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
        'rounded-full border px-3 py-2 text-left text-sm transition',
        active
          ? 'border-yellow-300 bg-yellow-300/10 text-yellow-200'
          : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:bg-white/[0.06]',
      )}
    >
      {children}
    </button>
  )
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

  const isRunning = status === 'running'

  const totalTextRequests = config.storyCount * config.chaptersToGenerateNow
  const totalCoverRequests = config.generateCover ? config.storyCount : 0
  const totalRequests = totalTextRequests + totalCoverRequests

  const canStart =
    !isRunning &&
    selectedGenres.length > 0 &&
    selectedHeroines.length > 0 &&
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
      if (snapshot.config) setConfig(snapshot.config)
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

  async function scanExistingStories() {
    setCurrentAction('Đang quét kho truyện...')
    addLog('Quét kho truyện gần nhất từ Supabase...')

    const extendedSelect =
      'id, title, description, genres, story_dna, story_memory, created_at'

    
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
    recentChapters: Array<{
      chapter_number: number
      title: string
      content: string
      summary?: string
    }>
    storyMemory: string
    factoryPromptIdea: string
    runShortId: string
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

    const payload = {
      mode: 'chapter',
      provider: params.provider,
      modelKey: params.modelKey,
      moduleId: 'female-urban-viral',
      title: params.storyTitle,
      storySummary: params.storyDescription,
      promptIdea: params.chapterNumber === 1 ? params.factoryPromptIdea : '',
      genreLabel: params.genreLabel,
      mainCharacterStyleLabel: params.heroineLabel,
      chapterLengthLabel: config.chapterLengthLabel,
      cliffhangerLabel: config.cliffhangerLabel,
      humiliationLevel: randomInt(3, 5),
      revengeIntensity: randomInt(3, 5),
      nextChapterNumber: params.chapterNumber,
      recentChapters: params.recentChapters,
      storyMemory: params.storyMemory,
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
  }) {
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
      generated_chapters_now: params.config.chaptersToGenerateNow,
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
        summary: params.parsed.technicalReport.slice(0, 1200),
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
          summary: params.parsed.technicalReport.slice(0, 1200),
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

  async function startFactory() {
    if (!canStart) return

    stopRequestedRef.current = false
    setStatus('running')
    setCurrentAction('Chuẩn bị chạy Factory')
    setLogs([])

    const factoryRunId = makeId('factory')
    const initialJobs: FactoryJob[] = Array.from({ length: config.storyCount }).map((_, index) => ({
      id: makeId('job'),
      index: index + 1,
      title: 'Chưa tạo',
      genreLabel: 'Chưa chọn',
      genreSlug: '',
      heroineLabel: 'Chưa chọn',
      status: 'pending',
      chapterProgress: `0/${config.chaptersToGenerateNow}`,
      coverStatus: config.generateCover ? 'pending' : 'off',
    }))

    setJobs(initialJobs)

    try {
      const scanResult = await scanExistingStories()
      let activeAvoidLibrary = scanResult.avoid

      for (let storyIndex = 1; storyIndex <= config.storyCount; storyIndex += 1) {
        if (stopRequestedRef.current) {
          addLog('Đã nhận lệnh stop. Dừng trước story tiếp theo.', 'warning')
          break
        }

        const job = initialJobs[storyIndex - 1]
        const genre = pickOne(selectedGenres, DEFAULT_FACTORY_GENRES[0])
        const heroine = pickOne(selectedHeroines, DEFAULT_HEROINE_OPTIONS[0])
        const targetChapters = randomInt(config.minTargetChapters, config.maxTargetChapters)
        const runShortId = `${new Date().getMonth() + 1}${new Date().getDate()}${storyIndex}${Math.random()
          .toString(36)
          .slice(2, 5)}`
        const premiseSeed = makeId('premise')
        const nameSeed = makeId('name')

        updateJob(job.id, {
          status: 'running',
          genreLabel: genre.label,
          genreSlug: genre.slug,
          heroineLabel: heroine.label,
          chapterProgress: `0/${config.chaptersToGenerateNow}`,
        })

        addLog(`Bắt đầu story ${storyIndex}/${config.storyCount}: ${genre.label}`, 'info')
        setCurrentAction(`Đang tạo story ${storyIndex}/${config.storyCount}`)

        let createdStory: { id: string; title: string; slug: string } | null = null
        let storyMemory = ''
        const recentChapters: Array<{
          chapter_number: number
          title: string
          content: string
          summary?: string
        }> = []

        try {
          for (
            let chapterNumber = 1;
            chapterNumber <= config.chaptersToGenerateNow;
            chapterNumber += 1
          ) {
            if (stopRequestedRef.current) {
              updateJob(job.id, {
                status: 'stopped',
                chapterProgress: `${chapterNumber - 1}/${config.chaptersToGenerateNow}`,
              })
              addLog(`Dừng sau request hiện tại tại story ${storyIndex}.`, 'warning')
              break
            }

            setCurrentAction(`Story ${storyIndex}: generate chương ${chapterNumber}`)
            addLog(`Story ${storyIndex}: generate chương ${chapterNumber}...`)

            const factoryPromptIdea = buildFactoryPromptIdea({
              genreLabel: genre.label,
              heroineLabel: heroine.label,
              targetChapters,
              avoidLibrary: activeAvoidLibrary,
              premiseSeed,
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
                recentChapters,
                storyMemory,
                factoryPromptIdea,
                runShortId,
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
                parsed,
                genre,
                heroine,
                config,
                factoryRunId,
                storyIndex,
                targetChapters,
                technicalReport: parsed.technicalReport,
                premiseSeed,
                nameSeed,
              })

              updateJob(job.id, {
                title: createdStory.title,
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
              summary: parsed.technicalReport.slice(0, 600),
            })

            storyMemory = [storyMemory, parsed.technicalReport].filter(Boolean).join('\n\n---\n\n')

            updateJob(job.id, {
              chapterProgress: `${chapterNumber}/${config.chaptersToGenerateNow}`,
            })

            addLog(`Insert chapter ${chapterNumber} thành công`, 'success')

            if (chapterNumber < config.chaptersToGenerateNow && config.delayMs > 0) {
              addLog(`Delay ${config.delayMs}ms trước request tiếp theo...`)
              await sleep(config.delayMs)
            }
          }

          if (config.generateCover) {
            updateJob(job.id, { coverStatus: 'skipped' })
            addLog('Cover generation đang để Phase 2, MVP tạm skip để tránh lỗi API/storage.', 'warning')
          }

          if (stopRequestedRef.current) {
            updateJob(job.id, { status: 'stopped' })
          } else {
            updateJob(job.id, {
              status: 'success',
              coverStatus: config.generateCover ? 'skipped' : 'off',
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
                <FieldLabel>Số truyện cần tạo</FieldLabel>
                <input
                  type="number"
                  min={1}
                  max={5}
                  disabled={isRunning}
                  value={config.storyCount}
                  onChange={(event) =>
                    updateConfig(
                      'storyCount',
                      clampNumber(Number(event.target.value), 1, 5),
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
                />
                <SmallHint>MVP giới hạn 1–5 truyện/lần chạy.</SmallHint>
              </div>

              <div>
                <FieldLabel>Số chương tạo ngay mỗi truyện</FieldLabel>
                <input
                  type="number"
                  min={1}
                  max={3}
                  disabled={isRunning}
                  value={config.chaptersToGenerateNow}
                  onChange={(event) =>
                    updateConfig(
                      'chaptersToGenerateNow',
                      clampNumber(Number(event.target.value), 1, 3),
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
                />
                <SmallHint>MVP giới hạn 1–3 chương để tránh cháy phí.</SmallHint>
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
                <span className="ml-2 text-xs text-slate-500">Phase 1 đang skip an toàn</span>
              </div>
            </div>
          </Section>

          <Section title="Genre Pool" desc="Factory sẽ random mỗi truyện một thể loại trong pool.">
            <div className="flex flex-wrap gap-2">
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
          </Section>

          <Section title="Heroine Pool" desc="Factory sẽ random kiểu nữ chính để tránh truyện bị trùng vibe.">
            <div className="flex flex-wrap gap-2">
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
        </div>

        <div className="space-y-5">
          <Section title="API Cost Guard" desc="Chống bấm nhầm khi dùng OpenAI thật.">
            {config.provider === 'openai' ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
                  <div className="font-bold">SẼ GỌI OPENAI API</div>
                  <div className="mt-2 grid gap-1 text-red-100/90">
                    <div>Số truyện: {config.storyCount}</div>
                    <div>Số chương dự kiến: {totalTextRequests}</div>
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
                Start Factory
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
                      <div>Cover: {job.coverStatus}</div>
                      {job.error ? <div className="text-red-300">Lỗi: {job.error}</div> : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-500">
                  Chưa có job nào. Bấm Start Factory để chạy.
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
    </div>
  )
}