import { defineSiteIdentity, type SiteIdentity } from "@/lib/site-identity";

/**
 * Racira Fonts (route segment /typography) site-identity constants — the single
 * source of truth for every user/SEO-facing brand string under /typography.
 *
 * Naming note (2026-09 rename): the display label is "Racira Fonts"; shortName
 * "Fonts" fills the shared <Header/>'s "Racira ___" slot and the breadcrumb
 * root, while the homepage category grid card reads "Font Tools" (see the
 * typography entry in src/data/tools.ts). The URL segment stays /typography on
 * purpose (indexed URLs — see the rename report).
 */
export const TYPOGRAPHY_SITE: SiteIdentity & { shortName: string } = defineSiteIdentity({
  domain: "typography",
  /** Default <title> / og:title / twitter:title for /typography. */
  title: "Racira Fonts — Free Font & Type Tools",
  /** Footer copyright brand name — matches the header brand mark (Racira + Fonts). */
  copyrightName: "Racira Fonts",
  /** Header nav + breadcrumb root label — <Header/> prepends "Racira" (→ "Racira Fonts"). */
  shortName: "Fonts",
  /** Preserves the footer's existing sentence verbatim. */
  footerTagline: "Free font tools in your browser",
});
