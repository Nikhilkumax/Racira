"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, PawPrint } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

type SizeKey = "small" | "medium" | "large";

interface DogAgeResult {
  dogYears: number;
  size: SizeKey;
  humanAge: number;
  lifespan: number;
  stage: string;
  chartData: { name: string; value: number }[];
}

function calcDogAge(dogYears: number, size: SizeKey): DogAgeResult {
  let humanAge: number;
  if (dogYears <= 1) humanAge = 15 * dogYears;
  else if (dogYears <= 2) humanAge = 15 + 9 * (dogYears - 1);
  else {
    const extra = size === "small" ? 4 : size === "medium" ? 5 : 6;
    humanAge = 24 + extra * (dogYears - 2);
  }
  const lifespan = size === "small" ? 14 : size === "medium" ? 12 : 10;
  const stage = dogYears < 1 ? "Puppy" : dogYears < 6 ? "Adult" : "Senior";
  const used = Math.min(100, (dogYears / lifespan) * 100);
  const chartData = [
    { name: "Lifespan Used", value: Number(used.toFixed(1)) },
    { name: "Lifespan Remaining", value: Number((100 - used).toFixed(1)) },
  ];
  return { dogYears, size, humanAge, lifespan, stage, chartData };
}

const DEFAULTS = { age: "5", size: "medium" as SizeKey };

const SIZE_LABELS: Record<SizeKey, string> = { small: "Small (≤ 20 lb)", medium: "Medium (21–50 lb)", large: "Large (> 50 lb)" };

const COLORS = ["hsl(var(--primary))", "hsl(38 92% 50%)"];

const faqs = [
  { question: "Is one dog year really seven human years?", answer: "No — that rule oversimplifies. Dogs mature rapidly in their first two years (year one ≈ 15 human years, year two ≈ +9), then age more slowly. The '7 years' rule drastically overestimates adult dog ages." },
  { question: "Why does size matter?", answer: "Large breeds age faster after maturity: a Great Dane's cells wear out sooner than a Chihuahua's. Common adjustments are +4 human years per dog year for small dogs, +5 medium, +6 large after age two." },
  { question: "What are dog life stages?", answer: "Puppy (under 1 year), adult (1–6 years for large, 1–7 for small), and senior (past about 75% of expected lifespan). Seniors need adjusted diet, joint care, and more frequent vet checks." },
];

export default function DogAgeCalculator() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [size, setSize] = useState<SizeKey>(DEFAULTS.size);
  const [result, setResult] = useState<DogAgeResult>(() => calcDogAge(5, "medium"));

  useEffect(() => {
    const a = parseFloat(age);
    if (!isNaN(a) && a >= 0) setResult(calcDogAge(a, size));
  }, [age, size]);

  const reset = () => { setAge(DEFAULTS.age); setSize(DEFAULTS.size); };
  const invalid = isNaN(parseFloat(age)) || parseFloat(age) < 0;

  const breakdown = [
    { label: "Dog Age", value: `${result.dogYears.toFixed(1)} years` },
    { label: "Size", value: SIZE_LABELS[result.size] },
    { label: "Human-Equivalent Age", value: `${result.humanAge.toFixed(1)} years`, highlight: true },
    { label: "Life Stage", value: result.stage },
    { label: "Expected Lifespan", value: `${result.lifespan} years` },
    { label: "Lifespan Used", value: `${((result.dogYears / result.lifespan) * 100).toFixed(1)}%` },
  ];

  const summaryStats = [
    { label: "Human Age", value: `${result.humanAge.toFixed(1)} yrs` },
    { label: "Life Stage", value: result.stage },
    { label: "Lifespan", value: `${result.lifespan} yrs` },
    { label: "Dog Age", value: `${result.dogYears.toFixed(1)} yrs` },
    { label: "Size Class", value: SIZE_LABELS[result.size].split(" ")[0] },
    { label: "Lifespan Used", value: `${((result.dogYears / result.lifespan) * 100).toFixed(1)}%` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Dog Age Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dog Age Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="da-age" className="block text-sm font-medium mb-1 text-foreground">Dog's Age (years)</label>
              <input id="da-age" type="number" min="0" step="0.5" value={age} onChange={(e) => setAge(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label htmlFor="da-size" className="block text-sm font-medium mb-1 text-foreground">Dog Size</label>
              <select id="da-size" value={size} onChange={(e) => setSize(e.target.value as SizeKey)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                {Object.entries(SIZE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <PawPrint className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a non-negative dog age.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Human-Equivalent Age</div>
              <div className="text-4xl font-extrabold text-primary">{result.humanAge.toFixed(1)} years</div>
              <div className="text-sm text-muted-foreground mt-1">{result.dogYears.toFixed(1)} dog years · {result.stage} · {SIZE_LABELS[result.size]}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Life Stage</div>
                <div className="text-lg font-bold text-primary">{result.stage}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Expected Lifespan</div>
                <div className="text-lg font-bold text-primary">{result.lifespan} yrs</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Lifespan Used</div>
                <div className="text-lg font-bold text-primary">{((result.dogYears / result.lifespan) * 100).toFixed(1)}%</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
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
              <h3 className="text-base font-bold mb-3">Lifespan Progress</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {result.chartData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
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
            <h2 className="text-2xl font-bold mb-3">About the Dog Age Calculator</h2>
            <p>Dog aging is fastest early in life: the first year equals about 15 human years (puppies reach sexual maturity quickly), the second adds roughly 9 (reaching 24), and after that large breeds age ~6 human years per dog year, medium ~5, small ~4.</p>
            <h3>Why the Old Rule Fails</h3>
            <p>The '1 dog year = 7 human years' rule assumed dogs live ~10 years and humans ~70, but it flattens the real curve: it makes a 1-year-old dog 7 (too young) and a 10-year-old dog 70 (about right for a small dog, old for a large one). Stage-based care — puppy, adult, senior — is what actually matters for health decisions.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dog-age-calculator" />
          <PopularCalculators exclude="/calculator/dog-age-calculator" />
        </div>
      </div>
    </>
  );
}
