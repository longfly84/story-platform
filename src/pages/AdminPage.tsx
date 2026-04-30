import { useEffect, useState } from 'react'
import MainLayout from '@/layouts/MainLayout'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/supabase'
import { Link } from 'react-router-dom'

export default function AdminPage() {
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newStory, setNewStory] = useState({ title: '', slug: '', description: '', author: '', status: 'ongoing' })
  const [newChapter, setNewChapter] = useState({ storySlug: '', title: '', slug: '', content: '', chapter_number: 1 })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
        try {
        const res = await supabase.from('stories').select('*').order('id', { ascending: true })
        if (res.error) throw res.error
        if (!mounted) return
        setStories(res.data ?? [])
      } catch (e: any) {
        setError(String(e?.message ?? e))
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
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
      setStories((s) => [...s, ...(res.data ?? [])])
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
    } catch (err: any) {
      alert('Error: ' + String(err?.message ?? err))
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
                <div className="font-semibold text-zinc-100">{s.title} ({s.slug})</div>
                <div className="text-xs text-zinc-400">{s.author}</div>
                <Link to={`/truyen/${s.slug}`} className="text-xs text-amber-300 hover:underline">View</Link>
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
