import Link from "next/link";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AudioTool } from "@/data/audio/audioTools";

function toPascalCase(kebab: string): string {
  return kebab
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function getIcon(name: string): LucideIcon {
  const pascal = toPascalCase(name);
  const icon = (LucideIcons as unknown as Record<string, LucideIcon>)[pascal];
  return icon ?? LucideIcons.AudioLines;
}

export function ToolCard({ tool }: { tool: AudioTool }) {
  const Icon = getIcon(tool.icon);

  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            tool.comingSoon
              ? "bg-muted text-muted-foreground"
              : "text-primary-foreground shadow-[var(--shadow-elegant)]",
          )}
          style={tool.comingSoon ? undefined : { backgroundImage: "var(--gradient-primary)" }}
        >
          <Icon className="h-5 w-5" />
        </span>
        {tool.comingSoon ? (
          <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Coming soon
          </span>
        ) : (
          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
            Available
          </span>
        )}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{tool.name}</h3>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{tool.description}</p>
    </>
  );

  const baseClasses =
    "group flex h-full flex-col rounded-xl border border-border bg-card p-4 text-left shadow-[var(--shadow-card)] transition-all";

  if (tool.comingSoon) {
    return (
      <div
        aria-disabled="true"
        className={cn(baseClasses, "cursor-default opacity-90")}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href="/tools/audio-conversion/mp3-converter"
      className={cn(baseClasses, "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]")}
    >
      {inner}
    </Link>
  );
}
