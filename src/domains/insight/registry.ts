import { LineChart, BarChart, BarChart2, ChartPie, Target, AreaChart, ChartScatter, CircleDot, BarChart3, SplitSquareHorizontal, Grid3x3, LayoutGrid, Sun, TrendingDown, List, Radar, Palette, MessageSquare, ListEnd, Ruler, MousePointer2, Grid, TrendingUp, Minus, Crosshair, Tag, Download, Eye, FileText, FileJson, FileSpreadsheet, Keyboard, Link, Clipboard, Library, Cable, PlusSquare, Webhook, Wand2, CopyMinus, SearchX, ArrowRightLeft, Type, ArrowUpDown, Filter, RotateCw, RotateCcw, Scale, Layers, Merge, CheckSquare, AlertCircle, Calculator, Grid2x2, GitCommit, Activity, Brackets, Microscope, HelpCircle, Dna, Thermometer, Workflow, Sigma, MoveHorizontal, Mountain, Users, Table, ArrowDownUp, ListFilter, Columns, LayoutTemplate, FoldHorizontal, PaintBucket, Code, FileDigit, ListOrdered, LayoutDashboard, CreditCard, Layout, Timer, Gauge, ClipboardCheck, Monitor, Circle, Zap, FilterX, Calendar, Flag, GitMerge, CircleDashed, Network, GitBranch, AlignVerticalSpaceAround, Flame, Clock, CalendarDays, Map, Compass, Triangle, Route, AlignJustify, Waves, MapPin, CandlestickChart, BookOpen, Layers3, ScrollText, FileBarChart, Captions, Highlighter, Presentation, LayoutList, GraduationCap, Image, FileCode2, Code2, DownloadCloud, Braces, Share2, Printer, DollarSign, Megaphone, Package, UsersRound, Landmark, Briefcase, Settings, ArrowUpRight, MoveDown, Repeat, PenTool, Settings2, Sparkles, TestTube, Bot, Sprout } from "lucide-react";
import { ToolResult } from "@/components/CategorySearch";

export type Tool = { name: string; desc: string; slug: string; icon: any; status: "live" | "soon" };
export type ToolCategory = { name: string; icon: string; tools: Tool[] };

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const mk = (name: string, desc: string, icon: any, built = false): Tool => ({ name, desc, slug: slugify(name), icon, status: built ? "live" : "soon" });

