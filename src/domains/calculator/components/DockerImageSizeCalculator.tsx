"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface DockerSizeResult {
  baseSizeMb: number;
  layerCount: number;
  layerSizeMb: number;
  dedupPct: number;
  totalLayerMb: number;
  savingsMb: number;
  finalSizeMb: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmtMb(mb: number): string {
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
}

function calcDockerSize(base: number, layers: number, layerSize: number, dedup: number): DockerSizeResult {
  const totalLayerMb = layers * layerSize;
  const savingsMb = totalLayerMb * (dedup / 100);
  const finalSizeMb = base + totalLayerMb - savingsMb;

  const breakdown = [
    { label: "Base Image", value: fmtMb(base) },
    { label: "Number of Layers", value: `${layers}` },
    { label: "Avg Layer Size", value: fmtMb(layerSize) },
    { label: "Raw Layer Additions", value: fmtMb(totalLayerMb) },
    { label: "Deduplication Savings", value: `−${fmtMb(savingsMb)} (${dedup}%)` },
    { label: "Estimated Final Size", value: fmtMb(finalSizeMb) },
    { label: "Blob Storage Footprint", value: fmtMb(base + totalLayerMb) },
  ];
  const summaryStats = [
    { label: "Final Size", value: fmtMb(finalSizeMb) },
    { label: "Base Image", value: fmtMb(base) },
    { label: "Layer Additions", value: fmtMb(totalLayerMb) },
    { label: "Dedup Savings", value: fmtMb(savingsMb) },
    { label: "Layers", value: `${layers}` },
    { label: "Avg Layer", value: fmtMb(layerSize) },
    { label: "Blob Total", value: fmtMb(base + totalLayerMb) },
    { label: "Savings", value: `${dedup}%` },
  ];
  const chartData = [
    { name: "Base", value: Math.round(base), fill: "hsl(var(--primary))" },
    { name: "Layers", value: Math.round(totalLayerMb), fill: "#8b5cf6" },
    { name: "Dedup −", value: Math.round(savingsMb), fill: "#10b981" },
    { name: "Final", value: Math.round(finalSizeMb), fill: "#f59e0b" },
  ];
  return { baseSizeMb: base, layerCount: layers, layerSizeMb: layerSize, dedupPct: dedup, totalLayerMb, savingsMb, finalSizeMb, breakdown, summaryStats, chartData };
}

const DEFAULTS = { base: "180", layers: "8", layerSize: "25", dedup: "30" };

export default function DockerImageSizeCalculator() {
  const [base, setBase] = useState(DEFAULTS.base);
  const [layers, setLayers] = useState(DEFAULTS.layers);
  const [layerSize, setLayerSize] = useState(DEFAULTS.layerSize);
  const [dedup, setDedup] = useState(DEFAULTS.dedup);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<DockerSizeResult | null>(null);

  const b = parseFloat(base) || 0;
  const l = parseInt(layers) || 0;
  const ls = parseFloat(layerSize) || 0;
  const d = parseFloat(dedup) || 0;
  const errs: string[] = [];
  if (b <= 0) errs.push("Base image size must be greater than 0.");
  if (l < 1 || l > 100) errs.push("Layer count must be 1–100.");
  if (ls < 0) errs.push("Layer size cannot be negative.");
  if (d < 0 || d > 100) errs.push("Dedup savings must be 0–100%.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcDockerSize(b, l, ls, d)); };
  const reset = () => {
    setBase(DEFAULTS.base); setLayers(DEFAULTS.layers); setLayerSize(DEFAULTS.layerSize); setDedup(DEFAULTS.dedup);
    setResult(calcDockerSize(180, 8, 25, 30));
  };
  useEffect(() => { setResult(calcDockerSize(180, 8, 25, 30)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What makes a Docker image large?", answer: "Every RUN, COPY, and ADD instruction creates a new layer. Base images vary hugely — alpine variants are ~5–50 MB, node:20 is ~180 MB, and full OS images exceed 1 GB. Each layer adds the files it changes; deleted files still linger in earlier layers." },
    { question: "How does Docker layer deduplication work?", answer: "Docker shares layers between images built from the same base — you only store a layer once, even if five images use it. Inside a single image, later layers can delete or overwrite files, but the old data remains in earlier layers, so cleanup must happen in the same RUN instruction." },
    { question: "How do I reduce image size?", answer: "Use slim/alpine base images. Combine RUN commands into one layer with &&. Clean package caches in the same RUN that installs them (apt-get clean, npm prune --production). Use multi-stage builds to copy only artifacts into the final image. Squash layers when sharing images." },
    { question: "What is a good image size?", answer: "For small services, under 100 MB is achievable with alpine or distroless bases. Full node/python images run 150–500 MB. If your image exceeds 1 GB, examine it with docker history and docker-slim — huge images slow pulls, increase attack surface, and waste registry and node storage." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Docker Image Size Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Docker Image Size Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Base Image Size</label>
                <div className={inp}><input type="number" value={base} onChange={e => setBase(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">MB</span></div>
              </div>
              <div>
                <label className={lbl}>Number of Layers</label>
                <div className={inp}><input type="number" value={layers} onChange={e => setLayers(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div>
              <label className={lbl}>Average Layer Size</label>
              <div className={inp}><input type="number" value={layerSize} onChange={e => setLayerSize(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">MB</span></div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdv(o => !o)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 self-start"
            >
              Advanced Options
              <span className={`transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Layer Efficiency</div>
                  <div>
                    <label className={lbl}>Deduplication Savings</label>
                    <div className={inp}><input type="number" value={dedup} onChange={e => setDedup(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                  </div>
                </div>
              </div>
            )}
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Final Image Size</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmtMb(result.finalSizeMb)}</div>
                <div className="text-sm text-muted-foreground mt-1">{fmtMb(result.baseSizeMb)} base + {result.layerCount} layers · {result.dedupPct}% dedup savings</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Base Image", fmtMb(result.baseSizeMb)], ["Raw Layers", fmtMb(result.totalLayerMb)], ["Blob Footprint", fmtMb(result.baseSizeMb + result.totalLayerMb)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Size Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 ${i === 5 ? "text-amber-700 font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 5 ? "text-amber-700" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Composition</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}MB`} />
                    <Tooltip formatter={(v: number) => [`${v} MB`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Estimating Image Size</h2>
            <p>Final image size ≈ base image + sum of layer additions − deduplication savings. This <strong>Docker image size calculator</strong> applies that model so you can predict registry storage, pull times, and node disk usage before you build.</p>
            <h2 className="text-2xl font-bold mb-3">Layer Mechanics</h2>
            <p>Each Dockerfile instruction creates a layer. Layers are content-addressed and shared: if two images use the same base and layers, those blobs are stored once. Inside an image, later layers may mask earlier files, but the space is only reclaimed when no image references the earlier layer.</p>
            <h2 className="text-2xl font-bold mb-3">Optimization Checklist</h2>
            <p>Start from alpine or distroless. Chain RUN commands with &&. Purge caches in the same layer. Prefer COPY over ADD. Use .dockerignore. Multi-stage builds discard build tools. Order layers by change frequency so caching works. Verify with docker history --no-trunc and docker-slim.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/docker-image-size-calculator" />
          <PopularCalculators exclude="/calculator/docker-image-size-calculator" />
        </div>
      </div>
    </>
  );
}
