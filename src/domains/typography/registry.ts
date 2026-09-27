import { AArrowDown, AArrowUp, ALargeSmall, Accessibility, Activity, ActivitySquare, AirVent, Airplay, AlarmCheck, AlarmClock, AlarmClockCheck, AlarmClockMinus, AlarmClockOff, AlarmClockPlus, AlarmMinus, AlarmPlus, AlarmSmoke, Album, AlertCircle, AlertOctagon, AlertTriangle, AlignCenter, AlignCenterHorizontal, AlignCenterVertical, AlignEndHorizontal, AlignEndVertical, AlignHorizontalDistributeCenter, AlignHorizontalDistributeEnd, AlignHorizontalDistributeStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, AlignHorizontalJustifyStart, AlignHorizontalSpaceAround, AlignHorizontalSpaceBetween, AlignJustify, ArrowRight, ArrowRightCircle, ArrowRightFromLine, ArrowRightLeft, ArrowRightSquare, BadgeJapaneseYen, Barcode, BluetoothSearching, Book, BookA, BookAudio, BookCheck, BookCopy, BookType, CalendarSearch, ClipboardCopy, ClipboardType, Code, Code2, CodeSquare, CodeXml, Codepen, Codesandbox, Copy, CopyCheck, CopyMinus, CopyPlus, Eye, EyeClosed, EyeOff, FileCode, FileSearch, FileSearch2, FileType, FileType2, FolderSearch, FolderSearch2, Grid, Grid2X2, Grid2X2Plus, Grid2x2, Grid2x2Check, JapaneseYen, Layers, Layers2, Layers3, Layout, LayoutDashboard, PencilRuler, Printer, PrinterCheck, ReceiptJapaneseYen, Ruler, ScanEye, Search, Sparkles, WandSparkles } from "lucide-react";
import type { ComponentType } from "react";
import { TOOL_COMPONENTS } from "./components/tools/registry";
import { ToolResult } from "@/components/CategorySearch";
import { toSlug } from "@/lib/utils/slug";

export type Tool = {
  name: string;
  slug: string;
  desc: string;
  icon: any;
  status: "live" | "soon";
};

export type Category = {
  name: string;
  tools: Tool[];
};

const mk = (entries: [string, string, any, boolean][]): Tool[] =>
  entries.map(([name, desc, icon, isLive]) => {
    const slug = toSlug(name);
    return { name, slug, desc, icon, status: isLive ? "live" : "soon" };
  });

