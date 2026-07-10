import { ToolResult } from "@/components/CategorySearch";

export type Tool = { name: string; slug: string; desc: string };
export type ToolCategory = { name: string; tools: Tool[] };

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const mk = (name: string, desc: string): Tool => ({ name, slug: slug(name), desc });

export const ACTIVE_SLUG = "basic-flowchart-builder";

export const CATEGORIES: ToolCategory[] = [
  {
    name: "Flowcharts",
    tools: [
      mk("Basic Flowchart Builder", "Drag, drop and connect shapes"),
      mk("Process Flowchart Creator", "Map any business process"),
      mk("Decision Tree Builder", "Visualize decision logic"),
      mk("Yes/No Decision Flowchart", "Branching yes/no logic"),
      mk("Algorithm Flowchart Builder", "Diagram algorithms step-by-step"),
      mk("Data Flow Diagram Builder", "Model how data moves"),
      mk("Cross-Functional Flowchart (Swimlane)", "Roles across lanes"),
      mk("Swimlane Process Map", "Process flow per role"),
      mk("Flowchart Template Library", "Ready-made flowcharts"),
      mk("Flowchart to Code Generator", "Export flow as code"),
    ],
  },
  {
    name: "Mind Maps",
    tools: [
      mk("Mind Map Creator", "Capture ideas radially"),
      mk("Radial Mind Map Builder", "Center-out mind maps"),
      mk("Spider Diagram Builder", "Spider-style maps"),
      mk("Concept Map Creator", "Link related concepts"),
      mk("Brainstorm Map Builder", "Free-form brainstorms"),
      mk("Topic Cluster Map", "Group related topics"),
      mk("Association Map Builder", "Map associations"),
      mk("Mental Model Diagram Tool", "Diagram mental models"),
      mk("Fishbone / Ishikawa Diagram", "Cause and effect"),
      mk("Affinity Diagram Builder", "Cluster sticky notes"),
    ],
  },
  {
    name: "UML Diagrams",
    tools: [
      mk("UML Class Diagram Builder", "Classes and relations"),
      mk("UML Sequence Diagram Builder", "Object interactions over time"),
      mk("UML Use Case Diagram Builder", "Actors and use cases"),
      mk("UML Activity Diagram Builder", "Workflow activities"),
      mk("UML State Machine Diagram Builder", "States and transitions"),
      mk("UML Component Diagram Builder", "System components"),
      mk("UML Deployment Diagram Builder", "Deployment topology"),
      mk("UML Object Diagram Builder", "Object instances"),
      mk("UML Package Diagram Builder", "Package dependencies"),
      mk("UML Timing Diagram Builder", "Timing behavior"),
    ],
  },
  {
    name: "Architecture Diagrams",
    tools: [
      mk("System Architecture Diagram Builder", "End-to-end systems"),
      mk("Cloud Architecture Diagram Builder", "Cloud services map"),
      mk("Microservices Architecture Diagram", "Services and APIs"),
      mk("Network Topology Diagram Builder", "Topology layouts"),
      mk("Infrastructure Diagram Builder", "Servers and storage"),
      mk("Application Architecture Diagram", "App-level structure"),
      mk("API Gateway Diagram Builder", "Gateway routes"),
      mk("Event-Driven Architecture Diagram", "Events and queues"),
      mk("Data Architecture Diagram", "Data layers"),
      mk("Security Architecture Diagram", "Security layout"),
    ],
  },
  {
    name: "Entity Relationship (ER) Diagrams",
    tools: [
      mk("ER Diagram Builder", "Entities and relationships"),
      mk("Database Schema Visualizer", "Visualize a schema"),
      mk("EER (Enhanced ER) Diagram Builder", "Enhanced ER notation"),
      mk("Chen Notation ER Builder", "Classic Chen style"),
      mk("Crow's Foot Notation ER Builder", "Crow's foot style"),
      mk("Database Table Relationship Mapper", "Map table relations"),
      mk("Schema-to-ER Converter", "Schema into ER"),
      mk("FK/PK Relationship Visualizer", "Keys & relations"),
      mk("Database Normalization Diagram", "Normal form steps"),
      mk("Dimensional Modeling Diagram (Star/Snowflake)", "Star and snowflake"),
    ],
  },
  {
    name: "Org Charts & Hierarchy",
    tools: [
      mk("Org Chart Builder", "Build an org chart"),
      mk("Hierarchical Tree Chart Builder", "Tree hierarchies"),
      mk("Reporting Line Visualizer", "Reporting lines"),
      mk("Department Structure Builder", "Departments map"),
      mk("Role & Responsibility Map", "RACI-style map"),
      mk("Flat vs Hierarchical Org Comparator", "Compare org styles"),
      mk("Virtual Team Org Chart", "Distributed teams"),
      mk("Matrix Organization Chart", "Matrix orgs"),
      mk("Project Team Structure Builder", "Project teams"),
      mk("Board & C-Suite Org Chart", "Executive structure"),
    ],
  },
  {
    name: "Process & Workflow",
    tools: [
      mk("BPMN Diagram Builder (basic)", "Basic BPMN flows"),
      mk("Value Stream Map Builder", "Lean value streams"),
      mk("Customer Journey Map Builder", "Customer journeys"),
      mk("User Story Map Builder", "Agile story maps"),
      mk("Lean Process Map Builder", "Lean workflows"),
      mk("Process Improvement Diagram", "Improvement loops"),
      mk("Service Blueprint Builder", "Service blueprints"),
      mk("Experience Map Creator", "Experience journeys"),
      mk("Business Process Map", "Business processes"),
      mk("Workflow Automation Diagram", "Automation flows"),
    ],
  },
  {
    name: "Network & Infrastructure",
    tools: [
      mk("Network Diagram Builder", "General network maps"),
      mk("Physical Network Diagram", "Physical layout"),
      mk("Logical Network Diagram", "Logical layout"),
      mk("VPC/Subnet Architecture Diagram", "VPCs and subnets"),
      mk("Load Balancer Diagram Builder", "LB topology"),
      mk("DNS Architecture Diagram", "DNS layout"),
      mk("CDN Architecture Diagram", "CDN flow"),
      mk("Firewall Rule Diagram", "Firewall rules"),
      mk("Zero Trust Architecture Diagram", "Zero trust model"),
      mk("Hybrid Cloud Diagram Builder", "Hybrid cloud"),
    ],
  },
  {
    name: "Planning & Strategy",
    tools: [
      mk("Roadmap Timeline Builder", "Timeline roadmaps"),
      mk("Product Roadmap Diagram", "Product plans"),
      mk("Strategic Initiative Map", "Strategy initiatives"),
      mk("Portfolio Diagram Builder", "Portfolio overview"),
      mk("Release Plan Diagram", "Release planning"),
      mk("Feature Prioritization Map", "Prioritize features"),
      mk("Impact vs Effort Matrix (visual)", "Impact vs effort"),
      mk("Risk Heat Map Builder", "Risk heatmaps"),
      mk("SWOT Diagram Builder", "SWOT quadrants"),
      mk("Strategy Map Builder", "Strategy map"),
    ],
  },
  {
    name: "Diagram Utilities",
    tools: [
      mk("Shape Library Manager", "Manage shapes"),
      mk("Arrow Style Selector", "Pick arrow styles"),
      mk("Connection Point Editor", "Edit connectors"),
      mk("Grid & Snap Tool", "Grid and snapping"),
      mk("Alignment & Distribution Tool", "Align & distribute"),
      mk("Shape Color Theme Builder", "Color themes"),
      mk("Diagram Export (PNG/SVG/PDF)", "Export diagrams"),
      mk("Diagram Embed Code Generator", "Embed anywhere"),
      mk("Diagram Template Library", "Templates"),
      mk("Diagram Version History (local)", "Local versioning"),
    ],
  },
];

export const ALL_TOOLS: Tool[] = CATEGORIES.flatMap((c) => c.tools);

export function findTool(slugStr: string): { tool: Tool; category: string } | null {
  for (const c of CATEGORIES) {
    const t = c.tools.find((t) => (t as any).slug === slugStr);
    if (t) return { tool: t, category: c.name };
  }
  return null;
}

export const SEARCH_REGISTRY: ToolResult[] = CATEGORIES.flatMap((cat) =>
  cat.tools.map((tool) => ({
    name: tool.name,
    description: tool.desc,
    slug: tool.slug,
    href: `/flowchart/tool/${tool.slug}`,
    category: cat.name,
    isBuilt: tool.slug === ACTIVE_SLUG,
  }))
);
