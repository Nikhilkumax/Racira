"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, BookOpen } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface GradeRow {
  name: string;
  score: number;
  weight: number;
}

interface GradeResult {
  rows: GradeRow[];
  totalWeight: number;
  weighted: number;
  letter: string;
  finalWeight: number;
  neededOnFinal: number | null;
  target: number;
  chartData: { name: string; value: number; pct: number }[];
}

const LETTERS: [number, string][] = [
  [90, "A"], [80, "B"], [70, "C"], [60, "D"],
];

function letterFor(pct: number): string {
  for (const [min, l] of LETTERS) if (pct >= min) return l;
  return "F";
}

function calcGrade(rows: GradeRow[], finalWeight: number, target: number): GradeResult {
  const totalWeight = rows.reduce((p, r) => p + r.weight, 0);
  const weighted = totalWeight > 0 ? rows.reduce((p, r) => p + r.score * r.weight, 0) / totalWeight : 0;
  const remaining = 100 - finalWeight;
  const neededOnFinal = finalWeight > 0 && remaining > 0
    ? (target - weighted * (remaining / 100)) / (finalWeight / 100)
    : null;

  // Weight distribution for the donut chart (rows + final), normalized to sum to 100%
  const pieRaw = [
    ...rows.map((r) => ({ name: r.name, value: Math.max(0, r.weight) })),
    { name: "Final Exam", value: Math.max(0, finalWeight) },
  ].filter((d) => d.value > 0);
  const totalW = pieRaw.reduce((p, d) => p + d.value, 0);
  let acc = 0;
  const piePcts = pieRaw.map((d) => {
    const p = totalW > 0 ? (d.value / totalW) * 100 : 0;
    acc += p;
    return p;
  });
  if (totalW > 0 && pieRaw.length > 0) {
    let maxIdx = 0;
    for (let i = 1; i < piePcts.length; i++) if (piePcts[i] > piePcts[maxIdx]) maxIdx = i;
    piePcts[maxIdx] += 100 - acc;
  }
  const chartData = pieRaw.map((d, i) => ({ name: d.name, value: d.value, pct: piePcts[i] }));

  return { rows, totalWeight, weighted, letter: letterFor(weighted), finalWeight, neededOnFinal, target, chartData };
}

const DEFAULTS = {
  rows: [
    { name: "Homework", score: 92, weight: 20 },
    { name: "Midterm", score: 85, weight: 30 },
    { name: "Quizzes", score: 88, weight: 15 },
  ],
  finalWeight: 35,
  target: 90,
};

const faqs = [
  { question: "How is a weighted grade calculated?", answer: "Multiply each assignment score by its weight, sum the products, and divide by the total weight applied. If homework (20%) scores 92 and midterm (30%) scores 85, the weighted contribution is 92×0.20 + 85×0.30 = 43.9 points so far." },
  { question: "What score do I need on the final?", answer: "Rearranging the weighted formula: needed = (target − current×(100−final weight)/100) ÷ (final weight/100). If your current weighted score is 88 and the final is worth 30%, you need (90 − 88×0.70) ÷ 0.30 = 94.7% to reach 90." },
  { question: "What is a good grade scale?", answer: "The common US scale is A ≥ 90, B ≥ 80, C ≥ 70, D ≥ 60. Many courses add plus/minus adjustments. Check your syllabus — some schools use 93+ for an A or a curved scale." },
];

