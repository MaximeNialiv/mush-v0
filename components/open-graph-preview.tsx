"use client"

import { useState, useEffect } from "react"
import { MediaPlayer } from "./media-player"
import ReactPlayer from "react-player/lazy"
import { extractYouTubeVideoId } from "@/utils/media-utils"

interface OpenGraphPreviewProps {
  url: string
  showLinkInImage?: boolean
}

export function OpenGraphPreview({ url, showLinkInImage = false }: OpenGraphPreviewProps) {
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")

  useEffect(() => {
    if (!url) {
      setLoading(false)
      return
    }

    try {
      // Extraire le domaine
      const domain = new URL(url).hostname.replace("www.", "")

      // Définir un titre par défaut
      setTitle(`Contenu de ${domain}`)

      // Vérifier si c'est une URL YouTube
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const videoId = extractYouTubeVideoId(url)
        if (videoId) {
          setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`)
          setTitle("Vidéo YouTube")
        } else {
          setThumbnailUrl("/placeholder.svg?height=360&width=640")
        }
      } else {
        // Pour les autres URLs, utiliser une image par défaut
        setThumbnailUrl(
          `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`,
        )
      }
    } catch (error) {
      console.error("Erreur lors de l'analyse de l'URL:", error)
      setThumbnailUrl("/placeholder.svg?height=360&width=640")
    } finally {
      setLoading(false)
    }
  }, [url])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="aspect-video bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  // Vérifier si l'URL est un média lisible
  const isPlayableMedia = ReactPlayer.canPlay(url)

  if (isPlayableMedia) {
    return <MediaPlayer url={url} title={title} />
  }

  // Pour les liens non-média
  return (
    <div>
      {!showLinkInImage && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-mush-green font-medium block mb-2 underline"
        >
          {title || url}
        </a>
      )}

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl overflow-hidden relative border border-gray-300"
      >
        <div className="aspect-video bg-gray-100">
          <img
            src={thumbnailUrl || "/placeholder.svg?height=360&width=640"}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=360&width=640"
            }}
          />
        </div>

        {showLinkInImage && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2">
            <p className="text-sm font-medium truncate">{title || url}</p>
          </div>
        )}
      </a>
    </div>
  )
}
