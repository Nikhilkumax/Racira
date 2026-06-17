import { calculatorRegistry } from "@/data/calculatorRegistry";
import { CATEGORY_SUMMARY } from "@/app/calculator/summaryData";
import { toSlug } from "@/lib/utils/slug";

const MAX_URLS_PER_SITEMAP = 45000; // headroom under Google's 50k cap

// Use a fixed date unless Step 0 found real per-item date metadata.
const FALLBACK_LASTMOD = "2026-06-17";

export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
}

export interface SitemapSource {
  key: string; // single word, no hyphens — used as /sitemap-{key}-{categorySlug}-{page}.xml
  getCategorySlugs: () => string[];
  getEntriesForCategory: (categorySlug: string) => SitemapUrlEntry[];
}

const baseUrl = "https://racira.com";

export const sitemapSources: SitemapSource[] = [
  {
    key: "calculators",
    getCategorySlugs: () => CATEGORY_SUMMARY.map(c => toSlug(c.category)),
    getEntriesForCategory: (categorySlug) =>
      calculatorRegistry
        .filter(calc => calc && toSlug(calc.category || "general") === categorySlug)
        .map(calc => ({
          loc: `${baseUrl}/calculator/${calc.slug || toSlug(calc.name)}`,
          lastmod: calc.updatedAt || FALLBACK_LASTMOD, // swap in real field if Step 0 found one
        })),
  },
  // Future categories: one object each. key must be a single word, no hyphens.
];

// Empty categories return [] — they must NOT produce a phantom single empty page.
export function paginate(entries: SitemapUrlEntry[]): SitemapUrlEntry[][] {
  if (entries.length === 0) return [];
  const pages: SitemapUrlEntry[][] = [];
  for (let i = 0; i < entries.length; i += MAX_URLS_PER_SITEMAP) {
    pages.push(entries.slice(i, i + MAX_URLS_PER_SITEMAP));
  }
  return pages;
}
