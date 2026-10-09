import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface SubcategoryCardProps {
  title: string;
  icon: LucideIcon;
  count: number;
  basePath: string;
  label?: string;
  soon?: boolean;
  /**
   * Upcoming tools that have a Coming Soon page pass this so the card still
   * links through (basePath) instead of rendering as an inert tile. Live tools
   * are always links, so this only affects the `soon` state.
   */
  clickable?: boolean;
}

export function SubcategoryCard({
  title,
  icon: Icon,
  count,
  basePath,
  label = "tools",
  soon = false,
  clickable = false
}: SubcategoryCardProps) {
  const cardBody = (
    <>
      {soon && (
        <span className="absolute top-3 right-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Soon
        </span>
      )}
      <div className="flex flex-col">
        <div className="mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex flex-col">
          <h3 className="font-semibold text-foreground leading-snug line-clamp-2">
            {title}
          </h3>
          <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed line-clamp-1">
            {count} {count === 1 ? label.replace(/s$/, "") : label}
          </p>
        </div>
      </div>
    </>
  );

  if (soon && !clickable) {
    // Soon cards without a destination stay informational — not links anywhere.
    return (
      <div className="tool-card group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 cursor-default">
        {cardBody}
      </div>
    );
  }

  return (
    <Link
      href={basePath}
      className="tool-card group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 hover:-translate-y-[3px] hover:border-primary/40 hover:shadow-[0_8px_24px_hsl(var(--ring)/0.1)] transition-all"
    >
      {cardBody}
    </Link>
  );
}
