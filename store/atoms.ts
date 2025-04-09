import { atom } from "jotai"
import type { CardWithContent, UserProfile } from "@/types"

// Atome pour les cartes
export const cardsAtom = atom<CardWithContent[]>([])

// Atome pour l'utilisateur actuel
export const userProfileAtom = atom<UserProfile | null>(null)

// Atome pour le total de champignons
export const mushroomCountAtom = atom<number>(0)

// Atome dérivé pour les cartes filtrées (exemple)
export const filteredCardsAtom = atom((get) => get(cardsAtom))

// Atome pour l'état de chargement global
export const loadingAtom = atom<boolean>(false)

// Atome pour les messages d'erreur
export const errorAtom = atom<string | null>(null)

// Atome pour le mode d'affichage (liste ou grille)
export const viewModeAtom = atom<"list" | "grid">("list")
