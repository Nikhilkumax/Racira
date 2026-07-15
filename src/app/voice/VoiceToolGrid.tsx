"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CATEGORIES, TOTAL_TOOLS } from "@/data/voice/tools";
import { CategorySection } from "@/components/shared/CategorySection";

export function VoiceToolGrid() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return CATEGORIES;
    return CATEGORIES
      .map((c) => ({
        ...c,
        tools: c.tools.filter((t) =>
          t.name.toLowerCase().includes(needle) ||
          t.description.toLowerCase().includes(needle)
        )
      }))
      .filter((c) => c.tools.length > 0);
  }, [q]);

  return (
    <section id="tools" className="racira-page-container pb-20 pt-8 space-y-14">
      <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-background/85 backdrop-blur border-b border-border/60">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${TOTAL_TOOLS} voice tools…`}
            className="w-full rounded-full border border-border bg-card pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {filtered.map((cat) => (
        <CategorySection
          key={cat.name}
          section={{ title: cat.name, tools: cat.tools as any }}
          basePath="/voice/tools"
        />
      ))}

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No tools match "{q}". Try a different search.
        </p>
      )}
    </section>
  );
}
