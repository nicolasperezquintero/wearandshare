"use client";

import { Home, Plus, Search, Shirt, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const BottomNav = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-center justify-around py-3 px-4">
        {/* Home */}
        <Button
          variant="ghost"
          size="icon"
          asChild
          className={isActive("/") ? "text-primary" : "text-muted-foreground"}
        >
          <Link href="/">
            <Home className="h-6 w-6" />
          </Link>
        </Button>

        {/* Search */}
        <Button
          variant="ghost"
          size="icon"
          asChild
          className={
            isActive("/search") ? "text-primary" : "text-muted-foreground"
          }
        >
          <Link href="/search">
            <Search className="h-6 w-6" />
          </Link>
        </Button>

        {/* add outfit - Big Center Button */}
        <Button
          variant={isActive("/create-post") ? "default" : "outline"}
          size="iconLg"
          asChild
          className="h-14 w-14 rounded-full shadow-glow"
        >
          <Link href="/create-post">
            <Plus className="h-7 w-7" />
          </Link>
        </Button>

        {/* Wardrobe */}
        <Button
          variant="ghost"
          size="icon"
          asChild
          className={
            isActive("/wardrobe") ? "text-primary" : "text-muted-foreground"
          }
        >
          <Link href="/wardrobe">
            <Shirt className="h-6 w-6" />
          </Link>
        </Button>

        {/* Profile */}
        <Button
          variant="ghost"
          size="icon"
          asChild
          className={
            isActive("/profile") ? "text-primary" : "text-muted-foreground"
          }
        >
          <Link href="/profile">
            <User className="h-6 w-6" />
          </Link>
        </Button>
      </div>
    </nav>
  );
};
