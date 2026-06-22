import {
  Calculator,
  FileText,
  Image as ImageIcon,
  Mic,
  PenTool,
  Palette,
  Type,
  Aperture,
  Video,
  Clapperboard,
  AudioWaveform,
  Pen,
  Search,
  Code,
  Briefcase,
  LineChart,
  CheckSquare,
  Gamepad2,
  GraduationCap,
  Box,
  Compass,
  Dumbbell,
  Music,
  Database,
  Wrench,
  Plane,
  Bitcoin,
  Shield,
  Network,
  Presentation,
  MapPin,
  type LucideIcon,
} from "lucide-react";

export type CategorySlug =
  | "calculator"
  | "pdf-tools"
  | "image-tools"
  | "design-tools"
  | "color-tools"
  | "typography-tools"
  | "photo-editor"
  | "video-tools"
  | "animation-tools"
  | "voice"
  | "audio-tools"
  | "writing-tools"
  | "seo-tools"
  | "developer-tools"
  | "business-tools"
  | "finance-tools"
  | "productivity-tools"
  | "games"
  | "education-tools"
  | "3d-tools"
  | "cad-tools"
  | "fitness-tools"
  | "music-tools"
  | "data-tools"
  | "engineering-tools"
  | "travel-tools"
  | "crypto-tools"
  | "security-tools"
  | "diagram-tools"
  | "presentation-tools"
  | "maps";

export interface Category {
  slug: CategorySlug;
  title: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  status: "active" | "coming-soon";
  highlights: string[];
}

