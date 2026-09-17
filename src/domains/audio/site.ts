import { defineSiteIdentity, type SiteIdentity } from "@/lib/site-identity";

/**
 * Audio domain site-identity constants — the single source of truth for every
 * user/SEO-facing brand string under /audio.
 *
 * Catalog-count claims (the "N+" in the layout's descriptions) keep deriving
 * from the registry's TOTAL_TOOL_COUNT where they are used; identity strings
 * themselves carry no count.
 */
export const AUDIO_SITE: SiteIdentity = defineSiteIdentity({
  domain: "audio",
  /** Default <title> / og:title / twitter:title for /audio. */
  title: "Racira Audio — All Audio Tools You Need, Fast, Simple & Free",
  /** Footer copyright brand name — matches the header brand mark (Racira + Audio). */
  copyrightName: "Racira Audio",
  footerTagline: "Free audio tools",
});
