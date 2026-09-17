"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface PayResult {
  direction: string;
  hourly: number;
  hoursWeek: number;
  weeksYear: number;
  annual: number;
  monthly: number;
  biweekly: number;
  weekly: number;
  daily: number;
  hoursPerYear: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt$(v: number): string {
  return `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function calcPay(hourly: number, hoursWeek: number, weeksYear: number): PayResult {
  const annual = hourly * hoursWeek * weeksYear;
  const monthly = annual / 12;
  const biweekly = hourly * hoursWeek * 2;
  const weekly = hourly * hoursWeek;
  const daily = hourly * 8;
  const hoursPerYear = hoursWeek * weeksYear;

  const breakdown = [
    { label: "Hourly Rate", value: fmt$(hourly) },
    { label: "Hours per Week", value: `${hoursWeek} hrs` },
    { label: "Weeks per Year", value: `${weeksYear} weeks` },
    { label: "Annual Salary", value: fmt$(annual) },
    { label: "Monthly (1/12)", value: fmt$(monthly) },
    { label: "Biweekly", value: fmt$(biweekly) },
    { label: "Weekly", value: fmt$(weekly) },
    { label: "Hours per Year", value: `${hoursPerYear} hrs` },
  ];
  const summaryStats = [
    { label: "Annual Salary", value: fmt$(annual) },
    { label: "Monthly", value: fmt$(monthly) },
    { label: "Biweekly", value: fmt$(biweekly) },
    { label: "Weekly", value: fmt$(weekly) },
    { label: "Daily (8 hrs)", value: fmt$(daily) },
    { label: "Hourly", value: fmt$(hourly) },
    { label: "Hours/Week", value: `${hoursWeek}` },
    { label: "Hours/Year", value: `${hoursPerYear}` },
  ];
  const chartData = [
    { name: "Weekly", value: Math.round(weekly), fill: "#8b5cf6" },
    { name: "Biweekly", value: Math.round(biweekly), fill: "#f59e0b" },
    { name: "Monthly", value: Math.round(monthly), fill: "hsl(var(--primary))" },
    { name: "Annual", value: Math.round(annual), fill: "#10b981" },
  ];
  return { direction: "hourly-to-salary", hourly, hoursWeek, weeksYear, annual, monthly, biweekly, weekly, daily, hoursPerYear, breakdown, summaryStats, chartData };
}

const DEFAULTS = { hourly: "32", hoursWeek: "40", weeksYear: "52" };

export default function HourlyToSalaryCalculator() {
  const [hourly, setHourly] = useState(DEFAULTS.hourly);
  const [hoursWeek, setHoursWeek] = useState(DEFAULTS.hoursWeek);
  const [weeksYear, setWeeksYear] = useState(DEFAULTS.weeksYear);
  const [result, setResult] = useState<PayResult | null>(null);

  const h = parseFloat(hourly) || 0;
  const hw = parseFloat(hoursWeek) || 0;
  const wy = parseFloat(weeksYear) || 0;
  const errs: string[] = [];
  if (h < 0) errs.push("Hourly rate cannot be negative.");
  if (hw < 1 || hw > 168) errs.push("Hours per week must be between 1 and 168.");
  if (wy < 1 || wy > 52) errs.push("Weeks per year must be between 1 and 52.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcPay(h, hw, wy)); };
  const reset = () => {
    setHourly(DEFAULTS.hourly); setHoursWeek(DEFAULTS.hoursWeek); setWeeksYear(DEFAULTS.weeksYear);
    setResult(calcPay(32, 40, 52));
  };
  useEffect(() => { setResult(calcPay(32, 40, 52)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How is annual salary calculated?", answer: "Multiply your hourly rate by hours per week and weeks per year: $32 × 40 × 52 = $66,560. Adjust the weeks figure for unpaid time off." },
    { question: "What is the difference between monthly and biweekly?", answer: "Monthly is exactly 1/12 of the annual figure. Biweekly is two weeks of hours — 26 payments per year, so two months a year have three paydays." },
    { question: "Should I include overtime?", answer: "This calculator uses a single straight-time rate. If you regularly earn time-and-a-half, add the blended average rate instead for a more accurate annual figure." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Hourly to Salary Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Hourly to Salary Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Hourly Rate</label>
                <div className={inp}><input type="number" step="0.5" value={hourly} onChange={e => setHourly(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$/hr</span></div>
              </div>
              <div>
                <label className={lbl}>Hours per Week</label>
                <div className={inp}><input type="number" value={hoursWeek} onChange={e => setHoursWeek(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">hrs</span></div>
              </div>
              <div>
                <label className={lbl}>Weeks per Year</label>
                <div className={inp}><input type="number" value={weeksYear} onChange={e => setWeeksYear(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">weeks</span></div>
              </div>
            </div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Annual Salary</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt$(result.annual)}</div>
                <div className="text-sm text-muted-foreground mt-1">{fmt$(result.hourly)}/hr × {result.hoursWeek} hrs × {result.weeksYear} weeks</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Monthly`, fmt$(result.monthly)], ["Biweekly", fmt$(result.biweekly)], ["Weekly", fmt$(result.weekly)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Salary Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 3 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 3 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Pay Periods Compared</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => [fmt$(v), ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
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
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Hourly to Annual</h2>
            <p>This <strong>hourly to salary calculator</strong> multiplies your hourly rate by hours per week and weeks per year to produce the annual figure, then breaks it into monthly, biweekly, weekly, and daily equivalents. Reverse the math by dividing a salary offer by your annual hours to compare job offers.</p>
            <h2 className="text-2xl font-bold mb-3">Choosing the Right Hours</h2>
            <p>Full-time is conventionally 40 hours × 52 weeks, but most workers take unpaid time off. If you have two weeks of unpaid vacation, use 50 weeks; if you only work 30 hours a week, use that — the annual number is only useful if the inputs match reality.</p>
            <h2 className="text-2xl font-bold mb-3">Salary vs Hourly Trade-offs</h2>
            <p>A $66,560 salary at 40 hours equals $32/hr. But salaried roles often mean 45+ hour weeks with no overtime, dropping the effective rate — convert both sides before comparing total compensation including benefits and bonuses.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hourly-to-salary-calculator" />
          <PopularCalculators exclude="/calculator/hourly-to-salary-calculator" />
        </div>
      </div>
    </>
  );
}
