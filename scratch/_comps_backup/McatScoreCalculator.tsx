"use client";
import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface McatInputs {
  cp: number;   // Chemical & Physical Foundations
  cars: number; // Critical Analysis & Reasoning
  bb: number;   // Biological & Biochemical Foundations
  ps: number;   // Psychological & Social Foundations
}

interface ChartPoint {
  name: string;
  score: number;
}

interface McatResults {
  total: number;
  percentile: number;
  classification: string;
  chartData: ChartPoint[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const TOTAL_PERCENTILES: [number, number][] = [
  [472, 1], [480, 6], [485, 12], [490, 16], [495, 28], [500, 54], [505, 68], [510, 81], [515, 94], [520, 98], [525, 99.8], [528, 100],
];

function interp(table: [number, number][], x: number): number {
  if (x <= table[0][0]) return table[0][1];
  if (x >= table[table.length - 1][0]) return table[table.length - 1][1];
  for (let i = 1; i < table.length; i++) {
    if (x <= table[i][0]) {
      const [x0, y0] = table[i - 1];
      const [x1, y1] = table[i];
      return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
    }
  }
  return table[table.length - 1][1];
}

function classify(total: number): string {
  if (total < 494) return "Below Average (472-493)";
  if (total < 500) return "Average (494-499)";
  if (total < 508) return "Good (500-507)";
  if (total < 514) return "Very Good (508-513)";
  return "Excellent (514-528)";
}

function calcMcat(i: McatInputs): McatResults {
  const total = i.cp + i.cars + i.bb + i.ps;
  const percentile = Math.min(100, Math.round(interp(TOTAL_PERCENTILES, total) * 10) / 10);

  const chartData: ChartPoint[] = [
    { name: "C/P", score: i.cp },
    { name: "CARS", score: i.cars },
    { name: "B/B", score: i.bb },
    { name: "P/S", score: i.ps },
  ];

  const breakdown = [
    { label: "Chemical & Physical (C/P)", value: `${i.cp}` },
    { label: "Critical Analysis (CARS)", value: `${i.cars}` },
    { label: "Biological & Biochemical (B/B)", value: `${i.bb}` },
    { label: "Psychological & Social (P/S)", value: `${i.ps}` },
    { label: "Total MCAT Score", value: `${total}`, highlight: true },
    { label: "Percentile Rank", value: `${percentile.toFixed(1)}th` },
    { label: "Classification", value: classify(total) },
    { label: "Score Range", value: "472 - 528", isTotal: true },
  ];

  const summaryStats = [
    { label: "Total MCAT Score", value: `${total} / 528` },
    { label: "Percentile", value: `${percentile.toFixed(1)}th` },
    { label: "Classification", value: classify(total) },
    { label: "C/P Section", value: `${i.cp}` },
    { label: "CARS Section", value: `${i.cars}` },
    { label: "B/B Section", value: `${i.bb}` },
    { label: "P/S Section", value: `${i.ps}` },
    { label: "Section Average", value: `${(total / 4).toFixed(1)}` },
  ];

  return { total, percentile, classification: classify(total), chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  cp: "125",
  cars: "127",
  bb: "126",
  ps: "128",
};

// 4. Component
export default function McatScoreCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<McatResults>(() => calcMcat({ cp: 125, cars: 127, bb: 126, ps: 128 }));

  useEffect(() => {
    setResult(calcMcat({ cp: 125, cars: 127, bb: 126, ps: 128 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const buildInputs = (): McatInputs => ({
    cp: parseFloat(inputs.cp) || 0,
    cars: parseFloat(inputs.cars) || 0,
    bb: parseFloat(inputs.bb) || 0,
    ps: parseFloat(inputs.ps) || 0,
  });

  const calculate = () => setResult(calcMcat(buildInputs()));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcMcat({ cp: 125, cars: 127, bb: 126, ps: 128 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  (Object.keys(DEFAULTS) as (keyof typeof DEFAULTS)[]).forEach((k) => {
    const v = parseFloat(inputs[k]) || 0;
    if (v < 118 || v > 132) errors[k] = "Must be 118 - 132";
  });
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How is the MCAT scored?", answer: "The MCAT has four sections, each scored from 118 to 132. Section scores sum to a total between 472 and 528. The mean score is about 500 (roughly the 54th percentile), and each section's average is around 125." },
    { question: "What is a competitive MCAT score?", answer: "For U.S. MD programs, the average accepted score is around 511-512. DO programs average around 506-508. A 515+ score is competitive at top-tier schools and falls near the 94th percentile of test takers." },
    { question: "How do the sections convert to percentiles?", answer: "The AAMC publishes a score-conversion table each year that maps total scores to percentiles. This calculator uses the current published table so you can convert your section or total scores into a percentile rank." },
    { question: "Which section matters most?", answer: "Schools vary, but CARS is frequently weighted heavily by U.S. schools, and a low CARS score raises red flags for reading-intensive programs. The overall total remains the primary metric — most schools screen on total score first." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "MCAT Score Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">MCAT Score Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-sm font-semibold text-foreground">Section Scores (118 - 132)</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cp" className={lbl}>Chemical & Physical (C/P)</label>
                <div className={inp}>
                  <input id="cp" type="number" min="118" max="132" value={inputs.cp} onChange={(e) => set("cp")(e.target.value)} className={ci} />
                </div>
                {errors.cp && <p className="text-xs text-red-500 font-medium mt-1">{errors.cp}</p>}
              </div>
              <div>
                <label htmlFor="cars" className={lbl}>Critical Analysis (CARS)</label>
                <div className={inp}>
                  <input id="cars" type="number" min="118" max="132" value={inputs.cars} onChange={(e) => set("cars")(e.target.value)} className={ci} />
                </div>
                {errors.cars && <p className="text-xs text-red-500 font-medium mt-1">{errors.cars}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="bb" className={lbl}>Biological & Biochem (B/B)</label>
                <div className={inp}>
                  <input id="bb" type="number" min="118" max="132" value={inputs.bb} onChange={(e) => set("bb")(e.target.value)} className={ci} />
                </div>
                {errors.bb && <p className="text-xs text-red-500 font-medium mt-1">{errors.bb}</p>}
              </div>
              <div>
                <label htmlFor="ps" className={lbl}>Psych & Social (P/S)</label>
                <div className={inp}>
                  <input id="ps" type="number" min="118" max="132" value={inputs.ps} onChange={(e) => set("ps")(e.target.value)} className={ci} />
                </div>
                {errors.ps && <p className="text-xs text-red-500 font-medium mt-1">{errors.ps}</p>}
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calculate}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total MCAT Score</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.total} <span className="text-xl text-muted-foreground">/ 528</span></div>
              <div className="text-sm text-muted-foreground mt-1">{result.percentile.toFixed(1)}th percentile · {result.classification}</div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Total Score", `${result.total}`],
                ["Percentile", `${result.percentile.toFixed(1)}th`],
                ["Section Average", `${(result.total / 4).toFixed(1)}`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold text-foreground">{v}</div>
                </div>
              ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Score Breakdown</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`px-3 py-2.5 ${r.highlight ? "font-semibold text-amber-700" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Section Scores</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[118, 132]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={(v: number) => [`${v}`, "Section Score"]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <ReferenceLine y={125} stroke="hsl(var(--muted-foreground) / 0.5)" strokeDasharray="4 4" label={{ value: "Avg 125", fontSize: 11, fill: "hsl(var(--muted-foreground))", position: "insideTopRight" }} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {result.chartData.map((d, idx) => (
                      <Cell key={idx} fill={d.score >= 127 ? "#10b981" : d.score >= 125 ? "hsl(var(--primary))" : "#f59e0b"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Dashed line marks the section average of 125. Green = above average, amber = below.</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding MCAT Scores</h2>
            <p>The MCAT is scored on a total scale from 472 to 528, with each of the four sections scored independently from 118 to 132. The percentile tells you how you compare to other test takers — a 500 is around the 54th percentile, and each point near the middle of the range represents a meaningful difference in rank.</p>
            <h2 className="text-2xl font-bold mb-3">Converting Section Scores to a Total</h2>
            <p>Your total is simply the sum of your four section scores. Because each section uses the same 118-132 scale, the total can be converted directly to a percentile using the AAMC's published score-conversion table. This calculator applies that table to estimate your percentile rank and a general competitiveness band.</p>
            <h2 className="text-2xl font-bold mb-3">Setting Section Targets</h2>
            <p>A balanced profile matters. Many schools screen candidates whose total falls below a threshold, but unbalanced sections — especially a weak CARS score — can still raise concerns. Use the chart to spot weak sections and set practice targets: most successful applicants average 126-129 per section.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mcat-score-calculator" />
          <PopularCalculators exclude="/calculator/mcat-score-calculator" />
        </div>
      </div>
    </>
  );
}
