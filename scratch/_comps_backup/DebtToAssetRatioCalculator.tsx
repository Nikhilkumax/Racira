"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ChartSlice {
  name: string;
  value: number;
  color: string;
}

interface BreakdownRow {
  label: string;
  value: number;
  isBold?: boolean;
}

interface DtaInputs {
  useAdvanced: boolean;
  totalDebts: string;
  totalAssets: string;
  mortgageDebt: string;
  autoLoanDebt: string;
  creditCardDebt: string;
  otherDebt: string;
  realEstate: string;
  cash: string;
  investments: string;
  otherAssets: string;
}

interface DtaResults {
  totalDebts: number;
  totalAssets: number;
  ratio: number;
  equity: number;
  equityRatio: number;
  leverageMultiple: number;
  status: string;
  statusColor: string;
  chartData: ChartSlice[];
  breakdownRows: BreakdownRow[];
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-[13px] font-semibold text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const calculateDta = (inputs: DtaInputs): DtaResults => {
  let totalDebts = 0;
  let totalAssets = 0;

  if (inputs.useAdvanced) {
    totalDebts = (parseFloat(inputs.mortgageDebt) || 0) + (parseFloat(inputs.autoLoanDebt) || 0) + (parseFloat(inputs.creditCardDebt) || 0) + (parseFloat(inputs.otherDebt) || 0);
    totalAssets = (parseFloat(inputs.realEstate) || 0) + (parseFloat(inputs.cash) || 0) + (parseFloat(inputs.investments) || 0) + (parseFloat(inputs.otherAssets) || 0);
  } else {
    totalDebts = parseFloat(inputs.totalDebts) || 0;
    totalAssets = parseFloat(inputs.totalAssets) || 0;
  }

  const ratio = totalAssets > 0 ? (totalDebts / totalAssets) * 100 : 0;
  const equity = Math.max(0, totalAssets - totalDebts);

  let status = "N/A";
  let statusColor = "text-muted-foreground";

  if (totalAssets > 0) {
    if (ratio <= 30) { status = "Excellent (Low Risk)"; statusColor = "text-green-600"; }
    else if (ratio <= 60) { status = "Good (Moderate Risk)"; statusColor = "text-green-500"; }
    else if (ratio <= 100) { status = "High Risk"; statusColor = "text-orange-500"; }
    else { status = "Insolvent (Debts exceed Assets)"; statusColor = "text-destructive"; }
  }

  const chartData = [
    { name: "Total Debt", value: totalDebts, color: "#ef4444" },
    { name: "Net Equity", value: equity, color: "hsl(var(--primary))" }
  ].filter(d => d.value > 0);

  const breakdownRows = [
    { label: "Total Assets", value: totalAssets },
    { label: "Total Debts", value: -totalDebts },
    { label: "Net Worth (Equity)", value: equity, isBold: true }
  ];

  return {
    totalDebts,
    totalAssets,
    ratio,
    equity,
    equityRatio: totalAssets > 0 ? (equity / totalAssets) * 100 : 0,
    leverageMultiple: equity > 0 ? totalDebts / equity : 0,
    status,
    statusColor,
    chartData,
    breakdownRows
  };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground -translate-y-14 transform">
        <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
        <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
      </div>
    );
  }
  return null;
};

const DEFAULTS = {
  useAdvanced: false,
  totalDebts: "150000",
  totalAssets: "500000",
  
  mortgageDebt: "250000",
  autoLoanDebt: "25000",
  creditCardDebt: "5000",
  otherDebt: "10000",
  
  realEstate: "400000",
  cash: "20000",
  investments: "150000",
  otherAssets: "30000"
};

