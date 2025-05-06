"use client"

import { useState, useEffect, useRef } from "react"
import ReactPlayer from "react-player/lazy"
import { extractYouTubeVideoId, extractSpotifyId } from "@/utils/media-utils"
import { Icon } from "./ui/icon"
import { OptimizedImage } from "./optimized-image"

interface MediaPlayerProps {
  url: string
  title?: string
}

export function MediaPlayer({ url, title }: MediaPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [hasClicked, setHasClicked] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const mediaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mediaRef.current) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            // Une fois que le composant est visible, on peut arrêter d'observer
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 } // Déclenche quand au moins 10% du composant est visible
    )

    observer.observe(mediaRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  // Extraire l'ID de la vidéo YouTube si c'est une URL YouTube
  let thumbnailUrl = null
  let embedUrl = null

  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = extractYouTubeVideoId(url)
    if (videoId) {
      thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      embedUrl = `https://www.youtube.com/embed/${videoId}`
    }
  } else if (url.includes("spotify.com")) {
    const spotifyInfo = extractSpotifyId(url)
    if (spotifyInfo) {
      const [type, id] = spotifyInfo
      embedUrl = `https://open.spotify.com/embed/${type}/${id}`
    }
  }

  // Si nous avons une URL d'intégration, utiliser un iframe
  if (embedUrl) {
    return (
      <div className="my-3">
        <div className="relative rounded-xl overflow-hidden border border-gray-300">
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title || "Média externe"}
              className="rounded-xl"
            />
          </div>
        </div>
        {title && <p className="mt-2 text-sm text-gray-600 font-medium">{title}</p>}
      </div>
    )
  }

  // Pour YouTube, afficher d'abord la vignette, puis le lecteur après un clic
  if (thumbnailUrl && !hasClicked) {
    return (
      <div className="my-3" ref={mediaRef}>
        <div
          className="relative rounded-xl overflow-hidden border border-gray-300 cursor-pointer"
          onClick={() => setHasClicked(true)}
        >
          <div className="aspect-video w-full">
            <OptimizedImage
              src={thumbnailUrl || "/placeholder.svg"}
              alt={title || "Vignette YouTube"}
              width={640}
              height={360}
              className="w-full h-full object-cover"
              priority={true}
              quality={85}
              fallbackSrc="/placeholder.svg?height=360&width=640"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                <Icon icon="play" className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
        {title && <p className="mt-2 text-sm text-gray-600 font-medium">{title}</p>}
      </div>
    )
  }

  // Pour les autres médias ou après un clic sur la vignette YouTube
  return (
    <div className="my-3" ref={mediaRef}>
      <div className="relative rounded-xl overflow-hidden border border-gray-300">
        <div className="aspect-video w-full">
          {/* Charger ReactPlayer uniquement si le composant est visible ou si l'utilisateur a cliqué */}
          {(isVisible || hasClicked) ? (
            <ReactPlayer
              url={url}
              width="100%"
              height="100%"
              controls={true}
              playing={playing}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              style={{ borderRadius: "0.75rem", overflow: "hidden" }}
              config={{
                youtube: {
                  playerVars: {
                    // Désactiver les vidéos suggérées à la fin
                    rel: 0,
                    // Activer le mode de confidentialité améliorée
                    host: 'https://www.youtube-nocookie.com'
                  }
                }
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-gray-200 rounded-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          )}
        </div>
      </div>
      {title && <p className="mt-2 text-sm text-gray-600 font-medium">{title}</p>}
    </div>
  )
}
