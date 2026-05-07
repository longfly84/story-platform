import MainLayout from '@/layouts/MainLayout'
import { Link } from 'react-router-dom'
import StoriesSection from '@/components/admin/StoriesSection'
import ManageChapters from '@/components/admin/ManageChapters'
import useAdminSession from '@/hooks/admin/useAdminSession'
import { useEffect, useState } from 'react'
import { supabase, resolveCoverUrl } from '@/lib/supabase'

function safeCopyString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getChapterNumber(chapter: any, index: number) {
  const raw =
    chapter?.chapter_number ??
    chapter?.chapterNumber ??
    chapter?.number ??
    chapter?.chapter ??
    index + 1

  const num = Number(raw)

  return Number.isFinite(num) && num > 0 ? num : index + 1
}

function normalizeChapterTitle(chapter: any, chapterNumber: number) {
  const rawTitle =
    safeCopyString(chapter?.title) ||
    safeCopyString(chapter?.name) ||
    safeCopyString(chapter?.chapter_title)

  if (!rawTitle) return `Chương ${chapterNumber}`

  return rawTitle
    .replace(/^#{1,6}\s*/g, '')
    .replace(new RegExp(`^Chương\\s+${chapterNumber}\\s*[—\\-:]\\s*`, 'i'), '')
    .trim()
}

function stripCopyArtifacts(content: string, chapterNumber: number, chapterTitle: string) {
  let text = safeCopyString(content)

  if (!text) return ''

  text = text.replace(/^\uFEFF/, '').trimStart()

  // Xóa separator thừa ở đầu content nếu content được lưu kèm "---".
  text = text.replace(/^(---|\*\*\*|___)\s*(\r?\n)+/g, '').trimStart()

  // Xóa heading markdown ở đầu content:
  // # Chương 1 — Tên chương
  // ## Chương 1 - Tên chương
  text = text.replace(
    new RegExp(
      `^#{1,6}\\s*Chương\\s+${chapterNumber}\\s*(?:[—\\-:]\\s*.*)?(?:\\r?\\n)+`,
      'i',
    ),
    '',
  )

  // Xóa heading không markdown ở đầu content:
  // Chương 1 — Tên chương
  text = text.replace(
    new RegExp(`^Chương\\s+${chapterNumber}\\s*(?:[—\\-:]\\s*.*)?(?:\\r?\\n)+`, 'i'),
    '',
  )

  // Xóa title trần nếu content bắt đầu bằng title.
  if (chapterTitle) {
    const escapedTitle = escapeRegExp(chapterTitle)

    text = text.replace(new RegExp(`^#{0,6}\\s*${escapedTitle}\\s*(?:\\r?\\n)+`, 'i'), '')
  }

  // Xóa tiếp separator nếu nó nằm sau heading vừa bị xóa.
  text = text.replace(/^\s*(---|\*\*\*|___)\s*(\r?\n)+/g, '').trimStart()

  return text.trim()
}

function formatChapterForCopy(chapter: any, index: number) {
  const chapterNumber = getChapterNumber(chapter, index)
  const chapterTitle = normalizeChapterTitle(chapter, chapterNumber)
  const rawContent = safeCopyString(chapter?.content)
  const cleanContent = stripCopyArtifacts(rawContent, chapterNumber, chapterTitle)

  return [`# Chương ${chapterNumber} — ${chapterTitle}`, '', cleanContent || '(Chương này chưa có nội dung.)'].join('\n')
}

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '-9999px'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

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
  const [copyingStoryId, setCopyingStoryId] = useState<string | null>(null)

  async function fetchStories() {
    setLoading(true)

    try {
      let q = supabase.from('stories').select('*')

      if (role === 'staff' && user?.id) {
        q = q.eq('owner_id', user.id)
      }

      const res = await q.order('created_at', { ascending: false })

      if (res.error) throw res.error

      const baseStories = res.data ?? []
      const storyIds = baseStories.map((story: any) => story.id).filter(Boolean)

      let chapterCountMap: Record<string, number> = {}
      let latestChapterMap: Record<string, number> = {}

      if (storyIds.length > 0) {
        const { data: chapterRows, error: chapterError } = await supabase
          .from('chapters')
          .select('id, story_id, chapter_number')
          .in('story_id', storyIds)

        if (chapterError) {
          console.warn('Fetch chapter count failed:', chapterError.message)
        } else {
          for (const chapter of chapterRows ?? []) {
            const storyId = String(chapter.story_id)
            const chapterNumber = Number(chapter.chapter_number || 0)

            chapterCountMap[storyId] = (chapterCountMap[storyId] || 0) + 1

            if (chapterNumber > (latestChapterMap[storyId] || 0)) {
              latestChapterMap[storyId] = chapterNumber
            }
          }
        }
      }

      const enrichedStories = baseStories
        .map((story: any) => {
          const storyId = String(story.id)

          return {
            ...story,
            _chapter_count: chapterCountMap[storyId] || 0,
            _latest_chapter_number: latestChapterMap[storyId] || 0,
          }
        })
        .sort((a: any, b: any) => {
          const aTime = new Date(a.created_at || a.updated_at || 0).getTime()
          const bTime = new Date(b.created_at || b.updated_at || 0).getTime()

          if (aTime !== bTime) return bTime - aTime

          return Number(b.id || 0) - Number(a.id || 0)
        })

      setStories(enrichedStories)
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

  async function copyAllStoryChapters(story: any) {
    const storyId = story?.id
    const storyTitle = safeCopyString(story?.title) || 'Truyện chưa có tên'

    if (!storyId) {
      alert('Không tìm thấy ID truyện để copy chương.')
      return
    }

    setCopyingStoryId(String(storyId))

    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('title, content, summary, chapter_number, created_at')
        .eq('story_id', storyId)
        .order('chapter_number', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) throw error

      const chapters = data ?? []

      if (!chapters.length) {
        alert('Truyện này chưa có chương nào để copy.')
        return
      }

      const chapterBlocks = chapters.map((chapter: any, index: number) =>
        formatChapterForCopy(chapter, index),
      )

      const text = [`# ${storyTitle}`, '', ...chapterBlocks].join('\n\n---\n\n')

      await copyTextToClipboard(text)
      alert(`Đã copy ${chapters.length} chương của truyện "${storyTitle}".`)
    } catch (e: any) {
      alert('Copy toàn bộ chương thất bại: ' + String(e?.message ?? e))
    } finally {
      setCopyingStoryId(null)
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

      await fetchStories()
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
          onCopyChapters={copyAllStoryChapters}
          copyingStoryId={copyingStoryId}
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

        <div className="mt-6" />
      </main>
    </MainLayout>
  )
}