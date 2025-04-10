import { createBrowserClient } from '@supabase/ssr'

// Variable globale pour stocker l'instance du client Supabase
// Utilisation de la propriété globalThis pour s'assurer qu'elle est partagée entre tous les modules
interface GlobalWithSupabase {
  supabaseClient?: ReturnType<typeof createBrowserClient>;
}

// S'assurer que globalThis est typé correctement
declare const globalThis: GlobalWithSupabase;

/**
 * Retourne une instance unique du client Supabase pour le navigateur
 * Cette approche garantit qu'une seule instance est créée dans toute l'application
 */
export const getSupabaseClient = () => {
  // Vérifier si nous sommes côté client
  if (typeof window === 'undefined') {
    // Côté serveur, créer une nouvelle instance à chaque fois
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // Côté client, utiliser l'instance globale
  if (!globalThis.supabaseClient) {
    globalThis.supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  
  return globalThis.supabaseClient
}
