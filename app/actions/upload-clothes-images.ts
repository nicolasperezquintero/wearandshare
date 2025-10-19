"use server"

import { createClient } from "@supabase/supabase-js"
import { decode } from "base64-arraybuffer"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function uploadClothesImage(clothesId: number, imageData: string) {
  try {
    console.log("[v0] Server action uploading image for clothes", clothesId)

    // Remove data URL prefix if present
    const base64Data = imageData.includes(",") ? imageData.split(",")[1] : imageData
    const arrayBuffer = decode(base64Data)

    const filePath = `${clothesId}/main.jpg`

    console.log("[v0] Uploading to clothes bucket:", filePath)

    const { data, error } = await supabaseAdmin.storage.from("clothes").upload(filePath, arrayBuffer, {
      contentType: "image/png",
      upsert: true,
    })

    if (error) {
      console.error(`[v0] Error uploading image:`, error)
      throw error
    }

    console.log("[v0] Successfully uploaded", filePath)
    return { success: true, path: data.path }
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return { success: false, error: String(error) }
  }
}
