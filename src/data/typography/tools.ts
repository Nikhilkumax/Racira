import { AArrowDown, AArrowUp, ALargeSmall, Accessibility, Activity, ActivitySquare, AirVent, Airplay, AlarmCheck, AlarmClock, AlarmClockCheck, AlarmClockMinus, AlarmClockOff, AlarmClockPlus, AlarmMinus, AlarmPlus, AlarmSmoke, Album, AlertCircle, AlertOctagon, AlertTriangle, AlignCenter, AlignCenterHorizontal, AlignCenterVertical, AlignEndHorizontal, AlignEndVertical, AlignHorizontalDistributeCenter, AlignHorizontalDistributeEnd, AlignHorizontalDistributeStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, AlignHorizontalJustifyStart, AlignHorizontalSpaceAround, AlignHorizontalSpaceBetween, AlignJustify, ArrowRight, ArrowRightCircle, ArrowRightFromLine, ArrowRightLeft, ArrowRightSquare, BadgeJapaneseYen, Barcode, BluetoothSearching, Book, BookA, BookAudio, BookCheck, BookCopy, BookType, CalendarSearch, ClipboardCopy, ClipboardType, Code, Code2, CodeSquare, CodeXml, Codepen, Codesandbox, Copy, CopyCheck, CopyMinus, CopyPlus, Eye, EyeClosed, EyeOff, FileCode, FileSearch, FileSearch2, FileType, FileType2, FolderSearch, FolderSearch2, Grid, Grid2X2, Grid2X2Plus, Grid2x2, Grid2x2Check, JapaneseYen, Layers, Layers2, Layers3, Layout, LayoutDashboard, PencilRuler, Printer, PrinterCheck, ReceiptJapaneseYen, Ruler, ScanEye, Search, Sparkles, WandSparkles } from "lucide-react";
import { ToolResult } from "@/components/CategorySearch";

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

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\+/g, "plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const mk = (entries: [string, string, any, boolean][]): Tool[] =>
  entries.map(([name, desc, icon, isLive]) => {
    const slug = slugify(name);
    return { name, slug, desc, icon, status: isLive ? "live" : "soon" };
  });

