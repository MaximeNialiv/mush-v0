import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { relationData, relationId } = await request.json()

    // Vérifier que l'utilisateur est authentifié
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier que l'utilisateur qui soumet est bien celui qui est dans les données
    if (user.id !== relationData.user_id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    let result

    if (relationId) {
      // Mettre à jour la relation existante
      result = await supabase.from("relation_user_content").update(relationData).eq("sequential_id", relationId)
    } else {
      // Créer une nouvelle relation
      result = await supabase.from("relation_user_content").insert(relationData)
    }

    if (result.error) {
      console.error("Erreur lors de l'enregistrement des réponses:", result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    // Mettre à jour le total de points de l'utilisateur
    const { data: profile, error: profileError } = await supabase
      .from("user_profile")
      .select("total_points")
      .eq("auth_id", user.id)
      .single()

    if (profileError) {
      console.error("Erreur lors de la récupération du profil:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    const newTotal = (profile.total_points || 0) + relationData.points

    const { error: updateError } = await supabase
      .from("user_profile")
      .update({ total_points: newTotal })
      .eq("auth_id", user.id)

    if (updateError) {
      console.error("Erreur lors de la mise à jour des points:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, points: relationData.points, total: newTotal })
  } catch (error) {
    console.error("Erreur serveur:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
