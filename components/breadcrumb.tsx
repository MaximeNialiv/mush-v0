"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { useSupabase } from "@/utils/supabase/client"
import { CardWithContent } from "@/types"

interface BreadcrumbProps {
  currentFolderId: string
}

interface BreadcrumbItem {
  id: string
  title: string
}

export function Breadcrumb({ currentFolderId }: BreadcrumbProps) {
  const router = useRouter()
  const supabase = useSupabase()
  const [breadcrumbPath, setBreadcrumbPath] = useState<BreadcrumbItem[]>([])
  const [loading, setLoading] = useState(true)

  // Fonction pour récupérer le chemin complet du dossier
  useEffect(() => {
    const fetchBreadcrumbPath = async () => {
      setLoading(true)
      try {
        // Initialiser le chemin avec le dossier courant
        const path: BreadcrumbItem[] = []
        
        // Récupérer les informations du dossier courant
        const { data: currentFolder, error } = await supabase
          .from("cards")
          .select("sequential_id, title, parent_id")
          .eq("sequential_id", currentFolderId)
          .single()
        
        if (error) throw error
        
        if (currentFolder) {
          // Ajouter le dossier courant au chemin
          path.unshift({
            id: currentFolder.sequential_id,
            title: currentFolder.title || `Dossier ${currentFolder.sequential_id}`,
          })
          
          // Remonter l'arborescence pour trouver tous les parents
          let parentId = currentFolder.parent_id
          while (parentId && parentId !== "ROOT" && parentId !== null) {
            const { data: parentFolder, error: parentError } = await supabase
              .from("cards")
              .select("sequential_id, title, parent_id")
              .eq("sequential_id", parentId)
              .single()
            
            if (parentError) break
            
            if (parentFolder) {
              path.unshift({
                id: parentFolder.sequential_id,
                title: parentFolder.title || `Dossier ${parentFolder.sequential_id}`,
              })
              parentId = parentFolder.parent_id
            } else {
              break
            }
          }
        }
        
        setBreadcrumbPath(path)
      } catch (err) {
        console.error("Erreur lors de la récupération du chemin:", err)
      } finally {
        setLoading(false)
      }
    }
    
    if (currentFolderId) {
      fetchBreadcrumbPath()
    }
  }, [currentFolderId, supabase])

  // Fonction pour naviguer vers un dossier
  const navigateToFolder = (folderId: string | null) => {
    if (folderId) {
      router.push(`/${folderId}`)
    } else {
      router.push("/")
    }
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4 overflow-x-auto pb-2">
      <button
        onClick={() => navigateToFolder(null)}
        className="flex items-center hover:text-mush-green transition-colors"
      >
        <Home className="h-4 w-4 mr-1" />
        <span>Accueil</span>
      </button>
      
      {breadcrumbPath.map((item, index) => (
        <div key={item.id} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
          <button
            onClick={() => {
              // Ne pas naviguer si c'est déjà le dossier courant
              if (index < breadcrumbPath.length - 1) {
                navigateToFolder(item.id)
              }
            }}
            className={`hover:text-mush-green transition-colors ${
              index === breadcrumbPath.length - 1 ? "font-semibold text-mush-green" : ""
            }`}
          >
            {item.title}
          </button>
        </div>
      ))}
      
      {loading && <span className="text-gray-400 animate-pulse">...</span>}
    </nav>
  )
}
