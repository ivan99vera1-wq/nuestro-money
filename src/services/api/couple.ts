/**
 * Couple service — the shared account.
 *
 * Membership changes are ONLY possible through the RPCs, so a member can
 * never grant themselves access to a stranger's money.
 */

import { supabase } from '@/services/supabase/client'
import type {
  CoupleMemberRow,
  CoupleRow,
  CoupleStats,
  ProfileRow,
} from '@/types/database'

export type CoupleMemberWithProfile = CoupleMemberRow & {
  profiles: ProfileRow | null
}

export interface MyCouple {
  couple: CoupleRow
  members: CoupleMemberWithProfile[]
}

export interface CoupleResult {
  error: string | null
  coupleId?: string | undefined
}

/** Friendly Spanish mapping for the RPC exceptions defined in SQL. */
const RPC_ERRORS: Record<string, string> = {
  NOT_AUTHENTICATED: 'No has iniciado sesión.',
  ALREADY_IN_COUPLE: 'Ya pertenecéis a una cuenta compartida.',
  NO_COUPLE: 'Todavía no existe vuestra cuenta compartida.',
  COUPLE_FULL: 'Vuestra cuenta compartida ya está completa (máximo 2).',
  INVITE_NOT_FOUND: 'La invitación no existe o ya ha sido utilizada.',
  INVITE_EXPIRED: 'La invitación ha caducado.',
  INVITE_EMAIL_MISMATCH: 'Esta invitación está dirigida a otro email.',
}

function friendlyRpcError(message: string | null): string {
  if (!message) return 'Ha ocurrido un error.'
  return RPC_ERRORS[message] ?? message
}

/** Fetch the caller's couple + all members with their profiles. */
export async function getMyCouple(userId: string): Promise<MyCouple | null> {
  const { data: membership, error } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!membership) return null

  const coupleId = membership.couple_id

  const [{ data: couple }, { data: members }] = await Promise.all([
    supabase.from('couples').select('*').eq('id', coupleId).maybeSingle(),
    supabase
      .from('couple_members')
      .select('*, profiles(*)')
      .eq('couple_id', coupleId)
      .order('joined_at', { ascending: true }),
  ])

  if (!couple) return null
  return {
    couple,
    members: (members ?? []) as CoupleMemberWithProfile[],
  }
}

export async function createCouple(
  name: string,
  currency: string,
): Promise<CoupleResult> {
  const { data, error } = await supabase.rpc('create_couple', {
    _name: name.trim(),
    _currency: currency,
  })
  return { error: error ? friendlyRpcError(error.message) : null, coupleId: data ?? undefined }
}

export async function invitePartner(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('invite_partner', { _email: email.trim() })
  return { error: error ? friendlyRpcError(error.message) : null }
}

export async function acceptInvite(token: string): Promise<CoupleResult> {
  const { data, error } = await supabase.rpc('accept_invite', { _token: token })
  return { error: error ? friendlyRpcError(error.message) : null, coupleId: data ?? undefined }
}

export async function getCoupleStats(coupleId: string): Promise<CoupleStats | null> {
  const { data, error } = await supabase.rpc('get_couple_stats', { _couple_id: coupleId })
  if (error) return null
  return data
}
