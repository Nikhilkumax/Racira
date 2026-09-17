import type { Metadata } from "next";
import Header from "@/components/Header";

import { Footer } from "@/components/games/Footer";
import { Toaster } from "@/components/ui/sonner";
import { GAMES_SITE } from "@/domains/games/site";
import { GAME_LIVE_SLUGS } from "@/lib/tools/gameLiveSlugs";

// Identity + counts derive from GAMES_SITE / GAME_LIVE_SLUGS — the previous
// hardcoded "450+ Free Browser Games" disagreed with both the page hero and
// the number of games that actually render (GAME_LIVE_SLUGS.length).
export const metadata: Metadata = {
  title: GAMES_SITE.title,
  description: `Play ${GAME_LIVE_SLUGS.length}+ free browser games — puzzles, word, arcade, card, board, trivia and more. No signup, no downloads, 100% client-side.`,
  authors: [{ name: GAMES_SITE.copyrightName }],
  openGraph: {
    title: GAMES_SITE.title,
    description: "Puzzles, word, arcade, card, board, trivia and more. Free, no signup, in your browser.",
    type: "website",
  },
  twitter: {
    card: "summary",
    site: "@Racira",
    title: GAMES_SITE.title,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
      <>
        <div className="flex min-h-screen flex-col">
          <Header mode="category" categoryName="Games" />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster />
      </>
    
  
);
}
