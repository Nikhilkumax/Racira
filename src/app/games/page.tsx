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
            <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            10+ Free Games —{" "}
            <span className="hero-gradient-text">Casual, Logic & Puzzles</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Relax with browser-based casual games, logic puzzles, and brain teasers. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 10+ games..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Games"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
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
