export interface Card {
  sequential_id: string
  title: string
  description: string
  type: string // Ajouter 'folder' comme type possible
  owner: string
  content_ids: string[] // IDs des contenus associés à cette carte
  child_ids: string[] | null // IDs des cartes enfants (pour les dossiers)
  parent_id?: string | null // ID de la carte parent (pour la navigation)
  created_at: string
  updated_at: string
}

export interface Content {
  sequential_id: string
  owner_ids: string[]
  type: "doc" | "quiz"
  description: string
  media_url: string
  points: number
  created_at: string
  updated_at: string

  // Champs spécifiques aux quiz
  question?: string
  answer_1?: string
  answer_2?: string
  answer_3?: string
  answer_4?: string
  result_1?: boolean
  result_2?: boolean
  result_3?: boolean
  result_4?: boolean
  correction_all?: string
}

export interface RelationUserContent {
  sequential_id: string
  user_id: string
  content_id: string // ID du contenu associé à la relation
  state: string
  sender_id: string
  created_at: string
  points: number
  result_1: boolean
  result_2: boolean
  result_3: boolean
  result_4: boolean
  last_view: string
}

export interface UserProfile {
  id: string
  auth_id: string
  pseu?: string
  total_points: number // Total de champignons 🍄
  communication?: boolean // Accepte de recevoir des communications
  created_at: string
  updated_at: string
}

export interface CardWithContent extends Card {
  contents?: Content[]
  children?: CardWithContent[] // Cartes enfants (pour les dossiers)
  userRelation?: RelationUserContent
  totalPoints?: number // Total des points disponibles
  earnedPoints?: number // Points gagnés par l'utilisateur
  ownerName?: string // Nom de l'owner de la carte
  ownerAvatar?: string // Avatar de l'owner de la carte
  isFolder?: boolean // Indique si la carte est un dossier
  isExpanded?: boolean // État d'expansion du dossier
}
