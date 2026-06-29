import type { Category } from "@/data/productivity/tools";
import { ToolCard } from "./ToolCard";

export function CategorySection({ category, index }: { category: Category; index: number }) {
  return (
    <section className="scroll-mt-20">
      <div className="flex items-baseline justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2 className="font-display text-2xl font-bold tracking-tight">{category.name}</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground ml-9">{category.description}</p>
        </div>
        <span className="text-sm font-medium text-muted-foreground tabular-nums">
          {category.tools.length} tools
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {category.tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}
