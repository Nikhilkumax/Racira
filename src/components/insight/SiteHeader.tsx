import Link from "next/link";
import { BarChart3 } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            <span className="text-primary">Racira</span>{" "}
            <span className="text-foreground">Data &amp; Charts</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          <Link href="/" className="hover:text-foreground">Tools</Link>
          <a href="#categories" className="hover:text-foreground">Categories</a>
        </nav>
      </div>
    </header>
  );
}
