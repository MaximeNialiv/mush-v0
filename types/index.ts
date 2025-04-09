export interface Card {
  sequential_id: string
  title: string
  description: string
  type: string
  owner: string
  content_ids: string[] // Renommé de child_ids à content_ids
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

export interface UserContentRelation {
  sequential_id: string
  user_id: string
  card_id: string
  state: string
  points_a: number
  result_1?: boolean
  result_2?: boolean
  result_3?: boolean
  result_4?: boolean
  created_at: string
  last_view: string
}

export interface UserProfile {
  id: string
  auth_id: string
  pseu?: string
  total_points: number // Total de champignons 🍄
  created_at: string
  updated_at: string
}

export interface CardWithContent extends Card {
  contents?: Content[]
  userRelation?: UserContentRelation
  totalPoints?: number // Total des points disponibles
  earnedPoints?: number // Points gagnés par l'utilisateur
  ownerName?: string // Nom de l'owner de la carte
}
