import Link from "next/link";
import { notFound } from "next/navigation";
import { Construction, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { findTool } from "@/domains/writing/registry";
import { Metadata } from "next";
import { DistractionFreeEditor } from "@/domains/writing/components/tools/DistractionFreeEditor";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const found = findTool(slug);
  if (!found) return { title: "Tool not found" };

  return {
    title: `${found.tool.name} — Racira Writing`,
    description: found.tool.description,
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const found = findTool(slug);

  if (!found) {
    notFound();
  }

  const { tool, category } = found;

  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="Writing" />

      <div className="racira-page-container pt-8">
        <Link href="/writing" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All tools
        </Link>
      </div>

      {tool.status === "live" && tool.slug === "distraction-free-writing-editor" ? (
        <DistractionFreeEditor />
      ) : (
        <ComingSoon name={tool.name} description={tool.description} />
      )}
    </div>
  );
}

function ComingSoon({ name, description }: { name: string; description: string }) {
  return (
    <div className="racira-page-container flex flex-col items-center py-24 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Construction className="h-6 w-6" />
      </div>
      <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
        {name}
      </h1>
      <p className="mt-4 max-w-md text-balance text-muted-foreground">
        {description}
      </p>
      <span className="mt-6 inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
        Coming soon
      </span>
      <p className="mt-8 max-w-md text-sm text-muted-foreground">
        We're polishing this one. In the meantime, try our{" "}
        <Link
          href="/writing/tools/distraction-free-writing-editor"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Distraction-Free Writing Editor
        </Link>
        .
      </p>
    </div>
  );
}
