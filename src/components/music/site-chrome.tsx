"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Moon, Sun, Music2 } from "lucide-react";

export function SiteHeader() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const d = stored ? stored === "dark" : prefers;
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Music2 className="h-4 w-4" />
          </span>
          <span className="text-primary">Racira</span>
          <span className="text-foreground">Music</span>
        </Link>
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p>
            <span className="font-display font-semibold text-foreground">Racira Music</span> — free
            browser tools for musicians.
          </p>
          <p>© {new Date().getFullYear()} Racira</p>
        </div>
      </div>
    </footer>
  );
}
