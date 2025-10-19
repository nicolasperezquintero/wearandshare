"use client"

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, SearchIcon, Shirt, Heart, Share2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"

interface UserInterface {
  username: string
  name: string
  created_at: string
}

interface Outfit {
  id: string
  username: string
  name: string
  created_at: string
  image?: string
  clothes_count?: number
}

interface Post {
  id: number
  outfit_id: string
  description: string
  likes: number
  created_at: string
  outfits?: {
    username: string
  }
  image?: string
}

type TabType = "trending" | "top" | "users" | "outfits"

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("trending")
  const [users, setUsers] = useState<UserInterface[]>([])
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserInterface[]>([])
  const [filteredOutfits, setFilteredOutfits] = useState<Outfit[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const fetchUsers = async (query?: string) => {
    try {
      let queryBuilder = supabase.from("users").select("*")

      if (query) {
        queryBuilder = queryBuilder.or(`username.ilike.%${query}%,name.ilike.%${query}%`)
      }

      const { data, error } = await queryBuilder.limit(20)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching users:", error)
      return []
    }
  }

  const fetchOutfits = async (query?: string) => {
    try {
      let queryBuilder = supabase
        .from("outfits")
        .select(
          `
          *,
          outfits_clothes(count)
        `,
        )
        .order("created_at", { ascending: false })

      if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,username.ilike.%${query}%`)
      }

      const { data, error } = await queryBuilder.limit(20)

      if (error) throw error

      const outfitsWithImages = await Promise.all(
        (data || []).map(async (outfit) => {
          // Try to get a post image for this outfit
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
            clothes_count: outfit.outfits_clothes?.[0]?.count || 0,
          }
        }),
      )

      return outfitsWithImages
    } catch (error) {
      console.error("Error fetching outfits:", error)
      return []
    }
  }

  const fetchTopPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          outfits(*)
        `,
        )
        .order("likes", { ascending: false })
        .limit(20)

      if (error) throw error

      console.log("[v0] Fetched posts:", data)

      const postsWithImages = (data || []).map((post) => ({
        ...post,
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/posts/${post.id}/main.jpg`,
      }))

      return postsWithImages
    } catch (error) {
      console.error("Error fetching posts:", error)
      return []
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      const [usersData, outfitsData, postsData] = await Promise.all([fetchUsers(), fetchOutfits(), fetchTopPosts()])
      setUsers(usersData)
      setOutfits(outfitsData)
      setPosts(postsData)
      setLoading(false)
    }

    loadInitialData()
  }, [])

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim()) {
        setActiveTab("top")
        setLoading(true)

        const [usersData, outfitsData] = await Promise.all([fetchUsers(searchQuery), fetchOutfits(searchQuery)])

        setFilteredUsers(usersData)
        setFilteredOutfits(outfitsData)
        setLoading(false)
      } else {
        setFilteredUsers([])
        setFilteredOutfits([])
        setActiveTab("trending")
      }
    }

    const debounceTimer = setTimeout(performSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const formatNumber = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  const renderTrending = () => {
    const trendingPosts = posts.slice(0, 6)

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      )
    }

    if (trendingPosts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Shirt className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No trending posts yet</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Trending Outfits</h2>
          <p className="text-muted-foreground">Most liked outfits from the community</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {trendingPosts.map((post) => (
            <Link key={post.id} href={`/post/${post.id}`} className="relative group">
              <img
                src={post.image || "/placeholder.svg"}
                alt={post.description || "Outfit"}
                className="w-full aspect-square object-cover rounded-md"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                <div className="flex space-x-2">
                  <Button size="sm" variant="secondary">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 px-1">
                <span className="font-semibold text-sm block truncate">@{post.outfits?.username || "unknown"}</span>
                <p className="text-xs text-muted-foreground truncate">{formatNumber(post.likes)} likes</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  const renderTopResults = () => {
    if (!searchQuery.trim()) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Search for users and outfits</p>
        </div>
      )
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Searching...</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Users Section */}
        {filteredUsers.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Users</h3>
            <div className="space-y-3">
              {filteredUsers.slice(0, 5).map((user) => (
                <div key={user.username} className="flex items-center justify-between p-3 rounded-lg bg-card">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{user.name?.[0] || user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">@{user.username}</span>
                      </div>
                      {user.name && <p className="text-sm text-muted-foreground">{user.name}</p>}
                    </div>
                  </div>
                  <Link href={`/profile/${user.username}`}>
                    <Button variant="default" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outfits Section */}
        {filteredOutfits.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Outfits</h3>
            <div className="grid grid-cols-2 gap-4">
              {filteredOutfits.slice(0, 6).map((outfit) => (
                <div key={outfit.id} className="relative group">
                  <img
                    src={outfit.image || "/placeholder.svg"}
                    alt={outfit.name || "Outfit"}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="secondary">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium truncate">@{outfit.username}</p>
                    {outfit.name && <p className="text-xs text-muted-foreground truncate">{outfit.name}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredUsers.length === 0 && filteredOutfits.length === 0 && searchQuery.trim() && (
          <div className="flex flex-col items-center justify-center py-12">
            <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
          </div>
        )}
      </div>
    )
  }

  const renderUsers = () => {
    if (!searchQuery.trim()) {
      const displayUsers = users.slice(0, 20)

      if (loading) {
        return (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        )
      }

      if (displayUsers.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <Shirt className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        )
      }

      return (
        <div className="space-y-3">
          {displayUsers.map((user) => (
            <div key={user.username} className="flex items-center justify-between p-4 rounded-lg bg-card">
              <div className="flex items-center space-x-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback>{user.name?.[0] || user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-lg">@{user.username}</span>
                  </div>
                  {user.name && <p className="text-muted-foreground">{user.name}</p>}
                </div>
              </div>
              <Link href={`/profile/${user.username}`}>
                <Button variant="default">View</Button>
              </Link>
            </div>
          ))}
        </div>
      )
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Searching...</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div key={user.username} className="flex items-center justify-between p-4 rounded-lg bg-card">
            <div className="flex items-center space-x-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback>{user.name?.[0] || user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-lg">@{user.username}</span>
                </div>
                {user.name && <p className="text-muted-foreground">{user.name}</p>}
              </div>
            </div>
            <Link href={`/profile/${user.username}`}>
              <Button variant="default">View</Button>
            </Link>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Shirt className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No users found for "{searchQuery}"</p>
          </div>
        )}
      </div>
    )
  }

  const renderOutfits = () => {
    if (!searchQuery.trim()) {
      const displayOutfits = outfits.slice(0, 20)

      if (loading) {
        return (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        )
      }

      if (displayOutfits.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <Shirt className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No outfits found</p>
          </div>
        )
      }

      return (
        <div className="grid grid-cols-2 gap-4">
          {displayOutfits.map((outfit) => (
            <div key={outfit.id} className="relative group">
              <img
                src={outfit.image || "/placeholder.svg"}
                alt={outfit.name || "Outfit"}
                className="w-full aspect-square object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <div className="flex space-x-2">
                  <Button size="sm" variant="secondary">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-2">
                <span className="font-medium text-sm">@{outfit.username}</span>
                {outfit.name && <p className="text-xs text-muted-foreground truncate">{outfit.name}</p>}
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Searching...</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        {filteredOutfits.map((outfit) => (
          <div key={outfit.id} className="relative group">
            <img
              src={outfit.image || "/placeholder.svg"}
              alt={outfit.name || "Outfit"}
              className="w-full aspect-square object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <div className="flex space-x-2">
                <Button size="sm" variant="secondary">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-2">
              <span className="font-medium text-sm">@{outfit.username}</span>
              {outfit.name && <p className="text-xs text-muted-foreground truncate">{outfit.name}</p>}
            </div>
          </div>
        ))}
        {filteredOutfits.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-12">
            <Shirt className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No outfits found for "{searchQuery}"</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg pb-2 border-b border-border">
        <div className="flex items-center px-4 py-4 ">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-3">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search users and outfits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-row justify-between">
          {[
            { id: "trending", label: "Trending" },
            { id: "top", label: "Top" },
            { id: "users", label: "Users" },
            { id: "outfits", label: "Outfits" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 p-1 border rounded-md mx-1 bg-white  ${
                activeTab === tab.id ? "border-primary shadow-none" : "border-transparent shadow-lg"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="p-4">
        {activeTab === "trending" && renderTrending()}
        {activeTab === "top" && renderTopResults()}
        {activeTab === "users" && renderUsers()}
        {activeTab === "outfits" && renderOutfits()}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
