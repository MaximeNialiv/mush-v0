"use client"

import { useState } from "react"
import type { Content } from "@/types"
import { MoreVertical, HelpCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { OpenGraphPreview } from "./open-graph-preview"
import { Quiz } from "./quiz"
import { atom, useAtom } from "jotai"
import { atomFamily } from "jotai/utils"
import { mushroomCountAtom } from "@/store/atoms"

// Créer une famille d'atomes pour l'état du quiz de chaque contenu
const quizVisibleAtomFamily = atomFamily(
  (contentId: string) => atom(false),
  (a, b) => a === b,
)

interface ContentItemProps {
  content: Content
  cardId: string
}

export function ContentItem({ content, cardId }: ContentItemProps) {
  const quizVisibleAtom = quizVisibleAtomFamily(content.sequential_id)
  const [showQuiz, setShowQuiz] = useAtom(quizVisibleAtom)
  const [mushPoints, setMushPoints] = useState(0)
  const [, setMushroomCount] = useAtom(mushroomCountAtom)

  // Gérer la complétion du quiz
  const handleQuizComplete = (points: number) => {
    setMushPoints(points)
    // Mettre à jour le compteur global de champignons
    setMushroomCount((prev) => prev + points)
  }

  return (
    <div className="w-full relative">
      {/* En-tête du contenu */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-gray-800">{content.description}</h4>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded-full hover:bg-gray-100">
              <MoreVertical className="w-4 h-4 text-gray-700" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 border-2 border-gray-200">
            <DropdownMenuItem>Partager</DropdownMenuItem>
            <DropdownMenuItem>Sauvegarder</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Signaler</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Contenu principal */}
      <div className="px-4 pb-4">
        {/* Afficher le média si disponible */}
        {content.media_url && <OpenGraphPreview url={content.media_url} showLinkInImage={true} />}

        {/* Afficher le quiz si disponible */}
        {content.question && !showQuiz && (
          <button
            className="mt-3 w-full bg-mush-green hover:bg-mush-green/90 text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center hover:shadow-md transform transition-transform hover:translate-y-[-2px]"
            onClick={() => setShowQuiz(true)}
          >
            <HelpCircle className="w-5 h-5 mr-2 text-white" />
            Répondre au quiz
          </button>
        )}

        {/* Afficher le quiz si demandé */}
        {content.question && showQuiz && (
          <div className="mt-3">
            <Quiz
              content={content}
              cardId={cardId}
              onComplete={handleQuizComplete}
              onClose={() => setShowQuiz(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
