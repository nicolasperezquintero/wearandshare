"use client"

import { Heart, Sparkles, Shirt, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { supabase } from "@/lib/supabaseClient"

interface ClothingItem {
  id: number
  name: string
  type: string
}

interface OutfitClothes {
  id: number
  clothes: ClothingItem
}

interface Outfit {
  id: string
  outfits_clothes: OutfitClothes[]
  username: string
}

interface OutfitCardProps {
  id: number
  created_at: string
  likes: number
  description: string
  outfit_id: string
  outfits: Outfit
  gallery?: any[]
  outfit: any
}

export const OutfitCard = ({
  id,
  created_at,
  likes,
  description,
  outfit_id,
  outfits,
  gallery = [],
  outfit,
}: OutfitCardProps) => {
  // Ensure gallery is an array
  const safeGallery = Array.isArray(gallery) ? gallery : []

  // Extract clothes from the new data structure
  const clothes =
    outfits?.outfits_clothes?.map((outfitClothes) => ({
      id: outfitClothes.clothes.id,
      name: outfitClothes.clothes.name,
      category: outfitClothes.clothes.type,
    })) || []

  const mainImageUrl = useMemo(() => {
    const mainImageFromGallery = safeGallery.find((img) => img.name === "main.jpg")
    const mainImagePath = mainImageFromGallery ? `${id}/main.jpg` : null

    return mainImagePath
      ? supabase.storage.from("posts").getPublicUrl(mainImagePath).data.publicUrl
      : "/placeholder.svg"
  }, [id, safeGallery])

  const altImages = useMemo(() => {
    return safeGallery.filter((img) => img.name.startsWith("alt"))
  }, [safeGallery])

  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(likes)
  const [selectedImage, setSelectedImage] = useState(mainImageUrl)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const router = useRouter()

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
  }

  const handleTryItem = (itemName: string) => {
    router.push(`/try-outfit?outfit=${id.toString()}&item=${encodeURIComponent(itemName)}`)
    setIsDrawerOpen(false)
  }

  const handleTryWholeOutfit = () => {
    router.push(`/try-outfit?outfit=${id.toString()}`)
    setIsDrawerOpen(false)
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm overflow-hidden w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <p className="font-semibold">@{outfits.username}</p>
      </div>

      {/* Imagen principal */}
      <div className="relative w-full aspect-square">
        <img
          src={selectedImage || "/placeholder.svg"}
          alt={`Outfit by user_${id}`}
          className="w-full h-full object-cover transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = "/stylish-streetwear-outfit.png"
          }}
        />

        <Button
          size="icon"
          variant="ghost"
          onClick={handleLike}
          className="absolute bottom-3 right-3 bg-white/80 rounded-full"
        >
          <Heart className={`h-5 w-5 ${isLiked ? "fill-current text-accent" : ""}`} />
        </Button>
      </div>

      {/* Miniaturas */}
      {altImages?.length > 0 && (
        <div className="flex gap-2 p-2 overflow-x-auto no-scrollbar">
          {/* Main image thumbnail */}
          <img
            key="main"
            src={mainImageUrl || "/placeholder.svg"}
            onClick={() => setSelectedImage(mainImageUrl)}
            className={`w-20 h-20 object-cover rounded-md cursor-pointer border ${
              mainImageUrl === selectedImage ? "border-accent" : "border-transparent"
            }`}
            alt="Main outfit view"
          />
          {/* Alt images */}
          {altImages.map((img, index) => {
            const altImagePath = `${id}/${img.name}`
            const publicUrl = supabase.storage.from("posts").getPublicUrl(altImagePath).data.publicUrl

            return (
              <img
                key={img.name}
                src={publicUrl || "/placeholder.svg"}
                onClick={() => setSelectedImage(publicUrl)}
                className={`w-20 h-20 object-cover rounded-md cursor-pointer border ${
                  publicUrl === selectedImage ? "border-accent" : "border-transparent"
                }`}
                alt={`Alternative view ${index + 1}`}
                onError={(e) => {
                  e.currentTarget.src = "/stylish-streetwear-outfit.png"
                }}
              />
            )
          })}
        </div>
      )}

      {/* Info */}
      <div className="px-3 pb-4 flex flex-col gap-2">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>❤️ {likeCount}</span>
          <span>💬 0</span>
        </div>

        <p className="text-sm leading-relaxed">{description}</p>

        {/* Clothes Drawer */}
        {clothes && (
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className="w-full rounded-full py-5 text-base font-semibold border-2 mt-2 bg-transparent"
              >
                <Shirt className="h-5 w-5 mr-2" />
                Clothes in this outfit
                <ChevronUp className="h-5 w-5 ml-auto" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Try Items from This Outfit</DrawerTitle>
                <DrawerDescription>Select individual items or try the whole outfit</DrawerDescription>
              </DrawerHeader>

              <div className="px-4 pb-4 space-y-3">
                {clothes?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                    <Button onClick={() => handleTryItem(item.name)} size="sm" variant="outline">
                      <Sparkles className="h-4 w-4" />
                      Try
                    </Button>
                  </div>
                ))}
              </div>

              <DrawerFooter>
                <Button
                  onClick={handleTryWholeOutfit}
                  variant="gradient"
                  className="w-full rounded-full py-6 text-base font-semibold"
                >
                  <Sparkles className="h-5 w-5 mr-1" />
                  Try Whole Outfit
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </div>
  )
}
