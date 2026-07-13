import { LucideIcon } from "lucide-react";

export type ToolStatus = "live" | "soon";

export interface Tool {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  status: ToolStatus;
}

export interface SubcategorySection {
  title: string;
  icon?: LucideIcon;
  tools: Tool[];
}

export interface Category {
  name: string;
  description?: string;
  tools: Tool[];
}
