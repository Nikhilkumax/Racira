"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { RotateCcw } from "lucide-react";

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
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateAltmanZScore = (inputs: typeof DEFAULTS): AltmanZScoreResults => {
  const currentAssets = parseFloat(inputs.currentAssets);
  const currentLiabilities = parseFloat(inputs.currentLiabilities);
  const retainedEarnings = parseFloat(inputs.retainedEarnings);
  const ebit = parseFloat(inputs.ebit);
  const marketValueOfEquity = parseFloat(inputs.marketValueOfEquity);
  const totalLiabilities = parseFloat(inputs.totalLiabilities);
  const totalSales = parseFloat(inputs.totalSales);
  const totalAssets = parseFloat(inputs.totalAssets);
  const companyType = inputs.companyType; // "public_mfg", "private_mfg", "non_mfg"

  if ([currentAssets, currentLiabilities, retainedEarnings, ebit, marketValueOfEquity, totalLiabilities, totalSales, totalAssets].some(v => isNaN(v))) {
    return { zScore: 0, zone: "Distress", zoneColor: "", zoneMessage: "", ratioA: 0, ratioB: 0, ratioC: 0, ratioD: 0, ratioE: 0, chartData: [], isError: true, errorMsg: "All inputs must be valid numbers." };
  }
  if (totalAssets <= 0 || totalLiabilities <= 0) {
    return { zScore: 0, zone: "Distress", zoneColor: "", zoneMessage: "", ratioA: 0, ratioB: 0, ratioC: 0, ratioD: 0, ratioE: 0, chartData: [], isError: true, errorMsg: "Total Assets and Total Liabilities must be greater than zero." };
  }

  const workingCapital = currentAssets - currentLiabilities;
  const A = workingCapital / totalAssets;
  const B = retainedEarnings / totalAssets;
  const C = ebit / totalAssets;
  
  let D = 0;
  let E = 0;
  let zScore = 0;

  if (companyType === "public_mfg") {
    // Original Z-Score for publicly traded manufacturing companies
    D = marketValueOfEquity / totalLiabilities;
    E = totalSales / totalAssets;
    zScore = (1.2 * A) + (1.4 * B) + (3.3 * C) + (0.6 * D) + (1.0 * E);
  } else if (companyType === "private_mfg") {
    // Z'-Score for private manufacturing companies
    // Uses Book Value of Equity instead of Market Value
    const bookValueOfEquity = totalAssets - totalLiabilities;
    D = bookValueOfEquity / totalLiabilities;
    E = totalSales / totalAssets;
    zScore = (0.717 * A) + (0.847 * B) + (3.107 * C) + (0.420 * D) + (0.998 * E);
  } else {
    // Z''-Score for non-manufacturing (public or private) companies
    // Eliminates the Sales/Total Assets ratio (E)
    const bookValueOfEquity = totalAssets - totalLiabilities;
    D = bookValueOfEquity / totalLiabilities;
    E = 0;
    zScore = (6.56 * A) + (3.26 * B) + (6.72 * C) + (1.05 * D);
  }

  let zone: "Safe" | "Grey" | "Distress" = "Distress";
  let zoneColor = "text-destructive";
  let zoneMessage = "";

  if (companyType === "public_mfg") {
    if (zScore >= 2.99) { zone = "Safe"; zoneColor = "text-emerald-500"; zoneMessage = "Low probability of bankruptcy within next 2 years."; }
    else if (zScore >= 1.81) { zone = "Grey"; zoneColor = "text-orange-500"; zoneMessage = "Moderate probability of bankruptcy. Proceed with caution."; }
    else { zone = "Distress"; zoneColor = "text-destructive"; zoneMessage = "High probability of bankruptcy within next 2 years."; }
  } else if (companyType === "private_mfg") {
    if (zScore >= 2.90) { zone = "Safe"; zoneColor = "text-emerald-500"; zoneMessage = "Low probability of bankruptcy within next 2 years."; }
    else if (zScore >= 1.23) { zone = "Grey"; zoneColor = "text-orange-500"; zoneMessage = "Moderate probability of bankruptcy. Proceed with caution."; }
    else { zone = "Distress"; zoneColor = "text-destructive"; zoneMessage = "High probability of bankruptcy within next 2 years."; }
  } else {
    if (zScore >= 2.60) { zone = "Safe"; zoneColor = "text-emerald-500"; zoneMessage = "Low probability of bankruptcy within next 2 years."; }
    else if (zScore >= 1.10) { zone = "Grey"; zoneColor = "text-orange-500"; zoneMessage = "Moderate probability of bankruptcy. Proceed with caution."; }
    else { zone = "Distress"; zoneColor = "text-destructive"; zoneMessage = "High probability of bankruptcy within next 2 years."; }
  }

  // Chart data
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
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  companyType: "public_mfg", // "public_mfg", "private_mfg", "non_mfg"
  currentAssets: "5000000",
  currentLiabilities: "2000000",
  totalAssets: "15000000",
  totalLiabilities: "7000000",
  retainedEarnings: "3000000",
  ebit: "1500000",
  marketValueOfEquity: "10000000",
  totalSales: "12000000",
  showAdvanced: true
};

