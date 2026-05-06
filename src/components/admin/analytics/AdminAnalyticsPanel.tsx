import { useEffect, useMemo, useState } from 'react'

type SummaryRow = {
  name: string
  count: number
}

type TopStory = {
  story_id?: string | null
  story_slug?: string | null
  views: number
  readers: number
  chapter_starts: number
  finished_chapters: number
  next_clicks: number
}

type Segment = {
  id: string
  name: string
  description?: string | null
  city?: string | null
  country?: string | null
  source?: string | null
  utm_source?: string | null
  device_type?: string | null
  estimated_readers: number
  updated_at?: string
}

type AnalyticsSummary = {
  ok: boolean
  days: number
  overview: {
    page_views: number
    visitors: number
    sessions: number
    chapter_starts: number
    finished_chapters: number
    next_chapter_clicks: number
    reader_profiles: number
  }
  sources: SummaryRow[]
  devices: SummaryRow[]
  cities: SummaryRow[]
  countries: SummaryRow[]
  top_stories: TopStory[]
  segments: Segment[]
}

type SegmentFilters = {
  city: string
  country: string
  source: string
  utm_source: string
  device_type: string
  min_total_page_views: string
  min_total_chapter_starts: string
  min_total_finished_chapters: string
}

const defaultFilters: SegmentFilters = {
  city: '',
  country: '',
  source: '',
  utm_source: '',
  device_type: '',
  min_total_page_views: '',
  min_total_chapter_starts: '',
  min_total_finished_chapters: '',
}

function StatCard({
  title,
  value,
  note,
}: {
  title: string
  value: string | number
  note?: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="text-sm text-zinc-400">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-zinc-50">{value}</div>
      {note ? <div className="mt-1 text-xs text-zinc-500">{note}</div> : null}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-sm text-zinc-500">
      {text}
    </div>
  )
}

function PercentValue({ current, total }: { current: number; total: number }) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0

  return <span>{percent}%</span>
}

