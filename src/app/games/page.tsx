import { Metadata } from "next";
import Link from "next/link";
import { CategorySearch } from "@/components/CategorySearch";
import { SubcategoryCard } from "@/components/shared/SubcategoryCard";
import {
  getCategories,
  SEARCH_REGISTRY,
  slugify,
} from "@/domains/games/registry";
import { GAMES_SITE } from "@/domains/games/site";
import { GAME_LIVE_SLUGS } from "@/lib/tools/gameLiveSlugs";

const LIVE_GAME_SLUGS = new Set(GAME_LIVE_SLUGS);
const isLiveGame = (title: string) => LIVE_GAME_SLUGS.has(slugify(title));

export const metadata: Metadata = {
  title: `All Games — ${GAMES_SITE.copyrightName}`,
  description: `Play ${GAME_LIVE_SLUGS.length} free browser-based games: casual, logic, and puzzles. No signup required.`,
  openGraph: {
    title: `All Games — ${GAMES_SITE.copyrightName}`,
    description: `Play ${GAME_LIVE_SLUGS.length} free browser-based games: casual, logic, and puzzles. No signup required.`,
  },
  twitter: {
    card: "summary",
    title: `All Games — ${GAMES_SITE.copyrightName}`,
  },
  alternates: {
    canonical: "https://racira.com/games",
  },
};

export default function GamesPage() {
  const categories = getCategories();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            {GAME_LIVE_SLUGS.length} Free Games —{" "}
            <span className="hero-gradient-text">Casual, Logic & Puzzles</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Relax with browser-based casual games, logic puzzles, and brain teasers. No signup required.
          </p>
          {/* LIVE-gated count: CategorySearch's isSearchable() hides games
              without a wired component, so the search box only claims what it
              can actually return. Same honesty rule as /cad. */}
          <CategorySearch categorySlug="games" placeholder={`Search ${GAME_LIVE_SLUGS.length} games...`} registry={SEARCH_REGISTRY} />
        </div>
      </section>

      {/* Category Grid */}
      <div className="racira-page-container pb-4 sm:pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 justify-items-center calculator-category-grid">
          {categories.map(cat => {
            const Icon = cat.icon;
            const totalCount = cat.subcategories.reduce((acc, sub) => acc + sub.games.filter(isLiveGame).length, 0);
            return (
              <Link
                key={cat.name}
                href={`#${cat.name}`}
                className="category-nav-card group calculator-category-card hover:cursor-pointer hover:shadow-md transition-all duration-200"
              >
                <div className="tool-card-icon h-14 w-14 mb-5 rounded-2xl flex items-center justify-center">
                  <Icon className="h-[30.6px] w-[30.6px] text-primary" />
                </div>
                <p className="text-[13.6px] font-bold text-foreground leading-tight text-center">{cat.name}</p>
                <p className="text-[11.9px] text-muted-foreground mt-2">{totalCount} games</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* All Categories with Subcategories */}
      <div className="racira-page-container pb-16">
        {categories.map((cat, idx) => {
          const totalCount = cat.subcategories.reduce((acc, sub) => acc + sub.games.filter(isLiveGame).length, 0);

          return (
            <section
              key={cat.name}
              id={cat.name}
              className={idx > 0 ? "mt-14" : "mt-4"}
            >
              <h2 className="text-xl font-bold text-foreground mb-2">
                {cat.name}
              </h2>
              <p className="text-sm text-muted-foreground mb-5">{totalCount} games</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cat.subcategories.map(sub => {
                  const Icon = sub.icon;
                  // Must match the slug scheme used by /games/[slug] (toSlug: "&" -> "and", etc.)
                  const subSlug = slugify(sub.name);
                  return (
                    <SubcategoryCard
                      key={sub.name}
                      title={sub.name}
                      icon={Icon}
                      count={sub.games.filter(isLiveGame).length}
                      basePath={`/games/${subSlug}`}
                      label="games"
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
