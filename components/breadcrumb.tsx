"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Icon } from "./ui/icon"
import * as Sentry from "@sentry/nextjs"
import Link from "next/link"
import { useSupabase } from "@/utils/supabase/client"
import { CardWithContent } from "@/types"

interface BreadcrumbProps {
  currentFolderId?: string
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
  const [rootFolder, setRootFolder] = useState<BreadcrumbItem>({ id: 'ROOT', title: 'Accueil' })

  // Fonction pour récupérer le chemin complet du dossier
  useEffect(() => {
    const fetchBreadcrumbPath = async () => {
      setLoading(true)
      try {
        // Initialiser le chemin avec le dossier courant
        const path: BreadcrumbItem[] = []
        
        if (currentFolderId) {
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
        }
        
        setBreadcrumbPath(path)
      } catch (err) {
        console.error("Erreur lors de la récupération du chemin:", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchBreadcrumbPath()
  }, [currentFolderId, supabase])

  // Fonction pour capturer les erreurs de navigation et les envoyer à Sentry
  const captureNavigationError = (error: any, destination: string) => {
    console.error(`Erreur de navigation vers ${destination}:`, error);
    Sentry.captureException(error, {
      tags: {
        location: 'breadcrumb_navigation',
        destination
      },
      extra: {
        currentFolderId,
        breadcrumbPath
      }
    });
  }

  return (
    <div className="flex items-center">
      {/* Logo */}
      <Link
        href="/"
        prefetch={true}
        onClick={() => {
          // Instrumentation Sentry pour le suivi de la navigation
          Sentry.addBreadcrumb({
            category: 'navigation',
            message: 'Clic sur le logo Mush',
            level: 'info',
            data: {
              destination: 'root'
            }
          });
          console.log('Navigation vers la racine via le logo');
        }}
        className="flex items-center hover:text-mush-green transition-colors no-underline mr-4"
      >
        <div className="w-10 h-10">
          <img src="/mush-logo.svg" alt="Mush Logo" className="w-full h-full" />
        </div>
      </Link>
      
      {/* Fil d'ariane */}
      <nav className="flex items-center space-x-1 text-sm overflow-x-auto">
        <button
          onClick={() => {
            router.push('/');
            // Instrumentation Sentry pour le suivi de la navigation
            Sentry.addBreadcrumb({
              category: 'navigation',
              message: 'Clic sur Accueil dans le fil d\'Ariane',
              level: 'info',
              data: {
                destination: 'root'
              }
            });
          }}
          className="hover:text-mush-green transition-colors no-underline text-gray-600 bg-transparent border-none cursor-pointer"
        >
          Accueil
        </button>
        
        {breadcrumbPath.length > 0 && (
          <>
            {breadcrumbPath.map((item, index) => (
              <div key={item.id} className="flex items-center">
                <Icon icon="ChevronRight" className="h-4 w-4 text-gray-400 mx-1" />
                {index < breadcrumbPath.length - 1 ? (
                  <button
                    onClick={() => {
                      router.push(`/${item.id}`);
                      // Instrumentation Sentry pour le suivi de la navigation
                      Sentry.addBreadcrumb({
                        category: 'navigation',
                        message: `Clic sur ${item.title} dans le fil d\'Ariane`,
                        level: 'info',
                        data: {
                          folderId: item.id,
                          folderTitle: item.title,
                          url: `/${item.id}`
                        }
                      });
                      console.log(`Navigation vers /${item.id} via le fil d'Ariane`);
                    }}
                    className="hover:text-mush-green transition-colors no-underline text-gray-600 bg-transparent border-none cursor-pointer"
                  >
                    {item.title}
                  </button>
                ) : (
                  <span className="font-bold text-black">
                    {item.title}
                  </span>
                )}
              </div>
            ))}
          </>
        )}
        
        {loading && <span className="text-gray-400 animate-pulse">...</span>}
      </nav>
    </div>
  )
}
