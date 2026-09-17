import { defineSiteIdentity, type SiteIdentity } from "@/lib/site-identity";

/**
 * SEO domain site-identity constants — the single source of truth for every
 * user/SEO-facing brand string under /seo.
 *
 * Note: the "230" in the landing description is a hardcoded catalog claim kept
 * verbatim (not a brand string). The SEO domain is component-gated — no tool
 * page renders a real tool — so no count is embedded in the title itself.
 */
export const SEO_SITE: SiteIdentity = defineSiteIdentity({
  domain: "seo",
  /** Default <title> / og:title / twitter:title for /seo. */
  title: "Racira SEO — All SEO Tools You Need, Fast, Simple & Free",
  /** Footer copyright brand name — matches the header brand mark (Racira + SEO). */
  copyrightName: "Racira SEO",
});
