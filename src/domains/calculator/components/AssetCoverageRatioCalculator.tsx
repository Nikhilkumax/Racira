"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { RotateCcw } from "lucide-react";

// 1. TypeScript interfaces
interface AssetCoverageResults {
  assetCoverageRatio: number;
  tangibleAssets: number;
  adjustedCurrentLiabilities: number;
  netTangibleAssets: number;
  zone: string;
  zoneColor: string;
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateAssetCoverage = (inputs: typeof DEFAULTS): AssetCoverageResults => {
  const totalAssets = parseFloat(inputs.totalAssets);
  const intangibleAssets = parseFloat(inputs.intangibleAssets);
  const currentLiabilities = parseFloat(inputs.currentLiabilities);
  const shortTermDebt = parseFloat(inputs.shortTermDebt);
  const totalDebt = parseFloat(inputs.totalDebt);
  const industryType = inputs.industryType; // "industrial" or "utility"

  if ([totalAssets, intangibleAssets, currentLiabilities, shortTermDebt, totalDebt].some(v => isNaN(v) || v < 0)) {
    return { assetCoverageRatio: 0, tangibleAssets: 0, adjustedCurrentLiabilities: 0, netTangibleAssets: 0, zone: "", zoneColor: "", chartData: [], isError: true, errorMsg: "All inputs must be valid positive numbers." };
  }
  if (totalDebt <= 0) {
    return { assetCoverageRatio: 0, tangibleAssets: 0, adjustedCurrentLiabilities: 0, netTangibleAssets: 0, zone: "", zoneColor: "", chartData: [], isError: true, errorMsg: "Total Debt must be greater than 0." };
  }

  // Formula: ((Total Assets - Intangible Assets) - (Current Liabilities - Short-term Debt)) / Total Debt
  const tangibleAssets = totalAssets - intangibleAssets;
  const adjustedCurrentLiabilities = Math.max(0, currentLiabilities - shortTermDebt); // essentially accounts payable and other non-debt current liabilities
  const netTangibleAssets = tangibleAssets - adjustedCurrentLiabilities;
  
  const assetCoverageRatio = netTangibleAssets / totalDebt;

  // Determine Zone based on industry
  let zone = "Poor Coverage";
  let zoneColor = "text-destructive";

  if (industryType === "industrial") {
    // Generally, >= 2.0 is considered good for industrial/manufacturing
    if (assetCoverageRatio >= 2.0) {
      zone = "Strong Coverage";
      zoneColor = "text-emerald-500";
    } else if (assetCoverageRatio >= 1.5) {
      zone = "Adequate Coverage";
      zoneColor = "text-orange-500";
    }
  } else {
    // Utilities have more stable cash flows, so >= 1.5 is considered good
    if (assetCoverageRatio >= 1.5) {
      zone = "Strong Coverage";
      zoneColor = "text-emerald-500";
    } else if (assetCoverageRatio >= 1.2) {
      zone = "Adequate Coverage";
      zoneColor = "text-orange-500";
    }
  }

  // Chart data comparing the available assets vs the debt to cover
  const chartData = [
    {
      name: "Coverage Comparison",
      "Net Tangible Assets": Math.round(netTangibleAssets),
      "Total Debt": Math.round(totalDebt)
    }
  ];

  return {
    assetCoverageRatio: Number(assetCoverageRatio.toFixed(2)),
    tangibleAssets: Math.round(tangibleAssets),
    adjustedCurrentLiabilities: Math.round(adjustedCurrentLiabilities),
    netTangibleAssets: Math.round(netTangibleAssets),
    zone,
    zoneColor,
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  industryType: "industrial",
  totalAssets: "10000000",
  intangibleAssets: "1500000",
  currentLiabilities: "2000000",
  shortTermDebt: "500000",
  totalDebt: "3000000",
  showAdvanced: false
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
export default function AssetCoverageRatioCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<AssetCoverageResults>(calculateAssetCoverage(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string | boolean) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    if (key !== 'showAdvanced') {
      const r = calculateAssetCoverage(newInputs);
      if (!r.isError) setResults(r);
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateAssetCoverage(DEFAULTS));
  };

  const faqs = [
    { question: "What is the Asset Coverage Ratio?", answer: "The Asset Coverage Ratio is a financial metric that measures a company's ability to repay its debt obligations with its tangible assets. It shows how many times a company's assets can cover its debt." },
    { question: "Why are intangible assets excluded?", answer: "Intangible assets (like goodwill, patents, or trademarks) are excluded because they are extremely difficult to value accurately and liquidate quickly in the event of bankruptcy. Lenders want to know the hard, physical value of assets." },
    { question: "Why are current liabilities subtracted?", answer: "Current liabilities (excluding short-term debt) are subtracted because they represent operational obligations (like accounts payable or wages) that must be paid off before assets can be liquidated to pay off bondholders or lenders." },
    { question: "What is a 'good' Asset Coverage Ratio?", answer: "It depends on the industry. For most industrial and manufacturing companies, a ratio of 2.0x or higher is considered safe. For utility companies, which have highly predictable cash flows, a ratio of 1.5x or higher is usually acceptable." },
    { question: "How does this differ from the Debt Ratio?", answer: "The Debt Ratio simply compares total debt to total assets. The Asset Coverage Ratio is more conservative; it strips out intangibles and operational liabilities to give a true picture of liquidation coverage." }
  ];

  if (!mounted) return null;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Asset Coverage Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Asset Coverage Ratio Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <p className="text-sm text-muted-foreground mb-2">Measure how many times a company's tangible assets can cover its debt obligations.</p>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="industryType" label="Industry Type" value={inputs.industryType} onChange={(v: string) => handleChange("industryType", v)} options={[
                { label: "Industrial / Manufacturing / Tech", value: "industrial" },
                { label: "Utility / Stable Cash Flow", value: "utility" }
              ]} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="totalAssets" label="Total Assets" value={inputs.totalAssets} onChange={(v: string) => handleChange("totalAssets", v)} prefix="$" />
              <CompactInput id="intangibleAssets" label="Intangible Assets" value={inputs.intangibleAssets} onChange={(v: string) => handleChange("intangibleAssets", v)} prefix="$" />
              <CompactInput id="totalDebt" label="Total Debt (Short + Long)" value={inputs.totalDebt} onChange={(v: string) => handleChange("totalDebt", v)} prefix="$" />
            </div>

