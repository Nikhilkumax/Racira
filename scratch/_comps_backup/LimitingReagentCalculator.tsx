"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Reaction {
  key: string;
  equation: string;
  c1: number; M1: number; name1: string;
  c2: number; M2: number; name2: string;
  cprod: number; Mprod: number; prodName: string;
}

const REACTIONS: Reaction[] = [
  { key: "h2o", equation: "2H₂ + O₂ → 2H₂O", c1: 2, M1: 2.016, name1: "Hydrogen (H₂)", c2: 1, M2: 32.0, name2: "Oxygen (O₂)", cprod: 2, Mprod: 18.015, prodName: "Water (H₂O)" },
  { key: "combustion", equation: "CH₄ + 2O₂ → CO₂ + 2H₂O", c1: 1, M1: 16.043, name1: "Methane (CH₄)", c2: 2, M2: 32.0, name2: "Oxygen (O₂)", cprod: 1, Mprod: 44.01, prodName: "Carbon Dioxide (CO₂)" },
  { key: "ammonia", equation: "N₂ + 3H₂ → 2NH₃", c1: 1, M1: 28.014, name1: "Nitrogen (N₂)", c2: 3, M2: 2.016, name2: "Hydrogen (H₂)", cprod: 2, Mprod: 17.031, prodName: "Ammonia (NH₃)" },
  { key: "alcl3", equation: "2Al + 3Cl₂ → 2AlCl₃", c1: 2, M1: 26.982, name1: "Aluminum (Al)", c2: 3, M2: 70.906, name2: "Chlorine (Cl₂)", cprod: 2, Mprod: 133.34, prodName: "Aluminum Chloride (AlCl₃)" },
  { key: "nacl", equation: "2Na + Cl₂ → 2NaCl", c1: 2, M1: 22.99, name1: "Sodium (Na)", c2: 1, M2: 70.906, name2: "Chlorine (Cl₂)", cprod: 2, Mprod: 58.44, prodName: "Sodium Chloride (NaCl)" },
];

interface ReagentResult {
  reaction: Reaction;
  g1: number;
  g2: number;
  mol1: number;
  mol2: number;
  ratio1: number;
  ratio2: number;
  limiting: string;
  excessName: string;
  excessGrams: number;
  productGrams: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; available: number; required: number }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcReagent(r: Reaction, g1: number, g2: number): ReagentResult {
  const mol1 = g1 / r.M1;
  const mol2 = g2 / r.M2;
  const ratio1 = mol1 / r.c1;
  const ratio2 = mol2 / r.c2;
  const limiting = ratio1 <= ratio2 ? r.name1 : r.name2;
  const limitingMol = Math.min(ratio1, ratio2);
  const productGrams = limitingMol * r.cprod * r.Mprod;
  const mol2Consumed = limitingMol * r.c2;
  const mol1Consumed = limitingMol * r.c1;
  const excessGrams = limiting === r.name1
    ? Math.max(0, mol2 - mol2Consumed) * r.M2
    : Math.max(0, mol1 - mol1Consumed) * r.M1;
  const excessName = limiting === r.name1 ? r.name2 : r.name1;
  const breakdown = [
    { label: "Balanced Equation", value: r.equation },
    { label: `${r.name1} — Mass`, value: `${fmt(g1)} g` },
    { label: `${r.name1} — Moles`, value: `${fmt(mol1, 4)} mol (÷ ${r.c1} = ${fmt(ratio1, 4)})` },
    { label: `${r.name2} — Mass`, value: `${fmt(g2)} g` },
    { label: `${r.name2} — Moles`, value: `${fmt(mol2, 4)} mol (÷ ${r.c2} = ${fmt(ratio2, 4)})` },
    { label: "Limiting Reagent", value: limiting },
    { label: "Excess Reagent Remaining", value: `${excessName}: ${fmt(excessGrams)} g` },
    { label: "Theoretical Product Yield", value: `${fmt(productGrams)} g ${r.prodName}` },
  ];
  const summaryStats = [
    { label: "Limiting Reagent", value: limiting },
    { label: "Product Yield", value: `${fmt(productGrams)} g` },
    { label: "Excess Remaining", value: `${fmt(excessGrams)} g` },
    { label: "Moles Reactant 1", value: `${fmt(mol1, 4)}` },
    { label: "Moles Reactant 2", value: `${fmt(mol2, 4)}` },
    { label: "Stoich Ratio 1", value: `${fmt(ratio1, 4)}` },
    { label: "Stoich Ratio 2", value: `${fmt(ratio2, 4)}` },
    { label: "Reaction", value: r.equation },
  ];
  const chartData = [
    { name: r.name1.split(" (")[0], available: Number(mol1.toFixed(3)), required: Number((Math.min(ratio1, ratio2) * r.c1).toFixed(3)) },
    { name: r.name2.split(" (")[0], available: Number(mol2.toFixed(3)), required: Number((Math.min(ratio1, ratio2) * r.c2).toFixed(3)) },
  ];
  return { reaction: r, g1, g2, mol1, mol2, ratio1, ratio2, limiting, excessName, excessGrams, productGrams, breakdown, summaryStats, chartData };
}

