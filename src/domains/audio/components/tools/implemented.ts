/**
 * Slugs that have a real tool implementation wired into ToolRenderer.
 *
 * Server-safe on purpose: it holds no JSX and no `next/dynamic` call, so the
 * `[slug]` server component can import it to decide whether to mount a tool or
 * fall back to the coming-soon state. A tool marked `status: "live"` in the
 * registry but missing from this set still renders coming-soon instead of an
 * empty page.
 *
 * Derived from the format table rather than hand-listed, so a format can never
 * be wired into ToolRenderer without also being considered implemented here.
 *
 * Keep in sync with the TOOL_COMPONENTS map in ./ToolRenderer.tsx.
 */
import { FORMAT_ORDER, FORMATS } from "@/domains/audio/lib/audioFormats";

export const IMPLEMENTED_TOOL_SLUGS = new Set<string>(
  FORMAT_ORDER.map((id) => FORMATS[id].slug),
);

export function hasAudioToolImplementation(slug: string): boolean {
  return IMPLEMENTED_TOOL_SLUGS.has(slug);
}
