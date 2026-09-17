"use client";
import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface TuitionInputs {
  tuition: number;
  years: number;
  startingSalary: number;
  growthPct: number;
  careerYears: number;
  baselineSalary: number;
}

interface ChartPoint {
  year: number;
  net: number;
}

interface TuitionResults {
  totalCost: number;
  withDegreeEarnings: number;
  withoutDegreeEarnings: number;
  lifetimePremium: number;
  roiPct: number;
  breakEvenYear: number | null;
  chartData: ChartPoint[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
function calcRoi(i: TuitionInputs): TuitionResults {
  const totalCost = i.tuition * i.years;
  const growth = 1 + i.growthPct / 100;

  const chartData: ChartPoint[] = [{ year: 0, net: -totalCost }];
  let withDegreeEarnings = 0;
  let withoutDegreeEarnings = i.baselineSalary * i.careerYears;
  let cumulative = -totalCost;
  let breakEvenYear: number | null = null;

  for (let y = 1; y <= i.careerYears; y++) {
    const withSalary = i.startingSalary * Math.pow(growth, y);
    withDegreeEarnings += withSalary;
    cumulative += withSalary - i.baselineSalary;
    chartData.push({ year: y, net: Math.round(cumulative) });
    if (breakEvenYear === null && cumulative >= 0) breakEvenYear = y;
  }

  const lifetimePremium = withDegreeEarnings - withoutDegreeEarnings - totalCost;
  const roiPct = totalCost > 0 ? (lifetimePremium / totalCost) * 100 : 0;

  const fmt = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

  const breakdown = [
    { label: "Annual Tuition", value: fmt(i.tuition) },
    { label: "Years in Program", value: `${i.years}` },
    { label: "Total Education Cost", value: fmt(totalCost) },
    { label: "Starting Salary (With Degree)", value: fmt(i.startingSalary) },
    { label: "Salary Growth (Annual)", value: `${i.growthPct}%` },
    { label: "Career Length", value: `${i.careerYears} years` },
    { label: "Baseline Salary (No Degree)", value: fmt(i.baselineSalary) },
    { label: "Lifetime Earnings (With Degree)", value: fmt(withDegreeEarnings) },
    { label: "Lifetime Earnings (No Degree)", value: fmt(withoutDegreeEarnings) },
    { label: "Lifetime Earnings Premium", value: fmt(lifetimePremium), highlight: true },
    { label: "Return on Investment", value: `${roiPct.toFixed(0)}%`, isTotal: true },
    { label: "Break-Even Year", value: breakEvenYear !== null ? `Year ${breakEvenYear}` : "Never" },
  ];

  const summaryStats = [
    { label: "Total Education Cost", value: fmt(totalCost) },
    { label: "Lifetime Premium", value: fmt(lifetimePremium) },
    { label: "Return on Investment", value: `${roiPct.toFixed(0)}%` },
    { label: "Break-Even Year", value: breakEvenYear !== null ? `Year ${breakEvenYear}` : "Never" },
    { label: "With-Degree Earnings", value: fmt(withDegreeEarnings) },
    { label: "No-Degree Earnings", value: fmt(withoutDegreeEarnings) },
    { label: "Starting Salary", value: fmt(i.startingSalary) },
    { label: "Annual Growth", value: `${i.growthPct}%` },
  ];

  return { totalCost, withDegreeEarnings, withoutDegreeEarnings, lifetimePremium, roiPct, breakEvenYear, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  tuition: "25000",
  years: "4",
  startingSalary: "65000",
  growthPct: "3",
  careerYears: "40",
  baselineSalary: "42000",
};

const fmtMoney = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

// 4. Component
export default function TuitionRoiCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<TuitionResults>(() =>
    calcRoi({ tuition: 25000, years: 4, startingSalary: 65000, growthPct: 3, careerYears: 40, baselineSalary: 42000 })
  );

  useEffect(() => {
    setResult(calcRoi({ tuition: 25000, years: 4, startingSalary: 65000, growthPct: 3, careerYears: 40, baselineSalary: 42000 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () => {
    setResult(
      calcRoi({
        tuition: parseFloat(inputs.tuition) || 0,
        years: parseFloat(inputs.years) || 0,
        startingSalary: parseFloat(inputs.startingSalary) || 0,
        growthPct: parseFloat(inputs.growthPct) || 0,
        careerYears: parseFloat(inputs.careerYears) || 0,
        baselineSalary: parseFloat(inputs.baselineSalary) || 0,
      })
    );
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcRoi({ tuition: 25000, years: 4, startingSalary: 65000, growthPct: 3, careerYears: 40, baselineSalary: 42000 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const tuition = parseFloat(inputs.tuition) || 0;
  const years = parseFloat(inputs.years) || 0;
  const careerYears = parseFloat(inputs.careerYears) || 0;
  if (tuition < 0) errors.tuition = "Tuition cannot be negative";
  if (years <= 0) errors.years = "Years must be greater than 0";
  if (careerYears <= 0) errors.careerYears = "Career length must be greater than 0";
  if ((parseFloat(inputs.startingSalary) || 0) < 0) errors.startingSalary = "Salary cannot be negative";
  if ((parseFloat(inputs.baselineSalary) || 0) < 0) errors.baselineSalary = "Salary cannot be negative";
  if ((parseFloat(inputs.growthPct) || 0) < 0) errors.growthPct = "Growth cannot be negative";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "What is tuition ROI?", answer: "Tuition ROI measures the financial return on a college education. It compares the extra lifetime earnings a degree makes possible against the total cost of earning it: ROI = (lifetime earnings with degree − lifetime earnings without − total cost) ÷ total cost. A higher number means the education pays for itself many times over." },
    { question: "How is the break-even year calculated?", answer: "Each year after graduation, your with-degree salary is compared to the no-degree baseline. The cumulative difference is offset against the total education cost; the first year the running total turns positive is your break-even year. With the default inputs ($25K/year tuition, $65K starting salary), break-even lands around year 4." },
    { question: "Why does the baseline salary matter?", answer: "The no-degree baseline anchors the comparison — it represents what you would likely earn without attending. Using a realistic baseline (not zero) prevents the calculator from overstating the degree's value. A common assumption is 60-70% of the with-degree starting salary." },
    { question: "What costs should I include?", answer: "This calculator includes tuition only. For a fuller picture, add fees, books, room and board, and subtract grants and scholarships from the annual tuition figure. You can also factor in interest on student loans by raising the annual tuition to include projected loan payments." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "Tuition ROI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tuition ROI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="tuition" className={lbl}>Annual Tuition</label>
                <div className={inp}>
                  <span className="pl-3 text-muted-foreground text-sm">$</span>
                  <input id="tuition" type="number" min="0" value={inputs.tuition} onChange={(e) => set("tuition")(e.target.value)} className={ci} />
                </div>
                {errors.tuition && <p className="text-xs text-red-500 font-medium mt-1">{errors.tuition}</p>}
              </div>
              <div>
                <label htmlFor="years" className={lbl}>Years in Program</label>
                <div className={inp}>
                  <input id="years" type="number" min="1" value={inputs.years} onChange={(e) => set("years")(e.target.value)} className={ci} />
                </div>
                {errors.years && <p className="text-xs text-red-500 font-medium mt-1">{errors.years}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="starting-salary" className={lbl}>Starting Salary (With Degree)</label>
                <div className={inp}>
                  <span className="pl-3 text-muted-foreground text-sm">$</span>
                  <input id="starting-salary" type="number" min="0" value={inputs.startingSalary} onChange={(e) => set("startingSalary")(e.target.value)} className={ci} />
                </div>
                {errors.startingSalary && <p className="text-xs text-red-500 font-medium mt-1">{errors.startingSalary}</p>}
              </div>
              <div>
                <label htmlFor="growth" className={lbl}>Salary Growth</label>
                <div className={inp}>
                  <input id="growth" type="number" min="0" step="0.5" value={inputs.growthPct} onChange={(e) => set("growthPct")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">% /yr</span>
                </div>
                {errors.growthPct && <p className="text-xs text-red-500 font-medium mt-1">{errors.growthPct}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="career" className={lbl}>Career Length</label>
                <div className={inp}>
                  <input id="career" type="number" min="1" value={inputs.careerYears} onChange={(e) => set("careerYears")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">years</span>
                </div>
                {errors.careerYears && <p className="text-xs text-red-500 font-medium mt-1">{errors.careerYears}</p>}
              </div>
              <div>
                <label htmlFor="baseline" className={lbl}>Salary Without Degree</label>
                <div className={inp}>
                  <span className="pl-3 text-muted-foreground text-sm">$</span>
                  <input id="baseline" type="number" min="0" value={inputs.baselineSalary} onChange={(e) => set("baselineSalary")(e.target.value)} className={ci} />
                </div>
                {errors.baselineSalary && <p className="text-xs text-red-500 font-medium mt-1">{errors.baselineSalary}</p>}
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calculate}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Return on Investment</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.roiPct.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground mt-1">
                Over a {parseFloat(inputs.careerYears) || 40}-year career · Break-even at {result.breakEvenYear !== null ? `year ${result.breakEvenYear}` : "never"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Total Education Cost", fmtMoney(result.totalCost)],
                ["Lifetime Premium", fmtMoney(result.lifetimePremium)],
                ["Break-Even Year", result.breakEvenYear !== null ? `Year ${result.breakEvenYear}` : "Never"],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold text-foreground">{v}</div>
                </div>
              ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">ROI Breakdown</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`px-3 py-2.5 ${r.highlight ? "font-semibold text-amber-700" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Cumulative Net Benefit Over Career</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={4} />
                  <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={55} />
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Net benefit"]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Area type="monotone" dataKey="net" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">The line crosses zero at your break-even year — after that, the degree has paid for itself.</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Tuition ROI?</h2>
            <p>Return on investment measures whether a college education is worth its price tag. The calculation compares the total lifetime earnings you can expect with the degree against what you would earn without it, then divides the difference by the total cost of the education. A degree that costs $100,000 and adds $1.5M in lifetime earnings has an ROI of roughly 1,400%.</p>
            <h2 className="text-2xl font-bold mb-3">How to Read Your Results</h2>
            <p>The <strong>lifetime premium</strong> is the extra earnings the degree generates after subtracting both the no-degree baseline and the tuition cost. The <strong>break-even year</strong> tells you how long after graduation the degree starts paying off. Both matter: a low-cost degree with a modest premium can outperform an expensive degree with a large premium because it breaks even much sooner.</p>
            <h2 className="text-2xl font-bold mb-3">Choosing Your Assumptions</h2>
            <p>Results are only as good as the inputs. Use your actual in-state or net tuition (after grants and scholarships) rather than the sticker price. Use realistic starting salaries from your field's entry-level data, and a growth rate of 2-4% per year for typical white-collar careers. Adjusting the no-degree baseline to your actual likely alternative — rather than a generic figure — makes the comparison honest.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tuition-roi-calculator" />
          <PopularCalculators exclude="/calculator/tuition-roi-calculator" />
        </div>
      </div>
    </>
  );
}
