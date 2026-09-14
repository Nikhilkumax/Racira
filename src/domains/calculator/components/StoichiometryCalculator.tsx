"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface StoiResult {
  molesA: number;
  molesB: number;
  massB: number;
  actualYield: number | null;
  percentYield: number | null;
  chartData: { name: string; moles: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcStoich(massA: number, mmA: number, ratio: number, mmB: number, actual: number | null): StoiResult {
  const molesA = massA / mmA;
  const molesB = molesA * ratio;
  const massB = molesB * mmB;
  const percentYield = actual !== null && massB > 0 ? (actual / massB) * 100 : null;

  const chartData = [
    { name: "Moles A", moles: molesA, fill: "hsl(var(--primary))" },
    { name: "Moles B", moles: molesB, fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Mass of Reactant A", value: `${massA.toFixed(2)} g` },
    { label: "Molar Mass of A", value: `${mmA.toFixed(2)} g/mol` },
    { label: "Moles of A (m ÷ M)", value: `${molesA.toFixed(4)} mol` },
    { label: "Mole Ratio (B : A)", value: `${ratio} : 1` },
    { label: "Moles of Product B", value: `${molesB.toFixed(4)} mol` },
    { label: "Molar Mass of B", value: `${mmB.toFixed(2)} g/mol` },
    { label: "Theoretical Mass of B", value: `${massB.toFixed(2)} g` },
    ...(percentYield !== null
      ? [
          { label: "Actual Yield", value: `${actual!.toFixed(2)} g` },
          { label: "Percent Yield", value: `${percentYield.toFixed(1)}%` },
        ]
      : []),
  ];

  const summaryStats = [
    { label: "Theoretical Mass B", value: `${massB.toFixed(2)} g` },
    { label: "Moles A", value: `${molesA.toFixed(4)} mol` },
    { label: "Moles B", value: `${molesB.toFixed(4)} mol` },
    { label: "Ratio B:A", value: `${ratio} : 1` },
    ...(percentYield !== null ? [{ label: "Percent Yield", value: `${percentYield.toFixed(1)}%` }] : []),
    { label: "Formula", value: "moles = mass ÷ molar mass" },
  ];

  return { molesA, molesB, massB, actualYield: actual, percentYield, chartData, breakdown, summaryStats };
}

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function StoichiometryCalculator() {
  const [massA, setMassA] = useState("100");
  const [mmA, setMmA] = useState("44.01");
  const [ratio, setRatio] = useState("1");
  const [mmB, setMmB] = useState("18.02");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [actual, setActual] = useState("35");
  const [useActual, setUseActual] = useState(false);
  const [result, setResult] = useState<StoiResult | null>(null);

  const parse = (s: string, fallback: number, min = 0) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= min ? n : fallback;
  };

  const calculate = () =>
    setResult(
      calcStoich(
        parse(massA, 100),
        Math.max(0.001, parse(mmA, 44.01, 0.001)),
        Math.max(0.001, parse(ratio, 1, 0.001)),
        Math.max(0.001, parse(mmB, 18.02, 0.001)),
        useActual ? parse(actual, 35) : null
      )
    );
  const reset = () => {
    setMassA("100");
    setMmA("44.01");
    setRatio("1");
    setMmB("18.02");
    setUseActual(false);
    setActual("35");
    setResult(calcStoich(100, 44.01, 1, 18.02, null));
  };
  useEffect(() => {
    setResult(calcStoich(100, 44.01, 1, 18.02, null));
  }, []);

  const faqs = [
    { question: "What is stoichiometry?", answer: "Stoichiometry is the quantitative relationship between reactants and products in a chemical reaction, based on the balanced equation's mole ratios. It answers the classic question: how much product will this much reactant make?" },
    { question: "How do I convert mass to moles?", answer: "Divide the mass by the molar mass: moles = m ÷ M. A molar mass is the mass of one mole (6.022 × 10²³ particles) of a substance, found by summing its atoms' atomic masses — 44.01 g/mol for CO₂, 18.02 g/mol for H₂O." },
    { question: "What is the mole ratio?", answer: "The mole ratio comes from the coefficients of the balanced equation. For 2H₂ + O₂ → 2H₂O, the ratio of H₂O to H₂ is 2:2 = 1:1, and H₂O to O₂ is 2:1 — meaning one mole of O₂ yields two moles of water." },
    { question: "What is percent yield?", answer: "Real reactions rarely produce the theoretical maximum. Percent yield = (actual ÷ theoretical) × 100. Enter your measured product mass in Advanced Options to see how efficient the reaction was." },
    { question: "What does the example mean?", answer: "The default models the classic reaction CO₂ + H₂O in photosynthesis-type ratios: 100 g of CO₂ (44.01 g/mol) converts to 2.272 mol, which at a 1:1 ratio yields 40.94 g of water (18.02 g/mol)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Stoichiometry Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Stoichiometry Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Mass of Reactant A (g)</label>
                <div className={inp}><input type="number" value={massA} onChange={(e) => setMassA(e.target.value)} className={ci} min={0} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Molar Mass of A (g/mol)</label>
                <div className={inp}><input type="number" value={mmA} onChange={(e) => setMmA(e.target.value)} className={ci} min={0.001} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Mole Ratio (B : A)</label>
                <div className={inp}><input type="number" value={ratio} onChange={(e) => setRatio(e.target.value)} className={ci} min={0.001} step={0.1} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Molar Mass of B (g/mol)</label>
                <div className={inp}><input type="number" value={mmB} onChange={(e) => setMmB(e.target.value)} className={ci} min={0.001} /></div>
              </div>
            </div>

            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="text-sm text-primary font-medium text-left self-start"
            >
              Advanced Options {advancedOpen ? "▲" : "▼"}
            </button>
            {advancedOpen && (
              <div className="border border-border rounded-lg p-4 flex flex-col gap-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Yield Analysis</div>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" checked={useActual} onChange={(e) => setUseActual(e.target.checked)} className="h-4 w-4 rounded border-border text-primary" />
                  Calculate percent yield from actual product mass
                </label>
                {useActual && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Actual Yield (g)</label>
                    <div className={inp}><input type="number" value={actual} onChange={(e) => setActual(e.target.value)} className={ci} min={0} /></div>
                  </div>
                )}
              </div>
            )}

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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Theoretical Mass of Product B</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.massB.toFixed(2)} <span className="text-2xl text-muted-foreground">g</span></div>
                  <div className="text-sm text-muted-foreground mt-1">{result.molesB.toFixed(4)} mol of B{result.percentYield !== null ? ` · percent yield ${result.percentYield.toFixed(1)}%` : ""}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Moles A", `${result.molesA.toFixed(4)}`], ["Moles B", `${result.molesB.toFixed(4)}`], ["Mass B", `${result.massB.toFixed(1)} g`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 6 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Moles Converted</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v.toFixed(4) + " mol", "Moles"]} />
                      <Bar dataKey="moles" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">Moles of B = moles of A × (B:A ratio) — the balanced-equation conversion.</p>
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
            <h2 className="text-2xl font-bold mb-3">The Mole Map</h2>
            <p>Stoichiometry is navigation on the mole map: convert the given mass to moles (m ÷ M), move between substances using the balanced equation's mole ratio, and convert back to mass (moles × M). This calculator walks the full path from grams of A to grams of B in one step.</p>
            <h2 className="text-2xl font-bold mb-3">Why Moles?</h2>
            <p>Grams can't be compared directly across substances — a gram of hydrogen contains 16× more particles than a gram of oxygen. The mole (6.022 × 10²³ particles) gives every substance a common counting unit, making ratio conversions exact regardless of which elements are involved.</p>
            <h2 className="text-2xl font-bold mb-3">From Theory to the Lab</h2>
            <p>The theoretical mass assumes perfect conditions, but real reactions lose product to side reactions, incomplete conversion, and transfer losses. Comparing your measured yield to the theoretical value gives the percent yield — the standard measure of a reaction's efficiency in industry, where even a few percent matter at scale.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/stoichiometry-calculator" />
          <PopularCalculators exclude="/calculator/stoichiometry-calculator" />
        </div>
      </div>
    </>
  );
}
