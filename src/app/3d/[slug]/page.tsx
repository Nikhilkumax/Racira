import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/domains/3d/components/SiteShell";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { ToolRenderer } from "@/domains/3d/components/tools/ToolRenderer";
import { CATEGORIES, ALL_TOOLS, TOOLS_BY_SLUG } from "@/domains/3d/registry";
import { THREE_D_SITE } from "@/domains/3d/site";
import { INDEX_SOON_PAGES } from "@/domains/3d/indexing";
import { toSlug } from "@/lib/utils/slug";
import { isLiveTool } from "@/lib/tools/liveToolFilters";
import { hasComingSoonPage } from "@/lib/tools/comingSoonPage";
import { buildSoonMetadata } from "@/lib/tools/soonMetadata";
import { pickRelatedTools } from "@/lib/tools/soonRelated";
import { ComingSoonToolPage } from "@/components/shared/ComingSoonToolPage";
import { SubcategoryCard } from "@/components/shared/SubcategoryCard";
import { inferIcon } from "@/components/shared/icon-map";
import ToolPageHeader from "@/components/tools/shared/ToolPageHeader";

/** Names repeated among this domain's upcoming tools — used to qualify labels. */
const SOON_NAME_COUNTS = (() => {
  const counts = new Map<string, number>();
  for (const tool of ALL_TOOLS) {
    if (tool.status === "live") continue;
    counts.set(tool.name, (counts.get(tool.name) ?? 0) + 1);
  }
  return counts;
})();

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
      title: `${catTitle} — ${THREE_D_SITE.copyrightName}`,
      description: `Explore free tools for ${catTitle} directly in your browser.`,
      alternates: {
        canonical: `/3d/${slug}`,
      },
    };
  }

  // 2. Check Tool
  const tool = TOOLS_BY_SLUG.get(slug);
  if (tool) {
    // Upcoming tools keep a self-canonical and real copy; INDEX_SOON_PAGES
    // controls whether they are also indexable (domains/3d/indexing.ts).
    if (hasComingSoonPage(tool, "3d")) {
      const cat = CATEGORIES.find(c => (c.title || c.name) === tool.category);
      return buildSoonMetadata(
        {
          tool,
          domainKey: "3d",
          siteName: THREE_D_SITE.copyrightName,
          categoryName: cat ? (cat.title || cat.name) : tool.category,
          soonNameCounts: SOON_NAME_COUNTS,
        },
        INDEX_SOON_PAGES,
      );
    }
    return {
      title: `${tool.name} — ${THREE_D_SITE.copyrightName}`,
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
      if (isLiveTool(tool, "3d")) params.push({ slug: tool.slug });
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
          {category.tools.map((tool: any) => {
            const Icon = tool.icon || inferIcon(tool.name, tool.slug);
            return (
              <SubcategoryCard
                key={tool.slug}
                title={tool.name}
                icon={Icon}
                count={0}
                basePath={`/3d/${tool.slug}`}
                label="tool"
                soon={!isLiveTool(tool, "3d")}
                clickable={hasComingSoonPage(tool, "3d")}
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
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <ToolRenderer slug={tool.slug} />
        </div>
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

  // 2. Is it a genuinely-live tool?
  const tool = TOOLS_BY_SLUG.get(slug);
  if (tool && isLiveTool(tool, "3d")) {
    const parentCategory = CATEGORIES.find(c => (c.title || c.name) === tool.category);
    return <ToolView tool={tool} category={parentCategory!} />;
  }

  // 3. Upcoming tools render a Coming Soon page instead of 404ing.
  if (tool && hasComingSoonPage(tool, "3d")) {
    const parentCategory = CATEGORIES.find(c => (c.title || c.name) === tool.category);
    const catName = parentCategory ? (parentCategory.title || parentCategory.name) : (tool.category ?? "3D & Print");
    const related = pickRelatedTools(ALL_TOOLS, {
      currentSlug: slug,
      basePath: "/3d",
      isLive: (t) => isLiveTool(t, "3d"),
      sameGroup: (t) => t.category === tool.category,
    });
    return (
      <ComingSoonToolPage
        toolName={tool.name}
        toolDescription={tool.description}
        icon={tool.icon}
        siteName={THREE_D_SITE.copyrightName}
        domainLabel="3D & Print"
        domainHref="/3d"
        categoryName={catName}
        categoryHref={`/3d/${toSlug(catName)}`}
        relatedLive={related.live}
        relatedSoon={related.soon}
      />
    );
  }

  // 4. Not found
  notFound();
}
