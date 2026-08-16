"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface BlindResult {
  blindWidth: number;
  blindHeight: number;
  mountType: string;
  overlapWidth: number;
  overlapHeight: number;
  fabricArea: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcBlind(windowW: number, windowH: number, mount: "inside" | "outside", clearance: number): BlindResult {
  const w = Math.max(0, windowW);
  const h = Math.max(0, windowH);
  const clr = Math.max(0, clearance);

  let blindWidth: number;
  let blindHeight: number;
  let overlapWidth: number;
  let overlapHeight: number;

  if (mount === "inside") {
    blindWidth = Math.max(0, w - 0.5); // 1/4" clearance each side
    blindHeight = Math.max(0, h - clr); // user-set clearance at top (default 0.25)
    overlapWidth = 0;
    overlapHeight = 0;
  } else {
    blindWidth = w + 4; // 2" overlap each side
    blindHeight = h + 3; // ~2" above, 1" below
    overlapWidth = 4;
    overlapHeight = 3;
  }

  const fabricArea = (blindWidth * blindHeight) / 144; // sq ft

  return {
    blindWidth,
    blindHeight,
    mountType: mount === "inside" ? "Inside Mount" : "Outside Mount",
    overlapWidth,
    overlapHeight,
    fabricArea,
    chartData: [
      { name: "Window", value: w },
      { name: "Blind", value: blindWidth },
    ],
    breakdown: [
      { label: "Window Width", value: `${w.toFixed(1)} in` },
      { label: "Window Height", value: `${h.toFixed(1)} in` },
      { label: "Mount Type", value: mount === "inside" ? "Inside mount" : "Outside mount" },
      { label: "Blind Width", value: `${blindWidth.toFixed(1)} in` },
      { label: "Blind Height", value: `${blindHeight.toFixed(1)} in` },
      { label: "Width Overlap Total", value: mount === "inside" ? `−0.5 in (clearance)` : `+4.0 in (2 in per side)` },
      { label: "Height Adjustment", value: mount === "inside" ? `−${clr.toFixed(1)} in (clearance)` : `+3.0 in (overlap)` },
      { label: "Fabric Area", value: `${fabricArea.toFixed(2)} sq ft` },
    ],
    summaryStats: [
      { label: "Blind Width", value: `${blindWidth.toFixed(1)} in` },
      { label: "Blind Height", value: `${blindHeight.toFixed(1)} in` },
      { label: "Fabric Area", value: `${fabricArea.toFixed(2)} sq ft` },
      { label: "Width Overlap", value: `${overlapWidth.toFixed(1)} in` },
      { label: "Height Overlap", value: `${overlapHeight.toFixed(1)} in` },
      { label: "Size vs Window", value: `${((blindWidth / (w || 1)) * 100).toFixed(0)}% width` },
    ],
  };
}

const DEFAULTS = { width: "36", height: "48", mount: "inside" as "inside" | "outside", clearance: "0.25" };

