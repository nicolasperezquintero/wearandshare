"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Camera, ArrowLeft, Upload, Sparkles, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function TryOutfit() {
  const router = useRouter()

  const [outfitImages, setOutfitImages] = useState<string[]>([])
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isResultOpen, setIsResultOpen] = useState(false)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const outfitFileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const hasLoadedParams = useRef(false)

  useEffect(() => {
    if (hasLoadedParams.current) return
    hasLoadedParams.current = true

    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    let imgs: string[] = []

    const outfitParam = params.get("outfit")
    const outfitsParam = params.get("outfits")
    const itemsParam = params.get("items")

    if (outfitParam) {
      imgs = [outfitParam]
    } else if (outfitsParam) {
      imgs = outfitsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    } else if (itemsParam) {
      imgs = itemsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    }

    const unique = Array.from(new Set(imgs.filter(Boolean))).slice(0, 4)
    if (unique.length > 0) {
      setOutfitImages(unique)
    }
  }, [])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsCameraActive(true)
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setIsCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg")
        setCapturedImage(imageData)
        stopCamera()
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddOutfitClick = () => {
    outfitFileInputRef.current?.click()
  }

  const handleOutfitFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return

    const remaining = Math.max(0, 4 - outfitImages.length)
    if (remaining === 0) {
      event.target.value = ""
      return
    }

    const toAdd = files.slice(0, remaining)
    Promise.all(
      toAdd.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          }),
      ),
    ).then((urls) => {
      setOutfitImages((prev) => {
        const merged = [...prev, ...urls]
        const unique = Array.from(new Set(merged)).slice(0, 4)
        return unique
      })
    })

    event.target.value = ""
  }

  const removeOutfitAt = (index: number) => {
    setOutfitImages((prev) => prev.filter((_, i) => i !== index))
  }

  const extractImageFromResponse = (resp: any): string | null => {
    if (!resp) return null

    const directVto = resp?.generatedImageBase64 || resp?.data?.generatedImageBase64
    if (typeof directVto === "string" && directVto.length > 0) {
      return directVto.startsWith("data:") ? directVto : `data:image/png;base64,${directVto}`
    }

    const tryStr = (val: any): string | null => {
      if (!val) return null
      if (typeof val === "string") {
        if (val.startsWith("http") || val.startsWith("data:")) return val
        return `data:image/png;base64,${val}`
      }
      return null
    }

    if (Array.isArray(resp?.urls) && resp.urls.length > 0) {
      return resp.urls[0]
    }

    const direct = tryStr(resp?.image_base64) || tryStr(resp?.base64) || tryStr(resp?.image) || tryStr(resp?.url)
    if (direct) return direct

    if (Array.isArray(resp?.images) && resp.images.length > 0) {
      const first = resp.images[0]
      if (typeof first === "string") return tryStr(first)
      if (first && typeof first === "object") {
        return tryStr(first.url) || tryStr(first.base64) || tryStr(first.image_base64)
      }
    }

    if (Array.isArray(resp) && resp.length > 0) {
      return extractImageFromResponse(resp[0])
    }

    return null
  }

  const handleDownload = () => {
    if (!resultImage) return
    const a = document.createElement("a")
    a.href = resultImage
    let ext = "png"
    if (resultImage.startsWith("data:image/jpeg")) ext = "jpg"
    else if (resultImage.startsWith("data:image/webp")) ext = "webp"
    else if (!resultImage.startsWith("data:") && resultImage.includes(".")) {
      const m = resultImage.split("?")[0].split(".")
      const last = m[m.length - 1].toLowerCase()
      if (["png", "jpg", "jpeg", "webp"].includes(last)) ext = last
    }
    const ts = new Date().toISOString().replace(/[:.]/g, "-")
    a.download = `try-on-${ts}.${ext}`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const srcToBase64 = async (src: string): Promise<string> => {
    if (!src) return ""
    if (src.startsWith("data:")) {
      return src.split(",")[1] || ""
    }
    try {
      const url = src.startsWith("/") ? `${window.location.origin}${src}` : src
      const resp = await fetch(url)
      if (!resp.ok) return ""
      const blob = await resp.blob()
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          resolve(result.split(",")[1] || "")
        }
        reader.onerror = () => reject(new Error("Failed to read image blob"))
        reader.readAsDataURL(blob)
      })
    } catch (err) {
      console.error("Failed to convert image to base64:", err)
      return ""
    }
  }

  const handleTryOn = async () => {
    if (isProcessing) return
    if (!capturedImage) {
      alert("Please capture or upload a photo first.")
      return
    }
    if (outfitImages.length === 0) {
      alert("Please select at least one clothing item.")
      return
    }

    try {
      setIsProcessing(true)

      const personBase64 = capturedImage?.split(",")[1] || null
      const clothingBase64Array = (await Promise.all(outfitImages.map((src) => srcToBase64(src)))).filter(Boolean)

      if (!personBase64 || clothingBase64Array.length === 0) {
        throw new Error("Could not prepare images for try-on.")
      }

      const res = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64_person: personBase64,
          base64_clothing: clothingBase64Array,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || `Request failed with status ${res.status}`)
      }

      const img = extractImageFromResponse(data)
      setResultImage(img)
      setIsResultOpen(true)
    } catch (e: any) {
      console.error("❌ Try-on failed:", e)
      alert(`Try-on failed: ${e.message}`)
      setResultImage(null)
      setIsResultOpen(true)
    } finally {
      setIsProcessing(false)
    }
  }

  const reset = () => {
    setCapturedImage(null)
    stopCamera()
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">Try This Outfit</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="mx-auto max-w-md space-y-6 p-6">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">Selected Items</h2>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAddOutfitClick}
              className="h-8 w-8 rounded-full bg-transparent"
              aria-label="Select more items"
              title="Select more items"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {outfitImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {outfitImages.slice(0, 4).map((src, idx) => (
                <div key={`${src}-${idx}`} className="relative">
                  <img
                    src={src || "/placeholder.svg"}
                    alt={`Selected outfit ${idx + 1}`}
                    className="h-48 w-full rounded-xl object-cover"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={() => removeOutfitAt(idx)}
                    className="absolute right-2 top-2 h-7 w-7 rounded-full p-0 shadow-sm"
                    aria-label={`Remove outfit ${idx + 1}`}
                    title="Remove"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              No items selected yet. Click + to add up to 4 items.
            </div>
          )}

          <input
            ref={outfitFileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleOutfitFiles}
            className="hidden"
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-base font-semibold">Your Photo</h2>

          {!capturedImage && !isCameraActive && (
            <div className="space-y-3">
              <Button
                onClick={startCamera}
                variant="gradient"
                className="w-full rounded-full py-6 text-base font-semibold"
              >
                <Camera className="h-5 w-5" />
                Open Camera
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full rounded-full py-6 text-base"
              >
                <Upload className="h-5 w-5" />
                Upload Photo
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </div>
          )}

          {isCameraActive && (
            <div className="space-y-4">
              <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl" />
              <div className="flex gap-3">
                <Button
                  onClick={capturePhoto}
                  variant="gradient"
                  className="flex-1 rounded-full py-6 text-base font-semibold"
                >
                  <Camera className="h-5 w-5" />
                  Capture
                </Button>
                <Button onClick={stopCamera} variant="outline" className="rounded-full px-6 bg-transparent">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-4">
              <img src={capturedImage || "/placeholder.svg"} alt="Your photo" className="w-full rounded-xl" />
              <div className="flex gap-3">
                <Button
                  onClick={handleTryOn}
                  variant="gradient"
                  disabled={isProcessing}
                  className="flex-1 rounded-full py-6 text-base font-semibold"
                >
                  <Sparkles className="h-5 w-5" />
                  {isProcessing ? "Processing..." : "Try Outfit Now"}
                </Button>
                <Button onClick={reset} variant="outline" className="rounded-full px-6 bg-transparent">
                  Retake
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Try-On Result</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {resultImage ? (
              <img src={resultImage || "/placeholder.svg"} alt="Try-on result" className="w-full rounded-xl" />
            ) : (
              <div className="text-sm text-muted-foreground">No image returned.</div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsResultOpen(false)}>
              Close
            </Button>
            <Button onClick={handleDownload} disabled={!resultImage}>
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="h-24" aria-hidden="true" />

      <BottomNav />
    </div>
  )
}
