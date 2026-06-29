"use client";

import Link from "next/link";
import { Moon, Sun, Wrench } from "lucide-react";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("racira-theme");
    const isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("racira-theme", next ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="icon-chip h-9 w-9 rounded-lg">
            <Wrench className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            <span className="text-primary">Racira</span>{" "}
            <span className="text-foreground">Engineering</span>
          </span>
        </Link>
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
