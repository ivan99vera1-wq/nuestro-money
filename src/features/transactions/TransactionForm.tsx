import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, TextArea } from '@/components/ui/input'
import { CategoryPicker } from '@/features/transactions/CategoryPicker'
import { useCouple } from '@/contexts/CoupleContext'
import { useBalance } from '@/contexts/BalanceContext'
import { useToast } from '@/contexts/ToastContext'
import { parseAmountToCents } from '@/lib/money'
import { todayISO } from '@/lib/calendar'
import { formatMoney } from '@/lib/format'
import { validateAmount } from '@/lib/validation'
import { cn } from '@/utils/cn'
import type { TransactionType } from '@/config/constants'

interface TransactionFormProps {
  mode: TransactionType
  initialAmount?: string
  initialCategory?: string
  initialDate?: string
  initialDescription?: string
  initialNote?: string
  submitLabel: string
  onSubmit: (input: {
    amount: number
    category: string
    description: string
    date: string
    note?: string
  }) => Promise<{ error: string | null }>
  onSuccess: () => void
}

export function TransactionForm({
  mode,
  initialAmount = '',
  initialCategory = '',
  initialDate = todayISO(),
  initialDescription = '',
  initialNote = '',
  submitLabel,
  onSubmit,
  onSuccess,
}: TransactionFormProps) {
  const navigate = useNavigate()
  const { couple } = useCouple()
  const { balance } = useBalance()
  const { toast } = useToast()

  const currency = couple?.currency ?? 'EUR'
  const isIncome = mode === 'income'

  const [amount, setAmount] = useState(initialAmount)
  const [category, setCategory] = useState(
    initialCategory || (isIncome ? 'other' : 'food'),
  )
  const [date, setDate] = useState(initialDate)
  const [description, setDescription] = useState(initialDescription)
  const [note, setNote] = useState(initialNote)
  const [fieldErrors, setFieldErrors] = useState<{ amount?: string }>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const parsed = parseAmountToCents(amount, currency)
  const previewValid = !Number.isNaN(parsed) && parsed > 0
  const canAfford = isIncome || parsed <= balance

  const onSubmitForm = async (e: FormEvent) => {
    e.preventDefault()
    const amountError = validateAmount(parsed)
    setFieldErrors(amountError ? { amount: amountError } : {})
    if (amountError) return

    if (!canAfford) {
      setSubmitError('No tienes suficiente dinero disponible para registrar este gasto.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    const result = await onSubmit({
      amount: parsed,
      category,
      description,
      date,
      ...(note ? { note } : {}),
    })
    setSubmitting(false)

    if (result.error) {
      setSubmitError(result.error)
      return
    }
    toast.success(isIncome ? 'Ingreso registrado correctamente.' : 'Gasto registrado correctamente.')
    onSuccess()
  }

  return (
    <form onSubmit={onSubmitForm} className="flex flex-col gap-5" noValidate>
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-ink-2 transition-colors hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" /> Atrás
      </button>

      {/* Amount */}
      <div className="flex flex-col items-center gap-2 py-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-ink-3">{currency === 'EUR' ? '€' : currency}</span>
          <input
            type="text"
            inputMode="decimal"
            autoFocus
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-label="Cantidad"
            className={cn(
              'w-48 border-b-2 bg-transparent text-center font-display text-5xl font-semibold tracking-tight tabular-nums text-ink outline-none transition-colors placeholder:text-ink-3/50',
              fieldErrors.amount
                ? 'border-expense-400'
                : isIncome
                  ? 'border-income-500/40 focus:border-income-500'
                  : 'border-expense-400/40 focus:border-expense-400',
            )}
          />
        </div>
        {previewValid && (
          <p
            className={cn(
              'text-sm font-medium tabular-nums',
              isIncome ? 'text-income-600' : 'text-expense-600',
            )}
          >
            {formatMoney(isIncome ? parsed : -parsed, currency)}
          </p>
        )}
        {fieldErrors.amount && <p className="text-xs font-medium text-expense-600">{fieldErrors.amount}</p>}
        {!isIncome && parsed > 0 && !canAfford && (
          <p className="rounded-full bg-expense-50 px-3 py-1 text-xs font-medium text-expense-700 dark:bg-expense-950/40 dark:text-expense-400">
            No tienes suficiente dinero disponible para registrar este gasto.
          </p>
        )}
      </div>

      {/* Category */}
      <div className="flex flex-col gap-2">
        <p className="px-1 text-xs font-medium uppercase tracking-wide text-ink-2">Categoría</p>
        <CategoryPicker type={mode} value={category} onChange={setCategory} />
      </div>

      {/* Details */}
      <div className="grid gap-4">
        <Input
          label="Fecha"
          type="date"
          value={date}
          max={todayISO()}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          label="Descripción"
          placeholder={isIncome ? 'Ej. Nómina de agosto' : 'Ej. Cena en el restaurante'}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <span className="px-1 text-xs font-medium uppercase tracking-wide text-ink-2">
            Nota (opcional)
          </span>
          <TextArea
            placeholder="Cualquier detalle que queráis recordar"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>

      {submitError && (
        <p className="rounded-xl bg-expense-50 px-3 py-2 text-sm font-medium text-expense-700 dark:bg-expense-950/40 dark:text-expense-400">
          {submitError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={submitting}
        variant={isIncome ? 'primary' : 'danger'}
        leftIcon={isIncome ? <ArrowDownLeft className="h-4.5 w-4.5" /> : <ArrowUpRight className="h-4.5 w-4.5" />}
      >
        {submitLabel}
      </Button>
    </form>
  )
}
