"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
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
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { uploadClothesImage } from "@/app/actions/upload-clothes-images";

interface ClothingItem {
  id: string;
  name: string;
  image: string;
  category: "tops" | "bottoms" | "shoes" | "accessories";
  tags: string[];
  isPublic: boolean;
  isListed: boolean;
  price?: number;
  description?: string;
}

interface SavedOutfit {
  id: string;
  name: string;
  image: string;
  items: ClothingItem[];
  createdAt: Date;
}

interface ExtractedItem {
  name: string;
  type: string;
  description: string;
  imageBase64: string;
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
];

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
];

type TabType = "clothes" | "outfits";
type CategoryType = "all" | "tops" | "bottoms" | "shoes" | "accessories";

export default function Wardrobe() {
  const [activeTab, setActiveTab] = useState<TabType>("clothes");
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [createOutfitMode, setCreateOutfitMode] = useState(false);
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<{
    tops: ClothingItem[];
    bottoms: ClothingItem[];
    shoes: ClothingItem[];
    accessories: ClothingItem[];
  }>({
    tops: [],
    bottoms: [],
    shoes: [],
    accessories: [],
  });
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [outfitName, setOutfitName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [isLoadingOutfits, setIsLoadingOutfits] = useState(false);
  const router = useRouter();

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
  ];

  const [isExtracting, setIsExtracting] = useState(false);
  const addPhotoInputRef = useRef<HTMLInputElement>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [messageModal, setMessageModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [showExtractedItemsDialog, setShowExtractedItemsDialog] =
    useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get("mode");
      if (mode === "create") {
        setCreateOutfitMode(true);
      }
    }
  }, []);

  useEffect(() => {
    fetchClothes();
  }, []);

  useEffect(() => {
    if (activeTab === "outfits") {
      fetchSavedOutfits();
    }
  }, [activeTab]);

  const fetchClothes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("clothes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log("[v0] Fetched clothes data:", data);

      const items: ClothingItem[] = data.map((item) => {
        const { data: imageData } = supabase.storage
          .from("clothes")
          .getPublicUrl(`${item.id}/main.jpg`);

        let category: "tops" | "bottoms" | "shoes" | "accessories" =
          "accessories";
        if (item.type === "top") category = "tops";
        else if (item.type === "bottom") category = "bottoms";
        else if (item.type === "shoe")
          category = "shoes"; // Added singular "shoe" mapping
        else if (item.type === "shoes") category = "shoes";
        else if (item.type === "accessories") category = "accessories";
        else if (item.type === "tops") category = "tops";
        else if (item.type === "bottoms") category = "bottoms";

        console.log(
          "[v0] Item:",
          item.name,
          "Type:",
          item.type,
          "Mapped category:",
          category
        );

        return {
          id: item.id.toString(),
          name: item.name || "Unnamed Item",
          image: imageData.publicUrl,
          category,
          tags: item.description
            ? item.description.split(",").map((t: string) => t.trim())
            : [],
          isPublic: item.public ?? false,
          isListed: item.selling ?? false,
          description: item.description,
        };
      });

      console.log("[v0] Mapped clothing items:", items);
      setClothingItems(items);
    } catch (error) {
      console.error("Error fetching clothes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedOutfits = async () => {
    try {
      setIsLoadingOutfits(true);
      console.log("[v0] Fetching saved outfits...");

      const { data: outfitsData, error: outfitsError } = await supabase
        .from("outfits")
        .select("*")
        .order("created_at", { ascending: false });

      if (outfitsError) throw outfitsError;

      console.log("[v0] Fetched outfits:", outfitsData);

      const outfitsWithClothes = await Promise.all(
        outfitsData.map(async (outfit) => {
          const { data: linksData, error: linksError } = await supabase
            .from("outfits_clothes")
            .select("cloth_id")
            .eq("outfit_id", outfit.id);

          if (linksError) {
            console.error("[v0] Error fetching outfit links:", linksError);
            return null;
          }

          console.log("[v0] Outfit", outfit.id, "links:", linksData);

          const clothIds = linksData.map((link) => link.cloth_id);
          if (clothIds.length === 0) return null;

          const { data: clothesData, error: clothesError } = await supabase
            .from("clothes")
            .select("*")
            .in("id", clothIds);

          if (clothesError) {
            console.error("[v0] Error fetching clothes:", clothesError);
            return null;
          }

          console.log("[v0] Outfit", outfit.id, "clothes:", clothesData);

          const items: ClothingItem[] = clothesData.map((item) => {
            const { data: imageData } = supabase.storage
              .from("clothes")
              .getPublicUrl(`${item.id}/main.jpg`);

            let category: "tops" | "bottoms" | "shoes" | "accessories" =
              "accessories";
            if (item.type === "top") category = "tops";
            else if (item.type === "bottom") category = "bottoms";
            else if (item.type === "shoe") category = "shoes";
            else if (item.type === "shoes") category = "shoes";
            else if (item.type === "accessories") category = "accessories";
            else if (item.type === "tops") category = "tops";
            else if (item.type === "bottoms") category = "bottoms";

            return {
              id: item.id.toString(),
              name: item.name || "Unnamed Item",
              image: imageData.publicUrl,
              category,
              tags: item.description
                ? item.description.split(",").map((t: string) => t.trim())
                : [],
              isPublic: item.public ?? false,
              isListed: item.selling ?? false,
              description: item.description,
            };
          });

          const thumbnailImage = items[0]?.image || "/placeholder.svg";

          return {
            id: outfit.id,
            name: outfit.name || "Unnamed Outfit",
            image: thumbnailImage,
            items,
            createdAt: new Date(outfit.created_at),
          };
        })
      );

      const validOutfits = outfitsWithClothes.filter(
        (o) => o !== null
      ) as SavedOutfit[];
      console.log("[v0] Valid outfits:", validOutfits);
      setSavedOutfits(validOutfits);
    } catch (error) {
      console.error("[v0] Error fetching saved outfits:", error);
    } finally {
      setIsLoadingOutfits(false);
    }
  };

  const filteredItems = clothingItems.filter((item) => {
    const matchesCategory = createOutfitMode
      ? true
      : activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const handleItemSelect = (item: ClothingItem) => {
    if (!createOutfitMode) return;

    const category = item.category as keyof typeof selectedItems;
    const currentSelection = selectedItems[category] || [];

    if (category === "tops" || category === "bottoms" || category === "shoes") {
      setSelectedItems((prev) => ({
        ...prev,
        [category]: [item],
      }));
    } else if (category === "accessories") {
      setSelectedItems((prev) => ({
        ...prev,
        [category]: [...currentSelection, item],
      }));
    }
  };

  const handleItemDeselect = (
    item: ClothingItem,
    category: keyof typeof selectedItems
  ) => {
    setSelectedItems((prev) => ({
      ...prev,
      [category]: (prev[category] || []).filter((i) => i.id !== item.id),
    }));
  };

  const toggleItemPrivacy = async (itemId: string) => {
    const item = clothingItems.find((i) => i.id === itemId);
    if (!item) return;

    const { error } = await supabase
      .from("clothes")
      .update({ public: !item.isPublic })
      .eq("id", Number.parseInt(itemId));

    if (error) {
      console.error("Error updating privacy:", error);
    } else {
      setClothingItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, isPublic: !i.isPublic } : i))
      );
    }
  };

  const toggleItemListing = async (itemId: string) => {
    const item = clothingItems.find((i) => i.id === itemId);
    if (!item) return;

    const { error } = await supabase
      .from("clothes")
      .update({ selling: !item.isListed })
      .eq("id", Number.parseInt(itemId));

    if (error) {
      console.error("Error updating listing:", error);
    } else {
      setClothingItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, isListed: !i.isListed } : i))
      );
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const item = clothingItems.find((i) => i.id === itemId);
    if (!item) return;

    setConfirmModal({
      isOpen: true,
      title: "Delete Item",
      message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const { error: storageError } = await supabase.storage
            .from("clothes")
            .remove([`${itemId}/main.jpg`]);

          if (storageError) {
            console.error("Error deleting image from storage:", storageError);
          }

          const { error: dbError } = await supabase
            .from("clothes")
            .delete()
            .eq("id", Number.parseInt(itemId));

          if (dbError) {
            console.error("Error deleting from database:", dbError);
            setMessageModal({
              isOpen: true,
              title: "Error",
              message: "Failed to delete item. Please try again.",
              type: "error",
            });
            return;
          }

          setClothingItems((prev) => prev.filter((i) => i.id !== itemId));
          setMessageModal({
            isOpen: true,
            title: "Success",
            message: "Item deleted successfully!",
            type: "success",
          });
        } catch (error) {
          console.error("Error deleting item:", error);
          setMessageModal({
            isOpen: true,
            title: "Error",
            message: "Failed to delete item. Please try again.",
            type: "error",
          });
        }
      },
    });
  };

  const canCreateOutfit = () => {
    return (
      selectedItems.tops.length === 1 &&
      selectedItems.bottoms.length === 1 &&
      selectedItems.shoes.length === 1
    );
  };

  const handleSaveOutfit = async () => {
    if (!outfitName.trim()) {
      setMessageModal({
        isOpen: true,
        title: "Missing Information",
        message: "Please enter an outfit name",
        type: "error",
      });
      return;
    }

    try {
      setIsSaving(true);

      const { data: outfitData, error: outfitError } = await supabase
        .from("outfits")
        .insert({
          username: "nicoperez",
          name: outfitName,
        })
        .select()
        .single();

      if (outfitError) throw outfitError;

      const allSelectedItems = [
        ...selectedItems.tops,
        ...selectedItems.bottoms,
        ...selectedItems.shoes,
        ...selectedItems.accessories,
      ];

      const outfitClothesRecords = allSelectedItems.map((item) => ({
        outfit_id: outfitData.id,
        cloth_id: Number.parseInt(item.id),
      }));

      const { error: linkError } = await supabase
        .from("outfits_clothes")
        .insert(outfitClothesRecords);

      if (linkError) throw linkError;

      setShowSaveDialog(false);
      setOutfitName("");
      setCreateOutfitMode(false);
      setSelectedItems({
        tops: [],
        bottoms: [],
        shoes: [],
        accessories: [],
      });

      fetchSavedOutfits();
      setMessageModal({
        isOpen: true,
        title: "Success",
        message: "Outfit saved successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error saving outfit:", error);
      setMessageModal({
        isOpen: true,
        title: "Error",
        message: "Failed to save outfit. Please try again.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsExtracting(true);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const dataUrl = e.target?.result as string;
          const resized = await resizeImage(dataUrl);
          const base64 = resized.split(",")[1];

          console.log("[v0] Calling extract-items API...");

          const response = await fetch("/api/extract-items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64 }),
          });

          if (!response.ok) {
            const error = await response.json();
            if (response.status === 404 || error.error?.includes("NOT_FOUND")) {
              setMessageModal({
                isOpen: true,
                title: "Feature Unavailable",
                message:
                  "The clothing extraction feature requires the 'extract-items' Supabase Edge Function to be deployed. Please deploy the function and try again.",
                type: "error",
              });
              return;
            }
            throw new Error(error.error || "Failed to extract clothing items");
          }

          const data = await response.json();
          console.log("[v0] Extracted items response:", data.message);

          const images = data.images || [];
          const textOutput = data.textOutput || "";

          if (images.length === 0) {
            setMessageModal({
              isOpen: true,
              title: "No Items Found",
              message:
                "No clothing items found in the image. Please try another photo.",
              type: "error",
            });
            return;
          }

          const itemMetadata = parseTextOutput(textOutput, images.length);
          console.log("[v0] Parsed item metadata:", itemMetadata);

          const items: ExtractedItem[] = images.map(
            (imageBase64: string, i: number) => {
              const metadata = itemMetadata[i] || {
                name: `Item ${i + 1}`,
                type: "top",
                description: "",
              };
              return {
                name: metadata.name,
                type: metadata.type,
                description: metadata.description || "",
                imageBase64,
              };
            }
          );

          setExtractedItems(items);
          setShowExtractedItemsDialog(true);
        } catch (error: any) {
          console.error("[v0] Error processing image:", error);
          setMessageModal({
            isOpen: true,
            title: "Error",
            message:
              error.message || "Failed to process image. Please try again.",
            type: "error",
          });
        } finally {
          setIsExtracting(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("[v0] Error reading file:", error);
      setMessageModal({
        isOpen: true,
        title: "Error",
        message: "Failed to read image file. Please try again.",
        type: "error",
      });
      setIsExtracting(false);
    }

    event.target.value = "";
  };

  const handleConfirmExtractedItems = async () => {
    try {
      setIsExtracting(true);

      for (const item of extractedItems) {
        try {
          const { data: clothData, error: insertError } = await supabase
            .from("clothes")
            .insert({
              name: item.name,
              description: item.description || "",
              type: item.type,
              username: "nicoperez",
              public: false,
              selling: false,
            })
            .select()
            .single();

          if (insertError) throw insertError;

          if (item.imageBase64) {
            const result = await uploadClothesImage(
              clothData.id,
              item.imageBase64
            );
            if (!result.success) {
              console.error("[v0] Error uploading image:", result.error);
            }
          }
        } catch (itemError) {
          console.error("[v0] Error saving item:", itemError);
        }
      }

      await fetchClothes();
      setShowExtractedItemsDialog(false);
      setExtractedItems([]);
      setMessageModal({
        isOpen: true,
        title: "Success",
        message: `Successfully added ${extractedItems.length} item(s) to your wardrobe!`,
        type: "success",
      });
    } catch (error: any) {
      console.error("[v0] Error saving items:", error);
      setMessageModal({
        isOpen: true,
        title: "Error",
        message: "Failed to save items. Please try again.",
        type: "error",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUpdateExtractedItem = (
    index: number,
    field: keyof ExtractedItem,
    value: string
  ) => {
    setExtractedItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveExtractedItem = (index: number) => {
    setExtractedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const resizeImage = async (
    dataUrl: string,
    maxDimension = 1024
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width <= maxDimension && height <= maxDimension) {
          resolve(dataUrl);
          return;
        }

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

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const parseTextOutput = (textOutput: string, imageCount: number) => {
    const items = [];

    try {
      const jsonMatch = textOutput.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.map((item: any) => ({
          name: (item.name || item.item || "Unnamed Item")
            .replace(/\*\*/g, "")
            .trim(),
          type: (item.type || "top").toLowerCase(),
          description: item.description || "",
        }));
      }
    } catch (e) {}

    const lines = textOutput.split("\n").filter((line) => line.trim());
    for (const line of lines) {
      if (
        line.toLowerCase().includes("detected clothing") ||
        line.toLowerCase().includes("here are")
      ) {
        continue;
      }

      const nameMatch = line.match(/(?:\d+\.\s*)?([^(]+)/);
      const typeMatch = line.match(/$$([^)]+)$$/);

      if (nameMatch) {
        const name = nameMatch[1]
          .trim()
          .replace(/\*\*/g, "")
          .replace(/^\*\s*/, "");
        if (name && name.length > 2) {
          items.push({
            name,
            type: typeMatch ? typeMatch[1].toLowerCase() : "top",
            description: "",
          });
        }
      }
    }

    if (items.length === 0) {
      for (let i = 0; i < imageCount; i++) {
        items.push({
          name: `Clothing Item ${i + 1}`,
          type: "top",
          description: "",
        });
      }
    }

    return items;
  };

  const renderClothingItem = (item: ClothingItem) => (
    <div
      key={item.id}
      className="bg-white rounded-lg p-2 shadow-sm border flex flex-col"
    >
      <div className="relative">
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          className="w-full h-24 object-cover rounded-md"
        />
        {createOutfitMode && (
          <div className="absolute top-1 right-1">
            <Button
              size="sm"
              variant={
                selectedItems[
                  item.category as keyof typeof selectedItems
                ]?.some((i) => i.id === item.id)
                  ? "default"
                  : "outline"
              }
              onClick={() => {
                const isSelected =
                  selectedItems[
                    item.category as keyof typeof selectedItems
                  ]?.some((i) => i.id === item.id) || false;
                if (isSelected) {
                  handleItemDeselect(
                    item,
                    item.category as keyof typeof selectedItems
                  );
                } else {
                  handleItemSelect(item);
                }
              }}
              className="h-6 w-6 p-0 rounded-full"
            >
              {selectedItems[item.category as keyof typeof selectedItems]?.some(
                (i) => i.id === item.id
              ) ? (
                <Check className="h-3 w-3" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}
        <div className="absolute top-1 left-1 flex gap-1">
          {item.isPublic ? (
            <Eye className="h-3 w-3 text-green-600" />
          ) : (
            <EyeOff className="h-3 w-3 text-gray-400" />
          )}
          {item.isListed && <ShoppingCart className="h-3 w-3 text-blue-600" />}
        </div>
        {!createOutfitMode && (
          <div className="absolute top-1 right-1">
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                router.push(
                  `/try-outfit?items=${encodeURIComponent(item.image)}`
                );
              }}
              className="h-6 w-6 p-0 rounded-full bg-primary hover:bg-primary/90"
              title="Try this item"
            >
              <Camera className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      <div className="mt-1 flex flex-col flex-1">
        <h3 className="font-semibold text-xs line-clamp-1">{item.name}</h3>
        <div
          className={`flex items-center mt-auto pt-2 ${
            item.price ? "justify-between" : "justify-end"
          }`}
        >
          {item.price && (
            <p className="text-xs font-semibold text-green-600">
              ${item.price}
            </p>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/try-outfit?items=${encodeURIComponent(item.image)}`
                  )
                }
              >
                <Camera className="h-4 w-4 mr-2" />
                Try On
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleItemPrivacy(item.id)}>
                {item.isPublic ? (
                  <EyeOff className="h-4 w-4 mr-2" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
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
              <DropdownMenuItem
                onClick={() => handleDeleteItem(item.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

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
        className={`flex-1 border-border border shadow-lg ${
          !canCreateOutfit() ? "bg-gray-300 opacity-50" : ""
        }`}
        disabled={!canCreateOutfit()}
        onClick={() => setShowSaveDialog(true)}
      >
        <Save className="h-4 w-4 mr-2" />
        Save
      </Button>
      <Button
        className={`flex-1 border-border border shadow-lg ${
          !canCreateOutfit() ? "bg-gray-300 opacity-50" : ""
        }`}
        disabled={!canCreateOutfit()}
        onClick={() => {
          const allSelectedItems = [
            ...selectedItems.tops,
            ...selectedItems.bottoms,
            ...selectedItems.shoes,
            ...selectedItems.accessories,
          ];
          const outfitImages = allSelectedItems
            .map((item) => item.image)
            .join(",");
          router.push(
            `/try-outfit?outfits=${encodeURIComponent(outfitImages)}`
          );
        }}
      >
        <Camera className="h-4 w-4 mr-2" />
        Try On
      </Button>
    </div>
  );

  const renderItemsByCategory = () => {
    const categories = [
      { key: "tops", label: "Tops", icon: TopsIcon },
      { key: "bottoms", label: "Bottoms", icon: BottomsIcon },
      { key: "shoes", label: "Shoes", icon: ShoesIcon },
      { key: "accessories", label: "Accessories", icon: AccessoriesIcon },
    ] as const;

    console.log(
      "[v0] Rendering items by category. Total filtered items:",
      filteredItems.length
    );

    return categories.map((cat) => {
      const items = filteredItems.filter((item) => item.category === cat.key);
      console.log(
        "[v0] Category:",
        cat.key,
        "Items:",
        items.length,
        items.map((i) => i.name)
      );

      if (items.length === 0) return null;

      const Icon = cat.icon;
      return (
        <div key={cat.key} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase">
              {cat.label}
            </h3>
            <span className="text-xs text-muted-foreground">
              ({items.length})
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {items.map(renderClothingItem)}
          </div>
        </div>
      );
    });
  };

  const renderSavedOutfit = (outfit: SavedOutfit) => (
    <div
      key={outfit.id}
      className="bg-white rounded-lg shadow-sm border overflow-hidden"
    >
      <div className="relative h-48">
        <img
          src={outfit.image || "/placeholder.svg"}
          alt={outfit.name}
          className="w-full h-full object-cover"
        />
        <Button
          size="sm"
          className="absolute top-2 right-2 h-8 px-3 bg-white/90 hover:bg-white text-foreground shadow-md"
          onClick={() => {
            const outfitImages = outfit.items
              .map((item) => item.image)
              .join(",");
            router.push(
              `/try-outfit?outfits=${encodeURIComponent(outfitImages)}`
            );
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
            <div
              key={item.id}
              className="w-8 h-8 rounded border overflow-hidden"
            >
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {outfit.items.length > 3 && (
            <div className="w-8 h-8 rounded border bg-gray-100 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">
                +{outfit.items.length - 3}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

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
            <Button
              size="sm"
              className="flex-shrink-0"
              onClick={() => addPhotoInputRef.current?.click()}
              disabled={isExtracting}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isExtracting ? "Processing..." : "Add Photo"}
            </Button>
            <input
              ref={addPhotoInputRef}
              type="file"
              accept="image/*"
              onChange={handleAddPhoto}
              className="hidden"
            />
          </div>

          <div className="flex space-x-4 justify-center overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id as CategoryType)}
                  className={`flex flex-col items-center space-y-1 min-w-0 flex-shrink-0 ${
                    activeCategory === category.id
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      activeCategory === category.id
                        ? category.color
                        : "bg-gray-200"
                    }`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-medium">{category.label}</span>
                </button>
              );
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
                <Button
                  onClick={() => setCreateOutfitMode(true)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Outfit
                </Button>
              </div>
            )}

            {createOutfitMode && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Select items to create your outfit. Choose 1 top, 1 bottom, 1
                  shoe, and any accessories.
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-muted-foreground">
                  Loading your wardrobe...
                </div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No items found</p>
                <p className="text-sm text-muted-foreground">
                  Add some clothes to get started!
                </p>
              </div>
            ) : createOutfitMode ? (
              renderItemsByCategory()
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {filteredItems.map(renderClothingItem)}
              </div>
            )}
          </div>
        )}

        {activeTab === "outfits" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Saved Outfits</h2>
            {isLoadingOutfits ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-muted-foreground">
                  Loading your outfits...
                </div>
              </div>
            ) : savedOutfits.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No saved outfits yet</p>
                <p className="text-sm">
                  Create your first outfit to see it here!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {savedOutfits.map(renderSavedOutfit)}
              </div>
            )}
          </div>
        )}
      </div>

      {createOutfitMode && renderCreateOutfitMode()}

      <Dialog
        open={confirmModal.isOpen}
        onOpenChange={(open) =>
          setConfirmModal({ ...confirmModal, isOpen: open })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmModal.title}</DialogTitle>
            <DialogDescription>{confirmModal.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() =>
                setConfirmModal({ ...confirmModal, isOpen: false })
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                confirmModal.onConfirm();
                setConfirmModal({ ...confirmModal, isOpen: false });
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={messageModal.isOpen}
        onOpenChange={(open) =>
          setMessageModal({ ...messageModal, isOpen: open })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{messageModal.title}</DialogTitle>
            <DialogDescription>{messageModal.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() =>
                setMessageModal({ ...messageModal, isOpen: false })
              }
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Outfit</DialogTitle>
            <DialogDescription>
              Give your outfit a name to save it to your collection.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter outfit name..."
              value={outfitName}
              onChange={(e) => setOutfitName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && outfitName.trim()) {
                  handleSaveOutfit();
                }
              }}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveOutfit}
              disabled={isSaving || !outfitName.trim()}
            >
              {isSaving ? "Saving..." : "Save Outfit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showExtractedItemsDialog}
        onOpenChange={setShowExtractedItemsDialog}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Extracted Items</DialogTitle>
            <DialogDescription>
              Review and edit the clothing items extracted from your photo. You
              can change names, types, or remove items before adding them to
              your wardrobe.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {extractedItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex gap-4">
                  <img
                    src={`data:image/png;base64,${item.imageBase64}`}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-md border"
                  />
                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        value={item.name}
                        onChange={(e) =>
                          handleUpdateExtractedItem(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Item name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <select
                        value={item.type}
                        onChange={(e) =>
                          handleUpdateExtractedItem(
                            index,
                            "type",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="shoe">Shoe</option>
                        <option value="accessories">Accessories</option>
                      </select>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveExtractedItem(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowExtractedItemsDialog(false);
                setExtractedItems([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmExtractedItems}
              disabled={extractedItems.length === 0 || isExtracting}
            >
              {isExtracting
                ? "Adding..."
                : `Add ${extractedItems.length} Item${
                    extractedItems.length !== 1 ? "s" : ""
                  } to Wardrobe`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
