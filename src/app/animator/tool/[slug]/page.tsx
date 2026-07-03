import Link from "next/link";
import { notFound } from "next/navigation";
import { findTool } from "@/lib/animator/tools";
import { ArrowLeft, Construction, Sparkles } from "lucide-react";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = findTool(slug);
  if (!found) return { title: "Tool not found" };
  return {
    title: `${found.tool.name} — Racira Animation`,
    description: found.tool.desc,
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = findTool(slug);
  
  if (!found) {
    return (
      <div className="racira-page-container py-24 text-center">
        <h1 className="text-2xl font-bold">Tool not found</h1>
        <Link href="/" className="mt-4 inline-block text-[#EC4899] hover:underline">Back to all tools</Link>
      </div>
    );
  }

  const { tool, category } = found;

  return (
    <main className="racira-page-container py-12 sm:py-16">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All tools
      </Link>
      <div className="text-xs font-semibold uppercase tracking-widest text-[#EC4899]">{category}</div>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{tool.name}</h1>
      <p className="mt-2 text-muted-foreground">{tool.desc}</p>

      <div className="mt-10 rounded-2xl border border-dashed border-[#EC4899]/40 bg-[#EC4899]/5 p-10 text-center">
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#EC4899]/15 text-[#EC4899]">
          <Construction className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold">Coming soon</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          We're polishing <span className="font-medium text-foreground">{tool.name}</span>. It will land here shortly — in the meantime explore the other 105 tools.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#EC4899] px-4 py-2 text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(236,72,153,0.6)] hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" /> Browse all tools
        </Link>
      </div>
    </main>
  );
}
