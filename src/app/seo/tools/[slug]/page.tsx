import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { TOOL_BY_SLUG, TOOLS } from "@/domains/seo/registry";
import { KeywordDensityChecker } from "@/domains/seo/components/tools/KeywordDensityChecker";
import { ComingSoon } from "@/domains/seo/components/tools/ComingSoon";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = TOOL_BY_SLUG.get(slug);
  const name = tool?.name ?? "SEO Tool";
  return {
    title: `${name} — Racira SEO`,
    description: `${name} — part of the Racira SEO suite of 230 SEO tools.`,
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = TOOL_BY_SLUG.get(slug);
  
  if (!tool) {
    notFound();
  }

  const related = TOOLS.filter(
    (t) => (t as any).category === tool.category && (t as any).slug !== tool.slug
  ).slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="text-base font-semibold tracking-tight">Racira SEO</div>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All tools
          </Link>
        </div>
      </header>

      <main className="racira-page-container py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {tool.category}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
            {tool.name}
          </h1>
        </div>

        {tool.active ? <KeywordDensityChecker /> : <ComingSoon name={tool.name} />}

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
              More in {tool.category}
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/tools/${r.slug}`}
                  className="rounded-xl border border-border/60 bg-card p-3 text-sm transition hover:border-primary/40"
                >
                  {r.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
