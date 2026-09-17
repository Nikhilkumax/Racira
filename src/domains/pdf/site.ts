import { defineSiteIdentity, type SiteIdentity } from "@/lib/site-identity";

/**
 * PDF domain site-identity constants — the single source of truth for every
 * user/SEO-facing brand string under /pdf. All four identity surfaces
 * (<title>, og:title, twitter:title, footer copyright) read from here, so a
 * placeholder string can never ship into one of them again.
 */
export const PDF_SITE: SiteIdentity = defineSiteIdentity({
  domain: "pdf",
  /** Default <title> / og:title / twitter:title for /pdf. */
  title: "Racira PDF — Free Online PDF Tools. Merge, Split & Compress",
  /** Footer copyright brand name — matches the header brand mark (Racira + PDF). */
  copyrightName: "Racira PDF",
  /** Preserves the footer's existing closing sentence verbatim. */
  footerTagline: "All rights reserved",
});
