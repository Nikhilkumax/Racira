"use client";

import Link from "next/link";
import { useState, useMemo, Suspense } from "react";
import { Search } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageShell } from "@/domains/finance/blog/page-shell";
import { PostCard } from "@/domains/finance/blog/post-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listPosts } from "@/domains/finance/data/posts";
import { listCategories } from "@/domains/finance/data/taxonomy";

const PAGE_SIZE = 9;

function BlogList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageParam = searchParams.get("page");
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const [q, setQ] = useState("");
  const cats = listCategories();

  const all = useMemo(() => listPosts({ status: "published", search: q || undefined }), [q]);
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const current = Math.max(1, Math.min(page, totalPages));
  const slice = all.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <PageShell>
      <section className="border-b border-border/60" style={{ background: "var(--gradient-hero)" }}>
        <div className="racira-page-container py-14 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Articles</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">{all.length} pieces and counting. Search or browse by category.</p>
          <div className="mt-6 flex max-w-xl items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-1.5 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search articles…"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {cats.map((c) => (
              <Link key={c.id} href={`/category/${c.slug}`} className="rounded-full border border-border/60 bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary">
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
              onClick={() => router.push(`?page=${current - 1}`)}
            >
              Previous
            </Button>
            <span className="px-3 text-sm text-muted-foreground">Page {current} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={current >= totalPages}
              onClick={() => router.push(`?page=${current + 1}`)}
            >
              Next
            </Button>
          </div>
        )}
      </section>
    </PageShell>
  );
}

export default function BlogIndex() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlogList />
    </Suspense>
  );
}