import { useCallback, useEffect, useMemo, useState } from 'react'
import * as transactionsService from '@/services/api/transactions'
import type { TransactionRow } from '@/types/database'
import type { TransactionFilters } from '@/types/domain'
import { useCouple } from '@/contexts/CoupleContext'
import { useDebounce } from '@/hooks/useDebounce'

interface TransactionsState {
  transactions: TransactionRow[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useTransactions(filters: TransactionFilters): TransactionsState {
  const { couple } = useCouple()
  const { type, category, from, to } = filters
  const debouncedQuery = useDebounce(filters.query, 300)
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!couple) {
      setTransactions([])
      setLoading(false)
      return
    }
    try {
      const data = await transactionsService.listTransactions(couple.id, {
        type,
        category,
        from,
        to,
        query: debouncedQuery,
      })
      setTransactions(data)
      setError(null)
    } catch {
      setError('No se pudieron cargar los movimientos.')
    } finally {
      setLoading(false)
    }
  }, [couple, type, category, from, to, debouncedQuery])

  useEffect(() => {
    void load()
  }, [load])

  return useMemo(
    () => ({ transactions, loading, error, refresh: load }),
    [transactions, loading, error, load],
  )
}
