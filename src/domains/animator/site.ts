import { defineSiteIdentity, type SiteIdentity } from "@/lib/site-identity";
import { totalCount } from "./registry";

/**
 * Animation domain site-identity constants — the single source of truth for
 * every user/SEO-facing brand string under /animator.
 *
 * The "N free animation tools" title derives its count from the registry
 * (totalCount), replacing the previous hardcoded "106" which could drift from
 * the actual catalog. This is marketing copy about catalog size, so the full
 * catalog count is correct here (matching the meta description convention).
 */
export const ANIMATOR_SITE: SiteIdentity = defineSiteIdentity({
  domain: "animator",
  /** Default <title> / og:title for /animator — count derived from the registry. */
  title: `Racira Animation — ${totalCount} free animation tools`,
  /** Footer copyright brand name — matches the header brand mark (Racira + Animation). */
  copyrightName: "Racira Animation",
});
