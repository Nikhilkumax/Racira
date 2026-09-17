import { defineSiteIdentity, type SiteIdentity } from "@/lib/site-identity";

/**
 * Design domain site-identity constants — the single source of truth for every
 * user/SEO-facing brand string under /design.
 */
export const DESIGN_SITE: SiteIdentity = defineSiteIdentity({
  domain: "design",
  /** Default <title> / og:title / twitter:title for /design. */
  title: "Racira Design — Free Design Tools in Your Browser",
  /** Footer copyright brand name — matches the header brand mark (Racira + Design). */
  copyrightName: "Racira Design",
  /** Preserves the footer's existing sentence verbatim. */
  footerTagline: "Free, private, in-browser design tools",
});
