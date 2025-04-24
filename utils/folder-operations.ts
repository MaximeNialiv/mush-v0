"use client"

import { SupabaseClient } from '@supabase/supabase-js'
import { CardWithContent } from '@/types'

/**
 * Déplace une carte vers un nouveau dossier parent en mettant à jour à la fois parent_id et child_ids
 */
export async function moveCardToFolder(
  supabase: SupabaseClient,
  cardId: string,
  newParentId: string | null,
  oldParentId: string | null
): Promise<{ success: boolean; error?: any }> {
  try {
    // Vérifier si la fonction SQL existe
    const { data: functionExists, error: checkError } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'move_card_to_folder')
      .maybeSingle()

    // Si la fonction SQL existe, l'utiliser
    if (functionExists && !checkError) {
      const { error } = await supabase.rpc('move_card_to_folder', {
        card_id: cardId,
        new_parent_id: newParentId,
        old_parent_id: oldParentId
      })

      if (error) {
        console.error('Erreur lors de l\'appel de la fonction SQL:', error)
        // Continuer avec l'implémentation manuelle en cas d'erreur
      } else {
        // Fonction SQL exécutée avec succès
        // Invalider les caches
        invalidateCaches(oldParentId, newParentId)
        return { success: true }
      }
    }

    // Implémentation manuelle (fallback)
    console.log('Utilisation de l\'implémentation manuelle pour déplacer la carte')

    // 1. Mettre à jour le parent_id de la carte
    const { error: updateCardError } = await supabase
      .from('cards')
      .update({ 
        parent_id: newParentId,
        updated_at: new Date().toISOString()
      })
      .eq('sequential_id', cardId)

    if (updateCardError) throw updateCardError

    // 2. Si l'ancien parent existe, retirer cardId de ses child_ids
    if (oldParentId) {
      // D'abord, récupérer l'ancien parent
      const { data: oldParent, error: oldParentError } = await supabase
        .from('cards')
        .select('child_ids')
        .eq('sequential_id', oldParentId)
        .single()

      if (oldParentError) throw oldParentError

      // Filtrer le cardId des child_ids
      let oldChildIds = oldParent.child_ids || []
      oldChildIds = oldChildIds.filter((id: string) => id !== cardId)

      // Mettre à jour l'ancien parent
      const { error: updateOldParentError } = await supabase
        .from('cards')
        .update({ 
          child_ids: oldChildIds,
          updated_at: new Date().toISOString()
        })
        .eq('sequential_id', oldParentId)

      if (updateOldParentError) throw updateOldParentError
    }

    // 3. Si le nouveau parent existe, ajouter cardId à ses child_ids
    if (newParentId) {
      // D'abord, récupérer le nouveau parent
      const { data: newParent, error: newParentError } = await supabase
        .from('cards')
        .select('child_ids')
        .eq('sequential_id', newParentId)
        .single()

      if (newParentError) throw newParentError

      // Ajouter le cardId aux child_ids s'il n'y est pas déjà
      let newChildIds = newParent.child_ids || []
      if (!newChildIds.includes(cardId)) {
        newChildIds.push(cardId)
      }

      // Mettre à jour le nouveau parent
      const { error: updateNewParentError } = await supabase
        .from('cards')
        .update({ 
          child_ids: newChildIds,
          updated_at: new Date().toISOString()
        })
        .eq('sequential_id', newParentId)

      if (updateNewParentError) throw updateNewParentError
    }

    // Invalider les caches
    invalidateCaches(oldParentId, newParentId)

    return { success: true }
  } catch (error) {
    console.error('Erreur lors du déplacement de la carte:', error)
    return { success: false, error }
  }
}

/**
 * Invalide les caches après un déplacement de carte
 */
function invalidateCaches(oldParentId: string | null, newParentId: string | null): void {
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
