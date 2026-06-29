import Link from "next/link";
import type { ToolDef } from "@/tools/colors/types";

export function ToolCard({ tool }: { tool: ToolDef }) {
  const Icon = tool.icon;
  const isSoon = tool.status === "soon";
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      {isSoon && (
        <span className="absolute right-3 top-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Coming Soon
        </span>
      )}
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-semibold text-card-foreground">{tool.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
      </div>
    </Link>
  );
}