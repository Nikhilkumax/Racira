import Link from "next/link";
import * as Icons from "lucide-react";
import type { Tool } from "@/domains/engineering/registry";

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[tool.icon] ?? Icons.Wrench;
  return (
    <Link
      href={`/engineering/tool/${tool.slug}`}
      className="tool-card group"
    >
      {tool.status !== "live" && (
        <span className="tool-card-badge">Soon</span>
      )}
      <div className="tool-card-icon">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground leading-snug">{tool.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
    </Link>
  );
}
