import { defineSiteIdentity, type SiteIdentity } from "@/lib/site-identity";

/**
 * Developer Tools domain site-identity constants — the single source of truth
 * for every user/SEO-facing brand string under /developers.
 */
export const DEVELOPERS_SITE: SiteIdentity = defineSiteIdentity({
  domain: "developers",
  /** Default <title> / og:title / twitter:title for /developers. */
  title: "Racira Developers — All Developer Tools You Need, Fast & Free",
  /** Footer copyright brand name — matches the header brand mark (Racira + Developers). */
  copyrightName: "Racira Developers",
});
