"use server"

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function setupClothesBucket() {
  console.log("[v0] Setting up clothes storage bucket...")

  // Create the clothes bucket
  const { data: bucketData, error: bucketError } = await supabase.storage.createBucket("clothes", {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
  })

  if (bucketError) {
    if (bucketError.message.includes("already exists")) {
      console.log("[v0] Clothes bucket already exists")
    } else {
      console.error("[v0] Error creating bucket:", bucketError)
      throw bucketError
    }
  } else {
    console.log("[v0] Clothes bucket created successfully")
  }

  // Upload sample images
  console.log("[v0] Uploading sample clothing images...")

  const sampleImages = [
    {
      id: 1,
      name: "White T-Shirt",
      url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    },
    {
      id: 2,
      name: "Black Jeans",
      url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
    },
    {
      id: 3,
      name: "White Sneakers",
      url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
    },
    {
      id: 4,
      name: "Leather Jacket",
      url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
    },
    {
      id: 5,
      name: "Blue Denim Shirt",
      url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop",
    },
    {
      id: 6,
      name: "Sunglasses",
      url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop",
    },
  ]

  for (const image of sampleImages) {
    try {
      // Fetch the image
      const response = await fetch(image.url)
      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("clothes")
        .upload(`${image.id}/main.jpg`, arrayBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        })

      if (uploadError) {
        console.error(`[v0] Error uploading ${image.name}:`, uploadError)
      } else {
        console.log(`[v0] Uploaded ${image.name}`)
      }
    } catch (error) {
      console.error(`[v0] Error processing ${image.name}:`, error)
    }
  }

  console.log("[v0] Clothes bucket setup complete!")
}

setupClothesBucket()
