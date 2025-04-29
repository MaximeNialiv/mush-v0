import type { Card, Content, CardWithContent } from "@/types"
import { useSupabase } from "@/context/supabase-provider"

// Exporter le hook pour être utilisé dans les composants
export { useSupabase }

// Pour les appels hors des composants React (comme les tests ou les scripts)
export const getSupabaseForNonReactContext = () => {
  // Avertissement pour éviter l'utilisation incorrecte
  console.warn(
    "getSupabaseForNonReactContext est utilisé en dehors d'un composant React. " +
    "Préférez utiliser useSupabase() dans les composants React."
  )
  
  // En environnement serveur ou pour les tests
  if (typeof window === 'undefined') {
    // Importer dynamiquement pour éviter les erreurs de référence circulaire
    const { createClient } = require("@supabase/supabase-js")
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  
  throw new Error(
    "getSupabaseForNonReactContext ne peut pas être utilisé côté client. " +
    "Utilisez useSupabase() dans un composant React."
  )
}

// Données statiques pour le développement
const mockCards: Card[] = [
  {
    sequential_id: "card_1",
    title: "Vivre sans croissance",
    description: "Dominique Méda - Limit",
    type: "doc",
    owner: "system",
    content_ids: ["content_1"],
    child_ids: ["card_6", "card_7"],  // Cette carte a des enfants
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    sequential_id: "card_2",
    title: "L'effondrement de la civilisation",
    description: "Pablo Servigne - Seuil",
    type: "doc",
    owner: "system",
    content_ids: ["content_2"],
    child_ids: ["card_8", "card_9"],  // Cette carte a des enfants
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    sequential_id: "card_3",
    title: "Écologie et économie",
    description: "Nicolas Hulot - Flammarion",
    type: "doc",
    owner: "system",
    content_ids: ["content_3"],
    child_ids: [],
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    sequential_id: "card_4",
    title: "QCM sur l'effet de serre",
    description: "Quiz - Environnement",
    type: "quiz",
    owner: "system",
    content_ids: ["content_quiz_1"],
    child_ids: [],
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    sequential_id: "card_5",
    title: "L'effet de serre",
    description: "Créé par Fabien Mush",
    type: "collection",
    owner: "system",
    content_ids: ["content_1", "content_quiz_1", "content_quiz_2"],
    child_ids: [],
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Cartes enfants de card_1
  {
    sequential_id: "card_6",
    title: "Sous-thème: Décroissance",
    description: "Concepts de décroissance",
    type: "doc",
    owner: "system",
    content_ids: ["content_3"],
    child_ids: [],
    parent_id: "card_1",  // Cette carte est enfant de card_1
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    sequential_id: "card_7",
    title: "Sous-thème: Alternatives économiques",
    description: "Modèles économiques alternatifs",
    type: "doc",
    owner: "system",
    content_ids: ["content_2"],
    child_ids: [],
    parent_id: "card_1",  // Cette carte est enfant de card_1
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Cartes enfants de card_2
  {
    sequential_id: "card_8",
    title: "Sous-thème: Collapsologie",
    description: "Principes de collapsologie",
    type: "doc",
    owner: "system",
    content_ids: ["content_1"],
    child_ids: [],
    parent_id: "card_2",  // Cette carte est enfant de card_2
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    sequential_id: "card_9",
    title: "Sous-thème: Résilience",
    description: "Stratégies de résilience",
    type: "quiz",
    owner: "system",
    content_ids: ["content_quiz_2"],
    child_ids: [],
    parent_id: "card_2",  // Cette carte est enfant de card_2
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockContents: Content[] = [
  {
    sequential_id: "content_1",
    owner_ids: ["system"],
    type: "doc",
    description: "Vivre sans croissance (Dominique Méda - Limit)",
    media_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    points: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    sequential_id: "content_2",
    owner_ids: ["system"],
    type: "doc",
    description: "Comment se préparer à l'effondrement de notre civilisation industrielle - Pablo Servigne",
    media_url: "https://www.ted.com/talks/pablo_servigne_how_to_be_a_good_ancestor",
    points: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    sequential_id: "content_3",
    owner_ids: ["system"],
    type: "doc",
    description: "Repenser notre rapport à la nature et à l'économie - Nicolas Hulot",
    media_url: "https://www.lemonde.fr",
    points: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    sequential_id: "content_quiz_1",
    owner_ids: ["system"],
    type: "quiz",
    description: "QCM sur l'effet de serre",
    media_url: "",
    points: 10,
    question: "Laquelle de ces phrases décrit le mieux l'effet de serre de l'atmosphère ?",
    answer_1:
      "Sous l'action des rayons du soleil, certains gaz présents dans l'atmosphère se désintègrent en dégageant de la chaleur.",
    answer_2:
      "Certains gaz présents dans l'atmosphère captent les rayons infrarouges émis par le Soleil et les réémettent vers le sol.",
    answer_3:
      "Certains gaz présents dans l'atmosphère captent les rayons infrarouges émis par la Terre et les réémettent vers le sol.",
    answer_4:
      "Certains gaz présents dans l'atmosphère captent les rayons infrarouges émis par le Soleil et les réémettent vers l'espace.",
    result_1: false,
    result_2: false,
    result_3: true,
    result_4: false,
    correction_all:
      "Les rayons solaires éclairent la Terre. Une partie de ces rayons est réfléchie vers l'espace, une autre est absorbée par l'atmosphère et une autre l'est par le sol. Pour évacuer l'énergie absorbée, ce dernier rayonne à son tour dans le domaine infrarouge. Sans l'effet de serre, la totalité des rayons infrarouges émis par le sol irait directement se perdre dans l'espace. Cependant, certains gaz dits « à effet de serre » ont la capacité d'absorber ces infrarouges, ce qui entraîne une augmentation de leur température. Ils émettent ensuite l'énergie ainsi emmagasinée en émettant à leur tour des rayons infrarouges dans toutes les directions, y compris vers le sol.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    sequential_id: "content_quiz_2",
    owner_ids: ["system"],
    type: "quiz",
    description: "QCM sur les énergies renouvelables",
    media_url: "https://www.youtube.com/watch?v=F-Hcu3jH8G4",
    points: 15,
    question: "Parmi ces sources d'énergie, lesquelles sont considérées comme renouvelables ?",
    answer_1: "L'énergie solaire",
    answer_2: "Le gaz naturel",
    answer_3: "L'énergie éolienne",
    answer_4: "Le charbon",
    result_1: true,
    result_2: false,
    result_3: true,
    result_4: false,
    correction_all:
      "Les énergies renouvelables sont des sources d'énergie dont le renouvellement naturel est assez rapide pour qu'elles puissent être considérées comme inépuisables à l'échelle du temps humain. L'énergie solaire et l'énergie éolienne sont renouvelables car elles proviennent respectivement du soleil et du vent, des ressources naturelles inépuisables. En revanche, le gaz naturel et le charbon sont des énergies fossiles, issues de la décomposition de matières organiques enfouies dans le sol pendant des millions d'années, et sont donc non-renouvelables à l'échelle humaine.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mettre à jour la fonction fetchCards pour calculer les points totaux et gagnés
export async function fetchCards(supabase: any, folderId?: string | null) {
  try {
    // Forcer l'utilisation des données Supabase, ne plus utiliser les données statiques
    console.log("Utilisation des données Supabase")

    // Si les tables existent, récupérer les données depuis Supabase
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user?.id
    
    // Construire la requête de base
    let cardsQuery = supabase.from("cards").select("*")
    
    // Si un ID de dossier est spécifié, filtrer par parent_id
    if (folderId) {
      cardsQuery = cardsQuery.eq("parent_id", folderId)
    } else {
      // Si nous sommes à la racine, récupérer les cartes avec parent_id NULL et "ROOT"
      // D'abord récupérer les cartes avec parent_id NULL
      const { data: nullParentCards, error: nullError } = await supabase
        .from("cards")
        .select("*")
        .is("parent_id", null)
        .order("created_at", { ascending: false })
      
      if (nullError) throw nullError
      
      // Ensuite récupérer les cartes avec parent_id "ROOT"
      const { data: rootParentCards, error: rootError } = await supabase
        .from("cards")
        .select("*")
        .eq("parent_id", "ROOT")
        .order("created_at", { ascending: false })
      
      if (rootError) throw rootError
      
      // Combiner les deux ensembles de résultats
      const combinedCards = [...(nullParentCards || []), ...(rootParentCards || [])]
      
      // Si aucune carte n'est trouvée, retourner un tableau vide
      if (combinedCards.length === 0) return []
      
      // Continuer avec le traitement des cartes combinées
      const contentIds = combinedCards.flatMap((card: Card) => card.content_ids || [])
      
      const { data: contents, error: contentsError } = await supabase
        .from("content")
        .select("*")
        .in("sequential_id", contentIds)
      
      if (contentsError) throw contentsError
      
      // Associer les contenus à chaque carte
      const cardsWithContent = combinedCards.map((card: Card) => {
        const cardContents = (card.content_ids || [])
          .map(id => contents?.find((content: Content) => content.sequential_id === id))
          .filter(Boolean) as Content[]
        
        // Calculer les points totaux disponibles
        const totalPoints = cardContents.reduce((sum, content: Content) => sum + (content.points || 0), 0)
        
        // Déterminer les points gagnés par l'utilisateur pour cette carte
        let earnedPoints = 0
        if (userId && userRelations.length > 0) {
          earnedPoints = cardContents.reduce((sum, content: Content) => {
            const relation = userRelations.find(rel => rel.content_id === content.sequential_id)
            return sum + (relation?.points || 0)
          }, 0)
        }
        
        // Déterminer si c'est un dossier
        const isFolder = card.type === 'folder'
        
        return {
          ...card,
          contents: cardContents,
          totalPoints,
          earnedPoints,
          isFolder,
          isExpanded: false,
        }
      })
      
      return cardsWithContent
    }
    
    // Cette partie n'est exécutée que si folderId est défini
    // Ordonner les résultats
    cardsQuery = cardsQuery.order("created_at", { ascending: false })
    
    // Exécuter la requête
    const { data: cards, error: cardsError } = await cardsQuery

    if (cardsError) throw cardsError

    if (!cards || cards.length === 0) return []

    // Récupérer les contenus associés à chaque carte
    const contentIds = cards.flatMap((card: Card) => card.content_ids || [])

    const { data: contents, error: contentsError } = await supabase
      .from("content")
      .select("*")
      .in("sequential_id", contentIds)

    if (contentsError) throw contentsError

    // Récupérer les relations utilisateur-contenu si l'utilisateur est connecté
    let userRelations: any[] = []
    if (userId) {
      const { data: relations, error: relationsError } = await supabase
        .from("relation_user_content")
        .select("*")
        .eq("user_id", userId)

      if (!relationsError && relations) {
        userRelations = relations
      }
    }

    // Récupérer les informations sur les propriétaires
    const ownerIds = [...new Set(cards.map((card: Card) => card.owner).filter(Boolean))]
    let ownerNames: Record<string, string> = {}

    if (ownerIds.length > 0) {
      try {
        // Récupérer les profils un par un pour éviter les erreurs 400
        for (const ownerId of ownerIds) {
          if (!ownerId) continue
          
          const { data: owner, error } = await supabase
            .from("user_profile")
            .select("auth_id, pseu")
            .eq("auth_id", ownerId)
            .single()

          if (!error && owner) {
            ownerNames[owner.auth_id] = owner.pseu || "Utilisateur"
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des noms d'utilisateurs:", error)
        // En cas d'erreur, continuer avec un objet vide
      }
    }

    // Associer les contenus et les relations à chaque carte
    const cardsWithContent = cards.map((card: Card) => {
      // Utiliser uniquement content_ids (child_ids contient maintenant les IDs des cartes enfants)
      const cardContentIds = card.content_ids || []

      const cardContents = cardContentIds
        .map((id: string) => contents?.find((content: Content) => content.sequential_id === id))
        .filter(Boolean) as Content[]

      // Calculer le total des points disponibles
      const totalPoints = cardContents.reduce((sum, content) => sum + (content.points || 0), 0)

      // Calculer les points gagnés par l'utilisateur
      let earnedPoints = 0

      if (userId) {
        earnedPoints = cardContents.reduce((sum, content) => {
          const relation = userRelations.find(
            (r: any) => r.card_id === card.sequential_id && cardContentIds.includes(content.sequential_id),
          )
          return sum + (relation?.points || 0)
        }, 0)
      }
      
      // Déterminer si c'est un dossier
      const isFolder = card.type === 'folder'

      return {
        ...card,
        contents: cardContents,
        totalPoints,
        earnedPoints,
        ownerName: card.owner ? (ownerNames[card.owner] || card.owner) : 'Système',
        isFolder,
        isExpanded: false,
      }
    })

    return cardsWithContent
  } catch (error) {
    console.error("Erreur lors de la récupération des cartes:", error)

    // En cas d'erreur, utiliser les données statiques avec les mêmes calculs
    const cardsWithContent = mockCards.map((card) => {
      const contents = card.content_ids
        .map((id: string) => mockContents.find((content) => content.sequential_id === id))
        .filter(Boolean) as Content[]

      const totalPoints = contents.reduce((sum, content) => sum + (content.points || 0), 0)

      return {
        ...card,
        contents,
        totalPoints,
        earnedPoints: 0,
        ownerName: "Fabien Mush",
      }
    })

    return cardsWithContent
  }
}

export async function testConnection() {
  const supabase = useSupabase()

  try {
    const { data, error } = await supabase.from("cards").select("*").limit(1)
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true, data }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
