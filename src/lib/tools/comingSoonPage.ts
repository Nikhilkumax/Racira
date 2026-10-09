/**
 * Single source of truth: does this tool have a real Coming Soon page
 * that users should be able to navigate to?
 *
 * A domain belongs in this set only when its [slug] route renders a real
 * Coming Soon page for non-live slugs (with its own INDEX_SOON_PAGES switch in
 * src/domains/<domain>/indexing.ts). Any domain NOT listed keeps non-live tools
 * non-clickable, because its route calls notFound() for them.
 *
 * This helper is used by both the routing branch in [slug]/page.tsx and
 * the ToolCard click-through decision, keeping them in sync.
 *
 * "games" is deliberately absent: game slugs outside GAME_LIVE_SLUGS have no
 * Coming Soon page and must stay 404. Add a domain here only after its route
 * renders the shared Coming Soon template — never before, or a card would link
 * straight into a 404.
 */
const DOMAINS_WITH_COMING_SOON = new Set([
  "calculator",
  "pdf",
  "developers",
  "3d",
  "animator",
  "audio",
  "cad",
  "design",
  "image",
  "photo",
  "productivity",
  "seo",
  "typography",
  "video",
  "writing",
]);

export function hasComingSoonPage(
  tool: { status?: string } | undefined | null,
  domain?: string,
): boolean {
  if (!tool) return false;
  if (tool.status === "live") return false;
  if (domain && !DOMAINS_WITH_COMING_SOON.has(domain)) return false;
  return DOMAINS_WITH_COMING_SOON.has(domain ?? "");
}
