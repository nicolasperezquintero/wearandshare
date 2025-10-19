"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createClothesBucket() {
  console.log("[v0] Starting clothes bucket creation...")

  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("[v0] Error listing buckets:", listError)
      throw listError
    }

    console.log("[v0] Existing buckets:", buckets?.map((b) => b.name).join(", "))

    const bucketExists = buckets?.some((bucket) => bucket.name === "clothes")

    if (bucketExists) {
      console.log("[v0] ✓ Clothes bucket already exists!")
      return { success: true, message: "Bucket already exists" }
    }

    // Create the clothes bucket
    console.log("[v0] Creating clothes bucket...")
    const { data, error } = await supabase.storage.createBucket("clothes", {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
    })

    if (error) {
      console.error("[v0] Error creating bucket:", error)
      throw error
    }

    console.log("[v0] ✓ Successfully created clothes bucket!")
    console.log("[v0] Bucket data:", data)

    return { success: true, message: "Bucket created successfully", data }
  } catch (error) {
    console.error("[v0] Failed to create clothes bucket:", error)
    return { success: false, error }
  }
}

// Execute the function
createClothesBucket()
  .then((result) => {
    console.log("[v0] Final result:", result)
  })
  .catch((error) => {
    console.error("[v0] Unhandled error:", error)
  })
