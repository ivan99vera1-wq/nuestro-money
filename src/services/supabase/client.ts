/**
 * Supabase client (browser).
 *
 * Uses the public anon key: every table is protected by Row Level
 * Security, so the anon key alone cannot read private data. The user's
 * session token is attached automatically by supabase-js.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from '@/config/env'
import type { Database } from '@/types/supabase'

export const supabase: SupabaseClient<Database> = createClient<Database>(
  env.supabaseUrl,
  env.supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'nuestro-money.auth',
    },
  },
)
