import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-1 text-xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary to-[oklch(0.7_0.2_290)] bg-clip-text text-transparent">
            Racira
          </span>
          <span className="text-foreground">Colors</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}