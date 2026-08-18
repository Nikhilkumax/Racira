"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface MolarResult {
  mode: string;
  target: string;
  molarity: number;
  moles: number;
  volumeL: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 4): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcMolar(mode: string, a: number, b: number, c: number): MolarResult {
  if (mode === "dilution") {
    // M1V1 = M2V2; a=M1, b=V1, c=M2 -> V2
    const m2 = c, v2 = c > 0 ? (a * b) / c : 0;
    const breakdown = [
      { label: "Stock Concentration (M₁)", value: `${fmt(a)} M` },
      { label: "Stock Volume (V₁)", value: `${fmt(b)} L` },
      { label: "Final Concentration (M₂)", value: `${fmt(c)} M` },
      { label: "Required Final Volume (V₂)", value: `${fmt(v2)} L` },
      { label: "Water to Add (V₂ − V₁)", value: `${fmt(v2 - b)} L` },
    ];
    const summaryStats = [
      { label: "Final Volume (V₂)", value: `${fmt(v2)} L` },
      { label: "Water to Add", value: `${fmt(v2 - b)} L` },
      { label: "M₁·V₁", value: `${fmt(a * b)} mol` },
      { label: "M₂·V₂ (check)", value: `${fmt(c * v2)} mol` },
    ];
    const chartData = [
      { name: "Stock (M₁)", value: Number(a.toFixed(3)), fill: "hsl(var(--primary))" },
      { name: "Final (M₂)", value: Number(c.toFixed(3)), fill: "#f59e0b" },
    ];
    return { mode, target: "v2", molarity: c, moles: a * b, volumeL: v2, breakdown, summaryStats, chartData };
  }
  // target: molarity, moles, or volume
  let molarity = a, moles = b, volumeL = c;
  if (mode === "molarity") molarity = b / c;
  else if (mode === "moles") moles = a * c;
  else volumeL = b / a;
  const breakdown = [
    { label: "Mode", value: mode === "molarity" ? "Solve for Molarity" : mode === "moles" ? "Solve for Moles" : "Solve for Volume" },
    { label: "Moles of Solute", value: `${fmt(moles)} mol` },
    { label: "Volume of Solution", value: `${fmt(volumeL)} L` },
    { label: "Molarity (M)", value: `${fmt(molarity)} mol/L` },
  ];
  const summaryStats = [
    { label: "Molarity", value: `${fmt(molarity)} M` },
    { label: "Moles", value: `${fmt(moles)} mol` },
    { label: "Volume", value: `${fmt(volumeL)} L` },
    { label: "Definition", value: "mol ÷ L" },
  ];
  const chartData = [
    { name: "Moles", value: Number(moles.toFixed(3)), fill: "hsl(var(--primary))" },
    { name: "Volume (L)", value: Number(volumeL.toFixed(3)), fill: "#f59e0b" },
    { name: "Molarity", value: Number(molarity.toFixed(3)), fill: "#10b981" },
  ];
  return { mode, target: mode, molarity, moles, volumeL, breakdown, summaryStats, chartData };
}

const DEFAULTS = { mode: "molarity", a: "2", b: "0.5", c: "1" };

