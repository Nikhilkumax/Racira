import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Sparkles, Clock, ArrowLeft } from "lucide-react";
import { categories, tools, categorySlug, categoryFromSlug, type Tool } from "@/domains/developers/registry";
import { toSlug } from "@/lib/utils/slug";
import { isComingSoonToolPage, isLiveTool } from "@/lib/tools/liveToolFilters";
import { inferIcon } from "@/components/shared/icon-map";
import { ToolPageClient } from "@/components/developers/tools/tool-page-client";
import { getToolSeo } from "@/domains/developers/registry/tool-seo";
import SeoContent from "@/domains/developers/components/SeoContent";

type PageProps = { params: Promise<{ slug: string }> };

function findToolBySlug(slug: string) {
  return tools.find(t => t.slug === slug);
}

// Derive categories from the tools list
const categoryNames = Array.from(new Set(tools.map(t => t.category).filter(Boolean))) as string[];

function isCategorySlug(slug: string) {
  return categoryNames.some(c => categorySlug(c) === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const catName = categoryFromSlug(slug);
  if (catName) return { title: `${catName} — Racira Developers`, description: `Free browser-based ${catName} tools.`, alternates: { canonical: `/developers/${slug}` } };
  const tool = findToolBySlug(slug);
  if (tool) {
    if (tool.status === "soon") return { title: `${tool.name} — Coming Soon — Racira Developers`, description: `${tool.description} This tool is coming soon to Racira.`, robots: { index: false, follow: true } };
    return { title: `${tool.name} — Racira Developers`, description: tool.description, alternates: { canonical: `/developers/${slug}` } };
  }
  return { title: "Not Found — Racira" };
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  // All category pages
  for (const cat of categories) params.push({ slug: categorySlug(cat) });
  // All live tool pages (statically rendered for SEO + performance)
  for (const tool of tools) {
    if (isLiveTool(tool, "developers")) params.push({ slug: tool.slug });
  }
  // Soon tool pages are rendered on-demand via dynamic rendering
  return params;
}

function ComingSoonView({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-0">
          <nav aria-label="breadcrumb" className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href="/developers" className="hover:text-foreground transition-colors">Developers</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <span className="text-foreground font-medium">{tool.name}</span>
          </nav>
        </div>
        <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
          <div className="racira-page-container text-center max-w-2xl mx-auto">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" />
              Coming Soon
            </div>
            <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary mx-auto">
              <Icon className="h-8 w-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight text-foreground">
              {tool.name}
            </h1>
            <p className="text-base text-muted-foreground mb-8">
              {tool.description}
            </p>
            <div className="rounded-xl border border-border bg-card p-8 mb-8">
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">This tool is under development</h2>
              <p className="text-sm text-muted-foreground mb-6">
                We&apos;re working hard to bring you {tool.name.toLowerCase()}. Check back soon — it&apos;s one of our next releases.
              </p>
              <Link
                href="/developers"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Browse all developer tools
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function CategoryView({ catName }: { catName: string }) {
  const catTools = tools.filter(t => t.category === catName);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-0">
          <nav aria-label="breadcrumb" className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href="/developers" className="hover:text-foreground transition-colors">Developers</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <span className="text-foreground font-medium">{catName}</span>
          </nav>
        </div>
        <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">{catName}</h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">{catTools.length} free browser-based {catName.toLowerCase()} tool{catTools.length === 1 ? "" : "s"}.</p>
          </div>
        </section>
        <div className="racira-page-container pb-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {catTools.map((tool: any) => {
              const Icon = tool.icon || inferIcon(tool.name, tool.slug);
              const isLive = isLiveTool(tool, "developers");
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
              return (
                <Link key={tool.slug} href={`/developers/${tool.slug}`} className="tool-card group hover:-translate-y-[3px]">
                  {cardBody}
                </Link>
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

  // Category route
  const catName = categoryFromSlug(slug);
  if (catName) return <CategoryView catName={catName} />;

  // Tool route — resolve from the registry
  const tool = findToolBySlug(slug);
  if (!tool) notFound();

  // Soon tools show a Coming Soon page — noindexed
  // In dev mode, tools with real implementations still render the working
  // ToolPageClient so they can be tested before being promoted to live.
  if (tool.status === "soon") {
    return <ComingSoonView tool={tool} />;
  }

  // Live tools render the real, working tool UI
  const relatedTools = tools
    .filter(t => t.category === tool.category && t.slug !== tool.slug)
    .slice(0, 8)
    .map(({ icon: _icon, ...rest }) => rest as any); // strip icon (function) for client boundary

  const seo = getToolSeo(slug);

  return (
    <>
      <ToolPageClient
        tool={{ ...tool, icon: null as any }} // strip icon (function) for client boundary
        categoryName={tool.category}
        relatedTools={relatedTools}
      />
      {seo && (
        <div className="racira-page-container pb-16">
          <SeoContent seo={seo} />
        </div>
      )}
    </>
  );
}
