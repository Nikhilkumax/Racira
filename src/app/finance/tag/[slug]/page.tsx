import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/domains/finance/blog/page-shell";
import { PostCard } from "@/domains/finance/blog/post-card";
import { listPosts } from "@/domains/finance/data/posts";
import { getTagBySlug } from "@/domains/finance/data/taxonomy";
import type { PostWithRelations } from "@/types/finance/db";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = getTagBySlug(slug);
  if (!t) return {};
  return {
    title: `#${(t as any).name} — Racira Finance`,
    description: `Articles tagged ${(t as any).name} on Racira Finance.`,
    openGraph: {
      title: `#${(t as any).name} — Racira Finance`,
      url: `/tag/${slug}`,
    },
    alternates: {
      canonical: `/tag/${slug}`,
    },
  };
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = getTagBySlug(slug);
  if (!tag) return notFound();
  const posts = listPosts({ status: "published", tagSlug: slug });

  return (
    <PageShell>
      <section className="border-b border-border/60" style={{ background: "var(--gradient-hero)" }}>
        <div className="racira-page-container py-14 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">#{tag.name}</h1>
          <p className="mt-3 text-muted-foreground">{posts.length} article{posts.length === 1 ? "" : "s"}</p>
        </div>
      </section>
      <section className="racira-page-container py-12 sm:px-6 lg:px-8">
        {posts.length === 0 ? (
          <p className="text-muted-foreground">No articles with this tag yet.</p>
        ) : (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p: PostWithRelations) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </section>
    </PageShell>
  );
}