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

  // Charger les cartes et calculer les points
  const loadCards = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Récupérer les cartes
      const cardsData = await fetchCards()
      
      // Récupérer les réponses de l'utilisateur pour calculer les points
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Récupérer toutes les relations utilisateur-contenu
        const { data: relations, error } = await supabase
          .from("relation_user_content")
          .select("content_id, points")
          .eq("user_id", user.id)
        
        if (relations && !error) {
          // Créer un dictionnaire pour un accès rapide
          const pointsByContent: Record<string, number> = {}
          relations.forEach((rel: { content_id: string; points: number | null }) => {
            pointsByContent[rel.content_id] = rel.points || 0
          })
          
          // Mettre à jour les points gagnés pour chaque carte
          const updatedCards = cardsData.map(card => {
            let earnedPoints = 0
            let totalPoints = 0
            
            // Calculer les points gagnés et totaux pour cette carte
            if (card.contents && card.contents.length > 0) {
              card.contents.forEach(content => {
                // Points totaux disponibles pour ce contenu
                totalPoints += content.points || 0
                
                // Points gagnés par l'utilisateur pour ce contenu
                if (pointsByContent[content.sequential_id]) {
                  earnedPoints += pointsByContent[content.sequential_id]
                }
              })
            }
            
            return {
              ...card,
              earnedPoints,
              totalPoints
            }
          })
          
          setCards(updatedCards)
        } else {
          console.error("Erreur lors de la récupération des relations:", error)
          setCards(cardsData)
        }
      } else {
        // Utilisateur non connecté, afficher les cartes sans points
        setCards(cardsData)
      }
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

  // Charger le profil utilisateur avec mise en cache et gestion d'erreur améliorée
  const loadUserProfile = async (forceRefresh = false) => {
    try {
      // Vérifier si on peut utiliser le cache
      const now = Date.now()
      if (!forceRefresh && now - pointsCache.current.timestamp < CACHE_TTL) {
        // Utiliser la valeur en cache si elle est récente
        setMushroomCount(pointsCache.current.value)
        return pointsCache.current.value
      }

      // Vérifier si l'utilisateur est authentifié
      const { data: sessionData } = await supabase.auth.getSession()
      
      if (!sessionData.session) {
        console.log("Utilisateur non authentifié, impossible de récupérer les points")
        return null
      }
      
      const user = sessionData.session.user
      
      if (user && user.id) {
        try {
          // Utiliser une requête plus robuste avec gestion d'erreur explicite
          const { data, error } = await supabase
            .from("user_profile")
            .select("total_points")
            .eq("auth_id", user.id)
            .maybeSingle() // Utiliser maybeSingle au lieu de single pour éviter les erreurs

          if (error) {
            console.error("Erreur lors de la récupération du profil:", error)
            
            // Vérifier si le profil n'existe pas et le créer si nécessaire
            if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
              console.log("Profil utilisateur non trouvé, création d'un nouveau profil")
              
              // Créer un nouveau profil utilisateur
              const { data: newProfile, error: insertError } = await supabase
                .from("user_profile")
                .insert({
                  auth_id: user.id,
                  total_points: 0,
                  pseudo: user.email?.split('@')[0] || 'Utilisateur'
                })
                .select("total_points")
                .single()
              
              if (insertError) {
                console.error("Erreur lors de la création du profil:", insertError)
                return 0
              }
              
              // Mettre à jour le cache avec le nouveau profil
              const points = newProfile?.total_points || 0
              pointsCache.current = { value: points, timestamp: now }
              setMushroomCount(points)
              return points
            }
            
            return 0
          }

          if (data) {
            const points = data.total_points || 0
            // Mettre à jour le cache
            pointsCache.current = { value: points, timestamp: now }
            setMushroomCount(points)
            return points
          }
          
          return 0
        } catch (innerErr) {
          console.error("Exception lors de la récupération du profil:", innerErr)
          return 0
        }
      }
      return 0
    } catch (err) {
      console.error("Erreur lors du chargement du profil:", err)
      return 0
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
    // Vérifier d'abord l'authentification avant de charger les cartes
    const checkAuthAndLoadCards = async () => {
      try {
        // Vérifier l'authentification
        const { data } = await supabase.auth.getSession()
        
        // Charger le profil utilisateur uniquement si authentifié
        if (data.session) {
          await loadUserProfile(false) // Utiliser le cache si possible
        }
        
        // Charger les cartes uniquement si elles n'ont pas déjà été chargées
        if (!cardsLoaded && (!cards || cards.length === 0)) {
          await loadCards()
          setCardsLoaded(true)
          lastLoadTime.current = Date.now()
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error)
      }
    }
    
    // Exécuter la vérification uniquement au premier rendu
    if (!cardsLoaded) {
      checkAuthAndLoadCards()
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
        // Recharger uniquement le profil utilisateur
        loadUserProfile(true)
        
        // Ne pas recharger les cartes automatiquement pour éviter les perturbations
        // Les cartes seront chargées uniquement si elles n'ont pas déjà été chargées
        if (!cardsLoaded) {
          loadCards()
          setCardsLoaded(true)
        }
      }
    })

    return () => {
      subscription?.unsubscribe()
      channel.unsubscribe()
    }
  }, [cardsLoaded])

  // Désactiver le rechargement automatique lors du changement de focus de la fenêtre
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Ne rien faire lorsque l'onglet reprend le focus
      // Cela empêche le rechargement automatique des cartes
      if (document.visibilityState === 'visible') {
        console.log('Onglet actif, mais rechargement désactivé')
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

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
