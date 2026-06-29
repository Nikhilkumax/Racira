export type ToolStatus = "available" | "soon";

export interface Tool {
  slug: string;
  name: string;
  description: string;
  status: ToolStatus;
}

export interface ToolCategory {
  key: string;
  label: string;
  tools: Tool[];
}

const slug = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const mk = (name: string, description: string, status: ToolStatus = "soon"): Tool => ({
  slug: slug(name),
  name,
  description,
  status,
});

export const categories: ToolCategory[] = [
  {
    key: "hr",
    label: "HR & People",
    tools: [
      mk("Team Size Optimizer", "Right-size teams from workload and capacity"),
      mk("Bonus Pool Allocator", "Distribute bonus pools fairly across staff"),
      mk("Hiring Pipeline Planner", "Plan recruiting stages and timelines"),
      mk("Interview Schedule Builder", "Build interview loops in minutes"),
      mk("Employee Onboarding Planner", "Structure week-by-week onboarding plans"),
      mk("Shift Schedule Builder", "Generate rotating shift schedules"),
      mk("Training Program Planner", "Map out training modules and milestones"),
      mk("Role Responsibility Matrix Builder", "Define RACI for every responsibility"),
      mk("Org Chart Builder", "Sketch reporting structures fast"),
    ],
  },
  {
    key: "ops",
    label: "Budget & Operations",
    tools: [mk("Procurement Planning Tool", "Plan vendor purchases and timelines")],
  },
  {
    key: "meetings",
    label: "Meetings & Communication",
    tools: [
      mk("Meeting Agenda Time Allocator", "Allocate minutes to agenda items"),
      mk("Workshop Duration Planner", "Plan multi-hour workshop blocks"),
      mk("Meeting Schedule Builder", "Build recurring meeting cadences"),
      mk("Presentation Timeline Planner", "Pace slide decks by minute"),
      mk("Team Offsite Planner", "Plan day-by-day offsite agendas"),
      mk("Discussion Topic Prioritizer", "Rank topics by impact and urgency"),
      mk("Retrospective Agenda Builder", "Run focused team retros"),
      mk("Workshop Activity Planner", "Sequence workshop activities"),
      mk("Conference Session Planner", "Schedule sessions across tracks"),
    ],
  },
  {
    key: "strategy",
    label: "Strategy & Planning",
    tools: [
      mk("SWOT Analysis Builder", "Map strengths, weaknesses, opportunities, threats", "available"),
      mk("Business Roadmap Planner", "Lay out quarterly business roadmaps"),
      mk("Quarterly Planning Tool", "Plan OKRs and goals by quarter"),
      mk("Initiative Prioritization Matrix", "Score initiatives by impact vs effort"),
      mk("Strategic Goal Planner", "Cascade strategic goals to teams"),
      mk("Business Milestone Planner", "Track key business milestones"),
      mk("Expansion Planning Tool", "Plan market or geographic expansion"),
      mk("Risk Register Builder", "Log risks, owners, and mitigations"),
    ],
  },
  {
    key: "sales",
    label: "Sales & Marketing",
    tools: [
      mk("Campaign Timeline Planner", "Plan multi-channel campaign timing"),
      mk("Content Marketing Planner", "Schedule content across the funnel"),
      mk("Customer Journey Mapper", "Map touchpoints from awareness to advocacy"),
      mk("Launch Planning Tool", "Coordinate launch tasks and owners"),
      mk("Partnership Planning Tool", "Plan partner pipelines and milestones"),
      mk("Event Marketing Planner", "Plan events end-to-end"),
      mk("Brand Messaging Framework Builder", "Build clear brand messaging pillars"),
    ],
  },
  {
    key: "startup",
    label: "Startup & Entrepreneurship",
    tools: [
      mk("Lean Canvas Builder", "Fill the 9-block lean canvas"),
      mk("Business Model Canvas Builder", "Map your business model on one page"),
      mk("Startup Launch Checklist Builder", "Build a custom launch checklist"),
      mk("Investor Pitch Structure Planner", "Outline a winning pitch deck"),
      mk("Product Launch Roadmap Builder", "Roadmap your product launch"),
      mk("Founder Task Planner", "Prioritize founder to-dos by week"),
      mk("Market Entry Planner", "Plan entering a new market"),
      mk("Growth Experiment Planner", "Design and track growth experiments"),
      mk("Startup Milestone Tracker", "Track milestones from idea to scale"),
      mk("Fundraising Preparation Planner", "Get ready for your raise"),
    ],
  },
];

export const allTools: Tool[] = categories.flatMap((c) => c.tools);

export function findTool(slugStr: string): { tool: Tool; category: ToolCategory } | null {
  for (const c of categories) {
    const t = c.tools.find((x) => x.slug === slugStr);
    if (t) return { tool: t, category: c };
  }
  return null;
}
