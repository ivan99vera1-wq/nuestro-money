import { useState } from 'react'
import { Plus, Target } from 'lucide-react'
import { BudgetCard } from '@/components/cards/budget-card'
import { EmptyState } from '@/components/ui/empty-state'
import { InlineLoader } from '@/components/ui/loading'
import { BudgetForm, type BudgetFormValues } from '@/features/budgets/BudgetForm'
import { useBudgets } from '@/hooks/useBudgets'
import { useCouple } from '@/contexts/CoupleContext'
import { useToast } from '@/contexts/ToastContext'
import * as budgetsService from '@/services/api/budgets'
import type { BudgetRow } from '@/types/database'

export function BudgetsPage() {
  const { couple } = useCouple()
  const { toast } = useToast()
  const { budgets, loading, refresh } = useBudgets()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<BudgetRow | null>(null)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (b: BudgetRow) => {
    setEditing(b)
    setFormOpen(true)
  }

  const handleSubmit = async (values: BudgetFormValues) => {
    if (!couple) return { error: 'Pareja no disponible.' }
    if (editing) {
      return budgetsService.updateBudget(couple.id, editing.id, values.limitAmount)
    }
    return budgetsService.createBudget(couple.id, values.category, values.limitAmount)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Presupuestos</h1>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition-colors hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Nuevo
        </button>
      </div>

      <p className="text-sm text-ink-2">
        Límites por categoría para controlar el gasto. Son recordatorios: no bloquean el dinero.
      </p>

      {loading ? (
        <InlineLoader />
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={<Target className="h-7 w-7" />}
          title="Todavía no tenéis presupuestos"
          description="Poned un límite mensual o anual a una categoría para saber cuándo os estáis pasando."
          action={
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" /> Crear presupuesto
            </button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {budgets.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => openEdit(b)}
              className="block w-full rounded-2xl text-left transition-transform active:scale-[0.99]"
            >
              <BudgetCard budget={b} />
            </button>
          ))}
        </div>
      )}

      <BudgetForm
        open={formOpen}
        budget={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        onSuccess={async () => {
          setFormOpen(false)
          await refresh()
          toast.success(editing ? 'Presupuesto actualizado.' : 'Presupuesto creado.')
        }}
      />
    </div>
  )
}
