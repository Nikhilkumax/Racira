"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { trackSearchImpression, trackComingSoonClick } from "@/lib/analytics";
import { CALCULATOR_STUB_SLUGS } from "@/lib/tools/calculatorStubSlugs";
import { isComponentGatedDomain } from "@/lib/tools/liveToolFilters";
import { toSlug } from "@/lib/utils/slug";

// Never surface stub tools in search: hide "soon" entries, known calculator stubs,
// and whole domains whose tool pages render "coming soon" regardless of status.
const stubSlugs = new Set<string>(CALCULATOR_STUB_SLUGS);
function isSearchable(r: ToolResult, categorySlug: string): boolean {
  if (isComponentGatedDomain(categorySlug)) return false;
  if (r.isBuilt === false) return false;
  if (stubSlugs.has(r.slug)) return false;
  return true;
}

export interface ToolResult {
  name: string;
  description: string;
  slug: string;
  href: string;
  category?: string;
  subcategory?: string;
  icon?: any;
  isBuilt?: boolean;
}

interface CategorySearchProps {
  categorySlug: string; // The base URL route, e.g., "developers", "colors"
  placeholder: string;
  registry: ToolResult[];
}

const formatCategory = (cat: string) => {
  if (!cat) return "";
  if (cat === 'EVERYDAY_LIFE') return 'Everyday Life';
  return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
};

export const CategorySearch = ({ categorySlug, placeholder, registry }: CategorySearchProps) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const normalizedQuery = query.toLowerCase().trim();
  const liveRegistry = registry.filter((r) => isSearchable(r, categorySlug));
  
  const results = normalizedQuery.length >= 1 && liveRegistry.length > 0
    ? liveRegistry
        .filter(c => 
          c.name.toLowerCase().includes(normalizedQuery) || 
          (c.description && c.description.toLowerCase().includes(normalizedQuery)) ||
          (c.category && c.category.toLowerCase().includes(normalizedQuery)) ||
          (c.subcategory && c.subcategory.toLowerCase().includes(normalizedQuery))
        )
        .sort((a, b) => {
          // Priority 0: Built vs Unbuilt
          const aBuilt = a.isBuilt !== false;
          const bBuilt = b.isBuilt !== false;
          if (aBuilt && !bBuilt) return -1;
          if (!aBuilt && bBuilt) return 1;

          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          
          // Priority 1: Name starts with query
          const aStarts = aName.startsWith(normalizedQuery);
          const bStarts = bName.startsWith(normalizedQuery);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          
          // Priority 2: Name contains query
          const aContains = aName.includes(normalizedQuery);
          const bContains = bName.includes(normalizedQuery);
          if (aContains && !bContains) return -1;
          if (!aContains && bContains) return 1;
          
          // Fallback: Sort alphabetically by name
          return a.name.localeCompare(b.name);
        })
        .slice(0, 10)
    : [];

  useEffect(() => {
    if (open && normalizedQuery.length >= 1) {
      const timer = setTimeout(() => {
        trackSearchImpression(query, results.length);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [query, open, results.length, normalizedQuery.length, liveRegistry.length]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", escHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", escHandler);
    };
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { 
            setQuery(e.target.value); 
            setOpen(true); 
          }}
          onFocus={() => {
            setOpen(true);
          }}
          placeholder={placeholder}
          className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
          aria-label={placeholder}
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1.5 w-full rounded-lg border border-border bg-card shadow-lg max-h-[400px] overflow-y-auto">
          {results.map(c => {
            // Usually category tools are located at /categorySlug/tools/category/slug or /categorySlug/tool/slug
            // Depending on the category, the href structure might differ, but we can standardise.
            // Wait, for developers it's /developers/tools/[cat]/[slug]
            // For colors it's /colors/tools/[slug]
            // For image it's /image/[slug]
            // For design it's /design/tools/[slug]
            // Since this is highly dynamic, we should probably just construct a good default, or allow href to be generated.
            
            // Wait, passing `href` builder as a prop? No, we can just pass `href` in the registry!
            // That's much safer.
            
            return (
              <Link
                key={c.slug}
                href={c.href}
                prefetch={false}
                onClick={() => { 
                  if (c.isBuilt === false) trackComingSoonClick(c.slug, "search");
                  setQuery(""); 
                  setOpen(false); 
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-muted/60 transition-colors"
              >
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  {c.icon ? <c.icon className="h-4 w-4 text-primary" /> : <ChevronRight className="h-4 w-4 text-primary" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                  {c.category && (
                    <p className="text-xs text-muted-foreground truncate">
                      {formatCategory(c.category)} {c.subcategory ? `→ ${c.subcategory}` : ""}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {open && normalizedQuery.length >= 1 && results.length === 0 && (
        <div className="absolute z-50 top-full mt-1.5 w-full rounded-lg border border-border bg-card shadow-lg p-4 text-center text-sm text-muted-foreground">
          No tools found for "{query}"
        </div>
      )}
    </div>
  );
};
