"use client"

import type { CardWithContent } from "@/types"
import { FileText } from "lucide-react"
import { ContentItem } from "./content-item"
import { atom, useAtom } from "jotai"
import { atomFamily } from "jotai/utils"

// Créer une famille d'atomes pour l'état d'expansion de chaque carte
const expandedAtomFamily = atomFamily(
  (cardId: string) => atom(true),
  (a, b) => a === b,
)

interface CardItemProps {
  card: CardWithContent
}

export function CardItem({ card }: CardItemProps) {
  // Utilisation de l'atom pour l'état d'expansion (actuellement toujours true)
  const expandedAtom = expandedAtomFamily(card.sequential_id)
  const [isExpanded, setIsExpanded] = useAtom(expandedAtom)
  
  // S'assurer que les propriétés numériques existent pour éviter d'afficher des 0 orphelins
  const earnedPoints = card.earnedPoints && card.earnedPoints > 0 ? card.earnedPoints : null
  const totalPoints = card.totalPoints && card.totalPoints > 0 ? card.totalPoints : null

  return (
    <div className="relative mb-8 max-w-[400px] mx-auto w-full">
      {/* Effet d'ombre origami */}
      <div className="absolute inset-0 bg-black rounded-2xl transform translate-x-1 translate-y-1 -z-10"></div>

      <div className="bg-white rounded-2xl border border-black overflow-hidden transition-all hover:shadow-lg relative z-0">
        {/* En-tête de la carte */}
        <div className="p-4 flex items-center justify-between border-b-2 border-gray-200">
          <div className="flex items-center">
            {/* Icône de type de contenu au lieu de l'avatar */}
            <div className="w-10 h-10 rounded-full bg-mush-green flex items-center justify-center mr-3 text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{card.title}</h3>
              <p className="text-sm text-gray-600">{card.description}</p>
            </div>
          </div>
        </div>

        {/* Contenu de la carte */}
        {card.contents && card.contents.length > 0 && (
          <div className="divide-y-2 divide-dashed divide-gray-200">
            {card.contents.map((content) => (
              <ContentItem key={content.sequential_id} content={content} cardId={card.sequential_id} />
            ))}
          </div>
        )}

        {/* Suppression de l'affichage des points totaux gagnés en bas de la carte */}

        {/* Pied de page de la carte */}
        <div className="border-t-2 border-gray-200"></div>
        <div className="p-4 bg-gray-50 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-gray-700">Créé par</span>
              <a href="#" className="ml-1 text-mush-green font-bold hover:underline">
                {card.ownerName || card.owner}
              </a>
            </div>
            {/* Suppression de l'affichage des points dans le footer de la carte */}
          </div>
        </div>
      </div>
    </div>
  )
}
