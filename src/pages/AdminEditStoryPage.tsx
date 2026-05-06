import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import MainLayout from '@/layouts/MainLayout'
import { getCurrentUser, resolveCoverUrl, supabase, uploadCoverImage } from '@/lib/supabase'

function safeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function generateSlug(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function getFirstGenre(story: any) {
  if (Array.isArray(story?.genres)) {
    return safeString(story.genres[0])
  }

  if (typeof story?.genres === 'string') {
    return story.genres
      .split(',')
      .map((item: string) => item.trim())
      .filter(Boolean)[0] ?? ''
  }

  return ''
}

function getCoverRaw(story: any) {
  return (
    story?.cover_image ??
    story?.coverImage ??
    story?.cover_url ??
    story?.coverUrl ??
    story?.cover ??
    null
  )
}

function normalizeVisibility(story: any) {
  const status = safeString(story?.status).toLowerCase()

  if (status === 'published') return 'published'
  if (status === 'draft') return 'draft'

  return story?.published_at ? 'published' : 'draft'
}

function normalizeCompletionStatus(story: any) {
  const completionStatus = safeString(story?.completion_status || story?.completionStatus).toLowerCase()
  const legacyStatus = safeString(story?.status).toLowerCase()

  if (completionStatus === 'full' || completionStatus === 'completed') return 'full'
  if (completionStatus === 'paused') return 'paused'
  if (completionStatus === 'ongoing') return 'ongoing'

  if (legacyStatus === 'completed') return 'full'
  if (legacyStatus === 'paused') return 'paused'
  if (legacyStatus === 'ongoing') return 'ongoing'

  return 'ongoing'
}

export default function AdminEditStoryPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [story, setStory] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)

  const [form, setForm] = useState({
    title: '',
    slug: '',
    author: '',
    description: '',
    visibility: 'draft',
    completionStatus: 'ongoing',
    categorySlug: '',
  })

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const currentCover = useMemo(() => {
    if (coverPreview) return coverPreview
    return resolveCoverUrl(getCoverRaw(story))
  }, [coverPreview, story])

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const user = await getCurrentUser()
        if (!user) {
          navigate('/login')
          return
        }

        if (!id) {
          throw new Error('Thiếu ID truyện.')
        }

        let storyRes = await supabase
          .from('stories')
          .select('*')
          .eq('id', id)
          .maybeSingle()

        if (!storyRes.data && !storyRes.error) {
          storyRes = await supabase
            .from('stories')
            .select('*')
            .eq('slug', id)
            .maybeSingle()
        }

        if (storyRes.error) throw storyRes.error

        if (!storyRes.data) {
          throw new Error('Không tìm thấy truyện hoặc truyện đã bị xóa.')
        }

        const categoryRes = await supabase
          .from('categories')
          .select('id,name,slug,description')
          .order('name', { ascending: true })

        if (!mounted) return

        const loadedStory = storyRes.data

        setStory(loadedStory)
        setForm({
          title: safeString(loadedStory?.title),
          slug: safeString(loadedStory?.slug),
          author: safeString(loadedStory?.author) || 'Sưu Tầm',
          description: safeString(loadedStory?.description),
          visibility: normalizeVisibility(loadedStory),
          completionStatus: normalizeCompletionStatus(loadedStory),
          categorySlug: getFirstGenre(loadedStory),
        })

        if (!categoryRes.error) {
          setCategories(categoryRes.data ?? [])
        }
      } catch (err: any) {
        if (mounted) setError(String(err?.message ?? err))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [id, navigate])

  function updateForm(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleCoverChange(file: File | null) {
    setCoverFile(file)
    setImageError(false)

    if (!file) {
      setCoverPreview(null)
      return
    }

    setCoverPreview(URL.createObjectURL(file))
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()

    if (!id || !story?.id) {
      setError('Thiếu ID truyện để lưu.')
      return
    }

    try {
      setSaving(true)
      setError(null)

      let coverImage = getCoverRaw(story)

      if (coverFile) {
        const filePath = `${Date.now()}-${coverFile.name}`
        const publicUrl = await uploadCoverImage(coverFile, filePath)

        if (!publicUrl) {
          throw new Error('Cover upload failed')
        }

        coverImage = publicUrl
      }

      const nextSlug = form.slug.trim() || generateSlug(form.title)

      const payload: any = {
        title: form.title.trim(),
        slug: nextSlug,
        author: form.author.trim() || 'Sưu Tầm',
        description: form.description,
        genres: form.categorySlug ? [form.categorySlug] : [],
        cover_image: coverImage,
        status: form.visibility,
        completion_status: form.completionStatus,
      }

      const { error } = await supabase.from('stories').update(payload).eq('id', story.id)

      if (error) throw error

      alert('Đã lưu truyện.')
      navigate('/admin/content')
    } catch (err: any) {
      setError(String(err?.message ?? err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <MainLayout>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <header className="mb-6 flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs text-zinc-500">Admin / Stories / Edit</div>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-100">Edit Story</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Sửa thông tin truyện, thể loại, trạng thái và ảnh bìa.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/content"
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
            >
              ← Quay lại Admin
            </Link>

            {story?.slug ? (
              <Link
                to={`/truyen/${story.slug}?from=admin`}
                className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
              >
                View
              </Link>
            ) : null}
          </div>
        </header>

        {loading ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-400">
            Đang tải dữ liệu...
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-xl border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {!loading && story ? (
          <form onSubmit={handleSave} className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
            <section className="grid gap-4 md:grid-cols-[170px_1fr]">
              <div>
                <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60">
                  {currentCover && !imageError ? (
                    <img
                      src={currentCover}
                      alt={form.title}
                      className="h-56 w-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="flex h-56 w-full items-center justify-center text-sm text-zinc-500">
                      No cover
                    </div>
                  )}
                </div>

                <label className="mt-3 block">
                  <span className="text-xs text-zinc-400">Upload cover mới</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleCoverChange(event.target.files?.[0] ?? null)}
                    className="mt-2 block w-full text-xs text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-zinc-100"
                  />
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400">Title</label>
                  <input
                    value={form.title}
                    onChange={(event) => updateForm('title', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(event) => updateForm('slug', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400">Author</label>
                  <input
                    value={form.author}
                    onChange={(event) => updateForm('author', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-xs text-zinc-400">Thể loại</label>
                    <select
                      value={form.categorySlug}
                      onChange={(event) => updateForm('categorySlug', event.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400"
                    >
                      <option value="">-- Chưa có thể loại --</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400">Hiển thị</label>
                    <select
                      value={form.visibility}
                      onChange={(event) => updateForm('visibility', event.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400">Tiến độ</label>
                    <select
                      value={form.completionStatus}
                      onChange={(event) => updateForm('completionStatus', event.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400"
                    >
                      <option value="ongoing">Đang ra</option>
                      <option value="full">Full</option>
                      <option value="paused">Tạm dừng</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(event) => updateForm('description', event.target.value)}
                    rows={8}
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm leading-6 text-zinc-100 outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </section>

            <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-800 pt-4">
              <Link
                to="/admin/content"
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400 disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : null}
      </main>
    </MainLayout>
  )
}