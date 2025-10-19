import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

console.log("Creating Dua Lipa outfit...")

// Fetch the clothes for dualipa user
const { data: clothes, error: clothesError } = await supabase
  .from("clothes")
  .select("*")
  .eq("username", "dualipa")
  .order("created_at", { ascending: true })

if (clothesError) {
  console.error("Error fetching clothes:", clothesError)
  throw clothesError
}

console.log(
  `Found ${clothes.length} clothes for dualipa:`,
  clothes.map((c) => c.name),
)

if (clothes.length === 0) {
  console.error("No clothes found for dualipa user")
  throw new Error("No clothes found")
}

// Create the outfit
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
  throw outfitError
}

console.log("Created outfit:", outfit)

// Link all clothes to the outfit
const outfitClothesLinks = clothes.map((cloth) => ({
  outfit_id: outfit.id,
  cloth_id: cloth.id,
}))

const { error: linkError } = await supabase.from("outfits_clothes").insert(outfitClothesLinks)

if (linkError) {
  console.error("Error linking clothes to outfit:", linkError)
  throw linkError
}

console.log(`Linked ${clothes.length} clothes to outfit`)

// Create a post with the outfit
const { data: post, error: postError } = await supabase
  .from("posts")
  .insert({
    outfit_id: outfit.id,
    description: "Serving looks in this all-white power suit 🤍✨ #DuaLipa #WhiteSuit #PowerDressing",
    likes: 1523,
  })
  .select()
  .single()

if (postError) {
  console.error("Error creating post:", postError)
  throw postError
}

console.log("Created post:", post)

// Upload the main outfit image to the posts bucket
const outfitImageUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/64bf91b3e339fae7d91cef3a901ffbf3-QKPQfeLcDI2nM6z22r8ukAILcq4Ua9.jpg"
const imageResponse = await fetch(outfitImageUrl)
const imageBuffer = await imageResponse.arrayBuffer()

const { error: uploadError } = await supabase.storage.from("posts").upload(`${post.id}/main.jpg`, imageBuffer, {
  contentType: "image/jpeg",
  upsert: true,
})

if (uploadError) {
  console.error("Error uploading post image:", uploadError)
  throw uploadError
}

console.log("Uploaded post image successfully")
console.log("✅ Dua Lipa outfit created successfully!")
console.log(`Outfit ID: ${outfit.id}`)
console.log(`Post ID: ${post.id}`)
console.log(`Clothes in outfit: ${clothes.map((c) => c.name).join(", ")}`)
