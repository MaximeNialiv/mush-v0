import { createClient } from "@supabase/supabase-js"

// Créer le client avec des options de débogage
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      fetch: (...args) => fetch(...args),
    },
  },
)

// Fonction de débogage pour tester la connexion
export async function testConnection() {
  try {
    // Tester une requête simple
    const { data, error } = await supabase.from("tweets").select("*").limit(1)

    if (error) {
      console.error("Erreur de connexion Supabase:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (err) {
    console.error("Exception lors de la connexion Supabase:", err)
    return { success: false, error: err }
  }
}

