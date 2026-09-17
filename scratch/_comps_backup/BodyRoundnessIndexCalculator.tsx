"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// ── 1. TypeScript interfaces — no 'any' ──────────────────────────────────
interface BriInputs {
  heightFt: number;
  heightIn: number;
  waistIn: number;
}

interface BriResult {
  bri: number;
  whtr: number;
  heightCm: number;
  waistCm: number;
  category: string;
  categoryTone: "green" | "amber" | "red";
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summary: { label: string; value: string }[];
}

// ── 2. Pure calculation function — zero React, fully typed ───────────────
function calculateBri(inputs: BriInputs): BriResult {
  const totalInches = inputs.heightFt * 12 + inputs.heightIn;
  const heightCm = totalInches * 2.54;
  const waistCm = inputs.waistIn * 2.54;
  const whtr = totalInches > 0 ? inputs.waistIn / totalInches : 0;

  let bri = 0;
  if (totalInches > 0 && inputs.waistIn > 0) {
    const term = Math.pow(inputs.waistIn / (2 * Math.PI), 2) / Math.pow(0.5 * totalInches, 2);
    bri = 364.2 - 365.5 * Math.sqrt(Math.max(0, 1 - term));
  }
  bri = Math.max(0, Math.round(bri * 100) / 100);

  let category = "Healthy range";
  let categoryTone: BriResult["categoryTone"] = "green";
  if (bri < 1) { category = "Very low"; categoryTone = "green"; }
  else if (bri >= 1 && bri < 5) { category = "Healthy range"; categoryTone = "green"; }
  else if (bri >= 5 && bri < 7) { category = "Elevated risk"; categoryTone = "amber"; }
  else { category = "High risk"; categoryTone = "red"; }

  const fill = categoryTone === "green" ? "#10b981" : categoryTone === "amber" ? "#f59e0b" : "#ef4444";

  const breakdown = [
    { label: "Height", value: `${inputs.heightFt}'${inputs.heightIn}" (${Math.round(heightCm)} cm)` },
    { label: "Waist Circumference", value: `${inputs.waistIn}" (${Math.round(waistCm)} cm)` },
    { label: "Waist-to-Height Ratio", value: whtr.toFixed(2), highlight: true },
    { label: "Body Roundness Index (BRI)", value: bri.toFixed(2), highlight: true },
    { label: "Risk Category", value: category },
    { label: "Suggested Range (Healthy)", value: "1.0 – 4.9" },
  ];

  const summary = [
    { label: "Height", value: `${inputs.heightFt}'${inputs.heightIn}"` },
    { label: "Waist", value: `${inputs.waistIn}"` },
    { label: "Waist-to-Height Ratio", value: whtr.toFixed(2) },
    { label: "BRI Score", value: bri.toFixed(2) },
    { label: "Risk Category", value: category },
    { label: "Target BRI", value: "1.0 – 4.9" },
  ];

  return { bri, whtr, heightCm, waistCm, category, categoryTone, chartData: [{ name: "BRI", value: Math.min(10, bri), fill }], breakdown, summary };
}

// ── 3. DEFAULTS object — realistic values ────────────────────────────────
const DEFAULTS: BriInputs = { heightFt: 5, heightIn: 10, waistIn: 34 };

// ── Shared UI helpers (typed, no 'any') ──────────────────────────────────
interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  min?: string;
  error?: string;
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix, min, error }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">{label}</label>
    <div className={`relative w-full flex items-center rounded-md border bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${error ? "border-red-500" : "border-input"}`}>
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input
        id={id}
        type="number"
        min={min}
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
    {error && <p className="text-[11px] text-red-500 font-medium mt-1">{error}</p>}
  </div>
);

interface ChartTooltipProps {
  active?: boolean;
  payload?: { name?: string | number; value?: number | string }[];
}

const ChartTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  return (
    <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
      <p className="font-bold text-muted-foreground mb-0.5">{String(p.name)}</p>
      <p className="text-primary font-extrabold text-sm">{typeof p.value === "number" ? p.value.toFixed(2) : String(p.value)}</p>
    </div>
  );
};

