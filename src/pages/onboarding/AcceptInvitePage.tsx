import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, HeartHandshake } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/button'
import { LoadingScreen } from '@/components/ui/loading'
import { useAuth } from '@/contexts/AuthContext'
import { useCouple } from '@/contexts/CoupleContext'

type State = 'loading' | 'success' | 'error'

export function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>()
  const { user, loading: authLoading } = useAuth()
  const { acceptInvite } = useCouple()
  const navigate = useNavigate()

  const [state, setState] = useState<State>('loading')
  const [message, setMessage] = useState<string | null>(null)
  const attempted = useRef(false)

  useEffect(() => {
    if (!token || attempted.current || authLoading || !user) return
    attempted.current = true
    void (async () => {
      const result = await acceptInvite(token)
      if (result.error) {
        setMessage(result.error)
        setState('error')
      } else {
        setState('success')
        window.setTimeout(() => navigate('/dashboard', { replace: true }), 1500)
      }
    })()
  }, [token, acceptInvite, navigate, user, authLoading])

  if (authLoading || state === 'loading') {
    return <LoadingScreen label="Aceptando invitación…" />
  }

  if (!user) {
    return <Navigate to={`/register?invite=${token}`} replace />
  }

  if (state === 'error') {
    return (
      <AuthLayout
        footer={
          <Link to="/login" className="font-medium text-brand-700 dark:text-brand-400">
            Ir al inicio de sesión
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-expense-50 text-expense-500 dark:bg-expense-950/40">
            <HeartHandshake className="h-7 w-7" />
          </div>
          <h1 className="font-display text-xl font-semibold text-ink">No se pudo unir</h1>
          <p className="text-sm text-ink-2">{message ?? 'La invitación no es válida.'}</p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/50">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="font-display text-xl font-semibold text-ink">¡Bienvenido al fondo común!</h1>
        <p className="text-sm text-ink-2">
          Ya compartís la misma cuenta con vuestra pareja.
        </p>
        <Button className="mt-2" fullWidth onClick={() => navigate('/dashboard')}>
          Ver vuestro dinero
        </Button>
      </div>
    </AuthLayout>
  )
}
