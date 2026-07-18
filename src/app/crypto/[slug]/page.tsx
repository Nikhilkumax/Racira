import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Construction, Sparkles, Wrench } from "lucide-react";
import { TOOLS, CATEGORIES, getTool, slugify } from "@/domains/crypto/registry";
import Header from "@/components/Header";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find(c => slugify(c) === slug);
  if (category) {
    return { title: `${category} — Racira Crypto`, description: `Explore free crypto tools for ${category}.`, alternates: { canonical: `/crypto/${slug}` } };
  }
  const tool = getTool(slug);
  if (tool) {
    return { title: `${tool.name} — Racira Crypto`, description: tool.desc, alternates: { canonical: `/crypto/${slug}` } };
  }
  return { title: "Not Found — Racira" };
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const cat of CATEGORIES) {
    params.push({ slug: slugify(cat) });
  }
  for (const tool of TOOLS) {
    params.push({ slug: tool.slug });
  }
  return params;
}

function CategoryView({ category }: { category: string }) {
  const tools = TOOLS.filter(t => t.category === category);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Crypto" />
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-0">
          <nav aria-label="breadcrumb" className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href="/crypto" className="hover:text-foreground transition-colors">Crypto</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <span className="text-foreground font-medium">{category}</span>
          </nav>
        </div>
        <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">{category}</h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">Free browser-based {category} tools.</p>
          </div>
        </section>
        <div className="racira-page-container pb-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map(tool => {
              const Icon = (tool as any).icon || Wrench;
              return (
                <Link key={tool.slug} href={`/crypto/${tool.slug}`} className="tool-card group hover:-translate-y-[3px]">
                  <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground leading-snug">{tool.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

function ToolView({ tool }: { tool: ReturnType<typeof getTool> }) {
  if (!tool) return null;
  const Icon = (tool as any).icon || Wrench;
  const categorySlug = slugify(tool.category);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Crypto" />
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-16">
          <nav aria-label="breadcrumb" className="hidden md:flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href="/crypto" className="hover:text-foreground transition-colors">Crypto</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href={`/crypto/${categorySlug}`} className="hover:text-foreground transition-colors">{tool.category}</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <span className="text-foreground font-medium">{tool.name}</span>
          </nav>
          <div className="mt-4 mb-6">
            <p className="text-xs uppercase tracking-wider text-primary font-medium">{tool.category}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{tool.name}</h1>
            <p className="mt-2 text-muted-foreground">{tool.desc}</p>
          </div>
          {tool.status === "live" ? (
            <div className="mt-10 rounded-xl border border-border bg-card p-4 sm:p-6 min-h-[400px]">
              <div className="flex h-full items-center justify-center text-muted-foreground">Tool canvas loaded.</div>
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-primary/30 bg-primary/10 p-10 text-center">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Construction className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold">Coming soon</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">We&apos;re polishing <span className="font-medium text-foreground">{tool.name}</span>. It will land here shortly.</p>
              <Link href="/crypto" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                <Sparkles className="h-4 w-4" /> Browse all tools
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default async function PolymorphicPage({ params }: PageProps) {
  const { slug } = await params;
  const category = CATEGORIES.find(c => slugify(c) === slug);
  if (category) return <CategoryView category={category} />;
  const tool = getTool(slug);
  if (tool) return <ToolView tool={tool} />;
  notFound();
}
