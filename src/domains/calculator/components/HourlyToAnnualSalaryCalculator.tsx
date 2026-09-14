"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface HourlyToAnnualInputs {
  hourlyRate: number;
  hoursPerWeek: number;
  weeksPerYear: number;
  otHoursPerWeek: number;
  otMultiplier: number;
}

interface HourlyToAnnualResult {
  annualSalary: number;
  monthlySalary: number;
  biweeklySalary: number;
  weeklySalary: number;
  dailySalary: number;
  regularAnnual: number;
  otAnnual: number;
  effectiveHourly: number;
  chartData: { name: string; value: number; color: string }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calcHourlyToAnnual(inputs: HourlyToAnnualInputs): HourlyToAnnualResult {
  const regularAnnual = inputs.hourlyRate * inputs.hoursPerWeek * inputs.weeksPerYear;
  const otAnnual = inputs.hourlyRate * inputs.otMultiplier * inputs.otHoursPerWeek * inputs.weeksPerYear;
  const annualSalary = regularAnnual + otAnnual;
  const monthlySalary = annualSalary / 12;
  const biweeklySalary = annualSalary / 26;
  const weeklySalary = inputs.hoursPerWeek > 0 ? annualSalary / inputs.weeksPerYear : 0;
  const dailySalary = weeklySalary / 5;
  const totalHoursPerYear = (inputs.hoursPerWeek + inputs.otHoursPerWeek) * inputs.weeksPerYear;
  const effectiveHourly = totalHoursPerYear > 0 ? annualSalary / totalHoursPerYear : 0;

  const chartData = [
    { name: "Regular Pay", value: regularAnnual, color: "hsl(var(--primary))" },
    { name: "Overtime Pay", value: otAnnual, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  const breakdown = [
    { label: "Hourly Rate", value: `$${inputs.hourlyRate.toFixed(2)}` },
    { label: "Regular Hours / Week", value: `${inputs.hoursPerWeek} hrs` },
    { label: "Weeks Worked / Year", value: `${inputs.weeksPerYear} wks` },
    { label: "Regular Annual Pay", value: `$${regularAnnual.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Overtime Hours / Week", value: `${inputs.otHoursPerWeek} hrs @ ${inputs.otMultiplier}×` },
    { label: "Overtime Annual Pay", value: `$${otAnnual.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Annual Salary", value: `$${annualSalary.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, highlight: true },
    { label: "Effective Hourly Rate", value: `$${effectiveHourly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
  ];

  const summaryStats = [
    { label: "Annual Salary", value: `$${annualSalary.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Monthly", value: `$${monthlySalary.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Biweekly", value: `$${biweeklySalary.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Weekly", value: `$${weeklySalary.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Daily (5-day week)", value: `$${dailySalary.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Effective Hourly Rate", value: `$${effectiveHourly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
  ];

  return { annualSalary, monthlySalary, biweeklySalary, weeklySalary, dailySalary, regularAnnual, otAnnual, effectiveHourly, chartData, breakdown, summaryStats };
}

const DEFAULTS: HourlyToAnnualInputs = { hourlyRate: 25, hoursPerWeek: 40, weeksPerYear: 52, otHoursPerWeek: 5, otMultiplier: 1.5 };

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

const CustomTooltip = ({ active, payload }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
    <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
    <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
  </div>
) : null;

export default function HourlyToAnnualSalaryCalculator() {
  const [hourlyRate, setHourlyRate] = useState("25");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [weeksPerYear, setWeeksPerYear] = useState("52");
  const [otHoursPerWeek, setOtHoursPerWeek] = useState("5");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<HourlyToAnnualResult | null>(null);

  const calculate = () =>
    setResult(calcHourlyToAnnual({
      hourlyRate: parseFloat(hourlyRate) || 0,
      hoursPerWeek: parseFloat(hoursPerWeek) || 0,
      weeksPerYear: parseFloat(weeksPerYear) || 0,
      otHoursPerWeek: parseFloat(otHoursPerWeek) || 0,
      otMultiplier: 1.5,
    }));
  const reset = () => { setHourlyRate(DEFAULTS.hourlyRate.toString()); setHoursPerWeek(DEFAULTS.hoursPerWeek.toString()); setWeeksPerYear(DEFAULTS.weeksPerYear.toString()); setOtHoursPerWeek(DEFAULTS.otHoursPerWeek.toString()); setShowAdvanced(false); calculate(); };
  useEffect(() => { calculate(); }, []);

  const faqs = [
    { question: "How do I convert hourly pay to annual salary?", answer: "Multiply your hourly rate by the hours you work per week and the weeks you work per year: $25 × 40 × 52 = $52,000. If you take unpaid time off, reduce the weeks; if you work overtime, add it separately at the overtime rate." },
    { question: "Is a $25/hour job the same as a $52,000 salary?", answer: "Not exactly. Salaried roles often include paid time off, health benefits, and predictable hours, while hourly roles pay only for time worked and may include overtime premiums. Compare total compensation — benefits, PTO, and stability — not just the base number." },
    { question: "How many weeks should I use?", answer: "52 if you get paid vacation, or subtract unpaid weeks. Part-year workers (seasonal, education, internships) should use their actual working weeks — that makes the annual figure realistic instead of inflated." },
    { question: "What is the effective hourly rate?", answer: "It is your total annual pay divided by all hours worked including overtime. It shows the true value of your time when overtime inflates your schedule — useful when comparing a demanding hourly role against a salaried offer." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Hourly to Annual Salary Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Hourly to Annual Salary Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="rate" label="Hourly Rate" value={hourlyRate} onChange={setHourlyRate} prefix="$" />
              <CompactInput id="hours" label="Hours per Week" value={hoursPerWeek} onChange={setHoursPerWeek} suffix="hrs" />
            </div>
            <CompactInput id="weeks" label="Weeks Worked per Year" value={weeksPerYear} onChange={setWeeksPerYear} suffix="wks" />

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-background mt-3">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block font-medium">Overtime (time-and-a-half)</label>
                    <CompactInput id="ot" label="Overtime Hours per Week" value={otHoursPerWeek} onChange={setOtHoursPerWeek} suffix="hrs" />
                  </div>
                </div>
              )}
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
                <div className="text-sm text-muted-foreground font-medium">${hourlyRate}/hr × {hoursPerWeek} hrs × {weeksPerYear} wks{parseFloat(otHoursPerWeek) > 0 ? ` + overtime` : ""}</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Monthly", `$${result.monthlySalary.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Biweekly", `$${result.biweeklySalary.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Weekly", `$${result.weeklySalary.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
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

              <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center min-h-[280px]">
                <h3 className="text-base font-bold mb-2 w-full text-left">Annual Earnings Breakdown</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie data={result.chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value">
                      {result.chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 w-full">
                  {result.chartData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />{d.name}
                    </div>
                  ))}
                </div>
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
            <h2 className="text-2xl font-bold mb-3">From Hourly Wage to Annual Number</h2>
            <p>The jump from an hourly rate to a yearly salary is simple multiplication, but the details matter: hours per week, weeks actually worked, and overtime. This <strong>hourly to annual salary calculator</strong> handles all three and converts the result into the pay-period figures employers and lenders expect.</p>
            <h2 className="text-2xl font-bold mb-3">Annualizing Is a Planning Tool</h2>
            <p>Mortgage applications, rental agreements, and loan paperwork all ask for annual income. Using 52 weeks assumes no unpaid time off — adjust the weeks worked down if you take unpaid leave. The effective hourly rate in the summary shows what overtime does to your real hourly value.</p>
            <h2 className="text-2xl font-bold mb-3">Comparing Offers Honestly</h2>
            <p>An hourly offer with heavy overtime can look bigger than a salaried offer, but the hours are part of the price. Convert both to effective hourly rates and add benefits: paid time off, health coverage, and retirement matching are real income the hourly figure does not capture.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hourly-to-annual-salary-calculator" />
          <PopularCalculators exclude="/calculator/hourly-to-annual-salary-calculator" />
        </div>
      </div>
    </>
  );
}
