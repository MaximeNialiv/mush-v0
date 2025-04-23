import { atom } from "jotai"
import type { CardWithContent, UserProfile } from "@/types"

// Atome pour les cartes (toutes les cartes chargées)
export const cardsAtom = atom<CardWithContent[]>([])

// Atome pour l'utilisateur actuel
export const userProfileAtom = atom<UserProfile | null>(null)

// Atome pour le total de champignons
export const mushroomCountAtom = atom<number>(0)

// Atome pour l'état de chargement global
export const loadingAtom = atom<boolean>(false)

// Atome pour les messages d'erreur
export const errorAtom = atom<string | null>(null)

// Atome pour le mode d'affichage (liste ou grille)
export const viewModeAtom = atom<"list" | "grid">("list")

// ===== Atomes pour l'arborescence de fichiers =====

// ID de la carte racine (dossier racine)
export const rootFolderIdAtom = atom<string | null>(null)

// ID du dossier actuellement ouvert
export const currentFolderIdAtom = atom<string | null>(null)

// Chemin de navigation (fil d'Ariane)
export const breadcrumbPathAtom = atom<CardWithContent[]>([])

// Atome dérivé pour les cartes du dossier actuel
export const currentFolderCardsAtom = atom((get) => {
  const currentFolderId = get(currentFolderIdAtom)
  const allCards = get(cardsAtom)
  
  // Si aucun dossier n'est sélectionné, retourner les cartes de la racine
  if (!currentFolderId) {
    const rootId = get(rootFolderIdAtom)
    if (!rootId) return []
    
    // Trouver les cartes enfants de la racine
    return allCards.filter(card => 
      card.parent_id === rootId
    )
  }
  
  // Sinon, retourner les cartes enfants du dossier actuel
  return allCards.filter(card => 
    card.parent_id === currentFolderId
  )
})

// Historique de navigation pour le bouton retour
export const navigationHistoryAtom = atom<string[]>([])
