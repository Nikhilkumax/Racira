import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles, ChevronRight, Hammer } from "lucide-react";
import { TOOLS_BY_SLUG, toolsByCategory } from "@/domains/colors/registry";
import { CATEGORY_META, ToolCategory } from "@/domains/colors/registry/types";
import { toSlug } from "@/lib/utils/slug";
import { SubcategoryCard } from "@/components/shared/SubcategoryCard";
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
  const categoryKeys = Object.keys(CATEGORY_META) as ToolCategory[];
  const foundCategoryKey = categoryKeys.find(key => {
    return CATEGORY_META[key] && toSlug(CATEGORY_META[key].label) === slug;
  });
  
  if (foundCategoryKey) {
    const meta = CATEGORY_META[foundCategoryKey];
    return {
      title: `${meta.label} — Racira Colors`,
      description: `Explore free color tools for ${meta.label} directly in your browser.`,
      alternates: {
        canonical: `/colors/${slug}`,
      },
    };
  }

  // 2. Check Tool
  const tool = TOOLS_BY_SLUG[slug];
  if (tool) {
    return {
      title: `${tool.name} — Racira Colors`,
      description: tool.description,
      alternates: {
        canonical: `/colors/${tool.slug}`,
      },
    };
  }

  return { title: "Not Found — Racira" };
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  
  const categoryKeys = Object.keys(CATEGORY_META || {}) as ToolCategory[];
  for (const key of categoryKeys) {
    if (CATEGORY_META[key]) {
      params.push({ slug: toSlug(CATEGORY_META[key].label) });
    }
  }
  
  for (const slug of Object.keys(TOOLS_BY_SLUG)) {
    params.push({ slug });
  }

  return params;
}

// ==========================================
// VIEWS
// ==========================================
function CategoryView({ categoryKey }: { categoryKey: ToolCategory }) {
  const meta = CATEGORY_META[categoryKey];
  const toolsList = toolsByCategory()[categoryKey] || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-0">
          <nav aria-label="breadcrumb" className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href="/colors" className="hover:text-foreground transition-colors">Colors</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <span className="text-foreground font-medium">{meta.label}</span>
          </nav>
        </div>

        <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
              {meta.label}
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              Explore free browser-based tools for {meta.label}.
            </p>
          </div>
        </section>

        <div className="racira-page-container pb-16 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {toolsList.map((tool: any) => {
              const Icon = tool.icon;
              return (
                <SubcategoryCard
                  key={tool.slug}
                  title={tool.name}
                  icon={Icon}
                  count={0}
                  basePath={`/colors/${tool.slug}`}
                  label="tool"
                />
              );
            })}
          </div>
        </div>
      </main>
      <footer className="border-t border-border py-8 mt-16">
        <div className="racira-page-container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Racira Colors — Free browser tools for color workflows.
        </div>
      </footer>
    </div>
  );
}

function ToolView({ tool, categoryKey }: { tool: any, categoryKey: ToolCategory }) {
  const meta = CATEGORY_META[categoryKey];
  const categorySlug = toSlug(meta.label);
  const Cmp = tool.component;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <ToolPageHeader
          breadcrumbItems={[
            { label: "Home", href: "/" },
            { label: "Colors", href: "/colors" },
            { label: meta.label, href: `/colors/${categorySlug}` },
            { label: tool.name, href: null },
          ]}
          title={tool.name}
        />
        <div className="racira-page-container pb-16">

          {tool.status === "live" && Cmp ? (
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 min-h-[400px]">
              <Cmp />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/10 p-10 text-center">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Hammer className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold">Coming soon</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                We're polishing <span className="font-medium text-foreground">{tool.name}</span>. It will land here shortly.
              </p>
              <Link
                href="/colors"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                <Sparkles className="h-4 w-4" /> Browse all tools
              </Link>
            </div>
          )}
        </div>
      </main>
      <footer className="border-t border-border py-8 mt-16">
        <div className="racira-page-container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Racira Colors — Free browser tools for color workflows.
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
  const categoryKeys = Object.keys(CATEGORY_META || {}) as ToolCategory[];
  const foundCategoryKey = categoryKeys.find(key => CATEGORY_META[key] && toSlug(CATEGORY_META[key].label) === slug);
  
  if (foundCategoryKey) {
    return <CategoryView categoryKey={foundCategoryKey} />;
  }

  // 2. Is it a tool?
  const tool = TOOLS_BY_SLUG[slug];
  if (tool) {
    return <ToolView tool={tool} categoryKey={tool.category} />;
  }

  // 3. Not found
  notFound();
}
