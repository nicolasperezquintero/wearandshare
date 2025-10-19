// This script fetches the CSV data from the provided URLs and inserts it into the database
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// CSV URLs
const CSV_URLS = {
  users: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/users_rows-fzvnA7hyIOc39bLiM1wjh7pYe8q0Ei.csv",
  clothes: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/clothes_rows-DIPlBDOEWGHJq5MBmel9xgxptkwWmj.csv",
  outfits: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/outfits_rows-ikS41fcIJ7zINQfKClJSqdlALiintm.csv",
  outfits_clothes:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/outfits_clothes_rows-mZhJvcoa0rAR0ixFztVOdOsaryGl0j.csv",
  posts: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/posts_rows-tQSyjE2qzJJWeonQz45y1vcrzMPCUy.csv",
}

function parseCSV(text: string): any[] {
  const lines = text.trim().split("\n")
  const headers = lines[0].split(",").map((h) => h.trim())

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim())
    const obj: any = {}
    headers.forEach((header, i) => {
      obj[header] = values[i] || null
    })
    return obj
  })
}

async function importData() {
  console.log("[v0] Starting CSV import...")

  try {
    // Import users first (no foreign keys)
    console.log("[v0] Importing users...")
    const usersResponse = await fetch(CSV_URLS.users)
    const usersText = await usersResponse.text()
    const users = parseCSV(usersText)

    for (const user of users) {
      const { error } = await supabase.from("users").upsert(
        {
          created_at: user.created_at,
          name: user.name,
          username: user.username,
        },
        { onConflict: "username" },
      )

      if (error) console.error("[v0] Error inserting user:", error)
    }
    console.log(`[v0] Imported ${users.length} users`)

    // Import clothes (depends on users)
    console.log("[v0] Importing clothes...")
    const clothesResponse = await fetch(CSV_URLS.clothes)
    const clothesText = await clothesResponse.text()
    const clothes = parseCSV(clothesText)

    for (const cloth of clothes) {
      const { error } = await supabase.from("clothes").upsert(
        {
          id: Number.parseInt(cloth.id),
          created_at: cloth.created_at,
          name: cloth.name,
          description: cloth.description,
          public: cloth.public === "true",
          selling: cloth.selling === "true" ? true : cloth.selling === "false" ? false : null,
          username: cloth.username,
          type: cloth.type,
        },
        { onConflict: "id" },
      )

      if (error) console.error("[v0] Error inserting cloth:", error)
    }
    console.log(`[v0] Imported ${clothes.length} clothes`)

    // Import outfits (depends on users)
    console.log("[v0] Importing outfits...")
    const outfitsResponse = await fetch(CSV_URLS.outfits)
    const outfitsText = await outfitsResponse.text()
    const outfits = parseCSV(outfitsText)

    for (const outfit of outfits) {
      const { error } = await supabase.from("outfits").upsert(
        {
          id: outfit.id,
          created_at: outfit.created_at,
          username: outfit.username,
        },
        { onConflict: "id" },
      )

      if (error) console.error("[v0] Error inserting outfit:", error)
    }
    console.log(`[v0] Imported ${outfits.length} outfits`)

    // Import outfits_clothes (depends on clothes and outfits)
    console.log("[v0] Importing outfits_clothes...")
    const outfitsClothesResponse = await fetch(CSV_URLS.outfits_clothes)
    const outfitsClothesText = await outfitsClothesResponse.text()
    const outfitsClothes = parseCSV(outfitsClothesText)

    for (const oc of outfitsClothes) {
      const { error } = await supabase.from("outfits_clothes").upsert(
        {
          id: Number.parseInt(oc.id),
          created_at: oc.created_at,
          cloth_id: Number.parseInt(oc.cloth_id),
          outfit_id: oc.outfit_id,
        },
        { onConflict: "id" },
      )

      if (error) console.error("[v0] Error inserting outfit_cloth:", error)
    }
    console.log(`[v0] Imported ${outfitsClothes.length} outfit-cloth relationships`)

    // Import posts (depends on outfits)
    console.log("[v0] Importing posts...")
    const postsResponse = await fetch(CSV_URLS.posts)
    const postsText = await postsResponse.text()
    const posts = parseCSV(postsText)

    for (const post of posts) {
      const { error } = await supabase.from("posts").upsert(
        {
          id: Number.parseInt(post.id),
          created_at: post.created_at,
          likes: Number.parseInt(post.likes),
          description: post.description,
          outfit_id: post.outfit_id,
        },
        { onConflict: "id" },
      )

      if (error) console.error("[v0] Error inserting post:", error)
    }
    console.log(`[v0] Imported ${posts.length} posts`)

    console.log("[v0] CSV import complete!")
  } catch (error) {
    console.error("[v0] Import failed:", error)
  }
}

importData()
