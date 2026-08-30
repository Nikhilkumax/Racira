"use client";

import { tools } from "@/domains/pdf/registry/tools";
import { CategorySection } from "@/components/shared/CategorySection";
import { onlyLive } from "@/lib/tools/liveToolFilters";
import { useMemo } from "react";

/** Only live tools per subcategory — counts always match the hero total. */
const LIVE_TOOLS = onlyLive(tools);

export default function ClientGrid() {
  const sections = useMemo(() => {
    return Array.from(new Set(LIVE_TOOLS.map((t) => t.subCategory).filter(Boolean))).map(
      (subCategory) => ({
        title: subCategory as string,
        tools: LIVE_TOOLS.filter((t) => t.subCategory === subCategory) as any,
      })
    );
  }, []);

  return (
    <section className="pb-16 space-y-14">
      <div className="racira-page-container">
        {sections.map((section) => (
          <div key={section.title} className="mb-14 last:mb-0">
            <CategorySection section={section} basePath="/pdf" domain="pdf" />
          </div>
        ))}
      </div>
    </section>
  );
}
