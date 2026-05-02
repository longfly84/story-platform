import { Link } from 'react-router-dom'
import { useState } from 'react'
import AdminStoryCard from './AdminStoryCard'

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

  const q = (query || '').trim().toLowerCase()
  const filtered = q ? stories.filter((s:any) => {
    const inTitle = String(s.title || '').toLowerCase().includes(q)
    const inAuthor = String(s.author || '').toLowerCase().includes(q)
    const inSlug = String(s.slug || '').toLowerCase().includes(q)
    const inStatus = String(s.status || '').toLowerCase().includes(q)
    const inGenres = Array.isArray(s.genres) && s.genres.join(' ').toLowerCase().includes(q)
    return inTitle || inAuthor || inSlug || inStatus || inGenres
  }) : stories
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Stories</h2>
          <p className="mt-1 text-xs text-zinc-500">Quản lý truyện, public/draft, chương và trang xem public.</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input placeholder="Tìm truyện theo tên, tác giả, slug..." value={query} onChange={(e)=>setQuery(e.target.value)} className="w-full rounded-md border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none" />
      </div>
      {loading ? <div className="mt-3 text-sm text-zinc-400">Loading...</div> : null}
      {error ? <div className="mt-3 text-sm text-red-400">{error}</div> : null}

      <ul className="mt-3 grid grid-cols-1 gap-3">
        {filtered.length === 0 ? (
          <div className="mt-3 text-sm text-zinc-400">Không tìm thấy truyện phù hợp.</div>
        ) : filtered.map((s: any) => {
          // try several possible cover fields (some stories use different keys)
          const rawCover = s?.cover_image ?? s?.coverImage ?? s?.cover_url ?? s?.image_url ?? s?.image ?? s?.cover ?? null
          // prefer resolved public URL from helper; if that returns undefined, try resolving common fallbacks
          let resolvedCover = resolveCoverUrl(rawCover)
          if (!resolvedCover) {
            const fallbackRaw = s?.cover_image ?? s?.cover_url ?? s?.image_url ?? null
            resolvedCover = resolveCoverUrl(fallbackRaw) ?? undefined
          }
          const coverErrored = imageErrors?.[s?.id]
          const categorySlug = Array.isArray(s.genres) ? s.genres[0] : ''
          const categoryName = categorySlug ? (categories.find((c: any) => c.slug === categorySlug)?.name ?? categorySlug) : ''

            if (import.meta.env.DEV) {
              console.log('[admin-cover]', {
                title: s?.title,
                cover_image: s?.cover_image,
                cover_url: s?.cover_url,
                image_url: s?.image_url,
                resolvedCover,
              })
            }

          const isDraft = s?.status === 'draft'

          return (
            <li key={s.id}>
              <AdminStoryCard
                story={s}
                coverSrc={resolvedCover && !coverErrored ? resolvedCover : null}
                categoryName={categoryName}
                onPublishToggle={() => onTogglePublish(s)}
                onEdit={() => {
                  window.location.href = `/admin/stories/${s.id}/edit`
                }}
                onDelete={() => {
                  const choice = window.prompt('Nhập 1 để xóa cả truyện, 2 để mở phần chương để xóa chương, khác để hủy')
                  if (choice === '1') {
                    if (!confirm('Xóa truyện sẽ xóa toàn bộ chương liên quan nếu có. Tiếp tục?')) return
                    void onDeleteStory(s.id)
                  } else if (choice === '2') {
                    void onOpenChapters(s.slug, s.title)
                  }
                }}
                onChapters={() => void onOpenChapters(s.slug, s.title)}
                viewHref={`/truyen/${s.slug}?from=admin`}
                onCoverError={() => setImageErrors((prev) => ({ ...(prev || {}), [s.id]: true }))}
              />

              <div className="mt-1 flex items-center gap-2 pl-1 text-[11px] text-zinc-600">
                <span>{isDraft ? 'Draft' : 'Published'}</span>
                {s.slug ? <Link className="text-zinc-500 hover:text-amber-300" to={`/truyen/${s.slug}?from=admin`}>/{s.slug}</Link> : null}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