export default function GradeCalculator() {
  const [rows, setRows] = useState<GradeRow[]>(DEFAULTS.rows);
  const [finalWeight, setFinalWeight] = useState(`${DEFAULTS.finalWeight}`);
  const [target, setTarget] = useState(`${DEFAULTS.target}`);
  const [result, setResult] = useState<GradeResult>(() => calcGrade(DEFAULTS.rows, DEFAULTS.finalWeight, DEFAULTS.target));

  const updateRow = (i: number, field: keyof GradeRow, value: string) => {
    const next = rows.map((r, idx) => idx === i ? { ...r, [field]: field === "name" ? value : parseFloat(value) || 0 } : r);
    setRows(next);
  };

  const handleCalculate = () => {
    const fw = parseFloat(finalWeight);
    const tg = parseFloat(target);
    if (isNaN(fw) || isNaN(tg)) return;
    setResult(calcGrade(rows, fw, tg));
  };

  const reset = () => {
    setRows(DEFAULTS.rows);
    setFinalWeight(`${DEFAULTS.finalWeight}`);
    setTarget(`${DEFAULTS.target}`);
    setResult(calcGrade(DEFAULTS.rows, DEFAULTS.finalWeight, DEFAULTS.target));
  };

  const breakdown = [
    { label: "Weighted Average (so far)", value: `${result.weighted.toFixed(2)}%`, highlight: false },
    { label: "Letter Grade (so far)", value: result.letter, highlight: true },
    { label: "Total Weight Entered", value: `${result.totalWeight}%`, highlight: false },
    { label: "Final Exam Weight", value: `${result.finalWeight}%`, highlight: false },
    { label: `Needed on Final for ${result.target}%`, value: result.neededOnFinal !== null ? `${result.neededOnFinal.toFixed(1)}%` : "—", highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Grade Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Grade Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <BookOpen className="w-4 h-4" /> Weighted Grade & Final Exam
            </div>
            <div className="space-y-2">
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-[1fr_70px_70px] gap-2">
                  <input type="text" value={r.name} onChange={(e) => updateRow(i, "name", e.target.value)} className="input-calc" placeholder="Assignment" />
                  <input type="number" value={r.score} onChange={(e) => updateRow(i, "score", e.target.value)} className="input-calc" placeholder="Score %" min={0} max={100} />
                  <input type="number" value={r.weight} onChange={(e) => updateRow(i, "weight", e.target.value)} className="input-calc" placeholder="Wt %" min={0} max={100} />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Final Exam Weight (%)</label>
                <input type="number" value={finalWeight} onChange={(e) => setFinalWeight(e.target.value)} className="input-calc" min={0} max={100} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Target Grade (%)</label>
                <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} className="input-calc" min={0} max={100} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Current Grade</div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-4xl font-extrabold text-primary tracking-tight">{result.weighted.toFixed(2)}%</span>
                <span className="text-2xl font-bold text-muted-foreground">({result.letter})</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {result.neededOnFinal !== null
                  ? `Score ${result.neededOnFinal.toFixed(1)}% or higher on the final to finish with ${result.target}%.`
                  : "Enter a final exam weight to see what you need on it."}
              </p>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Weighted Average", `${result.weighted.toFixed(2)}%`], ["Letter Grade", `${result.letter}`], ["Needed on Final", result.neededOnFinal !== null ? `${result.neededOnFinal.toFixed(1)}%` : "—"]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold text-foreground">{v}</div>
                </div>
              ))}
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Result Breakdown</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-amber-500/10" : ""}>
                      <td className={`p-2.5 pl-3 ${row.highlight ? "text-amber-700 font-semibold" : "text-muted-foreground"}`}>{row.label}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Weight Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RPie>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} paddingAngle={2}>
                    {result.chartData.map((d, idx) => (
                      <Cell key={idx} fill={["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][idx % 5]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [`${v}%`, n]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                </RPie>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                {result.chartData.map((d, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][i % 5] }} />
                    {d.name} · {d.pct.toFixed(1)}%
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Assignments Entered", value: `${result.rows.length}` },
                  { label: "Weight Remaining", value: `${100 - result.finalWeight}%` },
                  { label: "Grade Scale", value: "A ≥ 90 · B ≥ 80 · C ≥ 70" },
                  { label: "Need 100% on Final?", value: result.neededOnFinal !== null && result.neededOnFinal > 100 ? "Yes — goal may be out of reach" : "Reachable" },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Grade Calculator</h2>
            <p>Courses rarely grade everything equally — a final exam worth 35% matters far more than homework worth 5%. A weighted average multiplies each score by its weight before averaging: with homework at 20% and midterm at 30%, a 92 and an 85 contribute 18.4 and 25.5 points. Dividing by the total weight applied gives the current standing.</p>
            <h3>Planning for the final</h3>
            <p>The most useful question a student can ask is "what do I need on the final?" The answer comes from solving the weighted-average equation for the unknown: needed = (target − current × remaining weight) ÷ final weight. If you're at 88 with a 30% final, hitting a 90 target requires 94.7% — a hard but possible goal that tells you exactly how to allocate study time. If the required score exceeds 100%, the target is mathematically out of reach and the realistic aim shifts to damage control.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/grade-calculator" />
          <PopularCalculators exclude="/calculator/grade-calculator" />
        </div>
      </div>
    </>
  );
}
