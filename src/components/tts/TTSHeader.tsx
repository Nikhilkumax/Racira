"use client";

import { TTSLogo } from "@/components/tts/TTSLogo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useEffect, useState } from "react";

const NAV = [
  { href: "#studio", label: "Tool" },
  { href: "#features", label: "Features" },
  { href: "#faq", label: "FAQ" },
];

export function TTSHeader() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle/70 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Racira home" className="flex items-center">
          <TTSLogo />
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  className="rounded-md px-3 py-2 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {!mounted ? (
              <div className="h-4 w-4" />
            ) : theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>
          <Button asChild variant="hero" size="sm">
            <Link href="/">Explore Tools</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
