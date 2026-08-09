import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MailPlus, CheckCircle2, ArrowRight, Copy, Check, MessageCircle, Share2 } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCouple } from '@/contexts/CoupleContext'
import { useToast } from '@/contexts/ToastContext'
import { validateEmail } from '@/lib/validation'

function buildWhatsAppLink(inviteUrl: string): string {
  const text =
    `¡Hola! 👋 Te he invitado a NUESTRO MONEY, ` +
    `nuestra cuenta compartida de dinero en pareja. ` +
    `Únete desde este enlace:\n${inviteUrl}`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

export function InvitePartnerPage() {
  const { couple, memberCount, invitePartner, refresh } = useCouple()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)
  const [submitting, setSubmitting] = useState(false)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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
    if (result.inviteUrl) {
      setInviteUrl(result.inviteUrl)
    }
    toast.success('Invitación creada. Comparte el enlace con vuestra pareja.')
    await refresh()
  }

  const copyLink = async () => {
    if (!inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('No se pudo copiar el enlace.')
    }
  }

  const nativeShare = async () => {
    if (!inviteUrl || !navigator.share) return
    try {
      await navigator.share({
        title: 'NUESTRO MONEY',
        text: 'Vuestra cuenta compartida de dinero en pareja',
        url: inviteUrl,
      })
    } catch {
      /* el usuario canceló el compartir */
    }
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
            Cread la invitación con el email de vuestra pareja y compartid el enlace por
            WhatsApp, email o como prefiráis. Cuando acepte, ambos veréis exactamente el
            mismo dinero en la misma cuenta.
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
              Crear invitación
            </Button>
          </form>

          {inviteUrl && (
            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-surface-2 bg-surface-1 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-brand-600 dark:text-brand-400" />
                <p className="text-sm font-semibold text-ink">
                  Invitación lista — compártela con vuestra pareja
                </p>
              </div>
              <p className="text-xs leading-relaxed text-ink-2">
                Vuestra pareja debe abrir el enlace y crear su cuenta con el{' '}
                <span className="font-semibold text-ink">{email}</span>. Si ya la tiene,
                solo inicia sesión y entra en el enlace.
              </p>

              <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-xs text-ink-2">{inviteUrl}</span>
                <button
                  type="button"
                  onClick={copyLink}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-brand-600 transition hover:bg-surface-3 dark:text-brand-400"
                  aria-label="Copiar enlace"
                >
                  {copied ? <Check className="h-4 w-4 text-success-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  fullWidth
                  leftIcon={<MessageCircle className="h-4.5 w-4.5" />}
                  onClick={() => window.open(buildWhatsAppLink(inviteUrl), '_blank')}
                >
                  Enviar por WhatsApp
                </Button>
                {'share' in navigator && (
                  <Button type="button" variant="secondary" fullWidth leftIcon={<Share2 className="h-4.5 w-4.5" />} onClick={nativeShare}>
                    Compartir…
                  </Button>
                )}
                <Button type="button" variant="ghost" fullWidth leftIcon={<Copy className="h-4.5 w-4.5" />} onClick={copyLink}>
                  {copied ? 'Enlace copiado' : 'Copiar enlace'}
                </Button>
              </div>
            </div>
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
