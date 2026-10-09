import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { categories, allTools, TOOLS_BY_SLUG } from "@/domains/animator/registry";
import { ANIMATOR_SITE } from "@/domains/animator/site";
import { INDEX_SOON_PAGES } from "@/domains/animator/indexing";
import { toSlug } from "@/lib/utils/slug";
import { isLiveTool } from "@/lib/tools/liveToolFilters";
import { hasComingSoonPage } from "@/lib/tools/comingSoonPage";
import { buildSoonMetadata } from "@/lib/tools/soonMetadata";
import { pickRelatedTools } from "@/lib/tools/soonRelated";
import { ComingSoonToolPage } from "@/components/shared/ComingSoonToolPage";
import { SubcategoryCard } from "@/components/shared/SubcategoryCard";
import { inferIcon } from "@/components/shared/icon-map";

/** Names repeated among this domain's upcoming tools — used to qualify labels. */
const SOON_NAME_COUNTS = (() => {
  const counts = new Map<string, number>();
  for (const tool of allTools) {
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
  const category = categories.find(c => toSlug(c.name) === slug);
  if (category) {
    return {
      title: `${category.name} — ${ANIMATOR_SITE.copyrightName}`,
      description: `Explore free tools for ${category.name} directly in your browser.`,
      alternates: {
        canonical: `/animator/${slug}`,
      },
    };
  }

  // 2. Check Tool
  const tool = TOOLS_BY_SLUG.get(slug);
  if (tool) {
    // Upcoming tools keep a self-canonical and real copy; INDEX_SOON_PAGES
    // controls whether they are also indexable (domains/animator/indexing.ts).
    if (hasComingSoonPage(tool, "animator")) {
      return buildSoonMetadata(
        { tool, domainKey: "animator", siteName: ANIMATOR_SITE.copyrightName, categoryName: tool.category, soonNameCounts: SOON_NAME_COUNTS },
        INDEX_SOON_PAGES,
      );
    }
    return {
      title: `${tool.name} — ${ANIMATOR_SITE.copyrightName}`,
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
      if (isLiveTool(tool, "animator")) params.push({ slug: tool.slug });
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
            {category.tools.map((tool: any) => {
              const Icon = tool.icon || inferIcon(tool.name, tool.slug);
              return (
                <SubcategoryCard
                  key={tool.slug}
                  title={tool.name}
                  icon={Icon}
                  count={0}
                  basePath={`/animator/${tool.slug}`}
                  label="tool"
                  soon={!isLiveTool(tool, "animator")}
                  clickable={hasComingSoonPage(tool, "animator")}
                />
              );
            })}
          </div>
        </div>
      </main>
      <footer className="border-t border-border py-8 mt-auto">
        <div className="racira-page-container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {ANIMATOR_SITE.copyrightName} — Free browser tools for animation workflows.
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

  // 2. Upcoming tools render a Coming Soon page instead of 404ing.
  const tool = TOOLS_BY_SLUG.get(slug);
  if (tool && hasComingSoonPage(tool, "animator")) {
    const catName = tool.category ?? "Animation";
    const related = pickRelatedTools(allTools, {
      currentSlug: slug,
      basePath: "/animator",
      isLive: (t) => isLiveTool(t, "animator"),
      sameGroup: (t) => t.category === tool.category,
    });
    return (
      <ComingSoonToolPage
        toolName={tool.name}
        toolDescription={tool.description}
        icon={tool.icon}
        siteName={ANIMATOR_SITE.copyrightName}
        domainLabel="Animation"
        domainHref="/animator"
        categoryName={catName}
        categoryHref={`/animator/${toSlug(catName)}`}
        relatedLive={related.live}
        relatedSoon={related.soon}
      />
    );
  }

  // 3. Not found
  notFound();
}
