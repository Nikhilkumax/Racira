import Link from "next/link";
import { notFound } from "next/navigation";
import { Twitter, Linkedin } from "lucide-react";
import { PageShell } from "@/components/finance/page-shell";
import { PostCard } from "@/components/finance/post-card";
import { listPosts } from "@/lib/finance/data/posts";
import { getAuthorBySlug } from "@/lib/finance/data/taxonomy";
import type { PostWithRelations } from "@/types/finance/db";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getAuthorBySlug(slug);
  if (!a) return {};
  return {
    title: `${a.name} — Racira Finance`,
    description: a.bio,
    openGraph: {
      title: `${a.name} — Racira Finance`,
      description: a.bio,
      images: [a.avatar_url],
      url: `/authors/${slug}`,
    },
    alternates: {
      canonical: `/authors/${slug}`,
    },
  };
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) return notFound();
  const posts = listPosts({ status: "published", authorSlug: slug });

  return (
    <PageShell>
      <section className="border-b border-border/60" style={{ background: "var(--gradient-hero)" }}>
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
          <img src={author.avatar_url} alt={author.name} className="h-24 w-24 rounded-full ring-4 ring-background" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">{author.role}</div>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">{author.name}</h1>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{author.bio}</p>
          </div>
          <div className="flex gap-3">
            {author.twitter && <a href={`https://twitter.com/${author.twitter}`} className="text-muted-foreground hover:text-primary"><Twitter className="h-4 w-4" /></a>}
            {author.linkedin && <a href={`https://linkedin.com/in/${author.linkedin}`} className="text-muted-foreground hover:text-primary"><Linkedin className="h-4 w-4" /></a>}
          </div>
        </div>
      </section>
      <section className="racira-page-container py-12 sm:px-6 lg:px-8">
        <h2 className="mb-8 font-display text-2xl font-semibold tracking-tight">Articles by {author.name.split(" ")[0]}</h2>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p: PostWithRelations) => <PostCard key={p.id} post={p} />)}
        </div>
      </section>
    </PageShell>
  );
}