export const categories: Category[] = [
  {
    name: "Font Preview & Testing",
    tools: mk([
      ["Font Previewer", "Preview any font with custom text and sizes", Eye, true],
      ["Web Font Tester", "Test web fonts live in your browser", Search, false],
      ["Custom Text Font Preview", "Try fonts with your own copy", EyeClosed, false],
      ["Waterfall Font Preview", "See a font at every size at once", EyeOff, false],
      ["Pangram Font Tester", "Preview with classic pangram strings", JapaneseYen, false],
      ["Font Specimen Sheet", "Generate a printable specimen sheet", AArrowDown, false],
      ["Multi-Font Comparison", "Compare several fonts side by side", AArrowUp, false],
      ["Font Size Preview", "Preview a font at multiple sizes", BadgeJapaneseYen, false],
      ["Font Line Height Tester", "Dial in the perfect line height", Eye, false],
      ["Font Letter Spacing Tester", "Fine-tune letter spacing", EyeClosed, false],
      ["Variable Font Sliders", "Explore variable font axes", ALargeSmall, false],
      ["Font Rendering Preview", "See anti-aliasing and rendering", EyeOff, false],
      ["Font Pairing Suggester", "Get smart pairing suggestions", Layers, false],
      ["Serif + Sans Pairing Tool", "Classic serif and sans combos", Layers2, false],
      ["Display + Body Pairing Tool", "Pair display with readable body", Layers3, false],
      ["Heading + Caption Pairing", "Find headings that match captions", Layers, false],
      ["Contrast Pairing Checker", "Check contrast between two fonts", Layers2, false],
      ["Font Harmony Visualizer", "Visualize harmony of a pairing", Layers3, false],
      ["Brand Font Stack Builder", "Build a complete brand stack", BookCopy, false],
      ["Monospace Pairing Tool", "Pair monospace with other faces", ClipboardCopy, false],
      ["Google Fonts Pairing Picker", "Pick pairs from Google Fonts", Copy, false],
      ["Font Style Contrast Analyzer", "Analyze stylistic contrast", Book, false],
    ]),
  },
  {
    name: "Type Scale & Spacing",
    tools: mk([
      ["Type Scale Generator", "Generate a modular type scale", PencilRuler, false],
      ["Modular Scale Calculator", "Calculate ratios for type", Ruler, false],
      ["Fluid Type Scale Builder", "Build clamp-based fluid scales", PencilRuler, false],
      ["Baseline Grid Calculator", "Lock text to a baseline grid", Ruler, false],
      ["Line Height Optimizer", "Optimize leading for readability", Accessibility, false],
      ["Letter Spacing Calculator", "Calculate tracking values", Grid, false],
      ["Paragraph Width Optimizer", "Optimize characters per line", Grid2X2, false],
      ["Vertical Rhythm Builder", "Compose a vertical rhythm", Activity, false],
      ["Type Hierarchy Planner", "Plan headings and body sizes", ActivitySquare, false],
      ["Heading Scale Visualizer", "Visualize H1–H6 scale", Grid2X2Plus, false],
      ["Caption & Footnote Scale", "Scale captions and footnotes", Grid2x2, false],
      ["CSS Typography Token Generator", "Export CSS type tokens", Barcode, false],
    ]),
  },
  {
    name: "Font Conversion & Export",
    tools: mk([
      ["Font Format Converter", "Convert TTF, OTF, WOFF, WOFF2", ArrowRight, false],
      ["Web Font Subsetter", "Subset fonts for the web", Code, false],
      ["Font Character Extractor", "Extract characters from a font", BookType, false],
      ["Font Base64 Encoder", "Encode fonts as base64", ArrowRightCircle, false],
      ["Font CSS Generator", "Generate font CSS quickly", Code2, false],
      ["Font Face Declaration Builder", "Build @font-face rules", AirVent, false],
      ["Variable Font Axis Exporter", "Export variable font axes", ArrowRightFromLine, false],
      ["Font Glyph PNG Exporter", "Export glyphs as PNG", ArrowRightLeft, false],
      ["Font Metadata Editor", "Edit font name table metadata", Airplay, false],
      ["Font License Inspector", "Inspect bundled font licenses", AlarmCheck, false],
    ]),
  },
  {
    name: "Glyph & Character Tools",
    tools: mk([
      ["Glyph Browser", "Browse every glyph in a font", ClipboardType, false],
      ["Unicode Character Explorer", "Explore Unicode characters", FileType, false],
      ["Special Character Picker", "Pick special characters fast", FileType2, false],
      ["Dingbat & Symbol Explorer", "Find dingbats and symbols", AlarmClock, false],
      ["Ligature Finder", "Discover ligatures in a font", AlarmClockCheck, false],
      ["Kerning Pair Inspector", "Inspect kerning pairs", CopyCheck, false],
      ["OpenType Feature Explorer", "Toggle OpenType features", AlarmClockMinus, false],
      ["Glyph Comparison Tool", "Compare glyphs across fonts", BookType, false],
      ["Missing Glyph Detector", "Detect missing glyphs", ClipboardType, false],
      ["Character Code Converter", "Convert character codes", ArrowRightSquare, false],
      ["Unicode Block Explorer", "Explore Unicode blocks", FileType, false],
      ["Emoji Unicode Mapper", "Map emoji to Unicode points", FileType2, false],
    ]),
  },
  {
    name: "Text Rendering & Layout",
    tools: mk([
      ["Text Column Layout Builder", "Build multi-column text", Layout, false],
      ["Text Justification Previewer", "Preview justified text", JapaneseYen, false],
      ["Hyphenation Tester", "Test hyphenation behavior", ReceiptJapaneseYen, false],
      ["Widow & Orphan Detector", "Spot widows and orphans", AlarmClockOff, false],
      ["Drop Cap Generator", "Generate elegant drop caps", AlarmClockPlus, false],
      ["Pull Quote Designer", "Design pull quotes", AlarmMinus, false],
      ["Initial Cap Styler", "Style initial caps", AlarmPlus, false],
      ["Running Head Previewer", "Preview running heads", ScanEye, false],
      ["Text Box Shape Wrapper", "Wrap text around shapes", AlarmSmoke, false],
      ["Optical Margin Alignment Preview", "Preview optical alignment", ReceiptJapaneseYen, false],
    ]),
  },
  {
    name: "Accessibility & Readability",
    tools: mk([
      ["Readability Score Calculator", "Score reading difficulty", BookA, false],
      ["Contrast Text Checker", "Check text color contrast", BookAudio, false],
      ["Dyslexia Font Simulator", "Simulate dyslexia-friendly type", Album, false],
      ["WCAG Font Size Checker", "Check sizes against WCAG", AlertCircle, false],
      ["Font Accessibility Evaluator", "Evaluate font accessibility", BookCheck, false],
      ["Body Text Legibility Grader", "Grade body text legibility", AlertOctagon, false],
      ["Color on Color Text Checker", "Test colored text on color", AlertTriangle, false],
      ["Font for Elderly Simulator", "Simulate elder-friendly type", AlignCenter, false],
      ["Low Vision Font Tester", "Test fonts for low vision", ScanEye, false],
      ["Mobile Font Size Checker", "Verify mobile text sizes", AlignCenterHorizontal, false],
    ]),
  },
  {
    name: "CSS & Web Typography",
    tools: mk([
      ["CSS Font Stack Builder", "Build robust font-family stacks", CopyMinus, false],
      ["@font-face Generator", "Generate @font-face rules", AlignCenterVertical, false],
      ["CSS Variable Font Builder", "Build variable font CSS", CodeSquare, false],
      ["Google Fonts CSS Generator", "Generate Google Fonts links", CodeXml, false],
      ["System Font Stack Generator", "Generate system font stacks", CopyPlus, false],
      ["Font Loading Strategy Builder", "Plan font loading strategy", AlignEndHorizontal, false],
      ["CSS Fluid Typography Builder", "Build fluid CSS typography", Codepen, false],
      ["CSS Clamp Calculator", "Calculate clamp() values", Codesandbox, false],
      ["Text Shadow Builder", "Design CSS text shadows", Sparkles, false],
      ["Text Gradient Maker", "Create CSS text gradients", AlignEndVertical, false],
      ["CSS Letter Spacing Tool", "Generate letter-spacing CSS", Grid2x2Check, false],
      ["CSS Line Height Tool", "Generate line-height CSS", FileCode, false],
    ]),
  },
  {
    name: "Print & Editorial Typography",
    tools: mk([
      ["Print Type Specification Sheet", "Spec sheet for print", Printer, false],
      ["Editorial Style Guide Generator", "Generate editorial guides", PrinterCheck, false],
      ["Magazine Column Setter", "Set magazine columns", LayoutDashboard, false],
      ["Newspaper Typography Previewer", "Preview newspaper type", BluetoothSearching, false],
      ["Book Interior Layout Preview", "Preview book interiors", CalendarSearch, false],
      ["Footnote & Endnote Formatter", "Format notes consistently", AlignHorizontalDistributeCenter, false],
      ["Running Head Planner", "Plan running heads", AlignHorizontalDistributeEnd, false],
      ["Chapter Header Designer", "Design chapter headers", AlignHorizontalDistributeStart, false],
      ["Table of Contents Typesetter", "Typeset a TOC", AlignHorizontalJustifyCenter, false],
      ["Index Page Layout Preview", "Preview index pages", FileSearch, false],
    ]),
  },
  {
    name: "Decorative & Specialty Type",
    tools: mk([
      ["Lettering Style Previewer", "Preview lettering styles", FileSearch2, false],
      ["Outlined Text Generator", "Generate outlined text", AlignHorizontalJustifyEnd, false],
      ["Shadow Text Generator", "Generate shadowed text", WandSparkles, false],
      ["3D Text Effect Preview", "Preview 3D text effects", FolderSearch, false],
      ["Neon Text Previewer", "Preview neon glow text", FolderSearch2, false],
      ["Retro Type Style Maker", "Make retro type styles", AlignHorizontalJustifyStart, false],
      ["Hand-Lettering Guide Sheet", "Print hand-lettering guides", AlignHorizontalSpaceAround, false],
      ["Calligraphy Guideline Generator", "Make calligraphy guides", AlignHorizontalSpaceBetween, false],
      ["Monogram Letter Designer", "Design monograms", AlignJustify, false],
      ["Logo Type Tester", "Test type as a logo", BluetoothSearching, false],
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