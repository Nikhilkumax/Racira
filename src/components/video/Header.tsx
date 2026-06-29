"use client";
import Link from "next/link";
import { Moon, Sun, Video } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefers;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <header className="border-b border-border bg-background/70 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-7xl flex items-center justify-between h-16 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Video className="h-4 w-4" />
          </span>
          <span className="text-primary">Racira</span>
          <span className="text-foreground">Video</span>
        </Link>
        <button
          type="button"
          aria-label="Toggle dark mode"
          onClick={toggle}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}