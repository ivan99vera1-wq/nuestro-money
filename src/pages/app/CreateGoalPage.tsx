import { useNavigate } from 'react-router-dom'
import { GoalForm } from '@/features/goals/GoalForm'
import { useCouple } from '@/contexts/CoupleContext'
import { useToast } from '@/contexts/ToastContext'
import * as goalsService from '@/services/api/goals'

export function CreateGoalPage() {
  const navigate = useNavigate()
  const { couple } = useCouple()
  const { toast } = useToast()

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 font-display text-2xl font-semibold tracking-tight text-ink">
        Nuevo objetivo
      </h1>
      <GoalForm
        submitLabel="Crear objetivo"
        onSubmit={async (input) => {
          if (!couple) return { error: 'Pareja no disponible.' }
          const result = await goalsService.createGoal({ coupleId: couple.id, ...input })
          return result
        }}
        onSuccess={() => {
          toast.success('Objetivo creado.')
          navigate('/goals')
        }}
      />
    </div>
  )
}
