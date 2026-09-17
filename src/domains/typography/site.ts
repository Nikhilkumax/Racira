import { defineSiteIdentity, type SiteIdentity } from "@/lib/site-identity";

/**
 * Typography domain site-identity constants — the single source of truth for
 * every user/SEO-facing brand string under /typography.
 *
 * Note on the catalog claim in the description: the typography catalog is
 * currently ~100 tools, but no typography tool page renders a real tool yet
 * (the whole domain is component-gated). Counts shown to users therefore come
 * from the live-gated search count, not this constant.
 */
export const TYPOGRAPHY_SITE: SiteIdentity = defineSiteIdentity({
  domain: "typography",
  /** Default <title> / og:title / twitter:title for /typography. */
  title: "Racira Typography — Free Typography Tools",
  /** Footer copyright brand name — matches the header brand mark (Racira + Typography). */
  copyrightName: "Racira Typography",
  /** Preserves the footer's existing sentence verbatim. */
  footerTagline: "Free typography tools in your browser",
});
