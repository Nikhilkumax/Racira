import Header from "@/components/Header";
import { notFound } from "next/navigation";
import ComingSoonMap from "@/domains/maps/components/ui/ComingSoonMap";
import { getMapToolBySlug } from "@/domains/maps/registry";
import { Suspense } from "react";
import type { Metadata } from "next";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tool = getMapToolBySlug(params.slug);
  if (!tool) {
    return { title: "Not Found" };
  }
  return {
    title: `${tool.name} — Racira Maps & GIS`,
    description: tool.description,
  };
}

export default function MapToolPage({ params }: { params: { slug: string } }) {
  const tool = getMapToolBySlug(params.slug);
  
  if (!tool) {
    notFound();
  }

  // All current map tools are in 'soon' status, but we wrap in Suspense for future real components
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Maps & GIS" />
      <main className="flex-1">
        <div className="tool-wrapper">
          {tool.isBuilt ? (
            <Suspense fallback={<div>Loading {tool.name}...</div>}>
              {/* Future: Actual MapTool components will render here */}
              <div>Real Tool Loaded</div>
            </Suspense>
          ) : (
            <ComingSoonMap slug={params.slug} />
          )}
        </div>
      </main>
    </div>
  );
}
