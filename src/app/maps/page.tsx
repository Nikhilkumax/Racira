import Header from "@/components/Header";
import { Search } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Racira Maps & GIS — 165+ Free Online Map & Geospatial Tools",
  description: "165+ free Maps & GIS tools. Convert coordinates, measure distances, view geodata, build maps, run spatial analysis — all in your browser.",
  openGraph: {
    title: "Racira Maps & GIS",
    description: "Free online Maps & GIS toolkit — 165+ tools for coordinates, geocoding, routing, geodata viewers and more.",
  },
};



import { sections, totalTools, type Tool } from "@/domains/maps/registry";

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header mode="category" categoryName="Maps & GIS" />

            <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            160+ Free Map Tools —{" "}
            <span className="hero-gradient-text">Routes, Distance & Geo</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Explore geographical tools for route planning, distance measuring, and map coordinates. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 160+ map tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Map Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>

      <main id="tools" className="racira-page-container pb-24">
        {sections.map((section) => (
          <section key={section.title} className="mb-14">
            <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {section.title}{" "}
              <span className="ml-1 text-muted-foreground/60">({section.tools.length})</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {section.tools.map((tool) => (
                <ToolCard key={tool.name} tool={tool} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer id="about" className="border-t border-border bg-card/40">
        <div className="racira-page-container py-10 text-sm text-muted-foreground">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="font-semibold text-foreground">Racira Maps & GIS</div>
              <p className="mt-1">Free browser-based Maps & GIS toolkit. No signup, no tracking.</p>
            </div>
            <div className="text-xs">© {new Date().getFullYear()} Racira. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <div className="tool-card group hover:-translate-y-[3px] hover:border-primary/40 hover:shadow-[0_8px_24px_hsl(var(--ring)/0.1)]">
      <span className="absolute right-3 top-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Soon
      </span>
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-foreground leading-snug">{tool.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.desc}</p>
    </div>
  );
}
