import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  characterVibeOptions,
  chapterLengthOptions,
  cliffhangerOptions,
  colorThemeOptions,
  coverStyleOptions,
  fallbackCategories,
  findLabel,
  mainCharacterOptions,
  makeSlug,
  modeOptions,
  modelKeyOptions,
  moduleOptions,
  providerOptions,
  type AIFormState,
  type Option,
  type StoryLite,
} from '@/components/admin/ai/aiWriterOptions'
import { buildChapterMock, buildStoryPlanMock } from '@/components/admin/ai/aiWriterMocks'
import { buildFullCoverPrompt } from '@/components/admin/ai/aiWriterCoverPrompt'
import {
  extractReaderOnly,
  getChapterTitleFromReader,
  getStoryDescriptionFromPreviewText,
  getStoryTitleFromPreviewText,
} from '@/components/admin/ai/aiWriterText'
import SelectField from '@/components/admin/ai/SelectField'
import StoryPicker from '@/components/admin/ai/StoryPicker'
import AIWriterPreviewPanel from '@/components/admin/ai/AIWriterPreviewPanel'

function base64ToBlob(base64: string, mimeType = 'image/png') {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)

  for (let index = 0; index < byteCharacters.length; index += 1) {
    byteNumbers[index] = byteCharacters.charCodeAt(index)
  }

  const byteArray = new Uint8Array(byteNumbers)

  return new Blob([byteArray], { type: mimeType })
}

async function uploadGeneratedCover({
  imageBase64,
  storyId,
  storyTitle,
  mimeType = 'image/png',
}: {
  imageBase64: string
  storyId: string | number
  storyTitle: string
  mimeType?: string
}) {
  const blob = base64ToBlob(imageBase64, mimeType)
  const slug = makeSlug(storyTitle || 'story-cover')
  const filePath = `stories/${storyId}/cover-${slug}-${Date.now()}.png`

  const { error: uploadError } = await supabase.storage.from('covers').upload(filePath, blob, {
    upsert: true,
    contentType: mimeType,
  })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('covers').getPublicUrl(filePath)

  return data.publicUrl
}

function extractPublicDescriptionFromPreview(preview: string) {
  if (!preview) return ''

  const lines = preview
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const readerStart = lines.findIndex((line) => line.includes('# BẢN ĐỌC CHO ĐỘC GIẢ'))
  const technicalStart = lines.findIndex((line) =>
    line.includes('# BẢN PHÂN TÍCH KỸ THUẬT')
  )

  const readerLines =
    readerStart >= 0
      ? lines.slice(readerStart + 1, technicalStart > readerStart ? technicalStart : undefined)
      : lines

  const body = readerLines
    .filter((line) => !line.startsWith('#') && line !== '---')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!body) return ''

  const shortDescription = body.slice(0, 320).trim()

  return body.length > 320 ? `${shortDescription}...` : shortDescription
}

function optionExists(options: Option[], value: string) {
  return options.some((option) => option.value === value)
}

function getDefaultOptionValue(options: Option[], preferredValue: string, fallbackValue: string) {
  if (optionExists(options, preferredValue)) return preferredValue
  return options[0]?.value || fallbackValue
}

const DEFAULT_MAIN_CHARACTER_STYLE = getDefaultOptionValue(
  mainCharacterOptions,
  'endure-then-counter',
  'patient-counterattack'
)

const DEFAULT_CLIFFHANGER_TYPE = getDefaultOptionValue(cliffhangerOptions, 'auto', 'auto')

