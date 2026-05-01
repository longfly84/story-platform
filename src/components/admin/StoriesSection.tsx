import { Link } from 'react-router-dom'
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
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Stories</h2>
          <p className="mt-1 text-xs text-zinc-500">Quản lý truyện, public/draft, chương và trang xem public.</p>
        </div>
      </div>

      {loading ? <div className="mt-3 text-sm text-zinc-400">Loading...</div> : null}
      {error ? <div className="mt-3 text-sm text-red-400">{error}</div> : null}

      <ul className="mt-3 grid grid-cols-1 gap-3">
        {stories.map((s: any) => {
          const rawCover = s?.cover_image ?? s?.cover ?? s?.image_url ?? null
          const resolvedCover = resolveCoverUrl(rawCover)
          const coverErrored = imageErrors?.[s?.id]
          const categorySlug = Array.isArray(s.genres) ? s.genres[0] : ''
          const categoryName = categorySlug ? (categories.find((c: any) => c.slug === categorySlug)?.name ?? categorySlug) : ''

          if (import.meta.env.DEV) {
            console.log('[cover-debug]', {
              title: s?.title,
              cover_image: s?.cover_image,
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
