"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface GasResult {
  solve: string;
  p: number;
  v: number;
  n: number;
  t: number;
  r: number;
  solvedValue: number;
  solvedLabel: string;
  pv: number;
  nrt: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

const R = 0.08206; // L·atm / (mol·K)

function calcGas(p: number, v: number, n: number, t: number, solve: string): GasResult {
  let solvedValue = 0;
  if (solve === "p") solvedValue = v > 0 ? (n * R * t) / v : 0;
  else if (solve === "v") solvedValue = p > 0 ? (n * R * t) / p : 0;
  else if (solve === "n") solvedValue = t > 0 ? (p * v) / (R * t) : 0;
  else solvedValue = n > 0 ? (p * v) / (n * R) : 0;

  const solvedLabel = solve === "p" ? "Pressure" : solve === "v" ? "Volume" : solve === "n" ? "Moles" : "Temperature";
  const pv = p * v;
  const nrt = n * R * t;

  const fmt = (x: number, d = 4): string => parseFloat(x.toFixed(d)).toString();
  const breakdown = [
    { label: "Equation", value: "PV = nRT (Ideal Gas Law)" },
    { label: "Gas Constant R", value: `${R} L·atm/(mol·K)` },
    { label: "Pressure", value: `${fmt(p)} atm` },
    { label: "Volume", value: `${fmt(v)} L` },
    { label: "Moles", value: `${fmt(n)} mol` },
    { label: "Temperature", value: `${fmt(t)} K` },
    { label: `${solvedLabel} (solved)`, value: `${fmt(solvedValue)} ${solve === "p" ? "atm" : solve === "v" ? "L" : solve === "n" ? "mol" : "K"}` },
    { label: "Balance Check (PV = nRT)", value: `${fmt(pv)} = ${fmt(nrt)}` },
  ];
  const summaryStats = [
    { label: solvedLabel, value: `${fmt(solvedValue)} ${solve === "p" ? "atm" : solve === "v" ? "L" : solve === "n" ? "mol" : "K"}` },
    { label: "Pressure", value: `${fmt(p)} atm` },
    { label: "Volume", value: `${fmt(v)} L` },
    { label: "Moles", value: `${fmt(n)} mol` },
    { label: "Temperature", value: `${fmt(t)} K` },
    { label: "R", value: `${R}` },
    { label: "PV", value: fmt(pv) },
    { label: "nRT", value: fmt(nrt) },
  ];
  const chartData = [
    { name: "PV", value: Math.round(pv * 100) / 100, fill: "hsl(var(--primary))" },
    { name: "nRT", value: Math.round(nrt * 100) / 100, fill: "#10b981" },
  ];
  return { solve, p, v, n, t, r: R, solvedValue, solvedLabel, pv, nrt, breakdown, summaryStats, chartData };
}

const DEFAULTS = { p: "1", v: "24.5", n: "1", t: "298.15", solve: "t" };

export default function IdealGasLawCalculator() {
  const [p, setP] = useState(DEFAULTS.p);
  const [v, setV] = useState(DEFAULTS.v);
  const [n, setN] = useState(DEFAULTS.n);
  const [t, setT] = useState(DEFAULTS.t);
  const [solve, setSolve] = useState(DEFAULTS.solve);
  const [result, setResult] = useState<GasResult | null>(null);

  const pv = parseFloat(p) || 0;
  const vol = parseFloat(v) || 0;
  const mol = parseFloat(n) || 0;
  const tmp = parseFloat(t) || 0;
  const errs: string[] = [];
  if (pv <= 0) errs.push("Pressure must be greater than 0.");
  if (vol <= 0) errs.push("Volume must be greater than 0.");
  if (mol < 0) errs.push("Moles cannot be negative.");
  if (tmp <= 0) errs.push("Temperature must be above 0 K.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcGas(pv, vol, mol, tmp, solve)); };
  const reset = () => {
    setP(DEFAULTS.p); setV(DEFAULTS.v); setN(DEFAULTS.n); setT(DEFAULTS.t); setSolve(DEFAULTS.solve);
    setResult(calcGas(1, 24.5, 1, 298.15, "t"));
  };
  useEffect(() => { setResult(calcGas(1, 24.5, 1, 298.15, "t")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the ideal gas law?", answer: "PV = nRT relates pressure, volume, moles, and absolute temperature of an ideal gas. R = 0.08206 L·atm/(mol·K) when pressure is in atmospheres and volume in liters." },
    { question: "When is it accurate?", answer: "At low pressure and high temperature, real gases approach ideal behavior — the law is within a few percent for most engineering conditions and exact for exams." },
    { question: "Why must temperature be in Kelvin?", answer: "The equation is proportional to absolute temperature. Celsius values are offset by 273.15, which breaks the proportionality — always convert to Kelvin first." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Ideal Gas Law Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Ideal Gas Law Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Pressure</label>
                <div className={inp}><input type="number" step="0.01" value={p} onChange={e => setP(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">atm</span></div>
              </div>
              <div>
                <label className={lbl}>Volume</label>
                <div className={inp}><input type="number" step="0.1" value={v} onChange={e => setV(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">L</span></div>
              </div>
              <div>
                <label className={lbl}>Moles</label>
                <div className={inp}><input type="number" step="0.1" value={n} onChange={e => setN(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">mol</span></div>
              </div>
              <div>
                <label className={lbl}>Temperature</label>
                <div className={inp}><input type="number" step="0.01" value={t} onChange={e => setT(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">K</span></div>
              </div>
              <div>
                <label className={lbl}>Solve For</label>
                <select value={solve} onChange={e => setSolve(e.target.value)} className={sel}>
                  <option value="p">Pressure (P)</option>
                  <option value="v">Volume (V)</option>
                  <option value="n">Moles (n)</option>
                  <option value="t">Temperature (T)</option>
                </select>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{result.solvedLabel} (Solved)</div>
                <div className="text-4xl font-extrabold tracking-tight">{parseFloat(result.solvedValue.toFixed(4))}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.solve === "p" ? "atm" : result.solve === "v" ? "L" : result.solve === "n" ? "mol" : "K"} · solved from PV = nRT</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Pressure`, `${result.p} atm`], ["Volume", `${result.v} L`], ["Moles", `${result.n} mol`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Gas State Details</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 6 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 6 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 6 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Balance Check</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [`${v}`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">PV and nRT — equal when the state satisfies the law</p>
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
            <h2 className="text-2xl font-bold mb-3">The Ideal Gas Law</h2>
            <p>This <strong>ideal gas law calculator</strong> solves PV = nRT for any one of pressure, volume, moles, or temperature using R = 0.08206 L·atm/(mol·K). Enter three quantities, pick the unknown, and the fourth is computed by rearrangement.</p>
            <h2 className="text-2xl font-bold mb-3">Unit Discipline</h2>
            <p>The constant fixes the unit system: atmospheres, liters, moles, and kelvin. Temperature must be absolute — room temperature is 298.15 K, not 25 — otherwise every result is off by a factor tied to the 273-degree offset.</p>
            <h2 className="text-2xl font-bold mb-3">When Real Gases Deviate</h2>
            <p>At high pressure or near the boiling point, intermolecular forces and molecular volume become significant and real gases depart from ideal behavior. Van der Waals corrections restore accuracy where this simple model fails.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ideal-gas-law-calculator" />
          <PopularCalculators exclude="/calculator/ideal-gas-law-calculator" />
        </div>
      </div>
    </>
  );
}
