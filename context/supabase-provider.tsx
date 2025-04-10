"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { SupabaseClient } from "@supabase/supabase-js"

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

// Créer une seule instance du client Supabase
let supabaseInstance: SupabaseClient | null = null

// Provider pour fournir le client Supabase à toute l'application
export default function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [supabase] = useState(() => {
    // S'assurer qu'une seule instance est créée
    if (!supabaseInstance) {
      console.log("Création d'une nouvelle instance de Supabase client")
      supabaseInstance = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    } else {
      console.log("Utilisation de l'instance existante de Supabase client")
    }
    return supabaseInstance
  })

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  )
}
