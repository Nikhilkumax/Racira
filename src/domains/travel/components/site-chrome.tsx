import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--sky)] text-white font-bold">R</span>
          <span className="font-display text-lg font-bold">
            <span style={{ color: "var(--sky)" }}>Racira</span> Travel
          </span>
        </Link>
        <nav className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">All Tools</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border py-10 text-center text-sm text-muted-foreground">
      <p>© {new Date().getFullYear()} Racira Travel. 112 free travel tools.</p>
    </footer>
  );
}
