import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { ArrowLeft, Hammer } from "lucide-react";
import type { Metadata } from "next";

import { findTool } from "@/domains/business/registry";
import { SiteFooter } from "@/domains/business/components/SiteHeader";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = findTool(slug);
  const name = found?.tool.name ?? "Tool";
  return {
    title: `${name} — Coming Soon · Racira Business Tools`,
    description: `${name} is coming soon to Racira Business Tools. ${found?.tool.description ?? ""}`,
    openGraph: {
      title: `${name} — Coming Soon`,
      url: `/tools/${slug}`,
    },
    robots: { index: false },
    alternates: { canonical: `/tools/${slug}` },
  };
}

export default async function ComingSoonPage({ params }: Props) {
  const { slug } = await params;
  const found = findTool(slug);

  // Not a known tool → 404
  if (!found) notFound();

  // Available tools have their own dedicated route; this catch-all is for "soon" only.
  if (found.tool.status === "available") notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <Header mode="category" categoryName="Business" />
      <main className="flex-1 mx-auto max-w-3xl w-full px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to all tools
        </Link>
        <div className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase mb-3">
          {found.category.label}
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
          {found.tool.name}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{found.tool.description}</p>

        <div className="mt-10 rounded-2xl border border-border bg-surface p-8 flex items-start gap-5">
          <div className="h-12 w-12 rounded-xl bg-accent text-primary flex items-center justify-center shrink-0">
            <Hammer className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-lg">Coming Soon</h2>
            <p className="mt-1 text-muted-foreground">
              We&apos;re building this tool. In the meantime, try the{" "}
              <Link href="/tools/swot-analysis-builder" className="text-primary font-medium underline-offset-4 hover:underline">
                SWOT Analysis Builder
              </Link>{" "}
              — it&apos;s ready now.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
