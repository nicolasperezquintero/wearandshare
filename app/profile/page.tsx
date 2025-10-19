"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Share2, Shirt } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface UserData {
  username: string;
  name: string;
  created_at: string;
}

interface Post {
  id: number;
  outfit_id: string;
  description: string;
  likes: number;
  created_at: string;
  image?: string;
}

interface Outfit {
  id: string;
  name: string;
  username: string;
  created_at: string;
  image?: string;
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"posts">("posts");
  const [user, setUser] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUsername = "nicoperez";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch user info
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("username", currentUsername)
          .single();

        if (userError) throw userError;
        setUser(userData);

        // Fetch user's posts
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select(
            `
            *,
            outfits!inner(username)
          `
          )
          .eq("outfits.username", currentUsername)
          .order("created_at", { ascending: false });

        if (postsError) throw postsError;

        // Add image URLs to posts
        const postsWithImages = (postsData || []).map((post) => ({
          ...post,
          image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/posts/${post.id}/main.jpg`,
        }));

        setPosts(postsWithImages);

        // Fetch user's outfits
        const { data: outfitsData, error: outfitsError } = await supabase
          .from("outfits")
          .select("*")
          .eq("username", currentUsername)
          .order("created_at", { ascending: false });

        if (outfitsError) throw outfitsError;

        // Add image URLs to outfits (try to get post image for each outfit)
        const outfitsWithImages = await Promise.all(
          (outfitsData || []).map(async (outfit) => {
            const { data: postData } = await supabase
              .from("posts")
              .select("id")
              .eq("outfit_id", outfit.id)
              .limit(1)
              .single();

            const imageUrl = postData
              ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/posts/${postData.id}/main.jpg`
              : "/placeholder.svg";

            return {
              ...outfit,
              image: imageUrl,
            };
          })
        );

        setOutfits(outfitsWithImages);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const formatNumber = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <p className="text-muted-foreground">Cargando perfil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <p className="text-muted-foreground">Usuario no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold">Perfil</h1>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* User Info */}
      <section className="px-6 pt-6 text-center space-y-4">
        <div className="flex justify-center">
          <Avatar className="w-24 h-24">
            <AvatarFallback className="text-3xl">
              {user.name?.[0] || user.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div>
          <h2 className="text-xl font-semibold">@{user.username}</h2>
          {user.name && <p className="text-muted-foreground">{user.name}</p>}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 text-sm">
          <div className="text-center">
            <p className="font-bold">{formatNumber(posts.length)}</p>
            <p className="text-muted-foreground">Publicaciones</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="mt-6 flex justify-around border-b border-border">
        <button
          onClick={() => setActiveTab("posts")}
          className={`py-2 text-sm font-medium ${
            activeTab === "posts"
              ? "text-foreground border-b-2 border-foreground"
              : "text-muted-foreground"
          }`}
        >
          Publicaciones
        </button>
      </div>

      {/* Tab Content */}
      <section className="px-2 mt-4">
        {activeTab === "posts" && (
          <>
            {posts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className="aspect-square relative overflow-hidden rounded-sm"
                  >
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt={post.description || "Post"}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground mt-10 flex flex-col items-center">
                <Shirt className="h-12 w-12 mb-4" />
                <p>No hay publicaciones todavía</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
