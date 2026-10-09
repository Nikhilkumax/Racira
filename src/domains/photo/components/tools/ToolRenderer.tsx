"use client";
import { TOOL_COMPONENTS } from "./registry";

/**
 * Client-side renderer for photo tool components.
 *
 * The component map is built with `next/dynamic(..., { ssr: false })`, which a
 * Server Component cannot import directly — this thin client wrapper is the
 * same pattern the 3D domain uses for its TOOL_COMPONENTS map.
 */
export function ToolRenderer({ slug }: { slug: string }) {
  const Component = TOOL_COMPONENTS[slug];
  if (!Component) return null;
  return <Component />;
}
