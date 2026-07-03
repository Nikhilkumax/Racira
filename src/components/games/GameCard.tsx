import Link from "next/link";
import type { Game } from "@/data/games/games";

export function GameCard({ game }: { game: Game }) {
  const Icon = game.icon;
  return (
    <Link
      href={`/game/${game.slug}`}
      className="tool-card group"
    >
      <div className="tool-card-icon">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground leading-snug">
        {game.title}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{game.subcategory}</p>
    </Link>
  );
}
