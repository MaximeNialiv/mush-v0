"use client"

import type { CardWithContent } from "@/types"
import { Icon } from "./ui/icon"
import { ContentItem } from "./content-item"
import { atom, useAtom } from "jotai"
import { atomFamily } from "jotai/utils"
import { useRouter } from "next/navigation"
import * as Sentry from "@sentry/nextjs"
import Link from "next/link"
import { OptimizedImage } from "./optimized-image"

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
  const router = useRouter()
  
  // Fonction pour générer les initiales du créateur
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  // Obtenir les initiales du créateur
  const ownerInitials = getInitials(card.ownerName || card.owner || 'User')

  return (
    <div className="relative mb-8 max-w-[400px] mx-auto w-full">
      {/* Effet d'ombre origami */}
      <div className="absolute inset-0 bg-black rounded-2xl transform translate-x-1 translate-y-1 -z-10"></div>

      <div className="bg-white rounded-2xl border border-black overflow-hidden transition-all hover:shadow-lg relative z-0">
        {/* En-tête de la carte */}
        <div className="p-4 flex items-center justify-between border-b-2 border-gray-200">
          <div className="flex items-center">
            {/* Photo de profil du créateur ou initiales */}
            <div className="w-10 h-10 rounded-full bg-mush-green flex items-center justify-center mr-3 text-white">
              {card.ownerAvatar ? (
                <OptimizedImage 
                  src={card.ownerAvatar} 
                  alt={card.ownerName || card.owner || ''} 
                  width={40} 
                  height={40} 
                  className="w-10 h-10 rounded-full object-cover" 
                  fallbackSrc="/placeholder-avatar.svg"
                />
              ) : (
                <span className="font-bold">{ownerInitials}</span>
              )}
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

        {/* Bouton "Ouvrir le dossier" si la carte a des child_ids */}
        {card.child_ids && card.child_ids.length > 0 && (
          <div className="p-4">
            <a 
              href={`/${card.sequential_id}`}
              onClick={(e) => {
                // Instrumentation Sentry pour le suivi de la navigation
                Sentry.addBreadcrumb({
                  category: 'navigation',
                  message: `Clic sur 'Ouvrir le dossier' pour la carte ${card.sequential_id}`,
                  level: 'info',
                  data: {
                    cardId: card.sequential_id,
                    childIds: card.child_ids,
                    url: `/${card.sequential_id}`
                  }
                });
                console.log(`Navigation vers /${card.sequential_id} via lien HTML standard`);
              }}
              className="w-full bg-mush-green hover:bg-mush-green/90 text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center hover:shadow-md transform transition-transform hover:translate-y-[-2px] no-underline"
            >
              <Icon icon="Folder" className="w-5 h-5 mr-2 text-white" />
              Ouvrir le dossier
            </a>
            
          </div>
        )}
      </div>
    </div>
  )
}
