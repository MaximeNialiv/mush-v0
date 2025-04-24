"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/utils/supabase/client"
import { CardWithContent } from "@/types"
import { Folder, ChevronRight, Clock } from "lucide-react"
import Link from "next/link"

interface FolderPreviewProps {
  folderId: string | null
  limit?: number
  title?: string
}

export function FolderPreview({ folderId, limit = 5, title = "Dossier actuel" }: FolderPreviewProps) {
  const [cards, setCards] = useState<CardWithContent[]>([])
  const [folderInfo, setFolderInfo] = useState<CardWithContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = useSupabase()

  useEffect(() => {
    const fetchFolderData = async () => {
      if (!folderId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Récupérer les informations du dossier
        const { data: folderData, error: folderError } = await supabase
          .from("cards")
          .select("*")
          .eq("sequential_id", folderId)
          .single()

        if (folderError) {
          throw folderError
        }

        setFolderInfo(folderData as CardWithContent)

        // Récupérer les cartes du dossier
        const { data: cardsData, error: cardsError } = await supabase
          .from("cards")
          .select("*")
          .eq("parent_id", folderId)
          .order("updated_at", { ascending: false })
          .limit(limit)

        if (cardsError) {
          throw cardsError
        }

        // Ajouter une propriété isFolder basée sur le type
        const processedCards = cardsData.map((card: any) => ({
          ...card,
          isFolder: card.type === "folder"
        }))

        setCards(processedCards)
      } catch (err) {
        console.error("Erreur lors du chargement des données du dossier:", err)
        setError("Impossible de charger les données du dossier")
      } finally {
        setLoading(false)
      }
    }

    fetchFolderData()
  }, [folderId, limit, supabase])

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
        <p>{error}</p>
      </div>
    )
  }

  if (!folderId || cards.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Folder className="h-5 w-5 text-mush-green mr-2" />
          <h2 className="font-semibold text-lg">{folderInfo?.title || title}</h2>
        </div>
        <Link 
          href={`/folders/${folderId}`}
          className="flex items-center text-sm text-mush-green hover:underline"
        >
          Voir tout
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>

      <div className="space-y-2">
        {cards.map(card => (
          <Link 
            key={card.sequential_id}
            href={card.isFolder ? `/folders/${card.sequential_id}` : `/cards/${card.sequential_id}`}
            className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className={`w-8 h-8 rounded-full ${card.isFolder ? 'bg-mush-green/20' : 'bg-gray-200'} flex items-center justify-center mr-3`}>
              {card.isFolder ? (
                <Folder className="h-4 w-4 text-mush-green" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{card.title}</p>
              {card.description && (
                <p className="text-sm text-gray-500 truncate">{card.description}</p>
              )}
            </div>
            <div className="flex items-center text-xs text-gray-500 ml-2">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(card.updated_at).toLocaleDateString()}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
