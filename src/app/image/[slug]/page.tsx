import Header from "@/components/Header";
import { notFound } from "next/navigation";
import ComingSoonImage from "@/domains/image/components/ui/ComingSoonImage";
import { getImageToolBySlug } from "@/domains/image/registry";
import { Suspense } from "react";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const tool = getImageToolBySlug(params.slug);
  if (!tool) {
    return { title: "Not Found" };
  }
  return {
    title: `${tool.name} — Racira Image`,
    description: tool.description,
  };
}

export default function ImageToolPage({ params }: { params: { slug: string } }) {
  const tool = getImageToolBySlug(params.slug);
  
  if (!tool) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Image" />
      <main className="flex-1">
        <div className="tool-wrapper">
          {tool.status === "soon" ? (
            <ComingSoonImage slug={params.slug} />
          ) : (
            <Suspense fallback={<div>Loading {tool.name}...</div>}>
              {/* Future: Actual ImageTool components will render here */}
              <div>Real Tool Loaded</div>
            </Suspense>
          )}
        </div>
      </main>
    </div>
  );
}
