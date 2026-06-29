import Link from "next/link";
import * as Icons from "lucide-react";
import type { Tool } from "@/lib/engineering/tools";

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[tool.icon] ?? Icons.Wrench;
  return (
    <Link
      href={`/tool/${tool.slug}`}
      className="tool-card group relative"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="icon-chip">
          <Icon className="h-5 w-5" />
        </span>
        {!tool.built && (
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Soon
          </span>
        )}
        {tool.built && (
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
            Live
          </span>
        )}
      </div>
      <h3 className="text-[15px] font-semibold leading-snug text-foreground">{tool.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
    </Link>
  );
}
