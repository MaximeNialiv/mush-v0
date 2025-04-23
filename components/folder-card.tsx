"use client"

import { CardWithContent } from "@/types"
import { Folder, ChevronRight } from "lucide-react"

interface FolderCardProps {
  folder: CardWithContent
  onNavigate: () => void
}

export function FolderCard({ folder, onNavigate }: FolderCardProps) {
  return (
    <div 
      className="bg-white rounded-3xl p-4 shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-100"
      onClick={onNavigate}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-mush-green/10 flex items-center justify-center">
            <Folder className="h-5 w-5 text-mush-green" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{folder.title}</h3>
            {folder.description && (
              <p className="text-sm text-gray-500 line-clamp-1">{folder.description}</p>
            )}
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
      
      {/* Informations supplémentaires */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <span>Créé par {folder.ownerName}</span>
        </div>
        <div>
          {new Date(folder.created_at).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      </div>
    </div>
  )
}
