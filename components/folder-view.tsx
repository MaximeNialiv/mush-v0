"use client"

import { useEffect, useMemo, memo, useCallback, useState } from "react"
import { useFolderNavigation } from "@/hooks/use-folder-navigation"
import { FolderCard } from "@/components/folder-card"
import { CardItem } from "@/components/card-item"
import { CreateFolderButton } from "@/components/create-folder-button"
import { Loader2, ChevronRight, Home, Folder, ArrowLeft, ArrowRight } from "lucide-react"
import { useAtom } from "jotai"
import { rootFolderIdAtom } from "@/store/atoms"
import { CardWithContent } from "@/types"
import Link from "next/link"

// Mémoriser le composant CardItem pour éviter les rendus inutiles
const MemoizedCardItem = memo(CardItem)

// Mémoriser le composant FolderCard pour éviter les rendus inutiles
const MemoizedFolderCard = memo(FolderCard)

// Composant pour représenter un élément dans la vue en colonnes
const ColumnItem = memo(({ 
  item, 
  isSelected, 
  onClick 
}: { 
  item: CardWithContent, 
  isSelected?: boolean, 
  onClick: () => void 
}) => {
  return (
    <div 
      className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 flex items-center ${isSelected ? 'bg-mush-green/20' : 'hover:bg-gray-100'}`}
      onClick={onClick}
    >
      <div className={`w-8 h-8 rounded-full ${item.type === 'folder' ? 'bg-mush-green/20' : 'bg-gray-200'} flex items-center justify-center mr-3`}>
        {item.type === 'folder' ? (
          <Folder className="h-4 w-4 text-mush-green" />
        ) : (
          <div className="w-3 h-3 rounded-full bg-gray-500"></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.title}</p>
        {item.description && (
          <p className="text-xs text-gray-500 truncate">{item.description}</p>
        )}
      </div>
      {item.type === 'folder' && (
        <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
      )}
    </div>
  )
})

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
    // Si nous sommes à la racine, afficher les cartes avec parent_id null ou "ROOT"
    if (currentFolderId === null) {
      return cards.filter(card => card.parent_id === null || card.parent_id === "ROOT")
    }
    // Sinon, afficher uniquement les cartes du dossier sélectionné
    return cards.filter(card => card.parent_id === currentFolderId)
  }, [cards, currentFolderId])
  
  if (currentFolderCards.length === 0 && !loading) {
    return (
      <div>
        {/* Fil d'Ariane */}
        <Breadcrumb path={breadcrumbPath} onNavigate={handleNavigate} />
        
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
        <div className="flex items-center space-x-2">
          <CreateFolderButton />
        </div>
      </div>
      
      {/* Affichage simple des cartes du dossier actuel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentFolderCards.map(card => (
          <MemoizedCardItem key={card.sequential_id} card={card} />
        ))}
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
    <div className="flex items-center text-sm overflow-x-auto py-2 no-scrollbar bg-white px-3 rounded-lg shadow-sm">
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
