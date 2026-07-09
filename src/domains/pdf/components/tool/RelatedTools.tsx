import Link from "next/link";
import { tools, categories, type Tool } from "@/domains/pdf/registry/tools";

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
    if ((t as any).category === currentCategory && (t as any).slug !== currentSlug) pool.push(t);
  }

  // 2) Adjacent categories (before and after)
  const neighbours: string[] = [];
  if (catIndex > 0) neighbours.push(categories[catIndex - 1]);
  if (catIndex < categories.length - 1)
    neighbours.push(categories[catIndex + 1]);

  for (const cat of neighbours) {
    for (const t of tools) {
      if ((t as any).category === cat && (t as any).slug !== currentSlug && !pool.includes(t))
        pool.push(t);
    }
  }

  // 3) Everything else
  for (const t of tools) {
    if ((t as any).slug !== currentSlug && !pool.includes(t)) pool.push(t);
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
              key={(t as any).slug}
              href={`/pdf/${(t as any).slug}`}
              className="tool-card group shrink-0 sm:shrink min-w-[220px] sm:min-w-0"
            >
              <div className="tool-card-icon">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground leading-snug">
                {(t as any).name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {(t as any).description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedTools;
