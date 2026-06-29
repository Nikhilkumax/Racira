import { CATEGORY_ORDER, TOOLS, TOOLS_BY_CATEGORY } from "@/data/video/tools";
import { ToolCard } from "@/components/video/ToolCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Racira Video — All-in-One Free Online Video Tools",
  description: "Convert, trim, compress, extract and edit videos with 150+ free online video tools. Runs in your browser — no signup, no upload.",
  openGraph: {
    title: "Racira Video — All-in-One Free Online Video Tools",
    description: "150+ free in-browser video tools: convert, trim, compress, extract frames and more. No signup required.",
    url: "/",
  },
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const total = TOOLS.length;
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <section className="py-16 sm:py-24 text-center">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
          All Video Tools You Need —{" "}
          <span className="bg-gradient-to-r from-primary to-[var(--primary-glow)] bg-clip-text text-transparent">
            Fast, Simple &amp; Free
          </span>
        </h1>
        <p className="mt-6 mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground">
          Convert, trim, compress, extract and edit videos. {total}+ free video tools in your browser. No signup required.
        </p>
      </section>

      <div className="space-y-14 pb-16">
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
