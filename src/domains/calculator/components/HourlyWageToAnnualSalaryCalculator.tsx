"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface HourlyWageInputs {
  wage: number;
  regularHours: number;
  otHours: number;
  otMultiplier: number;
  weeksPerYear: number;
}

interface HourlyWageResult {
  annualSalary: number;
  regularAnnual: number;
  otAnnual: number;
  monthlySalary: number;
  weeklySalary: number;
  otWeeklyPay: number;
  effectiveHourly: number;
  chartData: { name: string; annual: number }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calcHourlyWage(inputs: HourlyWageInputs): HourlyWageResult {
  const regularAnnual = inputs.wage * inputs.regularHours * inputs.weeksPerYear;
  const otAnnual = inputs.wage * inputs.otMultiplier * inputs.otHours * inputs.weeksPerYear;
  const annualSalary = regularAnnual + otAnnual;
  const monthlySalary = annualSalary / 12;
  const weeklySalary = annualSalary / inputs.weeksPerYear;
  const otWeeklyPay = inputs.wage * inputs.otMultiplier * inputs.otHours;
  const totalHours = (inputs.regularHours + inputs.otHours) * inputs.weeksPerYear;
  const effectiveHourly = totalHours > 0 ? annualSalary / totalHours : 0;

  const chartData = [
    { name: "Regular", annual: Math.round(regularAnnual) },
    { name: "Overtime", annual: Math.round(otAnnual) },
  ];

  const breakdown = [
    { label: "Hourly Wage", value: `$${inputs.wage.toFixed(2)}` },
    { label: "Regular Hours / Week", value: `${inputs.regularHours} hrs` },
    { label: "Overtime Hours / Week", value: `${inputs.otHours} hrs @ ${inputs.otMultiplier}×` },
    { label: "Weeks Worked / Year", value: `${inputs.weeksPerYear} wks` },
    { label: "Regular Annual Pay", value: `$${regularAnnual.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Overtime Annual Pay", value: `$${otAnnual.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Annual Salary", value: `$${annualSalary.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, highlight: true },
    { label: "Overtime Pay / Week", value: `$${otWeeklyPay.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Effective Hourly Rate", value: `$${effectiveHourly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
  ];

  const summaryStats = [
    { label: "Annual Salary", value: `$${annualSalary.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Monthly", value: `$${monthlySalary.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Weekly", value: `$${weeklySalary.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Overtime Pay / Week", value: `$${otWeeklyPay.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Effective Hourly Rate", value: `$${effectiveHourly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Overtime Share of Pay", value: `${annualSalary > 0 ? ((otAnnual / annualSalary) * 100).toFixed(0) : 0}%` },
  ];

  return { annualSalary, regularAnnual, otAnnual, monthlySalary, weeklySalary, otWeeklyPay, effectiveHourly, chartData, breakdown, summaryStats };
}

const DEFAULTS: HourlyWageInputs = { wage: 22, regularHours: 40, otHours: 5, otMultiplier: 1.5, weeksPerYear: 52 };

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
    <p className="font-bold text-muted-foreground mb-0.5">{label} Pay</p>
    <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
  </div>
) : null;

export default function HourlyWageToAnnualSalaryCalculator() {
  const [wage, setWage] = useState("22");
  const [regularHours, setRegularHours] = useState("40");
  const [otHours, setOtHours] = useState("5");
  const [weeksPerYear, setWeeksPerYear] = useState("52");
  const [result, setResult] = useState<HourlyWageResult | null>(null);

  const calculate = () =>
    setResult(calcHourlyWage({
      wage: parseFloat(wage) || 0,
      regularHours: parseFloat(regularHours) || 0,
      otHours: parseFloat(otHours) || 0,
      otMultiplier: 1.5,
      weeksPerYear: parseFloat(weeksPerYear) || 0,
    }));
  const reset = () => { setWage(DEFAULTS.wage.toString()); setRegularHours(DEFAULTS.regularHours.toString()); setOtHours(DEFAULTS.otHours.toString()); setWeeksPerYear(DEFAULTS.weeksPerYear.toString()); calculate(); };
  useEffect(() => { calculate(); }, []);

  const faqs = [
    { question: "How do I calculate annual salary from an hourly wage?", answer: "Add your regular pay and overtime pay, then multiply by weeks worked: ($22 × 40 + $22 × 1.5 × 5) × 52 = $54,340. Regular pay is wage × regular hours; overtime is wage × 1.5 × overtime hours." },
    { question: "How is overtime pay calculated?", answer: "The FLSA requires time-and-a-half (1.5×) for hours over 40 in a workweek for non-exempt employees. Some states and union agreements use double time or shift differentials. This calculator assumes 1.5× — enter your actual schedule and adjust for your agreement." },
    { question: "What if my hours fluctuate week to week?", answer: "Use an average of your last few months. Track your actual annual earnings from pay stubs as the ground truth, and use the calculator's effective hourly rate to see the true value of your time across fluctuating schedules." },
    { question: "Is overtime pay sustainable income?", answer: "Lenders and budget planners often discount overtime because it is not guaranteed. Calculate your annual salary with zero overtime to see your base, then treat the overtime premium as flexible income for savings or debt payoff rather than fixed bills." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Hourly Wage to Annual Salary Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Hourly Wage to Annual Salary Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="wage" label="Hourly Wage" value={wage} onChange={setWage} prefix="$" />
              <CompactInput id="regular" label="Regular Hours / Week" value={regularHours} onChange={setRegularHours} suffix="hrs" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="ot" label="Overtime Hours / Week" value={otHours} onChange={setOtHours} suffix="hrs" />
              <CompactInput id="weeks" label="Weeks Worked / Year" value={weeksPerYear} onChange={setWeeksPerYear} suffix="wks" />
            </div>

            <div className="flex gap-3 mt-1">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Annual Salary</div>
                <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">${result.annualSalary.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground font-medium">${result.regularAnnual.toLocaleString("en-US", { maximumFractionDigits: 0 })} regular + ${result.otAnnual.toLocaleString("en-US", { maximumFractionDigits: 0 })} overtime</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Monthly", `$${result.monthlySalary.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Overtime / Week", `$${result.otWeeklyPay.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Effective Rate", `$${result.effectiveHourly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 px-3 ${r.highlight ? "text-amber-700 font-semibold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 px-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Regular vs. Overtime Earnings</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="annual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
            <h2 className="text-2xl font-bold mb-3">Your Wage, Annualized</h2>
            <p>Hourly workers earn a wage but budget, borrow, and plan in annual terms. This <strong>hourly wage to annual salary calculator</strong> builds the annual figure from the components that actually determine it — regular hours, overtime hours, and weeks worked — so the number reflects your real schedule rather than a generic 40 × 52.</p>
            <h2 className="text-2xl font-bold mb-3">Overtime Is Real Income — and Real Risk</h2>
            <p>At 1.5×, five overtime hours a week add roughly 19% to a 40-hour week's pay. That is substantial, but overtime can disappear with a schedule change or a hiring push. The calculator separates regular and overtime earnings so you can see your guaranteed base and your variable premium side by side.</p>
            <h2 className="text-2xl font-bold mb-3">Use the Effective Rate for Comparisons</h2>
            <p>Divide total annual pay by total hours worked and you get an effective hourly rate. A $22 job with heavy overtime may beat a $26 job with none on paper — but the effective rate reveals the true value of your time and makes the comparison honest.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hourly-wage-to-annual-salary-calculator" />
          <PopularCalculators exclude="/calculator/hourly-wage-to-annual-salary-calculator" />
        </div>
      </div>
    </>
  );
}
