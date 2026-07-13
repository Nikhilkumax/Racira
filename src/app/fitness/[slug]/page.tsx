import Header from "@/components/Header";
import { notFound } from "next/navigation";
import ComingSoonFitness from "@/domains/fitness/components/ui/ComingSoonFitness";
import { findTool, FUNCTIONAL_SLUGS } from "@/domains/fitness/registry";
import { Suspense } from "react";
import { WorkoutPlanner } from "@/domains/fitness/components/WorkoutPlanner";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = findTool(slug);
  if (!tool) {
    return { title: "Tool Not Found" };
  }
  return {
    title: `${tool.name} — Racira Fitness`,
    description: tool.desc,
  };
}

export default async function FitnessToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = findTool(slug);
  
  if (!tool) {
    notFound();
  }

  const isActive = FUNCTIONAL_SLUGS.has(tool.slug);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header mode="category" categoryName="Fitness" />
      <main className="flex-1">
        <Suspense fallback={
          <div className="racira-page-container py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          </div>
        }>
          {isActive ? (
            <WorkoutPlanner />
          ) : (
            <ComingSoonFitness slug={slug} />
          )}
        </Suspense>
      </main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Racira Fitness — Free Fitness Tools
      </footer>
    </div>
  );
}
