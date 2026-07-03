import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="racira-page-container py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} DevForge. All rights reserved.</p>
        <Link href="/" className="hover:text-foreground transition-colors">
          Built for developers, by developers.
        </Link>
      </div>
    </footer>
  );
}