const DEFAULTS = { r: "h2o", g1: "10", g2: "10" };

export default function LimitingReagentCalculator() {
  const [rKey, setRKey] = useState(DEFAULTS.r);
  const [g1, setG1] = useState(DEFAULTS.g1);
  const [g2, setG2] = useState(DEFAULTS.g2);
  const [result, setResult] = useState<ReagentResult | null>(null);

  const r = REACTIONS.find((x) => x.key === rKey) || REACTIONS[0];
  const m1 = parseFloat(g1) || 0;
  const m2 = parseFloat(g2) || 0;
  const errs: string[] = [];
  if (m1 <= 0 || m2 <= 0) errs.push("Both reactant masses must be greater than 0.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcReagent(r, m1, m2)); };
  const reset = () => {
    setRKey(DEFAULTS.r); setG1(DEFAULTS.g1); setG2(DEFAULTS.g2);
    setResult(calcReagent(REACTIONS[0], 10, 10));
  };
  useEffect(() => { setResult(calcReagent(REACTIONS[0], 10, 10)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 px-3 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the limiting reagent?", answer: "The reactant that runs out first and stops the reaction. Compare each reactant's available moles divided by its stoichiometric coefficient — the smaller quotient is the limiting reagent; the other is in excess." },
    { question: "How is the theoretical yield found?", answer: "The product moles equal the limiting reagent's moles per coefficient times the product coefficient. Multiplying by the product's molar mass gives the theoretical yield in grams — the maximum achievable before losses." },
    { question: "Why do molar masses matter?", answer: "Grams cannot be compared directly — only moles. Each element's molar mass converts mass to amount of substance, and the balanced coefficients set the mole ratios in which reactants combine." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Limiting Reagent Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Limiting Reagent Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={lbl}>Balanced Reaction</label>
                <select value={rKey} onChange={e => setRKey(e.target.value)} className={sel}>
                  {REACTIONS.map((x) => <option key={x.key} value={x.key}>{x.equation}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>{r.name1} (g)</label>
                <div className={inp}><input type="number" value={g1} onChange={e => setG1(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">g</span></div>
              </div>
              <div>
                <label className={lbl}>{r.name2} (g)</label>
                <div className={inp}><input type="number" value={g2} onChange={e => setG2(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">g</span></div>
              </div>
            </div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Limiting Reagent</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.limiting.split(" (")[0]}</div>
                <div className="text-sm text-muted-foreground mt-1">yields {fmt(result.productGrams)} g of {result.reaction.prodName} · {result.excessGrams.toFixed(2)} g {result.excessName.split(" (")[0]} left over</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Product Yield`, `${fmt(result.productGrams)} g`], ["Limiting", result.limiting.split(" (")[0]], ["Excess Left", `${fmt(result.excessGrams)} g`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Stoichiometry Work</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r2, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 5 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r2.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 5 ? "text-primary" : ""}`}>{r2.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Available vs Required Moles</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [`${fmt(v, 3)} mol`, ""]} />
                    <Legend />
                    <Bar dataKey="available" name="Available" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="required" name="Required to react" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">The reactant whose available bars fall short of required is limiting</p>
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
            <h2 className="text-2xl font-bold mb-3">Finding the Limiting Reagent</h2>
            <p>This <strong>limiting reagent calculator</strong> converts each reactant's mass to moles using its molar mass, then divides by its stoichiometric coefficient. The smaller quotient identifies the limiting reagent — the substance that runs out first — while the other reactant is in excess.</p>
            <h2 className="text-2xl font-bold mb-3">Theoretical Yield</h2>
            <p>The limiting reagent fixes the maximum product: its usable moles times the product coefficient gives product moles, and multiplying by the product's molar mass gives the theoretical yield in grams. Real processes recover less, but this is the ceiling.</p>
            <h2 className="text-2xl font-bold mb-3">Excess Reagent</h2>
            <p>Subtracting the moles actually consumed from the moles available tells you how much of the other reactant survives. The excess mass is reported in grams so you can see exactly what was wasted — and what could be recovered.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/limiting-reagent-calculator" />
          <PopularCalculators exclude="/calculator/limiting-reagent-calculator" />
        </div>
      </div>
    </>
  );
}
