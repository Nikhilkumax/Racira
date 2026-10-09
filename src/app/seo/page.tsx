"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useMemo, useState } from "react";
import { isLiveTool } from "@/lib/tools/liveToolFilters";
import { hasComingSoonPage } from "@/lib/tools/comingSoonPage";
import {
  Search,
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
import { CATEGORIES, TOOLS, type Tool } from "@/domains/seo/registry";
import { SEO_SITE } from "@/domains/seo/site";
import { onlyLive } from "@/lib/tools/liveToolFilters";

const LIVE_SEO_COUNT = onlyLive(TOOLS, "seo").length;



export default function Home() {
  const [q, setQ] = useState("");

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
      <Header mode="category" categoryName="SEO" />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero-gradient opacity-70" />
              <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            Free SEO Tools —{" "}
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
                placeholder={LIVE_SEO_COUNT > 0 ? `Search ${LIVE_SEO_COUNT} SEO tools...` : "Search SEO tools..."}
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
        © {new Date().getFullYear()} {SEO_SITE.copyrightName}
      </footer>
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
  const Icon = tool.icon as React.ComponentType<{ className?: string }>;
  // Live tools open the wired component; upcoming tools open their Coming Soon
  // page — every card is navigable, and the badge marks what is not built yet.
  const isLive = isLiveTool(tool, "seo");
  const clickable = isLive || hasComingSoonPage(tool, "seo");

  const cardBody = (
    <>
      {!isLive && (
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
        {tool.description}
      </p>
    </>
  );

  if (!clickable) {
    return (
      <div className="tool-card group relative cursor-default">
        {cardBody}
      </div>
    );
  }

  return (
    <Link href={`/seo/${tool.slug}`} className="tool-card group relative">
      {cardBody}
    </Link>
  );
}

