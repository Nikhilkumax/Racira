import Link from "next/link";
import Header from "@/components/Header";
import { notFound } from "next/navigation";
import { findCategoryOfTool, findTool } from "@/domains/travel/registry";
import { SiteFooter } from "@/domains/travel/components/site-chrome";
import { ArrowLeft, Construction } from "lucide-react";
import { TripItineraryBuilder } from "@/domains/travel/components/tools/trip-itinerary-builder";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const tool = findTool(resolvedParams.slug);
  if (!tool) {
    return {
      title: "Tool not found — Racira Travel",
    };
  }
  return {
    title: `${tool.name} — Racira Travel`,
    description: tool.desc,
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const tool = findTool(resolvedParams.slug);
  if (!tool) {
    notFound();
  }
  const category = findCategoryOfTool(resolvedParams.slug);
  const isLive = (tool as any).status === "live";

  return (
    <div className="min-h-screen">
      <Header mode="category" categoryName="Travel" />
      <main className="racira-page-container py-12">
        <Link href="/travel" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All tools
        </Link>
        <div className="mt-6">
          {category && (
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              {category.name}
            </p>
          )}
          <h1 className="mt-2 font-display text-4xl font-extrabold">{tool.name}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{tool.desc}</p>
        </div>

        <div className="mt-10">
          {isLive ? <TripItineraryBuilder /> : <ComingSoon name={tool.name} />}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ComingSoon({ name }: { name: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-10 text-center">
      <div
        className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-primary/10"
      >
        <Construction className="h-7 w-7 text-primary" />
      </div>
      <h2 className="mt-5 font-display text-2xl font-bold">Coming Soon</h2>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">
        {name} is on the way. We're polishing it up — check back soon.
      </p>
      <Link
        href="/travel"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        Browse other tools
      </Link>
    </div>
  );
}
