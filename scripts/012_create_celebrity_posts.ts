import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")

async function createCelebrityPosts() {
  console.log("[v0] Starting celebrity posts creation...")

  // Celebrity data
  const celebrities = [
    {
      username: "zendaya",
      name: "Zendaya",
      posts: [
        {
          description: "Red carpet look at the Met Gala 2024 ✨",
          likes: 2847,
          imageUrl: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&h=1000&fit=crop",
        },
        {
          description: "Casual street style in NYC",
          likes: 1923,
          imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1000&fit=crop",
        },
      ],
    },
    {
      username: "harrystyles",
      name: "Harry Styles",
      posts: [
        {
          description: "Love On Tour outfit 🎤",
          likes: 3421,
          imageUrl: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&h=1000&fit=crop",
        },
      ],
    },
    {
      username: "badgalriri",
      name: "Rihanna",
      posts: [
        {
          description: "Fenty x Puma collection preview",
          likes: 4156,
          imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=1000&fit=crop",
        },
        {
          description: "Super Bowl LVII halftime show look 🏈",
          likes: 5892,
          imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1000&fit=crop",
        },
      ],
    },
    {
      username: "badbunnypr",
      name: "Bad Bunny",
      posts: [
        {
          description: "Coachella 2023 vibes 🌴",
          likes: 2634,
          imageUrl: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&h=1000&fit=crop",
        },
      ],
    },
    {
      username: "bellahadid",
      name: "Bella Hadid",
      posts: [
        {
          description: "Paris Fashion Week SS24",
          likes: 3789,
          imageUrl: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&h=1000&fit=crop",
        },
      ],
    },
  ]

  // Get existing clothes to link to outfits
  const { data: existingClothes, error: clothesError } = await supabase.from("clothes").select("id, type").limit(10)

  if (clothesError) {
    console.error("[v0] Error fetching clothes:", clothesError)
    return
  }

  console.log(`[v0] Found ${existingClothes?.length || 0} existing clothes items`)

  for (const celebrity of celebrities) {
    // Create user
    const { error: userError } = await supabase
      .from("users")
      .upsert({ username: celebrity.username, name: celebrity.name })
      .select()

    if (userError) {
      console.log(`[v0] User ${celebrity.username} might already exist, continuing...`)
    } else {
      console.log(`[v0] Created user: ${celebrity.name}`)
    }

    // Create posts for this celebrity
    for (const postData of celebrity.posts) {
      // Create outfit
      const { data: outfit, error: outfitError } = await supabase
        .from("outfits")
        .insert({
          username: celebrity.username,
        })
        .select()
        .single()

      if (outfitError) {
        console.error(`[v0] Error creating outfit for ${celebrity.name}:`, outfitError)
        continue
      }

      console.log(`[v0] Created outfit: ${outfit.id}`)

      // Link 2-3 random clothes to this outfit
      const numClothes = Math.floor(Math.random() * 2) + 2 // 2-3 items
      const shuffled = [...(existingClothes || [])].sort(() => Math.random() - 0.5)
      const selectedClothes = shuffled.slice(0, numClothes)

      for (const cloth of selectedClothes) {
        const { error: linkError } = await supabase.from("outfits_clothes").insert({
          outfit_id: outfit.id,
          cloth_id: cloth.id,
        })

        if (linkError) {
          console.error(`[v0] Error linking cloth ${cloth.id}:`, linkError)
        }
      }

      // Create post
      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({
          outfit_id: outfit.id,
          description: postData.description,
          likes: postData.likes,
        })
        .select()
        .single()

      if (postError) {
        console.error(`[v0] Error creating post:`, postError)
        continue
      }

      console.log(`[v0] Created post: ${post.id}`)

      // Download and upload image to storage
      try {
        const imageResponse = await fetch(postData.imageUrl)
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.statusText}`)
        }

        const imageBlob = await imageResponse.blob()
        const imageBuffer = await imageBlob.arrayBuffer()

        const { error: uploadError } = await supabase.storage.from("posts").upload(`${post.id}/main.jpg`, imageBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        })

        if (uploadError) {
          console.error(`[v0] Error uploading image for post ${post.id}:`, uploadError)
        } else {
          console.log(`[v0] Uploaded image for post ${post.id}`)
        }
      } catch (error) {
        console.error(`[v0] Error downloading/uploading image:`, error)
      }
    }
  }

  console.log("[v0] ✓ Celebrity posts creation complete!")
}

createCelebrityPosts()
