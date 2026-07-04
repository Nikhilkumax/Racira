import {
  MapPin, Globe, Mountain, Satellite, Map, Layers, Compass, Navigation,
  Ruler, Square, Hexagon, Calculator, Search, Pin, Crosshair,
  FileCode, FileText, Download, Upload, Repeat,
  Activity, BarChart3, Filter, Target, Zap, Grid3x3, Waypoints,
  Locate, Boxes, GitBranch, Wind, Droplets, Cloud,
  Building2, TreePine, Camera, Share2, Code2, Box, Workflow,
  Edit3, Palette, Tag, Type, Eye, CheckCircle2, Merge, Link2, Clock,
  Flame, Triangle, Layers3, Grid2x2, Telescope, History,
  Wifi, Radio, FileImage, FileType, Hash, Globe2,
  Moon, Car, Bike, Ship, Image as ImageIcon, Move, PenTool,
  Sparkles, Minimize2, GitCompare, Database, Shuffle, ArrowDownUp, Dna,
  Gauge, Plane, Magnet, Sunrise, MapPinned, Trees, Waves, Lightbulb,
  Film, HardDrive, CloudDownload, ScanLine, Wand2, Network,
  AlertTriangle, Thermometer,
} from "lucide-react";
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
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="text-lg">
              <span className="text-primary">Racira</span> Maps & GIS
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#tools" className="hover:text-foreground">Tools</a>
            <a href="#about" className="hover:text-foreground">About</a>
          </nav>
        </div>
      </header>

      <section className="racira-page-container pt-20 pb-16 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {totalTools}+ Maps & GIS tools — all free
        </div>
        <h1 className="text-balance text-5xl font-bold tracking-tight md:text-6xl">
          All Maps & GIS Tools You Need —{" "}
          <span className="text-primary">Fast, Simple & Free</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
          Convert coordinates, measure distances, view geodata, build maps and run spatial analysis.
          Every tool runs right in your browser. No signup required.
        </p>
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
