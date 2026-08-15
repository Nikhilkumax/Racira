import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles, ChevronRight, Construction } from "lucide-react";
import { categories, TOOLS_BY_SLUG } from "@/domains/animator/registry";
import { toSlug } from "@/lib/utils/slug";
import { isLiveTool } from "@/lib/tools/liveToolFilters";
import { SubcategoryCard } from "@/components/shared/SubcategoryCard";
import { inferIcon } from "@/components/shared/icon-map";
import Header from "@/components/Header";
import ToolPageHeader from "@/components/tools/shared/ToolPageHeader";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// ==========================================
// METADATA
// ==========================================
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // 1. Check Category
  const category = categories.find(c => toSlug(c.name) === slug);
  if (category) {
    return {
      title: `${category.name} — Racira Animator`,
      description: `Explore free tools for ${category.name} directly in your browser.`,
      alternates: {
        canonical: `/animator/${slug}`,
      },
    };
  }

  // 2. Check Tool
  const tool = TOOLS_BY_SLUG.get(slug);
  if (tool) {
    return {
      title: `${tool.name} — Racira Animator`,
      description: tool.description,
      alternates: {
        canonical: `/animator/${tool.slug}`,
      },
    };
  }

  return { title: "Not Found — Racira" };
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  
  for (const cat of categories) {
    params.push({ slug: toSlug(cat.name) });
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
      <Header mode="category" categoryName="Animator" />
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-0">
          <nav aria-label="breadcrumb" className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href="/animator" className="hover:text-foreground transition-colors">Animator</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>
        </div>

        <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
              {category.name}
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              Explore free browser-based tools for {category.name}.
            </p>
          </div>
        </section>

        <div className="racira-page-container pb-16 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {category.tools.filter((t) => isLiveTool(t, "animator")).map((tool: any) => {
              const Icon = tool.icon || inferIcon(tool.name, tool.slug);
              return (
                <SubcategoryCard
                  key={tool.slug}
                  title={tool.name}
                  icon={Icon}
                  count={0}
                  basePath={`/animator/${tool.slug}`}
                  label="tool"
                />
              );
            })}
          </div>
        </div>
      </main>
      <footer className="border-t border-border py-8 mt-auto">
        <div className="racira-page-container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Racira Animator — Free browser tools for animation workflows.
        </div>
      </footer>
    </div>
  );
}

function ToolView({ tool, category }: { tool: any, category: typeof categories[0] }) {
  const categorySlug = toSlug(category.name);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Animator" />
      <main className="flex-1">
        <ToolPageHeader
          breadcrumbItems={[
            { label: "Home", href: "/" },
            { label: "Animator", href: "/animator" },
            { label: category.name, href: `/animator/${categorySlug}` },
            { label: tool.name, href: null },
          ]}
          title={tool.name}
        />
        <div className="racira-page-container pb-16">

          {tool.status === "live" ? (
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 min-h-[400px]">
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Tool canvas loaded.
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/10 p-10 text-center">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Construction className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold">Coming soon</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                We're polishing <span className="font-medium text-foreground">{tool.name}</span>. It will land here shortly — in the meantime explore the other tools.
              </p>
              <Link
                href="/animator"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                <Sparkles className="h-4 w-4" /> Browse all tools
              </Link>
            </div>
          )}
        </div>
      </main>
      <footer className="border-t border-border py-8 mt-auto">
        <div className="racira-page-container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Racira Animator — Free browser tools for animation workflows.
        </div>
      </footer>
    </div>
  );
}

// ==========================================
// POLYMORPHIC ENTRY POINT
// ==========================================
export default async function PolymorphicPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Is it a category?
  const category = categories.find(c => toSlug(c.name) === slug);
  if (category) {
    return <CategoryView category={category} />;
  }

  // 2. Is it a tool?
  const tool = TOOLS_BY_SLUG.get(slug);
  if (tool) {
    const parentCategory = categories.find(c => c.name === tool.category);
    return <ToolView tool={tool} category={parentCategory!} />;
  }

  // 3. Not found
  notFound();
}
