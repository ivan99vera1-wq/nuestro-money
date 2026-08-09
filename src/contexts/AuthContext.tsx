import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase/client'
import * as authService from '@/services/api/auth'
import type { Profile } from '@/types/domain'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  /** true only while the initial session is being resolved. */
  loading: boolean
  signUp: (p: authService.SignUpParams) => Promise<authService.AuthResult>
  signIn: (email: string, password: string) => Promise<authService.AuthResult>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<authService.AuthResult>
  updatePassword: (password: string) => Promise<authService.AuthResult>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const p = await authService.getProfile(userId)
      setProfile(p)
    } catch {
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setUser(data.session?.user ?? null)
      if (data.session?.user) {
        void loadProfile(data.session.user.id)
      }
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setUser(session?.user ?? null)
      if (session?.user) {
        void loadProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [loadProfile])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      signUp: authService.signUp,
      signIn: authService.signIn,
      signOut: authService.signOut,
      resetPassword: authService.resetPassword,
      updatePassword: authService.updatePassword,
      refreshProfile: () => (user ? loadProfile(user.id) : Promise.resolve()),
    }),
    [user, profile, loading, loadProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
