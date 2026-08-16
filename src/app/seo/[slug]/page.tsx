import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { CATEGORIES, TOOL_BY_SLUG } from "@/domains/seo/registry";
import { toSlug } from "@/lib/utils/slug";
import { isComingSoonToolPage, isLiveTool } from "@/lib/tools/liveToolFilters";
import { inferIcon } from "@/components/shared/icon-map";
import Header from "@/components/Header";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find(c => (c as any).slug === slug);
  if (category) return { title: `${(category as any).category} — Racira SEO`, description: `Free browser-based ${(category as any).category} tools.`, alternates: { canonical: `/seo/${slug}` } };
  const tool = TOOL_BY_SLUG.get(slug);
  if (tool) return { title: `${(tool as any).name} — Racira SEO`, description: (tool as any).description, alternates: { canonical: `/seo/${slug}` }, robots: isComingSoonToolPage(tool, "seo") ? { index: false, follow: false } : undefined };
  return { title: "Not Found — Racira" };
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const cat of CATEGORIES) params.push({ slug: (cat as any).slug });
  for (const [slug, tool] of TOOL_BY_SLUG) {
    if (isLiveTool(tool, "seo")) params.push({ slug });
  }
  return params;
}

function CategoryView({ category }: { category: any }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="SEO" />
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-0">
          <nav aria-label="breadcrumb" className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href="/seo" className="hover:text-foreground transition-colors">SEO</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <span className="text-foreground font-medium">{category.category}</span>
          </nav>
        </div>
        <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">{category.category}</h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">Free browser-based {category.category} tools.</p>
          </div>
        </section>
        <div className="racira-page-container pb-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {category.tools.map((tool: any) => {
              const Icon = tool.icon || inferIcon(tool.name, tool.slug);
              // No SEO tool page renders a real tool — every card is inert.
              const isLive = isLiveTool(tool, "seo");
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
              return isLive ? (
                <Link key={tool.slug} href={`/seo/${tool.slug}`} className="tool-card group hover:-translate-y-[3px]">
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
  const category = CATEGORIES.find(c => (c as any).slug === slug);
  if (category) return <CategoryView category={category} />;
  // No SEO tool page renders a real tool — every tool slug 404s.
  notFound();
}
