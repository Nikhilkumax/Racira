"use client";

import { CategorySearch } from "@/components/CategorySearch";
import { categories } from "@/domains/image/registry";
import { onlyLive } from "@/lib/tools/liveToolFilters";

export function SearchImage() {
  const totalCount = onlyLive(categories.flatMap(cat => cat.tools)).length;
  const SEARCH_REGISTRY = categories.flatMap(cat => cat.tools);

  return (
    <CategorySearch 
      categorySlug="image" 
      placeholder={totalCount > 0 ? `Search ${totalCount} image tools...` : "Search image tools..."} 
      registry={SEARCH_REGISTRY.map(t => ({ ...t, href: `/image/${t.slug}` }))} 
    />
  );
}
