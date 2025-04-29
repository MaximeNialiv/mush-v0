"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NotFoundPage() {
  const router = useRouter()

  useEffect(() => {
    // Envoyer l'information à Sentry
    Sentry.captureMessage("Page non trouvée", {
      level: "warning",
      tags: {
        location: "not_found",
        url: typeof window !== "undefined" ? window.location.pathname : "unknown",
      },
    })
    
    console.error("Page non trouvée:", typeof window !== "undefined" ? window.location.pathname : "unknown")
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-amber-600 mb-4">Dossier introuvable</h2>
        <p className="text-gray-700 mb-6">
          Le dossier que vous recherchez n'existe pas ou a été déplacé.
        </p>
        
        <div className="flex flex-col space-y-3">
          <Link 
            href="/"
            className="bg-mush-green hover:bg-mush-green/90 text-white py-2 px-4 rounded-md flex items-center justify-center"
          >
            Retour à l'accueil
          </Link>
          
          <Button 
            onClick={() => {
              // Utiliser window.history pour revenir à la page précédente
              if (typeof window !== "undefined") {
                window.history.back();
              }
            }}
            variant="outline"
            className="border-mush-green text-mush-green hover:bg-mush-green/10"
          >
            Retour à la page précédente
          </Button>
        </div>
      </div>
    </div>
  )
}
