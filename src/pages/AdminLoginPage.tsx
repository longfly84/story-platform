import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import { signInWithEmail } from '@/lib/supabase'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await signInWithEmail(email.trim(), password)

      if (res.error) {
        throw res.error
      }

      navigate('/admin', { replace: true })
    } catch (err: any) {
      alert('Login failed: ' + String(err?.message ?? err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <main className="mx-auto max-w-md px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold text-zinc-100">Admin Login</h1>

        <form onSubmit={handleSubmit} className="grid gap-2">
          <input
            className="rounded bg-zinc-900/20 p-2 text-zinc-100"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            required
          />

          <input
            type="password"
            className="rounded bg-zinc-900/20 p-2 text-zinc-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded bg-amber-300 px-4 py-2 font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Đang...' : 'Login'}
          </button>
        </form>
      </main>
    </MainLayout>
  )
}