import { calculatorRegistry } from "@/domains/calculator/registry";
import { onlyLive } from "@/lib/tools/liveToolFilters";

// Live (genuinely built) calculators only — stub-tagged "live" entries are
// excluded. This is the single authoritative count source: the hero, search
// placeholder, category grids, subcategory pages, and sitemaps all derive from it.
const activeCalculators = onlyLive(calculatorRegistry);

// Category landing pages, in display order.
const CATEGORY_ORDER = [
  "FINANCE",
  "BUSINESS",
  "HEALTH",
  "MATH",
  "SCIENCE",
  "ENGINEERING",
  "TECHNOLOGY",
  "ENVIRONMENT",
  "EVERYDAY_LIFE",
  "TRANSPORTATION",
  "CONSTRUCTION",
  "EDUCATION",
] as const;

export type SubcategorySummary = { name: string; count: number };
export type CategorySummary = { category: string; total: number; subcategories: SubcategorySummary[] };

// Distinct subcategories for a category, derived from the live registry so the
// lists can never drift from the data (previously hand-maintained, which left
// tools with registry subcategories that had no page or count).
function subcategoriesFor(category: string): SubcategorySummary[] {
  const counts = new Map<string, number>();
  for (const tool of activeCalculators) {
    if (tool.category !== category) continue;
    const name = tool.subcategory || "General";
    counts.set(name, (counts.get(name) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export const CATEGORY_SUMMARY: CategorySummary[] = CATEGORY_ORDER.map((category) => ({
  category,
  total: activeCalculators.filter((t) => t.category === category).length,
  subcategories: subcategoriesFor(category),
}));
