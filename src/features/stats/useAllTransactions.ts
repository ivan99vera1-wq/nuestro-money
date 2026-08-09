import { useCallback, useEffect, useMemo, useState } from 'react'
import * as transactionsService from '@/services/api/transactions'
import type { TransactionRow } from '@/types/database'
import { useCouple } from '@/contexts/CoupleContext'

interface AllTransactionsState {
  transactions: TransactionRow[]
  loading: boolean
  refresh: () => Promise<void>
}

/** Loads ALL active transactions (used by dashboard, stats and calendar). */
export function useAllTransactions(): AllTransactionsState {
  const { couple } = useCouple()
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!couple) {
      setTransactions([])
      setLoading(false)
      return
    }
    try {
      const data = await transactionsService.listTransactions(couple.id)
      setTransactions(data)
    } catch {
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [couple])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return useMemo(() => ({ transactions, loading, refresh }), [transactions, loading, refresh])
}
