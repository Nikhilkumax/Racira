"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import { ArrowLeft, Download, FileDown, Plus, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";

import { SiteFooter } from "@/domains/business/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Quadrant = "strengths" | "weaknesses" | "opportunities" | "threats";
type SwotState = Record<Quadrant, string[]>;

const EMPTY: SwotState = {
  strengths: [],
  weaknesses: [],
  opportunities: [],
  threats: [],
};

const QUADRANTS: { key: Quadrant; title: string; hint: string; tokenVar: string }[] = [
  { key: "strengths", title: "Strengths", hint: "What you do well, internal advantages…", tokenVar: "var(--strength)" },
  { key: "weaknesses", title: "Weaknesses", hint: "Internal gaps, things to improve…", tokenVar: "var(--weakness)" },
  { key: "opportunities", title: "Opportunities", hint: "External trends to leverage…", tokenVar: "var(--opportunity)" },
  { key: "threats", title: "Threats", hint: "External risks and competition…", tokenVar: "var(--threat)" },
];

const STORAGE_KEY = "racira:swot:v1";

export default function SwotBuilder() {
  const [project, setProject] = useState("My SWOT Analysis");
  const [data, setData] = useState<SwotState>(EMPTY);
  const [drafts, setDrafts] = useState<Record<Quadrant, string>>({
    strengths: "",
    weaknesses: "",
    opportunities: "",
    threats: "",
  });
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.project) setProject(parsed.project);
        if (parsed.data) setData({ ...EMPTY, ...parsed.data });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ project, data }));
    } catch {}
  }, [project, data]);

  const add = (q: Quadrant) => {
    const v = drafts[q].trim();
    if (!v) return;
    setData((d) => ({ ...d, [q]: [...d[q], v] }));
    setDrafts((dr) => ({ ...dr, [q]: "" }));
  };

  const remove = (q: Quadrant, i: number) =>
    setData((d) => ({ ...d, [q]: d[q].filter((_, idx) => idx !== i) }));

  const reset = () => {
    if (!confirm("Clear the entire SWOT board?")) return;
    setData(EMPTY);
  };

  const exportPng = async () => {
    if (!boardRef.current) return;
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(boardRef.current, {
      pixelRatio: 2,
      backgroundColor: getComputedStyle(document.body).backgroundColor,
    });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${project || "swot"}.png`;
    a.click();
  };

  const exportMd = () => {
    const md =
      `# ${project}\n\n` +
      QUADRANTS.map(
        (q) =>
          `## ${q.title}\n` +
          (data[q.key].length ? data[q.key].map((i) => `- ${i}`).join("\n") : "_(empty)_") +
          "\n"
      ).join("\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project || "swot"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header mode="category" categoryName="Business" />
      <main className="racira-page-container flex-1 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to all tools
        </Link>

        <div className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase mb-2">
          Strategy &amp; Planning
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
          SWOT Analysis Builder
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
          Map your strengths, weaknesses, opportunities, and threats on a clean 2×2
          board. Auto-saves to your browser. Export to PNG or Markdown.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Input
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="Project name"
            className="max-w-sm"
          />
          <div className="flex-1" />
          <Button variant="outline" onClick={exportMd}>
            <FileDown className="h-4 w-4 mr-2" /> Markdown
          </Button>
          <Button variant="outline" onClick={exportPng}>
            <Download className="h-4 w-4 mr-2" /> PNG
          </Button>
          <Button variant="ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4 mr-2" /> Reset
          </Button>
        </div>

        <div
          ref={boardRef}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl bg-background p-2"
        >
          {QUADRANTS.map((q) => (
            <section
              key={q.key}
              className="rounded-xl border border-border bg-surface p-5 min-h-[260px] flex flex-col"
              style={{ borderTop: `4px solid ${q.tokenVar}` }}
            >
              <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: q.tokenVar }}
                />
                {q.title}
              </h2>
              <ul className="mt-4 space-y-2 flex-1">
                {data[q.key].length === 0 && (
                  <li className="text-sm text-muted-foreground italic">{q.hint}</li>
                )}
                {data[q.key].map((item, i) => (
                  <li
                    key={i}
                    className="group flex items-start justify-between gap-3 rounded-md bg-muted/60 px-3 py-2 text-sm text-foreground"
                  >
                    <span className="leading-relaxed">{item}</span>
                    <button
                      onClick={() => remove(q.key, i)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-2">
                <Input
                  value={drafts[q.key]}
                  onChange={(e) => setDrafts((d) => ({ ...d, [q.key]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      add(q.key);
                    }
                  }}
                  placeholder={`Add a ${q.title.slice(0, -1).toLowerCase()}…`}
                />
                <Button size="icon" onClick={() => add(q.key)} aria-label="Add">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </section>
          ))}
        </div>

        <article className="prose prose-slate dark:prose-invert mt-16 max-w-3xl">
          <h2 className="font-display text-2xl font-bold">How to use this SWOT builder</h2>
          <p className="text-muted-foreground">
            A SWOT analysis is a foundational strategic-planning exercise for any
            business, team, or product. Use it to surface where you have an edge,
            where you&apos;re exposed, what to chase, and what to defend.
          </p>
          <ol className="text-muted-foreground space-y-1 list-decimal pl-5">
            <li>Name the project or initiative you&apos;re analyzing.</li>
            <li>Brainstorm 3–7 items per quadrant — quality over quantity.</li>
            <li>Export to PNG to drop into a deck, or Markdown for your docs.</li>
          </ol>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
