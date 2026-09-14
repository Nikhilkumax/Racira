import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Easy-tier CAD tool components, keyed by registry slug.
 *
 * Each entry is a next/dynamic lazy import so a tool's code ships only in its
 * own route chunk — the /cad/[slug] page never pulls in all 59 tools at once.
 * A slug may only be marked "live" in the domain registry when it has an entry
 * here (same guarantee the sketch tool enforces via the page's TOOL_COMPONENTS).
 */
export const EASY_TOOL_COMPONENTS: Record<string, ComponentType> = {
  // ── CAD Utilities (8) ──────────────────────────────────────────
  "scale-factor-calculator": dynamic(() => import("./scale-factor-calculator")),
  "revision-history-table": dynamic(() => import("./revision-history-table")),
  "cad-layer-naming-convention-builder": dynamic(() => import("./cad-layer-naming-convention-builder")),
  "hatch-pattern-reference": dynamic(() => import("./hatch-pattern-reference")),
  "line-type-reference": dynamic(() => import("./line-type-reference")),
  "drawing-number-generator": dynamic(() => import("./drawing-number-generator")),
  "tolerance-notation-formatter": dynamic(() => import("./tolerance-notation-formatter")),
  "engineering-change-order-template": dynamic(() => import("./engineering-change-order-template")),

  // ── Measurement & Geometry (7) ──────────────────────────────────
  "distance-calculator-2d": dynamic(() => import("./distance-calculator-2d")),
  "perimeter-calculator": dynamic(() => import("./perimeter-calculator")),
  "arc-length-calculator": dynamic(() => import("./arc-length-calculator")),
  "cad-unit-converter": dynamic(() => import("./cad-unit-converter")),
  "hole-and-slot-dimensioner": dynamic(() => import("./hole-and-slot-dimensioner")),
  "gdandt-symbol-reference": dynamic(() => import("./gdandt-symbol-reference")),
  "true-position-calculator": dynamic(() => import("./true-position-calculator")),

  // ── GD&T & Standards (5) ────────────────────────────────────────
  "gdandt-symbol-reference-standards": dynamic(() => import("./gdandt-symbol-reference-standards")),
  "cylindricity-reference": dynamic(() => import("./cylindricity-reference")),
  "parallelism-and-perpendicularity-guide": dynamic(() => import("./parallelism-and-perpendicularity-guide")),
  "surface-roughness-ra-reference": dynamic(() => import("./surface-roughness-ra-reference")),
  "drawing-standards-comparator-ansi-vs-iso": dynamic(() => import("./drawing-standards-comparator-ansi-vs-iso")),

  // ── Piping & HVAC (6) ───────────────────────────────────────────
  "fluid-flow-rate-calculator": dynamic(() => import("./fluid-flow-rate-calculator")),
  "pipe-material-reference": dynamic(() => import("./pipe-material-reference")),
  "valve-type-reference": dynamic(() => import("./valve-type-reference")),
  "hvac-equipment-selector-guide": dynamic(() => import("./hvac-equipment-selector-guide")),
  "refrigerant-properties-reference": dynamic(() => import("./refrigerant-properties-reference")),
  "air-change-rate-calculator": dynamic(() => import("./air-change-rate-calculator")),

  // ── Mechanical Engineering CAD (5) ──────────────────────────────
  "spring-rate-calculator": dynamic(() => import("./spring-rate-calculator")),
  "stress-concentration-factor-reference": dynamic(() => import("./stress-concentration-factor-reference")),
  "material-selection-guide-mechanical": dynamic(() => import("./material-selection-guide-mechanical")),
  "fastener-reference-library": dynamic(() => import("./fastener-reference-library")),
  "shaft-design-reference": dynamic(() => import("./shaft-design-reference")),

  // ── Structural & Civil CAD (5) ──────────────────────────────────
  "foundation-type-reference": dynamic(() => import("./foundation-type-reference")),
  "ramp-slope-calculator": dynamic(() => import("./ramp-slope-calculator")),
  "wind-load-reference-tool": dynamic(() => import("./wind-load-reference-tool")),
  "seismic-zone-reference": dynamic(() => import("./seismic-zone-reference")),
  "building-code-checklist": dynamic(() => import("./building-code-checklist")),

  // ── Electrical & PCB Schematic (6) ───────────────────────────────
  "schematic-symbol-library-browser": dynamic(() => import("./schematic-symbol-library-browser")),
  "wire-gauge-reference": dynamic(() => import("./wire-gauge-reference")),
  "via-current-capacity-calculator": dynamic(() => import("./via-current-capacity-calculator")),
  "component-footprint-reference": dynamic(() => import("./component-footprint-reference")),
  "smd-component-identifier": dynamic(() => import("./smd-component-identifier")),
  "pcb-design-checklist": dynamic(() => import("./pcb-design-checklist")),

  // ── Architecture & Planning (5) ───────────────────────────────────
  "building-footprint-calculator": dynamic(() => import("./building-footprint-calculator")),
  "zoning-setback-calculator": dynamic(() => import("./zoning-setback-calculator")),
  "ada-clearance-reference": dynamic(() => import("./ada-clearance-reference")),
  "ceiling-height-reference": dynamic(() => import("./ceiling-height-reference")),
  "staircase-code-reference": dynamic(() => import("./staircase-code-reference")),

  // ── 2D Drafting (4) ───────────────────────────────────────────────
  "line-weight-manager": dynamic(() => import("./line-weight-manager")),
  "scale-bar-tool": dynamic(() => import("./scale-bar-tool")),
  "scale-paper-tool": dynamic(() => import("./scale-paper-tool")),
  "cad-grid-planner": dynamic(() => import("./cad-grid-planner")),

  // ── CNC & Fabrication (8) ─────────────────────────────────────────
  "material-cutting-reference": dynamic(() => import("./material-cutting-reference")),
  "tooling-library-browser": dynamic(() => import("./tooling-library-browser")),
  "g-code-reference-viewer": dynamic(() => import("./g-code-reference-viewer")),
  "machining-operation-selector": dynamic(() => import("./machining-operation-selector")),
  "chip-load-calculator": dynamic(() => import("./chip-load-calculator")),
  "cnc-material-thickness-guide": dynamic(() => import("./cnc-material-thickness-guide")),
  "laser-cutter-power-reference": dynamic(() => import("./laser-cutter-power-reference")),
  "waterjet-cutting-reference": dynamic(() => import("./waterjet-cutting-reference")),
};
