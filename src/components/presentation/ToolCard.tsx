import Link from "next/link";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Tool } from "@/data/presentation/tools";

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon =
    ((Icons as unknown as Record<string, LucideIcon>)[tool.icon] as LucideIcon) ||
    Icons.Sparkles;

  return (
    <Link
      href={`/presentation/tools/${tool.slug}`}
      className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
          Soon
        </span>
      </div>
      <h3 className="mt-4 text-[15px] font-semibold leading-tight text-card-foreground">
        {tool.name}
      </h3>
      <p className="mt-1 text-sm leading-snug text-muted-foreground">
        {tool.description}
      </p>
    </Link>
  );
}
