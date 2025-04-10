"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { SupabaseClient } from "@supabase/supabase-js"

// Définir une propriété globale pour stocker l'instance Supabase
declare global {
  var supabaseClient: SupabaseClient | undefined
}

// Créer le contexte
const SupabaseContext = createContext<SupabaseClient | null>(null)

// Hook personnalisé pour utiliser le client Supabase
export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error("useSupabase doit être utilisé à l'intérieur d'un SupabaseProvider")
  }
  return context
}

// Props pour le provider
interface SupabaseProviderProps {
  children: ReactNode
}

// Fonction pour créer ou récupérer l'instance Supabase
const getSupabaseInstance = (): SupabaseClient => {
  // Vérifier si nous sommes côté client
  if (typeof window === "undefined") {
    // Côté serveur, créer une nouvelle instance à chaque fois
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // Côté client, utiliser l'instance globale
  if (!global.supabaseClient) {
    console.log("Création d'une nouvelle instance de Supabase client (globale)")
    global.supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  } else {
    console.log("Utilisation de l'instance globale existante de Supabase client")
  }

  return global.supabaseClient
}

// Provider pour fournir le client Supabase à toute l'application
export default function SupabaseProvider({ children }: SupabaseProviderProps) {
  // Utiliser useState pour initialiser le client une seule fois
  const [supabase] = useState(getSupabaseInstance)

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  )
}
