"use client"

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, SearchIcon, Shirt, Heart, MessageCircle, Share2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface UserInterface {
  id: string
  username: string
  displayName: string
  avatar: string
  followers: number
  isVerified: boolean
  isFollowing: boolean
}

interface Outfit {
  id: string
  image: string
  username: string
  likes: number
  comments: number
  description: string
  tags: string[]
}

interface TrendingOutfit {
  id: string
  image: string
  celebrity: string
  description: string
  event: string
  likes: number
  tags: string[]
}

const mockUsers: UserInterface[] = [
  {
    id: "1",
    username: "fashionista_emma",
    displayName: "Emma Style",
    avatar: "/placeholder-user.jpg",
    followers: 125000,
    isVerified: true,
    isFollowing: false,
  },
  {
    id: "2",
    username: "streetwear_king",
    displayName: "Alex Chen",
    avatar: "/placeholder-user.jpg",
    followers: 89000,
    isVerified: false,
    isFollowing: true,
  },
  {
    id: "3",
    username: "vintage_vibes",
    displayName: "Sophie Vintage",
    avatar: "/placeholder-user.jpg",
    followers: 67000,
    isVerified: false,
    isFollowing: false,
  },
  {
    id: "4",
    username: "minimalist_style",
    displayName: "Minimalist Style",
    avatar: "/placeholder-user.jpg",
    followers: 45000,
    isVerified: false,
    isFollowing: false,
  },
]

const mockOutfits: Outfit[] = [
  {
    id: "1",
    image: "/images/outfit1.jpg",
    username: "fashionista_emma",
    likes: 1250,
    comments: 89,
    description: "Perfect summer casual look with vintage vibes",
    tags: ["summer", "casual", "vintage", "denim"],
  },
  {
    id: "2",
    image: "/images/outfit2.jpg",
    username: "streetwear_king",
    likes: 2100,
    comments: 156,
    description: "Streetwear essentials for the urban explorer",
    tags: ["streetwear", "urban", "sneakers", "hoodie"],
  },
  {
    id: "3",
    image: "/images/outfit3.jpg",
    username: "vintage_vibes",
    likes: 890,
    comments: 67,
    description: "Retro inspired outfit for a night out",
    tags: ["retro", "night-out", "dress", "vintage"],
  },
  {
    id: "4",
    image: "/images/outfit4.jpg",
    username: "minimalist_style",
    likes: 1450,
    comments: 98,
    description: "Clean and minimal office attire",
    tags: ["minimalist", "office", "professional", "clean"],
  },
]

const mockTrendingOutfits: TrendingOutfit[] = [
  {
    id: "1",
    image: "/images/outfit1.jpg",
    celebrity: "Zendaya",
    description: "Elegant red carpet look at Met Gala",
    event: "Met Gala 2024",
    likes: 125000,
    tags: ["red-carpet", "elegant", "met-gala", "couture"],
  },
  {
    id: "2",
    image: "/images/outfit2.jpg",
    celebrity: "Timothée Chalamet",
    description: "Streetwear meets high fashion",
    event: "Paris Fashion Week",
    likes: 89000,
    tags: ["streetwear", "mens-fashion", "paris", "trendy"],
  },
  {
    id: "3",
    image: "/images/outfit3.jpg",
    celebrity: "Emma Stone",
    description: "Vintage-inspired evening gown",
    event: "Oscars 2024",
    likes: 156000,
    tags: ["vintage", "evening", "oscars", "gown"],
  },
  {
    id: "4",
    image: "/images/outfit4.jpg",
    celebrity: "Harry Styles",
    description: "Bold and colorful statement look",
    event: "Grammy Awards",
    likes: 203000,
    tags: ["colorful", "statement", "grammys", "bold"],
  },
  {
    id: "5",
    image: "/images/outfit1.jpg",
    celebrity: "Lupita Nyong'o",
    description: "Stunning African-inspired design",
    event: "Cannes Film Festival",
    likes: 178000,
    tags: ["african-inspired", "cannes", "cultural", "stunning"],
  },
  {
    id: "6",
    image: "/images/outfit2.jpg",
    celebrity: "Ryan Gosling",
    description: "Classic tailored suit with modern twist",
    event: "Barbie Premiere",
    likes: 134000,
    tags: ["tailored", "classic", "modern", "premiere"],
  },
]

type TabType = "trending" | "top" | "users" | "outfits"

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("trending")
  const [filteredUsers, setFilteredUsers] = useState<UserInterface[]>([])
  const [filteredOutfits, setFilteredOutfits] = useState<Outfit[]>([])
  const router = useRouter()

  useEffect(() => {
    if (searchQuery.trim()) {
      // Switch to top tab when searching
      setActiveTab("top")

      // Filter users
      const users = mockUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredUsers(users)

      // Filter outfits
      const outfits = mockOutfits.filter(
        (outfit) =>
          outfit.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          outfit.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
          outfit.username.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredOutfits(outfits)
    } else {
      setFilteredUsers([])
      setFilteredOutfits([])
      // Switch back to trending when no search query
      setActiveTab("trending")
    }
  }, [searchQuery])

  const handleUserFollow = (userId: string) => {
    setFilteredUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user)),
    )
  }

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  const renderTrending = () => {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Trending Celebrity Outfits</h2>
          <p className="text-muted-foreground">Get inspired by the latest fashion moments</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {mockTrendingOutfits.map((outfit) => (
            <div key={outfit.id} className="relative group">
              <img
                src={outfit.image || "/placeholder.svg"}
                alt={outfit.description}
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
                <span className="font-semibold text-sm">{outfit.celebrity}</span>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{outfit.event}</p>
              </div>
            </div>
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

    return (
      <div className="space-y-6">
        {/* Users Section */}
        {filteredUsers.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Users</h3>
            <div className="space-y-3">
              {filteredUsers.slice(0, 3).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-card">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{user.username}</span>
                        {user.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            ✓
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground">{formatFollowers(user.followers)} followers</p>
                    </div>
                  </div>
                  <Button
                    variant={user.isFollowing ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleUserFollow(user.id)}
                  >
                    {user.isFollowing ? "Following" : "Follow"}
                  </Button>
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
              {filteredOutfits.slice(0, 4).map((outfit) => (
                <div key={outfit.id} className="relative group">
                  <img
                    src={outfit.image || "/placeholder.svg"}
                    alt={outfit.description}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="secondary">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium truncate">@{outfit.username}</p>
                    <p className="text-xs text-muted-foreground">{outfit.likes} likes</p>
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
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Shirt className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Search for users</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-card">
            <div className="flex items-center space-x-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback>{user.displayName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-lg">{user.username}</span>
                  {user.isVerified && (
                    <Badge variant="secondary" className="text-sm">
                      ✓
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{user.displayName}</p>
                <p className="text-sm text-muted-foreground">{formatFollowers(user.followers)} followers</p>
              </div>
            </div>
            <Button variant={user.isFollowing ? "outline" : "default"} onClick={() => handleUserFollow(user.id)}>
              {user.isFollowing ? "Following" : "Follow"}
            </Button>
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
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Shirt className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Search for outfits</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        {filteredOutfits.map((outfit) => (
          <div key={outfit.id} className="relative group">
            <img
              src={outfit.image || "/placeholder.svg"}
              alt={outfit.description}
              className="w-full aspect-square object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <div className="flex space-x-2">
                <Button size="sm" variant="secondary">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary">
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-2">
              <span className="font-medium text-sm">@{outfit.username}</span>
              <p className="text-xs text-muted-foreground">{outfit.likes} likes</p>
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
