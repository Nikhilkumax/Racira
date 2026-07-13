import Header from "@/components/Header";
import { notFound } from "next/navigation";
import ComingSoonBusiness from "@/domains/business/components/ui/ComingSoonBusiness";
import { findTool } from "@/domains/business/registry";
import { Suspense } from "react";
import { SiteFooter } from "@/domains/business/components/SiteHeader";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const result = findTool(params.slug);
  if (!result) {
    return { title: "Tool Not Found" };
  }
  return {
    title: `${result.tool.name} — Racira Business`,
    description: result.tool.description,
  };
}

export default function BusinessToolPage({ params }: { params: { slug: string } }) {
  const result = findTool(params.slug);
  
  if (!result) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header mode="category" categoryName="Business" />
      <main className="flex-1">
        <Suspense fallback={
          <div className="racira-page-container py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          </div>
        }>
          <ComingSoonBusiness slug={params.slug} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
