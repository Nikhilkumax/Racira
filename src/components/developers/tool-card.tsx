import Link from "next/link";
import type { Tool } from "@/domains/developers/registry";
import { categorySlug } from "@/domains/developers/registry";

import { isLiveTool } from "@/lib/tools/liveToolFilters";

export function ToolCard({ tool }: { tool: Tool }) {
  // No developers tool page renders a real tool (the domain is component-gated),
  // so every card is a plain, non-navigating element with the "Soon" badge.
  const isLive = isLiveTool(tool, "developers");
  const Icon = tool.icon;

  const cardBody = (
    <>
      {!isLive && (
        <span className="absolute right-3 top-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Soon
        </span>
      )}
      <div className="tool-card-icon">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground leading-snug">
        {tool.name}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
        {tool.description}
      </p>
    </>
  );

  if (!isLive) {
    return (
      <div className="tool-card group cursor-default">
        {cardBody}
      </div>
    );
  }

  return (
    <Link href={`/developers/${tool.slug}`} className="tool-card group">
      {cardBody}
    </Link>
  );
}
