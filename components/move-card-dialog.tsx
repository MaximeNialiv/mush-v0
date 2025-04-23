"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/utils/supabase/client"
import { Folder, ChevronRight, ArrowRight } from "lucide-react"
import { useFolderNavigation } from "@/hooks/use-folder-navigation"
import { CardWithContent } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface MoveCardDialogProps {
  card: CardWithContent
  isOpen: boolean
  onClose: () => void
}

export function MoveCardDialog({ card, isOpen, onClose }: MoveCardDialogProps) {
  const [folders, setFolders] = useState<CardWithContent[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(card.parent_id || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useSupabase()
  const { loadFolderCards } = useFolderNavigation()

  // Charger tous les dossiers disponibles
  useEffect(() => {
    // Fonction pour récupérer les dossiers
    const fetchFolders = async () => {
      try {
        // Ne charger les dossiers que si la boîte de dialogue est ouverte
        if (!isOpen) return
        
        setLoading(true)
        setError(null)
        
        // Utiliser une requête optimisée qui sélectionne tous les champs nécessaires pour le type CardWithContent
        const { data, error } = await supabase
          .from("cards")
          .select("*")
          .eq("type", "folder")
          .order("title", { ascending: true })
        
        if (error) throw error
        
        // Filtrer le dossier actuel et ses enfants pour éviter les cycles
        const filteredFolders = data.filter((folder: CardWithContent) => {
          // Éviter de déplacer un dossier dans lui-même
          if (folder.sequential_id === card.sequential_id) return false
          
          // Éviter de déplacer un dossier dans un de ses enfants (pour éviter les cycles)
          // Cette vérification est simplifiée et pourrait être améliorée pour des hiérarchies plus profondes
          if (card.type === "folder" && card.child_ids && card.child_ids.includes(folder.sequential_id)) {
            return false
          }
          
          return true
        })
        
        setFolders(filteredFolders)
      } catch (err) {
        console.error("Erreur lors du chargement des dossiers:", err)
        setError("Impossible de charger les dossiers")
      } finally {
        setLoading(false)
      }
    }
    
    // Utiliser un délai pour éviter les appels API trop fréquents
    const timer = setTimeout(() => {
      fetchFolders()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [isOpen, card.sequential_id, card.type, card.child_ids, supabase])

  // Déplacer la carte vers le dossier sélectionné
  const handleMoveCard = async () => {
    // Vérifier si le dossier sélectionné est différent du dossier actuel
    if (selectedFolderId === card.parent_id) {
      onClose()
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      // Mettre à jour le parent_id de la carte
      const { error } = await supabase
        .from("cards")
        .update({ 
          parent_id: selectedFolderId,
          updated_at: new Date().toISOString() // Mettre à jour la date de modification
        })
        .eq("sequential_id", card.sequential_id)
      
      if (error) throw error
      
      // Recharger les cartes du dossier actuel
      const oldParentId = card.parent_id || null
      loadFolderCards(oldParentId)
      
      // Fermer la boîte de dialogue
      onClose()
    } catch (err) {
      console.error("Erreur lors du déplacement de la carte:", err)
      setError("Impossible de déplacer la carte")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Déplacer vers un dossier</DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}
        
        <div className="py-2">
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Carte à déplacer :</p>
            <div className="flex items-center bg-gray-50 p-3 rounded-md">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              </div>
              <div>
                <p className="font-medium">{card.title}</p>
                {card.description && (
                  <p className="text-sm text-gray-500 truncate">{card.description}</p>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-2">Sélectionner un dossier de destination :</p>
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md divide-y">
              {/* Option pour la racine */}
              <div 
                className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${selectedFolderId === null ? 'bg-mush-green/10' : ''}`}
                onClick={() => setSelectedFolderId(null)}
              >
                <Folder className="h-5 w-5 text-mush-green mr-3" />
                <span>Racine</span>
                {selectedFolderId === null && (
                  <ChevronRight className="h-4 w-4 text-mush-green ml-auto" />
                )}
              </div>
              
              {/* Liste des dossiers */}
              {folders.map(folder => (
                <div 
                  key={folder.sequential_id}
                  className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${selectedFolderId === folder.sequential_id ? 'bg-mush-green/10' : ''}`}
                  onClick={() => setSelectedFolderId(folder.sequential_id)}
                >
                  <Folder className="h-5 w-5 text-gray-500 mr-3" />
                  <span>{folder.title}</span>
                  {selectedFolderId === folder.sequential_id && (
                    <ChevronRight className="h-4 w-4 text-mush-green ml-auto" />
                  )}
                </div>
              ))}
              
              {folders.length === 0 && !loading && (
                <div className="p-3 text-center text-gray-500">
                  Aucun dossier disponible
                </div>
              )}
              
              {loading && (
                <div className="p-3 text-center text-gray-500">
                  Chargement des dossiers...
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Annuler
          </button>
          <button
            onClick={handleMoveCard}
            disabled={loading}
            className="px-4 py-2 bg-mush-green text-white rounded-md hover:bg-mush-green/90 flex items-center gap-1"
          >
            <ArrowRight className="h-4 w-4" />
            Déplacer
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
