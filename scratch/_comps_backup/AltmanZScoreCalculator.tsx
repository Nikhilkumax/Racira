"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { RotateCcw, ChevronDown, Printer } from "lucide-react";
import { LazyView } from "@/components/ui/LazyView";

// 1. TypeScript interfaces
interface AltmanZScoreResults {
  zScore: number;
  zone: "Safe" | "Grey" | "Distress";
  zoneColor: string;
  zoneMessage: string;
  ratioA: number;
  ratioB: number;
  ratioC: number;
  ratioD: number;
  ratioE: number;
  chartData: { name: string; value: number }[];
  isError: boolean;
  errorMsg?: string;
}

// 3. DEFAULTS object
const DEFAULTS = {
  companyType: "public_mfg",
  currentAssets: "5000000",
  currentLiabilities: "2000000",
  totalAssets: "15000000",
  totalLiabilities: "7000000",

  showAdvanced: false,
  retainedEarnings: "3000000",
  ebit: "1500000",
  marketValueOfEquity: "10000000",
  totalSales: "12000000",
};

// 2. Pure calculation function
const calculateAltmanZScore = (inputs: typeof DEFAULTS): AltmanZScoreResults => {
  const currentAssets = parseFloat(inputs.currentAssets) || 0;
  const currentLiabilities = parseFloat(inputs.currentLiabilities) || 0;
  const retainedEarnings = parseFloat(inputs.retainedEarnings) || 0;
  const ebit = parseFloat(inputs.ebit) || 0;
  const marketValueOfEquity = parseFloat(inputs.marketValueOfEquity) || 0;
  const totalLiabilities = parseFloat(inputs.totalLiabilities) || 0;
  const totalSales = parseFloat(inputs.totalSales) || 0;
  const totalAssets = parseFloat(inputs.totalAssets) || 0;
  const companyType = inputs.companyType;

  if (totalAssets <= 0 || totalLiabilities <= 0) {
    return { zScore: 0, zone: "Distress", zoneColor: "text-destructive", zoneMessage: "", ratioA: 0, ratioB: 0, ratioC: 0, ratioD: 0, ratioE: 0, chartData: [], isError: true, errorMsg: "Total Assets and Total Liabilities must be greater than zero." };
  }

  const workingCapital = currentAssets - currentLiabilities;
  const A = workingCapital / totalAssets;
  const B = retainedEarnings / totalAssets;
  const C = ebit / totalAssets;

  let D = 0;
  let E = 0;
  let zScore = 0;

  if (companyType === "public_mfg") {
    D = marketValueOfEquity / totalLiabilities;
    E = totalSales / totalAssets;
    zScore = 1.2 * A + 1.4 * B + 3.3 * C + 0.6 * D + 1.0 * E;
  } else if (companyType === "private_mfg") {
    const bookValueOfEquity = totalAssets - totalLiabilities;
    D = bookValueOfEquity / totalLiabilities;
    E = totalSales / totalAssets;
    zScore = 0.717 * A + 0.847 * B + 3.107 * C + 0.42 * D + 0.998 * E;
  } else {
    const bookValueOfEquity = totalAssets - totalLiabilities;
    D = bookValueOfEquity / totalLiabilities;
    E = 0;
    zScore = 6.56 * A + 3.26 * B + 6.72 * C + 1.05 * D;
  }

  let zone: "Safe" | "Grey" | "Distress" = "Distress";
  let zoneColor = "text-destructive";
  let zoneMessage = "";

  if (companyType === "public_mfg") {
    if (zScore >= 2.99) { zone = "Safe"; zoneColor = "text-emerald-500"; zoneMessage = "Low probability of bankruptcy within next 2 years."; }
    else if (zScore >= 1.81) { zone = "Grey"; zoneColor = "text-orange-500"; zoneMessage = "Moderate probability of bankruptcy. Proceed with caution."; }
    else { zone = "Distress"; zoneColor = "text-destructive"; zoneMessage = "High probability of bankruptcy within next 2 years."; }
  } else if (companyType === "private_mfg") {
    if (zScore >= 2.9) { zone = "Safe"; zoneColor = "text-emerald-500"; zoneMessage = "Low probability of bankruptcy within next 2 years."; }
    else if (zScore >= 1.23) { zone = "Grey"; zoneColor = "text-orange-500"; zoneMessage = "Moderate probability of bankruptcy. Proceed with caution."; }
    else { zone = "Distress"; zoneColor = "text-destructive"; zoneMessage = "High probability of bankruptcy within next 2 years."; }
  } else {
    if (zScore >= 2.6) { zone = "Safe"; zoneColor = "text-emerald-500"; zoneMessage = "Low probability of bankruptcy within next 2 years."; }
    else if (zScore >= 1.1) { zone = "Grey"; zoneColor = "text-orange-500"; zoneMessage = "Moderate probability of bankruptcy. Proceed with caution."; }
    else { zone = "Distress"; zoneColor = "text-destructive"; zoneMessage = "High probability of bankruptcy within next 2 years."; }
  }

  const chartData = [
    { name: "A: WC/Assets", value: Number(A.toFixed(4)) },
    { name: "B: RE/Assets", value: Number(B.toFixed(4)) },
    { name: "C: EBIT/Assets", value: Number(C.toFixed(4)) },
    { name: "D: Equity/Liab", value: Number(D.toFixed(4)) },
  ];
  if (companyType !== "non_mfg") {
    chartData.push({ name: "E: Sales/Assets", value: Number(E.toFixed(4)) });
  }

  return {
    zScore: Number(zScore.toFixed(2)),
    zone,
    zoneColor,
    zoneMessage,
    ratioA: Number(A.toFixed(4)),
    ratioB: Number(B.toFixed(4)),
    ratioC: Number(C.toFixed(4)),
    ratioD: Number(D.toFixed(4)),
    ratioE: Number(E.toFixed(4)),
    chartData,
    isError: false,
  };
};

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  type = "number",
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
  options?: { label: string; value: string }[];
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1 text-foreground">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      {options ? (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground font-medium"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
        />
      )}
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function AltmanZScoreCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<AltmanZScoreResults>(calculateAltmanZScore(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResults(calculateAltmanZScore(DEFAULTS));
  }, []);

  const handleCalculate = () => setResults(calculateAltmanZScore(inputs));
  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateAltmanZScore(DEFAULTS));
  };
  const updateVal = (key: keyof typeof DEFAULTS, val: string | boolean) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const faqs = [
    { question: "What is the Altman Z-Score?", answer: "The Altman Z-Score is a financial formula used to predict the likelihood of a company going bankrupt within the next two years. It was developed by Edward Altman in 1968." },
    { question: "How accurate is the Altman Z-Score?", answer: "Historically, the Altman Z-Score has demonstrated roughly an 80% to 90% accuracy rate in predicting corporate bankruptcies one year prior to the event, making it a highly respected tool among investors and analysts." },
    { question: "What does a 'Distress' zone mean?", answer: "A score in the Distress zone (typically below 1.81 for public manufacturing firms) indicates a high probability that the company will face bankruptcy within the next two years if drastic changes are not made." },
    { question: "Why are there different formulas for different company types?", answer: "The original formula was designed specifically for publicly traded manufacturing companies. Private companies don't have a public 'market value of equity,' and non-manufacturing companies have fundamentally different asset turnover ratios, requiring modified formulas (Z' and Z'')" },
    { question: "Can the Z-Score be used for financial companies?", answer: "No, the Altman Z-Score is not suitable for financial companies (like banks or insurance firms) because their balance sheets differ drastically from industrial and commercial firms, making the asset and liability ratios incomparable." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Altman Z-Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Altman Z-Score Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT - Inputs */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="totalAssets" label="Total Assets" value={inputs.totalAssets} onChange={(v: string) => updateVal("totalAssets", v)} prefix="$" />
              <CompactInput id="totalLiabilities" label="Total Liabilities" value={inputs.totalLiabilities} onChange={(v: string) => updateVal("totalLiabilities", v)} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="currentAssets" label="Current Assets" value={inputs.currentAssets} onChange={(v: string) => updateVal("currentAssets", v)} prefix="$" />
              <CompactInput id="currentLiabilities" label="Current Liabilities" value={inputs.currentLiabilities} onChange={(v: string) => updateVal("currentLiabilities", v)} prefix="$" />
            </div>

            {/* Advanced Options */}
            <div>
              <button
                type="button"
                onClick={() => updateVal("showAdvanced", !inputs.showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${inputs.showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {inputs.showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Company Model</div>
                    <CompactInput
                      id="companyType"
                      label="Company Type"
                      value={inputs.companyType}
                      onChange={(v: string) => updateVal("companyType", v)}
                      options={[
                        { label: "Public Manufacturing (Original Z-Score)", value: "public_mfg" },
                        { label: "Private Manufacturing (Z'-Score)", value: "private_mfg" },
                        { label: "Non-Manufacturing (Z''-Score)", value: "non_mfg" },
                      ]}
                    />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Financial Statement Data</div>
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput id="retainedEarnings" label="Retained Earnings" value={inputs.retainedEarnings} onChange={(v: string) => updateVal("retainedEarnings", v)} prefix="$" />
                      <CompactInput id="ebit" label="EBIT" value={inputs.ebit} onChange={(v: string) => updateVal("ebit", v)} prefix="$" />
                      {inputs.companyType === "public_mfg" && (
                        <CompactInput id="marketValueOfEquity" label="Market Value of Equity" value={inputs.marketValueOfEquity} onChange={(v: string) => updateVal("marketValueOfEquity", v)} prefix="$" />
                      )}
                      {inputs.companyType !== "non_mfg" && (
                        <CompactInput id="totalSales" label="Total Sales" value={inputs.totalSales} onChange={(v: string) => updateVal("totalSales", v)} prefix="$" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 mt-2.5">
              <button
                type="button"
                onClick={handleCalculate}
                className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                onClick={handleReset}
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT - Results */}
          <div className="flex flex-col gap-4">
            {results.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            ) : (
              <>
                {/* Component 1: Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <div className="flex justify-end absolute top-3 right-3">
                    <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                      <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Altman Z-Score</div>
                  <div className="text-4xl font-bold text-primary my-1">{results.zScore}</div>
                  <div className="text-sm text-muted-foreground">
                    <span className={`font-bold ${results.zoneColor}`}>{results.zone}</span> — {results.zoneMessage}
                  </div>
                </div>

                {/* Component 2: 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Zone</div>
                    <div className={`text-lg font-bold ${results.zoneColor}`}>{results.zone}</div>
                  </div>
                  <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Working Capital</div>
                    <div className="text-lg font-bold text-foreground">
                      ${((parseFloat(inputs.currentAssets) || 0) - (parseFloat(inputs.currentLiabilities) || 0)).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Model</div>
                    <div className="text-lg font-bold text-foreground">
                      {inputs.companyType === "public_mfg" ? "Z" : inputs.companyType === "private_mfg" ? "Z'" : "Z''"}
                    </div>
                  </div>
                </div>

                {/* Component 3: Breakdown Table */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Component</th>
                        <th className="p-2.5">Description</th>
                        <th className="p-2.5 pr-3 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      <tr>
                        <td className="text-base py-2.5 px-3 font-bold text-foreground">A</td>
                        <td className="text-base py-2.5 px-3 text-muted-foreground">Working Capital / Total Assets</td>
                        <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">{results.ratioA}</td>
                      </tr>
                      <tr>
                        <td className="text-base py-2.5 px-3 font-bold text-foreground">B</td>
                        <td className="text-base py-2.5 px-3 text-muted-foreground">Retained Earnings / Total Assets</td>
                        <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">{results.ratioB}</td>
                      </tr>
                      <tr className="bg-secondary/20">
                        <td className="text-base py-2.5 px-3 font-bold text-foreground">C</td>
                        <td className="text-base py-2.5 px-3 text-muted-foreground">EBIT / Total Assets</td>
                        <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">{results.ratioC}</td>
                      </tr>
                      <tr>
                        <td className="text-base py-2.5 px-3 font-bold text-foreground">D</td>
                        <td className="text-base py-2.5 px-3 text-muted-foreground">Equity / Total Liabilities</td>
                        <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">{results.ratioD}</td>
                      </tr>
                      {inputs.companyType !== "non_mfg" && (
                        <tr>
                          <td className="text-base py-2.5 px-3 font-bold text-foreground">E</td>
                          <td className="text-base py-2.5 px-3 text-muted-foreground">Total Sales / Total Assets</td>
                          <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">{results.ratioE}</td>
                        </tr>
                      )}
                      <tr className="font-bold border-t-2 border-border">
                        <td className="text-base py-2.5 px-3 text-foreground" colSpan={2}>Z-Score</td>
                        <td className="text-base py-2.5 px-3 text-right text-primary">{results.zScore}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Component 4: Chart */}
                {mounted && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-4">Financial Ratios Breakdown</h3>
                    <LazyView minHeight={250}>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                          <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={110} />
                          <RechartsTooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                            {results.chartData.map((entry, index) => (
                              <Cell key={index} fill={entry.value < 0 ? "#ef4444" : "hsl(var(--primary))"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </LazyView>
                  </div>
                )}

                {/* Component 5: Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Z-Score</span>
                      <span className="text-base font-bold text-primary">{results.zScore}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Zone</span>
                      <span className={`text-base font-bold ${results.zoneColor}`}>{results.zone}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Ratio A (WC/TA)</span>
                      <span className="text-base font-bold text-foreground">{results.ratioA}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Ratio B (RE/TA)</span>
                      <span className="text-base font-bold text-foreground">{results.ratioB}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Ratio C (EBIT/TA)</span>
                      <span className="text-base font-bold text-foreground">{results.ratioC}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Ratio D (E/TL)</span>
                      <span className="text-base font-bold text-foreground">{results.ratioD}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Altman Z-Score</h2>
            <p>The Altman Z-Score is a highly respected, mathematically rigorous financial forecasting tool originally designed to predict the likelihood of a major corporate entity filing for bankruptcy within a two-year horizon. Edward Altman, an esteemed finance professor at New York University, meticulously developed this groundbreaking formula in nineteen sixty-eight. Rather than relying on singular, isolated financial metrics, the Z-Score holistically integrates five distinct, critically important financial ratios entirely derived from a company's public financial statements. By combining these five ratios, the formula provides institutional investors, risk analysts, and corporate lenders with a highly accurate, single-number assessment of a company's overall liquidity, cumulative profitability, operational efficiency, market leverage, and total asset turnover capabilities.</p>

            <h2 className="text-2xl font-bold mb-3">The Mathematical Architecture</h2>
            <p>The original Z-Score formula was engineered specifically and exclusively for publicly traded manufacturing companies. The fundamental mathematical equation is calculated by multiplying five specific ratios by predetermined, heavily weighted coefficients. The first component is Working Capital divided by Total Assets, representing systemic liquidity. The second component is Retained Earnings divided by Total Assets, representing long-term cumulative profitability. The third, and most heavily weighted component, is Earnings Before Interest and Taxes divided by Total Assets, serving as the ultimate metric for pure operating efficiency. The fourth component is the Market Value of Equity divided by Total Liabilities, providing a market-based assessment of leverage. The final component is Total Sales divided by Total Assets, which evaluates how effectively the company utilizes its physical footprint to generate top-line revenue.</p>

            <h2 className="text-2xl font-bold mb-3">Interpreting the Output Zones</h2>
            <p>The final numerical output of the calculator, the Z-Score itself, is useless in isolation; it must be mapped against Altman's empirically derived safety thresholds. If a public manufacturing company scores above a two point nine nine, it enters the Safe Zone, indicating a robust, highly stable financial position with an extremely low statistical probability of facing insolvency. A score falling between one point eight one and two point nine nine places the company in the Grey Zone, an ambiguous territory that demands rigorous, granular investigation by analysts to determine if the company is successfully executing a turnaround or slowly sliding toward failure. Any score mathematically falling below one point eight one immediately triggers a Distress Zone classification, signaling a massive, immediate structural vulnerability and a high statistical probability of catastrophic bankruptcy within twenty-four months.</p>

            <h2 className="text-2xl font-bold mb-3">The Supremacy of Operating Efficiency</h2>
            <p>Within the intricate mathematics of the Altman Z-Score, the third ratio, comparing EBIT to Total Assets, carries a massively disproportionate coefficient of three point three. This deliberate mathematical weighting underscores Professor Altman's fundamental economic belief that a company's pure, unadulterated ability to consistently generate operating earnings from its core assets is the single most critical factor in guaranteeing its long-term survival. A company could possess massive revenue streams or high market valuations, but if its core operations cannot generate sustainable, positive EBIT, the heavy coefficient will ruthlessly drag the overall Z-Score downward, correctly identifying the underlying structural rot that superficial metrics might obscure.</p>

            <h2 className="text-2xl font-bold mb-3">Evolution for Private and Non-Manufacturing Entities</h2>
            <p>Because the original nineteen sixty-eight model was rigidly calibrated strictly for publicly traded manufacturing firms, its strict application to other sectors often yielded wildly inaccurate predictions. To solve this, Altman subsequently engineered two specialized variations. The Z Prime Score was explicitly adapted for private manufacturing firms by entirely replacing the volatile, public "Market Value of Equity" with the more stable "Book Value of Equity," while slightly adjusting the coefficients. Later, the Z Double Prime Score was designed for non-manufacturing service and retail businesses. This specific variation entirely eliminates the Sales to Total Assets ratio, recognizing that service-oriented companies naturally possess exceptionally low asset bases relative to their high sales volumes, which would otherwise mathematically skew their scores into false safety.</p>

            <h2 className="text-2xl font-bold mb-3">Strategic Implementation and Continuous Monitoring</h2>
            <p>Sophisticated institutional investors and hedge fund managers rarely use the Altman Z-Score as a simplistic, one-time screening mechanism. Instead, the true power of the formula is unlocked through rigorous, continuous temporal monitoring. A singular Z-Score in the Safe Zone is encouraging, but a Z-Score that systematically degrades from four point five, to three point two, and then to two point one over three consecutive fiscal quarters is a massive, flashing red alarm. This aggressive downward trajectory indicates rapid financial deterioration, providing analysts with a critical early warning signal to liquidate positions or initiate short strategies well before the company officially breaches the dreaded Distress threshold.</p>

            <h2 className="text-2xl font-bold mb-3">Critical Limitations and Vulnerabilities</h2>
            <p>Despite its proven historical accuracy rate of approximately eighty to ninety percent, the Altman Z-Score possesses severe, undeniable limitations. The formula is fundamentally useless for evaluating financial institutions, such as commercial banks or insurance conglomerates, due to the radically unique structure of their heavily leveraged balance sheets. More importantly, the algorithm is entirely dependent upon the absolute integrity of the underlying accounting data. If a corrupt corporate management team is actively engaged in fraudulent accounting practices, systematically hiding massive liabilities off-balance-sheet or artificially inflating top-line revenue, the Z-Score will unwittingly digest this manipulated data and erroneously output a highly secure score, providing investors with a catastrophic false sense of security right before the company collapses.</p>
          </section>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/altman-z-score-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}