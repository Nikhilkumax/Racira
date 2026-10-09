import React, { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { inferIcon } from "@/components/shared/icon-map";
import { SubcategoryCard } from "@/components/shared/SubcategoryCard";
import { 
  DollarSign, 
  Briefcase, 
  Heart, 
  Calculator, 
  Atom, 
  Settings, 
  Cpu, 
  Leaf, 
  Clock, 
  Car, 
  HardHat, 
  GraduationCap,
  ChevronRight
} from "lucide-react";
import { calculatorRegistry } from "@/domains/calculator/registry";
import { canonicalSlug, isAliasSlug } from "@/domains/calculator/canonicalSlugs";
import { CALCULATOR_SITE } from "@/domains/calculator/site";
import { CATEGORY_SUMMARY } from "../summaryData";
import { toSlug } from "@/lib/utils/slug";
import { isLiveTool } from "@/lib/tools/liveToolFilters";
import { hasComingSoonPage } from "@/lib/tools/comingSoonPage";
import { INDEX_SOON_PAGES } from "@/domains/calculator/indexing";
import { CALCULATOR_STUB_SLUGS } from "@/lib/tools/calculatorStubSlugs";

// Full browsable scope — every registry calculator except stub-tagged entries
// (placeholder UI, hidden by design), deduplicated by slug. Category heroes and
// subcategory card counts use these so the numbers match the grids they lead to.
const calcKey = (c: any) => (c as any).slug || toSlug((c as any).name);
const STUB_SET = new Set<string>(CALCULATOR_STUB_SLUGS);
const seenSlugs = new Set<string>();
const FULL_SCOPE = calculatorRegistry.filter((t) => {
  const key = calcKey(t);
  if (STUB_SET.has(key)) return false;
  // Alias slugs (duplicate-content groups) render their canonical sibling —
  // exclude them so hero counts match the grids that list one card per tool.
  if (isAliasSlug(key)) return false;
  if (seenSlugs.has(key)) return false;
  seenSlugs.add(key);
  return true;
});
const fullCategoryCount = (cat: string) =>
  FULL_SCOPE.filter((t) => (t as any).category === cat).length;
const fullSubcategoryCount = (cat: string, sub: string) =>
  FULL_SCOPE.filter(
    (t) => (t as any).category === cat && ((t as any).subcategory || "General") === sub
  ).length;
import CalculatorSkeleton from "@/domains/calculator/components/ui/CalculatorSkeleton";
import { lazyComponents } from "@/app/calculator/lazyComponents";
import SearchCalculators from "@/components/SearchCalculators";
import { ClientGrid } from "./ClientGrid";
import ComingSoonView from "@/domains/calculator/components/ComingSoonView";

const categoryMap: Record<string, string> = {
  "FINANCE": "Finance",
  "BUSINESS": "Business",
  "HEALTH": "Health",
  "MATH": "Math",
  "SCIENCE": "Science",
  "ENGINEERING": "Engineering",
  "TECHNOLOGY": "Technology",
  "ENVIRONMENT": "Environment",
  "EVERYDAY_LIFE": "Everyday Life",
  "TRANSPORTATION": "Transportation",
  "CONSTRUCTION": "Construction",
  "EDUCATION": "Education"
};

const formatCategory = (cat: string) => {
  return categoryMap[cat.toUpperCase()] || cat;
};

const getCategoryIcon = (category: string) => {
  const upper = category.toUpperCase().replace(/ /g, '_');
  const icons: Record<string, any> = {
    "FINANCE": DollarSign,
    "BUSINESS": Briefcase,
    "HEALTH": Heart,
    "MATH": Calculator,
    "SCIENCE": Atom,
    "ENGINEERING": Settings,
    "TECHNOLOGY": Cpu,
    "ENVIRONMENT": Leaf,
    "EVERYDAY_LIFE": Clock,
    "TRANSPORTATION": Car,
    "CONSTRUCTION": HardHat,
    "EDUCATION": GraduationCap
  };
  return icons[upper] || Calculator;
};

interface Props {
  params: Promise<{ slug: string }>;
}

// Tool lookup that also resolves ALIAS slugs (duplicate-content groups and
// legacy rename aliases — see domains/calculator/canonicalSlugs.ts) to their
// canonical registry entry, so alias URLs render the canonical tool's page
// (same component, same name/breadcrumb) with a canonical tag instead of 404.
const findToolBySlug = (s: string) => {
  const canonical = canonicalSlug(s);
  if (canonical !== s) {
    const byCanonical = calculatorRegistry.find((t) => (t as any).slug === canonical);
    if (byCanonical) return byCanonical;
  }
  return calculatorRegistry.find(
    (t) => (t as any).slug === s || toSlug((t as any).name) === s
  );
};

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  
  // 1. Add category routes
  CATEGORY_SUMMARY.forEach(c => {
    params.push({ slug: toSlug(formatCategory(c.category)) });
  });

  // 2. Add subcategory routes
  CATEGORY_SUMMARY.forEach(c => {
    c.subcategories.forEach(sub => {
      params.push({ slug: toSlug(sub.name) });
    });
  });

  // 3. Add tool routes — only genuinely-live calculators (status live, not
  //    stub-tagged) get static pages; every live slug now has a wired component.
  calculatorRegistry.forEach(t => {
    const toolSlug = (t as any).slug || toSlug((t as any).name);
    if (!params.find(p => p.slug === toolSlug) && isLiveTool(t, "calculator")) {
      params.push({ slug: toolSlug });
    }
  });

  // Soon-status tools are NOT pre-rendered — they rely on on-demand
  // rendering via the Coming Soon route branch. This keeps the static
  // page count manageable at scale (~10k+ entries).

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  
  // Check if it's a category
  const summary = CATEGORY_SUMMARY.find(c => toSlug(formatCategory(c.category)) === resolvedParams.slug);
  if (summary) {
    const catName = formatCategory(summary.category);
    const title = `${catName} Calculators — ${CALCULATOR_SITE.copyrightName}`;
    const total = fullCategoryCount(summary.category);
    const description = `Browse ${total.toLocaleString()} free online ${catName.toLowerCase()} calculator${total === 1 ? "" : "s"}.`;
    const url = `https://racira.com/calculator/${resolvedParams.slug}`;
    return { title, description, alternates: { canonical: url } };
  }

  // Check if it's a subcategory
  for (const c of CATEGORY_SUMMARY) {
    const sub = c.subcategories.find(s => toSlug(s.name) === resolvedParams.slug);
    if (sub) {
      const title = `${sub.name} Calculators — ${CALCULATOR_SITE.copyrightName}`;
      const fullCount = fullSubcategoryCount(c.category, sub.name);
      const description = `Browse ${fullCount.toLocaleString()} free online ${sub.name.toLowerCase()} calculator${fullCount === 1 ? "" : "s"}.`;
      const url = `https://racira.com/calculator/${resolvedParams.slug}`;
      return { title, description, alternates: { canonical: url } };
    }
  }

  // Check if it's a tool (alias slugs resolve to their canonical entry)
  const tool = findToolBySlug(resolvedParams.slug);

  if (tool) {
    const toolSlug = (tool as any).slug || toSlug((tool as any).name);
    const title = `${tool.name} — Free Online Calculator`;
    const description = tool.description || `Free online ${tool.name}.`;
    // Aliases (duplicate-content groups + legacy rename aliases) canonicalize
    // to their canonical sibling's URL; canonical slugs self-reference.
    const canonicalUrlSlug = isAliasSlug(resolvedParams.slug) ? canonicalSlug(resolvedParams.slug) : toolSlug;
    const url = `https://racira.com/calculator/${canonicalUrlSlug}`;
    const meta: Metadata = { title, description, alternates: { canonical: url } };
    // Calculators that are not genuinely built (soon, or stub-tagged "live")
    // render the coming-soon template. They are browsable with a self-canonical;
    // whether they are also excluded from the index is controlled by
    // INDEX_SOON_PAGES (see domains/calculator/indexing.ts).
    if (!INDEX_SOON_PAGES && !isLiveTool(tool, "calculator")) {
      // Soon pages: noindex but follow (related-calc links should be crawled)
      meta.robots = { index: false, follow: true };
    }
    return meta;
  }

  return { title: "Not Found" };
}

