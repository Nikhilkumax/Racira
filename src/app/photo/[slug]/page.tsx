import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { CATEGORIES, ALL_TOOLS, findTool } from "@/domains/photo/registry";
import { PHOTO_SITE } from "@/domains/photo/site";
import { INDEX_SOON_PAGES } from "@/domains/photo/indexing";
import { ToolRenderer } from "@/domains/photo/components/tools/ToolRenderer";
import { toSlug } from "@/lib/utils/slug";
import { isLiveTool } from "@/lib/tools/liveToolFilters";
import { hasComingSoonPage } from "@/lib/tools/comingSoonPage";
import { buildSoonMetadata } from "@/lib/tools/soonMetadata";
import { pickRelatedTools } from "@/lib/tools/soonRelated";
import { ComingSoonToolPage } from "@/components/shared/ComingSoonToolPage";
import { inferIcon } from "@/components/shared/icon-map";
import Header from "@/components/Header";

/** Names repeated among this domain's upcoming tools — used to qualify labels. */
const SOON_NAME_COUNTS = (() => {
  const counts = new Map<string, number>();
  for (const tool of ALL_TOOLS) {
    if (tool.status === "live") continue;
    counts.set(tool.name, (counts.get(tool.name) ?? 0) + 1);
  }
  return counts;
})();

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find(c => toSlug(c.name) === slug);
  if (category) return { title: `${category.name} — ${PHOTO_SITE.copyrightName}`, description: `Free browser-based ${category.name} tools.`, alternates: { canonical: `/photo/${slug}` } };
  const tool = findTool(slug);
  if (tool) {
    // Upcoming tools keep a self-canonical and real copy; INDEX_SOON_PAGES
    // controls whether they are also indexable (domains/photo/indexing.ts).
    if (hasComingSoonPage(tool, "photo")) {
      return buildSoonMetadata(
        { tool, domainKey: "photo", siteName: PHOTO_SITE.copyrightName, categoryName: tool.category, soonNameCounts: SOON_NAME_COUNTS },
        INDEX_SOON_PAGES,
      );
    }
    return { title: `${tool.name} — ${PHOTO_SITE.copyrightName}`, description: tool.description, alternates: { canonical: `/photo/${slug}` } };
  }
  return { title: "Not Found — Racira" };
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const cat of CATEGORIES) params.push({ slug: toSlug(cat.name) });
  for (const tool of ALL_TOOLS) {
    if (isLiveTool(tool, "photo")) params.push({ slug: tool.slug });
  }
  return params;
}

function CategoryView({ category }: { category: typeof CATEGORIES[0] }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Photo" />
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-0">
          <nav aria-label="breadcrumb" className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href="/photo" className="hover:text-foreground transition-colors">Photo</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>
        </div>
        <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">{category.name}</h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">Free browser-based {category.name} tools.</p>
          </div>
        </section>
        <div className="racira-page-container pb-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {category.tools.map((tool: any) => {
              const Icon = tool.icon || inferIcon(tool.name, tool.slug);
              // Live tools open the real tool; upcoming tools open their Coming
              // Soon page (never a 404) — same decision the ToolCard makes.
              const isLive = isLiveTool(tool, "photo");
              const clickable = isLive || hasComingSoonPage(tool, "photo");
              const cardBody = (
                <>
                  {!isLive && (
                    <span className="absolute right-3 top-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Soon
                    </span>
                  )}
                  <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground leading-snug">{tool.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
                </>
              );
              return clickable ? (
                <Link key={tool.slug} href={`/photo/${tool.slug}`} className="tool-card group hover:-translate-y-[3px]">
                  {cardBody}
                </Link>
              ) : (
                <div key={tool.slug} className="tool-card group hover:-translate-y-[3px] relative cursor-default">
                  {cardBody}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

function ToolView({ tool, categoryName }: { tool: (typeof ALL_TOOLS)[number]; categoryName: string }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Photo" />
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-0">
          <nav aria-label="breadcrumb" className="flex items-center flex-wrap text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href="/photo" className="hover:text-foreground transition-colors">Photo</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href={`/photo/${tool.categorySlug}`} className="hover:text-foreground transition-colors">{categoryName}</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <span className="text-foreground font-medium">{tool.name}</span>
          </nav>
        </div>
        <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
          <div className="racira-page-container">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">{tool.name}</h1>
            <p className="text-base text-muted-foreground max-w-2xl mb-8">{tool.description}</p>
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
              <ToolRenderer slug={tool.slug} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default async function PolymorphicPage({ params }: PageProps) {
  const { slug } = await params;
  const category = CATEGORIES.find(c => toSlug(c.name) === slug);
  if (category) return <CategoryView category={category} />;

  const tool = findTool(slug);

  // Live tools render their wired component.
  if (tool && isLiveTool(tool, "photo")) {
    return <ToolView tool={tool} categoryName={tool.category} />;
  }

  // Upcoming tools render a Coming Soon page instead of 404ing.
  if (tool && hasComingSoonPage(tool, "photo")) {
    const related = pickRelatedTools(ALL_TOOLS, {
      currentSlug: slug,
      basePath: "/photo",
      isLive: (t) => isLiveTool(t, "photo"),
      sameGroup: (t) => t.category === tool.category,
    });
    return (
      <ComingSoonToolPage
        toolName={tool.name}
        toolDescription={tool.description}
        icon={tool.icon}
        siteName={PHOTO_SITE.copyrightName}
        domainLabel="Photo"
        domainHref="/photo"
        categoryName={tool.category}
        categoryHref={`/photo/${tool.categorySlug}`}
        relatedLive={related.live}
        relatedSoon={related.soon}
      />
    );
  }

  notFound();
}
