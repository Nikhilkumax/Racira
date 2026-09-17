import { defineSiteIdentity, type SiteIdentity } from "@/lib/site-identity";
import { GAME_LIVE_SLUGS } from "@/lib/tools/gameLiveSlugs";

/**
 * Games domain site-identity constants — the single source of truth for every
 * user/SEO-facing brand string under /games.
 *
 * The live count (GAME_LIVE_SLUGS.length) is the only game count that can be
 * promised honestly: games not in GAME_LIVE_SLUGS render a "Coming Soon"
 * page. Titles and footers derive from it so they can never drift from what
 * is actually playable — the previous hardcoded numbers ("450+ free browser
 * games" in the layout metadata, "47 Free Games" in the page hero) both
 * disagreed with each other and with the catalog.
 */
export const GAMES_SITE: SiteIdentity = defineSiteIdentity({
  domain: "games",
  /** Default <title> / og:title / twitter:title for /games — count derived from live slugs. */
  title: `Racira Games — ${GAME_LIVE_SLUGS.length}+ Free Browser Games, No Signup`,
  /** Footer copyright brand name — matches the header brand mark (Racira + Games). */
  copyrightName: "Racira Games",
  footerTagline: "Free browser games",
});
