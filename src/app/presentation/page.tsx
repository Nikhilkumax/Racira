import { Metadata } from "next";
import { Header } from "@/components/presentation/Header";
import { CategorySection } from "@/components/presentation/CategorySection";
import { categories, totalToolCount } from "@/data/presentation/tools";

export const metadata: Metadata = {
  title: "Racira Presentation Tools — Free Browser Tools for Slides",
  description: "Build, design, and share decks with free presentation tools right in your browser. No signup required.",
  openGraph: {
    title: "Racira Presentation Tools",
    description: "Free browser-based tools to build, design, and share presentations.",
  },
};

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="px-6 pb-12 pt-20 sm:pt-28">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl">
              All Presentation Tools You Need —{" "}
              <span className="bg-gradient-to-r from-primary to-rose-400 bg-clip-text text-transparent">
                Fast, Simple &amp; Free
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Build, design, and share decks with {totalToolCount}+ free
              presentation tools in your browser. No signup required.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 pb-24">
          {categories.map((c) => (
            <CategorySection key={c.slug} category={c} />
          ))}
        </div>
      </main>
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Racira Presentation Tools
        </div>
      </footer>
    </div>
  );
}
