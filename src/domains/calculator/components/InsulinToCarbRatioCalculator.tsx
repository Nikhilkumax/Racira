"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface InsulinResult {
  carbs: number;
  icr: number;
  bg: number;
  target: number;
  isf: number;
  carbBolus: number;
  correctionBolus: number;
  totalBolus: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function calcInsulin(carbs: number, icr: number, bg: number, target: number, isf: number): InsulinResult {
  const carbBolus = icr > 0 ? carbs / icr : 0;
  const correctionBolus = isf > 0 ? Math.max(0, (bg - target) / isf) : 0;
  const totalBolus = carbBolus + correctionBolus;

  const breakdown = [
    { label: "Carbohydrates", value: `${carbs} g` },
    { label: "Insulin-to-Carb Ratio", value: `1 unit per ${icr} g` },
    { label: "Carb Bolus", value: `${carbBolus.toFixed(2)} units` },
    { label: "Blood Glucose", value: `${bg} mg/dL` },
    { label: "Target Glucose", value: `${target} mg/dL` },
    { label: "Insulin Sensitivity Factor", value: `1 unit lowers ${isf} mg/dL` },
    { label: "Correction Bolus", value: `${correctionBolus.toFixed(2)} units` },
    { label: "Total Bolus", value: `${totalBolus.toFixed(2)} units` },
  ];
  const summaryStats = [
    { label: "Total Bolus", value: `${totalBolus.toFixed(2)} units` },
    { label: "Carb Bolus", value: `${carbBolus.toFixed(2)} units` },
    { label: "Correction", value: `${correctionBolus.toFixed(2)} units` },
    { label: "Carbs", value: `${carbs} g` },
    { label: "ICR", value: `1:${icr}` },
    { label: "BG", value: `${bg} mg/dL` },
    { label: "Target", value: `${target} mg/dL` },
    { label: "ISF", value: `${isf} mg/dL/unit` },
  ];
  const chartData = [
    { name: "Carb Bolus", value: Math.round(carbBolus * 100) / 100, fill: "hsl(var(--primary))" },
    { name: "Correction", value: Math.round(correctionBolus * 100) / 100, fill: "#f59e0b" },
  ];
  return { carbs, icr, bg, target, isf, carbBolus, correctionBolus, totalBolus, breakdown, summaryStats, chartData };
}

const DEFAULTS = { carbs: "60", icr: "10", bg: "180", target: "120", isf: "50" };

export default function InsulinToCarbRatioCalculator() {
  const [carbs, setCarbs] = useState(DEFAULTS.carbs);
  const [icr, setIcr] = useState(DEFAULTS.icr);
  const [bg, setBg] = useState(DEFAULTS.bg);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [isf, setIsf] = useState(DEFAULTS.isf);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<InsulinResult | null>(null);

  const cb = parseFloat(carbs) || 0;
  const ic = parseFloat(icr) || 0;
  const bgv = parseFloat(bg) || 0;
  const tg = parseFloat(target) || 0;
  const sf = parseFloat(isf) || 0;
  const errs: string[] = [];
  if (cb < 0) errs.push("Carbohydrates cannot be negative.");
  if (ic <= 0) errs.push("Insulin-to-carb ratio must be greater than 0.");
  if (bgv <= 0) errs.push("Blood glucose must be greater than 0.");
  if (tg <= 0) errs.push("Target glucose must be greater than 0.");
  if (sf <= 0) errs.push("Insulin sensitivity factor must be greater than 0.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcInsulin(cb, ic, bgv, tg, sf)); };
  const reset = () => {
    setCarbs(DEFAULTS.carbs); setIcr(DEFAULTS.icr); setBg(DEFAULTS.bg); setTarget(DEFAULTS.target); setIsf(DEFAULTS.isf);
    setResult(calcInsulin(60, 10, 180, 120, 50));
  };
  useEffect(() => { setResult(calcInsulin(60, 10, 180, 120, 50)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is an insulin-to-carb ratio?", answer: "It is how many grams of carbohydrate one unit of rapid-acting insulin covers — commonly 1:8 to 1:15. Divide the carbs in your meal by the ratio to get the mealtime bolus." },
    { question: "What is a correction bolus?", answer: "When blood glucose is above target, extra insulin brings it down: (current − target) ÷ sensitivity factor. The factor is how many mg/dL one unit lowers you." },
    { question: "Is this medical advice?", answer: "No — ratios vary with body weight, activity, and time of day, and are set by your care team. Use this calculator to understand the math behind your prescribed numbers." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Insulin-to-Carb Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Insulin-to-Carb Ratio Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Carbohydrates</label>
                <div className={inp}><input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">g</span></div>
              </div>
              <div>
                <label className={lbl}>Insulin-to-Carb Ratio</label>
                <div className={inp}><input type="number" value={icr} onChange={e => setIcr(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">g/unit</span></div>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Glucose Correction</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Current Blood Glucose</label>
                      <div className={inp}><input type="number" value={bg} onChange={e => setBg(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">mg/dL</span></div>
                    </div>
                    <div>
                      <label className={lbl}>Target Glucose</label>
                      <div className={inp}><input type="number" value={target} onChange={e => setTarget(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">mg/dL</span></div>
                    </div>
                    <div>
                      <label className={lbl}>Sensitivity Factor</label>
                      <div className={inp}><input type="number" value={isf} onChange={e => setIsf(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">mg/dL/unit</span></div>
                    </div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Bolus</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.totalBolus.toFixed(2)} units</div>
                <div className="text-sm text-muted-foreground mt-1">{result.carbBolus.toFixed(2)} carb + {result.correctionBolus.toFixed(2)} correction</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Carb Bolus`, `${result.carbBolus.toFixed(2)} units`], ["Correction", `${result.correctionBolus.toFixed(2)} units`], ["Carbs", `${result.carbs} g`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Dosing Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 7 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 7 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 7 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Bolus Composition</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v} units`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Carb coverage vs glucose correction</p>
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
            <h2 className="text-2xl font-bold mb-3">The Two Bolus Components</h2>
            <p>This <strong>insulin-to-carb ratio calculator</strong> models mealtime dosing as two parts: a carbohydrate bolus (carbs ÷ ICR) that covers the meal, plus a correction bolus ((glucose − target) ÷ sensitivity factor) that brings high blood sugar back to range. The total is what most pumps and pens deliver before a meal.</p>
            <h2 className="text-2xl font-bold mb-3">Why Ratios Are Personal</h2>
            <p>ICR and sensitivity vary with body weight, insulin resistance, activity, and even time of day. Morning meals often need tighter ratios than lunch. Your care team establishes the baseline; tracking post-meal glucose refines it over weeks.</p>
            <h2 className="text-2xl font-bold mb-3">Safety First</h2>
            <p>This is arithmetic, not a prescription. Hypoglycemia risk rises when correction stacks with active insulin, so always confirm timing and units with your provider and glucose monitor before dosing.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/insulin-to-carb-ratio-calculator" />
          <PopularCalculators exclude="/calculator/insulin-to-carb-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
