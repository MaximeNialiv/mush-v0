"use client"

import { useState } from "react"
import { useSupabase } from "@/utils/supabase/client"
import { Folder, Plus, X } from "lucide-react"
import { useFolderNavigation } from "@/hooks/use-folder-navigation"
import { useAtom } from "jotai"
import { currentFolderIdAtom } from "@/store/atoms"

export function CreateFolderButton() {
  const [isCreating, setIsCreating] = useState(false)
  const [folderName, setFolderName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const supabase = useSupabase()
  const { loadFolderCards } = useFolderNavigation()
  const [currentFolderId] = useAtom(currentFolderIdAtom)

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      setError("Le nom du dossier ne peut pas être vide")
      return
    }

    try {
      setError(null)
      
      // Créer le nouveau dossier
      const newFolder = {
        title: folderName.trim(),
        description: `Dossier créé le ${new Date().toLocaleDateString('fr-FR')}`,
        type: "folder",
        owner: "user", // Idéalement, récupérer l'ID de l'utilisateur actuel
        content_ids: [],
        child_ids: [],
        parent_id: currentFolderId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from("cards")
        .insert(newFolder)
        .select()
      
      if (error) throw error
      
      // Réinitialiser le formulaire
      setFolderName("")
      setIsCreating(false)
      
      // Recharger les cartes du dossier actuel
      loadFolderCards(currentFolderId)
      
    } catch (err) {
      console.error("Erreur lors de la création du dossier:", err)
      setError("Impossible de créer le dossier")
    }
  }

  if (!isCreating) {
    return (
      <button
        onClick={() => setIsCreating(true)}
        className="flex items-center gap-2 bg-mush-green/10 text-mush-green px-4 py-2 rounded-lg hover:bg-mush-green/20 transition-colors"
      >
        <Plus className="h-4 w-4" />
        <span>Nouveau dossier</span>
      </button>
    )
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Folder className="h-5 w-5 text-mush-green" />
          <h3 className="font-medium">Nouveau dossier</h3>
        </div>
        <button
          onClick={() => {
            setIsCreating(false)
            setFolderName("")
            setError(null)
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Nom du dossier"
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mush-green"
          autoFocus
        />
        
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              setIsCreating(false)
              setFolderName("")
              setError(null)
            }}
            className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded"
          >
            Annuler
          </button>
          <button
            onClick={handleCreateFolder}
            className="px-3 py-1.5 bg-mush-green text-white rounded hover:bg-mush-green/90"
          >
            Créer
          </button>
        </div>
      </div>
    </div>
  )
}
