"use client"

import { CardList } from "@/components/card-list"
import { Header } from "@/components/header"
import { useParams } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"

export default function FolderPage() {
  const params = useParams()
  const folderId = params.folderId as string
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <main className="mt-8">
        <div className="mb-4">
          <Breadcrumb currentFolderId={folderId} />
        </div>
        <CardList folderId={folderId} />
      </main>
    </div>
  )
}
