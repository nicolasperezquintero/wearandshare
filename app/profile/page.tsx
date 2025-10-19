"use client"

import Image from "next/image"
import { useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { User, Settings, Share2 } from "lucide-react"

const mockUser = {
  username: "fittly_user",
  avatar: "/images/avatar-placeholder.png",
  followers: 1280,
  following: 563,
  posts: [
    { id: 1, image: "/images/outfit1.jpg" },
    { id: 2, image: "/images/outfit2.jpg" },
    { id: 3, image: "/images/outfit3.jpg" },
    { id: 4, image: "/images/outfit4.jpg" },
    { id: 5, image: "/images/outfit1.jpg" },
  ],
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"posts" | "likes" | "clothes">("posts")

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold">Perfil</h1>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* User Info */}
      <section className="px-6 pt-6 text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-secondary">
            <Image
              src={mockUser.avatar}
              alt="User avatar"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <h2 className="text-xl font-semibold">{mockUser.username}</h2>

        {/* Followers / Following */}
        <div className="flex justify-center gap-8 text-sm">
          <div className="text-center">
            <p className="font-bold">{mockUser.followers}</p>
            <p className="text-muted-foreground">Seguidores</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{mockUser.following}</p>
            <p className="text-muted-foreground">Seguidos</p>
          </div>
        </div>

        {/* Add friends / edit buttons */}
        <div className="flex justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" className="rounded-full">
            Editar perfil
          </Button>
          <Button size="sm" className="rounded-full">
            Añadir amigos
          </Button>
        </div>
      </section>

      {/* Tabs */}
      <div className="mt-6 flex justify-around border-b border-border">
        <button
          onClick={() => setActiveTab("posts")}
          className={`py-2 text-sm font-medium ${
            activeTab === "posts" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground"
          }`}
        >
          Publicaciones
        </button>
        <button
          onClick={() => setActiveTab("likes")}
          className={`py-2 text-sm font-medium ${
            activeTab === "likes" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground"
          }`}
        >
          Likes
        </button>
        <button
          onClick={() => setActiveTab("clothes")}
          className={`py-2 text-sm font-medium ${
            activeTab === "clothes" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground"
          }`}
        >
          Prendas guardadas
        </button>
      </div>

      {/* Tab Content */}
      <section className="px-2 mt-4">
        {activeTab === "posts" && (
          <div className="grid grid-cols-3 gap-1">
            {mockUser.posts.map((post) => (
              <div key={post.id} className="aspect-square relative">
                <Image
                  src={post.image}
                  alt="User post"
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === "likes" && (
          <div className="text-center text-muted-foreground mt-10">
            Tus likes aparecerán aquí ❤️
          </div>
        )}

        {activeTab === "clothes" && (
          <div className="text-center text-muted-foreground mt-10">
            Tus prendas guardadas aparecerán aquí 👗
          </div>
        )}
      </section>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
