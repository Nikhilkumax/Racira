import { ToolResult } from "@/components/CategorySearch";

export type Tool = {
  slug: string;
  name: string;
  description: string;
  icon: string; // lucide icon name (PascalCase)
};

export type Category = {
  title: string;
  slug: string;
  tools: Tool[];
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\+/g, "plus")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const mk = (name: string, description: string, icon: string): Tool => ({
  slug: slugify(name),
  name,
  description,
  icon,
});

export const categories: Category[] = [
  {
    title: "Slide Creation & Editing",
    slug: "slide-creation-and-editing",
    tools: [
      mk("Slide Deck Builder", "Build full decks in your browser", "LayoutTemplate"),
      mk("Single Slide Editor", "Design one slide at a time", "Square"),
      mk("Multi-Slide Deck Manager", "Manage and organize multiple slides", "Layers"),
      mk("Slide Template Library", "Browse ready-made slide templates", "LibraryBig"),
      mk("Slide Layout Selector", "Pick the perfect layout per slide", "LayoutGrid"),
      mk("Slide Master Editor", "Edit the master slide for the deck", "Crown"),
      mk("Slide Theme Builder", "Create a reusable visual theme", "Palette"),
      mk("Slide Color Scheme Editor", "Define a color scheme for slides", "SwatchBook"),
      mk("Slide Font Pairing Tool", "Pair fonts for headings and body", "Type"),
      mk("Slide Background Creator", "Design custom slide backgrounds", "Image"),
      mk("Slide Gradient Generator", "Create gradient backgrounds for slides", "Blend"),
      mk("Slide Pattern Library", "Apply geometric patterns to slides", "Grid2x2"),
      mk("Slide Shape Tool", "Insert and style shapes on slides", "Shapes"),
      mk("Slide Border & Frame Tool", "Add borders and frames to slides", "Square"),
      mk("Slide Spacing Adjuster", "Fine-tune slide padding and margins", "Move"),
      mk("Slide Alignment Tool", "Align elements precisely on a slide", "AlignCenter"),
      mk("Slide Snap-to-Grid Tool", "Snap elements to a layout grid", "Grid3x3"),
      mk("Slide Versioning Tool", "Save and restore slide versions", "History"),
    ],
  },
  {
    title: "Content Blocks",
    slug: "content-blocks",
    tools: [
      mk("Text Content Block Editor", "Edit rich text blocks on slides", "TextCursor"),
      mk("Heading Hierarchy Tool", "Structure headings clearly", "Heading"),
      mk("Bullet Point Formatter", "Format clean bullet lists", "List"),
      mk("Numbered List Builder", "Build ordered numbered lists", "ListOrdered"),
      mk("Quote Block Designer", "Design beautiful quote blocks", "Quote"),
      mk("Call-Out Box Builder", "Highlight info with call-out boxes", "MessageSquare"),
      mk("Key Stat / Metric Card", "Showcase key numbers and KPIs", "Gauge"),
      mk("Icon + Text Block Builder", "Combine icons with text blocks", "Sparkles"),
      mk("Image + Caption Block", "Add images with captions", "ImagePlus"),
      mk("Table Block Builder", "Insert tables into slides", "Table"),
      mk("Code Snippet Block", "Display syntax-highlighted code", "Code2"),
      mk("Video Embed Block", "Embed videos directly into slides", "Video"),
      mk("Audio Clip Block", "Add audio clips to slides", "Music"),
      mk("Pull Quote Block", "Emphasize key quotes in large type", "Quote"),
      mk("Stat Comparison Block", "Compare two metrics side by side", "BarChart2"),
      mk("Checklist Block Builder", "Build interactive checklists", "CheckSquare"),
      mk("Definition Block", "Showcase term definitions clearly", "BookOpen"),
      mk("Testimonial Block Builder", "Display customer testimonials", "MessageCircle"),
    ],
  },
  {
    title: "Data Visualization in Slides",
    slug: "data-visualization-in-slides",
    tools: [
      mk("Chart Slide Builder", "Create bar, line, and pie charts", "BarChart3"),
      mk("Data Table Slide Creator", "Slides built around data tables", "Sheet"),
      mk("Infographic Slide Builder", "Design infographic-style slides", "PieChart"),
      mk("Timeline Slide Builder", "Visualize timelines on a slide", "GitCommitHorizontal"),
      mk("Comparison Slide Builder", "Side-by-side comparisons", "Columns2"),
      mk("KPI Dashboard Slide", "Compact dashboard-style slide", "LayoutDashboard"),
      mk("Funnel Chart Slide", "Show funnels and conversions", "Filter"),
      mk("Org Chart Slide Builder", "Visualize org structures", "Network"),
      mk("Process Diagram Slide", "Map out processes visually", "Workflow"),
      mk("Roadmap Slide Creator", "Plan and present roadmaps", "Map"),
      mk("Heatmap Slide Builder", "Visualize density and intensity", "Grid2x2"),
      mk("Gantt Chart Slide", "Project schedules at a glance", "GanttChart"),
      mk("Scatter Plot Slide", "Plot correlations between data points", "ScatterChart"),
      mk("Area Chart Slide", "Show volume changes over time", "AreaChart"),
      mk("Bubble Chart Slide", "Three-dimensional data bubbles", "CircleDot"),
      mk("Radar Chart Slide", "Multi-axis radar comparisons", "Radar"),
      mk("Pyramid Chart Slide", "Hierarchies as pyramid layers", "Triangle"),
    ],
  },
  {
    title: "Design & Layout",
    slug: "design-and-layout",
    tools: [
      mk("Grid Layout Slide Tool", "Build clean grid-based slides", "Grid3x3"),
      mk("Masonry Layout Slide", "Staggered masonry slide layouts", "LayoutGrid"),
      mk("Full-Bleed Image Slide", "Edge-to-edge image slides", "Image"),
      mk("Split-Screen Slide Layout", "Two-pane slide compositions", "SquareSplitHorizontal"),
      mk("Magazine-Style Slide Layout", "Editorial magazine layouts", "Newspaper"),
      mk("Minimalist Slide Designer", "Clean, restrained slide design", "Minus"),
      mk("Bold Typography Slide", "Make type the hero", "Type"),
      mk("Icon-Only Slide Builder", "Slides driven by icons", "Shapes"),
      mk("Color Block Slide Builder", "Bold color block layouts", "Square"),
      mk("Logo Slide Builder", "Showcase logos on a slide", "Hexagon"),
      mk("Asymmetric Layout Slide", "Off-balance editorial layouts", "LayoutPanelLeft"),
      mk("Centered Hero Slide", "Single focal point compositions", "Crosshair"),
      mk("Sidebar Layout Slide", "Slides with vertical sidebar", "PanelLeft"),
      mk("Card Stack Layout", "Stacked card-style layouts", "Layers"),
      mk("Bento Grid Slide Layout", "Modular bento-style grids", "LayoutGrid"),
      mk("Vertical Slide Layout", "Tall scrolling slide layouts", "MoveVertical"),
      mk("Dark Mode Slide Theme", "Pre-built dark slide styles", "Moon"),
    ],
  },
  {
    title: "Presentation Types",
    slug: "presentation-types",
    tools: [
      mk("Pitch Deck Builder", "Build a startup pitch deck", "Rocket"),
      mk("Sales Deck Builder", "Decks that close deals", "TrendingUp"),
      mk("Investor Deck Template", "Templates for investor decks", "Briefcase"),
      mk("Product Demo Deck Builder", "Demo your product clearly", "MonitorPlay"),
      mk("Training Presentation Builder", "Build training decks", "GraduationCap"),
      mk("Conference Talk Deck", "Decks for stage talks", "Mic"),
      mk("Workshop Slide Builder", "Run engaging workshops", "Wrench"),
      mk("Webinar Slide Builder", "Slides optimized for webinars", "Video"),
      mk("School Project Presentation Builder", "Decks for school projects", "BookOpen"),
      mk("Portfolio Presentation Builder", "Present your portfolio", "Image"),
      mk("Quarterly Business Review Deck", "Build QBR presentations", "CalendarRange"),
      mk("All-Hands Meeting Deck", "Decks for company-wide updates", "Users"),
      mk("Keynote Speech Builder", "Craft a memorable keynote", "Sparkles"),
      mk("Case Study Deck Builder", "Tell compelling case studies", "FileText"),
      mk("Marketing Plan Deck", "Present marketing strategies", "Megaphone"),
      mk("Financial Report Deck", "Present financials clearly", "DollarSign"),
      mk("Nonprofit Impact Deck", "Showcase mission impact", "HandHeart"),
    ],
  },
  {
    title: "Narrative & Structure",
    slug: "narrative-and-structure",
    tools: [
      mk("Presentation Outline Builder", "Outline your deck end-to-end", "ListTree"),
      mk("Story Arc Planner", "Plan a narrative story arc", "Waves"),
      mk("Introduction Slide Builder", "Open strong with intros", "Play"),
      mk("Problem-Solution Slide Builder", "Frame problem and solution", "Lightbulb"),
      mk("Before & After Slide Builder", "Show transformation", "ArrowRightLeft"),
      mk("Agenda Slide Builder", "Set the agenda clearly", "ListChecks"),
      mk("Transition Slide Builder", "Smooth section transitions", "MoveRight"),
      mk("Summary / Recap Slide Builder", "Recap key takeaways", "BookmarkCheck"),
      mk("Next Steps / CTA Slide Builder", "Drive next-step actions", "ArrowRight"),
      mk("Thank You / End Slide Builder", "Close with impact", "Heart"),
      mk("Cliffhanger Slide Builder", "End sections with suspense", "Pause"),
      mk("Three-Act Structure Planner", "Plan story in three acts", "Film"),
      mk("Audience Hook Generator", "Create attention-grabbing openers", "Anchor"),
      mk("Tension & Release Mapper", "Pace your narrative beats", "Activity"),
      mk("Section Divider Slide", "Mark chapter breaks visually", "SeparatorHorizontal"),
      mk("Mini-Conclusion Slide", "Wrap up each section neatly", "CheckCircle2"),
      mk("Story Loop Closure Tool", "Tie endings back to openings", "Repeat"),
    ],
  },
  {
    title: "Export & Sharing",
    slug: "export-and-sharing",
    tools: [
      mk("Presentation to PDF Exporter", "Export the full deck to PDF", "FileText"),
      mk("Slide to PNG Exporter", "Export slides as PNG images", "FileImage"),
      mk("Slide to JPEG Exporter", "Export slides as JPEG images", "Image"),
      mk("Slide Thumbnail Generator", "Generate slide thumbnails", "Images"),
      mk("Presentation Print Layout Tool", "Layouts optimized for print", "Printer"),
      mk("Speaker Notes Exporter", "Export presenter notes", "NotebookPen"),
      mk("Slide Deck Embed Code Builder", "Generate embed snippets", "Code"),
      mk("QR Code for Slide Share", "Share decks via QR code", "QrCode"),
      mk("Full-Screen Presentation Mode", "Present in full screen", "Maximize"),
      mk("Kiosk Mode Presentation Player", "Loop decks for kiosks", "Monitor"),
      mk("Shareable Link Generator", "Create shareable deck links", "Link"),
      mk("Slide Handout Builder", "Generate audience handouts", "FileOutput"),
      mk("Deck Compression Tool", "Optimize deck file size", "Archive"),
      mk("Slide to GIF Exporter", "Export slides as animated GIFs", "Film"),
      mk("Presenter View Exporter", "Export presenter-only view", "Eye"),
      mk("Offline Bundle Exporter", "Package deck for offline use", "Download"),
      mk("Password-Protected Deck Tool", "Protect shared decks with a code", "Lock"),
    ],
  },
  {
    title: "Speaker & Delivery Tools",
    slug: "speaker-and-delivery-tools",
    tools: [
      mk("Presentation Timer", "Time your talk with alerts", "Timer"),
      mk("Speaker Notes Teleprompter", "Scroll notes like a teleprompter", "ScrollText"),
      mk("Slide Countdown Timer", "Per-slide countdown timer", "TimerReset"),
      mk("Q&A Slide Template Builder", "Templates for Q&A moments", "MessageCircleQuestion"),
      mk("Audience Poll Slide Builder", "Local audience poll slides", "Vote"),
      mk("Rehearsal Timer", "Time full deck rehearsals", "Clock"),
      mk("Slide Clicker Simulator", "Simulate a slide clicker", "MousePointerClick"),
      mk("Presentation Practice Recorder", "Record and review practice runs", "Mic"),
      mk("Key Message Summary Card", "Distill your key message", "StickyNote"),
      mk("Slide Annotation Live Tool", "Annotate slides live on stage", "Pencil"),
      mk("Laser Pointer Simulator", "Virtual laser pointer for slides", "MousePointer2"),
      mk("Whiteboard Overlay Tool", "Draw over slides live", "PenLine"),
      mk("Speaker Confidence Monitor", "Track pace and hesitations", "Activity"),
      mk("Audience Engagement Tracker", "Track engagement during talks", "Users"),
      mk("Backup Slide Vault", "Hold extra slides for Q&A", "Vault"),
      mk("Talk Script Generator", "Convert outlines to scripts", "FileText"),
      mk("Voice Pacing Coach", "Coach speaking pace in practice", "Mic2"),
    ],
  },
  {
    title: "Assets & Resources",
    slug: "assets-and-resources",
    tools: [
      mk("Stock Photo Placeholder Grid", "Drop in photo placeholders", "Image"),
      mk("Icon Library for Presentations", "Browse a presentation icon set", "Shapes"),
      mk("Background Texture Library", "Find background textures", "Layers"),
      mk("Slide Mockup Previewer", "Preview slides on a device", "Laptop"),
      mk("Brand Asset Integration Tool", "Bring brand assets into slides", "Palette"),
      mk("Slide Asset Organizer", "Organize all slide assets", "FolderOpen"),
      mk("Color Palette Applier", "Apply a palette across all slides", "SwatchBook"),
      mk("Font Loader for Presentations", "Load custom fonts in decks", "Type"),
      mk("Logo Placement Tool", "Place logos consistently", "BadgePlus"),
      mk("Watermark Layer Tool", "Add watermarks to slides", "Droplets"),
      mk("Illustration Library", "Browse curated illustrations", "Paintbrush"),
      mk("Emoji Picker for Slides", "Insert emoji into slides", "Smile"),
      mk("3D Shape Library", "Add 3D shapes to your slides", "Box"),
      mk("Sticker Pack Library", "Drop in playful stickers", "Sticker"),
      mk("Animated GIF Library", "Browse decorative GIFs", "Film"),
      mk("Sound Effect Library", "Add subtle sound effects", "Volume2"),
      mk("Music Loop Library", "Background music for kiosks", "Music2"),
    ],
  },
  {
    title: "Utilities",
    slug: "utilities",
    tools: [
      mk("Slide Count Manager", "Track and limit slide count", "Hash"),
      mk("Slide Duplication Tool", "Duplicate any slide fast", "Copy"),
      mk("Slide Reorder Tool", "Drag to reorder slides", "ArrowUpDown"),
      mk("Slide Hide / Show Toggle", "Hide slides without deleting", "Eye"),
      mk("Slide Notes Manager", "Manage notes across slides", "NotebookPen"),
      mk("Master Slide Override Tool", "Override the master per slide", "Crown"),
      mk("Presentation Accessibility Checker", "Check accessibility locally", "Accessibility"),
      mk("Alt Text Manager for Slide Images", "Manage image alt text", "Text"),
      mk("Slide Comparison Tool", "Compare two slides side-by-side", "GitCompare"),
      mk("Presentation Feedback Template", "Collect structured feedback", "MessageSquareText"),
      mk("Slide Spell Check Tool", "Catch typos across the deck", "SpellCheck"),
      mk("Slide Word Count Tool", "Count words per slide", "Hash"),
      mk("Reading Time Estimator", "Estimate reading time per slide", "Clock"),
      mk("Slide Search Tool", "Search inside your deck", "Search"),
      mk("Slide Tag Manager", "Tag and filter slides", "Tag"),
      mk("Slide Lock Tool", "Lock slides from edits", "Lock"),
      mk("Slide Color Contrast Checker", "Check contrast for readability", "Contrast"),
      mk("Slide Backup & Restore", "Snapshot and roll back decks", "Save"),
      mk("Slide Auto-Save Tool", "Continuously save slide edits", "RefreshCw"),
      mk("Deck Statistics Dashboard", "See deck-wide stats at a glance", "BarChart"),
    ],
  },
];

export const allTools: (Tool & { category: string; categorySlug: string })[] =
  categories.flatMap((c) =>
    c.tools.map((t) => ({ ...t, category: c.title, categorySlug: c.slug })),
  );

export const totalToolCount = allTools.length;

export function getToolBySlug(slug: string) {
  return allTools.find((t) => t.slug === slug);
}

export const SEARCH_REGISTRY: ToolResult[] = categories.flatMap((cat) =>
  cat.tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    slug: tool.slug,
    href: `/presentation/tools/${tool.slug}`,
    category: cat.title,
    isBuilt: false,
  }))
);
