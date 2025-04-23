"use client"

import { useState, useEffect } from "react"
import type { Content } from "@/types"
import { Check, X, AlertCircle } from "lucide-react"
import { useSupabase } from "@/context/supabase-provider"

interface QuizProps {
  content: Content
  cardId: string
  onComplete?: (points: number) => void
  onClose?: () => void
}

export function Quiz({ content, cardId, onComplete, onClose }: QuizProps) {
  const supabase = useSupabase()
  
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
      // Utiliser limit(1) pour éviter l'erreur PGRST116 (multiple rows returned)
      const { data, error } = await supabase
        .from("relation_user_content")
        .select("*")
        .eq("user_id", uid)
        .eq("content_id", content.sequential_id)
        .order('created_at', { ascending: false }) // Prendre la relation la plus récente
        .limit(1)
        .single()

      if (error) {
        // Si c'est une erreur "No rows found", ce n'est pas un problème
        if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
          return // Pas de réponse existante, c'est normal
        }
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
        content_id: content.sequential_id,
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

  // Réinitialiser le quiz et supprimer la relation existante
  const handleReset = async () => {
    try {
      // Supprimer la relation existante pour permettre un nouveau test
      if (userId && relationId) {
        await supabase
          .from("relation_user_content")
          .delete()
          .eq("sequential_id", relationId)
        
        console.log("Relation supprimée avec succès")
        setRelationId(null)
      }
      
      // Réinitialiser l'état local
      setUserAnswers(Array(4).fill(false))
      setSubmitted(false)
      setPointsEarned(0)
      
      // Informer le parent que les points ont été réinitialisés
      if (onComplete) {
        onComplete(-pointsEarned) // Soustraire les points précédemment gagnés
      }
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du quiz:", error)
      setError("Erreur lors de la réinitialisation. Veuillez réessayer.")
    }
  }

  // Si le contenu n'est pas un quiz, ne rien afficher
  if (!content || !content.question) return null

  return (
    <div className="relative">
      {/* Affichage de la question */}
      <div>
          <h3 className="font-bold text-lg mb-4 text-gray-800">{content.question}</h3>

          {/* Options de réponse */}
          <div className="space-y-3 mb-4">
            {[content.answer_1, content.answer_2, content.answer_3, content.answer_4].filter(Boolean).map((answer, index) => {
              if (!answer) return null

              // Déterminer si cette réponse est correcte selon le contenu
              const isCorrectAnswer = (
                (index === 0 && content.result_1) ||
                (index === 1 && content.result_2) ||
                (index === 2 && content.result_3) ||
                (index === 3 && content.result_4)
              )

              // Déterminer si l'utilisateur a sélectionné cette réponse
              const isSelected = userAnswers[index]
              
              // Valeurs par défaut (non soumis)
              let textColor = "text-gray-800"
              let checkboxColor = "border-gray-300"
              
              if (submitted) {
                // Appliquer les règles exactes spécifiées :
                // - Lorsqu'une réponse devait être cochée, son texte apparait en vert.
                // - Les checkboxes cochées sont celles qui ont été cochées par l'utilisateur.
                // - Si la réponse est juste, la checkbox est verte, qu'elle soit cochée ou non.
                // - Si la réponse est fausse, la checkbox est rouge, qu'elle soit cochée ou non.
                
                // 1. Couleur du texte : vert si la réponse est correcte
                textColor = isCorrectAnswer ? "text-green-600" : "text-gray-800"
                
                // 2. Couleur de la checkbox : selon les cas spécifiques
                if (!isCorrectAnswer && !isSelected) {
                  // CAS 1: FALSE / FALSE - checkbox verte
                  checkboxColor = "border-green-600"
                } else if (isCorrectAnswer && isSelected) {
                  // CAS 2: TRUE / TRUE - checkbox verte
                  checkboxColor = "border-green-600"
                } else if (!isCorrectAnswer && isSelected) {
                  // CAS 3: TRUE / FALSE - checkbox rouge
                  checkboxColor = "border-red-600"
                } else if (isCorrectAnswer && !isSelected) {
                  // CAS 4: FALSE / TRUE - checkbox rouge
                  checkboxColor = "border-red-600"
                }
              }

              return (
                <div
                  key={index}
                  className={`flex items-center p-3 border rounded-md mb-2 ${submitted ? 'cursor-default' : 'cursor-pointer hover:bg-gray-50'}`}
                  onClick={() => !submitted && handleOptionClick(index)}
                >
                  <div className={`flex-shrink-0 w-6 h-6 border-2 rounded-md mr-3 flex items-center justify-center ${submitted ? checkboxColor : (isSelected ? 'border-mush-green' : 'border-gray-300')}`}>
                    {/* Afficher une coche verte quand l'utilisateur sélectionne une réponse avant soumission */}
                    {!submitted && isSelected && <Check className="h-4 w-4 text-mush-green" />}
                    
                    {/* Afficher une coche de la couleur appropriée quand la réponse est sélectionnée après soumission */}
                    {submitted && isSelected && <Check className={`h-4 w-4 ${isCorrectAnswer ? 'text-green-600' : 'text-red-600'}`} />}
                  </div>
                  <span className={`${textColor} flex-grow`}>{answer}</span>
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
          
          {/* Texte de correction qui apparaît après validation */}
          {submitted && content.correction_all && (
            <div className="bg-gray-50 p-3 rounded-lg mt-4 border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-1">Explication :</h4>
              <p className="text-gray-700 text-sm">{content.correction_all}</p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex space-x-2 mt-4">
            {submitted ? (
              <button
                onClick={handleReset}
                className="flex-1 py-2 px-4 bg-mush-green text-white rounded-md hover:bg-mush-green/90 font-bold"
              >
                Réessayer
              </button>
            ) : (
              <button
                className="w-full bg-mush-green hover:bg-mush-green/90 text-white font-bold p-3 rounded-lg"
                onClick={handleSubmit}
                disabled={!userAnswers.some((a: boolean) => a) || isSubmitting}
              >
                {isSubmitting ? "Validation en cours..." : "Valider ma réponse"}
              </button>
            )}
          </div>
        </div>
    </div>
  )
}
