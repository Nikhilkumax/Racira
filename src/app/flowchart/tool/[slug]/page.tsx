"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findTool, ACTIVE_SLUG } from "@/domains/flowchart/registry";
import { FlowchartBuilder } from "@/domains/flowchart/components/FlowchartBuilder";
import { Tool } from "@/domains/_types";

interface ToolPageProps {
  params: { slug: string };
}

export default function ToolPage({ params }: ToolPageProps) {
  const result = findTool(params.slug);
  if (!result) notFound();
  const { tool, category } = result;
  const isLive = tool.slug === ACTIVE_SLUG;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Diagrams" />

      <main className="racira-page-container flex-1 pb-16">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">{category}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">{tool.name}</h1>
          <p className="mt-2 text-muted-foreground">{tool.description}</p>
        </div>

        {isLive ? <FlowchartBuilder /> : <ComingSoon tool={tool} />}
      </main>
    </div>
  );
}

function ComingSoon({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-semibold">{tool.name} is coming soon</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        We&apos;re crafting this tool. In the meantime, try the live Basic Flowchart Builder.
      </p>
      <Link
        href={`/flowchart/tool/${ACTIVE_SLUG}`}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        Open Basic Flowchart Builder
      </Link>
    </div>
  );
}
