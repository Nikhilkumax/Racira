import { ToolResult } from "@/components/CategorySearch";
import { inferIcon } from "@/components/shared/icon-map";
import { Tool, Category } from "@/domains/_types";

export const CATEGORIES: Category[] = [
  {
    name: "Focus & Time Management",
    description: "Plan deep work, time blocks, and energy.",
    tools: [
      { slug: "deep-work-session-planner", name: "Deep Work Session Planner", description: "Manage time and focus.", icon: inferIcon("Deep Work Session Planner", "deep-work-session-planner"), status: "live" },
      { slug: "time-blocking-planner", name: "Time Blocking Planner", description: "Manage time and focus.", icon: inferIcon("Time Blocking Planner", "time-blocking-planner"), status: "soon" },
      { slug: "daily-schedule-builder", name: "Daily Schedule Builder", description: "Manage time and focus.", icon: inferIcon("Daily Schedule Builder", "daily-schedule-builder"), status: "soon" },
      { slug: "priority-matrix-generator", name: "Priority Matrix Generator", description: "Manage time and focus.", icon: inferIcon("Priority Matrix Generator", "priority-matrix-generator"), status: "soon" },
      { slug: "break-frequency-optimizer", name: "Break Frequency Optimizer", description: "Manage time and focus.", icon: inferIcon("Break Frequency Optimizer", "break-frequency-optimizer"), status: "soon" },
      { slug: "distraction-free-session-timer", name: "Distraction-Free Session Timer", description: "Manage time and focus.", icon: inferIcon("Distraction-Free Session Timer", "distraction-free-session-timer"), status: "soon" },
      { slug: "energy-level-planner", name: "Energy Level Planner", description: "Manage time and focus.", icon: inferIcon("Energy Level Planner", "energy-level-planner"), status: "soon" },
      { slug: "work-sprint-planner", name: "Work Sprint Planner", description: "Manage time and focus.", icon: inferIcon("Work Sprint Planner", "work-sprint-planner"), status: "soon" },
      { slug: "multi-timer-workspace", name: "Multi-Timer Workspace", description: "Manage time and focus.", icon: inferIcon("Multi-Timer Workspace", "multi-timer-workspace"), status: "soon" },
      { slug: "countdown-widget-builder", name: "Countdown Widget Builder", description: "Manage time and focus.", icon: inferIcon("Countdown Widget Builder", "countdown-widget-builder"), status: "soon" },
      { slug: "ultradian-rhythm-planner", name: "Ultradian Rhythm Planner", description: "Manage time and focus.", icon: inferIcon("Ultradian Rhythm Planner", "ultradian-rhythm-planner"), status: "soon" },
      { slug: "time-leak-detector", name: "Time Leak Detector", description: "Manage time and focus.", icon: inferIcon("Time Leak Detector", "time-leak-detector"), status: "soon" },
      { slug: "task-batching-planner", name: "Task Batching Planner", description: "Manage time and focus.", icon: inferIcon("Task Batching Planner", "task-batching-planner"), status: "soon" },
      { slug: "flow-state-planner", name: "Flow State Planner", description: "Manage time and focus.", icon: inferIcon("Flow State Planner", "flow-state-planner"), status: "soon" },
      { slug: "context-switching-analyzer", name: "Context Switching Analyzer", description: "Manage time and focus.", icon: inferIcon("Context Switching Analyzer", "context-switching-analyzer"), status: "soon" },
      { slug: "focus-session-builder", name: "Focus Session Builder", description: "Manage time and focus.", icon: inferIcon("Focus Session Builder", "focus-session-builder"), status: "soon" },
      { slug: "weekly-time-planner", name: "Weekly Time Planner", description: "Manage time and focus.", icon: inferIcon("Weekly Time Planner", "weekly-time-planner"), status: "soon" },
      { slug: "routine-designer", name: "Routine Designer", description: "Manage time and focus.", icon: inferIcon("Routine Designer", "routine-designer"), status: "soon" },
      { slug: "personal-time-audit", name: "Personal Time Audit", description: "Manage time and focus.", icon: inferIcon("Personal Time Audit", "personal-time-audit"), status: "soon" },
      { slug: "focus-goal-planner", name: "Focus Goal Planner", description: "Manage time and focus.", icon: inferIcon("Focus Goal Planner", "focus-goal-planner"), status: "soon" },
    ],
  },
  {
    name: "Task & Project Productivity",
    description: "Break work down, plan, and ship.",
    tools: [
      { slug: "task-breakdown-generator", name: "Task Breakdown Generator", description: "Organize and track tasks.", icon: inferIcon("Task Breakdown Generator", "task-breakdown-generator"), status: "soon" },
      { slug: "project-timeline-planner", name: "Project Timeline Planner", description: "Organize and track tasks.", icon: inferIcon("Project Timeline Planner", "project-timeline-planner"), status: "soon" },
      { slug: "milestone-planner", name: "Milestone Planner", description: "Organize and track tasks.", icon: inferIcon("Milestone Planner", "milestone-planner"), status: "soon" },
      { slug: "action-item-generator", name: "Action Item Generator", description: "Organize and track tasks.", icon: inferIcon("Action Item Generator", "action-item-generator"), status: "soon" },
      { slug: "kanban-board-builder", name: "Kanban Board Builder", description: "Organize and track tasks.", icon: inferIcon("Kanban Board Builder", "kanban-board-builder"), status: "soon" },
      { slug: "workload-planner", name: "Workload Planner", description: "Organize and track tasks.", icon: inferIcon("Workload Planner", "workload-planner"), status: "soon" },
      { slug: "project-scope-planner", name: "Project Scope Planner", description: "Organize and track tasks.", icon: inferIcon("Project Scope Planner", "project-scope-planner"), status: "soon" },
      { slug: "delegation-planner", name: "Delegation Planner", description: "Organize and track tasks.", icon: inferIcon("Delegation Planner", "delegation-planner"), status: "soon" },
      { slug: "backlog-organizer", name: "Backlog Organizer", description: "Organize and track tasks.", icon: inferIcon("Backlog Organizer", "backlog-organizer"), status: "soon" },
      { slug: "project-kickoff-planner", name: "Project Kickoff Planner", description: "Organize and track tasks.", icon: inferIcon("Project Kickoff Planner", "project-kickoff-planner"), status: "soon" },
      { slug: "project-roadmap-builder", name: "Project Roadmap Builder", description: "Organize and track tasks.", icon: inferIcon("Project Roadmap Builder", "project-roadmap-builder"), status: "soon" },
      { slug: "task-dependency-mapper", name: "Task Dependency Mapper", description: "Organize and track tasks.", icon: inferIcon("Task Dependency Mapper", "task-dependency-mapper"), status: "soon" },
      { slug: "deliverable-tracker", name: "Deliverable Tracker", description: "Organize and track tasks.", icon: inferIcon("Deliverable Tracker", "deliverable-tracker"), status: "soon" },
      { slug: "work-prioritization-planner", name: "Work Prioritization Planner", description: "Organize and track tasks.", icon: inferIcon("Work Prioritization Planner", "work-prioritization-planner"), status: "soon" },
    ],
  },
  {
    name: "Writing & Knowledge Work",
    description: "Structure writing, research, and notes.",
    tools: [
      { slug: "blog-post-length-planner", name: "Blog Post Length Planner", description: "Structure your knowledge.", icon: inferIcon("Blog Post Length Planner", "blog-post-length-planner"), status: "soon" },
      { slug: "whitepaper-structure-planner", name: "Whitepaper Structure Planner", description: "Structure your knowledge.", icon: inferIcon("Whitepaper Structure Planner", "whitepaper-structure-planner"), status: "soon" },
      { slug: "meeting-notes-template-generator", name: "Meeting Notes Template Generator", description: "Structure your knowledge.", icon: inferIcon("Meeting Notes Template Generator", "meeting-notes-template-generator"), status: "soon" },
      { slug: "case-study-structure-planner", name: "Case Study Structure Planner", description: "Structure your knowledge.", icon: inferIcon("Case Study Structure Planner", "case-study-structure-planner"), status: "soon" },
      { slug: "pitch-deck-slide-count-planner", name: "Pitch Deck Slide Count Planner", description: "Structure your knowledge.", icon: inferIcon("Pitch Deck Slide Count Planner", "pitch-deck-slide-count-planner"), status: "soon" },
      { slug: "research-workflow-planner", name: "Research Workflow Planner", description: "Structure your knowledge.", icon: inferIcon("Research Workflow Planner", "research-workflow-planner"), status: "soon" },
      { slug: "writing-session-planner", name: "Writing Session Planner", description: "Structure your knowledge.", icon: inferIcon("Writing Session Planner", "writing-session-planner"), status: "soon" },
      { slug: "publishing-schedule-planner", name: "Publishing Schedule Planner", description: "Structure your knowledge.", icon: inferIcon("Publishing Schedule Planner", "publishing-schedule-planner"), status: "soon" },
      { slug: "documentation-planner", name: "Documentation Planner", description: "Structure your knowledge.", icon: inferIcon("Documentation Planner", "documentation-planner"), status: "soon" },
      { slug: "interview-notes-organizer", name: "Interview Notes Organizer", description: "Structure your knowledge.", icon: inferIcon("Interview Notes Organizer", "interview-notes-organizer"), status: "soon" },
      { slug: "brainstorming-board-builder", name: "Brainstorming Board Builder", description: "Structure your knowledge.", icon: inferIcon("Brainstorming Board Builder", "brainstorming-board-builder"), status: "soon" },
    ],
  },
  {
    name: "Goal Setting & Habits",
    description: "Design goals, habits, and growth.",
    tools: [
      { slug: "annual-goal-decomposer", name: "Annual Goal Decomposer", description: "Build habits and goals.", icon: inferIcon("Annual Goal Decomposer", "annual-goal-decomposer"), status: "soon" },
      { slug: "habit-tracker-builder", name: "Habit Tracker Builder", description: "Build habits and goals.", icon: inferIcon("Habit Tracker Builder", "habit-tracker-builder"), status: "soon" },
      { slug: "accountability-planner", name: "Accountability Planner", description: "Build habits and goals.", icon: inferIcon("Accountability Planner", "accountability-planner"), status: "soon" },
      { slug: "personal-growth-roadmap", name: "Personal Growth Roadmap", description: "Build habits and goals.", icon: inferIcon("Personal Growth Roadmap", "personal-growth-roadmap"), status: "soon" },
      { slug: "habit-loop-designer", name: "Habit Loop Designer", description: "Build habits and goals.", icon: inferIcon("Habit Loop Designer", "habit-loop-designer"), status: "soon" },
      { slug: "life-vision-planner", name: "Life Vision Planner", description: "Build habits and goals.", icon: inferIcon("Life Vision Planner", "life-vision-planner"), status: "soon" },
    ],
  },
  {
    name: "Learning & Skill Development",
    description: "Practice, learn, track progress.",
    tools: [
      { slug: "deliberate-practice-session-planner", name: "Deliberate Practice Session Planner", description: "Accelerate your learning.", icon: inferIcon("Deliberate Practice Session Planner", "deliberate-practice-session-planner"), status: "soon" },
      { slug: "learning-roadmap-builder", name: "Learning Roadmap Builder", description: "Accelerate your learning.", icon: inferIcon("Learning Roadmap Builder", "learning-roadmap-builder"), status: "soon" },
      { slug: "learning-progress-tracker", name: "Learning Progress Tracker", description: "Accelerate your learning.", icon: inferIcon("Learning Progress Tracker", "learning-progress-tracker"), status: "soon" },
    ],
  },
  {
    name: "Team Productivity",
    description: "Coordinate people and meetings.",
    tools: [
      { slug: "meeting-action-tracker", name: "Meeting Action Tracker", description: "Collaborate with your team.", icon: inferIcon("Meeting Action Tracker", "meeting-action-tracker"), status: "soon" },
      { slug: "team-workload-planner", name: "Team Workload Planner", description: "Collaborate with your team.", icon: inferIcon("Team Workload Planner", "team-workload-planner"), status: "soon" },
      { slug: "collaboration-planner", name: "Collaboration Planner", description: "Collaborate with your team.", icon: inferIcon("Collaboration Planner", "collaboration-planner"), status: "soon" },
    ],
  },
  {
    name: "Personal Organization",
    description: "Plan your week, month, and life.",
    tools: [
      { slug: "weekly-planner-builder", name: "Weekly Planner Builder", description: "Organize your personal life.", icon: inferIcon("Weekly Planner Builder", "weekly-planner-builder"), status: "soon" },
      { slug: "monthly-planner-builder", name: "Monthly Planner Builder", description: "Organize your personal life.", icon: inferIcon("Monthly Planner Builder", "monthly-planner-builder"), status: "soon" },
      { slug: "life-area-balance-planner", name: "Life Area Balance Planner", description: "Organize your personal life.", icon: inferIcon("Life Area Balance Planner", "life-area-balance-planner"), status: "soon" },
      { slug: "personal-operating-system-builder", name: "Personal Operating System Builder", description: "Organize your personal life.", icon: inferIcon("Personal Operating System Builder", "personal-operating-system-builder"), status: "soon" },
      { slug: "routine-tracker-builder", name: "Routine Tracker Builder", description: "Organize your personal life.", icon: inferIcon("Routine Tracker Builder", "routine-tracker-builder"), status: "soon" },
      { slug: "home-project-planner", name: "Home Project Planner", description: "Organize your personal life.", icon: inferIcon("Home Project Planner", "home-project-planner"), status: "soon" },
      { slug: "event-planning-checklist-builder", name: "Event Planning Checklist Builder", description: "Organize your personal life.", icon: inferIcon("Event Planning Checklist Builder", "event-planning-checklist-builder"), status: "soon" },
    ],
  },
  {
    name: "Creator Productivity",
    description: "Plan content, videos, and publishing.",
    tools: [
      { slug: "youtube-production-planner", name: "YouTube Production Planner", description: "Plan your content workflow.", icon: inferIcon("YouTube Production Planner", "youtube-production-planner"), status: "soon" },
      { slug: "video-script-planner", name: "Video Script Planner", description: "Plan your content workflow.", icon: inferIcon("Video Script Planner", "video-script-planner"), status: "soon" },
      { slug: "content-pipeline-tracker", name: "Content Pipeline Tracker", description: "Plan your content workflow.", icon: inferIcon("Content Pipeline Tracker", "content-pipeline-tracker"), status: "soon" },
      { slug: "social-media-planner", name: "Social Media Planner", description: "Plan your content workflow.", icon: inferIcon("Social Media Planner", "social-media-planner"), status: "soon" },
      { slug: "creator-workflow-builder", name: "Creator Workflow Builder", description: "Plan your content workflow.", icon: inferIcon("Creator Workflow Builder", "creator-workflow-builder"), status: "soon" },
      { slug: "newsletter-planning-tool", name: "Newsletter Planning Tool", description: "Plan your content workflow.", icon: inferIcon("Newsletter Planning Tool", "newsletter-planning-tool"), status: "soon" },
      { slug: "podcast-episode-planner", name: "Podcast Episode Planner", description: "Plan your content workflow.", icon: inferIcon("Podcast Episode Planner", "podcast-episode-planner"), status: "soon" },
      { slug: "content-idea-organizer", name: "Content Idea Organizer", description: "Plan your content workflow.", icon: inferIcon("Content Idea Organizer", "content-idea-organizer"), status: "soon" },
      { slug: "publishing-workflow-planner", name: "Publishing Workflow Planner", description: "Plan your content workflow.", icon: inferIcon("Publishing Workflow Planner", "publishing-workflow-planner"), status: "soon" },
      { slug: "creator-goal-planner", name: "Creator Goal Planner", description: "Plan your content workflow.", icon: inferIcon("Creator Goal Planner", "creator-goal-planner"), status: "soon" },
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
