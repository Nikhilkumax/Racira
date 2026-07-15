import Link from "next/link";
import { notFound } from "next/navigation";
import { findTool } from "@/domains/animator/registry";
import { ArrowLeft, Construction, Sparkles } from "lucide-react";
import { Metadata } from "next";
import Header from "@/components/Header";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = findTool(slug);
  if (!found) return { title: "Tool not found" };
  return {
    title: `${found.tool.name} — Racira Animation`,
    description: found.tool.description,
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = findTool(slug);
  
  if (!found) {
    return (
      <div className="racira-page-container py-24 text-center">
        <h1 className="text-2xl font-bold">Tool not found</h1>
        <Link href="/animator" className="mt-4 inline-block text-primary hover:underline">Back to all tools</Link>
      </div>
    );
  }

  const { tool, category } = found;

  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="Animator" />
      <main className="racira-page-container py-12 sm:py-16">
        <Link href="/animator" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All tools
        </Link>
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">{category}</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{tool.name}</h1>
        <p className="mt-2 text-muted-foreground">{tool.description}</p>

        {tool.status === "live" ? (
          <div className="mt-10 rounded-xl border border-border bg-card p-4 sm:p-6 min-h-[400px]">
             {/* Dynamic tool renderer would go here */}
             <div className="flex h-full items-center justify-center text-muted-foreground">
               Tool canvas loaded.
             </div>
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-primary/30 bg-primary/10 p-10 text-center">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Construction className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold">Coming soon</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              We're polishing <span className="font-medium text-foreground">{tool.name}</span>. It will land here shortly — in the meantime explore the other 116 tools.
            </p>
            <Link
              href="/animator"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" /> Browse all tools
            </Link>
          </div>
        )}
      </main>
      <footer className="border-t border-border py-8 mt-16">
        <div className="racira-page-container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Racira Animator — Free browser tools for animation workflows.
        </div>
      </footer>
    </div>
  );
}
