import Link from "next/link";
import { TOOLS_BY_SLUG } from "@/domains/3d/registry";
import { SiteShell } from "@/domains/3d/components/SiteShell";
import { ArrowLeft, Sparkles } from "lucide-react";
import { ToolRenderer } from "@/domains/3d/components/tools/ToolRenderer";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = TOOLS_BY_SLUG.get(slug);
  if (!tool) return {};
  return {
    title: `${tool.name} — Racira 3D & Print`,
    description: tool.description,
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = TOOLS_BY_SLUG.get(slug);
  if (!tool) notFound();
  
  

  return (
    <SiteShell>
      <div className="racira-page-container py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All tools
        </Link>
        <div className="mt-4 mb-6">
          <p className="text-xs uppercase tracking-wider text-primary font-medium">{tool.category}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{tool.name}</h1>
          <p className="mt-2 text-muted-foreground">{tool.description}</p>
        </div>

        {tool.built ? (
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <ToolRenderer slug={tool.slug} />
          </div>
        ) : (
          <ComingSoon name={tool.name} />
        )}
      </div>
    </SiteShell>
  );
}

function ComingSoon({ name }: { name: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Sparkles className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">{name} is coming soon</h2>
      <p className="mt-2 text-sm text-muted-foreground racira-page-container">
        We're crafting this tool right now. In the meantime, explore our live tools from the homepage.
      </p>
      <Link href="/" className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
        Browse live tools
      </Link>
    </div>
  );
}
