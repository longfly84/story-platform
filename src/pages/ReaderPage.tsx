import { useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"

import MainLayout from "@/layouts/MainLayout"
import { getStoryBySlug } from "@/data/stories"

export default function ReaderPage() {
  const { slug, chapter } = useParams<{ slug: string; chapter: string }>()
  const navigate = useNavigate()
  const story = slug ? getStoryBySlug(slug) : undefined

  const [fontSize, setFontSize] = useState("medium") // small, medium, large

  if (!story) {
    return (
      <MainLayout>
        <main className="mx-auto max-w-4xl px-4 py-10 text-center text-zinc-400">
          Truyện không tồn tại
          <div className="mt-4">
            <Link
              to={`/`}
              className="inline-block rounded bg-amber-300 px-4 py-2 text-zinc-950 hover:bg-amber-200"
            >
              Về trang chủ
            </Link>
          </div>
        </main>
      </MainLayout>
    )
  }

  const chapterIndex = story.chapters.findIndex((c) => c.slug === chapter)
  const currentChapter = chapterIndex !== -1 ? story.chapters[chapterIndex] : undefined

  if (!currentChapter) {
    return (
      <MainLayout>
        <main className="mx-auto max-w-4xl px-4 py-10 text-center text-zinc-400">
          Chương không tồn tại
          <div className="mt-4">
            <Link
              to={`/doc-truyen/${slug}`}
              className="inline-block rounded bg-amber-300 px-4 py-2 text-zinc-950 hover:bg-amber-200"
            >
              Quay lại trang truyện
            </Link>
          </div>
        </main>
      </MainLayout>
    )
  }

  const prevChapter = chapterIndex > 0 ? story.chapters[chapterIndex - 1] : null
  const nextChapter = chapterIndex < story.chapters.length - 1 ? story.chapters[chapterIndex + 1] : null

  const fontSizeClasses: Record<string, string> = {
    small: "text-sm leading-relaxed",
    medium: "text-base leading-relaxed",
    large: "text-lg leading-relaxed",
  }

  return (
    <MainLayout>
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <Link
            to={`/doc-truyen/${slug}`}
            className="text-sm text-amber-300 hover:underline"
          >
            &larr; Quay lại trang truyện
          </Link>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <button
              onClick={() => setFontSize("small")}
              className={`rounded px-2 py-1 hover:bg-zinc-700 ${
                fontSize === "small" ? "bg-zinc-700" : ""
              }`}
              aria-label="Cỡ chữ nhỏ"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize("medium")}
              className={`rounded px-2 py-1 hover:bg-zinc-700 ${
                fontSize === "medium" ? "bg-zinc-700" : ""
              }`}
              aria-label="Cỡ chữ vừa"
            >
              A
            </button>
            <button
              onClick={() => setFontSize("large")}
              className={`rounded px-2 py-1 hover:bg-zinc-700 ${
                fontSize === "large" ? "bg-zinc-700" : ""
              }`}
              aria-label="Cỡ chữ lớn"
            >
              A+
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-zinc-100">{story.title}</h1>
        <h2 className="mt-1 text-xl font-semibold text-zinc-300">{currentChapter.title}</h2>

        <article
          className={`mt-6 max-w-3xl space-y-6 rounded bg-zinc-900/20 p-6 text-zinc-200 ${fontSizeClasses[fontSize]}`}
          style={{ whiteSpace: "pre-wrap" }}
        >
          {currentChapter.content}
        </article>

        <nav className="sticky bottom-0 left-0 z-50 mt-6 flex w-full max-w-4xl justify-between gap-4 rounded-t bg-zinc-900/80 px-4 py-3 backdrop-blur-sm sm:static sm:bg-transparent sm:px-0">
          <button
            onClick={() => prevChapter && navigate(`/doc-truyen/${slug}/${prevChapter.slug}`)}
            disabled={!prevChapter}
            className={`rounded px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              prevChapter ? "bg-amber-300 text-zinc-950 hover:bg-amber-200" : "bg-zinc-700 text-zinc-400"
            }`}
          >
            Chương trước
          </button>
          <button
            onClick={() => nextChapter && navigate(`/doc-truyen/${slug}/${nextChapter.slug}`)}
            disabled={!nextChapter}
            className={`rounded px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              nextChapter ? "bg-amber-300 text-zinc-950 hover:bg-amber-200" : "bg-zinc-700 text-zinc-400"
            }`}
          >
            Chương sau
          </button>
        </nav>
      </main>
    </MainLayout>
  )
}