import { Activity, AlertTriangle, AlignLeft, Armchair, ArrowRightLeft, ArrowRightToLine, Atom, Award, Banknote, BarChart, BarChart3, Blocks, BookA, BookCheck, BookHeart, BookMarked, BookOpen, BookOpenCheck, BookOpenText, BookText, Boxes, Brain, BrainCircuit, Briefcase, Calculator, CalendarClock, CalendarDays, CalendarRange, CheckSquare, CircleDot, ClipboardCheck, ClipboardEdit, ClipboardList, ClipboardSignature, Clock4, Code, Coins, Columns, Crosshair, Dice5, Divide, Dna, Dumbbell, Eye, FileCheck, FilePen, FilePlus, FileQuestion, FileSearch, FileSearch2, FileStack, FileText, Film, Flag, Flame, FlaskConical, FolderOpen, FormInput, Gauge, GitBranch, GitCompareArrows, GitMerge, Globe, Goal, GraduationCap, Grid3x3, Handshake, HeartHandshake, HelpCircle, Highlighter, Hourglass, Languages, Layers, Layers3, LayoutGrid, LayoutTemplate, Library, Lightbulb, LineChart, Link2, ListChecks, ListTodo, Mail, Map, MapPin, Medal, Megaphone, MessageCircle, MessageSquare, MessageSquareText, MessagesSquare, Microscope, Mountain, MoveRight, MoveUpRight, Network, NotebookPen, Orbit, Palette, PenLine, Percent, PieChart, Plane, Presentation, Radio, Repeat, Route, Ruler, Scale, ScrollText, Settings2, Shapes, Shuffle, Sigma, Sparkles, Speech, Split, Star, Sticker, StickyNote, Sun, Sunrise, Table, Table2, Tag, Target, Timer, ToggleLeft, TrendingUp, Type, UserCheck, UserCircle, UserCog, UserPlus, Users, UsersRound, Volume2, WholeWord, Workflow, Zap, type Lucide } from "lucide-react";

const TimerIcon = Timer;
const TrendingUpIcon = TrendingUp;
const AwardIcon = Award;
const HandshakeIcon = Handshake;
const BarChartHorizontal = BarChart3;


export type Tool = {
  slug: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  status: "live" | "soon";
};

export type Category = {
  id: string;
  name: string;
  tools: Tool[];
};

const slug = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const mk = (name: string, desc: string, icon: LucideIcon, built = false): Tool => ({
  slug: slug(name), name, desc, icon, status: built ? "live" : "soon",
});

