"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface TitrationResult {
  molesAcid: number;
  molesBase: number;
  volumeBase: number;
  chartData: { name: string; moles: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcTitration(m1: number, v1: number, m2: number, ratio: number): TitrationResult {
  const molesAcid = m1 * (v1 / 1000);
  const molesBase = molesAcid * ratio;
  const volumeBase = (molesBase / m2) * 1000;

  const chartData = [
    { name: "Moles Acid", moles: molesAcid, fill: "hsl(var(--primary))" },
    { name: "Moles Base", moles: molesBase, fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Acid Molarity (M1)", value: `${m1.toFixed(4)} mol/L` },
    { label: "Acid Volume (V1)", value: `${v1.toFixed(1)} mL` },
    { label: "Moles of Acid (M1 × V1)", value: `${molesAcid.toFixed(5)} mol` },
    { label: "Acid:Base Mole Ratio", value: `1 : ${ratio}` },
    { label: "Base Molarity (M2)", value: `${m2.toFixed(4)} mol/L` },
    { label: "Moles of Base Required", value: `${molesBase.toFixed(5)} mol` },
    { label: "Base Volume Needed (V2)", value: `${volumeBase.toFixed(2)} mL` },
  ];

  const summaryStats = [
    { label: "Base Volume (V2)", value: `${volumeBase.toFixed(2)} mL` },
    { label: "Moles Acid", value: `${molesAcid.toFixed(5)} mol` },
    { label: "Moles Base", value: `${molesBase.toFixed(5)} mol` },
    { label: "Acid:Base Ratio", value: `1 : ${ratio}` },
    { label: "Formula", value: "M1·V1 = M2·V2" },
    { label: "Equivalence", value: "Neutralized at equivalence point" },
  ];

  return { molesAcid, molesBase, volumeBase, chartData, breakdown, summaryStats };
}

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function TitrationCalculator() {
  const [m1, setM1] = useState("0.1");
  const [v1, setV1] = useState("25");
  const [m2, setM2] = useState("0.2");
  const [ratio, setRatio] = useState("1");
  const [result, setResult] = useState<TitrationResult | null>(null);

  const parse = (s: string, fallback: number, min = 0) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= min ? n : fallback;
  };

  const calculate = () =>
    setResult(
      calcTitration(
        Math.max(1e-6, parse(m1, 0.1, 1e-6)),
        Math.max(0.1, parse(v1, 25, 0.1)),
        Math.max(1e-6, parse(m2, 0.2, 1e-6)),
        Math.max(0.1, parse(ratio, 1, 0.1))
      )
    );
  const reset = () => {
    setM1("0.1");
    setV1("25");
    setM2("0.2");
    setRatio("1");
    setResult(calcTitration(0.1, 25, 0.2, 1));
  };
  useEffect(() => {
    setResult(calcTitration(0.1, 25, 0.2, 1));
  }, []);

  const faqs = [
    { question: "What is titration?", answer: "Titration is the lab technique of adding a solution of known concentration (the titrant) to a measured volume of unknown solution until the reaction is complete — the equivalence point, usually signaled by an indicator color change." },
    { question: "What is the equivalence point?", answer: "The equivalence point is when the moles of base added exactly neutralize the moles of acid present (or vice versa). For a 1:1 reaction, M1·V1 = M2·V2, which is the core equation this calculator solves." },
    { question: "What if the stoichiometry isn't 1:1?", answer: "Some reactions need more than one mole of base per mole of acid — for example, H₂SO₄ has two acidic protons. Set the 'Acid:Base ratio' to the correct stoichiometric factor (e.g. 2 for sulfuric acid with a monobasic base)." },
    { question: "Why does the indicator matter?", answer: "The indicator's color change (the endpoint) must coincide with the equivalence point. Phenolphthalein turns pink around pH 8–10, ideal for strong acid–strong base titrations; other indicators suit weaker systems." },
    { question: "What is a molarity?", answer: "Molarity (M) is moles of solute per liter of solution. A 0.1 M HCl solution contains 0.1 moles of HCl per liter — the concentration unit used throughout the titration formula." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Titration Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Titration Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Acid Molarity (M1)</label>
                <div className={inp}><input type="number" value={m1} onChange={(e) => setM1(e.target.value)} className={ci} min={0} step={0.01} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Acid Volume (mL)</label>
                <div className={inp}><input type="number" value={v1} onChange={(e) => setV1(e.target.value)} className={ci} min={0} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Base Molarity (M2)</label>
                <div className={inp}><input type="number" value={m2} onChange={(e) => setM2(e.target.value)} className={ci} min={0} step={0.01} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Acid:Base Ratio</label>
                <div className={inp}><input type="number" value={ratio} onChange={(e) => setRatio(e.target.value)} className={ci} min={0.1} step={0.1} /></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Ratio 1 = 1:1 (HCl + NaOH). Sulfuric acid is 1:2.</p>

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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Base Volume Needed (V2)</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.volumeBase.toFixed(2)} <span className="text-2xl text-muted-foreground">mL</span></div>
                  <div className="text-sm text-muted-foreground mt-1">To neutralize {v1} mL of {m1} M acid with {m2} M base</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Base Volume", `${result.volumeBase.toFixed(1)} mL`], ["Moles Acid", result.molesAcid.toExponential(3)], ["Moles Base", result.molesBase.toExponential(3)]].map(([l, v], i) => (
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
                  <h3 className="text-base font-bold mb-4">Moles at Equivalence</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v.toExponential(4) + " mol", "Moles"]} />
                      <Bar dataKey="moles" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">At the equivalence point the acid and base moles balance per the reaction stoichiometry.</p>
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
            <h2 className="text-2xl font-bold mb-3">Acid-Base Titration</h2>
            <p>Titration determines an unknown concentration by reacting it completely with a solution of known concentration. The heart of the calculation is the equivalence point, where the moles of the two reactants are stoichiometrically balanced: <strong>M1·V1 = M2·V2</strong> for a 1:1 reaction.</p>
            <h2 className="text-2xl font-bold mb-3">Working Through the Math</h2>
            <p>First convert the known acid volume to liters and multiply by molarity to get moles of acid. Apply the reaction stoichiometry (the acid:base ratio) to find the moles of base required, then divide by the base molarity to get the volume needed. This calculator performs all three steps at once.</p>
            <h2 className="text-2xl font-bold mb-3">Beyond 1:1 Reactions</h2>
            <p>Polyprotic acids change the picture: sulfuric acid (H₂SO₄) donates two protons, so neutralizing it with a monobasic base like NaOH needs a 1:2 acid:base ratio. Entering the correct ratio in the acid:base field keeps the equivalence-point math exact for diprotic and tribasic systems.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/titration-calculator" />
          <PopularCalculators exclude="/calculator/titration-calculator" />
        </div>
      </div>
    </>
  );
}
