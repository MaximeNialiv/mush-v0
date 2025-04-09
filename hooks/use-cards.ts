"use client"

import { useAtom } from "jotai"
import { useEffect } from "react"
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

  // Charger le profil utilisateur
  const loadUserProfile = async () => {
    try {
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
          setMushroomCount(data.total_points || 0)
        }
      }
    } catch (err) {
      console.error("Erreur lors du chargement du profil:", err)
    }
  }

  // Écouter les changements de points
  useEffect(() => {
    loadCards()
    loadUserProfile()

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
        (payload) => {
          if (payload.new && payload.new.total_points !== undefined) {
            setMushroomCount(payload.new.total_points)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    cards,
    loading,
    error,
    mushroomCount,
    refreshCards: loadCards,
  }
}
