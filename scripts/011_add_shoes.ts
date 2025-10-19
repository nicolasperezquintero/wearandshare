import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")

const shoes = [
  {
    name: "White Sneakers",
    description: "Classic white sneakers",
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
    type: "shoe",
    username: "nicoperez",
    public: true,
  },
  {
    name: "Black Boots",
    description: "Leather black boots",
    imageUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80",
    type: "shoe",
    username: "nicoperez",
    public: true,
  },
  {
    name: "Running Shoes",
    description: "Athletic running shoes",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    type: "shoe",
    username: "nicoperez",
    public: true,
  },
  {
    name: "Brown Loafers",
    description: "Casual brown loafers",
    imageUrl: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80",
    type: "shoe",
    username: "nicoperez",
    public: true,
  },
  {
    name: "Canvas Shoes",
    description: "Casual canvas shoes",
    imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80",
    type: "shoe",
    username: "nicoperez",
    public: true,
  },
]

async function addShoes() {
  console.log("[v0] Starting to add shoes...")

  for (const shoe of shoes) {
    try {
      console.log(`[v0] Processing: ${shoe.name}`)

      // Insert into database first to get the ID
      const { data: insertedShoe, error: insertError } = await supabase
        .from("clothes")
        .insert({
          name: shoe.name,
          description: shoe.description,
          type: shoe.type,
          username: shoe.username,
          public: shoe.public,
        })
        .select()
        .single()

      if (insertError) {
        console.error(`[v0] Error inserting ${shoe.name}:`, insertError)
        continue
      }

      console.log(`[v0] Inserted ${shoe.name} with ID: ${insertedShoe.id}`)

      // Download image
      console.log(`[v0] Downloading image for ${shoe.name}...`)
      const imageResponse = await fetch(shoe.imageUrl)
      const imageBlob = await imageResponse.blob()
      const imageBuffer = await imageBlob.arrayBuffer()

      // Upload to storage with ID as filename
      const storagePath = `${insertedShoe.id}/main.jpg`
      console.log(`[v0] Uploading to: ${storagePath}`)

      const { error: uploadError } = await supabase.storage.from("clothes").upload(storagePath, imageBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      })

      if (uploadError) {
        console.error(`[v0] Error uploading image for ${shoe.name}:`, uploadError)
        continue
      }

      console.log(`[v0] ✓ Successfully added ${shoe.name}`)
    } catch (error) {
      console.error(`[v0] Error processing ${shoe.name}:`, error)
    }
  }

  console.log("[v0] Finished adding shoes!")
}

addShoes()