export default function AIGeneratePanel() {
  const [, setStories] = useState<StoryLite[]>([])
  const [storyOptions, setStoryOptions] = useState<StoryLite[]>([])
  const [categories, setCategories] = useState<Option[]>(fallbackCategories)
  const [selectedStory, setSelectedStory] = useState<StoryLite | null>(null)
  const [storyQuery, setStoryQuery] = useState('')
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [coverLoading, setCoverLoading] = useState(false)
  const [recentChapters, setRecentChapters] = useState<any[]>([])
  const [contextLoading, setContextLoading] = useState(false)
  const [nextChapterNumber, setNextChapterNumber] = useState(1)
  const [confirmOpenAIPayload, setConfirmOpenAIPayload] = useState(false)

  const [aiForm, setAiForm] = useState<AIFormState>({
    mode: 'chapter',
    modelKey: 'economy',
    provider: 'mock',
    moduleId: 'female-urban-viral',
    category: fallbackCategories[0]?.value || '',
    mainCharacterStyle: DEFAULT_MAIN_CHARACTER_STYLE,
    chapterLength: 'medium',
    cliffhangerType: DEFAULT_CLIFFHANGER_TYPE,
    coverStyle: 'minimal-portrait',
    colorTheme: 'warm-gold',
    characterVibe: 'stoic',
    promptIdea: '',
    humiliationLevel: 3,
    revengeIntensity: 3,
  })

  const categoryOptions = categories.length ? categories : fallbackCategories

  const selectedGenreLabel = findLabel(categoryOptions, aiForm.category)
  const selectedHeroineLabel = findLabel(mainCharacterOptions, aiForm.mainCharacterStyle)
  const selectedChapterLengthLabel = findLabel(chapterLengthOptions, aiForm.chapterLength)
  const selectedCliffhangerLabel = findLabel(cliffhangerOptions, aiForm.cliffhangerType)
  const selectedModelLabel = findLabel(modelKeyOptions, aiForm.modelKey)
  const willSendToOpenAI = aiForm.provider === 'openai'

  const requestPreview = useMemo(
    () => ({
      provider: aiForm.provider,
      endpoint: willSendToOpenAI ? '/api/ai/generate' : '(mock local)',
      mode: aiForm.mode,
      modelKey: aiForm.modelKey,
      modelLabel: selectedModelLabel,
      moduleId: aiForm.moduleId,
      moduleLabel: findLabel(moduleOptions, aiForm.moduleId),
      genreKey: aiForm.category,
      genreLabel: selectedGenreLabel,
      mainCharacterStyleKey: aiForm.mainCharacterStyle,
      mainCharacterStyleLabel: selectedHeroineLabel,
      chapterLengthKey: aiForm.chapterLength,
      chapterLengthLabel: selectedChapterLengthLabel,
      cliffhangerTypeKey: aiForm.cliffhangerType,
      cliffhangerLabel: selectedCliffhangerLabel,
      humiliationLevel: aiForm.humiliationLevel,
      revengeIntensity: aiForm.revengeIntensity,
      nextChapterNumber: Number(nextChapterNumber || 1),
      selectedStoryTitle: selectedStory?.title || '(chưa chọn story)',
      selectedStoryId: selectedStory?.id || null,
      recentChaptersCount: recentChapters.length,
    }),
    [
      aiForm.provider,
      aiForm.mode,
      aiForm.modelKey,
      aiForm.moduleId,
      aiForm.category,
      aiForm.mainCharacterStyle,
      aiForm.chapterLength,
      aiForm.cliffhangerType,
      aiForm.humiliationLevel,
      aiForm.revengeIntensity,
      nextChapterNumber,
      selectedModelLabel,
      selectedGenreLabel,
      selectedHeroineLabel,
      selectedChapterLengthLabel,
      selectedCliffhangerLabel,
      selectedStory?.title,
      selectedStory?.id,
      recentChapters.length,
      willSendToOpenAI,
    ]
  )

  const filteredStories = useMemo(() => {
    const q = storyQuery.trim().toLowerCase()

    if (!q) return storyOptions.slice(0, 8)

    return storyOptions.filter((story) => {
      return (
        story.title.toLowerCase().includes(q) ||
        story.slug.toLowerCase().includes(q) ||
        String(story.author || '').toLowerCase().includes(q)
      )
    })
  }, [storyOptions, storyQuery])

  const previewStats = useMemo(() => {
    const chars = preview.length
    const lines = preview ? preview.split('\n').length : 1

    return { chars, lines }
  }, [preview])

  const hasPreview = Boolean(preview.trim())
  const isContinuationStory = Boolean(selectedStory?.id && recentChapters.length > 0)

  useEffect(() => {
    let ignore = false

    async function loadStories() {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select('id, title, slug, author, status, description, cover_image, genres')
          .order('created_at', { ascending: false })

        if (error) throw error

        if (!ignore) {
          setStories(data || [])
          setStoryOptions(data || [])
        }
      } catch {
        if (!ignore) {
          setStories([])
          setStoryOptions([])
          setMessage('Không load được danh sách truyện.')
        }
      }
    }

    async function loadCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug')
          .order('created_at', { ascending: false })

        if (error) throw error

        if (!ignore) {
          const mapped =
            data?.map((item: any) => ({
              value: item.slug,
              label: item.name,
            })) || []

          if (mapped.length) {
            setCategories(mapped)

            setAiForm((prev) => {
              const exists = mapped.some((item) => item.value === prev.category)
              return exists ? prev : { ...prev, category: mapped[0].value }
            })
          }
        }
      } catch {
        if (!ignore) {
          setCategories(fallbackCategories)
        }
      }
    }

    void loadStories()
    void loadCategories()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadRecentChapters() {
      if (!selectedStory?.id) {
        setRecentChapters([])
        setNextChapterNumber(1)
        return
      }

      setContextLoading(true)

      try {
        const { data, error } = await supabase
          .from('chapters')
          .select('id, title, slug, summary, content, chapter_number, created_at')
          .eq('story_id', selectedStory.id)
          .order('chapter_number', { ascending: false })
          .limit(3)

        if (error) throw error

        const chapters = data || []

        const numbers = chapters
          .map((chapter: any) => Number(chapter.chapter_number || 0))
          .filter((number) => Number.isFinite(number) && number > 0)

        let nextNumber = 1

        if (numbers.length > 0) {
          nextNumber = Math.max(...numbers) + 1
        } else {
          const { count } = await supabase
            .from('chapters')
            .select('id', { count: 'exact', head: true })
            .eq('story_id', selectedStory.id)

          nextNumber = typeof count === 'number' ? count + 1 : chapters.length + 1
        }

        if (!ignore) {
          setRecentChapters(chapters)
          setNextChapterNumber(nextNumber)
        }
      } catch {
        if (!ignore) {
          setRecentChapters([])
          setNextChapterNumber(1)
          setMessage('Không load được chương gần nhất của truyện.')
        }
      } finally {
        if (!ignore) {
          setContextLoading(false)
        }
      }
    }

    void loadRecentChapters()

    return () => {
      ignore = true
    }
  }, [selectedStory?.id])

  useEffect(() => {
    const firstGenre = Array.isArray((selectedStory as any)?.genres)
      ? (selectedStory as any).genres[0]
      : ''

    if (!firstGenre) return

    setAiForm((prev) => {
      const exists = categoryOptions.some((item) => item.value === firstGenre)

      if (!exists) return prev

      return {
        ...prev,
        category: firstGenre,
      }
    })
  }, [selectedStory?.id, categories])

  useEffect(() => {
    setAiForm((prev) => {
      const nextCategory = categoryOptions.some((item) => item.value === prev.category)
        ? prev.category
        : categoryOptions[0]?.value || prev.category

      const nextMainCharacterStyle = optionExists(mainCharacterOptions, prev.mainCharacterStyle)
        ? prev.mainCharacterStyle
        : DEFAULT_MAIN_CHARACTER_STYLE

      const nextCliffhangerType = optionExists(cliffhangerOptions, prev.cliffhangerType)
        ? prev.cliffhangerType
        : DEFAULT_CLIFFHANGER_TYPE

      if (
        nextCategory === prev.category &&
        nextMainCharacterStyle === prev.mainCharacterStyle &&
        nextCliffhangerType === prev.cliffhangerType
      ) {
        return prev
      }

      return {
        ...prev,
        category: nextCategory,
        mainCharacterStyle: nextMainCharacterStyle,
        cliffhangerType: nextCliffhangerType,
      }
    })
  }, [categories])

  useEffect(() => {
    setConfirmOpenAIPayload(false)
  }, [
    aiForm.provider,
    aiForm.mode,
    aiForm.modelKey,
    aiForm.moduleId,
    aiForm.category,
    aiForm.mainCharacterStyle,
    aiForm.chapterLength,
    aiForm.cliffhangerType,
    aiForm.humiliationLevel,
    aiForm.revengeIntensity,
    aiForm.promptIdea,
    selectedStory?.id,
    nextChapterNumber,
  ])

  function updateAiForm<K extends keyof AIFormState>(key: K, value: AIFormState[K]) {
    setAiForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  async function copyText(text: string, successMessage: string) {
    if (!text.trim()) {
      setMessage('Chưa có nội dung để copy.')
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setMessage(successMessage)
    } catch {
      setMessage('Không copy được. Trình duyệt có thể đang chặn clipboard.')
    }
  }

  function getReaderOnly() {
    return extractReaderOnly(preview)
  }

  function getDraftTitle() {
    return getChapterTitleFromReader(getReaderOnly(), selectedStory?.title || 'Chương nháp AI')
  }

  function getStoryTitleFromPreview() {
    return getStoryTitleFromPreviewText({
      preview,
      fallbackTitle: selectedStory?.title || aiForm.promptIdea.trim() || 'Truyện nháp AI Writer',
    })
  }

  function getStoryDescriptionFromPreview() {
    const fromStructuredPreview = getStoryDescriptionFromPreviewText({
      preview,
      fallbackDescription: '',
    })

    const fromReaderPreview = extractPublicDescriptionFromPreview(preview)

    const rawDescription =
      fromStructuredPreview ||
      fromReaderPreview ||
      aiForm.promptIdea.trim() ||
      selectedStory?.description ||
      'Một câu chuyện mới đang chờ được khám phá.'

    const lines = rawDescription
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    if (lines.length >= 2) {
      return lines.slice(0, 4).join('\n\n')
    }

    const sentences = rawDescription
      .replace(/\s+/g, ' ')
      .split(/(?<=[.!?。！？])\s+/)
      .map((line) => line.trim())
      .filter(Boolean)

    if (sentences.length >= 2) {
      return sentences.slice(0, 4).join('\n\n')
    }

    if (rawDescription.length > 320) {
      return `${rawDescription.slice(0, 317).trim()}...`
    }

    return rawDescription
  }

  function handleClear() {
    setPreview('')
    setMessage(null)
  }

  async function handleGenerate() {
    if (aiForm.provider === 'openai' && !confirmOpenAIPayload) {
      setMessage('Hãy xác nhận payload trước khi gửi vào OpenAI API.')
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      if (aiForm.provider === 'mock') {
        window.setTimeout(() => {
          const output =
            aiForm.mode === 'story-plan'
              ? buildStoryPlanMock({ form: aiForm, selectedStory, categoryOptions })
              : buildChapterMock({ form: aiForm, selectedStory, categoryOptions })

          setPreview(output)
          setMessage('Đã tạo nội dung mock.')
          setLoading(false)
        }, 350)

        return
      }

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: aiForm.mode,
          provider: aiForm.provider,
          modelKey: aiForm.modelKey,
          moduleId: aiForm.moduleId,
          title: selectedStory?.title || '',
          storySummary: selectedStory?.description || '',
          promptIdea: aiForm.promptIdea,
          genreLabel: selectedGenreLabel,
          mainCharacterStyleLabel: selectedHeroineLabel,
          chapterLengthLabel: selectedChapterLengthLabel,
          cliffhangerLabel: selectedCliffhangerLabel,
          humiliationLevel: aiForm.humiliationLevel,
          revengeIntensity: aiForm.revengeIntensity,
          nextChapterNumber: Number(nextChapterNumber || 1),
          recentChapters: recentChapters.map((chapter) => ({
            title: chapter.title || '',
            summary: chapter.summary || '',
            content: chapter.content || '',
          })),
          storyMemory: selectedStory
            ? [
                `Truyện đang chọn: ${selectedStory.title}.`,
                selectedStory.description || '',
                `Thể loại khóa: ${selectedGenreLabel}.`,
                `Kiểu nữ chính khóa: ${selectedHeroineLabel}.`,
                `Kiểu kết chương: ${selectedCliffhangerLabel}.`,
                `Model profile: ${selectedModelLabel}.`,
              ]
                .filter(Boolean)
                .join('\n')
            : [
                `Thể loại khóa: ${selectedGenreLabel}.`,
                `Kiểu nữ chính khóa: ${selectedHeroineLabel}.`,
                `Kiểu kết chương: ${selectedCliffhangerLabel}.`,
                `Model profile: ${selectedModelLabel}.`,
              ].join('\n'),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'OpenAI API lỗi.')
      }

      if (!data?.text) {
        throw new Error('OpenAI không trả nội dung.')
      }

      setPreview(data.text)
      setMessage(
        `Đã generate bằng OpenAI API${data.model ? ` (${data.model})` : ''}${
          data.modelKey ? ` • Profile: ${data.modelKey}` : ''
        }.`
      )
    } catch (err: any) {
      setMessage(`Generate thất bại: ${String(err?.message ?? err)}`)
    } finally {
      setLoading(false)
    }
  }

  async function generateCoverAndAttachToStory(story: StoryLite) {
    if (!story?.id) {
      throw new Error('Story chưa có id để gắn cover.')
    }

    setCoverLoading(true)

    try {
      const prompt = buildFullCoverPrompt({
        selectedStory: story,
        preview,
        aiForm,
        categoryOptions,
      })

      const response = await fetch('/api/ai/generate-cover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          size: '1024x1536',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Generate cover failed')
      }

      const publicUrl = await uploadGeneratedCover({
        imageBase64: data.imageBase64,
        mimeType: data.mimeType || 'image/png',
        storyId: story.id,
        storyTitle: story.title,
      })

      const { error: updateError } = await supabase
        .from('stories')
        .update({ cover_image: publicUrl })
        .eq('id', story.id)

      if (updateError) throw updateError

      const updatedStory: StoryLite = {
        ...story,
        cover_image: publicUrl,
      }

      setSelectedStory(updatedStory)

      setStoryOptions((prev) =>
        prev.map((item) => (String(item.id) === String(story.id) ? updatedStory : item))
      )

      return publicUrl
    } finally {
      setCoverLoading(false)
    }
  }

  async function createStoryDraftFromPreview() {
    if (!preview.trim()) {
      setMessage('Chưa có preview để tạo truyện.')
      return
    }

    const title = getStoryTitleFromPreview()
    const description = getStoryDescriptionFromPreview()
    const slugBase = makeSlug(title || 'truyen-nhap-ai')
    const slug = `${slugBase}-${Date.now()}`
    const genreLabel = selectedGenreLabel
    const heroineLabel = selectedHeroineLabel
    const cliffhangerLabel = selectedCliffhangerLabel
    const { data: authData } = await supabase.auth.getUser()
    const ownerId = authData.user?.id ?? null

    try {
      const payload = {
        title,
        slug,
        description,
        author: 'Sưu Tầm',
        status: 'draft',
        genres: aiForm.category ? [aiForm.category] : [],
        story_dna: {
          source: 'ai-writer',
          provider: aiForm.provider,
          model_key: aiForm.modelKey,
          model_label: selectedModelLabel,
          module_key: aiForm.moduleId,
          module_label: findLabel(moduleOptions, aiForm.moduleId),
          genre_key: aiForm.category,
          genre: genreLabel,
          main_character_style_key: aiForm.mainCharacterStyle,
          main_character_style: heroineLabel,
          chapter_length_key: aiForm.chapterLength,
          chapter_length: selectedChapterLengthLabel,
          cliffhanger_type_key: aiForm.cliffhangerType,
          cliffhanger_type: cliffhangerLabel,
          humiliation_level: aiForm.humiliationLevel,
          revenge_intensity: aiForm.revengeIntensity,
        },
        story_memory: {
          created_from: 'ai-writer-story-plan',
          genre: genreLabel,
          heroine: heroineLabel,
          cliffhanger: cliffhangerLabel,
          preview,
        },
        current_arc: 'Khởi đầu truyện / setup xung đột chính',
        emotion_tags: [genreLabel, heroineLabel, cliffhangerLabel].filter(Boolean),
      }

      const { data, error } = await supabase
        .from('stories')
        .insert([payload])
        .select('id, title, slug, author, status, description, cover_image, genres')
        .single()

      if (error) {
        const msg = String(error.message || error)

        if (
          msg.toLowerCase().includes('story_dna') ||
          msg.toLowerCase().includes('story_memory') ||
          msg.toLowerCase().includes('current_arc') ||
          msg.toLowerCase().includes('emotion_tags') ||
          msg.toLowerCase().includes('visibility')
        ) {
          const fallbackPayload = {
            title,
            slug,
            description,
            author: 'Sưu Tầm',
            status: 'draft',
            owner_id: ownerId,
            genres: aiForm.category ? [aiForm.category] : [],
          }

          const fallback = await supabase
            .from('stories')
            .insert([fallbackPayload])
            .select('id, title, slug, author, status, description, cover_image, genres')
            .single()

          if (fallback.error) throw fallback.error

          setSelectedStory(fallback.data)
          setStoryOptions((prev) => [fallback.data, ...prev])
          setMessage(`Đã tạo Story Draft: ${fallback.data.title}. Đang vẽ ảnh bìa...`)

          try {
            await generateCoverAndAttachToStory(fallback.data)
            setMessage(`Đã tạo Story Draft và gắn ảnh bìa: ${fallback.data.title}`)
          } catch (coverError: any) {
            setMessage(
              `Đã tạo Story Draft nhưng vẽ/gắn ảnh bìa lỗi: ${String(
                coverError?.message ?? coverError
              )}`
            )
          }

          return
        }

        throw error
      }

      setSelectedStory(data)
      setStoryOptions((prev) => [data, ...prev])
      setMessage(`Đã tạo Story Draft: ${data.title}. Đang vẽ ảnh bìa...`)

      try {
        await generateCoverAndAttachToStory(data)
        setMessage(`Đã tạo Story Draft và gắn ảnh bìa: ${data.title}`)
      } catch (coverError: any) {
        setMessage(
          `Đã tạo Story Draft nhưng vẽ/gắn ảnh bìa lỗi: ${String(
            coverError?.message ?? coverError
          )}`
        )
      }
    } catch (err: any) {
      setMessage(`Tạo Story Draft thất bại: ${String(err?.message ?? err)}`)
    }
  }

  async function saveDraft(source: 'insert' | 'draft') {
    if (!preview.trim()) {
      setMessage('Chưa có nội dung để lưu.')
      return
    }

    const readerOnly = getReaderOnly()
    const title = getDraftTitle()
    const slugBase = makeSlug(title || 'chuong-nhap-ai')
    const slug = `${slugBase}-${Date.now()}`

    const localPayload = {
      story_id: selectedStory?.id || null,
      story_slug: selectedStory?.slug || null,
      story_title: selectedStory?.title || null,
      title,
      slug,
      content: readerOnly,
      full_output: preview,
      chapter_number: nextChapterNumber,
      created_at: new Date().toISOString(),
      source,
      ai_options: {
        provider: aiForm.provider,
        model_key: aiForm.modelKey,
        genre_key: aiForm.category,
        genre_label: selectedGenreLabel,
        main_character_style_key: aiForm.mainCharacterStyle,
        main_character_style_label: selectedHeroineLabel,
        cliffhanger_type_key: aiForm.cliffhangerType,
        cliffhanger_type_label: selectedCliffhangerLabel,
      },
    }

    localStorage.setItem('storyPlatform.aiWriter.chapterDraft', JSON.stringify(localPayload))

    if (source === 'insert') {
      setMessage('Đã đưa nội dung vào draft local. Có thể dùng để đổ vào form Chapter.')
      return
    }

    const storyId = selectedStory?.id || null

    if (!storyId) {
      setMessage('Chọn truyện trước khi lưu draft chapter vào Supabase.')
      return
    }

    try {
      const payload = {
        story_id: storyId,
        title,
        slug,
        content: readerOnly,
        summary: aiForm.promptIdea.trim() || null,
        chapter_number: nextChapterNumber,
        status: 'draft',
      }

      const { error } = await supabase.from('chapters').insert([payload])

      if (error) {
        const msg = String(error.message || error)

        if (msg.toLowerCase().includes('status')) {
          const fallbackPayload = { ...payload } as any
          delete fallbackPayload.status

          const fallback = await supabase.from('chapters').insert([fallbackPayload])

          if (fallback.error) throw fallback.error
        } else {
          throw error
        }
      }

      setMessage(`Đã lưu Draft Chapter: Chương ${nextChapterNumber} — ${title}`)
      setNextChapterNumber((prev) => prev + 1)
    } catch (err: any) {
      setMessage(`Lưu draft thất bại: ${String(err?.message ?? err)}`)
    }
  }

  const coverPrompt = buildFullCoverPrompt({
    selectedStory,
    preview,
    aiForm,
    categoryOptions,
  })

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
      <h2 className="text-lg font-semibold text-zinc-100">AI Generate</h2>
      <div className="mt-1 text-xs text-emerald-300">AI Writer UI v2 active</div>

      <div className="mt-5 grid gap-5">
        <StoryPicker
          storyQuery={storyQuery}
          setStoryQuery={setStoryQuery}
          filteredStories={filteredStories}
          selectedStory={selectedStory}
          setSelectedStory={setSelectedStory}
          setMessage={setMessage}
        />

        {selectedStory ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-300">
            {contextLoading ? (
              <span>Đang load chương gần nhất...</span>
            ) : (
              <span>
                Context: đã load {recentChapters.length} chương gần nhất. Chương tiếp theo:{' '}
                <span className="font-semibold text-amber-300">{nextChapterNumber}</span>.
              </span>
            )}
          </div>
        ) : null}

        <label className="grid gap-1 text-xs text-zinc-400">
          Prompt idea
          <input
            value={aiForm.promptIdea}
            onChange={(event) => updateAiForm('promptIdea', event.target.value)}
            placeholder="Ví dụ: Bị chồng sắp cưới hủy hôn ngay trên sân khấu"
            className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400"
          />
        </label>

        <div className="grid gap-5 lg:grid-cols-3">
          <SelectField
            label="Nguồn tạo nội dung"
            value={aiForm.provider}
            options={providerOptions}
            onChange={(value) => updateAiForm('provider', value as AIFormState['provider'])}
          />

          <SelectField
            label="Model viết chương"
            value={aiForm.modelKey}
            options={modelKeyOptions}
            onChange={(value) => updateAiForm('modelKey', value as AIFormState['modelKey'])}
          />

          <div className="flex min-h-[88px] flex-col justify-center rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <div className="text-[11px] uppercase tracking-wide text-zinc-400">
              Model profile hiện tại
            </div>

            <div className="mt-1 text-sm font-semibold leading-snug text-amber-300">
              {aiForm.modelKey === 'economy'
                ? 'Tiết kiệm — gpt-4.1-mini'
                : aiForm.modelKey === 'premium'
                  ? 'Cao cấp — map theo backend'
                  : 'Tự động — chọn theo độ quan trọng'}
            </div>

            <div className="mt-2 text-xs text-zinc-400">
              Provider:{' '}
              <span className="font-medium text-zinc-200">
                {aiForm.provider === 'openai' ? 'OpenAI API' : 'Mock local'}
              </span>
            </div>
          </div>

          <SelectField
            label="Chế độ"
            value={aiForm.mode}
            options={modeOptions}
            onChange={(value) => updateAiForm('mode', value as AIFormState['mode'])}
          />

          <SelectField
            label="Công thức viết truyện"
            value={aiForm.moduleId}
            options={moduleOptions}
            onChange={(value) => updateAiForm('moduleId', value as AIFormState['moduleId'])}
            disabled={isContinuationStory}
          />

          <SelectField
            label="Thể loại"
            value={aiForm.category}
            options={categoryOptions}
            onChange={(value) => updateAiForm('category', value)}
            disabled={isContinuationStory}
          />

          <SelectField
            label="Kiểu nữ chính"
            value={aiForm.mainCharacterStyle}
            options={mainCharacterOptions}
            onChange={(value) => updateAiForm('mainCharacterStyle', value)}
            disabled={isContinuationStory}
          />

          <SelectField
            label="Độ dài chương"
            value={aiForm.chapterLength}
            options={chapterLengthOptions}
            onChange={(value) =>
              updateAiForm('chapterLength', value as AIFormState['chapterLength'])
            }
          />

          <SelectField
            label="Kiểu kết chương"
            value={aiForm.cliffhangerType}
            options={cliffhangerOptions}
            onChange={(value) => updateAiForm('cliffhangerType', value)}
          />

          <div>
            <label className="text-xs text-zinc-400">Mức uất ức</label>
            <input
              type="range"
              min={1}
              max={5}
              value={aiForm.humiliationLevel}
              onChange={(event) => updateAiForm('humiliationLevel', Number(event.target.value))}
              className="w-full"
            />
            <div className="text-xs text-zinc-400">{aiForm.humiliationLevel}</div>
          </div>

          <div>
            <label className="text-xs text-zinc-400">Mức trả thù</label>
            <input
              type="range"
              min={1}
              max={5}
              value={aiForm.revengeIntensity}
              onChange={(event) => updateAiForm('revengeIntensity', Number(event.target.value))}
              className="w-full"
            />
            <div className="text-xs text-zinc-400">{aiForm.revengeIntensity}</div>
          </div>
        </div>

        <div
          className={`rounded-xl border p-4 text-xs ${
            willSendToOpenAI
              ? 'border-emerald-500/20 bg-emerald-500/5 text-zinc-200'
              : 'border-amber-500/20 bg-amber-500/5 text-zinc-200'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-semibold">
              {willSendToOpenAI
                ? 'Payload chuẩn bị gửi vào OpenAI API'
                : 'Payload hiện tại chỉ dùng mock, chưa gửi OpenAI API'}
            </div>

            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                willSendToOpenAI
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : 'bg-amber-500/15 text-amber-300'
              }`}
            >
              {willSendToOpenAI ? 'SẼ GỬI API' : 'KHÔNG GỬI API'}
            </span>
          </div>

          <div className="mt-3 grid gap-1.5 text-sm">
            <div>
              Endpoint:{' '}
              <span className="font-semibold text-zinc-100">{requestPreview.endpoint}</span>
            </div>
            <div>
              Provider:{' '}
              <span className="font-semibold text-zinc-100">
                {requestPreview.provider === 'openai' ? 'OpenAI API' : 'Mock local'}
              </span>
            </div>
            <div>
              Story:{' '}
              <span className="font-semibold text-zinc-100">
                {requestPreview.selectedStoryTitle}
              </span>
            </div>
            <div>
              Thể loại:{' '}
              <span className="font-semibold text-amber-300">{requestPreview.genreLabel}</span>
            </div>
            <div>
              Kiểu nữ chính:{' '}
              <span className="font-semibold text-amber-300">
                {requestPreview.mainCharacterStyleLabel}
              </span>
            </div>
            <div>
              Kiểu kết chương:{' '}
              <span className="font-semibold text-amber-300">
                {requestPreview.cliffhangerLabel}
              </span>
            </div>
            <div>
              Model:{' '}
              <span className="font-semibold text-zinc-100">
                {requestPreview.modelLabel} ({requestPreview.modelKey})
              </span>
            </div>
            <div>
              Chương tiếp theo:{' '}
              <span className="font-semibold text-zinc-100">
                {requestPreview.nextChapterNumber}
              </span>{' '}
              <span className="text-zinc-400">
                • Context: {requestPreview.recentChaptersCount} chương gần nhất
              </span>
            </div>
          </div>

          <details className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
            <summary className="cursor-pointer text-xs font-medium text-zinc-300">
              Xem payload preview
            </summary>

            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-[11px] leading-5 text-zinc-400">
              {JSON.stringify(requestPreview, null, 2)}
            </pre>
          </details>

          {willSendToOpenAI ? (
            <label className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-zinc-950/40 p-3">
              <input
                type="checkbox"
                checked={confirmOpenAIPayload}
                onChange={(event) => setConfirmOpenAIPayload(event.target.checked)}
                className="mt-0.5"
              />
              <span className="text-xs text-zinc-300">
                Tao xác nhận các option ở trên là đúng và cho phép gửi payload này vào OpenAI
                API trước khi generate.
              </span>
            </label>
          ) : (
            <div className="mt-4 rounded-lg border border-amber-500/20 bg-zinc-950/40 p-3 text-xs text-zinc-300">
              Hiện đang ở chế độ <span className="font-semibold text-amber-300">Mock</span>,
              nên chưa gửi sang OpenAI API.
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || (willSendToOpenAI && !confirmOpenAIPayload)}
            className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? aiForm.provider === 'openai'
                ? 'Đang gọi OpenAI API...'
                : 'Đang tạo nội dung mock...'
              : willSendToOpenAI && !confirmOpenAIPayload
                ? 'Xác nhận payload để Generate'
                : 'Generate'}
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-zinc-100 hover:bg-zinc-700"
          >
            Clear
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <SelectField
            label="Phong cách bìa"
            value={aiForm.coverStyle}
            options={coverStyleOptions}
            onChange={(value) => updateAiForm('coverStyle', value)}
          />

          <SelectField
            label="Tông màu bìa"
            value={aiForm.colorTheme}
            options={colorThemeOptions}
            onChange={(value) => updateAiForm('colorTheme', value)}
          />

          <SelectField
            label="Khí chất nhân vật"
            value={aiForm.characterVibe}
            options={characterVibeOptions}
            onChange={(value) => updateAiForm('characterVibe', value)}
          />
        </div>

        <AIWriterPreviewPanel
          preview={preview}
          loading={loading}
          provider={aiForm.provider}
          hasPreview={hasPreview && !coverLoading}
          previewStats={previewStats}
          message={message}
          onCreateStoryDraft={createStoryDraftFromPreview}
          onInsertChapter={() => saveDraft('insert')}
          onCopyAll={() => copyText(preview, 'Đã copy toàn bộ output.')}
          onCopyReaderOnly={() => copyText(getReaderOnly(), 'Đã copy BẢN ĐỌC CHO ĐỘC GIẢ.')}
          onClear={handleClear}
          onCopyCoverPrompt={() => copyText(coverPrompt, 'Đã copy cover prompt đầy đủ.')}
          onSaveDraftChapter={() => saveDraft('draft')}
          canGenerateCover={Boolean(selectedStory?.id)}
          coverLoading={coverLoading}
          onGenerateCover={async () => {
            try {
              if (!selectedStory?.id) {
                setMessage('Hãy chọn story trước.')
                return
              }

              setMessage('Đang generate cover...')
              const coverUrl = await generateCoverAndAttachToStory(selectedStory)

              setSelectedStory((prev) => (prev ? { ...prev, cover_image: coverUrl } : prev))

              setStoryOptions((prev) =>
                prev.map((item) =>
                  String(item.id) === String(selectedStory.id)
                    ? { ...item, cover_image: coverUrl }
                    : item
                )
              )

              setMessage('Đã generate và gắn cover vào truyện.')
            } catch (error: any) {
              setMessage(`Generate cover thất bại: ${String(error?.message ?? error)}`)
            }
          }}
        />
      </div>
    </section>
  )
}