"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Waves } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CssResult {
  d1: number;
  t1Sec: number;
  d2: number;
  t2Sec: number;
  css: number;
  pace100: string;
  pace400: string;
  pace1500: string;
  trainingZone: string;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function secToPace(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function calcCss(d1Text: string, t1Text: string, d2Text: string, t2Text: string): CssResult | null {
  const d1 = parseFloat(d1Text), t1 = parseFloat(t1Text);
  const d2 = parseFloat(d2Text), t2 = parseFloat(t2Text);
  if ([d1, t1, d2, t2].some((n) => isNaN(n)) || d1 <= 0 || d2 <= 0 || d1 === d2 || t2 <= t1) return null;

  const css = (d2 - d1) / (t2 - t1);
  const pace100 = 100 / css;
  const pace400 = 400 / css;
  const pace1500 = 1500 / css;

  const chartData = [
    { name: "Shorter Test", value: d1 / t1 },
    { name: "Longer Test", value: d2 / t2 },
    { name: "CSS", value: css },
  ];

  const breakdown = [
    { label: "Shorter Distance", value: `${d1} m in ${secToPace(t1)}` },
    { label: "Longer Distance", value: `${d2} m in ${secToPace(t2)}` },
    { label: "CSS (m/s)", value: `${css.toFixed(3)} m/s` },
    { label: "100 m Pace", value: secToPace(pace100) + " /100m" },
    { label: "400 m Pace", value: secToPace(pace400) + " /400m" },
    { label: "1500 m Pace", value: secToPace(pace1500) + " /1500m" },
    { label: "Test Protocol", value: "400 m + 200 m (or 800 + 400)" },
    { label: "Training Zone", value: "CS + 5–8 s per 100 m (endurance)" },
  ];

  const summaryStats = [
    { label: "CSS", value: `${css.toFixed(3)} m/s` },
    { label: "100 m Pace", value: secToPace(pace100) },
    { label: "400 m Pace", value: secToPace(pace400) },
    { label: "1500 m Pace", value: secToPace(pace1500) },
    { label: "Short Speed", value: `${(d1 / t1).toFixed(3)} m/s` },
    { label: "Long Speed", value: `${(d2 / t2).toFixed(3)} m/s` },
  ];

  return { d1, t1Sec: t1, d2, t2Sec: t2, css, pace100: secToPace(pace100), pace400: secToPace(pace400), pace1500: secToPace(pace1500), trainingZone: "CS + 5–8 s/100m", chartData, breakdown, summaryStats };
}

const DEFAULTS = { d1: "400", t1: "390", d2: "200", t2: "180" };

export default function CssSwimmingCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<CssResult | null>(() => calcCss("400", "390", "200", "180"));

  useEffect(() => {
    setResult(calcCss(inputs.d1, inputs.t1, inputs.d2, inputs.t2));
  }, []);

  const set = (k: keyof typeof DEFAULTS) => (val: string) => setInputs((p) => ({ ...p, [k]: val }));
  const reset = () => { setInputs(DEFAULTS); setResult(calcCss(DEFAULTS.d1, DEFAULTS.t1, DEFAULTS.d2, DEFAULTS.t2)); };

  const faqs = [
    { question: "What is Critical Swim Speed (CSS)?", answer: "CSS is the theoretical pace you can hold almost indefinitely. It is derived from two maximal test swims using the formula CSS = (D₂ − D₁) ÷ (T₂ − T₁), commonly from a 400 m and 200 m time trial." },
    { question: "How do I use CSS in training?", answer: "Base endurance sets swim at CSS + 5–8 seconds per 100 m; threshold sets near CSS; speed work is faster. Re-test every 4–6 weeks because CSS improves as fitness rises." },
    { question: "What is the best test protocol?", answer: "Swim a maximal 400 m, rest fully (5–10 minutes), then a maximal 200 m. The longer test must be slower in pace than the shorter one — otherwise the formula breaks down." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "CSS Swimming Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">CSS Swimming Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="csd1" className="block text-sm font-medium mb-1 text-foreground">Longer Distance (m)</label>
                <input id="csd1" type="number" min="50" value={inputs.d1} onChange={(e) => set("d1")(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="cst1" className="block text-sm font-medium mb-1 text-foreground">Time (seconds)</label>
                <input id="cst1" type="number" min="30" value={inputs.t1} onChange={(e) => set("t1")(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="csd2" className="block text-sm font-medium mb-1 text-foreground">Shorter Distance (m)</label>
                <input id="csd2" type="number" min="25" value={inputs.d2} onChange={(e) => set("d2")(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="cst2" className="block text-sm font-medium mb-1 text-foreground">Time (seconds)</label>
                <input id="cst2" type="number" min="15" value={inputs.t2} onChange={(e) => set("t2")(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Use two maximal effort time trials — e.g. 400 m and 200 m — with full rest between.</p>

            <div className="flex gap-3 pt-1">
              <button type="button" className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 flex items-center justify-center gap-2">
                <Waves className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result ? (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Critical Swim Speed</div>
                  <div className="text-4xl font-extrabold text-primary">{result.css.toFixed(3)} m/s</div>
                  <div className="text-sm text-muted-foreground mt-1">100 m pace: {result.pace100} · 400 m: {result.pace400} · 1500 m: {result.pace1500}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">100 m Pace</div>
                    <div className="text-lg font-bold text-primary">{result.pace100}</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">400 m Pace</div>
                    <div className="text-lg font-bold text-primary">{result.pace400}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">1500 m Pace</div>
                    <div className="text-lg font-bold text-primary">{result.pace1500}</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Detail</th>
                        <th className="p-2.5 pr-3 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {result.breakdown.map((row) => (
                        <tr key={row.label}>
                          <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                          <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Test Speeds vs CSS</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} domain={[0, "auto"]} />
                      <Tooltip formatter={(v: number) => [`${v.toFixed(3)} m/s`, "Speed"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={70} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <div className="text-sm font-bold mb-3">Summary Statistics</div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {result.summaryStats.map((s) => (
                      <div key={s.label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="font-semibold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-sm text-muted-foreground">Enter two valid time trials — the longer distance must be slower than the shorter one.</div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the CSS Swimming Calculator</h2>
            <p>Critical Swim Speed (CSS) estimates the fastest pace a swimmer can sustain aerobically, computed from two maximal time trials: CSS = (D₂ − D₁) ÷ (T₂ − T₁). It is a stronger predictor of open-water and distance performance than a single speed test.</p>
            <h3>Training by CSS</h3>
            <p>Endurance sets swim at CSS + 5–8 s per 100 m, threshold work sits at CSS itself, and speed work is faster. Retest every 4–6 weeks to keep paces honest as fitness improves.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/css-swimming-calculator" />
          <PopularCalculators exclude="/calculator/css-swimming-calculator" />
        </div>
      </div>
    </>
  );
}
