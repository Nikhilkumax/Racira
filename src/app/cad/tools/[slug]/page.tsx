import Header from "@/components/Header";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findTool, findCategoryForTool, categories } from "@/domains/cad/registry";
import { Construction, Sparkles } from "lucide-react";
import { Metadata } from "next";
import { SketchToolClient } from "@/domains/cad/components/tools/sketch-tool-client";

export async function generateStaticParams() {
  const slugs: { slug: string }[] = [];
  categories.forEach((c) => {
    c.tools.forEach((t) => {
      slugs.push({ slug: (t as any).slug });
    });
  });
  return slugs;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const t = findTool(resolvedParams.slug);
  const title = t ? `${(t as any).name} — Racira CAD` : "Tool — Racira CAD";
  return {
    title,
    description: t?.desc ?? "Free CAD tool by Racira CAD.",
    openGraph: {
      title,
      description: t?.desc ?? "Free CAD tool by Racira CAD.",
    },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const tool = findTool(resolvedParams.slug);
  if (!tool) {
    notFound();
  }

  const category = findCategoryForTool(resolvedParams.slug);

  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="CAD" />

      <main className="racira-page-container py-8">
        <div className="mb-6">
          {category && (
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
              {category.title}
            </p>
          )}
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {tool.name}
            {tool.active && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3 w-3" /> Live
              </span>
            )}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{tool.desc}</p>
        </div>

        {tool.active ? <SketchToolClient /> : <ComingSoon name={tool.name} />}
      </main>
    </div>
  );
}

function ComingSoon({ name }: { name: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Construction className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-foreground">Coming soon</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        The <span className="font-medium text-foreground">{name}</span> is currently under
        construction. We're rolling out all 118+ tools — check back shortly.
      </p>
      <Link
        href="/cad/tools/2d-cad-sketch-tool"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Try the 2D CAD Sketch Tool
      </Link>
    </div>
  );
}
