"use client";

import Link from "next/link";
import { ArrowLeft, Bookmark, BookmarkCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { getGameBySlug } from "@/data/games/games";
import { useWatchlist } from "@/hooks/games/use-watchlist";

export default function GameClient({ slug }: { slug: string }) {
  const fullGame = getGameBySlug(slug)!;
  const Icon = fullGame.icon;
  const { isSaved, toggle } = useWatchlist();
  const saved = isSaved(slug);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:py-24">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to all games
      </Link>

      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)] sm:p-12">
        <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-primary">
          <Icon className="h-8 w-8" />
        </span>

        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {fullGame.category} &middot; {fullGame.subcategory}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {fullGame.title}
        </h1>

        <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
          <Clock className="h-4 w-4" />
          Coming Soon
        </span>

        <p className="mx-auto mt-6 max-w-md text-muted-foreground">
          We're building <span className="font-medium text-foreground">{fullGame.title}</span>{" "}
          to play right in your browser — free, no signup, no downloads. Save it
          to your list and check back soon.
        </p>

        <button
          type="button"
          onClick={() => {
            const nowSaved = toggle(slug);
            toast(
              nowSaved
                ? `Saved “${fullGame.title}” to your list`
                : `Removed “${fullGame.title}” from your list`,
            );
          }}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {saved ? (
            <>
              <BookmarkCheck className="h-4 w-4" />
              Saved for later
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4" />
              Save for later
            </>
          )}
        </button>
      </div>
    </div>
  );
}
