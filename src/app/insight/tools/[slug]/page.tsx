import Link from "next/link";
import Header from "@/components/Header";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { findTool, FUNCTIONAL_SLUGS, CATEGORIES } from "@/lib/insight/tools-data";

import { LineChartBuilder } from "@/components/insight/tools/LineChartBuilder";
import { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const found = findTool(resolvedParams.slug);
  if (!found) return { title: "Tool Not Found — Racira Data & Charts" };
  return {
    title: `${found.tool.name} — Racira Data & Charts`,
    description: found.tool.desc,
  };
}

export function generateStaticParams() {
  return CATEGORIES.flatMap((c) => c.tools.map((t) => ({ slug: t.slug })));
}

export default async function ToolPage({ params }: Props) {
  const resolvedParams = await params;
  const found = findTool(resolvedParams.slug);
  
  if (!found) {
    notFound();
  }

  const { tool, category } = found;
  const isLive = FUNCTIONAL_SLUGS.has(tool.slug);

  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="Insight" />
      <main className="racira-page-container py-10 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All tools
        </Link>
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {category}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{tool.name}</h1>
          <p className="mt-3 text-base text-muted-foreground">{tool.desc}</p>
        </div>

        <div className="mt-10">
          {isLive && tool.slug === "line-chart-builder" ? (
            <LineChartBuilder />
          ) : (
            <ComingSoon name={tool.name} />
          )}
        </div>
      </main>
    </div>
  );
}

function ComingSoon({ name }: { name: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="h-7 w-7" />
      </span>
      <h2 className="text-xl font-semibold">Coming soon</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {name} is on the roadmap. We're polishing it for launch — check back shortly.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Explore other tools
      </Link>
    </div>
  );
}