export const categories: Category[] = [
  {
    slug: "calculator",
    title: "Calculator Suite",
    tagline: "NUMBERS, SOLVED.",
    description:
      "A precise set of financial, health, and everyday calculators built for instant answers.",
    icon: Calculator,
    status: "active",
    highlights: ["Finance", "Health", "Everyday", "Conversions"],
  },
  {
    slug: "pdf-tools",
    title: "PDF Tools",
    tagline: "DOCUMENTS, SIMPLIFIED.",
    description:
      "Merge, split, compress, and convert PDFs directly in your browser — no uploads required.",
    icon: FileText,
    status: "coming-soon",
    highlights: ["Merge", "Split", "Compress", "Convert"],
  },
  {
    slug: "image-tools",
    title: "Image Tools",
    tagline: "PIXELS, POLISHED.",
    description:
      "Resize, compress, crop, and convert images with professional quality and zero friction.",
    icon: ImageIcon,
    status: "coming-soon",
    highlights: ["Resize", "Compress", "Crop", "Format"],
  },
  {
    slug: "design-tools",
    title: "Design Tools",
    tagline: "IDEAS, VISUALIZED.",
    description:
      "Create graphics, layouts, and visual assets entirely in your browser with no installs.",
    icon: PenTool,
    status: "coming-soon",
    highlights: ["Graphics", "Layouts", "Export", "Templates"],
  },
  {
    slug: "color-tools",
    title: "Color Tools",
    tagline: "COLOR, PERFECTED.",
    description:
      "Pick, convert, generate palettes, and explore color theory — all in one place.",
    icon: Palette,
    status: "coming-soon",
    highlights: ["Picker", "Palette", "Convert", "Contrast"],
  },
  {
    slug: "typography-tools",
    title: "Typography Tools",
    tagline: "TYPE, CRAFTED.",
    description:
      "Explore fonts, pair typefaces, and fine-tune typographic scales for any project.",
    icon: Type,
    status: "coming-soon",
    highlights: ["Fonts", "Pairing", "Scale", "Preview"],
  },
  {
    slug: "photo-editor",
    title: "Photo Editor",
    tagline: "PHOTOS, ENHANCED.",
    description:
      "Edit, filter, crop, and retouch photos with professional-grade tools, right in your browser.",
    icon: Aperture,
    status: "coming-soon",
    highlights: ["Edit", "Filter", "Retouch", "Export"],
  },
  {
    slug: "video-tools",
    title: "Video Tools",
    tagline: "VIDEO, SIMPLIFIED.",
    description:
      "Trim, convert, compress, and edit video files without any software downloads.",
    icon: Video,
    status: "coming-soon",
    highlights: ["Trim", "Convert", "Compress", "Subtitles"],
  },
  {
    slug: "animation-tools",
    title: "Animation Tools",
    tagline: "MOTION, CREATED.",
    description:
      "Build animations, transitions, and motion graphics directly in the browser.",
    icon: Clapperboard,
    status: "coming-soon",
    highlights: ["Animate", "Timeline", "Export", "Lottie"],
  },
  {
    slug: "voice",
    title: "Voice Tools",
    tagline: "AUDIO, INTELLIGENT.",
    description:
      "High-fidelity voice synthesis and text-to-speech powered by modern AI, directly in your browser.",
    icon: Mic,
    status: "active",
    highlights: ["100+ Voices", "50+ Languages", "Unlimited", "Private"],
  },
  {
    slug: "audio-tools",
    title: "Audio Tools",
    tagline: "SOUND, ENGINEERED.",
    description:
      "Record, edit, mix, and convert audio files with a full suite of browser-based tools.",
    icon: AudioWaveform,
    status: "coming-soon",
    highlights: ["Record", "Edit", "Mix", "Convert"],
  },
  {
    slug: "writing-tools",
    title: "Writing Tools",
    tagline: "WORDS, SHARPENED.",
    description:
      "Write, edit, summarize, and improve content with AI-assisted writing tools.",
    icon: Pen,
    status: "coming-soon",
    highlights: ["AI Write", "Grammar", "Summarize", "Rewrite"],
  },
  {
    slug: "seo-tools",
    title: "SEO Tools",
    tagline: "RANKINGS, OPTIMIZED.",
    description:
      "Analyze, audit, and improve your site's search visibility with a full browser-based SEO toolkit.",
    icon: Search,
    status: "coming-soon",
    highlights: ["Audit", "Keywords", "Meta", "Backlinks"],
  },
  {
    slug: "developer-tools",
    title: "Developer Tools",
    tagline: "CODE, STREAMLINED.",
    description:
      "Format, validate, convert, and debug code with a comprehensive set of developer utilities.",
    icon: Code,
    status: "coming-soon",
    highlights: ["Format", "Validate", "Convert", "Debug"],
  },
  {
    slug: "business-tools",
    title: "Business Tools",
    tagline: "OPERATIONS, SIMPLIFIED.",
    description:
      "Manage invoices, proposals, reports, and business workflows without leaving your browser.",
    icon: Briefcase,
    status: "coming-soon",
    highlights: ["Invoices", "Reports", "Proposals", "Templates"],
  },
  {
    slug: "finance-tools",
    title: "Finance Tools",
    tagline: "MONEY, CALCULATED.",
    description:
      "Plan budgets, model investments, and calculate financial outcomes with precision tools.",
    icon: LineChart,
    status: "coming-soon",
    highlights: ["Budget", "Investment", "Tax", "Planning"],
  },
  {
    slug: "productivity-tools",
    title: "Productivity Tools",
    tagline: "WORK, ACCELERATED.",
    description:
      "Streamline tasks, manage time, and boost output with a full productivity toolkit.",
    icon: CheckSquare,
    status: "coming-soon",
    highlights: ["Tasks", "Time", "Focus", "Automation"],
  },
  {
    slug: "games",
    title: "Games",
    tagline: "FUN, INSTANT.",
    description:
      "Play hundreds of browser-based games instantly — no downloads, no accounts required.",
    icon: Gamepad2,
    status: "coming-soon",
    highlights: ["Puzzle", "Arcade", "Strategy", "Word"],
  },
  {
    slug: "education-tools",
    title: "Education Tools",
    tagline: "KNOWLEDGE, BUILT.",
    description:
      "Learn, practice, and master subjects with interactive educational tools and calculators.",
    icon: GraduationCap,
    status: "coming-soon",
    highlights: ["Math", "Science", "Language", "Quiz"],
  },
  {
    slug: "3d-tools",
    title: "3D Tools",
    tagline: "DIMENSIONS, EXPLORED.",
    description:
      "Model, preview, and calculate 3D print parameters with browser-based 3D utilities.",
    icon: Box,
    status: "coming-soon",
    highlights: ["Model", "Print", "Slicer", "Calculate"],
  },
  {
    slug: "cad-tools",
    title: "CAD Tools",
    tagline: "DESIGNS, ENGINEERED.",
    description:
      "Draft, plan, and visualize technical designs with browser-based CAD utilities.",
    icon: Compass,
    status: "coming-soon",
    highlights: ["Draft", "Blueprint", "Measure", "Export"],
  },
  {
    slug: "fitness-tools",
    title: "Fitness Tools",
    tagline: "HEALTH, TRACKED.",
    description:
      "Calculate calories, macros, BMI, and fitness metrics with tools built for real results.",
    icon: Dumbbell,
    status: "coming-soon",
    highlights: ["Calories", "BMI", "Macros", "Workout"],
  },
  {
    slug: "music-tools",
    title: "Music Tools",
    tagline: "MUSIC, MADE.",
    description:
      "Create beats, compose melodies, and work with audio theory entirely in your browser.",
    icon: Music,
    status: "coming-soon",
    highlights: ["Beats", "Compose", "Theory", "BPM"],
  },
  {
    slug: "data-tools",
    title: "Data Tools",
    tagline: "DATA, VISUALIZED.",
    description:
      "Build charts, clean datasets, and explore data visually with browser-based data tools.",
    icon: Database,
    status: "coming-soon",
    highlights: ["Charts", "CSV", "Visualize", "Analyze"],
  },
  {
    slug: "engineering-tools",
    title: "Engineering Tools",
    tagline: "PROBLEMS, SOLVED.",
    description:
      "Solve complex engineering calculations across mechanical, civil, and electrical domains.",
    icon: Wrench,
    status: "coming-soon",
    highlights: ["Mechanical", "Civil", "Electrical", "Units"],
  },
  {
    slug: "travel-tools",
    title: "Travel Tools",
    tagline: "JOURNEYS, PLANNED.",
    description:
      "Plan trips, convert currencies, calculate distances, and explore destinations effortlessly.",
    icon: Plane,
    status: "coming-soon",
    highlights: ["Currency", "Distance", "Time Zones", "Packing"],
  },
  {
    slug: "crypto-tools",
    title: "Crypto Tools",
    tagline: "BLOCKCHAIN, DECODED.",
    description:
      "Calculate crypto returns, convert tokens, and analyze blockchain data in real time.",
    icon: Bitcoin,
    status: "coming-soon",
    highlights: ["Convert", "Returns", "Gas", "Wallet"],
  },
  {
    slug: "security-tools",
    title: "Security Tools",
    tagline: "PRIVACY, PROTECTED.",
    description:
      "Encrypt files, generate passwords, and test security with a full browser-based privacy toolkit.",
    icon: Shield,
    status: "coming-soon",
    highlights: ["Encrypt", "Passwords", "Hashing", "Privacy"],
  },
  {
    slug: "diagram-tools",
    title: "Diagram Tools",
    tagline: "FLOWS, MAPPED.",
    description:
      "Build flowcharts, wireframes, org charts, and diagrams with intuitive browser-based tools.",
    icon: Network,
    status: "coming-soon",
    highlights: ["Flowchart", "Wireframe", "Org Chart", "Export"],
  },
  {
    slug: "presentation-tools",
    title: "Presentation Tools",
    tagline: "SLIDES, CRAFTED.",
    description:
      "Design, build, and export professional presentations without any software installation.",
    icon: Presentation,
    status: "coming-soon",
    highlights: ["Slides", "Templates", "Export", "Animate"],
  },
  {
    slug: "maps",
    title: "Maps",
    tagline: "PLACES, EXPLORED.",
    description:
      "Explore maps, calculate distances, and work with geographic data directly in your browser.",
    icon: MapPin,
    status: "coming-soon",
    highlights: ["Maps", "Distance", "GIS", "Coordinates"],
  },
];

export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: CategorySlug;
  icon?: LucideIcon;
}


export const popularTools: Tool[] = [
  { slug: "emi-calculator", name: "EMI Calculator", description: "Calculate monthly EMI for any loan.", category: "calculator" },
  { slug: "loan-calculator", name: "Loan Calculator", description: "Estimate total loan cost and interest.", category: "calculator" },
  { slug: "percentage-calculator", name: "Percentage Calculator", description: "Quick percentage of any number.", category: "calculator" },
  { slug: "age-calculator", name: "Age Calculator", description: "Find your exact age in years, months, days.", category: "calculator" },
  { slug: "bmi-calculator", name: "BMI Calculator", description: "Check your Body Mass Index instantly.", category: "calculator" },
  { slug: "mortgage-calculator", name: "Mortgage Calculator", description: "Plan home loan payments with ease.", category: "calculator" },
];