export default function MolarityCalculator() {
  const [mode, setMode] = useState<string>(DEFAULTS.mode);
  const [a, setA] = useState(DEFAULTS.a);
  const [b, setB] = useState(DEFAULTS.b);
  const [c, setC] = useState(DEFAULTS.c);
  const [result, setResult] = useState<MolarResult | null>(null);

  const va = parseFloat(a), vb = parseFloat(b), vc = parseFloat(c);
  const errs: string[] = [];
  if (isNaN(va) || va < 0) errs.push("First value must be 0 or greater.");
  if (isNaN(vb) || vb < 0) errs.push("Second value must be 0 or greater.");
  if (isNaN(vc) || vc < 0) errs.push("Third value must be 0 or greater.");
  if (mode === "molarity" && (!vb || vb <= 0)) errs.push("Volume must be greater than 0.");
  if (mode === "volume" && (!va || va <= 0)) errs.push("Molarity must be greater than 0.");
  if (mode === "dilution" && (vc === 0)) errs.push("Final concentration must be greater than 0.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcMolar(mode, va, vb, vc)); };
  const reset = () => {
    setMode(DEFAULTS.mode); setA(DEFAULTS.a); setB(DEFAULTS.b); setC(DEFAULTS.c);
    setResult(calcMolar("molarity", 2, 0.5, 1));
  };
  useEffect(() => { setResult(calcMolar("molarity", 2, 0.5, 1)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const labels: Record<string, [string, string, string]> = {
    molarity: ["Moles of Solute", "Volume (L)", "Unused"],
    moles: ["Molarity (M)", "Volume (L)", "Unused"],
    volume: ["Molarity (M)", "Moles of Solute", "Unused"],
    dilution: ["Stock Concentration M₁ (M)", "Stock Volume V₁ (L)", "Final Concentration M₂ (M)"],
  };

  const faqs = [
    { question: "What is molarity?", answer: "Molarity (M) is moles of solute per liter of solution — the most common concentration unit in chemistry. M = moles ÷ liters. It is temperature-sensitive because solution volume changes with temperature." },
    { question: "How do I make a solution of a given molarity?", answer: "Weigh out moles × molar mass grams of solute, dissolve in less than the final volume, then top up to the mark with solvent. For example, 0.5 mol NaCl (29.22 g) in a final volume of 1 L gives 0.5 M." },
    { question: "How does dilution work?", answer: "Dilution conserves moles: M₁V₁ = M₂V₂. Adding water to a stock solution lowers the concentration exactly in proportion — take 100 mL of 2 M stock and dilute to 200 mL and you get 1 M. This calculator solves that equation for V₂." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Molarity Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Molarity Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>What do you want to calculate?</label>
              <select value={mode} onChange={e => setMode(e.target.value)} className={inp}>
                <option value="molarity">Molarity from moles &amp; volume</option>
                <option value="moles">Moles from molarity &amp; volume</option>
                <option value="volume">Volume from molarity &amp; moles</option>
                <option value="dilution">Dilution (M₁V₁ = M₂V₂)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>{labels[mode][0]}</label>
                <input type="number" value={a} onChange={e => setA(e.target.value)} className={inp} placeholder={mode === "dilution" ? "2" : "0.5"} />
              </div>
              <div>
                <label className={lbl}>{labels[mode][1]}</label>
                <input type="number" value={b} onChange={e => setB(e.target.value)} className={inp} placeholder="1" />
              </div>
              {mode === "dilution" && (
                <div className="col-span-2">
                  <label className={lbl}>{labels[mode][2]}</label>
                  <input type="number" value={c} onChange={e => setC(e.target.value)} className={inp} placeholder="1" />
                </div>
              )}
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{result.mode === "dilution" ? "Final Volume (V₂)" : result.mode === "molarity" ? "Molarity" : result.mode === "moles" ? "Moles of Solute" : "Volume of Solution"}</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.mode === "dilution" ? result.volumeL : result.mode === "molarity" ? result.molarity : result.mode === "moles" ? result.moles : result.volumeL)} {result.mode === "dilution" ? "L" : result.mode === "molarity" ? "mol/L" : result.mode === "moles" ? "mol" : "L"}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.breakdown[0].value}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Molarity", `${fmt(result.molarity)} M`], ["Moles", `${fmt(result.moles)} mol`], ["Volume", `${fmt(result.volumeL)} L`]].map(([l, v], i) => (
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
                <h3 className="text-base font-bold mb-4">{result.mode === "dilution" ? "Concentration Before vs After" : "Moles, Volume, and Molarity"}</h3>
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
                <p className="text-center text-sm text-muted-foreground mt-1">{result.mode === "dilution" ? "M₁V₁ = M₂V₂ — moles conserved through dilution" : "Molarity = moles ÷ liters"}</p>
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
            <h2 className="text-2xl font-bold mb-3">Concentration, Quantified</h2>
            <p><strong>Molarity</strong> is the workhorse concentration unit: moles of solute per liter of solution. This <strong>molarity calculator</strong> solves the triangle — molarity, moles, volume — whichever piece is missing, and handles the dilution equation M₁V₁ = M₂V₂.</p>
            <h2 className="text-2xl font-bold mb-3">The Formula Triangle</h2>
            <p>M = mol ÷ L. Two known values give the third: weigh out moles × molar mass grams of solute, dissolve to the calibration mark, and you have a precise solution. The calculator's four modes cover every rearrangement plus dilutions.</p>
            <h2 className="text-2xl font-bold mb-3">Why Dilution Is Free</h2>
            <p>Diluting never changes how many moles are present, so M₁V₁ = M₂V₂ always holds. Stock solutions are sold concentrated precisely so labs can dilute — the calculator tells you the final volume and the water to add in one step.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/molarity-calculator" />
          <PopularCalculators exclude="/calculator/molarity-calculator" />
        </div>
      </div>
    </>
  );
}
