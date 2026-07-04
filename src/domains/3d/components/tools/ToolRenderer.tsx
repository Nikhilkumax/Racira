"use client";
import { TOOL_COMPONENTS } from "./registry";

export function ToolRenderer({ slug }: { slug: string }) {
  const Component = TOOL_COMPONENTS[slug];
  if (!Component) return null;
  return <Component />;
}
