import { defineSiteIdentity, type SiteIdentity } from "@/lib/site-identity";
import { totalToolCount } from "./registry";

/**
 * Writing domain site-identity constants — the single source of truth for
 * every user/SEO-facing brand string under /writing.
 *
 * The "150+ free writing tools" claim derives its count from the registry
 * (totalToolCount) so it cannot drift from the catalog.
 */
export const WRITING_SITE: SiteIdentity = defineSiteIdentity({
  domain: "writing",
  /** Default <title> / og:title / twitter:title for /writing — count derived from the registry. */
  title: `Racira Writing — ${totalToolCount}+ Free Writing Tools`,
  /** Footer copyright brand name — matches the header brand mark (Racira + Writing). */
  copyrightName: "Racira Writing",
  footerTagline: "Writing tools, one home",
});
