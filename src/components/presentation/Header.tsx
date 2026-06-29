import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          <span className="text-primary">Racira</span>{" "}
          <span className="text-foreground">Presentation Tools</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
