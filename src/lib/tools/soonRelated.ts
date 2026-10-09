export interface RelatedToolItem {
  name: string;
  href: string;
}

/**
 * Picks the tools shown on a Coming Soon page so the page never dead-ends:
 * live tools first (same category/subcategory preferred), then tools still in
 * the works so the row is never empty in domains that have no live tools yet.
 *
 * Generic on purpose — callers pass their own registry array, base path and
 * live predicate, so this stays domain-agnostic (no cross-domain imports).
 */
export function pickRelatedTools<T extends { slug: string; name: string }>(
  tools: T[],
  opts: {
    currentSlug: string;
    basePath: string;
    isLive: (tool: T) => boolean;
    /** Optional "same category" test, used to prefer close neighbours first. */
    sameGroup?: (tool: T) => boolean;
    limit?: number;
  },
): { live: RelatedToolItem[]; soon: RelatedToolItem[] } {
  const limit = opts.limit ?? 4;
  const pool = tools.filter((tool) => tool.slug !== opts.currentSlug);
  const same = opts.sameGroup ? pool.filter(opts.sameGroup) : pool;
  const rest = opts.sameGroup ? pool.filter((tool) => !opts.sameGroup!(tool)) : [];
  const ordered = [...same, ...rest];
  const toItem = (tool: T): RelatedToolItem => ({ name: tool.name, href: `${opts.basePath}/${tool.slug}` });

  return {
    live: ordered.filter(opts.isLive).slice(0, limit).map(toItem),
    soon: ordered.filter((tool) => !opts.isLive(tool)).slice(0, limit).map(toItem),
  };
}
