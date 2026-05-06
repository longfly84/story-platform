import { useEffect, useState } from 'react'
import MainLayout from '@/layouts/MainLayout'
import { Link } from 'react-router-dom'
import AdminAdsManager from '@/components/admin/ads/AdminAdsManager'
import { supabase } from '@/lib/supabase'

const INLINE_AD_COUNT_KEY = 'reader_inline_ad_count'
const INLINE_AD_COUNT_OPTIONS = [0, 1, 2, 3]

function parseInlineAdCount(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.min(3, Math.floor(value)))
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? Math.max(0, Math.min(3, Math.floor(parsed))) : 0
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return parseInlineAdCount(record.count ?? record.value ?? record.inlineAdCount)
  }

  return 0
}

function ReaderInlineAdsSettings() {
  const [inlineAdCount, setInlineAdCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadSetting() {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('ad_settings')
          .select('value')
          .eq('key', INLINE_AD_COUNT_KEY)
          .maybeSingle()

        if (error) throw error

        if (!mounted) return

        setInlineAdCount(parseInlineAdCount(data?.value))
      } catch (err: any) {
        if (!mounted) return

        setError(
          'Chưa đọc được bảng ad_settings. Nếu chưa tạo bảng, chạy SQL tao gửi bên dưới rồi lưu lại setting này.',
        )
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void loadSetting()

    return () => {
      mounted = false
    }
  }, [])

  async function saveSetting() {
    try {
      setSaving(true)
      setMessage(null)
      setError(null)

      const safeCount = Math.max(0, Math.min(3, Math.floor(Number(inlineAdCount || 0))))

      const { error } = await supabase.from('ad_settings').upsert(
        {
          key: INLINE_AD_COUNT_KEY,
          value: String(safeCount),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' },
      )

      if (error) throw error

      setInlineAdCount(safeCount)
      setMessage(`Đã lưu: mỗi chương sẽ hiển thị tối đa ${safeCount} quảng cáo inline.`)
    } catch (err: any) {
      setError(String(err?.message ?? err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mb-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Cấu hình quảng cáo trong nội dung chương</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-400">
            Chọn số quảng cáo sẽ chèn vào giữa nội dung chương. Ví dụ chọn 2 thì Reader sẽ tự chia chương
            thành 3 phần và chèn 2 quảng cáo ở khoảng 1/3 và 2/3 chương.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-zinc-300" htmlFor="inline-ad-count">
            Số quảng cáo/chương
          </label>
          <select
            id="inline-ad-count"
            value={inlineAdCount}
            disabled={loading || saving}
            onChange={(event) => setInlineAdCount(parseInlineAdCount(event.target.value))}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-semibold text-zinc-100 outline-none focus:border-amber-300"
          >
            {INLINE_AD_COUNT_OPTIONS.map((count) => (
              <option key={count} value={count}>
                {count} quảng cáo
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={saving || loading}
            onClick={saveSetting}
            className="rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-sm leading-6 text-zinc-400">
        Để Reader lấy quảng cáo inline, tạo quảng cáo active với placement:
        <span className="ml-1 font-mono text-amber-300">chapter_inline_1</span>,
        <span className="ml-1 font-mono text-amber-300">chapter_inline_2</span>,
        <span className="ml-1 font-mono text-amber-300">chapter_inline_3</span>
        . Nếu chỉ có placement <span className="font-mono text-amber-300">chapter_inline</span>, Reader vẫn dùng được.
      </div>

      {message ? <p className="mt-3 text-sm text-emerald-300">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
    </section>
  )
}

export default function AdminAdsPage() {
  return (
    <MainLayout>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4">
          <Link to="/admin" className="text-sm text-amber-300">
            ← Quay lại Admin Dashboard
          </Link>
        </div>

        <ReaderInlineAdsSettings />
        <AdminAdsManager />
      </main>
    </MainLayout>
  )
}
