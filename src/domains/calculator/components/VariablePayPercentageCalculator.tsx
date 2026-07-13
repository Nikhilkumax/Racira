"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, HandCoins, Printer } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface VariablePayResults {
  base: number;
  variable: number;
  ttc: number;
  basePct: number;
  variablePct: number;
  payMix: string;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; pct: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateVariablePay = (base: number, variable: number): VariablePayResults => {
  const ttc = base + variable;
  const basePct = ttc > 0 ? (base / ttc) * 100 : 0;
  const variablePct = ttc > 0 ? (variable / ttc) * 100 : 0;
  
  // Format Pay Mix (e.g., "80/20")
  const payMix = `${Math.round(basePct)}/${Math.round(variablePct)}`;

  const chartData = [
    { name: "Base Salary (Fixed)", value: base, color: "hsl(var(--primary))" },
    { name: "Variable Pay (At-Risk)", value: variable, color: "hsl(var(--chart-2))" },
  ];

  const summaryStats = [
    { label: "Total Target Comp (TTC)", value: `$${ttc.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Pay Mix (Base/Var)", value: payMix },
    { label: "Variable %", value: `${variablePct.toFixed(1)}%` },
    { label: "Risk Profile", value: variablePct > 40 ? "High Risk (Aggressive)" : variablePct > 15 ? "Moderate (Balanced)" : "Low Risk (Stable)" },
  ];

  const breakdown = [
    { label: "Guaranteed Base Salary", amount: `$${base.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, pct: `${basePct.toFixed(2)}%` },
    { label: "Target Variable Pay (Bonus/Commission)", amount: `$${variable.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, pct: `${variablePct.toFixed(2)}%` },
    { label: "Total Target Compensation (TTC)", amount: `$${ttc.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, pct: "100.00%", isTotal: true, colorClass: "text-emerald-500 font-bold" },
  ];

  return { base, variable, ttc, basePct, variablePct, payMix, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  base: "80000",
  variable: "20000",
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

export default function VariablePayPercentageCalculator() {
  const [base, setBase] = useState(DEFAULTS.base);
  const [variable, setVariable] = useState(DEFAULTS.variable);
  
  const [results, setResults] = useState<VariablePayResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateVariablePay(
      parseFloat(base) || 0, 
      parseFloat(variable) || 0
    ));
  };

  const handleReset = () => {
    setBase(DEFAULTS.base); setVariable(DEFAULTS.variable);
    setResults(calculateVariablePay(80000, 20000));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Pay Mix Calculator</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Variable Pay Percentage" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Variable Pay Percentage Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <HandCoins className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Compensation Plan</h2>
            </div>
            
            <CompactInput id="base" label="Annual Base Salary" value={base} onChange={setBase} prefix="$" tooltip="Your fixed, guaranteed annual salary." />
            <CompactInput id="var" label="Target Variable Pay" value={variable} onChange={setVariable} prefix="$" tooltip="Your expected annual bonus, commission, or performance-based pay at 100% target achievement." />

            <div className="p-3 mt-1 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground font-medium">
              HR professionals refer to the ratio between base and variable pay as the "Pay Mix".
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
                
                <div className={`border-l-4 rounded-lg p-5 relative bg-emerald-500/10 border-emerald-500/30`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-emerald-600 transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Target Pay Mix (Base/Variable)
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 text-emerald-600`}>
                    {results.payMix}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Total Target Comp: <span className="font-bold text-foreground">${results.ttc.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Compensation Item</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Percent</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Target Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className="text-[13px] py-3 px-3">{item.label}</td>
                            <td className="text-[13px] py-3 px-3 text-right text-muted-foreground">{item.pct}</td>
                            <td className={`text-[13px] py-3 px-3 text-right ${item.colorClass || ""}`}>{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Compensation Distribution</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={results.chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {results.chartData.map((entry, index) => (
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
            <h2 className="text-2xl font-bold mb-3">What is a Target Pay Mix?</h2>
            <p>In Human Resources and compensation planning, the <strong>Pay Mix</strong> is the ratio of guaranteed Base Salary to at-risk Variable Pay (like bonuses, commissions, and profit-sharing). It is formally expressed as a ratio totaling 100, such as <strong>80/20</strong> or <strong>60/40</strong>.</p>
            <p>For example, if you have an $80,000 base salary and a $20,000 target commission, your Total Target Compensation (TTC) is $100,000. Your pay mix is exactly 80/20.</p>
            
            <h3>Understanding Total Target Compensation (TTC)</h3>
            <p>When recruiters discuss roles with high variable pay, they often speak in terms of <strong>OTE (On-Target Earnings)</strong> or <strong>TTC (Total Target Compensation)</strong>. This is the amount of money you will earn if you hit exactly 100% of your performance goals or sales quotas. It is critical to understand that the variable portion is <em>at-risk</em>—if you underperform, you might only take home your base salary.</p>

            <h2 className="text-2xl font-bold mb-3">Standard Industry Pay Mixes</h2>
            <p>The "ideal" pay mix changes drastically depending on the role and how much direct influence the employee has over revenue generation:</p>
            <ul>
              <li><strong>90/10 or 85/15:</strong> Typical for corporate staff (Marketing, HR, Finance, Engineering). The vast majority of pay is guaranteed, with a small end-of-year bonus tied to overall company performance.</li>
              <li><strong>70/30 to 60/40:</strong> Typical for Account Executives and Enterprise Sales. The base salary is comfortable, but a massive portion of the incentive relies on closing deals.</li>
              <li><strong>50/50:</strong> Highly aggressive sales roles (e.g., SaaS Hunters, Software Sales). Half of the expected compensation is entirely at-risk.</li>
              <li><strong>100% Commission:</strong> Pure eat-what-you-kill roles (e.g., Real Estate Agents). There is zero base salary, meaning infinite upside but no downside protection.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Why Employers Use Variable Pay</h2>
            <p>From a corporate finance perspective, variable pay is a brilliant tool. It aligns the employee's financial interests directly with the company's goals. More importantly, it turns fixed costs (salaries) into variable costs. If the company has a bad year and revenue drops, payroll expenses automatically drop as well because fewer bonuses and commissions are paid out, protecting the company's margin of safety.</p>
          </section>
          <FAQSection faqs={[
            { question: "Are equity grants (RSUs/Options) considered variable pay?", answer: "While equity is absolutely part of Total Compensation, it is usually modeled separately from the Base/Variable 'Pay Mix' because equity payouts are tied to stock market performance over a multi-year vesting schedule, rather than immediate operational KPIs." },
            { question: "Is variable pay taxed differently?", answer: "Yes and no. When a bonus or commission is paid, it is often subject to a mandatory 'supplemental withholding rate' (often 22% in the US), which makes it feel like it's taxed higher. However, at the end of the year, all your income is lumped together and taxed at your standard marginal rate." },
            { question: "What does 'uncapped commission' mean?", answer: "It means there is no ceiling on your variable pay. In an 80/20 mix, you hit your $20,000 target by achieving 100% of quota. If commission is uncapped and you hit 200% of quota, you might earn $40,000 or more in variable pay." },
          ]} pageUrl="https://racira.com/calculator/variable-pay-percentage-calculator" />
          <PopularCalculators exclude="/calculator/variable-pay-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
