import { Link, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { Helmet } from "react-helmet"

import MainLayout from "@/layouts/MainLayout"
import { getStoryBySlug } from "@/data/stories"
import { StarIcon, EyeIcon, ClockIcon } from "lucide-react"

export default function StoryDetailPage() {
  const { slug } = useParams()
  const story = slug ? getStoryBySlug(slug) : undefined

  const [rating, setRating] = useState(4.5)
  const [views, setViews] = useState(12345)
  const [status, setStatus] = useState("Ongoing")

  useEffect(() => {
    if (story) {
      setRating(parseFloat((Math.random() * 2 + 3).toFixed(1)))
      setViews(Math.floor(Math.random() * 100000 + 1000))
      setStatus(Math.random() > 0.5 ? "Ongoing" : "Completed")
    }
  }, [story])

  if (!story) {
    return (
      <MainLayout>
        <main className="mx-auto max-w-5xl px-4 py-10">
          <Helmet>
            <title>Không tìm thấy truyện - Story Platform</title>
            <meta name="description" content="Slug không hợp lệ hoặc chưa có trong fake data." />
          </Helmet>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6">
            <h1 className="text-2xl font-semibold">Không tìm thấy truyện</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Slug không hợp lệ hoặc chưa có trong fake data.
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200"
            >
              Về trang chủ
            </Link>
          </div>
        </main>
      </MainLayout>
    )
  }

  return (
    <>
      <Helmet>
        <title>{story.title} - Story Platform</title>
        <meta name="description" content={story.description} />
      </Helmet>
      <MainLayout>
        <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full rounded-lg object-cover sm:w-72 sm:h-auto"
              loading="lazy"
            />
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-3xl font-bold text-zinc-100">{story.title}</h1>
                <p className="mt-2 text-sm text-zinc-400">{story.author ?? "Đang cập nhật"}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                  <div className="flex items-center gap-1">
                    <StarIcon className="size-4 text-amber-400" />
                    <span>{rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <EyeIcon className="size-4" />
                    <span>{views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="size-4" />
                    <span>{status}</span>
                  </div>
                </div>
                <p className="mt-4 text-zinc-300">{story.description}</p>
              </div>
              <a
                href={`/doc-truyen/${story.slug}/${story.chapters[0]?.slug ?? "chuong-1"}`}
                className="mt-6 inline-block w-full rounded-lg bg-amber-300 px-4 py-2 text-center text-sm font-semibold text-zinc-950 hover:bg-amber-200 sm:w-auto"
              >
                Đọc từ đầu
              </a>
            </div>
          </div>
        </main>
      </MainLayout>
    </>
  )
}