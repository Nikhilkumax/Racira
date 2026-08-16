"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Scale } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface KcResult {
  conc: number[];
  coeffs: number[];
  numerator: number;
  denominator: number;
  kc: number;
  chartData: { name: string; value: number }[];
}

function calcKc(conc: number[], coeffs: number[]): KcResult {
  const numerator = Math.pow(conc[2], coeffs[2]) * Math.pow(conc[3], coeffs[3]);
  const denominator = Math.pow(conc[0], coeffs[0]) * Math.pow(conc[1], coeffs[1]);
  const kc = denominator > 0 ? numerator / denominator : 0;
  const chartData = [
    { name: "Products (num)", value: numerator },
    { name: "Reactants (den)", value: denominator },
  ];
  return { conc, coeffs, numerator, denominator, kc, chartData };
}

const DEFAULTS = { a: "0.5", b: "0.3", c: "0.8", d: "0.6", ca: "1", cb: "1", cc: "2", cd: "1" };

const fmtSci = (n: number) => n !== 0 && (Math.abs(n) >= 10000 || Math.abs(n) < 0.001) ? n.toExponential(3) : n.toLocaleString("en-US", { maximumFractionDigits: 4 });

const faqs = [
  { question: "What is the equilibrium constant?", answer: "For aA + bB ⇌ cC + dD at equilibrium, Kc = [C]ᶜ[D]ᵈ ÷ ([A]ᵃ[B]ᵇ). It is constant at a given temperature, regardless of starting concentrations." },
  { question: "What does a large or small Kc mean?", answer: "Kc much greater than 1 favors products (the reaction 'goes to completion' direction); Kc much less than 1 favors reactants. The same quotient computed from non-equilibrium concentrations is called Q, and the reaction shifts toward whichever side it disagrees with." },
  { question: "What are the units of Kc?", answer: "Strictly, concentrations in Kc are ratios to standard states, making K dimensionless. In practice chemists treat Kc as unitless or track mol/L with exponent differences between numerator and denominator." },
];

