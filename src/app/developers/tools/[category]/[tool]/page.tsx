import { findTool, tools } from "@/data/developers/tools";
import { ToolPageClient } from "@/components/developers/tools/tool-page-client";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ category: string; tool: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params;
  const result = findTool(resolvedParams.category, resolvedParams.tool);
  
  if (!result) {
    return {
      title: "Tool not found — DevForge",
    };
  }

  return {
    title: `${result.tool.name} — DevForge`,
    description: result.tool.description,
    openGraph: {
      title: `${result.tool.name} — DevForge`,
      description: result.tool.description,
      url: `/tools/${resolvedParams.category}/${resolvedParams.tool}`,
      type: "article",
    },
    alternates: {
      canonical: `/tools/${resolvedParams.category}/${resolvedParams.tool}`,
    },
  };
}

export default async function ToolPage({ 
  params 
}: { 
  params: Promise<{ category: string; tool: string }> 
}) {
  const resolvedParams = await params;
  const result = findTool(resolvedParams.category, resolvedParams.tool);
  
  if (!result) {
    notFound();
  }

  const related = tools
    .filter((t) => (t as any).category === result.categoryName && (t as any).slug !== resolvedParams.tool)
    .slice(0, 4);

  const safeTool = { ...result.tool, icon: null } as unknown as typeof result.tool;
  const safeRelated = related.map(t => ({ ...t, icon: null })) as unknown as typeof related;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: result.categoryName, item: `/` },
              {
                "@type": "ListItem",
                position: 2,
                name: result.tool.name,
                item: `/tools/${resolvedParams.category}/${resolvedParams.tool}`,
              },
            ],
          }),
        }}
      />
      <ToolPageClient
        tool={safeTool}
        categoryName={result.categoryName}
        relatedTools={safeRelated}
      />
    </>
  );
}
