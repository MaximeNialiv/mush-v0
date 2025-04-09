"use client"

import { useState } from "react"
import ReactPlayer from "react-player/lazy"
import { extractYouTubeVideoId, extractSpotifyId } from "@/utils/media-utils"

interface MediaPlayerProps {
  url: string
  title?: string
}

export function MediaPlayer({ url, title }: MediaPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [hasClicked, setHasClicked] = useState(false)

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
      <div className="my-3">
        <div
          className="relative rounded-xl overflow-hidden border border-gray-300 cursor-pointer"
          onClick={() => setHasClicked(true)}
        >
          <div className="aspect-video w-full">
            <img
              src={thumbnailUrl || "/placeholder.svg"}
              alt={title || "Vignette YouTube"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-t-8 border-b-8 border-l-16 border-t-transparent border-b-transparent border-l-white ml-1"></div>
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
    <div className="my-3">
      <div className="relative rounded-xl overflow-hidden border border-gray-300">
        <div className="aspect-video w-full">
          <ReactPlayer
            url={url}
            width="100%"
            height="100%"
            controls={true}
            playing={playing}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            style={{ borderRadius: "0.75rem", overflow: "hidden" }}
          />
        </div>
      </div>
      {title && <p className="mt-2 text-sm text-gray-600 font-medium">{title}</p>}
    </div>
  )
}