export const CATEGORIES: ToolCategory[] = [
  {
    name: "Chart Creation",
    icon: "LineChart",
    tools: [
      mk("Line Chart Builder", "Build interactive line charts", LineChart, true),
      mk("Bar Chart Builder", "Create vertical bar charts", BarChart),
      mk("Stacked Bar Chart Builder", "Compare composition over categories", BarChart2),
      mk("Pie Chart Builder", "Show parts of a whole", ChartPie),
      mk("Donut Chart Builder", "Pie with a center hole", Target),
      mk("Area Chart Builder", "Filled line charts for trends", AreaChart),
      mk("Scatter Plot Builder", "Plot pairs of values", ChartScatter),
      mk("Bubble Chart Builder", "Three-dimension scatter", CircleDot),
      mk("Histogram Builder", "Show value distributions", BarChart3),
      mk("Box Plot Builder", "Visualize quartiles and outliers", SplitSquareHorizontal),
      mk("Heatmap Builder", "Color-coded data grids", Grid3x3),
      mk("Treemap Builder", "Hierarchical rectangles", LayoutGrid),
      mk("Sunburst Chart Builder", "Radial hierarchy chart", Sun),
      mk("Waterfall Chart Builder", "Track positive/negative changes", TrendingDown),
      mk("Gantt Chart", "Project timelines", List),
      mk("Radar Chart Builder", "Compare multivariate data", Radar),
    ],
  },
  {
    name: "Chart Customization",
    icon: "Palette",
    tools: [
      mk("Chart Color Theme Builder", "Design reusable palettes", Palette),
      mk("Chart Annotation Tool", "Add notes and callouts", MessageSquare),
      mk("Chart Legend Designer", "Style and position legends", ListEnd),
      mk("Chart Axis Formatter", "Format ticks and labels", Ruler),
      mk("Chart Tooltip Customizer", "Design hover tooltips", MousePointer2),
      mk("Chart Grid Line Styler", "Tune grid appearance", Grid),
      mk("Chart Trend Line Adder", "Overlay regression lines", TrendingUp),
      mk("Chart Reference Line Tool", "Mark thresholds and targets", Minus),
      mk("Chart Error Bar Tool", "Show uncertainty", Crosshair),
      mk("Chart Data Label Formatter", "Format value labels", Tag),
      mk("Chart Export Tool", "Export charts as images", Download),
      mk("Chart Accessibility Checker", "Audit for a11y", Eye),
    ],
  },
  {
    name: "Data Input & Import",
    icon: "Upload",
    tools: [
      mk("CSV Data Importer", "Upload CSV into charts", FileText),
      mk("JSON Data Importer", "Import JSON datasets", FileJson),
      mk("Excel Paste Data Tool", "Paste from Excel", FileSpreadsheet),
      mk("Manual Data Entry Table", "Type data by hand", Keyboard),
      mk("Data URL Import Tool", "Fetch data from a URL", Link),
      mk("Clipboard Data Paste Tool", "Paste any clipboard data", Clipboard),
      mk("Sample Dataset Library", "Browse curated datasets", Library),
      mk("Real-Time Data Connector", "Local file streaming", Cable),
      mk("Data Row Generator", "Generate rows on the fly", PlusSquare),
      mk("API Response to Chart Converter", "Turn JSON API into charts", Webhook),
    ],
  },
  {
    name: "Data Cleaning & Transformation",
    icon: "Filter",
    tools: [
      mk("CSV Cleaner", "Clean messy CSV files", Wand2),
      mk("Data Deduplicator", "Remove duplicate rows", CopyMinus),
      mk("Missing Value Handler", "Fill or drop missing data", SearchX),
      mk("Data Type Converter", "Cast columns to types", ArrowRightLeft),
      mk("Column Renamer", "Rename columns in bulk", Type),
      mk("Data Sorter", "Sort by any column", ArrowUpDown),
      mk("Data Filter Tool", "Filter rows by condition", Filter),
      mk("Data Pivot Tool", "Pivot long to wide", RotateCw),
      mk("Data Unpivot Tool", "Melt wide to long", RotateCcw),
      mk("Data Normalizer", "Scale numeric columns", Scale),
      mk("Data Aggregator", "Group and summarize", Layers),
      mk("Data Merger", "Join multiple tables", Merge),
      mk("Data Shape Validator", "Validate schema", CheckSquare),
      mk("Outlier Detector", "Spot anomalies", AlertCircle),
    ],
  },
  {
    name: "Statistical Analysis",
    icon: "Sigma",
    tools: [
      mk("Descriptive Statistics Calculator", "Mean, median, mode, range", Calculator),
      mk("Correlation Matrix Builder", "Pairwise correlations", Grid2x2),
      mk("Regression Line Visualizer", "Linear regression on scatter", GitCommit),
      mk("Distribution Fitter", "Fit common distributions", Activity),
      mk("Confidence Interval Calculator", "Compute CIs", Brackets),
      mk("Hypothesis Testing Guide", "Walk through tests", Microscope),
      mk("p-Value Explainer", "Understand significance", HelpCircle),
      mk("Chi-Square Test Tool", "Test independence", Dna),
      mk("t-Test Guide", "Compare two means", Thermometer),
      mk("ANOVA Concept Tool", "Compare many groups", Workflow),
      mk("Z-Score Calculator", "Standardize values", Sigma),
      mk("Standard Deviation Visualizer", "See spread of data", MoveHorizontal),
      mk("Skewness & Kurtosis Calculator", "Distribution shape", Mountain),
      mk("Sampling Size Estimator", "Plan study sample size", Users),
    ],
  },
  {
    name: "Data Tables & Grids",
    icon: "Table",
    tools: [
      mk("Interactive Data Table Builder", "Live editable tables", Table),
      mk("Sortable Table Maker", "Click-to-sort columns", ArrowDownUp),
      mk("Filterable Table Tool", "Search and filter rows", ListFilter),
      mk("Comparison Table Builder", "Side-by-side comparisons", Columns),
      mk("Cross-Tab Table Builder", "Two-way contingency", LayoutTemplate),
      mk("Pivot Table Builder", "Summarize across dimensions", FoldHorizontal),
      mk("Data Grid Formatter", "Style grid cells", PaintBucket),
      mk("HTML Table Generator", "Export clean HTML", Code),
      mk("Data Summary Table", "Auto stats per column", FileDigit),
      mk("Frequency Distribution Table", "Count value frequencies", ListOrdered),
    ],
  },
  {
    name: "Dashboard Building",
    icon: "LayoutDashboard",
    tools: [
      mk("KPI Dashboard Builder", "Compose KPI dashboards", LayoutDashboard),
      mk("Metric Card Designer", "Beautiful metric tiles", CreditCard),
      mk("Dashboard Layout Planner", "Plan the grid", Layout),
      mk("Real-Time Ticker Widget", "Live ticking values", Timer),
      mk("Progress Gauge Builder", "Radial gauges", Gauge),
      mk("Scorecard Builder", "Single-number cards", ClipboardCheck),
      mk("Multi-Chart Dashboard", "Mix multiple charts", Monitor),
      mk("Traffic Light Indicator Builder", "Red/yellow/green status", Circle),
      mk("Spark Line Maker", "Inline mini charts", Zap),
      mk("Funnel Chart Builder", "Step conversion funnels", FilterX),
      mk("Cohort Analysis Grid", "Retention cohorts", Calendar),
      mk("OKR Dashboard Builder", "Track objectives", Flag),
    ],
  },
  {
    name: "Specialized Visualizations",
    icon: "Network",
    tools: [
      mk("Sankey Diagram Builder", "Flow between stages", GitMerge),
      mk("Chord Diagram Builder", "Relationships in a circle", CircleDashed),
      mk("Network Graph Visualizer", "Nodes and edges", Network),
      mk("Dendogram Builder", "Hierarchical clustering", GitBranch),
      mk("Icicle Chart Builder", "Hierarchical bars", AlignVerticalSpaceAround),
      mk("Flame Graph Builder", "Profile visualizations", Flame),
      mk("Timeline Visualization", "Events on a timeline", Clock),
      mk("Calendar Heatmap Builder", "GitHub-style activity", CalendarDays),
      mk("Geographic Choropleth Builder", "Maps colored by value", Map),
      mk("Wind Rose Chart", "Directional frequency", Compass),
      mk("Population Pyramid Builder", "Age/sex distribution", Triangle),
      mk("Bump Chart Builder", "Ranking changes", Route),
      mk("Parallel Coordinates Plot", "Multivariate lines", AlignJustify),
      mk("Stream Graph Builder", "Flowing area chart", Waves),
      mk("Cartogram Builder", "Distorted maps", MapPin),
      mk("OHLC Candlestick Chart", "Financial price charts", CandlestickChart),
    ],
  },
  {
    name: "Data Storytelling",
    icon: "BookOpen",
    tools: [
      mk("Data Story Builder", "Build narrative reports", BookOpen),
      mk("Annotation Layer Tool", "Layer annotations", Layers3),
      mk("Narrative Chart Builder", "Scrollytelling charts", ScrollText),
      mk("Data-Driven Report Builder", "Reports from data", FileBarChart),
      mk("Chart Caption Generator", "Auto-generate captions", Captions),
      mk("Chart Insight Highlighter", "Highlight key points", Highlighter),
      mk("Data Presentation Slide Builder", "Slide-friendly charts", Presentation),
      mk("Infographic Data Layout", "Infographic templates", LayoutList),
      mk("Chart Comparison A/B Builder", "Side-by-side compare", SplitSquareHorizontal),
      mk("Data Explainer Builder", "Teach with data", GraduationCap),
    ],
  },
  {
    name: "Data Export & Sharing",
    icon: "Share2",
    tools: [
      mk("Chart to PNG Exporter", "Export as PNG", Image),
      mk("Chart to SVG Exporter", "Export as SVG", FileCode2),
      mk("Chart Embed Code Generator", "Embed anywhere", Code2),
      mk("Data to PDF Report Exporter", "Export PDF reports", FileText),
      mk("CSV Download Tool", "Download as CSV", DownloadCloud),
      mk("JSON Schema Exporter", "Export JSON schemas", Braces),
      mk("Chart URL Shareable Builder", "Share via URL", Share2),
      mk("Printable Data Report", "Print-friendly reports", Printer),
    ],
  },
  {
    name: "Business Intelligence",
    icon: "Briefcase",
    tools: [
      mk("Sales Dashboard Builder", "Track revenue and pipeline", DollarSign),
      mk("Marketing Analytics Dashboard", "Campaign performance", Megaphone),
      mk("Product Metrics Dashboard", "Product KPIs", Package),
      mk("Customer Analytics Dashboard", "Customer behavior", UsersRound),
      mk("Financial Reporting Dashboard", "P&L and balance sheet", Landmark),
      mk("HR Analytics Dashboard", "People metrics", Briefcase),
      mk("Operations Dashboard", "Operational KPIs", Settings),
      mk("Revenue Dashboard", "MRR / ARR tracking", ArrowUpRight),
      mk("Conversion Funnel Visualizer", "Step-by-step conversion", MoveDown),
      mk("Retention Curve Builder", "Retention over time", Repeat),
    ],
  },
  {
    name: "Developer Data Tools",
    icon: "Code",
    tools: [
      mk("D3.js Chart Sandbox", "Prototype D3 charts", PenTool),
      mk("Chart.js Config Builder", "Generate Chart.js configs", Settings2),
      mk("Vega-Lite Spec Builder", "Build Vega-Lite specs", Sparkles),
      mk("Observable Plot Sandbox", "Try Observable Plot", TestTube),
      mk("JSON to Chart Auto-Builder", "Auto-detect chart from JSON", Bot),
      mk("Data Mocking & Seed Tool", "Generate seed data", Sprout),
    ],
  },
];

export const ALL_TOOLS: { tool: Tool; category: string }[] = CATEGORIES.flatMap((c) =>
  c.tools.map((tool) => ({ tool, category: c.name })),
);

export function findTool(slug: string) {
  for (const c of CATEGORIES) {
    const t = c.tools.find((x) => x.slug === slug);
    if (t) return { tool: t, category: c.name };
  }
  return null;
}

export const SEARCH_REGISTRY: ToolResult[] = CATEGORIES.flatMap((cat) =>
  cat.tools.map((tool) => ({
    name: tool.name,
    description: tool.desc,
    slug: tool.slug,
    href: `/insight/tools/${tool.slug}`,
    category: cat.name,
    isBuilt: tool.status === "live",
  }))
);
