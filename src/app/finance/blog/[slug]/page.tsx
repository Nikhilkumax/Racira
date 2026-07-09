import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Calendar, ArrowLeft } from "lucide-react";
import { PageShell } from "@/domains/finance/blog/page-shell";
import { PostCard } from "@/domains/finance/blog/post-card";
import { NewsletterSignup } from "@/domains/finance/blog/newsletter-signup";
import { getPostBySlug, getRelated } from "@/domains/finance/data/posts";
import { renderMarkdown } from "@/domains/finance/lib/markdown";
import type { PostWithRelations, Tag } from "@/types/finance/db";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.meta_title,
    description: post.meta_description,
    openGraph: {
      title: post.title,
      description: post.meta_description,
      images: [post.cover_url],
      url: `/blog/${slug}`,
      type: "article",
      authors: [post.author.name],
      publishedTime: post.published_at,
      section: post.category.name,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.meta_description,
      images: [post.cover_url],
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post || post.status !== "published") return notFound();
  const related = getRelated(post, 3);
  const html = renderMarkdown(post.content);
  const date = new Date(post.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.meta_description,
            image: [post.cover_url],
            datePublished: post.published_at,
            dateModified: post.updated_at,
            author: { "@type": "Person", name: post.author.name },
            publisher: { "@type": "Organization", name: "Racira Finance" },
            articleSection: post.category.name,
            keywords: post.tags.map((t) => (t as any).name).join(", "),
          }),
        }}
      />
      <article>
        <header className="border-b border-border/60" style={{ background: "var(--gradient-hero)" }}>
          <div className="racira-page-container py-14 sm:px-6 lg:px-8">
            <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> All articles
            </Link>
            <Link
              href={`/category/${post.category.slug}`}
              className="mt-6 inline-block text-xs font-semibold uppercase tracking-wider text-primary"
            >
              {post.category.name}
            </Link>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              {post.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <Link href={`/authors/${post.author.slug}`} className="flex items-center gap-2 hover:text-foreground">
                <img src={post.author.avatar_url} alt="" className="h-9 w-9 rounded-full" />
                <span className="font-medium text-foreground">{post.author.name}</span>
              </Link>
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {date}</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {post.reading_time} min read</span>
            </div>
          </div>
        </header>

        <div className="racira-page-container">
          <div className="-mt-2 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)]">
            <img src={post.cover_url} alt={post.title} className="aspect-[16/9] w-full object-cover" />
          </div>
        </div>

        <div className="racira-page-container py-12 sm:px-6 lg:px-8">
          <div className="prose-article" dangerouslySetInnerHTML={{ __html: html }} />
          {post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2 border-t border-border/60 pt-6">
              {post.tags.map((t: Tag) => (
                <Link key={t.id} href={`/tag/${(t as any).slug}`} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                  #{(t as any).name}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-12 rounded-2xl border border-border/60 bg-card p-6 md:p-8">
            <div className="flex items-start gap-4">
              <img src={post.author.avatar_url} alt="" className="h-14 w-14 rounded-full" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{post.author.role}</div>
                <Link href={`/authors/${post.author.slug}`} className="mt-1 block font-display text-xl font-semibold hover:text-primary">
                  {post.author.name}
                </Link>
                <p className="mt-2 text-sm text-muted-foreground">{post.author.bio}</p>
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="racira-page-container pb-16 sm:px-6 lg:px-8">
            <h2 className="mb-8 font-display text-2xl font-semibold tracking-tight">Related reading</h2>
            <div className="grid gap-10 md:grid-cols-3">
              {related.map((p: PostWithRelations) => <PostCard key={p.id} post={p} variant="compact" />)}
            </div>
          </section>
        )}

        <section className="racira-page-container pb-16 sm:px-6 lg:px-8">
          <NewsletterSignup />
        </section>
      </article>
    </PageShell>
  );
}