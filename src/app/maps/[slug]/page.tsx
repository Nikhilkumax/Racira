import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Construction, Sparkles } from "lucide-react";
import { sections, getMapToolBySlug } from "@/domains/maps/registry";
import { toSlug } from "@/lib/utils/slug";
import { inferIcon } from "@/components/shared/icon-map";
import Header from "@/components/Header";
import ToolPageHeader from "@/components/tools/shared/ToolPageHeader";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const section = sections.find(s => toSlug(s.title) === slug);
  if (section) return { title: `${section.title} — Racira Maps`, description: `Free browser-based ${section.title} tools.`, alternates: { canonical: `/maps/${slug}` } };
  const tool = getMapToolBySlug(slug);
  if (tool) return { title: `${tool.name} — Racira Maps`, description: tool.description, alternates: { canonical: `/maps/${slug}` } };
  return { title: "Not Found — Racira" };
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const section of sections) {
    params.push({ slug: toSlug(section.title) });
    for (const tool of section.tools) params.push({ slug: tool.slug });
  }
  return params;
}

function CategoryView({ section }: { section: typeof sections[0] }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Maps" />
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-0">
          <nav aria-label="breadcrumb" className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href="/maps" className="hover:text-foreground transition-colors">Maps</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <span className="text-foreground font-medium">{section.title}</span>
          </nav>
        </div>
        <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">{section.title}</h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">Free browser-based {section.title} tools.</p>
          </div>
        </section>
        <div className="racira-page-container pb-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {section.tools.map((tool: any) => {
              const Icon = tool.icon || inferIcon(tool.name, tool.slug);
              return (
                <Link key={tool.slug} href={`/maps/${tool.slug}`} className="tool-card group hover:-translate-y-[3px]">
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

function ToolView({ tool, sectionTitle }: { tool: any; sectionTitle: string }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Maps" />
      <main className="flex-1">
        <ToolPageHeader
          breadcrumbItems={[
            { label: "Home", href: "/" },
            { label: "Maps", href: "/maps" },
            { label: sectionTitle, href: `/maps/${toSlug(sectionTitle)}` },
            { label: tool.name, href: null },
          ]}
          title={tool.name}
        />
        <div className="racira-page-container pb-16">
          <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/10 p-10 text-center">
            <Construction className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h2 className="text-xl font-semibold">Coming soon</h2>
            <Link href="/maps" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              <Sparkles className="h-4 w-4" /> Browse all tools
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default async function PolymorphicPage({ params }: PageProps) {
  const { slug } = await params;
  const section = sections.find(s => toSlug(s.title) === slug);
  if (section) return <CategoryView section={section} />;
  const tool = getMapToolBySlug(slug);
  if (tool) {
    const parentSection = sections.find(s => s.tools.some((t: any) => t.slug === slug));
    return <ToolView tool={tool} sectionTitle={parentSection?.title ?? "Maps"} />;
  }
  notFound();
}
