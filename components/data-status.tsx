"use client"

import { useState, useEffect } from "react"
import { testConnection } from "@/utils/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Database } from "lucide-react"

export function DataStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "mock">("loading")

  useEffect(() => {
    async function checkConnection() {
      const result = await testConnection()
      if (result.success) {
        setStatus("connected")
      } else {
        setStatus("mock")
      }
    }

    checkConnection()
  }, [])

  if (status === "loading") return null

  if (status === "mock") {
    return (
      <Alert className="mb-4 bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertTitle className="text-amber-700">Mode développement</AlertTitle>
        <AlertDescription className="text-amber-600">
          Utilisation de données statiques. Les tables Supabase n'ont pas encore été créées.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-4 bg-green-50 border-green-200">
      <Database className="h-4 w-4 text-green-500" />
      <AlertTitle className="text-green-700">Connecté à Supabase</AlertTitle>
      <AlertDescription className="text-green-600">
        Les données sont chargées depuis votre base de données Supabase.
      </AlertDescription>
    </Alert>
  )
}
