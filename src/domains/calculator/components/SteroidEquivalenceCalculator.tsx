"use client";
import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ArrowLeftRight, Printer, RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface SteroidData {
  name: string;
  equivalentDose: number; // mg equivalent to hydrocortisone 20mg
  antiInflammatoryPotency: number;
  mineralocorticoidPotency: number;
  halfLife: string;
  type: string;
}

interface SteroidInput {
  fromSteroid: string;
  fromDose: number;
  toSteroid: string;
}

interface SteroidResult {
  convertedDose: number;
  fromData: SteroidData;
  toData: SteroidData;
  allConversions: { name: string; dose: number; type: string }[];
  chartData: { name: string; dose: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const STEROID_DB: Record<string, SteroidData> = {
  hydrocortisone: { name: "Hydrocortisone", equivalentDose: 20, antiInflammatoryPotency: 1, mineralocorticoidPotency: 1, halfLife: "8-12 hours", type: "Short-acting" },
  cortisone: { name: "Cortisone", equivalentDose: 25, antiInflammatoryPotency: 0.8, mineralocorticoidPotency: 0.8, halfLife: "8-12 hours", type: "Short-acting" },
  prednisone: { name: "Prednisone", equivalentDose: 5, antiInflammatoryPotency: 4, mineralocorticoidPotency: 0.8, halfLife: "18-36 hours", type: "Intermediate-acting" },
  prednisolone: { name: "Prednisolone", equivalentDose: 5, antiInflammatoryPotency: 4, mineralocorticoidPotency: 0.8, halfLife: "18-36 hours", type: "Intermediate-acting" },
  methylprednisolone: { name: "Methylprednisolone", equivalentDose: 4, antiInflammatoryPotency: 5, mineralocorticoidPotency: 0.5, halfLife: "18-36 hours", type: "Intermediate-acting" },
  triamcinolone: { name: "Triamcinolone", equivalentDose: 4, antiInflammatoryPotency: 5, mineralocorticoidPotency: 0, halfLife: "18-36 hours", type: "Intermediate-acting" },
  dexamethasone: { name: "Dexamethasone", equivalentDose: 0.75, antiInflammatoryPotency: 25, mineralocorticoidPotency: 0, halfLife: "36-54 hours", type: "Long-acting" },
  betamethasone: { name: "Betamethasone", equivalentDose: 0.6, antiInflammatoryPotency: 25, mineralocorticoidPotency: 0, halfLife: "36-54 hours", type: "Long-acting" },
};

function fmtDose(d: number): string {
  return d % 1 === 0 ? `${d}` : d.toFixed(2).replace(/\.?0+$/, "");
}

function calcSteroid(input: SteroidInput): SteroidResult {
  const fromData = STEROID_DB[input.fromSteroid];
  const toData = STEROID_DB[input.toSteroid];
  // (FromDose / FromEquivalent) × ToEquivalent
  const convertedDose = (input.fromDose / fromData.equivalentDose) * toData.equivalentDose;

  const allConversions = Object.values(STEROID_DB).map((s) => ({
    name: s.name,
    type: s.type,
    dose: (input.fromDose / fromData.equivalentDose) * s.equivalentDose,
  }));

  const chartData = allConversions.map((c) => ({
    name: c.name.split(" ")[0],
    dose: Number(c.dose.toFixed(2)),
    fill: c.name === toData.name ? "hsl(var(--primary))" : "#94a3b8",
  }));

  const breakdown = [
    { label: "Convert From", value: fromData.name },
    { label: "Current Dose", value: `${input.fromDose} mg` },
    { label: "Convert To", value: toData.name },
    { label: "Equivalent Dose", value: `${fmtDose(convertedDose)} mg` },
    { label: "From Potency (vs Hydrocortisone)", value: `${fromData.antiInflammatoryPotency}×` },
    { label: "To Potency (vs Hydrocortisone)", value: `${toData.antiInflammatoryPotency}×` },
    { label: "From Class / Half-Life", value: `${fromData.type} · ${fromData.halfLife}` },
    { label: "To Class / Half-Life", value: `${toData.type} · ${toData.halfLife}` },
  ];

  const summaryStats = [
    { label: "Equivalent Dose", value: `${fmtDose(convertedDose)} mg` },
    { label: "Target Steroid", value: toData.name },
    { label: "Source Dose", value: `${input.fromDose} mg ${fromData.name}` },
    { label: "Potency Ratio", value: `${(toData.antiInflammatoryPotency / fromData.antiInflammatoryPotency).toFixed(1)}×` },
    { label: "From Half-Life", value: fromData.halfLife },
    { label: "To Half-Life", value: toData.halfLife },
  ];

  return { convertedDose, fromData, toData, allConversions, chartData, breakdown, summaryStats };
}

const DEFAULTS: SteroidInput = { fromSteroid: "prednisone", fromDose: 40, toSteroid: "dexamethasone" };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SteroidEquivalenceCalculator() {
  const [fromSteroid, setFromSteroid] = useState(DEFAULTS.fromSteroid);
  const [fromDose, setFromDose] = useState(String(DEFAULTS.fromDose));
  const [toSteroid, setToSteroid] = useState(DEFAULTS.toSteroid);
  const [result, setResult] = useState<SteroidResult | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcSteroid({ fromSteroid, fromDose: parse(fromDose, DEFAULTS.fromDose), toSteroid }));
  const reset = () => {
    setFromSteroid(DEFAULTS.fromSteroid);
    setFromDose(String(DEFAULTS.fromDose));
    setToSteroid(DEFAULTS.toSteroid);
    setResult(calcSteroid(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcSteroid(DEFAULTS));
  }, []);

  const swap = () => {
    const nextFrom = toSteroid;
    const nextTo = fromSteroid;
    if (result) setFromDose(fmtDose(result.convertedDose));
    setFromSteroid(nextFrom);
    setToSteroid(nextTo);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Steroid Equivalence</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why do we need to calculate steroid equivalence?", answer: "Different corticosteroids have vastly different potencies — 1 mg of dexamethasone is over 25 times more anti-inflammatory than 1 mg of hydrocortisone. When a patient switches drugs (e.g., IV hospital dose to oral home dose), the exact equivalent must be calculated to avoid under-dosing (disease flare-ups) or over-dosing (severe side effects)." },
    { question: "What is the difference between anti-inflammatory and mineralocorticoid potency?", answer: "Anti-inflammatory potency measures immune suppression and swelling reduction. Mineralocorticoid potency measures how much the drug mimics aldosterone, causing salt and water retention. Prednisone has notable mineralocorticoid effects; dexamethasone has zero, making it safer for patients with fluid-sensitive conditions." },
    { question: "Why does biological half-life matter?", answer: "Half-life dictates how long the drug stays active in tissues. Short-acting steroids (hydrocortisone, 8–12 hours) often need multiple daily doses; long-acting steroids (dexamethasone, 36–54 hours) suppress the immune system for days. Switching between classes requires monitoring for HPA-axis suppression." },
    { question: "Does this apply to topical or inhaled steroids?", answer: "No. This calculator is strictly for systemic (oral or intravenous) corticosteroids. Topical creams and inhaled steroids are absorbed differently and have their own potency classifications that cannot use these systemic ratios." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Steroid Equivalence Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Steroid Equivalence Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1 block">Convert From</label>
              <select value={fromSteroid} onChange={(e) => setFromSteroid(e.target.value)} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                {Object.entries(STEROID_DB).map(([key, d]) => <option key={key} value={key}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Current Dose</label>
              <div className={inp}><input type="number" value={fromDose} onChange={(e) => setFromDose(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">mg</span></div>
            </div>

            <button onClick={swap} className="self-center w-10 h-10 rounded-full border border-border bg-background hover:bg-secondary flex items-center justify-center text-primary" aria-label="Swap steroids">
              <ArrowLeftRight className="h-4 w-4" />
            </button>

            <div>
              <label className="text-sm font-medium mb-1 block">Convert To</label>
              <select value={toSteroid} onChange={(e) => setToSteroid(e.target.value)} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                {Object.entries(STEROID_DB).map(([key, d]) => <option key={key} value={key}>{d.name}</option>)}
              </select>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <div ref={printRef} className="flex flex-col gap-4">
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Equivalent Dose · {result.toData.name}</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{fmtDose(result.convertedDose)} <span className="text-xl font-bold text-muted-foreground">mg</span></div>
                  <div className="text-sm text-muted-foreground mt-1">Based on {fromDose} mg of {result.fromData.name} · {result.toData.type} · half-life {result.toData.halfLife}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Equivalent Dose", `${fmtDose(result.convertedDose)} mg`], ["Target Potency", `${result.toData.antiInflammatoryPotency}×`], ["Target Class", result.toData.type]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Conversion Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Systemic Equivalents for {fromDose} mg {result.fromData.name}</h3>
                  <table className="w-full text-base"><tbody>
                    {result.allConversions.map((c, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${c.name === result.toData.name ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{c.name}</td>
                        <td className="py-2.5 px-3 text-xs text-muted-foreground">{c.type}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{fmtDose(c.dose)} mg</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Equivalent Dose Comparison</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v} mg`, ""]} />
                      <Bar dataKey="dose" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
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
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Steroid Equivalence</h2>
            <p>Corticosteroids treat severe inflammation, autoimmune disease, asthma exacerbations, and allergic reactions — but not all are created equal. The Steroid Equivalence Calculator converts a dose from one systemic corticosteroid to another while preserving anti-inflammatory potency, using the standard clinical table anchored to hydrocortisone 20 mg as the baseline.</p>
            <h2 className="text-2xl font-bold mb-3">Relative Potency</h2>
            <p>Hydrocortisone has an anti-inflammatory potency of 1×. Prednisone and prednisolone are 4× (5 mg = 20 mg hydrocortisone), methylprednisolone and triamcinolone are 5× (4 mg = 20 mg), and dexamethasone is 25–30× (0.75 mg = 20 mg). The conversion multiplies your dose by the ratio of equivalent doses.</p>
            <h2 className="text-2xl font-bold mb-3">Important Clinical Caveats</h2>
            <p>This tool provides theoretical pharmacokinetic conversions based on standard tables. It is for educational purposes and should not override a physician's judgment about patient-specific absorption, tapering schedules, or HPA-axis suppression risk. Conversions apply only to systemic (oral/IV/IM) corticosteroids, never topical creams or inhaled steroids. Never stop corticosteroids abruptly — adrenal crisis can be fatal.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/steroid-equivalence-calculator" />
          <PopularCalculators exclude="/calculator/steroid-equivalence-calculator" />
        </div>
      </div>
    </>
  );
}
