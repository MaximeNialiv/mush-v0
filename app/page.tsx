import { Header } from "@/components/header"
import { NavigationBar } from "@/components/navigation-bar"
import { CardList } from "@/components/card-list"
import { DataStatus } from "@/components/data-status"
import { JotaiProvider } from "./jotai-provider"

export default function Home() {
  return (
    <JotaiProvider>
      <div className="flex flex-col min-h-screen bg-mush-green/10">
        <Header />
        <main className="flex-1 container mx-auto p-4 pb-20 max-w-5xl">
          <div className="relative">
            {/* Fond décoratif en origami */}
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-mush-green/20 rounded-lg transform rotate-12 -z-10"></div>
            <div className="absolute top-12 -right-8 w-40 h-40 bg-mush-yellow/20 rounded-lg transform -rotate-6 -z-10"></div>
            <CardList />
          </div>
          <div className="mt-4 mb-16">
            <DataStatus />
          </div>
        </main>
        <NavigationBar />
      </div>
    </JotaiProvider>
  )
}
