"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-sm dark:border-zinc-800/50 dark:bg-zinc-950/80">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 dark:from-purple-400 dark:to-purple-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent dark:from-purple-400 dark:to-purple-300">
            Revellio
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-purple-600 dark:hover:text-purple-400",
              pathname === "/"
                ? "text-purple-600 dark:text-purple-400"
                : "text-zinc-600 dark:text-zinc-400"
            )}
          >
            Home
          </Link>
          <Link
            href="/playground"
            className={cn(
              "text-sm font-medium transition-colors hover:text-purple-600 dark:hover:text-purple-400",
              pathname === "/playground"
                ? "text-purple-600 dark:text-purple-400"
                : "text-zinc-600 dark:text-zinc-400"
            )}
          >
            Playground
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

