import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";
import { SiteFooter } from "@/domains/music/components/site-chrome";
import { ToolCard } from "@/domains/music/components/tool-card";
import { getToolIcon } from "@/domains/music/components/tool-icon";
import { findTool, findCategoryOfTool, type Tool } from "@/domains/music/registry";
import { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = findTool(slug);
  
  if (!tool) {
    return {};
  }

  return {
    title: `${tool.name} — Racira Music`,
    description: tool.description,
    openGraph: {
      title: `${tool.name} — Racira Music`,
      description: tool.description,
    },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = findTool(slug);

  if (!tool) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header mode="category" categoryName="Music" />
        <main className="mx-auto max-w-3xl flex-1 px-6 py-24 text-center">
          <h1 className="font-display text-3xl font-bold">Tool not found</h1>
          <p className="mt-2 text-muted-foreground">That tool isn't in our library.</p>
          <Link href="/" className="mt-6 inline-block text-primary underline">
            Back to all tools
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const category = findCategoryOfTool(slug)!;
  const Icon = getToolIcon(tool);
  const related = category.tools.filter((t: Tool) => (t as any).slug !== tool.slug).slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col">
      <Header mode="category" categoryName="Music" />
      <main className="flex-1">
        <div className="racira-page-container pt-10 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> All tools
          </Link>
        </div>

        <section className="racira-page-container py-10 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-12">
            <div className="flex items-start gap-5">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Icon className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  {category.name}
                </p>
                <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {tool.name}
                </h1>
                <p className="mt-2 text-muted-foreground">{tool.description}</p>
              </div>
            </div>

            <div className="mt-10 rounded-xl border border-dashed border-primary/30 bg-primary-soft/40 p-8 text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">Coming soon</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                We're tuning this one up. It'll be live in your browser shortly — no signup, no
                paywall, just music.
              </p>
              <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                In development
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="racira-page-container pb-24 sm:px-6">
            <h2 className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              More in {category.name}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((t: Tool) => (
                <ToolCard key={(t as any).slug} tool={t} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
