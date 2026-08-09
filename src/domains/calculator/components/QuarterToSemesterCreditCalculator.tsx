"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";

interface CreditResult {
  quarterCredits: number;
  semesterCredits: number;
  convertedCredits: number;
  totalSemesterCredits: number;
  chartData: { name: string; credits: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const DEFAULTS = {
  quarterCredits: "90",
  existingSemesterCredits: "30",
  creditType: "quarter",
};

// Standard academic credit conversion formula
// 1 quarter credit = 0.6667 semester credits (2/3 ratio)
// 1 semester credit = 1.5 quarter credits (3/2 ratio)
const QUARTER_TO_SEMESTER = 2 / 3;
const SEMESTER_TO_QUARTER = 3 / 2;

function calculate(
  credits: number,
  creditType: string,
  existingSemesterCredits: number
): CreditResult | null {
  if (credits < 0 || isNaN(credits)) return null;

  const quarterCredits = creditType === "quarter" ? credits : credits * SEMESTER_TO_QUARTER;
  const semesterCredits = creditType === "semester" ? credits : credits * QUARTER_TO_SEMESTER;
  const convertedCredits = parseFloat(semesterCredits.toFixed(2));
  const totalSemesterCredits = convertedCredits + (existingSemesterCredits || 0);

  // Standard 4-year degree = 120 semester credits
  const progressPct = Math.min((totalSemesterCredits / 120) * 100, 100);
  const remaining = Math.max(120 - totalSemesterCredits, 0);

  const chartData = [
    { name: "Converted Credits", credits: convertedCredits },
    { name: "Existing Sem. Credits", credits: existingSemesterCredits || 0 },
    { name: "Remaining (120 total)", credits: parseFloat(remaining.toFixed(2)) },
  ];

  const breakdown = [
    { label: `Input Credits (${creditType === "quarter" ? "quarter" : "semester"})`, value: `${credits.toFixed(1)} credits` },
    { label: "Conversion Rate", value: creditType === "quarter" ? "× 0.6667 (2/3)" : "× 1.5 (3/2)" },
    { label: "Converted Credits", value: `${convertedCredits.toFixed(2)} semester credits` },
    { label: "Existing Semester Credits", value: `${(existingSemesterCredits || 0).toFixed(1)} credits` },
    { label: "Total Semester Credits", value: `${totalSemesterCredits.toFixed(2)} credits` },
    { label: "Degree Progress (120 sem. cr.)", value: `${progressPct.toFixed(1)}%` },
    { label: "Remaining to Degree", value: remaining > 0 ? `${remaining.toFixed(2)} credits` : "Complete ✓" },
  ];

  const summaryStats = [
    { label: "Converted Credits", value: `${convertedCredits.toFixed(2)} sem.` },
    { label: "Total Credits", value: `${totalSemesterCredits.toFixed(2)} sem.` },
    { label: "Degree Progress", value: `${progressPct.toFixed(1)}%` },
    { label: "Remaining", value: remaining > 0 ? `${remaining.toFixed(2)}` : "Done ✓" },
    { label: "Quarter Equivalent", value: `${quarterCredits.toFixed(1)} qtr.` },
    { label: "Academic Years (at 15/sem)", value: `${(totalSemesterCredits / 30).toFixed(1)} years` },
  ];

  return { quarterCredits, semesterCredits: convertedCredits, convertedCredits, totalSemesterCredits, chartData, breakdown, summaryStats };
}

const COLORS = ["hsl(var(--primary))", "#10b981", "#e5e7eb"];

export default function QuarterToSemesterCreditCalculator() {
  const [credits, setCredits] = useState(DEFAULTS.quarterCredits);
  const [creditType, setCreditType] = useState(DEFAULTS.creditType);
  const [existingSemesterCredits, setExistingSemesterCredits] = useState(DEFAULTS.existingSemesterCredits);
  const [result, setResult] = useState<CreditResult | null>(null);

  const handleCalculate = () => {
    setResult(calculate(parseFloat(credits) || 0, creditType, parseFloat(existingSemesterCredits) || 0));
  };

  const handleReset = () => {
    setCredits(DEFAULTS.quarterCredits);
    setCreditType(DEFAULTS.creditType);
    setExistingSemesterCredits(DEFAULTS.existingSemesterCredits);
    setResult(calculate(90, "quarter", 30));
  };

  useEffect(() => { setResult(calculate(90, "quarter", 30)); }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-card border border-border p-2 rounded shadow text-xs">
          <p className="font-bold">{payload[0].name || payload[0].payload.name}</p>
          <p className="text-primary">{payload[0].value.toFixed(2)} credits</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator/education" }, { label: "Quarter to Semester Credit Conversion" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Quarter to Semester Credit Conversion Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            {/* Direction toggle */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Conversion Direction</label>
              <div className="flex gap-2">
                {[{ v: "quarter", label: "Quarter → Semester" }, { v: "semester", label: "Semester → Quarter" }].map(opt => (
                  <button key={opt.v} type="button"
                    onClick={() => { setCreditType(opt.v); setResult(calculate(parseFloat(credits) || 0, opt.v, parseFloat(existingSemesterCredits) || 0)); }}
                    className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors ${creditType === opt.v ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label htmlFor="credits" className="text-sm font-medium mb-1">
                  {creditType === "quarter" ? "Quarter Credits" : "Semester Credits"}
                </label>
                <div className="relative flex items-center h-10 rounded-md border border-input bg-background shadow-sm focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden">
                  <input id="credits" type="number" value={credits} min={0} step="any"
                    onChange={e => setCredits(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleCalculate()}
                    className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground" />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">cr.</span>
                </div>
              </div>
              <div className="flex flex-col">
                <label htmlFor="existingCredits" className="text-sm font-medium mb-1">Existing Sem. Credits</label>
                <div className="relative flex items-center h-10 rounded-md border border-input bg-background shadow-sm focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden">
                  <input id="existingCredits" type="number" value={existingSemesterCredits} min={0} step="any"
                    onChange={e => setExistingSemesterCredits(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleCalculate()}
                    className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground" />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">cr.</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={handleCalculate}
                className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base transition-colors">
                Calculate
              </button>
              <button type="button" onClick={handleReset} aria-label="Reset"
                className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {result && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                <div className="flex justify-end absolute top-3 right-3">
                  <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  {creditType === "quarter" ? "Converted Semester Credits" : "Converted Quarter Credits"}
                </div>
                <div className="text-4xl font-bold text-primary">
                  {creditType === "quarter"
                    ? `${result.convertedCredits.toFixed(2)} semester`
                    : `${result.quarterCredits.toFixed(2)} quarter`
                  }
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Total accumulated: <span className="font-semibold text-foreground">{result.totalSemesterCredits.toFixed(2)} semester credits</span>
                </div>
              </div>

              <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                {[
                  { label: "Converted Credits", value: `${result.convertedCredits.toFixed(2)} sem.`, color: "text-primary" },
                  { label: "Total Credits", value: `${result.totalSemesterCredits.toFixed(2)} sem.`, color: "" },
                  { label: "Degree Progress", value: `${Math.min((result.totalSemesterCredits / 120) * 100, 100).toFixed(1)}%`, color: "text-emerald-500" },
                ].map((s, i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{s.label}</div>
                    <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full text-base">
                  <thead className="bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="text-left text-xs uppercase tracking-wide text-muted-foreground font-semibold py-2.5 px-3">Item</th>
                      <th className="text-right text-xs uppercase tracking-wide text-muted-foreground font-semibold py-2.5 px-3">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={r.label.includes("Total") ? "font-bold bg-secondary/10 border-t-2 border-border" : ""}>
                        <td className="text-base py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="text-base py-2.5 px-3 text-right font-medium">{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border border-border rounded-lg p-5 bg-card">
                <h3 className="text-sm font-semibold mb-3">Semester Credit Breakdown</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="credits" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <span className="text-sm font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is Quarter to Semester Credit Conversion?</h2>
            <p className="text-muted-foreground leading-relaxed">Universities in the United States use one of two academic calendar systems: semester (two ~15-week terms per year) or quarter (three ~10-week terms per year). When transferring between institutions using different systems, credits must be converted. The standard ratio used by the American Association of Collegiate Registrars and Admissions Officers (AACRAO) is: 1 quarter credit = 2/3 of a semester credit, or equivalently, 1 semester credit = 3/2 (1.5) quarter credits. This calculator also tracks total accumulated credits toward a 120-semester-credit bachelor's degree.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How the Conversion Works</h2>
            <p className="text-muted-foreground leading-relaxed">Quarter Credits to Semester Credits: Multiply quarter credits by 2/3 (0.6667). For example, 90 quarter credits × 0.6667 = 60 semester credits. Semester Credits to Quarter Credits: Multiply semester credits by 3/2 (1.5). For example, 60 semester credits × 1.5 = 90 quarter credits. The conversion is linear and exact — it reflects the proportional difference in instructional time between the two systems. A standard full-time load is 15 semester credits or 15 quarter credits per term, but the academic year contains 2 semesters vs. 3 quarters, making the annual credit load equivalent.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">The primary result shows your exact converted credit count. If you enter existing semester credits already on your transcript, the calculator sums them with your converted credits and shows your total progress toward a 120-credit degree. The degree progress percentage uses 120 semester credits as the standard bachelor's degree benchmark. The academic years estimate assumes 30 credits per year (two 15-credit semesters). The bar chart breaks down converted credits, existing credits, and remaining credits visually for quick planning.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/quarter-to-semester-credit-conversion-calculator" />
      </div>
    </>
  );
}
