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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        console.log("Session actuelle:", data.session)
        if (!data.session) {
          setIsAuthModalOpen(true)
        } else {
          setIsAuthModalOpen(false)
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()

    // Abonnement aux changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Changement d'état d'authentification:", event, session)
      if (event === 'SIGNED_IN' && session) {
        setIsAuthModalOpen(false)
      } else if (event === 'SIGNED_OUT') {
        setIsAuthModalOpen(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <JotaiProvider>
      <div className="flex flex-col min-h-screen bg-white">
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
