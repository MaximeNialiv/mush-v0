"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Envoyer l'erreur à Sentry
    Sentry.captureException(error, {
      tags: {
        location: "error_boundary",
        errorName: error.name,
      },
      extra: {
        errorMessage: error.message,
        errorStack: error.stack,
        errorDigest: error.digest,
      },
    })
    
    console.error("Erreur capturée par le boundary:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Oups ! Une erreur s'est produite</h2>
        <p className="text-gray-700 mb-6">
          Nous avons rencontré un problème lors de la navigation. Notre équipe a été notifiée et travaille à résoudre ce problème.
        </p>
        
        <div className="flex flex-col space-y-3">
          <Button 
            onClick={() => reset()}
            className="bg-mush-green hover:bg-mush-green/90 text-white"
          >
            Réessayer
          </Button>
          
          <Button 
            onClick={() => router.push("/")}
            variant="outline"
            className="border-mush-green text-mush-green hover:bg-mush-green/10"
          >
            Retour à l'accueil
          </Button>
          
          <Button 
            onClick={() => {
              // Utiliser window.location pour une navigation plus fiable
              window.location.href = window.location.pathname;
            }}
            variant="ghost"
            className="text-gray-600"
          >
            Recharger la page
          </Button>
        </div>
        
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 p-4 bg-gray-100 rounded text-left overflow-auto max-h-[200px] text-xs">
            <p className="font-mono text-red-600">{error.message}</p>
            <pre className="mt-2 text-gray-700">{error.stack}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
