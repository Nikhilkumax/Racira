import React, { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { calculatorRegistry } from "@/data/calculatorRegistry";
import { CATEGORY_SUMMARY } from "../../../summaryData";
import { toSlug } from "@/lib/utils/slug";
import CalculatorSkeleton from "@/components/calculators/CalculatorSkeleton";
import ComingSoonCalculator from "@/components/calculators/ComingSoonCalculator";
import { lazyComponents } from "@/app/calculator/lazyComponents";

interface Props {
  params: { category: string; subcategory: string; tool: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = calculatorRegistry.find(t => 
    toSlug(t.category || "") === params.category && 
    toSlug(t.subcategory || "General") === params.subcategory && 
    (t.slug === params.tool || toSlug(t.name) === params.tool)
  );

  if (!tool) return { title: "Calculator Not Found" };

  const title = `${tool.name} — Free Online Calculator`;
  const description = tool.description || `Free online ${tool.name}.`;
  const url = `https://racira.com/calculator/${params.category}/${params.subcategory}/${params.tool}`;

  return {
    title,
    description,
    alternates: { canonical: url },
  };
}

export default function ToolPage({ params }: Props) {
  const tool = calculatorRegistry.find(t => 
    toSlug(t.category || "") === params.category && 
    toSlug(t.subcategory || "General") === params.subcategory && 
    (t.slug === params.tool || toSlug(t.name) === params.tool)
  );

  if (!tool) {
    notFound();
  }

  const categoryName = CATEGORY_SUMMARY.find(c => toSlug(c.category) === params.category)?.category || tool.category || "";
  let formattedCategoryName = categoryName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  // Special case to match production exactly
  if (formattedCategoryName.toLowerCase() === "finance") {
    formattedCategoryName = "Financial";
  }
  const subcategoryName = tool.subcategory || "General";
  
  const CalculatorComponent = lazyComponents[tool.slug || params.tool];

  return (
    <div className="flex flex-col">
      <div className="container-page pt-3 pb-0">
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <Link href="/calculator" className="hover:text-foreground transition-colors">
            Calculators
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
          <Link href={`/calculator#${toSlug(categoryName)}`} className="hover:text-foreground transition-colors">
            {formattedCategoryName}
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
          <ComingSoonCalculator slug={tool.slug || params.tool} />
        ) : (
          <Suspense fallback={<CalculatorSkeleton />}>
            <CalculatorComponent />
          </Suspense>
        )}
      </div>
    </div>
  );
}