            <div className="border-t border-border mt-2 pt-4">
              <button onClick={() => handleChange("showAdvanced", !inputs.showAdvanced)} className="flex items-center justify-between w-full text-sm font-semibold text-foreground hover:text-primary transition-colors">
                <span>Current Liabilities (Operational)</span>
                <span className="text-muted-foreground">{inputs.showAdvanced ? "▼" : "▶"}</span>
              </button>
              
              {inputs.showAdvanced && (
                <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                  <CompactInput id="currentLiabilities" label="Total Current Liabilities" value={inputs.currentLiabilities} onChange={(v: string) => handleChange("currentLiabilities", v)} prefix="$" />
                  <CompactInput id="shortTermDebt" label="Short-Term Debt Portion" value={inputs.shortTermDebt} onChange={(v: string) => handleChange("shortTermDebt", v)} prefix="$" />
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
                  <div className={`bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Asset Coverage Ratio</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-primary tracking-tighter">{results.assetCoverageRatio}x</div>
                    </div>
                  </div>

                  <div className={`bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm border-l-4 ${results.zone === 'Strong Coverage' ? 'border-emerald-500' : (results.zone === 'Adequate Coverage' ? 'border-orange-500' : 'border-destructive')}`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Solvency Status</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className={`text-3xl font-black tracking-tighter ${results.zoneColor}`}>{results.zone}</div>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium mt-1">Based on {inputs.industryType} standards</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Net Tangible Assets</div>
                    <div className="text-xl font-bold text-foreground">${results.netTangibleAssets.toLocaleString()}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total Debt</div>
                    <div className="text-xl font-bold text-foreground">${parseFloat(inputs.totalDebt).toLocaleString()}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Non-Debt Liabilities</div>
                    <div className="text-xl font-bold text-foreground">${results.adjustedCurrentLiabilities.toLocaleString()}</div>
                  </div>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Coverage Comparison</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" tickFormatter={(val) => `$${(val/1000000)}M`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" hide={true} />
                        <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString()}`} cursor={{fill: 'hsl(var(--muted)/0.5)'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                        <Legend wrapperStyle={{ fontSize: '13px', marginTop: '10px' }} />
                        <Bar dataKey="Net Tangible Assets" fill="hsl(var(--emerald-500))" radius={[0, 4, 4, 0]} barSize={40} />
                        <Bar dataKey="Total Debt" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Calculation Breakdown</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <tbody className="divide-y divide-border/50">
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 text-foreground font-medium">Total Assets</td>
                          <td className="px-4 py-3 text-right font-medium">${parseFloat(inputs.totalAssets).toLocaleString()}</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 text-foreground font-medium">- Intangible Assets</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">-${parseFloat(inputs.intangibleAssets).toLocaleString()}</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors bg-muted/10 font-semibold">
                          <td className="px-4 py-3 text-foreground">Tangible Assets</td>
                          <td className="px-4 py-3 text-right text-foreground">${results.tangibleAssets.toLocaleString()}</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 text-foreground font-medium">- Current Liabilities (Non-Debt)</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">-${results.adjustedCurrentLiabilities.toLocaleString()}</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors bg-muted/10 font-bold border-y-2 border-border">
                          <td className="px-4 py-3 text-primary">Net Tangible Assets Available</td>
                          <td className="px-4 py-3 text-right text-primary">${results.netTangibleAssets.toLocaleString()}</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 text-foreground font-medium">÷ Total Debt</td>
                          <td className="px-4 py-3 text-right font-bold">÷ ${parseFloat(inputs.totalDebt).toLocaleString()}</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors bg-primary/10 font-bold border-t-2 border-primary">
                          <td className="px-4 py-3 text-primary">Asset Coverage Ratio</td>
                          <td className="px-4 py-3 text-right text-primary">{results.assetCoverageRatio}x</td>
                        </tr>
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
            <h2 className="text-2xl font-bold mb-3">What Is the Asset Coverage Ratio?</h2>
            <p>The Asset Coverage Ratio is a financial solvency metric used by lenders and investors to determine how well a company can repay its debts by liquidating its assets. It provides a measure of downside protection. Specifically, it tells you how many times over the company's tangible assets can cover its total debt obligations in the event of bankruptcy.</p>
            
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>The formula is: <code>Asset Coverage Ratio = ((Total Assets - Intangible Assets) - (Current Liabilities - Short-term Debt)) / Total Debt</code>.</p>
            <p>We start with Total Assets and immediately strip out Intangible Assets (like goodwill or patents). These assets rarely fetch their balance sheet value during a liquidation. Next, we subtract Current Liabilities minus Short-Term Debt. This isolates the operational liabilities (like accounts payable and wages) that must legally be paid off before bondholders and lenders can seize assets. The resulting number (Net Tangible Assets) is then divided by Total Debt to produce the ratio.</p>
            
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The resulting multiple (e.g., 2.5x) indicates that the company has $2.50 in tangible assets for every $1.00 of debt. The <strong>Solvency Status</strong> categorizes this ratio based on industry norms. A higher ratio means less risk for lenders, which often translates to a better credit rating and lower borrowing costs for the company.</p>
            
            <h2 className="text-2xl font-bold mb-3">Key Factors and Industry Differences</h2>
            <p>The "acceptable" threshold for this ratio varies wildly by industry. For a traditional industrial, manufacturing, or technology company, a ratio of 2.0x is generally considered the minimum safe standard. However, utility companies are evaluated differently. Because utilities operate in highly regulated environments with predictable, guaranteed cash flows, they are permitted to carry more debt. For a utility, a ratio of 1.5x is often considered perfectly adequate.</p>
            
            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p>Consider an industrial company with $10M in Total Assets and $3M in Total Debt. If they have $1.5M in Intangibles, their Tangible Assets are $8.5M. If they have $2M in Current Liabilities and $500k of that is Short-Term Debt, their operational liabilities are $1.5M. Subtracting that from $8.5M leaves $7M in Net Tangible Assets. Dividing $7M by their $3M Total Debt gives an Asset Coverage Ratio of 2.33x, indicating a strong, solvent financial position.</p>
            
            <h2 className="text-2xl font-bold mb-3">Limitations</h2>
            <p>While useful, the Asset Coverage Ratio relies on the "book value" of assets as reported on the balance sheet. In a real-world liquidation scenario, heavy machinery, specialized inventory, or real estate might sell for drastically less than their recorded book value. Therefore, lenders often apply severe discounts (called "haircuts") to the book value of assets before calculating a true liquidation coverage ratio.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/asset-coverage-ratio-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
