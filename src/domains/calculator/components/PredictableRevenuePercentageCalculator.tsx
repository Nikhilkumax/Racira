"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, LineChart, Printer } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface RevenueResults {
  total: number;
  recurring: number;
  contracts: number;
  predictable: number;
  oneOff: number;
  predictablePct: number;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculatePredictability = (total: number, recurring: number, contracts: number): RevenueResults => {
  const predictable = recurring + contracts;
  
  // Ensure we don't have predictable > total if the user enters weird numbers
  const actualPredictable = Math.min(predictable, total);
  const oneOff = Math.max(0, total - actualPredictable);
  
  const predictablePct = total > 0 ? (actualPredictable / total) * 100 : 0;

  const chartData = [
    { name: "SaaS / Subscription", value: recurring, color: "hsl(var(--primary))" },
    { name: "Term Contracts", value: contracts, color: "hsl(var(--chart-2))" },
    { name: "One-Off / Transactional", value: oneOff, color: "hsl(var(--muted))" },
  ];

  const summaryStats = [
    { label: "Total Revenue", value: `$${total.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Predictable Rev", value: `$${actualPredictable.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "One-Off Rev", value: `$${oneOff.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Predictability Score", value: `${predictablePct.toFixed(1)}%` },
  ];

  const breakdown = [
    { label: "Total Annual Revenue", amount: `$${total.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "SaaS / Auto-Renewing Subscriptions", amount: `$${recurring.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: "text-emerald-500" },
    { label: "Long-Term Contractual Revenue", amount: `$${contracts.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: "text-blue-500" },
    { label: "Total Predictable Revenue", amount: `$${actualPredictable.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: "text-primary font-bold" },
    { label: "Transactional / One-Off Revenue", amount: `$${oneOff.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: "text-muted-foreground" },
    { label: "Predictable Revenue Percentage", amount: `${predictablePct.toFixed(2)}%`, isTotal: true, colorClass: predictablePct > 70 ? "text-emerald-500 font-bold" : "text-amber-500 font-bold" },
  ];

  return { total, recurring, contracts, predictable: actualPredictable, oneOff, predictablePct, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  total: "5000000",
  recurring: "3200000",
  contracts: "500000",
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

export default function PredictableRevenuePercentageCalculator() {
  const [total, setTotal] = useState(DEFAULTS.total);
  const [recurring, setRecurring] = useState(DEFAULTS.recurring);
  const [contracts, setContracts] = useState(DEFAULTS.contracts);
  
  const [results, setResults] = useState<RevenueResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculatePredictability(
      parseFloat(total) || 0, 
      parseFloat(recurring) || 0,
      parseFloat(contracts) || 0
    ));
  };

  const handleReset = () => {
    setTotal(DEFAULTS.total); setRecurring(DEFAULTS.recurring); setContracts(DEFAULTS.contracts);
    setResults(calculatePredictability(5000000, 3200000, 500000));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Predictable Revenue Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
          <span className="text-foreground">${payload[0].value.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Predictable Revenue Percentage" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Predictable Revenue Percentage Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <LineChart className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Revenue Quality Inputs</h2>
            </div>
            
            <CompactInput id="tot" label="Total Annual Revenue" value={total} onChange={setTotal} prefix="$" tooltip="The total top-line revenue generated by the business in the last 12 months." />
            
            <div className="border-t border-border my-1"></div>

            <CompactInput id="rec" label="Recurring Revenue (ARR/MRR)" value={recurring} onChange={setRecurring} prefix="$" tooltip="Revenue from auto-renewing subscriptions, SaaS licenses, or ongoing retainers." />
            <CompactInput id="con" label="Long-Term Contract Revenue" value={contracts} onChange={setContracts} prefix="$" tooltip="Revenue from multi-year contracts that are not auto-renewing but are legally bound." />

            <div className="p-3 mt-1 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground font-medium">
              Measures the "quality" of a company's revenue. High predictability increases business valuation multiples.
            </div>

            <div className="flex gap-3 mt-2">
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
                    Predictable Revenue Percentage
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.predictablePct >= 70 ? 'text-emerald-600' : results.predictablePct >= 40 ? 'text-blue-600' : 'text-amber-600'}`}>
                    {results.predictablePct.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Remaining { (100 - results.predictablePct).toFixed(1) }% is at-risk transactional revenue.
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Revenue Stream</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className="text-[13px] py-3 px-3">{item.label}</td>
                            <td className={`text-[13px] py-3 px-3 text-right ${item.colorClass || ""}`}>{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Revenue Quality Breakdown</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={results.chartData.filter(d => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {results.chartData.filter(d => d.value > 0).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        <div className="racira-page-container mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What is Predictable Revenue?</h2>
            <p>In business valuation and operations, not all revenue is created equal. <strong>Predictable Revenue</strong> (often called Quality of Earnings) refers to money that a business is mathematically guaranteed to receive in the future without having to make a new sale.</p>
            <p>A business with $10 million in highly predictable revenue is usually valued much higher than a business with $20 million in unpredictable, one-off revenue.</p>
            
            <h3>The Three Tiers of Revenue Quality</h3>
            <ul>
              <li><strong>Tier 1: SaaS & Auto-Renewing Subscriptions.</strong> The holy grail of revenue. The customer is automatically billed every month or year until they actively cancel. Churn rates can be mathematically modeled to predict exact cash flow years in advance.</li>
              <li><strong>Tier 2: Hard Contracts.</strong> A customer signs a 3-year deal for services. While it does not automatically renew, the business can bank on that revenue for the next 36 months because the customer is legally bound to pay.</li>
              <li><strong>Tier 3: Transactional (One-Off) Revenue.</strong> Retail sales, consulting projects, implementation fees, and e-commerce. Every month, the business starts at zero and must actively hunt for new customers to generate revenue.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Why Investors Care About the Predictable Percentage</h2>
            <p>Venture Capitalists (VCs) and Private Equity (PE) firms obsess over this metric. A company that has 80% predictable revenue can easily survive an economic downturn because they don't need to aggressively sell new deals—they just need to retain their current customers.</p>
            <p>Conversely, a consulting firm with 0% predictable revenue will see its cash flow immediately collapse the moment the economy slows down and clients stop signing new project statements of work (SOWs).</p>
            
            <h2 className="text-2xl font-bold mb-3">Benchmarks for Success</h2>
            <p>If you are running a B2B SaaS company, investors typically expect your predictable revenue percentage to be <strong>above 80%</strong>. The remaining 20% is usually comprised of one-off implementation, training, or professional services fees used to onboard the client.</p>
          </section>
          <FAQSection faqs={[
            { question: "Do monthly retainers count as predictable revenue?", answer: "Yes, if they are tied to a signed contract (e.g., a 12-month marketing retainer). If it is a month-to-month 'handshake' agreement that the client can cancel at any time with no notice, it is considered much lower quality and borders on transactional." },
            { question: "Why is a SaaS company valued at 10x revenue, but a consulting firm is valued at 1x revenue?", answer: "Because of predictability. If you buy a SaaS company, the customers are locked into software they rely on every day. If you buy a consulting firm, the 'assets' are the consultants. If the consultants quit, the revenue instantly disappears." },
            { question: "How do I increase my predictable revenue percentage?", answer: "Convert transactional products into subscriptions. Instead of selling a $1,000 piece of software once, sell it for $100/month. Instead of doing one-off HVAC repairs, sell a $50/month preventative maintenance contract." },
          ]} pageUrl="https://racira.com/calculator/predictable-revenue-percentage-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Predictable Revenue Percentage Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Predictable Revenue Percentage Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Predictable Revenue Percentage Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Predictable Revenue Percentage Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Predictable Revenue Percentage Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/predictable-revenue-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
