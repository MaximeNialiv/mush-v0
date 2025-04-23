"use client"

import { useEffect, useCallback } from "react"
import { useAtom } from "jotai"
import { usePathname, useRouter } from "next/navigation"
import { 
  cardsAtom, 
  loadingAtom, 
  errorAtom, 
  rootFolderIdAtom,
  currentFolderIdAtom,
  breadcrumbPathAtom,
  navigationHistoryAtom
} from "@/store/atoms"
import { useSupabase, fetchCards } from "@/utils/supabase/client"
import { CardWithContent } from "@/types"

// Fonction pour extraire l'ID du dossier à partir de l'URL
const extractFolderIdFromPath = (path: string): string | null => {
  // Format attendu: /folders/{folderId}
  const match = path.match(/\/folders\/([^\/]+)/)
  return match ? match[1] : null
}

// Fonction pour construire le chemin URL à partir d'un ID de dossier
const buildFolderPath = (folderId: string | null): string => {
  return folderId ? `/folders/${folderId}` : "/"
}

export function useFolderNavigation() {
  const supabase = useSupabase()
  const [cards, setCards] = useAtom(cardsAtom)
  const [loading, setLoading] = useAtom(loadingAtom)
  const [error, setError] = useAtom(errorAtom)
  const [rootFolderId, setRootFolderId] = useAtom(rootFolderIdAtom)
  const [currentFolderId, setCurrentFolderId] = useAtom(currentFolderIdAtom)
  const [breadcrumbPath, setBreadcrumbPath] = useAtom(breadcrumbPathAtom)
  const [navigationHistory, setNavigationHistory] = useAtom(navigationHistoryAtom)
  
  const pathname = usePathname()
  const router = useRouter()

  // Charger les cartes d'un dossier spécifique
  const loadFolderCards = useCallback(async (folderId: string | null) => {
    try {
      setLoading(true)
      setError(null)
      
      // Récupérer les cartes du dossier
      const folderCards = await fetchCards(supabase, folderId)
      
      // Mettre à jour l'état global avec les nouvelles cartes
      // Note: Nous ne remplaçons pas toutes les cartes, juste celles du dossier actuel
      setCards(prevCards => {
        // Filtrer les cartes qui ne sont pas dans ce dossier
        const otherCards = prevCards.filter(card => card.parent_id !== folderId)
        // Ajouter les nouvelles cartes
        return [...otherCards, ...folderCards]
      })
      
      // Mettre à jour l'ID du dossier actuel
      setCurrentFolderId(folderId)
      
      // Mettre à jour l'historique de navigation
      if (folderId && !navigationHistory.includes(folderId)) {
        setNavigationHistory(prev => [...prev, folderId])
      }
      
      // Mettre à jour le fil d'Ariane
      updateBreadcrumb(folderId)
      
    } catch (err) {
      console.error("Erreur lors du chargement des cartes du dossier:", err)
      setError("Impossible de charger les cartes du dossier")
    } finally {
      setLoading(false)
    }
  }, [supabase, setCards, setCurrentFolderId, setError, setLoading, navigationHistory, setNavigationHistory])

  // Mettre à jour le fil d'Ariane
  const updateBreadcrumb = useCallback(async (folderId: string | null) => {
    if (!folderId) {
      // Si on est à la racine, le fil d'Ariane est vide
      setBreadcrumbPath([])
      return
    }
    
    try {
      const path: CardWithContent[] = []
      let currentId: string | null = folderId
      
      // Remonter l'arborescence jusqu'à la racine
      while (currentId) {
        // Chercher d'abord dans les cartes déjà chargées
        let currentFolder = cards.find(card => card.sequential_id === currentId)
        
        // Si la carte n'est pas déjà chargée, la récupérer depuis Supabase
        if (!currentFolder) {
          const { data, error } = await supabase
            .from("cards")
            .select("*")
            .eq("sequential_id", currentId)
            .single()
            
          if (error) {
            console.error("Erreur lors de la récupération du dossier parent:", error)
            break
          }
          
          currentFolder = data as CardWithContent
        }
        
        // Ajouter le dossier au début du chemin
        path.unshift(currentFolder)
        
        // Passer au parent
        currentId = currentFolder.parent_id || null
      }
      
      setBreadcrumbPath(path)
    } catch (err) {
      console.error("Erreur lors de la mise à jour du fil d'Ariane:", err)
    }
  }, [supabase, cards, setBreadcrumbPath])

  // Naviguer vers un dossier
  const navigateToFolder = useCallback((folderId: string | null) => {
    const path = buildFolderPath(folderId)
    router.push(path)
  }, [router])

  // Naviguer vers le dossier parent
  const navigateToParent = useCallback(() => {
    if (!currentFolderId) return
    
    // Trouver le dossier actuel
    const currentFolder = cards.find(card => card.sequential_id === currentFolderId)
    if (!currentFolder) return
    
    // Naviguer vers le parent
    navigateToFolder(currentFolder.parent_id || null)
  }, [currentFolderId, cards, navigateToFolder])

  // Initialisation: détecter le dossier racine
  useEffect(() => {
    const initRootFolder = async () => {
      try {
        // Chercher le dossier racine
        const { data, error } = await supabase
          .from("cards")
          .select("*")
          .eq("type", "folder")
          .is("parent_id", null)
          .limit(1)
          
        if (error) throw error
        
        if (data && data.length > 0) {
          // Dossier racine trouvé
          setRootFolderId(data[0].sequential_id)
        } else {
          // Créer un dossier racine s'il n'existe pas
          const rootFolder = {
            title: "Racine",
            description: "Dossier racine",
            type: "folder",
            owner: "system",
            content_ids: [],
            child_ids: [],
            parent_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          const { data: newRoot, error: createError } = await supabase
            .from("cards")
            .insert(rootFolder)
            .select()
            
          if (createError) throw createError
          
          if (newRoot && newRoot.length > 0) {
            setRootFolderId(newRoot[0].sequential_id)
          }
        }
      } catch (err) {
        console.error("Erreur lors de l'initialisation du dossier racine:", err)
      }
    }
    
    if (!rootFolderId) {
      initRootFolder()
    }
  }, [supabase, rootFolderId, setRootFolderId])

  // Synchroniser l'URL avec l'état de navigation
  useEffect(() => {
    const folderId = extractFolderIdFromPath(pathname)
    
    // Si l'ID du dossier dans l'URL est différent de l'état actuel
    if (folderId !== currentFolderId) {
      loadFolderCards(folderId)
    }
  }, [pathname, currentFolderId, loadFolderCards])

  return {
    cards,
    loading,
    error,
    currentFolderId,
    rootFolderId,
    breadcrumbPath,
    navigateToFolder,
    navigateToParent,
    loadFolderCards
  }
}
