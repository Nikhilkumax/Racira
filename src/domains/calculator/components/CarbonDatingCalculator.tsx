"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, FlaskConical } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CarbonResult {
  ageYears: number;
  halfLives: number;
  remainingPct: number;
  initialPct: number;
  halflife: number;
  chartData: { years: number; remaining: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcCarbon(remainingInput: number, initialInput: number, halflifeInput: number): CarbonResult {
  const remainingPct = Math.max(0, Math.min(100, remainingInput));
  const initialPct = Math.max(0.0001, initialInput);
  const halflife = Math.max(1, halflifeInput);

  const fraction = remainingPct / initialPct;
  const halfLives = fraction > 0 ? Math.log(initialPct / remainingPct) / Math.log(2) : Number.POSITIVE_INFINITY;
  const ageYears = Number.isFinite(halfLives) ? halfLives * halflife : 999999;

  const chartData: { years: number; remaining: number }[] = [];
  for (let hl = 0; hl <= 5; hl += 0.25) {
    chartData.push({ years: hl * halflife, remaining: Math.max(0, 100 * Math.pow(0.5, hl)) });
  }

  const breakdown = [
    { label: "Carbon-14 Remaining", value: `${remainingPct.toFixed(2)}%` },
    { label: "Initial Carbon-14", value: `${initialPct.toFixed(2)}%` },
    { label: "Half-Life Used", value: `${halflife.toLocaleString()} years` },
    { label: "Elapsed Half-Lives", value: `${halfLives.toFixed(2)} t½` },
    { label: "Estimated Age", value: Number.isFinite(ageYears) ? `${Math.round(ageYears).toLocaleString()} years` : "> 99,999 years" },
    { label: "Remaining Fraction", value: `${fraction.toFixed(4)} of original` },
  ];

  const summaryStats = [
    { label: "Age (Years)", value: Number.isFinite(ageYears) ? Math.round(ageYears).toLocaleString() : "∞" },
    { label: "Half-Lives Elapsed", value: `${halfLives.toFixed(2)}` },
    { label: "Remaining C-14", value: `${remainingPct.toFixed(1)}%` },
    { label: "Decay Rate (λ)", value: `${(Math.LN2 / halflife).toExponential(3)} /yr` },
    { label: "Remaining Fraction", value: `${fraction.toFixed(3)}` },
    { label: "Standard Error (est.)", value: "± ~5% (lab-dependent)" },
  ];

  return { ageYears, halfLives, remainingPct, initialPct, halflife, chartData, breakdown, summaryStats };
}

const DEFAULTS = { remaining: "50", initial: "100", halflife: "5730" };

const InputField = ({ id, label, value, onChange, suffix }: { id: string; label: string; value: string; onChange: (v: string) => void; suffix?: string }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium mb-1 text-foreground">{label}</label>
    <div className="relative">
      <input
        id={id}
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span>}
    </div>
  </div>
);

