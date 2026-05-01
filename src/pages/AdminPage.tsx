import { useEffect, useState } from 'react'
import MainLayout from '@/layouts/MainLayout'
import { supabase, signOut, getCurrentUser, resolveCoverUrl } from '@/lib/supabase'
import { GENRE_REGISTRY, buildStoryDNA, buildMockChapter } from '@/lib/storyEngine'
import { COVER_STYLES, COLOR_THEMES, CHARACTER_VIBES, buildCoverPrompt } from '@/lib/coverEngine'
import AdminTopBar from '@/components/admin/AdminTopBar'
import StoriesSection from '@/components/admin/StoriesSection'
import CreateStoryForm from '@/components/admin/CreateStoryForm'
import CategoryManager from '@/components/admin/CategoryManager'
import CreateChapterForm from '@/components/admin/CreateChapterForm'
import ManageChapters from '@/components/admin/ManageChapters'
import AIGeneratePanel from '@/components/admin/AIGeneratePanel'
import StoryMemoryViewer from '@/components/admin/StoryMemoryViewer'

const MAIN_CHARACTER_STYLES: string[] = [
  'Bình tĩnh, lãnh đạm',
  'Nóng tính, bộc trực',
  'Lạnh lùng, tính toán',
  'Vui vẻ, lạc quan',
]

const CLIFFHANGER_TYPES: string[] = ['Reveal', 'Near-death', 'Betrayal', 'Twist']

