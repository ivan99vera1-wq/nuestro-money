import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft,
  Clock,
  Pencil,
  Trash2,
  User,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CategoryIcon } from '@/components/ui/category-icon'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { InlineLoader } from '@/components/ui/loading'
import { TransactionForm } from '@/features/transactions/TransactionForm'
import * as transactionsService from '@/services/api/transactions'
import * as authService from '@/services/api/auth'
import { useCouple } from '@/contexts/CoupleContext'
import { useBalance } from '@/contexts/BalanceContext'
import { useToast } from '@/contexts/ToastContext'
import { ALL_CATEGORIES } from '@/config/constants'
import { formatDate, formatDateTime, formatSigned } from '@/lib/format'
import type { TransactionRow } from '@/types/database'
import { cn } from '@/utils/cn'

export function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { couple } = useCouple()
  const { refresh } = useBalance()
  const { toast } = useToast()

  const [tx, setTx] = useState<TransactionRow | null>(null)
  const [creatorName, setCreatorName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    if (!couple || !id) return
    try {
      const data = await transactionsService.getTransaction(couple.id, id)
      setTx(data)
      if (data) {
        const profile = await authService.getProfile(data.created_by)
        setCreatorName(profile?.full_name ?? null)
      }
    } finally {
      setLoading(false)
    }
  }, [couple, id])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) return <InlineLoader />
  if (!tx) {
    return (
      <div className="py-16 text-center text-sm text-ink-3">
        Este movimiento no existe o ya fue eliminado.
      </div>
    )
  }

  const currency = couple?.currency ?? 'EUR'
  const isIncome = tx.type === 'income'
  const meta = ALL_CATEGORIES.find((c) => c.key === tx.category)
  const dateTime = new Date(`${tx.date}T00:00:00`)
  const createdAt = new Date(tx.created_at)
  const updatedAt = tx.updated_at ? new Date(tx.updated_at) : null

  const onDelete = async () => {
    if (!couple || !tx) return
    setDeleting(true)
    const result = await transactionsService.softDeleteTransaction(couple.id, tx.id)
    setDeleting(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Movimiento eliminado.')
    await refresh()
    navigate('/transactions', { replace: true })
  }

  if (editing) {
    return (
      <div className="mx-auto max-w-md">
        <TransactionForm
          mode={tx.type}
          initialAmount={(tx.amount / 100).toFixed(2).replace('.', ',')}
          initialCategory={tx.category}
          initialDate={tx.date}
          initialDescription={tx.description}
          initialNote={tx.note ?? ''}
          submitLabel="Guardar cambios"
          onSubmit={async (input) => {
            const result = await transactionsService.updateTransaction(couple!.id, tx.id, input)
            if (!result.error) {
              await refresh()
              setEditing(false)
              await load()
            }
            return result
          }}
          onSuccess={() => setEditing(false)}
        />
      </div>
    )
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

      {/* Hero */}
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-line bg-surface px-6 py-8 text-center">
        <CategoryIcon category={tx.category} color={meta?.color} size="lg" />
        <div>
          <p className="font-display text-2xl font-semibold text-ink">
            {tx.description || meta?.label || 'Movimiento'}
          </p>
          <p className="mt-1 text-sm text-ink-3">{meta?.label}</p>
        </div>
        <p
          className={cn(
            'font-display text-4xl font-semibold tabular-nums tracking-tight',
            isIncome ? 'text-income-600 dark:text-income-400' : 'text-expense-600 dark:text-expense-400',
          )}
        >
          {formatSigned(isIncome ? tx.amount : -tx.amount, currency)}
        </p>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-ink-2">
            {isIncome ? 'Ingreso' : 'Gasto'}
          </span>
          <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-ink-2">
            {meta?.label}
          </span>
        </div>
      </div>

      {/* Details */}
      <Card padded={false} className="divide-y divide-line">
        <DetailRow icon={<Clock className="h-4 w-4" />} label="Fecha" value={formatDate(dateTime)} />
        <DetailRow
          icon={<Clock className="h-4 w-4" />}
          label="Hora"
          value={new Date(tx.created_at).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        />
        {tx.note && (
          <DetailRow icon={<FileText className="h-4 w-4" />} label="Nota" value={tx.note} multiline />
        )}
        <DetailRow icon={<User className="h-4 w-4" />} label="Creado por" value={creatorName ?? '—'} />
        <DetailRow
          icon={<Clock className="h-4 w-4" />}
          label="Creado el"
          value={formatDateTime(createdAt)}
        />
        {updatedAt && (
          <DetailRow
            icon={<Pencil className="h-4 w-4" />}
            label="Última modificación"
            value={formatDateTime(updatedAt)}
          />
        )}
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" fullWidth onClick={() => setEditing(true)} leftIcon={<Pencil className="h-4 w-4" />}>
          Editar
        </Button>
        <Button variant="danger" fullWidth onClick={() => setConfirmDelete(true)} leftIcon={<Trash2 className="h-4 w-4" />}>
          Eliminar
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="¿Quieres eliminar este movimiento?"
        message="Se eliminará de vuestro historial y el saldo se actualizará. Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        danger
        loading={deleting}
        onConfirm={() => void onDelete()}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}

function DetailRow({
  icon,
  label,
  value,
  multiline,
}: {
  icon: React.ReactNode
  label: string
  value: string
  multiline?: boolean
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <span className="text-ink-3">{icon}</span>
      <span className="w-36 shrink-0 text-sm text-ink-3">{label}</span>
      <span
        className={cn(
          'min-w-0 flex-1 text-sm font-medium text-ink',
          multiline && 'whitespace-pre-wrap break-words',
        )}
      >
        {value}
      </span>
    </div>
  )
}
