"use client"

import { useEffect, useState } from "react"
import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { useSupabase } from "@/utils/supabase/client"
import { CardWithContent } from "@/types"

interface FolderBreadcrumbProps {
  currentFolderId: string | null
  showHomeLink?: boolean
}

export function FolderBreadcrumb({ currentFolderId, showHomeLink = true }: FolderBreadcrumbProps) {
  const [path, setPath] = useState<CardWithContent[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = useSupabase()

  useEffect(() => {
    const fetchBreadcrumbPath = async () => {
      if (!currentFolderId) {
        setPath([])
        return
      }

      try {
        setLoading(true)
        
        // Vérifier si nous avons un fil d'Ariane en cache pour ce dossier
        const cachedBreadcrumb = sessionStorage.getItem(`breadcrumb_${currentFolderId}`)
        if (cachedBreadcrumb) {
          try {
            const parsedBreadcrumb = JSON.parse(cachedBreadcrumb)
            // Vérifier si le cache est encore valide (moins de 10 minutes)
            if (parsedBreadcrumb.timestamp && Date.now() - parsedBreadcrumb.timestamp < 10 * 60 * 1000) {
              setPath(parsedBreadcrumb.path)
              setLoading(false)
              return
            }
          } catch (e) {
            console.warn("Erreur lors du parsing du fil d'Ariane en cache", e)
          }
        }
        
        const breadcrumbPath: CardWithContent[] = []
        let currentId: string | null = currentFolderId
        
        // Remonter l'arborescence jusqu'à la racine
        while (currentId) {
          const { data, error } = await supabase
            .from("cards")
            .select("sequential_id, title, type, parent_id")
            .eq("sequential_id", currentId)
            .single()
            
          if (error) {
            console.error("Erreur lors de la récupération du dossier parent:", error)
            break
          }
          
          // Typer correctement les données récupérées
          const folderData = data as CardWithContent
          
          // Ajouter le dossier au début du chemin
          breadcrumbPath.unshift(folderData)
          
          // Passer au parent
          currentId = folderData.parent_id || null
        }
        
        setPath(breadcrumbPath)
        
        // Mettre en cache le fil d'Ariane
        sessionStorage.setItem(`breadcrumb_${currentFolderId}`, JSON.stringify({
          path: breadcrumbPath,
          timestamp: Date.now()
        }))
      } catch (err) {
        console.error("Erreur lors de la mise à jour du fil d'Ariane:", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchBreadcrumbPath()
  }, [currentFolderId, supabase])

  if (loading) {
    return <div className="h-6 w-40 bg-gray-200 animate-pulse rounded"></div>
  }

  if (path.length === 0 && !currentFolderId) {
    return null
  }

  return (
    <div className="flex items-center text-sm overflow-x-auto py-2 no-scrollbar">
      {showHomeLink && (
        <Link 
          href="/folders"
          className="flex items-center text-mush-green hover:underline"
        >
          <Home className="w-4 h-4 mr-1" />
          <span>Racine</span>
        </Link>
      )}
      
      {path.map((folder, index) => (
        <div key={folder.sequential_id} className="flex items-center">
          <ChevronRight className="mx-2 w-4 h-4 text-gray-400" />
          <Link 
            href={`/folders/${folder.sequential_id}`}
            className={`hover:underline ${
              index === path.length - 1 ? 'font-semibold text-mush-green' : 'text-gray-700'
            }`}
          >
            {folder.title}
          </Link>
        </div>
      ))}
    </div>
  )
}