export default function AdminPage() {
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [expandedChapters, setExpandedChapters] = useState<Record<string, any[]>>({})
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null)
  const [editChapterData, setEditChapterData] = useState<any>(null)
  const [selectedStoryForChapters, setSelectedStoryForChapters] = useState<string | null>(null)

  const [newStory, setNewStory] = useState<any>({ title: '', slug: '', description: '', author: '', status: 'ongoing' })
  const [newVisibility, setNewVisibility] = useState<'published' | 'draft'>('published')
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [newChapter, setNewChapter] = useState({ storySlug: '', title: '', slug: '', content: '', chapter_number: 1, summary: '', cliffhanger: '', important_events: [] as string[], emotion_tags: [] as string[] })

  const [storySlugEdited, setStorySlugEdited] = useState(false)
  const [chapterSlugEdited, setChapterSlugEdited] = useState(false)

  const [aiStorySlug, setAiStorySlug] = useState('')
  const [aiMode] = useState<'new' | 'next'>('new')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiGenreId, setAiGenreId] = useState(GENRE_REGISTRY[0]?.id ?? '')
  const [aiStoryType, setAiStoryType] = useState(GENRE_REGISTRY[0]?.storyTypes?.[0] ?? '')
  const [aiMainStyle, setAiMainStyle] = useState(MAIN_CHARACTER_STYLES[0] ?? '')
  const [aiHumiliation, setAiHumiliation] = useState(3)
  const [aiRevenge, setAiRevenge] = useState(3)
  const [aiCliffhanger, setAiCliffhanger] = useState(CLIFFHANGER_TYPES[0] ?? '')
  const [aiLength, setAiLength] = useState('short')
  const [aiProvider, setAiProvider] = useState<'mock' | 'openai'>('mock')
  const [aiProviderUsed, setAiProviderUsed] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState('')
  const [aiTitle, setAiTitle] = useState('')
  const [aiDnaSummary, setAiDnaSummary] = useState('')
  const [coverStyle, setCoverStyle] = useState(COVER_STYLES[0])
  const [coverColor, setCoverColor] = useState(COLOR_THEMES[0])
  const [coverVibe, setCoverVibe] = useState(CHARACTER_VIBES[0])
  const [coverPrompt, setCoverPrompt] = useState('')
  const [aiMeta, setAiMeta] = useState<any>(null)

  const [selectedMemorySlug, setSelectedMemorySlug] = useState<string | null>(null)
  const [memoryData, setMemoryData] = useState<any>(null)
  const [memoryCollapsed, setMemoryCollapsed] = useState<Record<string, boolean>>({
    active_conflicts: true,
    pending_payoffs: true,
    known_secrets: true,
    relationships: true,
    unresolved_humiliations: true,
    emotion_tags: true,
    current_arc: true,
  })

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [categories, setCategories] = useState<any[]>([])
  const [catName, setCatName] = useState('')
  const [catSlug, setCatSlug] = useState('')
  const [catDesc, setCatDesc] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [createCategorySlug, setCreateCategorySlug] = useState<string>('')

  const [checkingSession, setCheckingSession] = useState(true)

  function generateSlug(input: string) {
    return input
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  }

  async function fetchStories() {
    setLoading(true)
    try {
      const res = await supabase.from('stories').select('*').order('id', { ascending: true })
      if (res.error) throw res.error
      setStories(res.data ?? [])
      setError(null)
    } catch (e: any) {
      setError(String(e?.message ?? e))
    } finally {
      setLoading(false)
    }
  }

  async function fetchCategories() {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setCategories(data || [])
    } catch (e) {
      if (import.meta.env.DEV) console.debug('categories missing or failed to load', e)
      setCategories([])
    }
  }

  useEffect(() => {
    fetchStories()
    fetchCategories()
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const u = await getCurrentUser()
        if (!mounted) return
        if (!u) window.location.href = '/login'
      } finally {
        if (mounted) setCheckingSession(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  function onCatNameChange(v: string) {
    setCatName(v)
    if (!catSlug) setCatSlug(generateSlug(v))
  }

  async function createCategory() {
    if (!catName.trim()) { alert('Name required'); return }
    const slugToUse = catSlug || generateSlug(catName)
    try {
      const { data: exist } = await supabase.from('categories').select('id').eq('slug', slugToUse).limit(1)
      if (exist && exist.length) { alert('Thể loại này đã tồn tại.'); return }
      const payload = { name: catName.trim(), slug: slugToUse, description: catDesc || null }
      const { error } = await supabase.from('categories').insert([payload])
      if (error) throw error
      setCatName('')
      setCatSlug('')
      setCatDesc('')
      await fetchCategories()
    } catch (e: any) {
      const msg = String(e?.message ?? e)
      if (msg.toLowerCase().includes('duplicate') || e?.code === '23505') alert('Thể loại này đã tồn tại.')
      else alert('Create category failed: ' + msg + '\nRun scripts/create_categories.sql if table missing.')
    }
  }

  async function deleteCategory(id: string, slug: string) {
    try {
      const used = stories.some((story) => Array.isArray(story.genres) && story.genres.includes(slug))
      if (used) { alert('Không thể xóa: có truyện đang sử dụng thể loại này.'); return }
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
      await fetchCategories()
    } catch (e: any) {
      alert('Delete category failed: ' + String(e?.message ?? e))
    }
  }

  async function handleCreateStory(e: any) {
    e.preventDefault()
    try {
      let coverUrl: string | null = (newStory as any).cover_image ?? null
      if (newCoverFile) {
        setUploadingCover(true)
        const filePath = `${Date.now()}-${newCoverFile.name}`
        if (import.meta.env.DEV) console.log('[cover-submit]', { hasFile: !!newCoverFile, fileName: newCoverFile?.name, fileSize: newCoverFile?.size })
        try {
          const { error: uploadError } = await supabase.storage.from('covers').upload(filePath, newCoverFile as File)
          if (uploadError) {
            console.error('[cover-upload] uploadError', uploadError)
            alert('Cover upload failed: ' + String(uploadError?.message ?? uploadError))
          } else {
            const publicRes = supabase.storage.from('covers').getPublicUrl(filePath)
            const publicUrl = (publicRes as any)?.data?.publicUrl || null
            if (import.meta.env.DEV) console.log('[cover-upload]', { filePath, uploadError, publicUrl })
            coverUrl = publicUrl
          }
        } finally {
          setUploadingCover(false)
        }
      }

      const payload: any = { ...newStory }
      payload.cover_image = coverUrl ?? null
      payload.genres = createCategorySlug ? [createCategorySlug] : []
      payload.status = newVisibility === 'draft' ? 'draft' : 'published'
      if (import.meta.env.DEV) console.log('[story-insert-payload]', payload)

      const res = await supabase.from('stories').insert([payload])
      if (res.error) throw res.error
      alert('Created')
      setNewStory({ title: '', slug: '', description: '', author: '', status: 'ongoing' })
      setNewVisibility('published')
      setNewCoverFile(null)
      setCreateCategorySlug('')
      setStorySlugEdited(false)
      await fetchStories()
    } catch (err: any) {
      alert('Error: ' + String(err?.message ?? err))
    }
  }

  async function handleCreateChapter(e: any) {
    e.preventDefault()
    try {
      const story = stories.find((s) => s.slug === newChapter.storySlug)
      const payload: any = {
        title: newChapter.title,
        slug: newChapter.slug,
        content: newChapter.content,
      }
      if (story?.id) payload.story_id = story.id
      if (newChapter.summary) payload.summary = newChapter.summary
      if (newChapter.cliffhanger) payload.cliffhanger = newChapter.cliffhanger
      if (newChapter.important_events) payload.important_events = newChapter.important_events
      if (newChapter.emotion_tags) payload.emotion_tags = newChapter.emotion_tags

      const res = await supabase.from('chapters').insert([payload])
      if (res.error) throw res.error
      alert('Chapter created')
      setNewChapter({ storySlug: '', title: '', slug: '', content: '', chapter_number: 1, summary: '', cliffhanger: '', important_events: [], emotion_tags: [] })
      setChapterSlugEdited(false)
      if (story?.slug) await openManageChapters(story.slug)
    } catch (err: any) {
      alert('Error: ' + String(err?.message ?? err))
    }
  }

  async function deleteStory(id: number) {
    try {
      const res = await supabase.from('stories').delete().eq('id', id)
      if (res.error) throw res.error
      await fetchStories()
    } catch (err: any) {
      alert('Delete failed: ' + String(err?.message ?? err))
    }
  }

  async function togglePublish(story: any) {
    try {
      const nextStatus = story?.status === 'draft' ? 'published' : 'draft'
      const { error } = await supabase.from('stories').update({ status: nextStatus }).eq('id', story.id)
      if (error) throw error
      await fetchStories()
    } catch (e) {
      alert('Toggle failed: ' + String(e))
    }
  }

  function startEditChapter(chap: any) {
    setEditingChapterId(chap.id)
    setEditChapterData({ ...chap })
  }

  async function saveEditChapter(e: any) {
    e.preventDefault()
    if (!editingChapterId || !editChapterData) return
    try {
      const payload = {
        title: editChapterData.title,
        slug: editChapterData.slug,
        content: editChapterData.content,
        summary: editChapterData.summary,
        cliffhanger: editChapterData.cliffhanger,
        important_events: editChapterData.important_events,
        emotion_tags: editChapterData.emotion_tags,
      }
      const res = await supabase.from('chapters').update(payload).eq('id', editingChapterId)
      if (res.error) throw res.error
      if (selectedStoryForChapters) await openManageChapters(selectedStoryForChapters)
      setEditingChapterId(null)
      setEditChapterData(null)
    } catch (err: any) {
      alert('Update chapter failed: ' + String(err?.message ?? err))
    }
  }

  async function deleteChapter(id: number, storySlug?: string) {
    if (!confirm('Xác nhận xoá chương?')) return
    try {
      const res = await supabase.from('chapters').delete().eq('id', id)
      if (res.error) throw res.error
      if (storySlug) await openManageChapters(storySlug)
    } catch (err: any) {
      alert('Delete chapter failed: ' + String(err?.message ?? err))
    }
  }

  async function openManageChapters(slug: string) {
    try {
      setSelectedStoryForChapters(slug)
      const sid = stories.find((s) => s.slug === slug)?.id
      const q = supabase.from('chapters').select('*')
      const q2 = sid ? q.eq('story_id', sid) : q.eq('story_slug', slug)
      const { data, error } = await q2.order('created_at', { ascending: true })
      if (error) throw error
      setExpandedChapters((m) => ({ ...m, [slug]: data ?? [] }))
      setTimeout(() => document.getElementById('manage-chapters')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
    } catch (e: any) {
      alert('Load chapters failed: ' + String(e?.message ?? e))
    }
  }

  async function generateMockChapter() {
    setAiLoading(true)
    setAiResult('')
    setAiTitle('')
    setAiDnaSummary('')
    try {
      await new Promise((res) => setTimeout(res, 700))
      const { dna, summary, emotion_tags } = buildStoryDNA({
        storyType: aiStoryType,
        mainStyle: aiMainStyle,
        humiliationLevel: aiHumiliation,
        revengeIntensity: aiRevenge,
        cliffhangerType: aiCliffhanger,
      })

      let contextSummary = ''
      let latestCliff = ''
      if (aiMode === 'next') {
        try {
          const storySlug = aiStorySlug || (newStory as any).slug || ''
          if (storySlug) {
            const sid = stories.find((s) => s.slug === storySlug)?.id
            let q = supabase.from('chapters').select('id, title, slug, content, summary, cliffhanger')
            q = sid ? q.eq('story_id', sid) : q.eq('story_slug', storySlug)
            const { data: last } = await q.order('created_at', { ascending: false }).limit(1)
            if (last && last.length) {
              contextSummary = last[0].summary || last[0].content?.slice(0, 200) || ''
              latestCliff = last[0].cliffhanger || ''
            }
          }
        } catch {}
      }

      let genContent = ''
      let genTitle = ''
      let genDnaSummary = ''
      try {
        if (import.meta.env.DEV) console.debug('[AI] calling /api/ai/generate', { provider: aiProvider, storySlug: aiStorySlug || (newStory as any).slug })
        const resp = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storySlug: aiStorySlug || (newStory as any).slug, genreId: aiGenreId, prompt: aiPrompt + (contextSummary ? (' — context: ' + contextSummary) : ''), length: aiLength, provider: aiProvider }),
        })
        const j = await resp.json()
        if (import.meta.env.DEV) console.debug('[AI] /api/ai/generate response', { ok: j?.ok, status: resp.status, body: j })
        if (j?.ok && j.data) {
          const d = j.data
          genTitle = d.title
          genDnaSummary = d.summary || summary
          genContent = d.content
          setAiProviderUsed(d.provider_meta?.provider || aiProvider)
        } else {
          const errMsg = j?.error || 'Unknown error from /api/ai/generate'
          genContent = `ERROR: ${String(errMsg)}`
          const out = buildMockChapter({ prompt: aiPrompt + (contextSummary ? (' — context: ' + contextSummary) : ''), dna, length: aiLength as any })
          genTitle = out.title
          genDnaSummary = out.dnaSummary
          setAiProviderUsed('mock')
        }
      } catch (e) {
        if (import.meta.env.DEV) console.error('[AI] fetch /api/ai/generate failed', e)
        const out = buildMockChapter({ prompt: aiPrompt + (contextSummary ? (' — context: ' + contextSummary) : ''), dna, length: aiLength as any })
        genTitle = out.title
        genDnaSummary = out.dnaSummary
        genContent = out.content
        setAiProviderUsed('mock')
      }

      setAiTitle(genTitle)
      setAiDnaSummary(genDnaSummary || summary)
      const cp = buildCoverPrompt(dna, { style: coverStyle, color: coverColor, vibe: coverVibe })
      setCoverPrompt(cp)

      const story_memory = (newStory as any).story_memory ?? {
        active_conflicts: [],
        pending_payoffs: [],
        known_secrets: [],
        relationships: {},
        unresolved_humiliations: [],
        current_arc: (newStory as any).current_arc || 'intro',
        arc_progress: (newStory as any).arc_progress ?? 0,
      }

      const newSummary = (genContent || '').split('\n')[0].slice(0, 200)
      const newCliff = latestCliff || (dna?.cliffhangerType || 'Reveal')
      story_memory.recent_summary = newSummary
      story_memory.last_generated_at = new Date().toISOString()
      story_memory.important_events = (story_memory.important_events || []).concat([`Generated: ${newSummary}`])
      story_memory.emotion_tags = Array.from(new Set([...(story_memory.emotion_tags || []), ...(emotion_tags || [])]))
      story_memory.arc_progress = Math.min(100, (story_memory.arc_progress || 0) + (aiMode === 'next' ? 10 : 3))

      setNewStory((s: any) => ({ ...s, story_dna: dna, story_memory, emotion_tags: story_memory.emotion_tags, cover_prompt: cp, cover_style: coverStyle, current_arc: story_memory.current_arc, arc_progress: story_memory.arc_progress }))
      setAiMeta({ summary: newSummary, cliffhanger: newCliff, important_events: story_memory.important_events, emotion_tags: story_memory.emotion_tags })
      setAiDnaSummary(genDnaSummary || summary)
      setAiResult(genContent)
    } finally {
      setAiLoading(false)
    }
  }

  async function saveDraftFromAI() {
    try {
      const storySlug = aiStorySlug || (newStory as any).slug || ''
      if (!storySlug) { alert('Chọn truyện để lưu draft'); return }
      if (!aiResult) { alert('Chưa có nội dung AI để lưu'); return }
      const story = stories.find((s) => s.slug === storySlug)
      const payload: any = {
        title: aiTitle || (aiResult || '').split('\n')[0].slice(0, 120),
        slug: generateSlug(aiTitle || ('chuong-' + Date.now())),
        content: aiResult,
      }
      if (story?.id) payload.story_id = story.id
      if (aiMeta?.summary) payload.summary = aiMeta.summary
      if (aiMeta?.cliffhanger) payload.cliffhanger = aiMeta.cliffhanger
      if (aiMeta?.important_events) payload.important_events = aiMeta.important_events
      if (aiMeta?.emotion_tags) payload.emotion_tags = aiMeta.emotion_tags

      const res = await supabase.from('chapters').insert([payload])
      if (res.error) throw res.error
      alert('Lưu draft thành công')
    } catch (e: any) {
      alert('Save draft failed: ' + String(e?.message ?? e))
    }
  }

  async function loadStoryMemory(slug: string) {
    if (!slug) return
    try {
      const { data, error } = await supabase.from('stories').select('story_dna, story_memory, current_arc, emotion_tags, cover_prompt, cover_style').eq('slug', slug).single()
      if (error) throw error
      setMemoryData(data)
      setSelectedMemorySlug(slug)
    } catch (err: any) {
      alert('Load memory failed: ' + String(err?.message ?? err))
    }
  }

  async function saveStoryMemoryToDb(slug?: string, memory?: any) {
    const target = slug || (newStory as any).slug || selectedMemorySlug
    if (!target) { alert('Chọn truyện để lưu memory'); return }
    try {
      const payload: any = {}
      const source = memory ?? (newStory as any)
      if (source.story_dna) payload.story_dna = source.story_dna
      if (source.story_memory) payload.story_memory = source.story_memory
      if (source.cover_prompt) payload.cover_prompt = source.cover_prompt
      if (source.cover_style) payload.cover_style = source.cover_style
      if (source.emotion_tags) payload.emotion_tags = source.emotion_tags
      if (source.current_arc) payload.current_arc = source.current_arc
      const res = await supabase.from('stories').update(payload).eq('slug', target)
      if (res.error) throw res.error
      alert('Story memory saved')
      await fetchStories()
    } catch (err: any) {
      alert('Save memory failed: ' + String(err?.message ?? err))
    }
  }

  function insertAIIntoChapterForm() {
    setNewChapter((c: any) => ({
      ...c,
      storySlug: aiStorySlug || c.storySlug,
      title: (aiTitle || aiResult || '').split('\n')[0].slice(0, 120) || c.title || 'Chương mới',
      slug: c.slug || generateSlug((aiTitle || aiResult || '').split('\n')[0].slice(0, 60) || 'chuong'),
      content: (aiResult || c.content) ? String(aiResult || c.content).replace(/\{[\s\S]*?\}/g, '').replace(/\[Summary\][\s\S]*?(?=\n\n|$)/gi, '').replace(/\[Cliffhanger\][\s\S]*?(?=\n\n|$)/gi, '').trim() : c.content,
      summary: aiMeta?.summary || c.summary,
      cliffhanger: aiMeta?.cliffhanger || c.cliffhanger,
      important_events: aiMeta?.important_events || c.important_events,
      emotion_tags: aiMeta?.emotion_tags || c.emotion_tags,
    }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <MainLayout>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <AdminTopBar
          checkingSession={checkingSession}
          onLogout={async () => {
            try { await signOut() } catch {}
            window.location.href = '/login'
          }}
        />

        <StoriesSection
          stories={stories}
          categories={categories}
          loading={loading}
          error={error}
          imageErrors={imageErrors}
          resolveCoverUrl={resolveCoverUrl}
          setImageErrors={setImageErrors}
          onTogglePublish={togglePublish}
          onDeleteStory={deleteStory}
          onOpenChapters={openManageChapters}
        />

        <ManageChapters
          selectedStoryForChapters={selectedStoryForChapters}
          chapters={selectedStoryForChapters ? (expandedChapters[selectedStoryForChapters] ?? []) : []}
          editingChapterId={editingChapterId}
          editChapterData={editChapterData}
          setEditingChapterId={setEditingChapterId}
          setEditChapterData={setEditChapterData}
          startEditChapter={startEditChapter}
          saveEditChapter={saveEditChapter}
          deleteChapter={deleteChapter}
          onClose={() => setSelectedStoryForChapters(null)}
        />

        <CreateStoryForm
          newStory={newStory}
          setNewStory={setNewStory}
          newVisibility={newVisibility}
          setNewVisibility={setNewVisibility}
          newCoverFile={newCoverFile}
          setNewCoverFile={setNewCoverFile}
          uploadingCover={uploadingCover}
          storySlugEdited={storySlugEdited}
          setStorySlugEdited={setStorySlugEdited}
          createCategorySlug={createCategorySlug}
          setCreateCategorySlug={setCreateCategorySlug}
          categories={categories}
          generateSlug={generateSlug}
          onSubmit={handleCreateStory}
        />

        <CategoryManager
          catName={catName}
          catSlug={catSlug}
          catDesc={catDesc}
          selectedCategoryId={selectedCategoryId}
          categories={categories}
          onCatNameChange={onCatNameChange}
          setCatSlug={setCatSlug}
          setCatDesc={setCatDesc}
          setSelectedCategoryId={setSelectedCategoryId}
          createCategory={createCategory}
          deleteCategory={deleteCategory}
          clearForm={() => { setCatName(''); setCatSlug(''); setCatDesc('') }}
        />

        <CreateChapterForm
          stories={stories}
          newChapter={newChapter}
          setNewChapter={setNewChapter}
          chapterSlugEdited={chapterSlugEdited}
          setChapterSlugEdited={setChapterSlugEdited}
          generateSlug={generateSlug}
          onSubmit={handleCreateChapter}
        />

        <AIGeneratePanel
          stories={stories}
          aiStorySlug={aiStorySlug}
          setAiStorySlug={setAiStorySlug}
          aiPrompt={aiPrompt}
          setAiPrompt={setAiPrompt}
          aiGenreId={aiGenreId}
          setAiGenreId={(value) => {
            setAiGenreId(value)
            const g = GENRE_REGISTRY.find((x) => x.id === value)
            if (g) setAiStoryType(g.storyTypes?.[0] ?? '')
          }}
          aiMainStyle={aiMainStyle}
          setAiMainStyle={setAiMainStyle}
          mainCharacterStyles={MAIN_CHARACTER_STYLES}
          aiLength={aiLength}
          setAiLength={setAiLength}
          aiProvider={aiProvider}
          setAiProvider={setAiProvider}
          aiHumiliation={aiHumiliation}
          setAiHumiliation={setAiHumiliation}
          aiRevenge={aiRevenge}
          setAiRevenge={setAiRevenge}
          aiCliffhanger={aiCliffhanger}
          setAiCliffhanger={setAiCliffhanger}
          cliffhangerTypes={CLIFFHANGER_TYPES}
          coverStyle={coverStyle}
          setCoverStyle={setCoverStyle}
          coverColor={coverColor}
          setCoverColor={setCoverColor}
          coverVibe={coverVibe}
          setCoverVibe={setCoverVibe}
          aiLoading={aiLoading}
          aiResult={aiResult}
          setAiResult={setAiResult}
          aiTitle={aiTitle}
          aiDnaSummary={aiDnaSummary}
          aiProviderUsed={aiProviderUsed}
          aiMeta={aiMeta}
          coverPrompt={coverPrompt}
          onGenerate={generateMockChapter}
          onInsertChapter={insertAIIntoChapterForm}
          onSaveDraft={saveDraftFromAI}
        />

        <StoryMemoryViewer
          stories={stories}
          selectedMemorySlug={selectedMemorySlug}
          setSelectedMemorySlug={setSelectedMemorySlug}
          memoryData={memoryData}
          memoryCollapsed={memoryCollapsed}
          setMemoryCollapsed={setMemoryCollapsed}
          loadStoryMemory={loadStoryMemory}
          saveStoryMemoryToDb={() => saveStoryMemoryToDb()}
        />
      </main>
    </MainLayout>
  )
}