// ==========================================
// CATEGORY VIEW
// ==========================================
function CategoryView({ summary }: { summary: any }) {
  const catName = formatCategory(summary.category);
  const Icon = getCategoryIcon(summary.category);

  return (
    <div className="flex flex-col">
      <div className="racira-page-container pt-3 pb-0">
        <nav aria-label="breadcrumb" className="md:hidden flex items-center mb-6">
          <Link href="/calculator" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            <span aria-hidden="true">←</span>Calculators
          </Link>
        </nav>
        <nav aria-label="breadcrumb" className="hidden md:flex items-center flex-wrap text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <Link href="/calculator" className="hover:text-foreground transition-colors">Calculators</Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <span className="text-foreground font-medium">{catName}</span>
        </nav>
      </div>

      <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
        <div className="racira-page-container text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-6">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            {catName} Calculators
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Browse {fullCategoryCount(summary.category).toLocaleString()} calculator{fullCategoryCount(summary.category) === 1 ? "" : "s"} across {summary.subcategories.length} subcategor{summary.subcategories.length === 1 ? "y" : "ies"}.
          </p>
          <SearchCalculators count={fullCategoryCount(summary.category)} category={summary.category} />
        </div>
      </section>

      <div className="racira-page-container pb-16 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.subcategories.map((sub: any) => {
            const subSlug = toSlug(sub.name);
            const SubIcon = inferIcon(sub.name, subSlug);
            return (
              <SubcategoryCard
                key={sub.name}
                title={sub.name}
                icon={SubIcon}
                count={fullSubcategoryCount(summary.category, sub.name)}
                basePath={`/calculator/${subSlug}`}
                label="calculators"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SUBCATEGORY VIEW
// ==========================================
function SubcategoryView({ parentCategory, subcategory, slug }: { parentCategory: any, subcategory: any, slug: string }) {
  const categoryName = parentCategory.category;
  const formattedCategoryName = formatCategory(categoryName);
  const categorySlug = toSlug(formattedCategoryName);

  // Every calculator in the subcategory is shown — soon tools carry the "Soon"
  // badge (via ClientGrid/ToolCard). Stub-tagged "live" calculators stay hidden:
  // they render broken/template UI and are excluded from the sitemap.
  const stubSlugs = new Set<string>(CALCULATOR_STUB_SLUGS);
  const seen = new Set<string>();
  const tools = calculatorRegistry.filter(t => {
    const tCatSlug = toSlug((t as any).category || "");
    const tSubSlug = toSlug(t.subcategory || "General");
    if (tCatSlug !== categorySlug || tSubSlug !== slug) return false;
    const key = (t as any).slug || toSlug((t as any).name);
    // Alias slugs (duplicate-content groups) render one card — the canonical one.
    if (isAliasSlug(key)) return false;
    if (stubSlugs.has(key)) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <div className="flex flex-col">
      <div className="racira-page-container pt-3 pb-0">
        <nav aria-label="breadcrumb" className="md:hidden flex items-center mb-6">
          <Link href={`/calculator/${categorySlug}`} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            <span aria-hidden="true">←</span>{formattedCategoryName}
          </Link>
        </nav>
        <nav aria-label="breadcrumb" className="hidden md:flex items-center flex-wrap text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <Link href="/calculator" className="hover:text-foreground transition-colors">Calculators</Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <Link href={`/calculator/${categorySlug}`} className="hover:text-foreground transition-colors">
            {formattedCategoryName}
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <span className="text-foreground font-medium">{subcategory.name}</span>
        </nav>
      </div>

      <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            {subcategory.name} Calculators
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Explore {tools.length.toLocaleString()} professional-grade calculator{tools.length === 1 ? "" : "s"} for {subcategory.name.toLowerCase()}.
          </p>
        </div>
      </section>

      <div className="racira-page-container pb-16 w-full">
        <ClientGrid 
          tools={tools.map(({ icon, ...rest }) => rest)} 
          subcategoryName={subcategory.name} 
          slug={slug} 
        />
      </div>
    </div>
  );
}

// ==========================================
// TOOL VIEW
// ==========================================
function ToolView({ slug, tool }: { slug: string, tool: any }) {
  const summary = CATEGORY_SUMMARY.find(c => toSlug(c.category) === toSlug(tool.category || ""));
  const categoryName = summary?.category || tool.category || "";
  const formattedCategoryName = formatCategory(categoryName);
  const categorySlug = toSlug(formattedCategoryName);

  const subcategoryName = tool.subcategory || "General";
  const subcategory = summary?.subcategories?.find((s: any) => toSlug(s.name) === toSlug(subcategoryName));
  const formattedSubcategoryName = subcategory?.name || subcategoryName;
  const subcategorySlug = toSlug(formattedSubcategoryName);

  const CalculatorComponent = lazyComponents[tool.slug || slug as keyof typeof lazyComponents];

  const breadcrumbItems = [
    { label: "Home",                    href: "/" },
    { label: "Calculators",             href: "/calculator" },
    { label: formattedCategoryName,     href: `/calculator/${categorySlug}` },
    { label: formattedSubcategoryName,  href: `/calculator/${subcategorySlug}` },
    { label: tool.name,                 href: null as string | null },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.label,
      ...(crumb.href ? { "item": `https://racira.com${crumb.href}` } : {}),
    })),
  };

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="racira-page-container pt-3 pb-0">
        <nav aria-label="breadcrumb" className="md:hidden flex items-center mb-6">
          <Link href={`/calculator/${subcategorySlug}`} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            <span aria-hidden="true">←</span>{formattedSubcategoryName}
          </Link>
        </nav>
        <nav aria-label="breadcrumb" className="hidden md:flex items-center flex-wrap text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <Link href="/calculator" className="hover:text-foreground transition-colors">Calculators</Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <Link href={`/calculator/${categorySlug}`} className="hover:text-foreground transition-colors">
            {formattedCategoryName}
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <Link href={`/calculator/${subcategorySlug}`} className="hover:text-foreground transition-colors">
            {formattedSubcategoryName}
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <span className="text-foreground font-medium">{tool.name}</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-1 mb-4">{tool.name}</h1>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .tool-wrapper nav[aria-label="Breadcrumb"],
        .tool-wrapper nav[aria-label="breadcrumb"] { display: none !important; }
        .tool-wrapper h1:first-of-type { display: none !important; }
        .tool-wrapper .racira-page-container { padding-top: 0 !important; padding-bottom: 0 !important; }
        .tool-wrapper .card-calculator {
          box-shadow: 0 4px 16px -4px hsl(222 47% 11% / 0.08), 0 1px 4px hsl(222 47% 11% / 0.04) !important;
          border: 1px solid hsl(var(--border)) !important;
          padding: 1rem !important;
        }
        @media (min-width: 640px) {
          .tool-wrapper .card-calculator {
            padding: 1.25rem !important;
          }
        }
      `}} />

      <div className="tool-wrapper">
        <Suspense fallback={<CalculatorSkeleton />}>
          <CalculatorComponent />
        </Suspense>
      </div>
    </div>
  );
}

// ==========================================
// POLYMORPHIC ENTRY POINT
// ==========================================
export default async function PolymorphicPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // 1. Is it a category?
  const summary = CATEGORY_SUMMARY.find(c => toSlug(formatCategory(c.category)) === slug);
  if (summary) {
    return <CategoryView summary={summary} />;
  }

  // 2. Is it a subcategory?
  for (const c of CATEGORY_SUMMARY) {
    const sub = c.subcategories.find(s => toSlug(s.name) === slug);
    if (sub) {
      return <SubcategoryView parentCategory={c} subcategory={sub} slug={slug} />;
    }
  }

  // 3. Is it a genuinely-live tool? Non-live (soon) and stub-tagged slugs 404.
  //    Alias slugs (duplicate-content groups + legacy renames) resolve to their
  //    canonical tool's page — same component, canonical tag points at the
  //    canonical URL (see findToolBySlug / canonicalSlugs.ts).
  const tool = findToolBySlug(slug);

  if (tool && isLiveTool(tool, "calculator")) {
    return <ToolView slug={slug} tool={tool} />;
  }

  // 4. Tools with a real Coming Soon page (all calculator categories)
  if (tool && hasComingSoonPage(tool, "calculator")) {
    return (
      <ComingSoonView
        tool={{
          slug: tool.slug,
          name: tool.name,
          category: (tool as any).category,
          subcategory: tool.subcategory || "General",
        }}
      />
    );
  }

  // 5. Not found
  notFound();
}
