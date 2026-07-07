import Link from "next/link";
import { categories, totalCount } from "@/domains/cad/registry";
import {
  Search, Pencil, Ruler, Cog, Building2, CircuitBoard, Home, Wind,
  Crosshair, Scissors, FileText, ArrowRight, Sparkles,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "2d-drafting": Pencil,
  "measurement-and-geometry": Ruler,
  "mechanical-engineering-cad": Cog,
  "structural-and-civil-cad": Building2,
  "electrical-and-pcb-schematic": CircuitBoard,
  "architecture-and-planning": Home,
  "piping-and-hvac": Wind,
  "gd-and-t-and-standards": Crosshair,
  "cnc-and-fabrication": Scissors,
  "cad-utilities": FileText,
};

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <section className="racira-page-container pb-24 space-y-16">
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.key] ?? Pencil;
            return (
              <div key={c.key} id={c.key}>
                <div className="mb-5 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    {c.title}
                  </h2>
                  <span className="text-xs text-muted-foreground/70">· {c.tools.length} tools</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {c.tools.map((t) => (
                    <Link
                      key={t.slug}
                      href={`/tools/${t.slug}`}
                      className="tool-card group hover:-translate-y-[3px] hover:border-primary/40 hover:shadow-[0_8px_24px_hsl(var(--ring)/0.1)]"
                    >
                      {!t.active && (
                        <span className="absolute right-3 top-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Soon
                        </span>
                      )}
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-foreground leading-snug">
                        {t.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {t.desc}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="text-primary">Racira</span>
          <span className="text-foreground">CAD</span>
        </Link>
        <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
          <a href="#2d-drafting" className="hover:text-foreground">Drafting</a>
          <a href="#mechanical-engineering-cad" className="hover:text-foreground">Mechanical</a>
          <a href="#electrical-and-pcb-schematic" className="hover:text-foreground">Electrical</a>
          <a href="#architecture-and-planning" className="hover:text-foreground">Architecture</a>
          <a href="#cnc-and-fabrication" className="hover:text-foreground">CNC</a>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
          <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            3+ Free CAD Tools —{" "}
            <span className="hero-gradient-text">Viewers, DXF & Measure</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Essential utilities for viewing, measuring, and converting CAD and DXF files. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 3+ CAD tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search CAD Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} Racira CAD. Built for engineers and designers.</p>
        <p>{totalCount}+ tools · No signup · Runs in your browser</p>
      </div>
    </footer>
  );
}
