import { defineSiteIdentity, type SiteIdentity } from "@/lib/site-identity";

/**
 * 3D & Print domain site-identity constants — the single source of truth for
 * every user/SEO-facing brand string under /3d.
 */
export const THREE_D_SITE: SiteIdentity = defineSiteIdentity({
  domain: "3d",
  /** Default <title> / og:title / twitter:title for /3d. */
  title: "Racira 3D & Print — Free Browser Tools for 3D and Print",
  /** Footer copyright brand name — matches the header brand mark (Racira + 3D & Print). */
  copyrightName: "Racira 3D & Print",
});
