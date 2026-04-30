import { Link } from "react-router-dom"
import MainLayout from "@/layouts/MainLayout"

export default function NotFoundPage() {
  return (
    <MainLayout>
      <main className="mx-auto max-w-4xl px-4 py-20 text-center text-zinc-400">
        <h1 className="text-4xl font-bold text-zinc-100 mb-4">404 - Trang không tồn tại</h1>
        <p className="mb-6">Trang bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
        <Link
          to="/"
          className="inline-block rounded bg-amber-300 px-6 py-3 text-zinc-950 font-semibold hover:bg-amber-200"
        >
          Quay về trang chủ
        </Link>
      </main>
    </MainLayout>
  )
}