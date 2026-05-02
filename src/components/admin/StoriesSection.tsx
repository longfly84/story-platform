import { Link } from 'react-router-dom'
import { useState } from 'react'

type Props = {
  stories: any[]
  categories: any[]
  loading: boolean
  error: string | null
  imageErrors: Record<string, boolean>
  resolveCoverUrl: (value?: string | null) => string | null | undefined
  setImageErrors: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void
  onTogglePublish: (story: any) => void | Promise<void>
  onDeleteStory: (id: number) => void | Promise<void>
  onOpenChapters: (slug: string, title?: string) => void | Promise<void>
}

export default function StoriesSection({
  stories,
  categories,
  loading,
  error,
  imageErrors,
  resolveCoverUrl,
  setImageErrors,
  onTogglePublish,
  onDeleteStory,
  onOpenChapters,
}: Props) {
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()

  const filtered = q
    ? stories.filter((story: any) => {
        const inTitle = String(story.title || '').toLowerCase().includes(q)
        const inAuthor = String(story.author || '').toLowerCase().includes(q)
        const inSlug = String(story.slug || '').toLowerCase().includes(q)
        const inStatus = String(story.status || '').toLowerCase().includes(q)
        const inGenres =
          Array.isArray(story.genres) && story.genres.join(' ').toLowerCase().includes(q)

        return inTitle || inAuthor || inSlug || inStatus || inGenres
      })
    : stories

  function getCoverSrc(story: any) {
    const rawCover =
      story?.cover_image ??
      story?.coverImage ??
      story?.cover_url ??
      story?.image_url ??
      story?.image ??
      story?.cover ??
      null

    return resolveCoverUrl(rawCover) ?? undefined
  }

  function getCategoryName(story: any) {
    const categorySlug = Array.isArray(story.genres) ? story.genres[0] : ''
    if (!categorySlug) return ''

    return categories.find((category: any) => category.slug === categorySlug)?.name ?? categorySlug
  }

  async function handleDeleteClick(story: any) {
    const choice = window.prompt(
      [
        `Bạn muốn làm gì với truyện: ${story.title}?`,
        '',
        'Nhập 1 để XÓA CẢ TRUYỆN.',
        'Nhập 2 để MỞ DANH SÁCH CHƯƠNG để sửa/xóa chương.',
        '',
        'Nhập số 1 hoặc 2:',
      ].join('\n')
    )

    if (choice === null) return

    const normalized = choice.trim()

    if (normalized === '2') {
      await onOpenChapters(story.slug, story.title)
      return
    }

    if (normalized !== '1') {
      alert('Lựa chọn không hợp lệ. Nhập 1 hoặc 2.')
      return
    }

    const ok = window.confirm(
      `Xóa cả truyện "${story.title}"?\n\nNếu chỉ muốn sửa/xóa chương thì chọn 2.`
    )

    if (!ok) return

    await onDeleteStory(story.id)
  }

  return (
    <section className="mb-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Stories</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Quản lý truyện, public/draft, chương và trang xem public.
        </p>
      </div>

      <div className="mt-3">
        <input
          placeholder="Tìm truyện theo tên, tác giả, slug..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-md border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none"
        />
      </div>

      {loading ? <div className="mt-3 text-sm text-zinc-400">Loading...</div> : null}
      {error ? <div className="mt-3 text-sm text-red-400">{error}</div> : null}

      <ul className="mt-3 grid grid-cols-1 gap-3">
        {filtered.length === 0 ? (
          <div className="mt-3 text-sm text-zinc-400">Không tìm thấy truyện phù hợp.</div>
        ) : (
          filtered.map((story: any) => {
            const coverSrc = getCoverSrc(story)
            const coverErrored = imageErrors?.[story?.id]
            const categoryName = getCategoryName(story)
            const isDraft = story?.status === 'draft'
            const isPublished = story?.status !== 'draft'

            return (
              <li key={story.id}>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                  <div className="flex gap-4">
                    <div className="h-28 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                      {coverSrc && !coverErrored ? (
                        <img
                          src={coverSrc}
                          alt={story.title}
                          className="h-full w-full object-cover"
                          onError={() =>
                            setImageErrors((prev) => ({
                              ...(prev || {}),
                              [story.id]: true,
                            }))
                          }
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-zinc-600">
                          No cover
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-base font-semibold text-zinc-100">
                        {story.title}
                      </h3>

                      <div className="mt-1 text-sm text-zinc-400">
                        {story.author || 'Không rõ tác giả'}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded bg-emerald-950 px-2 py-1 text-xs font-semibold text-emerald-300">
                          {story.story_status || story.completion_status || 'Full'}
                        </span>

                        <span className="rounded bg-emerald-950 px-2 py-1 text-xs font-semibold text-emerald-300">
                          {isPublished ? 'Published' : 'Draft'}
                        </span>

                        {categoryName ? (
                          <span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-200">
                            {categoryName}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onTogglePublish(story)}
                          className="rounded bg-zinc-700 px-3 py-2 text-sm font-semibold text-amber-300 hover:bg-zinc-600"
                        >
                          {isDraft ? 'Publish' : 'Unpublish'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            window.location.href = `/admin/stories/${story.id}/edit`
                          }}
                          className="rounded bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-500"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDeleteClick(story)}
                          className="rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500"
                        >
                          Delete
                        </button>

                        <button
                          type="button"
                          onClick={() => void onOpenChapters(story.slug, story.title)}
                          className="rounded bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-500"
                        >
                          Chapters
                        </button>

                        <Link
                          to={`/truyen/${story.slug}?from=admin`}
                          className="rounded bg-amber-300 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-1 flex items-center gap-2 pl-1 text-[11px] text-zinc-600">
                  <span>{isDraft ? 'Draft' : 'Published'}</span>
                  {story.slug ? (
                    <Link
                      className="text-zinc-500 hover:text-amber-300"
                      to={`/truyen/${story.slug}?from=admin`}
                    >
                      /{story.slug}
                    </Link>
                  ) : null}
                </div>
              </li>
            )
          })
        )}
      </ul>
    </section>
  )
}