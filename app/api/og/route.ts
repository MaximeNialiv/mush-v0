import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
  }

  try {
    // Extraire le domaine de l'URL
    const domain = new URL(url).hostname.replace("www.", "")

    // Déterminer le type de contenu en fonction de l'URL
    let type = "article"
    let image = "/placeholder.svg?height=300&width=600"
    let title = `Contenu de ${domain}`
    const description = "Cliquez pour voir le contenu complet"

    // Personnaliser en fonction du domaine
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      type = "video"
      title = "Vidéo YouTube"
      const videoId = extractYouTubeVideoId(url)
      if (videoId) {
        image = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      }
    } else if (url.includes("spotify.com")) {
      type = "audio"
      title = "Audio Spotify"
    } else if (url.includes("twitter.com") || url.includes("x.com")) {
      type = "tweet"
      title = "Publication Twitter/X"
    }

    // Retourner les données OpenGraph simulées
    return NextResponse.json({
      title,
      description,
      image,
      url,
      siteName: domain,
      type,
    })
  } catch (error) {
    console.error("Error generating OpenGraph data:", error)
    return NextResponse.json(
      {
        title: "Contenu externe",
        description: "Cliquez pour voir le contenu complet",
        image: "/placeholder.svg?height=300&width=600",
        url,
        siteName: "Site externe",
        type: "article",
      },
      { status: 200 },
    )
  }
}

// Fonction pour extraire l'ID d'une vidéo YouTube
function extractYouTubeVideoId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[7].length === 11 ? match[7] : null
}
