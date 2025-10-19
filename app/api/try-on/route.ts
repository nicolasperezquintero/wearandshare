import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/try-on`

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        "x-client-info": "next-proxy",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Proxy error" }, { status: 500 })
  }
}
