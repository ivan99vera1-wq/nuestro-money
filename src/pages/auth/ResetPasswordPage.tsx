import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { validatePassword } from '@/lib/validation'

export function ResetPasswordPage() {
  const { user, updatePassword } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const passwordError = validatePassword(password)
    const confirmError = password !== confirm ? 'Las contraseñas no coinciden.' : undefined
    setFieldErrors({
      ...(passwordError ? { password: passwordError } : {}),
      ...(confirmError ? { confirm: confirmError } : {}),
    })
    if (passwordError || confirmError) return

    setSubmitting(true)
    setSubmitError(null)
    const result = await updatePassword(password)
    setSubmitting(false)

    if (result.error) {
      setSubmitError(result.error)
      return
    }
    setDone(true)
  }

  if (!user) {
    return (
      <AuthLayout
        footer={
          <Link to="/login" className="font-medium text-brand-700 dark:text-brand-400">
            Volver al inicio de sesión
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-expense-50 text-expense-500 dark:bg-expense-950/40">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="font-display text-xl font-semibold text-ink">Enlace no válido</h1>
          <p className="text-sm text-ink-2">
            Este enlace de recuperación no es válido o ha caducado. Solicita uno nuevo.
          </p>
        </div>
      </AuthLayout>
    )
  }

  if (done) {
    return (
      <AuthLayout
        footer={
          <Link to="/dashboard" className="font-medium text-brand-700 dark:text-brand-400">
            Ir a vuestro dinero
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/50">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="font-display text-xl font-semibold text-ink">Contraseña actualizada</h1>
          <p className="text-sm text-ink-2">Vuestra contraseña se ha cambiado correctamente.</p>
          <Button
            className="mt-2"
            fullWidth
            onClick={() => navigate('/dashboard', { replace: true })}
          >
            Continuar
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
        Nueva contraseña
      </h1>
      <p className="mt-1 text-sm text-ink-2">Elige una contraseña nueva y segura.</p>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <PasswordInput
          label="Nueva contraseña"
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />
        <PasswordInput
          label="Repite la contraseña"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={fieldErrors.confirm}
        />
        {submitError && (
          <p className="rounded-xl bg-expense-50 px-3 py-2 text-sm font-medium text-expense-700 dark:bg-expense-950/40 dark:text-expense-400">
            {submitError}
          </p>
        )}
        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Actualizar contraseña
        </Button>
      </form>
    </AuthLayout>
  )
}
