"use client"

import { CardList } from "@/components/card-list"
import { Header } from "@/components/header"
import { useParams, useRouter } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"
import { useEffect, useState } from "react"
import { useSupabase } from "@/utils/supabase/client"
import * as Sentry from "@sentry/nextjs"
import { Loader2 } from "lucide-react"

export default function FolderPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = useSupabase()
  const folderId = params.folderId as string
  
  const [folderExists, setFolderExists] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Vérifier si le dossier existe
  useEffect(() => {
    const checkFolderExists = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Ajouter un breadcrumb Sentry pour le suivi
        Sentry.addBreadcrumb({
          category: 'navigation',
          message: `Vérification de l'existence du dossier ${folderId}`,
          level: 'info',
          data: { folderId }
        })
        
        // Vérifier si le dossier existe dans Supabase
        const { data, error } = await supabase
          .from('cards')
          .select('sequential_id')
          .eq('sequential_id', folderId)
          .single()
        
        if (error) {
          console.error('Erreur lors de la vérification du dossier:', error)
          Sentry.captureException(error, {
            tags: {
              location: 'folder_page',
              action: 'check_folder_exists'
            },
            extra: { folderId }
          })
          
          if (error.code === 'PGRST116') {
            // Code d'erreur quand aucun résultat n'est trouvé
            setFolderExists(false)
          } else {
            setError('Erreur lors de la vérification du dossier')
            setFolderExists(null)
          }
        } else {
          setFolderExists(!!data)
          
          // Enregistrer la visite du dossier dans Sentry
          Sentry.addBreadcrumb({
            category: 'navigation',
            message: `Dossier ${folderId} trouvé et affiché`,
            level: 'info',
            data: { folderId, folderExists: !!data }
          })
        }
      } catch (err) {
        console.error('Erreur inattendue:', err)
        Sentry.captureException(err, {
          tags: {
            location: 'folder_page',
            action: 'unexpected_error'
          },
          extra: { folderId }
        })
        setError('Une erreur inattendue est survenue')
      } finally {
        setLoading(false)
      }
    }
    
    if (folderId) {
      checkFolderExists()
    }
  }, [folderId, supabase, router])
  
  // Rediriger vers la page 404 si le dossier n'existe pas
  useEffect(() => {
    if (folderExists === false) {
      // Enregistrer l'erreur dans Sentry
      Sentry.captureMessage(`Tentative d'accès à un dossier inexistant: ${folderId}`, {
        level: 'warning',
        tags: {
          location: 'folder_page',
          action: 'not_found_redirect'
        }
      })
      
      // Rediriger vers la page 404
      router.push('/not-found')
    }
  }, [folderExists, folderId, router])
  
  // Afficher un état de chargement
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header />
        <main className="mt-8">
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-mush-green" />
            <span className="ml-2 text-mush-green">Chargement du dossier...</span>
          </div>
        </main>
      </div>
    )
  }
  
  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header />
        <main className="mt-8">
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
            <p className="font-semibold text-lg">{error}</p>
            <p className="mt-2">Une erreur est survenue lors du chargement du dossier.</p>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
              >
                Réessayer
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }
  
  // Afficher le contenu du dossier si tout est OK
  if (folderExists) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header />
        <main className="mt-8">
          <div className="mb-4">
            <Breadcrumb currentFolderId={folderId} />
          </div>
          <CardList folderId={folderId} />
        </main>
      </div>
    )
  }
  
  // Fallback pendant la vérification
  return null
}
