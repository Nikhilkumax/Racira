"use client";

import { tools } from "@/domains/pdf/registry/tools";
import { CategorySection } from "@/components/shared/CategorySection";
import { useMemo } from "react";

export default function ClientGrid() {
  const sections = useMemo(() => {
    return Array.from(new Set(tools.map((t) => t.subCategory).filter(Boolean))).map(
      (subCategory) => ({
        title: subCategory as string,
        tools: tools.filter((t) => t.subCategory === subCategory) as any, // Cast to any to align with Tool type if needed
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
