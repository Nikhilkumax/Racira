import { defineSiteIdentity, type SiteIdentity } from "@/lib/site-identity";
import { ALL_TOOLS } from "./registry";

/**
 * Photography domain site-identity constants — the single source of truth for
 * every user/SEO-facing brand string under /photo.
 *
 * The "112 free photography tools" claim derives its count from the registry
 * (ALL_TOOLS) so it cannot drift from the catalog.
 */
export const PHOTO_SITE: SiteIdentity = defineSiteIdentity({
  domain: "photo",
  /** Default <title> / og:title / twitter:title for /photo — count derived from the registry. */
  title: `Racira Photography — ${ALL_TOOLS.length} free photography tools`,
  /** Footer copyright brand name — matches the footer's existing "Racira Photography". */
  copyrightName: "Racira Photography",
  footerTagline: "Built for photographers",
});

/** Catalog count, exported for descriptions so they share the title's source. */
export const PHOTO_TOOL_COUNT = ALL_TOOLS.length;
