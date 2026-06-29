import Link from "next/link";
import { AudioLines } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground shadow-[var(--shadow-elegant)]"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            <AudioLines className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight text-foreground">Racira Audio</span>
            <span className="text-[11px] text-muted-foreground">Free online audio tools</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <a href="/#categories" className="transition-colors hover:text-foreground">
            Categories
          </a>
          <Link
            href="/tools/audio-conversion/mp3-converter"
            className="rounded-lg bg-primary px-3.5 py-2 text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            MP3 Converter
          </Link>
        </nav>
      </div>
    </header>
  );
}
