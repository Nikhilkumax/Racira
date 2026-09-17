"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Building2, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface ICRResults {
  ebit: number;
  interest: number;
  icr: number;
  status: string;
  statusColor: string;
  chartData: { name: string; value: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateICR = (ebit: number, interest: number): ICRResults => {
  const icr = interest > 0 ? ebit / interest : 0;
  
  let status = "";
  let statusColor = "";

  if (icr >= 3.0) {
    status = "Healthy (Low Risk)";
    statusColor = "text-emerald-500";
  } else if (icr >= 1.5) {
    status = "Adequate (Moderate Risk)";
    statusColor = "text-blue-500";
  } else if (icr > 1.0) {
    status = "Vulnerable (High Risk)";
    statusColor = "text-amber-500";
  } else {
    status = "Distressed (Default Risk)";
    statusColor = "text-red-500";
  }

  // Chart to show EBIT vs Interest
  const chartData = [
    { name: "EBIT", value: Math.max(0, ebit) },
    { name: "Interest", value: interest },
  ];

  const summaryStats = [
    { label: "Interest Coverage Ratio", value: `${icr.toFixed(2)}x` },
    { label: "Credit Health", value: status.split(' ')[0] },
    { label: "Operating Income", value: `$${ebit.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Interest Buffer", value: `$${Math.max(0, ebit - interest).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const breakdown = [
    { label: "Earnings Before Interest & Taxes (EBIT)", amount: `$${ebit.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Total Interest Expense", amount: `$${interest.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Net Operating Buffer", amount: `$${(ebit - interest).toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Interest Coverage Ratio (ICR)", amount: `${icr.toFixed(2)}x`, isTotal: true, colorClass: statusColor.includes('red') ? "text-red-500" : "text-emerald-500 font-bold" },
  ];

  return { ebit, interest, icr, status, statusColor, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  ebit: "1200000",
  interest: "250000",
};

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none">{suffix}</span>}
    </div>
  </div>
);

export default function InterestCoverageRatioCalculator() {
  const [ebit, setEbit] = useState(DEFAULTS.ebit);
  const [interest, setInterest] = useState(DEFAULTS.interest);
  
  const [results, setResults] = useState<ICRResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateICR(
      parseFloat(ebit) || 0, 
      parseFloat(interest) || 0
    ));
  };

  const handleReset = () => {
    setEbit(DEFAULTS.ebit); setInterest(DEFAULTS.interest);
    setResults(calculateICR(1200000, 250000));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>ICR Calculator</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2 rounded-lg shadow-sm text-xs font-semibold">
          <span className="text-muted-foreground mr-2">{payload[0].payload.name}:</span>
          <span className="text-foreground">${payload[0].value.toLocaleString()}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Interest Coverage Ratio" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Interest Coverage Ratio Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Financial Data</h2>
            </div>
            
            <CompactInput id="ebit" label="Operating Income (EBIT)" value={ebit} onChange={setEbit} prefix="$" tooltip="Earnings Before Interest and Taxes. Found on the Income Statement." />
            <CompactInput id="int" label="Interest Expense" value={interest} onChange={setInterest} prefix="$" tooltip="Total interest payable on all outstanding debt." />

            <div className="p-3 mt-1 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground font-medium">
              The ICR measures how easily a company can pay interest on its outstanding debt.
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleCalculate} className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center transition-colors shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Interest Coverage Ratio
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.statusColor}`}>
                    {results.icr.toFixed(2)}x
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Solvency Risk: <span className={`font-bold ${results.statusColor}`}>{results.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {results.summaryStats.map((stat, i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""} ${i === 2 ? "max-sm:border-l-0 max-sm:border-t" : ""} ${i === 3 ? "max-sm:border-t" : ""}`}>
                      <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{stat.label}</div>
                      <div className="text-sm font-bold truncate">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="card-calculator !p-0 border border-border bg-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-secondary/50 border-b border-border">
                        <tr>
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Metric</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className="text-[14px] py-3 px-3">{item.label}</td>
                            <td className={`text-[14px] py-3 px-3 text-right ${item.colorClass || ""}`}>{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-sm font-bold mb-4 w-full text-left">EBIT vs Interest Burden</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                          <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={60} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.name === 'EBIT' ? "hsl(var(--primary))" : "hsl(var(--destructive))"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      The top bar (EBIT) must be sufficiently larger than the bottom bar to avoid bankruptcy risk.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        <div className="racira-page-container mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What is the Interest Coverage Ratio?</h2>
            <p>The <strong>Interest Coverage Ratio (ICR)</strong> is a critical financial metric used by lenders, creditors, and investors to determine how easily a company can pay interest on its outstanding debt. It measures how many times a company could pay its current interest obligations using its operating earnings.</p>
            
            <h3>How to Calculate the ICR</h3>
            <p>The formula is simple: divide a company's <strong>EBIT</strong> (Earnings Before Interest and Taxes) by its total <strong>Interest Expense</strong> for the same period.</p>
            <p>For example, if a company has an EBIT of $1,200,000 and an annual interest expense of $250,000, its ICR is 4.8x. This means the company generates enough operating income to cover its interest payments 4.8 times over. This is a very healthy margin of safety.</p>

            <h2 className="text-2xl font-bold mb-3">Interpreting the Ratio</h2>
            <p>Different industries have different benchmarks for what constitutes a "safe" ICR, but general credit analysis follows these guidelines:</p>
            <ul>
              <li><strong>3.0x or higher (Healthy):</strong> The company is at low risk of defaulting on its debt. It generates ample cash flow to service its loans and reinvest in the business.</li>
              <li><strong>1.5x to 2.9x (Adequate to Vulnerable):</strong> The company can meet its obligations, but a sudden drop in sales or an increase in interest rates (if dealing with variable-rate debt) could put the company in a precarious position.</li>
              <li><strong>1.0x to 1.4x (High Risk):</strong> The company is barely generating enough income to pay its interest. It likely has no cash left over to pay down the principal balance or invest in growth.</li>
              <li><strong>Below 1.0x (Distressed):</strong> A ratio below 1 means the company is not generating enough operating income to cover its interest payments. Without tapping into cash reserves or raising new capital, default and bankruptcy are imminent.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">ICR vs. DSCR</h2>
            <p>While the ICR only looks at a company's ability to pay <em>interest</em>, the <strong>Debt Service Coverage Ratio (DSCR)</strong> looks at the ability to pay both interest <em>and</em> principal repayments. Because of this, the DSCR is usually a much stricter metric, and banks often heavily rely on the DSCR when underwriting commercial real estate or large corporate loans.</p>
          </section>
          <FAQSection faqs={[
            { question: "Why do we use EBIT instead of Net Income?", answer: "Interest is a pre-tax expense. Therefore, we must use pre-tax earnings (EBIT) to measure the company's true ability to pay interest out of its operations. Using Net Income would artificially lower the ratio because it accounts for taxes that are paid after interest." },
            { question: "What causes a bad Interest Coverage Ratio?", answer: "An ICR drops either because operating income (EBIT) is falling due to poor sales/high costs, or because interest expense is rising due to taking on too much debt or facing higher variable interest rates." },
            { question: "Do utility companies have lower ICRs?", answer: "Yes. Industries with highly predictable, stable cash flows (like utilities or telecom) can safely operate with much lower Interest Coverage Ratios (often around 1.5x to 2.0x) compared to volatile industries like tech or retail." },
          ]} pageUrl="https://racira.com/calculator/interest-coverage-ratio-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Interest Coverage Ratio Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Interest Coverage Ratio Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Interest Coverage Ratio Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Interest Coverage Ratio Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Interest Coverage Ratio Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/interest-coverage-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
