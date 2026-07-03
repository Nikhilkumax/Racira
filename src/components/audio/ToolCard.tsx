import Link from "next/link";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
      {tool.comingSoon && (
        <span className="tool-card-badge">Soon</span>
      )}
      <div className="tool-card-icon">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground leading-snug">{tool.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
    </>
  );

  if (tool.comingSoon) {
    return (
      <div
        aria-disabled="true"
        className="tool-card cursor-default opacity-90"
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href="/tools/audio-conversion/mp3-converter"
      className="tool-card group hover:-translate-y-[3px]"
    >
      {inner}
    </Link>
  );
}
