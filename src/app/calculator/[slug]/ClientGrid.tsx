"use client";

import { useState, useMemo } from "react";

import { ToolCard } from "@/components/shared/ToolCard";
import { inferIcon } from "@/components/shared/icon-map";
import { toSlug } from "@/lib/utils/slug";

export function ClientGrid({ tools, subcategoryName, slug }: { tools: any[]; subcategoryName: string; slug: string }) {
  const Icon = inferIcon(subcategoryName, slug);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tools;
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }, [query, tools]);

  return (
    <div>
      <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-card)] focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 mb-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter calculators..."
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          aria-label="Filter calculators grid"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-10">No calculators match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((tool: any) => {
            const toolSlug = tool.slug || toSlug(tool.name);
            const mappedTool = {
              slug: toolSlug,
              name: tool.name,
              description: tool.description || "Free online calculator.",
              icon: Icon,
              status: tool.status || "live",
              category: tool.category
            };
            return (
              <ToolCard
                key={toolSlug}
                tool={mappedTool}
                basePath="/calculator"
                domain="calculator"
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
