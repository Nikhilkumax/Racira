"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  getCategories,
  getGamesByCategory,
  getTotalGameCount,
  searchGames,
  type Game,
} from "@/data/games/games";
import { GameCard } from "@/components/games/GameCard";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");

  const total = getTotalGameCount();

  const setQuery = (value: string) => {
    setQ(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  const isSearching = q.trim().length > 0;
  const results: Game[] = isSearching ? searchGames(q) : [];
  const categories = getCategories();

  return (
    <div>
      {/* Hero */}
      <section className="px-4 pb-10 pt-16 text-center sm:px-6 lg:px-8 lg:pt-24">
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Every Browser Game You Need —{" "}
          <span className="bg-[image:var(--gradient-hero)] bg-clip-text text-transparent">
            Free &amp; Instant
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          {total}+ free games across 18 categories — puzzles, word, arcade,
          card, board, trivia and more. No signup required.
        </p>

        {/* Search */}
        <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-card)] focus-within:border-primary/50">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games, e.g. Sudoku, Chess, Tetris…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Search games"
          />
          {isSearching && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>

      <div className="racira-page-container pb-20 sm:px-6 lg:px-8">
        {isSearching ? (
          <section>
            <p className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {results.length} result{results.length === 1 ? "" : "s"} for “{q}”
            </p>
            {results.length === 0 ? (
              <p className="text-muted-foreground">
                No games found. Try a different search.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((game) => (
                  <GameCard key={game.slug} game={game} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <div className="space-y-14">
            {categories.map((category) => {
              const games = getGamesByCategory(category.name);
              return (
                <section key={category.name} id={category.name}>
                  <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {category.name}
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {games.map((game) => (
                      <GameCard key={game.slug} game={game} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Index() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
