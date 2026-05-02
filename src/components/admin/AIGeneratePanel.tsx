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



function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1 text-xs text-zinc-400">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm font-medium text-zinc-100 outline-none focus:border-amber-400"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}



function getMarkdownSection(markdown: string, heading: string) {
  const lines = markdown.split('\n')
  const headingIndex = lines.findIndex((line) => line.trim() === heading)

  if (headingIndex === -1) return ''

  const collected: string[] = []

  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    const line = lines[index]

    if (line.trim().startsWith('## ') || line.trim().startsWith('# ')) break

    collected.push(line)
  }

  return collected.join('\n').trim()
}

function extractReaderOnly(preview: string) {
  const marker = '# BẢN ĐỌC CHO ĐỘC GIẢ'
  const techMarker = '---'

  const markerIndex = preview.indexOf(marker)

  if (markerIndex === -1) return preview.trim()

  const afterMarker = preview.slice(markerIndex).trim()
  const techIndex = afterMarker.indexOf(techMarker)

  if (techIndex === -1) return afterMarker.trim()

  return afterMarker.slice(0, techIndex).trim()
}

function buildFullCoverPrompt({
  selectedStory,
  preview,
  aiForm,
  categoryOptions,
}: {
  selectedStory: StoryLite | null
  preview: string
  aiForm: AIFormState
  categoryOptions: Option[]
}) {
  const title =
    selectedStory?.title ||
    getMarkdownSection(preview, '## Tên truyện')
      .split('\n')
      .find((line) => line.trim()) ||
    'Sau Khi Bị Phản Bội, Tôi Khiến Cả Nhà Họ Quỳ Xin Lỗi'

  const genreLabel = findLabel(categoryOptions, aiForm.category)
  const styleLabel = findLabel(mainCharacterOptions, aiForm.mainCharacterStyle)
  const coverStyleLabel = findLabel(coverStyleOptions, aiForm.coverStyle)
  const colorThemeLabel = findLabel(colorThemeOptions, aiForm.colorTheme)
  const characterVibeLabel = findLabel(characterVibeOptions, aiForm.characterVibe)

  const summary =
    aiForm.promptIdea.trim() ||
    selectedStory?.description ||
    getMarkdownSection(preview, '## Logline') ||
    getMarkdownSection(preview, '## Tóm tắt') ||
    'A betrayed bride is publicly humiliated during an engagement ceremony, but she secretly holds evidence that can destroy the wealthy family that betrayed her.'

  return `Create a premium vertical web-novel cover illustration.

Format: 2:3 vertical book cover, polished digital illustration, highly detailed, cinematic, premium, commercial-quality cover art.

Story title: "${title}"
Genre: ${genreLabel}
Story engine style: Nữ tần đô thị viral Trung Quốc
Story summary: ${summary}

Visual style:
${coverStyleLabel}, high-detail anime cover illustration, emotional facial expressions, cinematic framing, polished web-novel cover quality, dramatic lighting, glossy premium finish.

Color direction:
${colorThemeLabel}, dark luxury atmosphere, premium elite feeling, cinematic shadows, strong contrast.

Character vibe:
${characterVibeLabel}. The heroine should be emotionally wounded but proud, graceful, cold-eyed, elegant, fragile on the surface yet internally dangerous.

Main subject:
A beautiful female protagonist with the character direction "${styleLabel}". She should be the main focus of the cover. She looks emotionally wounded but strong, elegant, memorable, and ready to take revenge.

Setting:
Modern Chinese urban luxury environment, wealthy families, elite corporate circles, glamorous hotel or banquet hall, crystal chandeliers, luxury fashion, public scandal atmosphere, Weibo/Douyin viral drama feeling.

Composition:
The heroine stands in the foreground. In the blurred background, show hints of betrayal: a man in a formal black suit standing close to another woman, wealthy guests, luxury lights, or a grand engagement ceremony. Keep the heroine dominant and unforgettable.

Mood:
Dark luxury, emotional tension, betrayal, humiliation turning into revenge, female-oriented Chinese urban drama, high-click web novel cover energy.

Important:
Do not add any text, logo, watermark, random letters, or unreadable typography on the cover.
No extra fingers, no distorted face, no low-quality anatomy.
Make it look like a premium anime-style Chinese urban revenge novel cover.`
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
    const readerOnly = getReaderOnly()

    const chapterLine =
      readerOnly
        .split('\n')
        .find((line) => line.trim().startsWith('# Chương')) ||
      selectedStory?.title ||
      'Chương nháp AI'

    return chapterLine
      .replace(/^#+\s*/, '')
      .replace(/^Chương\s*[—-]\s*/i, '')
      .trim()
  }

  function getStoryTitleFromPreview() {
    const planTitle = getMarkdownSection(preview, '## Tên truyện')
      .split('\n')
      .find((line) => line.trim())

    if (planTitle) return planTitle.replace(/^[-*]\s*/, '').trim()

    const chapterTitle = preview.split('\n').find((line) => line.trim().startsWith('# Chương'))

    if (chapterTitle) {
      return chapterTitle
        .replace(/^#+\s*/, '')
        .replace(/^Chương\s*[—-]\s*/i, '')
        .trim()
    }

    return selectedStory?.title || aiForm.promptIdea.trim() || 'Truyện nháp AI Writer'
  }

  function getStoryDescriptionFromPreview() {
    const logline = getMarkdownSection(preview, '## Logline')
    if (logline) return logline

    const summary = getMarkdownSection(preview, '## Tóm tắt')
    if (summary) return summary

    const conflict = getMarkdownSection(preview, '## Mâu thuẫn cốt lõi')
    if (conflict) return conflict

    return aiForm.promptIdea.trim() || selectedStory?.description || 'Truyện được tạo từ AI Writer.'
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
          setMessage(`Đã tạo Story Draft: ${fallback.data.title}`)
          return
        }

        throw error
      }

      setSelectedStory(data)
      setStoryOptions((prev) => [data, ...prev])
      setMessage(`Đã tạo Story Draft: ${data.title}`)
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
        <div className="grid gap-2">
          <label className="grid gap-1 text-xs text-zinc-400">
            Chọn truyện để gán vào chapter / lưu draft
            <input
              value={storyQuery}
              onChange={(event) => setStoryQuery(event.target.value)}
              placeholder="Tìm truyện theo tên, slug, tác giả..."
              className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400"
            />
          </label>

          <div className="grid gap-2">
            {filteredStories.map((story) => (
              <button
                key={story.id}
                type="button"
                onClick={() => {
                  setSelectedStory(story)
                  setStoryQuery(story.title)
                  setMessage(`Đã chọn truyện: ${story.title}`)
                }}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-left text-sm text-zinc-100 hover:border-amber-300"
              >
                <div className="font-semibold">{story.title}</div>
                <div className="text-xs text-zinc-500">
                  {story.author || 'Không rõ tác giả'} • {story.slug}
                </div>
              </button>
            ))}
          </div>

          {selectedStory ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-sm text-zinc-200">
              <div className="font-semibold text-zinc-100">Đã chọn: {selectedStory.title}</div>
              <div className="mt-1 text-xs text-zinc-400">
                ID: {selectedStory.id || 'chưa có'} • {selectedStory.author || 'Không rõ tác giả'} •{' '}
                {selectedStory.slug}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedStory(null)
                  setStoryQuery('')
                  setMessage(null)
                }}
                className="mt-2 rounded bg-zinc-800 px-3 py-1 text-xs text-zinc-100 hover:bg-zinc-700"
              >
                Bỏ chọn
              </button>
            </div>
          ) : null}
        </div>

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

        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-zinc-400">Preview</div>
              <div className="text-xs text-zinc-500">Provider: {aiForm.provider}</div>
            </div>

            <div className="text-xs text-zinc-400">
              Số ký tự: {previewStats.chars} • Dòng: {previewStats.lines}
            </div>
          </div>

          <div className="max-h-[420px] w-full overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-zinc-900/40 p-4 text-sm leading-relaxed text-zinc-100 sm:max-h-[600px]">
            {loading
              ? aiForm.provider === 'openai'
                ? 'Đang gọi OpenAI API...'
                : 'Đang tạo nội dung mock...'
              : preview || 'Chưa có nội dung.'}
          </div>

          {message ? (
            <div className="mt-2 rounded-lg border border-emerald-800 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-300">
              {message}
            </div>
          ) : null}

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              disabled={!hasPreview}
              onClick={createStoryDraftFromPreview}
              className="w-full rounded-lg bg-purple-500 px-4 py-2 text-zinc-950 disabled:opacity-50 sm:w-auto"
            >
              Tạo Story Draft từ Preview
            </button>

            <button
              type="button"
              disabled={!hasPreview}
              onClick={() => saveDraft('insert')}
              className="w-full rounded-lg bg-amber-300 px-4 py-2 text-zinc-900 disabled:opacity-50 sm:w-auto"
            >
              Đưa vào form Chapter
            </button>

            <button
              type="button"
              disabled={!hasPreview}
              onClick={() => copyText(preview, 'Đã copy toàn bộ output.')}
              className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-zinc-100 disabled:opacity-50 sm:w-auto"
            >
              Copy toàn bộ
            </button>

            <button
              type="button"
              disabled={!hasPreview}
              onClick={() => copyText(getReaderOnly(), 'Đã copy BẢN ĐỌC CHO ĐỘC GIẢ.')}
              className="w-full rounded-lg bg-zinc-700 px-4 py-2 text-zinc-100 disabled:opacity-50 sm:w-auto"
            >
              Copy BẢN ĐỌC CHO ĐỘC GIẢ
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="w-full rounded-lg bg-zinc-600 px-4 py-2 text-zinc-100 sm:w-auto"
            >
              Clear Preview
            </button>

            <button
              type="button"
              onClick={() => copyText(coverPrompt, 'Đã copy cover prompt đầy đủ.')}
              className="w-full rounded-lg bg-zinc-700 px-4 py-2 text-zinc-100 sm:w-auto"
            >
              Copy Cover Prompt
            </button>

            <button
              type="button"
              disabled={!hasPreview}
              onClick={() => saveDraft('draft')}
              className="w-full rounded-lg bg-sky-500 px-4 py-2 text-zinc-950 disabled:opacity-50 sm:w-auto"
            >
              Save as Draft Chapter
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}