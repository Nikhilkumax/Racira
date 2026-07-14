import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TOOL_BY_SLUG, TOOLS } from "@/data/video/tools";
import { ComingSoon } from "@/components/video/ComingSoon";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = TOOL_BY_SLUG[slug];
  if (!tool) return {};

  const isLive = tool.status === "live";
  const title = isLive
    ? `${tool.name} — Convert Videos to MP4 Online Free | Racira Video`
    : `${tool.name} — Coming Soon | Racira Video`;
  const description = isLive
    ? `${tool.description}. Free online ${tool.name.toLowerCase()} — no signup, no upload. Runs entirely in your browser.`
    : `${tool.description}. ${tool.name} is coming soon to Racira Video.`;
  const url = `/video/tools/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generateStaticParams() {
  return TOOLS.map((tool) => ({
    slug: tool.slug,
  }));
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = TOOL_BY_SLUG[slug];
  if (!tool) notFound();

  return (
    <div className="racira-page-container pt-12">
      <Link href="/video" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All tools
      </Link>
      <ComingSoon tool={tool} />
    </div>
  );
}
