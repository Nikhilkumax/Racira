import { defineSiteIdentity, type SiteIdentity } from "@/lib/site-identity";

/**
 * Voice (TTS) domain site-identity constants — the single source of truth for
 * every user/SEO-facing brand string under /voice.
 */
export const VOICE_SITE: SiteIdentity = defineSiteIdentity({
  domain: "voice",
  /** Default <title> / og:title for /voice (no tool-count claim; voice is a single-tool suite). */
  title: "Free Text to Speech Online | Natural AI Voices — Racira TTS",
  /** Footer copyright brand name — matches the header brand mark. */
  copyrightName: "Racira TTS",
});
