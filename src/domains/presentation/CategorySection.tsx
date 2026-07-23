import type { Category } from "@/domains/presentation/registry";
import { ToolCard } from "./ToolCard";

export function CategorySection({ category }: { category: Category }) {
  return (
    <section className="mb-14">
      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {category.title}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {category.tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </section>
  );
}
