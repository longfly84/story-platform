import MainLayout from '@/layouts/MainLayout'
import { Link } from 'react-router-dom'
import StoriesSection from '@/components/admin/StoriesSection'
import ManageChapters from '@/components/admin/ManageChapters'
import useAdminSession from '@/hooks/admin/useAdminSession'
import { useEffect, useState } from 'react'
import { supabase, resolveCoverUrl } from '@/lib/supabase'

export default function AdminContentPage() {
  const { user, role, loading: sessionLoading } = useAdminSession()

  const [stories, setStories] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [expandedChapters, setExpandedChapters] = useState<Record<string, any[]>>({})
  const [selectedStoryForChapters, setSelectedStoryForChapters] = useState<string | null>(null)
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null)
  const [editChapterData, setEditChapterData] = useState<any>(null)

    
  
  

  async function fetchStories() {
    setLoading(true)

    try {
      let q = supabase.from('stories').select('*')

      if (role === 'staff' && user?.id) {
        q = q.eq('owner_id', user.id)
      }

      const res = await q.order('id', { ascending: true })

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
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setCategories(data || [])
    } catch {
      setCategories([])
    }
  }

  useEffect(() => {
    if (sessionLoading) return

    void fetchStories()
    void fetchCategories()
  }, [sessionLoading, role, user])

  

  

  

  

  

  async function togglePublish(story: any) {
    try {
      const nextStatus = story?.status === 'draft' ? 'published' : 'draft'

      const { error } = await supabase
        .from('stories')
        .update({ status: nextStatus })
        .eq('id', story.id)

      if (error) throw error

      await fetchStories()
    } catch (e: any) {
      alert('Toggle publish failed: ' + String(e?.message ?? e))
    }
  }

  async function deleteStory(id: number) {
    const ok = window.confirm('Xóa truyện này?')
    if (!ok) return

    try {
      const { error } = await supabase.from('stories').delete().eq('id', id)

      if (error) throw error

      await fetchStories()
      alert('Đã xóa truyện.')
    } catch (e: any) {
      alert('Delete failed: ' + String(e?.message ?? e))
    }
  }

  async function openManageChapters(slug: string) {
    try {
      const story = stories.find((item) => item.slug === slug)

      if (!story?.id) {
        alert('Không tìm thấy ID truyện để load chương.')
        return
      }

      setSelectedStoryForChapters(slug)

      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('story_id', story.id)
        .order('created_at', { ascending: true })

      if (error) throw error

      setExpandedChapters((prev) => ({
        ...prev,
        [slug]: data ?? [],
      }))

      setTimeout(() => {
        const el = document.getElementById('manage-chapters')

        if (el) {
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        } else {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth',
          })
        }
      }, 120)

      if (!data || data.length === 0) {
        alert('Truyện này chưa có chương nào.')
      }
    } catch (e: any) {
      alert('Load chapters failed: ' + String(e?.message ?? e))
    }
  }

  function startEditChapter(chapter: any) {
    setEditingChapterId(chapter.id)
    setEditChapterData({ ...chapter })
  }

  async function saveEditChapter(event: any) {
    event.preventDefault()

    if (!editingChapterId || !editChapterData) {
      return
    }

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

      const { error } = await supabase
        .from('chapters')
        .update(payload)
        .eq('id', editingChapterId)

      if (error) throw error

      if (selectedStoryForChapters) {
        await openManageChapters(selectedStoryForChapters)
      }

      setEditingChapterId(null)
      setEditChapterData(null)
      alert('Đã cập nhật chương.')
    } catch (e: any) {
      alert('Update chapter failed: ' + String(e?.message ?? e))
    }
  }

  async function deleteChapter(id: number, storySlug?: string) {
    const ok = window.confirm('Xóa chương này?')
    if (!ok) return

    try {
      const { error } = await supabase.from('chapters').delete().eq('id', id)

      if (error) throw error

      if (storySlug || selectedStoryForChapters) {
        await openManageChapters(storySlug || selectedStoryForChapters!)
      }

      alert('Đã xóa chương.')
    } catch (e: any) {
      alert('Delete chapter failed: ' + String(e?.message ?? e))
    }
  }

  return (
    <MainLayout>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4">
          <Link to="/admin" className="text-sm text-amber-300">
            ← Quay lại Admin Dashboard
          </Link>
        </div>
        
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">Stories</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Quản lý truyện, chapter, public/draft và trang xem public.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/content/new"
              className="rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200"
            >
              Tạo truyện mới
            </Link>

            <Link
              to="/admin/content/chapters/new"
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-sky-400"
            >
              Tạo chương mới
            </Link>

            <Link
              to="/admin/content/categories"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
            >
              Quản lý thể loại
            </Link>

            <Link
              to="/admin/content/comments"
              className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-violet-400"
            >
              Quản lý bình luận
            </Link>
          </div>
        </div>
        
        
        <StoriesSection
          stories={stories}
          categories={categories}
          loading={loading}
          error={error}
          imageErrors={imageErrors}
          resolveCoverUrl={(v?: string | null) => resolveCoverUrl(v)}
          setImageErrors={setImageErrors}
          onTogglePublish={togglePublish}
          onDeleteStory={deleteStory}
          onOpenChapters={openManageChapters}
        />

        <div id="manage-chapters">
          <ManageChapters
            selectedStoryForChapters={selectedStoryForChapters}
            chapters={selectedStoryForChapters ? expandedChapters[selectedStoryForChapters] ?? [] : []}
            editingChapterId={editingChapterId}
            editChapterData={editChapterData}
            setEditingChapterId={setEditingChapterId}
            setEditChapterData={setEditChapterData}
            startEditChapter={startEditChapter}
            saveEditChapter={saveEditChapter}
            deleteChapter={deleteChapter}
            onClose={() => setSelectedStoryForChapters(null)}
          />
        </div>
     
        
        <div className="mt-6">
          
        </div>
      </main>
    </MainLayout>
  )
}