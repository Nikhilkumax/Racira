#!/usr/bin/env node
/**
 * cad-tier-list.mjs — Tier classification for the CAD domain.
 *
 * Tiers reflect ACTUAL implementation complexity, using the same rubric as the
 * Developer Tools reconciliation:
 *
 *   Easy   — Simple pure formula/computation or static reference lookup.
 *            No parsing, no rendering engine, no interactive geometry.
 *   Medium — Meaningful logic: multi-step calculations, structured tables/
 *            lookups with rules, coordinate/vector math on defined inputs,
 *            form-driven generators with preview.
 *   Hard   — Interactive canvas/WebGL drawing, kinematic/geometric simulation,
 *            complex profile/flat-pattern generation, full schematic editors.
 *
 * The one LIVE tool (2d-cad-sketch-tool) is classified from its actual
 * implementation (interactive canvas, grid snap, live measurement). All other
 * tools are classified from their stated function — they are "soon" and have no
 * implementation yet, so these are projections, not verified tiers.
 *
 * Platform note: every CAD tool is planned natively (canvas/SVG/DOM math) — no
 * ported CAD engine (dxf-parser, three.js for CAD, OpenCascade) is in use, and
 * none is required for the current scope.
 */
import { readFileSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dirname, "..");
const regSrc = readFileSync(resolve(ROOT, "src/domains/cad/registry.ts"), "utf-8");

const toSlug = (t) =>
  t.toLowerCase()
    .replace(/&/g, "and")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const categories = [];
let currentCat = null;
for (const line of regSrc.split(/\r?\n/)) {
  const catMatch = line.match(/cat\("([^"]+)",\s*\[/);
  if (catMatch) {
    currentCat = { title: catMatch[1], tools: [] };
    categories.push(currentCat);
    continue;
  }
  const toolMatch = line.match(/\[\s*"([^"]+)",\s*"([^"]*)"\s*\]/);
  if (toolMatch && currentCat) currentCat.tools.push({ name: toolMatch[1] });
}

