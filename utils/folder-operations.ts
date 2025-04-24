"use client"

import { SupabaseClient } from '@supabase/supabase-js'
import { CardWithContent } from '@/types'

/**
 * Déplace une carte vers un nouveau dossier parent en mettant à jour à la fois parent_id et child_ids
 * Utilise la fonction SQL move_card_to_folder pour maintenir la cohérence des données
 */
export async function moveCardToFolder(
  supabase: SupabaseClient,
  cardId: string,
  newParentId: string | null,
  oldParentId: string | null
): Promise<{ success: boolean; error?: any }> {
  try {
    // Utiliser la fonction SQL pour déplacer la carte
    const { data, error } = await supabase.rpc('move_card_to_folder', {
      card_id: cardId,
      new_parent_id: newParentId,
      old_parent_id: oldParentId
    })

    if (error) {
      console.error('Erreur lors du déplacement de la carte:', error)
      return { success: false, error }
    }

    // Invalider les caches pour forcer le rechargement des données
    if (typeof window !== 'undefined') {
      // Supprimer les caches des dossiers concernés
      if (oldParentId) {
        sessionStorage.removeItem(`folder_${oldParentId}_last_load`)
        sessionStorage.removeItem(`breadcrumb_${oldParentId}`)
      }
      if (newParentId) {
        sessionStorage.removeItem(`folder_${newParentId}_last_load`)
        sessionStorage.removeItem(`breadcrumb_${newParentId}`)
      }
      // Supprimer le cache des dossiers disponibles
      sessionStorage.removeItem('all_folders_cache')
    }

    return { success: true }
  } catch (error) {
    console.error('Erreur lors du déplacement de la carte:', error)
    return { success: false, error }
  }
}

/**
 * Récupère tous les dossiers disponibles pour le déplacement
 */
export async function fetchAvailableFolders(
  supabase: SupabaseClient,
  excludeCardId?: string
): Promise<CardWithContent[]> {
  try {
    const { data, error } = await supabase
      .from("cards")
      .select("sequential_id, title, type, child_ids, parent_id, description, owner, content_ids, created_at, updated_at")
      .eq("type", "folder")
      .order("title", { ascending: true })

    if (error) throw error

    // Filtrer le dossier actuel si nécessaire
    const folders = excludeCardId 
      ? (data as CardWithContent[]).filter(folder => folder.sequential_id !== excludeCardId)
      : (data as CardWithContent[])

    return folders
  } catch (error) {
    console.error('Erreur lors de la récupération des dossiers:', error)
    return []
  }
}

/**
 * Vérifie si le déplacement créerait un cycle dans l'arborescence
 */
export function wouldCreateCycle(
  folders: CardWithContent[],
  cardId: string,
  targetFolderId: string
): boolean {
  // Si on essaie de déplacer un dossier dans lui-même, c'est un cycle
  if (cardId === targetFolderId) return true

  // Fonction récursive pour vérifier si targetFolderId est un descendant de cardId
  function isDescendant(parentId: string, potentialDescendantId: string): boolean {
    // Trouver le parent dans la liste des dossiers
    const parent = folders.find(f => f.sequential_id === parentId)
    if (!parent || !parent.child_ids) return false

    // Vérifier si le potentiel descendant est un enfant direct
    if (parent.child_ids.includes(potentialDescendantId)) return true

    // Vérifier récursivement pour chaque enfant qui est un dossier
    for (const childId of parent.child_ids) {
      const child = folders.find(f => f.sequential_id === childId)
      if (child && child.type === 'folder') {
        if (isDescendant(childId, potentialDescendantId)) return true
      }
    }

    return false
  }

  // Vérifier si le dossier cible est un descendant de la carte à déplacer
  return isDescendant(cardId, targetFolderId)
}

/**
 * Récupère le chemin complet d'un dossier (fil d'Ariane)
 */
export async function fetchFolderPath(
  supabase: SupabaseClient,
  folderId: string | null
): Promise<CardWithContent[]> {
  if (!folderId) return []

  try {
    const path: CardWithContent[] = []
    let currentId: string | null = folderId

    // Remonter l'arborescence jusqu'à la racine
    while (currentId) {
      const { data, error } = await supabase
        .from("cards")
        .select("*") // Sélectionner tous les champs pour s'assurer d'avoir une CardWithContent complète
        .eq("sequential_id", currentId)
        .single()

      if (error) {
        console.error('Erreur lors de la récupération du dossier:', error)
        break
      }

      const folderData = data as CardWithContent
      
      // Ajouter le dossier au début du chemin
      path.unshift(folderData)

      // Passer au parent (s'assurer qu'il n'est pas undefined)
      currentId = folderData.parent_id || null
    }

    return path
  } catch (error) {
    console.error('Erreur lors de la récupération du chemin du dossier:', error)
    return []
  }
}
