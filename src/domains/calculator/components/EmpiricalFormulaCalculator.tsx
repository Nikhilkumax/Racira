"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Atom } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const ELEMENTS = [
  { symbol: "C", mass: 12.011 },
  { symbol: "H", mass: 1.008 },
  { symbol: "O", mass: 15.999 },
  { symbol: "N", mass: 14.007 },
];

interface FormulaResult {
  pcts: number[];
  moles: number[];
  ratios: number[];
  subscripts: number[];
  empirical: string;
  empiricalMass: number;
  molarMass: number;
  n: number;
  molecular: string;
  chartData: { name: string; value: number }[];
}

function roundRatio(r: number): number {
  // snap to common ratios
  const candidates = [1, 2, 3, 4, 5, 6];
  let best = 1;
  let bestDiff = Infinity;
  for (const c of candidates) {
    const diff = Math.abs(r - c);
    if (diff < bestDiff) { bestDiff = diff; best = c; }
  }
  return bestDiff <= 0.15 ? best : Math.round(r);
}

function calcFormula(pcts: number[], molarMass: number): FormulaResult | null {
  const total = pcts.reduce((s, v) => s + v, 0);
  if (Math.abs(total - 100) > 5 || pcts.some(v => v < 0)) return null;
  const moles = pcts.map((p, i) => p / ELEMENTS[i].mass);
  const minMole = Math.min(...moles.filter(m => m > 0));
  const rawRatios = moles.map(m => m / minMole);
  const subscripts = rawRatios.map(roundRatio);
  const empirical = subscripts.map((s, i) => (s > 0 ? `${ELEMENTS[i].symbol}${s === 1 ? "" : s}` : "")).join("");
  const empiricalMass = subscripts.reduce((sum, s, i) => sum + s * ELEMENTS[i].mass, 0);
  const n = molarMass > 0 ? molarMass / empiricalMass : 0;
  const molecular = molarMass > 0 && Math.abs(n - Math.round(n)) < 0.2
    ? subscripts.map((s, i) => (s > 0 ? `${ELEMENTS[i].symbol}${s * Math.round(n) === 1 ? "" : s * Math.round(n)}` : "")).join("")
    : molarMass > 0 ? "— (n is not a whole number)" : "Enter molar mass to find it";
  const chartData = subscripts.map((s, i) => ({ name: ELEMENTS[i].symbol, value: s }));
  return { pcts, moles, ratios: rawRatios, subscripts, empirical, empiricalMass, molarMass, n, molecular, chartData };
}

const DEFAULTS = { c: "40.00", h: "6.71", o: "53.29", n: "0", molar: "30.03" };

const faqs = [
  { question: "What is an empirical formula?", answer: "The empirical formula is the simplest whole-number ratio of atoms in a compound. Glucose is C₆H₁₂O₆ but its empirical formula is CH₂O — both have the same 1:2:1 atom ratio." },
  { question: "How is it derived from percent composition?", answer: "Divide each element's percent by its atomic mass to get moles, then divide every mole value by the smallest to get ratios, and round to whole numbers. A 40.00/6.71/53.29 C/H/O compound gives CH₂O." },
  { question: "What is the molecular formula?", answer: "It multiplies the empirical formula by n = molar mass ÷ empirical-formula mass. If n is a whole number (or close), the molecular formula is the empirical formula scaled by n." },
];

