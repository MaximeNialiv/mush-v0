import { createClient } from "@supabase/supabase-js"
import type { Card, Content, CardWithContent } from "@/types"

// Clé globale pour identifier notre instance unique de Supabase
const SUPABASE_CLIENT_KEY = 'MUSH_SUPABASE_CLIENT'

// Créer une instance unique de Supabase pour éviter les problèmes de connexion multiples
let supabaseInstance: any = null

// Fonction pour créer un client avec une configuration standardisée
function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false, // Désactiver la détection automatique pour éviter les instances multiples
        storageKey: SUPABASE_CLIENT_KEY, // Utiliser une clé unique pour éviter les conflits
        storage: {
          getItem: (key) => {
            try { return localStorage.getItem(key) } catch (e) { return null }
          },
          setItem: (key, value) => {
            try { localStorage.setItem(key, value) } catch (e) {}
          },
          removeItem: (key) => {
            try { localStorage.removeItem(key) } catch (e) {}
          }
        }
      }
    }
  )
}

// Fonction pour obtenir l'instance unique de Supabase
export const supabase = (() => {
  // Côté serveur - créer une nouvelle instance à chaque fois
  if (typeof window === 'undefined') {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  
  // Côté client - utiliser un singleton
  if (supabaseInstance) return supabaseInstance
  
  // Nettoyer toute instance existante avant de créer une nouvelle
  try {
    // Supprimer les données de session existantes pour éviter les conflits
    localStorage.removeItem(`${SUPABASE_CLIENT_KEY}-auth-token`)
  } catch (e) {
    console.warn("Impossible de nettoyer les données de session existantes", e)
  }
  
  // Créer une nouvelle instance
  supabaseInstance = createSupabaseClient()
  
  return supabaseInstance
})()

// Données statiques pour le développement
const mockCards: Card[] = [
  {
    sequential_id: "card_1",
    title: "Vivre sans croissance",
    description: "Dominique Méda - Limit",
    type: "doc",
    owner: "system",
    content_ids: ["content_1"],
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
export async function fetchCards(): Promise<CardWithContent[]> {
  try {
    // Vérifier si les tables existent
    const { error } = await supabase.from("cards").select("count")

    // Si les tables n'existent pas, utiliser les données statiques
    if (error && error.message.includes("does not exist")) {
      console.log("Utilisation des données statiques car les tables n'existent pas encore")

      // Associer les contenus à chaque carte et calculer les totaux de points
      const cardsWithContent = mockCards.map((card) => {
        const contents = card.content_ids
          .map((id) => mockContents.find((content) => content.sequential_id === id))
          .filter(Boolean) as Content[]

        // Calculer le total des points disponibles
        const totalPoints = contents.reduce((sum, content) => sum + (content.points || 0), 0)

        return {
          ...card,
          contents,
          totalPoints,
          earnedPoints: 0, // Par défaut 0 pour les données statiques
          ownerName: "Fabien Mush", // Nom par défaut pour les données statiques
        }
      })

      return cardsWithContent
    }

    // Si les tables existent, récupérer les données depuis Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const userId = user?.id

    const { data: cards, error: cardsError } = await supabase
      .from("cards")
      .select("*")
      .order("created_at", { ascending: false })

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
      // Utiliser uniquement content_ids (child_ids a été renommé en content_ids)
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

      return {
        ...card,
        contents: cardContents,
        totalPoints,
        earnedPoints,
        ownerName: card.owner ? (ownerNames[card.owner] || card.owner) : 'Système',
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