export default function DebtToAssetRatioCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<DtaResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(calculateDta(inputs));
  }, []);

  const handleChange = (id: string, value: string | boolean) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleCalculate = () => {
    setResults(calculateDta(inputs));
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setResults(calculateDta(DEFAULTS));
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Debt to Asset Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Debt to Asset Ratio Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT COLUMN */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            
            <div className="flex items-center gap-2 mb-2 p-2 bg-secondary/30 rounded-md border border-border">
              <input 
                type="checkbox" 
                id="useAdvanced" 
                checked={inputs.useAdvanced} 
                onChange={(e) => handleChange("useAdvanced", e.target.checked)}
                className="w-4 h-4 accent-primary rounded border-input cursor-pointer"
              />
              <label htmlFor="useAdvanced" className="text-sm font-semibold cursor-pointer">Use Detailed Breakdown</label>
            </div>

            {!inputs.useAdvanced ? (
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <CompactInput id="totalDebts" label="Total Liabilities (Debts)" value={inputs.totalDebts} onChange={(v: string) => handleChange("totalDebts", v)} prefix="$" />
                <CompactInput id="totalAssets" label="Total Assets" value={inputs.totalAssets} onChange={(v: string) => handleChange("totalAssets", v)} prefix="$" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 animate-fade-in">
                <div className="col-span-2 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border pb-1 mt-1">Your Debts</div>
                <CompactInput id="mortgageDebt" label="Mortgage" value={inputs.mortgageDebt} onChange={(v: string) => handleChange("mortgageDebt", v)} prefix="$" />
                <CompactInput id="autoLoanDebt" label="Auto Loans" value={inputs.autoLoanDebt} onChange={(v: string) => handleChange("autoLoanDebt", v)} prefix="$" />
                <CompactInput id="creditCardDebt" label="Credit Cards" value={inputs.creditCardDebt} onChange={(v: string) => handleChange("creditCardDebt", v)} prefix="$" />
                <CompactInput id="otherDebt" label="Other Debt" value={inputs.otherDebt} onChange={(v: string) => handleChange("otherDebt", v)} prefix="$" />
                
                <div className="col-span-2 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border pb-1 mt-3">Your Assets</div>
                <CompactInput id="realEstate" label="Real Estate Value" value={inputs.realEstate} onChange={(v: string) => handleChange("realEstate", v)} prefix="$" />
                <CompactInput id="cash" label="Cash & Savings" value={inputs.cash} onChange={(v: string) => handleChange("cash", v)} prefix="$" />
                <CompactInput id="investments" label="Investments/Retirement" value={inputs.investments} onChange={(v: string) => handleChange("investments", v)} prefix="$" />
                <CompactInput id="otherAssets" label="Other Assets" value={inputs.otherAssets} onChange={(v: string) => handleChange("otherAssets", v)} prefix="$" />
              </div>
            )}
            
            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-9 text-base transition-all shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 transition-colors flex items-center justify-center focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-3">
            {results && (
              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card" ref={printRef}>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
                  <div className="flex justify-end absolute top-3 right-3">
                    <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                      <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Debt-to-Asset Ratio</div>
                  <div className="text-4xl font-bold text-primary">{results.ratio.toFixed(2)}%</div>
                  <div className={`text-sm font-bold mt-1 ${results.statusColor}`}>{results.status}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-y border-border py-3 my-2">
                  <div className="text-center px-2">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Debts</div>
                    <div className="text-sm font-bold text-destructive">${results.totalDebts.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  </div>
                  <div className="text-center px-2 border-l border-border">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Assets</div>
                    <div className="text-sm font-bold text-green-600">${results.totalAssets.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  </div>
                </div>

                {results.totalAssets > 0 && (
                  <div className="h-[250px] w-full mt-2 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={results.chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                <div className="mt-4">
                  <div className="text-sm font-bold mb-2">Net Worth Summary</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                          <th className="text-left py-2 font-semibold">Category</th>
                          <th className="py-2 font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.breakdownRows.map((row, idx) => (
                          <tr key={idx} className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${row.isBold ? 'font-bold bg-muted/20 text-primary' : ''}`}>
                            <td className="text-left py-2.5">{row.label}</td>
                            <td className={`py-2.5 ${row.value < 0 ? 'text-destructive' : ''}`}>
                              {row.value < 0 ? "-" : ""}${Math.abs(row.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5 mt-4">
                  <h3 className="text-base font-semibold mb-3">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Total Assets</span>
                      <span className="font-medium text-green-600">${results.totalAssets.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Total Debts</span>
                      <span className="font-medium text-destructive">${results.totalDebts.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Net Worth (Equity)</span>
                      <span className="font-medium">${results.equity.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Equity Share of Assets</span>
                      <span className="font-medium">{results.equityRatio.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Debt per $1 of Equity</span>
                      <span className="font-medium">{results.leverageMultiple > 0 ? `$${results.leverageMultiple.toFixed(2)}` : "—"}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Risk Assessment</span>
                      <span className={`font-medium ${results.statusColor}`}>{results.status}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Input Mode</span>
                      <span className="font-medium">{inputs.useAdvanced ? "Itemized" : "Totals"}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Solvency</span>
                      <span className={`font-medium ${results.equity > 0 ? "text-green-600" : "text-destructive"}`}>
                        {results.equity > 0 ? "Solvent" : "Insolvent"}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between border-t-2 border-border pt-3 mt-1 font-bold text-primary">
                    <span>Debt-to-Asset Ratio</span>
                    <span>{results.ratio.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-[1180px] mt-12 prose prose-slate dark:prose-invert">
          <h2 className="text-2xl font-bold mb-3">What Is the Debt to Asset Ratio?</h2>
          <p>The Debt-to-Asset Ratio is a financial metric used to evaluate the overall leverage and financial health of an individual or a company. It indicates what percentage of your total assets are financed by debt. A lower ratio signifies financial stability and lower risk, while a higher ratio indicates higher leverage and potential financial distress during economic downturns.</p>
          
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p>The formula is straightforward: <strong>Debt-to-Asset Ratio = (Total Liabilities / Total Assets) × 100</strong>. For example, if you have $200,000 in total debts (mortgage, car loan, credit cards) and $500,000 in total assets (home value, retirement accounts, cash), your ratio is 40%.</p>

          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p>This calculator outputs a percentage. If your ratio is 40%, it means that 40% of your assets are effectively "owned" by your creditors, while you own the remaining 60% free and clear (this 60% is your Net Worth or Equity).</p>
          
          <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
          <p>A ratio below 30% is generally considered excellent for individuals, providing a massive safety net. Ratios up to 60% are considered good or normal (especially for recent homeowners). Once the ratio exceeds 100%, it means you are insolvent—your debts exceed the value of everything you own.</p>
          
          <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
          <p>Use the "Detailed Breakdown" toggle to input your debts and assets line-by-line rather than calculating the totals manually. This feature helps you ensure no asset (like a secondary vehicle or small investment account) is accidentally left out of the calculation.</p>
          
          <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
          <p>If a business applies for a loan, the bank will heavily scrutinize its debt-to-asset ratio. A company with $2 million in assets and $1.5 million in debt has a 75% ratio. The bank might consider this too highly leveraged and deny the loan, or charge a much higher interest rate due to the risk.</p>
          
          <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
          <p>If your ratio is high, focus on paying down high-interest, unsecured debt (like credit cards) first. This reduces your liabilities without necessarily forcing you to liquidate assets, slowly improving your ratio month by month.</p>
          
          <h2 className="text-2xl font-bold mb-3">Benefits</h2>
          <p>Tracking this metric annually provides a "big picture" view of your wealth accumulation. Even if your debts stay exactly the same, your ratio will improve if your assets (like your home or investment portfolio) appreciate in value.</p>
        </div>

        <FAQSection pageUrl="https://racira.com/calculator/debt-to-asset-ratio-calculator" faqs={[
          { question: "What is a good debt to asset ratio for an individual?", answer: "Generally, a ratio below 50% is considered good for an individual. It means you own more than you owe. Ratios below 30% are considered excellent." },
          { question: "Is debt-to-asset the same as debt-to-income (DTI)?", answer: "No. DTI compares your monthly debt payments to your monthly income. Debt-to-Asset compares your total overall debt balance to your total overall asset value." },
          { question: "Should I include my house in the asset calculation?", answer: "Yes. Your home's current market value is a major asset, and your mortgage is a major liability. Both must be included for an accurate ratio." },
          { question: "What happens if my ratio is over 100%?", answer: "A ratio over 100% means you have negative net worth (insolvency). This is common for recent college graduates with high student loan debt and few assets, but is highly risky for older individuals." }
        ]} />
        <PopularCalculators />
      </div>
    </>
  );
}
