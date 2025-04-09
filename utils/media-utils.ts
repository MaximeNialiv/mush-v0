export function extractYouTubeVideoId(url: string): string | null {
  try {
    // Format court youtu.be
    if (url.includes("youtu.be/")) {
      const parts = url.split("youtu.be/")
      if (parts.length > 1) {
        return parts[1].split(/[?&#]/)[0]
      }
    }

    // Format youtube.com/watch?v=ID
    const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)
    return match ? match[1] : null
  } catch (error) {
    console.error("Erreur lors de l'extraction de l'ID YouTube:", error)
    return null
  }
}

/**
 * Extrait l'ID et le type d'un contenu Spotify à partir de son URL
 */
export function extractSpotifyId(url: string): [string, string] | null {
  try {
    const regex = /spotify\.com\/(track|playlist|album|episode|show)\/([a-zA-Z0-9]+)/
    const match = url.match(regex)
    if (match && match[1] && match[2]) {
      return [match[1], match[2]]
    }
    return null
  } catch (error) {
    console.error("Erreur lors de l'extraction de l'ID Spotify:", error)
    return null
  }
}

/**
 * Détermine le type de média à partir de son URL
 */
export function getMediaType(url: string): "youtube" | "spotify" | "apple-podcast" | "soundcloud" | "other" {
  if (!url) return "other"

  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "youtube"
  }

  if (url.includes("spotify.com")) {
    return "spotify"
  }

  if (url.includes("podcasts.apple.com")) {
    return "apple-podcast"
  }

  if (url.includes("soundcloud.com")) {
    return "soundcloud"
  }

  return "other"
}
