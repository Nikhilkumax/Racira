import Link from "next/link";
import Header from "@/components/Header";
import { notFound } from "next/navigation";
import { findTool } from "@/domains/design/registry";
import { Footer } from "@/domains/design/components/HeaderFooter";
import { GridSystemBuilder } from "@/domains/design/components/tools/GridSystemBuilder";
import { ArrowLeft, Hammer } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const tool = findTool(resolvedParams.slug);
  if (!tool) return {};
  return {
    title: `${tool.name} — Racira Design`,
    description: tool.desc ?? "",
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const tool = findTool(resolvedParams.slug);
  
  if (!tool) {
    return notFound();
  }

  const Icon = tool.icon;
  return (
    <div className="min-h-screen">
      <Header mode="category" categoryName="Design" />
      <main className="racira-page-container py-10">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> All tools
        </Link>
        <div className="flex items-start gap-4 mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary-soft text-primary shrink-0">
            <Icon className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold">{tool.name}</h1>
            <p className="mt-1 text-muted-foreground">{tool.desc}</p>
          </div>
        </div>

        {tool.built ? (
          <BuiltTool slug={tool.slug} />
        ) : (
          <ComingSoon />
        )}
      </main>
      <Footer />
    </div>
  );
}

function BuiltTool({ slug }: { slug: string }) {
  if (slug === "grid-system-builder") return <GridSystemBuilder />;
  return <ComingSoon />;
}

function ComingSoon() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary-soft text-primary mb-4">
        <Hammer className="h-7 w-7" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Coming soon</h2>
      <p className="text-muted-foreground racira-page-container">
        This tool is in the workshop. We're building it next — check back soon.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
      >
        Browse other tools
      </Link>
    </div>
  );
}
