"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Clock, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface SalaryResults {
  salary: number;
  hoursPerWeek: number;
  weeksPerYear: number;
  totalHours: number;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  chartData: { name: string; amount: number; fill: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateRates = (salary: number, hoursPerWeek: number, weeksPerYear: number): SalaryResults => {
  const totalHours = hoursPerWeek * weeksPerYear;

  const hourlyRate = totalHours > 0 ? salary / totalHours : 0;
  const dailyRate = hourlyRate * (hoursPerWeek / 5); // Assuming standard 5-day week for "daily" equivalent
  const weeklyRate = hoursPerWeek > 0 ? hourlyRate * hoursPerWeek : 0;
  const monthlyRate = salary / 12;

  const chartData = [
    { name: "Hourly", amount: hourlyRate, fill: "hsl(var(--primary))" },
    { name: "Daily", amount: dailyRate, fill: "hsl(var(--chart-2))" },
    { name: "Weekly", amount: weeklyRate, fill: "hsl(var(--chart-3))" },
  ];

  const summaryStats = [
    { label: "Hourly Rate", value: `$${hourlyRate.toFixed(2)}` },
    { label: "Daily Equivalent", value: `$${dailyRate.toFixed(2)}` },
    { label: "Weekly Equivalent", value: `$${weeklyRate.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Monthly Equivalent", value: `$${monthlyRate.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const breakdown = [
    { label: "Stated Annual Salary", amount: `$${salary.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Total Working Hours in Year", amount: `${totalHours.toLocaleString()} hours` },
    { label: "Equivalent Monthly Rate", amount: `$${monthlyRate.toLocaleString("en-US", { maximumFractionDigits: 2 })} / mo` },
    { label: "Equivalent Weekly Rate", amount: `$${weeklyRate.toLocaleString("en-US", { maximumFractionDigits: 2 })} / wk` },
    { label: "Equivalent Daily Rate (8 hr)", amount: `$${dailyRate.toLocaleString("en-US", { maximumFractionDigits: 2 })} / day` },
    { label: "Calculated Hourly Rate", amount: `$${hourlyRate.toLocaleString("en-US", { maximumFractionDigits: 2 })} / hr`, isTotal: true, colorClass: "text-primary font-bold" },
  ];

  return { salary, hoursPerWeek, weeksPerYear, totalHours, hourlyRate, dailyRate, weeklyRate, monthlyRate, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  salary: "75000",
  hoursPerWeek: "40",
  weeksPerYear: "52",
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

export default function AnnualSalaryToHourlyRateCalculator() {
  const [salary, setSalary] = useState(DEFAULTS.salary);
  const [hoursPerWeek, setHoursPerWeek] = useState(DEFAULTS.hoursPerWeek);
  const [weeksPerYear, setWeeksPerYear] = useState(DEFAULTS.weeksPerYear);

  const [results, setResults] = useState<SalaryResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateRates(
      parseFloat(salary) || 0,
      parseFloat(hoursPerWeek) || 0,
      parseFloat(weeksPerYear) || 0
    ));
  };

  const handleReset = () => {
    setSalary(DEFAULTS.salary); setHoursPerWeek(DEFAULTS.hoursPerWeek); setWeeksPerYear(DEFAULTS.weeksPerYear);
    setResults(calculateRates(75000, 40, 52));
  };

  useEffect(() => {
    setMounted(true);
    handleCalculate();
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Salary to Hourly</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
          <span className="text-foreground">${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Annual Salary to Hourly Rate" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Annual Salary to Hourly Rate Calculator</h1>

        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">

          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Salary Inputs</h2>
            </div>

            <CompactInput id="sal" label="Annual Gross Salary" value={salary} onChange={setSalary} prefix="$" tooltip="Your total yearly salary before taxes." />

            <div className="grid grid-cols-2 gap-4 mt-2">
              <CompactInput id="hrs" label="Hours per Week" value={hoursPerWeek} onChange={setHoursPerWeek} suffix="hrs" tooltip="Standard full-time is 40 hours." />
              <CompactInput id="wks" label="Weeks per Year" value={weeksPerYear} onChange={setWeeksPerYear} suffix="wks" tooltip="A full year is 52 weeks. Do not subtract PTO." />
            </div>

            <div className="p-3 mt-2 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground font-medium leading-relaxed">
              <strong>Tip:</strong> Even if you get 2 weeks of paid vacation, you still enter 52 weeks. Paid Time Off (PTO) means you are still being paid for those hours. Only reduce weeks if you take unpaid time off.
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

                <div className={`border-l-4 rounded-lg p-5 relative bg-primary/10 border-primary/30`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Equivalent Hourly Rate
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 text-primary`}>
                    ${results.hourlyRate.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Based on <span className="font-bold text-foreground">{results.totalHours.toLocaleString()}</span> working hours per year.
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Time Breakdown</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Equivalent Pay</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className="text-[13px] py-3 px-3">{item.label}</td>
                            <td className={`text-[13px] py-3 px-3 text-right ${item.colorClass || ""}`}>{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Short-Term Equivalents</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                          <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toFixed(0)}`} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
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
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is an Annual Salary to Hourly Rate Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An Annual Salary to Hourly Rate Calculator converts your yearly salary into equivalent hourly, daily, weekly, and monthly pay rates. If you earn a fixed annual salary, this tool reveals what each hour of your time is truly worth. The standard formula divides your annual salary by your total working hours per year, which is typically 2,080 hours for a full-time employee working 40 hours per week across 52 weeks. Understanding your hourly rate helps you compare job offers, negotiate freelance rates, and evaluate whether extra unpaid hours are worth the effort.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator takes three inputs: your annual gross salary, hours worked per week, and weeks worked per year. It multiplies hours per week by weeks per year to get total annual working hours, then divides salary by that figure to produce the hourly rate. The daily rate is calculated by multiplying the hourly rate by hours per week divided by 5, assuming a standard five-day workweek. The weekly rate is the hourly rate multiplied by hours per week, and the monthly rate is the annual salary divided by 12. Importantly, you should not subtract paid time off from the weeks per year, because you are still paid for those hours. Only reduce the weeks if you take unpaid leave or work a seasonal position.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">Your primary result is the equivalent hourly rate, shown prominently alongside the total working hours used in the calculation. The summary statistics display your daily, weekly, and monthly equivalents for quick reference. The breakdown table lists each conversion step from your stated annual salary down to the final hourly rate, which is highlighted as the key figure. The bar chart visualizes the hourly, daily, and weekly equivalents side by side. Keep in mind that these are gross figures before taxes, insurance, and retirement contributions. Your net take-home hourly rate will be lower, but the gross rate is the standard benchmark for comparing compensation across roles.</p>
            </div>
          </section>
          <FAQSection faqs={[
            { question: "What if I work 37.5 hours a week?", answer: "Many corporate offices offer a 1-hour unpaid lunch every day, meaning employees are technically scheduled for 37.5 working hours per week. In this case, your total annual hours drop to 1,950, which increases your hourly rate slightly." },
            { question: "How is a monthly rate calculated?", answer: "A monthly rate is always Annual Salary divided by 12. It is NOT your weekly rate multiplied by 4, because most months have slightly more than 4 weeks (4.33 weeks on average)." },
            { question: "Is this my take-home pay?", answer: "No, this is your Gross Hourly Rate before taxes, insurance, and 401(k) deductions. Your Net (Take-Home) hourly rate will be significantly lower." },
          ]} pageUrl="https://racira.com/calculator/annual-salary-to-hourly-rate-calculator" />
          <PopularCalculators exclude="/calculator/annual-salary-to-hourly-rate-calculator" />
        </div>
      </div>
    </>
  );
}
