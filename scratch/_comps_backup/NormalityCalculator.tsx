"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface NormResult {
  normality: number;
  equivalents: number;
  volumeL: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 4): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcNorm(mode: string, equivalents: number, grams: number, eqWeight: number, volumeL: number): NormResult {
  const eq = mode === "eq" ? equivalents : grams / eqWeight;
  const normality = volumeL > 0 ? eq / volumeL : 0;
  const breakdown = [
    { label: "Solute", value: mode === "eq" ? `${fmt(eq)} eq` : `${fmt(grams)} g` },
    ...(mode === "grams" ? [{ label: "Equivalent Weight", value: `${fmt(eqWeight)} g/eq` }] : []),
    { label: "Solution Volume", value: `${fmt(volumeL)} L` },
    { label: "Gram Equivalents", value: `${fmt(eq)} eq` },
    { label: "Normality (N)", value: `${fmt(normality)} eq/L` },
  ];
  const summaryStats = [
    { label: "Normality", value: `${fmt(normality)} N` },
    { label: "Equivalents", value: `${fmt(eq)} eq` },
    { label: "Volume", value: `${fmt(volumeL)} L` },
    { label: "Definition", value: "eq ÷ L" },
  ];
  const chartData = [
    { name: "Equivalents", value: Number(eq.toFixed(3)), fill: "hsl(var(--primary))" },
    { name: "Volume (L)", value: Number(volumeL.toFixed(3)), fill: "#f59e0b" },
    { name: "Normality", value: Number(normality.toFixed(3)), fill: "#10b981" },
  ];
  return { normality, equivalents: eq, volumeL, breakdown, summaryStats, chartData };
}

const DEFAULTS = { mode: "eq", eq: "1", grams: "49", eqWeight: "49", vol: "1" };

export default function NormalityCalculator() {
  const [mode, setMode] = useState<string>(DEFAULTS.mode);
  const [eq, setEq] = useState(DEFAULTS.eq);
  const [grams, setGrams] = useState(DEFAULTS.grams);
  const [eqWeight, setEqWeight] = useState(DEFAULTS.eqWeight);
  const [vol, setVol] = useState(DEFAULTS.vol);
  const [result, setResult] = useState<NormResult | null>(null);

  const e = parseFloat(eq);
  const g = parseFloat(grams);
  const ew = parseFloat(eqWeight);
  const v = parseFloat(vol);
  const errs: string[] = [];
  if (mode === "eq" && (isNaN(e) || e < 0)) errs.push("Equivalents must be 0 or greater.");
  if (mode === "grams" && (!g || g <= 0)) errs.push("Grams of solute must be greater than 0.");
  if (mode === "grams" && (!ew || ew <= 0)) errs.push("Equivalent weight must be greater than 0.");
  if (!v || v <= 0) errs.push("Solution volume must be greater than 0.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcNorm(mode, e, g, ew, v)); };
  const reset = () => {
    setMode(DEFAULTS.mode); setEq(DEFAULTS.eq); setGrams(DEFAULTS.grams); setEqWeight(DEFAULTS.eqWeight); setVol(DEFAULTS.vol);
    setResult(calcNorm("eq", 1, 49, 49, 1));
  };
  useEffect(() => { setResult(calcNorm("eq", 1, 49, 49, 1)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is normality?", answer: "Normality (N) is the number of gram equivalents of solute per liter of solution: N = equivalents ÷ liters. It generalizes molarity to reactions — an acid's equivalents are its H⁺ ions, a base's its OH⁻ ions." },
    { question: "How is normality different from molarity?", answer: "Molarity counts moles; normality counts equivalents. For HCl, 1 M = 1 N because each molecule yields one H⁺. For H₂SO₄, 1 M = 2 N because it delivers two H⁺. Normality = molarity × n-factor." },
    { question: "When is normality used?", answer: "In acid-base titrations, redox reactions, and clinical chemistry, where working in equivalents makes 1:1 stoichiometry automatic: at the equivalence point, equivalents of acid equal equivalents of base." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Normality Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Normality Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Solute Input</label>
              <select value={mode} onChange={e => setMode(e.target.value)} className={inp}>
                <option value="eq">Enter gram equivalents</option>
                <option value="grams">Enter grams + equivalent weight</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {mode === "eq" ? (
                <div>
                  <label className={lbl}>Gram Equivalents</label>
                  <input type="number" value={eq} onChange={e => setEq(e.target.value)} className={inp} placeholder="1" />
                </div>
              ) : (
                <>
                  <div>
                    <label className={lbl}>Solute Mass (g)</label>
                    <input type="number" value={grams} onChange={e => setGrams(e.target.value)} className={inp} placeholder="49" />
                  </div>
                  <div>
                    <label className={lbl}>Equivalent Weight (g/eq)</label>
                    <input type="number" value={eqWeight} onChange={e => setEqWeight(e.target.value)} className={inp} placeholder="49" />
                  </div>
                </>
              )}
              <div>
                <label className={lbl}>Solution Volume (L)</label>
                <input type="number" value={vol} onChange={e => setVol(e.target.value)} className={inp} placeholder="1" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Equivalent weight = molar mass ÷ n-factor (H⁺ or OH⁻ per unit). For H₂SO₄, 98.08 ÷ 2 = 49.04 g/eq.</p>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Normality</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.normality)} N</div>
                <div className="text-sm text-muted-foreground mt-1">{fmt(result.equivalents)} eq solute in {fmt(result.volumeL)} L</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Normality", `${fmt(result.normality)} N`], ["Equivalents", `${fmt(result.equivalents)} eq`], ["Volume", `${fmt(result.volumeL)} L`]].map(([l, v], i) => (
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
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === result.breakdown.length - 1 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === result.breakdown.length - 1 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === result.breakdown.length - 1 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Equivalents, Volume, and Normality</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmt(v), ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Normality = gram equivalents ÷ liters</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Concentration by Reactive Power</h2>
            <p><strong>Normality</strong> measures how much reactive capacity a solution carries: gram equivalents of solute per liter. For acids that means H⁺, for bases OH⁻, for redox reagents electrons transferred. This <strong>normality calculator</strong> converts grams or equivalents into N.</p>
            <h2 className="text-2xl font-bold mb-3">The n-Factor Link</h2>
            <p>Equivalent weight is molar mass divided by the n-factor — how many reactive units each molecule provides. H₂SO₄ delivers two protons, so its equivalent weight is half its molar mass, and 1 M H₂SO₄ is 2 N. Molarity × n-factor = normality, always.</p>
            <h2 className="text-2xl font-bold mb-3">Why Titrations Love It</h2>
            <p>At the equivalence point, equivalents of titrant equal equivalents of analyte — no balancing coefficients needed. That simplicity is why normality survives in analytical labs and clinical chemistry even as molarity dominates general use.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/normality-calculator" />
          <PopularCalculators exclude="/calculator/normality-calculator" />
        </div>
      </div>
    </>
  );
}
