"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface GratuityResult {
  salary: number;
  years: number;
  months: number;
  type: "act" | "non-act";
  roundedYears: number;
  gratuity: number;
  taxExempt: number;
  taxable: number;
  chartData: { name: string; value: number }[];
}

// Gratuity Act (India): (15 × last drawn salary × years of service) / 26; non-Act uses 30
function calcGratuity(salary: number, years: number, months: number, type: "act" | "non-act"): GratuityResult | null {
  const totalYears = years + (months >= 7 ? 1 : months / 12);
  if (salary <= 0 || totalYears < 5) return null;
  const roundedYears = months >= 7 ? years + 1 : years;
  const divisor = type === "act" ? 26 : 30;
  const gratuity = (15 * salary * roundedYears) / divisor;
  const taxExempt = Math.min(gratuity, 2000000);
  const taxable = Math.max(gratuity - taxExempt, 0);
  const chartData = [
    { name: "Gratuity", value: Number((gratuity / 100000).toFixed(2)) },
    { name: "Tax-Exempt", value: Number((taxExempt / 100000).toFixed(2)) },
    { name: "Taxable", value: Number((taxable / 100000).toFixed(2)) },
  ];
  return { salary, years, months, type, roundedYears, gratuity, taxExempt, taxable, chartData };
}

const DEFAULTS = { salary: "50000", years: "10", months: "0", type: "act" as "act" | "non-act" };

const faqs = [
  { question: "Who is eligible for gratuity?", answer: "Any employee who has completed 5 or more years of continuous service is eligible for gratuity. For contract/seasonal workers, the period may differ." },
  { question: "How is gratuity calculated?", answer: "For employees covered under the Gratuity Act: Gratuity = (15 × Last Drawn Salary × Years of Service) / 26. For others, 30 is used instead of 26." },
  { question: "Is gratuity taxable?", answer: "Gratuity is exempt up to ₹20,00,000 for private sector employees. For government employees, it's fully exempt. Amount exceeding the limit is taxable." },
  { question: "What counts as last drawn salary?", answer: "Last drawn salary includes basic salary plus Dearness Allowance (DA). It does not include HRA, bonuses, or other allowances." },
  { question: "What if I complete 4 years and 7 months?", answer: "If you complete more than 6 months beyond a full year, it's rounded up to the next year. So 4 years 7 months is treated as 5 years for gratuity." },
];

export default function GratuityCalculator() {
  const [salary, setSalary] = useState(DEFAULTS.salary);
  const [years, setYears] = useState(DEFAULTS.years);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [type, setType] = useState<"act" | "non-act">(DEFAULTS.type);
  const [result, setResult] = useState<GratuityResult>(() => calcGratuity(50000, 10, 0, "act")!);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    const s = parseFloat(salary) || 0;
    const y = parseInt(years, 10) || 0;
    const m = parseInt(months, 10) || 0;
    const r = calcGratuity(s, y, m, type);
    if (!r) {
      setError("Minimum 5 years of continuous service required for gratuity.");
      setResult(calcGratuity(50000, 10, 0, "act")!);
      return;
    }
    setError(null);
    setResult(r);
  };

  const reset = () => {
    setSalary(DEFAULTS.salary); setYears(DEFAULTS.years); setMonths(DEFAULTS.months);
    setType(DEFAULTS.type); setError(null);
    setResult(calcGratuity(50000, 10, 0, "act")!);
  };

  const inr = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  const breakdown = [
    { label: "Last Drawn Salary", value: inr(result.salary), highlight: false },
    { label: "Service (rounded)", value: `${result.roundedYears} years (${result.years}y ${result.months}m)`, highlight: false },
    { label: "Formula Applied", value: result.type === "act" ? "(15 × salary × years) ÷ 26" : "(15 × salary × years) ÷ 30", highlight: false },
    { label: "Gratuity Amount", value: inr(result.gratuity), highlight: true },
    { label: "Tax-Exempt (max ₹2,000,000)", value: inr(result.taxExempt), highlight: false },
    { label: "Taxable Portion", value: inr(result.taxable), highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Gratuity Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Gratuity Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Award className="w-4 h-4" /> End-of-Service Gratuity (India)
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Last Drawn Salary (₹)</label>
                <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} className="input-calc" placeholder="50000" min={0} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Years of Service</label>
                  <input type="number" value={years} onChange={(e) => setYears(e.target.value)} className="input-calc" placeholder="10" min={0} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Months</label>
                  <input type="number" value={months} onChange={(e) => setMonths(e.target.value)} className="input-calc" placeholder="0" min={0} max={11} />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Coverage</label>
                <select value={type} onChange={(e) => setType(e.target.value as "act" | "non-act")} className="input-calc">
                  <option value="act">Under Gratuity Act (÷26)</option>
                  <option value="non-act">Not under Act (÷30)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">Reset</button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <Award className="w-4 h-4 text-primary" /> GRATUITY AMOUNT
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl md:text-4xl font-bold text-primary">{inr(result.gratuity)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {error ?? `₹${result.taxExempt.toLocaleString("en-IN")} is tax-exempt; ₹${result.taxable.toLocaleString("en-IN")} may be taxable.`}
              </p>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Result Breakdown</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Payout Breakdown (₹ lakhs)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`₹${(v * 100000).toLocaleString("en-IN")}`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Days per Year", value: result.type === "act" ? "15 (÷26)" : "15 (÷30)" },
                  { label: "Eligibility", value: "5+ years continuous service" },
                  { label: "Exemption Cap", value: "₹20,00,000 (private)" },
                  { label: "Government Employees", value: "Fully exempt" },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Gratuity Calculator</h2>
            <p>Gratuity is a lump-sum payment an employer makes to an employee who leaves after at least 5 years of continuous service, governed in India by the Payment of Gratuity Act, 1972. The formula pays 15 days of last-drawn salary per completed year of service: (15 × salary × years) ÷ 26, where 26 accounts for working days in a month. Employees not covered by the Act receive the same 15-day benefit but divided by 30.</p>
            <h3>Rounding and taxes</h3>
            <p>Service is rounded to the nearest full year — 6 months and above counts as an extra year, so 4 years 7 months qualifies at 5 years. For tax, private-sector gratuity is exempt up to ₹20 lakh (the higher of the formula amount or the statutory ceiling); government employees are fully exempt. The taxable remainder is added to your income in the year of receipt, so planning around the exemption cap can materially affect your payout.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gratuity-calculator" />
          <PopularCalculators exclude="/calculator/gratuity-calculator" />
        </div>
      </div>
    </>
  );
}
