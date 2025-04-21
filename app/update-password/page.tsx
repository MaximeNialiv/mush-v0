"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { useSupabase } from "@/context/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function UpdatePasswordPage() {
  const router = useRouter()
  const supabase = useSupabase()
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        toast.error("Session expirée ou invalide")
        router.push("/")
      } else {
        setIsAuthenticated(true)
      }
    }
    
    checkSession()
  }, [router, supabase.auth])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password || !confirmPassword) {
      toast.error("Veuillez remplir tous les champs")
      return
    }
    
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }
    
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères")
      return
    }
    
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({ password })
      
      if (error) {
        throw error
      }
      
      toast.success("Mot de passe mis à jour avec succès")
      router.push("/")
    } catch (error: any) {
      console.error("Erreur de mise à jour du mot de passe:", error)
      toast.error(error.message || "Une erreur est survenue lors de la mise à jour du mot de passe")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Vérification de votre session...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-mush-yellow/20 to-white p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-mush-yellow/10 pb-2">
            <CardTitle className="text-center text-xl font-bold text-mush-green">
              Mise à jour du mot de passe
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleUpdatePassword}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nouveau mot de passe :</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Entrez votre nouveau mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe :</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmez votre nouveau mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-mush-green hover:bg-mush-green/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Mise à jour en cours..." : "Mettre à jour le mot de passe"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