export default function AdminAnalyticsPanel() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingSegment, setSavingSegment] = useState(false)
  const [error, setError] = useState('')
  const [days, setDays] = useState(7)

  const [segmentName, setSegmentName] = useState('')
  const [segmentDescription, setSegmentDescription] = useState('')
  const [filters, setFilters] = useState<SegmentFilters>(defaultFilters)

  const overview = summary?.overview

  const finishedRate = useMemo(() => {
    if (!overview?.chapter_starts) return 0

    return Math.round(
      (overview.finished_chapters / Math.max(1, overview.chapter_starts)) * 100,
    )
  }, [overview])

  async function loadSummary(nextDays = days) {
    try {
      setLoading(true)
      setError('')

      const res = await fetch(`/api/analytics/summary?days=${nextDays}`)
      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Không tải được analytics')
      }

      setSummary(data)
    } catch (err: any) {
      setError(err?.message || 'Không tải được analytics')
    } finally {
      setLoading(false)
    }
  }

  async function saveSegment() {
    if (!segmentName.trim()) {
      alert('Nhập tên tệp độc giả trước đã.')
      return
    }

    try {
      setSavingSegment(true)

      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => String(value || '').trim()),
      )

      const res = await fetch('/api/analytics/save-segment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: segmentName.trim(),
          description: segmentDescription.trim(),
          filters: cleanFilters,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Lưu tệp thất bại')
      }

      alert(`Đã lưu tệp: ${data.estimated_readers} độc giả phù hợp.`)

      setSegmentName('')
      setSegmentDescription('')
      setFilters(defaultFilters)

      await loadSummary()
    } catch (err: any) {
      alert(err?.message || 'Lưu tệp thất bại')
    } finally {
      setSavingSegment(false)
    }
  }

  useEffect(() => {
    void loadSummary(days)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days])

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Analytics & Tệp độc giả</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Theo dõi lượt vào web, nguồn Facebook, hành vi đọc chương, khu vực và lưu tệp độc giả.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none"
          >
            <option value={1}>24 giờ</option>
            <option value={7}>7 ngày</option>
            <option value={30}>30 ngày</option>
            <option value={90}>90 ngày</option>
          </select>

          <button
            type="button"
            onClick={() => void loadSummary(days)}
            className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white"
          >
            {loading ? 'Đang tải...' : 'Tải lại'}
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-200">
          {error}
          <div className="mt-2 text-xs text-red-300">
            Nếu lỗi 404, kiểm tra đã có file API: api/analytics/summary.ts và api/analytics/save-segment.ts chưa.
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center text-sm text-zinc-400">
          Đang tải dữ liệu analytics...
        </div>
      ) : null}

      {!loading && summary ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Lượt xem trang" value={overview?.page_views || 0} />
            <StatCard title="Người dùng" value={overview?.visitors || 0} />
            <StatCard title="Phiên đọc" value={overview?.sessions || 0} />
            <StatCard title="Bắt đầu đọc chương" value={overview?.chapter_starts || 0} />
            <StatCard title="Đọc hết chương" value={overview?.finished_chapters || 0} />
            <StatCard title="Tỉ lệ đọc hết" value={`${finishedRate}%`} />
            <StatCard title="Bấm chương sau" value={overview?.next_chapter_clicks || 0} />
            <StatCard title="Reader profiles" value={overview?.reader_profiles || 0} />
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              <h3 className="font-semibold text-white">Nguồn truy cập</h3>

              <div className="mt-4 space-y-2">
                {summary.sources.length ? (
                  summary.sources.map((row) => (
                    <div
                      key={row.name}
                      className="flex items-center justify-between rounded-xl bg-zinc-950/70 px-3 py-2 text-sm"
                    >
                      <span className="text-zinc-300">{row.name}</span>
                      <span className="font-medium text-white">{row.count}</span>
                    </div>
                  ))
                ) : (
                  <EmptyState text="Chưa có dữ liệu nguồn truy cập." />
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              <h3 className="font-semibold text-white">Thiết bị</h3>

              <div className="mt-4 space-y-2">
                {summary.devices.length ? (
                  summary.devices.map((row) => (
                    <div
                      key={row.name}
                      className="flex items-center justify-between rounded-xl bg-zinc-950/70 px-3 py-2 text-sm"
                    >
                      <span className="text-zinc-300">{row.name}</span>
                      <span className="font-medium text-white">{row.count}</span>
                    </div>
                  ))
                ) : (
                  <EmptyState text="Chưa có dữ liệu thiết bị." />
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              <h3 className="font-semibold text-white">Khu vực độc giả</h3>

              <div className="mt-4 space-y-2">
                {summary.cities.length ? (
                  summary.cities.slice(0, 10).map((row) => (
                    <div
                      key={row.name}
                      className="flex items-center justify-between rounded-xl bg-zinc-950/70 px-3 py-2 text-sm"
                    >
                      <span className="text-zinc-300">{row.name}</span>
                      <span className="font-medium text-white">{row.count}</span>
                    </div>
                  ))
                ) : (
                  <EmptyState text="Chưa có dữ liệu thành phố. Local thường không có city, deploy Vercel mới có IP location." />
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <h3 className="font-semibold text-white">Top truyện kéo traffic</h3>

            <div className="mt-4 overflow-x-auto">
              {summary.top_stories.length ? (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-left text-zinc-400">
                      <th className="py-2 pr-4">Truyện</th>
                      <th className="py-2 pr-4">Views</th>
                      <th className="py-2 pr-4">Readers</th>
                      <th className="py-2 pr-4">Đọc chương</th>
                      <th className="py-2 pr-4">Đọc hết</th>
                      <th className="py-2 pr-4">Tỉ lệ đọc hết</th>
                      <th className="py-2 pr-4">Bấm chương sau</th>
                    </tr>
                  </thead>

                  <tbody>
                    {summary.top_stories.map((story) => (
                      <tr
                        key={story.story_id || story.story_slug || `${story.views}-${story.readers}`}
                        className="border-b border-zinc-900 text-zinc-300"
                      >
                        <td className="py-3 pr-4 text-white">
                          {story.story_slug || story.story_id || 'unknown'}
                        </td>
                        <td className="py-3 pr-4">{story.views}</td>
                        <td className="py-3 pr-4">{story.readers}</td>
                        <td className="py-3 pr-4">{story.chapter_starts}</td>
                        <td className="py-3 pr-4">{story.finished_chapters}</td>
                        <td className="py-3 pr-4">
                          <PercentValue
                            current={story.finished_chapters}
                            total={story.chapter_starts}
                          />
                        </td>
                        <td className="py-3 pr-4">{story.next_clicks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState text="Chưa có dữ liệu truyện." />
              )}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              <h3 className="font-semibold text-white">Lưu tệp độc giả</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Lọc theo thành phố, nguồn Facebook, thiết bị và hành vi đọc rồi lưu thành tệp.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  value={segmentName}
                  onChange={(event) => setSegmentName(event.target.value)}
                  placeholder="Tên tệp, ví dụ: Facebook Đà Nẵng đọc sâu"
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none sm:col-span-2"
                />

                <input
                  value={segmentDescription}
                  onChange={(event) => setSegmentDescription(event.target.value)}
                  placeholder="Mô tả tệp"
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none sm:col-span-2"
                />

                <input
                  value={filters.city}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, city: event.target.value }))
                  }
                  placeholder="City, ví dụ: Da Nang"
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
                />

                <input
                  value={filters.country}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, country: event.target.value }))
                  }
                  placeholder="Country, ví dụ: VN"
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
                />

                <select
                  value={filters.source}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, source: event.target.value }))
                  }
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="">Tất cả nguồn</option>
                  <option value="facebook">Facebook</option>
                  <option value="google">Google</option>
                  <option value="direct">Direct</option>
                  <option value="other">Other</option>
                </select>

                <select
                  value={filters.device_type}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, device_type: event.target.value }))
                  }
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="">Tất cả thiết bị</option>
                  <option value="mobile">Mobile</option>
                  <option value="desktop">Desktop</option>
                  <option value="tablet">Tablet</option>
                </select>

                <input
                  type="number"
                  min="0"
                  value={filters.min_total_page_views}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      min_total_page_views: event.target.value,
                    }))
                  }
                  placeholder="Page views tối thiểu"
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
                />

                <input
                  type="number"
                  min="0"
                  value={filters.min_total_chapter_starts}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      min_total_chapter_starts: event.target.value,
                    }))
                  }
                  placeholder="Chương đã đọc tối thiểu"
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
                />

                <input
                  type="number"
                  min="0"
                  value={filters.min_total_finished_chapters}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      min_total_finished_chapters: event.target.value,
                    }))
                  }
                  placeholder="Chương đọc hết tối thiểu"
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
                />

                <button
                  type="button"
                  onClick={() => void saveSegment()}
                  disabled={savingSegment}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
                >
                  {savingSegment ? 'Đang lưu tệp...' : 'Lưu thành tệp độc giả'}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              <h3 className="font-semibold text-white">Tệp đã lưu</h3>

              <div className="mt-4 space-y-3">
                {summary.segments.length ? (
                  summary.segments.map((segment) => (
                    <div
                      key={segment.id}
                      className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-white">{segment.name}</div>
                          {segment.description ? (
                            <div className="mt-1 text-xs text-zinc-500">
                              {segment.description}
                            </div>
                          ) : null}
                        </div>

                        <div className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                          {segment.estimated_readers} độc giả
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
                        {segment.city ? (
                          <span className="rounded-full bg-zinc-900 px-2 py-1">
                            City: {segment.city}
                          </span>
                        ) : null}

                        {segment.source ? (
                          <span className="rounded-full bg-zinc-900 px-2 py-1">
                            Source: {segment.source}
                          </span>
                        ) : null}

                        {segment.device_type ? (
                          <span className="rounded-full bg-zinc-900 px-2 py-1">
                            Device: {segment.device_type}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState text="Chưa có tệp độc giả nào." />
                )}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </section>
  )
}