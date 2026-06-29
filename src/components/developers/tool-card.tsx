import Link from "next/link";
import type { Tool } from "@/data/developers/tools";
import { categorySlug } from "@/data/developers/tools";

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <Link
      href={`/developers/tools/${categorySlug(tool.category)}/${tool.slug}`}
      className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6 card-hover"
      style={{ boxShadow: "var(--card-shadow)" }}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-foreground text-[15px] leading-snug">
          {tool.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          {tool.description}
        </p>
      </div>
    </Link>
  );
}
