import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  HomeIcon, 
  BellIcon, 
  MailIcon, 
  UserIcon, 
  SearchIcon, 
  BookmarkIcon, 
  MoreHorizontalIcon, 
  PenSquareIcon 
} from "@/components/ui/icon"

export function Sidebar() {
  const navItems = [
    { icon: <HomeIcon size="lg" />, label: "Accueil", href: "/" },
    { icon: <SearchIcon size="lg" />, label: "Explorer", href: "/explore" },
    { icon: <BellIcon size="lg" />, label: "Notifications", href: "/notifications" },
    { icon: <MailIcon size="lg" />, label: "Messages", href: "/messages" },
    { icon: <BookmarkIcon size="lg" />, label: "Signets", href: "/bookmarks" },
    { icon: <UserIcon size="lg" />, label: "Profil", href: "/profile" },
    { icon: <MoreHorizontalIcon size="lg" />, label: "Plus", href: "/more" },
  ]

  return (
    <div className="w-20 lg:w-64 p-4 sticky top-0 h-screen">
      <div className="flex flex-col h-full">
        <Link
          href="/"
          className="mb-4 p-2 rounded-full hover:bg-gray-200 inline-flex w-12 h-12 items-center justify-center"
        >
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-sky-500" fill="currentColor">
            <g>
              <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path>
            </g>
          </svg>
        </Link>
        <nav className="space-y-2 mb-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center p-3 rounded-full hover:bg-gray-200 transition-colors"
            >
              {item.icon}
              <span className="ml-4 text-xl hidden lg:inline">{item.label}</span>
            </Link>
          ))}
        </nav>
        <Button className="rounded-full bg-sky-500 hover:bg-sky-600 mt-4 py-6 lg:py-4">
          <PenSquareIcon size="lg" className="lg:hidden" />
          <span className="hidden lg:inline font-bold">Poster</span>
        </Button>
        <div className="mt-auto mb-4">
          <div className="flex items-center p-3 rounded-full hover:bg-gray-200 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gray-300"></div>
            <div className="ml-3 hidden lg:block">
              <p className="font-bold">Utilisateur</p>
              <p className="text-gray-500">@utilisateur</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

