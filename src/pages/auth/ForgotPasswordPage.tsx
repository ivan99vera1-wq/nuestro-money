import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { MailCheck, ArrowLeft } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { validateEmail } from '@/lib/validation'

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState<string | undefined>(undefined)
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const emailError = validateEmail(email)
    setFieldError(emailError ?? undefined)
    if (emailError) return

    setSubmitting(true)
    const result = await resetPassword(email)
    setSubmitting(false)
    if (result.error) {
      setFieldError(result.error)
      return
    }
    setSent(true)
  }

  return (
    <AuthLayout
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-1 font-medium text-ink-2 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a iniciar sesión
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/50">
            <MailCheck className="h-7 w-7" />
          </div>
          <h1 className="font-display text-xl font-semibold text-ink">Revisa tu email</h1>
          <p className="text-sm text-ink-2">
            Si existe una cuenta para <span className="font-medium text-ink">{email}</span>,
            te hemos enviado un enlace para restablecer la contraseña.
          </p>
        </div>
      ) : (
        <>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
            Recuperar contraseña
          </h1>
          <p className="mt-1 text-sm text-ink-2">
            Te enviaremos un enlace seguro para crear una nueva contraseña.
          </p>
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
            <Input
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="vosotros@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldError}
            />
            <Button type="submit" size="lg" fullWidth loading={submitting}>
              Enviar enlace
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  )
}
