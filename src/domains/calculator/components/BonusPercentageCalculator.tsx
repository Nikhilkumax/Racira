"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Award, Printer, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface BonusResults {
  targetBonusAmt: number;
  actualBonusAmt: number;
  effectivePct: number;
  payoutRatio: number;
  chartData: { name: string; amount: number; fill: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateBonus = (base: number, targetPct: number, corpMult: number, indvMult: number): BonusResults => {
  const targetBonusAmt = base * (targetPct / 100);
  const actualBonusAmt = targetBonusAmt * (corpMult / 100) * (indvMult / 100);
  
  const effectivePct = base > 0 ? (actualBonusAmt / base) * 100 : 0;
  const payoutRatio = targetBonusAmt > 0 ? (actualBonusAmt / targetBonusAmt) * 100 : 0;

  const chartData = [
    { name: "Target Bonus", amount: targetBonusAmt, fill: "hsl(var(--muted))" },
    { name: "Actual Payout", amount: actualBonusAmt, fill: actualBonusAmt >= targetBonusAmt ? "hsl(var(--emerald-500, 150 84% 39%))" : "hsl(var(--amber-500, 45 93% 47%))" },
  ];

  const summaryStats = [
    { label: "Target Bonus", value: `$${targetBonusAmt.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Actual Payout", value: `$${actualBonusAmt.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Effective %", value: `${effectivePct.toFixed(2)}%` },
    { label: "Payout Ratio", value: `${payoutRatio.toFixed(1)}%` },
  ];

  const breakdown = [
    { label: "Annual Base Salary", amount: `$${base.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Target Bonus Percentage", amount: `${targetPct.toFixed(2)}%` },
    { label: "Unadjusted Target Bonus", amount: `$${targetBonusAmt.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Corporate Performance Multiplier", amount: `x ${(corpMult/100).toFixed(2)}` },
    { label: "Individual Performance Multiplier", amount: `x ${(indvMult/100).toFixed(2)}` },
    { label: "Final Actual Bonus Payout", amount: `$${actualBonusAmt.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-emerald-500 font-bold" },
  ];

  return { targetBonusAmt, actualBonusAmt, effectivePct, payoutRatio, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  base: "100000",
  targetPct: "15",
  corpMult: "110",
  indvMult: "95",
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

export default function BonusPercentageCalculator() {
  const [base, setBase] = useState(DEFAULTS.base);
  const [targetPct, setTargetPct] = useState(DEFAULTS.targetPct);
  const [corpMult, setCorpMult] = useState(DEFAULTS.corpMult);
  const [indvMult, setIndvMult] = useState(DEFAULTS.indvMult);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [results, setResults] = useState<BonusResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateBonus(
      parseFloat(base) || 0, 
      parseFloat(targetPct) || 0,
      parseFloat(corpMult) || 0,
      parseFloat(indvMult) || 0
    ));
  };

  const handleReset = () => {
    setBase(DEFAULTS.base); setTargetPct(DEFAULTS.targetPct); setCorpMult(DEFAULTS.corpMult); setIndvMult(DEFAULTS.indvMult);
    setResults(calculateBonus(100000, 15, 110, 95));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Bonus Calculator</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Bonus Percentage" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Bonus Percentage & Payout Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Compensation Inputs</h2>
            </div>
            
            <CompactInput id="base" label="Annual Base Salary" value={base} onChange={setBase} prefix="$" tooltip="Your fixed annual salary before taxes." />
            <CompactInput id="tgt" label="Target Bonus Percentage" value={targetPct} onChange={setTargetPct} suffix="%" tooltip="Your stated bonus target (e.g., 10%, 15%, 20% of base salary)." />

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-2 focus:outline-none">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="corp" label="Company Performance Multiplier" value={corpMult} onChange={setCorpMult} suffix="%" tooltip="Did the company hit its revenue goals? Enter 100% for on-target, 120% for over-achievement, 80% for under-achievement." />
                  <CompactInput id="indv" label="Individual Performance Multiplier" value={indvMult} onChange={setIndvMult} suffix="%" tooltip="Did you hit your personal KPIs? Enter 100% for Meets Expectations, 110% for Exceeds." />
                  <div className="text-xs text-muted-foreground text-center mt-1">
                    Most corporate bonuses are multiplied by both Company and Individual performance.
                  </div>
                </div>
              )}
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
                
                <div className={`border-l-4 rounded-lg p-5 relative ${results.payoutRatio >= 100 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Actual Bonus Payout
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.payoutRatio >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    ${results.actualBonusAmt.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Effective Bonus Percentage: <span className="font-bold text-foreground">{results.effectivePct.toFixed(2)}% of Base</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Calculation Step</th>
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
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Target vs Actual Payout</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                          <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      If multipliers are below 100%, the actual payout will be less than the target.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        <div className="racira-page-container mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground max-w-[1180px]">
            <div>
              <h2 className="text-2xl font-bold mb-3">How Corporate Bonuses Work</h2>
              <p className="text-muted-foreground leading-relaxed">Unlike fixed commissions where you earn a specific dollar amount per sale, corporate bonuses are typically calculated as a percentage of your base salary, and then adjusted based on performance multipliers. Your offer letter usually states a "Target Bonus." For example, a Senior Manager making $100,000 might have a 15% Target Bonus. This means if everything goes exactly according to plan, they will receive $15,000 at the end of the year.</p>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-3">The Multipliers: Why Your Check Might Be Smaller (or Larger)</h2>
              <p className="text-muted-foreground leading-relaxed">Very rarely does an employee receive exactly their target bonus. Most enterprise companies use a formula that multiplies your target bonus by two factors: Company Performance and Individual Performance. If the company missed its revenue or EBITDA goals for the year, the bonus pool might only fund at 80%. Conversely, if the company crushes its goals, it might fund at 120%. This is tied to your annual performance review. If you meet expectations, you get 100%. If you exceed expectations, you might get 110% or 120%. If you need improvement, you might get 50% or 0%.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">For example, if you have a $15,000 target bonus and the company had a rough year and funded the pool at 80%, but you personally had an amazing year and got a 115% individual multiplier, your final payout would be $15,000 × 0.80 × 1.15 = $13,800 final payout.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Bonuses and Taxes</h2>
              <p className="text-muted-foreground leading-relaxed">It is critical to remember that bonuses are subject to standard income taxes. In the United States, employers are required to withhold a flat 22% supplemental tax rate on bonuses under $1 million, plus Social Security (6.2%), Medicare (1.45%), and any state taxes. Therefore, it is very common to only take home 55% to 65% of your gross bonus amount in your actual bank account. Any over-withheld amounts are returned as part of your tax refund when you file your annual return.</p>
            </div>
          </section>
          <FAQSection faqs={[
            { question: "Can a performance multiplier be 0%?", answer: "Yes. Many companies have a 'threshold' or 'gate'. If the company misses its minimum revenue target, the corporate multiplier drops to 0%, meaning no one gets a bonus regardless of personal performance." },
            { question: "Is my bonus guaranteed?", answer: "Usually not. Unless your contract explicitly states it is a 'Guaranteed Bonus' or a 'Sign-On Bonus', annual performance bonuses are considered discretionary and depend entirely on the company's financial health." },
            { question: "Why is the tax withheld on my bonus so high?", answer: "The IRS considers bonuses 'supplemental wages' and mandates a flat 22% withholding rate to prevent under-withholding. However, when you file your taxes at the end of the year, the bonus is lumped in with your normal salary and taxed at your standard marginal rate. If too much was withheld, you get it back in your tax refund." },
          ]} pageUrl="https://racira.com/calculator/bonus-percentage-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Bonus Percentage Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Bonus Percentage Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Bonus Percentage Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Bonus Percentage Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Bonus Percentage Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/bonus-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
