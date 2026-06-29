import Link from "next/link";
import { ArrowUpRight, Lock } from "lucide-react";
import type { Tool } from "@/data/productivity/tools";

export function ToolCard({ tool }: { tool: Tool }) {
  if (tool.available && tool.slug === "deep-work-session-planner") {
    return (
      <Link
        href="/tools/deep-work-session-planner"
        className="group relative flex flex-col justify-between rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 p-5 transition-all hover:border-primary hover:shadow-lg hover:-translate-y-0.5"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            Live
          </span>
          <ArrowUpRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
        <div className="mt-6">
          <h3 className="font-display text-base font-bold leading-tight">{tool.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">Open the planner →</p>
        </div>
      </Link>
    );
  }

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Lock className="h-3 w-3" /> Soon
        </span>
        <span className="text-xs text-muted-foreground/60">#{tool.id}</span>
      </div>
      <div className="mt-6">
        <h3 className="font-display text-base font-semibold leading-tight text-foreground/80">
          {tool.name}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">Coming soon</p>
      </div>
    </div>
  );
}