// ── 4. Component ─────────────────────────────────────────────────────────
export default function BodyRoundnessIndexCalculator() {
  const [heightFt, setHeightFt] = useState(String(DEFAULTS.heightFt));
  const [heightIn, setHeightIn] = useState(String(DEFAULTS.heightIn));
  const [waistIn, setWaistIn] = useState(String(DEFAULTS.waistIn));
  const [results, setResults] = useState<BriResult>(() => calculateBri(DEFAULTS));

  const getInputs = (): BriInputs => ({
    heightFt: parseFloat(heightFt) || 0,
    heightIn: parseFloat(heightIn) || 0,
    waistIn: parseFloat(waistIn) || 0,
  });

  useEffect(() => {
    setResults(calculateBri(getInputs()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valErrors: Record<string, string> = {};
  const totalInches = (parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0);
  if ((parseFloat(heightFt) || 0) < 3 || (parseFloat(heightFt) || 0) > 8) valErrors.heightFt = "Height must be 3–8 ft";
  if ((parseFloat(heightIn) || 0) < 0 || (parseFloat(heightIn) || 0) > 11) valErrors.heightIn = "Inches must be 0–11";
  if (totalInches <= 0) valErrors.heightFt = "Height must be greater than 0";
  if ((parseFloat(waistIn) || 0) <= 10 || (parseFloat(waistIn) || 0) > 80) valErrors.waistIn = "Waist must be 10–80 in";
  const hasErrors = Object.keys(valErrors).length > 0;

  const calc = () => {
    if (hasErrors) return;
    setResults(calculateBri(getInputs()));
  };

  const reset = () => {
    setHeightFt(String(DEFAULTS.heightFt));
    setHeightIn(String(DEFAULTS.heightIn));
    setWaistIn(String(DEFAULTS.waistIn));
    setResults(calculateBri(DEFAULTS));
  };

  const handlePrint = () => window.print();
  const toneText = results.categoryTone === "green" ? "text-emerald-600" : results.categoryTone === "amber" ? "text-amber-600" : "text-red-600";

  const faqs = [
    {
      question: "What is the Body Roundness Index (BRI)?",
      answer: "BRI estimates body shape — how round you are — using only waist circumference and height. Unlike BMI, which uses total weight, BRI captures where fat is stored. Waist fat (central adiposity) is the pattern most strongly linked to cardiovascular and metabolic risk, which is why BRI is gaining attention as a complement to BMI.",
    },
    {
      question: "What is the BRI formula?",
      answer: "BRI = 364.2 − 365.5 × √(1 − (waist ÷ (2π))² ÷ (0.5 × height)²), with waist and height in the same units. The term inside the square root measures how much the waist circumference deviates from a perfect circle of the same height, so a larger waist relative to height raises the score.",
    },
    {
      question: "What is a healthy BRI?",
      answer: "Published research generally treats a BRI of about 1 to 5 as a healthy range, with scores above 5 indicating elevated and above 7 high cardiometabolic risk. BRI is an indicator, not a diagnosis — treat it as a screening signal alongside your doctor's assessment of blood pressure, lipids, and glucose.",
    },
  ];

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
        }
      `}</style>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator/health" }, { label: "Body Roundness Index Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Body Roundness Index Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="height-ft" label="Height (ft)" value={heightFt} onChange={setHeightFt} suffix="ft" min="3" error={valErrors.heightFt} />
              <CompactInput id="height-in" label="Height (in)" value={heightIn} onChange={setHeightIn} suffix="in" min="0" error={valErrors.heightIn} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="waist" label="Waist Circumference" value={waistIn} onChange={setWaistIn} suffix="in" min="10" error={valErrors.waistIn} />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calc}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"}`}
              >Calculate</button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {hasErrors && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">
                ⚠️ Please fix the errors above before calculating.
              </div>
            )}
          </div>

          {/* RIGHT — RESULTS */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start print-section">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Body Roundness Index</div>
              <div className="text-4xl font-bold text-primary tracking-tight">{results.bri.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1 font-medium">
                {results.category} — healthy range is roughly 1.0–4.9.
              </div>
            </div>

            {/* 2. THREE-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Waist-to-Height</span>
                <span className="font-extrabold text-foreground">{results.whtr.toFixed(2)}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Risk Category</span>
                <span className={`font-extrabold ${toneText}`}>{results.category}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Height</span>
                <span className="font-extrabold text-foreground">{Math.round(results.heightCm)} cm</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Measurement</th>
                    <th className="py-2.5 px-3 text-right w-[180px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.breakdown.map((row, idx) => (
                    <tr key={idx} className={`transition-colors ${row.isTotal ? "font-bold bg-secondary/30 border-t-2 border-border" : row.highlight ? "bg-amber-500/10" : "hover:bg-secondary/20"}`}>
                      <td className={`py-2.5 px-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                      <td className={`py-2.5 px-3 text-right ${row.highlight ? "text-amber-700 font-bold" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-base font-bold mb-2">BRI on the Risk Scale</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={results.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} width={30} />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine y={5} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Elevated ≥ 5", position: "insideTopRight", fontSize: 10, fill: "#b45309" }} />
                  <Bar dataKey="value" name="BRI" radius={[6, 6, 0, 0]} barSize={48}>
                    {results.chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[11px] text-muted-foreground mt-2 text-center">Scale 0–10. Scores of 5 and above indicate elevated cardiometabolic risk.</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-3 text-foreground">Summary</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {results.summary.map((row, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{row.label}</span>
                    <span className="text-sm font-extrabold text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Body Roundness Index Calculator?</h2>
            <p>The Body Roundness Index (BRI) is a body-composition metric that uses waist circumference and height to estimate how round your body is — and, by extension, how much fat you carry around your midsection. Research published in JAMA Network Open in 2024 found BRI to be a strong predictor of all-cause mortality, rivaling or exceeding BMI in several analyses. This calculator gives you your BRI instantly and places it on the published risk scale.</p>
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>Enter your height in feet and inches and your waist circumference measured at the navel. The tool converts to centimeters, computes your waist-to-height ratio, then applies the BRI equation. The chart places your score on a 0–10 scale with the elevated-risk threshold marked, and the breakdown table shows every intermediate value so you can verify the math yourself.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The primary number is your BRI, with a category label from Very Low to High Risk. Published reference ranges put a healthy BRI between about 1 and 5; scores of 5–7 are elevated and 7 or higher indicate high cardiometabolic risk. The summary block mirrors the breakdown table, so the headline score, waist-to-height ratio, and category are always consistent. BRI is a screening indicator — use it alongside your physician's overall cardiovascular assessment.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/body-roundness-index-calculator" />
          <PopularCalculators exclude="/calculator/body-roundness-index-calculator" />
        </div>
      </div>
    </>
  );
}
