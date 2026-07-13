"use client";

import { CategorySearch } from "@/components/CategorySearch";
import { tools } from "@/domains/pdf/registry/tools";

export function SearchPdf() {
  const totalCount = tools.length;

  return (
    <CategorySearch 
      categorySlug="pdf" 
      placeholder={`Search ${totalCount}+ PDF tools...`} 
      registry={tools.map(t => ({ ...t, href: `/pdf/${t.slug}` }))} 
    />
  );
}
