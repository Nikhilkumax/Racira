import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/domains/3d/components/SiteShell";
import { ArrowLeft, Sparkles, ChevronRight } from "lucide-react";
import { ToolRenderer } from "@/domains/3d/components/tools/ToolRenderer";
import { CATEGORIES, TOOLS_BY_SLUG } from "@/domains/3d/registry";
import { toSlug } from "@/lib/utils/slug";
import { isLiveTool } from "@/lib/tools/liveToolFilters";
import { SubcategoryCard } from "@/components/shared/SubcategoryCard";
import { inferIcon } from "@/components/shared/icon-map";
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
  const category = CATEGORIES.find(c => toSlug(c.title || c.name) === slug);
  if (category) {
    const catTitle = category.title || category.name;
    return {
      title: `${catTitle} — Racira 3D & Print`,
      description: `Explore free tools for ${catTitle} directly in your browser.`,
      alternates: {
        canonical: `/3d/${slug}`,
      },
    };
  }

  // 2. Check Tool
  const tool = TOOLS_BY_SLUG.get(slug);
  if (tool) {
    return {
      title: `${tool.name} — Racira 3D & Print`,
      description: tool.description,
      alternates: {
        canonical: `/3d/${tool.slug}`,
      },
    };
  }

  return { title: "Not Found — Racira" };
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];

  for (const cat of CATEGORIES) {
    params.push({ slug: toSlug(cat.title || cat.name) });
    for (const tool of cat.tools) {
      params.push({ slug: tool.slug });
    }
  }

  return params;
}

// ==========================================
// VIEWS
// ==========================================
function CategoryView({ category }: { category: typeof CATEGORIES[0] }) {
  return (
    <SiteShell>
      <div className="racira-page-container pt-8 pb-0">
        <nav aria-label="breadcrumb" className="flex items-center text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <Link href="/3d" className="hover:text-foreground transition-colors">3D & Print</Link>
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
          {category.tools.filter((t) => isLiveTool(t, "3d")).map((tool: any) => {
            const Icon = tool.icon || inferIcon(tool.name, tool.slug);
            return (
              <SubcategoryCard
                key={tool.slug}
                title={tool.name}
                icon={Icon}
                count={0}
                basePath={`/3d/${tool.slug}`}
                label="tool"
              />
            );
          })}
        </div>
      </div>
    </SiteShell>
  );
}

function ToolView({ tool, category }: { tool: any, category: typeof CATEGORIES[0] }) {
  const categorySlug = toSlug(category.title || category.name);

  return (
    <SiteShell>
      <ToolPageHeader
        breadcrumbItems={[
          { label: "Home", href: "/" },
          { label: "3D & Print", href: "/3d" },
          { label: category.title, href: `/3d/${categorySlug}` },
          { label: tool.name, href: null },
        ]}
        title={tool.name}
      />
      <div className="racira-page-container">

        {tool.status === "live" ? (
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <ToolRenderer slug={tool.slug} />
          </div>
        ) : (
          <ComingSoon name={tool.name} />
        )}
      </div>
    </SiteShell>
  );
}

// ==========================================
// POLYMORPHIC ENTRY POINT
// ==========================================
export default async function PolymorphicPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Is it a category?
  const category = CATEGORIES.find(c => toSlug(c.title || c.name) === slug);
  if (category) {
    return <CategoryView category={category} />;
  }

  // 2. Is it a tool?
  const tool = TOOLS_BY_SLUG.get(slug);
  if (tool) {
    const parentCategory = CATEGORIES.find(c => (c.title || c.name) === tool.category);
    return <ToolView tool={tool} category={parentCategory!} />;
  }

  // 3. Not found
  notFound();
}

function ComingSoon({ name }: { name: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">{name} is coming soon</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
        We're crafting this tool right now. In the meantime, explore our live tools.
      </p>
      <Link href="/3d" className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
        Browse live tools
      </Link>
    </div>
  );
}
