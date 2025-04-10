"use client"

import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { useSupabase } from "@/context/supabase-provider"

export default function AuthStatus() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useSupabase()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Écouter les changements d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [supabase])

  if (loading) {
    return null
  }

  if (!user) {
    return null
  }

  return (
    <div className="fixed left-0 top-1/2 transform -translate-y-1/2 bg-green-600 text-white p-2 rounded-r-lg shadow-lg z-50 flex items-center">
      <div className="text-xs font-medium whitespace-nowrap origin-center -rotate-90 translate-x-[-30%] translate-y-[150%]">
        <span className="font-bold">Connecté:</span> {user.email}
      </div>
    </div>
  )
}
