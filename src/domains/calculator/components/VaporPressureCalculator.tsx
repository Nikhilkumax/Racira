"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const R_GAS = 8.314; // J/(mol·K)

interface VpResult {
  p2: number; // kPa
  p2Str: string;
  chartData: { temp: number; pressure: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmtPressure(kpa: number): string {
  if (kpa >= 1000) return `${(kpa / 1000).toFixed(2)} MPa`;
  if (kpa >= 1) return `${kpa.toFixed(2)} kPa`;
  return `${(kpa * 1000).toFixed(2)} Pa`;
}

function calcVaporPressure(dhVap: number, t1: number, p1: number, t2: number): VpResult {
  const dh = dhVap * 1000; // kJ/mol -> J/mol
  const p2 = p1 * Math.exp((-dh / R_GAS) * (1 / t2 - 1 / t1));

  // Curve from T1-20K to T2+20K
  const start = Math.max(200, t1 - 30);
  const end = Math.min(600, t2 + 30);
  const chartData: { temp: number; pressure: number }[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const t = start + ((end - start) * i) / steps;
    chartData.push({ temp: t, pressure: p1 * Math.exp((-dh / R_GAS) * (1 / t - 1 / t1)) });
  }

  const breakdown = [
    { label: "Enthalpy of Vaporization (ΔHvap)", value: `${dhVap.toFixed(2)} kJ/mol` },
    { label: "Known Temperature (T1)", value: `${t1.toFixed(1)} K` },
    { label: "Known Vapor Pressure (P1)", value: fmtPressure(p1) },
    { label: "Target Temperature (T2)", value: `${t2.toFixed(1)} K` },
    { label: "Δ(1/T) = 1/T2 − 1/T1", value: `${(1 / t2 - 1 / t1).toExponential(4)} K⁻¹` },
    { label: "Vapor Pressure at T2 (P2)", value: fmtPressure(p2) },
    { label: "Temperature in °C (T2)", value: `${(t2 - 273.15).toFixed(1)} °C` },
  ];

  const summaryStats = [
    { label: "Vapor Pressure (P2)", value: fmtPressure(p2) },
    { label: "At Temperature", value: `${t2.toFixed(1)} K (${(t2 - 273.15).toFixed(1)} °C)` },
    { label: "Reference Pressure (P1)", value: fmtPressure(p1) },
    { label: "ΔHvap", value: `${dhVap.toFixed(2)} kJ/mol` },
    { label: "Formula", value: "Clausius–Clapeyron" },
    { label: "Boiling Condition", value: p2 >= 101.325 ? "P2 ≥ 1 atm — boils at T2" : "P2 < 1 atm — no boiling" },
  ];

  return { p2, p2Str: fmtPressure(p2), chartData, breakdown, summaryStats };
}

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function VaporPressureCalculator() {
  const [dhVap, setDhVap] = useState("40.7");
  const [t1, setT1] = useState("298");
  const [p1, setP1] = useState("3.17");
  const [t2, setT2] = useState("373");
  const [result, setResult] = useState<VpResult | null>(null);

  const parse = (s: string, fallback: number, min = 0) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= min ? n : fallback;
  };

  const calculate = () =>
    setResult(
      calcVaporPressure(
        parse(dhVap, 40.7),
        Math.max(200, parse(t1, 298, 200)),
        Math.max(1e-9, parse(p1, 3.17, 1e-9)),
        Math.max(200, parse(t2, 373, 200))
      )
    );
  const reset = () => {
    setDhVap("40.7");
    setT1("298");
    setP1("3.17");
    setT2("373");
    setResult(calcVaporPressure(40.7, 298, 3.17, 373));
  };
  useEffect(() => {
    setResult(calcVaporPressure(40.7, 298, 3.17, 373));
  }, []);

  const faqs = [
    { question: "What is vapor pressure?", answer: "Vapor pressure is the pressure exerted by a vapor in equilibrium with its liquid at a given temperature. It rises steeply with temperature because more molecules have enough energy to escape the liquid." },
    { question: "What is the Clausius-Clapeyron equation?", answer: "It relates how vapor pressure changes with temperature: ln(P2/P1) = −(ΔHvap/R)·(1/T2 − 1/T1). Given one known (T, P) point and the enthalpy of vaporization, it predicts the pressure at every other temperature." },
    { question: "Why does water boil at 100 °C at sea level?", answer: "Boiling occurs when vapor pressure equals the external pressure (101.3 kPa at sea level). The calculator's defaults use water's known 3.17 kPa at 298 K; applying constant ΔHvap = 40.7 kJ/mol reaches 101.3 kPa at about 377 K. The textbook 373.15 K is recovered when the calculation accounts for ΔHvap's slow decline with temperature — the constant-ΔH two-point equation is an approximation, accurate to a few percent over small temperature ranges." },
    { question: "Why does water boil faster at high altitude?", answer: "At high altitude the air pressure is lower, so water's vapor pressure reaches it at a lower temperature — roughly 90 °C at 3,000 m. The Clausius-Clapeyron equation predicts exactly this shift." },
    { question: "What are typical ΔHvap values?", answer: "Water 40.7 kJ/mol (strong hydrogen bonds), ethanol 38.6, acetone 31.3, methane 8.2. Higher ΔHvap means a steeper pressure curve and a higher boiling point — the signature of strong intermolecular forces." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Vapor Pressure Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Vapor Pressure Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">ΔHvap (kJ/mol)</label>
                <div className={inp}><input type="number" value={dhVap} onChange={(e) => setDhVap(e.target.value)} className={ci} min={0} step={0.1} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Known Temp T1 (K)</label>
                <div className={inp}><input type="number" value={t1} onChange={(e) => setT1(e.target.value)} className={ci} min={200} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Known Pressure P1 (kPa)</label>
                <div className={inp}><input type="number" value={p1} onChange={(e) => setP1(e.target.value)} className={ci} min={0} step={0.01} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Target Temp T2 (K)</label>
                <div className={inp}><input type="number" value={t2} onChange={(e) => setT2(e.target.value)} className={ci} min={200} /></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Water: ΔHvap 40.7 kJ/mol, 3.17 kPa at 298 K (25 °C).</p>

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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Vapor Pressure at T2 (P2)</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.p2Str}</div>
                  <div className="text-sm text-muted-foreground mt-1">At {t2} K ({result.breakdown[6].value}) · boiling {result.p2 >= 101.325 ? "reached" : "not yet reached"}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["P2", result.p2Str], ["P1", fmtPressure(parseFloat(p1) || 3.17)], ["ΔHvap", `${dhVap} kJ/mol`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Vapor Pressure Curve</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={result.chartData} margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="temp" tick={{ fontSize: 10 }} label={{ value: "Temperature (K)", position: "insideBottom", offset: -2, fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} label={{ value: "Pressure (kPa)", angle: -90, position: "insideLeft", fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [fmtPressure(v), "Vapor pressure"]} labelFormatter={(l) => `${l} K`} />
                      <Line type="monotone" dataKey="pressure" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">The exponential Clausius–Clapeyron curve: pressure climbs steeply as temperature rises.</p>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
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
            <h2 className="text-2xl font-bold mb-3">Vapor Pressure and the Clausius-Clapeyron Equation</h2>
            <p>Every liquid exerts a vapor pressure set by the balance between molecules escaping into the gas phase and returning. The Clausius-Clapeyron equation <strong>ln(P2/P1) = −(ΔHvap/R)(1/T2 − 1/T1)</strong> predicts exactly how that pressure grows with temperature — a small change in temperature can multiply the pressure many times over.</p>
            <h2 className="text-2xl font-bold mb-3">The Boiling Connection</h2>
            <p>Boiling is simply the moment a liquid's vapor pressure reaches the external pressure — 101.3 kPa at sea level, less at altitude. With water's defaults the two-point equation gives about 86 kPa at 373 K; the textbook boiling point of 373.15 K is recovered when ΔHvap is allowed to vary with temperature. Over small ranges — a few tens of kelvins — the constant-ΔH approximation is accurate to a few percent, which is why it remains the workhorse of vapor-pressure engineering.</p>
            <h2 className="text-2xl font-bold mb-3">What ΔHvap Tells Us</h2>
            <p>The enthalpy of vaporization measures how strongly molecules hold onto each other. Water's 40.7 kJ/mol reflects its hydrogen bonding; methane's 8.2 kJ/mol barely holds its molecules together. Higher ΔHvap means a steeper curve — and a liquid that resists boiling until much higher temperatures.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/vapor-pressure-calculator" />
          <PopularCalculators exclude="/calculator/vapor-pressure-calculator" />
        </div>
      </div>
    </>
  );
}
