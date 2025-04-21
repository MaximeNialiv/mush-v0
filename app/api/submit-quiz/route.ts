import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { relationData, relationId } = await request.json()

    console.log("Données reçues par l'API:", { relationData, relationId })

    // Vérifier que l'utilisateur est authentifié
    const { data: sessionData } = await supabase.auth.getSession()
    const user = sessionData.session?.user

    // Mode développement: permettre les soumissions anonymes
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!user && !isDevelopment) {
      console.log("Erreur: Utilisateur non authentifié")
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // En mode développement, permettre les soumissions anonymes
    if (isDevelopment && relationData.user_id === "anonymous") {
      console.log("Mode développement: soumission anonyme acceptée")
    } 
    // Sinon, vérifier que l'utilisateur qui soumet est bien celui qui est dans les données
    else if (user && user.id !== relationData.user_id) {
      console.log("Erreur: ID utilisateur ne correspond pas")
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    let result
    
    if (isDevelopment && relationData.user_id === "anonymous") {
      console.log("Mode développement: simulation d'une réponse réussie")
      result = { error: null }
    } else {
      if (relationId) {
        // Mettre à jour la relation existante
        console.log("Mise à jour de la relation existante:", relationId)
        result = await supabase.from("relation_user_content").update(relationData).eq("sequential_id", relationId)
      } else {
        // Créer une nouvelle relation
        console.log("Création d'une nouvelle relation")
        result = await supabase.from("relation_user_content").insert(relationData)
      }
    }

    if (result.error) {
      console.error("Erreur lors de l'enregistrement des réponses:", result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    // Mettre à jour le total de points de l'utilisateur (seulement si authentifié)
    let newTotal = relationData.points
    
    if (isDevelopment && relationData.user_id === "anonymous") {
      console.log("Mode développement: simulation de mise à jour des points")
    } else if (user) {
      // Utiliser une requête RPC pour mettre à jour les points en une seule opération atomique
      // Cela évite les problèmes de concurrence et réduit le nombre de requêtes
      try {
        // Utiliser une transaction pour garantir l'atomicité
        const { data, error } = await supabase.rpc('increment_user_points', {
          user_auth_id: user.id,
          points_to_add: relationData.points
        })

        if (error) {
          console.error("Erreur lors de la mise à jour des points via RPC:", error)
          
          // Fallback: méthode traditionnelle en cas d'échec de la RPC
          const { data: profile, error: profileError } = await supabase
            .from("user_profile")
            .select("total_points")
            .eq("auth_id", user.id)
            .single()

          if (profileError) {
            console.error("Erreur lors de la récupération du profil:", profileError)
            return NextResponse.json({ error: profileError.message }, { status: 500 })
          }

          newTotal = (profile.total_points || 0) + relationData.points

          const { error: updateError } = await supabase
            .from("user_profile")
            .update({ total_points: newTotal })
            .eq("auth_id", user.id)
            
          if (updateError) {
            console.error("Erreur lors de la mise à jour des points:", updateError)
            return NextResponse.json({ error: updateError.message }, { status: 500 })
          }
        } else {
          // Si la RPC a réussi, elle renvoie le nouveau total
          newTotal = data || newTotal
          console.log("Points mis à jour avec succès via RPC, nouveau total:", newTotal)
        }
      } catch (err) {
        console.error("Erreur lors de la mise à jour des points:", err)
        return NextResponse.json({ error: "Erreur lors de la mise à jour des points" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, points: relationData.points, total: newTotal })
  } catch (error) {
    console.error("Erreur serveur:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
