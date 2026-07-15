import { findTool, tools } from "@/data/developers/tools";
import { ToolPageClient } from "@/components/developers/tools/tool-page-client";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Construction, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
      url: `/developers/tools/${resolvedParams.category}/${resolvedParams.tool}`,
      type: "article",
    },
    alternates: {
      canonical: `/developers/tools/${resolvedParams.category}/${resolvedParams.tool}`,
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
              { "@type": "ListItem", position: 1, name: result.categoryName, item: `/developers` },
              {
                "@type": "ListItem",
                position: 2,
                name: result.tool.name,
                item: `/developers/tools/${resolvedParams.category}/${resolvedParams.tool}`,
              },
            ],
          }),
        }}
      />
      {result.tool.status === "live" ? (
        <ToolPageClient
          tool={safeTool}
          categoryName={result.categoryName}
          relatedTools={safeRelated}
        />
      ) : (
        <ComingSoon name={result.tool.name} description={result.tool.description} categorySlug={resolvedParams.category} />
      )}
    </>
  );
}

function ComingSoon({ name, description, categorySlug }: { name: string; description: string, categorySlug: string }) {
  return (
    <div className="racira-page-container flex flex-col items-center py-24 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Construction className="h-6 w-6" />
      </div>
      <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
        {name}
      </h1>
      <p className="mt-4 max-w-md text-balance text-muted-foreground">
        {description}
      </p>
      <span className="mt-6 inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
        Coming soon
      </span>
      <p className="mt-8 max-w-md text-sm text-muted-foreground">
        We're polishing this one. In the meantime, try our{" "}
        <Link
          href={`/developers`}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Developer Tools
        </Link>
        .
      </p>
    </div>
  );
}
