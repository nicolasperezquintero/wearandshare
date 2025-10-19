"use client"

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import {
  Search,
  Plus,
  ShoppingBag,
  TorusIcon as TopsIcon,
  BotOffIcon as BottomsIcon,
  ShapesIcon as ShoesIcon,
  ScissorsIcon as AccessoriesIcon,
  Eye,
  EyeOff,
  ShoppingCart,
  Heart,
  Share2,
  MoreHorizontal,
  Camera,
  Check,
  X,
  Save,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabaseClient"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface ClothingItem {
  id: string
  name: string
  image: string
  category: "tops" | "bottoms" | "shoes" | "accessories"
  tags: string[]
  isPublic: boolean
  isListed: boolean
  price?: number
  description?: string
}

interface SavedOutfit {
  id: string
  name: string
  image: string
  items: ClothingItem[]
  createdAt: Date
}

const mockClothingItems: ClothingItem[] = [
  {
    id: "1",
    name: "Zebra Print Crop Top",
    image: "/images/outfit3.jpg",
    category: "tops",
    tags: ["crop-top", "zebra-print", "casual", "summer"],
    isPublic: false,
    isListed: false,
  },
  {
    id: "2",
    name: "Classic White Shirt",
    image: "/images/outfit1.jpg",
    category: "tops",
    tags: ["white", "classic", "button-down", "versatile"],
    isPublic: true,
    isListed: false,
  },
  {
    id: "3",
    name: "Black Jeans",
    image: "/images/outfit2.jpg",
    category: "bottoms",
    tags: ["jeans", "black", "slim-fit", "denim"],
    isPublic: true,
    isListed: false,
  },
  {
    id: "4",
    name: "White Sneakers",
    image: "/images/outfit3.jpg",
    category: "shoes",
    tags: ["sneakers", "white", "canvas", "casual"],
    isPublic: true,
    isListed: false,
  },
  {
    id: "5",
    name: "Hexagonal Sunglasses",
    image: "/images/outfit4.jpg",
    category: "accessories",
    tags: ["sunglasses", "hexagonal", "brown-lens", "stylish"],
    isPublic: true,
    isListed: true,
    price: 45.0,
  },
  {
    id: "6",
    name: "Gold Watch",
    image: "/images/outfit4.jpg",
    category: "accessories",
    tags: ["watch", "gold", "elegant", "timepiece"],
    isPublic: true,
    isListed: true,
    price: 120.0,
  },
]

const mockSavedOutfits: SavedOutfit[] = [
  {
    id: "1",
    name: "Casual Friday",
    image: "/images/outfit1.jpg",
    items: [mockClothingItems[1], mockClothingItems[2], mockClothingItems[3]],
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Business Meeting",
    image: "/images/outfit2.jpg",
    items: [mockClothingItems[1], mockClothingItems[2], mockClothingItems[3]],
    createdAt: new Date("2024-01-10"),
  },
]

type TabType = "clothes" | "outfits"
type CategoryType = "all" | "tops" | "bottoms" | "shoes" | "accessories"

