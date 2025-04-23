"use client"

import { useState } from "react"
import { CardWithContent } from "@/types"
import { Folder, ChevronRight, MoreVertical, FolderUp, Trash2 } from "lucide-react"
import { MoveCardDialog } from "@/components/move-card-dialog"
import { useSupabase } from "@/utils/supabase/client"
import { useFolderNavigation } from "@/hooks/use-folder-navigation"

interface FolderCardProps {
  folder: CardWithContent
  onNavigate: () => void
}
export function FolderCard({ folder, onNavigate }: FolderCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useSupabase()
  const { loadFolderCards } = useFolderNavigation()
  
  // Gérer la suppression d'un dossier
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation() // Empêcher la navigation
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce dossier ? Cette action est irréversible.")) {
      return
    }
    
    try {
      setIsDeleting(true)
      setError(null)
      
      // Supprimer le dossier
      const { error } = await supabase
        .from("cards")
        .delete()
        .eq("sequential_id", folder.sequential_id)
      
      if (error) throw error
      
      // Recharger les cartes du dossier parent
      loadFolderCards(folder.parent_id || null)
    } catch (err) {
      console.error("Erreur lors de la suppression du dossier:", err)
      setError("Impossible de supprimer le dossier")
    } finally {
      setIsDeleting(false)
      setShowMenu(false)
    }
  }
  
  return (
    <>
      {/* Boîte de dialogue pour déplacer le dossier */}
      {showMoveDialog && (
        <MoveCardDialog 
          card={folder} 
          isOpen={showMoveDialog} 
          onClose={() => setShowMoveDialog(false)} 
        />
      )}
      
      <div 
        className="bg-white rounded-3xl p-4 shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-100 relative"
        onClick={onNavigate}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-mush-green/10 flex items-center justify-center">
              <Folder className="h-5 w-5 text-mush-green" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{folder.title}</h3>
              {folder.description && (
                <p className="text-sm text-gray-500 line-clamp-1">{folder.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {/* Menu d'actions */}
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full"
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>
              
              {showMenu && (
                <div 
                  className="absolute right-0 top-8 bg-white shadow-lg rounded-lg py-1 z-10 w-40 border border-gray-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center text-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMoveDialog(true)
                      setShowMenu(false)
                    }}
                  >
                    <FolderUp className="h-4 w-4 mr-2" />
                    Déplacer
                  </button>
                  <button 
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center text-sm text-red-600"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? "Suppression..." : "Supprimer"}
                  </button>
                </div>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 ml-1" />
          </div>
        </div>
        
        {/* Informations supplémentaires */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span>Créé par {folder.ownerName}</span>
          </div>
          <div>
            {new Date(folder.created_at).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        </div>
        
        {error && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </div>
    </>
  )
}
