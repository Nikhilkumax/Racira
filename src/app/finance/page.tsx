import Link from "next/link";
import { ArrowRight, Clock, TrendingUp } from "lucide-react";
import { PageShell } from "@/components/finance/page-shell";
import { PostCard } from "@/components/finance/post-card";
import { NewsletterSignup } from "@/components/finance/newsletter-signup";
import { Button } from "@/components/ui/button";
import { listPosts, getFeaturedPost } from "@/lib/finance/data/posts";
import { listCategories } from "@/lib/finance/data/taxonomy";

export const metadata = {
  title: "Racira Finance — Clear-eyed writing on money & markets",
  description: "Long-form analysis on investing, personal finance, markets, and the economy. Written by former practitioners.",
  openGraph: {
    title: "Racira Finance",
    description: "Long-form analysis on investing, personal finance, markets, and the economy.",
    url: "/",
  },
  alternates: {
    canonical: "/",
  },
};

export default function Index() {
  const featured = getFeaturedPost();
  const latest = listPosts({ status: "published" }).filter((p) => p.id !== featured?.id).slice(0, 6);
  const cats = listCategories();

  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="racira-page-container py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <TrendingUp className="h-3.5 w-3.5" /> The week in finance
          </div>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Slow ideas about money,<br />
            <span className="text-primary">in a fast market.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Racira publishes long-form, evidence-driven writing on investing, the economy, and personal finance — for readers who'd rather understand than react.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/blog">
              <Button size="lg" className="font-medium">
                Read the latest <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="font-medium">Our standards</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured article */}
      {featured && (
        <section className="racira-page-container py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Featured</h2>
            <Link href="/blog" className="text-sm font-medium text-primary hover:underline">All articles →</Link>
          </div>
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid gap-8 overflow-hidden rounded-2xl border border-border/60 bg-card md:grid-cols-2"
          >
            <div className="aspect-[4/3] overflow-hidden md:aspect-auto">
              <img src={featured.cover_url} alt={featured.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="flex flex-col justify-center p-6 md:p-10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                {featured.category.name}
              </div>
              <h3 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                {featured.title}
              </h3>
              <p className="mt-4 text-muted-foreground">{featured.excerpt}</p>
              <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
                <img src={featured.author.avatar_url} alt="" className="h-8 w-8 rounded-full" />
                <span className="font-medium text-foreground">{featured.author.name}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {featured.reading_time} min</span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Categories strip */}
      <section className="racira-page-container">
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="rounded-full border border-border/60 bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Latest */}
      <section className="racira-page-container py-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 font-display text-2xl font-semibold tracking-tight md:text-3xl">Latest</h2>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {latest.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      </section>

      {/* Newsletter */}
      <section className="racira-page-container pb-16 sm:px-6 lg:px-8">
        <NewsletterSignup />
      </section>
    </PageShell>
  );
}
