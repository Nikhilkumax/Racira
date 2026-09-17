import { ToolResult } from "@/components/CategorySearch";

// Centralized tool catalog: 10 categories. Counts are ALWAYS derived from
// the arrays below — never hardcode a tool number in display strings.
import { ToolStatus } from "@/domains/_types";
import { inferIcon } from "@/components/shared/icon-map";

export type Tool = {
  slug: string;
  name: string;
  description: string;
  status: ToolStatus;
  icon: any;
};

export type Category = {
  key: string;
  title: string;
  tools: Tool[];
};

import { toSlug } from "@/lib/utils/slug";

const slug = toSlug;

const ACTIVE_SLUGS = new Set([
  // Phase A: canvas sketch tool.
  "2d-cad-sketch-tool",
  // Phase B batch 1 — CAD Utilities (Easy).
  "scale-factor-calculator",
  "revision-history-table",
  "cad-layer-naming-convention-builder",
  "hatch-pattern-reference",
  "line-type-reference",
  "drawing-number-generator",
  "tolerance-notation-formatter",
  "engineering-change-order-template",
  // Phase B batch 2 — Measurement & Geometry (Easy).
  "distance-calculator-2d",
  "perimeter-calculator",
  "arc-length-calculator",
  "cad-unit-converter",
  "hole-and-slot-dimensioner",
  "gdandt-symbol-reference",
  "true-position-calculator",
  // Phase B batch 3 — GD&T & Standards + Piping & HVAC (Easy).
  "gdandt-symbol-reference-standards",
  "cylindricity-reference",
  "parallelism-and-perpendicularity-guide",
  "surface-roughness-ra-reference",
  "drawing-standards-comparator-ansi-vs-iso",
  "fluid-flow-rate-calculator",
  "pipe-material-reference",
  "valve-type-reference",
  "hvac-equipment-selector-guide",
  "refrigerant-properties-reference",
  "air-change-rate-calculator",
  // Phase B batch 4 — Mechanical Engineering CAD + Structural & Civil CAD (Easy).
  "spring-rate-calculator",
  "stress-concentration-factor-reference",
  "material-selection-guide-mechanical",
  "fastener-reference-library",
  "shaft-design-reference",
  "foundation-type-reference",
  "ramp-slope-calculator",
  "wind-load-reference-tool",
  "seismic-zone-reference",
  "building-code-checklist",
  // Phase B batch 5 — Electrical & PCB Schematic + Architecture & Planning (Easy).
  "schematic-symbol-library-browser",
  "wire-gauge-reference",
  "via-current-capacity-calculator",
  "component-footprint-reference",
  "smd-component-identifier",
  "pcb-design-checklist",
  "building-footprint-calculator",
  "zoning-setback-calculator",
  "ada-clearance-reference",
  "ceiling-height-reference",
  "staircase-code-reference",
  // Phase B batch 6 — 2D Drafting + CNC & Fabrication (Easy).
  "line-weight-manager",
  "scale-bar-tool",
  "scale-paper-tool",
  "cad-grid-planner",
  "material-cutting-reference",
  "tooling-library-browser",
  "g-code-reference-viewer",
  "machining-operation-selector",
  "chip-load-calculator",
  "cnc-material-thickness-guide",
  "laser-cutter-power-reference",
  "waterjet-cutting-reference",
  // Phase B batch 7 — Medium tier: remaining Measurement & Geometry + CAD Utilities.
  "area-calculator-polygon",
  "angle-bisector-tool",
  "coordinate-input-tool",
  "tolerance-stack-up-analyzer",
  "thread-fit-calculator",
  "drawing-title-block-generator",
  "parts-list-bom-builder",
]);

const cat = (title: string, items: [string, string][]): Category => ({
  key: slug(title),
  title,
  tools: items.map(([name, desc]) => {
    const itemSlug = slug(name);
    return {
      slug: itemSlug,
      name,
      description: desc,
      status: ACTIVE_SLUGS.has(itemSlug) ? "live" : "soon",
      icon: inferIcon(name, itemSlug)
    };
  }),
});

