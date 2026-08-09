import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input, PasswordInput } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { validateEmail, validatePassword } from '@/lib/validation'

interface LocationState {
  from?: string
}

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const from = (location.state as LocationState | null)?.from
  const inviteToken = searchParams.get('invite')
  const invitePath = inviteToken ? `/invite/${inviteToken}` : null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    setFieldErrors({
      ...(emailError ? { email: emailError } : {}),
      ...(passwordError ? { password: passwordError } : {}),
    })
    if (emailError || passwordError) return

    setSubmitting(true)
    setSubmitError(null)
    const result = await signIn(email, password)
    setSubmitting(false)

    if (result.error) {
      setSubmitError(result.error)
      return
    }
    navigate(invitePath ?? from ?? '/dashboard', { replace: true })
  }

  return (
    <AuthLayout
      footer={
        <>
          ¿Todavía no tenéis cuenta?{' '}
          <Link
            to={invitePath ? `/register?invite=${inviteToken}` : '/register'}
            className="font-medium text-brand-700 dark:text-brand-400"
          >
            Crear cuenta
          </Link>
        </>
      }
    >
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Hola de nuevo</h1>
      <p className="mt-1 text-sm text-ink-2">Inicia sesión para ver vuestro dinero.</p>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <Input
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="vosotros@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />
        <PasswordInput
          label="Contraseña"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs font-medium text-brand-700 dark:text-brand-400"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {submitError && (
          <p className="rounded-xl bg-expense-50 px-3 py-2 text-sm font-medium text-expense-700 dark:bg-expense-950/40 dark:text-expense-400">
            {submitError}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth loading={submitting} rightIcon={<ArrowRight className="h-4 w-4" />}>
          Iniciar sesión
        </Button>
      </form>
    </AuthLayout>
  )
}
