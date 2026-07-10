import { ToolResult } from "@/components/CategorySearch";

export type Tool = { name: string; desc: string; slug: string };
export type ToolCategory = { name: string; icon: string; tools: Tool[] };

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const mk = (name: string, desc: string): Tool => ({ name, desc, slug: slugify(name) });

export const CATEGORIES: ToolCategory[] = [
  {
    name: "Chart Creation",
    icon: "LineChart",
    tools: [
      mk("Line Chart Builder", "Build interactive line charts"),
      mk("Bar Chart Builder", "Create vertical bar charts"),
      mk("Stacked Bar Chart Builder", "Compare composition over categories"),
      mk("Pie Chart Builder", "Show parts of a whole"),
      mk("Donut Chart Builder", "Pie with a center hole"),
      mk("Area Chart Builder", "Filled line charts for trends"),
      mk("Scatter Plot Builder", "Plot pairs of values"),
      mk("Bubble Chart Builder", "Three-dimension scatter"),
      mk("Histogram Builder", "Show value distributions"),
      mk("Box Plot Builder", "Visualize quartiles and outliers"),
      mk("Heatmap Builder", "Color-coded data grids"),
      mk("Treemap Builder", "Hierarchical rectangles"),
      mk("Sunburst Chart Builder", "Radial hierarchy chart"),
      mk("Waterfall Chart Builder", "Track positive/negative changes"),
      mk("Gantt Chart", "Project timelines"),
      mk("Radar Chart Builder", "Compare multivariate data"),
    ],
  },
  {
    name: "Chart Customization",
    icon: "Palette",
    tools: [
      mk("Chart Color Theme Builder", "Design reusable palettes"),
      mk("Chart Annotation Tool", "Add notes and callouts"),
      mk("Chart Legend Designer", "Style and position legends"),
      mk("Chart Axis Formatter", "Format ticks and labels"),
      mk("Chart Tooltip Customizer", "Design hover tooltips"),
      mk("Chart Grid Line Styler", "Tune grid appearance"),
      mk("Chart Trend Line Adder", "Overlay regression lines"),
      mk("Chart Reference Line Tool", "Mark thresholds and targets"),
      mk("Chart Error Bar Tool", "Show uncertainty"),
      mk("Chart Data Label Formatter", "Format value labels"),
      mk("Chart Export Tool", "Export charts as images"),
      mk("Chart Accessibility Checker", "Audit for a11y"),
    ],
  },
  {
    name: "Data Input & Import",
    icon: "Upload",
    tools: [
      mk("CSV Data Importer", "Upload CSV into charts"),
      mk("JSON Data Importer", "Import JSON datasets"),
      mk("Excel Paste Data Tool", "Paste from Excel"),
      mk("Manual Data Entry Table", "Type data by hand"),
      mk("Data URL Import Tool", "Fetch data from a URL"),
      mk("Clipboard Data Paste Tool", "Paste any clipboard data"),
      mk("Sample Dataset Library", "Browse curated datasets"),
      mk("Real-Time Data Connector", "Local file streaming"),
      mk("Data Row Generator", "Generate rows on the fly"),
      mk("API Response to Chart Converter", "Turn JSON API into charts"),
    ],
  },
  {
    name: "Data Cleaning & Transformation",
    icon: "Filter",
    tools: [
      mk("CSV Cleaner", "Clean messy CSV files"),
      mk("Data Deduplicator", "Remove duplicate rows"),
      mk("Missing Value Handler", "Fill or drop missing data"),
      mk("Data Type Converter", "Cast columns to types"),
      mk("Column Renamer", "Rename columns in bulk"),
      mk("Data Sorter", "Sort by any column"),
      mk("Data Filter Tool", "Filter rows by condition"),
      mk("Data Pivot Tool", "Pivot long to wide"),
      mk("Data Unpivot Tool", "Melt wide to long"),
      mk("Data Normalizer", "Scale numeric columns"),
      mk("Data Aggregator", "Group and summarize"),
      mk("Data Merger", "Join multiple tables"),
      mk("Data Shape Validator", "Validate schema"),
      mk("Outlier Detector", "Spot anomalies"),
    ],
  },
  {
    name: "Statistical Analysis",
    icon: "Sigma",
    tools: [
      mk("Descriptive Statistics Calculator", "Mean, median, mode, range"),
      mk("Correlation Matrix Builder", "Pairwise correlations"),
      mk("Regression Line Visualizer", "Linear regression on scatter"),
      mk("Distribution Fitter", "Fit common distributions"),
      mk("Confidence Interval Calculator", "Compute CIs"),
      mk("Hypothesis Testing Guide", "Walk through tests"),
      mk("p-Value Explainer", "Understand significance"),
      mk("Chi-Square Test Tool", "Test independence"),
      mk("t-Test Guide", "Compare two means"),
      mk("ANOVA Concept Tool", "Compare many groups"),
      mk("Z-Score Calculator", "Standardize values"),
      mk("Standard Deviation Visualizer", "See spread of data"),
      mk("Skewness & Kurtosis Calculator", "Distribution shape"),
      mk("Sampling Size Estimator", "Plan study sample size"),
    ],
  },
  {
    name: "Data Tables & Grids",
    icon: "Table",
    tools: [
      mk("Interactive Data Table Builder", "Live editable tables"),
      mk("Sortable Table Maker", "Click-to-sort columns"),
      mk("Filterable Table Tool", "Search and filter rows"),
      mk("Comparison Table Builder", "Side-by-side comparisons"),
      mk("Cross-Tab Table Builder", "Two-way contingency"),
      mk("Pivot Table Builder", "Summarize across dimensions"),
      mk("Data Grid Formatter", "Style grid cells"),
      mk("HTML Table Generator", "Export clean HTML"),
      mk("Data Summary Table", "Auto stats per column"),
      mk("Frequency Distribution Table", "Count value frequencies"),
    ],
  },
  {
    name: "Dashboard Building",
    icon: "LayoutDashboard",
    tools: [
      mk("KPI Dashboard Builder", "Compose KPI dashboards"),
      mk("Metric Card Designer", "Beautiful metric tiles"),
      mk("Dashboard Layout Planner", "Plan the grid"),
      mk("Real-Time Ticker Widget", "Live ticking values"),
      mk("Progress Gauge Builder", "Radial gauges"),
      mk("Scorecard Builder", "Single-number cards"),
      mk("Multi-Chart Dashboard", "Mix multiple charts"),
      mk("Traffic Light Indicator Builder", "Red/yellow/green status"),
      mk("Spark Line Maker", "Inline mini charts"),
      mk("Funnel Chart Builder", "Step conversion funnels"),
      mk("Cohort Analysis Grid", "Retention cohorts"),
      mk("OKR Dashboard Builder", "Track objectives"),
    ],
  },
  {
    name: "Specialized Visualizations",
    icon: "Network",
    tools: [
      mk("Sankey Diagram Builder", "Flow between stages"),
      mk("Chord Diagram Builder", "Relationships in a circle"),
      mk("Network Graph Visualizer", "Nodes and edges"),
      mk("Dendogram Builder", "Hierarchical clustering"),
      mk("Icicle Chart Builder", "Hierarchical bars"),
      mk("Flame Graph Builder", "Profile visualizations"),
      mk("Timeline Visualization", "Events on a timeline"),
      mk("Calendar Heatmap Builder", "GitHub-style activity"),
      mk("Geographic Choropleth Builder", "Maps colored by value"),
      mk("Wind Rose Chart", "Directional frequency"),
      mk("Population Pyramid Builder", "Age/sex distribution"),
      mk("Bump Chart Builder", "Ranking changes"),
      mk("Parallel Coordinates Plot", "Multivariate lines"),
      mk("Stream Graph Builder", "Flowing area chart"),
      mk("Cartogram Builder", "Distorted maps"),
      mk("OHLC Candlestick Chart", "Financial price charts"),
    ],
  },
  {
    name: "Data Storytelling",
    icon: "BookOpen",
    tools: [
      mk("Data Story Builder", "Build narrative reports"),
      mk("Annotation Layer Tool", "Layer annotations"),
      mk("Narrative Chart Builder", "Scrollytelling charts"),
      mk("Data-Driven Report Builder", "Reports from data"),
      mk("Chart Caption Generator", "Auto-generate captions"),
      mk("Chart Insight Highlighter", "Highlight key points"),
      mk("Data Presentation Slide Builder", "Slide-friendly charts"),
      mk("Infographic Data Layout", "Infographic templates"),
      mk("Chart Comparison A/B Builder", "Side-by-side compare"),
      mk("Data Explainer Builder", "Teach with data"),
    ],
  },
  {
    name: "Data Export & Sharing",
    icon: "Share2",
    tools: [
      mk("Chart to PNG Exporter", "Export as PNG"),
      mk("Chart to SVG Exporter", "Export as SVG"),
      mk("Chart Embed Code Generator", "Embed anywhere"),
      mk("Data to PDF Report Exporter", "Export PDF reports"),
      mk("CSV Download Tool", "Download as CSV"),
      mk("JSON Schema Exporter", "Export JSON schemas"),
      mk("Chart URL Shareable Builder", "Share via URL"),
      mk("Printable Data Report", "Print-friendly reports"),
    ],
  },
  {
    name: "Business Intelligence",
    icon: "Briefcase",
    tools: [
      mk("Sales Dashboard Builder", "Track revenue and pipeline"),
      mk("Marketing Analytics Dashboard", "Campaign performance"),
      mk("Product Metrics Dashboard", "Product KPIs"),
      mk("Customer Analytics Dashboard", "Customer behavior"),
      mk("Financial Reporting Dashboard", "P&L and balance sheet"),
      mk("HR Analytics Dashboard", "People metrics"),
      mk("Operations Dashboard", "Operational KPIs"),
      mk("Revenue Dashboard", "MRR / ARR tracking"),
      mk("Conversion Funnel Visualizer", "Step-by-step conversion"),
      mk("Retention Curve Builder", "Retention over time"),
    ],
  },
  {
    name: "Developer Data Tools",
    icon: "Code",
    tools: [
      mk("D3.js Chart Sandbox", "Prototype D3 charts"),
      mk("Chart.js Config Builder", "Generate Chart.js configs"),
      mk("Vega-Lite Spec Builder", "Build Vega-Lite specs"),
      mk("Observable Plot Sandbox", "Try Observable Plot"),
      mk("JSON to Chart Auto-Builder", "Auto-detect chart from JSON"),
      mk("Data Mocking & Seed Tool", "Generate seed data"),
    ],
  },
];

export const ALL_TOOLS: { tool: Tool; category: string }[] = CATEGORIES.flatMap((c) =>
  c.tools.map((tool) => ({ tool, category: c.name })),
);

export const FUNCTIONAL_SLUGS = new Set<string>(["line-chart-builder"]);

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
    isBuilt: FUNCTIONAL_SLUGS.has(tool.slug),
  }))
);
