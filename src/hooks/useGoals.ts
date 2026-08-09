import { useCallback, useEffect, useMemo, useState } from 'react'
import * as goalsService from '@/services/api/goals'
import type { GoalWithProgress } from '@/types/domain'
import { useCouple } from '@/contexts/CoupleContext'

interface GoalsState {
  goals: GoalWithProgress[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useGoals(): GoalsState {
  const { couple } = useCouple()
  const [goals, setGoals] = useState<GoalWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!couple) {
      setGoals([])
      setLoading(false)
      return
    }
    try {
      const data = await goalsService.listGoals(couple.id)
      setGoals(goalsService.withProgress(data))
      setError(null)
    } catch {
      setError('No se pudieron cargar los objetivos.')
    } finally {
      setLoading(false)
    }
  }, [couple])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return useMemo(() => ({ goals, loading, error, refresh }), [goals, loading, error, refresh])
}
