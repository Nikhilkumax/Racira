import { defineSiteIdentity, type SiteIdentity } from "@/lib/site-identity";

/**
 * Calculator domain site-identity constants — the single source of truth for
 * every user/SEO-facing brand string under /calculator.
 */
export const CALCULATOR_SITE: SiteIdentity = defineSiteIdentity({
  domain: "calculator",
  /** Default <title> / og:title / twitter:title for /calculator. */
  title: "All Calculators — Racira",
  /** Footer copyright brand name — matches the header brand mark (Racira + Calculator). */
  copyrightName: "Racira Calculator",
  footerTagline: "Free online calculators",
});
