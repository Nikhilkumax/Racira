import React, { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Calculator } from "lucide-react";
import { calculatorRegistry } from "@/data/calculatorRegistry";
import { CATEGORY_SUMMARY } from "../../summaryData";
import { toSlug } from "@/lib/utils/slug";
import CalculatorSkeleton from "@/components/calculators/CalculatorSkeleton";
import ComingSoonCalculator from "@/components/calculators/ComingSoonCalculator";
import { lazyComponents } from "@/app/calculator/lazyComponents";

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

interface Props {
  params: { category: string; slug: string };
}

export async function generateStaticParams() {
  const params: { category: string; slug: string }[] = [];
  
  // 1. Add subcategory routes
  CATEGORY_SUMMARY.forEach(c => {
    const catSlug = toSlug(c.category);
    c.subcategories.forEach(sub => {
      params.push({ category: catSlug, slug: toSlug(sub.name) });
    });
  });

  // 2. Add tool routes
  calculatorRegistry.forEach(t => {
    if (t.category) {
      const catSlug = toSlug(t.category);
      const toolSlug = t.slug || toSlug(t.name);
      // Avoid duplicate slugs (if tool slug matches subcategory slug)
      if (!params.find(p => p.category === catSlug && p.slug === toolSlug)) {
        params.push({ category: catSlug, slug: toolSlug });
      }
    }
  });
  
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const summary = CATEGORY_SUMMARY.find(c => toSlug(c.category) === params.category);
  if (!summary) return { title: "Not Found" };

  // Check if it's a subcategory
  const sub = summary.subcategories.find(s => toSlug(s.name) === params.slug);
  if (sub) {
    const title = `${sub.name} Calculators — Racira`;
    const description = `Browse ${sub.count} free online ${sub.name.toLowerCase()} calculators.`;
    const url = `https://racira.com/calculator/${params.category}/${params.slug}`;
    return { title, description, alternates: { canonical: url } };
  }

  // Check if it's a tool
  const tool = calculatorRegistry.find(t => 
    toSlug(t.category || "") === params.category && 
    (t.slug === params.slug || toSlug(t.name) === params.slug)
  );

  if (tool) {
    const title = `${tool.name} — Free Online Calculator`;
    const description = tool.description || `Free online ${tool.name}.`;
    const url = `https://racira.com/calculator/${params.category}/${params.slug}`;
    return { title, description, alternates: { canonical: url } };
  }

  return { title: "Not Found" };
}

// SUBCATEGORY VIEW
function SubcategoryView({ params, summary, sub }: { params: any, summary: any, sub: any }) {
  // Filter tools for this subcategory
  const tools = calculatorRegistry.filter(t => {
    const tCatSlug = toSlug(t.category || "");
    const tSubSlug = toSlug(t.subcategory || "General");
    return tCatSlug === params.category && tSubSlug === params.slug;
  });

  const categoryName = summary.category;
  const formattedCategoryName = categoryMap[categoryName.toUpperCase()] || categoryName;

  return (
    <div className="flex flex-col">
      <div className="container-page pt-3 pb-0">
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <Link href="/calculator" className="hover:text-foreground transition-colors">Calculators</Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <Link href={`/calculator/${params.category}`} className="hover:text-foreground transition-colors">
            {formattedCategoryName}
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <span className="text-foreground font-medium">{sub.name}</span>
        </nav>
      </div>

      <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            {sub.name} Calculators
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Explore {tools.length} professional-grade calculators for {sub.name.toLowerCase()}.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool: any) => {
            const toolSlug = tool.slug || toSlug(tool.name);
            return (
              <Link
                key={toolSlug}
                href={`/calculator/${params.category}/${toolSlug}`}
                className="tool-card group hover:cursor-pointer hover:shadow-md transition-all duration-200 flex items-start p-4 border border-border rounded-xl bg-card"
              >
                <div className="tool-card-icon mr-4 mt-1 bg-primary/10 p-2 rounded-lg">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-foreground text-[15px] leading-snug mb-1">
                    {tool.name}
                  </h4>
                  <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
                    {tool.description || "Free online calculator."}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// TOOL VIEW
function ToolView({ params, tool, summary }: { params: any, tool: any, summary: any }) {
  const categoryName = summary?.category || tool.category || "";
  const formattedCategoryName = categoryMap[categoryName.toUpperCase()] || categoryName;

  const subcategoryName = tool.subcategory || "General";

  // Find subcategory from summary to get the accurate display name
  const subcategory = summary?.subcategories?.find((s: any) => toSlug(s.name) === toSlug(subcategoryName));
  const formattedSubcategoryName = subcategory?.name || subcategoryName;
  const subcategorySlug = toSlug(formattedSubcategoryName);

  const CalculatorComponent = lazyComponents[tool.slug || params.slug as keyof typeof lazyComponents];

  // Build breadcrumb items — subcategory comes from tool data record, NOT the URL
  const breadcrumbItems = [
    { label: "Home",                    href: "/" },
    { label: "Calculators",             href: "/calculator" },
    { label: formattedCategoryName,     href: `/calculator/${params.category}` },
    { label: formattedSubcategoryName,  href: `/calculator/${params.category}/${subcategorySlug}` },
    { label: tool.name,                 href: null as string | null },
  ];

  // JSON-LD BreadcrumbList for Google rich snippets
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
      {/* BreadcrumbList structured data — consumed by Google, not visible to users */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="container-page pt-3 pb-0">
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <Link href="/calculator" className="hover:text-foreground transition-colors">Calculators</Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <Link href={`/calculator/${params.category}`} className="hover:text-foreground transition-colors">
            {formattedCategoryName}
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <Link href={`/calculator/${params.category}/${subcategorySlug}`} className="hover:text-foreground transition-colors">
            {formattedSubcategoryName}
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <span className="text-foreground font-medium">{tool.name}</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-1 mb-4">{tool.name}</h1>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .tool-wrapper nav[aria-label="Breadcrumb"] { display: none !important; }
        .tool-wrapper h1:first-of-type { display: none !important; }
        .tool-wrapper .container-page { padding-top: 0 !important; padding-bottom: 0 !important; }
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
        {!tool.isBuilt || !CalculatorComponent ? (
          <ComingSoonCalculator slug={tool.slug || params.slug} />
        ) : (
          <Suspense fallback={<CalculatorSkeleton />}>
            <CalculatorComponent />
          </Suspense>
        )}
      </div>
    </div>
  );
}

export default function PolymorphicPage({ params }: Props) {
  const summary = CATEGORY_SUMMARY.find(c => toSlug(c.category) === params.category);
  
  if (!summary) notFound();

  // 1. Is it a subcategory?
  const sub = summary.subcategories.find(s => toSlug(s.name) === params.slug);
  if (sub) {
    return <SubcategoryView params={params} summary={summary} sub={sub} />;
  }

  // 2. Is it a tool?
  const tool = calculatorRegistry.find(t => 
    toSlug(t.category || "") === params.category && 
    (t.slug === params.slug || toSlug(t.name) === params.slug)
  );

  if (tool) {
    return <ToolView params={params} tool={tool} summary={summary} />;
  }

  // 3. Not found
  notFound();
}
