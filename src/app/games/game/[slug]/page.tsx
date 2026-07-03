import Link from "next/link";
import { getGameBySlug } from "@/data/games/games";
import GameClient from "./GameClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  
  if (!game) {
    return {
      title: "Game Not Found",
    };
  }
  
  return {
    title: `${game.title} — Coming Soon | Racira Games`,
    description: `${game.title} is coming soon to Racira Games — a free, browser-based ${game.category} game. No signup required.`,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  
  if (!game) {
    return (
      <div className="racira-page-container py-24 text-center">
        <h1 className="text-2xl font-bold">Game not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn't find a game at “{slug}”.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Browse all games
        </Link>
      </div>
    );
  }

  return <GameClient slug={game.slug} />;
}
