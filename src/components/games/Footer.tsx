import { LegalLinks } from "@/components/LegalLinks";
import { GAME_LIVE_SLUGS } from "@/lib/tools/gameLiveSlugs";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="racira-page-container py-10 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
        <p>
          <span className="font-semibold text-foreground">Racira Games</span> —
          {GAME_LIVE_SLUGS.length} free browser games. No signup, no downloads.
        </p>
        <p className="mt-1">
          100% client-side &middot; works offline once loaded.
        </p>
        <LegalLinks className="mt-6" />
      </div>
    </footer>
  );
}
