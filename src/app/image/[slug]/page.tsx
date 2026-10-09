import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { categories, getImageToolBySlug } from "@/domains/image/registry";
import { IMAGE_SITE } from "@/domains/image/site";
import { INDEX_SOON_PAGES } from "@/domains/image/indexing";
import { toSlug } from "@/lib/utils/slug";
import { isLiveTool } from "@/lib/tools/liveToolFilters";
import { hasComingSoonPage } from "@/lib/tools/comingSoonPage";
import { buildSoonMetadata } from "@/lib/tools/soonMetadata";
import { pickRelatedTools } from "@/lib/tools/soonRelated";
import { ComingSoonToolPage } from "@/components/shared/ComingSoonToolPage";
import { inferIcon } from "@/components/shared/icon-map";
import Header from "@/components/Header";

/** Flat view of the registry used for related-tool picks and label qualifiers. */
const ALL_IMAGE_TOOLS = categories.flatMap((cat: any) => cat.tools as any[]);

/** Names repeated among this domain's upcoming tools — used to qualify labels. */
const SOON_NAME_COUNTS = (() => {
  const counts = new Map<string, number>();
  for (const tool of ALL_IMAGE_TOOLS) {
    if (tool.status === "live") continue;
    counts.set(tool.name, (counts.get(tool.name) ?? 0) + 1);
  }
  return counts;
})();

/** The category a tool belongs to, for breadcrumbs and related picks. */
function categoryOf(slug: string): string {
  for (const cat of categories as any[]) {
    if ((cat.tools as any[]).some((tool) => tool.slug === slug)) return cat.name;
  }
  return "Image";
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((c: any) => toSlug(c.name) === slug);
  if (category) return { title: `${category.name} — ${IMAGE_SITE.copyrightName}`, description: `Free browser-based ${category.name} tools.`, alternates: { canonical: `/image/${slug}` } };
  const tool = getImageToolBySlug(slug);
  if (tool) {
    // Upcoming tools keep a self-canonical and real copy; INDEX_SOON_PAGES
    // controls whether they are also indexable (domains/image/indexing.ts).
    if (hasComingSoonPage(tool, "image")) {
      return buildSoonMetadata(
        { tool, domainKey: "image", siteName: IMAGE_SITE.copyrightName, categoryName: categoryOf(slug), soonNameCounts: SOON_NAME_COUNTS },
        INDEX_SOON_PAGES,
      );
    }
    return { title: `${tool.name} — ${IMAGE_SITE.copyrightName}`, description: tool.description, alternates: { canonical: `/image/${slug}` } };
  }
  return { title: "Not Found — Racira" };
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const cat of categories) {
    params.push({ slug: toSlug((cat as any).name) });
    for (const tool of (cat as any).tools) {
      if (isLiveTool(tool, "image")) params.push({ slug: (tool as any).slug });
    }
  }
  return params;
}

function CategoryView({ category }: { category: any }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Image" />
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-0">
          <nav aria-label="breadcrumb" className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href="/image" className="hover:text-foreground transition-colors">Image</Link>
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
              const isLive = isLiveTool(tool, "image");
              const clickable = isLive || hasComingSoonPage(tool, "image");
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
                <Link key={tool.slug} href={`/image/${tool.slug}`} className="tool-card group hover:-translate-y-[3px]">
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

export default async function PolymorphicPage({ params }: PageProps) {
  const { slug } = await params;
  const category = categories.find((c: any) => toSlug(c.name) === slug);
  if (category) return <CategoryView category={category} />;

  const tool = getImageToolBySlug(slug);

  // Upcoming tools render a Coming Soon page instead of 404ing.
  if (tool && hasComingSoonPage(tool, "image")) {
    const catName = categoryOf(slug);
    const related = pickRelatedTools(ALL_IMAGE_TOOLS, {
      currentSlug: slug,
      basePath: "/image",
      isLive: (t) => isLiveTool(t, "image"),
      sameGroup: (t) => (t as any).category === catName || categoryOf((t as any).slug) === catName,
    });
    return (
      <ComingSoonToolPage
        toolName={tool.name}
        toolDescription={tool.description}
        icon={tool.icon}
        siteName={IMAGE_SITE.copyrightName}
        domainLabel="Image"
        domainHref="/image"
        categoryName={catName}
        categoryHref={`/image/${toSlug(catName)}`}
        relatedLive={related.live}
        relatedSoon={related.soon}
      />
    );
  }

  notFound();
}
