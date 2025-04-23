"use client"

import { useState, useEffect } from "react"
import type { Content } from "@/types"
import { Check, X, AlertCircle } from "lucide-react"
import { useSupabase } from "@/context/supabase-provider"
import { useAtom } from "jotai"
import { mushroomCountAtom } from "@/store/atoms"

interface QuizProps {
  content: Content
  cardId: string
  onComplete?: (points: number) => void
  onClose?: () => void
}

export function Quiz({ content, cardId, onComplete, onClose }: QuizProps) {
  const supabase = useSupabase()
  const [mushroomCount, setMushroomCount] = useAtom(mushroomCountAtom)
  
  // Utiliser un tableau pour suivre les réponses sélectionnées (true/false pour chaque option)
  const [userAnswers, setUserAnswers] = useState<boolean[]>([false, false, false, false])
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pointsEarned, setPointsEarned] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [relationId, setRelationId] = useState<string | null>(null)

  // Fonction pour mettre à jour le total des points de l'utilisateur
  const updateUserTotalPoints = async (userId: string) => {
    try {
      // 1. Récupérer toutes les relations de l'utilisateur pour calculer la somme des points
      const { data: relations, error: relationsError } = await supabase
        .from("relation_user_content")
        .select("points")
        .eq("user_id", userId)
      
      if (relationsError) {
        console.error("Erreur lors de la récupération des relations:", relationsError)
        return
      }
      
      // 2. Calculer le total des points en additionnant tous les points des relations
      const totalPoints = relations.reduce((sum, relation) => sum + (relation.points || 0), 0)
      console.log("Somme des points calculée:", totalPoints, "depuis", relations.length, "relations")
      
      // 3. Mettre à jour le profil utilisateur avec le total calculé
      const { error: updateError } = await supabase
        .from("user_profile")
        .update({ total_points: totalPoints })
        .eq("auth_id", userId)
      
      if (updateError) {
        console.error("Erreur lors de la mise à jour du total des points:", updateError)
        return
      }
      
      // 4. Mettre à jour l'atom global pour l'affichage immédiat
      setMushroomCount(totalPoints)
    } catch (error) {
      console.error("Erreur lors de la mise à jour du total des points:", error)
    }
  }

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
      // Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("Vous devez être connecté pour soumettre un quiz.")
        setIsSubmitting(false)
        return
      }

      // Calculer les points gagnés
      const points = calculatePoints()
      setPointsEarned(points)

      // Utiliser la relation existante déjà connue via relationId plutôt que de faire une nouvelle requête
      // Cela évite une requête redondante puisque nous avons déjà vérifié l'existence de la relation au chargement
      
      // Si une relation existe (relationId est défini), la mettre à jour
      let relationError = null;
      
      if (relationId) {
        console.log("Mise à jour de la relation existante")
        const { error } = await supabase
          .from("relation_user_content")
          .update({
            points: points,
            result_1: userAnswers[0],
            result_2: userAnswers[1],
            result_3: userAnswers[2],
            result_4: userAnswers[3],
            last_view: new Date().toISOString()
          })
          .eq("sequential_id", relationId)
        
        relationError = error
      } else {
        // Sinon, créer une nouvelle relation
        console.log("Création d'une nouvelle relation")
        const { data, error } = await supabase
          .from("relation_user_content")
          .insert([
            {
              user_id: user.id,
              content_id: content.sequential_id,
              state: "completed",
              sender_id: "system",
              points: points,
              result_1: userAnswers[0],
              result_2: userAnswers[1],
              result_3: userAnswers[2],
              result_4: userAnswers[3],
              last_view: new Date().toISOString()
            }
          ])
          .select("sequential_id")
          .single()
        
        relationError = error
        
        // Sauvegarder l'ID de la relation pour les futures mises à jour
        if (data && !error) {
          setRelationId(data.sequential_id)
        }
      }

      if (relationError) {
        console.error("Erreur lors de l'enregistrement de la relation:", relationError)
        setError("Erreur lors de l'enregistrement de vos réponses. Veuillez réessayer.")
        return
      }

      // Ne plus sauvegarder l'ID de la relation car nous n'avons plus besoin de la supprimer
      // lors du réessai du quiz
      
      // Mettre à jour le total des points de l'utilisateur
      await updateUserTotalPoints(user.id)

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

  // Réinitialiser le quiz sans supprimer la relation existante
  const handleReset = () => {
    // Réinitialiser l'état local complètement pour permettre une nouvelle soumission
    setUserAnswers(Array(4).fill(false))
    setSubmitted(false) // Important : ceci cache la correction et permet une nouvelle soumission
    setPointsEarned(0)
    setError(null)
    setIsSubmitting(false) // S'assurer que le bouton de soumission est actif
    
    // Informer le parent pour mettre à jour l'affichage des points
    if (onComplete) {
      onComplete(0) // Indiquer 0 point pour réinitialiser l'affichage
    }
  }

  // Si le contenu n'est pas un quiz, ne rien afficher
  if (!content || !content.question) return null

  return (
    <div className="relative">
      <div>
          {/* Options de réponse - sans répéter la question qui est déjà affichée dans le ContentItem */}
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
          
          {/* Texte de correction qui apparaît uniquement après validation et avant de cliquer sur Réessayer */}
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
