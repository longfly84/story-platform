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
  const [aiForm, setAiForm] = useState<AIFormState>({
    mode: 'chapter',
    provider: 'mock',
    moduleId: 'female-urban-viral',
    category: fallbackCategories[0].value,
    mainCharacterStyle: 'patient-counterattack',
    chapterLength: 'medium',
    cliffhangerType: 'new-evidence',
    coverStyle: 'minimal-portrait',
    colorTheme: 'warm-gold',
    characterVibe: 'stoic',
    promptIdea: '',
    humiliationLevel: 3,
    revengeIntensity: 3,
  })

  const categoryOptions = categories.length ? categories : fallbackCategories

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

  useEffect(() => {
    let ignore = false

    async function loadStories() {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select('id, title, slug, author, status, description')
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

    loadStories()
    loadCategories()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadRecentChapters() {
      if (!selectedStory?.id) {
        setRecentChapters([])
        return
      }

      setContextLoading(true)

      try {
        const { data, error } = await supabase
          .from('chapters')
          .select('id, title, slug, summary, content, created_at')
          .eq('story_id', selectedStory.id)
          .order('created_at', { ascending: false })
          .limit(3)

        if (error) throw error

        if (!ignore) {
          setRecentChapters(data || [])
        }
      } catch {
        if (!ignore) {
          setRecentChapters([])
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
    return getStoryDescriptionFromPreviewText({
      preview,
      fallbackDescription:
        aiForm.promptIdea.trim() || selectedStory?.description || 'Truyện được tạo từ AI Writer.',
    })
  }

  function handleClear() {
    setPreview('')
    setMessage(null)
  }

  async function handleGenerate() {
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
          setLoading(false)
        }, 350)

        return
      }

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: aiForm.mode,
          moduleId: aiForm.moduleId,
          title: selectedStory?.title || '',
          storySummary: selectedStory?.description || '',
          promptIdea: aiForm.promptIdea,
          genreLabel: findLabel(categoryOptions, aiForm.category),
          mainCharacterStyleLabel: findLabel(mainCharacterOptions, aiForm.mainCharacterStyle),
          chapterLengthLabel: findLabel(chapterLengthOptions, aiForm.chapterLength),
          cliffhangerLabel: findLabel(cliffhangerOptions, aiForm.cliffhangerType),
          humiliationLevel: aiForm.humiliationLevel,
          revengeIntensity: aiForm.revengeIntensity,
          recentChapters: recentChapters.map((chapter) => ({
            title: chapter.title || '',
            summary: chapter.summary || '',
            content: chapter.content || '',
          })),
          storyMemory: selectedStory
            ? `Truyện đang chọn: ${selectedStory.title}. ${selectedStory.description || ''}`
            : '',
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
      setMessage(`Đã generate bằng OpenAI API${data.model ? ` (${data.model})` : ''}.`)
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
    const genreLabel = findLabel(categoryOptions, aiForm.category)
    const { data: authData } = await supabase.auth.getUser()
    const ownerId = authData.user?.id ?? null
    try {
      const payload = {
        title,
        slug,
        description,
        author: 'AI Writer',
        status: 'draft',
        genres: aiForm.category ? [aiForm.category] : [],
        story_dna: {
          source: 'ai-writer',
          module: aiForm.moduleId,
          genre: genreLabel,
          main_character_style: findLabel(mainCharacterOptions, aiForm.mainCharacterStyle),
          chapter_length: findLabel(chapterLengthOptions, aiForm.chapterLength),
          cliffhanger_type: findLabel(cliffhangerOptions, aiForm.cliffhangerType),
          humiliation_level: aiForm.humiliationLevel,
          revenge_intensity: aiForm.revengeIntensity,
        },
        story_memory: {
          created_from: 'ai-writer-story-plan',
          preview,
        },
        current_arc: 'Khởi đầu truyện / setup xung đột chính',
        emotion_tags: [genreLabel, findLabel(mainCharacterOptions, aiForm.mainCharacterStyle)],
      }

      const { data, error } = await supabase
        .from('stories')
        .insert([payload])
        .select('id, title, slug, author, status, description')
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
            author: 'AI Writer',
            status: 'draft',
            owner_id: ownerId,
            genres: aiForm.category ? [aiForm.category] : [],
          }

          const fallback = await supabase
            .from('stories')
            .insert([fallbackPayload])
            .select('id, title, slug, author, status, description')
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
      created_at: new Date().toISOString(),
      source,
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

      setMessage('Đã lưu draft chapter vào Supabase.')
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
                Context: đã load {recentChapters.length} chương gần nhất để gửi vào AI.
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
            label="Công thức viết truyện"
            value={aiForm.moduleId}
            options={moduleOptions}
            onChange={(value) => updateAiForm('moduleId', value as AIFormState['moduleId'])}
          />

          <SelectField
            label="Chế độ"
            value={aiForm.mode}
            options={modeOptions}
            onChange={(value) => updateAiForm('mode', value as AIFormState['mode'])}
          />

          <SelectField
            label="Thể loại"
            value={aiForm.category}
            options={categoryOptions}
            onChange={(value) => updateAiForm('category', value)}
          />

          <SelectField
            label="Kiểu nữ chính"
            value={aiForm.mainCharacterStyle}
            options={mainCharacterOptions}
            onChange={(value) => updateAiForm('mainCharacterStyle', value)}
          />

          <SelectField
            label="Độ dài chương"
            value={aiForm.chapterLength}
            options={chapterLengthOptions}
            onChange={(value) =>
              updateAiForm('chapterLength', value as AIFormState['chapterLength'])
            }
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

          <SelectField
            label="Kiểu kết chương"
            value={aiForm.cliffhangerType}
            options={cliffhangerOptions}
            onChange={(value) => updateAiForm('cliffhangerType', value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-zinc-950 disabled:opacity-60"
          >
            {loading
              ? aiForm.provider === 'openai'
                ? 'Đang gọi OpenAI API...'
                : 'Đang tạo nội dung mock...'
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
      />  
      </div>
    </section>
  )
}