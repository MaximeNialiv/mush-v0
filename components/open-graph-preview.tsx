"use client"

import { useState, useEffect } from "react"
import { MediaPlayer } from "./media-player"
import ReactPlayer from "react-player/lazy"
import { extractYouTubeVideoId } from "@/utils/media-utils"

interface OpenGraphPreviewProps {
  url: string
  showLinkInImage?: boolean
}

interface OGMetadata {
  title: string
  image: string
  description: string
  favicon: string
  domain: string
}

export function OpenGraphPreview({ url, showLinkInImage = false }: OpenGraphPreviewProps) {
  const [loading, setLoading] = useState(true)
  const [metadata, setMetadata] = useState<OGMetadata>({
    title: "",
    image: "",
    description: "",
    favicon: "",
    domain: ""
  })

  useEffect(() => {
    if (!url) {
      setLoading(false)
      return
    }

    const fetchMetadata = async () => {
      try {
        // Extraire le domaine par défaut
        const domain = new URL(url).hostname.replace("www.", "")
        
        // Vérifier si c'est une URL YouTube
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
          const videoId = extractYouTubeVideoId(url)
          if (videoId) {
            setMetadata({
              title: "Vidéo YouTube",
              image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              description: "",
              favicon: "https://www.youtube.com/favicon.ico",
              domain: "youtube.com"
            })
            setLoading(false)
            return
          }
        }
        
        // Pour les autres URLs, utiliser notre API
        const response = await fetch(`/api/og-metadata?url=${encodeURIComponent(url)}`)
        if (response.ok) {
          const data = await response.json()
          setMetadata({
            title: data.title || `Contenu de ${domain}`,
            image: data.image || "",
            description: data.description || "",
            favicon: data.favicon || "",
            domain: data.domain || domain
          })
        } else {
          throw new Error("Erreur lors de la récupération des métadonnées")
        }
      } catch (error) {
        console.error("Erreur lors de l'analyse de l'URL:", error)
        const domain = new URL(url).hostname.replace("www.", "")
        setMetadata({
          title: `Contenu de ${domain}`,
          image: "",
          description: "",
          favicon: "",
          domain: domain
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchMetadata()
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
    return <MediaPlayer url={url} title={metadata.title} />
  }

  // Pour les liens non-média
  return (
    <div>
      {!showLinkInImage && (
        <div className="flex items-center mb-2">
          {metadata.favicon && (
            <img 
              src={metadata.favicon} 
              alt="" 
              className="w-4 h-4 mr-2"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-mush-green font-medium underline truncate"
          >
            {metadata.title || url}
          </a>
        </div>
      )}

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl overflow-hidden relative border border-gray-300"
      >
        <div className="aspect-video bg-gray-100">
          {metadata.image ? (
            <img
              src={metadata.image}
              alt={metadata.title}
              loading="lazy"
              width="640"
              height="360"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=360&width=640"
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
              <span className="text-lg font-medium">{metadata.domain || new URL(url).hostname}</span>
            </div>
          )}
        </div>

        {showLinkInImage && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2">
            <div className="flex items-center">
              {metadata.favicon && (
                <img 
                  src={metadata.favicon} 
                  alt="" 
                  className="w-4 h-4 mr-2"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
              <p className="text-sm font-medium truncate">{metadata.title || url}</p>
            </div>
          </div>
        )}
      </a>
    </div>
  )
}
