import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, HeartHandshake, LogOut } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/button'
import { LoadingScreen } from '@/components/ui/loading'
import { useAuth } from '@/contexts/AuthContext'
import { useCouple } from '@/contexts/CoupleContext'

type State = 'loading' | 'success' | 'error'
type ErrorKind = 'mismatch' | 'in-couple' | 'other'

export function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>()
  const { user, loading: authLoading, signOut } = useAuth()
  const { acceptInvite } = useCouple()
  const navigate = useNavigate()

  const [state, setState] = useState<State>('loading')
  const [message, setMessage] = useState<string | null>(null)
  const [kind, setKind] = useState<ErrorKind>('other')
  const attempted = useRef(false)

  useEffect(() => {
    if (!token || attempted.current || authLoading || !user) return
    attempted.current = true
    void (async () => {
      const result = await acceptInvite(token)
      if (result.error) {
        const lower = result.error.toLowerCase()
        setMessage(result.error)
        if (lower.includes('otro email')) setKind('mismatch')
        else if (lower.includes('compartida')) setKind('in-couple')
        else setKind('other')
        setState('error')
      } else {
        setState('success')
        window.setTimeout(() => navigate('/dashboard', { replace: true }), 1500)
      }
    })()
  }, [token, acceptInvite, navigate, user, authLoading])

  if (authLoading) {
    return <LoadingScreen label="Cargando…" />
  }

  if (!user) {
    return <Navigate to={`/register?invite=${token}`} replace />
  }

  if (state === 'loading') {
    return <LoadingScreen label="Aceptando invitación…" />
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

          {kind === 'mismatch' ? (
            <>
              <p className="text-sm leading-relaxed text-ink-2">
                Esta invitación está dirigida a otra cuenta de email y has iniciado sesión con
                otra. Para aceptarla, cierra sesión y vuelve a abrir el enlace con la cuenta
                invitada.
              </p>
              <Button className="mt-2" fullWidth leftIcon={<LogOut className="h-4.5 w-4.5" />} onClick={() => void signOut()}>
                Cerrar sesión
              </Button>
            </>
          ) : kind === 'in-couple' ? (
            <>
              <p className="text-sm leading-relaxed text-ink-2">
                Ya perteneces a una cuenta compartida, así que esta invitación no se puede
                aceptar desde esta cuenta.
              </p>
              <Button className="mt-2" fullWidth onClick={() => navigate('/dashboard')}>
                Ir a vuestra cuenta
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-ink-2">{message ?? 'La invitación no es válida.'}</p>
              <Button className="mt-2" fullWidth onClick={() => navigate('/dashboard')}>
                Ir a vuestra cuenta
              </Button>
            </>
          )}
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
