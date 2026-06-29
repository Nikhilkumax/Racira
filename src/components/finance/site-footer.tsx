import Link from "next/link";
import { site } from "@/lib/finance/site";
import { listCategories } from "@/lib/finance/data/taxonomy";

export function SiteFooter() {
  const cats = listCategories().slice(0, 5);
  return (
    <footer className="mt-24 border-t border-border/60 bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 font-display text-xl font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
              <span className="text-base font-bold text-primary-foreground">R</span>
            </span>
            {site.name}
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">{site.tagline}</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Sections</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {cats.map((c) => (
              <li key={c.id}>
                <Link href={`/category/${c.slug}`} className="hover:text-foreground">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-foreground">About</Link></li>
            <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><Link href="/admin" className="hover:text-foreground">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>Editorial independence. No paid placements.</p>
        </div>
      </div>
    </footer>
  );
}