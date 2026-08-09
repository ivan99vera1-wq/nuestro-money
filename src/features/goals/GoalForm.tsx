import { useState, type FormEvent } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCouple } from '@/contexts/CoupleContext'
import { parseAmountToCents } from '@/lib/money'
import { validateAmount, validateRequired } from '@/lib/validation'
import { cn } from '@/utils/cn'
import { todayISO } from '@/lib/calendar'

export const GOAL_ICONS = ['🏠', '✈️', '🚗', '💍', '💰', '🎓', '❤️', '🌍']
export const GOAL_COLORS = ['violet', 'brand', 'sky', 'amber', 'rose', 'teal']

const COLOR_CLASSES: Record<string, string> = {
  violet: 'bg-violet-500',
  brand: 'bg-brand-500',
  sky: 'bg-sky-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  teal: 'bg-teal-500',
}

interface GoalFormProps {
  initialName?: string
  initialTarget?: string
  initialCurrent?: string
  initialDate?: string
  initialIcon?: string
  initialColor?: string
  submitLabel: string
  onSubmit: (input: {
    name: string
    targetAmount: number
    currentAmount: number
    targetDate?: string
    icon: string
    color: string
  }) => Promise<{ error: string | null }>
  onSuccess: () => void
}

export function GoalForm({
  initialName = '',
  initialTarget = '',
  initialCurrent = '0',
  initialDate = '',
  initialIcon = '💰',
  initialColor = 'violet',
  submitLabel,
  onSubmit,
  onSuccess,
}: GoalFormProps) {
  const { couple } = useCouple()
  const currency = couple?.currency ?? 'EUR'

  const [name, setName] = useState(initialName)
  const [target, setTarget] = useState(initialTarget)
  const [current, setCurrent] = useState(initialCurrent)
  const [date, setDate] = useState(initialDate)
  const [icon, setIcon] = useState(initialIcon)
  const [color, setColor] = useState(initialColor)
  const [errors, setErrors] = useState<{ name?: string; target?: string; current?: string }>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const targetCents = parseAmountToCents(target, currency)
  const currentCents = parseAmountToCents(current, currency)

  const onSubmitForm = async (e: FormEvent) => {
    e.preventDefault()
    const nameError = validateRequired(name, 'El nombre')
    const targetError = validateAmount(targetCents)
    let currentError = validateAmount(currentCents)
    if (currentError === null && currentCents > targetCents) {
      currentError = 'La cantidad actual no puede superar el objetivo.'
    }
    setErrors({
      ...(nameError ? { name: nameError } : {}),
      ...(targetError ? { target: targetError } : {}),
      ...(currentError ? { current: currentError } : {}),
    })
    if (nameError || targetError || currentError) return

    setSubmitting(true)
    setSubmitError(null)
    const result = await onSubmit({
      name,
      targetAmount: targetCents,
      currentAmount: currentCents,
      ...(date ? { targetDate: date } : {}),
      icon,
      color,
    })
    setSubmitting(false)
    if (result.error) {
      setSubmitError(result.error)
      return
    }
    onSuccess()
  }

  return (
    <form onSubmit={onSubmitForm} className="flex flex-col gap-5" noValidate>
      <button
        type="button"
        onClick={() => (window.history.length > 1 ? window.history.back() : undefined)}
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-ink-2 transition-colors hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" /> Atrás
      </button>

      {/* Icon + color picker */}
      <div className="flex flex-col gap-3">
        <p className="px-1 text-xs font-medium uppercase tracking-wide text-ink-2">Icono</p>
        <div className="grid grid-cols-8 gap-2">
          {GOAL_ICONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={cn(
                'grid h-11 place-items-center rounded-xl border text-xl transition-all',
                icon === i
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40'
                  : 'border-line bg-surface-2/50 hover:border-brand-300',
              )}
              aria-pressed={icon === i}
            >
              {i}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {GOAL_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                'h-8 w-8 rounded-full transition-transform',
                COLOR_CLASSES[c],
                color === c ? 'scale-110 ring-2 ring-offset-2 ring-brand-500' : 'opacity-70',
              )}
              aria-label={`Color ${c}`}
              aria-pressed={color === c}
            />
          ))}
        </div>
      </div>

      <Input
        label="Nombre del objetivo"
        placeholder="Ej. Viaje a Colombia"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={`Cantidad objetivo (${currency})`}
          inputMode="decimal"
          placeholder="0,00"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          error={errors.target}
        />
        <Input
          label={`Reservado (${currency})`}
          inputMode="decimal"
          placeholder="0,00"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          error={errors.current}
          hint="Reserva mental: no mueve el saldo."
        />
      </div>
      <Input
        label="Fecha objetivo (opcional)"
        type="date"
        value={date}
        min={todayISO()}
        onChange={(e) => setDate(e.target.value)}
      />

      <p className="rounded-xl bg-surface-2 px-3 py-2.5 text-xs leading-relaxed text-ink-2">
        Los objetivos son apartados virtuales: reserváis mentalmente parte de{' '}
        <span className="font-medium text-ink">vuestro dinero</span> sin moverlo del saldo total.
      </p>

      {submitError && (
        <p className="rounded-xl bg-expense-50 px-3 py-2 text-sm font-medium text-expense-700 dark:bg-expense-950/40 dark:text-expense-400">
          {submitError}
        </p>
      )}

      <Button type="submit" size="lg" fullWidth loading={submitting}>
        {submitLabel}
      </Button>
    </form>
  )
}
