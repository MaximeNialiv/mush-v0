"use client"

import { useState, useEffect, useRef } from "react"
import { User } from "@supabase/supabase-js"
import { supabase } from "@/utils/supabase/client"
import { LogOut } from "lucide-react"
import { toast } from "sonner"

export function UserProfileMenu() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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

    // Fermer le menu si on clique en dehors
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      authListener?.subscription.unsubscribe()
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success("Déconnexion réussie")
      setIsMenuOpen(false)
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
      toast.error("Erreur lors de la déconnexion")
    }
  }

  // Si l'utilisateur n'est pas chargé ou n'est pas connecté
  if (loading || !user) {
    return (
      <div className="relative" ref={menuRef}>
        {/* Avatar utilisateur cliquable pour non-connecté */}
        <button 
          className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white shadow-md hover:bg-gray-400 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="font-bold text-lg">?</span>
        </button>

        {/* Menu déroulant pour non-connecté */}
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 min-w-[200px] bg-white rounded-lg shadow-lg py-1 z-20 border-2 border-gray-200">
            <div className="px-4 py-2 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">Non connecté</p>
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal'))}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <span className="h-4 w-4 mr-2">⏻</span>
              Se connecter
            </button>
          </div>
        )}
      </div>
    )
  }

  // Obtenir la première lettre de l'email
  const firstLetter = user.email ? user.email[0].toUpperCase() : "?"

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar utilisateur cliquable */}
      <button 
        className="w-10 h-10 rounded-full bg-mush-green flex items-center justify-center text-white shadow-md hover:bg-mush-green/90 transition-colors"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <span className="font-bold text-lg">{firstLetter}</span>
      </button>

      {/* Menu déroulant */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 min-w-[200px] max-w-[300px] bg-white rounded-lg shadow-lg py-1 z-20 border-2 border-gray-200">
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900 break-words">{user.email}</p>
          </div>
          <button
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  )
}
