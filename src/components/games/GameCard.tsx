import Link from "next/link";
import type { Game } from "@/data/games/games";

export function GameCard({ game }: { game: Game }) {
  const Icon = game.icon;
  return (
    <Link
      href={`/game/${game.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)]"
    >
      <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="font-semibold leading-tight text-card-foreground">
        {game.title}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{game.subcategory}</p>
    </Link>
  );
}
