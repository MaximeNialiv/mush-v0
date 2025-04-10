import { createBrowserClient } from '@supabase/ssr'

// Créer une instance unique du client Supabase pour le navigateur
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseClient
}
