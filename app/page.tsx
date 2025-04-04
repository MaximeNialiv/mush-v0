import { Sidebar } from "@/components/sidebar"
import { Feed } from "@/components/feed"
import { DebugPanel } from "@/components/debug-panel"

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 border-x max-w-2xl mx-auto">
        <Feed />
        <DebugPanel />
      </main>
      <div className="hidden lg:block w-80 p-4">
        <div className="bg-gray-100 rounded-lg p-4">
          <h2 className="font-bold text-xl mb-4">Tendances pour vous</h2>
          <div className="space-y-4">
            {["#Technologie", "#Actualités", "#Sports", "#Musique", "#Cinéma"].map((trend) => (
              <div key={trend} className="cursor-pointer hover:bg-gray-200 p-2 rounded">
                <p className="font-medium">{trend}</p>
                <p className="text-sm text-gray-500">1,543 posts</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

