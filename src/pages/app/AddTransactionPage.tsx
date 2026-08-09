import { useNavigate, useParams } from 'react-router-dom'
import { TransactionForm } from '@/features/transactions/TransactionForm'
import * as transactionsService from '@/services/api/transactions'
import { useCouple } from '@/contexts/CoupleContext'
import { useBalance } from '@/contexts/BalanceContext'
import { LoadingScreen } from '@/components/ui/loading'

export function AddTransactionPage() {
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()
  const { couple } = useCouple()
  const { refresh } = useBalance()

  const mode = type === 'income' ? 'income' : 'expense'

  if (!couple) return <LoadingScreen label="Cargando…" />

  return (
    <div className="mx-auto max-w-md">
      <TransactionForm
        mode={mode}
        submitLabel={mode === 'income' ? 'Añadir dinero' : 'Registrar gasto'}
        onSubmit={async (input) => {
          const result = await transactionsService.createTransaction({
            coupleId: couple.id,
            type: mode,
            ...input,
          })
          if (!result.error) await refresh()
          return result
        }}
        onSuccess={() => navigate('/dashboard', { replace: true })}
      />
    </div>
  )
}
