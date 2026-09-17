"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface StormwaterInputs {
  propertyArea: number;
  imperviousArea: number;
  greenArea: number;
  annualRainfall: number;
  monthlyFee: number;
  captureEfficiency: number;
}

interface StormwaterResult {
  baselineRunoff: number;
  capturedRunoff: number;
  reducedRunoff: number;
  creditPct: number;
  score: number;
  annualFee: number;
  feeSavings: number;
  perviousArea: number;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

const GAL_PER_CU_FT = 7.48052;

function calcStormwater(inputs: StormwaterInputs): StormwaterResult {
  const perviousArea = Math.max(0, inputs.propertyArea - inputs.imperviousArea);
  const rainDepthFt = inputs.annualRainfall / 12;
  const baselineRunoff = inputs.imperviousArea * rainDepthFt * GAL_PER_CU_FT;
  const capturedRunoff = inputs.greenArea * rainDepthFt * GAL_PER_CU_FT * (inputs.captureEfficiency / 100);
  const reducedRunoff = Math.max(0, baselineRunoff - capturedRunoff);
  const creditPct = baselineRunoff > 0 ? Math.min(100, (capturedRunoff / baselineRunoff) * 100) : 0;
  const score = creditPct;
  const annualFee = inputs.monthlyFee * 12;
  const feeSavings = annualFee * (creditPct / 100);

  const chartData = [
    { name: "Baseline Runoff", value: Math.round(baselineRunoff / 1000), fill: "#94a3b8" },
    { name: "Runoff with Green Infrastructure", value: Math.round(reducedRunoff / 1000), fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Property Area", value: `${inputs.propertyArea.toLocaleString()} sq ft` },
    { label: "Impervious Area", value: `${inputs.imperviousArea.toLocaleString()} sq ft` },
    { label: "Green Infrastructure Area", value: `${inputs.greenArea.toLocaleString()} sq ft` },
    { label: "Annual Rainfall", value: `${inputs.annualRainfall} in` },
    { label: "Baseline Runoff", value: `${(baselineRunoff / 1000).toFixed(0)}K gal/yr`, highlight: true },
    { label: "Runoff Captured", value: `${(capturedRunoff / 1000).toFixed(0)}K gal/yr` },
    { label: "Net Runoff", value: `${(reducedRunoff / 1000).toFixed(0)}K gal/yr` },
    { label: "Stormwater Credit", value: `${creditPct.toFixed(1)}%`, highlight: true },
    { label: "Annual Stormwater Fee", value: `$${annualFee.toLocaleString()}` },
    { label: "Annual Fee Savings", value: `$${feeSavings.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, highlight: true },
  ];

  const summaryStats = [
    { label: "Stormwater Credit", value: `${creditPct.toFixed(1)}%` },
    { label: "Baseline Runoff", value: `${(baselineRunoff / 1000).toFixed(0)}K gal/yr` },
    { label: "Net Runoff", value: `${(reducedRunoff / 1000).toFixed(0)}K gal/yr` },
    { label: "Annual Fee", value: `$${annualFee.toLocaleString()}` },
    { label: "Annual Fee Savings", value: `$${feeSavings.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Capture Efficiency", value: `${inputs.captureEfficiency}%` },
  ];

  return { baselineRunoff, capturedRunoff, reducedRunoff, creditPct, score, annualFee, feeSavings, perviousArea, chartData, breakdown, summaryStats };
}

const DEFAULTS: StormwaterInputs = { propertyArea: 10000, imperviousArea: 7000, greenArea: 1000, annualRainfall: 40, monthlyFee: 25, captureEfficiency: 90 };

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}

const CompactInput = ({ id, label, value, onChange, suffix }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
    <p className="font-bold text-muted-foreground mb-0.5">{label}</p>
    <p className="text-primary font-extrabold text-sm">{payload[0].value.toLocaleString("en-US", { maximumFractionDigits: 0 })}K gal/yr</p>
  </div>
) : null;

export default function StormwaterCreditScoreCalculator() {
  const [propertyArea, setPropertyArea] = useState("10000");
  const [imperviousArea, setImperviousArea] = useState("7000");
  const [greenArea, setGreenArea] = useState("1000");
  const [annualRainfall, setAnnualRainfall] = useState("40");
  const [monthlyFee, setMonthlyFee] = useState("25");
  const [captureEfficiency, setCaptureEfficiency] = useState("90");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<StormwaterResult | null>(null);

  const calculate = () =>
    setResult(calcStormwater({
      propertyArea: parseFloat(propertyArea) || 0,
      imperviousArea: parseFloat(imperviousArea) || 0,
      greenArea: parseFloat(greenArea) || 0,
      annualRainfall: parseFloat(annualRainfall) || 0,
      monthlyFee: parseFloat(monthlyFee) || 0,
      captureEfficiency: parseFloat(captureEfficiency) || 0,
    }));
  const reset = () => { setPropertyArea(DEFAULTS.propertyArea.toString()); setImperviousArea(DEFAULTS.imperviousArea.toString()); setGreenArea(DEFAULTS.greenArea.toString()); setAnnualRainfall(DEFAULTS.annualRainfall.toString()); setMonthlyFee(DEFAULTS.monthlyFee.toString()); setCaptureEfficiency(DEFAULTS.captureEfficiency.toString()); setShowAdvanced(false); calculate(); };
  useEffect(() => { calculate(); }, []);

  const faqs = [
    { question: "What is a stormwater credit score?", answer: "Stormwater utilities charge property owners based on the runoff their land generates, typically from impervious surfaces. A stormwater credit rewards practices — rain gardens, green roofs, permeable pavement, cisterns — that reduce that runoff. The credit score here is the percentage reduction in annual runoff your green infrastructure achieves." },
    { question: "How is runoff volume calculated?", answer: "Runoff is rainfall depth times the area that sheds it. One inch of rain on one square foot of impervious surface produces about 0.62 gallons of runoff. Multiplying by 7.48 gallons per cubic foot converts the volume: 7,000 sq ft × (40 in ÷ 12) × 7.48 ≈ 174,500 gallons a year." },
    { question: "What practices earn stormwater credits?", answer: "Common credit-generating practices include bioretention and rain gardens, green roofs, permeable pavement, rainwater harvesting, and tree canopy. Most programs cap total credits at 50–100% of the impervious-area runoff and require maintenance documentation." },
    { question: "Do credits reduce my stormwater bill?", answer: "Yes — the fee savings in this calculator is your annual stormwater fee multiplied by your credit percentage. A 40% credit on a $300 annual fee saves $120 a year. Some programs also allow credits to be sold or transferred within a service area." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Construction", href: "/calculator/construction" }, { label: "Stormwater Credit Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Stormwater Credit Score Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="property" label="Property Area" value={propertyArea} onChange={setPropertyArea} suffix="sq ft" />
              <CompactInput id="impervious" label="Impervious Area" value={imperviousArea} onChange={setImperviousArea} suffix="sq ft" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="green" label="Green Infrastructure Area" value={greenArea} onChange={setGreenArea} suffix="sq ft" />
              <CompactInput id="rain" label="Annual Rainfall" value={annualRainfall} onChange={setAnnualRainfall} suffix="in" />
            </div>
            <CompactInput id="fee" label="Monthly Stormwater Fee" value={monthlyFee} onChange={setMonthlyFee} suffix="$/mo" />

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-background mt-3">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block font-medium">Performance Assumptions</label>
                    <CompactInput id="efficiency" label="Green Infrastructure Capture Efficiency" value={captureEfficiency} onChange={setCaptureEfficiency} suffix="%" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-1">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Stormwater Credit Score</div>
                <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{result.score.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground font-medium">runoff reduction · ${result.feeSavings.toLocaleString("en-US", { maximumFractionDigits: 2 })} saved on fees each year</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Baseline Runoff", `${(result.baselineRunoff / 1000).toFixed(0)}K gal/yr`], ["Net Runoff", `${(result.reducedRunoff / 1000).toFixed(0)}K gal/yr`], ["Annual Fee Savings", `$${result.feeSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 px-3 ${r.highlight ? "text-amber-700 font-semibold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 px-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Annual Runoff Comparison</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}K`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} />
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
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Stormwater Credits Work</h2>
            <p>Stormwater utilities bill properties by the runoff they shed — and offer credits to owners who reduce it with green infrastructure. The arithmetic is simple: runoff is rainfall depth times impervious area, green infrastructure captures part of that volume, and the captured share becomes your credit. This <strong>stormwater credit score calculator</strong> runs that chain end to end.</p>
            <h2 className="text-2xl font-bold mb-3">The Fee-Savings Angle</h2>
            <p>Credits convert directly into bill reductions. A 1,000 sq ft rain garden on a 7,000 sq ft impervious lot captures roughly 13% of annual runoff at 90% efficiency — worth about $39 a year on a $300 stormwater bill. Over a decade that is meaningful payback for a single installation.</p>
            <h2 className="text-2xl font-bold mb-3">Programs Vary by Municipality</h2>
            <p>Credit formulas, caps, and application requirements differ by utility. This calculator uses a transparent default (rainfall-based capture at 90% efficiency) that you can adjust to your local program. Always confirm the final credit percentage with your stormwater authority before budgeting the savings.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/stormwater-credit-score-calculator" />
          <PopularCalculators exclude="/calculator/stormwater-credit-score-calculator" />
        </div>
      </div>
    </>
  );
}
