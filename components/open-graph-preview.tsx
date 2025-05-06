"use client"

import { useState, useEffect, useRef } from "react"
import { MediaPlayer } from "./media-player"
import ReactPlayer from "react-player/lazy"
import { extractYouTubeVideoId } from "@/utils/media-utils"
import { getOGMetadata, type OGMetadata } from "@/utils/cache-utils"

interface OpenGraphPreviewProps {
  url: string
  showLinkInImage?: boolean
}

// Utilisation du type OGMetadata importé depuis cache-utils.ts

export function OpenGraphPreview({ url, showLinkInImage = false }: OpenGraphPreviewProps) {
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [shouldLoadMedia, setShouldLoadMedia] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
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
    
    // Réinitialiser shouldLoadMedia lorsque l'URL change
    setShouldLoadMedia(false)

    const fetchMetadata = async () => {
      try {
        // Vérifier si c'est une URL YouTube (traitement spécial pour optimiser les performances)
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
        
        // Pour les autres URLs, utiliser notre fonction de cache
        const data = await getOGMetadata(url)
        setMetadata(data)
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
  
  // Utiliser Intersection Observer pour détecter quand le composant est visible
  useEffect(() => {
    if (!previewRef.current) return
    
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

    observer.observe(previewRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse" ref={previewRef}>
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="aspect-video bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  // Vérifier si l'URL est un média lisible
  const isPlayableMedia = isVisible && ReactPlayer.canPlay(url)
  
  // Gestion du clic pour charger le média
  const handlePreviewClick = () => {
    setShouldLoadMedia(true)
  }

  if (isPlayableMedia && shouldLoadMedia) {
    return <MediaPlayer url={url} title={metadata.title} />
  }
  
  // Afficher une prévisualisation pour les médias jouables mais pas encore chargés
  if (isPlayableMedia && !shouldLoadMedia) {
    return (
      <div ref={previewRef}>
        <div className="flex items-center mb-2">
          {metadata.favicon && (
            <img 
              src={metadata.favicon} 
              alt="" 
              width="16"
              height="16"
              loading="lazy"
              className="w-4 h-4 mr-2"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          )}
          <span className="text-mush-green font-medium truncate">{metadata.title || url}</span>
        </div>
        
        <div 
          className="block rounded-xl overflow-hidden relative border border-gray-300 cursor-pointer"
          onClick={handlePreviewClick}
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
                decoding="async"
                fetchpriority="high"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=360&width=640"
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                <span className="text-lg font-medium">{metadata.domain || new URL(url).hostname}</span>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-t-8 border-b-8 border-l-16 border-t-transparent border-b-transparent border-l-white ml-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Pour les liens non-média
  return (
    <div ref={previewRef}>
      {!showLinkInImage && (
        <div className="flex items-center mb-2">
          {metadata.favicon && (
            <img 
              src={metadata.favicon} 
              alt="" 
              width="16"
              height="16"
              loading="lazy"
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
              decoding="async"
              fetchpriority="high"
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
                  width="16"
                  height="16"
                  loading="lazy"
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