export const categories: Category[] = [
  {
    name: "Font Preview & Testing",
    tools: mk([
      ["Font Previewer", "Preview any font with custom text and sizes", Eye, true],
      ["Web Font Tester", "Test web fonts live in your browser", Search, true],
      ["Custom Text Font Preview", "Try fonts with your own copy", EyeClosed, true],
      ["Waterfall Font Preview", "See a font at every size at once", EyeOff, true],
      ["Pangram Font Tester", "Preview with classic pangram strings", JapaneseYen, true],
      ["Font Specimen Sheet", "Generate a printable specimen sheet", AArrowDown, true],
      ["Multi-Font Comparison", "Compare several fonts side by side", AArrowUp, true],
      ["Font Size Preview", "Preview a font at multiple sizes", BadgeJapaneseYen, true],
      ["Font Line Height Tester", "Dial in the perfect line height", Eye, true],
      ["Font Letter Spacing Tester", "Fine-tune letter spacing", EyeClosed, true],
      ["Variable Font Sliders", "Explore variable font axes", ALargeSmall, true],
      ["Font Rendering Preview", "See anti-aliasing and rendering", EyeOff, true],
      ["Font Pairing Suggester", "Get smart pairing suggestions", Layers, true],
      ["Serif + Sans Pairing Tool", "Classic serif and sans combos", Layers2, true],
      ["Display + Body Pairing Tool", "Pair display with readable body", Layers3, true],
      ["Heading + Caption Pairing", "Find headings that match captions", Layers, true],
      ["Contrast Pairing Checker", "Check contrast between two fonts", Layers2, true],
      ["Font Harmony Visualizer", "Visualize harmony of a pairing", Layers3, true],
      ["Brand Font Stack Builder", "Build a complete brand stack", BookCopy, true],
      ["Monospace Pairing Tool", "Pair monospace with other faces", ClipboardCopy, true],
      ["Google Fonts Pairing Picker", "Pick pairs from Google Fonts", Copy, true],
      ["Font Style Contrast Analyzer", "Analyze stylistic contrast", Book, true],
    ]),
  },
  {
    name: "Type Scale & Spacing",
    tools: mk([
      ["Type Scale Generator", "Generate a modular type scale", PencilRuler, true],
      ["Modular Scale Calculator", "Calculate ratios for type", Ruler, true],
      ["Fluid Type Scale Builder", "Build clamp-based fluid scales", PencilRuler, true],
      ["Baseline Grid Calculator", "Lock text to a baseline grid", Ruler, true],
      ["Line Height Optimizer", "Optimize leading for readability", Accessibility, true],
      ["Letter Spacing Calculator", "Calculate tracking values", Grid, true],
      ["Paragraph Width Optimizer", "Optimize characters per line", Grid2X2, true],
      ["Vertical Rhythm Builder", "Compose a vertical rhythm", Activity, true],
      ["Type Hierarchy Planner", "Plan headings and body sizes", ActivitySquare, true],
      ["Heading Scale Visualizer", "Visualize H1–H6 scale", Grid2X2Plus, true],
      ["Caption & Footnote Scale", "Scale captions and footnotes", Grid2x2, true],
      ["CSS Typography Token Generator", "Export CSS type tokens", Barcode, true],
    ]),
  },
  {
    name: "Font Conversion & Export",
    tools: mk([
      ["Font Format Converter", "Convert TTF, OTF, WOFF, WOFF2", ArrowRight, false],
      ["Web Font Subsetter", "Subset fonts for the web", Code, false],
      ["Font Character Extractor", "Extract characters from a font", BookType, true],
      ["Font Base64 Encoder", "Encode fonts as base64", ArrowRightCircle, true],
      ["Font CSS Generator", "Generate font CSS quickly", Code2, true],
      ["Font Face Declaration Builder", "Build @font-face rules", AirVent, true],
      ["Variable Font Axis Exporter", "Export variable font axes", ArrowRightFromLine, true],
      ["Font Glyph PNG Exporter", "Export glyphs as PNG", ArrowRightLeft, true],
      ["Font Metadata Editor", "Edit font name table metadata", Airplay, false],
      ["Font License Inspector", "Inspect bundled font licenses", AlarmCheck, true],
    ]),
  },
  {
    name: "Glyph & Character Tools",
    tools: mk([
      ["Glyph Browser", "Browse every glyph in a font", ClipboardType, true],
      ["Unicode Character Explorer", "Explore Unicode characters", FileType, true],
      ["Special Character Picker", "Pick special characters fast", FileType2, true],
      ["Dingbat & Symbol Explorer", "Find dingbats and symbols", AlarmClock, true],
      ["Ligature Finder", "Discover ligatures in a font", AlarmClockCheck, false],
      ["Kerning Pair Inspector", "Inspect kerning pairs", CopyCheck, true],
      ["OpenType Feature Explorer", "Toggle OpenType features", AlarmClockMinus, true],
      ["Glyph Comparison Tool", "Compare glyphs across fonts", BookType, true],
      ["Missing Glyph Detector", "Detect missing glyphs", ClipboardType, true],
      ["Character Code Converter", "Convert character codes", ArrowRightSquare, true],
      ["Unicode Block Explorer", "Explore Unicode blocks", FileType, true],
      ["Emoji Unicode Mapper", "Map emoji to Unicode points", FileType2, true],
    ]),
  },
  {
    name: "Text Rendering & Layout",
    tools: mk([
      ["Text Column Layout Builder", "Build multi-column text", Layout, true],
      ["Text Justification Previewer", "Preview justified text", JapaneseYen, true],
      ["Hyphenation Tester", "Test hyphenation behavior", ReceiptJapaneseYen, true],
      ["Widow & Orphan Detector", "Spot widows and orphans", AlarmClockOff, true],
      ["Drop Cap Generator", "Generate elegant drop caps", AlarmClockPlus, true],
      ["Pull Quote Designer", "Design pull quotes", AlarmMinus, true],
      ["Initial Cap Styler", "Style initial caps", AlarmPlus, true],
      ["Running Head Previewer", "Preview running heads", ScanEye, true],
      ["Text Box Shape Wrapper", "Wrap text around shapes", AlarmSmoke, true],
      ["Optical Margin Alignment Preview", "Preview optical alignment", ReceiptJapaneseYen, true],
    ]),
  },
  {
    name: "Accessibility & Readability",
    tools: mk([
      ["Readability Score Calculator", "Score reading difficulty", BookA, true],
      ["Contrast Text Checker", "Check text color contrast", BookAudio, true],
      ["Dyslexia Font Simulator", "Simulate dyslexia-friendly type", Album, true],
      ["WCAG Font Size Checker", "Check sizes against WCAG", AlertCircle, true],
      ["Font Accessibility Evaluator", "Evaluate font accessibility", BookCheck, true],
      ["Body Text Legibility Grader", "Grade body text legibility", AlertOctagon, true],
      ["Color on Color Text Checker", "Test colored text on color", AlertTriangle, true],
      ["Font for Elderly Simulator", "Simulate elder-friendly type", AlignCenter, true],
      ["Low Vision Font Tester", "Test fonts for low vision", ScanEye, true],
      ["Mobile Font Size Checker", "Verify mobile text sizes", AlignCenterHorizontal, true],
    ]),
  },
  {
    name: "CSS & Web Typography",
    tools: mk([
      ["CSS Font Stack Builder", "Build robust font-family stacks", CopyMinus, true],
      ["@font-face Generator", "Generate @font-face rules", AlignCenterVertical, true],
      ["CSS Variable Font Builder", "Build variable font CSS", CodeSquare, true],
      ["Google Fonts CSS Generator", "Generate Google Fonts links", CodeXml, true],
      ["System Font Stack Generator", "Generate system font stacks", CopyPlus, true],
      ["Font Loading Strategy Builder", "Plan font loading strategy", AlignEndHorizontal, true],
      ["CSS Fluid Typography Builder", "Build fluid CSS typography", Codepen, true],
      ["CSS Clamp Calculator", "Calculate clamp() values", Codesandbox, true],
      ["Text Shadow Builder", "Design CSS text shadows", Sparkles, true],
      ["Text Gradient Maker", "Create CSS text gradients", AlignEndVertical, true],
      ["CSS Letter Spacing Tool", "Generate letter-spacing CSS", Grid2x2Check, true],
      ["CSS Line Height Tool", "Generate line-height CSS", FileCode, true],
    ]),
  },
  {
    name: "Print & Editorial Typography",
    tools: mk([
      ["Print Type Specification Sheet", "Spec sheet for print", Printer, true],
      ["Editorial Style Guide Generator", "Generate editorial guides", PrinterCheck, true],
      ["Magazine Column Setter", "Set magazine columns", LayoutDashboard, true],
      ["Newspaper Typography Previewer", "Preview newspaper type", BluetoothSearching, true],
      ["Book Interior Layout Preview", "Preview book interiors", CalendarSearch, true],
      ["Footnote & Endnote Formatter", "Format notes consistently", AlignHorizontalDistributeCenter, true],
      ["Running Head Planner", "Plan running heads", AlignHorizontalDistributeEnd, true],
      ["Chapter Header Designer", "Design chapter headers", AlignHorizontalDistributeStart, true],
      ["Table of Contents Typesetter", "Typeset a TOC", AlignHorizontalJustifyCenter, true],
      ["Index Page Layout Preview", "Preview index pages", FileSearch, true],
    ]),
  },
  {
    name: "Decorative & Specialty Type",
    tools: mk([
      ["Lettering Style Previewer", "Preview lettering styles", FileSearch2, true],
      ["Outlined Text Generator", "Generate outlined text", AlignHorizontalJustifyEnd, true],
      ["Shadow Text Generator", "Generate shadowed text", WandSparkles, true],
      ["3D Text Effect Preview", "Preview 3D text effects", FolderSearch, true],
      ["Neon Text Previewer", "Preview neon glow text", FolderSearch2, true],
      ["Retro Type Style Maker", "Make retro type styles", AlignHorizontalJustifyStart, true],
      ["Hand-Lettering Guide Sheet", "Print hand-lettering guides", AlignHorizontalSpaceAround, true],
      ["Calligraphy Guideline Generator", "Make calligraphy guides", AlignHorizontalSpaceBetween, true],
      ["Monogram Letter Designer", "Design monograms", AlignJustify, true],
      ["Logo Type Tester", "Test type as a logo", BluetoothSearching, true],
    ]),
  },
];

