"use client"

import { useState, useRef, useEffect } from "react"
import { MoreVertical, Folder, Trash, Edit } from "lucide-react"
import { useSupabase } from "@/utils/supabase/client"
import { CardWithContent } from "@/types"
import { fetchAvailableFolders, moveCardToFolder } from "@/utils/folder-operations"
import { toast } from "react-hot-toast"
import { createPortal } from "react-dom"

interface CardMenuProps {
  card: CardWithContent
  onCardMoved?: () => void
}

export function CardMenu({ card, onCardMoved }: CardMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isFolderMenuOpen, setIsFolderMenuOpen] = useState(false)
  const [folders, setFolders] = useState<CardWithContent[]>([])
  const [loading, setLoading] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const supabase = useSupabase()

  // Calculer la position du menu lors de l'ouverture
  useEffect(() => {
    if (isFolderMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.top,
        left: rect.right + 5 // 5px de marge
      })
    }
  }, [isFolderMenuOpen])

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsFolderMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Charger les dossiers disponibles
  useEffect(() => {
    if (isFolderMenuOpen) {
      const loadFolders = async () => {
        setLoading(true)
        try {
          // Si la carte est un dossier, on l'exclut pour éviter les cycles
          const excludeId = card.type === "folder" ? card.sequential_id : undefined
          const availableFolders = await fetchAvailableFolders(supabase, excludeId)
          setFolders(availableFolders)
        } catch (error) {
          console.error("Erreur lors du chargement des dossiers:", error)
        } finally {
          setLoading(false)
        }
      }

      loadFolders()
    }
  }, [isFolderMenuOpen, card, supabase])

  // Déplacer la carte vers un dossier
  const handleMoveToFolder = async (folderId: string | null) => {
    setLoading(true)
    try {
      const result = await moveCardToFolder(
        supabase,
        card.sequential_id,
        folderId,
        card.parent_id || null
      )

      if (result.success) {
        toast.success("Carte déplacée avec succès")
        if (onCardMoved) onCardMoved()
      } else {
        toast.error("Erreur lors du déplacement de la carte")
      }
    } catch (error) {
      console.error("Erreur lors du déplacement de la carte:", error)
      toast.error("Erreur lors du déplacement de la carte")
    } finally {
      setLoading(false)
      setIsOpen(false)
      setIsFolderMenuOpen(false)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Options"
      >
        <MoreVertical className="h-5 w-5 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50 py-1 border border-gray-200">
          <button
            onClick={() => setIsFolderMenuOpen(!isFolderMenuOpen)}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <Folder className="h-4 w-4 mr-2" />
            Déplacer vers...
          </button>
          
          {/* Autres options du menu */}
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </button>
          
          <button
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
          >
            <Trash className="h-4 w-4 mr-2" />
            Supprimer
          </button>
        </div>
      )}

      {/* Sous-menu des dossiers en portail pour sortir du contexte de la carte */}
      {isFolderMenuOpen && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed w-48 bg-white rounded-md shadow-lg z-[1000] py-1 border border-gray-200 max-h-[50vh] overflow-y-auto"
          style={{ 
            top: `${menuPosition.top}px`, 
            left: `${menuPosition.left}px`,
          }}
        >
          {loading ? (
            <div className="px-4 py-2 text-sm text-gray-500">Chargement...</div>
          ) : (
            <div className="w-full">
              <button
                onClick={() => handleMoveToFolder(null)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${
                  card.parent_id === null ? 'font-bold text-mush-green' : 'text-gray-700'
                }`}
              >
                <Folder className="h-4 w-4 mr-2" />
                Racine
              </button>
              
              {folders.map(folder => (
                <button
                  key={folder.sequential_id}
                  onClick={() => handleMoveToFolder(folder.sequential_id)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${
                    card.parent_id === folder.sequential_id ? 'font-bold text-mush-green' : 'text-gray-700'
                  }`}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  {folder.title}
                </button>
              ))}
              
              {folders.length === 0 && (
                <div className="px-4 py-2 text-sm text-gray-500">Aucun dossier disponible</div>
              )}
            </div>
            )}
          </div>,
          document.body
        )
      }
    </div>
  )
}
