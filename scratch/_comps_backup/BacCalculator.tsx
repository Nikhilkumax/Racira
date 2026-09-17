"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell, ReferenceLine } from "recharts";

interface BacInputs {
  sex: "male" | "female";
  weight: number;
  drinks: number;
  hours: number;
  abv: number;
  drinkVolume: number;
  metabolismRate: number;
}

interface ImpairmentLevel {
  label: string;
  color: string;
  description: string;
}

interface BacResult {
  bac: number;
  impairment: ImpairmentLevel;
  hoursToSober: number;
  totalAlcoholOz: number;
  standardDrinks: number;
  overLegalLimit: boolean;
  legalLimitUS: number;
  genderConstant: number;
}

const DEFAULTS: BacInputs = {
  sex: "male",
  weight: 180,
  drinks: 3,
  hours: 2,
  abv: 5,
  drinkVolume: 12,
  metabolismRate: 0.015,
};

function safe(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function getImpairment(bac: number): ImpairmentLevel {
  if (bac <= 0) return { label: "Sober", color: "#10b981", description: "No measurable impairment. Safe to drive." };
  if (bac < 0.02) return { label: "Subtle Effects", color: "#22c55e", description: "Minimal effects; mood may lift slightly." };
  if (bac < 0.05) return { label: "Mild Euphoria", color: "#84cc16", description: "Relaxation, slight euphoria, minor loss of judgment." };
  if (bac < 0.08) return { label: "Reduced Coordination", color: "#f59e0b", description: "Impaired coordination and judgment. Do not drive." };
  if (bac < 0.10) return { label: "Legally Intoxicated", color: "#f97316", description: "Legally impaired in the US. Muscle coordination reduced." };
  if (bac < 0.15) return { label: "Reduced Reaction", color: "#ef4444", description: "Slowed reaction time and slurred speech." };
  if (bac < 0.20) return { label: "Significant Impairment", color: "#dc2626", description: "Significant impairment, possible nausea." };
  if (bac < 0.30) return { label: "Confusion / Stupor", color: "#b91c1c", description: "Confusion, disorientation, risk of blackout." };
  return { label: "Life-Threatening", color: "#7f1d1d", description: "Stupor, coma, and risk of death. Seek medical help." };
}

function calculate(input: BacInputs): BacResult {
  const weight = safe(input.weight);
  const drinks = safe(input.drinks);
  const hours = Number.isFinite(input.hours) && input.hours >= 0 ? input.hours : 0;
  const abv = safe(input.abv);
  const drinkVolume = safe(input.drinkVolume);
  const metabolismRate = safe(input.metabolismRate) || 0.015;

  const genderConstant = input.sex === "male" ? 0.73 : 0.66;
  const legalLimitUS = 0.08;

  // Total pure alcohol in ounces = drinks × ABV% × volume(oz)
  const totalAlcoholOz = drinks * (abv / 100) * drinkVolume;
  // Standard drinks (1 standard drink = 0.6 oz pure alcohol)
  const standardDrinks = totalAlcoholOz / 0.6;

  let bac = 0;
  if (weight > 0) {
    // Widmark formula: BAC = (A × 5.14 / (W × r)) − metabolism × H
    bac = (totalAlcoholOz * 5.14) / (weight * genderConstant) - metabolismRate * hours;
  }
  if (!Number.isFinite(bac) || bac < 0) bac = 0;

  const hoursToSober = metabolismRate > 0 ? bac / metabolismRate : 0;

  return {
    bac,
    impairment: getImpairment(bac),
    hoursToSober,
    totalAlcoholOz,
    standardDrinks,
    overLegalLimit: bac >= legalLimitUS,
    legalLimitUS,
    genderConstant,
  };
}

interface CIProps {
  id: string;
  label: string;
  value: number;
  onChange: (v: string) => void;
  suffix?: string;
  step?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const CI = ({ id, label, value, onChange, suffix, step, onKeyDown }: CIProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const BacCalculator = () => {
  const [inputs, setInputs] = useState<BacInputs>(DEFAULTS);
  const [result, setResult] = useState<BacResult>(calculate(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calculate(inputs));
  }, []);

  const setField = (key: keyof BacInputs) => (v: string) =>
    setInputs((prev) => ({ ...prev, [key]: v === "" ? 0 : parseFloat(v) || 0 }));

  const handleCalculate = () => setResult(calculate(inputs));

  const handleReset = () => {
    setInputs(DEFAULTS);
    setShowAdvanced(false);
    setResult(calculate(DEFAULTS));
  };

  const fmtBac = (n: number) => n.toFixed(3);
  const fmt = (n: number, d = 1) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

  const chartData = [
    { name: "You", bac: parseFloat(result.bac.toFixed(3)), color: result.impairment.color },
    { name: "EU / Canada", bac: 0.05, color: "#3b82f6" },
    { name: "US / UK", bac: 0.08, color: "#f97316" },
    { name: "Intoxicated", bac: 0.15, color: "#dc2626" },
    { name: "Danger", bac: 0.30, color: "#7f1d1d" },
  ];

  const faqs = [
    { question: "What is a standard drink?", answer: "In the United States, a standard drink contains about 14 grams (0.6 ounces) of pure alcohol. This is roughly equivalent to 12 ounces of regular beer (5% ABV), 5 ounces of wine (12% ABV), or 1.5 ounces of distilled spirits (40% ABV). This calculator uses your ABV and drink volume in Advanced Options to compute exact pure-alcohol content." },
    { question: "Why do women reach higher BAC than men?", answer: "Women typically have less body water and a lower alcohol distribution ratio (r = 0.66 vs. 0.73 for men). The same amount of alcohol becomes more concentrated in a woman's bloodstream, producing a higher BAC for the same weight and number of drinks." },
    { question: "Can I speed up sobering up?", answer: "No. The liver metabolizes alcohol at a roughly constant rate of about 0.015 BAC per hour. Coffee, cold showers, or water do not accelerate elimination — they only mask the feeling of intoxication. Only time reduces your BAC." },
    { question: "Is this calculator accurate enough to decide if I can drive?", answer: "No. The Widmark formula provides an estimate based on population averages. Actual BAC varies with food intake, genetics, medication, liver health, and drinking speed. Never rely on any calculator to decide whether it is safe or legal to drive. When in doubt, do not drive." },
    { question: "What are the legal BAC limits by country?", answer: "The US and UK set the driving limit at 0.08%, while Canada and most EU countries use 0.05%. Many jurisdictions apply stricter or zero-tolerance limits for commercial and underage drivers. Always check local law." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "BAC Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">BAC Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label htmlFor="sex" className="text-sm font-semibold text-foreground mb-1.5">Sex</label>
                <select
                  id="sex"
                  value={inputs.sex}
                  onChange={(e) => setInputs((prev) => ({ ...prev, sex: e.target.value as "male" | "female" }))}
                  onKeyDown={e => { if (e.key === 'Enter') handleCalculate(); }}
                  className="h-10 w-full px-3 text-base rounded-md border border-input bg-background shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <CI id="weight" label="Weight" value={inputs.weight} onChange={setField("weight")} suffix="lbs" onKeyDown={e => { if (e.key === 'Enter') handleCalculate(); }} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CI id="drinks" label="Drinks" value={inputs.drinks} onChange={setField("drinks")} onKeyDown={e => { if (e.key === 'Enter') handleCalculate(); }} />
              <CI id="hours" label="Hours Since First Drink" value={inputs.hours} onChange={setField("hours")} suffix="hrs" step="0.5" onKeyDown={e => { if (e.key === 'Enter') handleCalculate(); }} />
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">Drink Details</div>
                  <div className="grid grid-cols-2 gap-4">
                    <CI id="abv" label="Alcohol by Volume" value={inputs.abv} onChange={setField("abv")} suffix="%" step="0.1" onKeyDown={e => { if (e.key === 'Enter') handleCalculate(); }} />
                    <CI id="drinkVolume" label="Drink Volume" value={inputs.drinkVolume} onChange={setField("drinkVolume")} suffix="oz" step="0.5" onKeyDown={e => { if (e.key === 'Enter') handleCalculate(); }} />
                    <CI id="metabolismRate" label="Metabolism Rate" value={inputs.metabolismRate} onChange={setField("metabolismRate")} step="0.001" onKeyDown={e => { if (e.key === 'Enter') handleCalculate(); }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ABV and drink volume determine pure alcohol per drink. Metabolism rate is the BAC reduction per hour (average ~0.015).
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={handleCalculate}
                className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center transition-colors shadow-sm active:scale-[0.98]"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <>
              <div
                className="bg-primary/10 border-l-4 border-primary rounded-lg p-5"
              >
                <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Estimated BAC</div>
                <div className="text-4xl font-bold text-primary">{fmtBac(result.bac)}%</div>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${result.impairment.color}1A`, color: result.impairment.color }}>
                  {result.impairment.label}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{result.impairment.description}</div>
              </div>

              <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
                <div className="p-4 text-center border-r border-border">
                  <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">BAC Level</div>
                  <div className="text-lg font-bold text-foreground">{fmtBac(result.bac)}%</div>
                </div>
                <div className="p-4 text-center border-r border-border">
                  <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Impairment</div>
                  <div className="text-lg font-bold" style={{ color: result.impairment.color }}>{result.impairment.label}</div>
                </div>
                <div className="p-4 text-center">
                  <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Time to Sober</div>
                  <div className="text-lg font-bold text-primary">{fmt(result.hoursToSober)} hrs</div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border bg-card">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-3">Metric</th>
                      <th className="p-3 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    <tr className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                      <td className="p-3 font-semibold text-foreground">Estimated BAC</td>
                      <td className="p-3 text-right text-foreground">{fmtBac(result.bac)}%</td>
                    </tr>
                    <tr className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                      <td className="p-3 font-semibold text-foreground">Impairment Level</td>
                      <td className="p-3 text-right font-medium" style={{ color: result.impairment.color }}>{result.impairment.label}</td>
                    </tr>
                    <tr className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                      <td className="p-3 font-semibold text-foreground">Pure Alcohol Consumed</td>
                      <td className="p-3 text-right text-foreground">{fmt(result.totalAlcoholOz, 2)} oz</td>
                    </tr>
                    <tr className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                      <td className="p-3 font-semibold text-foreground">Standard Drinks Equivalent</td>
                      <td className="p-3 text-right text-foreground">{fmt(result.standardDrinks)}</td>
                    </tr>
                    <tr className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                      <td className="p-3 font-semibold text-foreground">Gender Constant (r)</td>
                      <td className="p-3 text-right text-foreground">{result.genderConstant}</td>
                    </tr>
                    <tr className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                      <td className="p-3 font-semibold text-foreground">Time to Reach 0.00%</td>
                      <td className="p-3 text-right text-foreground">{fmt(result.hoursToSober)} hrs</td>
                    </tr>
                    <tr className="font-bold bg-secondary/30 text-foreground text-base border-t-2 border-border">
                      <td className="p-3">US Legal Driving Limit</td>
                      <td className="p-3 text-right" style={{ color: result.overLegalLimit ? "#dc2626" : "#10b981" }}>
                        {result.overLegalLimit ? "Over 0.08%" : "Under 0.08%"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">BAC vs. Legal Limits &amp; Impairment</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 0.32]} />
                    <Tooltip
                      formatter={(v: number) => [`${Number(v).toFixed(3)}%`, "BAC"]}
                      contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                    />
                    <ReferenceLine y={0.08} stroke="#f97316" strokeDasharray="4 4" />
                    <Bar dataKey="bac" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell key={`c-${i}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-2">
                  The dashed line marks the US/UK legal driving limit (0.08%). Your estimated BAC is shown in the first bar.
                </p>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-semibold text-foreground mb-3">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-base">
                  <div className="flex justify-between"><span className="text-muted-foreground">Sex:</span><span className="font-medium text-foreground capitalize">{inputs.sex}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Weight:</span><span className="font-medium text-foreground">{fmt(inputs.weight, 0)} lbs</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Drinks:</span><span className="font-medium text-foreground">{fmt(inputs.drinks, 0)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Hours Elapsed:</span><span className="font-medium text-foreground">{fmt(inputs.hours)} hrs</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Drink ABV:</span><span className="font-medium text-foreground">{fmt(inputs.abv)}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Drink Volume:</span><span className="font-medium text-foreground">{fmt(inputs.drinkVolume)} oz</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Estimated BAC:</span><span className="font-medium" style={{ color: result.impairment.color }}>{fmtBac(result.bac)}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Time to Sober:</span><span className="font-medium text-primary">{fmt(result.hoursToSober)} hrs</span></div>
                </div>
                <div className="mt-4 p-3 bg-secondary/30 border border-border rounded-md text-xs text-muted-foreground">
                  <strong>Disclaimer:</strong> This is an estimate based on the Widmark formula and population averages. Actual BAC varies with food, genetics, and health. Never use this tool to decide whether it is safe or legal to drive.
                </div>
              </div>
            </>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a BAC Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">
                A Blood Alcohol Content (BAC) calculator estimates the concentration of alcohol in your bloodstream after drinking, expressed as a percentage of alcohol by volume in blood. It uses the Widmark formula, developed by Swedish physiologist Erik Widmark, which factors in your body weight, sex, the amount of pure alcohol consumed, and the time elapsed since your first drink. With defaults of a 180-lb male having 3 standard beers over 2 hours, the tool estimates a BAC around 0.05% — approaching the legal driving limit in Canada and most of the EU. BAC is the metric used by law enforcement worldwide to determine legal impairment, making it critical for understanding when it is unsafe or illegal to drive.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">How the Widmark Formula Works</h2>
              <p className="text-muted-foreground leading-relaxed">
                The core formula is BAC = (A × 5.14 / (W × r)) − 0.015 × H, where A is the total ounces of pure alcohol consumed, W is body weight in pounds, r is the gender distribution ratio (0.73 for men, 0.66 for women), and H is the number of hours since the first drink. The Advanced Options let you set exact ABV and drink volume so A is computed precisely: A = drinks × (ABV ÷ 100) × volume in ounces. Because women have less body water, their lower r value produces a higher BAC for the same intake. The liver then metabolizes alcohol at a steady rate — about 0.015 BAC per hour — which is why time is the only reliable way to sober up. Dividing your current BAC by that rate gives the estimated hours until you return to 0.00%.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Impairment Levels and Legal Limits</h2>
              <p className="text-muted-foreground leading-relaxed">
                Impairment rises steadily with BAC. At 0.02% you may feel subtle relaxation; by 0.05% coordination and judgment decline; at 0.08% — the legal limit in the US and UK — muscle coordination is clearly impaired; and beyond 0.30% there is real risk of stupor, coma, or death. Legal driving limits differ by country: 0.08% in the US and UK, but 0.05% in Canada and most EU nations, with stricter limits for commercial and underage drivers. This calculator is intended for education and awareness only. Real BAC depends on food intake, medication, genetics, hydration, and drinking speed, none of which averages can fully capture. Never rely on an estimate to decide whether to drive — if you have been drinking, arrange a ride or wait it out.
              </p>
            </div>
          </section>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bac-calculator" />
          <PopularCalculators exclude="/calculator/bac-calculator" />
        </div>
      </div>
    </>
  );
};

export default BacCalculator;
