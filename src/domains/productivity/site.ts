import { defineSiteIdentity, type SiteIdentity } from "@/lib/site-identity";
import { TOTAL_TOOLS } from "./registry";

/**
 * Productivity domain site-identity constants — the single source of truth
 * for every user/SEO-facing brand string under /productivity.
 *
 * The "69 free focus & planning tools" claim derives its count from the
 * registry (TOTAL_TOOLS) so it cannot drift from the catalog.
 */
export const PRODUCTIVITY_SITE: SiteIdentity = defineSiteIdentity({
  domain: "productivity",
  /** Default <title> / og:title / twitter:title for /productivity — count derived from the registry. */
  title: `Racira Productivity Tools — ${TOTAL_TOOLS} free focus & planning tools`,
  /** Footer copyright brand name — matches the header brand mark. */
  copyrightName: "Racira Productivity Tools",
});
