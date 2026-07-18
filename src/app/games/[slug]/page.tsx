import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Sparkles, Gamepad2, Construction } from "lucide-react";
import { CATEGORIES, slugify } from "@/data/games/games";

import Header from "@/components/Header";

type PageProps = { params: Promise<{ slug: string }> };

// Build flat maps for O(1) lookup
function buildMaps() {
  const categories: Array<{ name: string; icon: any; slug: string; subcategories: Array<{ name: string; icon: any; slug: string; games: string[] }> }> = [];
  for (const cat of CATEGORIES) {
    const catSlug = slugify(cat.name);
    const subs = cat.subcategories.map(sub => ({ ...sub, slug: slugify(sub.name) }));
    categories.push({ ...cat, slug: catSlug, subcategories: subs });
  }
  return categories;
}

const catsList = buildMaps();
const allSubs = catsList.flatMap(cat => cat.subcategories.map(sub => ({ ...sub, categoryName: cat.name, categorySlug: cat.slug })));
const allGames = catsList.flatMap(cat => cat.subcategories.flatMap(sub => sub.games.map(g => ({ name: g, slug: slugify(g), subcategoryName: sub.name, subcategorySlug: sub.slug, categoryName: cat.name, categorySlug: cat.slug }))));

function findBySlug(slug: string) {
  const cat = catsList.find(c => c.slug === slug);
  if (cat) return { type: "category" as const, cat };
  const sub = allSubs.find(s => s.slug === slug);
  if (sub) return { type: "subcategory" as const, sub };
  const game = allGames.find(g => g.slug === slug);
  if (game) return { type: "tool" as const, game };
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const match = findBySlug(slug);
  if (match?.type === "category") return { title: `${match.cat.name} — Racira Games`, description: `Play free browser-based ${match.cat.name} games.`, alternates: { canonical: `/games/${slug}` } };
  if (match?.type === "subcategory") return { title: `${match.sub.name} — Racira Games`, description: `Play free ${match.sub.name} games in your browser.`, alternates: { canonical: `/games/${slug}` } };
  if (match?.type === "tool") return { title: `${match.game.name} — Racira Games`, description: `Play ${match.game.name} free in your browser.`, alternates: { canonical: `/games/${slug}` } };
  return { title: "Not Found — Racira" };
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const cat of catsList) params.push({ slug: cat.slug });
  for (const sub of allSubs) params.push({ slug: sub.slug });
  for (const g of allGames) params.push({ slug: g.slug });
  return params;
}

function CategoryView({ cat }: { cat: typeof catsList[0] }) {
  const Icon = cat.icon;
  const totalGames = cat.subcategories.reduce((acc, s) => acc + s.games.length, 0);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Games" />
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-0">
          <nav aria-label="breadcrumb" className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href="/games" className="hover:text-foreground transition-colors">Games</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <span className="text-foreground font-medium">{cat.name}</span>
          </nav>
        </div>
        <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">{cat.name}</h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">{totalGames} free browser games in {cat.subcategories.length} subcategories.</p>
          </div>
        </section>
        <div className="racira-page-container pb-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cat.subcategories.map(sub => {
              const SubIcon = sub.icon;
              return (
                <Link key={sub.slug} href={`/games/${sub.slug}`} className="tool-card group hover:-translate-y-[3px]">
                  <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <SubIcon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground leading-snug">{sub.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{sub.games.length} games</p>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

function SubcategoryView({ sub, categoryName, categorySlug }: { sub: typeof allSubs[0]; categoryName: string; categorySlug: string }) {
  const Icon = sub.icon;
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Games" />
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-0">
          <nav aria-label="breadcrumb" className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href="/games" className="hover:text-foreground transition-colors">Games</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href={`/games/${categorySlug}`} className="hover:text-foreground transition-colors">{categoryName}</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <span className="text-foreground font-medium">{sub.name}</span>
          </nav>
        </div>
        <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">{sub.name}</h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">{sub.games.length} free browser games.</p>
          </div>
        </section>
        <div className="racira-page-container pb-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sub.games.map((gameName, idx) => {
              const gameSlug = slugify(gameName);
              return (
                <Link key={gameSlug + idx} href={`/games/${gameSlug}`} className="tool-card group hover:-translate-y-[3px]">
                  <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Gamepad2 className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground leading-snug">{gameName}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{sub.name}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

function GameView({ game }: { game: typeof allGames[0] }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Games" />
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-0">
          <nav aria-label="breadcrumb" className="flex items-center flex-wrap gap-y-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href="/games" className="hover:text-foreground transition-colors">Games</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href={`/games/${game.categorySlug}`} className="hover:text-foreground transition-colors">{game.categoryName}</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href={`/games/${game.subcategorySlug}`} className="hover:text-foreground transition-colors">{game.subcategoryName}</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <span className="text-foreground font-medium">{game.name}</span>
          </nav>
        </div>
        <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
          <div className="racira-page-container text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-6">
              <Gamepad2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">{game.name}</h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              Play {game.name} free in your browser.
            </p>
          </div>
        </section>
        <div className="racira-page-container pb-16 text-center flex justify-center">
          <div className="inline-flex flex-col items-center justify-center p-12 border border-border border-dashed rounded-2xl bg-card max-w-md w-full">
            <Construction className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground text-sm">
              We're currently building {game.name}. Check back soon to play!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default async function PolymorphicPage({ params }: PageProps) {
  const { slug } = await params;
  const match = findBySlug(slug);
  if (match?.type === "category") return <CategoryView cat={match.cat} />;
  if (match?.type === "subcategory") return <SubcategoryView sub={match.sub} categoryName={match.sub.categoryName} categorySlug={match.sub.categorySlug} />;
  if (match?.type === "tool") return <GameView game={match.game} />;
  notFound();
}
