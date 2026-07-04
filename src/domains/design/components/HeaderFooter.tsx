import Link from "next/link";
import { totalCount } from "@/domains/design/registry";

export function Header() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/design" className="text-xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-primary to-fuchsia-400 bg-clip-text text-transparent">Racira</span>{" "}
          <span className="text-foreground">Design</span>
        </Link>
        <div className="text-xs text-muted-foreground">{totalCount} tools</div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
      Racira Design — {totalCount} free design tools.
    </footer>
  );
}
