"use client"

import { FolderView } from "@/components/folder-view"
import { Header } from "@/components/header"

export default function FolderPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <main className="mt-8">
        <FolderView />
      </main>
    </div>
  )
}
