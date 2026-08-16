import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { categories, TOOLS_BY_SLUG, totalCount } from "@/domains/cad/registry";
import { toSlug } from "@/lib/utils/slug";
import { isComingSoonToolPage, isLiveTool } from "@/lib/tools/liveToolFilters";
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
      robots: isComingSoonToolPage(tool, "cad") ? { index: false, follow: false } : undefined,
    };
  }

  return { title: "Not Found — Racira" };
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  
  for (const cat of categories) {
    params.push({ slug: toSlug(cat.title) });
    for (const tool of cat.tools) {
      if (isLiveTool(tool, "cad")) params.push({ slug: tool.slug });
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
                  soon={!isLiveTool(tool, "cad")}
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

  // 2. No CAD tool page renders a real tool (registry has no components) —
  //    every tool slug 404s.
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
