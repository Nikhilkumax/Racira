/**
 * CAD domain site-identity constants — the single source of truth for every
 * user/SEO-facing brand string under /cad.
 *
 * Why this exists: commit 84247bc1 ("CAD Started") overwrote the four brand
 * locations (<title>, og:title, twitter:title, footer copyright) with the
 * literal string "CAD is fixed" — a dev-session status note pasted into the
 * metadata. Because all four locations were edited in one sweep, a shared
 * constant is the only structure that (a) gives them one place to fix and
 * (b) lets a regression test hold the exact values in one assertion block.
 *
 * Instantiates the platform-wide factory (src/lib/site-identity.ts); the
 * registry re-exports these so consumers never import two CAD modules
 * for identity + counts: import { CAD_SITE, totalCount } from "@/domains/cad/registry".
 */
import { defineSiteIdentity } from "@/lib/site-identity";

export const CAD_SITE = defineSiteIdentity({
  domain: "cad",
  /** <title>, og:title, twitter:title on every /cad page that doesn't override. */
  title: "Free CAD Tools — Sketch, Draft & Measure | Racira",
  /** Footer copyright brand name — matches the header brand mark (Racira + CAD). */
  copyrightName: "Racira CAD",
  footerTagline: "Built for engineers and designers",
});
