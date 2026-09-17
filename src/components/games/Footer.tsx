import { LegalLinks } from "@/components/LegalLinks";
import { GAME_LIVE_SLUGS } from "@/lib/tools/gameLiveSlugs";
import { GAMES_SITE } from "@/domains/games/site";
import { copyrightLine } from "@/lib/site-identity";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="racira-page-container py-10 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
        <p>
          <span className="font-semibold text-foreground">{GAMES_SITE.copyrightName}</span> —
          {GAME_LIVE_SLUGS.length} free browser games. No signup, no downloads.
        </p>
        <p className="mt-1">
          {copyrightLine(GAMES_SITE)} &middot; 100% client-side &middot; works offline once loaded.
        </p>
        <LegalLinks className="mt-6" />
      </div>
    </footer>
  );
}
