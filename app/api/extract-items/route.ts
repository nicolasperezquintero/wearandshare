import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { image } = body

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    console.log("[v0] Calling extract-items Edge Function...")

    const { data, error } = await supabase.functions.invoke("extract-items", {
      body: { base64_person: image },
    })

    if (error) {
      console.error("[v0] Edge Function error:", error)
      return NextResponse.json({ error: error.message || "Edge Function failed" }, { status: 500 })
    }

    console.log("[v0] Edge Function response:", data)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] API route error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