export default function EmpiricalFormulaCalculator() {
  const [c, setC] = useState(DEFAULTS.c);
  const [h, setH] = useState(DEFAULTS.h);
  const [o, setO] = useState(DEFAULTS.o);
  const [n, setN] = useState(DEFAULTS.n);
  const [molar, setMolar] = useState(DEFAULTS.molar);
  const [result, setResult] = useState<FormulaResult | null>(() => calcFormula([40, 6.71, 53.29, 0], 30.03));

  useEffect(() => {
    const pcts = [parseFloat(c), parseFloat(h), parseFloat(o), parseFloat(n)];
    const m = parseFloat(molar);
    if (pcts.every(v => !isNaN(v)) && !isNaN(m) && m >= 0) {
      const r = calcFormula(pcts, m);
      if (r) setResult(r);
    }
  }, [c, h, o, n, molar]);

  const reset = () => { setC(DEFAULTS.c); setH(DEFAULTS.h); setO(DEFAULTS.o); setN(DEFAULTS.n); setMolar(DEFAULTS.molar); };
  const pcts = [parseFloat(c), parseFloat(h), parseFloat(o), parseFloat(n)];
  const invalid = pcts.some(v => isNaN(v)) || isNaN(parseFloat(molar)) || parseFloat(molar) < 0 || Math.abs(pcts.reduce((s, v) => s + v, 0) - 100) > 5;

  const breakdown = result ? [
    ...ELEMENTS.map((el, i) => ({ label: `${el.symbol} percent`, value: `${result.pcts[i].toFixed(2)}%`, highlight: false })),
    ...ELEMENTS.map((el, i) => ({ label: `${el.symbol} moles (pct ÷ ${el.mass})`, value: `${result.moles[i].toFixed(3)}`, highlight: false })),
    ...ELEMENTS.filter((_, i) => result.subscripts[i] > 0).map((el, k) => ({ label: `${el.symbol} subscript`, value: `${result.subscripts[ELEMENTS.indexOf(el)]}`, highlight: false })),
    { label: "Empirical Formula", value: result.empirical, highlight: true },
    { label: "Empirical Mass", value: `${result.empiricalMass.toFixed(2)} g/mol`, highlight: false },
    { label: "Molar Mass Given", value: result.molarMass > 0 ? `${result.molarMass.toFixed(2)} g/mol` : "—", highlight: false },
    { label: "Multiplier n", value: result.molarMass > 0 ? `${result.n.toFixed(2)}` : "—", highlight: false },
    { label: "Molecular Formula", value: result.molecular, highlight: false },
  ] : [];

  const summaryStats = result ? [
    { label: "Empirical Formula", value: result.empirical },
    { label: "Empirical Mass", value: `${result.empiricalMass.toFixed(2)} g/mol` },
    { label: "Molecular Formula", value: result.molecular },
    { label: "Multiplier n", value: result.molarMass > 0 ? `${result.n.toFixed(2)}` : "—" },
    { label: "Elements", value: ELEMENTS.filter((_, i) => result.subscripts[i] > 0).map(e => e.symbol).join(", ") },
    { label: "Subscripts", value: result.subscripts.filter(s => s > 0).join(" : ") },
  ] : [];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Empirical Formula Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Empirical Formula Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Percent Composition (%)</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ef-c" className="block text-sm font-medium mb-1 text-foreground">Carbon</label>
                <input id="ef-c" type="number" min="0" step="0.01" value={c} onChange={(e) => setC(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="ef-h" className="block text-sm font-medium mb-1 text-foreground">Hydrogen</label>
                <input id="ef-h" type="number" min="0" step="0.01" value={h} onChange={(e) => setH(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="ef-o" className="block text-sm font-medium mb-1 text-foreground">Oxygen</label>
                <input id="ef-o" type="number" min="0" step="0.01" value={o} onChange={(e) => setO(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="ef-n" className="block text-sm font-medium mb-1 text-foreground">Nitrogen (optional)</label>
                <input id="ef-n" type="number" min="0" step="0.01" value={n} onChange={(e) => setN(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="border border-border rounded-lg p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Advanced Options</div>
              <label htmlFor="ef-molar" className="block text-sm font-medium mb-1 text-foreground">Molar Mass (g/mol, for molecular formula)</label>
              <input id="ef-molar" type="number" min="0" step="0.01" value={molar} onChange={(e) => setMolar(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Atom className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter valid percentages summing near 100%.</p>}
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Empirical Formula</div>
                  <div className="text-4xl font-extrabold text-primary">{result.empirical}</div>
                  <div className="text-sm text-muted-foreground mt-1">Simplest whole-number ratio · mass {result.empiricalMass.toFixed(2)} g/mol</div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Empirical Mass</div>
                    <div className="text-lg font-bold text-primary">{result.empiricalMass.toFixed(2)} g/mol</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Multiplier n</div>
                    <div className="text-lg font-bold text-primary">{result.molarMass > 0 ? result.n.toFixed(2) : "—"}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Molecular</div>
                    <div className="text-lg font-bold text-primary">{result.molarMass > 0 && !result.molecular.startsWith("—") ? result.molecular : "—"}</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Step</th>
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
                  <h3 className="text-base font-bold mb-3">Subscript Ratios</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData.filter(d => d.value > 0)} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip formatter={(v: number) => [`${v} atoms`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
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
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Empirical Formula Calculator</h2>
            <p>Percent composition converts to an atom ratio in three steps: divide each percent by the element's atomic mass (giving mole amounts), divide every result by the smallest, and round to whole numbers. For 40.00% C, 6.71% H, 53.29% O: 3.33 : 6.66 : 3.33 moles → 1 : 2 : 1, so CH₂O.</p>
            <h3>From Empirical to Molecular</h3>
            <p>The empirical formula is a ratio, not a molecule — many compounds share it. The molecular formula needs the actual molar mass: n = molar mass ÷ empirical mass. With 30.03 g/mol and empirical mass 30.03, n = 1 and the molecular formula equals the empirical formula; for glucose (180.16 g/mol), n = 6 gives C₆H₁₂O₆.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/empirical-formula-calculator" />
          <PopularCalculators exclude="/calculator/empirical-formula-calculator" />
        </div>
      </div>
    </>
  );
}
