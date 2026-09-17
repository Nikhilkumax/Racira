"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface BoyleResult {
  p1: number;
  v1: number;
  p2: number;
  v2: number;
  constant: number;
  chartData: { v: number; p: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcBoyle(p1: number, v1: number, p2: number, solveFor: "p2" | "v2"): BoyleResult {
  let p2v = p2;
  let v2v = 0;
  let solved: "p2" | "v2" = "v2";

  const k = p1 * v1;
  if (solveFor === "v2") {
    v2v = p2 > 0 ? k / p2 : 0;
    solved = "v2";
  } else {
    p2v = v1 > 0 ? k / v1 : 0;
    v2v = v1;
    solved = "p2";
  }

  const chartData: { v: number; p: number }[] = [];
  const vRange = [v1 * 0.4, v1 * 0.6, v1 * 0.8, v1 * 1.0, v1 * 1.4, v1 * 1.8, v1 * 2.2];
  vRange.forEach(v => { if (v > 0) chartData.push({ v: +v.toFixed(3), p: +(k / v).toFixed(3) }); });

  return {
    p1,
    v1,
    p2: solveFor === "p2" ? p2v : p2,
    v2: solveFor === "v2" ? v2v : v1,
    constant: k,
    chartData,
    breakdown: [
      { label: "Initial Pressure (P₁)", value: `${p1} atm` },
      { label: "Initial Volume (V₁)", value: `${v1} L` },
      { label: "Boyle's Constant (P₁V₁)", value: `${k.toFixed(3)} atm·L` },
      { label: "Final Pressure (P₂)", value: `${(solveFor === "p2" ? p2v : p2).toFixed(3)} atm` },
      { label: "Final Volume (V₂)", value: `${(solveFor === "v2" ? v2v : v1).toFixed(3)} L` },
      { label: "Solved For", value: solved === "v2" ? "V₂ (final volume)" : "P₂ (final pressure)" },
    ],
    summaryStats: [
      { label: "P₁V₁ Constant", value: `${k.toFixed(3)} atm·L` },
      { label: "Final Pressure", value: `${(solveFor === "p2" ? p2v : p2).toFixed(3)} atm` },
      { label: "Final Volume", value: `${(solveFor === "v2" ? v2v : v1).toFixed(3)} L` },
      { label: "Pressure Change", value: solveFor === "v2" ? `${p2 === 0 ? "—" : ((p2 - p1) / p1 * 100).toFixed(0) + "%"}` : `${p1 === 0 ? "—" : ((p2v - p1) / p1 * 100).toFixed(0) + "%"}` },
      { label: "Volume Change", value: solveFor === "v2" ? `${v1 === 0 ? "—" : ((v2v - v1) / v1 * 100).toFixed(0) + "%"}` : "0% (given)" },
      { label: "Temperature", value: "Constant (isothermal)" },
    ],
  };
}

const DEFAULTS = { p1: "2.0", v1: "3.0", p2: "1.5", solveFor: "v2" as "p2" | "v2" };

export default function BoylesLawCalculator() {
  const [p1, setP1] = useState(DEFAULTS.p1);
  const [v1, setV1] = useState(DEFAULTS.v1);
  const [p2, setP2] = useState(DEFAULTS.p2);
  const [solveFor, setSolveFor] = useState<"p2" | "v2">(DEFAULTS.solveFor);
  const [result, setResult] = useState<BoyleResult>(() => calcBoyle(2.0, 3.0, 1.5, "v2"));

  const calculate = () => setResult(calcBoyle(parseFloat(p1) || 0, parseFloat(v1) || 0, parseFloat(p2) || 0, solveFor));
  const reset = () => { setP1(DEFAULTS.p1); setV1(DEFAULTS.v1); setP2(DEFAULTS.p2); setSolveFor(DEFAULTS.solveFor); setResult(calcBoyle(2.0, 3.0, 1.5, "v2")); };
  useEffect(() => { setResult(calcBoyle(2.0, 3.0, 1.5, "v2")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is Boyle's Law?", answer: "Boyle's Law states that for a fixed amount of gas at constant temperature, pressure and volume are inversely proportional: P₁V₁ = P₂V₂. If you compress a gas to half its volume, its pressure doubles." },
    { question: "What units should I use?", answer: "Any consistent pressure and volume units work as long as they match on both sides — for example atmospheres and liters, or pascals and cubic meters. The calculator uses atm and liters." },
    { question: "When does Boyle's Law apply?", answer: "It applies to ideal gases under constant temperature (isothermal conditions). Real gases deviate at very high pressures or near condensation, where intermolecular forces become significant." },
    { question: "How is this used in real life?", answer: "Scuba diving (pressure increases with depth), syringes and pumps, breathing (lungs expand and contract), and aerosol cans all demonstrate Boyle's Law. It is also the basis of compression in engines." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Boyle's Law Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Boyle's Law Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Solve For</label>
              <div className="grid grid-cols-2 gap-2 rounded-md border border-input p-1 bg-background">
                <button onClick={() => setSolveFor("v2")} className={`h-9 rounded-md text-sm font-semibold transition-colors ${solveFor === "v2" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Final Volume (V₂)</button>
                <button onClick={() => setSolveFor("p2")} className={`h-9 rounded-md text-sm font-semibold transition-colors ${solveFor === "p2" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Final Pressure (P₂)</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Initial Pressure (P₁)</label>
                <div className={inp}><input type="number" value={p1} onChange={e => setP1(e.target.value)} className={ci} min={0} step={0.1} /><span className="pr-3 text-muted-foreground text-sm">atm</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Initial Volume (V₁)</label>
                <div className={inp}><input type="number" value={v1} onChange={e => setV1(e.target.value)} className={ci} min={0} step={0.1} /><span className="pr-3 text-muted-foreground text-sm">L</span></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{solveFor === "v2" ? "Final Pressure (P₂)" : "Final Volume (V₂)"}</label>
              <div className={inp}><input type="number" value={p2} onChange={e => setP2(e.target.value)} className={ci} min={0} step={0.1} /><span className="pr-3 text-muted-foreground text-sm">{solveFor === "v2" ? "atm" : "L"}</span></div>
            </div>
            <div className="flex gap-3">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{solveFor === "v2" ? "Final Volume (V₂)" : "Final Pressure (P₂)"}</div>
              <div className="text-4xl font-extrabold text-primary">{(solveFor === "v2" ? result.v2 : result.p2).toFixed(3)} <span className="text-2xl">{solveFor === "v2" ? "L" : "atm"}</span></div>
              <div className="text-sm text-muted-foreground mt-1">From P₁ = {result.p1} atm, V₁ = {result.v1} L · Constant = {result.constant.toFixed(3)} atm·L</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["P₁V₁ Constant", `${result.constant.toFixed(3)}`], ["Final P", `${(solveFor === "v2" ? result.p2 : result.p2).toFixed(3)} atm`], ["Final V", `${(solveFor === "v2" ? result.v2 : result.v1).toFixed(3)} L`]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Gas State Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 text-right font-semibold">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Pressure–Volume Relationship</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="v" tick={{ fontSize: 11 }} label={{ value: "Volume (L)", position: "insideBottom", offset: -2, fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: "Pressure (atm)", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v} atm`, "Pressure"]} labelFormatter={(label) => `V = ${label} L`} />
                  <Area type="monotone" dataKey="p" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} />
                </AreaChart>
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
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Boyle's Law?</h2>
            <p>Boyle's Law, discovered by Robert Boyle in 1662, states that the pressure and volume of a fixed amount of gas are inversely proportional when temperature is held constant: P₁V₁ = P₂V₂. Squeeze a gas into half the space and its pressure doubles; let it expand into twice the space and the pressure halves.</p>
            <h2 className="text-2xl font-bold mb-3">The Mathematics</h2>
            <p>The product of pressure and volume is a constant for a given amount of gas at a fixed temperature. Given any three of P₁, V₁, P₂, V₂, the fourth is found by rearrangement: V₂ = P₁V₁ ÷ P₂ or P₂ = P₁V₁ ÷ V₂. This calculator lets you solve for either the final pressure or final volume.</p>
            <h2 className="text-2xl font-bold mb-3">Real-World Applications</h2>
            <p>Scuba divers experience Boyle's Law directly — pressure rises by roughly 1 atm per 10 meters of depth, compressing the air in their lungs and tanks. Syringes, bicycle pumps, and the intake stroke of engines all rely on the same principle. The chart above shows the characteristic hyperbolic curve of the pressure–volume relationship.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/boyles-law-calculator" />
          <PopularCalculators exclude="/calculator/boyles-law-calculator" />
        </div>
      </div>
    </>
  );
}
