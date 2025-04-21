"use client"

import { Video, MessageSquare, Menu, TreesIcon as Tree, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function NavigationBar() {
  const pathname = usePathname()

  const navItems = [
    { icon: <Home className="w-6 h-6" />, href: "/", label: "Accueil" },
    { icon: <Tree className="w-6 h-6" />, href: "/mush", label: "Mush" },
    { icon: <Video className="w-6 h-6" />, href: "/videos", label: "Vidéos" },
    { icon: <MessageSquare className="w-6 h-6" />, href: "/messages", label: "Messages" },
    { icon: <Menu className="w-6 h-6" />, href: "/menu", label: "Menu" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-transparent h-16 flex items-center justify-around px-2">
      {navItems.map((item, index) => {
        const isActive = pathname === item.href || (item.href === "/mush" && pathname === "/")

        // Style spécial pour l'élément Mush
        const isMush = item.href === "/mush"

        return (
          <Link
            key={index}
            href={item.href}
            className={`relative flex flex-col items-center justify-center ${isMush ? "px-5" : "px-3"}`}
          >
            <div
              className={`
                ${isMush ? "bg-mush-green rounded-full w-12 h-12 flex items-center justify-center" : ""}
                ${isActive && !isMush ? "text-mush-green font-bold" : "text-gray-800"}
              `}
            >
              {/* Icônes blanches sur fond vert, noires sur fond jaune et blanc */}
              {isMush ? (
                <div className="text-white">{item.icon}</div>
              ) : (
                <div className="text-gray-800">{item.icon}</div>
              )}
            </div>

            {/* Étiquette de texte (visible uniquement sur les écrans plus grands) */}
            <span
              className={`text-xs mt-1 ${isActive ? "text-mush-green font-bold" : "text-gray-800"} hidden sm:block`}
            >
              {item.label}
            </span>

            {/* Badge de notification */}
            {item.badge && (
              <div className="absolute top-0 right-1 bg-mush-red text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {item.badge}
              </div>
            )}
          </Link>
        )
      })}
    </div>
  )
}
