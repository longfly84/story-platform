import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import { signUpWithEmail } from '@/lib/supabase'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu nhập lại không khớp.')
      return
    }

    setLoading(true)

    try {
      const res = await signUpWithEmail(email.trim(), password)

      if (res.error) {
        throw res.error
      }

      if (!res.data.session) {
        setSuccessMsg('Đăng ký thành công. Hãy kiểm tra email để xác nhận tài khoản.')
        return
      }

      navigate('/', { replace: true })
    } catch (err: any) {
      setErrorMsg(String(err?.message ?? 'Không đăng ký được.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <main className="mx-auto max-w-md px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold text-zinc-100">Đăng ký</h1>

        <p className="mb-6 text-sm text-zinc-400">
          Tạo tài khoản để lưu lịch sử đọc và theo dõi truyện yêu thích.
        </p>

        <form onSubmit={handleSubmit} className="grid gap-3">
          <input
            className="rounded bg-zinc-900/40 p-3 text-zinc-100 outline-none ring-1 ring-zinc-800 focus:ring-amber-300"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            required
          />

          <input
            className="rounded bg-zinc-900/40 p-3 text-zinc-100 outline-none ring-1 ring-zinc-800 focus:ring-amber-300"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            autoComplete="new-password"
            minLength={6}
            required
          />

          <input
            className="rounded bg-zinc-900/40 p-3 text-zinc-100 outline-none ring-1 ring-zinc-800 focus:ring-amber-300"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu"
            autoComplete="new-password"
            minLength={6}
            required
          />

          {errorMsg ? (
            <div className="rounded bg-red-500/10 p-3 text-sm text-red-300 ring-1 ring-red-500/30">
              {errorMsg}
            </div>
          ) : null}

          {successMsg ? (
            <div className="rounded bg-emerald-500/10 p-3 text-sm text-emerald-300 ring-1 ring-emerald-500/30">
              {successMsg}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded bg-amber-300 px-4 py-3 font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <p className="mt-5 text-sm text-zinc-400">
          Đã có tài khoản?{' '}
          <Link className="font-semibold text-amber-300" to="/login">
            Đăng nhập
          </Link>
        </p>
      </main>
    </MainLayout>
  )
}