"use client";

import { ToolCard } from "@/components/shared/ToolCard";
import { inferIcon } from "@/components/shared/icon-map";
import { toSlug } from "@/lib/utils/slug";

export function ClientGrid({ tools, subcategoryName, slug }: { tools: any[]; subcategoryName: string; slug: string }) {
  const Icon = inferIcon(subcategoryName, slug);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {tools.map((tool: any) => {
        const toolSlug = tool.slug || toSlug(tool.name);
        const mappedTool = {
          slug: toolSlug,
          name: tool.name,
          description: tool.description || "Free online calculator.",
          icon: Icon,
          status: tool.status || "live"
        };
        return (
          <ToolCard
            key={toolSlug}
            tool={mappedTool}
            basePath="/calculator"
          />
        );
      })}
    </div>
  );
}
