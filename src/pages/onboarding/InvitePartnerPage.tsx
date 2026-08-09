import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MailPlus, CheckCircle2, ArrowRight } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCouple } from '@/contexts/CoupleContext'
import { useToast } from '@/contexts/ToastContext'
import { validateEmail } from '@/lib/validation'

export function InvitePartnerPage() {
  const { couple, memberCount, invitePartner, refresh } = useCouple()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)
  const [submitting, setSubmitting] = useState(false)
  const [lastInvite, setLastInvite] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const emailError = validateEmail(email)
    setError(emailError ?? undefined)
    if (emailError) return

    setSubmitting(true)
    const result = await invitePartner(email)
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }
    setLastInvite(email)
    toast.success('Invitación enviada a vuestra pareja.')
    await refresh()
  }

  return (
    <AuthLayout
      footer={
        <Link to="/dashboard" className="font-medium text-brand-700 dark:text-brand-400">
          O entrar a la aplicación por ahora
        </Link>
      }
    >
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold tracking-tight text-ink">
          Vuestra cuenta está lista
        </h1>
        <span className="text-xs font-semibold text-ink-3">{couple?.name}</span>
      </div>

      {memberCount >= 2 ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/50">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="font-display text-lg font-semibold text-ink">
            ¡Vuestra pareja ya está aquí!
          </h2>
          <p className="text-sm text-ink-2">
            Ambos comparten la misma cuenta. Podéis empezar a registrar vuestro dinero.
          </p>
          <Button className="mt-2" fullWidth onClick={() => navigate('/dashboard')}>
            Ir al inicio <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm leading-relaxed text-ink-2">
            Invitad a vuestra pareja por email. Cuando acepte la invitación, ambos veréis
            exactamente el mismo dinero en la misma cuenta.
          </p>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
            <Input
              label="Email de vuestra pareja"
              type="email"
              inputMode="email"
              placeholder="pareja@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
            />
            <Button type="submit" size="lg" fullWidth loading={submitting} leftIcon={<MailPlus className="h-4.5 w-4.5" />}>
              Enviar invitación
            </Button>
          </form>

          {lastInvite && (
            <p className="mt-4 rounded-xl bg-surface-2 px-3 py-2.5 text-center text-xs text-ink-2">
              Invitación pendiente para <span className="font-semibold text-ink">{lastInvite}</span>
            </p>
          )}

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mt-4 w-full text-center text-sm font-medium text-brand-700 dark:text-brand-400"
          >
            Empezar a usar la aplicación mientras esperáis
          </button>
        </>
      )}
    </AuthLayout>
  )
}
