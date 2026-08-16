"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface BsaResult {
  mosteller: number;
  dubois: number;
  haycock: number;
  gehan: number;
  average: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcBsa(weightKg: number, heightCm: number): BsaResult {
  // Mosteller formula: sqrt((height_cm * weight_kg) / 3600)
  const mosteller = Math.sqrt((heightCm * weightKg) / 3600);
  // DuBois formula: 0.007184 * weight_kg^0.425 * height_cm^0.725
  const dubois = 0.007184 * Math.pow(weightKg, 0.425) * Math.pow(heightCm, 0.725);
  // Haycock formula: 0.024265 * weight_kg^0.5378 * height_cm^0.3964
  const haycock = 0.024265 * Math.pow(weightKg, 0.5378) * Math.pow(heightCm, 0.3964);
  // Gehan and George formula: 0.0235 * weight_kg^0.51456 * height_cm^0.42246
  const gehan = 0.0235 * Math.pow(weightKg, 0.51456) * Math.pow(heightCm, 0.42246);
  const average = (mosteller + dubois + haycock + gehan) / 4;

  return {
    mosteller,
    dubois,
    haycock,
    gehan,
    average,
    chartData: [
      { name: "Mosteller", value: +mosteller.toFixed(3) },
      { name: "DuBois", value: +dubois.toFixed(3) },
      { name: "Haycock", value: +haycock.toFixed(3) },
      { name: "Gehan", value: +gehan.toFixed(3) },
    ],
    breakdown: [
      { label: "Weight", value: `${weightKg} kg` },
      { label: "Height", value: `${heightCm} cm` },
      { label: "Mosteller", value: `${mosteller.toFixed(3)} m²` },
      { label: "DuBois", value: `${dubois.toFixed(3)} m²` },
      { label: "Haycock", value: `${haycock.toFixed(3)} m²` },
      { label: "Gehan & George", value: `${gehan.toFixed(3)} m²` },
      { label: "Average of Formulas", value: `${average.toFixed(3)} m²` },
      { label: "Typical Adult Range", value: "1.7–1.9 m²" },
    ],
    summaryStats: [
      { label: "Mosteller", value: `${mosteller.toFixed(3)} m²` },
      { label: "DuBois", value: `${dubois.toFixed(3)} m²` },
      { label: "Haycock", value: `${haycock.toFixed(3)} m²` },
      { label: "Gehan & George", value: `${gehan.toFixed(3)} m²` },
      { label: "Average", value: `${average.toFixed(3)} m²` },
      { label: "BSA Index (per m²)", value: `${(weightKg / average).toFixed(1)} kg/m²` },
    ],
  };
}

const DEFAULTS = { weight: "70", height: "175", unit: "metric" as "metric" | "imperial" };

export default function BodySurfaceAreaCalculator() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">(DEFAULTS.unit);
  const [result, setResult] = useState<BsaResult>(() => calcBsa(70, 175));

  const calculate = () => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    const weightKg = unitSystem === "imperial" ? w * 0.453592 : w;
    const heightCm = unitSystem === "imperial" ? h * 2.54 : h;
    setResult(calcBsa(weightKg, heightCm));
  };
  const reset = () => { setWeight(DEFAULTS.weight); setHeight(DEFAULTS.height); setUnitSystem(DEFAULTS.unit); setResult(calcBsa(70, 175)); };
  useEffect(() => { setResult(calcBsa(70, 175)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is Body Surface Area (BSA)?", answer: "Body Surface Area is the measured or calculated surface area of a human body. It is generally considered a more accurate indicator of metabolic mass than body weight alone." },
    { question: "Why is BSA used in medicine?", answer: "BSA is widely used in clinical settings to calculate dosages for medications with a narrow therapeutic index, such as chemotherapy drugs, and to assess cardiac index and renal function (GFR)." },
    { question: "Which BSA formula is best?", answer: "The Mosteller formula is the most widely used today due to its simplicity and accuracy across different body types. The DuBois formula is the oldest and also very common in clinical research." },
    { question: "Why do the formulas give slightly different answers?", answer: "Each formula was derived from a different reference population, so they differ by a few percent. The average of the four is the most robust estimate; the variation itself is small enough to be clinically insignificant." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Body Surface Area Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Body Surface Area Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Unit System</label>
              <div className="grid grid-cols-2 gap-2 rounded-md border border-input p-1 bg-background">
                <button onClick={() => setUnitSystem("metric")} className={`h-9 rounded-md text-sm font-semibold transition-colors ${unitSystem === "metric" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Metric (kg/cm)</button>
                <button onClick={() => setUnitSystem("imperial")} className={`h-9 rounded-md text-sm font-semibold transition-colors ${unitSystem === "imperial" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Imperial (lb/in)</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Weight ({unitSystem === "imperial" ? "lb" : "kg"})</label>
                <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} min={0} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Height ({unitSystem === "imperial" ? "in" : "cm"})</label>
                <div className={inp}><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={ci} min={0} /></div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Body Surface Area (Mosteller)</div>
              <div className="text-4xl font-extrabold text-primary">{result.mosteller.toFixed(3)} m²</div>
              <div className="text-sm text-muted-foreground mt-1">Average of all formulas: {result.average.toFixed(3)} m² · Typical adult: 1.7–1.9 m²</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["DuBois", `${result.dubois.toFixed(3)} m²`], ["Haycock", `${result.haycock.toFixed(3)} m²`], ["Gehan", `${result.gehan.toFixed(3)} m²`]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Formula Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 text-right font-semibold">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">BSA by Formula</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, "auto"]} tickFormatter={(v: number) => `${v} m²`} />
                  <Tooltip formatter={(v: number) => [`${v} m²`, "BSA"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
                    {result.chartData.map((_, i) => <Cell key={i} fill={i === 0 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.35)"} />)}
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
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Importance of Body Surface Area</h2>
            <p>While Body Mass Index (BMI) is useful for population-level health screening, Body Surface Area (BSA) is critical for precise medical dosing and physiological assessment.</p>
            <h3>Why Not Just Use Weight?</h3>
            <p>Adipose (fat) tissue is less metabolically active than lean muscle. Therefore, a purely weight-based drug dose might overdose an obese patient and underdose a muscular one. BSA provides a better estimate of metabolic mass and cardiac output.</p>
            <h3>Clinical Applications</h3>
            <p>BSA is routinely used to calculate doses for chemotherapy, glucocorticoids, and pediatric medications. It is also used to index cardiac output (Cardiac Index) and renal function (GFR) to a standardized body size.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/body-surface-area-calculator" />
          <PopularCalculators exclude="/calculator/body-surface-area-calculator" />
        </div>
      </div>
    </>
  );
}
