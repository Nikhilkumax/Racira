import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Construction } from "lucide-react";
import { findTool } from "@/data/typography/tools";
import { SiteHeader, SiteFooter } from "@/components/typography/site-header";
import { FontPreviewer } from "@/components/typography/font-previewer";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = findTool(slug);
  if (!found) return {};
  
  return {
    title: `${found.tool.name} — Racira Typography`,
    description: found.tool.desc,
    openGraph: {
      title: `${found.tool.name} — Racira Typography`,
      description: found.tool.desc,
    },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = findTool(slug);
  
  if (!found) {
    notFound();
  }
  
  const { tool, category } = found;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All tools
        </Link>
        <div className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {category}
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground">
              {tool.name}
            </h1>
            <p className="mt-2 text-muted-foreground">{tool.desc}</p>
          </div>
          {tool.built ? (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Live
            </span>
          ) : (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Coming soon
            </span>
          )}
        </div>

        {tool.built ? <FontPreviewer /> : <ComingSoon name={tool.name} />}
      </main>
      <SiteFooter />
    </div>
  );
}

function ComingSoon({ name }: { name: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-primary">
        <Construction className="h-6 w-6" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold">{name} is coming soon</h2>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">
        We're polishing this tool. In the meantime, try our Font Previewer to play with type live.
      </p>
      <Link
        href="/tools/font-previewer"
        className="mt-6 inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Open Font Previewer
      </Link>
    </div>
  );
}
