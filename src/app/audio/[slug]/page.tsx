import Header from "@/components/Header";
import { notFound } from "next/navigation";
import ComingSoonAudio from "@/domains/audio/components/ui/ComingSoonAudio";
import { getAudioToolBySlug } from "@/domains/audio/registry";
import { Suspense } from "react";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const tool = getAudioToolBySlug(params.slug);
  if (!tool) {
    return { title: "Tool Not Found" };
  }
  return {
    title: `${tool.name} — Racira Audio`,
    description: tool.description,
  };
}

export default function AudioToolPage({ params }: { params: { slug: string } }) {
  const tool = getAudioToolBySlug(params.slug);
  
  if (!tool) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header mode="category" categoryName="Audio" />
      <main className="flex-1">
        <Suspense fallback={
          <div className="racira-page-container py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          </div>
        }>
          <ComingSoonAudio slug={params.slug} />
        </Suspense>
      </main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Racira Audio — Free Audio Tools
      </footer>
    </div>
  );
}
