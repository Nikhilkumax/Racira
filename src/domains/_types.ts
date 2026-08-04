import { LucideIcon } from "lucide-react";

export type ToolStatus = "live" | "soon";

export interface ToolFaqItem {
  q: string;
  a: string;
}

export interface ToolHowToStep {
  text: string;
}

export interface Tool {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  status: ToolStatus;
  category?: string;
  faq?: ToolFaqItem[];
  howTo?: ToolHowToStep[];
}

export interface SubcategorySection {
  title: string;
  icon?: LucideIcon;
  tools: Tool[];
}

export interface Category {
  name: string;
  title: string;
  key?: string;
  description?: string;
  tools: Tool[];
}