export const allTools: Tool[] = categories.flatMap((c) =>
  c.tools.map((t) => ({ ...t, category: c.name } as Tool & { category: string })),
);

export function findTool(slug: string) {
  for (const c of categories) {
    const t = c.tools.find((t) => t.slug === slug);
    if (t) return { tool: t, category: c.name };
  }
  return null;
}

export const SEARCH_REGISTRY: ToolResult[] = categories.flatMap((cat) =>
  cat.tools.map((tool) => ({
    name: tool.name,
    description: tool.desc,
    slug: tool.slug,
    href: `/typography/${tool.slug}`,
    category: cat.name,
    isBuilt: tool.status === "live",
  }))
);

/**
 * Wired components for live tools. This is the SAME map the [slug] page renders
 * from (components/tools/registry.ts) — one wiring surface, so the registry's
 * live flags and the page can never disagree about what actually renders.
 */
const COMP_MAP: Record<string, ComponentType<any>> = TOOL_COMPONENTS;

export const categoriesWithComponents = categories.map((cat) => {
  return {
    ...cat,
    tools: cat.tools.map((tool) => {
      return {
        ...tool,
        component: COMP_MAP[tool.slug],
      };
    }),
  };
});

export const allToolsWithComponents = categoriesWithComponents.flatMap((c) =>
  c.tools.map((tool) => ({ ...tool, category: c.name }))
);

export function findToolWithComponent(slug: string) {
  for (const c of categoriesWithComponents) {
    const t = c.tools.find((t) => t.slug === slug);
    if (t) return { tool: t, category: c.name };
  }
  return null;
}
