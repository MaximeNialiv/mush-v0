"use client"

import { useEffect, useMemo, memo, useCallback } from "react"
import { useFolderNavigation } from "@/hooks/use-folder-navigation"
import { FolderCard } from "@/components/folder-card"
import { CardItem } from "@/components/card-item"
import { CreateFolderButton } from "@/components/create-folder-button"
import { Loader2, ChevronRight, Home } from "lucide-react"
import { useAtom } from "jotai"
import { rootFolderIdAtom } from "@/store/atoms"
import { CardWithContent } from "@/types"

// Mémoriser le composant CardItem pour éviter les rendus inutiles
const MemoizedCardItem = memo(CardItem)

// Mémoriser le composant FolderCard pour éviter les rendus inutiles
const MemoizedFolderCard = memo(FolderCard)

export function FolderView() {
  const { 
    cards, 
    loading, 
    error, 
    currentFolderId, 
    rootFolderId,
    breadcrumbPath,
    navigateToFolder
  } = useFolderNavigation()
  
  const [, setRootFolderId] = useAtom(rootFolderIdAtom)
  
  // S'assurer que le rootFolderId est défini dans l'atome global
  useEffect(() => {
    if (rootFolderId && !currentFolderId) {
      setRootFolderId(rootFolderId)
    }
  }, [rootFolderId, currentFolderId, setRootFolderId])
  
  // Mémoriser la fonction de navigation pour éviter les recréations inutiles
  const handleNavigate = useCallback((folderId: string | null) => {
    navigateToFolder(folderId)
  }, [navigateToFolder])
  
  if (loading && cards.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-mush-green" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
        <button 
          className="mt-2 text-sm underline"
          onClick={() => navigateToFolder(currentFolderId)}
        >
          Réessayer
        </button>
      </div>
    )
  }
  
  // Filtrer les cartes du dossier actuel avec useMemo pour éviter les recalculs inutiles
  const currentFolderCards = useMemo(() => {
    return cards.filter(card => card.parent_id === currentFolderId)
  }, [cards, currentFolderId])
  
  if (currentFolderCards.length === 0 && !loading) {
    return (
      <div>
        {/* Fil d'Ariane */}
        <Breadcrumb path={breadcrumbPath} onNavigate={navigateToFolder} />
        
        <div className="bg-white rounded-3xl p-6 text-center shadow-md mt-4">
          <p className="text-lg">Ce dossier est vide.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Fil d'Ariane et actions */}
      <div className="flex justify-between items-center">
        <Breadcrumb path={breadcrumbPath} onNavigate={handleNavigate} />
        <CreateFolderButton />
      </div>
      
      {/* Vue en colonnes */}
      <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4">
        {/* Colonne principale (dossier actuel) */}
        <div className="flex-1 min-w-[300px] max-w-full md:max-w-[400px]">
          <h2 className="text-lg font-bold mb-4 text-mush-green">
            {currentFolderId 
              ? breadcrumbPath[breadcrumbPath.length - 1]?.title || "Dossier" 
              : "Racine"}
          </h2>
          
          <div className="space-y-4">
            {currentFolderCards.map(card => (
              <div key={card.sequential_id} className="break-inside-avoid mb-4">
                {card.isFolder ? (
                  <MemoizedFolderCard 
                    folder={card} 
                    onNavigate={() => handleNavigate(card.sequential_id)} 
                  />
                ) : (
                  <MemoizedCardItem card={card} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Colonnes des sous-dossiers (uniquement sur desktop) */}
        {breadcrumbPath.length > 0 && (
          <div className="hidden md:flex flex-row gap-4 overflow-x-auto">
            {breadcrumbPath.map((folder, index) => {
              // Ne pas afficher le dossier actuel (déjà affiché dans la colonne principale)
              if (index === breadcrumbPath.length - 1) return null
              
              // Récupérer les enfants de ce dossier avec mémorisation pour éviter les recalculs inutiles
              const folderChildren = useMemo(() => {
                return cards.filter(card => card.parent_id === folder.sequential_id)
              }, [cards, folder.sequential_id])
              
              return (
                <div 
                  key={folder.sequential_id} 
                  className="min-w-[250px] max-w-[300px] border-l border-gray-200 pl-4"
                >
                  <h3 className="text-md font-semibold mb-3 text-gray-700 truncate">
                    {folder.title}
                  </h3>
                  
                  <div className="space-y-2">
                    {folderChildren.map(child => (
                      <div 
                        key={child.sequential_id} 
                        className="p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleNavigate(child.sequential_id)}
                      >
                        <div className="flex items-center">
                          {child.isFolder ? (
                            <div className="w-6 h-6 rounded-full bg-mush-green/20 flex items-center justify-center mr-2">
                              <ChevronRight className="w-3 h-3 text-mush-green" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            </div>
                          )}
                          <span className="text-sm font-medium truncate">{child.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// Composant pour le fil d'Ariane (mémorisé pour éviter les rendus inutiles)
const Breadcrumb = memo(({ 
  path, 
  onNavigate 
}: { 
  path: CardWithContent[], 
  onNavigate: (folderId: string | null) => void 
}) => {
  // Optimiser le rendu du fil d'Ariane avec useCallback
  const handleRootClick = useCallback(() => {
    onNavigate(null)
  }, [onNavigate])
  
  // Générer un gestionnaire d'événement mémorisé pour chaque élément du fil d'Ariane
  const handleFolderClick = useCallback((folderId: string) => {
    return () => onNavigate(folderId)
  }, [onNavigate])
  
  return (
    <div className="flex items-center text-sm overflow-x-auto py-2 no-scrollbar">
      <button 
        className="flex items-center text-mush-green hover:underline"
        onClick={handleRootClick}
      >
        <Home className="w-4 h-4 mr-1" />
        <span>Racine</span>
      </button>
      
      {path.map((folder, index) => (
        <div key={folder.sequential_id} className="flex items-center">
          <ChevronRight className="mx-2 w-4 h-4 text-gray-400" />
          <button 
            className={`hover:underline ${
              index === path.length - 1 ? 'font-semibold text-mush-green' : 'text-gray-700'
            }`}
            onClick={handleFolderClick(folder.sequential_id)}
          >
            {folder.title}
          </button>
        </div>
      ))}
    </div>
  )
})
