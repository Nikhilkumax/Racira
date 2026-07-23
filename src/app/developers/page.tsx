import { CategorySearch } from "@/components/CategorySearch";
import { tools, categories, SEARCH_REGISTRY } from "@/domains/developers/registry";
import { ToolCard } from "@/components/developers/tool-card";
import { ToolSearch } from "@/components/developers/tool-search";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "DevForge — All Developer Tools You Need, Fast & Free",
  description: "Format, encode, convert, test, and generate — every developer tool you need in one fast, free, browser-based platform.",
  openGraph: {
    title: "DevForge — Developer Tools",
    description: "All developer tools you need, in one place.",
    url: "/",
  },
  alternates: {
    canonical: "/",
  },
};

export default function Index() {
  return (
    <>
            <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            294 Free Developer Tools —{" "}
            <span className="hero-gradient-text">JSON, Base64 & Formatters</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Essential utilities for developers including JSON formatters, Base64 encoders, and decoders. No signup required.
          </p>
          <CategorySearch categorySlug="developers" placeholder="Search 294 developer tools..." registry={SEARCH_REGISTRY} />
        </div>
      </section>

      <section className="pb-16">
        <div className="racira-page-container">
          {categories.map((category) => (
            <div key={category} className="mb-10 last:mb-0">
              <h2 className="text-xl font-bold text-foreground mb-4">{category}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-5">
                {tools
                  .filter((t) => (t as any).category === category)
                  .map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
