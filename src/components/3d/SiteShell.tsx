"use client";

import Link from "next/link";
import { Box } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("racira-theme");
    const isDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
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
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {dark ? "☀" : "☾"}
    </button>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Box className="h-4 w-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">
              <span className="text-primary">Racira</span> 3D &amp; Print
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-border py-8 mt-16">
        <div className="racira-page-container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Racira 3D &amp; Print — Free browser tools for 3D and print workflows.
        </div>
      </footer>
    </div>
  );
}
