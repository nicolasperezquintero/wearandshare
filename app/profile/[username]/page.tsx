"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Heart, Shirt } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

interface UserData {
  username: string
  name: string
  created_at: string
}

interface Post {
  id: number
  outfit_id: string
  description: string
  likes: number
  created_at: string
  image?: string
}

interface Outfit {
  id: string
  username: string
  name: string
  created_at: string
  image?: string
}

interface Cloth {
  id: number
  name: string
  description: string | null
  type: string
  username: string
  public: boolean
  selling: boolean
  created_at: string
  image?: string
}

type TabType = "posts" | "wardrobe"

export default function UserProfile() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string

  const [user, setUser] = useState<UserData | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [clothes, setClothes] = useState<Cloth[]>([])
  const [activeTab, setActiveTab] = useState<TabType>("posts")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    posts: 0,
    totalLikes: 0,
  })

  useEffect(() => {
    const fetchUserData = async () => {
      if (!username) return

      setLoading(true)

      try {
        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .single()

        if (userError) throw userError
        setUser(userData)

        // Fetch user's posts
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select(
            `
            *,
            outfits!inner(username)
          `,
          )
          .eq("outfits.username", username)
          .order("created_at", { ascending: false })

        if (postsError) throw postsError

        const postsWithImages = (postsData || []).map((post) => ({
          ...post,
          image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/posts/${post.id}/main.jpg`,
        }))

        setPosts(postsWithImages)

        // Fetch user's outfits
        const { data: outfitsData, error: outfitsError } = await supabase
          .from("outfits")
          .select("*")
          .eq("username", username)
          .order("created_at", { ascending: false })

        if (outfitsError) throw outfitsError

        // Get images for outfits from posts
        const outfitsWithImages = await Promise.all(
          (outfitsData || []).map(async (outfit) => {
            const { data: postData } = await supabase
              .from("posts")
              .select("id")
              .eq("outfit_id", outfit.id)
              .limit(1)
              .single()

            const imageUrl = postData
              ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/posts/${postData.id}/main.jpg`
              : "/placeholder.svg"

            return {
              ...outfit,
              image: imageUrl,
            }
          }),
        )

        // Fetch user's clothes
        const { data: clothesData, error: clothesError } = await supabase
          .from("clothes")
          .select("*")
          .eq("username", username)
          .order("created_at", { ascending: false })

        if (clothesError) throw clothesError

        const clothesWithImages = (clothesData || []).map((cloth) => ({
          ...cloth,
          image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/clothes/${cloth.id}/main.jpg`,
        }))

        setClothes(clothesWithImages)

        // Calculate stats
        const totalLikes = postsWithImages.reduce((sum, post) => sum + (post.likes || 0), 0)
        setStats({
          posts: postsWithImages.length,
          totalLikes,
        })
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [username])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando perfil...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Shirt className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">Usuario no encontrado</p>
        <Button onClick={() => router.back()}>Volver</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg border-b border-border bg-background/80">
        <div className="flex items-center justify-between px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">@{user.username}</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Profile Info */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between mb-6">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-2xl">{user.name?.[0] || user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold mb-1">{user.name || user.username}</h2>
          <p className="text-muted-foreground">@{user.username}</p>
        </div>

        {/* Stats */}
        <div className="flex justify-around py-4 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.posts}</div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.totalLikes}</div>
            <div className="text-sm text-muted-foreground">Likes</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex-1 py-4 text-center font-medium transition-colors ${
            activeTab === "posts"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => setActiveTab("wardrobe")}
          className={`flex-1 py-4 text-center font-medium transition-colors ${
            activeTab === "wardrobe"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Wardrobe
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "posts" && (
          <div className="grid grid-cols-3 gap-1">
            {posts.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-12">
                <Shirt className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay posts aún</p>
              </div>
            ) : (
              posts.map((post) => (
                <Link key={post.id} href={`/post/${post.id}`} className="relative aspect-square group">
                  <img src={post.image || "/placeholder.svg"} alt="Post" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center space-x-4 text-white">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-5 w-5 fill-white" />
                        <span className="font-semibold">{post.likes}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === "wardrobe" && (
          <div className="grid grid-cols-3 gap-2">
            {clothes.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-12">
                <Shirt className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay prendas aún</p>
              </div>
            ) : (
              clothes.map((cloth) => (
                <div key={cloth.id} className="relative group">
                  <img
                    src={cloth.image || "/placeholder.svg"}
                    alt={cloth.name}
                    className="w-full aspect-square object-cover rounded-lg bg-white"
                  />
                  <div className="mt-1">
                    <p className="text-xs font-medium truncate">{cloth.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{cloth.type}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
