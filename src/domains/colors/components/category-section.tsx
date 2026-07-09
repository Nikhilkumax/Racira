import { CATEGORY_META, type ToolCategory, type ToolDef } from "@/domains/colors/registry/types";
import { ToolCard } from "./tool-card";

export function CategorySection({ category, tools }: { category: ToolCategory; tools: ToolDef[] }) {
  const meta = CATEGORY_META[category];
  return (
    <section className="mt-12">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {meta.label}
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((t) => (
          <ToolCard key={(t as any).slug} tool={t} />
        ))}
      </div>
    </section>
  );
}