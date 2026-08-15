"use client";

import Link from "next/link";
import { Tool } from "@/domains/_types";
import { isLiveTool } from "@/lib/tools/liveToolFilters";
import { StatusBadge } from "./StatusBadge";
import { useState, useRef, useEffect, useLayoutEffect } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface ToolCardProps {
  tool: Tool;
  basePath: string;
}

export function ToolCard({ tool, basePath }: ToolCardProps) {
  // Non-live / stub tools are hidden from every grid that renders ToolCard.
  if (!isLiveTool(tool)) return null;

  const Icon = tool.icon;
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [showDescription, setShowDescription] = useState(true);

  useIsomorphicLayoutEffect(() => {
    if (!titleRef.current) return;

    // Use ResizeObserver to handle the web-font loading race condition.
    // If the fallback font is narrower, it might measure as 1 line initially.
    // ResizeObserver ensures we re-evaluate as soon as the real font loads and causes a wrap.
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Height of the text content itself (without padding/borders)
        const height = entry.contentRect.height;
        // 1 line is ~22px. Anything over ~32px means it wrapped to 2 lines.
        if (height > 32) {
          setShowDescription(false);
        } else {
          setShowDescription(true);
        }
      }
    });

    observer.observe(titleRef.current);

    return () => observer.disconnect();
  }, [tool.name]);

  return (
    <Link
      href={`${basePath}/${tool.slug}`}
      className="tool-card group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 hover:-translate-y-[3px] hover:border-primary/40 hover:shadow-[0_8px_24px_hsl(var(--ring)/0.1)] transition-all"
    >
      <StatusBadge status={tool.status} />
      
      <div className="flex flex-col">
        <div className="mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex flex-col">
          <h3 
            ref={titleRef}
            className="font-semibold text-foreground leading-snug line-clamp-2"
          >
            {tool.name}
          </h3>
          {showDescription && tool.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
              {tool.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
