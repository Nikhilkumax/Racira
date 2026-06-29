"use client";

import Link from "next/link";
import { Dumbbell, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-primary-foreground">
            <Dumbbell className="h-4 w-4" />
          </span>
          <span className="text-brand">Racira</span>
          <span className="text-foreground">Fitness</span>
        </Link>
        <button
          onClick={() => setDark((d) => !d)}
          className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground"
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
