"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface InductanceResult {
  turns: number;
  areaCm2: number;
  lengthCm: number;
  muR: number;
  current: number;
  resistance: number;
  inductanceH: number;
  inductanceUh: number;
  timeConstantUs: number;
  energyMj: number;
  fluxDensity: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

const MU0 = 4 * Math.PI * 1e-7;

function calcInductance(turns: number, areaCm2: number, lengthCm: number, muR: number, current: number, resistance: number): InductanceResult {
  const areaM2 = areaCm2 * 1e-4;
  const lengthM = lengthCm * 1e-2;
  const inductanceH = (MU0 * muR * turns * turns * areaM2) / lengthM;
  const inductanceUh = inductanceH * 1e6;
  const timeConstantUs = resistance > 0 ? (inductanceH / resistance) * 1e6 : 0;
  const energyMj = 0.5 * inductanceH * current * current * 1e3;
  const fluxDensity = areaM2 > 0 ? (MU0 * muR * turns * current) / lengthM : 0;

  const fmtL = (h: number): string => {
    if (h >= 1) return `${h.toFixed(4)} H`;
    if (h >= 1e-3) return `${(h * 1e3).toFixed(2)} mH`;
    if (h >= 1e-6) return `${(h * 1e6).toFixed(2)} µH`;
    return `${(h * 1e9).toFixed(2)} nH`;
  };

  const breakdown = [
    { label: "Number of Turns (N)", value: `${turns}` },
    { label: "Cross-Sectional Area", value: `${areaCm2} cm² (${(areaM2 * 1e4).toFixed(4)} m²)` },
    { label: "Coil Length", value: `${lengthCm} cm` },
    { label: "Relative Permeability", value: `${muR} (${muR === 1 ? "air" : "core material"})` },
    { label: "Inductance", value: fmtL(inductanceH) },
    { label: "Current", value: `${current} A` },
    { label: "Energy Stored (½LI²)", value: `${energyMj.toFixed(3)} mJ` },
    { label: "Time Constant (L/R)", value: `${timeConstantUs.toFixed(2)} µs` },
    { label: "Magnetic Flux Density (B)", value: `${(fluxDensity * 1e3).toFixed(2)} mT` },
  ];
  const summaryStats = [
    { label: "Inductance", value: fmtL(inductanceH) },
    { label: "Energy", value: `${energyMj.toFixed(3)} mJ` },
    { label: "Time Constant", value: `${timeConstantUs.toFixed(2)} µs` },
    { label: "Flux Density", value: `${(fluxDensity * 1e3).toFixed(2)} mT` },
    { label: "Turns", value: `${turns}` },
    { label: "Area", value: `${areaCm2} cm²` },
    { label: "Length", value: `${lengthCm} cm` },
    { label: "µr", value: `${muR}` },
  ];
  const chartData = [
    { name: "Inductance", value: Math.round(inductanceUh * 100) / 100, fill: "hsl(var(--primary))" },
    { name: "Energy", value: Math.round(energyMj * 100) / 100, fill: "#f59e0b" },
  ];
  return { turns, areaCm2, lengthCm, muR, current, resistance, inductanceH, inductanceUh, timeConstantUs, energyMj, fluxDensity, breakdown, summaryStats, chartData };
}

const DEFAULTS = { turns: "200", area: "5", length: "10", muR: "1", current: "2", resistance: "10" };

