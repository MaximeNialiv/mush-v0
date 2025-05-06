"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/utils/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Icon } from "./ui/icon"

export function DataStatus() {
  const supabase = useSupabase()
  const [status, setStatus] = useState<"loading" | "connected" | "mock">("loading")

  useEffect(() => {
    async function checkConnection() {
      try {
        const { data, error } = await supabase.from("cards").select("count")
        if (error) {
          console.error("Erreur de connexion à Supabase:", error)
          setStatus("mock")
        } else {
          console.log("Connexion à Supabase réussie")
          setStatus("connected")
        }
      } catch (e) {
        console.error("Exception lors de la connexion à Supabase:", e)
        setStatus("mock")
      }
    }

    checkConnection()
  }, [supabase])

  if (status === "loading") return null

  // Ne plus afficher d'encadré de statut
  return null
}
