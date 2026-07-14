import { CategorySearch } from "@/components/CategorySearch";
import { CATEGORY_ORDER, TOOLS, TOOLS_BY_CATEGORY, SEARCH_REGISTRY } from "@/data/video/tools";
import { ToolCard } from "@/components/video/ToolCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Racira Video — All-in-One Free Online Video Tools",
  description: "Convert, trim, compress, extract and edit videos with 150 free online video tools. Runs in your browser — no signup, no upload.",
  openGraph: {
    title: "Racira Video — All-in-One Free Online Video Tools",
    description: "150 free in-browser video tools: convert, trim, compress, extract frames and more. No signup required.",
    url: "/",
  },
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const total = TOOLS.length;
  return (
    <div>
            <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            150 Free Video Tools —{" "}
            <span className="hero-gradient-text">Trim, Crop & Convert</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Basic video utilities to trim, crop, and convert formats without heavy software. No signup required.
          </p>
          <CategorySearch categorySlug="video" placeholder="Search 150 video tools..." registry={SEARCH_REGISTRY} />
        </div>
      </section>

      <div className="racira-page-container space-y-14 pb-16">
        {CATEGORY_ORDER.map((cat) => (
          <section key={cat}>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground mb-4">
              {cat}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {TOOLS_BY_CATEGORY[cat].map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
