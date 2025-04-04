"use client"

import { useState } from "react"
import { Heart, MessageCircle, Repeat, Share } from "lucide-react"
import { supabase } from "@/utils/supabase/client"

export function Tweet({ tweet }) {
  const [likes, setLikes] = useState(tweet.likes)
  const [retweets, setRetweets] = useState(tweet.retweets)
  const [hasLiked, setHasLiked] = useState(false)
  const [hasRetweeted, setHasRetweeted] = useState(false)

  async function handleLike() {
    if (hasLiked) {
      setLikes((prev) => prev - 1)
      setHasLiked(false)
    } else {
      setLikes((prev) => prev + 1)
      setHasLiked(true)
    }

    try {
      const { error } = await supabase
        .from("tweets")
        .update({ likes: hasLiked ? likes - 1 : likes + 1 })
        .eq("id", tweet.id)

      if (error) throw error
    } catch (error) {
      console.error("Erreur lors de la mise à jour des likes:", error)
      // Restaurer l'état précédent en cas d'erreur
      setLikes(tweet.likes)
      setHasLiked(false)
    }
  }

  async function handleRetweet() {
    if (hasRetweeted) {
      setRetweets((prev) => prev - 1)
      setHasRetweeted(false)
    } else {
      setRetweets((prev) => prev + 1)
      setHasRetweeted(true)
    }

    try {
      const { error } = await supabase
        .from("tweets")
        .update({ retweets: hasRetweeted ? retweets - 1 : retweets + 1 })
        .eq("id", tweet.id)

      if (error) throw error
    } catch (error) {
      console.error("Erreur lors de la mise à jour des retweets:", error)
      // Restaurer l'état précédent en cas d'erreur
      setRetweets(tweet.retweets)
      setHasRetweeted(false)
    }
  }

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex">
        <div className="mr-3">
          <img src={tweet.user.avatar || "/placeholder.svg"} alt={tweet.user.name} className="w-12 h-12 rounded-full" />
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <span className="font-bold">{tweet.user.name}</span>
            <span className="text-gray-500 ml-2">{tweet.user.handle}</span>
            <span className="text-gray-500 mx-1">·</span>
            <span className="text-gray-500">{tweet.timestamp}</span>
          </div>
          <div className="mt-1">
            <p className="whitespace-pre-wrap">{tweet.content}</p>
          </div>
          <div className="mt-3 flex justify-between max-w-md">
            <button className="flex items-center text-gray-500 hover:text-sky-500 group">
              <div className="p-2 rounded-full group-hover:bg-sky-50">
                <MessageCircle className="h-5 w-5" />
              </div>
              <span className="ml-1 text-sm">{tweet.replies}</span>
            </button>
            <button
              className={`flex items-center ${hasRetweeted ? "text-green-500" : "text-gray-500 hover:text-green-500"} group`}
              onClick={handleRetweet}
            >
              <div className="p-2 rounded-full group-hover:bg-green-50">
                <Repeat className="h-5 w-5" />
              </div>
              <span className="ml-1 text-sm">{retweets}</span>
            </button>
            <button
              className={`flex items-center ${hasLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"} group`}
              onClick={handleLike}
            >
              <div className="p-2 rounded-full group-hover:bg-red-50">
                <Heart className="h-5 w-5" />
              </div>
              <span className="ml-1 text-sm">{likes}</span>
            </button>
            <button className="flex items-center text-gray-500 hover:text-sky-500 group">
              <div className="p-2 rounded-full group-hover:bg-sky-50">
                <Share className="h-5 w-5" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

