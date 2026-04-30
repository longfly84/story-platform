import { useEffect, useState } from 'react'
import MainLayout from '@/layouts/MainLayout'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/supabase'
import { Link } from 'react-router-dom'

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

  const [newStory, setNewStory] = useState({ title: '', slug: '', description: '', author: '', status: 'ongoing' })
  const [newChapter, setNewChapter] = useState({ storySlug: '', title: '', slug: '', content: '', chapter_number: 1 })

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

  // auth guard
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const u = await getCurrentUser()
      if (!mounted) return
      if (!u) {
        window.location.href = '/login'
      } else {
        // optional: provide logout button later
      }
    })()
    return () => { mounted = false }
  }, [])

  async function handleCreateStory(e: any) {
    e.preventDefault()
    try {
      const res = await supabase.from('stories').insert([newStory])
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
      const res = await supabase.from('chapters').insert([{
        story_slug: newChapter.storySlug,
        title: newChapter.title,
        slug: newChapter.slug,
        content: newChapter.content,
        number: newChapter.chapter_number,
      }])
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

  return (
    <MainLayout>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="text-2xl font-semibold text-zinc-100 mb-4">Admin (Minimal)</h1>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-zinc-100">Stories</h2>
          {loading ? <div className="text-sm text-zinc-400">Loading...</div> : null}
          {error ? <div className="text-sm text-red-400">{error}</div> : null}
          <ul className="mt-2 space-y-2">
            {stories.map((s: any) => (
              <li key={s.id} className="rounded border border-zinc-800 p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-zinc-100">{s.title} ({s.slug})</div>
                    <div className="text-xs text-zinc-400">{s.author}</div>
                  </div>
                  <div className="flex gap-2">
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
            <input className="rounded bg-zinc-900/20 p-2" placeholder="Title" value={newStory.title} onChange={(e) => setNewStory({...newStory, title: e.target.value})} />
            <input className="rounded bg-zinc-900/20 p-2" placeholder="Slug" value={newStory.slug} onChange={(e) => setNewStory({...newStory, slug: e.target.value})} />
            <input className="rounded bg-zinc-900/20 p-2" placeholder="Author" value={newStory.author} onChange={(e) => setNewStory({...newStory, author: e.target.value})} />
            <select className="rounded bg-zinc-900/20 p-2" value={newStory.status} onChange={(e) => setNewStory({...newStory, status: e.target.value})}>
              <option value="ongoing">Đang ra</option>
              <option value="completed">Hoàn thành</option>
            </select>
            <textarea className="rounded bg-zinc-900/20 p-2" placeholder="Description" value={newStory.description} onChange={(e) => setNewStory({...newStory, description: e.target.value})} />
            <button className="rounded bg-amber-300 px-4 py-2 text-zinc-900">Create Story</button>
          </form>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Create Chapter</h2>
          <form onSubmit={handleCreateChapter} className="mt-2 grid gap-2">
            <input className="rounded bg-zinc-900/20 p-2" placeholder="Story slug" value={newChapter.storySlug} onChange={(e) => setNewChapter({...newChapter, storySlug: e.target.value})} />
            <input className="rounded bg-zinc-900/20 p-2" placeholder="Chapter title" value={newChapter.title} onChange={(e) => setNewChapter({...newChapter, title: e.target.value})} />
            <input className="rounded bg-zinc-900/20 p-2" placeholder="Chapter slug" value={newChapter.slug} onChange={(e) => setNewChapter({...newChapter, slug: e.target.value})} />
            <textarea className="rounded bg-zinc-900/20 p-2" placeholder="Content" value={newChapter.content} onChange={(e) => setNewChapter({...newChapter, content: e.target.value})} />
            <input type="number" className="rounded bg-zinc-900/20 p-2" value={newChapter.chapter_number} onChange={(e) => setNewChapter({...newChapter, chapter_number: Number(e.target.value)})} />
            <button className="rounded bg-amber-300 px-4 py-2 text-zinc-900">Create Chapter</button>
          </form>
        </div>
      </main>
    </MainLayout>
  )
}