export default function CarbonDatingCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<CarbonResult>(() => calcCarbon(50, 100, 5730));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const r = parseFloat(inputs.remaining);
    const i = parseFloat(inputs.initial);
    const h = parseFloat(inputs.halflife);
    if (!isNaN(r) && !isNaN(i) && i > 0 && !isNaN(h) && h > 0) setResult(calcCarbon(r, i, h));
  }, []);

  const set = (k: keyof typeof DEFAULTS) => (v: string) => setInputs((p) => ({ ...p, [k]: v }));
  const reset = () => { setInputs(DEFAULTS); setResult(calcCarbon(parseFloat(DEFAULTS.remaining), parseFloat(DEFAULTS.initial), parseFloat(DEFAULTS.halflife))); };

  const invalid = isNaN(parseFloat(inputs.remaining)) || isNaN(parseFloat(inputs.initial)) || parseFloat(inputs.initial) <= 0 || isNaN(parseFloat(inputs.halflife)) || parseFloat(inputs.halflife) <= 0;

  const faqs = [
    { question: "How does carbon dating work?", answer: "Living organisms constantly absorb carbon-14. When they die, the intake stops and the isotope decays at a known rate (half-life of 5,730 years). By measuring the remaining ratio of carbon-14 to carbon-12, scientists estimate how long ago the organism died." },
    { question: "What is a half-life?", answer: "A half-life is the time it takes for half of the radioactive atoms in a sample to decay. For carbon-14 that is 5,730 years — after one half-life 50% remains, after two 25%, and so on." },
    { question: "How accurate is carbon dating?", answer: "Carbon-14 dating is reliable to roughly 50,000 years. Beyond that, so little carbon-14 remains that measurement error becomes significant. Results are calibrated against tree-ring and other records." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Carbon Dating Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Carbon Dating Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <InputField id="remaining" label="C-14 Remaining (%)" value={inputs.remaining} onChange={set("remaining")} suffix="%" />
              <InputField id="initial" label="Initial C-14 (%)" value={inputs.initial} onChange={set("initial")} suffix="%" />
            </div>
            <InputField id="halflife" label="Half-Life (years)" value={inputs.halflife} onChange={set("halflife")} suffix="yr" />

            <button type="button" onClick={() => setShowAdvanced((s) => !s)} className="text-sm text-primary font-medium text-left hover:underline">
              {showAdvanced ? "Hide" : "Show"} assumptions
            </button>
            {showAdvanced && (
              <div className="border border-border rounded-lg p-3 space-y-2">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Method Notes</div>
                <p className="text-xs text-muted-foreground">Assumes conventional radiocarbon decay t = (ln(N₀/N) / ln 2) × t½. Accelerator mass spectrometry (AMS) is used for very small samples.</p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => {}} disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <FlaskConical className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter valid numbers (initial and half-life must be &gt; 0).</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Estimated Age of Sample</div>
              <div className="text-4xl font-extrabold text-primary">{Number.isFinite(result.ageYears) ? `${Math.round(result.ageYears).toLocaleString()} yr` : "> 99,999 yr"}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.halfLives.toFixed(2)} half-lives elapsed · {result.remainingPct.toFixed(1)}% of C-14 remains</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Remaining</div>
                <div className="text-lg font-bold text-primary">{result.remainingPct.toFixed(1)}%</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Half-Lives</div>
                <div className="text-lg font-bold text-primary">{result.halfLives.toFixed(2)}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Decay Rate λ</div>
                <div className="text-lg font-bold text-primary">{(Math.LN2 / result.halflife).toExponential(2)}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Measurement</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.breakdown.map((row) => (
                    <tr key={row.label}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Carbon-14 Decay Curve</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="years" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${Math.round(v).toLocaleString()}y`} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, "C-14 remaining"]} labelFormatter={(l: number) => `${Math.round(l).toLocaleString()} years`} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Area type="monotone" dataKey="remaining" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2">Vertical dashed reference: your sample&apos;s remaining fraction ({result.remainingPct.toFixed(1)}%).</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {result.summaryStats.map((s) => (
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
            <h2 className="text-2xl font-bold mb-3">About the Carbon Dating Calculator</h2>
            <p>Carbon dating estimates the age of organic material by measuring the radioactive decay of carbon-14, a process captured by the decay equation t = (ln(N₀ / N) ÷ ln 2) × t½ where N₀ is the initial isotope amount, N the amount remaining, and t½ the half-life (5,730 years).</p>
            <h3>What You Can Calculate</h3>
            <ul>
              <li>Estimated age of a sample from its remaining carbon-14.</li>
              <li>How many half-lives have passed since the organism died.</li>
              <li>How much carbon-14 remains at any given age.</li>
            </ul>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/carbon-dating-calculator" />
          <PopularCalculators exclude="/calculator/carbon-dating-calculator" />
        </div>
      </div>
    </>
  );
}
