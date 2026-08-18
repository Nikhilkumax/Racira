"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface FreelancerRateResult {
  income: number;
  hoursWeek: number;
  weeksYear: number;
  overheadPct: number;
  taxRate: number;
  billableHours: number;
  overheadAmount: number;
  baseRate: number;
  taxInclusiveRate: number;
  annualBillings: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt$(v: number): string {
  return `$${Math.round(v).toLocaleString("en-US")}`;
}

function calcRate(income: number, hoursWeek: number, weeksYear: number, overheadPct: number, taxRate: number): FreelancerRateResult {
  const billableHours = hoursWeek * weeksYear;
  const overheadAmount = income * (overheadPct / 100);
  const baseRate = billableHours > 0 ? (income + overheadAmount) / billableHours : 0;
  const taxInclusiveRate = taxRate < 100 ? baseRate / (1 - taxRate / 100) : 0;
  const annualBillings = baseRate * billableHours;

  const breakdown = [
    { label: "Desired Annual Income", value: fmt$(income) },
    { label: "Billable Hours per Week", value: `${hoursWeek} hrs` },
    { label: "Weeks Worked per Year", value: `${weeksYear} weeks` },
    { label: "Billable Hours per Year", value: `${billableHours} hrs` },
    { label: "Overhead (non-billable costs)", value: `${overheadPct}% → ${fmt$(overheadAmount)}` },
    { label: "Base Hourly Rate", value: `$${baseRate.toFixed(2)}/hr` },
    { label: "Tax-Inclusive Rate (${taxRate}% tax)", value: `$${taxInclusiveRate.toFixed(2)}/hr` },
    { label: "Annual Billings at Base Rate", value: fmt$(annualBillings) },
  ];
  const summaryStats = [
    { label: "Hourly Rate", value: `$${baseRate.toFixed(2)}/hr` },
    { label: "Tax-Inclusive", value: `$${taxInclusiveRate.toFixed(2)}/hr` },
    { label: "Billable Hours", value: `${billableHours}/yr` },
    { label: "Weekly Billings", value: fmt$(baseRate * hoursWeek) },
    { label: "Monthly Billings", value: fmt$((baseRate * billableHours) / 12) },
    { label: "Overhead", value: `${overheadPct}%` },
    { label: "Tax Rate", value: `${taxRate}%` },
    { label: "Hours/Week", value: `${hoursWeek} hrs` },
  ];
  const totalWeekHours = 40;
  const nonBillable = Math.max(0, (totalWeekHours * weeksYear) - billableHours);
  const chartData = [
    { name: "Billable", value: billableHours, fill: "hsl(var(--primary))" },
    { name: "Non-Billable", value: nonBillable, fill: "var(--border)" },
  ];
  return { income, hoursWeek, weeksYear, overheadPct, taxRate, billableHours, overheadAmount, baseRate, taxInclusiveRate, annualBillings, breakdown, summaryStats, chartData };
}

const DEFAULTS = { income: "75000", hoursWeek: "30", weeksYear: "48", overhead: "20", tax: "25" };

