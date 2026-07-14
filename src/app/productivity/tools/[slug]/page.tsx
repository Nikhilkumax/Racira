import Link from "next/link";
import { notFound } from "next/navigation";
import { Construction, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { CATEGORIES } from "@/data/productivity/tools";
import { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getTool(slug: string) {
  for (const cat of CATEGORIES) {
    const t = cat.tools.find((tool: any) => tool.slug === slug);
    if (t) return t;
  }
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool: any = getTool(slug);
  
  if (!tool) {
    return { title: "Tool Not Found — Racira" };
  }
  return {
    title: `${tool.name} — Free Productivity Tool`,
    description: tool.description,
    alternates: {
      canonical: `/productivity/tools/${tool.slug}`,
    },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool: any = getTool(slug);

  if (!tool) {
    notFound();
  }

  // deep-work-session-planner has its own folder route, so this [slug] route handles
  // all the other unbuilt tools with a Coming Soon placeholder.
  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="Productivity" />

      <div className="racira-page-container pt-8">
        <Link href="/productivity" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All tools
        </Link>
      </div>

      <ComingSoon name={tool.name} description={tool.description} />
    </div>
  );
}

function ComingSoon({ name, description }: { name: string; description: string }) {
  return (
    <div className="racira-page-container py-16 sm:py-24 max-w-2xl mx-auto text-center">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-muted/50 text-muted-foreground mb-6">
        <Construction className="h-8 w-8" />
      </div>
      
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
        {name}
      </h1>
      
      <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
        {description}
      </p>
      
      <p className="mt-8 max-w-md text-sm text-muted-foreground mx-auto">
        We're polishing this one. In the meantime, try our{" "}
        <Link
          href="/productivity/tools/deep-work-session-planner"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Deep Work Session Planner
        </Link>
        .
      </p>
    </div>
  );
}
