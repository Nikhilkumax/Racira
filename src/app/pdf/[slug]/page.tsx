import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Sparkles } from "lucide-react";
import { tools } from "@/domains/pdf/registry/tools";
import { toSlug } from "@/lib/utils/slug";

// Dynamic imports for client-side ToolPage
import ToolPage from "@/domains/pdf/tools/ToolPage";

type PageProps = { params: Promise<{ slug: string }> };

// Derive categories (subCategories) from the tools list
const subcategoryNames = Array.from(new Set(tools.map(t => t.subCategory).filter(Boolean))) as string[];
const toolBySlug = new Map(tools.map(t => [t.slug, t]));

function isSubcategory(slug: string) {
  return subcategoryNames.some(s => toSlug(s) === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (isSubcategory(slug)) {
    const catName = subcategoryNames.find(s => toSlug(s) === slug)!;
    return { title: `${catName} — Racira PDF`, description: `Free browser-based ${catName} PDF tools.`, alternates: { canonical: `/pdf/${slug}` } };
  }
  const tool = toolBySlug.get(slug);
  if (tool) {
    // Soon tools should not have canonical URLs or indexable metadata
    if (tool.status === 'soon') return { title: "Not Found — Racira", robots: { index: false, follow: false } };
    return { title: `${tool.name} — Racira PDF`, description: tool.description, alternates: { canonical: `/pdf/${slug}` } };
  }
  return { title: "Not Found — Racira" };
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const cat of subcategoryNames) params.push({ slug: toSlug(cat) });
  for (const tool of tools) params.push({ slug: tool.slug });
  return params;
}

function SubcategoryView({ catName }: { catName: string }) {
  const catTools = tools.filter(t => t.subCategory === catName);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-0">
          <nav aria-label="breadcrumb" className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href="/pdf" className="hover:text-foreground transition-colors">PDF</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <span className="text-foreground font-medium">{catName}</span>
          </nav>
        </div>
        <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">{catName}</h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">{catTools.length} free browser-based {catName} tool{catTools.length === 1 ? "" : "s"}.</p>
          </div>
        </section>
        <div className="racira-page-container pb-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {catTools.map(tool => {
              const Icon = tool.icon;
              const isLive = tool.status === "live";
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
                <Link key={tool.slug} href={`/pdf/${tool.slug}`} className="tool-card group hover:-translate-y-[3px]">
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

  // Subcategory route
  if (isSubcategory(slug)) {
    const catName = subcategoryNames.find(s => toSlug(s) === slug)!;
    return <SubcategoryView catName={catName} />;
  }

  // Tool route — delegate to existing ToolPage client component
  const tool = toolBySlug.get(slug);
  if (!tool) notFound();

  // Soon tools should not resolve to a live page
  if (tool.status === 'soon') notFound();

  return <ToolPage />;
}
