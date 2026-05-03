import { Link } from 'react-router-dom'

type FactoryJobStatus = 'pending' | 'running' | 'success' | 'failed' | 'stopped'

type FactoryJob = {
  id: string
  index: number
  title: string
  genreLabel: string
  genreSlug: string
  heroineLabel: string
  status: FactoryJobStatus
  chapterProgress: string
  coverStatus: 'off' | 'pending' | 'success' | 'failed' | 'skipped'
  error?: string
}

type FactoryLog = {
  id: string
  time: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

type FactoryRunSnapshot = {
  jobs?: FactoryJob[]
  logs?: FactoryLog[]
  status?: string
  startedAt?: string
  finishedAt?: string
}

const AI_FACTORY_STORAGE_KEY = 'storyPlatform.aiFactory.lastRun'

function statusClass(status: FactoryJobStatus) {
  if (status === 'success') return 'bg-emerald-500/15 text-emerald-200'
  if (status === 'failed') return 'bg-red-500/15 text-red-200'
  if (status === 'stopped') return 'bg-orange-500/15 text-orange-200'
  if (status === 'running') return 'bg-yellow-500/15 text-yellow-200'
  return 'bg-slate-500/15 text-slate-300'
}

export default function AIFactoryResultsPage() {
  let snapshot: FactoryRunSnapshot | null = null

  try {
    const raw = localStorage.getItem(AI_FACTORY_STORAGE_KEY)
    snapshot = raw ? (JSON.parse(raw) as FactoryRunSnapshot) : null
  } catch {
    snapshot = null
  }

  const jobs = snapshot?.jobs ?? []
  const logs = snapshot?.logs ?? []

  const successJobs = jobs.filter((job) => job.status === 'success')
  const failedJobs = jobs.filter((job) => job.status === 'failed')
  const stoppedJobs = jobs.filter((job) => job.status === 'stopped')

  return (
    <div className="min-h-screen bg-[#050609] text-white">
      <div className="border-b border-white/10 bg-[#151309]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="text-sm font-bold text-yellow-300">Admin đang đăng nhập</div>

          <div className="flex items-center gap-3 text-sm">
            <Link className="text-yellow-300 hover:text-yellow-200" to="/admin/ai-factory">
              AI Factory
            </Link>
            <Link className="text-slate-200 hover:text-white" to="/admin">
              Admin Dashboard
            </Link>
            <Link className="text-slate-200 hover:text-white" to="/">
              Xem trang chủ
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-yellow-300">Admin AI Factory</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Kết quả lần chạy Factory
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Trang này chỉ hiển thị các truyện Factory vừa tạo, kèm lỗi nếu có.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/ai-factory"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white transition hover:bg-white/[0.08]"
            >
              Quay lại Factory
            </Link>
            <Link
              to="/admin/content"
              className="rounded-xl bg-yellow-300 px-4 py-2 text-sm font-black text-black transition hover:bg-yellow-200"
            >
              Xem trong Admin Content
            </Link>
          </div>
        </div>

        {!snapshot ? (
          <section className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5">
            <h2 className="text-lg font-bold text-white">Chưa có dữ liệu Factory</h2>
            <p className="mt-2 text-sm text-slate-400">
              Chưa tìm thấy kết quả lần chạy gần nhất. Hãy quay lại AI Factory và chạy thử trước.
            </p>
          </section>
        ) : (
          <>
            <section className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-4">
                <div className="text-2xl font-black text-white">{jobs.length}</div>
                <div className="text-sm text-slate-400">Tổng job</div>
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                <div className="text-2xl font-black text-emerald-100">{successJobs.length}</div>
                <div className="text-sm text-emerald-200/80">Thành công</div>
              </div>
              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
                <div className="text-2xl font-black text-red-100">{failedJobs.length}</div>
                <div className="text-sm text-red-200/80">Lỗi</div>
              </div>
              <div className="rounded-2xl border border-orange-400/20 bg-orange-500/10 p-4">
                <div className="text-2xl font-black text-orange-100">{stoppedJobs.length}</div>
                <div className="text-sm text-orange-200/80">Đã dừng</div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-950/80 p-4 sm:p-5">
              <h2 className="text-lg font-bold text-white">Truyện đã tạo thành công</h2>

              <div className="mt-4 space-y-3">
                {successJobs.length ? (
                  successJobs.map((job) => (
                    <div
                      key={job.id}
                      className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-base font-bold text-white">
                            #{job.index} — {job.title}
                          </div>
                          <div className="mt-1 text-sm text-slate-300">
                            {job.genreLabel} • {job.heroineLabel}
                          </div>
                          <div className="mt-2 text-xs text-slate-400">
                            Chapter: {job.chapterProgress} • Cover: {job.coverStatus}
                          </div>
                        </div>

                        <span className="w-fit rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-200">
                          success
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-500">
                    Không có truyện nào tạo thành công trong lần chạy này.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-950/80 p-4 sm:p-5">
              <h2 className="text-lg font-bold text-white">Truyện lỗi / chưa hoàn tất</h2>

              <div className="mt-4 space-y-3">
                {[...failedJobs, ...stoppedJobs].length ? (
                  [...failedJobs, ...stoppedJobs].map((job) => (
                    <div
                      key={job.id}
                      className="rounded-xl border border-red-400/20 bg-red-500/10 p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-base font-bold text-white">
                            #{job.index} — {job.title || 'Chưa tạo được title'}
                          </div>
                          <div className="mt-1 text-sm text-slate-300">
                            {job.genreLabel} • {job.heroineLabel}
                          </div>
                          <div className="mt-2 text-xs text-slate-400">
                            Chapter: {job.chapterProgress} • Cover: {job.coverStatus}
                          </div>
                          {job.error ? (
                            <div className="mt-3 rounded-lg border border-red-400/20 bg-black/30 p-3 text-sm text-red-100">
                              {job.error}
                            </div>
                          ) : null}
                        </div>

                        <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${statusClass(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-500">
                    Không có lỗi trong lần chạy này.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-950/80 p-4 sm:p-5">
              <h2 className="text-lg font-bold text-white">Log gần nhất</h2>

              <div className="mt-4 max-h-[360px] space-y-2 overflow-auto rounded-xl bg-black/50 p-3">
                {logs.length ? (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300"
                    >
                      <span className="mr-2 text-xs opacity-70">[{log.time}]</span>
                      {log.message}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500">Không có log.</div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}