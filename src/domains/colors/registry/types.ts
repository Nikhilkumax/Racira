import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

export type ToolCategory =
  | "pickers"
  | "palettes"
  | "accessibility"
  | "analysis"
  | "manipulation"
  | "gradients"
  | "effects"
  | "css"
  | "designsys"
  | "data"
  | "fun"
  | "theory";

export interface ToolDef {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: LucideIcon;
  component?: ComponentType;
  status: "live" | "soon";
}

export const CATEGORY_META: Record<
  ToolCategory,
  { label: string; blurb: string }
> = {
  pickers: {
    label: "Color Pickers",
    blurb: "Pick colors with full visual pickers.",
  },
  palettes: {
    label: "Palette Tools",
    blurb: "Generate, mix, sort and export color palettes.",
  },
  accessibility: {
    label: "Color Accessibility",
    blurb: "Check contrast, simulate vision deficiencies, stay WCAG-clean.",
  },
  analysis: {
    label: "Color Analysis",
    blurb: "Identify, measure and compare colors.",
  },
  manipulation: {
    label: "Manipulation",
    blurb: "Shift, mix, tint, tone and transform any color.",
  },
  gradients: {
    label: "Gradient Tools",
    blurb: "Design, preview and export CSS gradients.",
  },
  effects: {
    label: "Design Effects",
    blurb: "Glass, neumorphism, shadows and overlays.",
  },
  css: {
    label: "CSS & Developer Output",
    blurb: "Generate, convert and export CSS color values.",
  },
  designsys: {
    label: "Design System References",
    blurb: "Official color palettes from popular design systems.",
  },
  data: {
    label: "Color Data & Export",
    blurb: "Export palettes as JSON, CSV, SVG, PNG and more.",
  },
  fun: {
    label: "Fun & Creative",
    blurb: "Random, lucky, seasonal, pastel and neon color tools.",
  },
  theory: {
    label: "Color Theory",
    blurb: "Learn, mix and explore color relationships.",
  },
};