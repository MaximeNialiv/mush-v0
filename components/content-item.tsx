"use client"

import { useState, useEffect } from "react"
import type { Content } from "@/types"
import { MoreVertical, HelpCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { OpenGraphPreview } from "./open-graph-preview"
import { Quiz } from "./quiz"
import { atom, useAtom } from "jotai"
import { atomFamily } from "jotai/utils"
import { mushroomCountAtom, cardsAtom } from "@/store/atoms"
import { supabase } from "@/utils/supabase/client"

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
  const [cards, setCards] = useAtom(cardsAtom)
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false)
  
  // Vérifier si l'utilisateur a déjà complété ce quiz
  useEffect(() => {
    const checkQuizCompletion = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data } = await supabase
            .from("relation_user_content")
            .select("points")
            .eq("user_id", user.id)
            .eq("card_id", cardId)
            .maybeSingle()
          
          if (data && data.points) {
            setMushPoints(data.points)
            setHasCompletedQuiz(true)
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du quiz:", error)
      }
    }
    
    if (content.question) {
      checkQuizCompletion()
    }
  }, [cardId, content.question])

  // Gérer la complétion du quiz
  const handleQuizComplete = (points: number) => {
    // Si points est négatif, c'est une réinitialisation
    const isReset = points < 0
    
    // Mettre à jour les points locaux
    setMushPoints(isReset ? 0 : points)
    setHasCompletedQuiz(!isReset)
    
    // Mettre à jour le compteur global de champignons
    setMushroomCount((prev) => prev + points)
    
    // Mettre à jour les points gagnés dans la carte
    setCards(prevCards => {
      return prevCards.map(card => {
        if (card.sequential_id === cardId) {
          // Calculer les nouveaux points gagnés pour cette carte
          const currentEarnedPoints = card.earnedPoints || 0
          const newEarnedPoints = Math.max(0, currentEarnedPoints + points) // Empêcher les points négatifs
          
          return {
            ...card,
            earnedPoints: newEarnedPoints
          }
        }
        return card
      })
    })
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
            className={`mt-3 w-full ${hasCompletedQuiz ? 'bg-mush-green/70' : 'bg-mush-green'} hover:bg-mush-green/90 text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center hover:shadow-md transform transition-transform hover:translate-y-[-2px]`}
            onClick={() => setShowQuiz(true)}
          >
            <HelpCircle className="w-5 h-5 mr-2 text-white" />
            {hasCompletedQuiz ? `Quiz complété (${mushPoints} 🍄)` : 'Répondre au quiz'}
          </button>
        )}

        {/* Afficher le quiz si demandé */}
        {content.question && showQuiz && (
          <div>
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