const CompactInput = ({ id, label, value, onChange, placeholder, prefix, suffix, type = "number", options }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{prefix}</span>}
      {options ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium">
          {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input id={id} type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      )}
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
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
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string | boolean) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    if (key !== 'showAdvanced') {
      const r = calculateAltmanZScore(newInputs);
      if (!r.isError) setResults(r);
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateAltmanZScore(DEFAULTS));
  };

  const faqs = [
    { question: "What is the Altman Z-Score?", answer: "The Altman Z-Score is a financial formula used to predict the likelihood of a company going bankrupt within the next two years. It was developed by Edward Altman in 1968." },
    { question: "How accurate is the Altman Z-Score?", answer: "Historically, the Altman Z-Score has demonstrated roughly an 80% to 90% accuracy rate in predicting corporate bankruptcies one year prior to the event, making it a highly respected tool among investors and analysts." },
    { question: "What does a 'Distress' zone mean?", answer: "A score in the Distress zone (typically below 1.81 for public manufacturing firms) indicates a high probability that the company will face bankruptcy within the next two years if drastic changes are not made." },
    { question: "Why are there different formulas for different company types?", answer: "The original formula was designed specifically for publicly traded manufacturing companies. Private companies don't have a public 'market value of equity,' and non-manufacturing companies have fundamentally different asset turnover ratios, requiring modified formulas (Z' and Z'')." },
    { question: "Can the Z-Score be used for financial companies?", answer: "No, the Altman Z-Score is not suitable for financial companies (like banks or insurance firms) because their balance sheets differ drastically from industrial and commercial firms, making the asset and liability ratios incomparable." }
  ];

  if (!mounted) return null;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Altman Z-Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Altman Z-Score Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <p className="text-sm text-muted-foreground mb-2">Predict corporate bankruptcy risk using financial statement ratios.</p>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="companyType" label="Company Type (Model)" value={inputs.companyType} onChange={(v: string) => handleChange("companyType", v)} options={[
                { label: "Public Manufacturing (Original Z-Score)", value: "public_mfg" },
                { label: "Private Manufacturing (Z'-Score)", value: "private_mfg" },
                { label: "Non-Manufacturing (Z''-Score)", value: "non_mfg" }
              ]} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="totalAssets" label="Total Assets" value={inputs.totalAssets} onChange={(v: string) => handleChange("totalAssets", v)} prefix="$" />
              <CompactInput id="totalLiabilities" label="Total Liabilities" value={inputs.totalLiabilities} onChange={(v: string) => handleChange("totalLiabilities", v)} prefix="$" />
              <CompactInput id="currentAssets" label="Current Assets" value={inputs.currentAssets} onChange={(v: string) => handleChange("currentAssets", v)} prefix="$" />
              <CompactInput id="currentLiabilities" label="Current Liabilities" value={inputs.currentLiabilities} onChange={(v: string) => handleChange("currentLiabilities", v)} prefix="$" />
            </div>

            <div className="border-t border-border mt-2 pt-4">
              <button onClick={() => handleChange("showAdvanced", !inputs.showAdvanced)} className="flex items-center justify-between w-full text-sm font-semibold text-foreground hover:text-primary transition-colors">
                <span>Additional Financial Data</span>
                <span className="text-muted-foreground">{inputs.showAdvanced ? "▼" : "▶"}</span>
              </button>
              
              {inputs.showAdvanced && (
                <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                  <CompactInput id="retainedEarnings" label="Retained Earnings" value={inputs.retainedEarnings} onChange={(v: string) => handleChange("retainedEarnings", v)} prefix="$" />
                  <CompactInput id="ebit" label="EBIT" value={inputs.ebit} onChange={(v: string) => handleChange("ebit", v)} prefix="$" />
                  {inputs.companyType === "public_mfg" && (
                    <CompactInput id="marketValueOfEquity" label="Market Value of Equity" value={inputs.marketValueOfEquity} onChange={(v: string) => handleChange("marketValueOfEquity", v)} prefix="$" />
                  )}
                  {inputs.companyType !== "non_mfg" && (
                    <CompactInput id="totalSales" label="Total Sales" value={inputs.totalSales} onChange={(v: string) => handleChange("totalSales", v)} prefix="$" />
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </div>

          {/* RIGHT fluid */}
          <div id="results-section" className="flex flex-col gap-4">
            {results.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative overflow-hidden shadow-sm mb-4">
                    <p className="text-xs uppercase tracking-wide text-primary mb-1 font-bold">Altman Z-Score</p>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-foreground tracking-tighter">{results.zScore}</div>
                    </div>
                  </div>

                  <div className={`bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm border-l-4 ${results.zone === 'Safe' ? 'border-emerald-500' : (results.zone === 'Grey' ? 'border-orange-500' : 'border-destructive')}`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Financial Health Zone</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className={`text-4xl font-black tracking-tighter ${results.zoneColor}`}>{results.zone}</div>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium mt-1 leading-tight">{results.zoneMessage}</div>
                  </div>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Financial Ratios Breakdown</h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 'bold'}} axisLine={false} tickLine={false} width={100} />
                        <RechartsTooltip cursor={{fill: 'hsl(var(--muted)/0.5)'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Formula Components</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Component</th>
                          <th className="px-4 py-3 font-semibold">Description</th>
                          <th className="px-4 py-3 font-semibold text-right">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-bold text-foreground">A</td>
                          <td className="px-4 py-3 text-muted-foreground">Working Capital / Total Assets</td>
                          <td className="px-4 py-3 text-right font-medium">{results.ratioA}</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-bold text-foreground">B</td>
                          <td className="px-4 py-3 text-muted-foreground">Retained Earnings / Total Assets</td>
                          <td className="px-4 py-3 text-right font-medium">{results.ratioB}</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-bold text-foreground">C</td>
                          <td className="px-4 py-3 text-muted-foreground">EBIT / Total Assets</td>
                          <td className="px-4 py-3 text-right font-medium">{results.ratioC}</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-bold text-foreground">D</td>
                          <td className="px-4 py-3 text-muted-foreground">Equity / Total Liabilities</td>
                          <td className="px-4 py-3 text-right font-medium">{results.ratioD}</td>
                        </tr>
                        {inputs.companyType !== "non_mfg" && (
                          <tr className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 font-bold text-foreground">E</td>
                            <td className="px-4 py-3 text-muted-foreground">Total Sales / Total Assets</td>
                            <td className="px-4 py-3 text-right font-medium">{results.ratioE}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is the Altman Z-Score?</h2>
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
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/altman-z-score-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
