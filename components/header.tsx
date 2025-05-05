"use client"

import { useAtom } from "jotai"
import { mushroomCountAtom, viewModeAtom, currentFolderIdAtom } from "@/store/atoms"
import { Search, Grid, List, Bell } from "lucide-react"
import Link from "next/link"
import { UserProfileMenu } from "@/components/user-profile-menu"
import { usePathname, useParams } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"

export function Header() {
  const [mushroomCount] = useAtom(mushroomCountAtom)
  const [viewMode, setViewMode] = useAtom(viewModeAtom)
  const [currentFolderId] = useAtom(currentFolderIdAtom)
  const pathname = usePathname()
  const params = useParams()
  
  // Récupérer l'ID du dossier actuel depuis les paramètres d'URL
  const folderId = params?.folderId as string

  return (
    <header className="sticky top-0 z-10 bg-white shadow-md border-b-2 border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo et breadcrumb (gauche) */}
          <div className="flex-1">
            <Breadcrumb currentFolderId={folderId} />
          </div>
          
          {/* Barre de recherche et contrôles (droite) */}
          <div className="flex items-center space-x-4">
            {/* Barre de recherche */}
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Rechercher... (wip)"
                className="w-full py-2 pl-10 pr-4 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-mush-green shadow-sm"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
            </div>

            {/* Boutons de vue */}
            <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                aria-label="Vue liste"
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                aria-label="Vue grille"
              >
                <Grid className="h-5 w-5" />
              </button>
            </div>

            {/* Compteur de champignons */}
            <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full border-2 border-gray-200 shadow-sm">
              <span className="text-mush-red text-xl mr-1.5">🍄</span>
              <span className="font-bold">{mushroomCount}/13</span>
            </div>

            {/* Menu utilisateur */}
            <div>
              <UserProfileMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
