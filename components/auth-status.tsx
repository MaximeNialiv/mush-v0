"use client"

import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { useSupabase } from "@/context/supabase-provider"
import { LogOut } from "lucide-react"
import { toast } from "sonner"

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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success("Déconnexion réussie")
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
      toast.error("Erreur lors de la déconnexion")
    }
  }

  return (
    <div className="fixed left-0 top-1/2 transform -translate-y-1/2 text-black p-2 rounded-r-lg z-50 flex flex-col items-center gap-4">
      <div className="text-xs font-medium whitespace-nowrap origin-center -rotate-90 translate-x-[-30%] translate-y-[150%]">
        <span className="font-bold">Connecté:</span> {user.email}
      </div>
      <button 
        onClick={handleLogout}
        className="mt-4 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        title="Déconnexion"
      >
        <LogOut size={16} />
      </button>
    </div>
  )
}
