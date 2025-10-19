"use client"

import { Heart, Sparkles, Shirt, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import Link from "next/link"

interface ClothingItem {
  id: number
  name: string
  type: string
  sponsored?: boolean
  sponsor_link?: string
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
  sponsored?: boolean // Added sponsored prop
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
  sponsored = false, // Added sponsored parameter with default value
}: OutfitCardProps) => {
  // Ensure gallery is an array
  const safeGallery = Array.isArray(gallery) ? gallery : []

  // Extract clothes from the new data structure
  const clothes =
    outfits?.outfits_clothes?.map((outfitClothes) => ({
      id: outfitClothes.clothes.id,
      name: outfitClothes.clothes.name,
      category: outfitClothes.clothes.type,
      sponsored: outfitClothes.clothes.sponsored,
      sponsor_link: outfitClothes.clothes.sponsor_link,
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

  const getStoreInfo = (url: string) => {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname
      // Remove www. prefix
      const domain = hostname.replace(/^www\./, "")
      // Get the store name (first part before TLD)
      const storeName = domain.split(".")[0]
      // Capitalize store name
      const displayName = storeName.charAt(0).toUpperCase() + storeName.slice(1)

      return {
        name: displayName,
        domain: hostname,
        faviconUrl: `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`,
      }
    } catch {
      return {
        name: "Store",
        domain: "",
        faviconUrl: "",
      }
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
  }

  const handleTryItem = async (itemId: number, itemName: string) => {
    const { data: imageData } = supabase.storage.from("clothes").getPublicUrl(`${itemId}/main.jpg`)
    const itemImageUrl = imageData.publicUrl

    router.push(`/try-outfit?outfit=${encodeURIComponent(itemImageUrl)}`)
    setIsDrawerOpen(false)
  }

  const handleTryWholeOutfit = async () => {
    // Fetch all clothing item images from the outfit
    const clothingImageUrls = clothes.map((item) => {
      const { data: imageData } = supabase.storage.from("clothes").getPublicUrl(`${item.id}/main.jpg`)
      return imageData.publicUrl
    })

    // Pass all images as comma-separated list in the outfits parameter
    const outfitsParam = clothingImageUrls.join(",")
    router.push(`/try-outfit?outfits=${encodeURIComponent(outfitsParam)}`)
    setIsDrawerOpen(false)
  }

  return (
    <div className="bg-card rounded-xl shadow-sm overflow-hidden w-full max-w-md mx-auto border border-border/50">
      {/* Improved card design with better spacing and modern styling */}
      <div className="flex items-center gap-3 p-4">
        <Link href={`/profile/${outfits.username}`}>
          <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-background hover:ring-primary/20 transition-all">
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
              {outfits.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <Link href={`/profile/${outfits.username}`} className="flex-1">
          <p className="font-semibold text-base hover:text-primary transition-colors">{outfits.username}</p>
          {sponsored && <p className="text-xs text-muted-foreground mt-0.5">Sponsored</p>}
        </Link>
      </div>

      {/* Imagen principal */}
      <div className="relative w-full aspect-square bg-muted">
        <img
          src={selectedImage || "/placeholder.svg"}
          alt={`Outfit by ${outfits.username}`}
          className="w-full h-full object-cover transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = "/stylish-streetwear-outfit.png"
          }}
        />

        <Button
          size="icon"
          variant="ghost"
          onClick={handleLike}
          className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-background hover:scale-110 transition-all"
        >
          <Heart className={`h-5 w-5 ${isLiked ? "fill-current text-red-500" : ""}`} />
        </Button>
      </div>

      {/* Miniaturas */}
      {altImages?.length > 0 && (
        <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar">
          {/* Main image thumbnail */}
          <img
            key="main"
            src={mainImageUrl || "/placeholder.svg"}
            onClick={() => setSelectedImage(mainImageUrl)}
            className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 transition-all ${
              mainImageUrl === selectedImage
                ? "border-primary shadow-md scale-105"
                : "border-border hover:border-primary/50"
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
                className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                  publicUrl === selectedImage
                    ? "border-primary shadow-md scale-105"
                    : "border-border hover:border-primary/50"
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
      <div className="px-4 pb-4 flex flex-col gap-3 mt-4">
        <div className="flex items-center gap-1 text-sm">
          <Heart className="h-4 w-4 text-red-500" />
          <span className="font-semibold">{likeCount} likes</span>
        </div>

        <p className="text-sm leading-relaxed">
          <span className="font-semibold mr-2">{outfits.username}</span>
          {description}
        </p>

        {/* Clothes Drawer */}
        {clothes && (
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className="w-full rounded-full py-5 text-sm font-semibold border-2 mt-1 bg-transparent hover:bg-accent/10 transition-all"
              >
                <Shirt className="h-4 w-4 mr-2" />
                View outfit items
                <ChevronUp className="h-4 w-4 ml-auto" />
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
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.sponsored &&
                        item.sponsor_link &&
                        (() => {
                          const storeInfo = getStoreInfo(item.sponsor_link)
                          return (
                            <Button
                              onClick={() => window.open(item.sponsor_link, "_blank")}
                              size="sm"
                              variant="default"
                              className="gap-2"
                            >
                              {storeInfo.faviconUrl && (
                                <img
                                  src={storeInfo.faviconUrl || "/placeholder.svg"}
                                  alt={`${storeInfo.name} favicon`}
                                  className="h-4 w-4"
                                />
                              )}
                              {storeInfo.name}
                            </Button>
                          )
                        })()}
                      <Button onClick={() => handleTryItem(item.id, item.name)} size="sm" variant="outline">
                        <Sparkles className="h-4 w-4" />
                        Try
                      </Button>
                    </div>
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
