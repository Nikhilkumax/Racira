import { defineSiteIdentity, type SiteIdentity } from "@/lib/site-identity";

/**
 * Image domain site-identity constants — the single source of truth for every
 * user/SEO-facing brand string under /image.
 */
export const IMAGE_SITE: SiteIdentity = defineSiteIdentity({
  domain: "image",
  /** Default <title> / og:title / twitter:title for /image. */
  title: "Racira Image — Free Image Tools",
  /** Footer copyright brand name — matches the header brand mark (Racira + Image). */
  copyrightName: "Racira Image",
  /** Preserves the footer's existing sentence verbatim. */
  footerTagline: "Free, in-browser image tools. Runs entirely in your browser",
});
