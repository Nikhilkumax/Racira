import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GraduationCap, Construction } from "lucide-react";
import { findTool } from "@/lib/education/tools";
import { Button } from "@/components/ui/button";
import { ToolRenderer } from "@/components/education/tools/ToolRenderer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const found = findTool(slug);
  if (!found) return {};
  return {
    title: `${found.tool.name} — Racira Education`,
    description: found.tool.desc,
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const found = findTool(slug);
  
  if (!found) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Tool not found</h1>
          <Link href="/" className="text-primary mt-4 inline-block">Go home</Link>
        </div>
      </div>
    );
  }

  const { tool, category } = found;
  const Icon = tool.icon;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">
              <span className="text-primary">Racira</span> Education
            </span>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> All tools
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
          {category.name}
        </div>
        <div className="flex items-start gap-4 mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{tool.name}</h1>
            <p className="mt-1 text-muted-foreground">{tool.desc}</p>
          </div>
        </div>

        {tool.built ? (
          <div className="rounded-xl border bg-card p-6">
            <ToolRenderer slug={tool.slug} />
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-12 text-center">
            <div className="h-14 w-14 mx-auto rounded-full bg-primary/10 text-primary grid place-items-center mb-4">
              <Construction className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-semibold">Coming Soon</h2>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              {tool.name} is on the roadmap. We're building all 132 tools — check back soon.
            </p>
            <Button asChild className="mt-6">
              <Link href="/">Browse other tools</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
