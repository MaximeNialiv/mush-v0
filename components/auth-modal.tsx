"use client"

import { useState, useEffect } from "react"
import { Icon } from "./ui/icon"
import { useSupabase } from "@/context/supabase-provider"
import { toast } from "sonner"
import Link from "next/link"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const supabase = useSupabase()
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false)
  
  // Vérifier si l'utilisateur est authentifié
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser()
      setIsUserAuthenticated(!!data.user)
    }
    
    if (isOpen) {
      checkAuth()
    }
  }, [isOpen, supabase.auth])
  
  // États communs
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // États spécifiques à l'inscription
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptCGU, setAcceptCGU] = useState(false)
  const [acceptCommunications, setAcceptCommunications] = useState(false)
  
  // États spécifiques à la connexion
  const [rememberMe, setRememberMe] = useState(false)
  
  // États spécifiques à la réinitialisation du mot de passe
  const [resetEmailSent, setResetEmailSent] = useState(false)
  
  // Réinitialiser les états quand la modale se ferme
  useEffect(() => {
    if (!isOpen) {
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setShowPassword(false)
      setShowConfirmPassword(false)
      setAcceptCGU(false)
      setAcceptCommunications(false)
      setRememberMe(false)
      setResetEmailSent(false)
      setIsLoading(false)
    }
  }, [isOpen])

  // Fonction d'inscription
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }
    
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }
    
    if (!acceptCGU) {
      toast.error("Vous devez accepter les CGU pour vous inscrire")
      return
    }
    
    setIsLoading(true)
    console.log("Début du processus d'inscription pour:", email)
    
    try {
      // Vérifier si l'utilisateur existe déjà
      const { data: existingUser } = await supabase.auth.getUser()
      if (existingUser?.user) {
        console.log("Utilisateur déjà connecté:", existingUser.user)
        toast.error("Vous êtes déjà connecté. Veuillez d'abord vous déconnecter.")
        setIsLoading(false)
        return
      }

      // Déterminer si nous sommes en mode développement
      const isDevelopment = process.env.NODE_ENV === 'development'
      console.log("Mode développement:", isDevelopment)

      // Créer le nouvel utilisateur
      console.log("Tentative de création d'utilisateur avec Supabase Auth")
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            acceptCommunications,
          },
          // Redirection après confirmation de l'email
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      })
      
      console.log("Réponse de Supabase Auth:", { data, error })
      
      if (error) {
        console.error("Erreur lors de la création de l'utilisateur:", error)
        throw error
      }
      
      if (data?.user) {
        console.log("Utilisateur créé avec succès:", data.user.id)
        
        // Créer le profil utilisateur avec les préférences de communication
        console.log("Tentative de création du profil utilisateur")
        const { error: profileError } = await supabase
          .from('user_profile')
          .insert({
            auth_id: data.user.id,
            total_points: 0,
            communication: acceptCommunications,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        if (profileError) {
          console.error("Erreur lors de la création du profil:", profileError)
          toast.error("Compte créé mais erreur lors de la création du profil. Contactez l'administrateur.")
        } else {
          console.log("Profil utilisateur créé avec succès")
        }
        
        toast.success("Inscription réussie ! Vérifiez votre email pour confirmer votre compte.")
        onClose()
      } else {
        console.error("Aucun utilisateur retourné par Supabase")
        toast.error("Erreur lors de la création du compte")
      }
    } catch (error: any) {
      console.error("Erreur d'inscription:", error)
      toast.error(error.message || "Une erreur est survenue lors de l'inscription")
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction de connexion
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs")
      return
    }
    
    setIsLoading(true)
    console.log("Tentative de connexion avec:", email)
    
    try {
      // Vérifier d'abord si l'utilisateur existe
      const { data: existingUser } = await supabase.auth.getUser()
      if (existingUser?.user) {
        console.log("Utilisateur déjà connecté, déconnexion d'abord")
        await supabase.auth.signOut()
      }
      
      // Déterminer si nous sommes en mode développement
      const isDevelopment = process.env.NODE_ENV === 'development'
      console.log("Mode développement:", isDevelopment)

      console.log("Tentative de connexion avec Supabase Auth")
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log("Réponse de connexion:", { data, error })
      
      if (error) {
        if (error.message === "Invalid login credentials") {
          throw new Error("Email ou mot de passe incorrect")
        } else if (error.message === "Email not confirmed") {
          console.log("Email non confirmé pour:", email)
          if (isDevelopment) {
            // En mode développement, afficher des instructions spéciales
            throw new Error(
              "Email non confirmé. En mode développement, vous pouvez confirmer manuellement l'email dans le dashboard Supabase: \n" +
              "1. Allez sur https://app.supabase.com/project/vmrtygakzgwammtcoqts/auth/users \n" +
              "2. Trouvez l'utilisateur et cliquez sur 'Confirm email'"
            )
          } else {
            throw new Error("Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte de réception.")
          }
        }
        throw error
      }
      
      if (data?.user) {
        console.log("Connexion réussie pour:", data.user.email)
        toast.success("Connexion réussie !")
        onClose()
      } else {
        console.error("Connexion réussie mais aucun utilisateur retourné")
        toast.error("Erreur lors de la connexion")
      }
    } catch (error: any) {
      console.error("Erreur de connexion:", error)
      toast.error(error.message || "Une erreur est survenue lors de la connexion")
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction de réinitialisation du mot de passe
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error("Veuillez entrer votre adresse email")
      return
    }
    
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })
      
      if (error) {
        throw error
      }
      
      setResetEmailSent(true)
      toast.success("Un email de réinitialisation a été envoyé à votre adresse")
    } catch (error: any) {
      console.error("Erreur de réinitialisation:", error)
      toast.error(error.message || "Une erreur est survenue lors de l'envoi de l'email")
    } finally {
      setIsLoading(false)
    }
  }

  // Gérer la fermeture de la modale - empêcher toute fermeture sauf si l'utilisateur est authentifié
  const handleOpenChange = (open: boolean) => {
    // Si la modale tente de se fermer et que l'utilisateur n'est pas authentifié, bloquer la fermeture
    if (!open && !isUserAuthenticated) {
      console.log("Tentative de fermeture bloquée : utilisateur non authentifié")
      return false
    }
    
    // Si l'utilisateur est authentifié, permettre la fermeture
    if (!open && isUserAuthenticated) {
      onClose()
    }
    
    return true
  }
  
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={handleOpenChange}
    >
      <DialogContent 
        className="sm:max-w-md" 
        // Empêcher la fermeture par clic extérieur
        onPointerDownOutside={(e) => e.preventDefault()}
        // Empêcher la fermeture par touche Escape
        onEscapeKeyDown={(e) => e.preventDefault()}
        // Ajouter une description pour corriger l'avertissement d'accessibilité
        aria-describedby="auth-modal-description"
        // Supprimer le bouton de fermeture (X)
        hideCloseButton={true}
      >
        <div id="auth-modal-description" className="sr-only">
          Modale d'authentification pour accéder à l'application Mush
        </div>
        {/* Pas de bouton de fermeture */}
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-mush-green">
            Rejoignez Mush !
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="signup" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="signup">Inscription</TabsTrigger>
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="reset">Mot de passe oublié ?</TabsTrigger>
          </TabsList>
          
          {/* Onglet Inscription */}
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email :</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Entrez votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password">Mot de passe :</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Icon icon="eye-slash" size="sm" /> : <Icon icon="eye" size="sm" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Répéter le mot de passe :</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Répétez votre mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <Icon icon="eye-slash" size="sm" /> : <Icon icon="eye" size="sm" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="accept-cgu" 
                    checked={acceptCGU} 
                    onCheckedChange={(checked) => setAcceptCGU(checked as boolean)}
                  />
                  <Label htmlFor="accept-cgu" className="text-sm">
                    J'accepte les <Link href="/cgu" className="text-mush-green hover:underline">CGU</Link>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="accept-communications" 
                    checked={acceptCommunications} 
                    onCheckedChange={(checked) => setAcceptCommunications(checked as boolean)}
                  />
                  <Label htmlFor="accept-communications" className="text-sm">
                    J'accepte les communications
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="signup-remember-me" 
                    checked={rememberMe} 
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="signup-remember-me" className="text-sm">
                    Se souvenir de moi
                  </Label>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-mush-green hover:bg-mush-green/90 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                <Icon icon="Send" size="sm" />
                {isLoading ? "Inscription en cours..." : "S'inscrire"}
              </Button>
            </form>
          </TabsContent>
          
          {/* Onglet Connexion */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email :</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Entrez votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Mot de passe :</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Icon icon="eye-slash" size="sm" /> : <Icon icon="eye" size="sm" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="login-remember-me" 
                  checked={rememberMe} 
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="login-remember-me" className="text-sm">
                  Se souvenir de moi
                </Label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-mush-green hover:bg-mush-green/90"
                disabled={isLoading}
              >
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </form>
          </TabsContent>
          
          {/* Onglet Mot de passe oublié */}
          <TabsContent value="reset">
            {resetEmailSent ? (
              <div className="py-4 text-center">
                <p className="mb-4 text-green-600">
                  Un email de réinitialisation a été envoyé à votre adresse.
                </p>
                <p className="mb-4">
                  Veuillez vérifier votre boîte de réception et suivre les instructions pour réinitialiser votre mot de passe.
                </p>
                <Button 
                  className="mt-2 bg-mush-green hover:bg-mush-green/90"
                  onClick={() => setResetEmailSent(false)}
                >
                  Retour
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email :</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Entrez votre email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-mush-green hover:bg-mush-green/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
