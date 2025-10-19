"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Heart, Share2, Shirt } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"

interface Post {
  id: number
  outfit_id: string
  description: string
  likes: number
  created_at: string
  outfits?: {
    id: string
    username: string
    name: string
  }
}

interface Cloth {
  id: number
  name: string
  type: string
}

export default function PostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null)
  const [clothes, setClothes] = useState<Cloth[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)

        // Fetch post with outfit data
        const { data: postData, error: postError } = await supabase
          .from("posts")
          .select(
            `
            *,
            outfits(*)
          `,
          )
          .eq("id", params.id)
          .single()

        if (postError) throw postError

        setPost(postData)

        // Fetch outfit clothes
        if (postData.outfit_id) {
          const { data: clothesData, error: clothesError } = await supabase
            .from("outfits_clothes")
            .select(
              `
              clothes(*)
            `,
            )
            .eq("outfit_id", postData.outfit_id)

          if (clothesError) throw clothesError

          const clothesList = clothesData.map((item: any) => item.clothes).filter(Boolean)
          setClothes(clothesList)
        }
      } catch (error) {
        console.error("Error fetching post:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.id])

  const handleLike = () => {
    setLiked(!liked)
    // TODO: Implement actual like functionality with database update
  }

  const formatNumber = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Shirt className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Post not found</h2>
        <p className="text-muted-foreground mb-6">This post may have been deleted or doesn't exist.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/posts/${post.id}/main.jpg`

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Post</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Post Image */}
      <div className="relative w-full aspect-square bg-muted">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={post.description || "Post"}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Post Content */}
      <div className="p-4 space-y-4">
        {/* User Info */}
        <Link href={`/profile/${post.outfits?.username}`} className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{post.outfits?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">@{post.outfits?.username || "unknown"}</p>
            {post.outfits?.name && <p className="text-sm text-muted-foreground">{post.outfits.name}</p>}
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleLike} className={liked ? "text-red-500" : ""}>
            <Heart className={`h-5 w-5 mr-2 ${liked ? "fill-current" : ""}`} />
            {formatNumber(post.likes + (liked ? 1 : 0))}
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="h-5 w-5 mr-2" />
            Share
          </Button>
        </div>

        {/* Description */}
        {post.description && (
          <div>
            <p className="text-sm">
              <span className="font-semibold">@{post.outfits?.username || "unknown"}</span>{" "}
              <span className="text-foreground">{post.description}</span>
            </p>
          </div>
        )}

        {/* Outfit Details */}
        {post.outfits && (
          <div className="border-t border-border pt-4">
            <h3 className="font-semibold mb-3">Outfit Details</h3>
            <div className="bg-card rounded-lg p-4 space-y-2">
              <p className="text-sm">
                <span className="text-muted-foreground">Name:</span>{" "}
                <span className="font-medium">{post.outfits.name}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Items:</span>{" "}
                <span className="font-medium">{clothes.length} pieces</span>
              </p>
            </div>
          </div>
        )}

        {/* Outfit Items */}
        {clothes.length > 0 && (
          <div className="border-t border-border pt-4">
            <h3 className="font-semibold mb-3">Items in this Outfit</h3>
            <div className="space-y-2">
              {clothes.map((cloth) => (
                <div key={cloth.id} className="flex items-center justify-between p-3 bg-card rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{cloth.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{cloth.type}</p>
                  </div>
                  <Shirt className="h-5 w-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posted Date */}
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Posted on{" "}
            {new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>
    </div>
  )
}
