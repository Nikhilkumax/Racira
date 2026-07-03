import Link from "next/link";
import Header from "@/components/Header";
import { notFound } from "next/navigation";
import { ArrowLeft, Hammer } from "lucide-react";
import { findTool, findCategory, FUNCTIONAL_SLUGS } from "@/lib/fitness/tools-data";

import { WorkoutPlanner } from "@/components/fitness/WorkoutPlanner";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = findTool(slug);
  if (!tool) return { title: "Tool not found" };

  return {
    title: `${tool.name} — Racira Fitness`,
    description: tool.desc,
    openGraph: {
      title: `${tool.name} — Racira Fitness`,
      description: tool.desc,
    },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = findTool(slug);
  if (!tool) return notFound();

  const category = findCategory(slug)?.name ?? "";
  const isActive = FUNCTIONAL_SLUGS.has(tool.slug);

  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="Fitness" />
      <main className="racira-page-container py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> All tools
        </Link>

        <div className="mb-8">
          {category && (
            <div className="text-xs font-bold tracking-widest text-brand uppercase mb-2">
              {category}
            </div>
          )}
          <h1 className="text-4xl font-bold tracking-tight">{tool.name}</h1>
          <p className="mt-2 text-muted-foreground">{tool.desc}</p>
        </div>

        {isActive ? (
          <WorkoutPlanner />
        ) : (
          <ComingSoon name={tool.name} />
        )}
      </main>
    </div>
  );
}

function ComingSoon({ name }: { name: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-12 text-center">
      <div className="mx-auto h-16 w-16 rounded-2xl bg-brand-soft text-brand inline-flex items-center justify-center">
        <Hammer className="h-8 w-8" />
      </div>
      <h2 className="mt-6 text-2xl font-bold">Coming soon</h2>
      <p className="mt-2 text-muted-foreground max-w-md mx-auto">
        {name} is on the way. In the meantime, try the Workout Planner — it's fully functional and free.
      </p>
      <Link
        href="/tools/workout-planner"
        className="mt-6 inline-flex items-center gap-2 h-10 px-4 rounded-md bg-brand text-primary-foreground text-sm font-medium hover:opacity-90"
      >
        Open Workout Planner
      </Link>
    </div>
  );
}
