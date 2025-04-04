import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient()

    // Création de la table des tweets
    const { error: tweetsError } = await supabase.rpc("create_tweets_table_if_not_exists", {})

    if (tweetsError) {
      return NextResponse.json({ error: tweetsError.message }, { status: 500 })
    }

    // Création de la table des profils
    const { error: profilesError } = await supabase.rpc("create_profiles_table_if_not_exists", {})

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Base de données initialisée avec succès" })
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la base de données:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

