import { Target, ArrowDownFromLine, BarChart, BarChart2, ChartPie, AArrowDown, Activity, ChartScatter, AArrowUp, ALargeSmall, ActivitySquare, Accessibility, LucideActivity, LucideActivitySquare, LucideSquareActivity, SquareActivity, AirVent, LucidePalette, AreaChart, Airplay, AlarmCheck, BarChart3, AlarmClock, ArrowDownToLine, AlarmClockCheck, AlarmClockMinus, File, CloudDownload, BarChart4, FileArchive, AlarmClockOff, FileAudio, LucideTable, FileAudio2, AlarmClockPlus, AlarmMinus, FileAxis3D, AlarmPlus, AlarmSmoke, FileAxis3d, Album, BarChartBig, FileBadge, AlertCircle, FileBadge2, AlertOctagon, AlertTriangle, FileBarChart, FileBarChart2, AlignCenter, AlignCenterHorizontal, FileBox, BarChartHorizontal, Calculator, BarChartHorizontalBig, ArrowLeftFromLine, AlignCenterVertical, AlignEndHorizontal, LucideCalculator, AlignEndVertical, LucideSigma, LucideSigmaSquare, AlignHorizontalDistributeCenter, LucideSquareSigma, CandlestickChart, Sigma, AlignHorizontalDistributeEnd, LucideTable2, LucideTableCellsMerge, LucideTableCellsSplit, LucideTableColumnsSplit, LucideTableOfContents, LucideTableProperties, LucideTableRowsSplit, LucideTablet, LucideTabletSmartphone, LucideTablets, Layout, ChartArea, LayoutDashboard, AlignHorizontalDistributeStart, ChartBar, ChartBarBig, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, AlignHorizontalJustifyStart, ChartBarDecreasing, Table, LayoutGrid, AlignHorizontalSpaceAround, AlignHorizontalSpaceBetween, ChartBarIncreasing, AlignJustify, ChartBarStacked, AlignLeft, ArrowLeftToLine, ChartCandlestick, AlignRight, ChartColumn, ChartColumnBig, AlignStartHorizontal, ChartColumnDecreasing, AlignStartVertical, AlignVerticalDistributeCenter, ChartColumnIncreasing, AlignVerticalDistributeEnd, AlignVerticalDistributeStart, ChartColumnStacked, FileChartColumn, AlignVerticalJustifyCenter, ChartGantt, AlignVerticalJustifyEnd, FileChartColumnIncreasing, AlignVerticalJustifyStart, AlignVerticalSpaceAround, AlignVerticalSpaceBetween, Download, ChartLine, FileChartLine, Ambulance, FileChartPie, Ampersand, Table2, Ampersands, Amphora, LayoutList, Anchor, LayoutPanelLeft, Angry, LayoutPanelTop, Annoyed, ChartNetwork, Antenna, ChartNoAxesColumn, ChartNoAxesColumnDecreasing, Anvil, Aperture, AppWindow, FileCheck } from "lucide-react";
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
      mk("Line Chart Builder", "Build interactive line charts", ArrowDownFromLine, true),
      mk("Bar Chart Builder", "Create vertical bar charts", BarChart),
      mk("Stacked Bar Chart Builder", "Compare composition over categories", BarChart2),
      mk("Pie Chart Builder", "Show parts of a whole", ChartPie),
      mk("Donut Chart Builder", "Pie with a center hole", Target),
      mk("Area Chart Builder", "Filled line charts for trends", Activity),
      mk("Scatter Plot Builder", "Plot pairs of values", ChartScatter),
      mk("Bubble Chart Builder", "Three-dimension scatter", AArrowUp),
      mk("Histogram Builder", "Show value distributions", ALargeSmall),
      mk("Box Plot Builder", "Visualize quartiles and outliers", ActivitySquare),
      mk("Heatmap Builder", "Color-coded data grids", Accessibility),
      mk("Treemap Builder", "Hierarchical rectangles", LucideActivity),
      mk("Sunburst Chart Builder", "Radial hierarchy chart", LucideActivitySquare),
      mk("Waterfall Chart Builder", "Track positive/negative changes", LucideSquareActivity),
      mk("Gantt Chart", "Project timelines", SquareActivity),
      mk("Radar Chart Builder", "Compare multivariate data", AirVent),
    ],
  },
  {
    name: "Chart Customization",
    icon: "Palette",
    tools: [
      mk("Chart Color Theme Builder", "Design reusable palettes", LucidePalette),
      mk("Chart Annotation Tool", "Add notes and callouts", AreaChart),
      mk("Chart Legend Designer", "Style and position legends", Airplay),
      mk("Chart Axis Formatter", "Format ticks and labels", AlarmCheck),
      mk("Chart Tooltip Customizer", "Design hover tooltips", BarChart3),
      mk("Chart Grid Line Styler", "Tune grid appearance", AlarmClock),
      mk("Chart Trend Line Adder", "Overlay regression lines", ArrowDownToLine),
      mk("Chart Reference Line Tool", "Mark thresholds and targets", AlarmClockCheck),
      mk("Chart Error Bar Tool", "Show uncertainty", AlarmClockMinus),
      mk("Chart Data Label Formatter", "Format value labels", File),
      mk("Chart Export Tool", "Export charts as images", CloudDownload),
      mk("Chart Accessibility Checker", "Audit for a11y", BarChart4),
    ],
  },
  {
    name: "Data Input & Import",
    icon: "Upload",
    tools: [
      mk("CSV Data Importer", "Upload CSV into charts", FileArchive),
      mk("JSON Data Importer", "Import JSON datasets", AlarmClockOff),
      mk("Excel Paste Data Tool", "Paste from Excel", FileAudio),
      mk("Manual Data Entry Table", "Type data by hand", LucideTable),
      mk("Data URL Import Tool", "Fetch data from a URL", FileAudio2),
      mk("Clipboard Data Paste Tool", "Paste any clipboard data", AlarmClockPlus),
      mk("Sample Dataset Library", "Browse curated datasets", AlarmMinus),
      mk("Real-Time Data Connector", "Local file streaming", FileAxis3D),
      mk("Data Row Generator", "Generate rows on the fly", AlarmPlus),
      mk("API Response to Chart Converter", "Turn JSON API into charts", AlarmSmoke),
    ],
  },
  {
    name: "Data Cleaning & Transformation",
    icon: "Filter",
    tools: [
      mk("CSV Cleaner", "Clean messy CSV files", FileAxis3d),
      mk("Data Deduplicator", "Remove duplicate rows", Album),
      mk("Missing Value Handler", "Fill or drop missing data", BarChartBig),
      mk("Data Type Converter", "Cast columns to types", FileBadge),
      mk("Column Renamer", "Rename columns in bulk", AlertCircle),
      mk("Data Sorter", "Sort by any column", FileBadge2),
      mk("Data Filter Tool", "Filter rows by condition", AlertOctagon),
      mk("Data Pivot Tool", "Pivot long to wide", AlertTriangle),
      mk("Data Unpivot Tool", "Melt wide to long", FileBarChart),
      mk("Data Normalizer", "Scale numeric columns", FileBarChart2),
      mk("Data Aggregator", "Group and summarize", AlignCenter),
      mk("Data Merger", "Join multiple tables", AlignCenterHorizontal),
      mk("Data Shape Validator", "Validate schema", FileBox),
      mk("Outlier Detector", "Spot anomalies", BarChartHorizontal),
    ],
  },
  {
    name: "Statistical Analysis",
    icon: "Sigma",
    tools: [
      mk("Descriptive Statistics Calculator", "Mean, median, mode, range", Calculator),
      mk("Correlation Matrix Builder", "Pairwise correlations", BarChartHorizontalBig),
      mk("Regression Line Visualizer", "Linear regression on scatter", ArrowLeftFromLine),
      mk("Distribution Fitter", "Fit common distributions", AlignCenterVertical),
      mk("Confidence Interval Calculator", "Compute CIs", AlignEndHorizontal),
      mk("Hypothesis Testing Guide", "Walk through tests", LucideCalculator),
      mk("p-Value Explainer", "Understand significance", AlignEndVertical),
      mk("Chi-Square Test Tool", "Test independence", LucideSigma),
      mk("t-Test Guide", "Compare two means", LucideSigmaSquare),
      mk("ANOVA Concept Tool", "Compare many groups", AlignHorizontalDistributeCenter),
      mk("Z-Score Calculator", "Standardize values", LucideSquareSigma),
      mk("Standard Deviation Visualizer", "See spread of data", CandlestickChart),
      mk("Skewness & Kurtosis Calculator", "Distribution shape", Sigma),
      mk("Sampling Size Estimator", "Plan study sample size", AlignHorizontalDistributeEnd),
    ],
  },
  {
    name: "Data Tables & Grids",
    icon: "Table",
    tools: [
      mk("Interactive Data Table Builder", "Live editable tables", LucideTable2),
      mk("Sortable Table Maker", "Click-to-sort columns", LucideTableCellsMerge),
      mk("Filterable Table Tool", "Search and filter rows", LucideTableCellsSplit),
      mk("Comparison Table Builder", "Side-by-side comparisons", LucideTableColumnsSplit),
      mk("Cross-Tab Table Builder", "Two-way contingency", LucideTableOfContents),
      mk("Pivot Table Builder", "Summarize across dimensions", LucideTableProperties),
      mk("Data Grid Formatter", "Style grid cells", LucideTableRowsSplit),
      mk("HTML Table Generator", "Export clean HTML", LucideTablet),
      mk("Data Summary Table", "Auto stats per column", LucideTabletSmartphone),
      mk("Frequency Distribution Table", "Count value frequencies", LucideTablets),
    ],
  },
  {
    name: "Dashboard Building",
    icon: "LayoutDashboard",
    tools: [
      mk("KPI Dashboard Builder", "Compose KPI dashboards", Layout),
      mk("Metric Card Designer", "Beautiful metric tiles", ChartArea),
      mk("Dashboard Layout Planner", "Plan the grid", LayoutDashboard),
      mk("Real-Time Ticker Widget", "Live ticking values", AlignHorizontalDistributeStart),
      mk("Progress Gauge Builder", "Radial gauges", ChartBar),
      mk("Scorecard Builder", "Single-number cards", ChartBarBig),
      mk("Multi-Chart Dashboard", "Mix multiple charts", AlignHorizontalJustifyCenter),
      mk("Traffic Light Indicator Builder", "Red/yellow/green status", AlignHorizontalJustifyEnd),
      mk("Spark Line Maker", "Inline mini charts", AlignHorizontalJustifyStart),
      mk("Funnel Chart Builder", "Step conversion funnels", ChartBarDecreasing),
      mk("Cohort Analysis Grid", "Retention cohorts", Table),
      mk("OKR Dashboard Builder", "Track objectives", LayoutGrid),
    ],
  },
  {
    name: "Specialized Visualizations",
    icon: "Network",
    tools: [
      mk("Sankey Diagram Builder", "Flow between stages", AlignHorizontalSpaceAround),
      mk("Chord Diagram Builder", "Relationships in a circle", AlignHorizontalSpaceBetween),
      mk("Network Graph Visualizer", "Nodes and edges", ChartBarIncreasing),
      mk("Dendogram Builder", "Hierarchical clustering", AlignJustify),
      mk("Icicle Chart Builder", "Hierarchical bars", ChartBarStacked),
      mk("Flame Graph Builder", "Profile visualizations", AlignLeft),
      mk("Timeline Visualization", "Events on a timeline", ArrowLeftToLine),
      mk("Calendar Heatmap Builder", "GitHub-style activity", ChartCandlestick),
      mk("Geographic Choropleth Builder", "Maps colored by value", AlignRight),
      mk("Wind Rose Chart", "Directional frequency", ChartColumn),
      mk("Population Pyramid Builder", "Age/sex distribution", ChartColumnBig),
      mk("Bump Chart Builder", "Ranking changes", AlignStartHorizontal),
      mk("Parallel Coordinates Plot", "Multivariate lines", ChartColumnDecreasing),
      mk("Stream Graph Builder", "Flowing area chart", AlignStartVertical),
      mk("Cartogram Builder", "Distorted maps", AlignVerticalDistributeCenter),
      mk("OHLC Candlestick Chart", "Financial price charts", ChartColumnIncreasing),
    ],
  },
  {
    name: "Data Storytelling",
    icon: "BookOpen",
    tools: [
      mk("Data Story Builder", "Build narrative reports", AlignVerticalDistributeEnd),
      mk("Annotation Layer Tool", "Layer annotations", AlignVerticalDistributeStart),
      mk("Narrative Chart Builder", "Scrollytelling charts", ChartColumnStacked),
      mk("Data-Driven Report Builder", "Reports from data", FileChartColumn),
      mk("Chart Caption Generator", "Auto-generate captions", AlignVerticalJustifyCenter),
      mk("Chart Insight Highlighter", "Highlight key points", ChartGantt),
      mk("Data Presentation Slide Builder", "Slide-friendly charts", AlignVerticalJustifyEnd),
      mk("Infographic Data Layout", "Infographic templates", FileChartColumnIncreasing),
      mk("Chart Comparison A/B Builder", "Side-by-side compare", AlignVerticalJustifyStart),
      mk("Data Explainer Builder", "Teach with data", AlignVerticalSpaceAround),
    ],
  },
  {
    name: "Data Export & Sharing",
    icon: "Share2",
    tools: [
      mk("Chart to PNG Exporter", "Export as PNG", AlignVerticalSpaceBetween),
      mk("Chart to SVG Exporter", "Export as SVG", Download),
      mk("Chart Embed Code Generator", "Embed anywhere", ChartLine),
      mk("Data to PDF Report Exporter", "Export PDF reports", FileChartLine),
      mk("CSV Download Tool", "Download as CSV", Ambulance),
      mk("JSON Schema Exporter", "Export JSON schemas", FileChartPie),
      mk("Chart URL Shareable Builder", "Share via URL", Ampersand),
      mk("Printable Data Report", "Print-friendly reports", Table2),
    ],
  },
  {
    name: "Business Intelligence",
    icon: "Briefcase",
    tools: [
      mk("Sales Dashboard Builder", "Track revenue and pipeline", Ampersands),
      mk("Marketing Analytics Dashboard", "Campaign performance", Amphora),
      mk("Product Metrics Dashboard", "Product KPIs", LayoutList),
      mk("Customer Analytics Dashboard", "Customer behavior", Anchor),
      mk("Financial Reporting Dashboard", "P&L and balance sheet", LayoutPanelLeft),
      mk("HR Analytics Dashboard", "People metrics", Angry),
      mk("Operations Dashboard", "Operational KPIs", LayoutPanelTop),
      mk("Revenue Dashboard", "MRR / ARR tracking", Annoyed),
      mk("Conversion Funnel Visualizer", "Step-by-step conversion", ChartNetwork),
      mk("Retention Curve Builder", "Retention over time", Antenna),
    ],
  },
  {
    name: "Developer Data Tools",
    icon: "Code",
    tools: [
      mk("D3.js Chart Sandbox", "Prototype D3 charts", ChartNoAxesColumn),
      mk("Chart.js Config Builder", "Generate Chart.js configs", ChartNoAxesColumnDecreasing),
      mk("Vega-Lite Spec Builder", "Build Vega-Lite specs", Anvil),
      mk("Observable Plot Sandbox", "Try Observable Plot", Aperture),
      mk("JSON to Chart Auto-Builder", "Auto-detect chart from JSON", AppWindow),
      mk("Data Mocking & Seed Tool", "Generate seed data", FileCheck),
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
