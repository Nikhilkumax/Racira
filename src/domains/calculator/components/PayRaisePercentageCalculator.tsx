"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, TrendingUp, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface RaiseResults {
  currentPay: number;
  newPay: number;
  raiseAmt: number;
  raisePct: number;
  realWageGrowth: number;
  isPayCut: boolean;
  chartData: { name: string; "Base Pay": number; "Raise Amount": number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateRaise = (currentPay: number, newPay: number, inflation: number): RaiseResults => {
  const raiseAmt = newPay - currentPay;
  const raisePct = currentPay > 0 ? (raiseAmt / currentPay) * 100 : 0;
  const realWageGrowth = raisePct - inflation;
  const isPayCut = raiseAmt < 0;

  const chartData = [
    { name: "Current Pay", "Base Pay": currentPay, "Raise Amount": 0 },
    { name: "New Pay", "Base Pay": currentPay, "Raise Amount": Math.max(0, raiseAmt) },
  ];

  const summaryStats = [
    { label: "Nominal Raise", value: `${raisePct.toFixed(2)}%` },
    { label: "Absolute Increase", value: `${raiseAmt >= 0 ? '+' : '-'}$${Math.abs(raiseAmt).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Inflation Rate", value: `${inflation.toFixed(1)}%` },
    { label: "Real Wage Growth", value: `${realWageGrowth.toFixed(2)}%` },
  ];

  const breakdown = [
    { label: "Current Compensation", amount: `$${currentPay.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "New Compensation", amount: `$${newPay.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Absolute Change (Dollars)", amount: `${raiseAmt >= 0 ? '+' : '-'}$${Math.abs(raiseAmt).toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: isPayCut ? "text-red-500" : "text-emerald-500" },
    { label: "Nominal Pay Change (%)", amount: `${raisePct >= 0 ? '+' : ''}${raisePct.toFixed(2)}%`, isTotal: true, colorClass: isPayCut ? "text-red-500 font-bold" : "text-emerald-500 font-bold" },
    { label: "Inflation Rate (Cost of Living)", amount: `-${inflation.toFixed(2)}%`, colorClass: "text-muted-foreground" },
    { label: "Real Wage Growth (Purchasing Power)", amount: `${realWageGrowth >= 0 ? '+' : ''}${realWageGrowth.toFixed(2)}%`, isTotal: true, colorClass: realWageGrowth >= 0 ? "text-blue-500 font-bold" : "text-amber-500 font-bold" },
  ];

  return { currentPay, newPay, raiseAmt, raisePct, realWageGrowth, isPayCut, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  currentPay: "75000",
  newPay: "82000",
  inflation: "3.2",
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

export default function PayRaisePercentageCalculator() {
  const [currentPay, setCurrentPay] = useState(DEFAULTS.currentPay);
  const [newPay, setNewPay] = useState(DEFAULTS.newPay);
  const [inflation, setInflation] = useState(DEFAULTS.inflation);
  
  const [results, setResults] = useState<RaiseResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateRaise(
      parseFloat(currentPay) || 0, 
      parseFloat(newPay) || 0,
      parseFloat(inflation) || 0
    ));
  };

  const handleReset = () => {
    setCurrentPay(DEFAULTS.currentPay); setNewPay(DEFAULTS.newPay); setInflation(DEFAULTS.inflation);
    setResults(calculateRaise(75000, 82000, 3.2));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Pay Raise Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
          <p className="mb-2 text-foreground font-bold border-b border-border pb-1">{label}</p>
          {payload.map((entry: any, index: number) => {
            if (entry.value === 0) return null;
            return (
              <div key={index} className="flex justify-between gap-4 mb-1">
                <span style={{ color: entry.color }}>{entry.name}:</span>
                <span>${entry.value.toLocaleString()}</span>
              </div>
            );
          })}
          {label === 'New Pay' && payload.length > 1 && (
            <div className="flex justify-between gap-4 mt-2 pt-1 border-t border-border font-bold">
              <span>Total:</span>
              <span>${total.toLocaleString()}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Pay Raise Percentage" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pay Raise Percentage Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Compensation Data</h2>
            </div>
            
            <CompactInput id="cur" label="Current Pay (Salary or Hourly)" value={currentPay} onChange={setCurrentPay} prefix="$" tooltip="Your current gross salary or hourly rate." />
            <CompactInput id="new" label="New Pay (Salary or Hourly)" value={newPay} onChange={setNewPay} prefix="$" tooltip="The new proposed salary or hourly rate." />
            <CompactInput id="inf" label="Current Inflation Rate" value={inflation} onChange={setInflation} suffix="%" tooltip="The annual inflation rate (CPI). Used to calculate real wage growth." step="0.1" />

            <div className="p-3 mt-1 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground font-medium">
              You can enter either annual salary numbers (e.g., $75,000) or hourly rates (e.g., $25). The percentages will be identical.
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
                
                <div className={`border-l-4 rounded-lg p-5 relative ${results.isPayCut ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    {results.isPayCut ? "Pay Cut Percentage" : "Pay Raise Percentage"}
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.isPayCut ? 'text-red-600' : 'text-emerald-600'}`}>
                    {results.raisePct > 0 ? '+' : ''}{results.raisePct.toFixed(2)}%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Real Wage Growth (Purchasing Power): <span className={`font-bold ${results.realWageGrowth < 0 ? 'text-amber-600' : 'text-blue-600'}`}>{results.realWageGrowth > 0 ? '+' : ''}{results.realWageGrowth.toFixed(2)}%</span>
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
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Metric</th>
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
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Pay Comparison</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                          <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          <Bar dataKey="Base Pay" stackId="a" fill="hsl(var(--muted))" radius={results.raiseAmt > 0 ? [0, 0, 0, 0] : [4, 4, 0, 0]} />
                          <Bar dataKey="Raise Amount" stackId="a" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
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
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Your Pay Raise</h2>
            <p>A pay raise is formally calculated as the percentage difference between your old salary and your new salary. This metric is critical for evaluating whether a promotion or an annual cost-of-living adjustment (COLA) is actually improving your financial standing.</p>
            
            <h3>How to Calculate a Raise Percentage</h3>
            <p>The standard formula is: <strong>((New Salary - Old Salary) / Old Salary) × 100</strong>.</p>
            <p>If you were making $60,000 and received a raise to $63,000, your absolute increase is $3,000. Divide $3,000 by $60,000 to get 0.05, which is a exactly a 5.0% raise.</p>
            
            <h2 className="text-2xl font-bold mb-3">The Illusion of the Nominal Raise (Inflation)</h2>
            <p>The most important concept in salary negotiations is understanding the difference between a <strong>Nominal Raise</strong> and <strong>Real Wage Growth</strong>.</p>
            <ul>
              <li><strong>Nominal Raise:</strong> The actual dollar percentage increase on your paycheck. (e.g., a 4% raise).</li>
              <li><strong>Inflation (CPI):</strong> The rate at which the cost of goods and services (food, rent, gas) increases over a year. (e.g., 5% inflation).</li>
              <li><strong>Real Wage Growth:</strong> Nominal Raise minus Inflation. This measures your actual <em>Purchasing Power</em>.</li>
            </ul>
            <p>If you receive a 4% raise, but inflation is running at 5%, your Real Wage Growth is <strong>-1%</strong>. Despite seeing a bigger number on your paycheck, you actually took a pay cut in terms of purchasing power. Your new salary buys fewer groceries than your old salary did last year.</p>

            <h2 className="text-2xl font-bold mb-3">Average Salary Increases</h2>
            <p>Knowing the industry benchmarks helps contextualize your raise:</p>
            <ul>
              <li><strong>Standard Annual Merit/COLA:</strong> Usually 2.5% to 3.5%. This is designed strictly to pace with normal inflation.</li>
              <li><strong>Internal Promotion:</strong> Getting promoted to a new tier within the same company typically yields a 7% to 12% increase.</li>
              <li><strong>Job Hopping:</strong> Leaving your company for a similar role at a competitor is historically the fastest way to grow income, often yielding 15% to 20% increases.</li>
            </ul>
          </article>
          <FAQSection faqs={[
            { question: "Can I use hourly rates instead of annual salary?", answer: "Yes! The percentage calculation is exactly the same whether you input $20/hr to $22/hr, or $41,600/yr to $45,760/yr. The math holds true regardless of the time unit." },
            { question: "Is a 3% raise good?", answer: "A 3% raise is average for an annual 'merit' increase designed to keep pace with standard inflation. It means your company values keeping you, but it is not a promotion. If inflation is higher than 3%, you are losing purchasing power." },
            { question: "How do taxes affect my raise?", answer: "Your raise will be taxed at your marginal tax rate. If you get a $5,000 raise, you will not see $5,000 in your bank account. Depending on your state and tax bracket, you may only take home 60% to 75% of that raise." },
          ]} pageUrl="https://racira.com/calculator/pay-raise-percentage-calculator" />
          <PopularCalculators exclude="/calculator/pay-raise-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
