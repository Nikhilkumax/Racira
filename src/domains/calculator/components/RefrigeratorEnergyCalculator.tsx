"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface FridgeInput {
  size: number;
  age: number;
  rate: number;
}

interface FridgeResult {
  annualKwh: number;
  annualCost: number;
  monthlyCost: number;
  energyStarKwh: number;
  energyStarSavings: number;
  chartData: { name: string; cost: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcFridge(input: FridgeInput): FridgeResult {
  // Base estimate: ~12 kWh/mo per cubic foot plus fixed draw, degraded ~1.5%/yr with age
  const baseKwh = 200 + 12 * input.size;
  const ageFactor = 1 + Math.min(20, Math.max(0, input.age)) * 0.015;
  const annualKwh = baseKwh * ageFactor;
  const annualCost = (annualKwh * input.rate) / 1000; // rate in $/kWh
  const monthlyCost = annualCost / 12;
  const energyStarKwh = annualKwh * 0.85; // ENERGY STAR: ~15% more efficient
  const energyStarSavings = annualCost * 0.15;

  const chartData = [
    { name: "Standard Unit", cost: Number(annualCost.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "ENERGY STAR", cost: Number(((energyStarKwh * input.rate) / 1000).toFixed(2)), fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Refrigerator Size", value: `${input.size.toFixed(0)} cu ft` },
    { label: "Unit Age", value: `${input.age.toFixed(0)} years` },
    { label: "Electricity Rate", value: `$${input.rate.toFixed(2)}/kWh` },
    { label: "Estimated Annual Use", value: `${annualKwh.toFixed(0)} kWh` },
    { label: "Annual Electricity Cost", value: `$${annualCost.toFixed(2)}` },
    { label: "Monthly Cost", value: `$${monthlyCost.toFixed(2)}` },
    { label: "ENERGY STAR Annual Cost", value: `$${((energyStarKwh * input.rate) / 1000).toFixed(2)}` },
    { label: "Yearly Savings (ENERGY STAR)", value: `$${energyStarSavings.toFixed(2)}` },
    { label: "5-Year Savings", value: `$${(energyStarSavings * 5).toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Annual kWh", value: `${annualKwh.toFixed(0)} kWh` },
    { label: "Annual Cost", value: `$${annualCost.toFixed(2)}` },
    { label: "Monthly Cost", value: `$${monthlyCost.toFixed(2)}` },
    { label: "ENERGY STAR Savings", value: `$${energyStarSavings.toFixed(2)}/yr` },
    { label: "Daily Cost", value: `$${(annualCost / 365).toFixed(3)}` },
    { label: "Cost over 10 Years", value: `$${(annualCost * 10).toFixed(0)}` },
  ];

  return { annualKwh, annualCost, monthlyCost, energyStarKwh, energyStarSavings, chartData, breakdown, summaryStats };
}

const DEFAULTS: FridgeInput = { size: 18, age: 8, rate: 0.17 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function RefrigeratorEnergyCalculator() {
  const [size, setSize] = useState(String(DEFAULTS.size));
  const [age, setAge] = useState(String(DEFAULTS.age));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [result, setResult] = useState<FridgeResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcFridge({ size: parse(size, DEFAULTS.size), age: parse(age, DEFAULTS.age), rate: parse(rate, DEFAULTS.rate) }));
  const reset = () => {
    setSize(String(DEFAULTS.size));
    setAge(String(DEFAULTS.age));
    setRate(String(DEFAULTS.rate));
    setResult(calcFridge(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcFridge(DEFAULTS));
  }, []);

  const faqs = [
    { question: "How much electricity does a refrigerator use?", answer: "A typical 18-cubic-foot refrigerator uses roughly 400–600 kWh per year — about $70–$100 annually at the national average rate. Refrigerators run 24/7, so they are among the top three energy consumers in most homes, behind HVAC and water heating." },
    { question: "Do old refrigerators use more energy?", answer: "Yes. Efficiency standards tightened dramatically in the 1990s and again in the 2010s. A 20-year-old fridge can use 2–3× the energy of a new ENERGY STAR model. Older units also lose compressor efficiency with age, which this calculator models at roughly 1.5% per year." },
    { question: "What is ENERGY STAR for refrigerators?", answer: "ENERGY STAR certified refrigerators use about 15% less energy than the federal minimum standard — roughly 10–15% less than a comparable standard model. Replacing a 15-year-old unit with an ENERGY STAR model typically saves $40–$80 per year in electricity." },
    { question: "How can I reduce refrigerator energy use?", answer: "Keep coils clean (vacuum twice a year), set the fridge to 37–40°F and freezer to 0–5°F, keep the door seals tight (test with a dollar bill), allow airflow around the unit, and keep the fridge reasonably full — thermal mass reduces compressor cycling." },
    { question: "Does refrigerator size affect energy use?", answer: "Yes — larger units cool more interior volume and generally use more energy, though modern compressors are remarkably efficient. A 25 cu ft French door model may use only 25–30% more than an 18 cu ft top freezer. Buy the smallest size that fits your household." },
    { question: "Is it worth replacing an old fridge?", answer: "Generally yes. The annual savings from upgrading a pre-2000 unit often exceed $100, paying for a new ENERGY STAR model in 7–10 years of electricity savings alone — before counting repair cost avoidance. For units under 10 years old, replacement usually isn't cost-effective yet." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Refrigerator Energy Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Refrigerator Energy Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Refrigerator Size</label>
                <div className={inp}><input type="number" value={size} onChange={(e) => setSize(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">cu ft</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Unit Age</label>
                <div className={inp}><input type="number" value={age} onChange={(e) => setAge(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Electricity Rate</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={rate} onChange={(e) => setRate(e.target.value)} step={0.01} className={ci} /><span className="pr-3 text-muted-foreground text-sm">/kWh</span></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Annual Cost</div>
                  <div className="text-4xl font-extrabold tracking-tight">${result.annualCost.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground mt-1">{result.annualKwh.toFixed(0)} kWh/yr · ${result.monthlyCost.toFixed(2)}/month</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Annual kWh", `${result.annualKwh.toFixed(0)} kWh`], ["Monthly Cost", `$${result.monthlyCost.toFixed(2)}`], ["ENERGY STAR Savings", `$${result.energyStarSavings.toFixed(2)}/yr`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Energy Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Standard vs ENERGY STAR</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${v.toFixed(0)}`} />
                      <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}/yr`, ""]} />
                      <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
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
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Biggest Always-On Load</h2>
            <p>Refrigerators are the only major appliance that runs continuously, cycling their compressor around the clock. That makes them the third-largest energy consumer in most homes — behind HVAC and water heating — typically 8–13% of the electricity bill. Understanding your unit's draw is the first step to cutting it.</p>
            <h2 className="text-2xl font-bold mb-3">Age and Efficiency</h2>
            <p>Federal efficiency standards have tightened repeatedly, so vintage matters enormously: a fridge from 1995 may use 800+ kWh per year, while a modern ENERGY STAR model of the same size uses under 400. This calculator models both the size baseline and the age penalty, then compares your unit against an ENERGY STAR replacement.</p>
            <h2 className="text-2xl font-bold mb-3">Simple Savings Levers</h2>
            <p>Clean condenser coils twice a year, verify door seals, keep temperatures at 37–40°F and 0–5°F, and let hot food cool before storing. Each fix trims compressor runtime. When the unit is older than 12–15 years, replacement with an ENERGY STAR model is usually the strongest lever of all.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/refrigerator-energy-calculator" />
          <PopularCalculators exclude="/calculator/refrigerator-energy-calculator" />
        </div>
      </div>
    </>
  );
}
