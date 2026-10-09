import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { categories, allTools, findTool } from "@/domains/writing/registry";
import { WRITING_SITE } from "@/domains/writing/site";
import { toSlug } from "@/lib/utils/slug";
import { isLiveTool } from "@/lib/tools/liveToolFilters";
import { hasComingSoonPage } from "@/lib/tools/comingSoonPage";
import { buildSoonMetadata } from "@/lib/tools/soonMetadata";
import { pickRelatedTools } from "@/lib/tools/soonRelated";
import { ComingSoonToolPage } from "@/components/shared/ComingSoonToolPage";
import { INDEX_SOON_PAGES } from "@/domains/writing/indexing";
import { inferIcon } from "@/components/shared/icon-map";
import Header from "@/components/Header";
import ToolPageHeader from "@/components/tools/shared/ToolPageHeader";
import SeoContent from "@/components/shared/SeoContent";
import { RelatedTools } from "@/domains/writing/components/related-tools";
import { WRITING_TOOL_COMPONENTS } from "@/domains/writing/components/tools/registry";
import { getToolSeo } from "@/domains/writing/registry/tool-seo";

type PageProps = { params: Promise<{ slug: string }> };
type WritingTool = (typeof categories)[number]["tools"][number];

/**
 * A registry `live` flag is only truthful when the slug has a component in
 * `WRITING_TOOL_COMPONENTS`. Both this page and the index page ask
 * `isLiveTool(tool, "writing")`, and the pre-push gate
 * `_scripts/writing-reconcile.mjs` fails if a live slug has no component — so a
 * live flag can never point at a 404.
 */
function hasComponent(slug: string): boolean {
  return Boolean(WRITING_TOOL_COMPONENTS[slug]);
}

/** Names repeated among this domain's upcoming tools — used to qualify labels. */
const SOON_NAME_COUNTS = (() => {
  const counts = new Map<string, number>();
  for (const tool of allTools) {
    if (tool.status === "live") continue;
    counts.set(tool.name, (counts.get(tool.name) ?? 0) + 1);
  }
  return counts;
})();

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const category = categories.find((c) => toSlug(c.name) === slug);
  if (category) {
    return {
      title: `${category.name} — ${WRITING_SITE.copyrightName}`,
      description: `Free browser-based ${category.name.toLowerCase()} tools. Everything runs in your browser — no signup required.`,
      alternates: { canonical: `/writing/${slug}` },
    };
  }

  const result = findTool(slug);
  if (result) {
    // Upcoming tools keep a self-canonical and real copy; INDEX_SOON_PAGES
    // controls whether they are also indexable (domains/writing/indexing.ts).
    if (hasComingSoonPage(result.tool, "writing")) {
      return buildSoonMetadata(
        { tool: result.tool, domainKey: "writing", siteName: WRITING_SITE.copyrightName, categoryName: result.category, soonNameCounts: SOON_NAME_COUNTS },
        INDEX_SOON_PAGES,
      );
    }
    return {
      title: `${result.tool.name} — ${WRITING_SITE.copyrightName}`,
      description: result.tool.description,
      alternates: { canonical: `/writing/${slug}` },
    };
  }

  return { title: "Not Found — Racira" };
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const category of categories) params.push({ slug: toSlug(category.name) });
  for (const tool of allTools) {
    if (isLiveTool(tool, "writing") && hasComponent(tool.slug)) params.push({ slug: tool.slug });
  }
  return params;
}

function CategoryView({ category }: { category: typeof categories[number] }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Writing" />
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-0">
          <nav aria-label="breadcrumb" className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href="/writing" className="hover:text-foreground transition-colors">
              Writing
            </Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>
        </div>
        <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">{category.name}</h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Free browser-based {category.name.toLowerCase()} tools.
            </p>
          </div>
        </section>
        <div className="racira-page-container pb-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {category.tools.map((tool: WritingTool) => {
              const Icon = tool.icon || inferIcon(tool.name, tool.slug);
              const isLive = isLiveTool(tool, "writing") && hasComponent(tool.slug);
              const clickable = isLive || hasComingSoonPage(tool, "writing");
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
                <Link key={tool.slug} href={`/writing/${tool.slug}`} className="tool-card group hover:-translate-y-[3px]">
                  {cardBody}
                </Link>
              ) : (
                <div key={tool.slug} className="tool-card group relative cursor-default hover:-translate-y-[3px]">
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

function ToolView({ tool, categoryName }: { tool: WritingTool; categoryName: string }) {
  const Component = WRITING_TOOL_COMPONENTS[tool.slug];
  // The tool definition carries its `seo` field; the authored block itself lives
  // in registry/tool-seo.ts so it never ships in a client bundle.
  const definition: WritingTool = { ...tool, seo: getToolSeo(tool.slug) };
  const seo = definition.seo;
  const categorySlug = toSlug(categoryName);

  // Mirrors the visual breadcrumb below, four levels deep, on flat URLs.
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: "Writing", item: "/writing" },
      { "@type": "ListItem", position: 3, name: categoryName, item: `/writing/${categorySlug}` },
      { "@type": "ListItem", position: 4, name: tool.name, item: `/writing/${tool.slug}` },
    ],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    url: `/writing/${tool.slug}`,
    description: tool.description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        id="writing-tool-breadcrumb-schema"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        id="writing-tool-software-schema"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <Header mode="category" categoryName="Writing" />
      <main className="flex-1">
        <ToolPageHeader
          breadcrumbItems={[
            { label: "Home", href: "/" },
            { label: "Writing", href: "/writing" },
            { label: categoryName, href: `/writing/${toSlug(categoryName)}` },
            { label: tool.name, href: null },
          ]}
          title={tool.name}
        />
        <div className="racira-page-container pb-16">
          <Component />
          {/* Related tools — a separate full-width row, not part of the SEO block. */}
          <RelatedTools currentSlug={tool.slug} category={categoryName} />
          {/* Editorial SEO block — full container width, unboxed, rendered by the
              shared component so the locked structure stays identical across
              domains. Link targets resolve against /writing. */}
          {seo && <SeoContent seo={seo} toolName={tool.name} basePath="/writing" />}
        </div>
      </main>
    </div>
  );
}

export default async function PolymorphicPage({ params }: PageProps) {
  const { slug } = await params;

  const category = categories.find((c) => toSlug(c.name) === slug);
  if (category) return <CategoryView category={category} />;

  const result = findTool(slug);
  if (result && isLiveTool(result.tool, "writing") && hasComponent(result.tool.slug)) {
    return <ToolView tool={result.tool} categoryName={result.category} />;
  }

  // Upcoming tools render a Coming Soon page instead of 404ing.
  if (result && hasComingSoonPage(result.tool, "writing")) {
    const related = pickRelatedTools(allTools, {
      currentSlug: slug,
      basePath: "/writing",
      isLive: (t) => isLiveTool(t, "writing") && hasComponent(t.slug),
      sameGroup: (t) => (t as any).category === result.category,
    });
    return (
      <ComingSoonToolPage
        toolName={result.tool.name}
        toolDescription={result.tool.description}
        icon={result.tool.icon}
        siteName={WRITING_SITE.copyrightName}
        domainLabel="Writing"
        domainHref="/writing"
        categoryName={result.category}
        categoryHref={`/writing/${toSlug(result.category)}`}
        relatedLive={related.live}
        relatedSoon={related.soon}
      />
    );
  }

  notFound();
}
