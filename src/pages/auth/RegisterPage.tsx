import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input, PasswordInput } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { validateEmail, validatePassword, validateRequired } from '@/lib/validation'

export function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string
    email?: string
    password?: string
  }>({})
  const [notice, setNotice] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const fullNameError = validateRequired(fullName, 'Tu nombre')
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    setFieldErrors({
      ...(fullNameError ? { fullName: fullNameError } : {}),
      ...(emailError ? { email: emailError } : {}),
      ...(passwordError ? { password: passwordError } : {}),
    })
    if (fullNameError || emailError || passwordError) return

    setSubmitting(true)
    setSubmitError(null)
    setNotice(null)
    const result = await signUp({ email, password, fullName })
    setSubmitting(false)

    if (result.error) {
      setSubmitError(result.error)
      return
    }
    if (result.needsConfirmation) {
      setNotice('Te hemos enviado un email de confirmación. Revisa tu bandeja de entrada.')
      return
    }
    navigate('/create-couple', { replace: true })
  }

  return (
    <AuthLayout
      footer={
        <>
          ¿Ya tenéis cuenta?{' '}
          <Link to="/login" className="font-medium text-brand-700 dark:text-brand-400">
            Iniciar sesión
          </Link>
        </>
      }
    >
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
        Cread vuestra cuenta
      </h1>
      <p className="mt-1 text-sm text-ink-2">Un espacio privado para vuestro dinero en común.</p>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <Input
          label="Vuestro nombre"
          placeholder="Ej. Iván"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={fieldErrors.fullName}
        />
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
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />

        {notice && (
          <p className="rounded-xl bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
            {notice}
          </p>
        )}
        {submitError && (
          <p className="rounded-xl bg-expense-50 px-3 py-2 text-sm font-medium text-expense-700 dark:bg-expense-950/40 dark:text-expense-400">
            {submitError}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth loading={submitting} rightIcon={<ArrowRight className="h-4 w-4" />}>
          Crear cuenta
        </Button>
        <p className="text-center text-xs text-ink-3">
          Al crear la cuenta aceptas que vuestros datos financieros se guardan de forma
          privada y segura.
        </p>
      </form>
    </AuthLayout>
  )
}
