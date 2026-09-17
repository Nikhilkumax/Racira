"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface LeanMassResult {
  weight: number;
  bodyFatPct: number;
  height: number;
  fatMass: number;
  leanMass: number;
  boerEstimate: number;
  ffmi: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcLeanMass(weightKg: number, bfPct: number, heightCm: number): LeanMassResult {
  const fatMass = weightKg * (bfPct / 100);
  const leanMass = weightKg - fatMass;
  const boerEstimate = heightCm > 0 ? 0.407 * weightKg + 0.267 * heightCm - 19.2 : 0;
  const ffmi = heightCm > 0 ? leanMass / Math.pow(heightCm / 100, 2) : 0;
  const breakdown = [
    { label: "Body Weight", value: `${fmt(weightKg)} kg` },
    { label: "Body Fat Percentage", value: `${fmt(bfPct, 1)}%` },
    { label: "Fat Mass", value: `${fmt(fatMass)} kg` },
    { label: "Lean Mass", value: `${fmt(leanMass)} kg` },
    { label: "Boer Estimate (height-based)", value: heightCm > 0 ? `${fmt(boerEstimate)} kg` : "—" },
    { label: "Fat-Free Mass Index (FFMI)", value: `${fmt(ffmi, 2)}` },
    { label: "Lean Mass Share", value: `${fmt(100 - bfPct, 1)}%` },
    { label: "Lean-to-Fat Ratio", value: fatMass > 0 ? `${fmt(leanMass / fatMass, 2)}:1` : "—" },
  ];
  const summaryStats = [
    { label: "Lean Mass", value: `${fmt(leanMass)} kg` },
    { label: "Fat Mass", value: `${fmt(fatMass)} kg` },
    { label: "Body Fat", value: `${fmt(bfPct, 1)}%` },
    { label: "FFMI", value: `${fmt(ffmi, 2)}` },
    { label: "Lean Share", value: `${fmt(100 - bfPct, 1)}%` },
    { label: "Fat Share", value: `${fmt(bfPct, 1)}%` },
    { label: "Boer Estimate", value: heightCm > 0 ? `${fmt(boerEstimate)} kg` : "—" },
    { label: "Lean-to-Fat Ratio", value: fatMass > 0 ? `${fmt(leanMass / fatMass, 2)}:1` : "—" },
  ];
  const chartData = [
    { name: "Lean Mass", value: Number(leanMass.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "Fat Mass", value: Number(fatMass.toFixed(2)), fill: "#f59e0b" },
  ];
  return { weight: weightKg, bodyFatPct: bfPct, height: heightCm, fatMass, leanMass, boerEstimate, ffmi, breakdown, summaryStats, chartData };
}

const DEFAULTS = { weight: "80", bf: "20", height: "180" };

export default function LeanMassCalculator() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [bf, setBf] = useState(DEFAULTS.bf);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [result, setResult] = useState<LeanMassResult | null>(null);

  const w = parseFloat(weight) || 0;
  const b = parseFloat(bf) || 0;
  const h = parseFloat(height) || 0;
  const errs: string[] = [];
  if (w <= 0) errs.push("Weight must be greater than 0.");
  if (b < 2 || b > 60) errs.push("Body fat percentage typically falls between 2% and 60% — check your input.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcLeanMass(w, b, h)); };
  const reset = () => {
    setWeight(DEFAULTS.weight); setBf(DEFAULTS.bf); setHeight(DEFAULTS.height);
    setResult(calcLeanMass(80, 20, 180));
  };
  useEffect(() => { setResult(calcLeanMass(80, 20, 180)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How do I measure my body fat percentage?", answer: "Calipers (skinfold), bioelectrical impedance scales, and DEXA scans all estimate it. This calculator treats your number as given — the lean mass result is simply body weight minus fat mass — so accuracy depends on your measurement method." },
    { question: "What is a healthy body fat range?", answer: "For men, 10-20% is generally athletic-to-fitness, 20-25% average, and above 25% elevated. For women, add about 8-10 percentage points because essential fat is higher. Context — age, training, and goals — matters more than any single number." },
    { question: "What is FFMI?", answer: "The fat-free mass index normalizes lean mass for height (lean mass ÷ height²). Untrained adults typically score 18-20, trained lifters 22-24, and values above 25 are rare without pharmacology — a useful reality check on goals." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Lean Mass Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Lean Mass Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Body Weight (kg)</label>
                <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">kg</span></div>
              </div>
              <div>
                <label className={lbl}>Body Fat (%)</label>
                <div className={inp}><input type="number" value={bf} onChange={e => setBf(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div className="col-span-2">
                <label className={lbl}>Height (cm) — for Boer cross-check</label>
                <div className={inp}><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">cm</span></div>
              </div>
            </div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Lean Mass</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.leanMass)} kg</div>
                <div className="text-sm text-muted-foreground mt-1">{fmt(result.weight)} kg total · {fmt(result.fatMass)} kg fat · {fmt(100 - result.bodyFatPct, 1)}% lean share</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Fat Mass`, `${fmt(result.fatMass)} kg`], ["Body Fat", `${fmt(result.bodyFatPct, 1)}%`], ["FFMI", `${fmt(result.ffmi, 2)}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Body Composition</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 3 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 3 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Fat vs Lean Composition</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${fmt(v)} kg`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Body weight split into lean mass and fat mass</p>
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
            <h2 className="text-2xl font-bold mb-3">From Body Fat to Lean Mass</h2>
            <p>This <strong>lean mass calculator</strong> takes your body weight and body fat percentage and splits them into fat mass and lean mass: fat = weight × fat%, lean = weight − fat. It is the direct, measurement-based method — the same arithmetic a DEXA report summarizes.</p>
            <h2 className="text-2xl font-bold mb-3">The Height Cross-Check</h2>
            <p>Entering height adds the Boer anthropometric estimate as a second opinion. A large gap between the two suggests your body fat measurement may be off — the direct number and the population formula should broadly agree.</p>
            <h2 className="text-2xl font-bold mb-3">Tracking Progress</h2>
            <p>Body weight alone cannot tell you whether you gained muscle or fat. Tracking lean mass keeps goals honest: a successful cut drops fat mass while preserving lean, and a successful bulk adds lean while limiting fat gain.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lean-mass-calculator" />
          <PopularCalculators exclude="/calculator/lean-mass-calculator" />
        </div>
      </div>
    </>
  );
}
