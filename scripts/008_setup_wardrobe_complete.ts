import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function setupWardrobeComplete() {
  console.log("[v0] Starting wardrobe setup...")

  try {
    // Step 1: Create the clothes bucket
    console.log("[v0] Step 1: Creating clothes bucket...")
    const { data: buckets } = await supabase.storage.listBuckets()
    const clothesBucketExists = buckets?.some((b) => b.name === "clothes")

    if (!clothesBucketExists) {
      const { error: bucketError } = await supabase.storage.createBucket("clothes", {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })
      if (bucketError) {
        console.error("[v0] Error creating bucket:", bucketError)
      } else {
        console.log("[v0] ✓ Clothes bucket created successfully")
      }
    } else {
      console.log("[v0] ✓ Clothes bucket already exists")
    }

    // Step 2: Define sample clothing items with Unsplash images
    const sampleClothes = [
      // Tops
      {
        name: "White T-Shirt",
        type: "top",
        description: "Classic white cotton tee",
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      },
      {
        name: "Black Hoodie",
        type: "top",
        description: "Comfortable black hoodie",
        imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
      },
      {
        name: "Denim Jacket",
        type: "top",
        description: "Classic blue denim jacket",
        imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
      },
      {
        name: "Striped Shirt",
        type: "top",
        description: "Navy and white striped shirt",
        imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop",
      },

      // Bottoms
      {
        name: "Blue Jeans",
        type: "bottom",
        description: "Classic blue denim jeans",
        imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
      },
      {
        name: "Black Pants",
        type: "bottom",
        description: "Slim fit black pants",
        imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop",
      },
      {
        name: "Khaki Shorts",
        type: "bottom",
        description: "Casual khaki shorts",
        imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop",
      },

      // Shoes
      {
        name: "White Sneakers",
        type: "shoe",
        description: "Clean white sneakers",
        imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
      },
      {
        name: "Black Boots",
        type: "shoe",
        description: "Leather black boots",
        imageUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&h=400&fit=crop",
      },
      {
        name: "Running Shoes",
        type: "shoe",
        description: "Athletic running shoes",
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      },

      // Accessories
      {
        name: "Baseball Cap",
        type: "accessory",
        description: "Black baseball cap",
        imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop",
      },
      {
        name: "Sunglasses",
        type: "accessory",
        description: "Classic aviator sunglasses",
        imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop",
      },
      {
        name: "Leather Belt",
        type: "accessory",
        description: "Brown leather belt",
        imageUrl: "https://images.unsplash.com/photo-1624222247344-550fb60583c2?w=400&h=400&fit=crop",
      },
      {
        name: "Backpack",
        type: "accessory",
        description: "Canvas backpack",
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
      },
    ]

    console.log(`[v0] Step 2: Uploading ${sampleClothes.length} clothing items...`)

    for (let i = 0; i < sampleClothes.length; i++) {
      const item = sampleClothes[i]
      const itemId = i + 1

      try {
        // Download image from Unsplash
        console.log(`[v0] Downloading image for ${item.name}...`)
        const imageResponse = await fetch(item.imageUrl)
        if (!imageResponse.ok) {
          console.error(`[v0] Failed to download image for ${item.name}`)
          continue
        }
        const imageBlob = await imageResponse.blob()
        const imageBuffer = await imageBlob.arrayBuffer()

        // Upload to storage
        const storagePath = `${itemId}/main.jpg`
        console.log(`[v0] Uploading ${storagePath}...`)
        const { error: uploadError } = await supabase.storage.from("clothes").upload(storagePath, imageBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        })

        if (uploadError) {
          console.error(`[v0] Error uploading ${item.name}:`, uploadError)
          continue
        }

        // Insert into database
        console.log(`[v0] Adding ${item.name} to database...`)
        const { error: dbError } = await supabase.from("clothes").upsert({
          id: itemId,
          name: item.name,
          description: item.description,
          type: item.type,
          username: "nicoperez",
          public: true,
        })

        if (dbError) {
          console.error(`[v0] Error inserting ${item.name}:`, dbError)
        } else {
          console.log(`[v0] ✓ ${item.name} added successfully`)
        }
      } catch (error) {
        console.error(`[v0] Error processing ${item.name}:`, error)
      }
    }

    console.log("[v0] ✓ Wardrobe setup complete!")
    console.log("[v0] You should now see items in your wardrobe page")
  } catch (error) {
    console.error("[v0] Fatal error during setup:", error)
    throw error
  }
}

setupWardrobeComplete()
