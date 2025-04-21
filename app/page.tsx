"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { CardList } from "@/components/card-list"
import { DataStatus } from "@/components/data-status"
import { JotaiProvider } from "./jotai-provider"
import AuthModal from "@/components/auth-modal"
import { useSupabase } from "@/context/supabase-provider"

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const supabase = useSupabase()

  // Fonction de vérification d'authentification simple
  const checkAuth = async () => {
    setIsCheckingAuth(true)
    try {
      // Vérifier avec Supabase si l'utilisateur est connecté
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        // Si l'utilisateur n'est pas connecté, afficher la modale d'authentification
        setIsAuthModalOpen(true)
      } else {
        // Si l'utilisateur est connecté, s'assurer que la modale est fermée
        setIsAuthModalOpen(false)
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'authentification:", error)
      // En cas d'erreur, on ouvre la modale par sécurité
      setIsAuthModalOpen(true)
    } finally {
      setIsCheckingAuth(false)
    }
  }

  // Vérification immédiate au chargement de la page
  useEffect(() => {
    // Vérifier l'authentification au chargement de la page
    checkAuth()
    
    // Vérification périodique simple de l'authentification
    const periodicCheckAuth = async () => {
      try {
        // Vérifier uniquement si l'utilisateur est connecté
        const { data } = await supabase.auth.getSession()
        if (!data.session && !isAuthModalOpen) {
          // Si l'utilisateur n'est pas connecté et que la modale n'est pas déjà ouverte, l'afficher
          setIsAuthModalOpen(true)
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error)
      }
    }
    
    // Vérifier périodiquement l'authentification
    const authCheckInterval = setInterval(periodicCheckAuth, 60000) // 1 minute
    
    // Écouteur d'événement pour ouvrir la modale d'authentification
    const handleOpenAuthModal = () => {
      setIsAuthModalOpen(true)
    }
    
    window.addEventListener('open-auth-modal', handleOpenAuthModal)

    // Abonnement aux changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsAuthModalOpen(false)
      } else if (event === 'SIGNED_OUT') {
        setIsAuthModalOpen(true)
      }
    })

    return () => {
      clearInterval(authCheckInterval)
      window.removeEventListener('open-auth-modal', handleOpenAuthModal)
      subscription.unsubscribe()
    }
  }, [])

  return (
    <JotaiProvider>
      <div className="flex flex-col min-h-screen bg-mush-green/10">
        <Header />
        <main className="flex-1 container mx-auto p-4 pb-8 max-w-5xl">
          {isCheckingAuth ? (
            <div className="flex items-center justify-center h-full">
              <p>Chargement...</p>
            </div>
          ) : (
            <>
              <div className="relative">
                {/* Fond décoratif en origami */}
                <div className="absolute -top-4 -left-4 w-32 h-32 bg-mush-green/20 rounded-lg transform rotate-12 -z-10"></div>
                <div className="absolute top-12 -right-8 w-40 h-40 bg-mush-yellow/20 rounded-lg transform -rotate-6 -z-10"></div>
                <CardList />
              </div>
              <div className="mt-4 mb-16">
                <DataStatus />
              </div>
            </>
          )}
        </main>
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </div>
    </JotaiProvider>
  )
}
