"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface ReadingInputs {
  words: number;
  speed: string;   // "slow" | "average" | "fast"
  overheadPct: number; // % for headings, images, pauses
}

interface ReadingResults {
  wpm: number;
  baseMinutes: number;
  overheadMinutes: number;
  totalMinutes: number;
  totalSeconds: number;
  minutesLabel: string;
  chartData: { name: string; minutes: number; selected: boolean }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const SPEEDS: Record<string, { label: string; wpm: number }> = {
  slow: { label: "Slow (180 wpm)", wpm: 180 },
  average: { label: "Average (238 wpm)", wpm: 238 },
  fast: { label: "Fast (300 wpm)", wpm: 300 },
};

function fmtTime(minutes: number): string {
  const m = Math.round(minutes);
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h > 0 ? `${h} hr ${r} min` : `${r} min`;
}

function calcReading(i: ReadingInputs): ReadingResults {
  const wpm = SPEEDS[i.speed]?.wpm ?? 238;
  const baseMinutes = i.words / wpm;
  const overheadMinutes = baseMinutes * (i.overheadPct / 100);
  const totalMinutes = baseMinutes + overheadMinutes;
  const totalSeconds = totalMinutes * 60;

  const chartData = Object.entries(SPEEDS).map(([k, v]) => ({
    name: v.label.split(" ")[0],
    minutes: +((i.words / v.wpm) * (1 + i.overheadPct / 100)).toFixed(1),
    selected: k === i.speed,
  }));

  const breakdown = [
    { label: "Word Count", value: `${i.words.toLocaleString()} words` },
    { label: `Reading Speed (${wpm} wpm)`, value: `${wpm} wpm` },
    { label: "Base Reading Time", value: `${baseMinutes.toFixed(1)} min` },
    { label: `Overhead (${i.overheadPct}%)`, value: `+${overheadMinutes.toFixed(1)} min` },
    { label: "Total Reading Time", value: fmtTime(totalMinutes), highlight: true, isTotal: true },
    { label: "In Seconds", value: `${totalSeconds.toFixed(0)} sec` },
  ];

  const summaryStats = [
    { label: "Total Reading Time", value: fmtTime(totalMinutes) },
    { label: "Base Time", value: `${baseMinutes.toFixed(1)} min` },
    { label: "Overhead", value: `+${overheadMinutes.toFixed(1)} min` },
    { label: "Word Count", value: `${i.words.toLocaleString()}` },
    { label: "Speed", value: `${wpm} wpm` },
    { label: "Minutes per 1,000 Words", value: `${(1000 / wpm).toFixed(1)} min` },
    { label: "Words per Minute", value: `${wpm}` },
    { label: "Overhead %", value: `${i.overheadPct}%` },
  ];

  return { wpm, baseMinutes, overheadMinutes, totalMinutes, totalSeconds, minutesLabel: fmtTime(totalMinutes), chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  words: "1200",
  speed: "average",
  overheadPct: "10",
};

// 4. Component
export default function ReadingTimeCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<ReadingResults>(() => calcReading({ words: 1200, speed: "average", overheadPct: 10 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcReading({ words: 1200, speed: "average", overheadPct: 10 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcReading({
        words: parseFloat(inputs.words) || 0,
        speed: inputs.speed,
        overheadPct: parseFloat(inputs.overheadPct) || 0,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcReading({ words: 1200, speed: "average", overheadPct: 10 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const words = parseFloat(inputs.words) || 0;
  const overheadPct = parseFloat(inputs.overheadPct) || 0;
  if (words <= 0) errors.words = "Must be greater than 0";
  if (overheadPct < 0 || overheadPct > 100) errors.overheadPct = "Must be 0–100%";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "What's the average reading speed?", answer: "The average adult reads typical prose at about 238 words per minute, based on widely cited reading research. Silent reading of easier material runs faster (300+ wpm), while technical or dense text drops toward 180 wpm. The calculator's three speed presets cover that range, and the slow preset is the honest choice for complex material." },
    { question: "Why add overhead time?", answer: "Real reading isn't a steady stream: you pause at headings, glance at images and tables, re-read a confusing sentence, and your attention wanders. A 10% overhead converts the raw word-time into a realistic estimate — the same approach popular reading-time estimators use with per-image and per-heading allowances." },
    { question: "How long does it take to read 1,000 words?", answer: "At 238 wpm, about 4.2 minutes of pure reading — roughly 4.6 minutes with 10% overhead. A 1,200-word article runs about 5.5 minutes, and a 75,000-word book is just over 5 hours at average speed. The chart shows how the same text time changes across slow, average, and fast reading." },
    { question: "How accurate are reading time estimates?", answer: "As planning tools, quite accurate — within 10–20% for typical readers on familiar material. Accuracy drops for dense academic or technical prose, which can run 2× the estimated time, and for casual skimming, which is faster. Use the slow preset for dense material and the average preset for typical articles and books." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Writing", href: "/calculator#writing" }, { label: "Reading Time Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Reading Time Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="words" className={lbl}>Word Count</label>
                <div className={inp}>
                  <input id="words" type="number" min="1" step="50" value={inputs.words} onChange={(e) => set("words")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">words</span>
                </div>
                {errors.words && <p className="text-xs text-red-500 font-medium mt-1">{errors.words}</p>}
              </div>
              <div>
                <label htmlFor="speed" className={lbl}>Reading Speed</label>
                <select id="speed" value={inputs.speed} onChange={(e) => set("speed")(e.target.value)} className={sel}>
                  {Object.entries(SPEEDS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ADVANCED OPTIONS */}
            <div className="border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Realistic Reading</div>
                    <div>
                      <label htmlFor="overheadPct" className={lbl}>Overhead (headings, images, pauses)</label>
                      <div className={inp}>
                        <input id="overheadPct" type="number" min="0" max="100" step="5" value={inputs.overheadPct} onChange={(e) => set("overheadPct")(e.target.value)} className={ci} />
                        <span className="pr-3 text-muted-foreground text-sm">%</span>
                      </div>
                      {errors.overheadPct && <p className="text-xs text-red-500 font-medium mt-1">{errors.overheadPct}</p>}
                    </div>
                  </div>
                </div>
              )}
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Reading Time</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.minutesLabel}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.baseMinutes.toFixed(1)} min base + {result.overheadMinutes.toFixed(1)} min overhead · {result.wpm} wpm
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Words", `${parseFloat(inputs.words).toLocaleString()}`],
                ["Speed", `${result.wpm} wpm`],
                ["Total", `${result.totalMinutes.toFixed(1)} min`],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Time Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Reading Time by Speed</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={(v: number) => `${v} min`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                    {result.chartData.map((d, i) => (
                      <Cell key={i} fill={d.selected ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.25)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">The same text takes 40% longer at 180 wpm than at 300 wpm — pick the preset matching the material.</p>
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
            <h2 className="text-2xl font-bold mb-3">Words Divided by Speed</h2>
            <p>Reading time is the simplest equation in publishing: word count ÷ reading speed, with a realism tax. At 238 wpm — the widely cited average for adult readers — a 1,200-word article takes about 5 minutes. Slower, denser text drops to 180 wpm; skimming and easy prose climb toward 300. The calculator's presets span that full range.</p>
            <h2 className="text-2xl font-bold mb-3">The Overhead Is the Honesty</h2>
            <p>Raw word-time assumes you read like a machine. Real readers pause at headings, study images, re-read, and get interrupted — so published reading-time estimators add allowances per image, heading, and paragraph. The 10% overhead default approximates that for typical articles; raise it for image-heavy or technical pieces.</p>
            <h2 className="text-2xl font-bold mb-3">Why Writers Care</h2>
            <p>Content teams set reading-time targets because it predicts engagement: readers commit to a 5-minute article more readily than a 15-minute one. Estimating the time before publishing — not after — is what lets writers trim to the target. The same calculator works both ways: check your draft's length, or plan how much material fits a speaking slot.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/reading-time-calculator" />
          <PopularCalculators exclude="/calculator/reading-time-calculator" />
        </div>
      </div>
    </>
  );
}
