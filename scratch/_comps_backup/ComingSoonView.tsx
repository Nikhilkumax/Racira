import React from "react";
import { Clock } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { calculatorRegistry } from "@/domains/calculator/registry";
import { toSlug } from "@/lib/utils/slug";
import { formatCategory } from "@/lib/utils/categoryFormat";
import RelatedGrid from "./RelatedGrid";

interface ComingSoonViewProps {
  tool: {
    slug: string;
    name: string;
    category: string;
    subcategory: string;
  };
}

function getRelatedCalculators(
  subcategory: string,
  currentSlug: string,
  categoryName: string,
): { slug: string; name: string; description: string }[] {
  const seen = new Set<string>([currentSlug]);
  const result: { slug: string; name: string; description: string }[] = [];

  // 1. Same subcategory — fill up to 8 with live tools
  for (const t of calculatorRegistry) {
    if (result.length >= 8) break;
    if (t.subcategory !== subcategory) continue;
    if (seen.has(t.slug)) continue;
    if (t.status !== "live") continue;  // live-only: no soon tools in related section
    seen.add(t.slug);
    result.push({ slug: t.slug, name: t.name, description: t.description });
  }

  // 2. Fallback: parent category — fill remainder up to 8
  if (result.length < 8) {
    for (const t of calculatorRegistry) {
      if (result.length >= 8) break;
      if (t.category !== categoryName) continue;
      if (seen.has(t.slug)) continue;
      if (t.status !== "live") continue;
      seen.add(t.slug);
      result.push({ slug: t.slug, name: t.name, description: t.description });
    }
  }

  return result;
}

export default function ComingSoonView({ tool }: ComingSoonViewProps) {
  const categorySlug = toSlug(tool.category);
  const subcategorySlug = toSlug(tool.subcategory);
  const displayCategory = formatCategory(tool.category);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Calculators", href: "/calculator" },
    { label: displayCategory, href: `/calculator/${categorySlug}` },
    { label: tool.subcategory, href: `/calculator/${subcategorySlug}` },
    { label: tool.name },
  ];

  const related = getRelatedCalculators(
    tool.subcategory,
    tool.slug,
    tool.category,
  );

  return (
    <div className="flex flex-col">
      <Breadcrumb items={breadcrumbItems} />

      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-1 mb-4">
          {tool.name}
        </h1>

        {/* Coming Soon Status Bar — matches SOON badge accent */}
        <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3 mb-8">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Coming Soon
          </span>
        </div>

        {/* Related Calculators */}
        {related.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Related Calculators
            </h2>
            <RelatedGrid tools={related} />
          </section>
        )}
      </div>
    </div>
  );
}
