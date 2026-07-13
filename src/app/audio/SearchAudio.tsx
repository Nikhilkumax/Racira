"use client";

import { CategorySearch } from "@/components/CategorySearch";
import { categories } from "@/domains/audio/registry";

export function SearchAudio() {
  const totalCount = categories.reduce((sum, cat) => sum + cat.tools.length, 0);
  const SEARCH_REGISTRY = categories.flatMap(cat => cat.tools);

  return (
    <CategorySearch 
      categorySlug="audio" 
      placeholder={`Search ${totalCount}+ audio tools...`} 
      registry={SEARCH_REGISTRY.map(t => ({ ...t, href: `/audio/${t.slug}` }))} 
    />
  );
}
