import { Link } from "react-router-dom"

import type { Story } from "@/data/stories"

export default function StoryCard({ story }: { story: Story }) {
  const latest = story.chapters.at(-1)
  const latestLabel = latest ? `Chương ${latest.number}` : "Chưa có chương"

  return (
    <Link to={`/truyen/${story.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 transition duration-200 ease-out group-hover:-translate-y-0.5 group-hover:border-zinc-700 group-hover:bg-zinc-900/55">
        <img
          src={story.coverImage}
          alt={story.title}
          className="h-[180px] w-full object-cover transition duration-300 group-hover:scale-105 sm:h-[240px] lg:h-[260px]"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

        <div className="absolute bottom-0 left-0 p-3">
          <h3 className="line-clamp-2 text-sm font-semibold text-white" title={story.title}>
            {story.title}
          </h3>

          <p className="mt-1 text-xs text-zinc-300">{latestLabel}</p>
        </div>

        {story.tags?.includes("HOT") ? (
          <div className="absolute left-2 top-2 rounded bg-amber-500 px-2 py-1 text-[11px] font-bold tracking-wide text-zinc-950">
            HOT
          </div>
        ) : null}
      </div>
    </Link>
  )
}
