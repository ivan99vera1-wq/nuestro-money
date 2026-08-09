import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '@/services/supabase/client'
import * as transactionsService from '@/services/api/transactions'
import type { BalanceSnapshot } from '@/types/domain'
import { useCouple } from '@/contexts/CoupleContext'

interface BalanceContextValue extends BalanceSnapshot {
  loading: boolean
  refresh: () => Promise<void>
}

const EMPTY: BalanceSnapshot = { balance: 0, income: 0, expense: 0 }

const BalanceContext = createContext<BalanceContextValue | null>(null)

export function BalanceProvider({ children }: { children: ReactNode }) {
  const { couple } = useCouple()
  const [snapshot, setSnapshot] = useState<BalanceSnapshot>(EMPTY)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!couple) {
      setSnapshot(EMPTY)
      setLoading(false)
      return
    }
    try {
      const next = await transactionsService.getBalance(couple.id)
      setSnapshot(next)
    } catch {
      setSnapshot(EMPTY)
    } finally {
      setLoading(false)
    }
  }, [couple])

  useEffect(() => {
    void refresh()
  }, [refresh])

  // Realtime: keep the shared balance in sync across both devices.
  useEffect(() => {
    if (!couple) return
    const channel = supabase
      .channel(`balance-${couple.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `couple_id=eq.${couple.id}`,
        },
        () => {
          void refresh()
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [couple, refresh])

  const value = useMemo<BalanceContextValue>(
    () => ({ ...snapshot, loading, refresh }),
    [snapshot, loading, refresh],
  )

  return <BalanceContext.Provider value={value}>{children}</BalanceContext.Provider>
}

export function useBalance(): BalanceContextValue {
  const ctx = useContext(BalanceContext)
  if (!ctx) throw new Error('useBalance must be used within BalanceProvider')
  return ctx
}
