"use client"

import { useState, useEffect } from "react"
import type { Content } from "@/types"
import { supabase } from "@/utils/supabase/client"
import { Check, X, AlertCircle } from "lucide-react"

interface QuizProps {
  content: Content
  cardId: string
  onComplete?: (points: number) => void
  onClose?: () => void
}

export function Quiz({ content, cardId, onComplete, onClose }: QuizProps) {
  // Utiliser un tableau pour suivre les réponses sélectionnées (true/false pour chaque option)
  const [userAnswers, setUserAnswers] = useState<boolean[]>([false, false, false, false])
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pointsEarned, setPointsEarned] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [relationId, setRelationId] = useState<string | null>(null)

  // Récupérer l'ID de l'utilisateur actuel
  useEffect(() => {
    getUserId()
  }, [])

  async function getUserId() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUserId(session.user.id)
        // Vérifier si l'utilisateur a déjà répondu à ce quiz
        await checkExistingAnswers(session.user.id)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'ID utilisateur :", error)
    }
  }

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
        throw error
      }

      if (data) {
        // L'utilisateur a déjà répondu à ce quiz
        setRelationId(data.sequential_id)

        // Si des réponses existent, les afficher
        if (data.result_1 !== null || data.result_2 !== null || data.result_3 !== null || data.result_4 !== null) {
          // Charger les réponses précédentes
          setUserAnswers([
            data.result_1 || false,
            data.result_2 || false,
            data.result_3 || false,
            data.result_4 || false
          ])
          setSubmitted(true)
          // Calculer les points gagnés
          setPointsEarned(data.points || 0)
          // Afficher un message indiquant que l'utilisateur a déjà répondu
          setError("Vous avez déjà répondu à ce quiz !")
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification des réponses existantes :", error)
      setError("Erreur lors de la vérification des réponses existantes.")
    }
  }

  // Gérer le clic sur une option
  function handleOptionClick(index: number) {
    if (!submitted) {
      // Basculer l'état de la réponse sélectionnée
      const newAnswers = [...userAnswers]
      newAnswers[index] = !newAnswers[index]
      setUserAnswers(newAnswers)
      console.log("Option cliquée:", index, "Nouvel état:", newAnswers)
    }
  }

  // Calculer les points gagnés en fonction des réponses correctes
  function calculatePoints() {
    let correctAnswers = 0
    let totalAnswers = 0
    let correctOptionsCount = 0
    
    // Compter le nombre total de réponses et de réponses correctes
    if (content.answer_1) {
      totalAnswers++
      if (userAnswers[0] === !!content.result_1) correctAnswers++
      if (!!content.result_1) correctOptionsCount++
    }
    
    if (content.answer_2) {
      totalAnswers++
      if (userAnswers[1] === !!content.result_2) correctAnswers++
      if (!!content.result_2) correctOptionsCount++
    }
    
    if (content.answer_3) {
      totalAnswers++
      if (userAnswers[2] === !!content.result_3) correctAnswers++
      if (!!content.result_3) correctOptionsCount++
    }
    
    if (content.answer_4) {
      totalAnswers++
      if (userAnswers[3] === !!content.result_4) correctAnswers++
      if (!!content.result_4) correctOptionsCount++
    }
    
    const totalPoints = content.points || 0
    
    // Exception : s'il n'y a qu'une seule réponse correcte, l'utilisateur doit l'avoir cochée pour obtenir des points
    if (correctOptionsCount === 1) {
      // Vérifier si l'utilisateur a coché la seule réponse correcte
      const hasSelectedTheCorrectOption = 
        (content.result_1 && userAnswers[0]) ||
        (content.result_2 && userAnswers[1]) ||
        (content.result_3 && userAnswers[2]) ||
        (content.result_4 && userAnswers[3]);
      
      return hasSelectedTheCorrectOption ? totalPoints : 0;
    }
    
    // Sinon, calculer les points au prorata des bonnes réponses
    return totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * totalPoints) : 0
  }

  // Soumettre les réponses
  async function handleSubmit() {
    // Vérifier si au moins une réponse a été sélectionnée
    if (!userAnswers.some((answer: boolean) => answer)) {
      setError("Veuillez sélectionner au moins une réponse")
      return
    }
    
    // Afficher les réponses sélectionnées pour le débogage
    console.log("Réponses sélectionnées:", userAnswers)

    setIsSubmitting(true)
    setError(null)

    try {
      // Calculer les points gagnés
      const points = calculatePoints()
      setPointsEarned(points)

      // Créer un objet avec les résultats pour l'API
      // (cette variable n'est plus utilisée mais on la garde pour référence)

      // Préparer les données pour la table relation_user_content
      const relationData = {
        user_id: userId || "anonymous", // Utiliser "anonymous" si l'utilisateur n'est pas connecté
        card_id: cardId,
        state: "completed",
        points: points,
        result_1: userAnswers[0],
        result_2: userAnswers[1],
        result_3: userAnswers[2],
        result_4: userAnswers[3],
        last_view: new Date().toISOString()
      }
      
      console.log("Envoi des données:", relationData)

      // Envoyer les résultats à l'API
      const response = await fetch("/api/submit-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          relationData,
          relationId
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la soumission du quiz")
      }

      // Mettre à jour l'état
      setSubmitted(true)

      // Mettre à jour les points de l'utilisateur
      if (points > 0 && onComplete) {
        onComplete(points)
      }
    } catch (error) {
      console.error("Erreur lors de la soumission du quiz :", error)
      setError("Une erreur est survenue lors de la soumission du quiz. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Réinitialiser le quiz
  function handleReset() {
    setUserAnswers([false, false, false, false])
    setSubmitted(false)
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
              let iconComponent = null

              const isCorrect = submitted && (
                (content.result_1 && index === 0) ||
                (content.result_2 && index === 1) ||
                (content.result_3 && index === 2) ||
                (content.result_4 && index === 3)
              )

              const isSelected = userAnswers[index]

              if (submitted) {
                if (isCorrect && isSelected) {
                  // Réponse correcte et sélectionnée
                  bgColor = "bg-green-50"
                  borderColor = "border-green-500"
                  textColor = "text-green-800"
                  showIcon = true
                  iconComponent = <Check className="h-5 w-5 text-green-600" />
                } else if (!isCorrect && isSelected) {
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleOptionClick(index);
                  }}
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
            <div className="bg-red-50 p-3 rounded-lg mt-4 flex items-start">
              <AlertCircle className="text-red-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="mt-6 flex flex-col space-y-3">
            {!submitted ? (
              <button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium p-2 rounded-md"
                onClick={handleSubmit}
                disabled={!userAnswers.some((a: boolean) => a) || isSubmitting}
              >
                {isSubmitting ? "Validation en cours..." : "Valider ma réponse"}
              </button>
            ) : (
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded-md"
                onClick={onClose}
              >
                Continuer
              </button>
            )}

            {onClose && (
              <button
                className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 p-2 rounded-md"
                onClick={onClose}
              >
                Fermer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