export const categories: Category[] = [
  {
    id: "learning-management",
    name: "Learning Management",
    tools: [
      mk("Course Planner", "Plan and organize courses across terms", BookOpen),
      mk("Curriculum Builder", "Design a structured curriculum framework", Layers),
      mk("Learning Path Designer", "Map progressive learner journeys", Map),
      mk("Lesson Plan Template", "Fillable lesson plan with objectives", FileText, true),
      mk("Unit Plan Builder", "Build multi-lesson teaching units", Layers3),
      mk("Scope & Sequence Planner", "Sequence topics across the year", ListChecks),
      mk("Academic Calendar Builder", "Build a term and event calendar", CalendarDays),
      mk("Learning Objective Mapper", "Map objectives to standards", Target),
      mk("Bloom's Taxonomy Planner", "Plan tasks across Bloom's levels", Brain, true),
      mk("Assessment Planner", "Plan formative and summative assessments", ClipboardList),
      mk("IEP Goal Builder", "Write measurable IEP goals", Goal),
      mk("Syllabus Generator", "Generate a printable syllabus", ScrollText, true),
    ],
  },
  {
    id: "study-tools",
    name: "Study Tools",
    tools: [
      mk("Flashcard Creator", "Create and study flashcards", StickyNote, true),
      mk("Spaced Repetition Scheduler", "Schedule cards with SM-2 style review", Repeat),
      mk("Cornell Notes Template", "Cornell note-taking layout", NotebookPen, true),
      mk("Study Schedule Builder", "Block out your study week", CalendarClock),
      mk("Pomodoro Study Timer", "Focus timer with breaks", Timer, true),
      mk("Active Recall Practice Tool", "Self-quiz from your notes", BrainCircuit),
      mk("Concept Map Builder", "Connect ideas visually", Network),
      mk("Mind Map Study Tool", "Branching study mind maps", Route),
      mk("Reading Comprehension Builder", "Comprehension question sets", BookOpenText),
      mk("Study Group Planner", "Coordinate group study sessions", Users),
      mk("Exam Countdown Timer", "Days, hours, minutes to exam", Hourglass, true),
      mk("Test Prep Checklist", "Track prep tasks per exam", CheckSquare),
      mk("Learning Summary Builder", "Summaries with key takeaways", FileSearch),
      mk("Feynman Technique Guide", "Explain it simply, then refine", Lightbulb),
    ],
  },
  {
    id: "science",
    name: "Science Education",
    tools: [
      mk("Periodic Table Explorer", "Interactive periodic table", Atom, true),
      mk("Molecular Viewer", "3D molecule viewer in browser", Boxes),
      mk("Chemical Equation Balancer", "Balance chemistry equations", FlaskConical, true),
      mk("Atom Builder", "Build atoms with protons and electrons", Orbit),
      mk("Cell Biology Explorer", "Explore cell organelles", Microscope),
      mk("DNA Sequence Visualizer", "Visualize DNA strands", Dna),
      mk("Genetics Punnett Square Tool", "Cross alleles instantly", Table2, true),
      mk("Physics Formula Reference", "Searchable physics formulas", Sigma),
      mk("Force Diagram Builder", "Draw free-body diagrams", ArrowRightToLine),
      mk("Circuit Diagram Simulator", "Simple circuit sandbox", Zap),
      mk("Wave Properties Visualizer", "Wavelength, frequency, amplitude", Activity),
      mk("Light Refraction Simulator", "Snell's law visual", Sun),
      mk("Electromagnetic Spectrum Explorer", "Explore the EM spectrum", Radio),
      mk("Geological Time Scale Explorer", "Eras, periods, epochs", Mountain),
    ],
  },
  {
    id: "math",
    name: "Mathematics Education",
    tools: [
      mk("Function Grapher", "Graph y = f(x) functions", LineChart, true),
      mk("Geometry Shape Explorer", "Areas, perimeters, properties", Shapes),
      mk("Coordinate Plane Tool", "Plot points on the plane", Crosshair),
      mk("Vector Visualizer", "Visualize 2D vectors", MoveUpRight),
      mk("Matrix Operations Visualizer", "Add, multiply matrices", Table),
      mk("Statistics Distribution Viewer", "Normal, binomial and more", BarChart3),
      mk("Probability Simulator", "Coin, dice and card sims", Dice5),
      mk("Number Line Tool", "Visual number line", Ruler),
      mk("Fraction Visual Builder", "See fractions as parts", PieChart),
      mk("Algebra Tile Simulator", "Model algebra with tiles", Blocks),
      mk("Times Table Visualizer", "12x12 multiplication table", Calculator, true),
      mk("Long Division Tool", "Step-by-step long division", Divide, true),
      mk("Prime Factor Tree Builder", "Factor any number", GitBranch, true),
      mk("Venn Diagram Tool", "Set intersections visually", CircleDot),
    ],
  },
  {
    id: "language",
    name: "Language & Literature",
    tools: [
      mk("Reading Level Analyzer", "Flesch-Kincaid readability", BookA, true),
      mk("Vocabulary Builder", "Build vocabulary lists", BookMarked),
      mk("Grammar Concept Explorer", "Grammar rules and examples", Type),
      mk("Parts of Speech Labeler", "Label nouns, verbs and more", Tag),
      mk("Sentence Structure Diagrammer", "Diagram a sentence", AlignLeft),
      mk("Literary Devices Reference", "Metaphor, simile, irony…", Sparkles),
      mk("Figurative Language Identifier", "Spot devices in text", Palette),
      mk("Story Structure Planner", "Plan plot and arc", LayoutTemplate),
      mk("Essay Outline Builder", "Outline an essay quickly", PenLine, true),
      mk("Research Paper Template", "Academic paper scaffold", FilePen),
      mk("Annotation Tool", "Highlight and annotate text", Highlighter),
      mk("Book Discussion Guide Generator", "Generate discussion prompts", MessagesSquare),
    ],
  },
  {
    id: "history",
    name: "History & Social Studies",
    tools: [
      mk("Historical Timeline Builder", "Build chronological timelines", Clock4, true),
      mk("Map Annotation Tool", "Annotate historical maps", MapPin),
      mk("Historical Event Comparator", "Compare events side by side", GitCompareArrows),
      mk("Primary Source Analyzer", "Analyze documents systematically", FileSearch2),
      mk("Cause & Effect Chain Builder", "Map causes to outcomes", Workflow),
      mk("Compare & Contrast Matrix", "Compare topics in a matrix", Columns),
      mk("Document-Based Question Template", "DBQ scaffold", FileQuestion),
      mk("Historical Figure Profile Builder", "Profile any figure", UserCircle),
      mk("Geopolitical Map Explorer", "Explore world regions", Globe),
      mk("Historical Debate Organizer", "Organize debate arguments", Scale),
    ],
  },
  {
    id: "assessment",
    name: "Assessment & Testing",
    tools: [
      mk("Quiz Maker", "Build quizzes in minutes", HelpCircle, true),
      mk("Multiple Choice Test Builder", "Generate MCQ tests", ListTodo),
      mk("True/False Quiz Builder", "Quick T/F quizzes", ToggleLeft),
      mk("Fill-in-the-Blank Test Maker", "Cloze-style tests", FormInput),
      mk("Matching Exercise Builder", "Match terms to definitions", Link2),
      mk("Short Answer Rubric Builder", "Rubrics for short answers", MessageSquare),
      mk("Essay Rubric Builder", "Build essay grading rubrics", Award),
      mk("Grading Scale Calculator", "Score to letter grade", Percent, true),
      mk("Test Score Analyzer", "Stats on test results", TrendingUp),
      mk("Learning Gap Identifier", "Identify weak topics", AlertTriangle),
      mk("Self-Assessment Checklist", "Student self-check", ClipboardCheck),
      mk("Peer Assessment Template", "Structured peer feedback", UsersRound),
      mk("Portfolio Assessment Builder", "Portfolio rubrics", FolderOpen),
      mk("Summative Assessment Planner", "Plan end-of-unit tests", FileCheck),
    ],
  },
  {
    id: "teacher",
    name: "Teacher Tools",
    tools: [
      mk("Lesson Timer", "Stage and segment timer", Hourglass),
      mk("Random Student Picker", "Fair random name picker", Shuffle, true),
      mk("Seating Chart Builder", "Drag-and-drop seating", Armchair),
      mk("Attendance Tracker", "Daily attendance log", UserCheck),
      mk("Grade Tracker", "Track grades by student", BookCheck),
      mk("Parent Communication Template", "Email templates for parents", Mail),
      mk("Conference Note Builder", "Structured conference notes", MessageCircle),
      mk("Differentiation Planner", "Plan tiered tasks", Split),
      mk("Co-Teaching Planner", "Plan with a co-teacher", Handshake),
      mk("Substitute Teacher Plan Builder", "Sub plans in minutes", UserPlus),
      mk("Classroom Rules Poster Maker", "Print classroom rules", Megaphone),
      mk("Behavior Tracker", "Track behaviors over time", Eye),
      mk("Exit Ticket Builder", "Quick end-of-class checks", Sticker),
      mk("Warm-Up Activity Generator", "Generate bell-ringers", Sunrise),
    ],
  },
  {
    id: "special-ed",
    name: "Special Education",
    tools: [
      mk("Visual Schedule Builder", "Picture-based daily schedule", CalendarRange),
      mk("Token Economy Chart", "Token reward tracker", Coins),
      mk("Behavior Data Tracker", "ABC behavior data", BarChart),
      mk("Communication Board Maker", "Build AAC boards", MessageSquareText),
      mk("Social Story Builder", "Write social stories", BookHeart),
      mk("Sensory Profile Planner", "Plan sensory supports", Gauge),
      mk("Accommodation Planner", "Plan accommodations", Settings2),
      mk("IEP Progress Monitor", "Track IEP goal progress", Activity),
      mk("AAC Symbol Chart Maker", "Create AAC symbol grids", LayoutGrid),
      mk("Transition Plan Builder", "Plan student transitions", ArrowRightLeft),
    ],
  },
  {
    id: "higher-ed",
    name: "Higher Education",
    tools: [
      mk("Research Proposal Template", "Structured proposal scaffold", FilePlus),
      mk("Thesis Outline Builder", "Outline your thesis", FileStack),
      mk("Literature Review Organizer", "Organize sources", Library),
      mk("Academic Writing Checklist", "Checklist for academic prose", ClipboardEdit),
      mk("Citation Style Comparator", "APA vs MLA vs Chicago", BookOpenCheck),
      mk("Peer Review Template", "Structured peer review", UserCog),
      mk("Grant Proposal Guide", "Grant proposal sections", Banknote),
      mk("Dissertation Chapter Planner", "Plan each chapter", BookText),
      mk("Academic Conference Presentation Planner", "Plan a talk", Presentation),
      mk("Faculty Course Evaluator Template", "Course evaluation form", Star),
    ],
  },
  {
    id: "language-learning",
    name: "Language Learning",
    tools: [
      mk("Vocabulary Flashcard Builder", "Bilingual flashcards", Languages, true),
      mk("Conjugation Practice Tool", "Practice verb conjugations", GitMerge),
      mk("Sentence Translation Builder", "Build translation drills", WholeWord),
      mk("Pronunciation Guide", "IPA pronunciation helper", Volume2),
      mk("Language Level Self-Assessor", "Estimate your CEFR level", Star),
      mk("Grammar Drill Builder", "Targeted grammar drills", Dumbbell),
      mk("Language Exchange Plan Template", "Plan exchange sessions", MessageCircle),
      mk("Duolingo-Style Drill Builder", "Bite-sized language drills", Speech),
      mk("Language Learning Streak Tracker", "Track daily streaks", Flame),
      mk("Immersion Schedule Planner", "Plan immersion blocks", Plane),
    ],
  },
  {
    id: "professional",
    name: "Skill & Professional Development",
    tools: [
      mk("Skill Gap Analyzer", "Find your skill gaps", BarChartHorizontal),
      mk("Learning Goal Statement Builder", "Write SMART goals", Flag),
      mk("Professional Development Plan", "Plan your PD year", Briefcase),
      mk("Micro-Credential Planner", "Plan micro-credentials", Medal),
      mk("Mentorship Program Outline", "Outline a mentoring program", HeartHandshake),
      mk("Training Evaluation Template", "Evaluate training sessions", ClipboardSignature),
      mk("Instructional Design Storyboard", "Storyboard a course", Film),
      mk("eLearning Script Builder", "Write eLearning scripts", Code),
    ],
  },
];

export const allTools: Tool[] = categories.flatMap((c) => c.tools);

export function findTool(slugStr: string): { tool: Tool; category: Category } | null {
  for (const c of categories) {
    const t = c.tools.find((x) => x.slug === slugStr);
    if (t) return { tool: t, category: c };
  }
  return null;
}
