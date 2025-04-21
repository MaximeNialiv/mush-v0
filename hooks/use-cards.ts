"use client"

import { useAtom } from "jotai"
import { atom } from "jotai"
import { useEffect, useRef } from "react"
import { cardsAtom, loadingAtom, errorAtom, mushroomCountAtom } from "@/store/atoms"
import { fetchCards } from "@/utils/supabase/client"
import { supabase } from "@/utils/supabase/client"

export function useCards() {
  const [cards, setCards] = useAtom(cardsAtom)
  const [loading, setLoading] = useAtom(loadingAtom)
  const [error, setError] = useAtom(errorAtom)
  const [mushroomCount, setMushroomCount] = useAtom(mushroomCountAtom)

  // Charger les cartes
  const loadCards = async () => {
    try {
      setLoading(true)
      setError(null)
      const cardsData = await fetchCards()
      setCards(cardsData)
    } catch (err) {
      console.error("Erreur lors du chargement des cartes:", err)
      setError("Impossible de charger les cartes")
    } finally {
      setLoading(false)
    }
  }

  // Cache pour les points utilisateur
  const pointsCache = useRef({ value: 0, timestamp: 0 })
  const CACHE_TTL = 60000 // 60 secondes en millisecondes

  // Charger le profil utilisateur avec mise en cache
  const loadUserProfile = async (forceRefresh = false) => {
    try {
      // Vérifier si on peut utiliser le cache
      const now = Date.now()
      if (!forceRefresh && now - pointsCache.current.timestamp < CACHE_TTL) {
        // Utiliser la valeur en cache si elle est récente
        setMushroomCount(pointsCache.current.value)
        return pointsCache.current.value
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from("user_profile")
          .select("total_points")
          .eq("auth_id", user.id)
          .single()

        if (data && !error) {
          const points = data.total_points || 0
          // Mettre à jour le cache
          pointsCache.current = { value: points, timestamp: now }
          setMushroomCount(points)
          return points
        }
      }
      return null
    } catch (err) {
      console.error("Erreur lors du chargement du profil:", err)
      return null
    }
  }

  // Variable pour suivre si les cartes ont été chargées
  const [cardsLoaded, setCardsLoaded] = useAtom(atom(false))
  
  // Charger les cartes avec un délai minimal entre les rechargements
  const lastLoadTime = useRef(0)
  const loadCardsThrottled = async () => {
    const now = Date.now()
    const minDelay = 30000 // 30 secondes minimum entre les rechargements (augmenté pour réduire les perturbations)
    
    if (now - lastLoadTime.current < minDelay) {
      console.log("Rechargement des cartes ignoré (trop fréquent)")
      return
    }
    
    // Vérifier si des cartes sont déjà chargées pour éviter les rechargements inutiles
    if (cards && cards.length > 0 && cardsLoaded) {
      console.log("Cartes déjà chargées, rechargement silencieux")
      // Rechargement silencieux en arrière-plan sans modifier l'état de chargement
      try {
        const cardsData = await fetchCards()
        // Mettre à jour uniquement si les données ont changé
        if (JSON.stringify(cardsData) !== JSON.stringify(cards)) {
          setCards(cardsData)
        }
      } catch (err) {
        console.error("Erreur lors du rechargement silencieux des cartes:", err)
      }
      return
    }
    
    // Premier chargement ou rechargement forcé
    lastLoadTime.current = now
    await loadCards()
    setCardsLoaded(true)
  }

  // Écouter les changements de points et d'authentification
  useEffect(() => {
    // Chargement initial immédiat des cartes et du profil
    if (!cardsLoaded) {
      // Charger le profil utilisateur en priorité
      const loadInitialData = async () => {
        // Charger le profil en premier (plus rapide)
        await loadUserProfile(true) // Force refresh
        // Puis charger les cartes
        loadCardsThrottled()
      }
      loadInitialData()
    }

    // Abonnement aux changements de points
    const channel = supabase
      .channel("user_profile_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_profile",
        },
        (payload: any) => {
          if (payload.new && payload.new.total_points !== undefined) {
            // Mettre à jour le cache et l'état
            pointsCache.current = { 
              value: payload.new.total_points, 
              timestamp: Date.now() 
            }
            setMushroomCount(payload.new.total_points)
          }
        },
      )
      .subscribe()
    
    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      // Limiter les logs pour éviter de polluer la console
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        console.log("Auth state changed:", event)
      }
      
      if (event === 'SIGNED_IN') {
        // Recharger le profil utilisateur immédiatement avec force refresh
        loadUserProfile(true)
        
        // Recharger les cartes avec le throttling
        loadCardsThrottled()
      }
    })

    return () => {
      supabase.removeChannel(channel)
      subscription.unsubscribe()
    }
  }, [cardsLoaded])

  return {
    cards,
    loading,
    error,
    mushroomCount,
    refreshCards: loadCards,
    refreshUserProfile: () => loadUserProfile(true), // Méthode pour rafraîchir le profil
    silentRefresh: async () => {
      // Méthode pour rafraîchir silencieusement sans changer l'état de chargement
      await loadUserProfile(false) // Utiliser le cache si possible
      // Ne pas recharger les cartes pour éviter de perturber l'expérience utilisateur
    }
  }
}
