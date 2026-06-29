import Link from "next/link";
import type { Tool } from "@/lib/music/tools-data";
import { getToolIcon } from "./tool-icon";

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = getToolIcon(tool);
  return (
    <Link
      href={`/tool/${tool.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_30px_-12px] hover:shadow-primary/25"
    >
      <span className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="font-display text-base font-bold leading-tight text-foreground">
        {tool.name}
      </h3>
      <p className="mt-1 text-sm leading-snug text-muted-foreground">{tool.description}</p>
    </Link>
  );
}
