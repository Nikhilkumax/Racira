"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CollegeSavingResult {
  totalCostToday: number;
  totalCostFuture: number;
  currentShortfall: number;
  monthlyRequired: number;
  annualRequired: number;
  futureValue: number;
  chartData: { year: number; savings: number; target: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcCollegeSaving(annualCostToday: number, yearsUntilCollege: number, collegeDuration: number, currentSavings: number, returnRate: number, tuitionInflation: number): CollegeSavingResult {
  const r = returnRate / 100 / 12;
  const rTuition = tuitionInflation / 100;
  const n = yearsUntilCollege * 12;

  const totalCostToday = annualCostToday * collegeDuration;
  // Future cost accounting for tuition inflation
  let totalCostFuture = 0;
  for (let y = 0; y < collegeDuration; y++) {
    totalCostFuture += annualCostToday * Math.pow(1 + rTuition, yearsUntilCollege + y);
  }

  const fvCurrentSavings = currentSavings * Math.pow(1 + returnRate / 100, yearsUntilCollege);
  const shortfall = Math.max(0, totalCostFuture - fvCurrentSavings);

  const monthlyRequired = r > 0 && shortfall > 0 ? shortfall * r / (Math.pow(1 + r, n) - 1) : shortfall / n;
  const annualRequired = monthlyRequired * 12;
  const futureValue = fvCurrentSavings + (r > 0 ? monthlyRequired * (Math.pow(1 + r, n) - 1) / r : monthlyRequired * n);

  const chartData: { year: number; savings: number; target: number }[] = [];
  let savBal = currentSavings;
  for (let y = 0; y <= yearsUntilCollege; y++) {
    let target = 0;
    for (let c = 0; c < collegeDuration; c++) {
      target += annualCostToday * Math.pow(1 + rTuition, y + c);
    }
    chartData.push({ year: y, savings: Math.round(savBal), target: Math.round(target) });
    savBal = savBal * (1 + returnRate / 100) + annualRequired;
  }

  const breakdown = [
    { label: "Annual College Cost (Today)", value: `$${annualCostToday.toLocaleString()}` },
    { label: "Duration", value: `${collegeDuration} years` },
    { label: "Total Cost Today", value: `$${totalCostToday.toLocaleString()}` },
    { label: "Years Until College", value: `${yearsUntilCollege} years` },
    { label: "Tuition Inflation Rate", value: `${tuitionInflation}%/year` },
    { label: "Total Future Cost", value: `$${totalCostFuture.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Current Savings (Grown)", value: `$${fvCurrentSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Shortfall", value: `$${shortfall.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Monthly Savings Required", value: `$${monthlyRequired.toFixed(2)}` },
    { label: "Annual Savings Required", value: `$${annualRequired.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Future Total Cost", value: `$${totalCostFuture.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Monthly Required", value: `$${monthlyRequired.toFixed(2)}` },
    { label: "Annual Required", value: `$${annualRequired.toFixed(0)}` },
    { label: "Current Savings Growth", value: `$${fvCurrentSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Shortfall to Cover", value: `$${shortfall.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Return Rate", value: `${returnRate}%` },
  ];

  return { totalCostToday, totalCostFuture, currentShortfall: shortfall, monthlyRequired, annualRequired, futureValue, chartData, breakdown, summaryStats };
}

const DEFAULTS = { cost: "35000", years: "14", duration: "4", current: "15000", returnRate: "7", inflation: "6" };

export default function CollegeSavingsCalculator() {
  const [cost, setCost] = useState(DEFAULTS.cost);
  const [years, setYears] = useState(DEFAULTS.years);
  const [duration, setDuration] = useState(DEFAULTS.duration);
  const [current, setCurrent] = useState(DEFAULTS.current);
  const [returnRate, setReturnRate] = useState(DEFAULTS.returnRate);
  const [inflation, setInflation] = useState(DEFAULTS.inflation);
  const [result, setResult] = useState<CollegeSavingResult | null>(null);

  const calculate = () => setResult(calcCollegeSaving(parseFloat(cost) || 35000, parseInt(years) || 14, parseInt(duration) || 4, parseFloat(current) || 15000, parseFloat(returnRate) || 7, parseFloat(inflation) || 6));
  const reset = () => { setCost(DEFAULTS.cost); setYears(DEFAULTS.years); setDuration(DEFAULTS.duration); setCurrent(DEFAULTS.current); setReturnRate(DEFAULTS.returnRate); setInflation(DEFAULTS.inflation); setResult(calcCollegeSaving(35000, 14, 4, 15000, 7, 6)); };
  useEffect(() => { setResult(calcCollegeSaving(35000, 14, 4, 15000, 7, 6)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How much does college cost on average?", answer: "2024–2025 average annual costs (tuition + fees + room & board): Public in-state: ~$28,000. Public out-of-state: ~$45,000. Private nonprofit: ~$60,000. Elite private: $85,000+. 4-year total: $112,000–$340,000+. With historical 6% tuition inflation, costs for a child born today reaching college age (18 years) will be 2.85x higher than current costs." },
    { question: "What is a 529 plan?", answer: "A 529 plan is a tax-advantaged savings account specifically for education expenses. Contributions grow tax-free, and withdrawals for qualified education expenses (tuition, fees, books, room & board) are tax-free. Many states offer state income tax deductions for contributions. The 529 can also be used for K-12 tuition (up to $10,000/year) and student loan repayment (up to $10,000 lifetime)." },
    { question: "How much should I save per month for college?", answer: "College savings goals vary by timeline. For a newborn targeting $100,000 in 18 years at 7%: ~$260/month. For a 5-year-old (13 years): ~$390/month. For a 10-year-old (8 years): ~$700/month. Starting early matters enormously — early contributions have more time to compound." },
    { question: "Can financial aid offset college costs?", answer: "Yes — financial aid significantly impacts the real cost: Grants and scholarships don't require repayment. Work-study provides part-time employment income. Federal loans at subsidized rates. Merit aid is available regardless of financial need at many schools. FAFSA determines federal aid eligibility. 529 savings affect aid calculations — they're counted as parent assets (5.64% maximum impact on Expected Family Contribution) rather than student assets." },
    { question: "What happens to 529 funds if my child doesn't go to college?", answer: "Options: Change the beneficiary to another family member (sibling, cousin, even yourself) with no penalty. Rollover up to $35,000 to a Roth IRA starting 2024 (SECURE 2.0) after the account is 15+ years old. Withdraw for non-qualified expenses — earnings portion is taxed and subject to 10% penalty. Use for apprenticeship programs, trade school, or foreign universities." },
    { question: "Is it worth saving in a 529 vs. a regular investment account?", answer: "529 advantages: tax-free growth and withdrawals for education. State income tax deductions (in most states). Drawbacks: 10% penalty on non-qualified withdrawals. Generally, 529 is better for planned education expenses, while a taxable account offers more flexibility. Many families do both — 529 for planned education, regular investments for everything else." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "College Savings Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">College Savings Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Annual College Cost (Today)</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={cost} onChange={e => setCost(e.target.value)} className={ci} /></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Years Until College</label><div className={inp}><input type="number" value={years} onChange={e => setYears(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">College Duration</label><div className={inp}><input type="number" value={duration} onChange={e => setDuration(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Current Savings</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={current} onChange={e => setCurrent(e.target.value)} className={ci} /></div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Investment Return</label><div className={inp}><input type="number" value={returnRate} onChange={e => setReturnRate(e.target.value)} step={0.5} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Tuition Inflation</label><div className={inp}><input type="number" value={inflation} onChange={e => setInflation(e.target.value)} step={0.5} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm"><Calculator className="h-4 w-4" /> Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Savings Required</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.monthlyRequired.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground mt-1">Total future cost: ${result.totalCostFuture.toLocaleString("en-US", { maximumFractionDigits: 0 })} · Shortfall: ${result.currentShortfall.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Future Total Cost", `$${result.totalCostFuture.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Shortfall", `$${result.currentShortfall.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Annual Savings", `$${result.annualRequired.toFixed(0)}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Savings Plan Details</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Monthly Savings Required" ? "font-bold text-primary" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Savings Progress Projection</h3>
                <ResponsiveContainer width="100%" height={220}><AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} /><Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} /><Area type="monotone" dataKey="target" name="Future Cost" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeDasharray="5 5" strokeWidth={2} /><Area type="monotone" dataKey="savings" name="Savings" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} /></AreaChart></ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>What Is a College Savings Calculator?</h2>
            <p>A <strong>college savings calculator</strong> projects the future cost of higher education (accounting for historical tuition inflation of 5–7% annually) and calculates the exact monthly savings needed to fund your child&apos;s education. It factors in your current savings, investment returns, and tuition inflation to give you a realistic, actionable savings target.</p>
            <h2>Why Tuition Inflation Matters</h2>
            <p>College costs have risen 5–7% annually for decades — roughly double general inflation. A $35,000/year program today will cost ~$88,000/year in 18 years at 5% inflation, or ~$100,000 at 6% inflation. The earlier you start saving, the less you need to save monthly because your investments grow alongside (or faster than) tuition increases.</p>
            <h2>The 529 Plan Advantage</h2>
            <p>529 plans offer federal tax-free growth and withdrawals for qualified education expenses. Many states offer income tax deductions for contributions. 2024 SECURE 2.0 addition: up to $35,000 can be rolled to a Roth IRA after 15 years, eliminating the "what if they don&apos;t attend college" risk. Start a 529 immediately — even small contributions benefit from decades of tax-free compounding.</p>
            <h2>Maximizing College Savings</h2>
            <p>Open a 529 at birth. Contribute regularly even if small. Ask grandparents to contribute to the 529 instead of holiday gifts. Apply for FAFSA even if you think you won&apos;t qualify. Consider community college for the first 2 years, then transfer. Explore merit scholarships early — many are available to high school freshmen and sophomores.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/college-savings-calculator" />
          <PopularCalculators exclude="/calculator/college-savings-calculator" />
        </div>
      </div>
    </>
  );
}
