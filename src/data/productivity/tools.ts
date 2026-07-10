import { ToolResult } from "@/components/CategorySearch";

export type Tool = {
  id: number;
  name: string;
  slug?: string;
  available: boolean;
};

export type Category = {
  name: string;
  description: string;
  tools: Tool[];
};

export const CATEGORIES: Category[] = [
  {
    name: "Focus & Time Management",
    description: "Plan deep work, time blocks, and energy.",
    tools: [
      { id: 1, name: "Deep Work Session Planner", slug: "deep-work-session-planner", available: true },
      { id: 2, name: "Time Blocking Planner", available: false },
      { id: 3, name: "Daily Schedule Builder", available: false },
      { id: 4, name: "Priority Matrix Generator", available: false },
      { id: 5, name: "Break Frequency Optimizer", available: false },
      { id: 6, name: "Distraction-Free Session Timer", available: false },
      { id: 7, name: "Energy Level Planner", available: false },
      { id: 8, name: "Work Sprint Planner", available: false },
      { id: 9, name: "Multi-Timer Workspace", available: false },
      { id: 10, name: "Countdown Widget Builder", available: false },
      { id: 11, name: "Ultradian Rhythm Planner", available: false },
      { id: 12, name: "Time Leak Detector", available: false },
      { id: 13, name: "Task Batching Planner", available: false },
      { id: 14, name: "Flow State Planner", available: false },
      { id: 15, name: "Context Switching Analyzer", available: false },
      { id: 16, name: "Focus Session Builder", available: false },
      { id: 17, name: "Weekly Time Planner", available: false },
      { id: 18, name: "Routine Designer", available: false },
      { id: 19, name: "Personal Time Audit", available: false },
      { id: 20, name: "Focus Goal Planner", available: false },
    ],
  },
  {
    name: "Task & Project Productivity",
    description: "Break work down, plan, and ship.",
    tools: [
      { id: 21, name: "Task Breakdown Generator", available: false },
      { id: 22, name: "Project Timeline Planner", available: false },
      { id: 23, name: "Milestone Planner", available: false },
      { id: 24, name: "Action Item Generator", available: false },
      { id: 25, name: "Kanban Board Builder", available: false },
      { id: 26, name: "Workload Planner", available: false },
      { id: 27, name: "Project Scope Planner", available: false },
      { id: 28, name: "Delegation Planner", available: false },
      { id: 29, name: "Backlog Organizer", available: false },
      { id: 30, name: "Project Kickoff Planner", available: false },
      { id: 31, name: "Project Roadmap Builder", available: false },
      { id: 32, name: "Task Dependency Mapper", available: false },
      { id: 33, name: "Deliverable Tracker", available: false },
      { id: 34, name: "Work Prioritization Planner", available: false },
    ],
  },
  {
    name: "Writing & Knowledge Work",
    description: "Structure writing, research, and notes.",
    tools: [
      { id: 35, name: "Blog Post Length Planner", available: false },
      { id: 36, name: "Whitepaper Structure Planner", available: false },
      { id: 37, name: "Meeting Notes Template Generator", available: false },
      { id: 38, name: "Case Study Structure Planner", available: false },
      { id: 39, name: "Pitch Deck Slide Count Planner", available: false },
      { id: 40, name: "Research Workflow Planner", available: false },
      { id: 41, name: "Writing Session Planner", available: false },
      { id: 42, name: "Publishing Schedule Planner", available: false },
      { id: 43, name: "Documentation Planner", available: false },
      { id: 44, name: "Interview Notes Organizer", available: false },
      { id: 45, name: "Brainstorming Board Builder", available: false },
    ],
  },
  {
    name: "Goal Setting & Habits",
    description: "Design goals, habits, and growth.",
    tools: [
      { id: 46, name: "Annual Goal Decomposer", available: false },
      { id: 47, name: "Habit Tracker Builder", available: false },
      { id: 48, name: "Accountability Planner", available: false },
      { id: 49, name: "Personal Growth Roadmap", available: false },
      { id: 50, name: "Habit Loop Designer", available: false },
      { id: 51, name: "Life Vision Planner", available: false },
    ],
  },
  {
    name: "Learning & Skill Development",
    description: "Practice, learn, track progress.",
    tools: [
      { id: 52, name: "Deliberate Practice Session Planner", available: false },
      { id: 53, name: "Learning Roadmap Builder", available: false },
      { id: 54, name: "Learning Progress Tracker", available: false },
    ],
  },
  {
    name: "Team Productivity",
    description: "Coordinate people and meetings.",
    tools: [
      { id: 55, name: "Meeting Action Tracker", available: false },
      { id: 56, name: "Team Workload Planner", available: false },
      { id: 57, name: "Collaboration Planner", available: false },
    ],
  },
  {
    name: "Personal Organization",
    description: "Plan your week, month, and life.",
    tools: [
      { id: 58, name: "Weekly Planner Builder", available: false },
      { id: 59, name: "Monthly Planner Builder", available: false },
      { id: 60, name: "Life Area Balance Planner", available: false },
      { id: 61, name: "Personal Operating System Builder", available: false },
      { id: 62, name: "Routine Tracker Builder", available: false },
      { id: 63, name: "Home Project Planner", available: false },
      { id: 64, name: "Event Planning Checklist Builder", available: false },
    ],
  },
  {
    name: "Creator Productivity",
    description: "Plan content, videos, and publishing.",
    tools: [
      { id: 65, name: "YouTube Production Planner", available: false },
      { id: 66, name: "Video Script Planner", available: false },
      { id: 67, name: "Content Pipeline Tracker", available: false },
      { id: 68, name: "Social Media Planner", available: false },
      { id: 69, name: "Creator Workflow Builder", available: false },
      { id: 70, name: "Newsletter Planning Tool", available: false },
      { id: 71, name: "Podcast Episode Planner", available: false },
      { id: 72, name: "Content Idea Organizer", available: false },
      { id: 73, name: "Publishing Workflow Planner", available: false },
      { id: 74, name: "Creator Goal Planner", available: false },
    ],
  },
];

export const TOTAL_TOOLS = CATEGORIES.reduce((n, c) => n + c.tools.length, 0);

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const SEARCH_REGISTRY: ToolResult[] = CATEGORIES.flatMap((cat) =>
  cat.tools.map((tool) => ({
    name: tool.name,
    description: "",
    slug: tool.slug || slugify(tool.name),
    href: tool.slug ? `/productivity/tools/${tool.slug}` : "/productivity#tools",
    category: cat.name,
    isBuilt: tool.available === true,
  }))
);
