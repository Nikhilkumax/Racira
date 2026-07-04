"use client";

import { TOOLS_BY_SLUG } from "@/domains/colors/registry";
import { ToolShell } from "@/domains/colors/components/tool-shell";
import { notFound } from "next/navigation";

export function ToolRouteClient({ slug }: { slug: string }) {
  const tool = TOOLS_BY_SLUG[slug];
  
  if (!tool) {
    notFound();
  }
  
  const Component = tool.component;
  
  return (
    <ToolShell tool={tool}>
      {Component ? (
        <Component />
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          This tool is coming soon.
        </div>
      )}
    </ToolShell>
  );
}
