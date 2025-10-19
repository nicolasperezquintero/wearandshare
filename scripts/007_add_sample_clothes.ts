import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function downloadAndUploadImage(url: string, path: string) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()

    const { data, error } = await supabase.storage.from("clothes").upload(path, arrayBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    })

    if (error) {
      console.error(`Error uploading ${path}:`, error)
      return false
    }

    console.log(`✓ Uploaded ${path}`)
    return true
  } catch (error) {
    console.error(`Error downloading/uploading ${path}:`, error)
    return false
  }
}

async function main() {
  console.log("Setting up clothes bucket and adding sample items...")

  // Create bucket if it doesn't exist
  const { data: buckets } = await supabase.storage.listBuckets()
  const clothesBucketExists = buckets?.some((b) => b.name === "clothes")

  if (!clothesBucketExists) {
    const { error } = await supabase.storage.createBucket("clothes", {
      public: true,
      fileSizeLimit: 5242880, // 5MB
    })

    if (error) {
      console.error("Error creating bucket:", error)
    } else {
      console.log("✓ Created 'clothes' bucket")
    }
  } else {
    console.log("✓ 'clothes' bucket already exists")
  }

  // Sample clothing items with Unsplash images
  const sampleClothes = [
    {
      name: "Classic White T-Shirt",
      description: "casual, basic, cotton, white",
      type: "top",
      public: true,
      selling: false,
      username: "nicoperez",
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
    },
    {
      name: "Black Leather Jacket",
      description: "leather, black, edgy, winter",
      type: "top",
      public: true,
      selling: true,
      username: "nicoperez",
      imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop",
    },
    {
      name: "Striped Button-Down Shirt",
      description: "striped, formal, cotton, blue",
      type: "top",
      public: true,
      selling: false,
      username: "nicoperez",
      imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop",
    },
    {
      name: "Denim Hoodie",
      description: "denim, casual, hoodie, blue",
      type: "top",
      public: true,
      selling: false,
      username: "nicoperez",
      imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop",
    },
    {
      name: "Blue Jeans",
      description: "denim, blue, casual, slim-fit",
      type: "bottom",
      public: true,
      selling: false,
      username: "nicoperez",
      imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop",
    },
    {
      name: "Black Chinos",
      description: "chinos, black, formal, cotton",
      type: "bottom",
      public: true,
      selling: false,
      username: "nicoperez",
      imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=600&fit=crop",
    },
    {
      name: "Khaki Cargo Pants",
      description: "cargo, khaki, casual, utility",
      type: "bottom",
      public: true,
      selling: true,
      username: "nicoperez",
      imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=600&fit=crop",
    },
    {
      name: "White Sneakers",
      description: "sneakers, white, casual, comfortable",
      type: "shoe",
      public: true,
      selling: false,
      username: "nicoperez",
      imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop",
    },
    {
      name: "Black Boots",
      description: "boots, black, leather, winter",
      type: "shoe",
      public: true,
      selling: true,
      username: "nicoperez",
      imageUrl: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&h=600&fit=crop",
    },
    {
      name: "Brown Loafers",
      description: "loafers, brown, formal, leather",
      type: "shoe",
      public: true,
      selling: false,
      username: "nicoperez",
      imageUrl: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&h=600&fit=crop",
    },
    {
      name: "Aviator Sunglasses",
      description: "sunglasses, aviator, gold, classic",
      type: "accessory",
      public: true,
      selling: true,
      username: "nicoperez",
      imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop",
    },
    {
      name: "Leather Watch",
      description: "watch, leather, brown, elegant",
      type: "accessory",
      public: true,
      selling: true,
      username: "nicoperez",
      imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&h=600&fit=crop",
    },
    {
      name: "Black Baseball Cap",
      description: "cap, black, casual, baseball",
      type: "accessory",
      public: true,
      selling: false,
      username: "nicoperez",
      imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=600&fit=crop",
    },
    {
      name: "Canvas Backpack",
      description: "backpack, canvas, beige, casual",
      type: "accessory",
      public: true,
      selling: false,
      username: "nicoperez",
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
    },
  ]

  console.log("\nAdding sample clothing items...")

  for (const item of sampleClothes) {
    try {
      // Insert clothing item into database
      const { data: clothingData, error: insertError } = await supabase
        .from("clothes")
        .insert({
          name: item.name,
          description: item.description,
          type: item.type,
          public: item.public,
          selling: item.selling,
          username: item.username,
        })
        .select()
        .single()

      if (insertError) {
        console.error(`Error inserting ${item.name}:`, insertError)
        continue
      }

      console.log(`✓ Created clothing item: ${item.name} (ID: ${clothingData.id})`)

      // Download and upload image
      const imagePath = `${clothingData.id}/main.jpg`
      await downloadAndUploadImage(item.imageUrl, imagePath)
    } catch (error) {
      console.error(`Error processing ${item.name}:`, error)
    }
  }

  console.log("\n✓ Sample clothes setup complete!")
  console.log("You can now view your wardrobe with real clothing items and images.")
}

main()
