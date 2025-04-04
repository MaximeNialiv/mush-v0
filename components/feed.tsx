"use client"

import { useState, useEffect } from "react"
import { Tweet } from "@/components/tweet"
import { ComposeBox } from "@/components/compose-box"
import { supabase } from "@/utils/supabase/client"

export function Feed() {
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTweets()

    // Abonnement aux changements en temps réel
    const channel = supabase
      .channel("public:tweets")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tweets",
        },
        (payload) => {
          fetchTweetById(payload.new.id)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchTweetById(id) {
    const { data, error } = await supabase
      .from("tweets")
      .select(`
        id,
        content,
        created_at,
        likes,
        retweets,
        replies,
        profiles:user_id (
          name,
          handle,
          avatar_url
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Erreur lors du chargement du tweet:", error)
      return
    }

    if (data) {
      const formattedTweet = formatTweet(data)
      setTweets((current) => [formattedTweet, ...current])
    }
  }

  async function fetchTweets() {
    try {
      setLoading(true)

      // Version simplifiée de la requête pour déboguer
      const { data, error } = await supabase
        .from("tweets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) {
        console.error("Erreur lors du chargement des tweets:", error)
        throw error
      }

      console.log("Tweets récupérés:", data) // Pour déboguer

      if (data && data.length > 0) {
        // Récupérer les profils séparément pour simplifier
        const userIds = [...new Set(data.map((tweet) => tweet.user_id).filter(Boolean))]

        let profiles = {}
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, name, handle, avatar_url")
            .in("id", userIds)

          if (!profilesError && profilesData) {
            profiles = profilesData.reduce((acc, profile) => {
              acc[profile.id] = profile
              return acc
            }, {})
          }
        }

        const formattedTweets = data.map((tweet) => {
          const profile = tweet.user_id ? profiles[tweet.user_id] : null

          return {
            id: tweet.id,
            content: tweet.content,
            timestamp: formatTimestamp(tweet.created_at),
            likes: tweet.likes || 0,
            retweets: tweet.retweets || 0,
            replies: tweet.replies || 0,
            user: {
              name: profile?.name || "Utilisateur",
              handle: profile?.handle || "@utilisateur",
              avatar: profile?.avatar_url || "/placeholder.svg?height=40&width=40",
            },
          }
        })

        setTweets(formattedTweets)
      } else {
        setTweets([])
      }
    } catch (error) {
      console.error("Erreur lors du chargement des tweets:", error)
    } finally {
      setLoading(false)
    }
  }

  function formatTweet(tweet) {
    return {
      id: tweet.id,
      content: tweet.content,
      timestamp: formatTimestamp(tweet.created_at),
      likes: tweet.likes || 0,
      retweets: tweet.retweets || 0,
      replies: tweet.replies || 0,
      user: {
        name: tweet.profiles?.name || "Utilisateur",
        handle: tweet.profiles?.handle || "@utilisateur",
        avatar: tweet.profiles?.avatar_url || "/placeholder.svg?height=40&width=40",
      },
    }
  }

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "À l'instant"
    if (diffMins < 60) return `Il y a ${diffMins}m`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    return `Il y a ${diffDays}j`
  }

  const addTweet = async (content) => {
    try {
      // Pour simplifier, on utilise un profil aléatoire parmi les existants
      const { data: profiles, error: profilesError } = await supabase.from("profiles").select("id").limit(3)

      if (profilesError) throw profilesError

      const randomProfile = profiles[Math.floor(Math.random() * profiles.length)]

      const newTweet = {
        content,
        user_id: randomProfile.id,
        created_at: new Date().toISOString(),
        likes: 0,
        retweets: 0,
        replies: 0,
      }

      const { error } = await supabase.from("tweets").insert(newTweet)

      if (error) throw error

      // Le tweet sera ajouté via l'abonnement en temps réel
    } catch (error) {
      console.error("Erreur lors de l'ajout du tweet:", error)
    }
  }

  return (
    <div>
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
        <h1 className="text-xl font-bold p-4">Accueil</h1>
      </div>
      <ComposeBox onTweet={addTweet} />
      <div className="divide-y">
        {loading ? (
          <div className="p-4 text-center">Chargement des tweets...</div>
        ) : tweets.length > 0 ? (
          tweets.map((tweet) => <Tweet key={tweet.id} tweet={tweet} />)
        ) : (
          <div className="p-4 text-center">Aucun tweet pour le moment</div>
        )}
      </div>
    </div>
  )
}