export default function FreelancerRateCalculator() {
  const [income, setIncome] = useState(DEFAULTS.income);
  const [hoursWeek, setHoursWeek] = useState(DEFAULTS.hoursWeek);
  const [weeksYear, setWeeksYear] = useState(DEFAULTS.weeksYear);
  const [overhead, setOverhead] = useState(DEFAULTS.overhead);
  const [tax, setTax] = useState(DEFAULTS.tax);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<FreelancerRateResult | null>(null);

  const inc = parseFloat(income) || 0;
  const hw = parseFloat(hoursWeek) || 0;
  const wy = parseFloat(weeksYear) || 0;
  const oh = parseFloat(overhead) || 0;
  const tx = parseFloat(tax) || 0;
  const errs: string[] = [];
  if (inc <= 0) errs.push("Desired annual income must be greater than 0.");
  if (hw <= 0 || hw > 168) errs.push("Billable hours per week must be between 0 and 168.");
  if (wy < 1 || wy > 52) errs.push("Weeks per year must be between 1 and 52.");
  if (oh < 0 || oh > 200) errs.push("Overhead must be between 0% and 200%.");
  if (tx < 0 || tx >= 100) errs.push("Tax rate must be between 0% and 100%.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcRate(inc, hw, wy, oh, tx)); };
  const reset = () => {
    setIncome(DEFAULTS.income); setHoursWeek(DEFAULTS.hoursWeek); setWeeksYear(DEFAULTS.weeksYear); setOverhead(DEFAULTS.overhead); setTax(DEFAULTS.tax);
    setResult(calcRate(75000, 30, 48, 20, 25));
  };
  useEffect(() => { setResult(calcRate(75000, 30, 48, 20, 25)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How many hours can I actually bill?", answer: "Freelancers typically bill 60–75% of a 40-hour week: the rest goes to proposals, admin, and marketing. Thirty billable hours a week is a realistic planning figure." },
    { question: "Why add overhead to the rate?", answer: "Software, insurance, hardware, and self-employment taxes are costs employees never see. Marking the rate up by an overhead percentage ensures the income target survives those expenses." },
    { question: "What is a tax-inclusive rate?", answer: "If 25% of earnings go to taxes, charging 1.33× the base rate means the after-tax take-home matches your income goal. It keeps the target honest instead of optimistic." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Freelancer Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Freelancer Rate Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Desired Annual Income</label>
                <div className={inp}><input type="number" value={income} onChange={e => setIncome(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Billable Hours per Week</label>
                <div className={inp}><input type="number" value={hoursWeek} onChange={e => setHoursWeek(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">hrs</span></div>
              </div>
              <div>
                <label className={lbl}>Weeks Worked per Year</label>
                <div className={inp}><input type="number" value={weeksYear} onChange={e => setWeeksYear(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">weeks</span></div>
              </div>
              <div>
                <label className={lbl}>Overhead</label>
                <div className={inp}><input type="number" value={overhead} onChange={e => setOverhead(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdv(o => !o)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 self-start"
            >
              Advanced Options
              <span className={`transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Taxes</div>
                  <div>
                    <label className={lbl}>Effective Tax Rate</label>
                    <div className={inp}><input type="number" value={tax} onChange={e => setTax(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                    <p className="text-xs text-muted-foreground mt-1.5">Self-employment tax plus income tax. Used to compute the tax-inclusive rate.</p>
                  </div>
                </div>
              </div>
            )}
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Recommended Hourly Rate</div>
                <div className="text-4xl font-extrabold tracking-tight">${result.baseRate.toFixed(2)}<span className="text-2xl">/hr</span></div>
                <div className="text-sm text-muted-foreground mt-1">{result.billableHours} billable hrs/yr · tax-inclusive ${result.taxInclusiveRate.toFixed(2)}/hr</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Tax-Inclusive Rate`, `$${result.taxInclusiveRate.toFixed(2)}/hr`], ["Billable Hours", `${result.billableHours}/yr`], ["Annual Billings", fmt$(result.annualBillings)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Rate Build-Up</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 5 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 5 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Workweek Split</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v} hrs/yr`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Billable vs non-billable hours over the year</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">From Income Target to Hourly Rate</h2>
            <p>This <strong>freelancer rate calculator</strong> divides your desired annual income plus an overhead markup by the hours you can actually bill: desired income × (1 + overhead) ÷ (billable hours per week × weeks per year). The result is the minimum rate that keeps your business viable.</p>
            <h2 className="text-2xl font-bold mb-3">Billable Reality Check</h2>
            <p>Administration, proposals, marketing, and unpaid client communication typically consume 25–40% of a 40-hour week. Basing your rate on 30 billable hours instead of 40 is the difference between a rate that covers your life and one that covers your dreams only on paper.</p>
            <h2 className="text-2xl font-bold mb-3">The Tax Adjustment</h2>
            <p>Self-employed workers pay both halves of payroll tax. The tax-inclusive rate divides the base rate by (1 − tax rate), so that after taxes your take-home still meets the income goal.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/freelancer-rate-calculator" />
          <PopularCalculators exclude="/calculator/freelancer-rate-calculator" />
        </div>
      </div>
    </>
  );
}
