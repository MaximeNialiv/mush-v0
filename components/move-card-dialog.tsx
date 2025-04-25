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

  // Charger tous les dossiers disponibles avec mise en cache
  useEffect(() => {
    // Fonction pour récupérer les dossiers
    const fetchFolders = async () => {
      try {
        // Ne charger les dossiers que si la boîte de dialogue est ouverte
        if (!isOpen) return
        
        // Vérifier si nous avons des dossiers en cache et s'ils sont récents (moins de 5 minutes)
        const cachedFolders = sessionStorage.getItem('all_folders_cache')
        const now = Date.now()
        const fiveMinutesAgo = now - 5 * 60 * 1000
        
        if (cachedFolders) {
          try {
            const parsedCache = JSON.parse(cachedFolders)
            if (parsedCache.timestamp && parsedCache.timestamp > fiveMinutesAgo) {
              // Filtrer les dossiers cachés pour éviter les cycles
              const filteredFolders = filterFolders(parsedCache.folders) as CardWithContent[]
              setFolders(filteredFolders)
              return
            }
          } catch (e) {
            console.warn("Erreur lors du parsing du cache des dossiers", e)
            // Continuer avec la récupération depuis Supabase
          }
        }
        
        setLoading(true)
        setError(null)
        
        // Utiliser une requête optimisée qui sélectionne uniquement les champs nécessaires
        const { data, error } = await supabase
          .from("cards")
          .select("sequential_id, title, type, child_ids")
          .eq("type", "folder")
          .order("title", { ascending: true })
        
        if (error) throw error
        
        // Mettre en cache les dossiers récupérés
        sessionStorage.setItem('all_folders_cache', JSON.stringify({
          folders: data,
          timestamp: now
        }))
        
        // Filtrer les dossiers pour éviter les cycles
        const filteredFolders = filterFolders(data) as CardWithContent[]
        setFolders(filteredFolders)
      } catch (err) {
        console.error("Erreur lors du chargement des dossiers:", err)
        setError("Impossible de charger les dossiers")
      } finally {
        setLoading(false)
      }
    }
    
    // Fonction pour filtrer les dossiers et éviter les cycles
    const filterFolders = (folders: Partial<CardWithContent>[]) => {
      return folders.filter((folder: Partial<CardWithContent>) => {
        // Éviter de déplacer un dossier dans lui-même
        if (folder.sequential_id && folder.sequential_id === card.sequential_id) return false
        
        // Éviter de déplacer un dossier dans un de ses enfants (pour éviter les cycles)
        if (card.type === "folder") {
          // Vérifier si le dossier est un enfant direct
          if (card.child_ids && folder.sequential_id && card.child_ids.includes(folder.sequential_id)) {
            return false
          }
          
          // Vérification plus approfondie pour les hiérarchies plus profondes
          // Cette fonction pourrait être améliorée avec une approche récursive complète
          const isChildOrDescendant = (parentId: string, potentialChildId: string): boolean => {
            const parent = folders.find(f => f.sequential_id === parentId)
            if (!parent || !parent.child_ids) return false
            
            // Vérifier si c'est un enfant direct
            if (parent.child_ids.includes(potentialChildId)) return true
            
            // Vérifier récursivement pour les enfants qui sont des dossiers
            for (const childId of parent.child_ids) {
              const child = folders.find(f => f.sequential_id === childId && f.type === 'folder')
              if (child && isChildOrDescendant(childId, potentialChildId)) return true
            }
            
            return false
          }
          
          // Vérifier si le dossier est un descendant
          if (folder.sequential_id && isChildOrDescendant(card.sequential_id, folder.sequential_id)) return false
        }
        
        return true
      })
    }
    
    // Utiliser un délai pour éviter les appels API trop fréquents
    const timer = setTimeout(() => {
      fetchFolders()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [isOpen, card.sequential_id, card.type, card.child_ids, supabase])

  // Déplacer la carte vers le dossier sélectionné avec optimisations
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
      
      // Mettre à jour le cache local pour éviter des requêtes supplémentaires
      // Invalider les caches des dossiers concernés
      const oldParentId = card.parent_id || null
      sessionStorage.removeItem(`folder_${oldParentId}_last_load`)
      sessionStorage.removeItem(`folder_${selectedFolderId}_last_load`)
      
      // Recharger les cartes du dossier actuel
      loadFolderCards(oldParentId)
      
      // Mettre à jour l'UI de manière optimiste
      // Cette approche permet d'améliorer la réactivité de l'interface
      setTimeout(() => {
        // Fermer la boîte de dialogue immédiatement pour une meilleure expérience utilisateur
        onClose()
      }, 100)
    } catch (err) {
      console.error("Erreur lors du déplacement de la carte:", err)
      setError("Impossible de déplacer la carte")
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
              {folders.map((folder, index) => (
                <div 
                  key={folder.sequential_id || `folder-${index}`}
                  className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${folder.sequential_id && selectedFolderId === folder.sequential_id ? 'bg-mush-green/10' : ''}`}
                  onClick={() => folder.sequential_id && setSelectedFolderId(folder.sequential_id)}
                >
                  <Folder className="h-5 w-5 text-gray-500 mr-3" />
                  <span>{folder.title}</span>
                  {folder.sequential_id && selectedFolderId === folder.sequential_id && (
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
