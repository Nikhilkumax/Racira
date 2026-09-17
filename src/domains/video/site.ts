import { defineSiteIdentity, type SiteIdentity } from "@/lib/site-identity";

/**
 * Video domain site-identity constants — the single source of truth for every
 * user/SEO-facing brand string under /video.
 */
export const VIDEO_SITE: SiteIdentity = defineSiteIdentity({
  domain: "video",
  /** Default <title> / og:title for /video. */
  title: "Racira Video — All-in-One Free Online Video Tools",
  /** Footer copyright brand name — matches the header brand mark (Racira + Video). */
  copyrightName: "Racira Video",
});
