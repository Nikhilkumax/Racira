import Link from "next/link";
import type { Tool } from "@/domains/video/registry";
import { hasComingSoonPage } from "@/lib/tools/comingSoonPage";

export function ToolCard({ tool }: { tool: Tool }) {
  const isLive = tool.status === "live";
  // Upcoming tools link to their Coming Soon page — every card is navigable.
  const clickable = isLive || hasComingSoonPage(tool, "video");
  const Icon = tool.icon as React.ComponentType<{ className?: string }>;

  const cardBody = (
    <>
      {!isLive && (
        <span className="absolute right-3 top-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Soon
        </span>
      )}
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-foreground leading-snug">{tool.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
    </>
  );

  if (!clickable) {
    return (
      <div className="tool-card group relative cursor-default">
        {cardBody}
      </div>
    );
  }

  return (
    <Link href={`/video/${tool.slug}`} className="tool-card group relative">
      {cardBody}
    </Link>
  );
}
