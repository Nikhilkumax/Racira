import Link from "next/link";
import { tools, categories, type Tool } from "@/data/pdf/tools";

interface RelatedToolsProps {
  /** The current tool's slug — excluded from suggestions. */
  currentSlug: string;
  /** The current tool's category — prioritised in suggestions. */
  currentCategory: string;
}

/** Maximum cards shown. */
const MAX_RELATED = 6;

/**
 * "You Might Also Need" section.
 * Prioritises same-category tools, then adjacent categories, never the current tool.
 * Desktop: 4-col grid. Mobile: horizontal scroll (no scrollbar).
 */
const RelatedTools = ({ currentSlug, currentCategory }: RelatedToolsProps) => {
  const catIndex = categories.indexOf(currentCategory);

  // Build ordered pool: same category first, then neighbours, then the rest.
  const pool: Tool[] = [];

  // 1) Same category
  for (const t of tools) {
    if (t.category === currentCategory && t.slug !== currentSlug) pool.push(t);
  }

  // 2) Adjacent categories (before and after)
  const neighbours: string[] = [];
  if (catIndex > 0) neighbours.push(categories[catIndex - 1]);
  if (catIndex < categories.length - 1)
    neighbours.push(categories[catIndex + 1]);

  for (const cat of neighbours) {
    for (const t of tools) {
      if (t.category === cat && t.slug !== currentSlug && !pool.includes(t))
        pool.push(t);
    }
  }

  // 3) Everything else
  for (const t of tools) {
    if (t.slug !== currentSlug && !pool.includes(t)) pool.push(t);
  }

  const related = pool.slice(0, MAX_RELATED);

  if (related.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-foreground mb-4">
        You Might Also Need
      </h2>

      {/* Mobile: horizontal scroll. Desktop: 4-col grid. */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
        {related.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.slug}
              href={`/pdf/${t.slug}`}
              className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 sm:p-5 card-hover relative shrink-0 sm:shrink min-w-[220px] sm:min-w-0"
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-[14px] leading-snug">
                  {t.name}
                </p>
                <p className="mt-0.5 text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
                  {t.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedTools;
