import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function populateClothes() {
  console.log("[v0] Starting to populate clothes...")

  // Sample clothing items with Unsplash images
  const clothingItems = [
    {
      name: "White T-Shirt",
      description: "Classic white cotton t-shirt",
      type: "top",
      username: "nicoperez",
      public: true,
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f95609a7?w=400&h=400&fit=crop",
    },
    {
      name: "Black Hoodie",
      description: "Comfortable black hoodie",
      type: "top",
      username: "nicoperez",
      public: true,
      imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
    },
    {
      name: "Blue Jeans",
      description: "Classic blue denim jeans",
      type: "bottom",
      username: "nicoperez",
      public: true,
      imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
    },
    {
      name: "Black Pants",
      description: "Slim fit black pants",
      type: "bottom",
      username: "nicoperez",
      public: true,
      imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop",
    },
    {
      name: "White Sneakers",
      description: "Clean white sneakers",
      type: "shoe",
      username: "nicoperez",
      public: true,
      imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
    },
    {
      name: "Black Boots",
      description: "Leather black boots",
      type: "shoe",
      username: "nicoperez",
      public: true,
      imageUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&h=400&fit=crop",
    },
    {
      name: "Baseball Cap",
      description: "Black baseball cap",
      type: "accessory",
      username: "nicoperez",
      public: true,
      imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop",
    },
    {
      name: "Sunglasses",
      description: "Classic aviator sunglasses",
      type: "accessory",
      username: "nicoperez",
      public: true,
      imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
    },
  ]

  for (const item of clothingItems) {
    try {
      console.log(`[v0] Processing: ${item.name}`)

      // Download image
      console.log(`[v0] Downloading image from: ${item.imageUrl}`)
      const imageResponse = await fetch(item.imageUrl)
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.statusText}`)
      }
      const imageBlob = await imageResponse.blob()
      console.log(`[v0] Downloaded ${imageBlob.size} bytes`)

      // Insert into database first to get the ID
      console.log(`[v0] Inserting into database...`)
      const { data: clothData, error: dbError } = await supabase
        .from("clothes")
        .insert({
          name: item.name,
          description: item.description,
          type: item.type,
          username: item.username,
          public: item.public,
        })
        .select()
        .single()

      if (dbError) {
        console.error(`[v0] Database error:`, dbError)
        continue
      }

      console.log(`[v0] Created database record with ID: ${clothData.id}`)

      // Upload image to storage with the cloth ID as filename
      const fileName = `${clothData.id}.jpg`
      console.log(`[v0] Uploading to storage as: ${fileName}`)

      const { error: uploadError } = await supabase.storage.from("clothes").upload(fileName, imageBlob, {
        contentType: "image/jpeg",
        upsert: true,
      })

      if (uploadError) {
        console.error(`[v0] Upload error:`, uploadError)
        continue
      }

      console.log(`[v0] ✓ Successfully added: ${item.name}`)
    } catch (error) {
      console.error(`[v0] Error processing ${item.name}:`, error)
    }
  }

  console.log("[v0] Finished populating clothes!")
}

populateClothes()