export default function EquilibriumConstantCalculator() {
  const [a, setA] = useState(DEFAULTS.a);
  const [b, setB] = useState(DEFAULTS.b);
  const [c, setC] = useState(DEFAULTS.c);
  const [d, setD] = useState(DEFAULTS.d);
  const [ca, setCa] = useState(DEFAULTS.ca);
  const [cb, setCb] = useState(DEFAULTS.cb);
  const [cc, setCc] = useState(DEFAULTS.cc);
  const [cd, setCd] = useState(DEFAULTS.cd);
  const [result, setResult] = useState<KcResult>(() => calcKc([0.5, 0.3, 0.8, 0.6], [1, 1, 2, 1]));

  useEffect(() => {
    const conc = [parseFloat(a), parseFloat(b), parseFloat(c), parseFloat(d)];
    const coeffs = [parseFloat(ca), parseFloat(cb), parseFloat(cc), parseFloat(cd)];
    if (conc.every(v => !isNaN(v)) && coeffs.every(v => !isNaN(v)) && conc.every(v => v >= 0) && coeffs.every(v => v >= 0)) {
      setResult(calcKc(conc, coeffs));
    }
  }, [a, b, c, d, ca, cb, cc, cd]);

  const reset = () => { setA(DEFAULTS.a); setB(DEFAULTS.b); setC(DEFAULTS.c); setD(DEFAULTS.d); setCa(DEFAULTS.ca); setCb(DEFAULTS.cb); setCc(DEFAULTS.cc); setCd(DEFAULTS.cd); };
  const conc = [parseFloat(a), parseFloat(b), parseFloat(c), parseFloat(d)];
  const coeffs = [parseFloat(ca), parseFloat(cb), parseFloat(cc), parseFloat(cd)];
  const invalid = conc.some(v => isNaN(v)) || coeffs.some(v => isNaN(v)) || conc.some(v => v < 0) || coeffs.some(v => v < 0);

  const species = ["A", "B", "C", "D"];

  const breakdown = [
    ...species.map((s, i) => ({ label: `[${s}] concentration`, value: `${result.conc[i].toFixed(3)} M`, highlight: false })),
    ...species.map((s, i) => ({ label: `Coefficient of ${s}`, value: `${result.coeffs[i]}`, highlight: false })),
    { label: "Numerator [C]ᶜ[D]ᵈ", value: fmtSci(result.numerator), highlight: false },
    { label: "Denominator [A]ᵃ[B]ᵇ", value: fmtSci(result.denominator), highlight: false },
    { label: "Equilibrium Constant Kc", value: fmtSci(result.kc), highlight: true },
    { label: "Direction Favored", value: result.kc > 100 ? "Products strongly" : result.kc > 1 ? "Products" : result.kc < 0.01 ? "Reactants strongly" : result.kc < 1 ? "Reactants" : "Balanced (≈1)", highlight: false },
  ];

  const summaryStats = [
    { label: "Kc", value: fmtSci(result.kc) },
    { label: "Numerator", value: fmtSci(result.numerator) },
    { label: "Denominator", value: fmtSci(result.denominator) },
    { label: "log₁₀(Kc)", value: `${Math.log10(Math.max(result.kc, 1e-300)).toFixed(2)}` },
    { label: "Favored", value: result.kc > 1 ? "Products" : result.kc < 1 ? "Reactants" : "Balanced" },
    { label: "Reaction", value: `${result.coeffs[0]}A + ${result.coeffs[1]}B ⇌ ${result.coeffs[2]}C + ${result.coeffs[3]}D` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Equilibrium Constant Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Equilibrium Constant Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Concentrations (M)</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="eq-a" className="block text-sm font-medium mb-1 text-foreground">[A]</label>
                <input id="eq-a" type="number" min="0" step="0.1" value={a} onChange={(e) => setA(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="eq-b" className="block text-sm font-medium mb-1 text-foreground">[B]</label>
                <input id="eq-b" type="number" min="0" step="0.1" value={b} onChange={(e) => setB(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="eq-c" className="block text-sm font-medium mb-1 text-foreground">[C]</label>
                <input id="eq-c" type="number" min="0" step="0.1" value={c} onChange={(e) => setC(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="eq-d" className="block text-sm font-medium mb-1 text-foreground">[D]</label>
                <input id="eq-d" type="number" min="0" step="0.1" value={d} onChange={(e) => setD(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Stoichiometric Coefficients</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="eq-ca" className="block text-sm font-medium mb-1 text-foreground">Coefficient of A</label>
                <input id="eq-ca" type="number" min="0" step="1" value={ca} onChange={(e) => setCa(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="eq-cb" className="block text-sm font-medium mb-1 text-foreground">Coefficient of B</label>
                <input id="eq-cb" type="number" min="0" step="1" value={cb} onChange={(e) => setCb(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="eq-cc" className="block text-sm font-medium mb-1 text-foreground">Coefficient of C</label>
                <input id="eq-cc" type="number" min="0" step="1" value={cc} onChange={(e) => setCc(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="eq-cd" className="block text-sm font-medium mb-1 text-foreground">Coefficient of D</label>
                <input id="eq-cd" type="number" min="0" step="1" value={cd} onChange={(e) => setCd(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Scale className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter non-negative concentrations and coefficients.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Equilibrium Constant Kc</div>
              <div className="text-4xl font-extrabold text-primary">{fmtSci(result.kc)}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.coeffs[0]}A + {result.coeffs[1]}B ⇌ {result.coeffs[2]}C + {result.coeffs[3]}D</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Numerator</div>
                <div className="text-lg font-bold text-primary">{fmtSci(result.numerator)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Denominator</div>
                <div className="text-lg font-bold text-primary">{fmtSci(result.denominator)}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Favored Side</div>
                <div className="text-lg font-bold text-primary">{result.kc > 1 ? "Products" : result.kc < 1 ? "Reactants" : "Balanced"}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
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
              <h3 className="text-base font-bold mb-3">Products vs Reactants Terms</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [fmtSci(v), ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={70} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold break-all">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Equilibrium Constant Calculator</h2>
            <p>The equilibrium constant is the ratio of product concentration terms to reactant concentration terms, each raised to its stoichiometric coefficient. For the default 2A + B ⇌ 2C + D with concentrations 0.5/0.3/0.8/0.6 M: Kc = 0.8² × 0.6 ÷ (0.5 × 0.3) = 2.56 — products mildly favored.</p>
            <h3>Kc vs Q</h3>
            <p>The same expression computed before equilibrium is the reaction quotient Q. Comparing Q to Kc predicts the shift: Q &lt; Kc drives forward, Q &gt; Kc drives reverse, Q = Kc means equilibrium. Because Kc depends only on temperature, it lets you predict direction from any mixture.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/equilibrium-constant-calculator" />
          <PopularCalculators exclude="/calculator/equilibrium-constant-calculator" />
        </div>
      </div>
    </>
  );
}
