import { notFound } from "next/navigation";
import { TOOLS_BY_SLUG, TOOLS } from "@/domains/colors/registry/registry-meta";
import { ToolRouteClient } from "./tool-client";

export function generateStaticParams() {
  return TOOLS.map((tool: any) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const t: any = TOOLS_BY_SLUG[resolvedParams.slug];
  if (!t) return { title: "Not found — Racira Colors" };
  const title = `${t.title} — Racira Colors`;
  return {
    title,
    description: t.description,
    openGraph: {
      title,
      description: t.description,
    },
  };
}

export default async function ToolRoute({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const tool = TOOLS_BY_SLUG[resolvedParams.slug];
  
  if (!tool) {
    notFound();
  }
  
  return <ToolRouteClient slug={resolvedParams.slug} />;
}
