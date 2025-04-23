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
    // Validation du nom du dossier
    const trimmedName = folderName.trim()
    if (!trimmedName) {
      setError("Le nom du dossier ne peut pas être vide")
      return
    }
    
    // Vérifier si le nom est trop long
    if (trimmedName.length > 50) {
      setError("Le nom du dossier ne peut pas dépasser 50 caractères")
      return
    }

    try {
      setError(null)
      
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser()
      const ownerId = user?.id || "system"
      
      // Créer le nouveau dossier
      const newFolder = {
        title: trimmedName,
        description: `Dossier créé le ${new Date().toLocaleDateString('fr-FR')}`,
        type: "folder",
        owner: ownerId,
        content_ids: [],
        child_ids: [],
        parent_id: currentFolderId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Ajouter un indicateur de chargement
      const loadingTimeout = setTimeout(() => setLoading(true), 300)
      
      const { data, error } = await supabase
        .from("cards")
        .insert(newFolder)
        .select()
        
      // Annuler l'indicateur de chargement si la réponse est rapide
      clearTimeout(loadingTimeout)
      
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

  // État de chargement
  const [isLoading, setLoading] = useState(false)

  if (!isCreating) {
    return (
      <button
        onClick={() => setIsCreating(true)}
        className="flex items-center gap-2 bg-mush-green/10 text-mush-green px-4 py-2 rounded-lg hover:bg-mush-green/20 transition-colors"
        aria-label="Créer un nouveau dossier"
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
            disabled={isLoading}
            type="button"
          >
            Annuler
          </button>
          <button
            onClick={handleCreateFolder}
            className={`px-3 py-1.5 bg-mush-green text-white rounded hover:bg-mush-green/90 flex items-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création...
              </>
            ) : (
              'Créer'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
