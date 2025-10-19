import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function main() {
  console.log("Creating Dua Lipa user and outfit...")

  // 1. Create user
  const { data: user, error: userError } = await supabase
    .from("users")
    .insert({
      username: "dualipa",
      name: "Dua Lipa",
    })
    .select()
    .single()

  if (userError) {
    console.error("Error creating user:", userError)
    return
  }
  console.log("Created user:", user)

  // 2. Create clothes items
  const clothes = [
    {
      name: "White Tailored Blazer",
      description: "Classic white blazer with notched lapels",
      type: "top",
      username: "dualipa",
      public: true,
      selling: false,
    },
    {
      name: "Beige Crop Top",
      description: "Minimalist beige crop top",
      type: "top",
      username: "dualipa",
      public: true,
      selling: false,
    },
    {
      name: "White Wide-Leg Pants",
      description: "High-waisted white wide-leg trousers",
      type: "bottom",
      username: "dualipa",
      public: true,
      selling: false,
    },
  ]

  const { data: clothesData, error: clothesError } = await supabase.from("clothes").insert(clothes).select()

  if (clothesError) {
    console.error("Error creating clothes:", clothesError)
    return
  }
  console.log("Created clothes:", clothesData)

  // 3. Upload clothing images to storage
  const clothingImages = [
    {
      id: clothesData[0].id,
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2_f56106a1-a899-4a85-91ae-502aa51d8f59_1000x-8MaOiWqD49e7iLkWnwCikrDnrODbY3.webp", // White blazer
      name: "white-blazer.webp",
    },
    {
      id: clothesData[1].id,
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/64bf91b3e339fae7d91cef3a901ffbf3-QKPQfeLcDI2nM6z22r8ukAILcq4Ua9.jpg", // Full outfit photo (for crop top reference)
      name: "beige-crop-top.jpg",
    },
    {
      id: clothesData[2].id,
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/A21084-DENIM-CROPPED-JEAN-WHITE-SCANLANTHEODORE-1_cb4c482b-15d4-4576-b1bc-5f436b0bec4e-U9gU6JCAtA4gOPzc3iexPAlBlmi6gP.webp", // White pants
      name: "white-pants.webp",
    },
  ]

  for (const img of clothingImages) {
    try {
      const response = await fetch(img.url)
      const blob = await response.blob()
      const buffer = await blob.arrayBuffer()

      const { error: uploadError } = await supabase.storage.from("clothes").upload(`${img.id}/main.jpg`, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      })

      if (uploadError) {
        console.error(`Error uploading image for ${img.id}:`, uploadError)
      } else {
        console.log(`Uploaded image for clothing item ${img.id}`)
      }
    } catch (error) {
      console.error(`Error fetching/uploading image for ${img.id}:`, error)
    }
  }

  // 4. Create outfit
  const { data: outfit, error: outfitError } = await supabase
    .from("outfits")
    .insert({
      username: "dualipa",
      name: "White Power Suit",
    })
    .select()
    .single()

  if (outfitError) {
    console.error("Error creating outfit:", outfitError)
    return
  }
  console.log("Created outfit:", outfit)

  // 5. Link clothes to outfit
  const outfitClothes = clothesData.map((cloth) => ({
    outfit_id: outfit.id,
    cloth_id: cloth.id,
  }))

  const { error: linkError } = await supabase.from("outfits_clothes").insert(outfitClothes)

  if (linkError) {
    console.error("Error linking clothes to outfit:", linkError)
    return
  }
  console.log("Linked clothes to outfit")

  // 6. Create post
  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      outfit_id: outfit.id,
      description: "Effortlessly chic in an all-white power suit. Perfect for summer days in the city ☀️",
      likes: 1523,
    })
    .select()
    .single()

  if (postError) {
    console.error("Error creating post:", postError)
    return
  }
  console.log("Created post:", post)

  // 7. Upload post image (full outfit photo)
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/64bf91b3e339fae7d91cef3a901ffbf3-QKPQfeLcDI2nM6z22r8ukAILcq4Ua9.jpg",
    )
    const blob = await response.blob()
    const buffer = await blob.arrayBuffer()

    const { error: uploadError } = await supabase.storage.from("posts").upload(`${post.id}/main.jpg`, buffer, {
      contentType: "image/jpeg",
      upsert: true,
    })

    if (uploadError) {
      console.error("Error uploading post image:", uploadError)
    } else {
      console.log("Uploaded post image")
    }
  } catch (error) {
    console.error("Error fetching/uploading post image:", error)
  }

  console.log("Successfully created Dua Lipa user with outfit and post!")
}

main()
