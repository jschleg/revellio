"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
        "border-zinc-200 bg-zinc-50 hover:bg-zinc-100",
        "dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800",
        "hover:border-purple-300 dark:hover:border-purple-700"
      )}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
      ) : (
        <Moon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
      )}
    </button>
  );
}

