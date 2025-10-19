"use server"

import { createClient } from "@supabase/supabase-js"
import { decode } from "base64-arraybuffer"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function uploadPostImages(postId: number, images: { name: string; data: string }[]) {
  try {
    console.log("[v0] Server action received", images.length, "images for post", postId)

    const uploadResults = []

    for (const image of images) {
      const base64Data = image.data.split(",")[1]
      const arrayBuffer = decode(base64Data)

      const filePath = `${postId}/${image.name}`

      console.log("[v0] Uploading", filePath)

      const { data, error } = await supabaseAdmin.storage.from("posts").upload(filePath, arrayBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      })

      if (error) {
        console.error(`[v0] Error uploading ${image.name}:`, error)
        throw error
      }

      console.log("[v0] Successfully uploaded", filePath)
      uploadResults.push({ name: image.name, path: data.path })
    }

    return { success: true, results: uploadResults }
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return { success: false, error: String(error) }
  }
}
