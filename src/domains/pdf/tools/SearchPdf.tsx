"use client";

import { CategorySearch } from "@/components/CategorySearch";
import { tools } from "@/domains/pdf/registry/tools";
import { onlyLive } from "@/lib/tools/liveToolFilters";

export function SearchPdf() {
  const totalCount = onlyLive(tools, "pdf").length;

  return (
    <CategorySearch 
      categorySlug="pdf" 
      placeholder={totalCount > 0 ? `Search ${totalCount} PDF tools...` : "Search PDF tools..."} 
      registry={tools.map(t => ({ ...t, href: `/pdf/${t.slug}` }))} 
    />
  );
}
