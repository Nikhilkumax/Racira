"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PostCard } from "@/domains/finance/blog/post-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Category, PostWithRelations } from "@/types/finance/db";

const PAGE_SIZE = 9;

export function BlogList({
  initialPosts,
  categories,
}: {
  initialPosts: PostWithRelations[];
  categories: Category[];
}) {
  const [q, setQ] = useState("");
  // Client-side filter over the server-loaded published set (same UX as the
  // mock era; a DB-side search path can come later if the corpus grows).
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return initialPosts;
    return initialPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.excerpt.toLowerCase().includes(term) ||
        p.content.toLowerCase().includes(term),
    );
  }, [q, initialPosts]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const [page, setPage] = useState(1);
  const current = Math.min(page, totalPages);
  const slice = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  // NOTE: this island must NOT render PageShell — the server page owns the
  // shell. Importing it here would pull the async SiteFooter into the client
  // graph, which React cannot render (async components are server-only).
  return (
    <>
      <section className="border-b border-border/60" style={{ background: "var(--gradient-hero)" }}>
        <div className="racira-page-container py-14">
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Articles</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">{filtered.length} pieces and counting. Search or browse by category.</p>
          <div className="mt-6 flex max-w-xl items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-1.5 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search articles…"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link key={c.id} href={`/finance/category/${c.slug}`} className="rounded-full border border-border/60 bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="racira-page-container py-12 sm:px-6 lg:px-8">
        {slice.length === 0 ? (
          <p className="text-muted-foreground">No articles match your search.</p>
        ) : (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {slice.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={current <= 1}
              onClick={() => setPage((n) => Math.max(1, n - 1))}
            >
              Previous
            </Button>
            <span className="px-3 text-sm text-muted-foreground">Page {current} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={current >= totalPages}
              onClick={() => setPage((n) => Math.min(totalPages, n + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
