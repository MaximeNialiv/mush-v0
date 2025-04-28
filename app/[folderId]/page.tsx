"use client"

import { CardList } from "@/components/card-list"
import { Header } from "@/components/header"
import { useParams } from "next/navigation"
import { JotaiProvider } from "../jotai-provider"
import { useEffect } from "react"
import { useAtom } from "jotai"
import { currentFolderIdAtom } from "@/store/atoms"

export default function FolderPage() {
  const params = useParams()
  const folderId = params.folderId as string
  const [, setCurrentFolderId] = useAtom(currentFolderIdAtom)
  
  // Mettre à jour l'ID du dossier courant dans Jotai
  useEffect(() => {
    setCurrentFolderId(folderId)
    
    // Nettoyer l'état lors du démontage
    return () => {
      setCurrentFolderId(null)
    }
  }, [folderId, setCurrentFolderId])
  
  return (
    <JotaiProvider>
      <div className="flex flex-col min-h-screen bg-mush-green/10">
        <Header />
        <main className="flex-1 container mx-auto p-4 pb-8 max-w-5xl">
          <div className="relative">
            {/* Fond décoratif en origami */}
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-mush-green/20 rounded-lg transform rotate-12 -z-10"></div>
            <div className="absolute top-12 -right-8 w-40 h-40 bg-mush-yellow/20 rounded-lg transform -rotate-6 -z-10"></div>
            <CardList folderId={folderId} />
          </div>
        </main>
      </div>
    </JotaiProvider>
  )
}
