import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Construction, Sparkles } from "lucide-react";
import { categories, findTool } from "@/domains/education/registry";
import { toSlug } from "@/lib/utils/slug";
import { inferIcon } from "@/components/shared/icon-map";
import Header from "@/components/Header";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find(c => toSlug(c.name) === slug);
  if (category) return { title: `${category.name} — Racira Education`, description: `Free browser-based ${category.name} tools.`, alternates: { canonical: `/education/${slug}` } };
  const result = findTool(slug);
  if (result) return { title: `${result.tool.name} — Racira Education`, description: result.tool.description, alternates: { canonical: `/education/${slug}` } };
  return { title: "Not Found — Racira" };
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const cat of categories) {
    params.push({ slug: toSlug(cat.name) });
    for (const tool of cat.tools) params.push({ slug: tool.slug });
  }
  return params;
}

function CategoryView({ category }: { category: typeof categories[0] }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Education" />
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-0">
          <nav aria-label="breadcrumb" className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href="/education" className="hover:text-foreground transition-colors">Education</Link>
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
              return (
                <Link key={tool.slug} href={`/education/${tool.slug}`} className="tool-card group hover:-translate-y-[3px]">
                  <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground leading-snug">{tool.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

function ToolView({ tool, categoryName }: { tool: any; categoryName: string }) {
  const Cmp = tool.component;
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Education" />
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-16">
          <nav aria-label="breadcrumb" className="hidden md:flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href="/education" className="hover:text-foreground transition-colors">Education</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href={`/education/${toSlug(categoryName)}`} className="hover:text-foreground transition-colors">{categoryName}</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <span className="text-foreground font-medium">{tool.name}</span>
          </nav>
          <div className="mt-4 mb-6">
            <p className="text-xs uppercase tracking-wider text-primary font-medium">{categoryName}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{tool.name}</h1>
            <p className="mt-2 text-muted-foreground">{tool.description}</p>
          </div>
          {tool.status === "live" && Cmp ? (
            <div className="mt-10 rounded-xl border border-border bg-card p-4 sm:p-6 min-h-[400px]">
              {React.createElement(Cmp)}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-primary/30 bg-primary/10 p-10 text-center">
              <Construction className="mx-auto mb-4 h-10 w-10 text-primary" />
              <h2 className="text-xl font-semibold">Coming soon</h2>
              <Link href="/education" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                <Sparkles className="h-4 w-4" /> Browse all tools
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default async function PolymorphicPage({ params }: PageProps) {
  const { slug } = await params;
  const category = categories.find(c => toSlug(c.name) === slug);
  if (category) return <CategoryView category={category} />;
  const result = findTool(slug);
  if (result) return <ToolView tool={result.tool} categoryName={result.category.name} />;
  notFound();
}
