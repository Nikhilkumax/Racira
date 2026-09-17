"use client";
import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface LsatInputs {
  rawScore: number;
  totalQuestions: number;
}

interface CurvePoint {
  raw: number;
  scaled: number;
}

interface LsatResults {
  scaledScore: number;
  percentile: number;
  rawPct: number;
  curve: CurvePoint[];
  chartData: CurvePoint[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
// Approximate LSAT raw -> scaled conversion (varies by test administration)
const CURVE: [number, number][] = [
  [52, 150], [58, 152], [64, 155], [70, 157], [76, 160], [80, 162], [84, 165], [87, 167], [90, 170], [93, 173], [96, 176], [99, 179], [101, 180],
];
// Scaled score -> percentile (approximate, based on published LSAT percentile tables)
const PERCENTILES: [number, number][] = [
  [150, 44], [155, 63], [160, 79], [165, 91], [170, 97.7], [175, 99.6], [180, 99.9],
];

function interpolate(table: [number, number][], x: number): number {
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

function calcLsat(i: LsatInputs): LsatResults {
  const scaledScore = Math.round(interpolate(CURVE, i.rawScore));
  const percentile = Math.min(99.9, interpolate(PERCENTILES, scaledScore));
  const rawPct = i.totalQuestions > 0 ? (i.rawScore / i.totalQuestions) * 100 : 0;

  const curve: CurvePoint[] = CURVE.map(([raw, scaled]) => ({ raw, scaled }));
  const chartData: CurvePoint[] = [...curve, { raw: i.rawScore, scaled: scaledScore }]
    .sort((a, b) => a.raw - b.raw);

  const breakdown = [
    { label: "Raw Score (Correct Answers)", value: `${i.rawScore}` },
    { label: "Total Questions", value: `${i.totalQuestions}` },
    { label: "Raw Score Percentage", value: `${rawPct.toFixed(1)}%` },
    { label: "Estimated Scaled Score", value: `${scaledScore}`, highlight: true },
    { label: "Percentile Rank", value: `${percentile.toFixed(1)}th` },
    { label: "Score Range", value: "120 - 180", isTotal: true },
  ];

  const summaryStats = [
    { label: "Scaled Score", value: `${scaledScore}` },
    { label: "Percentile", value: `${percentile.toFixed(1)}th` },
    { label: "Raw Score", value: `${i.rawScore}` },
    { label: "Raw Percentage", value: `${rawPct.toFixed(1)}%` },
    { label: "Total Questions", value: `${i.totalQuestions}` },
    { label: "Score Range", value: "120 - 180" },
    { label: "Median Score", value: "152" },
    { label: "75th Percentile", value: "158" },
  ];

  return { scaledScore, percentile, rawPct, curve, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  rawScore: "76",
  totalQuestions: "101",
};

// 4. Component
export default function LsatScoreCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<LsatResults>(() => calcLsat({ rawScore: 76, totalQuestions: 101 }));

  useEffect(() => {
    setResult(calcLsat({ rawScore: 76, totalQuestions: 101 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () => setResult(calcLsat({ rawScore: parseFloat(inputs.rawScore) || 0, totalQuestions: parseFloat(inputs.totalQuestions) || 0 }));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcLsat({ rawScore: 76, totalQuestions: 101 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const raw = parseFloat(inputs.rawScore) || 0;
  const total = parseFloat(inputs.totalQuestions) || 0;
  if (inputs.rawScore.trim() === "") errors.rawScore = "Raw score is required";
  else if (raw < 0 || raw > total) errors.rawScore = `Must be between 0 and ${total}`;
  if (total <= 0) errors.totalQuestions = "Total questions must be greater than 0";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How is the LSAT scored?", answer: "The LSAT is scored on a scale from 120 to 180. Your raw score — the number of correct answers — is converted to a scaled score using a conversion table that varies slightly by test administration to keep scores comparable across different versions of the exam." },
    { question: "How accurate is this predictor?", answer: "This calculator uses a typical raw-to-scaled conversion curve based on published LSAT conversions. The exact curve differs by administration, so treat the result as an estimate within roughly 1-3 points. The best practice is to take official practice tests with their published conversion tables." },
    { question: "What is a good LSAT score?", answer: "The median LSAT score is about 152, which is around the 50th percentile. A score of 160 puts you in the top ~20%, 165 in the top ~9%, and 170+ in the top ~2-3%. Top law schools typically expect 165-175, while many solid regional schools accept 155-160." },
    { question: "How many questions are on the LSAT?", answer: "The modern LSAT has approximately 100-101 scored questions across four sections: logical reasoning (two sections), reading comprehension, and analytical reasoning. There is also an unscored experimental section that does not count toward your score." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "LSAT Score Predictor" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">LSAT Score Predictor</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="raw" className={lbl}>Raw Score (Correct)</label>
                <div className={inp}>
                  <input id="raw" type="number" min="0" value={inputs.rawScore} onChange={(e) => set("rawScore")(e.target.value)} className={ci} />
                </div>
                {errors.rawScore && <p className="text-xs text-red-500 font-medium mt-1">{errors.rawScore}</p>}
              </div>
              <div>
                <label htmlFor="total" className={lbl}>Total Questions</label>
                <div className={inp}>
                  <input id="total" type="number" min="1" value={inputs.totalQuestions} onChange={(e) => set("totalQuestions")(e.target.value)} className={ci} />
                </div>
                {errors.totalQuestions && <p className="text-xs text-red-500 font-medium mt-1">{errors.totalQuestions}</p>}
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Scaled Score</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.scaledScore}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.percentile.toFixed(1)}th percentile · {result.rawPct.toFixed(1)}% raw
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Scaled Score", `${result.scaledScore}`],
                ["Percentile", `${result.percentile.toFixed(1)}th`],
                ["Raw Percentage", `${result.rawPct.toFixed(1)}%`],
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
              <h3 className="text-base font-bold mb-4">Raw-to-Scaled Conversion Curve</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="raw" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[120, 180]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={(v: number, n: string) => [n === "scaled" ? v : `${v}`, n === "scaled" ? "Scaled Score" : "Raw Score"]} labelFormatter={(v) => `Raw: ${v}`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Line type="monotone" dataKey="scaled" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  <ReferenceDot x={parseFloat(inputs.rawScore) || 0} y={result.scaledScore} r={6} fill="#10b981" stroke="#fff" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">The green dot marks your raw score on the conversion curve.</p>
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
            <h2 className="text-2xl font-bold mb-3">How the LSAT Is Scored</h2>
            <p>The LSAT reports a scaled score from 120 to 180. Your raw score — the count of correct answers out of roughly 101 scored questions — is converted through a table that varies slightly by administration so that the same ability level produces the same scaled score on every test date.</p>
            <h2 className="text-2xl font-bold mb-3">Interpreting the Curve</h2>
            <p>Scoring is not linear: near the middle of the range, a few extra correct answers can raise your score by a point, while near the top, each additional point requires several more correct answers. This calculator uses a representative conversion curve so you can estimate your scaled score and percentile from practice-test raw scores.</p>
            <h2 className="text-2xl font-bold mb-3">Setting a Target</h2>
            <p>Research the median LSAT of your target schools, then work backward: find the raw score that maps to your target scaled score and use it as your practice benchmark. Most students improve 5-10 points over 3-4 months of focused study with timed practice tests.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lsat-score-calculator" />
          <PopularCalculators exclude="/calculator/lsat-score-calculator" />
        </div>
      </div>
    </>
  );
}
