import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { CATEGORY_ORDER, TOOLS, TOOL_BY_SLUG } from "@/domains/video/registry";
import { toSlug } from "@/lib/utils/slug";
import { isLiveTool } from "@/lib/tools/liveToolFilters";
import { hasComingSoonPage } from "@/lib/tools/comingSoonPage";
import { buildSoonMetadata } from "@/lib/tools/soonMetadata";
import { pickRelatedTools } from "@/lib/tools/soonRelated";
import { ComingSoonToolPage } from "@/components/shared/ComingSoonToolPage";
import { INDEX_SOON_PAGES } from "@/domains/video/indexing";
import { VIDEO_SITE } from "@/domains/video/site";
import { inferIcon } from "@/components/shared/icon-map";

/** Names repeated among this domain's upcoming tools — used to qualify labels. */
const SOON_NAME_COUNTS = (() => {
  const counts = new Map<string, number>();
  for (const tool of TOOLS) {
    if (tool.status === "live") continue;
    counts.set(tool.name, (counts.get(tool.name) ?? 0) + 1);
  }
  return counts;
})();

type PageProps = { params: Promise<{ slug: string }> };

// Build a stable category name -> slug mapping using toSlug
function catSlug(name: string) { return toSlug(name); }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORY_ORDER.find(c => catSlug(c) === slug);
  if (category) return { title: `${category} — ${VIDEO_SITE.copyrightName}`, description: `Free browser-based ${category} tools.`, alternates: { canonical: `/video/${slug}` } };
  const tool = TOOL_BY_SLUG[slug];
  if (tool) {
    // Upcoming tools keep a self-canonical and real copy; INDEX_SOON_PAGES
    // controls whether they are also indexable (domains/video/indexing.ts).
    if (hasComingSoonPage(tool, "video")) {
      return buildSoonMetadata(
        { tool, domainKey: "video", siteName: VIDEO_SITE.copyrightName, categoryName: tool.category, soonNameCounts: SOON_NAME_COUNTS },
        INDEX_SOON_PAGES,
      );
    }
    return { title: `${tool.name} — ${VIDEO_SITE.copyrightName}`, description: tool.description, alternates: { canonical: `/video/${slug}` } };
  }
  return { title: "Not Found — Racira" };
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const cat of CATEGORY_ORDER) params.push({ slug: catSlug(cat) });
  for (const tool of TOOLS) {
    if (isLiveTool(tool, "video")) params.push({ slug: tool.slug });
  }
  return params;
}

function CategoryView({ category }: { category: string }) {
  const catTools = TOOLS.filter(t => t.category === category);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-0">
          <nav aria-label="breadcrumb" className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href="/video" className="hover:text-foreground transition-colors">Video</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <span className="text-foreground font-medium">{category}</span>
          </nav>
        </div>
        <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">{category}</h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">Free browser-based {category} tools.</p>
          </div>
        </section>
        <div className="racira-page-container pb-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {catTools.map((tool: any) => {
              const Icon = tool.icon || inferIcon(tool.name, tool.slug);
              // Live tools open the real tool; upcoming tools open their Coming
              // Soon page (never a 404) — same decision the ToolCard makes.
              const isLive = isLiveTool(tool, "video");
              const clickable = isLive || hasComingSoonPage(tool, "video");
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
                <Link key={tool.slug} href={`/video/${tool.slug}`} className="tool-card group hover:-translate-y-[3px]">
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
  const category = CATEGORY_ORDER.find(c => catSlug(c) === slug);
  if (category) return <CategoryView category={category} />;

  const tool = TOOL_BY_SLUG[slug];

  // Upcoming tools render a Coming Soon page instead of 404ing.
  if (tool && hasComingSoonPage(tool, "video")) {
    const related = pickRelatedTools(TOOLS, {
      currentSlug: slug,
      basePath: "/video",
      isLive: (t) => isLiveTool(t, "video"),
      sameGroup: (t) => t.category === tool.category,
    });
    return (
      <ComingSoonToolPage
        toolName={tool.name}
        toolDescription={tool.description}
        icon={tool.icon}
        siteName={VIDEO_SITE.copyrightName}
        domainLabel="Video"
        domainHref="/video"
        categoryName={tool.category}
        categoryHref={`/video/${toSlug(tool.category)}`}
        relatedLive={related.live}
        relatedSoon={related.soon}
      />
    );
  }

  notFound();
}
