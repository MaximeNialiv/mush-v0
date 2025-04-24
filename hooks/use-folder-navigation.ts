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
  
  // Déclaration préalable pour éviter les problèmes de référence circulaire
  let updateBreadcrumbFn: (folderId: string | null) => Promise<void>

  // Mettre à jour le fil d'Ariane
  const updateBreadcrumb = useCallback(async (folderId: string | null) => {
    if (!folderId) {
      // Si on est à la racine, le fil d'Ariane est vide
      setBreadcrumbPath([])
      return
    }
    
    try {
      // Vérifier si le fil d'Ariane actuel est déjà correct
      if (breadcrumbPath.length > 0 && breadcrumbPath[breadcrumbPath.length - 1].sequential_id === folderId) {
        // Le fil d'Ariane est déjà à jour, pas besoin de le recalculer
        return
      }
      
      // Vérifier si nous avons un fil d'Ariane en cache pour ce dossier
      const cachedBreadcrumb = sessionStorage.getItem(`breadcrumb_${folderId}`)
      if (cachedBreadcrumb) {
        try {
          const parsedBreadcrumb = JSON.parse(cachedBreadcrumb)
          // Vérifier si le cache est encore valide (moins de 10 minutes)
          if (parsedBreadcrumb.timestamp && Date.now() - parsedBreadcrumb.timestamp < 10 * 60 * 1000) {
            setBreadcrumbPath(parsedBreadcrumb.path)
            return
          }
        } catch (e) {
          // Ignorer les erreurs de parsing, on recalculera le fil d'Ariane
          console.warn("Erreur lors du parsing du fil d'Ariane en cache", e)
        }
      }
      
      const path: CardWithContent[] = []
      let currentId: string | null = folderId
      
      // Créer un Map des cartes pour une recherche plus efficace
      const cardsMap = new Map(cards.map(card => [card.sequential_id, card]))
      
      // Remonter l'arborescence jusqu'à la racine
      while (currentId) {
        // Chercher d'abord dans les cartes déjà chargées avec le Map pour plus d'efficacité
        let currentFolder = cardsMap.get(currentId)
        
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
      
      // Mettre à jour le fil d'Ariane
      setBreadcrumbPath(path)
      
      // Mettre en cache le fil d'Ariane
      sessionStorage.setItem(`breadcrumb_${folderId}`, JSON.stringify({
        path,
        timestamp: Date.now()
      }))
    } catch (err) {
      console.error("Erreur lors de la mise à jour du fil d'Ariane:", err)
    }
  }, [supabase, cards, setBreadcrumbPath, breadcrumbPath])
  
  // Assigner la fonction à la variable déclarée précédemment
  updateBreadcrumbFn = updateBreadcrumb
  
  // Fonction interne pour récupérer les cartes d'un dossier
  const fetchCardsFromFolder = async (folderId: string | null) => {
    if (folderId === null) {
      // Si nous sommes à la racine, récupérer toutes les cartes sans parent_id
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .is("parent_id", null)
      
      if (error) throw error
      return data as CardWithContent[]
    } else {
      // Sinon, utiliser la fonction fetchCards existante
      return await fetchCards(supabase, folderId)
    }
  }
  
  // Charger les cartes d'un dossier spécifique
  const loadFolderCards = useCallback(async (folderId: string | null) => {
    try {
      // Vérifier si nous avons déjà les cartes de ce dossier en cache
      const folderCardsInCache = cards.filter(card => card.parent_id === folderId)
      const hasCachedCards = folderCardsInCache.length > 0
      
      // Si nous avons déjà des cartes en cache pour ce dossier et que ce n'est pas un rechargement forcé,
      // mettre simplement à jour l'ID du dossier actuel et le fil d'Ariane
      if (hasCachedCards && currentFolderId !== folderId) {
        setCurrentFolderId(folderId)
        updateBreadcrumbFn(folderId)
        
        // Mettre à jour l'historique de navigation
        if (folderId && !navigationHistory.includes(folderId)) {
          setNavigationHistory(prev => [...prev, folderId])
        }
        
        return
      }
      
      // Vérifier si le dossier a été chargé récemment (dans les 5 dernières minutes)
      const lastLoadTime = sessionStorage.getItem(`folder_${folderId}_last_load`)
      const now = Date.now()
      const fiveMinutesAgo = now - 5 * 60 * 1000
      
      if (lastLoadTime && parseInt(lastLoadTime) > fiveMinutesAgo && hasCachedCards) {
        // Les données sont récentes, pas besoin de recharger
        setCurrentFolderId(folderId)
        updateBreadcrumbFn(folderId)
        return
      }
      
      // Sinon, charger les cartes depuis Supabase
      setLoading(true)
      setError(null)
      
      // Récupérer les cartes du dossier avec la nouvelle fonction
      const folderCards = await fetchCardsFromFolder(folderId)
      
      // Enregistrer l'heure de chargement dans sessionStorage
      sessionStorage.setItem(`folder_${folderId}_last_load`, now.toString())
      
      // Mettre à jour l'état global avec les nouvelles cartes de manière optimisée
      setCards(prevCards => {
        // Utiliser un Map pour une recherche plus efficace
        const cardMap = new Map(prevCards.map(card => [card.sequential_id, card]))
        
        // Mettre à jour ou ajouter les nouvelles cartes
        folderCards.forEach((card: CardWithContent) => {
          cardMap.set(card.sequential_id, card)
        })
        
        // Convertir le Map en tableau
        return Array.from(cardMap.values())
      })
      
      // Mettre à jour l'ID du dossier actuel
      setCurrentFolderId(folderId)
      
      // Mettre à jour l'historique de navigation
      if (folderId && !navigationHistory.includes(folderId)) {
        setNavigationHistory(prev => [...prev, folderId])
      }
      
      // Mettre à jour le fil d'Ariane
      updateBreadcrumbFn(folderId)
      
    } catch (err) {
      console.error("Erreur lors du chargement des cartes du dossier:", err)
      setError("Impossible de charger les cartes du dossier")
    } finally {
      setLoading(false)
    }
  }, [cards, supabase, setCards, setCurrentFolderId, setError, setLoading, navigationHistory, setNavigationHistory, currentFolderId])



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

  // Synchroniser l'URL avec l'état de navigation avec debounce
  useEffect(() => {
    const folderId = extractFolderIdFromPath(pathname)
    
    // Si l'ID du dossier dans l'URL est différent de l'état actuel
    if (folderId !== currentFolderId) {
      // Utiliser un délai plus long pour éviter les rechargements trop fréquents lors de la navigation rapide
      const timer = setTimeout(() => {
        loadFolderCards(folderId)
      }, 150) // Augmenté à 150ms pour réduire les rechargements inutiles
      
      return () => clearTimeout(timer)
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
