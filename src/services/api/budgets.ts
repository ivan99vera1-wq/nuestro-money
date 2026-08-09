/**
 * Budgets service.
 *
 * Budgets are VIRTUAL monthly caps per category. They NEVER modify the
 * shared balance. Progress = current month's expenses / cap.
 */

import { startOfMonth } from 'date-fns'
import { supabase } from '@/services/supabase/client'
import type { BudgetRow } from '@/types/database'

export interface BudgetWithSpend extends BudgetRow {
  /** Expenses of the current month for this category, in minor units. */
  spent: number
  progress: number
  warning: 'ok' | 'warning' | 'reached' | 'exceeded'
}

export interface BudgetResult {
  error: string | null
  budget?: BudgetRow | undefined
}

export async function listBudgets(coupleId: string): Promise<BudgetRow[]> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createBudget(
  coupleId: string,
  category: string,
  limitAmount: number,
): Promise<BudgetResult> {
  const { data, error } = await supabase
    .from('budgets')
    .insert({ couple_id: coupleId, category, limit_amount: limitAmount })
    .select('*')
    .maybeSingle()
  if (error) {
    if (error.code === '23505') {
      return { error: 'Ya existe un presupuesto para esta categoría.' }
    }
    return { error: error.message }
  }
  return { error: null, budget: data ?? undefined }
}

export async function updateBudget(
  coupleId: string,
  id: string,
  limitAmount: number,
): Promise<BudgetResult> {
  const { data, error } = await supabase
    .from('budgets')
    .update({ limit_amount: limitAmount })
    .eq('id', id)
    .eq('couple_id', coupleId)
    .select('*')
    .maybeSingle()
  if (error) return { error: error.message }
  return { error: null, budget: data ?? undefined }
}

export async function deleteBudget(coupleId: string, id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('couple_id', coupleId)
  return { error: error?.message ?? null }
}

/**
 * Combine budgets with the current month's spending per category and
 * compute the progress + warning state.
 */
export async function budgetsWithSpend(
  coupleId: string,
  budgets: BudgetRow[],
): Promise<BudgetWithSpend[]> {
  const from = startOfMonth(new Date()).toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('transactions')
    .select('category, amount')
    .eq('couple_id', coupleId)
    .eq('type', 'expense')
    .gte('date', from)
    .is('deleted_at', null)

  if (error) throw error

  const spentByCategory = new Map<string, number>()
  for (const t of data ?? []) {
    spentByCategory.set(t.category, (spentByCategory.get(t.category) ?? 0) + t.amount)
  }

  return budgets.map((budget) => {
    const spent = spentByCategory.get(budget.category) ?? 0
    const progress = budget.limit_amount > 0 ? spent / budget.limit_amount : 0
    const warning: BudgetWithSpend['warning'] =
      progress > 1 ? 'exceeded' : progress >= 1 ? 'reached' : progress >= 0.8 ? 'warning' : 'ok'
    return { ...budget, spent, progress, warning }
  })
}
