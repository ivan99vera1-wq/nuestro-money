/**
 * Transactions service — the heart of the shared account.
 *
 * All amounts are integer minor units. The database trigger
 * `enforce_balance_rule` also rejects any expense that would break the
 * balance, so a race can never overspend.
 */

import { supabase } from '@/services/supabase/client'
import type { TransactionRow } from '@/types/database'
import type { BalanceSnapshot, TransactionFilters } from '@/types/domain'

export interface CreateTransactionInput {
  coupleId: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
  note?: string
}

export interface TransactionResult {
  error: string | null
  transaction?: TransactionRow | undefined
}

const INSUFFICIENT_BALANCE_MESSAGE =
  'No tienes suficiente dinero disponible para registrar este gasto.'

export async function getBalance(coupleId: string): Promise<BalanceSnapshot> {
  const { data, error } = await supabase.rpc('get_balance', {
    _couple_id: coupleId,
  })
  if (error) throw error
  return {
    balance: data?.balance ?? 0,
    income: data?.income ?? 0,
    expense: data?.expense ?? 0,
  }
}

export async function listTransactions(
  coupleId: string,
  filters?: Partial<TransactionFilters>,
  limit?: number,
): Promise<TransactionRow[]> {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('couple_id', coupleId)
    .is('deleted_at', null)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters?.type && filters.type !== 'all') {
    query = query.eq('type', filters.type)
  }
  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category', filters.category)
  }
  if (filters?.from) {
    query = query.gte('date', filters.from)
  }
  if (filters?.to) {
    query = query.lte('date', filters.to)
  }
  if (filters?.query?.trim()) {
    const q = filters.query.trim()
    query = query.or(`description.ilike.%${q}%,note.ilike.%${q}%`)
  }
  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getTransaction(
  coupleId: string,
  id: string,
): Promise<TransactionRow | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('couple_id', coupleId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<TransactionResult> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      couple_id: input.coupleId,
      type: input.type,
      amount: input.amount,
      category: input.category,
      description: input.description.trim(),
      date: input.date,
      note: input.note?.trim() || null,
    })
    .select('*')
    .maybeSingle()

  if (error) {
    if (error.message === 'INSUFFICIENT_BALANCE') {
      return { error: INSUFFICIENT_BALANCE_MESSAGE }
    }
    return { error: error.message }
  }
  return { error: null, transaction: data ?? undefined }
}

export async function updateTransaction(
  coupleId: string,
  id: string,
  patch: Partial<Pick<TransactionRow, 'amount' | 'category' | 'description' | 'date' | 'note' | 'type'>>,
): Promise<TransactionResult> {
  const { data, error } = await supabase
    .from('transactions')
    .update(patch)
    .eq('id', id)
    .eq('couple_id', coupleId)
    .select('*')
    .maybeSingle()

  if (error) {
    if (error.message === 'INSUFFICIENT_BALANCE') {
      return { error: INSUFFICIENT_BALANCE_MESSAGE }
    }
    return { error: error.message }
  }
  return { error: null, transaction: data ?? undefined }
}

/** Soft delete — keeps the audit trail. */
export async function softDeleteTransaction(
  coupleId: string,
  id: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('transactions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('couple_id', coupleId)
  return { error: error?.message ?? null }
}
