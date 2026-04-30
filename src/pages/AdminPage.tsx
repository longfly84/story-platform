import { useEffect, useState } from 'react'
import MainLayout from '@/layouts/MainLayout'
import { supabase, signOut, getCurrentUser } from '@/lib/supabase'
import { Link } from 'react-router-dom'
import { GENRE_REGISTRY, CHAPTER_LENGTH_OPTIONS, buildStoryDNA, buildMockChapter } from '@/lib/storyEngine'

// fallback lists (kept small; genre presets drive more precise options)
const MAIN_CHARACTER_STYLES: string[] = [
  'Bình tĩnh, lãnh đạm',
  'Nóng tính, bộc trực',
  'Lạnh lùng, tính toán',
  'Vui vẻ, lạc quan',
]

const CLIFFHANGER_TYPES: string[] = ['Reveal', 'Near-death', 'Betrayal', 'Twist']
import { COVER_STYLES, COLOR_THEMES, CHARACTER_VIBES, buildCoverPrompt } from '@/lib/coverEngine'

export default function AdminPage() {
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // UI state for editing/deleting
  const [editingStoryId, setEditingStoryId] = useState<number | null>(null)
  const [editStoryData, setEditStoryData] = useState<any>(null)

  const [expandedChapters, setExpandedChapters] = useState<Record<string, any[]>>({})
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null)
  const [editChapterData, setEditChapterData] = useState<any>(null)

  // helper: generate slug from title
  function generateSlug(input: string) {
    return input
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  }

  const [newStory, setNewStory] = useState({ title: '', slug: '', description: '', author: '', status: 'ongoing' })
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [newChapter, setNewChapter] = useState({ storySlug: '', title: '', slug: '', content: '', chapter_number: 1, summary: '', cliffhanger: '', important_events: [] as string[], emotion_tags: [] as string[] })

  // track if user manually edited slug to avoid overwriting
  const [storySlugEdited, setStorySlugEdited] = useState(false)
  const [chapterSlugEdited, setChapterSlugEdited] = useState(false)

  // AI generate (mock) states
  const [aiStorySlug, setAiStorySlug] = useState('')
  const [aiMode] = useState<'new'|'next'>('new')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiGenreId, setAiGenreId] = useState(GENRE_REGISTRY[0]?.id ?? '')
  const [aiStoryType, setAiStoryType] = useState(GENRE_REGISTRY[0]?.storyTypes?.[0] ?? '')
  const [aiMainStyle, setAiMainStyle] = useState(MAIN_CHARACTER_STYLES[0] ?? '')
  const [aiHumiliation, setAiHumiliation] = useState(3)
  const [aiRevenge, setAiRevenge] = useState(3)
  const [aiCliffhanger, setAiCliffhanger] = useState(CLIFFHANGER_TYPES[0] ?? '')
  const [aiLength, setAiLength] = useState('short') // short, medium, long
  const [aiProvider, setAiProvider] = useState<'mock'|'openai'>('mock')
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

  // fetch stories helper (used after create/update/delete to refresh)
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

  useEffect(() => {
    fetchStories()
  }, [])

  // auth guard + loading state while checking session
  const [checkingSession, setCheckingSession] = useState(true)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const u = await getCurrentUser()
        if (!mounted) return
        if (!u) {
          window.location.href = '/login'
        }
      } finally {
        if (mounted) setCheckingSession(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  async function handleCreateStory(e: any) {
    e.preventDefault()
    try {
      let coverUrl = (newStory as any).cover_image ?? null
      if (newCoverFile) {
        setUploadingCover(true)
        // lazy import uploader
        const { uploadCoverImage } = await import('@/lib/supabase')
        const url = await uploadCoverImage(newCoverFile)
        setUploadingCover(false)
        if (url) coverUrl = url
      }
      // ensure newStory contains story_dna, story_memory, emotion_tags, cover_prompt, cover_style if present
      const payload = { ...newStory, cover_image: coverUrl }
      // persist newStory including story memory fields
      const res = await supabase.from('stories').insert([payload])
      if (res.error) throw res.error
      alert('Created')
      // refresh list
      await fetchStories()
    } catch (err: any) {
      alert('Error: ' + String(err?.message ?? err))
    }
  }

  async function handleCreateChapter(e: any) {
    e.preventDefault()
    try {
      const payload: any = {
        story_slug: newChapter.storySlug,
        title: newChapter.title,
        slug: newChapter.slug,
        content: newChapter.content,
        number: newChapter.chapter_number,
      }
      // include metadata if present
      if (newChapter.summary) payload.summary = newChapter.summary
      if (newChapter.cliffhanger) payload.cliffhanger = newChapter.cliffhanger
      if (newChapter.important_events) payload.important_events = newChapter.important_events
      if (newChapter.emotion_tags) payload.emotion_tags = newChapter.emotion_tags

      const res = await supabase.from('chapters').insert([payload])
      if (res.error) throw res.error
      alert('Chapter created')
      // refresh expanded chapters for this story if shown
      if (expandedChapters[newChapter.storySlug]) {
        const { data: ch } = await supabase.from('chapters').select('*').eq('story_slug', newChapter.storySlug).order('number', { ascending: true })
        setExpandedChapters((m) => ({ ...m, [newChapter.storySlug]: ch ?? [] }))
      }
    } catch (err: any) {
      alert('Error: ' + String(err?.message ?? err))
    }
  }

  // Edit story
  async function startEditStory(s: any) {
    setEditingStoryId(s.id)
    setEditStoryData({ ...s })
  }

  async function saveEditStory(e: any) {
    e.preventDefault()
    if (!editStoryData || !editingStoryId) return
    try {
      const res = await supabase.from('stories').update(editStoryData).eq('id', editingStoryId)
      if (res.error) throw res.error
      setEditingStoryId(null)
      setEditStoryData(null)
      await fetchStories()
    } catch (err: any) {
      alert('Error updating: ' + String(err?.message ?? err))
    }
  }

  async function deleteStory(id: number) {
    if (!confirm('Xác nhận xoá truyện?')) return
    try {
      const res = await supabase.from('stories').delete().eq('id', id)
      if (res.error) throw res.error
      await fetchStories()
    } catch (err: any) {
      alert('Delete failed: ' + String(err?.message ?? err))
    }
  }

  // Chapters: expand/fetch, edit, delete
  async function toggleChapters(slug: string) {
    if (expandedChapters[slug]) {
      setExpandedChapters((m) => { const c = { ...m }; delete c[slug]; return c })
      return
    }
    const { data, error } = await supabase.from('chapters').select('*').eq('story_slug', slug).order('number', { ascending: true })
    if (error) { alert('Load chapters failed: ' + String(error.message)); return }
    setExpandedChapters((m) => ({ ...m, [slug]: data ?? [] }))
  }

  function startEditChapter(chap: any) {
    setEditingChapterId(chap.id)
    setEditChapterData({ ...chap })
  }

  async function saveEditChapter(e: any) {
    e.preventDefault()
    if (!editingChapterId || !editChapterData) return
    try {
      const res = await supabase.from('chapters').update(editChapterData).eq('id', editingChapterId)
      if (res.error) throw res.error
      // refresh currently expanded story chapters
      if (editChapterData.story_slug) {
        const { data } = await supabase.from('chapters').select('*').eq('story_slug', editChapterData.story_slug).order('number', { ascending: true })
        setExpandedChapters((m) => ({ ...m, [editChapterData.story_slug]: data ?? [] }))
      }
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
      if (storySlug && expandedChapters[storySlug]) {
        const { data } = await supabase.from('chapters').select('*').eq('story_slug', storySlug).order('number', { ascending: true })
        setExpandedChapters((m) => ({ ...m, [storySlug]: data ?? [] }))
      }
    } catch (err: any) {
      alert('Delete chapter failed: ' + String(err?.message ?? err))
    }
  }

  // Mock generator (no external API) - creates simple paragraphs based on inputs
  async function generateMockChapter() {
    setAiLoading(true)
    setAiResult('')
    setAiTitle('')
    setAiDnaSummary('')
    try {
      // simulate latency
      await new Promise((res) => setTimeout(res, 700))

      // build DNA
      const { dna, summary, emotion_tags } = buildStoryDNA({
        storyType: aiStoryType,
        mainStyle: aiMainStyle,
        humiliationLevel: aiHumiliation,
        revengeIntensity: aiRevenge,
        cliffhangerType: aiCliffhanger,
      })

      // determine context for generation depending on mode
      let contextSummary = ''
      let latestCliff = ''
      if (aiMode === 'next') {
        // try to read latest chapter summary/cliffhanger from DB for this story
        try {
          const storySlug = aiStorySlug || (newStory as any).slug || ''
          if (storySlug) {
            const { data: last } = await supabase.from('chapters').select('id, title, slug, content, summary, cliffhanger').eq('story_slug', storySlug).order('number', { ascending: false }).limit(1)
            if (last && last.length) {
              contextSummary = last[0].summary || last[0].content?.slice(0,200) || ''
              latestCliff = last[0].cliffhanger || ''
            }
          }
        } catch (e) {
          // ignore DB errors for mock
        }
      }

      // call server-side generate endpoint (mocked on server)
      let genContent = ''
      let genTitle = ''
      let genDnaSummary = ''
      try {
        const resp = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storySlug: aiStorySlug || (newStory as any).slug, genreId: aiGenreId, prompt: aiPrompt + (contextSummary ? (' — context: ' + contextSummary) : ''), length: aiLength, provider: aiProvider }),
        })
        const j = await resp.json()
        if (j?.ok && j.data) {
          const d = j.data
          // d: { title, content, summary, prompt }
          genTitle = d.title
          genDnaSummary = d.summary || summary
          genContent = d.content
        } else {
          // fallback to local generation if server fails
          const out = buildMockChapter({ prompt: aiPrompt + (contextSummary ? (' — context: ' + contextSummary) : ''), dna, length: aiLength as any })
          genTitle = out.title
          genDnaSummary = out.dnaSummary
          genContent = out.content
        }
      } catch (e) {
        const out = buildMockChapter({ prompt: aiPrompt + (contextSummary ? (' — context: ' + contextSummary) : ''), dna, length: aiLength as any })
        genTitle = out.title
        genDnaSummary = out.dnaSummary
        genContent = out.content
      }
      // set states for preview
      setAiTitle(genTitle)
      setAiDnaSummary(genDnaSummary || summary)
      setAiResult(genContent)
      
      // auto-generate cover prompt
      const cp = buildCoverPrompt(dna, { style: coverStyle, color: coverColor, vibe: coverVibe })
      setCoverPrompt(cp)

      // prepare story memory payload (frontend only) to be saved with story later
      const story_memory = (newStory as any).story_memory ?? {
        active_conflicts: [],
        pending_payoffs: [],
        known_secrets: [],
        relationships: {},
        unresolved_humiliations: [],
        current_arc: (newStory as any).current_arc || 'intro',
        arc_progress: (newStory as any).arc_progress ?? 0,
      }

      // update memory depending on mode + generated content
      // simple heuristics for mock: push recent summary, update emotions
      const newSummary = (genContent || '').split('\n')[0].slice(0,200)
      const newCliff = latestCliff || (dna?.cliffhangerType || 'Reveal')
      story_memory.recent_summary = newSummary
      story_memory.last_generated_at = new Date().toISOString()
      // update events
      story_memory.important_events = (story_memory.important_events || []).concat([`Generated: ${newSummary}`])
      // update emotion tags
      story_memory.emotion_tags = Array.from(new Set([...(story_memory.emotion_tags || []), ...(emotion_tags || [])]))

      // arc progress mock update
      story_memory.arc_progress = Math.min(100, (story_memory.arc_progress || 0) + (aiMode === 'next' ? 10 : 3))

      // attach to newStory object so user can save later
      setNewStory((s) => ({ ...s, story_dna: dna, story_memory, emotion_tags: story_memory.emotion_tags, cover_prompt: cp, cover_style: coverStyle, current_arc: story_memory.current_arc, arc_progress: story_memory.arc_progress }))

      // expose ai metadata for chapter insertion
      setAiMeta({ summary: newSummary, cliffhanger: newCliff, important_events: story_memory.important_events, emotion_tags: story_memory.emotion_tags })

      // also update local preview of new chapter metadata (prefix metadata)
      setAiDnaSummary(genDnaSummary || summary)
      // expose new summary/cliffhanger in aiResult area as metadata header
      setAiResult(`# ${genTitle}\n\n[Summary]\n${newSummary}\n\n[Cliffhanger]\n${newCliff}\n\n${genContent}`)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <MainLayout>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-100">Admin (Minimal)</h1>
          <div className="flex items-center gap-2">
            <a href="/" className="text-sm text-amber-300 hover:underline">Về trang chủ</a>
            <button
              onClick={async () => {
                try {
                  await signOut()
                } catch {}
                window.location.href = '/login'
              }}
              className="rounded bg-zinc-800 px-3 py-1 text-sm text-zinc-100"
            >
              Logout
            </button>
          </div>
        </div>
        {checkingSession ? <div className="text-sm text-zinc-400 mb-4">Đang kiểm tra phiên đăng nhập…</div> : null}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-zinc-100">Stories</h2>
          {loading ? <div className="text-sm text-zinc-400">Loading...</div> : null}
          {error ? <div className="text-sm text-red-400">{error}</div> : null}
          <ul className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {stories.map((s: any) => (
              <li key={s.id} className="rounded border border-zinc-800 p-3 flex items-start gap-3">
                <img src={s.cover_image ?? s.coverImage ?? ''} alt={s.title} className="h-16 w-12 rounded object-cover flex-shrink-0 bg-zinc-900/30" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-zinc-100">{s.title}</div>
                      <div className="truncate text-xs text-zinc-400">{s.author ?? ''}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${s.status === 'completed' ? 'bg-emerald-400/10 text-emerald-200' : 'bg-sky-400/10 text-sky-200'}`}>{s.status === 'completed' ? 'Full' : 'Đang ra'}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => startEditStory(s)} className="text-xs rounded px-2 py-1 bg-zinc-900/20">Edit</button>
                    <button onClick={() => deleteStory(s.id)} className="text-xs rounded px-2 py-1 bg-red-700 text-white">Delete</button>
                    <button onClick={() => toggleChapters(s.slug)} className="text-xs rounded px-2 py-1 bg-zinc-900/20">Chapters</button>
                    <Link to={`/truyen/${s.slug}`} className="text-xs text-amber-300 hover:underline">View</Link>
                  </div>
                </div>

                {/* edit story inline */}
                {editingStoryId === s.id && editStoryData ? (
                  <form onSubmit={saveEditStory} className="mt-2 grid gap-2">
                    <input className="rounded bg-zinc-900/20 p-2" value={editStoryData.title} onChange={(e) => setEditStoryData({...editStoryData, title: e.target.value})} />
                    <input className="rounded bg-zinc-900/20 p-2" value={editStoryData.slug} onChange={(e) => setEditStoryData({...editStoryData, slug: e.target.value})} />
                    <input className="rounded bg-zinc-900/20 p-2" value={editStoryData.author} onChange={(e) => setEditStoryData({...editStoryData, author: e.target.value})} />
                    <textarea className="rounded bg-zinc-900/20 p-2" value={editStoryData.description} onChange={(e) => setEditStoryData({...editStoryData, description: e.target.value})} />
                    <div className="flex gap-2">
                      <button type="submit" className="rounded bg-amber-300 px-3 py-1">Save</button>
                      <button type="button" onClick={() => { setEditingStoryId(null); setEditStoryData(null) }} className="rounded bg-zinc-800 px-3 py-1">Cancel</button>
                    </div>
                  </form>
                ) : null}

                {/* chapters expanded */}
                {expandedChapters[s.slug] ? (
                  <div className="mt-2 space-y-2">
                    {expandedChapters[s.slug].map((c: any) => (
                      <div key={c.id} className="rounded border border-zinc-700 p-2 bg-zinc-950/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-zinc-100">{c.title} (#{c.number})</div>
                            <div className="text-xs text-zinc-400">{c.slug}</div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => startEditChapter(c)} className="text-xs rounded px-2 py-1 bg-zinc-900/20">Edit</button>
                            <button onClick={() => deleteChapter(c.id, s.slug)} className="text-xs rounded px-2 py-1 bg-red-700 text-white">Delete</button>
                          </div>
                        </div>

                        {editingChapterId === c.id && editChapterData ? (
                          <form onSubmit={saveEditChapter} className="mt-2 grid gap-2">
                            <input className="rounded bg-zinc-900/20 p-2" value={editChapterData.title} onChange={(e) => setEditChapterData({...editChapterData, title: e.target.value})} />
                            <input className="rounded bg-zinc-900/20 p-2" value={editChapterData.slug} onChange={(e) => setEditChapterData({...editChapterData, slug: e.target.value})} />
                            <textarea className="rounded bg-zinc-900/20 p-2" value={editChapterData.content} onChange={(e) => setEditChapterData({...editChapterData, content: e.target.value})} />
                            <div className="flex gap-2">
                              <button type="submit" className="rounded bg-amber-300 px-3 py-1">Save</button>
                              <button type="button" onClick={() => { setEditingChapterId(null); setEditChapterData(null) }} className="rounded bg-zinc-800 px-3 py-1">Cancel</button>
                            </div>
                          </form>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-zinc-100">Create Story</h2>
          <form onSubmit={handleCreateStory} className="mt-2 grid gap-2">
            <input className="rounded bg-zinc-900/20 p-2" placeholder="Title" value={newStory.title} onChange={(e) => {
              const val = e.target.value
              setNewStory((s) => ({ ...s, title: val, slug: storySlugEdited ? s.slug : generateSlug(val) }))
            }} />
            <input className="rounded bg-zinc-900/20 p-2" placeholder="Slug" value={newStory.slug} onChange={(e) => { setNewStory({...newStory, slug: e.target.value}); setStorySlugEdited(true) }} />
            <input className="rounded bg-zinc-900/20 p-2" placeholder="Author" value={newStory.author} onChange={(e) => setNewStory({...newStory, author: e.target.value})} />
            <label className="text-xs text-zinc-400">Cover image (optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setNewCoverFile(e.target.files?.[0] ?? null)} />
            {newCoverFile ? (
              <img src={URL.createObjectURL(newCoverFile)} alt="preview" className="h-24 w-auto rounded mt-2" />
            ) : null}
            <select className="rounded bg-zinc-900/20 p-2" value={newStory.status} onChange={(e) => setNewStory({...newStory, status: e.target.value})}>
              <option value="ongoing">Đang ra</option>
              <option value="completed">Hoàn thành</option>
            </select>
            <textarea className="rounded bg-zinc-900/20 p-2" placeholder="Description" value={newStory.description} onChange={(e) => setNewStory({...newStory, description: e.target.value})} />
            <button className="rounded bg-amber-300 px-4 py-2 text-zinc-900">{uploadingCover ? 'Uploading cover…' : 'Create Story'}</button>
          </form>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Create Chapter</h2>
          <form onSubmit={handleCreateChapter} className="mt-2 grid gap-2">
            <label className="text-xs text-zinc-400">Chọn truyện</label>
            <select className="rounded bg-zinc-900/20 p-2" value={newChapter.storySlug} onChange={(e) => setNewChapter({...newChapter, storySlug: e.target.value})}>
              <option value="">-- Chọn truyện --</option>
              {stories.map((s) => (
                <option key={s.id} value={s.slug}>{s.title}</option>
              ))}
            </select>
            <input className="rounded bg-zinc-900/20 p-2" placeholder="Chapter title" value={newChapter.title} onChange={(e) => {
              const val = e.target.value
              setNewChapter((c) => ({ ...c, title: val, slug: chapterSlugEdited ? c.slug : generateSlug(val) }))
            }} />
            <input className="rounded bg-zinc-900/20 p-2" placeholder="Chapter slug" value={newChapter.slug} onChange={(e) => { setNewChapter({...newChapter, slug: e.target.value}); setChapterSlugEdited(true) }} />
            <textarea className="rounded bg-zinc-900/20 p-2" placeholder="Content" value={newChapter.content} onChange={(e) => setNewChapter({...newChapter, content: e.target.value})} />
            <input type="number" className="rounded bg-zinc-900/20 p-2" value={newChapter.chapter_number} onChange={(e) => setNewChapter({...newChapter, chapter_number: Number(e.target.value)})} />
            <button className="rounded bg-amber-300 px-4 py-2 text-zinc-900">Create Chapter</button>
          </form>
        </div>

        {/* AI Generate section (mock) */}
        <div className="mt-8 mb-12 rounded border border-zinc-800 p-4 bg-zinc-950/30">
          <h2 className="text-lg font-semibold text-zinc-100">AI Generate (Mock)</h2>
          <div className="mt-3 grid gap-2">
            <label className="text-xs text-zinc-400">Chọn truyện (để gán vào chapter)</label>
            <select className="rounded bg-zinc-900/20 p-2" value={aiStorySlug} onChange={(e) => setAiStorySlug(e.target.value)}>
              <option value="">-- (Không chọn) --</option>
              {stories.map((s) => (
                <option key={s.id} value={s.slug}>{s.title}</option>
              ))}
            </select>

            <label className="text-xs text-zinc-400">Prompt idea</label>
            <input className="rounded bg-zinc-900/20 p-2" placeholder="Ví dụ: Một hiệp sĩ lạc vào thành phố tương lai" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} />

            <div className="grid sm:grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-zinc-400">Genre preset</label>
                <select className="rounded bg-zinc-900/20 p-2" value={aiGenreId} onChange={(e) => { setAiGenreId(e.target.value); const g = GENRE_REGISTRY.find(x => x.id === e.target.value); if (g) setAiStoryType(g.storyTypes?.[0] ?? '') }}>
                  {GENRE_REGISTRY.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
                </select>
              </div>
              {import.meta.env.DEV ? (
                <div>
                  <label className="text-xs text-zinc-400">Provider (dev)</label>
                  <select className="rounded bg-zinc-900/20 p-2" value={aiProvider} onChange={(e) => setAiProvider(e.target.value as any)}>
                    <option value="mock">Mock</option>
                    <option value="openai">OpenAI (dev)</option>
                  </select>
                </div>
              ) : null}
              <div>
                <label className="text-xs text-zinc-400">Main character style</label>
                <select className="rounded bg-zinc-900/20 p-2" value={aiMainStyle} onChange={(e) => setAiMainStyle(e.target.value)}>
                  {MAIN_CHARACTER_STYLES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400">Chapter length</label>
                <select className="rounded bg-zinc-900/20 p-2" value={aiLength} onChange={(e) => setAiLength(e.target.value)}>
                  {CHAPTER_LENGTH_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-zinc-400">Humiliation level</label>
                <input type="range" min={0} max={10} value={aiHumiliation} onChange={(e) => setAiHumiliation(Number(e.target.value))} />
                <div className="text-xs text-zinc-400">{aiHumiliation}</div>
              </div>
              <div>
                <label className="text-xs text-zinc-400">Revenge intensity</label>
                <input type="range" min={0} max={10} value={aiRevenge} onChange={(e) => setAiRevenge(Number(e.target.value))} />
                <div className="text-xs text-zinc-400">{aiRevenge}</div>
              </div>
              <div>
                <label className="text-xs text-zinc-400">Cliffhanger type</label>
                <select className="rounded bg-zinc-900/20 p-2" value={aiCliffhanger} onChange={(e) => setAiCliffhanger(e.target.value)}>
                  {CLIFFHANGER_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={(e) => { e.preventDefault(); generateMockChapter() }} className="rounded bg-emerald-500 px-4 py-2 text-zinc-900">{aiLoading ? 'Generating…' : 'Generate'}</button>
              <button onClick={(e) => { e.preventDefault(); setAiResult('') }} className="rounded bg-zinc-800 px-4 py-2">Clear</button>
            </div>

            <div className="mt-3 grid sm:grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-zinc-400">Cover style</label>
                <select className="rounded bg-zinc-900/20 p-2" value={coverStyle} onChange={(e) => setCoverStyle(e.target.value)}>
                  {COVER_STYLES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400">Color theme</label>
                <select className="rounded bg-zinc-900/20 p-2" value={coverColor} onChange={(e) => setCoverColor(e.target.value)}>
                  {COLOR_THEMES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400">Main vibe</label>
                <select className="rounded bg-zinc-900/20 p-2" value={coverVibe} onChange={(e) => setCoverVibe(e.target.value)}>
                  {CHARACTER_VIBES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="text-xs text-zinc-400">Preview</label>
              <div className="mt-2 rounded bg-zinc-900/20 p-3 min-h-[80px] text-sm text-zinc-100 whitespace-pre-wrap">
                {aiLoading ? 'Đang tạo...' : (
                  aiResult ? (
                    <>
                      <div className="font-semibold text-zinc-100 mb-2">{aiTitle}</div>
                      <div className="text-xs text-zinc-400 mb-2">{aiDnaSummary}</div>
                      <div className="whitespace-pre-wrap">{aiResult}</div>
                    </>
                  ) : 'Chưa có nội dung.'
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <button onClick={(e) => {
                e.preventDefault()
                // Insert into create chapter form
                setNewChapter((c) => ({
                  ...c,
                  storySlug: aiStorySlug || c.storySlug,
                  title: c.title || 'Chương mới',
                  slug: c.slug || generateSlug('Chương mới'),
                  content: aiResult || c.content,
                  summary: aiMeta?.summary || c.summary,
                  cliffhanger: aiMeta?.cliffhanger || c.cliffhanger,
                  important_events: aiMeta?.important_events || c.important_events,
                  emotion_tags: aiMeta?.emotion_tags || c.emotion_tags,
                }))
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }} className="rounded bg-amber-300 px-4 py-2 text-zinc-900">Đưa vào form Chapter</button>

              <button onClick={(e) => { e.preventDefault(); navigator.clipboard?.writeText(aiResult || '') }} className="rounded bg-zinc-800 px-4 py-2">Copy</button>
              <button onClick={(e) => { e.preventDefault(); navigator.clipboard?.writeText(coverPrompt || '') }} className="rounded bg-zinc-700 px-4 py-2">Copy Cover Prompt</button>
            </div>

        {/* Story Memory Viewer */}
        <div className="mt-6 mb-12 rounded border border-zinc-800 p-4 bg-zinc-950/20">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-100">Story Memory Viewer</h2>
            <div className="flex gap-2">
              <select className="rounded bg-zinc-900/20 p-2 text-sm" value={selectedMemorySlug ?? ''} onChange={(e) => { setSelectedMemorySlug(e.target.value || null) }}>
                <option value="">-- Chọn truyện --</option>
                {stories.map((s) => <option key={s.id} value={s.slug}>{s.title}</option>)}
              </select>
              <button onClick={(e) => { e.preventDefault(); if (selectedMemorySlug) loadStoryMemory(selectedMemorySlug) }} className="rounded bg-amber-300 px-3 py-1 text-sm">Load Memory</button>
              <button onClick={(e) => { e.preventDefault(); saveStoryMemoryToDb() }} className="rounded bg-emerald-500 px-3 py-1 text-sm">Save Memory</button>
            </div>
          </div>

          <div className="mt-3 text-sm text-zinc-200">
            {memoryData ? (
              <div className="space-y-3">
                {/* story_dna */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-zinc-100">Story DNA</div>
                    <button className="text-xs text-zinc-400" onClick={() => setMemoryCollapsed((m) => ({ ...m, current_arc: !m.current_arc }))}>{memoryCollapsed.current_arc ? 'Show' : 'Hide'}</button>
                  </div>
                  {!memoryCollapsed.current_arc ? <pre className="mt-2 rounded bg-zinc-900/10 p-2 text-xs text-zinc-200 overflow-auto">{JSON.stringify(memoryData.story_dna, null, 2)}</pre> : null}
                </div>

                {/* story_memory fields */}
                {['active_conflicts','pending_payoffs','known_secrets','relationships','unresolved_humiliations','emotion_tags'].map((k) => (
                  <div key={k}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-zinc-100">{k.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</div>
                      <button className="text-xs text-zinc-400" onClick={() => setMemoryCollapsed((m) => ({ ...m, [k]: !m[k] }))}>{memoryCollapsed[k] ? 'Show' : 'Hide'}</button>
                    </div>
                    {!memoryCollapsed[k] ? (
                      <div className="mt-2 rounded bg-zinc-900/10 p-2 text-xs text-zinc-200">
                        {Array.isArray(memoryData.story_memory?.[k]) ? (
                          <ul className="list-disc pl-4 space-y-1">{(memoryData.story_memory[k]||[]).map((it:any,idx:number)=>(<li key={idx}>{String(it)}</li>))}</ul>
                        ) : (
                          <pre className="whitespace-pre-wrap">{JSON.stringify(memoryData.story_memory?.[k], null, 2)}</pre>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}

                {/* current arc */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-zinc-100">Current Arc</div>
                    <button className="text-xs text-zinc-400" onClick={() => setMemoryCollapsed((m) => ({ ...m, current_arc: !m.current_arc }))}>{memoryCollapsed.current_arc ? 'Show' : 'Hide'}</button>
                  </div>
                  {!memoryCollapsed.current_arc ? <div className="mt-2 text-sm text-zinc-200">{memoryData.current_arc ?? '(empty)'}</div> : null}
                </div>
              </div>
            ) : (
              <div className="text-zinc-400">Chưa load memory. Chọn truyện và bấm Load Memory.</div>
            )}
          </div>
        </div>
          </div>
        </div>
      </main>
    </MainLayout>
  )
}

// Note: components split created but AdminPage still integrates directly to minimize changes
