import Link from "next/link";
import { Type } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <Type className="h-4 w-4" />
          </span>
          <span>
            <span className="text-primary">Racira</span> Typography
          </span>
        </Link>
        <nav className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">All tools</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-muted-foreground flex flex-wrap items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} Racira Typography. Free typography tools in your browser.</p>
        <p>No signup required.</p>
      </div>
    </footer>
  );
}