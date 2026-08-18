"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface OrmResult {
  epley: number;
  brzycki: number;
  lombardi: number;
  oconner: number;
  average: number;
  table: { reps: number; weight: number; pct: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 1): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcOrm(weight: number, reps: number): OrmResult {
  const epley = weight * (1 + reps / 30);
  const brzycki = reps < 37 ? weight * (36 / (37 - reps)) : weight;
  const lombardi = weight * Math.pow(reps, 0.1);
  const oconner = weight * (1 + reps / 40);
  const average = (epley + brzycki + lombardi + oconner) / 4;
  const table: { reps: number; weight: number; pct: number }[] = [];
  for (let r = 1; r <= 12; r++) {
    const est = average * (37 - r) / 36;
    table.push({ reps: r, weight: Number(est.toFixed(1)), pct: Number((est / average * 100).toFixed(1)) });
  }
  const breakdown = [
    { label: "Weight Lifted", value: `${fmt(weight)} lb/kg` },
    { label: "Reps Performed", value: `${reps}` },
    { label: "Epley (1RM = w(1 + r/30))", value: `${fmt(epley)}` },
    { label: "Brzycki (w × 36/(37 − r))", value: `${fmt(brzycki)}` },
    { label: "Lombardi (w × r^0.1)", value: `${fmt(lombardi)}` },
    { label: "O'Conner (w(1 + r/40))", value: `${fmt(oconner)}` },
    { label: "Average Estimate", value: `${fmt(average)}` },
  ];
  const summaryStats = [
    { label: "1RM (avg of 4)", value: `${fmt(average)}` },
    { label: "Epley", value: `${fmt(epley)}` },
    { label: "Brzycki", value: `${fmt(brzycki)}` },
    { label: "Lombardi", value: `${fmt(lombardi)}` },
    { label: "O'Conner", value: `${fmt(oconner)}` },
  ];
  const chartData = [
    { name: "Epley", value: Number(epley.toFixed(1)), fill: "hsl(var(--primary))" },
    { name: "Brzycki", value: Number(brzycki.toFixed(1)), fill: "#f59e0b" },
    { name: "Lombardi", value: Number(lombardi.toFixed(1)), fill: "#10b981" },
    { name: "O'Conner", value: Number(oconner.toFixed(1)), fill: "#8b5cf6" },
  ];
  return { epley, brzycki, lombardi, oconner, average, table, breakdown, summaryStats, chartData };
}

const DEFAULTS = { weight: "225", reps: "5" };

export default function OneRepMaxCalculator() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [reps, setReps] = useState(DEFAULTS.reps);
  const [result, setResult] = useState<OrmResult | null>(null);

  const w = parseFloat(weight);
  const r = parseInt(reps, 10);
  const errs: string[] = [];
  if (!w || w <= 0) errs.push("Weight must be greater than 0.");
  if (!r || r < 1 || r > 12) errs.push("Reps must be between 1 and 12 for reliable estimates.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcOrm(w, r)); };
  const reset = () => {
    setWeight(DEFAULTS.weight); setReps(DEFAULTS.reps);
    setResult(calcOrm(225, 5));
  };
  useEffect(() => { setResult(calcOrm(225, 5)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is a one-rep max?", answer: "The heaviest weight you can lift for exactly one repetition with good form. Testing it directly is risky and fatiguing, so most lifters estimate it from a submaximal set of 2–12 reps using formulas like Epley or Brzycki." },
    { question: "Which formula is most accurate?", answer: "Epley is the most widely used and validated; Brzycki is popular and slightly more conservative for high reps; Lombardi tends to run lower. All four are reported here — the average is a reasonable consensus estimate." },
    { question: "How do I use the percentage table?", answer: "Training intensities are usually prescribed as a percentage of 1RM — 70% for hypertrophy volume, 85%+ for strength. The table converts your estimated 1RM into the working weight for every rep count 1–12." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "One Rep Max Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">One Rep Max Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Weight Lifted</label>
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inp} placeholder="225" />
              </div>
              <div>
                <label className={lbl}>Reps Performed</label>
                <input type="number" value={reps} onChange={e => setReps(e.target.value)} className={inp} placeholder="5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Works with lb or kg — the unit doesn't change the formulas. Best results from a set of 2–12 reps to near-failure.</p>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated One-Rep Max</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.average)}</div>
                <div className="text-sm text-muted-foreground mt-1">Average of Epley, Brzycki, Lombardi, O'Conner · from {result.breakdown[0].value} for {result.breakdown[1].value}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Epley", `${fmt(result.epley)}`], ["Brzycki", `${fmt(result.brzycki)}`], ["Lombardi", `${fmt(result.lombardi)}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Formula Comparison</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmt(v), ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Formulas diverge most at high rep counts</p>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Estimated Max Table (from average)</h3>
                <div className="grid grid-cols-4 gap-2">
                  {result.table.map((t) => (
                    <div key={t.reps} className="bg-muted/40 rounded-md p-2 text-center">
                      <div className="text-xs font-bold uppercase text-muted-foreground">{t.reps} rep{t.reps > 1 ? "s" : ""}</div>
                      <div className="text-sm font-bold">{fmt(t.weight)}</div>
                      <div className="text-xs text-muted-foreground">{fmt(t.pct)}%</div>
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">Pick a rep range and lift the listed weight to train at that intensity</p>
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
            <h2 className="text-2xl font-bold mb-3">Estimate Without the Risk</h2>
            <p>Maxing out is the surest way to stall, and the easiest way to get hurt. The <strong>one-rep max calculator</strong> instead estimates your 1RM from a comfortable set of 2–12 reps, using four of the best-known prediction formulas.</p>
            <h2 className="text-2xl font-bold mb-3">The Formulas</h2>
            <p>Epley: w × (1 + r/30). Brzycki: w × 36/(37 − r). Lombardi: w × r^0.1. O'Conner: w × (1 + r/40). Each models how strength decays as reps rise; they agree closely at low reps and drift apart as reps climb — so the average is the sensible working number.</p>
            <h2 className="text-2xl font-bold mb-3">Train with Percentages</h2>
            <p>Programs prescribe loads as percentages of 1RM: 55–65% for volume, 70–80% for hypertrophy, 85–95% for strength. The max table converts your estimate into actual working weights across the 1–12 rep spectrum.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/one-rep-max-calculator" />
          <PopularCalculators exclude="/calculator/one-rep-max-calculator" />
        </div>
      </div>
    </>
  );
}
