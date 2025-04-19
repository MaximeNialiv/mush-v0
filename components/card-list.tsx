"use client"

import { useCards } from "@/hooks/use-cards"
import { useAtom } from "jotai"
import { viewModeAtom } from "@/store/atoms"
import { CardItem } from "@/components/card-item"
import { Loader2 } from "lucide-react"

export function CardList() {
  const { cards, loading, error } = useCards()
  const [viewMode] = useAtom(viewModeAtom)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-mush-green" />
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
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-white p-3 rounded-lg" 
      : "space-y-4"
    }>
      {cards.map((card) => (
        <CardItem key={card.sequential_id} card={card} />
      ))}
    </div>
  )
}
