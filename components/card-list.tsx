"use client"

import { useCards } from "@/hooks/use-cards"
import { useAtom } from "jotai"
import { viewModeAtom } from "@/store/atoms"
import { CardItem } from "@/components/card-item"
import { Loader2Icon } from "@/components/ui/icon"

interface CardListProps {
  folderId?: string
}

export function CardList({ folderId }: CardListProps = {}) {
  const { cards, loading, error } = useCards(folderId)
  const [viewMode] = useAtom(viewModeAtom)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2Icon size="xl" className="animate-spin text-mush-green" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
        <button className="mt-2 text-sm underline">Réessayer</button>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 text-center shadow-md">
        <p className="text-lg">Aucune carte disponible pour le moment.</p>
      </div>
    )
  }

  return (
    <div className={viewMode === "grid" 
      ? "columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6" 
      : "space-y-6"
    }>
      {cards.map((card) => (
        <div key={card.sequential_id} className="break-inside-avoid mb-6">
          <CardItem card={card} />
        </div>
      ))}
    </div>
  )
}
