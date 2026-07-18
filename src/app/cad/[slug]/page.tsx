import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles, ChevronRight, Hammer } from "lucide-react";
import { categories, TOOLS_BY_SLUG, totalCount } from "@/domains/cad/registry";
import { toSlug } from "@/lib/utils/slug";
import { SubcategoryCard } from "@/components/shared/SubcategoryCard";
import { inferIcon } from "@/components/shared/icon-map";
import Header from "@/components/Header";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// ==========================================
// METADATA
// ==========================================
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // 1. Check Category
  const category = categories.find(c => toSlug(c.title) === slug);
  if (category) {
    return {
      title: `${category.title} — Racira CAD`,
      description: `Explore free CAD tools for ${category.title} directly in your browser.`,
      alternates: {
        canonical: `/cad/${slug}`,
      },
    };
  }

  // 2. Check Tool
  const tool = TOOLS_BY_SLUG.get(slug);
  if (tool) {
    return {
      title: `${tool.name} — Racira CAD`,
      description: tool.description,
      alternates: {
        canonical: `/cad/${tool.slug}`,
      },
    };
  }

  return { title: "Not Found — Racira" };
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  
  for (const cat of categories) {
    params.push({ slug: toSlug(cat.title) });
    for (const tool of cat.tools) {
      params.push({ slug: tool.slug });
    }
  }

  return params;
}

// ==========================================
// VIEWS
// ==========================================
function CategoryView({ category }: { category: typeof categories[0] }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="CAD" />
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-0">
          <nav aria-label="breadcrumb" className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href="/cad" className="hover:text-foreground transition-colors">CAD</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <span className="text-foreground font-medium">{category.title}</span>
          </nav>
        </div>

        <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
              {category.title}
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              Explore free browser-based tools for {category.title}.
            </p>
          </div>
        </section>

        <div className="racira-page-container pb-16 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {category.tools.map((tool: any) => {
              const Icon = tool.icon || inferIcon(tool.name, tool.slug);
              return (
                <SubcategoryCard
                  key={tool.slug}
                  title={tool.name}
                  icon={Icon}
                  count={0}
                  basePath={`/cad/${tool.slug}`}
                  label="tool"
                />
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ToolView({ tool, category }: { tool: any, category: typeof categories[0] }) {
  const categorySlug = toSlug(category.title);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="CAD" />
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-16">
          <nav aria-label="breadcrumb" className="hidden md:flex items-center flex-wrap text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href="/cad" className="hover:text-foreground transition-colors">CAD</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href={`/cad/${categorySlug}`} className="hover:text-foreground transition-colors">
              {category.title}
            </Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <span className="text-foreground font-medium">{tool.name}</span>
          </nav>

          <nav aria-label="breadcrumb" className="md:hidden flex items-center mb-6">
            <Link href={`/cad/${categorySlug}`} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
              <span aria-hidden="true">←</span>{category.title}
            </Link>
          </nav>

          <div className="mt-4 mb-6">
            <p className="text-xs uppercase tracking-wider text-primary font-medium">{category.title}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{tool.name}</h1>
            <p className="mt-2 text-muted-foreground">{tool.description}</p>
          </div>

          {tool.status === "live" ? (
            <div className="mt-10 rounded-xl border border-border bg-card p-4 sm:p-6 min-h-[400px]">
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Tool canvas loaded.
              </div>
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-primary/30 bg-primary/10 p-10 text-center">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Hammer className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold">Coming soon</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                We're polishing <span className="font-medium text-foreground">{tool.name}</span>. It will land here shortly.
              </p>
              <Link
                href="/cad"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                <Sparkles className="h-4 w-4" /> Browse all tools
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ==========================================
// POLYMORPHIC ENTRY POINT
// ==========================================
export default async function PolymorphicPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Is it a category?
  const category = categories.find(c => toSlug(c.title) === slug);
  if (category) {
    return <CategoryView category={category} />;
  }

  // 2. Is it a tool?
  const tool = TOOLS_BY_SLUG.get(slug);
  if (tool) {
    const parentCategory = categories.find(c => c.title === (tool as any).category);
    return <ToolView tool={tool} category={parentCategory!} />;
  }

  // 3. Not found
  notFound();
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card/40 mt-auto">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} Racira CAD. Built for engineers and designers.</p>
        <p>{totalCount}+ tools · No signup · Runs in your browser</p>
      </div>
    </footer>
  );
}
