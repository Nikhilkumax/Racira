"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { RotateCcw } from "lucide-react";

// 1. TypeScript interfaces
interface ArrResults {
  currentArr: number;
  netMrrGrowth: number;
  projectedArrOneYear: number;
  netRetentionRate: number;
  annualChurnLoss: number;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateArr = (inputs: typeof DEFAULTS): ArrResults => {
  const currentMrr = parseFloat(inputs.currentMrr);
  const newBusinessMrr = parseFloat(inputs.newBusinessMrr);
  const expansionMrr = parseFloat(inputs.expansionMrr);
  const churnedMrr = parseFloat(inputs.churnedMrr);
  const contractionMrr = parseFloat(inputs.contractionMrr);

  if ([currentMrr, newBusinessMrr, expansionMrr, churnedMrr, contractionMrr].some(v => isNaN(v) || v < 0)) {
    return { currentArr: 0, netMrrGrowth: 0, projectedArrOneYear: 0, netRetentionRate: 0, annualChurnLoss: 0, chartData: [], schedule: [], isError: true, errorMsg: "All inputs must be valid positive numbers." };
  }

  // Current ARR
  const currentArr = currentMrr * 12;

  // Net MRR Growth
  const netMrrGrowth = newBusinessMrr + expansionMrr - churnedMrr - contractionMrr;
  
  // Net Retention Rate (NRR) = (Current MRR + Expansion - Churn - Contraction) / Current MRR
  let netRetentionRate = 0;
  if (currentMrr > 0) {
    netRetentionRate = ((currentMrr + expansionMrr - churnedMrr - contractionMrr) / currentMrr) * 100;
  }

  // Monthly Growth Rate (Net)
  let monthlyGrowthRate = 0;
  if (currentMrr > 0) {
    monthlyGrowthRate = netMrrGrowth / currentMrr;
  }

  // Projected ARR in one year
  // Compound the growth over 12 months
  let projectedMrr = currentMrr;
  const chartData = [];
  const schedule = [];
  
  chartData.push({
    month: "Now",
    "Projected ARR": Math.round(projectedMrr * 12)
  });

  for (let m = 1; m <= 12; m++) {
    // If we assume linear absolute net growth:
    // projectedMrr += netMrrGrowth;
    // If we assume compounding relative growth:
    projectedMrr = projectedMrr * (1 + monthlyGrowthRate);
    
    chartData.push({
      month: `Month ${m}`,
      "Projected ARR": Math.round(projectedMrr * 12)
    });
    
    if (m % 3 === 0) {
      schedule.push({
        quarter: `Q${m/3}`,
        mrr: Math.round(projectedMrr),
        arr: Math.round(projectedMrr * 12)
      });
    }
  }
  
  const projectedArrOneYear = projectedMrr * 12;

  // Annualized Churn Loss
  // (Churn + Contraction) * 12
  const annualChurnLoss = (churnedMrr + contractionMrr) * 12;

  return {
    currentArr: Math.round(currentArr),
    netMrrGrowth: Math.round(netMrrGrowth),
    projectedArrOneYear: Math.round(projectedArrOneYear),
    netRetentionRate: Number(netRetentionRate.toFixed(2)),
    annualChurnLoss: Math.round(annualChurnLoss),
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  currentMrr: "50000",
  newBusinessMrr: "5000",
  expansionMrr: "2000",
  churnedMrr: "1500",
  contractionMrr: "500",
  showAdvanced: false
};

const CompactInput = ({ id, label, value, onChange, placeholder, prefix, suffix, type = "number", step = "any" }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{prefix}</span>}
      <input id={id} type={type} step={step} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function AnnualRecurringRevenueCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<ArrResults>(calculateArr(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string | boolean) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    if (key !== 'showAdvanced') {
      const r = calculateArr(newInputs);
      if (!r.isError) setResults(r);
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateArr(DEFAULTS));
  };

  const faqs = [
    { question: "What is Annual Recurring Revenue (ARR)?", answer: "ARR is a key metric used by subscription-based businesses (like SaaS companies) that shows the annualized value of their recurring subscription revenue. It provides a predictable measure of revenue for the upcoming 12 months based on current subscribers." },
    { question: "How do you calculate ARR from MRR?", answer: "The simplest and most standard way to calculate ARR is to take your Monthly Recurring Revenue (MRR) and multiply it by 12. For example, if your current MRR is $10,000, your ARR is $120,000." },
    { question: "Should I include setup fees or consulting in ARR?", answer: "No. ARR should only include fixed, predictable, recurring revenue (like subscriptions or annual maintenance contracts). One-time fees, setup charges, hardware sales, and hourly consulting fees should be excluded because they are not guaranteed to recur." },
    { question: "What is Net Retention Rate (NRR)?", answer: "Net Retention Rate measures the percentage of recurring revenue retained from existing customers over a specific period, including expansions (upsells) and downgrades/cancellations (churn). An NRR over 100% means your existing customer base is growing even without adding any new customers." },
    { question: "What is the difference between Churn and Contraction?", answer: "Churn is when a customer completely cancels their subscription. Contraction is when a customer downgrades to a cheaper plan or reduces their number of licenses, resulting in less revenue but not a total loss of the customer." }
  ];

  if (!mounted) return null;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "ARR Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Annual Recurring Revenue (ARR) Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <p className="text-sm text-muted-foreground mb-2">Calculate your Annual Recurring Revenue and project 12-month compounding growth.</p>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="currentMrr" label="Current Monthly Recurring Revenue (MRR)" value={inputs.currentMrr} onChange={(v: string) => handleChange("currentMrr", v)} prefix="$" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="newBusinessMrr" label="New Business MRR" value={inputs.newBusinessMrr} onChange={(v: string) => handleChange("newBusinessMrr", v)} prefix="+$" />
              <CompactInput id="expansionMrr" label="Expansion MRR (Upsells)" value={inputs.expansionMrr} onChange={(v: string) => handleChange("expansionMrr", v)} prefix="+$" />
            </div>

            <div className="border-t border-border mt-2 pt-4">
              <button onClick={() => handleChange("showAdvanced", !inputs.showAdvanced)} className="flex items-center justify-between w-full text-sm font-semibold text-foreground hover:text-primary transition-colors">
                <span>Churn & Contraction Data</span>
                <span className="text-muted-foreground">{inputs.showAdvanced ? "▼" : "▶"}</span>
              </button>
              
              {inputs.showAdvanced && (
                <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                  <CompactInput id="churnedMrr" label="Churned MRR (Cancellations)" value={inputs.churnedMrr} onChange={(v: string) => handleChange("churnedMrr", v)} prefix="-$" />
                  <CompactInput id="contractionMrr" label="Contraction MRR (Downgrades)" value={inputs.contractionMrr} onChange={(v: string) => handleChange("contractionMrr", v)} prefix="-$" />
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Current ARR</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-4xl font-black text-primary tracking-tighter">${results.currentArr.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm border-l-4 border-emerald-500">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Projected ARR (12 Months)</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-4xl font-black text-emerald-600 dark:text-emerald-500 tracking-tighter">${results.projectedArrOneYear.toLocaleString()}</div>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium mt-1">Assuming compounded net growth</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Net MRR Growth</div>
                    <div className={`text-2xl font-bold ${results.netMrrGrowth >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                      {results.netMrrGrowth >= 0 ? '+' : '-'}${Math.abs(results.netMrrGrowth).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Net Retention (NRR)</div>
                    <div className={`text-2xl font-bold ${results.netRetentionRate >= 100 ? 'text-emerald-500' : 'text-orange-500'}`}>
                      {results.netRetentionRate}%
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Annual Churn Loss</div>
                    <div className="text-2xl font-bold text-destructive">-${results.annualChurnLoss.toLocaleString()}</div>
                  </div>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">ARR 12-Month Projection</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `$${(val/1000)}k`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} width={60} />
                        <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString()}`} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', marginTop: '10px' }} />
                        <Area type="monotone" dataKey="Projected ARR" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.8} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Quarterly Milestones</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Timeline</th>
                          <th className="px-4 py-3 font-semibold text-right">Projected MRR</th>
                          <th className="px-4 py-3 font-semibold text-right text-primary">Projected ARR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row) => (
                          <tr key={row.quarter} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{row.quarter}</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">${row.mrr.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right font-bold text-primary">${row.arr.toLocaleString()}</td>
                          </tr>
                        ))}
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
            <h2>What Is Annual Recurring Revenue (ARR)?</h2>
            <p>Annual Recurring Revenue (ARR) is a key metric used by subscription-based businesses, particularly SaaS (Software as a Service) companies, to measure their predictable and recurring revenue over a 12-month period. It represents the annualized value of active subscriptions and is the most common metric used to value SaaS companies.</p>
            
            <h2>How It Works</h2>
            <p>The standard formula for ARR is incredibly simple: <code>ARR = MRR * 12</code>. To find your MRR (Monthly Recurring Revenue), you sum the monthly fees paid by all active subscribers. If a customer pays an annual fee upfront, you divide that fee by 12 to find their MRR contribution. You should explicitly exclude one-time fees, setup costs, professional services, and non-recurring hardware sales from your ARR calculations.</p>
            
            <h2>Understanding Net MRR Growth</h2>
            <p>To project future ARR, you must understand your Net MRR Growth. This is calculated as: <strong>New Business MRR + Expansion MRR - Churned MRR - Contraction MRR</strong>. New Business comes from brand new customers. Expansion comes from existing customers upgrading their plans. Churn is when customers cancel, and Contraction is when they downgrade. If your Net MRR Growth is positive, your ARR is growing.</p>
            
            <h2>Net Retention Rate (NRR)</h2>
            <p>Net Retention Rate is arguably the second most important metric after ARR. It measures what percentage of revenue you retained from your existing customer base over a period, factoring in both upgrades and cancellations. An NRR of exactly 100% means that expansions perfectly offset churn. Elite SaaS companies often have an NRR above 120%, meaning their existing customer base grows significantly over time without acquiring any new logos.</p>
            
            <h2>Why ARR Matters</h2>
            <p>Predictability is highly valued by investors. Because ARR is recurring by nature, a company with $10M in ARR is generally much more valuable than a traditional company with $10M in one-time product sales. Investors apply "revenue multiples" (often 5x to 15x or more) to a company's ARR to determine its overall enterprise valuation. Tracking ARR helps founders gauge business health, align sales targets, and raise capital.</p>
            
            <h2>Practical Examples</h2>
            <p>If you have 100 customers paying $500 per month, your MRR is $50,000, making your ARR $600,000. Next month, you acquire 5 new customers (+$2,500 MRR), 2 existing customers upgrade (+$1,000 MRR), and 1 customer cancels (-$500 MRR). Your Net MRR Growth is $3,000. Your new MRR is $53,000, making your new ARR $636,000.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/annual-recurring-revenue-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
