/**
 * Single source of truth: does this tool have a real Coming Soon page
 * that users should be able to navigate to?
 *
 * Only the calculator domain currently has Coming Soon destination pages.
 * Other domains' non-live tools must remain non-clickable — their routes
 * call notFound() for non-live slugs.
 *
 * This helper is used by both the routing branch in [slug]/page.tsx and
 * the ToolCard click-through decision, keeping them in sync.
 *
 * When a new domain gets Coming Soon pages, add its key to the allowed
 * set below — both routing and card-linking stay in sync automatically.
 */
const DOMAINS_WITH_COMING_SOON = new Set(["calculator"]);

export function hasComingSoonPage(
  tool: { status?: string } | undefined | null,
  domain?: string,
): boolean {
  if (!tool) return false;
  if (tool.status === "live") return false;
  if (domain && !DOMAINS_WITH_COMING_SOON.has(domain)) return false;
  return DOMAINS_WITH_COMING_SOON.has(domain ?? "");
}
