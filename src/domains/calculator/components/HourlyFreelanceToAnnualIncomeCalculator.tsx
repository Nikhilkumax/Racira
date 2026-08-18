"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface FreelanceInput {
  hourlyRate: number;
  hoursPerWeek: number;
  weeksPerYear: number;
}

interface FreelanceResult {
  annualGross: number;
  monthlyGross: number;
  weeklyGross: number;
  billablePct: number;
  nonBillableHours: number;
  donutData: { name: string; value: number; color: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcFreelance(input: FreelanceInput): FreelanceResult {
  const weeklyGross = input.hourlyRate * input.hoursPerWeek;
  const annualGross = weeklyGross * input.weeksPerYear;
  const monthlyGross = annualGross / 12;
  const nonBillableHours = Math.max(0, 40 - input.hoursPerWeek);
  const billablePct = (input.hoursPerWeek / 40) * 100;

  const donutData = [
    { name: "Billable Hours", value: Number(input.hoursPerWeek.toFixed(1)), color: "hsl(var(--primary))" },
    { name: "Non-Billable (40-hr wk)", value: Number(nonBillableHours.toFixed(1)), color: "#f59e0b" },
  ];

  const breakdown = [
    { label: "Hourly Rate", value: `$${input.hourlyRate.toFixed(2)}` },
    { label: "Billable Hours / Week", value: `${input.hoursPerWeek.toFixed(1)} hrs` },
    { label: "Weeks Worked / Year", value: `${input.weeksPerYear.toFixed(0)} weeks` },
    { label: "Weekly Gross Income", value: `$${weeklyGross.toLocaleString()}` },
    { label: "Monthly Gross Income", value: `$${monthlyGross.toLocaleString()}` },
    { label: "Annual Gross Income", value: `$${annualGross.toLocaleString()}` },
    { label: "Utilization (of 40-hr week)", value: `${billablePct.toFixed(0)}%` },
  ];

  const summaryStats = [
    { label: "Annual Gross", value: `$${annualGross.toLocaleString()}` },
    { label: "Monthly Gross", value: `$${monthlyGross.toLocaleString()}` },
    { label: "Weekly Gross", value: `$${weeklyGross.toLocaleString()}` },
    { label: "Hourly Rate", value: `$${input.hourlyRate.toFixed(2)}` },
    { label: "Utilization", value: `${billablePct.toFixed(0)}%` },
    { label: "Est. After-Tax (25%)", value: `$${(annualGross * 0.75).toLocaleString()}` },
  ];

  return { annualGross, monthlyGross, weeklyGross, billablePct, nonBillableHours, donutData, breakdown, summaryStats };
}

const DEFAULTS: FreelanceInput = { hourlyRate: 65, hoursPerWeek: 30, weeksPerYear: 48 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function HourlyFreelanceToAnnualIncomeCalculator() {
  const [rate, setRate] = useState(String(DEFAULTS.hourlyRate));
  const [hours, setHours] = useState(String(DEFAULTS.hoursPerWeek));
  const [weeks, setWeeks] = useState(String(DEFAULTS.weeksPerYear));
  const [result, setResult] = useState<FreelanceResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcFreelance({ hourlyRate: parse(rate, DEFAULTS.hourlyRate), hoursPerWeek: Math.min(168, parse(hours, DEFAULTS.hoursPerWeek)), weeksPerYear: Math.min(52, parse(weeks, DEFAULTS.weeksPerYear)) }));
  const reset = () => {
    setRate(String(DEFAULTS.hourlyRate));
    setHours(String(DEFAULTS.hoursPerWeek));
    setWeeks(String(DEFAULTS.weeksPerYear));
    setResult(calcFreelance(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcFreelance(DEFAULTS));
  }, []);

  const faqs = [
    { question: "How do I convert my hourly freelance rate to annual income?", answer: "Multiply your hourly rate by billable hours per week, then by weeks worked per year. At $65/hour for 30 billable hours over 48 weeks: $65 × 30 × 48 = $93,600 gross annual income. This equals about $7,800 per month." },
    { question: "How many billable hours should I assume?", answer: "Freelancers rarely bill a full 40-hour week — admin, marketing, proposals, and unbilled calls consume 25–40% of working time. A realistic 25–32 billable hours per week is standard for established freelancers. Beginners often bill 15–20 until the pipeline fills." },
    { question: "Why only 48 weeks per year?", answer: "Almost no one bills 52 weeks. Between vacations, sick days, holidays, and slow periods, 46–48 billable weeks is realistic for a full-time freelancer. Part-time freelancers might bill 30–40 weeks. Use the number that matches your actual track record." },
    { question: "What is utilization rate?", answer: "Utilization = billable hours ÷ total available working hours (usually a 40-hour week). A 30-hour billable week is 75% utilization — the benchmark most agencies and strong freelancers target. Below 60%, either rates are too low or too much time goes to non-billable work." },
    { question: "How do taxes affect freelance income?", answer: "Freelancers pay self-employment tax (15.3% in the US) plus income tax, so a 25–35% effective rate is common — this calculator shows an illustrative 25% after-tax estimate. Set aside taxes quarterly and deduct business expenses to reduce the taxable base." },
    { question: "How much should I charge per hour?", answer: "Work backward from your target income: (target ÷ billable hours ÷ weeks) × (1 + tax rate). For $100,000 take-home at 30 hours × 48 weeks with 30% taxes: roughly $97/hour. Also benchmark your niche — $50–$150/hour spans most freelance disciplines." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Hourly Freelance to Annual Income Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Hourly Freelance to Annual Income Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Hourly Rate</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={rate} onChange={(e) => setRate(e.target.value)} step={1} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Billable Hours / Week</label>
                <div className={inp}><input type="number" value={hours} onChange={(e) => setHours(e.target.value)} step={1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">hrs</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Weeks Worked / Year</label>
                <div className={inp}><input type="number" value={weeks} onChange={(e) => setWeeks(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">wks</span></div>
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Annual Gross Income</div>
                  <div className="text-4xl font-extrabold tracking-tight">${result.annualGross.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground mt-1">≈ ${result.monthlyGross.toLocaleString()}/month · Est. after-tax: ${result.summaryStats[5].value}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Monthly", `$${result.monthlyGross.toLocaleString()}`], ["Weekly", `$${result.weeklyGross.toLocaleString()}`], ["Utilization", `${result.billablePct.toFixed(0)}%`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Income Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Weekly Time Allocation</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={result.donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                        {result.donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${v} hrs`, ""]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {result.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Turning an Hourly Rate into an Income</h2>
            <p>For freelancers, annual income = rate × billable hours × weeks worked. The two variables most freelancers get wrong are billable hours (overestimating utilization) and weeks worked (forgetting vacations and slow seasons). Modeling both honestly turns a hopeful rate card into a realistic income projection.</p>
            <h2 className="text-2xl font-bold mb-3">The Utilization Reality</h2>
            <p>Client work is only part of the job. Proposals, invoicing, admin, professional development, and marketing typically consume 25–40% of a 40-hour week. A 30-hour billable week at 75% utilization is strong. Below 60%, raise rates or delegate — not bill more hours into the ground.</p>
            <h2 className="text-2xl font-bold mb-3">Pricing Backward from Income</h2>
            <p>To set your rate, start with the income you need, add the tax burden, divide by realistic billable hours and weeks. A target of $100,000 take-home with 30% taxes and 30 billable hours over 48 weeks implies roughly $97/hour. Charge that — or raise utilization — and the target becomes reachable.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hourly-freelance-rate-to-annual-income-calculator" />
          <PopularCalculators exclude="/calculator/hourly-freelance-rate-to-annual-income-calculator" />
        </div>
      </div>
    </>
  );
}
