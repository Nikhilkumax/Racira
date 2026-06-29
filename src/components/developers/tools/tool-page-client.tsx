"use client";

import { useMemo } from "react";
import type { Tool } from "@/data/developers/tools";
import { categorySlug, findTool } from "@/data/developers/tools";
import { getTool, type ToolDefinition } from "@/components/developers/tools/registry";
import "@/lib/developers/tools"; // side-effect: registers every tool definition
import { ToolShell } from "@/components/developers/tools/tool-shell";

/**
 * Client bridge between the catalog metadata (server-rendered) and the
 * registry-driven tool engine. Picks the right ToolDefinition for the
 * catalog slug and renders ToolShell, falling back to a generic
 * text-passthrough tool if none is registered.
 */
export function ToolPageClient({
  tool: serverTool,
  categoryName,
  relatedTools: serverRelatedTools,
}: {
  tool: Tool;
  categoryName: string;
  relatedTools: Tool[];
}) {
  // Resolve real tool metadata on the client (server passes icon: null)
  const realTool =
    findTool(categorySlug(serverTool.category), serverTool.slug)?.tool || serverTool;
  const relatedTools = serverRelatedTools
    .map((t) => findTool(categorySlug(t.category), t.slug)?.tool || t)
    .filter(Boolean);

  const definition: ToolDefinition = useMemo(() => {
    const registered = getTool(serverTool.slug);
    if (registered) return registered;
    // Generic fallback: echo input with a clear note. Ensures *every*
    // catalog tool produces real, copyable output even before a dedicated
    // implementation exists.
    return {
      slug: serverTool.slug,
      mode: "text",
      live: true,
      transform: ({ input }) =>
        input
          ? {
              output: input,
              info: "Generic pass-through — a dedicated implementation is coming soon.",
            }
          : { output: "" },
    };
  }, [serverTool.slug]);

  return (
    <ToolShell
      tool={definition}
      toolMeta={{
        name: realTool.name,
        description: realTool.description,
        icon: realTool.icon,
      }}
      categoryName={categoryName}
      relatedTools={relatedTools}
    />
  );
}
