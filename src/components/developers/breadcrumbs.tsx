import Link from "next/link";
import { Fragment } from "react";
import { ChevronRight, Home } from "lucide-react";

export type Crumb = { label: string; to?: string };

/**
 * Resolve the immediate parent for mobile collapse.
 * The last item in `items` is typically the current page (no `to`).
 * We walk backwards to find the nearest linkable ancestor.
 */
function resolveParent(items: Crumb[]): Crumb | null {
  // Start from second-to-last (the last may be the current page)
  const start = items[items.length - 1]?.to ? items.length - 1 : items.length - 2;
  for (let i = start; i >= 0; i--) {
    if (items[i]?.to) return items[i];
  }
  return null; // fall back to / (Home) handled below
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const parent = resolveParent(items);

  return (
    <>
      {/* ── MOBILE: ← [immediate parent] ── */}
      <nav aria-label="breadcrumb" className="md:hidden flex items-center">
        {parent ? (
          <a
            href={parent.to}
            aria-label={`Back to ${parent.label}`}
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <span aria-hidden="true">←</span>
            {parent.label}
          </a>
        ) : (
          <a
            href="/"
            aria-label="Back to Home"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <span aria-hidden="true">←</span>Home
          </a>
        )}
      </nav>

      {/* ── DESKTOP: full trail ── */}
      <nav aria-label="breadcrumb" className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
        <Link href="/" className="flex items-center hover:text-foreground transition-colors" aria-label="Home">
          <Home className="h-3.5 w-3.5" />
        </Link>
        {items.map((item, i) => (
          <Fragment key={i}>
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
            {item.to ? (
              <Link
                href={item.to}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </Fragment>
        ))}
      </nav>
    </>
  );
}
