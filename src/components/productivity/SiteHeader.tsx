import Link from "next/link";
import { Zap } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform group-hover:rotate-6">
            <Zap className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Racira<span className="text-primary">.</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <a href="#tools" className="text-muted-foreground hover:text-foreground transition-colors">
            Tools
          </a>
          <Link
            href="/tools/deep-work-session-planner"
            className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-105"
          >
            Try Deep Work
          </Link>
        </nav>
      </div>
    </header>
  );
}
