"use client";

import { CategorySearch } from "@/components/CategorySearch";
import { categories } from "@/domains/image/registry";

export function SearchImage() {
  const totalCount = categories.reduce((sum, cat) => sum + cat.tools.length, 0);
  const SEARCH_REGISTRY = categories.flatMap(cat => cat.tools);

  return (
    <CategorySearch 
      categorySlug="image" 
      placeholder={`Search ${totalCount}+ image tools...`} 
      registry={SEARCH_REGISTRY.map(t => ({ ...t, href: `/image/${t.slug}` }))} 
    />
  );
}
