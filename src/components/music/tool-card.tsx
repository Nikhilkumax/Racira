import Link from "next/link";
import type { Tool } from "@/lib/music/tools-data";
import { getToolIcon } from "./tool-icon";

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = getToolIcon(tool);
  return (
    <Link
      href={`/tool/${tool.slug}`}
      className="tool-card group"
    >
      <div className="tool-card-icon">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground leading-snug">
        {tool.name}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
    </Link>
  );
}
