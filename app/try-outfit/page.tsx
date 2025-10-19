"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Camera,
  ArrowLeft,
  Upload,
  Sparkles,
  Plus,
  X,
  ShoppingBag,
  Check,
  Shirt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";

export default function TryOutfit() {
  const router = useRouter();

  const [outfitImages, setOutfitImages] = useState<string[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const outfitFileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const hasLoadedParams = useRef(false);

  // Wardrobe selection state
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);
  const [selectedWardrobeItems, setSelectedWardrobeItems] = useState<string[]>(
    []
  );
  const [isLoadingWardrobe, setIsLoadingWardrobe] = useState(false);

  useEffect(() => {
    if (hasLoadedParams.current) return;
    hasLoadedParams.current = true;

    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    let imgs: string[] = [];

    const outfitParam = params.get("outfit");
    const outfitsParam = params.get("outfits");
    const itemsParam = params.get("items");

    if (outfitParam) {
      imgs = [outfitParam];
    } else if (outfitsParam) {
      imgs = outfitsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (itemsParam) {
      imgs = itemsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const unique = Array.from(new Set(imgs.filter(Boolean))).slice(0, 4);
    if (unique.length > 0) {
      setOutfitImages(unique);
    }
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const resizeImage = async (
    dataUrl: string,
    maxDimension = 1024
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Only resize if image exceeds max dimension
        if (width <= maxDimension && height <= maxDimension) {
          resolve(dataUrl);
          return;
        }

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        // Create canvas and resize
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG with 0.85 quality
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const capturePhoto = async () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg");
        const resized = await resizeImage(imageData);
        setCapturedImage(resized);
        stopCamera();
      }
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        const resized = await resizeImage(dataUrl);
        setCapturedImage(resized);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddOutfitClick = () => {
    outfitFileInputRef.current?.click();
  };

  const handleOutfitFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const remaining = Math.max(0, 4 - outfitImages.length);
    if (remaining === 0) {
      event.target.value = "";
      return;
    }

    const toAdd = files.slice(0, remaining);
    Promise.all(
      toAdd.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      )
    ).then((urls) => {
      setOutfitImages((prev) => {
        const merged = [...prev, ...urls];
        const unique = Array.from(new Set(merged)).slice(0, 4);
        return unique;
      });
    });

    event.target.value = "";
  };

  const removeOutfitAt = (index: number) => {
    setOutfitImages((prev) => prev.filter((_, i) => i !== index));
  };

  const extractImageFromResponse = (resp: any): string | null => {
    if (!resp) return null;

    const directVto =
      resp?.generatedImageBase64 || resp?.data?.generatedImageBase64;
    if (typeof directVto === "string" && directVto.length > 0) {
      return directVto.startsWith("data:")
        ? directVto
        : `data:image/png;base64,${directVto}`;
    }

    const tryStr = (val: any): string | null => {
      if (!val) return null;
      if (typeof val === "string") {
        if (val.startsWith("http") || val.startsWith("data:")) return val;
        return `data:image/png;base64,${val}`;
      }
      return null;
    };

    if (Array.isArray(resp?.urls) && resp.urls.length > 0) {
      return resp.urls[0];
    }

    const direct =
      tryStr(resp?.image_base64) ||
      tryStr(resp?.base64) ||
      tryStr(resp?.image) ||
      tryStr(resp?.url);
    if (direct) return direct;

    if (Array.isArray(resp?.images) && resp.images.length > 0) {
      const first = resp.images[0];
      if (typeof first === "string") return tryStr(first);
      if (first && typeof first === "object") {
        return (
          tryStr(first.url) ||
          tryStr(first.base64) ||
          tryStr(first.image_base64)
        );
      }
    }

    if (Array.isArray(resp) && resp.length > 0) {
      return extractImageFromResponse(resp[0]);
    }

    return null;
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const a = document.createElement("a");
    a.href = resultImage;
    let ext = "png";
    if (resultImage.startsWith("data:image/jpeg")) ext = "jpg";
    else if (resultImage.startsWith("data:image/webp")) ext = "webp";
    else if (!resultImage.startsWith("data:") && resultImage.includes(".")) {
      const m = resultImage.split("?")[0].split(".");
      const last = m[m.length - 1].toLowerCase();
      if (["png", "jpg", "jpeg", "webp"].includes(last)) ext = last;
    }
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    a.download = `try-on-${ts}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const srcToBase64 = async (src: string): Promise<string> => {
    if (!src) return "";
    if (src.startsWith("data:")) {
      return src.split(",")[1] || "";
    }
    try {
      const url = src.startsWith("/") ? `${window.location.origin}${src}` : src;
      const resp = await fetch(url);
      if (!resp.ok) return "";
      const blob = await resp.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1] || "");
        };
        reader.onerror = () => reject(new Error("Failed to read image blob"));
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Failed to convert image to base64:", err);
      return "";
    }
  };

  const handleTryOn = async () => {
    if (isProcessing) return;
    if (!capturedImage) {
      alert("Please capture or upload a photo first.");
      return;
    }
    if (outfitImages.length === 0) {
      alert("Please select at least one clothing item.");
      return;
    }

    try {
      setIsProcessing(true);

      const personBase64 = capturedImage?.split(",")[1] || null;
      const clothingBase64Array = (
        await Promise.all(outfitImages.map((src) => srcToBase64(src)))
      ).filter(Boolean);

      if (!personBase64 || clothingBase64Array.length === 0) {
        throw new Error("Could not prepare images for try-on.");
      }

      const res = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64_person: personBase64,
          base64_clothing: clothingBase64Array,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.error || `Request failed with status ${res.status}`
        );
      }

      const img = extractImageFromResponse(data);
      setResultImage(img);
      setIsResultOpen(true);
    } catch (e: any) {
      console.error("❌ Try-on failed:", e);
      alert(`Try-on failed: ${e.message}`);
      setResultImage(null);
      setIsResultOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    stopCamera();
  };

  const fetchWardrobeItems = async () => {
    try {
      setIsLoadingWardrobe(true);
      const { data, error } = await supabase
        .from("clothes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const items = data.map((item) => {
        const { data: imageData } = supabase.storage
          .from("clothes")
          .getPublicUrl(`${item.id}/main.jpg`);
        return {
          id: item.id.toString(),
          name: item.name || "Unnamed Item",
          image: imageData.publicUrl,
          type: item.type,
        };
      });

      setWardrobeItems(items);
    } catch (error) {
      console.error("Error fetching wardrobe items:", error);
    } finally {
      setIsLoadingWardrobe(false);
    }
  };

  const handleWardrobeItemSelect = (itemId: string) => {
    setSelectedWardrobeItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleAddFromWardrobe = () => {
    const selectedItems = wardrobeItems.filter((item) =>
      selectedWardrobeItems.includes(item.id)
    );
    const newOutfitImages = selectedItems.map((item) => item.image);

    setOutfitImages((prev) => {
      const merged = [...prev, ...newOutfitImages];
      const unique = Array.from(new Set(merged)).slice(0, 4);
      return unique;
    });

    setIsWardrobeOpen(false);
    setSelectedWardrobeItems([]);
  };

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
            <h2 className="text-sm font-semibold text-muted-foreground">
              Selected Items
            </h2>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  fetchWardrobeItems();
                  setIsWardrobeOpen(true);
                }}
                className="h-8 w-8 rounded-full bg-transparent"
                aria-label="Add from wardrobe"
                title="Add from wardrobe"
              >
                <Shirt className="h-4 w-4" />
              </Button>
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
                onClick={() => fileInputRef.current?.click()}
                variant="gradient"
                className="w-full rounded-full py-6 text-base font-semibold"
              >
                <Upload className="h-5 w-5" />
                Upload Photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {isCameraActive && (
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-xl"
              />
              <div className="flex gap-3">
                <Button
                  onClick={capturePhoto}
                  variant="gradient"
                  className="flex-1 rounded-full py-6 text-base font-semibold"
                >
                  <Camera className="h-5 w-5" />
                  Capture
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="rounded-full px-6 bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-4">
              <img
                src={capturedImage || "/placeholder.svg"}
                alt="Your photo"
                className="w-full rounded-xl"
              />
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
                <Button
                  onClick={reset}
                  variant="outline"
                  className="rounded-full px-6 bg-transparent"
                >
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
              <img
                src={resultImage || "/placeholder.svg"}
                alt="Try-on result"
                className="w-full rounded-xl"
              />
            ) : (
              <div className="text-sm text-muted-foreground">
                No image returned.
              </div>
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

      <Dialog open={isWardrobeOpen} onOpenChange={setIsWardrobeOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select from Wardrobe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {isLoadingWardrobe ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-muted-foreground">
                  Loading your wardrobe...
                </div>
              </div>
            ) : wardrobeItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No items in your wardrobe
                </p>
                <p className="text-sm text-muted-foreground">
                  Add some clothes to get started!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {wardrobeItems.map((item) => (
                  <div
                    key={item.id}
                    className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                      selectedWardrobeItems.includes(item.id)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleWardrobeItemSelect(item.id)}
                  >
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <div className="p-2">
                      <h3 className="font-semibold text-xs line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground capitalize">
                        {item.type}
                      </p>
                    </div>
                    {selectedWardrobeItems.includes(item.id) && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsWardrobeOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddFromWardrobe}
              disabled={selectedWardrobeItems.length === 0}
            >
              Add {selectedWardrobeItems.length} Item
              {selectedWardrobeItems.length !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="h-24" aria-hidden="true" />

      <BottomNav />
    </div>
  );
}
