import Link from "next/link";
import { Search, ArrowRight, Clock, TrendingUp } from "lucide-react";
import { PageShell } from "@/domains/finance/blog/page-shell";
import { PostCard } from "@/domains/finance/blog/post-card";
import { NewsletterSignup } from "@/domains/finance/blog/newsletter-signup";
import { Button } from "@/components/ui/button";
import { listPosts, getFeaturedPost } from "@/domains/finance/data/posts";
import { listCategories } from "@/domains/finance/data/taxonomy";

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
            <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            20+ Free Finance Tools —{" "}
            <span className="hero-gradient-text">Loans, Savings & Taxes</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Professional calculators for loans, mortgages, savings, and personal tax planning. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 20+ finance tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Finance Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
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
