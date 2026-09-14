import { CALCULATOR_STUB_SLUGS } from "./calculatorStubSlugs";

const stubSlugs = new Set<string>(CALCULATOR_STUB_SLUGS);

/**
 * Domains whose registry "live" flags do NOT correspond to rendered tools.
 * Verified by DOM audit: the [slug] pages in these domains require a `component`
 * on the tool to render anything, and the registries never attach one — so every
 * tool page renders "Coming soon" regardless of `status: "live"`.
 * (photo, design, seo, writing, productivity: no component in registry;
 *  cad: un-gated 2026-09 — 2d-cad-sketch-tool now has a wired component in
 *  app/cad/[slug]/page.tsx via the TOOL_COMPONENTS map; its live flag is real.)
 */
const COMPONENT_GATED_DOMAINS = new Set([
  "photo",
  "design",
  "seo",
  "writing",
  "productivity",
]);

/**
 * Domains whose [slug] ToolView renders the "Coming soon" template for every
 * tool (no status check, no component) — i.e. all tool pages are coming-soon.
 * NOTE: "developers" was removed from both sets because it now has a real
 * ToolPageClient wired into [slug]/page.tsx (Phase 1 unblock).
 */
const ALWAYS_COMING_SOON_DOMAINS = new Set([
  ...COMPONENT_GATED_DOMAINS,
  "image",
  "video",
]);

/**
 * A tool is "discoverable" (sitemap + grids) only if it is genuinely built:
 * - registry status is "live", AND
 * - it is not one of the known calculator stub slugs (live-tagged but rendering
 *   "Value A" template UI or with no wired component), AND
 * - its domain is not component-gated (no tool in those domains actually renders).
 * `domain` is the URL route segment (e.g. "photo", "3d", "calculator").
 */
export function isLiveTool(
  tool: { status?: string; slug?: string; component?: unknown } | undefined | null,
  domain?: string
): boolean {
  if (!tool) return false;
  if (tool.status !== "live") return false;
  if (tool.slug && stubSlugs.has(tool.slug)) return false;
  if (domain && COMPONENT_GATED_DOMAINS.has(domain)) return false;
  return true;
}

/** Filter an array of tools down to genuinely-live entries (safe on any domain). */
export function onlyLive<T extends { status?: string; slug?: string }>(
  tools: T[] | undefined | null,
  domain?: string
): T[] {
  if (!tools) return [];
  return tools.filter((t) => isLiveTool(t, domain));
}

/** True when no tool in the domain genuinely renders (all pages are "coming soon"). */
export function isComponentGatedDomain(domain?: string): boolean {
  return !!domain && COMPONENT_GATED_DOMAINS.has(domain);
}

/**
 * Whether the tool's [slug] page renders a "coming soon" template instead of a
 * real tool. Pages that do must emit `robots: noindex` — they are browsable
 * (soon cards link to them) but must stay out of the index. `domain` is the URL
 * route segment (e.g. "photo", "3d", "calculator").
 */
export function isComingSoonToolPage(
  tool: { status?: string; component?: unknown } | undefined | null,
  domain?: string
): boolean {
  if (!tool) return true;
  if (domain && ALWAYS_COMING_SOON_DOMAINS.has(domain)) return true;
  if (tool.status !== "live") return true;
  return false;
}
