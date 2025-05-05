"use client"

import { CardList } from "@/components/card-list"
import { DataStatus } from "@/components/data-status"

interface CardContainerProps {
  folderId?: string
}

export function CardContainer({ folderId }: CardContainerProps) {
  return (
    <>
      <div className="relative">
        {/* Fond décoratif en origami - maintenant présent sur toutes les pages */}
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-mush-green/20 rounded-lg transform rotate-12 -z-10"></div>
        <div className="absolute top-12 -right-8 w-40 h-40 bg-mush-yellow/20 rounded-lg transform -rotate-6 -z-10"></div>
        <CardList folderId={folderId} />
      </div>
      <div className="mt-4 mb-16">
        <DataStatus />
      </div>
    </>
  )
}
