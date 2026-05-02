import MainLayout from '@/layouts/MainLayout'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import CreateChapterForm from '@/components/admin/CreateChapterForm'
import { supabase } from '@/lib/supabase'

type NewChapterState = {
  storySlug: string
  title: string
  slug: string
  content: string
  chapter_number: number
  summary: string
  cliffhanger: string
  important_events: string[]
  emotion_tags: string[]
}

export default function AdminCreateChapterPage() {
  const navigate = useNavigate()
  const [stories, setStories] = useState<any[]>([])
  const [chapterSlugEdited, setChapterSlugEdited] = useState(false)

  const [newChapter, setNewChapter] = useState<NewChapterState>({
    storySlug: '',
    title: '',
    slug: '',
    content: '',
    chapter_number: 1,
    summary: '',
    cliffhanger: '',
    important_events: [],
    emotion_tags: [],
  })

  function generateSlug(input: string) {
    return input
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  async function fetchStories() {
    const { data, error } = await supabase
      .from('stories')
      .select('id, title, slug, author, status, description')
      .order('created_at', { ascending: false })

    if (!error) setStories(data || [])
  }

  useEffect(() => {
    void fetchStories()
  }, [])

  async function handleCreateChapter(event: any) {
    event.preventDefault()

    const story = stories.find((item) => item.slug === newChapter.storySlug)

    if (!story?.id) {
      alert('Chọn truyện trước khi tạo chương.')
      return
    }

    if (!newChapter.title.trim() || !newChapter.content.trim()) {
      alert('Title và content là bắt buộc.')
      return
    }

    try {
      const payload: any = {
        story_id: story.id,
        title: newChapter.title.trim(),
        slug: newChapter.slug.trim() || generateSlug(newChapter.title),
        content: newChapter.content,
        summary: newChapter.summary || null,
        cliffhanger: newChapter.cliffhanger || null,
        important_events: newChapter.important_events || [],
        emotion_tags: newChapter.emotion_tags || [],
        status: 'published',
      }

      const { error } = await supabase.from('chapters').insert([payload])

      if (error) {
        const msg = String(error.message || error)

        if (msg.toLowerCase().includes('status')) {
          const fallbackPayload = { ...payload }
          delete fallbackPayload.status

          const fallback = await supabase.from('chapters').insert([fallbackPayload])
          if (fallback.error) throw fallback.error
        } else {
          throw error
        }
      }

      alert('Đã tạo chương.')
      navigate('/admin/content')
    } catch (error: any) {
      alert('Create chapter failed: ' + String(error?.message ?? error))
    }
  }

  return (
    <MainLayout>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link to="/admin/content" className="text-sm text-amber-300">
            ← Quay lại Content
          </Link>

          <Link
            to="/admin"
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 hover:border-amber-300"
          >
            Admin Dashboard
          </Link>
        </div>

        <CreateChapterForm
          stories={stories}
          newChapter={newChapter}
          setNewChapter={setNewChapter}
          chapterSlugEdited={chapterSlugEdited}
          setChapterSlugEdited={setChapterSlugEdited}
          generateSlug={generateSlug}
          onSubmit={handleCreateChapter}
        />
      </main>
    </MainLayout>
  )
}