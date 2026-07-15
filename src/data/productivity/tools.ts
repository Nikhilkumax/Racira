import { DatabaseZap, Calendar, Calendar1, ALargeSmall, Activity, CalendarCheck, Layout, LucideDatabaseZap, CalendarCheck2, LayoutDashboard, LayoutGrid, CalendarClock, AlarmClockCheck, LayoutList, AlarmClockMinus, LucidePlugZap, CalendarCog, LucideRepeat, CalendarDays, LucidePlugZap2, BadgeCheck, CalendarFold, LucideRoute, BookCheck, BookOpenCheck, LucideZap, LucideRouteOff, LayoutPanelLeft, BookmarkCheck, LucideRouter, Route, Check, AlarmClockOff, LucideZapOff, LayoutPanelTop, LayoutTemplate, LucideUserSearch, LucideLayout, LucideLayoutDashboard, PlugZap, PlugZap2, CalendarHeart, LucideLayoutGrid, File, LucideLayoutList, CalendarMinus, LucideRepeat1, LucideLayoutPanelLeft, RouteOff, LucideRepeat2, LucideLayoutPanelTop, Zap, Router, GraduationCap, CheckCheck, ZapOff, LucideLayoutTemplate, CalendarMinus2, CalendarOff, BookOpen, BookOpenText, Repeat, LucideMap, CheckCircle, ClipboardPen, ClipboardPenLine, LucideSend, Codepen, Focus, DoorOpen, FilePen, Lightbulb, LucideFocus, FilePenLine } from "lucide-react";
import { Tool, Category } from "@/domains/_types";

