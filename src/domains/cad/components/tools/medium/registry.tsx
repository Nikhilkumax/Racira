import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Medium-tier CAD tool components, keyed by registry slug.
 *
 * Same lazy-loading contract as the Easy tier: a slug may only be marked
 * "live" in the domain registry when it has an entry here.
 */
export const MEDIUM_TOOL_COMPONENTS: Record<string, ComponentType> = {
  // ── Measurement & Geometry (5) ────────────────────────────────────
  "area-calculator-polygon": dynamic(() => import("./area-calculator-polygon")),
  "angle-bisector-tool": dynamic(() => import("./angle-bisector-tool")),
  "coordinate-input-tool": dynamic(() => import("./coordinate-input-tool")),
  "tolerance-stack-up-analyzer": dynamic(() => import("./tolerance-stack-up-analyzer")),
  "thread-fit-calculator": dynamic(() => import("./thread-fit-calculator")),

  // ── CAD Utilities (2) ───────────────────────────────────────────────
  "drawing-title-block-generator": dynamic(() => import("./drawing-title-block-generator")),
  "parts-list-bom-builder": dynamic(() => import("./parts-list-bom-builder")),
};