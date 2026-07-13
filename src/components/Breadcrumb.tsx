import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Resolves the immediate parent item (second-to-last) from the items array.
 * The last item is always the current page (no href). The immediate parent
 * is items[items.length - 2]. If that item has no href, we search backwards
 * for the nearest ancestor with an href and warn in development.
 */
function resolveParent(items: BreadcrumbItem[]): BreadcrumbItem | null {
  if (items.length < 2) return null;

  const candidate = items[items.length - 2];
  if (candidate?.href) return candidate;

  // Warn loudly — do NOT silently fall back without flagging it
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[Breadcrumb] Immediate parent has no href — searching backwards.",
      "items:",
      items,
    );
  }

  for (let i = items.length - 2; i >= 0; i--) {
    if (items[i]?.href) return items[i];
  }

  return null; // No linkable parent found — mobile link omitted
}

const Breadcrumb = ({ items }: { items: BreadcrumbItem[] }) => {
  const parent = resolveParent(items);

  return (
    <>
      {/* ── MOBILE: single "← Immediate Parent" link (hidden on md+) ── */}
      <nav
        aria-label="breadcrumb"
        className="md:hidden racira-page-container py-3"
      >
        {parent ? (
          <a
            href={parent.href}
            aria-label={`Back to ${parent.label}`}
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <span aria-hidden="true">←</span>
            {parent.label}
          </a>
        ) : null}
      </nav>

      {/* ── DESKTOP: full trail (hidden below md) ── */}
      <nav aria-label="breadcrumb" className="hidden md:block racira-page-container py-3">
        <ol className="flex flex-nowrap items-center gap-1 text-sm text-muted-foreground overflow-x-auto whitespace-nowrap scrollbar-none py-1">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-1 shrink-0">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumb;


