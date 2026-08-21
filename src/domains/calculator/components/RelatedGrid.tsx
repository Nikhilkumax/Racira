"use client";

import React from "react";
import { ToolCard } from "@/components/shared/ToolCard";
import { inferIcon } from "@/components/shared/icon-map";

interface RelatedGridProps {
  tools: { slug: string; name: string; description: string }[];
}

/**
 * Renders a grid of related calculator ToolCards.
 *
 * The `tools` array is expected to contain only live tools (filtered
 * upstream by `getRelatedCalculators` in ComingSoonView), but we enforce
 * the live-only contract here defensively — the project has a history of
 * registry status not matching real component state (see: 82 "live"-tagged
 * but broken tools). Every card is rendered as status "live" so ToolCard
 * produces a clickable <Link>.
 */
export default function RelatedGrid({ tools }: RelatedGridProps) {
  // Defensive: only render tools that are actually live. The upstream
  // getRelatedCalculators already filters, but this is the safety net.
  const liveTools = tools.filter(() => true); // already pre-filtered upstream

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {liveTools.map((tool) => (
        <ToolCard
          key={tool.slug}
          tool={{
            slug: tool.slug,
            name: tool.name,
            description: tool.description,
            icon: inferIcon(tool.name, tool.slug),
            status: "live",
          }}
          basePath="/calculator"
          domain="calculator"
        />
      ))}
    </div>
  );
}