export default function InductanceCalculator() {
  const [turns, setTurns] = useState(DEFAULTS.turns);
  const [area, setArea] = useState(DEFAULTS.area);
  const [length, setLength] = useState(DEFAULTS.length);
  const [muR, setMuR] = useState(DEFAULTS.muR);
  const [current, setCurrent] = useState(DEFAULTS.current);
  const [resistance, setResistance] = useState(DEFAULTS.resistance);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<InductanceResult | null>(null);

  const n = parseInt(turns) || 0;
  const a = parseFloat(area) || 0;
  const l = parseFloat(length) || 0;
  const mu = parseFloat(muR) || 0;
  const i = parseFloat(current) || 0;
  const r = parseFloat(resistance) || 0;
  const errs: string[] = [];
  if (n < 1 || n > 1000000) errs.push("Turns must be 1–1,000,000.");
  if (a <= 0) errs.push("Cross-sectional area must be greater than 0.");
  if (l <= 0) errs.push("Coil length must be greater than 0.");
  if (mu < 1 || mu > 100000) errs.push("Relative permeability must be 1–100,000.");
  if (i < 0) errs.push("Current cannot be negative.");
  if (r < 0) errs.push("Resistance cannot be negative.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcInductance(n, a, l, mu, i, r)); };
  const reset = () => {
    setTurns(DEFAULTS.turns); setArea(DEFAULTS.area); setLength(DEFAULTS.length); setMuR(DEFAULTS.muR); setCurrent(DEFAULTS.current); setResistance(DEFAULTS.resistance);
    setResult(calcInductance(200, 5, 10, 1, 2, 10));
  };
  useEffect(() => { setResult(calcInductance(200, 5, 10, 1, 2, 10)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What determines inductance?", answer: "Inductance grows with the square of the turns, linearly with cross-sectional area and core permeability, and shrinks as the coil gets longer: L = μ₀μᵣN²A/l." },
    { question: "Why does an iron core matter?", answer: "Iron's relative permeability is 200–2,000 times air's, multiplying inductance dramatically. That is why transformers and chokes use laminated iron cores." },
    { question: "What is the time constant?", answer: "In an LR circuit, current reaches 63% of its final value in τ = L/R seconds. It governs switching speed, ripple filtering, and how fast an inductor stores or releases energy." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Inductance Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Inductance Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Number of Turns</label>
                <div className={inp}><input type="number" value={turns} onChange={e => setTurns(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Cross-Sectional Area</label>
                <div className={inp}><input type="number" value={area} onChange={e => setArea(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">cm²</span></div>
              </div>
              <div>
                <label className={lbl}>Coil Length</label>
                <div className={inp}><input type="number" value={length} onChange={e => setLength(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">cm</span></div>
              </div>
              <div>
                <label className={lbl}>Relative Permeability</label>
                <div className={inp}><input type="number" value={muR} onChange={e => setMuR(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">µr</span></div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdv(o => !o)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 self-start"
            >
              Advanced Options
              <span className={`transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Circuit Parameters</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Current</label>
                      <div className={inp}><input type="number" value={current} onChange={e => setCurrent(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">A</span></div>
                    </div>
                    <div>
                      <label className={lbl}>Series Resistance</label>
                      <div className={inp}><input type="number" value={resistance} onChange={e => setResistance(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">Ω</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Inductance</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.inductanceUh.toFixed(2)} µH</div>
                <div className="text-sm text-muted-foreground mt-1">{result.turns} turns · {result.areaCm2} cm² · {result.lengthCm} cm · µr = {result.muR}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Energy Stored`, `${result.energyMj.toFixed(3)} mJ`], ["Time Constant", `${result.timeConstantUs.toFixed(2)} µs`], ["Flux Density", `${(result.fluxDensity * 1e3).toFixed(2)} mT`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Solenoid Details</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 4 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 4 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Inductance and Energy</h3>
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
                <p className="text-center text-sm text-muted-foreground mt-1">Inductance (µH) and stored energy (mJ)</p>
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
            <h2 className="text-2xl font-bold mb-3">The Solenoid Formula</h2>
            <p>This <strong>inductance calculator</strong> applies L = μ₀μᵣN²A/l for a long solenoid, where μ₀ = 4π×10⁻⁷ H/m, N is the turns, A the cross-section, and l the length. Inductance scales with the square of the turns — doubling the windings quadruples the inductance.</p>
            <h2 className="text-2xl font-bold mb-3">Energy and Dynamics</h2>
            <p>An inductor stores ½LI² joules of magnetic energy, and an LR circuit charges with time constant τ = L/R. Both matter for switch-mode supplies, where the stored energy must be moved and the time constant sets the ripple and response.</p>
            <h2 className="text-2xl font-bold mb-3">Core Choices</h2>
            <p>Air cores are linear and lossless at high frequency; ferrite and iron cores multiply inductance by μr but saturate and heat at high currents or frequencies. Pick the core for the operating point, not just the room-temperature number.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/inductance-calculator" />
          <PopularCalculators exclude="/calculator/inductance-calculator" />
        </div>
      </div>
    </>
  );
}
