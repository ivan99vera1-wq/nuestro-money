import { useCallback, useEffect, useMemo, useState } from 'react'
import * as budgetsService from '@/services/api/budgets'
import type { BudgetWithSpend } from '@/services/api/budgets'
import { useCouple } from '@/contexts/CoupleContext'

interface BudgetsState {
  budgets: BudgetWithSpend[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useBudgets(): BudgetsState {
  const { couple } = useCouple()
  const [budgets, setBudgets] = useState<BudgetWithSpend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!couple) {
      setBudgets([])
      setLoading(false)
      return
    }
    try {
      const rows = await budgetsService.listBudgets(couple.id)
      const withSpend = await budgetsService.budgetsWithSpend(couple.id, rows)
      setBudgets(withSpend)
      setError(null)
    } catch {
      setError('No se pudieron cargar los presupuestos.')
    } finally {
      setLoading(false)
    }
  }, [couple])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return useMemo(() => ({ budgets, loading, error, refresh }), [budgets, loading, error, refresh])
}
