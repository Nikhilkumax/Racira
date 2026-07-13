"use client";

import React from "react";
import { CategorySection } from "@/components/shared/CategorySection";
import { ToolCard } from "@/components/shared/ToolCard";
import { categories } from "@/domains/image/registry";

export default function ImageClientGrid() {
  const typedCategories = categories as any[];
  
  return (
    <section className="pb-16 space-y-14">
      <div className="racira-page-container">
        {typedCategories.map((cat) => (
          <div key={cat.name} className="mb-14 last:mb-0">
            <CategorySection 
              section={{ title: cat.name, tools: cat.tools }} 
              basePath="/image" 
            />
          </div>
        ))}
      </div>
    </section>
  );
}
