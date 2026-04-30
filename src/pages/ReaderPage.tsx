import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet"

import MainLayout from "@/layouts/MainLayout"
import { getStoryBySlug } from "@/data/stories"
import { saveReadingHistory } from "@/lib/localStorageHelpers"

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

  // Cho phép nhận chapter là số hoặc slug
  let currentChapter = undefined
  let chapterIndex = -1
  if (chapter) {
    if (/^\d+$/.test(chapter)) {
      // Nếu chapter là số, tìm chương có number === số đó
      chapterIndex = story.chapters.findIndex((c) => c.number === Number(chapter))
    } else {
      // Nếu chapter là slug, tìm chương có slug === chapter
      chapterIndex = story.chapters.findIndex((c) => c.slug === chapter)
    }
    currentChapter = chapterIndex !== -1 ? story.chapters[chapterIndex] : undefined
  }

  // Nếu không tìm thấy chương, fallback về chương đầu tiên
  if (!currentChapter) {
    chapterIndex = 0
    currentChapter = story.chapters[0]
  }
  
  if (!currentChapter) {
    return (
      <MainLayout>
        <main className="mx-auto max-w-4xl px-4 py-10 text-center text-zinc-400">
          Chương không tồn tại
          <div className="mt-4">
            <Link
              to={`/doc-truyen/${slug}/1`}
              className="inline-block rounded bg-amber-300 px-4 py-2 text-zinc-950 hover:bg-amber-200"
            >
              Về trang chủ
            </Link>
          </div>
        </main>
      </MainLayout>
    )
  }

  const prevChapter = chapterIndex > 0 ? story.chapters[chapterIndex - 1] : null
  const nextChapter = chapterIndex < story.chapters.length - 1 ? story.chapters[chapterIndex + 1] : null

  // Nút Đọc chương mới nhất dẫn tới chương mới nhất
  const latestChapter = story.chapters[story.chapters.length - 1]

  const fontSizeClasses: Record<string, string> = {
    small: "text-sm leading-relaxed",
    medium: "text-base leading-relaxed",
    large: "text-lg leading-relaxed",
  }

  // Save reading history on mount or when story/chapter changes
  useEffect(() => {
    if (story && currentChapter) {
      saveReadingHistory({
        storySlug: story.slug,
        storyTitle: story.title,
        chapterSlug: currentChapter.slug,
        chapterNumber: currentChapter.number,
        chapterTitle: currentChapter.title,
        lastRead: Date.now(),
      })
    }
  }, [story, currentChapter])

  return (
    <>
      <Helmet>
        <title>{story.title} - {currentChapter.title} - Story Platform</title>
        <meta name="description" content={`Đọc chương ${currentChapter.title} của truyện ${story.title}.`} />
      </Helmet>
      <MainLayout>
        <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between">
            <Link
              to={`/truyen/${story.slug}`}
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
          <div className="mb-4">
            <button
              onClick={() => navigate(`/doc-truyen/${slug}/${story.chapters[0]?.slug ?? "chuong-1"}`)}
              className="rounded bg-amber-300 px-4 py-2 text-zinc-950 hover:bg-amber-200"
            >
              Đọc từ đầu
            </button>
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
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => navigate(`/doc-truyen/${slug}/${latestChapter.slug}`)}
              className="rounded bg-amber-300 px-4 py-2 text-zinc-950 hover:bg-amber-200"
            >
              Đọc chương mới nhất
            </button>
          </div>
        </main>
      </MainLayout>
    </>
  )
}