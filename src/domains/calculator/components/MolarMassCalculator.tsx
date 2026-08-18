"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const ELEMENTS: Record<string, number> = {
  H: 1.008, He: 4.003, Li: 6.94, Be: 9.012, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998, Ne: 20.18,
  Na: 22.99, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Ar: 39.948, K: 39.098, Ca: 40.078,
  Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996, Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38,
  Ga: 69.723, Ge: 72.63, As: 74.922, Se: 78.971, Br: 79.904, Kr: 83.798, Rb: 85.468, Sr: 87.62, Ag: 107.868, Cd: 112.414,
  Sn: 118.71, I: 126.904, Ba: 137.327, Pt: 195.084, Au: 196.967, Hg: 200.592, Pb: 207.2, U: 238.029,
};

interface MassResult {
  total: number;
  counts: { symbol: string; count: number; mass: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
  error: string | null;
}

function fmt(v: number, d = 3): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function parseFormula(formula: string): { counts: Map<string, number>; error: string | null } {
  const tokens = formula.match(/([A-Z][a-z]?|\d+|\(|\))/g);
  if (!tokens) return { counts: new Map(), error: "Could not read the formula. Use symbols like H2SO4 or Ca(OH)2." };
  const counts = new Map<string, number>();
  const stack: number[] = [1];
  let i = 0;
  let expectElement = true;
  while (i < tokens.length) {
    const t = tokens[i];
    if (t === "(") {
      stack.push(1);
      expectElement = true;
      i++;
    } else if (t === ")") {
      if (stack.length === 1) return { counts: new Map(), error: "Unmatched closing parenthesis." };
      if (i + 1 < tokens.length && /^\d+$/.test(tokens[i + 1])) {
        stack[stack.length - 1] = parseInt(tokens[i + 1], 10);
        i += 2;
      } else {
        stack.pop();
        i++;
      }
      expectElement = true;
    } else if (/^\d+$/.test(t)) {
      if (expectElement) return { counts: new Map(), error: `Unexpected number "${t}" — a symbol must come first.` };
      counts.set(tokens[i - 1], (counts.get(tokens[i - 1]) || 0) + (parseInt(t, 10) - 1) * stack.reduce((a, b) => a * b, 1));
      expectElement = true;
      i++;
    } else {
      // element symbol
      if (!ELEMENTS[t]) return { counts: new Map(), error: `Unknown element "${t}".` };
      const mult = stack.reduce((a, b) => a * b, 1);
      counts.set(t, (counts.get(t) || 0) + mult);
      expectElement = false;
      i++;
    }
  }
  if (stack.length > 1) return { counts: new Map(), error: "Unmatched opening parenthesis." };
  return { counts, error: null };
}

function calcMass(formula: string): MassResult {
  const cleaned = formula.replace(/\s+/g, "");
  const { counts, error } = parseFormula(cleaned);
  if (error) {
    return { total: 0, counts: [], breakdown: [{ label: "Error", value: error }], summaryStats: [], chartData: [], error };
  }
  const entries: { symbol: string; count: number; mass: number }[] = [];
  let total = 0;
  for (const [sym, cnt] of counts) {
    const m = ELEMENTS[sym] * cnt;
    total += m;
    entries.push({ symbol: sym, count: cnt, mass: m });
  }
  entries.sort((a, b) => b.mass - a.mass);
  const breakdown = [
    { label: "Formula", value: formula },
    ...entries.map((e) => ({ label: `${e.symbol} (×${e.count})`, value: `${fmt(ELEMENTS[e.symbol], 3)} × ${e.count} = ${fmt(e.mass)} g/mol` })),
    { label: "Molar Mass", value: `${fmt(total)} g/mol` },
  ];
  const summaryStats = [
    { label: "Molar Mass", value: `${fmt(total)} g/mol` },
    { label: "Elements", value: `${entries.length}` },
    { label: "Atoms Total", value: `${entries.reduce((s, e) => s + e.count, 0)}` },
    { label: "Formula", value: formula },
  ];
  const chartData = entries.map((e, i) => ({ name: e.symbol, value: Number(e.mass.toFixed(2)), fill: ["hsl(var(--primary))", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"][i % 5] }));
  return { total, counts: entries, breakdown, summaryStats, chartData, error: null };
}

const DEFAULTS = { formula: "H2SO4" };

export default function MolarMassCalculator() {
  const [formula, setFormula] = useState(DEFAULTS.formula);
  const [result, setResult] = useState<MassResult | null>(null);

  const calculate = () => setResult(calcMass(formula));
  const reset = () => {
    setFormula(DEFAULTS.formula);
    setResult(calcMass("H2SO4"));
  };
  useEffect(() => { setResult(calcMass("H2SO4")); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is molar mass?", answer: "The mass in grams of one mole (6.022 × 10²³ particles) of a substance. For a molecule, sum the atomic masses of every atom in the formula — water H₂O is 2 × 1.008 + 15.999 ≈ 18.02 g/mol." },
    { question: "How is it used?", answer: "It is the conversion factor between mass and moles: grams ÷ molar mass = moles. Recipes in chemistry — molarity, stoichiometry, empirical formulas — all hinge on this single number." },
    { question: "What formulas are supported?", answer: "Simple formulas like H2SO4, NaCl, C6H12O6, and grouped ones like Ca(OH)2 and (NH4)2SO4. Element symbols must be capitalized correctly — write Fe not FE, and Co (cobalt) not CO (which would be carbon + oxygen)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Molar Mass Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Molar Mass Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Chemical Formula</label>
              <input type="text" value={formula} onChange={e => setFormula(e.target.value)} className={inp} placeholder="H2SO4" />
              <p className="text-xs text-muted-foreground mt-1">Examples: H2SO4, NaCl, C6H12O6, Ca(OH)2, (NH4)2SO4</p>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              {result.error ? (
                <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                  <div className="text-xs font-bold text-destructive uppercase tracking-wider mb-1">Invalid Formula</div>
                  <div className="text-base font-semibold">{result.error}</div>
                </div>
              ) : (<>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Molar Mass</div>
                  <div className="text-4xl font-extrabold tracking-tight">{fmt(result.total)} g/mol</div>
                  <div className="text-sm text-muted-foreground mt-1">{result.breakdown[1] ? `${result.breakdown.length - 2} elements · ${result.summaryStats[2].value} atoms` : ""}</div>
                </div>
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Molar Mass", `${fmt(result.total)} g/mol`], ["Elements", `${result.summaryStats[1].value}`], ["Atoms", result.summaryStats[2].value]].map(([l, v], i) => (
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
                        <td className={`py-2.5 text-right font-semibold ${i === result.breakdown.length - 1 ? "text-primary" : ""} font-mono text-sm`}>{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Element Contributions (g/mol)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip formatter={(v: number) => [fmt(v) + " g/mol", ""]} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-center text-sm text-muted-foreground mt-1">Each bar is the element's atomic mass × its count in the formula</p>
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
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Gram-to-Mole Bridge</h2>
            <p>One mole of any substance — 6.022 × 10²³ particles — weighs a specific number of grams: its <strong>molar mass</strong>. This <strong>molar mass calculator</strong> parses a chemical formula, counts every atom, and sums the atomic masses to find that number.</p>
            <h2 className="text-2xl font-bold mb-3">How the Parser Works</h2>
            <p>Type a formula like H₂SO₄ (as H2SO4): the calculator tokenizes element symbols and subscripts, resolves grouped formulas like Ca(OH)₂ and (NH₄)₂SO₄, and multiplies each atomic mass by its count. It covers the 48 most common elements — hydrogen through uranium.</p>
            <h2 className="text-2xl font-bold mb-3">Why You Need It</h2>
            <p>Every stoichiometric calculation starts here: dilutions, titrations, empirical formulas, and limiting reactants all convert between grams and moles using molar mass. Get this number right and the rest of the chemistry follows.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/molar-mass-calculator" />
          <PopularCalculators exclude="/calculator/molar-mass-calculator" />
        </div>
      </div>
    </>
  );
}
