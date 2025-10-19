"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { supabase } from "@/lib/supabaseClient"
import { uploadPostImages } from "@/app/actions/upload-post-images"

type Outfit = {
  id: string
  name: string | null
  username: string
  created_at: string
}

export default function CreatePostDetailsPage() {
  const searchParams = useSearchParams()
  const outfitId = searchParams.get("outfit")
  const router = useRouter()

  const [outfit, setOutfit] = useState<Outfit | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [description, setDescription] = useState("")
  const [isPublishing, setIsPublishing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOutfit() {
      if (!outfitId) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from("outfits")
          .select("id, name, username, created_at")
          .eq("id", outfitId)
          .single()

        if (error) {
          console.error("Error fetching outfit:", error)
          return
        }

        setOutfit(data)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOutfit()
  }, [outfitId])

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newFiles = Array.from(files)
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file))

      setImageFiles((prev) => [...prev, ...newFiles])
      setImagePreviews((prev) => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    // Clean up preview URL
    URL.revokeObjectURL(imagePreviews[index])

    setImageFiles(imageFiles.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handlePublish = async () => {
    if (!description.trim()) {
      alert("Agregá una descripción antes de publicar.")
      return
    }
    if (imageFiles.length === 0) {
      alert("Subí al menos una foto del outfit.")
      return
    }
    if (!outfitId) {
      alert("No se encontró el outfit seleccionado.")
      return
    }

    setIsPublishing(true)

    try {
      // 1. Create the post in the database
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .insert({
          description: description.trim(),
          outfit_id: outfitId,
          likes: 0,
        })
        .select()
        .single()

      if (postError) {
        console.error("Error creating post:", postError)
        alert("Error al crear la publicación. Intentá de nuevo.")
        setIsPublishing(false)
        return
      }

      const postId = postData.id

      const imagesToUpload = await Promise.all(
        imageFiles.map(async (file, index) => {
          const filename = index === 0 ? "main.jpg" : `alt${index}.jpg`
          const base64Data = await fileToBase64(file)
          return { name: filename, data: base64Data }
        }),
      )

      const uploadResult = await uploadPostImages(postId, imagesToUpload)

      if (!uploadResult.success) {
        console.error("Error uploading images:", uploadResult.error)
        alert("Error al subir las imágenes. Intentá de nuevo.")
        setIsPublishing(false)
        return
      }

      // 3. Clean up preview URLs
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview))

      // 4. Redirect to home
      router.push("/")
    } catch (error) {
      console.error("Error publishing post:", error)
      alert("Error al publicar. Intentá de nuevo.")
      setIsPublishing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24 px-6 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Nueva publicación</h1>
        </div>
        <p className="text-muted-foreground">Cargando...</p>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24 px-6 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Nueva publicación</h1>
      </div>

      {/* Outfit seleccionado */}
      {outfit ? (
        <div className="flex items-center gap-3 mb-6 p-4 rounded-xl border">
          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
            <span className="text-2xl">👔</span>
          </div>
          <div>
            <h2 className="font-semibold">{outfit.name || `Outfit de ${outfit.username}`}</h2>
            <p className="text-sm text-muted-foreground">Outfit seleccionado</p>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground mb-6">No se encontró el outfit.</p>
      )}

      {/* Subida de imágenes */}
      <div className="mb-6">
        <h3 className="text-base font-semibold mb-3">Fotos del outfit</h3>
        <div className="grid grid-cols-3 gap-3">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative rounded-lg overflow-hidden">
              <Image
                src={preview || "/placeholder.svg"}
                alt={`Foto ${index + 1}`}
                width={300}
                height={300}
                className="object-cover aspect-square"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-black/60 rounded-full p-1"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}

          {/* Botón agregar imagen */}
          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg aspect-square cursor-pointer hover:bg-muted transition">
            <Upload className="w-6 h-6 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">Agregar</span>
            <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Descripción */}
      <div className="mb-6">
        <h3 className="text-base font-semibold mb-3">Descripción</h3>
        <Textarea
          placeholder="Contá algo sobre este outfit..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px] resize-none"
        />
      </div>

      {/* Botón publicar */}
      <div className="fixed bottom-20 left-0 w-full px-6">
        <Button className="w-full rounded-xl" onClick={handlePublish} disabled={isPublishing || !outfit}>
          {isPublishing ? "Publicando..." : "Publicar"}
        </Button>
      </div>

      <BottomNav />
    </div>
  )
}
