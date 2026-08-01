import { ToolResult } from "@/components/CategorySearch";

export interface VoiceTool {
  slug: string;
  name: string;
  description: string;
  icon: any;
  status: "live" | "soon";
}

export interface VoiceCategory {
  name: string;
  description: string;
  tools: VoiceTool[];
}

export const CATEGORIES: VoiceCategory[] = [];

export const TOTAL_TOOLS = CATEGORIES.reduce((acc, cat) => acc + cat.tools.length, 0);

export const SEARCH_REGISTRY: ToolResult[] = CATEGORIES.flatMap((c) =>
  c.tools.map((t) => ({
    name: t.name,
    description: t.description,
    slug: t.slug,
    href: `/voice/${t.slug}`,
    category: c.name,
    isBuilt: t.status === "live",
  }))
);
