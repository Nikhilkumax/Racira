import { defineSiteIdentity, type SiteIdentity } from "@/lib/site-identity";
import { TOOLS } from "./registry";

/**
 * Colors domain site-identity constants — the single source of truth for every
 * user/SEO-facing brand string under /colors.
 *
 * The "N+ Free Color Tools" claim derives its count from the registry (TOOLS)
 * so it cannot drift — the hero previously hardcoded "226" while the landing
 * metadata claimed "100+".
 */
export const COLORS_SITE: SiteIdentity = defineSiteIdentity({
  domain: "colors",
  /** Default <title> / og:title / twitter:title for /colors — count derived from the registry. */
  title: `Racira Colors — ${TOOLS.length}+ Free Color Tools`,
  /** Footer copyright brand name — matches the header brand mark (Racira + Colors). */
  copyrightName: "Racira Colors",
});
