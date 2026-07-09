"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CategorySearch } from "@/components/CategorySearch";
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
          <CategorySearch categorySlug="games" placeholder="Search 10+ games..." registry={categories.flatMap(c => getGamesByCategory(c.name)).map((t: any) => ({ name: (t as any).name, description: (t as any).description || '', slug: (t as any).slug, href: `/games/${(t as any).slug}`, category: (t as any).category, isBuilt: true }))} />
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
