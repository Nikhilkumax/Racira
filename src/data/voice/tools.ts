import { ToolResult } from "@/components/CategorySearch";

export const CATEGORIES = [];

export const TOTAL_TOOLS = CATEGORIES.reduce((acc: number, cat: any) => acc + cat.tools.length, 0);

export const SEARCH_REGISTRY: ToolResult[] = CATEGORIES.flatMap((c: any) =>
  c.tools.map((t: any) => ({
    name: t.name,
    description: t.description,
    slug: t.slug,
    href: `/voice/${t.slug}`,
    category: c.name,
    isBuilt: t.status === "live",
  }))
);
