"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";
import { categories } from "@/data/tools";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Per-card pill overrides — keeps tools.ts untouched
const PILL_OVERRIDES: Record<string, string[]> = {
  voice: ["28 Voices", "US & UK English"],
};

// 8 featured slugs = 2 complete rows of 4 on desktop, 2 rows of 2 on mobile
const FEATURED_SLUGS = [
  "calculator",
  "voice",
  "pdf",
  "image",
  "design",
  "developers",
  "colors",
  "writing",
];

// Re-order so featured cards come first, rest follow
function buildOrderedCategories() {
  const featuredSet = new Set(FEATURED_SLUGS);
  const featured = FEATURED_SLUGS.map((slug) =>
    categories.find((c) => c.slug === slug)!
  );
  const rest = categories.filter((c) => !featuredSet.has(c.slug));
  return [...featured, ...rest];
}

const orderedCategories = buildOrderedCategories();

function CategoryCard({ cat }: { cat: (typeof orderedCategories)[0] }) {
  const Icon = cat.icon;
  const active = cat.status === "active";

  const content = (
    <div
      className={cn(
        // h-full + flex-col lets this card stretch to the grid row height
        "group relative flex flex-col h-full overflow-hidden rounded-xl border border-border bg-card p-4 md:p-5 lg:p-6 shadow-soft transition-all duration-200",
        active && "hover:-translate-y-1 hover:border-primary hover:shadow-glow"
      )}
    >
      {/* ── Icon + title: side-by-side at ALL breakpoints ── */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--tool-icon-bg))] h-10 w-10 md:h-12 md:w-12">
          <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" strokeWidth={2} />
        </div>
        <h3 className="text-base md:text-lg leading-tight font-bold tracking-tight">{cat.title}</h3>
      </div>

      {/* ── BODY: description + pills + CTA (shared, all breakpoints) ── */}
      <div className="flex flex-col flex-1">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {cat.description}
        </p>

        {/* Pills: hidden on mobile/tablet, shown on desktop */}
        <div className="hidden md:flex flex-wrap gap-1.5 mt-2.5">
          {(PILL_OVERRIDES[cat.slug] ?? cat.highlights.slice(0, 3)).map((h) => (
            <span
              key={h}
              className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground shrink-0"
            >
              {h}
            </span>
          ))}
        </div>

        {/* Spacer pushes CTA to the bottom */}
        <div className="flex-1" />

        <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          {active ? "Explore Category" : "Coming soon"}
          <ArrowUpRight
            className={cn(
              "h-4 w-4 transition-transform",
              active && "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            )}
          />
        </div>
      </div>
    </div>
  );

  if (active) {
    return (
      <Link href={`/${cat.slug}`} className="block h-full">
        {content}
      </Link>
    );
  }

  return <div className="h-full">{content}</div>;
}

export default function Categories() {
  const [expanded, setExpanded] = useState(false);
  const expandRef = useRef<HTMLDivElement>(null);

  const handleExpand = () => setExpanded(true);
  const handleCollapse = () => setExpanded(false);

  useEffect(() => {
    if (expanded && expandRef.current) {
      expandRef.current.style.height = expandRef.current.scrollHeight + 'px';
    }
  }, [expanded]);

  // 8 visible cards = 2 complete rows of 4 on desktop (no orphan cells)
  // Mobile: 4 visible = 2 complete rows of 2 (cards 4–7 hidden via CSS)
  const visibleCards = orderedCategories.slice(0, 8);
  const hiddenCards = orderedCategories.slice(8);

  return (
    <section id="categories" className="container py-14 md:py-20">
      <div className="mb-10 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          The Suite
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
          Multiple tool ecosystems. One platform.
        </h2>
        <p className="mt-4 text-sm text-muted-foreground md:text-base leading-relaxed">
          Every category is an expandable product surface — built on the same
          design system, with new ecosystems added over time.
        </p>
      </div>

      {/*
        Always-visible grid — 8 cards = 2 full rows on desktop.
        items-stretch (default) lets all cards in a row match the tallest.
        On mobile (1-col / md:2-col), cards at index 4–7 are hidden
        when collapsed so mobile shows 4 cards = 2 complete rows of 2.
      */}
      <div className="grid gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visibleCards.map((cat, i) => (
          <div
            key={cat.slug}
            className={i >= 4 && !expanded ? "hidden md:block" : "block"}
          >
            <CategoryCard cat={cat} />
          </div>
        ))}
      </div>

      {/*
        Hidden cards — height clipping container reveals them on expand.
        Same grid config for visual continuity.
        [grid-auto-rows:auto] prevents phantom height on the incomplete
        last row (19 cards → 3 in last row of 4-col grid).
      */}
      <div
        ref={expandRef}
        aria-hidden={!expanded}
        style={{
          height: expanded ? (expandRef.current?.scrollHeight ? expandRef.current.scrollHeight + 'px' : 'auto') : '0px',
          overflow: "hidden",
          transition: "height 500ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="grid gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-4 [grid-auto-rows:auto] mt-3 md:mt-4">
          {hiddenCards.map((cat) => (
            <CategoryCard key={cat.slug} cat={cat} />
          ))}
        </div>
      </div>

      {/* Toggle button */}
      <div className="mt-10 flex justify-center">
        <Button
          variant="outline"
          size="lg"
          onClick={expanded ? handleCollapse : handleExpand}
        >
          {expanded ? (
            <>
              Show Less <ChevronUp className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              View All 19 Categories <ChevronDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </section>
  );
}
