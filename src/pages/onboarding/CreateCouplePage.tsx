import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, HeartHandshake } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCouple } from '@/contexts/CoupleContext'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/ui/avatar'

export function CreateCouplePage() {
  const { createCouple } = useCouple()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('Nuestro Money')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Escribe un nombre para vuestra cuenta.')
      return
    }
    setSubmitting(true)
    setError(null)
    const result = await createCouple(name)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    navigate('/invite-partner', { replace: true })
  }

  return (
    <AuthLayout>
      <div className="mb-6 flex items-center gap-3">
        <Avatar name={profile?.full_name} size="md" />
        <div>
          <p className="text-sm text-ink-2">Hola,</p>
          <p className="font-display text-lg font-semibold text-ink">
            {profile?.full_name || 'bienvenido'}
          </p>
        </div>
      </div>

      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
        Cread vuestra cuenta compartida
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
        Vuestro dinero será <span className="font-medium text-ink">uno solo</span>. No existen
        saldos ni aportes individuales: todo pertenece al fondo común de la pareja.
      </p>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <Input
          label="Nombre de la cuenta"
          placeholder="Ej. Nuestro Money"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error ?? undefined}
          hint="Podéis cambiarlo más adelante."
        />
        <Button type="submit" size="lg" fullWidth loading={submitting} rightIcon={<ArrowRight className="h-4 w-4" />}>
          Crear cuenta compartida
        </Button>
      </form>

      <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-brand-50 p-4 text-sm text-brand-800 dark:bg-brand-950/40 dark:text-brand-200">
        <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
        <p>
          Después podréis <span className="font-semibold">invitar a vuestra pareja</span> por
          email. Una vez acepte, ambos veréis exactamente el mismo dinero.
        </p>
      </div>
    </AuthLayout>
  )
}
