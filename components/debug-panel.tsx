"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { testConnection } from "@/utils/supabase/client"

export function DebugPanel() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleTest() {
    setLoading(true)
    try {
      const res = await testConnection()
      setResult(res)
    } catch (error) {
      setResult({ success: false, error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50 mt-4">
      <h2 className="font-bold mb-2">Panneau de débogage</h2>
      <Button onClick={handleTest} disabled={loading}>
        {loading ? "Test en cours..." : "Tester la connexion Supabase"}
      </Button>

      {result && (
        <div className="mt-4 p-2 bg-white rounded border">
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <div className="mt-4">
        <p className="text-sm">URL Supabase: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
        <p className="text-sm">Clé Anon: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10)}...</p>
      </div>
    </div>
  )
}

