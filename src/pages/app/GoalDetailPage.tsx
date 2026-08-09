import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GoalCard } from '@/components/cards/goal-card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { InlineLoader } from '@/components/ui/loading'
import { Input } from '@/components/ui/input'
import { useGoals } from '@/hooks/useGoals'
import { useCouple } from '@/contexts/CoupleContext'
import { useToast } from '@/contexts/ToastContext'
import * as goalsService from '@/services/api/goals'
import { parseAmountToCents } from '@/lib/money'
import { validateAmount } from '@/lib/validation'
import { formatMoney, formatPercent } from '@/lib/format'

export function GoalDetailPage() {
  const { goalId } = useParams<{ goalId: string }>()
  const navigate = useNavigate()
  const { couple } = useCouple()
  const { toast } = useToast()
  const { goals, loading, refresh } = useGoals()
  const goal = goals.find((g) => g.id === goalId)

  const [reserved, setReserved] = useState('')
  const [reserveError, setReserveError] = useState<string | undefined>(undefined)
  const [savingReserve, setSavingReserve] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (loading) return <InlineLoader />
  if (!goal || !couple) {
    return (
      <div className="py-16 text-center text-sm text-ink-3">
        Este objetivo no existe o fue eliminado.
      </div>
    )
  }

  const currency = couple.currency
  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0

  const saveReserve = async () => {
    const cents = parseAmountToCents(reserved, currency)
    const err = validateAmount(cents)
    if (err) {
      setReserveError(err)
      return
    }
    if (cents > goal.target_amount) {
      setReserveError('La reserva no puede superar el objetivo.')
      return
    }
    setReserveError(undefined)
    setSavingReserve(true)
    const result = await goalsService.updateGoal(couple.id, goal.id, { current_amount: cents })
    setSavingReserve(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    setReserved('')
    await refresh()
  }

  const onDelete = async () => {
    if (!couple) return
    setDeleting(true)
    const result = await goalsService.deleteGoal(couple.id, goal.id)
    setDeleting(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Objetivo eliminado.')
    navigate('/goals', { replace: true })
  }

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-ink-2 transition-colors hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" /> Atrás
      </button>

      <GoalCard goal={goal} />

      {/* Reserve update */}
      <Card padded>
        <p className="font-display text-base font-semibold text-ink">Actualizar reserva</p>
        <p className="mt-0.5 text-sm text-ink-2">
          Añadís o quitáis una cantidad mental del objetivo. {formatMoney(goal.current_amount, currency)} reservados de{' '}
          {formatMoney(goal.target_amount, currency)} ({formatPercent(progress)}).
        </p>
        <div className="mt-4 flex gap-2">
          <div className="flex-1">
            <Input
              inputMode="decimal"
              placeholder="0,00"
              value={reserved}
              onChange={(e) => setReserved(e.target.value)}
              error={reserveError}
            />
          </div>
          <Button onClick={() => void saveReserve()} loading={savingReserve} className="h-11">
            Actualizar
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="secondary"
          fullWidth
          onClick={() => navigate(`/goals/${goal.id}/edit`)}
          leftIcon={<Pencil className="h-4 w-4" />}
        >
          Editar
        </Button>
        <Button variant="danger" fullWidth onClick={() => setConfirmDelete(true)} leftIcon={<Trash2 className="h-4 w-4" />}>
          Eliminar
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="¿Quieres eliminar este objetivo?"
        message="Se borrará de vuestro plan de ahorro. La reserva no afecta al saldo real."
        confirmLabel="Sí, eliminar"
        danger
        loading={deleting}
        onConfirm={() => void onDelete()}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
