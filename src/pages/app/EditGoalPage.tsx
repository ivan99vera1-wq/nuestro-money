import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GoalForm } from '@/features/goals/GoalForm'
import { InlineLoader } from '@/components/ui/loading'
import { useGoals } from '@/hooks/useGoals'
import { useCouple } from '@/contexts/CoupleContext'
import { useToast } from '@/contexts/ToastContext'
import * as goalsService from '@/services/api/goals'

export function EditGoalPage() {
  const { goalId } = useParams<{ goalId: string }>()
  const navigate = useNavigate()
  const { couple } = useCouple()
  const { toast } = useToast()
  const { goals, loading } = useGoals()
  const [error, setError] = useState<string | null>(null)
  const goal = goals.find((g) => g.id === goalId)

  if (loading) return <InlineLoader />
  if (!goal || !couple) {
    return (
      <div className="py-16 text-center text-sm text-ink-3">
        Este objetivo no existe o fue eliminado.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 font-display text-2xl font-semibold tracking-tight text-ink">
        Editar objetivo
      </h1>
      {error && (
        <p className="mb-4 rounded-xl bg-expense-50 px-3 py-2 text-sm font-medium text-expense-700 dark:bg-expense-950/40 dark:text-expense-400">
          {error}
        </p>
      )}
      <GoalForm
        initialName={goal.name}
        initialTarget={(goal.target_amount / 100).toFixed(2).replace('.', ',')}
        initialCurrent={(goal.current_amount / 100).toFixed(2).replace('.', ',')}
        initialDate={goal.target_date ?? ''}
        initialIcon={goal.icon ?? '💰'}
        initialColor={goal.color ?? 'violet'}
        submitLabel="Guardar cambios"
        onSubmit={async (input) => {
          setError(null)
          const result = await goalsService.updateGoal(couple.id, goal.id, {
            name: input.name,
            target_amount: input.targetAmount,
            current_amount: input.currentAmount,
            ...(input.targetDate ? { target_date: input.targetDate } : {}),
            icon: input.icon,
            color: input.color,
          })
          return result
        }}
        onSuccess={() => {
          toast.success('Objetivo actualizado.')
          navigate('/goals')
        }}
      />
    </div>
  )
}
