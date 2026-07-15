import Link from "next/link";
import type { Tool } from "@/domains/music/registry";

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon as React.ComponentType<{ className?: string }>;
  const isLive = tool.status === "live";
  return (
    <Link
      href={`/music/tool/${tool.slug}`}
      className="tool-card group relative"
    >
      <div className="tool-card-icon">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground leading-snug">
        {tool.name}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
      {!isLive && (
        <span className="absolute right-3 top-3 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Soon
        </span>
      )}
    </Link>
  );
}
