"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Calculator } from "lucide-react";
import type { CalculatorDef } from "@/domains/calculator/registry";
import { trackSearchImpression, trackComingSoonClick } from "@/lib/analytics";

import { toSlug } from "@/lib/utils/slug";

const formatCategory = (cat: string) => {
  if (cat === 'EVERYDAY_LIFE') return 'Everyday Life';
  return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
};

const SearchCalculators = () => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [registry, setRegistry] = useState<CalculatorDef[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lazy load registry on focus or when typing
  const handleLoadRegistry = async () => {
    if (registry.length > 0 || isLoading) return;
    setIsLoading(true);
    try {
      const mod = await import("@/domains/calculator/registry");
      setRegistry(mod.calculatorRegistry);
    } catch (e) {
      console.error("Failed to load calculator registry", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
        handleLoadRegistry();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [registry.length, isLoading]);

  const normalizedQuery = query.toLowerCase().trim();
  
  const results = normalizedQuery.length >= 1 && registry.length > 0
    ? registry
        .filter(c => 
          c.name.toLowerCase().includes(normalizedQuery) || 
          c.description.toLowerCase().includes(normalizedQuery) ||
          c.category.toLowerCase().includes(normalizedQuery) ||
          (c.subcategory && c.subcategory.toLowerCase().includes(normalizedQuery))
        )
        .sort((a, b) => {
          // Priority 0: Built vs Unbuilt
          if (a.isBuilt && !b.isBuilt) return -1;
          if (!a.isBuilt && b.isBuilt) return 1;

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
          
          // Fallback: Sort alphabetically by name within same tier
          return a.name.localeCompare(b.name);
        })
        .slice(0, 10) // Maximum 8-10 results
    : [];

  useEffect(() => {
    if (open && normalizedQuery.length >= 1) {
      const timer = setTimeout(() => {
        trackSearchImpression(query, results.length);
      }, 500); // Debounce to avoid spamming tracking on every keystroke
      return () => clearTimeout(timer);
    }
  }, [query, open, results.length, normalizedQuery.length]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    // Escape key
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
            handleLoadRegistry();
          }}
          onFocus={() => {
            setOpen(true);
            handleLoadRegistry();
          }}
          placeholder="Search 11,000+ calculators..."
          className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
          aria-label="Search calculators"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1.5 w-full rounded-lg border border-border bg-card shadow-lg overflow-hidden">
          {results.map(c => {
            const catSlug = toSlug(formatCategory(c.category));
            const subSlug = c.subcategory ? toSlug(c.subcategory) : "general";
            
            return (
              <Link
                key={c.slug}
                href={`/calculator/${c.slug}`}
                prefetch={false}
                onClick={() => { 
                  if (!c.isBuilt) trackComingSoonClick(c.slug, "search");
                  setQuery(""); 
                  setOpen(false); 
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-muted/60 transition-colors"
              >
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  {c.icon ? <c.icon className="h-4 w-4 text-primary" /> : <Calculator className="h-4 w-4 text-primary" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {formatCategory(c.category)} → {c.subcategory || "General"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {open && normalizedQuery.length >= 1 && results.length === 0 && !isLoading && (
        <div className="absolute z-50 top-full mt-1.5 w-full rounded-lg border border-border bg-card shadow-lg p-4 text-center text-sm text-muted-foreground">
          No calculators found for "{query}"
        </div>
      )}
      
      {open && normalizedQuery.length >= 1 && results.length === 0 && isLoading && (
        <div className="absolute z-50 top-full mt-1.5 w-full rounded-lg border border-border bg-card shadow-lg p-4 text-center text-sm text-muted-foreground">
          Loading search index...
        </div>
      )}
    </div>
  );
};

export default SearchCalculators;
