import Link from "next/link";
import Header from "@/components/Header";
import { ArrowRight } from "lucide-react";
import ImageClientGrid from "@/domains/image/components/ClientGrid";
import { categories } from "@/domains/image/registry";
import { SearchImage } from "./SearchImage";

export const metadata = {
  title: "Racira Image — 34+ Free Image Tools in Your Browser",
  description: "Convert, resize, compress, and edit images entirely in your browser. No signup required.",
  openGraph: {
    title: "Racira Image — 34+ Free Image Tools",
    description: "Convert, resize, compress, and edit images entirely in your browser.",
  },
};

function slugify(s: string) {
  return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function ImagePage() {

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="Image" />

      <main className="flex-1">
        <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
              Free Image Tools —{" "}
              <span className="hero-gradient-text">Convert & Edit Fast</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              Essential utilities to convert formats, resize, crop, and compress your images instantly. No signup required.
            </p>
            <SearchImage />
          </div>
        </section>

        {/* Category nav */}
        <nav aria-label="Categories" className="mb-12 flex flex-wrap gap-2 justify-center">
          {categories.map((c) => (
            <a
              key={c.name}
              href={`#${slugify(c.name)}`}
              className="px-3 py-1.5 rounded-full border border-border bg-card text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
            >
              {c.name}
            </a>
          ))}
        </nav>

        {/* Tool grid per category */}
        <ImageClientGrid />
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Racira Image — free, in-browser image tools. Runs entirely in your browser.
      </footer>
    </div>
  );
}