export const categories: Category[] = [
  cat("2D Drafting", [
    ["2D CAD Sketch Tool", "Draw lines, rectangles, circles and arcs on a precision grid"],
    ["Floor Plan Drawer", "Sketch room layouts with walls, doors and windows"],
    ["Technical Drawing Builder", "Compose technical drawings with standard views"],
    ["Engineering Drawing Template", "Start from common engineering drawing templates"],
    ["Detail Drawing Tool", "Create enlarged detail views with callouts"],
    ["Elevation Drawing Tool", "Draft front, side and rear elevation views"],
    ["Section View Builder", "Define cut planes and build section drawings"],
    ["Orthographic Projection Tool", "Generate top, front and side projections"],
    ["Isometric Drawing Tool", "Sketch isometric pictorial views"],
    ["Dimension & Annotation Tool", "Add dimensions, leaders and notes"],
    ["Line Weight Manager", "Manage line weights and pen mapping"],
    ["Title Block Builder", "Create reusable drawing title blocks"],
    ["Scale Bar Tool", "Insert graphical scale bars for any scale"],
    ["Scale Paper Tool", "Compare paper sizes and compute magnification factors"],
    ["CAD Grid Planner", "Plan grid spacing, snap and reference lines"],
  ]),
  cat("Measurement & Geometry", [
    ["Distance Calculator (2D)", "Compute distance between two 2D points"],
    ["Area Calculator (polygon)", "Calculate the area of any closed polygon"],
    ["Perimeter Calculator", "Calculate perimeter of polygons and curves"],
    ["Angle Bisector Tool", "Find the bisector of any angle"],
    ["Arc Length Calculator", "Compute arc length from radius and angle"],
    ["CAD Unit Converter", "Convert between mm, cm, m, inch and feet"],
    ["Coordinate Input Tool", "Enter and convert Cartesian / polar coordinates"],
    ["Tolerance Stack-Up Analyzer", "Analyze worst-case and RSS tolerance stacks"],
    ["Thread Fit Calculator", "Calculate thread fits and allowances"],
    ["Hole & Slot Dimensioner", "Dimension holes and slot features"],
    ["GD&T Symbol Reference", "Browse geometric tolerancing symbols"],
    ["True Position Calculator", "Calculate true position from deviations"],
  ]),
  cat("Mechanical Engineering CAD", [
    ["Gear Ratio Visualizer", "Visualize gear ratios and torque transfer"],
    ["Cam Profile Designer", "Design cam profiles from motion curves"],
    ["Linkage Mechanism Simulator", "Simulate four-bar and slider linkages"],
    ["Stress Concentration Factor Reference", "Look up Kt values for common features"],
    ["Fit Tolerance Selector (ISO)", "Pick ISO shaft / hole fits"],
    ["Material Selection Guide (mechanical)", "Compare common engineering materials"],
    ["Fastener Reference Library", "Browse standard fasteners and threads"],
    ["Shaft Design Reference", "Reference for shaft sizing and keys"],
    ["Bearing Selection Guide", "Select bearings by load and speed"],
    ["Spring Rate Calculator", "Calculate spring rate and deflection"],
    ["Belt & Pulley Calculator", "Compute belt length and pulley ratios"],
    ["Chain Drive Calculator", "Size chain drives and sprockets"],
  ]),
  cat("Structural & Civil CAD", [
    ["Beam Span Calculator", "Estimate beam deflection and span limits"],
    ["Load Distribution Diagram Builder", "Sketch load and reaction diagrams"],
    ["Structural Section Properties Tool", "Lookup I, S and Z for sections"],
    ["Foundation Type Reference", "Compare common foundation types"],
    ["Column & Footing Sketch Builder", "Sketch column and footing details"],
    ["Retaining Wall Concept Tool", "Concept layouts for retaining walls"],
    ["Roof Load Calculator", "Estimate dead and live roof loads"],
    ["Wind Load Reference Tool", "Lookup wind load pressures"],
    ["Seismic Zone Reference", "Seismic zone classification reference"],
    ["Building Code Checklist", "Common code compliance checklist"],
    ["Staircase Design Tool", "Design code-compliant staircases"],
    ["Ramp Slope Calculator", "Calculate ramp slope and run"],
  ]),
  cat("Electrical & PCB Schematic", [
    ["Schematic Symbol Library Browser", "Browse standard schematic symbols"],
    ["Circuit Schematic Builder", "Sketch circuit schematics with parts"],
    ["Wire Gauge Reference", "AWG wire gauge and ampacity reference"],
    ["Electrical Load Calculator", "Calculate electrical service loads"],
    ["Panel Schedule Template", "Generate a panel schedule layout"],
    ["Single Line Diagram Builder", "Build single line electrical diagrams"],
    ["PCB Trace Width Calculator", "Trace width from current and temp rise"],
    ["PCB Impedance Calculator", "Microstrip and stripline impedance"],
    ["Via Current Capacity Calculator", "Estimate via current handling"],
    ["Component Footprint Reference", "Common PCB footprint dimensions"],
    ["SMD Component Identifier", "Identify SMD package codes"],
    ["PCB Design Checklist", "Pre-fab PCB design checklist"],
  ]),
  cat("Architecture & Planning", [
    ["Floor Plan Builder", "Compose floor plans with rooms and walls"],
    ["Room Layout Planner", "Plan room layouts and furniture"],
    ["Space Planning Tool", "Allocate program areas across floors"],
    ["Building Footprint Calculator", "Compute footprint and coverage"],
    ["Window & Door Placement Tool", "Place windows and doors with clearances"],
    ["Interior Elevation Sketch Builder", "Sketch interior elevations"],
    ["Site Plan Sketch Tool", "Sketch site plans with setbacks"],
    ["Zoning Setback Calculator", "Calculate required setbacks"],
    ["ADA Clearance Reference", "ADA clearance dimensions reference"],
    ["Parking Layout Tool", "Lay out parking stalls and aisles"],
    ["Furniture Layout Planner", "Arrange furniture with clearances"],
    ["Ceiling Height Reference", "Common ceiling height requirements"],
    ["Staircase Code Reference", "Stair code rise / run reference"],
    ["Fire Exit Path Planner", "Plan code-compliant egress paths"],
  ]),
  cat("Piping & HVAC", [
    ["Pipe Sizing Calculator", "Size pipes from flow and pressure"],
    ["Duct Sizing Calculator", "Size HVAC ducts for airflow"],
    ["HVAC Load Estimator", "Estimate cooling and heating loads"],
    ["Pressure Drop Calculator", "Calculate friction pressure drop"],
    ["Fluid Flow Rate Calculator", "Flow rate from velocity and area"],
    ["Pipe Material Reference", "Compare common piping materials"],
    ["Valve Type Reference", "Browse common valve types"],
    ["HVAC Equipment Selector Guide", "Choose HVAC equipment by load"],
    ["Refrigerant Properties Reference", "Common refrigerant properties"],
    ["Air Change Rate Calculator", "Calculate ACH from CFM and volume"],
  ]),
  cat("GD&T & Standards", [
    ["GD&T Symbol Reference (Standards)", "Reference of GD&T symbols and rules"],
    ["Flatness Tolerance Tool", "Apply and check flatness tolerance"],
    ["Cylindricity Reference", "Cylindricity tolerance reference"],
    ["Parallelism & Perpendicularity Guide", "Orientation tolerance guide"],
    ["Datum Reference Frame Builder", "Build a datum reference frame"],
    ["Feature Control Frame Builder", "Compose feature control frames"],
    ["Tolerance Grade (IT Grade) Reference", "ISO IT grade tolerance tables"],
    ["Surface Roughness Ra Reference", "Surface roughness Ra reference values"],
    ["Drawing Standards Comparator (ANSI vs ISO)", "Compare ANSI and ISO drawing rules"],
    ["CAD Standard Checker", "Check drawings against CAD standards"],
  ]),
  cat("CNC & Fabrication", [
    ["CNC Tool Path Planner", "Sketch tool paths for milling and routing"],
    ["Feed & Speed Calculator", "Calculate feeds and speeds"],
    ["Material Cutting Reference", "Cutting parameter reference by material"],
    ["Tooling Library Browser", "Browse common cutting tools"],
    ["G-Code Reference Viewer", "Quick reference of common G/M codes"],
    ["Machining Operation Selector", "Pick the right machining operation"],
    ["Chip Load Calculator", "Compute chip load per tooth"],
    ["CNC Material Thickness Guide", "Thickness limits per process"],
    ["Laser Cutter Power Reference", "Laser power vs material reference"],
    ["Waterjet Cutting Reference", "Waterjet feed and pressure reference"],
    ["Press Brake Bend Allowance Calculator", "Bend allowance and deduction"],
    ["Sheet Metal Flat Pattern Tool", "Develop flat patterns for sheet metal"],
  ]),
  cat("CAD Utilities", [
    ["Scale Factor Calculator", "Compute scale factors between drawings"],
    ["Drawing Title Block Generator", "Generate a title block from inputs"],
    ["Revision History Table", "Build a revision history table"],
    ["Parts List (BOM) Builder", "Compose a bill of materials"],
    ["CAD Layer Naming Convention Builder", "Define layer naming conventions"],
    ["Hatch Pattern Reference", "Reference of common hatch patterns"],
    ["Line Type Reference", "Reference of standard line types"],
    ["Drawing Number Generator", "Generate drawing numbers from rules"],
    ["Tolerance Notation Formatter", "Format tolerance notations"],
    ["Engineering Change Order Template", "ECO template generator"],
  ]),
];



categories.forEach(cat => {
  cat.tools = cat.tools.map(t => ({ ...t, category: cat.title }));
});

export const allTools: Tool[] = categories.flatMap((c) => c.tools);
export const TOOLS_BY_SLUG = new Map(allTools.map(t => [t.slug, t]));
export const totalCount = allTools.length;

export const findTool = (s: string) => allTools.find((t) => (t as any).slug === s);
export const findCategoryForTool = (s: string) =>
  categories.find((c) => c.tools.some((t) => (t as any).slug === s));

// CAD site-identity strings (title / copyright) — re-exported here so
// consumers need only one import for identity + counts.
export { CAD_SITE } from "./site";

export const SEARCH_REGISTRY: ToolResult[] = categories.flatMap((cat) =>
  cat.tools.map((tool) => ({
    name: tool.name,
    description: tool.description, // FIXED property name
    slug: tool.slug,
    href: `/cad/${tool.slug}`,
    category: cat.title,
    isBuilt: tool.status === "live", // FIXED property
  }))
);
