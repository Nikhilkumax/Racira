"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Moon,
  Sun,
  ChevronDown,
  Key,
  FileSearch,
  Link2,
  Code2,
  Image as ImageIcon,
  Gauge,
  MapPin,
  PenTool,
  ShieldCheck,
  Globe,
  BarChart3,
  Smartphone,
  FileText,
  Search as SearchIcon,
  Wrench,
} from "lucide-react";
import { CATEGORIES, TOOLS, TOTAL_TOOLS, type Tool } from "@/domains/seo/registry";

// Map each category to an icon
const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  "Keyword Tools": Key,
  "On-Page SEO Analysis": FileSearch,
  "Technical SEO": Wrench,
  "Backlink & Off-Page SEO": Link2,
  "Schema & Structured Data": Code2,
  "Image SEO": ImageIcon,
  "Performance & Core Web Vitals": Gauge,
  "Local SEO": MapPin,
  "Content & Writing SEO": PenTool,
  "Security & SEO": ShieldCheck,
  "International SEO": Globe,
  "Analytics & Reporting": BarChart3,
  "Mobile & Page Experience": Smartphone,
  "SEO Content Templates": FileText,
  "SERP & Search": SearchIcon,
};

function iconFor(category: string) {
  return CATEGORY_ICON[category] ?? Wrench;
}

export default function Home() {
  const [q, setQ] = useState("");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return null;
    return TOOLS.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term)
    );
  }, [q]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-baseline gap-1 text-xl font-bold tracking-tight">
            <span className="text-primary">Racira</span>
            <span className="text-foreground">SEO</span>
          </Link>
          <div className="flex items-center gap-4">
            <ToolsDropdown />
            <button
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle theme"
              className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero-gradient opacity-70" />
              <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            6+ Free SEO Tools —{" "}
            <span className="hero-gradient-text">Meta, Tags & Analysis</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Optimize your web presence with meta tag generators, keyword analyzers, and SEO utilities. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 6+ SEO tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search SEO Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>
      </section>

      {/* Categories / Results */}
      <main id="tools" className="racira-page-container pb-24">
        {filtered ? (
          <div>
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="text-lg font-bold">
                {filtered.length} result{filtered.length === 1 ? "" : "s"}
              </h2>
              <button
                onClick={() => setQ("")}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
            <ToolGrid tools={filtered} />
          </div>
        ) : (
          <div id="categories" className="space-y-14">
            {CATEGORIES.map((cat) => {
              const tools = TOOLS.filter((t) => t.category === cat.name);
              return (
                <section key={cat.slug} id={cat.slug} className="scroll-mt-24">
                  <h2 className="mb-5 text-xl font-bold tracking-tight">
                    {cat.name}
                  </h2>
                  <ToolGrid tools={tools} />
                </section>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Racira SEO · {TOTAL_TOOLS} tools in one
        workspace.
      </footer>
    </div>
  );
}

function ToolsDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
      >
        Tools <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-64 rounded-xl border border-border bg-popover p-2 shadow-lg">
          <div className="max-h-[60vh] overflow-y-auto">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`#${cat.slug}`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
              >
                <span>{cat.name}</span>
                <span className="text-xs text-muted-foreground">
                  {cat.tools.length}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ToolGrid({ tools }: { tools: Tool[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tools.map((t) => (
        <ToolCard key={t.slug} tool={t} />
      ))}
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = iconFor(tool.category);
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="tool-card group"
    >
      {!tool.active && (
        <span className="absolute right-3 top-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Soon
        </span>
      )}
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-foreground leading-snug">
        {tool.name}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
        {shortDescription(tool)}
      </p>
    </Link>
  );
}

function shortDescription(t: Tool): string {
  const n = t.name;
  if (/Checker$/i.test(n)) return `Check ${n.replace(/ Checker$/i, "").toLowerCase()} quickly.`;
  if (/Analyzer$/i.test(n)) return `Analyze ${n.replace(/ Analyzer$/i, "").toLowerCase()} for SEO.`;
  if (/Generator$/i.test(n)) return `Generate ${n.replace(/ Generator$/i, "").toLowerCase()} instantly.`;
  if (/Validator$/i.test(n)) return `Validate ${n.replace(/ Validator$/i, "").toLowerCase()}.`;
  if (/Extractor$/i.test(n)) return `Extract ${n.replace(/ Extractor$/i, "").toLowerCase()}.`;
  if (/Counter$/i.test(n)) return `Count ${n.replace(/ Counter$/i, "").toLowerCase()}.`;
  if (/Template$/i.test(n)) return `Ready-to-use ${n.toLowerCase()}.`;
  return `${t.category} tool.`;
}
