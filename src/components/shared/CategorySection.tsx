import { SubcategorySection } from "@/domains/_types";
import { ToolCard } from "./ToolCard";

interface CategorySectionProps {
  section: SubcategorySection;
  basePath: string;
  /** Domain route segment, passed to ToolCard for the genuinely-live check. */
  domain?: string;
}

export function CategorySection({ section, basePath, domain }: CategorySectionProps) {
  // Every tool is shown — live tools as-is, non-live tools with the "Soon"
  // badge (ToolCard/StatusBadge). Sitemap filtering is handled separately.
  const Icon = section.icon;
  const tools = section.tools;

  if (tools.length === 0) return null;

  return (
    <section>
      <div className="mb-5 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {section.title} <span className="opacity-70 ml-1">({tools.length})</span>
        </h2>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} basePath={basePath} domain={domain} />
        ))}
      </div>
    </section>
  );
}
