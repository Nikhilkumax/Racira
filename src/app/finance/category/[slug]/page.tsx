import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/domains/finance/blog/page-shell";
import { PostCard } from "@/domains/finance/blog/post-card";
import { listPosts } from "@/domains/finance/data/posts";
import { getCategoryBySlug } from "@/domains/finance/data/taxonomy";
import type { PostWithRelations } from "@/types/finance/db";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCategoryBySlug(slug);
  if (!c) return {};
  return {
    title: `${c.name} — Racira Finance`,
    description: c.description,
    openGraph: {
      title: `${c.name} — Racira Finance`,
      description: c.description,
      url: `/category/${slug}`,
    },
    alternates: {
      canonical: `/category/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return notFound();
  const posts = listPosts({ status: "published", categorySlug: slug });

  return (
    <PageShell>
      <section className="border-b border-border/60" style={{ background: "var(--gradient-hero)" }}>
        <div className="racira-page-container py-14 sm:px-6 lg:px-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Category</div>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">{category.name}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{category.description}</p>
        </div>
      </section>
      <section className="racira-page-container py-12 sm:px-6 lg:px-8">
        {posts.length === 0 ? (
          <p className="text-muted-foreground">No articles in this category yet.</p>
        ) : (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p: PostWithRelations) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </section>
    </PageShell>
  );
}