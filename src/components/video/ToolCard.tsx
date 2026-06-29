import Link from "next/link";
import type { Tool } from "@/data/video/tools";
import { ToolIcon } from "./ToolIcon";

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-[0_8px_30px_-12px_color-mix(in_oklab,var(--primary)_30%,transparent)] hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary group-hover:bg-primary/25 transition-colors">
          <ToolIcon name={tool.icon} className="h-5 w-5" />
        </span>
        {tool.status === "live" ? (
          <span className="text-[10px] font-semibold uppercase tracking-wider rounded-full bg-primary/15 text-primary px-2 py-0.5">
            Live
          </span>
        ) : (
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
            Soon
          </span>
        )}
      </div>
      <div>
        <h3 className="font-semibold text-card-foreground leading-tight">{tool.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-snug">{tool.description}</p>
      </div>
    </Link>
  );
}
