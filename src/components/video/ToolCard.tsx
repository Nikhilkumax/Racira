import Link from "next/link";
import type { Tool } from "@/data/video/tools";
import { ToolIcon } from "./ToolIcon";

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="tool-card group"
    >
      {tool.status !== "live" && (
        <span className="tool-card-badge">Soon</span>
      )}
      <div className="tool-card-icon">
        <ToolIcon name={tool.icon} className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground leading-snug">{tool.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
    </Link>
  );
}
