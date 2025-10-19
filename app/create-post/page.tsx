"use client"

import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"

type Outfit = {
  id: string
  username: string
  created_at: string
  name: string | null
  image?: string
}

export default function CreatePostPage() {
  const router = useRouter()
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOutfits() {
      try {
        const { data, error } = await supabase
          .from("outfits")
          .select("id, username, created_at, name")
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching outfits:", error)
          return
        }

        const outfitsWithImages = await Promise.all(
          (data || []).map(async (outfit) => {
            const { data: outfitClothes } = await supabase
              .from("outfits_clothes")
              .select("cloth_id")
              .eq("outfit_id", outfit.id)
              .limit(1)
              .single()

            if (outfitClothes) {
              const { data: clothItem } = await supabase
                .from("clothes")
                .select("id")
                .eq("id", outfitClothes.cloth_id)
                .single()

              if (clothItem) {
                const imageUrl = supabase.storage.from("clothes").getPublicUrl(`${clothItem.id}/main.jpg`)
                  .data.publicUrl

                return { ...outfit, image: imageUrl }
              }
            }

            return outfit
          }),
        )

        setOutfits(outfitsWithImages)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOutfits()
  }, [])

  const handleNewOutfit = () => {
    router.push("/create-outfit")
  }

  const handleContinue = (outfitId: string) => {
    router.push(`/create-post/details?outfit=${outfitId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24 px-6 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Crear publicación</h1>
        </div>
        <p className="text-muted-foreground">Cargando outfits...</p>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24 px-6 pt-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Crear publicación</h1>
        <Button onClick={handleNewOutfit} size="icon" variant="outline" className="rounded-full bg-transparent">
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {outfits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No tenés outfits todavía</p>
          <Button onClick={handleNewOutfit} className="rounded-full">
            Crear tu primer outfit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {outfits.map((outfit) => (
            <button
              key={outfit.id}
              onClick={() => handleContinue(outfit.id)}
              className="group relative aspect-square rounded-2xl overflow-hidden border bg-muted hover:border-foreground/20 transition-all"
            >
              {outfit.image ? (
                <img
                  src={outfit.image || "/placeholder.svg"}
                  alt={outfit.name || "Outfit"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">👔</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                <p className="font-medium text-white text-sm line-clamp-1">
                  {outfit.name || `Outfit ${outfit.id.slice(0, 4)}`}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
