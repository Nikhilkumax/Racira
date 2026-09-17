import { defineSiteIdentity, type SiteIdentity } from "@/lib/site-identity";

/**
 * Finance domain site-identity constants — the single source of truth for
 * every user/SEO-facing brand string under /finance.
 *
 * Finance previously had its own `site` object (name/tagline/description/
 * twitter); it now carries the platform-wide identity fields too (title,
 * copyrightName) while keeping its editorial tagline/description.
 */
export interface FinanceSiteIdentity extends SiteIdentity {
  tagline: string;
  description: string;
  twitter: string;
}

export const site: FinanceSiteIdentity = {
  ...defineSiteIdentity({
    domain: "finance",
    /** Default <title> / og:title / twitter:title for /finance. */
    title: "Racira Finance — Clear-eyed writing on money & markets",
    /** Footer copyright brand name. */
    copyrightName: "Racira Finance",
  }),
  tagline: "Clear-eyed writing on money, markets, and the global economy.",
  description:
    "Racira Finance publishes long-form analysis on investing, personal finance, markets, and the economy — written by former practitioners.",
  twitter: "@raciraco",
};
