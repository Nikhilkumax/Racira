import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { categories, TOOLS_BY_SLUG } from "@/domains/audio/registry";
import { AUDIO_SITE } from "@/domains/audio/site";
import { toSlug } from "@/lib/utils/slug";
import { isComingSoonToolPage, isLiveTool } from "@/lib/tools/liveToolFilters";
import { SubcategoryCard } from "@/components/shared/SubcategoryCard";
import { inferIcon } from "@/components/shared/icon-map";
import Header from "@/components/Header";
import ToolPageHeader from "@/components/tools/shared/ToolPageHeader";
import { ToolRenderer } from "@/domains/audio/components/tools/ToolRenderer";
import { hasAudioToolImplementation } from "@/domains/audio/components/tools/implemented";

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
      title: `${category.name} — ${AUDIO_SITE.copyrightName}`,
      description: `Explore free tools for ${category.name} directly in your browser.`,
      alternates: {
        canonical: `/audio/${slug}`,
      },
    };
  }

  // 2. Check Tool
  const tool = TOOLS_BY_SLUG.get(slug);
  if (tool) {
    return {
      title: `${tool.name} — ${AUDIO_SITE.copyrightName}`,
      description: tool.description,
      alternates: {
        canonical: `/audio/${tool.slug}`,
      },
      robots:
        isComingSoonToolPage(tool, "audio") || !hasAudioToolImplementation(tool.slug)
          ? { index: false, follow: false }
          : undefined,
    };
  }

  return { title: "Not Found — Racira" };
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  
  for (const cat of categories) {
    params.push({ slug: toSlug(cat.name) });
    for (const tool of cat.tools) {
      if (tool.status === "live" && hasAudioToolImplementation(tool.slug)) {
        params.push({ slug: tool.slug });
      }
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
      <Header mode="category" categoryName="Audio" />
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-0">
          <nav aria-label="breadcrumb" className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href="/audio" className="hover:text-foreground transition-colors">Audio</Link>
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
                  basePath={`/audio/${tool.slug}`}
                  label="tool"
                  soon={!(tool.status === "live" && hasAudioToolImplementation(tool.slug))}
                />
              );
            })}
          </div>
        </div>
      </main>
      <footer className="border-t border-border py-8 mt-auto">
        <div className="racira-page-container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Racira Audio — Free browser tools for audio workflows.
        </div>
      </footer>
    </div>
  );
}

function ToolView({ tool, category }: { tool: any, category: typeof categories[0] }) {
  const categorySlug = toSlug(category.name);

  // Mirrors the visual breadcrumb below, four levels deep, on flat URLs.
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: "Audio", item: "/audio" },
      { "@type": "ListItem", position: 3, name: category.name, item: `/audio/${categorySlug}` },
      { "@type": "ListItem", position: 4, name: tool.name, item: `/audio/${tool.slug}` },
    ],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    url: `/audio/${tool.slug}`,
    description: tool.description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  // Only emitted for tools that actually declare FAQ entries in the registry.
  const faqSchema = tool.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: tool.faq.map((f: { q: string; a: string }) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        id="audio-tool-breadcrumb-schema"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        id="audio-tool-software-schema"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          id="audio-tool-faq-schema"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <Header mode="category" categoryName="Audio" />
      <main className="flex-1">
        <ToolPageHeader
          breadcrumbItems={[
            { label: "Home", href: "/" },
            { label: "Audio", href: "/audio" },
            { label: category.name, href: `/audio/${categorySlug}` },
            { label: tool.name, href: null },
          ]}
          title={tool.name}
        />
        <div className="racira-page-container pb-16">

          <ToolRenderer slug={tool.slug} />

          {Boolean(tool.howTo?.length || tool.faq?.length) && (
            <section className="mt-12 space-y-6">
              {tool.howTo?.length ? (
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    How to use {tool.name}
                  </h2>
                  <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                    {tool.howTo.map((step: { text: string }, i: number) => (
                      <li key={i}>{step.text}</li>
                    ))}
                  </ol>
                </div>
              ) : null}

              {tool.faq?.length ? (
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    Frequently asked questions
                  </h2>
                  <div className="mt-3 space-y-4">
                    {tool.faq.map((item: { q: string; a: string }, i: number) => (
                      <div key={i} className="rounded-xl border border-border bg-card p-4">
                        <h3 className="text-sm font-semibold text-foreground">{item.q}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          )}
        </div>
      </main>
      <footer className="border-t border-border py-8 mt-auto">
        <div className="racira-page-container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Racira Audio — Free browser tools for audio workflows.
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

  // 2. Is it a genuinely-live tool?
  const tool = TOOLS_BY_SLUG.get(slug);
  if (tool && tool.status === "live" && hasAudioToolImplementation(tool.slug)) {
    const parentCategory = categories.find(c => c.name === tool.category);
    return <ToolView tool={tool} category={parentCategory!} />;
  }

  // 3. Not found
  notFound();
}
