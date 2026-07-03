import { Metadata } from "next";
import Header from "@/components/Header";
import { notFound } from "next/navigation";
import Link from "next/link";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { getToolBySlug } from "@/data/presentation/tools";
import { ArrowLeft, Sparkles } from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const tool = getToolBySlug(resolvedParams.slug);

  if (!tool) {
    return {
      title: "Tool — Racira Presentation Tools",
    };
  }

  return {
    title: `${tool.name} — Racira Presentation Tools`,
    description: tool.description,
    openGraph: {
      title: `${tool.name} — Racira Presentation Tools`,
      description: tool.description,
    },
  };
}

export default async function ToolPage({ params }: Props) {
  const resolvedParams = await params;
  const tool = getToolBySlug(resolvedParams.slug);

  if (!tool) {
    notFound();
  }

  const Icon =
    ((Icons as unknown as Record<string, LucideIcon>)[tool.icon] as LucideIcon) ||
    Icons.Sparkles;

  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="Presentation" />
      <main className="racira-page-container py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All tools
        </Link>

        <div className="mt-10 rounded-2xl border border-border bg-card p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Icon className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-card-foreground sm:text-4xl">
            {tool.name}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground">
            {tool.description}
          </p>

          <div className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Coming Soon
          </div>

          <p className="mx-auto mt-6 max-w-md text-sm text-muted-foreground">
            We're cooking this one up. Check back soon — in the meantime,
            explore the rest of the toolbox.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Browse all tools
          </Link>
        </div>
      </main>
    </div>
  );
}
