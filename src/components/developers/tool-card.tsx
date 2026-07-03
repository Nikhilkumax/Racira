import Link from "next/link";
import type { Tool } from "@/data/developers/tools";
import { categorySlug } from "@/data/developers/tools";

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <Link
      href={`/developers/tools/${categorySlug(tool.category)}/${tool.slug}`}
      className="tool-card group"
    >
      <div className="tool-card-icon">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground leading-snug">
        {tool.name}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
        {tool.description}
      </p>
    </Link>
  );
}
