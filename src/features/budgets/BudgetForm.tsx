import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { useCouple } from '@/contexts/CoupleContext'
import { ALL_CATEGORIES } from '@/config/constants'
import { parseAmountToCents } from '@/lib/money'
import { validateAmount, validateRequired } from '@/lib/validation'
import type { BudgetRow } from '@/types/database'

export interface BudgetFormValues {
  category: string
  limitAmount: number
}

interface BudgetFormProps {
  open: boolean
  budget: BudgetRow | null
  onSubmit: (values: BudgetFormValues) => Promise<{ error: string | null }>
  onClose: () => void
  onSuccess: () => void
}

export function BudgetForm({ open, budget, onSubmit, onClose, onSuccess }: BudgetFormProps) {
  const { couple } = useCouple()
  const currency = couple?.currency ?? 'EUR'

  const [category, setCategory] = useState(budget?.category ?? '')
  const [amount, setAmount] = useState(budget ? (budget.limit_amount / 100).toFixed(2).replace('.', ',') : '')
  const [errors, setErrors] = useState<{ category?: string; amount?: string }>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const options = [
    ...ALL_CATEGORIES.map((c) => ({ value: c.key, label: c.label })),
    { value: 'other', label: 'Otros' },
  ]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const categoryError = validateRequired(category, 'La categoría')
    const cents = parseAmountToCents(amount, currency)
    const amountError = validateAmount(cents)
    setErrors({
      ...(categoryError ? { category: categoryError } : {}),
      ...(amountError ? { amount: amountError } : {}),
    })
    if (categoryError || amountError) return

    setSubmitting(true)
    setSubmitError(null)
    const result = await onSubmit({ category, limitAmount: cents })
    setSubmitting(false)
    if (result.error) {
      setSubmitError(result.error)
      return
    }
    onSuccess()
  }

  return (
    <Modal open={open} onClose={onClose} title={budget ? 'Editar presupuesto' : 'Nuevo presupuesto'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Select
          label="Categoría"
          options={options}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          error={errors.category}
          disabled={Boolean(budget)}
        />
        <Input
          label={`Límite (${currency})`}
          inputMode="decimal"
          placeholder="0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
        />

        {submitError && (
          <p className="rounded-xl bg-expense-50 px-3 py-2 text-sm font-medium text-expense-700 dark:bg-expense-950/40 dark:text-expense-400">
            {submitError}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          {budget ? 'Guardar cambios' : 'Crear presupuesto'}
        </Button>
      </form>
    </Modal>
  )
}
