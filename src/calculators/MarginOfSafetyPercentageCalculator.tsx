"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Target, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface MarginResults {
  sales: number;
  breakEven: number;
  marginAmt: number;
  marginPct: number;
  status: string;
  statusColor: string;
  chartData: { name: string; "Break-Even Sales": number; "Margin of Safety": number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateMargin = (sales: number, breakEven: number): MarginResults => {
  const marginAmt = Math.max(0, sales - breakEven);
  const marginPct = sales > 0 ? (marginAmt / sales) * 100 : 0;
  
  const isLoss = sales < breakEven;
  const lossAmt = isLoss ? breakEven - sales : 0;

  let status = "";
  let statusColor = "";
  if (isLoss) {
    status = "Operating at a Loss";
    statusColor = "text-red-500";
  } else if (marginPct >= 30) {
    status = "Very Safe / High Cushion";
    statusColor = "text-emerald-500";
  } else if (marginPct >= 15) {
    status = "Adequate Safety";
    statusColor = "text-blue-500";
  } else if (marginPct > 0) {
    status = "High Risk (Close to Break-Even)";
    statusColor = "text-amber-500";
  }

  const chartData = [
    { 
      name: "Total Sales", 
      "Break-Even Sales": Math.min(sales, breakEven), 
      "Margin of Safety": marginAmt,
      "Operating Loss": isLoss ? lossAmt : 0
    }
  ];

  const summaryStats = [
    { label: "Margin of Safety (%)", value: isLoss ? "0.0%" : `${marginPct.toFixed(1)}%` },
    { label: "Margin of Safety ($)", value: isLoss ? "$0" : `$${marginAmt.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Current Sales", value: `$${sales.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Risk Level", value: isLoss ? "Critical" : marginPct < 15 ? "High" : "Low" },
  ];

  const breakdown = [
    { label: "Expected / Current Sales Revenue", amount: `$${sales.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Break-Even Sales Threshold", amount: `-$${breakEven.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Margin of Safety (Dollars)", amount: isLoss ? `-$${lossAmt.toLocaleString("en-US", { maximumFractionDigits: 2 })} (Deficit)` : `$${marginAmt.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: isLoss ? "text-red-500" : "text-emerald-500" },
    { label: "Margin of Safety (Percentage)", amount: isLoss ? "0.00%" : `${marginPct.toFixed(2)}%`, isTotal: true, colorClass: isLoss ? "text-red-500" : "text-emerald-500 font-bold" },
  ];

  return { sales, breakEven, marginAmt, marginPct, status, statusColor, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  sales: "500000",
  breakEven: "350000",
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

export default function MarginOfSafetyPercentageCalculator() {
  const [sales, setSales] = useState(DEFAULTS.sales);
  const [breakEven, setBreakEven] = useState(DEFAULTS.breakEven);
  
  const [results, setResults] = useState<MarginResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateMargin(
      parseFloat(sales) || 0, 
      parseFloat(breakEven) || 0
    ));
  };

  const handleReset = () => {
    setSales(DEFAULTS.sales); setBreakEven(DEFAULTS.breakEven);
    setResults(calculateMargin(500000, 350000));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Margin of Safety</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      let total = 0;
      payload.forEach((entry: any) => total += entry.value);
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-sm text-xs font-semibold">
          <p className="mb-2 text-foreground font-bold border-b border-border pb-1">Sales Composition</p>
          {payload.map((entry: any, index: number) => {
            if (entry.value === 0) return null;
            return (
              <div key={index} className="flex justify-between gap-4 mb-1">
                <span style={{ color: entry.color }}>{entry.name}:</span>
                <span>${entry.value.toLocaleString()}</span>
              </div>
            );
          })}
          <div className="flex justify-between gap-4 mt-2 pt-1 border-t border-border font-bold">
            <span>Total Value:</span>
            <span>${total.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Margin of Safety Percentage" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Margin of Safety Percentage Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Revenue Metrics</h2>
            </div>
            
            <CompactInput id="sales" label="Current or Expected Sales" value={sales} onChange={setSales} prefix="$" tooltip="Your actual total sales revenue, or your projected sales for the period." />
            <CompactInput id="be" label="Break-Even Sales" value={breakEven} onChange={setBreakEven} prefix="$" tooltip="The exact amount of sales required to cover all fixed and variable costs (where profit is exactly zero)." />

            <div className="p-3 mt-1 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground font-medium">
              Margin of Safety tells you how far sales can plummet before you start losing money.
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
                
                <div className={`border-l-4 rounded-lg p-5 relative ${sales < breakEven ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Margin of Safety (%)
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.statusColor}`}>
                    {results.marginPct.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Financial Status: <span className={`font-bold ${results.statusColor}`}>{results.status}</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Analysis Breakdown</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Amount</th>
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
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Sales Composition Stack</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                          <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={80} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          
                          <Bar dataKey="Break-Even Sales" stackId="a" fill="hsl(var(--muted))" radius={results.marginPct === 0 ? [0, 4, 4, 0] : [0, 0, 0, 0]} />
                          
                          {/* If profitable, Margin of Safety is green on top of Break-Even */}
                          <Bar dataKey="Margin of Safety" stackId="a" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                          
                          {/* If operating at a loss, this red bar acts as the deficit visual */}
                          <Bar dataKey="Operating Loss" stackId="a" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                          
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      The colored section is your "safety buffer" above break-even.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        <div className="racira-page-container mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What is the Margin of Safety?</h2>
            <p>In cost accounting and business planning, the <strong>Margin of Safety</strong> represents the cushion a company has before it starts operating at a loss. It is the difference between your actual (or expected) sales and your break-even sales.</p>
            <p>If your margin of safety is high, your business can absorb a significant drop in customer demand, an economic recession, or unexpected downtime without plunging into the red. If your margin of safety is low, your business is highly sensitive to even minor disruptions in revenue.</p>
            
            <h3>How to Calculate Margin of Safety</h3>
            <p>The calculation requires two steps:</p>
            <ol>
              <li><strong>Margin of Safety in Dollars:</strong> Current Sales - Break-Even Sales</li>
              <li><strong>Margin of Safety Percentage:</strong> (Margin of Safety in Dollars / Current Sales) × 100</li>
            </ol>
            <p>For example, if you sell $100,000 worth of goods and your break-even point is $70,000, your Margin of Safety is $30,000. As a percentage, this is ($30,000 / $100,000) = 30%. This means your sales could plummet by 30% and you would still break even.</p>
            
            <h2 className="text-2xl font-bold mb-3">Why the Percentage is More Useful Than Dollars</h2>
            <p>While knowing you have a $50,000 cushion sounds great, context matters. A $50,000 cushion for a small local bakery doing $200,000 in sales is a massive 25% margin of safety. A $50,000 cushion for a manufacturer doing $5,000,000 in sales is a razor-thin 1% margin of safety.</p>
            <p>By expressing the margin of safety as a percentage, business owners, investors, and lenders can quickly compare the risk profile of vastly different businesses regardless of their scale.</p>

            <h2 className="text-2xl font-bold mb-3">How to Improve Your Margin of Safety</h2>
            <p>If your margin of safety is dangerously low (e.g., under 10%), you can improve it in three ways:</p>
            <ul>
              <li><strong>Increase Sales Revenue:</strong> Sell more volume, or raise prices (assuming demand is inelastic).</li>
              <li><strong>Reduce Fixed Costs:</strong> Move to a cheaper facility, renegotiate software subscriptions, or reduce administrative headcount. Lowering fixed costs dramatically lowers your break-even point.</li>
              <li><strong>Lower Variable Costs:</strong> Negotiate better rates with suppliers or reduce direct labor costs to improve your contribution margin per unit.</li>
            </ul>
          </article>
          <FAQSection faqs={[
            { question: "What is a 'good' Margin of Safety?", answer: "A healthy margin of safety is generally considered to be 20% or higher. However, highly stable, recurring-revenue businesses (like utilities or subscription software) can safely operate with lower margins, while volatile businesses (like fashion retail or restaurants) need higher margins to survive lean seasons." },
            { question: "How do I find my Break-Even Sales?", answer: "To find your break-even sales volume, you must divide your Total Fixed Costs by your Contribution Margin Ratio. The Contribution Margin Ratio is calculated as (Sales Revenue - Variable Costs) / Sales Revenue." },
            { question: "Can the Margin of Safety be negative?", answer: "Yes, though technically the formula results in a negative number, it simply means you are operating at a loss. Your actual sales have not yet reached the break-even threshold." },
          ]} pageUrl="https://racira.com/calculator/margin-of-safety-percentage-calculator" />
          <PopularCalculators exclude="/calculator/margin-of-safety-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
