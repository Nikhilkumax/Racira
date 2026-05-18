"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

const nav = [
  { href: "/calculator", label: "Calculator" },
  { href: "/pdf-tools", label: "PDF" },
  { href: "/image-tools", label: "Image" },
  { href: "/voice", label: "Voice" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const ctaLabel = "Explore Tools";
  const ctaHref = "/calculator";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image 
            src="/racira-logo-navbar.png" 
            alt="Racira Logo" 
            width={32} 
            height={32} 
            className="h-8 w-8 object-contain"
          />
          <span className="text-lg font-bold tracking-tight">Racira</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-base hover:text-foreground",
                (pathname || "").startsWith(item.href) && "text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <Button asChild variant="hero" size="sm">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-border md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="container flex flex-col gap-1 py-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {item.label}
              </Link>
            ))}
            <Button asChild variant="hero" size="sm" className="mt-2">
              <Link href={ctaHref} onClick={() => setOpen(false)}>{ctaLabel}</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
