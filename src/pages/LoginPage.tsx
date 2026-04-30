import { useState } from 'react'
import MainLayout from '@/layouts/MainLayout'
import { signInWithEmail } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await signInWithEmail(email, password)
      if (res.error) throw res.error
      // redirect to admin
      navigate('/admin')
    } catch (err: any) {
      alert('Login failed: ' + String(err?.message ?? err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <main className="mx-auto max-w-md px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-100 mb-4">Admin Login</h1>
        <form onSubmit={handleSubmit} className="grid gap-2">
          <input className="rounded bg-zinc-900/20 p-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input type="password" className="rounded bg-zinc-900/20 p-2" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          <button className="rounded bg-amber-300 px-4 py-2">{loading ? 'Đang...' : 'Login'}</button>
        </form>
      </main>
    </MainLayout>
  )
}
