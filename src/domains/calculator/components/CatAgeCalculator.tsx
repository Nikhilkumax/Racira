"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, PawPrint } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CatAgeResult {
  humanYears: number;
  stage: string;
  stageColor: string;
  expectedLifespan: number;
  remainingYears: number;
  chartData: { cat: number; human: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function catToHuman(catYears: number): number {
  if (catYears <= 0) return 0;
  if (catYears < 1) return Math.round(catYears * 15);
  if (catYears < 2) return 15 + Math.round((catYears - 1) * 9);
  return 24 + (catYears - 2) * 4;
}

function calcCatAge(catYears: number): CatAgeResult {
  const humanYears = catToHuman(catYears);
  const stage = catYears < 1 ? "Kitten" : catYears < 2 ? "Junior" : catYears < 10 ? "Prime Adult" : catYears < 15 ? "Senior" : "Geriatric";
  const stageColor = catYears < 1 ? "#10b981" : catYears < 2 ? "#3b82f6" : catYears < 10 ? "#f59e0b" : "#ef4444";
  const expectedLifespan = 17;
  const remainingYears = Math.max(0, expectedLifespan - catYears);

  const chartData: { cat: number; human: number }[] = [];
  for (let c = 0; c <= 20; c += 1) chartData.push({ cat: c, human: catToHuman(c) });

  const breakdown = [
    { label: "Cat Age", value: `${catYears.toFixed(1)} years` },
    { label: "Human-Equivalent Age", value: `${humanYears.toFixed(0)} years` },
    { label: "Life Stage", value: stage },
    { label: "1st Year", value: "≈ 15 human years" },
    { label: "2nd Year", value: "≈ 24 human years total" },
    { label: "Each Year After", value: "≈ +4 human years" },
    { label: "Expected Lifespan", value: "12–18 years (indoor cats)" },
    { label: "Years Remaining (est.)", value: `${remainingYears.toFixed(1)} years` },
  ];

  const summaryStats = [
    { label: "Human Age", value: `${humanYears.toFixed(0)} yrs` },
    { label: "Life Stage", value: stage },
    { label: "Typical Lifespan", value: `${expectedLifespan} yrs` },
    { label: "Remaining (est.)", value: `${remainingYears.toFixed(1)} yrs` },
    { label: "Ratio (cat:human)", value: catYears > 0 ? `1:${(humanYears / catYears).toFixed(1)}` : "—" },
    { label: "Maturity", value: catYears >= 1 ? "Adult" : "Kitten" },
  ];

  return { humanYears, stage, stageColor, expectedLifespan, remainingYears, chartData, breakdown, summaryStats };
}

const DEFAULTS = { age: "3" };

export default function CatAgeCalculator() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [result, setResult] = useState<CatAgeResult>(() => calcCatAge(3));

  useEffect(() => {
    const a = parseFloat(age);
    if (!isNaN(a) && a >= 0 && a <= 40) setResult(calcCatAge(a));
  }, []);

  const handleCalculate = () => {
    const a = parseFloat(age);
    if (!isNaN(a) && a >= 0 && a <= 40) setResult(calcCatAge(a));
  };
  const reset = () => { setAge(DEFAULTS.age); setResult(calcCatAge(parseFloat(DEFAULTS.age))); };
  const invalid = isNaN(parseFloat(age)) || parseFloat(age) < 0 || parseFloat(age) > 40;

  const faqs = [
    { question: "How do cat years compare to human years?", answer: "The first year of a cat's life equals about 15 human years. The second year adds 9 more (so a 2-year-old cat is about 24 in human years), and each year after that adds roughly 4 human years." },
    { question: "When is a cat considered a senior?", answer: "Cats are generally considered senior around age 10–11 (roughly 56–60 human years). With good care, indoor cats commonly live into their late teens." },
    { question: "Does breed affect lifespan?", answer: "Yes. Mixed-breed cats often live longer than purebreds, and some breeds (like Siamese) are known for longer lifespans, while others face breed-specific health issues." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Cat Age Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cat Age Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="cat-age" className="block text-sm font-medium mb-1 text-foreground">Cat Age (years)</label>
              <input
                id="cat-age"
                type="number"
                min="0"
                max="40"
                step="0.1"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground mt-1.5">Indoor cats typically live 12–18 years; outdoor cats often less.</p>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleCalculate} disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <PawPrint className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter an age between 0 and 40 years.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Human-Equivalent Age</div>
              <div className="text-4xl font-extrabold text-primary">{result.humanYears.toFixed(0)} years</div>
              <div className="text-sm text-muted-foreground mt-1">
                Life stage: <span style={{ color: result.stageColor }} className="font-semibold">{result.stage}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Cat Age</div>
                <div className="text-lg font-bold">{parseFloat(age).toFixed(1)} yrs</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Human Age</div>
                <div className="text-lg font-bold text-primary">{result.humanYears.toFixed(0)} yrs</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Remaining (est.)</div>
                <div className="text-lg font-bold text-emerald-600">{result.remainingYears.toFixed(0)} yrs</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Milestone</th>
                    <th className="p-2.5 pr-3 text-right">Human Years</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.breakdown.map((row) => (
                    <tr key={row.label}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Cat Years → Human Years</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="cat" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(0)} human years`, "Equivalent age"]} labelFormatter={(l: number) => `Cat age: ${l} yrs`} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="human" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {result.summaryStats.map((s) => (
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
            <h2 className="text-2xl font-bold mb-3">About the Cat Age Calculator</h2>
            <p>The old rule of thumb that one cat year equals seven human years is inaccurate. Cats mature quickly: the first year equals about 15 human years, the second brings the total to about 24, and each year after adds roughly four human years.</p>
            <h3>Why It Matters</h3>
            <p>Knowing your cat&apos;s true equivalent age helps you plan veterinary checkups, diet changes, and lifestyle adjustments — a 10-year-old cat is roughly 56 in human years, the point where regular senior screening becomes important.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cat-age-calculator" />
          <PopularCalculators exclude="/calculator/cat-age-calculator" />
        </div>
      </div>
    </>
  );
}
