import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { findTool } from "@/domains/photo/registry";

import { TOOL_COMPONENTS } from "@/domains/photo/components/tools/registry";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = findTool(slug);
  if (!tool) return {};
  
  return {
    title: `${tool.name} — Racira Photography`,
    description: tool.description,
    openGraph: {
      title: `${tool.name} — Racira Photography`,
      description: tool.description,
    },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = findTool(slug);

  if (!tool) {
    notFound();
  }

  const Comp = TOOL_COMPONENTS[tool.slug];

  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="Photo" />
      <div className="racira-page-container py-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> All tools
        </Link>
        <header className="mt-4 border-b pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{tool.category}</p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">{tool.name}</h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">{tool.description}</p>
        </header>

        <div className="mt-10">
          {Comp ? <Comp /> : <ComingSoon name={tool.name} />}
        </div>
      </div>
    </div>
  );
}

function ComingSoon({ name }: { name: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-card p-12 text-center">
      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Clock className="h-6 w-6" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold">Coming soon</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {name} is on the build list. We're shipping new tools every week —
        check back shortly.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        Browse ready tools
      </Link>
    </div>
  );
}
