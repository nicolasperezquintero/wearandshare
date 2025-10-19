import { Header } from "@/components/header"
import { OutfitCard } from "@/components/outfit-card"
import { BottomNav } from "@/components/bottom-nav"
import { supabase } from "@/lib/supabaseClient"

// const outfits = [
//   {
//     id: 1,
//     username: "@styleIcon",
//     mainImage: supabase.storage.from("outfits").getPublicUrl("1/main.jpg").data
//       .publicUrl,
//     gallery: ["/images/outfit1/alt1.jpg", "/images/outfit1/alt2.jpg"],
//     likes: 2847,
//     comments: 143,
//     clothes: [
//       { id: 1, name: "Oversized Hoodie", category: "Top" },
//       { id: 2, name: "Cargo Pants", category: "Bottom" },
//       { id: 3, name: "Sneakers", category: "Shoes" },
//     ],
//     description: "Cozy streetwear vibes 🔥 Oversized hoodie + cargo pants",
//   },
//   {
//     id: 2,
//     username: "@fashionista",
//     mainImage: "/images/outfit2/main.jpg",
//     gallery: ["/images/outfit2/alt1.jpg"],
//     likes: 3621,
//     comments: 198,
//     clothes: [
//       { id: 1, name: "Oversized Hoodie", category: "Top" },
//       { id: 2, name: "Cargo Pants", category: "Bottom" },
//       { id: 3, name: "Sneakers", category: "Shoes" },
//     ],
//     description:
//       "Clean & minimal ✨ Classic white shirt with tailored trousers",
//   },
//   {
//     id: 3,
//     username: "@trendsetter",
//     mainImage: "/images/outfit3/main.jpg",
//     gallery: ["/images/outfit3/alt1.jpg"],
//     likes: 4210,
//     comments: 256,
//     clothes: [
//       { id: 1, name: "Oversized Hoodie", category: "Top" },
//       { id: 2, name: "Cargo Pants", category: "Bottom" },
//       { id: 3, name: "Sneakers", category: "Shoes" },
//     ],
//     description:
//       "Bold and beautiful 🌈 Mixing patterns and colors with confidence",
//   },
// ];

export default async function Home() {
  const { data: posts, error } = await supabase
    .from("posts")
    .select(`
      *,
      outfits (
        id,
        name,
        username,
        created_at,
        outfits_clothes (
          id,
          clothes (
            id,
            name,
            type,
            sponsored,
            sponsor_link
          )
        )
      )
    `)
    .order("created_at", { ascending: false })

  console.log("[v0] Posts query error:", error)
  console.log("[v0] Posts data:", JSON.stringify(posts, null, 2))

  // Fetch gallery data for each post
  const postsWithGallery = await Promise.all(
    (posts || []).map(async (post) => {
      const { data: gallery } = await supabase.storage.from("posts").list(post.id.toString(), {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      })
      return { ...post, gallery: gallery || [] }
    }),
  )

  return (
    <div className="relative min-h-screen bg-background pb-20">
      <Header />
      <div className="flex flex-col gap-6 p-4 overflow-y-auto">
        {postsWithGallery.map((post) => (
          <OutfitCard key={post.id} {...post} />
        ))}
      </div>
      <BottomNav />
    </div>
  )
}
