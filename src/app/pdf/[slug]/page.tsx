import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Sparkles, Clock, ArrowLeft } from "lucide-react";
import { tools, type Tool } from "@/domains/pdf/registry/tools";
import { PDF_SITE } from "@/domains/pdf/site";
import { INDEX_SOON_PAGES } from "@/domains/pdf/indexing";
import { IMPLEMENTED_SLUGS } from "@/domains/pdf/registry/implementedSlugs";
import { toSlug } from "@/lib/utils/slug";

// Dynamic imports for client-side ToolPage
import ToolPage from "@/domains/pdf/tools/ToolPage";

type PageProps = { params: Promise<{ slug: string }> };

// Derive categories (subCategories) from the tools list
const subcategoryNames = Array.from(new Set(tools.map(t => t.subCategory).filter(Boolean))) as string[];
const toolBySlug = new Map(tools.map(t => [t.slug, t]));

// ── Soon-page copy ────────────────────────────────────────────────────────
// Many soon tools carry the same placeholder description in the registry
// ("Free, private, and secure PDF tool."). Rendering it verbatim gave ~72
// pages an identical meta description, so each soon page gets copy derived
// from its own registry fields instead (name, subCategory, description).
const PLACEHOLDER_DESCRIPTIONS = new Set([
  "Free, private, and secure PDF tool.",
  "Upcoming PDF tool",
]);

// Slug tokens that stay uppercase when a slug is humanised for disambiguation.
const SLUG_ACRONYMS = new Set([
  "pdf", "ocr", "svg", "csv", "xml", "html", "rtf", "zip", "ai", "xps",
  "heic", "webp", "bmp", "png", "tiff", "mobi", "fb2", "ocg", "url",
  "json", "epub", "tts", "gif", "jpg", "jpeg",
]);

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .map(w => (SLUG_ACRONYMS.has(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

// Only needed when several soon tools share a name (e.g. "PDF OCR", which is
// both `ocr` and `ocr-pdf`), so their titles/descriptions can be told apart.
const soonNameCounts = new Map<string, number>();
for (const t of tools) {
  if (t.status === "soon") soonNameCounts.set(t.name, (soonNameCounts.get(t.name) ?? 0) + 1);
}
const REPEATED_SOON_NAMES = new Set(
  [...soonNameCounts].filter(([, count]) => count > 1).map(([n]) => n)
);

function soonLabel(tool: Tool): string {
  if (!REPEATED_SOON_NAMES.has(tool.name)) return tool.name;
  const group = tools.filter(t => t.status === "soon" && t.name === tool.name);
  const subCategoryDistinguishes =
    group.filter(t => t.subCategory === tool.subCategory).length === 1;
  return `${tool.name} (${subCategoryDistinguishes ? tool.subCategory : humanizeSlug(tool.slug)})`;
}

function soonTitle(tool: Tool): string {
  return `${soonLabel(tool)} — Coming Soon — ${PDF_SITE.copyrightName}`;
}

/** 120-160 char meta description built per tool; never the shared placeholder. */
function soonDescription(tool: Tool): string {
  const label = soonLabel(tool);
  const sub = (tool.subCategory ?? "PDF").toLowerCase();
  const raw = tool.description.trim();
  const generic = PLACEHOLDER_DESCRIPTIONS.has(raw);
  const action = generic ? `a browser-based ${sub} tool` : raw.replace(/\.$/, "");
  const opener = generic ? `${label} is ${action}` : `${label}: ${action}`;
  const tail = `${label} is coming soon to Racira.`;
  const privacy = "Free and private — the file never leaves your device.";
  const toolkit = `Part of our ${sub} toolkit.`;
  const candidates = [
    `${opener}. ${privacy} ${toolkit} ${tail}`,
    `${opener}. ${privacy} ${tail}`,
    `${opener}. ${toolkit} ${tail}`,
    `${opener}. ${tail}`,
  ];
  let description = candidates.find(c => c.length <= 160) ?? candidates[candidates.length - 1];
  if (description.length > 160) {
    // Long name + long registry description: trim the action at a word boundary.
    const budget = Math.max(0, 160 - label.length - 6 - tail.length);
    const trimmed = action.slice(0, budget).replace(/\s+\S*$/, "") || action;
    description = generic ? `${label} is ${trimmed}. ${tail}` : `${label}: ${trimmed}. ${tail}`;
  }
  return description;
}

function isSubcategory(slug: string) {
  return subcategoryNames.some(s => toSlug(s) === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (isSubcategory(slug)) {
    const catName = subcategoryNames.find(s => toSlug(s) === slug)!;
    return { title: `${catName} — ${PDF_SITE.copyrightName}`, description: `Free browser-based ${catName} PDF tools.`, alternates: { canonical: `/pdf/${slug}` } };
  }
  const tool = toolBySlug.get(slug);
  if (tool) {
    // Soon tools get real titles and a self-referencing canonical; whether they
    // are excluded from the index is controlled by INDEX_SOON_PAGES
    // (see domains/pdf/indexing.ts).
    if (tool.status === 'soon') {
      const meta: Metadata = {
        title: soonTitle(tool),
        description: soonDescription(tool),
        alternates: { canonical: `/pdf/${slug}` },
      };
      if (!INDEX_SOON_PAGES) meta.robots = { index: false, follow: true };
      return meta;
    }
    return { title: `${tool.name} — ${PDF_SITE.copyrightName}`, description: tool.description, alternates: { canonical: `/pdf/${slug}` } };
  }
  return { title: "Not Found — Racira" };
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const cat of subcategoryNames) params.push({ slug: toSlug(cat) });
  for (const tool of tools) params.push({ slug: tool.slug });
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
            <Link href="/pdf" className="hover:text-foreground transition-colors">PDF</Link>
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
                href="/pdf"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Browse all PDF tools
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
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
              return (
                <Link key={tool.slug} href={`/pdf/${tool.slug}`} className="tool-card group hover:-translate-y-[3px]">
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

  // Subcategory route
  if (isSubcategory(slug)) {
    const catName = subcategoryNames.find(s => toSlug(s) === slug)!;
    return <SubcategoryView catName={catName} />;
  }

  // Tool route — delegate to existing ToolPage client component
  const tool = toolBySlug.get(slug);
  if (!tool) notFound();

  // Soon tools show a coming-soon page — but in dev mode, tools with real
  // implementations still render the working ToolPage so they can be tested.
  // Stubs (engine_tag="none") show ComingSoonView in both dev and prod.
  const isStub = !IMPLEMENTED_SLUGS.has(slug);
  if (tool.status === 'soon' && (isStub || process.env.NODE_ENV !== 'development')) {
    return <ComingSoonView tool={tool} />;
  }

  return <ToolPage />;
}
