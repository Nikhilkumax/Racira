"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface LbmResult {
  sex: string;
  weight: number;
  height: number;
  bodyFatPct: number;
  boer: number;
  james: number;
  hume: number;
  estimatedBf: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcLbm(sex: string, weightKg: number, heightCm: number, bfPctInput: number): LbmResult {
  // Boer (1984), James (1976), Hume (1966) — all in kg with height in cm
  const boer = sex === "Male"
    ? 0.407 * weightKg + 0.267 * heightCm - 19.2
    : 0.252 * weightKg + 0.473 * heightCm - 48.3;
  const james = sex === "Male"
    ? 1.1 * weightKg - 128 * Math.pow(weightKg / heightCm, 2)
    : 1.07 * weightKg - 148 * Math.pow(weightKg / heightCm, 2);
  const hume = sex === "Male"
    ? 0.3281 * weightKg + 0.33929 * heightCm - 29.5336
    : 0.29569 * weightKg + 0.41813 * heightCm - 43.2933;
  const avg = (boer + james + hume) / 3;
  const lbm = bfPctInput > 0 ? weightKg * (1 - bfPctInput / 100) : avg;
  const estimatedBf = weightKg > 0 ? ((weightKg - avg) / weightKg) * 100 : 0;
  const breakdown = [
    { label: "Boer Formula", value: `${fmt(boer)} kg` },
    { label: "James Formula", value: `${fmt(james)} kg` },
    { label: "Hume Formula", value: `${fmt(hume)} kg` },
    { label: "Average of Three Estimates", value: `${fmt(avg)} kg` },
    { label: "Implied Body Fat (avg)", value: `${fmt(estimatedBf, 1)}%` },
    { label: "Fat-Free Mass Index (FFMI)", value: `${fmt(avg / Math.pow(heightCm / 100, 2), 2)}` },
    { label: "Weight - LBM (Fat Mass)", value: `${fmt(weightKg - avg)} kg` },
    { label: "Reported Body Fat Based LBM", value: bfPctInput > 0 ? `${fmt(lbm)} kg` : "— (enter body fat % in Advanced Options)" },
  ];
  const summaryStats = [
    { label: "Lean Body Mass", value: `${fmt(lbm)} kg` },
    { label: "Boer", value: `${fmt(boer)} kg` },
    { label: "James", value: `${fmt(james)} kg` },
    { label: "Hume", value: `${fmt(hume)} kg` },
    { label: "Implied Body Fat", value: `${fmt(estimatedBf, 1)}%` },
    { label: "FFMI", value: `${fmt(avg / Math.pow(heightCm / 100, 2), 2)}` },
    { label: "Weight", value: `${fmt(weightKg)} kg` },
    { label: "Height", value: `${fmt(heightCm, 1)} cm` },
  ];
  const chartData = [
    { name: "Boer", value: Number(boer.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "James", value: Number(james.toFixed(2)), fill: "#8b5cf6" },
    { name: "Hume", value: Number(hume.toFixed(2)), fill: "#f59e0b" },
  ];
  return { sex, weight: weightKg, height: heightCm, bodyFatPct: bfPctInput, boer, james, hume, estimatedBf, breakdown, summaryStats, chartData };
}

const DEFAULTS = { sex: "Male", weight: "80", height: "180", bf: "0" };

export default function LeanBodyMassCalculator() {
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [bf, setBf] = useState(DEFAULTS.bf);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<LbmResult | null>(null);

  const w = parseFloat(weight) || 0;
  const h = parseFloat(height) || 0;
  const bfPct = parseFloat(bf) || 0;
  const errs: string[] = [];
  if (w <= 0 || h <= 0) errs.push("Weight and height must both be greater than 0.");
  if (h < 100 || h > 250) errs.push("Height looks unusual — check that it is in centimeters (e.g. 180).");
  if (bfPct < 0 || bfPct >= 100) errs.push("Body fat percentage must be between 0 and 100.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcLbm(sex, w, h, bfPct)); };
  const reset = () => {
    setSex(DEFAULTS.sex); setWeight(DEFAULTS.weight); setHeight(DEFAULTS.height); setBf(DEFAULTS.bf); setShowAdv(false);
    setResult(calcLbm("Male", 80, 180, 0));
  };
  useEffect(() => { setResult(calcLbm("Male", 80, 180, 0)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 px-3 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is lean body mass?", answer: "Lean body mass (LBM) is your total weight minus body fat — muscles, bones, organs, and water. It is the metabolically active tissue that drives your basal metabolic rate, which is why it matters for nutrition and training." },
    { question: "Which formula is most accurate?", answer: "The Boer formula is the most widely validated for general populations and is used as the headline estimate here. The James and Hume formulas give alternative views; when all three agree, you can trust the average." },
    { question: "How is LBM used in practice?", answer: "It anchors basal metabolic rate estimates (Katch-McArdle uses LBM directly), guides protein intake — roughly 1.6-2.2 g per kg of LBM for athletes — and tracks body-composition changes better than raw weight during training." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Lean Body Mass Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Lean Body Mass Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={lbl}>Sex</label>
                <select value={sex} onChange={e => setSex(e.target.value)} className={sel}>
                  <option>Male</option><option>Female</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Weight (kg)</label>
                <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">kg</span></div>
              </div>
              <div>
                <label className={lbl}>Height (cm)</label>
                <div className={inp}><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">cm</span></div>
              </div>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Direct Measurement</div>
                  <div>
                    <label className={lbl}>Body Fat % (if known)</label>
                    <div className={inp}><input type="number" value={bf} onChange={e => setBf(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Lean Body Mass</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt((result.boer + result.james + result.hume) / 3)} kg</div>
                <div className="text-sm text-muted-foreground mt-1">{fmt(result.weight)} kg body weight · ~{fmt(result.estimatedBf, 1)}% estimated body fat</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Boer`, `${fmt(result.boer)} kg`], ["James", `${fmt(result.james)} kg`], ["Hume", `${fmt(result.hume)} kg`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Formula Comparison</h3>
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
                <h3 className="text-base font-bold mb-4">Estimate by Formula</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [`${fmt(v)} kg`, "LBM"]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Boer, James, and Hume estimates from weight and height alone</p>
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
            <h2 className="text-2xl font-bold mb-3">Anthropometric LBM Formulas</h2>
            <p>This <strong>lean body mass calculator</strong> estimates fat-free mass from weight and height using three validated equations. The Boer formula — 0.407·W + 0.267·H − 19.2 for men — is the current standard reference; James and Hume provide robustness checks on the same inputs.</p>
            <h2 className="text-2xl font-bold mb-3">Fat Mass and FFMI</h2>
            <p>Subtracting LBM from body weight gives fat mass, and the implied body fat percentage follows directly. The fat-free mass index (FFMI) — LBM divided by height squared — normalizes lean mass for height so you can compare physiques fairly.</p>
            <h2 className="text-2xl font-bold mb-3">When to Use Direct Body Fat</h2>
            <p>If you know your body fat percentage from calipers, DEXA, or bioimpedance, enter it in Advanced Options — the calculator then uses LBM = weight × (1 − fat%) instead of the equations, which is more accurate for individuals far from the population average.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lean-body-mass-calculator" />
          <PopularCalculators exclude="/calculator/lean-body-mass-calculator" />
        </div>
      </div>
    </>
  );
}
