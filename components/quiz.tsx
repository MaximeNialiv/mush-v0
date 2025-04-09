"use client"

import { useState, useEffect } from "react"
import type { Content } from "@/types"
import { supabase } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Check, X, AlertCircle } from "lucide-react"
import { useAtom } from "jotai"
import { mushroomCountAtom } from "@/store/atoms"

interface QuizProps {
  content: Content
  cardId: string
  onComplete?: (points: number) => void
  onClose?: () => void
}

export function Quiz({ content, cardId, onComplete, onClose }: QuizProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pointsEarned, setPointsEarned] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [relationId, setRelationId] = useState<string | null>(null)
  const [, setMushroomCount] = useAtom(mushroomCountAtom)

  // Récupérer l'ID de l'utilisateur actuel
  useEffect(() => {
    async function getUserId() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setUserId(user.id)
          // Vérifier si l'utilisateur a déjà répondu à ce quiz
          checkExistingAnswers(user.id)
        } else {
          // Pour le développement, utiliser un ID fictif
          setUserId("dev-user-id")
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de l'utilisateur:", err)
        setUserId("dev-user-id")
      }
    }

    getUserId()
  }, [cardId, content.sequential_id])

  // Vérifier si l'utilisateur a déjà répondu à ce quiz
  async function checkExistingAnswers(uid: string) {
    try {
      const { data, error } = await supabase
        .from("relation_user_content")
        .select("*")
        .eq("user_id", uid)
        .eq("card_id", cardId)
        .maybeSingle()

      if (error) {
        console.error("Erreur lors de la vérification des réponses existantes:", error)
        return
      }

      if (data) {
        setRelationId(data.sequential_id)

        // Si l'utilisateur a déjà répondu, charger sa réponse
        if (data.result_1 || data.result_2 || data.result_3 || data.result_4) {
          // Trouver quelle réponse a été sélectionnée
          if (data.result_1) setSelectedAnswer(0)
          else if (data.result_2) setSelectedAnswer(1)
          else if (data.result_3) setSelectedAnswer(2)
          else if (data.result_4) setSelectedAnswer(3)
          
          setSubmitted(true)
          setPointsEarned(data.points || 0)
        }
      }
    } catch (err) {
      console.error("Erreur lors de la vérification des réponses:", err)
    }
  }

  // Gérer le clic sur une option
  const handleOptionClick = (index: number) => {
    if (submitted) return
    setSelectedAnswer(index)
  }

  // Vérifier si la réponse est correcte
  const isAnswerCorrect = () => {
    if (selectedAnswer === null) return false
    
    const correctAnswers = [
      content.result_1 || false,
      content.result_2 || false,
      content.result_3 || false,
      content.result_4 || false,
    ]
    
    return correctAnswers[selectedAnswer] === true
  }

  // Soumettre les réponses
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      if (!userId) {
        setError("Vous devez être connecté pour soumettre un quiz")
        return
      }

      // Vérifier si la réponse est correcte
      const correct = isAnswerCorrect()
      const earnedPoints = correct ? (content.points || 0) : 0
      setPointsEarned(earnedPoints)

      // Préparer les données à enregistrer
      const relationData = {
        user_id: userId,
        card_id: cardId,
        result_1: selectedAnswer === 0,
        result_2: selectedAnswer === 1,
        result_3: selectedAnswer === 2,
        result_4: selectedAnswer === 3,
        points: earnedPoints,
        state: "completed",
        last_view: new Date().toISOString(),
      }

      // Utiliser l'API serveur pour contourner les restrictions RLS
      const response = await fetch("/api/submit-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ relationData, relationId }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("Erreur lors de la soumission des réponses:", result.error)
        setError(result.error || "Erreur lors de l'enregistrement des réponses")
        return
      }

      // Notifier le composant parent
      if (onComplete) {
        onComplete(earnedPoints)
      }

      setSubmitted(true)
    } catch (err) {
      console.error("Erreur lors de la soumission du quiz:", err)
      setError("Une erreur est survenue lors de la soumission du quiz")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Réinitialiser le quiz
  const handleReset = () => {
    setSubmitted(false)
    setSelectedAnswer(null)
    setError(null)
  }

  // Si le contenu n'est pas un quiz, ne rien afficher
  if (!content || !content.question) return null

  return (
    <div className="relative">
      {/* Effet d'ombre origami */}
      <div className="absolute inset-0 bg-mush-yellow/30 rounded-xl transform translate-x-1 translate-y-1 -z-10"></div>

      <div className="bg-white rounded-xl border-2 border-gray-200">
        <div className="p-5">
          <h3 className="font-bold text-lg mb-4 text-gray-800">{content.question}</h3>

          <div className="space-y-3">
            {[content.answer_1, content.answer_2, content.answer_3, content.answer_4].filter(Boolean).map((answer, index) => {
              if (!answer) return null

              // Déterminer la couleur de fond en fonction de l'état
              let bgColor = "bg-white"
              let borderColor = "border-gray-300"
              let textColor = "text-gray-800"
              let showIcon = false
              const isCorrect = submitted && (
                (content.result_1 && index === 0) ||
                (content.result_2 && index === 1) ||
                (content.result_3 && index === 2) ||
                (content.result_4 && index === 3)
              )

              const isSelected = selectedAnswer === index

              if (isCorrect && isSelected) {
                // Réponse correcte et sélectionnée
                bgColor = "bg-green-50"
                borderColor = "border-green-500"
                textColor = "text-green-800"
                showIcon = true
              } else if (!isCorrect && isSelected) {
                // Réponse incorrecte et sélectionnée
                bgColor = "bg-red-50"
                borderColor = "border-red-500"
                textColor = "text-red-800"
                showIcon = true
              } else if (isCorrect) {
                // Réponse correcte mais non sélectionnée
                bgColor = "bg-green-50/50"
                borderColor = "border-green-500/50"
                textColor = "text-green-800/70"
                showIcon = true
                  showIcon = true
                  iconComponent = <Check className="h-5 w-5 text-green-600" />
                } else if (!isCorrect && userSelected) {
                  // Réponse incorrecte et sélectionnée
                  bgColor = "bg-red-50"
                  borderColor = "border-red-500"
                  textColor = "text-red-800"
                  showIcon = true
                  iconComponent = <X className="h-5 w-5 text-red-600" />
                } else if (isCorrect) {
                  // Réponse correcte mais non sélectionnée
                  bgColor = "bg-green-50/50"
                  borderColor = "border-green-500/50"
                  textColor = "text-green-800/70"
                  showIcon = true
                  iconComponent = <Check className="h-5 w-5 text-green-600/50" />
                }
              }

              return (
                <div
                  key={index}
                  className={`flex items-start p-4 border-2 rounded-lg ${bgColor} ${borderColor} cursor-pointer transition-all hover:shadow-md`}
                  onClick={() => handleOptionClick(index)}
                >
                  <div
                    className={`w-6 h-6 border-2 ${
                      userAnswers[index] && !submitted ? "bg-mush-green border-mush-green" : "bg-white border-gray-400"
                    } rounded-md mr-3 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors`}
                  >
                    {userAnswers[index] && !submitted && <Check size={16} className="text-white" />}
                    {submitted && showIcon && iconComponent}
                  </div>
                  <p className={`${textColor} text-sm font-medium`}>{answer}</p>
                </div>
              )
            })}
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border-2 border-red-300 text-red-700 p-3 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {submitted ? (
            <div className="mt-4">
              <div className="bg-gray-50 p-5 rounded-lg mb-4 border-2 border-gray-200">
                <div className="mb-3 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-mush-green text-white flex items-center justify-center mr-3">
                    <span className="text-xl">🍄</span>
                  </div>
                  <p className="font-bold text-lg">Gains : {pointsEarned} champignons</p>
                </div>
                <div>
                  <p className="font-bold mb-2 text-gray-700">ℹ️ Explication :</p>
                  <p className="text-sm text-gray-700">{content.correction_all}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-mush-green hover:bg-mush-green/90 text-white font-bold hover:shadow-md"
                  onClick={handleReset}
                >
                  Réessayer
                </Button>
                {onClose && (
                  <Button variant="outline" className="flex-1 font-bold border-2" onClick={onClose}>
                    Fermer
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4 flex gap-3">
              <Button
                className="flex-1 bg-mush-green hover:bg-mush-green/90 text-white font-bold hover:shadow-md"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Validation en cours..." : "Valider"}
              </Button>
              {onClose && (
                <Button variant="outline" className="flex-1 font-bold border-2" onClick={onClose}>
                  Annuler
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
