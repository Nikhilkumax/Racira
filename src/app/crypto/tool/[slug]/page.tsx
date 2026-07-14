import Link from "next/link";
import Header from "@/components/Header";
import { notFound } from "next/navigation";
import { ArrowLeft, Construction } from "lucide-react";

import { getTool, TOOLS } from "@/domains/crypto/registry";
import { ToolRenderer } from "@/domains/crypto/components/tools/ToolRenderer";
import type { Metadata } from "next";

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: (t as any).slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) {
    return { title: "Tool not found" };
  }
  return {
    title: `${tool.name} — Racira Crypto`,
    description: tool.desc,
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="Crypto" />
      <main className="racira-page-container py-10">
        <Link href="/crypto" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All tools
        </Link>
        <div className="mt-4 mb-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">{tool.category}</div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">{tool.name}</h1>
          <p className="mt-2 text-muted-foreground">{tool.desc}</p>
        </div>

        {tool.implemented ? (
          <ToolRenderer slug={tool.slug} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
              <Construction className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-bold">Coming Soon</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              This tool is on the roadmap. We're rolling out tools one by one — check back soon.
            </p>
            <Link
              href="/crypto"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Browse other tools
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
