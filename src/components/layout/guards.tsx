import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCouple } from '@/contexts/CoupleContext'
import { LoadingScreen } from '@/components/ui/loading'

/** Requires a logged-in session. Redirects to /login keeping the target. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <LoadingScreen label="Cargando…" />
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}

/** For public screens (login, register…): logged users go to the app. */
export function RequireGuest({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const { couple, loading: coupleLoading } = useCouple()
  if (loading || coupleLoading) return <LoadingScreen label="Cargando…" />
  if (user) {
    return <Navigate to={couple ? '/dashboard' : '/create-couple'} replace />
  }
  return <>{children}</>
}

/** Requires a session AND belonging to a couple (the app shell). */
export function RequireCouple({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const { couple, loading: coupleLoading } = useCouple()
  if (loading || coupleLoading) return <LoadingScreen label="Cargando vuestra cuenta…" />
  if (!user) return <Navigate to="/login" replace />
  if (!couple) return <Navigate to="/create-couple" replace />
  return <>{children}</>
}

/** Onboarding screens: requires a session WITHOUT a couple yet. */
export function RequireNoCouple({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const { couple, loading: coupleLoading } = useCouple()
  if (loading || coupleLoading) return <LoadingScreen label="Cargando…" />
  if (!user) return <Navigate to="/login" replace />
  if (couple) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