export default function Wardrobe() {
  const [activeTab, setActiveTab] = useState<TabType>("clothes")
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [createOutfitMode, setCreateOutfitMode] = useState(false)
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<{
    tops: ClothingItem[]
    bottoms: ClothingItem[]
    shoes: ClothingItem[]
    accessories: ClothingItem[]
  }>({
    tops: [],
    bottoms: [],
    shoes: [],
    accessories: [],
  })
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [outfitName, setOutfitName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([])
  const [isLoadingOutfits, setIsLoadingOutfits] = useState(false)
  const router = useRouter()

  const categories = [
    { id: "all", label: "All", icon: ShoppingBag, color: "bg-green-500" },
    { id: "tops", label: "Tops", icon: TopsIcon, color: "bg-orange-500" },
    {
      id: "bottoms",
      label: "Bottoms",
      icon: BottomsIcon,
      color: "bg-amber-600",
    },
    { id: "shoes", label: "Shoes", icon: ShoesIcon, color: "bg-black" },
    {
      id: "accessories",
      label: "Acc",
      icon: AccessoriesIcon,
      color: "bg-green-500",
    },
  ]

  useEffect(() => {
    fetchClothes()
  }, [])

  useEffect(() => {
    if (activeTab === "outfits") {
      fetchSavedOutfits()
    }
  }, [activeTab])

  const fetchClothes = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("clothes").select("*").order("created_at", { ascending: false })

      if (error) throw error

      console.log("[v0] Fetched clothes data:", data)

      const items: ClothingItem[] = data.map((item) => {
        const { data: imageData } = supabase.storage.from("clothes").getPublicUrl(`${item.id}/main.jpg`)

        let category: "tops" | "bottoms" | "shoes" | "accessories" = "accessories"
        if (item.type === "top") category = "tops"
        else if (item.type === "bottom") category = "bottoms"
        else if (item.type === "shoe")
          category = "shoes" // Added singular "shoe" mapping
        else if (item.type === "shoes") category = "shoes"
        else if (item.type === "accessories") category = "accessories"
        else if (item.type === "tops") category = "tops"
        else if (item.type === "bottoms") category = "bottoms"

        console.log("[v0] Item:", item.name, "Type:", item.type, "Mapped category:", category)

        return {
          id: item.id.toString(),
          name: item.name || "Unnamed Item",
          image: imageData.publicUrl,
          category,
          tags: item.description ? item.description.split(",").map((t: string) => t.trim()) : [],
          isPublic: item.public ?? false,
          isListed: item.selling ?? false,
          description: item.description,
        }
      })

      console.log("[v0] Mapped clothing items:", items)
      setClothingItems(items)
    } catch (error) {
      console.error("Error fetching clothes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSavedOutfits = async () => {
    try {
      setIsLoadingOutfits(true)
      console.log("[v0] Fetching saved outfits...")

      const { data: outfitsData, error: outfitsError } = await supabase
        .from("outfits")
        .select("*")
        .order("created_at", { ascending: false })

      if (outfitsError) throw outfitsError

      console.log("[v0] Fetched outfits:", outfitsData)

      const outfitsWithClothes = await Promise.all(
        outfitsData.map(async (outfit) => {
          const { data: linksData, error: linksError } = await supabase
            .from("outfits_clothes")
            .select("cloth_id")
            .eq("outfit_id", outfit.id)

          if (linksError) {
            console.error("[v0] Error fetching outfit links:", linksError)
            return null
          }

          console.log("[v0] Outfit", outfit.id, "links:", linksData)

          const clothIds = linksData.map((link) => link.cloth_id)
          if (clothIds.length === 0) return null

          const { data: clothesData, error: clothesError } = await supabase
            .from("clothes")
            .select("*")
            .in("id", clothIds)

          if (clothesError) {
            console.error("[v0] Error fetching clothes:", clothesError)
            return null
          }

          console.log("[v0] Outfit", outfit.id, "clothes:", clothesData)

          const items: ClothingItem[] = clothesData.map((item) => {
            const { data: imageData } = supabase.storage.from("clothes").getPublicUrl(`${item.id}/main.jpg`)

            let category: "tops" | "bottoms" | "shoes" | "accessories" = "accessories"
            if (item.type === "top") category = "tops"
            else if (item.type === "bottom") category = "bottoms"
            else if (item.type === "shoe") category = "shoes"
            else if (item.type === "shoes") category = "shoes"
            else if (item.type === "accessories") category = "accessories"
            else if (item.type === "tops") category = "tops"
            else if (item.type === "bottoms") category = "bottoms"

            return {
              id: item.id.toString(),
              name: item.name || "Unnamed Item",
              image: imageData.publicUrl,
              category,
              tags: item.description ? item.description.split(",").map((t: string) => t.trim()) : [],
              isPublic: item.public ?? false,
              isListed: item.selling ?? false,
              description: item.description,
            }
          })

          const thumbnailImage = items[0]?.image || "/placeholder.svg"

          return {
            id: outfit.id,
            name: outfit.name || "Unnamed Outfit",
            image: thumbnailImage,
            items,
            createdAt: new Date(outfit.created_at),
          }
        }),
      )

      const validOutfits = outfitsWithClothes.filter((o) => o !== null) as SavedOutfit[]
      console.log("[v0] Valid outfits:", validOutfits)
      setSavedOutfits(validOutfits)
    } catch (error) {
      console.error("[v0] Error fetching saved outfits:", error)
    } finally {
      setIsLoadingOutfits(false)
    }
  }

  const filteredItems = clothingItems.filter((item) => {
    const matchesCategory = createOutfitMode ? true : activeCategory === "all" || item.category === activeCategory
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const handleItemSelect = (item: ClothingItem) => {
    if (!createOutfitMode) return

    const category = item.category as keyof typeof selectedItems
    const currentSelection = selectedItems[category] || []

    if (category === "tops" || category === "bottoms" || category === "shoes") {
      setSelectedItems((prev) => ({
        ...prev,
        [category]: [item],
      }))
    } else if (category === "accessories") {
      setSelectedItems((prev) => ({
        ...prev,
        [category]: [...currentSelection, item],
      }))
    }
  }

  const handleItemDeselect = (item: ClothingItem, category: keyof typeof selectedItems) => {
    setSelectedItems((prev) => ({
      ...prev,
      [category]: (prev[category] || []).filter((i) => i.id !== item.id),
    }))
  }

  const toggleItemPrivacy = async (itemId: string) => {
    const item = clothingItems.find((i) => i.id === itemId)
    if (!item) return

    const { error } = await supabase
      .from("clothes")
      .update({ public: !item.isPublic })
      .eq("id", Number.parseInt(itemId))

    if (error) {
      console.error("Error updating privacy:", error)
    } else {
      setClothingItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, isPublic: !i.isPublic } : i)))
    }
  }

  const toggleItemListing = async (itemId: string) => {
    const item = clothingItems.find((i) => i.id === itemId)
    if (!item) return

    const { error } = await supabase
      .from("clothes")
      .update({ selling: !item.isListed })
      .eq("id", Number.parseInt(itemId))

    if (error) {
      console.error("Error updating listing:", error)
    } else {
      setClothingItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, isListed: !i.isListed } : i)))
    }
  }

  const canCreateOutfit = () => {
    return selectedItems.tops.length === 1 && selectedItems.bottoms.length === 1 && selectedItems.shoes.length === 1
  }

  const handleSaveOutfit = async () => {
    if (!outfitName.trim()) {
      alert("Please enter an outfit name")
      return
    }

    try {
      setIsSaving(true)

      const { data: outfitData, error: outfitError } = await supabase
        .from("outfits")
        .insert({
          username: "nicoperez", // TODO: Get from auth
          name: outfitName,
        })
        .select()
        .single()

      if (outfitError) throw outfitError

      const allSelectedItems = [
        ...selectedItems.tops,
        ...selectedItems.bottoms,
        ...selectedItems.shoes,
        ...selectedItems.accessories,
      ]

      const outfitClothesRecords = allSelectedItems.map((item) => ({
        outfit_id: outfitData.id,
        cloth_id: Number.parseInt(item.id),
      }))

      const { error: linkError } = await supabase.from("outfits_clothes").insert(outfitClothesRecords)

      if (linkError) throw linkError

      setShowSaveDialog(false)
      setOutfitName("")
      setCreateOutfitMode(false)
      setSelectedItems({
        tops: [],
        bottoms: [],
        shoes: [],
        accessories: [],
      })

      fetchSavedOutfits()
      alert("Outfit saved successfully!")
    } catch (error) {
      console.error("Error saving outfit:", error)
      alert("Failed to save outfit. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const renderClothingItem = (item: ClothingItem) => (
    <div key={item.id} className="bg-white rounded-lg p-2 shadow-sm border flex flex-col">
      <div className="relative">
        <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-24 object-cover rounded-md" />
        {createOutfitMode && (
          <div className="absolute top-1 right-1">
            <Button
              size="sm"
              variant={
                selectedItems[item.category as keyof typeof selectedItems]?.some((i) => i.id === item.id)
                  ? "default"
                  : "outline"
              }
              onClick={() => {
                const isSelected =
                  selectedItems[item.category as keyof typeof selectedItems]?.some((i) => i.id === item.id) || false
                if (isSelected) {
                  handleItemDeselect(item, item.category as keyof typeof selectedItems)
                } else {
                  handleItemSelect(item)
                }
              }}
              className="h-6 w-6 p-0 rounded-full"
            >
              {selectedItems[item.category as keyof typeof selectedItems]?.some((i) => i.id === item.id) ? (
                <Check className="h-3 w-3" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}
        <div className="absolute top-1 left-1 flex gap-1">
          {item.isPublic ? <Eye className="h-3 w-3 text-green-600" /> : <EyeOff className="h-3 w-3 text-gray-400" />}
          {item.isListed && <ShoppingCart className="h-3 w-3 text-blue-600" />}
        </div>
      </div>

      <div className="mt-1 flex flex-col flex-1">
        <h3 className="font-semibold text-xs line-clamp-1">{item.name}</h3>
        <div className={`flex items-center mt-auto pt-2 ${item.price ? "justify-between" : "justify-end"}`}>
          {item.price && <p className="text-xs font-semibold text-green-600">${item.price}</p>}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => toggleItemPrivacy(item.id)}>
                {item.isPublic ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {item.isPublic ? "Make Private" : "Make Public"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleItemListing(item.id)}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                {item.isListed ? "Remove from Sale" : "List for Sale"}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Heart className="h-4 w-4 mr-2" />
                Add to Favorites
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )

  const renderCreateOutfitMode = () => (
    <div className="fixed bottom-20 left-4 right-4 z-50 flex gap-2 pb-4">
      <Button
        variant="secondary"
        className="flex-1 border-border border shadow-lg"
        onClick={() => setCreateOutfitMode(false)}
      >
        <X className="h-4 w-4 mr-2" />
        Cancel
      </Button>
      <Button
        variant="outline"
        className={`flex-1 border-border border shadow-lg ${!canCreateOutfit() ? "bg-gray-300 opacity-50" : ""}`}
        disabled={!canCreateOutfit()}
        onClick={() => setShowSaveDialog(true)}
      >
        <Save className="h-4 w-4 mr-2" />
        Save
      </Button>
      <Button
        className={`flex-1 border-border border shadow-lg ${!canCreateOutfit() ? "bg-gray-300 opacity-50" : ""}`}
        disabled={!canCreateOutfit()}
        onClick={() => {
          const allSelectedItems = [
            ...selectedItems.tops,
            ...selectedItems.bottoms,
            ...selectedItems.shoes,
            ...selectedItems.accessories,
          ]
          const itemNames = allSelectedItems.map((item) => item.name).join(",")
          router.push(
            `/try-outfit?outfit=${encodeURIComponent("/images/outfit1.jpg")}&items=${encodeURIComponent(itemNames)}`,
          )
        }}
      >
        <Camera className="h-4 w-4 mr-2" />
        Try On
      </Button>
    </div>
  )

  const renderItemsByCategory = () => {
    const categories = [
      { key: "tops", label: "Tops", icon: TopsIcon },
      { key: "bottoms", label: "Bottoms", icon: BottomsIcon },
      { key: "shoes", label: "Shoes", icon: ShoesIcon },
      { key: "accessories", label: "Accessories", icon: AccessoriesIcon },
    ] as const

    console.log("[v0] Rendering items by category. Total filtered items:", filteredItems.length)

    return categories.map((cat) => {
      const items = filteredItems.filter((item) => item.category === cat.key)
      console.log(
        "[v0] Category:",
        cat.key,
        "Items:",
        items.length,
        items.map((i) => i.name),
      )

      if (items.length === 0) return null

      const Icon = cat.icon
      return (
        <div key={cat.key} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase">{cat.label}</h3>
            <span className="text-xs text-muted-foreground">({items.length})</span>
          </div>
          <div className="grid grid-cols-3 gap-3">{items.map(renderClothingItem)}</div>
        </div>
      )
    })
  }

  const renderSavedOutfit = (outfit: SavedOutfit) => (
    <div key={outfit.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="relative h-48">
        <img src={outfit.image || "/placeholder.svg"} alt={outfit.name} className="w-full h-full object-cover" />
        <Button
          size="sm"
          className="absolute top-2 right-2 h-8 px-3 bg-white/90 hover:bg-white text-foreground shadow-md"
          onClick={() => {
            const itemIds = outfit.items.map((item) => item.id).join(",")
            router.push(`/try-outfit?outfit=${encodeURIComponent(outfit.image)}&items=${encodeURIComponent(itemIds)}`)
          }}
        >
          <Camera className="h-3 w-3 mr-1" />
          Try On
        </Button>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm mb-1">{outfit.name}</h3>
        <p className="text-xs text-muted-foreground mb-2">
          {outfit.items.length} items • {outfit.createdAt.toLocaleDateString()}
        </p>
        <div className="flex gap-1 flex-wrap">
          {outfit.items.slice(0, 3).map((item) => (
            <div key={item.id} className="w-8 h-8 rounded border overflow-hidden">
              <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
            </div>
          ))}
          {outfit.items.length > 3 && (
            <div className="w-8 h-8 rounded border bg-gray-100 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">+{outfit.items.length - 3}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search your wardrobe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2"
              />
            </div>
            <Button size="sm" variant="outline" className="flex-shrink-0 bg-transparent">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="flex space-x-4 justify-center overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id as CategoryType)}
                  className={`flex flex-col items-center space-y-1 min-w-0 flex-shrink-0 ${
                    activeCategory === category.id ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      activeCategory === category.id ? category.color : "bg-gray-200"
                    }`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-medium">{category.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("clothes")}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === "clothes"
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Clothes
          </button>
          <button
            onClick={() => setActiveTab("outfits")}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === "outfits"
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Saved Outfits
          </button>
        </div>
      </header>

      <div className={`p-4 ${createOutfitMode ? "pb-32" : ""}`}>
        {activeTab === "clothes" && (
          <div>
            {!createOutfitMode && (
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Your Clothes</h2>
                <Button onClick={() => setCreateOutfitMode(true)} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Outfit
                </Button>
              </div>
            )}

            {createOutfitMode && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Select items to create your outfit. Choose 1 top, 1 bottom, 1 shoe, and any accessories.
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-muted-foreground">Loading your wardrobe...</div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No items found</p>
                <p className="text-sm text-muted-foreground">Add some clothes to get started!</p>
              </div>
            ) : createOutfitMode ? (
              renderItemsByCategory()
            ) : (
              <div className="grid grid-cols-3 gap-3">{filteredItems.map(renderClothingItem)}</div>
            )}
          </div>
        )}

        {activeTab === "outfits" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Saved Outfits</h2>
            {isLoadingOutfits ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-muted-foreground">Loading your outfits...</div>
              </div>
            ) : savedOutfits.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No saved outfits yet</p>
                <p className="text-sm">Create your first outfit to see it here!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">{savedOutfits.map(renderSavedOutfit)}</div>
            )}
          </div>
        )}
      </div>

      {createOutfitMode && renderCreateOutfitMode()}

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Outfit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="outfit-name" className="text-sm font-medium">
                Outfit Name
              </label>
              <Input
                id="outfit-name"
                placeholder="e.g., Casual Friday, Date Night"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveOutfit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Outfit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  )
}
