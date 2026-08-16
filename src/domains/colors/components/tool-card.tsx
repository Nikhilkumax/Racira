import Link from "next/link";
import type { ToolDef } from "@/domains/colors/registry/types";

export function ToolCard({ tool }: { tool: ToolDef }) {
  const Icon = tool.icon;
  const isSoon = tool.status === "soon";

  const cardBody = (
    <>
      {isSoon && (
        <span className="tool-card-badge">Soon</span>
      )}
      <div className="tool-card-icon">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground leading-snug">{tool.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
    </>
  );

  if (isSoon) {
    return (
      <div className="tool-card group cursor-default">
        {cardBody}
      </div>
    );
  }

  return (
    <Link href={`/colors/${tool.slug}`} className="tool-card group">
      {cardBody}
    </Link>
  );
}