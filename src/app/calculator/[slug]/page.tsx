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
import { CATEGORY_SUMMARY } from "../summaryData";
import { toSlug } from "@/lib/utils/slug";
import CalculatorSkeleton from "@/domains/calculator/components/ui/CalculatorSkeleton";
import ComingSoonCalculator from "@/domains/calculator/components/ui/ComingSoonCalculator";
import { lazyComponents } from "@/app/calculator/lazyComponents";
import SearchCalculators from "@/components/SearchCalculators";
import { ClientGrid } from "./ClientGrid";

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

  // 3. Add tool routes
  calculatorRegistry.forEach(t => {
    const toolSlug = (t as any).slug || toSlug((t as any).name);
    if (!params.find(p => p.slug === toolSlug)) {
      params.push({ slug: toolSlug });
    }
  });

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  
  // Check if it's a category
  const summary = CATEGORY_SUMMARY.find(c => toSlug(formatCategory(c.category)) === resolvedParams.slug);
  if (summary) {
    const catName = formatCategory(summary.category);
    const title = `${catName} Calculators — Racira`;
    const description = `Browse ${summary.total} free online ${catName.toLowerCase()} calculators.`;
    const url = `https://racira.com/calculator/${resolvedParams.slug}`;
    return { title, description, alternates: { canonical: url } };
  }

  // Check if it's a subcategory
  for (const c of CATEGORY_SUMMARY) {
    const sub = c.subcategories.find(s => toSlug(s.name) === resolvedParams.slug);
    if (sub) {
      const title = `${sub.name} Calculators — Racira`;
      const description = `Browse ${sub.count} free online ${sub.name.toLowerCase()} calculators.`;
      const url = `https://racira.com/calculator/${resolvedParams.slug}`;
      return { title, description, alternates: { canonical: url } };
    }
  }

  // Check if it's a tool
  const tool = calculatorRegistry.find(t => 
    ((t as any).slug === resolvedParams.slug || toSlug((t as any).name) === resolvedParams.slug)
  );

  if (tool) {
    const title = `${tool.name} — Free Online Calculator`;
    const description = tool.description || `Free online ${tool.name}.`;
    const url = `https://racira.com/calculator/${resolvedParams.slug}`;
    return { title, description, alternates: { canonical: url } };
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
            Explore {summary.total} professional-grade {catName.toLowerCase()} calculators and tools.
          </p>
          <SearchCalculators />
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
                count={sub.count}
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

  const tools = calculatorRegistry.filter(t => {
    const tCatSlug = toSlug((t as any).category || "");
    const tSubSlug = toSlug(t.subcategory || "General");
    return tCatSlug === categorySlug && tSubSlug === slug;
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
            Explore {tools.length} professional-grade calculators for {subcategory.name.toLowerCase()}.
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
        {tool.status === "soon" || !CalculatorComponent ? (
          <ComingSoonCalculator slug={tool.slug || slug} />
        ) : (
          <Suspense fallback={<CalculatorSkeleton />}>
            <CalculatorComponent />
          </Suspense>
        )}
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

  // 3. Is it a tool?
  const tool = calculatorRegistry.find(t => 
    ((t as any).slug === slug || toSlug((t as any).name) === slug)
  );

  if (tool) {
    return <ToolView slug={slug} tool={tool} />;
  }

  // 4. Not found
  notFound();
}