export const CATEGORIES: Category[] = [
  {
    name: "Focus & Time Management",
    description: "Plan deep work, time blocks, and energy.",
    tools: [
      { slug: "deep-work-session-planner", name: "Deep Work Session Planner", description: "Manage time and focus.", icon: DatabaseZap, status: "live" },
      { slug: "time-blocking-planner", name: "Time Blocking Planner", description: "Manage time and focus.", icon: Calendar, status: "soon" },
      { slug: "daily-schedule-builder", name: "Daily Schedule Builder", description: "Manage time and focus.", icon: Calendar1, status: "soon" },
      { slug: "priority-matrix-generator", name: "Priority Matrix Generator", description: "Manage time and focus.", icon: ALargeSmall, status: "soon" },
      { slug: "break-frequency-optimizer", name: "Break Frequency Optimizer", description: "Manage time and focus.", icon: Activity, status: "soon" },
      { slug: "distraction-free-session-timer", name: "Distraction-Free Session Timer", description: "Manage time and focus.", icon: CalendarCheck, status: "soon" },
      { slug: "energy-level-planner", name: "Energy Level Planner", description: "Manage time and focus.", icon: Layout, status: "soon" },
      { slug: "work-sprint-planner", name: "Work Sprint Planner", description: "Manage time and focus.", icon: LucideDatabaseZap, status: "soon" },
      { slug: "multi-timer-workspace", name: "Multi-Timer Workspace", description: "Manage time and focus.", icon: CalendarCheck2, status: "soon" },
      { slug: "countdown-widget-builder", name: "Countdown Widget Builder", description: "Manage time and focus.", icon: LayoutDashboard, status: "soon" },
      { slug: "ultradian-rhythm-planner", name: "Ultradian Rhythm Planner", description: "Manage time and focus.", icon: LayoutGrid, status: "soon" },
      { slug: "time-leak-detector", name: "Time Leak Detector", description: "Manage time and focus.", icon: CalendarClock, status: "soon" },
      { slug: "task-batching-planner", name: "Task Batching Planner", description: "Manage time and focus.", icon: AlarmClockCheck, status: "soon" },
      { slug: "flow-state-planner", name: "Flow State Planner", description: "Manage time and focus.", icon: LayoutList, status: "soon" },
      { slug: "context-switching-analyzer", name: "Context Switching Analyzer", description: "Manage time and focus.", icon: AlarmClockMinus, status: "soon" },
      { slug: "focus-session-builder", name: "Focus Session Builder", description: "Manage time and focus.", icon: LucidePlugZap, status: "soon" },
      { slug: "weekly-time-planner", name: "Weekly Time Planner", description: "Manage time and focus.", icon: CalendarCog, status: "soon" },
      { slug: "routine-designer", name: "Routine Designer", description: "Manage time and focus.", icon: LucideRepeat, status: "soon" },
      { slug: "personal-time-audit", name: "Personal Time Audit", description: "Manage time and focus.", icon: CalendarDays, status: "soon" },
      { slug: "focus-goal-planner", name: "Focus Goal Planner", description: "Manage time and focus.", icon: LucidePlugZap2, status: "soon" },
    ],
  },
  {
    name: "Task & Project Productivity",
    description: "Break work down, plan, and ship.",
    tools: [
      { slug: "task-breakdown-generator", name: "Task Breakdown Generator", description: "Organize and track tasks.", icon: BadgeCheck, status: "soon" },
      { slug: "project-timeline-planner", name: "Project Timeline Planner", description: "Organize and track tasks.", icon: CalendarFold, status: "soon" },
      { slug: "milestone-planner", name: "Milestone Planner", description: "Organize and track tasks.", icon: LucideRoute, status: "soon" },
      { slug: "action-item-generator", name: "Action Item Generator", description: "Organize and track tasks.", icon: BookCheck, status: "soon" },
      { slug: "kanban-board-builder", name: "Kanban Board Builder", description: "Organize and track tasks.", icon: BookOpenCheck, status: "soon" },
      { slug: "workload-planner", name: "Workload Planner", description: "Organize and track tasks.", icon: LucideZap, status: "soon" },
      { slug: "project-scope-planner", name: "Project Scope Planner", description: "Organize and track tasks.", icon: LucideRouteOff, status: "soon" },
      { slug: "delegation-planner", name: "Delegation Planner", description: "Organize and track tasks.", icon: LayoutPanelLeft, status: "soon" },
      { slug: "backlog-organizer", name: "Backlog Organizer", description: "Organize and track tasks.", icon: BookmarkCheck, status: "soon" },
      { slug: "project-kickoff-planner", name: "Project Kickoff Planner", description: "Organize and track tasks.", icon: LucideRouter, status: "soon" },
      { slug: "project-roadmap-builder", name: "Project Roadmap Builder", description: "Organize and track tasks.", icon: Route, status: "soon" },
      { slug: "task-dependency-mapper", name: "Task Dependency Mapper", description: "Organize and track tasks.", icon: Check, status: "soon" },
      { slug: "deliverable-tracker", name: "Deliverable Tracker", description: "Organize and track tasks.", icon: AlarmClockOff, status: "soon" },
      { slug: "work-prioritization-planner", name: "Work Prioritization Planner", description: "Organize and track tasks.", icon: LucideZapOff, status: "soon" },
    ],
  },
  {
    name: "Writing & Knowledge Work",
    description: "Structure writing, research, and notes.",
    tools: [
      { slug: "blog-post-length-planner", name: "Blog Post Length Planner", description: "Structure your knowledge.", icon: LayoutPanelTop, status: "soon" },
      { slug: "whitepaper-structure-planner", name: "Whitepaper Structure Planner", description: "Structure your knowledge.", icon: LayoutTemplate, status: "soon" },
      { slug: "meeting-notes-template-generator", name: "Meeting Notes Template Generator", description: "Structure your knowledge.", icon: LucideUserSearch, status: "soon" },
      { slug: "case-study-structure-planner", name: "Case Study Structure Planner", description: "Structure your knowledge.", icon: LucideLayout, status: "soon" },
      { slug: "pitch-deck-slide-count-planner", name: "Pitch Deck Slide Count Planner", description: "Structure your knowledge.", icon: LucideLayoutDashboard, status: "soon" },
      { slug: "research-workflow-planner", name: "Research Workflow Planner", description: "Structure your knowledge.", icon: PlugZap, status: "soon" },
      { slug: "writing-session-planner", name: "Writing Session Planner", description: "Structure your knowledge.", icon: PlugZap2, status: "soon" },
      { slug: "publishing-schedule-planner", name: "Publishing Schedule Planner", description: "Structure your knowledge.", icon: CalendarHeart, status: "soon" },
      { slug: "documentation-planner", name: "Documentation Planner", description: "Structure your knowledge.", icon: LucideLayoutGrid, status: "soon" },
      { slug: "interview-notes-organizer", name: "Interview Notes Organizer", description: "Structure your knowledge.", icon: File, status: "soon" },
      { slug: "brainstorming-board-builder", name: "Brainstorming Board Builder", description: "Structure your knowledge.", icon: LucideLayoutList, status: "soon" },
    ],
  },
  {
    name: "Goal Setting & Habits",
    description: "Design goals, habits, and growth.",
    tools: [
      { slug: "annual-goal-decomposer", name: "Annual Goal Decomposer", description: "Build habits and goals.", icon: CalendarMinus, status: "soon" },
      { slug: "habit-tracker-builder", name: "Habit Tracker Builder", description: "Build habits and goals.", icon: LucideRepeat1, status: "soon" },
      { slug: "accountability-planner", name: "Accountability Planner", description: "Build habits and goals.", icon: LucideLayoutPanelLeft, status: "soon" },
      { slug: "personal-growth-roadmap", name: "Personal Growth Roadmap", description: "Build habits and goals.", icon: RouteOff, status: "soon" },
      { slug: "habit-loop-designer", name: "Habit Loop Designer", description: "Build habits and goals.", icon: LucideRepeat2, status: "soon" },
      { slug: "life-vision-planner", name: "Life Vision Planner", description: "Build habits and goals.", icon: LucideLayoutPanelTop, status: "soon" },
    ],
  },
  {
    name: "Learning & Skill Development",
    description: "Practice, learn, track progress.",
    tools: [
      { slug: "deliberate-practice-session-planner", name: "Deliberate Practice Session Planner", description: "Accelerate your learning.", icon: Zap, status: "soon" },
      { slug: "learning-roadmap-builder", name: "Learning Roadmap Builder", description: "Accelerate your learning.", icon: Router, status: "soon" },
      { slug: "learning-progress-tracker", name: "Learning Progress Tracker", description: "Accelerate your learning.", icon: GraduationCap, status: "soon" },
    ],
  },
  {
    name: "Team Productivity",
    description: "Coordinate people and meetings.",
    tools: [
      { slug: "meeting-action-tracker", name: "Meeting Action Tracker", description: "Collaborate with your team.", icon: CheckCheck, status: "soon" },
      { slug: "team-workload-planner", name: "Team Workload Planner", description: "Collaborate with your team.", icon: ZapOff, status: "soon" },
      { slug: "collaboration-planner", name: "Collaboration Planner", description: "Collaborate with your team.", icon: LucideLayoutTemplate, status: "soon" },
    ],
  },
  {
    name: "Personal Organization",
    description: "Plan your week, month, and life.",
    tools: [
      { slug: "weekly-planner-builder", name: "Weekly Planner Builder", description: "Organize your personal life.", icon: CalendarMinus2, status: "soon" },
      { slug: "monthly-planner-builder", name: "Monthly Planner Builder", description: "Organize your personal life.", icon: CalendarOff, status: "soon" },
      { slug: "life-area-balance-planner", name: "Life Area Balance Planner", description: "Organize your personal life.", icon: BookOpen, status: "soon" },
      { slug: "personal-operating-system-builder", name: "Personal Operating System Builder", description: "Organize your personal life.", icon: BookOpenText, status: "soon" },
      { slug: "routine-tracker-builder", name: "Routine Tracker Builder", description: "Organize your personal life.", icon: Repeat, status: "soon" },
      { slug: "home-project-planner", name: "Home Project Planner", description: "Organize your personal life.", icon: LucideMap, status: "soon" },
      { slug: "event-planning-checklist-builder", name: "Event Planning Checklist Builder", description: "Organize your personal life.", icon: CheckCircle, status: "soon" },
    ],
  },
  {
    name: "Creator Productivity",
    description: "Plan content, videos, and publishing.",
    tools: [
      { slug: "youtube-production-planner", name: "YouTube Production Planner", description: "Plan your content workflow.", icon: ClipboardPen, status: "soon" },
      { slug: "video-script-planner", name: "Video Script Planner", description: "Plan your content workflow.", icon: ClipboardPenLine, status: "soon" },
      { slug: "content-pipeline-tracker", name: "Content Pipeline Tracker", description: "Plan your content workflow.", icon: LucideSend, status: "soon" },
      { slug: "social-media-planner", name: "Social Media Planner", description: "Plan your content workflow.", icon: Codepen, status: "soon" },
      { slug: "creator-workflow-builder", name: "Creator Workflow Builder", description: "Plan your content workflow.", icon: Focus, status: "soon" },
      { slug: "newsletter-planning-tool", name: "Newsletter Planning Tool", description: "Plan your content workflow.", icon: DoorOpen, status: "soon" },
      { slug: "podcast-episode-planner", name: "Podcast Episode Planner", description: "Plan your content workflow.", icon: FilePen, status: "soon" },
      { slug: "content-idea-organizer", name: "Content Idea Organizer", description: "Plan your content workflow.", icon: Lightbulb, status: "soon" },
      { slug: "publishing-workflow-planner", name: "Publishing Workflow Planner", description: "Plan your content workflow.", icon: LucideFocus, status: "soon" },
      { slug: "creator-goal-planner", name: "Creator Goal Planner", description: "Plan your content workflow.", icon: FilePenLine, status: "soon" },
    ],
  },
];

export const TOTAL_TOOLS = CATEGORIES.reduce((n, c) => n + c.tools.length, 0);

export const SEARCH_REGISTRY: ToolResult[] = CATEGORIES.flatMap((cat) =>
  cat.tools.map((tool: Tool) => ({
    name: tool.name,
    description: tool.description,
    slug: tool.slug,
    href: `/productivity/tools/${tool.slug}`,
    category: cat.name,
    isBuilt: tool.status === "live",
  }))
);
