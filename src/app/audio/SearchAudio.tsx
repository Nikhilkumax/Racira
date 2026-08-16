"use client";

import { CategorySearch } from "@/components/CategorySearch";
import { categories } from "@/domains/audio/registry";
import { onlyLive } from "@/lib/tools/liveToolFilters";

export function SearchAudio() {
  const totalCount = onlyLive(categories.flatMap(cat => cat.tools)).length;
  const SEARCH_REGISTRY = categories.flatMap(cat => cat.tools);

  return (
    <CategorySearch 
      categorySlug="audio" 
      placeholder={totalCount > 0 ? `Search ${totalCount} audio tools...` : "Search audio tools..."} 
      registry={SEARCH_REGISTRY.map(t => ({ ...t, href: `/audio/${t.slug}` }))} 
    />
  );
}
