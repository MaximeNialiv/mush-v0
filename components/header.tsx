"use client"

import { useAtom } from "jotai"
import { mushroomCountAtom, viewModeAtom } from "@/store/atoms"
import { Search, Grid, List, Bell } from "lucide-react"
import { UserProfileMenu } from "@/components/user-profile-menu"

export function Header() {
  const [mushroomCount] = useAtom(mushroomCountAtom)
  const [viewMode, setViewMode] = useAtom(viewModeAtom)

  return (
    <header className="sticky top-0 z-10 bg-white shadow-md border-b-2 border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo et titre */}
          <div className="flex flex-col">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-mush-green flex items-center justify-center mr-2 shadow-md">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <h1 className="text-xl font-bold">Mush•Quizz</h1>
            </div>
            <span className="text-sm text-gray-600">Ateliers &gt; Mush</span>
          </div>

          {/* Barre de recherche */}
          <div className="hidden md:flex relative flex-1 max-w-md mx-4">
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full py-2 pl-10 pr-4 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-mush-green shadow-sm"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Boutons de vue */}
            <div className="hidden md:flex bg-gray-100 rounded-lg p-1 shadow-inner">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md ${viewMode === "list" ? "bg-white shadow-md" : ""}`}
              >
                <List className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md ${viewMode === "grid" ? "bg-white shadow-md" : ""}`}
              >
                <Grid className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-full hover:bg-gray-100">
              <Bell className="h-5 w-5 text-gray-700" />
              <span className="absolute top-0 right-0 w-5 h-5 bg-mush-red rounded-full text-white text-xs flex items-center justify-center font-bold shadow-sm">
                2
              </span>
            </button>

            {/* Compteur de champignons */}
            <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full border-2 border-gray-200 shadow-sm">
              <span className="text-mush-red text-xl mr-1.5">🍄</span>
              <span className="font-bold">{mushroomCount}</span>
            </div>

            {/* Menu de profil utilisateur */}
            <UserProfileMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