// E = Easy, M = Medium, H = Hard. Keyed by slug (derived from the display name
// with the platform toSlug). 2d-cad-sketch-tool is VERIFIED from source; the
// rest are projections from stated function.
const tiers = {
  // 2D Drafting (14)
  "2d-cad-sketch-tool": "H", // interactive canvas + grid snap + live measure (verified from source)
  "floor-plan-drawer": "H", // interactive canvas
  "technical-drawing-builder": "H", // interactive canvas + views
  "engineering-drawing-template": "M", // template assembly + canvas preview
  "detail-drawing-tool": "H", // interactive canvas + callouts
  "elevation-drawing-tool": "H", // interactive canvas
  "section-view-builder": "M", // cut-plane computation + render
  "orthographic-projection-tool": "M", // coordinate projection math
  "isometric-drawing-tool": "H", // interactive canvas + iso grid math
  "dimension-and-annotation-tool": "M", // placement + measure math
  "line-weight-manager": "E", // mapping table
  "title-block-builder": "M", // form-driven generator
  "scale-bar-tool": "E", // formula + simple render
  "cad-grid-planner": "E", // spacing computation

  // Measurement & Geometry (12)
  "distance-calculator-2d": "E", // Pythagoras
  "area-calculator-polygon": "M", // shoelace + polygon input
  "perimeter-calculator": "E", // segment summation
  "angle-bisector-tool": "M", // vector math
  "arc-length-calculator": "E", // r·θ
  "cad-unit-converter": "E", // factor table
  "coordinate-input-tool": "M", // polar↔cartesian
  "tolerance-stack-up-analyzer": "M", // worst-case/RSS statistics
  "thread-fit-calculator": "M", // thread tables + fits
  "hole-and-slot-dimensioner": "E", // diameter/depth calc
  "gdandt-symbol-reference": "E", // static reference
  "true-position-calculator": "E", // single deviation formula

  // Mechanical Engineering CAD (12)
  "gear-ratio-visualizer": "M", // gear math + visual
  "cam-profile-designer": "H", // cam curve generation
  "linkage-mechanism-simulator": "H", // 4-bar kinematics
  "stress-concentration-factor-reference": "E", // Kt lookup
  "fit-tolerance-selector-iso": "M", // ISO tables + fit calc
  "material-selection-guide-mechanical": "E", // reference
  "fastener-reference-library": "E", // reference
  "shaft-design-reference": "E", // reference
  "bearing-selection-guide": "M", // L10 life calc
  "spring-rate-calculator": "E", // formula
  "belt-and-pulley-calculator": "M", // belt length formulas
  "chain-drive-calculator": "M", // chain length calc

  // Structural & Civil CAD (12)
  "beam-span-calculator": "M", // deflection/bending formulas
  "load-distribution-diagram-builder": "H", // interactive canvas + reactions
  "structural-section-properties-tool": "M", // I/S/Z tables + calc
  "foundation-type-reference": "E", // reference
  "column-and-footing-sketch-builder": "H", // interactive canvas
  "retaining-wall-concept-tool": "M", // stability checks
  "roof-load-calculator": "M", // dead/live load calcs
  "wind-load-reference-tool": "E", // lookup tables
  "seismic-zone-reference": "E", // lookup tables
  "building-code-checklist": "E", // checklist
  "staircase-design-tool": "M", // rise/run rules
  "ramp-slope-calculator": "E", // slope calc

  // Electrical & PCB Schematic (12)
  "schematic-symbol-library-browser": "E", // reference
  "circuit-schematic-builder": "H", // interactive schematic editor
  "wire-gauge-reference": "E", // reference
  "electrical-load-calculator": "M", // load calcs
  "panel-schedule-template": "M", // form → table
  "single-line-diagram-builder": "H", // interactive canvas
  "pcb-trace-width-calculator": "M", // IPC-2221 formulas
  "pcb-impedance-calculator": "M", // microstrip/stripline formulas
  "via-current-capacity-calculator": "E", // formula
  "component-footprint-reference": "E", // reference
  "smd-component-identifier": "E", // lookup
  "pcb-design-checklist": "E", // checklist

  // Architecture & Planning (14)
  "floor-plan-builder": "H", // interactive canvas
  "room-layout-planner": "M", // grid placement
  "space-planning-tool": "M", // area allocation
  "building-footprint-calculator": "E", // area calc
  "window-and-door-placement-tool": "M", // clearance rules
  "interior-elevation-sketch-builder": "H", // interactive canvas
  "site-plan-sketch-tool": "H", // interactive canvas
  "zoning-setback-calculator": "E", // calc
  "ada-clearance-reference": "E", // reference
  "parking-layout-tool": "M", // stall/aisle layout calc
  "furniture-layout-planner": "M", // placement + clearances
  "ceiling-height-reference": "E", // reference
  "staircase-code-reference": "E", // reference
  "fire-exit-path-planner": "M", // egress distance rules

  // Piping & HVAC (10)
  "pipe-sizing-calculator": "M", // flow formulas
  "duct-sizing-calculator": "M", // airflow sizing
  "hvac-load-estimator": "M", // load calcs
  "pressure-drop-calculator": "M", // Darcy-Weisbach
  "fluid-flow-rate-calculator": "E", // Q=vA
  "pipe-material-reference": "E", // reference
  "valve-type-reference": "E", // reference
  "hvac-equipment-selector-guide": "E", // reference
  "refrigerant-properties-reference": "E", // reference
  "air-change-rate-calculator": "E", // ACH formula

  // GD&T & Standards (10)
  "gdandt-symbol-reference-standards": "E", // reference
  "flatness-tolerance-tool": "M", // tolerance-zone evaluation
  "cylindricity-reference": "E", // reference
  "parallelism-and-perpendicularity-guide": "E", // reference
  "datum-reference-frame-builder": "M", // frame composition
  "feature-control-frame-builder": "M", // frame composition
  "tolerance-grade-it-grade-reference": "M", // IT tables
  "surface-roughness-ra-reference": "E", // reference
  "drawing-standards-comparator-ansi-vs-iso": "E", // comparison reference
  "cad-standard-checker": "M", // rule-based checking

  // CNC & Fabrication (12)
  "cnc-tool-path-planner": "H", // interactive canvas
  "feed-and-speed-calculator": "M", // SFM formulas
  "material-cutting-reference": "E", // reference
  "tooling-library-browser": "E", // reference
  "g-code-reference-viewer": "E", // reference
  "machining-operation-selector": "E", // decision table
  "chip-load-calculator": "E", // formula
  "cnc-material-thickness-guide": "E", // reference
  "laser-cutter-power-reference": "E", // reference
  "waterjet-cutting-reference": "E", // reference
  "press-brake-bend-allowance-calculator": "M", // bend allowance formulas
  "sheet-metal-flat-pattern-tool": "H", // unfold geometry + canvas

  // CAD Utilities (10)
  "scale-factor-calculator": "E", // ratio calc
  "drawing-title-block-generator": "M", // form → SVG/canvas
  "revision-history-table": "E", // table builder
  "parts-list-bom-builder": "M", // form → table
  "cad-layer-naming-convention-builder": "E", // naming rules
  "hatch-pattern-reference": "E", // reference
  "line-type-reference": "E", // reference
  "drawing-number-generator": "E", // rules → string
  "tolerance-notation-formatter": "E", // format rules
  "engineering-change-order-template": "E", // template
};

// ── Output ────────────────────────────────────────────────────────
let easy = 0, medium = 0, hard = 0;
const rows = [];
let missing = 0;

for (const cat of categories) {
  const counts = { Easy: 0, Medium: 0, Hard: 0 };
  for (const t of cat.tools) {
    const slug = toSlug(t.name);
    const tier = tiers[slug];
    if (!tier) {
      console.error(`NO TIER for ${t.name} (${slug})`);
      missing++;
      continue;
    }
    counts[tier === "E" ? "Easy" : tier === "M" ? "Medium" : "Hard"]++;
  }
  rows.push({ title: cat.title, ...counts, total: cat.tools.length });
  easy += counts.Easy;
  medium += counts.Medium;
  hard += counts.Hard;
}

console.log("Category".padEnd(38) + "Easy".padStart(6) + "Medium".padStart(8) + "Hard".padStart(6) + "Total".padStart(7));
console.log("-".repeat(65));
for (const r of rows) {
  console.log(r.title.padEnd(38) + String(r.Easy).padStart(6) + String(r.Medium).padStart(8) + String(r.Hard).padStart(6) + String(r.total).padStart(7));
}
console.log("-".repeat(65));
console.log("TOTAL".padEnd(38) + String(easy).padStart(6) + String(medium).padStart(8) + String(hard).padStart(6) + String(easy + medium + hard).padStart(7));
console.log(`\nUnclassified: ${missing}`);
console.log(`Live tool tier (2d-cad-sketch-tool): ${tiers["2d-cad-sketch-tool"]} (Hard — interactive canvas, verified from source)`);