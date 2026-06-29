"use client";

import Link from "next/link";
import { Moon, Sun, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/finance/site";

const nav = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Articles" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
            <span className="font-display text-base font-bold text-primary-foreground">R</span>
          </span>
          {site.name}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => {
            const isActive = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`text-sm font-medium transition-colors hover:text-foreground ${isActive ? "text-foreground" : "text-muted-foreground"}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/blog" className="hidden md:inline-flex">
            <Button variant="ghost" size="icon" aria-label="Search articles">
              <Search className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Link href="/blog" className="hidden md:block">
            <Button size="sm" className="font-medium">Subscribe</Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            {nav.map((n) => {
              const isActive = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-foreground ${isActive ? "bg-muted text-foreground" : "text-muted-foreground"}`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}