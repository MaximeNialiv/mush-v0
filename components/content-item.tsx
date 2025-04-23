"use client"

import { useState, useEffect } from "react"
import type { Content } from "@/types"
import { HelpCircle } from "lucide-react"
import { OpenGraphPreview } from "./open-graph-preview"
import { Quiz } from "./quiz"
import { atom, useAtom } from "jotai"
import { atomFamily } from "jotai/utils"
import { mushroomCountAtom, cardsAtom } from "@/store/atoms"
import { useSupabase } from "@/utils/supabase/client"

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
  const supabase = useSupabase()
  const quizVisibleAtom = quizVisibleAtomFamily(content.sequential_id)
  const [showQuiz, setShowQuiz] = useAtom(quizVisibleAtom)
  const [mushPoints, setMushPoints] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
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
            .eq("content_id", content.sequential_id)
            .maybeSingle()
          
          if (data && data.points) {
            setMushPoints(data.points)
            setHasCompletedQuiz(true)
          }
        }
        
        // Définir le nombre total de points disponibles pour ce quiz
        if (content.points) {
          setTotalPoints(content.points)
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
      {/* En-tête du contenu avec ID et points */}
      <div className="p-4">
        {content.question && (
          <div className="flex items-center justify-between mb-2">
            <div className="bg-gray-100 px-3 py-1 rounded-full text-gray-700 text-sm font-medium">
              #{content.sequential_id}
            </div>
            {totalPoints > 0 && (
              <div className="bg-mush-green/10 px-3 py-1 rounded-full border border-mush-green/30">
                <span className="text-mush-green text-sm font-medium flex items-center">
                  <span className="mr-1">🍄</span>
                  {mushPoints}/{totalPoints}
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Afficher la question */}
        <div>
          {/* Afficher la question seulement si le quiz n'est pas ouvert ou si ce n'est pas un quiz */}
          {(!content.question || !showQuiz) && (
            <h4 className="font-bold text-gray-800">{content.question ? content.question : content.description}</h4>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-4 pb-4">
        {/* Afficher le média si disponible */}
        {content.media_url && <OpenGraphPreview url={content.media_url} showLinkInImage={true} />}

        {/* Afficher le bouton du quiz si disponible et non ouvert */}
        {content.question && !showQuiz && (
          <button
            className={`mt-3 w-full ${hasCompletedQuiz ? 'bg-mush-green/70' : 'bg-mush-green'} hover:bg-mush-green/90 text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center hover:shadow-md transform transition-transform hover:translate-y-[-2px]`}
            onClick={() => setShowQuiz(true)}
          >
            <HelpCircle className="w-5 h-5 mr-2 text-white" />
            {hasCompletedQuiz ? 'Réessayer le quiz' : 'Répondre au quiz'}
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
