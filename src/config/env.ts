/**
 * Centralised access to environment variables.
 *
 * Vite exposes any variable prefixed with `VITE_` to the client bundle.
 * These variables are PUBLIC: they live inside the shipped bundle. The
 * Supabase anon key is safe to expose because Row Level Security protects
 * every table — anon keys alone can never read private data.
 *
 * Never put service-role keys, passwords or tokens here.
 */

const required = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in.`,
    )
  }
  return value
}

export const env = {
  /** Supabase project URL, e.g. https://xxxx.supabase.co */
  get supabaseUrl(): string {
    return required('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL)
  },
  /** Supabase anon/public key (protected by RLS) */
  get supabaseAnonKey(): string {
    return required('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY)
  },
  /** App version exposed on the profile screen for support */
  get appVersion(): string {
    return import.meta.env.VITE_APP_VERSION ?? 'dev'
  },
  get isProduction(): boolean {
    return import.meta.env.PROD
  },
  get isDevelopment(): boolean {
    return import.meta.env.DEV
  },
}
