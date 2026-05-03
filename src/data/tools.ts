import {
  Calculator,
  FileText,
  Image as ImageIcon,
  Mic,
  type LucideIcon,
} from "lucide-react";

export type CategorySlug =
  | "calculator"
  | "pdf-tools"
  | "image-tools"
  | "ai-tools";

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
    tagline: "Numbers, solved.",
    description:
      "A precise set of financial, health, and everyday calculators built for instant answers.",
    icon: Calculator,
    status: "active",
    highlights: ["Finance", "Health", "Everyday", "Conversions"],
  },
  {
    slug: "pdf-tools",
    title: "PDF Tools",
    tagline: "Documents, simplified.",
    description:
      "Merge, split, compress, and convert PDFs directly in your browser — no uploads required.",
    icon: FileText,
    status: "coming-soon",
    highlights: ["Merge", "Split", "Compress", "Convert"],
  },
  {
    slug: "image-tools",
    title: "Image Tools",
    tagline: "Pixels, polished.",
    description:
      "Resize, compress, crop, and convert images with professional quality and zero friction.",
    icon: ImageIcon,
    status: "coming-soon",
    highlights: ["Resize", "Compress", "Crop", "Format"],
  },
  {
    slug: "ai-tools",
    title: "Voice Tools",
    tagline: "Audio, intelligent.",
    description:
      "Transcription, voice synthesis, and audio utilities powered by modern AI models.",
    icon: Mic,
    status: "coming-soon",
    highlights: ["Transcribe", "Synthesize", "Clean", "Convert"],
  },
];

export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: CategorySlug;
}

export const popularTools: Tool[] = [
  { slug: "emi-calculator", name: "EMI Calculator", description: "Calculate monthly EMI for any loan.", category: "calculator" },
  { slug: "loan-calculator", name: "Loan Calculator", description: "Estimate total loan cost and interest.", category: "calculator" },
  { slug: "percentage-calculator", name: "Percentage Calculator", description: "Quick percentage of any number.", category: "calculator" },
  { slug: "age-calculator", name: "Age Calculator", description: "Find your exact age in years, months, days.", category: "calculator" },
  { slug: "bmi-calculator", name: "BMI Calculator", description: "Check your Body Mass Index instantly.", category: "calculator" },
  { slug: "mortgage-calculator", name: "Mortgage Calculator", description: "Plan home loan payments with ease.", category: "calculator" },
];
