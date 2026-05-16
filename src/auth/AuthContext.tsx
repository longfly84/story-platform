import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import type { User } from '@supabase/supabase-js'
import {
  supabase,
  signInWithEmail,
  signOut,
  signUpWithEmail
} from '../lib/supabase'

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<{
    needsEmailConfirmation: boolean
  }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function login(email: string, password: string) {
    const { data, error } = await signInWithEmail(email, password)

    if (error) {
      throw new Error(error.message || 'Không đăng nhập được.')
    }

    setUser(data.user ?? null)
  }

  async function register(email: string, password: string) {
    const { data, error } = await signUpWithEmail(email, password)

    if (error) {
      throw new Error(error.message || 'Không đăng ký được.')
    }

    setUser(data.user ?? null)

    return {
      needsEmailConfirmation: !data.session
    }
  }

  async function logout() {
    await signOut()
    setUser(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      register,
      logout
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return ctx
}