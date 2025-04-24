"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Image, MapPin, Smile, Calendar } from "lucide-react"

export function ComposeBox({ onTweet }: { onTweet: (tweet: string) => void }) {
  const [content, setContent] = useState("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (content.trim()) {
      onTweet(content)
      setContent("")
    }
  }

  return (
    <div className="p-4 border-b">
      <div className="flex">
        <div className="mr-4">
          <div className="w-12 h-12 rounded-full bg-gray-300"></div>
        </div>
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              className="w-full border-b border-transparent focus:border-gray-200 text-xl p-2 outline-none resize-none"
              placeholder="Quoi de neuf ?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex space-x-2 text-sky-500">
                <button type="button" className="p-2 rounded-full hover:bg-sky-50">
                  <Image className="h-5 w-5" />
                </button>
                <button type="button" className="p-2 rounded-full hover:bg-sky-50">
                  <MapPin className="h-5 w-5" />
                </button>
                <button type="button" className="p-2 rounded-full hover:bg-sky-50">
                  <Smile className="h-5 w-5" />
                </button>
                <button type="button" className="p-2 rounded-full hover:bg-sky-50">
                  <Calendar className="h-5 w-5" />
                </button>
              </div>
              <Button
                type="submit"
                disabled={!content.trim()}
                className="rounded-full bg-sky-500 hover:bg-sky-600 px-5"
              >
                Poster
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

