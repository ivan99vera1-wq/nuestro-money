/**
 * Auth service — wraps Supabase Auth.
 * Every function returns a typed result so the UI never throws for
 * expected failures (bad credentials, unconfirmed email, …).
 */

import { supabase } from '@/services/supabase/client'
import type { Profile } from '@/types/domain'

export interface SignUpParams {
  email: string
  password: string
  fullName: string
}

export interface AuthResult {
  error: string | null
  needsConfirmation?: boolean
}

export async function signUp(params: SignUpParams): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: { full_name: params.fullName.trim() },
    },
  })
  if (error) return { error: error.message }
  if (!data.session) {
    return { error: null, needsConfirmation: true }
  }
  return { error: null }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return { error: error?.message ?? null }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

export async function resetPassword(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${window.location.pathname}#/reset-password`,
  })
  return { error: error?.message ?? null }
}

export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  return { error: error?.message ?? null }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function updateProfile(
  userId: string,
  patch: Partial<Pick<Profile, 'full_name' | 'avatar_url' | 'currency'>>,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select('*')
    .maybeSingle()
  if (error) throw error
  return data
}
