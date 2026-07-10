import { ToolResult } from "@/components/CategorySearch";

export type Tool = {
  name: string;
  slug: string;
  desc: string;
  built?: boolean;
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

const mk = (entries: [string, string][], builtSlugs: string[] = []): Tool[] =>
  entries.map(([name, desc]) => {
    const slug = slugify(name);
    return { name, slug, desc, built: builtSlugs.includes(slug) };
  });

export const categories: Category[] = [
  {
    name: "Font Preview & Testing",
    tools: mk(
      [
        ["Font Previewer", "Preview any font with custom text and sizes"],
        ["Web Font Tester", "Test web fonts live in your browser"],
        ["Custom Text Font Preview", "Try fonts with your own copy"],
        ["Waterfall Font Preview", "See a font at every size at once"],
        ["Pangram Font Tester", "Preview with classic pangram strings"],
        ["Font Specimen Sheet", "Generate a printable specimen sheet"],
        ["Multi-Font Comparison", "Compare several fonts side by side"],
        ["Font Size Preview", "Preview a font at multiple sizes"],
        ["Font Line Height Tester", "Dial in the perfect line height"],
        ["Font Letter Spacing Tester", "Fine-tune letter spacing"],
        ["Variable Font Sliders", "Explore variable font axes"],
        ["Font Rendering Preview", "See anti-aliasing and rendering"],
      ],
      ["font-previewer"],
    ),
  },
  {
    name: "Font Pairing",
    tools: mk([
      ["Font Pairing Suggester", "Get smart pairing suggestions"],
      ["Serif + Sans Pairing Tool", "Classic serif and sans combos"],
      ["Display + Body Pairing Tool", "Pair display with readable body"],
      ["Heading + Caption Pairing", "Find headings that match captions"],
      ["Contrast Pairing Checker", "Check contrast between two fonts"],
      ["Font Harmony Visualizer", "Visualize harmony of a pairing"],
      ["Brand Font Stack Builder", "Build a complete brand stack"],
      ["Monospace Pairing Tool", "Pair monospace with other faces"],
      ["Google Fonts Pairing Picker", "Pick pairs from Google Fonts"],
      ["Font Style Contrast Analyzer", "Analyze stylistic contrast"],
    ]),
  },
  {
    name: "Type Scale & Spacing",
    tools: mk([
      ["Type Scale Generator", "Generate a modular type scale"],
      ["Modular Scale Calculator", "Calculate ratios for type"],
      ["Fluid Type Scale Builder", "Build clamp-based fluid scales"],
      ["Baseline Grid Calculator", "Lock text to a baseline grid"],
      ["Line Height Optimizer", "Optimize leading for readability"],
      ["Letter Spacing Calculator", "Calculate tracking values"],
      ["Paragraph Width Optimizer", "Optimize characters per line"],
      ["Vertical Rhythm Builder", "Compose a vertical rhythm"],
      ["Type Hierarchy Planner", "Plan headings and body sizes"],
      ["Heading Scale Visualizer", "Visualize H1–H6 scale"],
      ["Caption & Footnote Scale", "Scale captions and footnotes"],
      ["CSS Typography Token Generator", "Export CSS type tokens"],
    ]),
  },
  {
    name: "Font Conversion & Export",
    tools: mk([
      ["Font Format Converter", "Convert TTF, OTF, WOFF, WOFF2"],
      ["Web Font Subsetter", "Subset fonts for the web"],
      ["Font Character Extractor", "Extract characters from a font"],
      ["Font Base64 Encoder", "Encode fonts as base64"],
      ["Font CSS Generator", "Generate font CSS quickly"],
      ["Font Face Declaration Builder", "Build @font-face rules"],
      ["Variable Font Axis Exporter", "Export variable font axes"],
      ["Font Glyph PNG Exporter", "Export glyphs as PNG"],
      ["Font Metadata Editor", "Edit font name table metadata"],
      ["Font License Inspector", "Inspect bundled font licenses"],
    ]),
  },
  {
    name: "Glyph & Character Tools",
    tools: mk([
      ["Glyph Browser", "Browse every glyph in a font"],
      ["Unicode Character Explorer", "Explore Unicode characters"],
      ["Special Character Picker", "Pick special characters fast"],
      ["Dingbat & Symbol Explorer", "Find dingbats and symbols"],
      ["Ligature Finder", "Discover ligatures in a font"],
      ["Kerning Pair Inspector", "Inspect kerning pairs"],
      ["OpenType Feature Explorer", "Toggle OpenType features"],
      ["Glyph Comparison Tool", "Compare glyphs across fonts"],
      ["Missing Glyph Detector", "Detect missing glyphs"],
      ["Character Code Converter", "Convert character codes"],
      ["Unicode Block Explorer", "Explore Unicode blocks"],
      ["Emoji Unicode Mapper", "Map emoji to Unicode points"],
    ]),
  },
  {
    name: "Text Rendering & Layout",
    tools: mk([
      ["Text Column Layout Builder", "Build multi-column text"],
      ["Text Justification Previewer", "Preview justified text"],
      ["Hyphenation Tester", "Test hyphenation behavior"],
      ["Widow & Orphan Detector", "Spot widows and orphans"],
      ["Drop Cap Generator", "Generate elegant drop caps"],
      ["Pull Quote Designer", "Design pull quotes"],
      ["Initial Cap Styler", "Style initial caps"],
      ["Running Head Previewer", "Preview running heads"],
      ["Text Box Shape Wrapper", "Wrap text around shapes"],
      ["Optical Margin Alignment Preview", "Preview optical alignment"],
    ]),
  },
  {
    name: "Accessibility & Readability",
    tools: mk([
      ["Readability Score Calculator", "Score reading difficulty"],
      ["Contrast Text Checker", "Check text color contrast"],
      ["Dyslexia Font Simulator", "Simulate dyslexia-friendly type"],
      ["WCAG Font Size Checker", "Check sizes against WCAG"],
      ["Font Accessibility Evaluator", "Evaluate font accessibility"],
      ["Body Text Legibility Grader", "Grade body text legibility"],
      ["Color on Color Text Checker", "Test colored text on color"],
      ["Font for Elderly Simulator", "Simulate elder-friendly type"],
      ["Low Vision Font Tester", "Test fonts for low vision"],
      ["Mobile Font Size Checker", "Verify mobile text sizes"],
    ]),
  },
  {
    name: "CSS & Web Typography",
    tools: mk([
      ["CSS Font Stack Builder", "Build robust font-family stacks"],
      ["@font-face Generator", "Generate @font-face rules"],
      ["CSS Variable Font Builder", "Build variable font CSS"],
      ["Google Fonts CSS Generator", "Generate Google Fonts links"],
      ["System Font Stack Generator", "Generate system font stacks"],
      ["Font Loading Strategy Builder", "Plan font loading strategy"],
      ["CSS Fluid Typography Builder", "Build fluid CSS typography"],
      ["CSS Clamp Calculator", "Calculate clamp() values"],
      ["Text Shadow Builder", "Design CSS text shadows"],
      ["Text Gradient Maker", "Create CSS text gradients"],
      ["CSS Letter Spacing Tool", "Generate letter-spacing CSS"],
      ["CSS Line Height Tool", "Generate line-height CSS"],
    ]),
  },
  {
    name: "Print & Editorial Typography",
    tools: mk([
      ["Print Type Specification Sheet", "Spec sheet for print"],
      ["Editorial Style Guide Generator", "Generate editorial guides"],
      ["Magazine Column Setter", "Set magazine columns"],
      ["Newspaper Typography Previewer", "Preview newspaper type"],
      ["Book Interior Layout Preview", "Preview book interiors"],
      ["Footnote & Endnote Formatter", "Format notes consistently"],
      ["Running Head Planner", "Plan running heads"],
      ["Chapter Header Designer", "Design chapter headers"],
      ["Table of Contents Typesetter", "Typeset a TOC"],
      ["Index Page Layout Preview", "Preview index pages"],
    ]),
  },
  {
    name: "Decorative & Specialty Type",
    tools: mk([
      ["Lettering Style Previewer", "Preview lettering styles"],
      ["Outlined Text Generator", "Generate outlined text"],
      ["Shadow Text Generator", "Generate shadowed text"],
      ["3D Text Effect Preview", "Preview 3D text effects"],
      ["Neon Text Previewer", "Preview neon glow text"],
      ["Retro Type Style Maker", "Make retro type styles"],
      ["Hand-Lettering Guide Sheet", "Print hand-lettering guides"],
      ["Calligraphy Guideline Generator", "Make calligraphy guides"],
      ["Monogram Letter Designer", "Design monograms"],
      ["Logo Type Tester", "Test type as a logo"],
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
    href: `/typography/tools/${tool.slug}`,
    category: cat.name,
    isBuilt: tool.built ?? false,
  }))
);