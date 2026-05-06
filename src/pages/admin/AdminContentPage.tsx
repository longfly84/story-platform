import MainLayout from '@/layouts/MainLayout'
import { Link } from 'react-router-dom'
import ManageChapters from '@/components/admin/ManageChapters'
import useAdminSession from '@/hooks/admin/useAdminSession'
import { useEffect, useMemo, useState } from 'react'
import { supabase, resolveCoverUrl } from '@/lib/supabase'

function safeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function slugifyTitle(value: unknown) {
  const input = safeString(value)

  return (
    input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80) || 'truyen-chua-co-ten'
  )
}

function getStoryGenreSlugs(story: any) {
  const raw = story?.genres

  if (Array.isArray(raw)) {
    return raw.map((item) => String(item || '').trim()).filter(Boolean)
  }

  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function getStoryStatusLabel(story: any) {
  if (story?.status === 'published') return 'Published'
  if (story?.status === 'draft') return 'Draft'
  return safeString(story?.status) || 'Draft'
}

function getCompletionStatusLabel(story: any) {
  if (story?.completion_status === 'full') return 'Hoàn thành'
  return 'Chưa hoàn thành'
}

function formatChapterText(chapter: any, index: number) {
  const number = Number(chapter?.chapter_number || index + 1)
  const title = safeString(chapter?.title) || `Chương ${number}`
  const content = safeString(chapter?.content)

  return [`# Chương ${number} — ${title}`, '', content].join('\n')
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

  const categoryBySlug = useMemo(() => {
    const map = new Map<string, any>()

    categories.forEach((category) => {
      const slug = safeString(category?.slug)
      if (slug) map.set(slug, category)
    })

    return map
  }, [categories])

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

      if (storyIds.length) {
        const chaptersRes = await supabase
          .from('chapters')
          .select('story_id, chapter_number')
          .in('story_id', storyIds)

        if (!chaptersRes.error) {
          ;(chaptersRes.data ?? []).forEach((chapter: any) => {
            const storyId = String(chapter.story_id)
            const chapterNumber = Number(chapter.chapter_number || 0)

            chapterCountMap[storyId] = (chapterCountMap[storyId] || 0) + 1
            latestChapterMap[storyId] = Math.max(latestChapterMap[storyId] || 0, chapterNumber)
          })
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
    const storyTitle = safeString(story?.title) || 'Truyện chưa có tên'

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

      const text = [
        `# ${storyTitle}`,
        '',
        ...chapters.map((chapter, index) => formatChapterText(chapter, index)),
      ].join('\n\n---\n\n')

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

  function getStoryCategoryLabels(story: any) {
    const slugs = getStoryGenreSlugs(story)

    if (!slugs.length) return []

    return slugs.map((slug) => categoryBySlug.get(slug)?.name || slug)
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

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
          {loading ? (
            <div className="py-8 text-sm text-zinc-400">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          ) : stories.length === 0 ? (
            <div className="py-8 text-sm text-zinc-400">Chưa có truyện nào.</div>
          ) : (
            <div className="space-y-5">
              {stories.map((story) => {
                const coverRaw =
                  story.coverImage ??
                  story.cover_image ??
                  story.cover ??
                  story.cover_url ??
                  null
                const coverUrl = resolveCoverUrl(coverRaw)
                const storySlug = safeString(story.slug)
                const displaySlug = slugifyTitle(story.title)
                const categoryLabels = getStoryCategoryLabels(story)
                const storyId = String(story.id)

                return (
                  <article
                    key={story.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                  >
                    <div className="flex gap-4">
                      <div className="h-28 w-20 flex-none overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                        {coverUrl && !imageErrors[storyId] ? (
                          <img
                            src={coverUrl}
                            alt={story.title || 'Cover'}
                            className="h-full w-full object-cover"
                            onError={() =>
                              setImageErrors((prev) => ({
                                ...prev,
                                [storyId]: true,
                              }))
                            }
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-zinc-500">
                            No cover
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="text-base font-semibold text-zinc-50">
                          {story.title || 'Truyện chưa có tên'}
                        </h2>
                        <p className="mt-1 text-sm text-zinc-400">{story.author || 'Sưu Tầm'}</p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-md bg-zinc-800 px-2 py-1 text-xs font-semibold text-zinc-100">
                            {getCompletionStatusLabel(story)}
                          </span>
                          <span className="rounded-md bg-amber-500/20 px-2 py-1 text-xs font-semibold text-amber-300">
                            {getStoryStatusLabel(story)}
                          </span>
                          {categoryLabels.map((label) => (
                            <span
                              key={label}
                              className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-100"
                            >
                              {label}
                            </span>
                          ))}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => togglePublish(story)}
                            className="rounded-lg bg-zinc-600 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-zinc-500"
                          >
                            {story.status === 'draft' ? 'Publish' : 'Unpublish'}
                          </button>

                          <Link
                            to={`/admin/content/${story.id}/edit`}
                            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => deleteStory(story.id)}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                          >
                            Delete
                          </button>

                          <button
                            type="button"
                            onClick={() => openManageChapters(storySlug)}
                            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
                          >
                            Chapters
                          </button>

                          <Link
                            to={`/truyen/${storySlug}`}
                            className="rounded-lg bg-yellow-300 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-yellow-200"
                          >
                            View
                          </Link>

                          <button
                            type="button"
                            onClick={() => copyAllStoryChapters(story)}
                            disabled={copyingStoryId === storyId}
                            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {copyingStoryId === storyId ? 'Copying...' : 'Copy chapters'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-zinc-500">
                      {getStoryStatusLabel(story)} / {displaySlug}
                      {storySlug && storySlug !== displaySlug ? (
                        <span className="ml-2 text-zinc-600">
                          URL hiện tại: {storySlug}
                        </span>
                      ) : null}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

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
