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
  LineChart,
  CheckSquare,
  Gamepad2,
  Box,
  Compass,
  type LucideIcon,
} from "lucide-react";

export type CategorySlug =
  | "calculator"
  | "pdf"
  | "image"
  | "design"
  | "colors"
  | "typography"
  | "photo"
  | "video"
  | "animator"
  | "voice"
  | "audio"
  | "writing"
  | "seo"
  | "developers"
  | "finance"
  | "productivity"
  | "games"
  | "3d"
  | "cad";

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
    slug: "pdf",
    title: "PDF Tools",
    tagline: "DOCUMENTS, SIMPLIFIED.",
    description:
      "Merge, split, compress, and convert PDFs directly in your browser — no uploads required.",
    icon: FileText,
    status: "active",
    highlights: ["Merge", "Split", "Compress", "Convert"],
  },
  {
    slug: "image",
    title: "Image Tools",
    tagline: "PIXELS, POLISHED.",
    description:
      "Resize, compress, crop, and convert images with professional quality and zero friction.",
    icon: ImageIcon,
    status: "active",
    highlights: ["Resize", "Compress", "Crop", "Format"],
  },
  {
    slug: "design",
    title: "Design Tools",
    tagline: "IDEAS, VISUALIZED.",
    description:
      "Create graphics, layouts, and visual assets entirely in your browser with no installs.",
    icon: PenTool,
    status: "active",
    highlights: ["Graphics", "Layouts", "Export", "Templates"],
  },
  {
    slug: "colors",
    title: "Color Tools",
    tagline: "COLOR, PERFECTED.",
    description:
      "Pick, convert, generate palettes, and explore color theory — all in one place.",
    icon: Palette,
    status: "active",
    highlights: ["Picker", "Palette", "Convert", "Contrast"],
  },
  {
    slug: "typography",
    title: "Typography Tools",
    tagline: "TYPE, CRAFTED.",
    description:
      "Explore fonts, pair typefaces, and fine-tune typographic scales for any project.",
    icon: Type,
    status: "active",
    highlights: ["Fonts", "Pairing", "Scale", "Preview"],
  },
  {
    slug: "photo",
    title: "Photo Editor",
    tagline: "PHOTOS, ENHANCED.",
    description:
      "Edit, filter, crop, and retouch photos with professional-grade tools, right in your browser.",
    icon: Aperture,
    status: "active",
    highlights: ["Edit", "Filter", "Retouch", "Export"],
  },
  {
    slug: "video",
    title: "Video Tools",
    tagline: "VIDEO, SIMPLIFIED.",
    description:
      "Trim, convert, compress, and edit video files without any software downloads.",
    icon: Video,
    status: "active",
    highlights: ["Trim", "Convert", "Compress", "Subtitles"],
  },
  {
    slug: "animator",
    title: "Animation Tools",
    tagline: "MOTION, CREATED.",
    description:
      "Build animations, transitions, and motion graphics directly in the browser.",
    icon: Clapperboard,
    status: "active",
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
    highlights: ["28 Voices", "US & UK English", "Unlimited", "Private"],
  },
  {
    slug: "audio",
    title: "Audio Tools",
    tagline: "SOUND, ENGINEERED.",
    description:
      "Record, edit, mix, and convert audio files with a full suite of browser-based tools.",
    icon: AudioWaveform,
    status: "active",
    highlights: ["Record", "Edit", "Mix", "Convert"],
  },
  {
    slug: "writing",
    title: "Writing Tools",
    tagline: "WORDS, SHARPENED.",
    description:
      "Write, edit, summarize, and improve content with AI-assisted writing tools.",
    icon: Pen,
    status: "active",
    highlights: ["AI Write", "Grammar", "Summarize", "Rewrite"],
  },
  {
    slug: "seo",
    title: "SEO Tools",
    tagline: "RANKINGS, OPTIMIZED.",
    description:
      "Analyze, audit, and improve your site's search visibility with a full browser-based SEO toolkit.",
    icon: Search,
    status: "active",
    highlights: ["Audit", "Keywords", "Meta", "Backlinks"],
  },
  {
    slug: "developers",
    title: "Developer Tools",
    tagline: "CODE, STREAMLINED.",
    description:
      "Format, validate, convert, and debug code with a comprehensive set of developer utilities.",
    icon: Code,
    status: "active",
    highlights: ["Format", "Validate", "Convert", "Debug"],
  },
  {
    slug: "finance",
    title: "Finance Tools",
    tagline: "MONEY, CALCULATED.",
    description:
      "Plan budgets, model investments, and calculate financial outcomes with precision tools.",
    icon: LineChart,
    status: "active",
    highlights: ["Budget", "Investment", "Tax", "Planning"],
  },
  {
    slug: "productivity",
    title: "Productivity Tools",
    tagline: "WORK, ACCELERATED.",
    description:
      "Streamline tasks, manage time, and boost output with a full productivity toolkit.",
    icon: CheckSquare,
    status: "active",
    highlights: ["Tasks", "Time", "Focus", "Automation"],
  },
  {
    slug: "games",
    title: "Games",
    tagline: "FUN, INSTANT.",
    description:
      "Play hundreds of browser-based games instantly — no downloads, no accounts required.",
    icon: Gamepad2,
    status: "active",
    highlights: ["Puzzle", "Arcade", "Strategy", "Word"],
  },
  {
    slug: "3d",
    title: "3D Tools",
    tagline: "DIMENSIONS, EXPLORED.",
    description:
      "Model, preview, and calculate 3D print parameters with browser-based 3D utilities.",
    icon: Box,
    status: "active",
    highlights: ["Model", "Print", "Slicer", "Calculate"],
  },
  {
    slug: "cad",
    title: "CAD Tools",
    tagline: "DESIGNS, ENGINEERED.",
    description:
      "Draft, plan, and visualize technical designs with browser-based CAD utilities.",
    icon: Compass,
    status: "active",
    highlights: ["Draft", "Blueprint", "Measure", "Export"],
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