export default function BlindSizeCalculator() {
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [mount, setMount] = useState<"inside" | "outside">(DEFAULTS.mount);
  const [clearance, setClearance] = useState(DEFAULTS.clearance);
  const [result, setResult] = useState<BlindResult>(() => calcBlind(36, 48, "inside", 0.25));

  const calculate = () => setResult(calcBlind(parseFloat(width) || 0, parseFloat(height) || 0, mount, parseFloat(clearance) || 0));
  const reset = () => { setWidth(DEFAULTS.width); setHeight(DEFAULTS.height); setMount(DEFAULTS.mount); setClearance(DEFAULTS.clearance); setResult(calcBlind(36, 48, "inside", 0.25)); };
  useEffect(() => { setResult(calcBlind(36, 48, "inside", 0.25)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is the difference between inside and outside mount?", answer: "An inside mount fits blinds within the window frame, so the blind must be slightly smaller than the opening (about 1/4\" clearance per side). An outside mount covers the window from the wall around it, so the blind is larger than the window (typically 2\" extra per side and 3\" extra in height) to block light fully." },
    { question: "How much should I subtract for an inside mount?", answer: "Standard practice is to subtract 1/4\" from each side (1/2\" total width) and 1/4\" from the height so the blind slides freely. If your window frame is uneven, measure at three points and use the narrowest width." },
    { question: "How much should I add for an outside mount?", answer: "Most manufacturers recommend adding 2\" to each side of the width (4\" total) and 3\" to the height — roughly 2\" above the window and 1\" below — to maximize light blocking and privacy." },
    { question: "Do I order the exact measurements?", answer: "Yes — order blinds at the exact calculated size. Manufacturers build to your stated width and height. Never round inside-mount measurements up, or the blind will not fit; round to the nearest 1/8\" instead." },
    { question: "Why does it show fabric area?", answer: "Fabric area is the width × height in square feet. It is useful for estimating material cost or when comparing blind pricing, which is often quoted per square foot for custom fabrics." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Blind Size Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Blind Size Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Window Width</label>
                <div className={inp}><input type="number" value={width} onChange={e => setWidth(e.target.value)} className={ci} min={0} /><span className="pr-3 text-muted-foreground text-sm">in</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Window Height</label>
                <div className={inp}><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={ci} min={0} /><span className="pr-3 text-muted-foreground text-sm">in</span></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Mount Type</label>
              <div className="grid grid-cols-2 gap-2 rounded-md border border-input p-1 bg-background">
                <button onClick={() => setMount("inside")} className={`h-9 rounded-md text-sm font-semibold transition-colors ${mount === "inside" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Inside Mount</button>
                <button onClick={() => setMount("outside")} className={`h-9 rounded-md text-sm font-semibold transition-colors ${mount === "outside" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Outside Mount</button>
              </div>
            </div>
            {mount === "inside" && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Height Clearance</label>
                <div className={inp}><input type="number" value={clearance} onChange={e => setClearance(e.target.value)} className={ci} min={0} step={0.05} /><span className="pr-3 text-muted-foreground text-sm">in</span></div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Blind Size</div>
              <div className="text-4xl font-extrabold text-primary">{result.blindWidth.toFixed(1)}" × {result.blindHeight.toFixed(1)}"</div>
              <div className="text-sm text-muted-foreground mt-1">{result.mountType} · Window: {parseFloat(width) || 0}" × {parseFloat(height) || 0}"</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Width", `${result.blindWidth.toFixed(1)} in`], ["Height", `${result.blindHeight.toFixed(1)} in`], ["Fabric", `${result.fabricArea.toFixed(2)} sq ft`]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Sizing Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 text-right font-semibold">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Window vs Blind Width</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}"`} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)} in`, "Width"]} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={70} />
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
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How to Size Window Blinds</h2>
            <p>A <strong>blind size calculator</strong> takes the guesswork out of ordering. The two mounting styles use opposite logic: inside mounts subtract a small clearance so the blind fits inside the frame and slides freely, while outside mounts add overlap so the blind fully covers the opening and blocks light from the edges.</p>
            <h2 className="text-2xl font-bold mb-3">Inside Mount Sizing</h2>
            <p>Measure the width at the top, middle, and bottom of the frame, then use the narrowest width. Subtract 1/4" from each side (1/2" total) and about 1/4" from the height for clearance. If your window has trim or handles that protrude, factor those into the clearance as well.</p>
            <h2 className="text-2xl font-bold mb-3">Outside Mount Sizing</h2>
            <p>Add 2" to each side of the window width (4" total) and 3" to the height — about 2" above the frame and 1" below it. This guarantees the blind overlaps the opening on every edge, which maximizes light control and privacy. Outside mounts are also a good choice when the frame is too shallow for an inside mount.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/blind-size-calculator" />
          <PopularCalculators exclude="/calculator/blind-size-calculator" />
        </div>
      </div>
    </>
  );
}
